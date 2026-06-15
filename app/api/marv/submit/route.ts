import { getCurrentUser } from "@/lib/auth";
import { serviceForPath } from "@/lib/credits";
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

  // 1) 선차감(원자적 예약) — 동시 요청 초과 사용 차단
  const reserve = await reserveCredits(user.id, service);
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
  let json: { job_id?: string } | null = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  const jobId = json?.job_id ?? null;
  const success = upstream.ok && (jobId !== null || service === "llm");

  const headers = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "application/json",
  });

  if (success) {
    await settleReservation(reserve.logId, jobId, jobId !== null); // 잡 기반이면 정산 대기
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
