import { q } from "@/lib/db";

// Railway 헬스체크 — 서버 가용성(liveness). 항상 200을 반환해 DB 연결 순서/지연 때문에
// 배포가 막히지 않게 한다. DB 상태는 참고용으로 body의 db 필드에 표기.
export async function GET() {
  let db = "ok";
  try {
    await q("SELECT 1");
  } catch {
    db = "unavailable";
  }
  return Response.json({ status: "ok", db, time: new Date().toISOString() });
}
