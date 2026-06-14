import { NextResponse } from "next/server";
import {
  createSession,
  getUserById,
  getUserByEmail,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 무차별 대입 방지: IP+이메일 기준 10회/5분
  const key = `login:${clientIp(request)}:${(body.email ?? "").toLowerCase()}`;
  const rl = rateLimit(key, 10, 300_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } }
    );
  }

  const row = getUserByEmail(body.email ?? "");
  const ok = row ? await verifyPassword(body.password ?? "", row.password_hash) : false;
  if (!row || !ok) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const token = createSession(row.id);
  const res = NextResponse.json({ user: getUserById(row.id) });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
