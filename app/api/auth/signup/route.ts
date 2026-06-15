import { NextResponse } from "next/server";
import { createSession, createUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  const rl = rateLimit(`signup:${clientIp(request)}`, 10, 3600_000); // IP당 10회/시간
  if (!rl.ok) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } }
    );
  }

  let body: { email?: string; password?: string; name?: string; adminCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const result = await createUser({
      email: body.email ?? "",
      password: body.password ?? "",
      name: body.name ?? "",
      adminCode: body.adminCode,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    const token = await createSession(result.user.id);
    const res = NextResponse.json({ user: result.user });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch {
    return NextResponse.json(
      { error: "일시적으로 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }
}
