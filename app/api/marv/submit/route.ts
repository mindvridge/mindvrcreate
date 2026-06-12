import { ALLOWED_SUBMIT_PATHS, MARV_BASE, marvHeaders } from "@/lib/marv";

// 마브 생성 endpoint 프록시 — 브라우저 CORS 회피 + 서버측 키 주입 지점.
export async function POST(request: Request) {
  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!ALLOWED_SUBMIT_PATHS.has(path)) {
    return Response.json({ detail: "허용되지 않은 경로입니다." }, { status: 400 });
  }

  const form = await request.formData();
  const res = await fetch(`${MARV_BASE}${path}`, {
    method: "POST",
    headers: marvHeaders(),
    body: form,
  });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
