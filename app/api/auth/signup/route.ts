import { NextResponse } from "next/server";
import { createSession, createUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const result = createUser({
    email: body.email ?? "",
    password: body.password ?? "",
    name: body.name ?? "",
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const token = createSession(result.user.id);
  const res = NextResponse.json({ user: result.user });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
