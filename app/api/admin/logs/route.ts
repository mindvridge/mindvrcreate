import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLogs } from "@/lib/ledger";

export async function GET(request: Request) {
  const me = await getCurrentUser();
  if (!me?.is_admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id") || undefined;
  const limit = Number(url.searchParams.get("limit")) || 100;
  return NextResponse.json({ logs: getLogs({ userId, limit }) });
}
