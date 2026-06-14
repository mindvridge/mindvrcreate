import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { redeemCoupon } from "@/lib/coupons";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  // 코드 추측(무차별) 방지 — 사용자당 20회/시간
  const rl = rateLimit(`coupon:${user.id}`, 20, 3600_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } }
    );
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const r = redeemCoupon(user.id, body.code ?? "");
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ credits: r.credits, balance: r.balance, code: r.code });
}
