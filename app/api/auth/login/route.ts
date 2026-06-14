import { NextResponse } from "next/server";
import {
  createSession,
  getUserById,
  getUserByEmail,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const row = getUserByEmail(body.email ?? "");
  if (!row || !verifyPassword(body.password ?? "", row.password_hash)) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const token = createSession(row.id);
  const res = NextResponse.json({ user: getUserById(row.id) });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
