import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLogs, serviceUsage } from "@/lib/ledger";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  return NextResponse.json({
    logs: getLogs({ userId: me.id, limit: 100 }),
    usage: serviceUsage(me.id),
  });
}
