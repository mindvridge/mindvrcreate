import { getCurrentUser } from "@/lib/auth";
import { serviceForPath } from "@/lib/credits";
import { recordCreation } from "@/lib/creations";
import { reserveCredits, settleReservation, voidReservation } from "@/lib/ledger";
import {
  ALLOWED_SUBMIT_PATHS,
  MAX_TOTAL_UPLOAD_BYTES,
  MAX_UPLOAD_BYTES,
  marvFetch,
} from "@/lib/marv";

// 마브 생성 endpoint 프록시 — 로그인 → 선차감(예약) → 마브 호출 → 성공 정산 / 실패 환불.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ detail: "로그인이 필요합니다." }, { status: 401 });

  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!ALLOWED_SUBMIT_PATHS.has(path)) {
    return Response.json({ detail: "허용되지 않은 경로입니다." }, { status: 400 });
  }
  const service = serviceForPath(path);
  if (!service) return Response.json({ detail: "지원하지 않는 서비스입니다." }, { status: 400 });

  // 업로드 크기 제한
  const form = await request.formData();
  let total = 0;
  for (const v of form.values()) {
    if (v instanceof File) {
      if (v.size > MAX_UPLOAD_BYTES) {
        return Response.json({ detail: "파일이 너무 큽니다 (최대 15MB)." }, { status: 413 });
      }
      total += v.size;
    }
  }
  if (total > MAX_TOTAL_UPLOAD_BYTES) {
    return Response.json({ detail: "업로드 용량이 너무 큽니다 (합계 최대 30MB)." }, { status: 413 });
  }

  // 4개 모델 동시 비교(compare_models)는 이미지 4장이 생성되므로 4배 차감한다.
  let quantity = 1;
  if (service === "image") {
    try {
      const pj = form.get("params_json");
      if (typeof pj === "string" && pj && JSON.parse(pj)?.compare_models) quantity = 4;
    } catch {
      /* params_json 파싱 실패는 단일 생성으로 처리 */
    }
  }

  // 1) 선차감(원자적 예약) — 동시 요청 초과 사용 차단
  const reserve = await reserveCredits(user.id, service, quantity);
  if (!reserve.ok) {
    return Response.json(
      { detail: "크레딧이 부족합니다.", balance: reserve.balance, required: reserve.required },
      { status: 402 }
    );
  }

  // 2) 마브 호출
  let upstream: Response;
  let text: string;
  try {
    upstream = await marvFetch(path, { method: "POST", body: form }, 60_000);
    text = await upstream.text();
  } catch {
    const balance = await voidReservation(reserve.logId);
    const headers = new Headers({ "content-type": "application/json" });
    if (balance !== null) headers.set("X-MV-Balance", String(balance));
    return new Response(
      JSON.stringify({ detail: "생성 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." }),
      { status: 503, headers }
    );
  }

  // 3) 결과 판정 → 정산 또는 환불
  let json: { job_id?: string; jobs?: { job_id?: string }[] } | null = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  const jobId = json?.job_id ?? null;
  // compare_models: 여러 잡이 한 번에 큐잉된다. 개별 잡 추적이 어려우므로 즉시 정산한다.
  const compareJobs = Array.isArray(json?.jobs) ? json!.jobs!.filter((j) => j?.job_id) : [];
  const success = upstream.ok && (jobId !== null || compareJobs.length > 0 || service === "llm");

  const headers = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "application/json",
  });

  if (success) {
    if (compareJobs.length > 0) {
      await settleReservation(reserve.logId, null, false); // 비교 모드는 즉시 정산
    } else {
      await settleReservation(reserve.logId, jobId, jobId !== null); // 잡 기반이면 정산 대기
    }
    // 내 갤러리용 생성물 기록 (파일을 만드는 서비스만)
    const promptKo = form.get("prompt_ko");
    const prompt = typeof promptKo === "string" ? promptKo : null;
    try {
      const ids = compareJobs.length > 0 ? compareJobs.map((j) => j.job_id as string) : jobId ? [jobId] : [];
      for (const id of ids) await recordCreation(user.id, id, service, prompt);
    } catch {
      /* 기록 실패는 생성 흐름을 막지 않는다 */
    }
    headers.set("X-MV-Charged", String(reserve.charged));
    headers.set("X-MV-Balance", String(reserve.balance));
    headers.set("X-MV-Unlimited", reserve.unlimited ? "1" : "0");
    return new Response(text, { status: upstream.status, headers });
  }

  // 실패 → 차감 복구
  const balance = await voidReservation(reserve.logId);
  if (balance !== null) headers.set("X-MV-Balance", String(balance));
  return new Response(text, { status: upstream.status || 502, headers });
}
