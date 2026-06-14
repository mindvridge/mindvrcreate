import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCoupon, listCoupons } from "@/lib/coupons";

export async function GET() {
  const me = await getCurrentUser();
  if (!me?.is_admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  return NextResponse.json({ coupons: listCoupons() });
}

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me?.is_admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  let body: {
    code?: string;
    credits?: number;
    maxRedemptions?: number | null;
    expiresAt?: string | null;
    note?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const result = createCoupon({
    code: body.code,
    credits: Number(body.credits),
    maxRedemptions: body.maxRedemptions,
    expiresAt: body.expiresAt,
    note: body.note,
    createdBy: me.id,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ coupon: result.coupon });
}
