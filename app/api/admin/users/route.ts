import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listUsers, serviceUsage } from "@/lib/ledger";

export async function GET() {
  const me = await getCurrentUser();
  if (!me?.is_admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  return NextResponse.json({ users: listUsers(), usage: serviceUsage() });
}
