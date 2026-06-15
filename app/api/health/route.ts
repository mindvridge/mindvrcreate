import { q } from "@/lib/db";

// Railway 헬스체크 — 앱 + DB 가용성 확인 (마브 의존성과 무관).
export async function GET() {
  try {
    await q("SELECT 1");
    return Response.json({ status: "ok", time: new Date().toISOString() });
  } catch {
    return Response.json({ status: "db_error" }, { status: 503 });
  }
}
