import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteCoupon, setCouponActive } from "@/lib/coupons";

export async function PATCH(request: Request, ctx: { params: Promise<{ code: string }> }) {
  const me = await getCurrentUser();
  if (!me?.is_admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const { code } = await ctx.params;
  let body: { active?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const ok = await setCouponActive(decodeURIComponent(code), Boolean(body.active));
  if (!ok) return NextResponse.json({ error: "쿠폰을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ active: Boolean(body.active) });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const me = await getCurrentUser();
  if (!me?.is_admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const { code } = await ctx.params;
  const ok = await deleteCoupon(decodeURIComponent(code));
  if (!ok) return NextResponse.json({ error: "쿠폰을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
