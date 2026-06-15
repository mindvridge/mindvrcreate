// Next.js 서버 시작 시 1회 실행 — DB 스키마 준비 + 백그라운드 정산/정리 작업 기동.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureSchema } = await import("./lib/db");
  const { startBackgroundJobs } = await import("./lib/reconciler");
  const { startRateLimitSweep } = await import("./lib/ratelimit");
  try {
    await ensureSchema();
  } catch {
    /* 첫 요청 시 재시도 */
  }
  startBackgroundJobs();
  startRateLimitSweep();
}
