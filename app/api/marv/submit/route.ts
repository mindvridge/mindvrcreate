import { getCurrentUser } from "@/lib/auth";
import { CREDIT_COSTS, serviceForPath } from "@/lib/credits";
import { chargeCredits } from "@/lib/ledger";
import { ALLOWED_SUBMIT_PATHS, MARV_BASE, marvHeaders } from "@/lib/marv";

// 마브 생성 endpoint 프록시 — 로그인·크레딧 차감 후 위임.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ detail: "로그인이 필요합니다." }, { status: 401 });
  }

  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!ALLOWED_SUBMIT_PATHS.has(path)) {
    return Response.json({ detail: "허용되지 않은 경로입니다." }, { status: 400 });
  }
  const service = serviceForPath(path);
  if (!service) {
    return Response.json({ detail: "지원하지 않는 서비스입니다." }, { status: 400 });
  }

  const cost = CREDIT_COSTS[service];
  // 사전 잔액 확인 (무제한 사용자는 통과)
  if (!user.unlimited && user.credits < cost) {
    return Response.json(
      { detail: "크레딧이 부족합니다.", balance: user.credits, required: cost },
      { status: 402 }
    );
  }

  const form = await request.formData();
  const upstream = await fetch(`${MARV_BASE}${path}`, {
    method: "POST",
    headers: marvHeaders(),
    body: form,
  });
  const text = await upstream.text();

  // 잡 생성 성공 시에만 과금 (실패 응답은 무과금)
  let charged: { amount: number; balance: number; unlimited: boolean } | null = null;
  if (upstream.ok) {
    let json: { job_id?: string } | null = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    // 잡 기반(tts/image/video/avatar)은 job_id, llm(chat)은 즉시 응답 → 둘 다 과금
    const jobId = json?.job_id ?? null;
    if (jobId || service === "llm") {
      const r = chargeCredits(user.id, service, jobId);
      if (r.ok) charged = { amount: r.charged, balance: r.balance, unlimited: r.unlimited };
    }
  }

  const headers = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "application/json",
  });
  if (charged) {
    headers.set("X-MV-Charged", String(charged.amount));
    headers.set("X-MV-Balance", String(charged.balance));
    headers.set("X-MV-Unlimited", charged.unlimited ? "1" : "0");
  }
  return new Response(text, { status: upstream.status, headers });
}
