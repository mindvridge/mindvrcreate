import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setUnlimited } from "@/lib/ledger";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me?.is_admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const { id } = await ctx.params;
  let body: { unlimited?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const ok = setUnlimited(id, Boolean(body.unlimited));
  if (!ok) return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ unlimited: Boolean(body.unlimited) });
}
