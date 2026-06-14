import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { grantCredits } from "@/lib/ledger";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me?.is_admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const { id } = await ctx.params;
  let body: { amount?: number; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const amount = Math.trunc(Number(body.amount));
  if (!Number.isFinite(amount) || amount === 0) {
    return NextResponse.json({ error: "충전/차감할 크레딧을 입력하세요." }, { status: 400 });
  }

  const balance = grantCredits(id, amount, body.note ?? "관리자 충전");
  if (balance === null) return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ balance });
}
