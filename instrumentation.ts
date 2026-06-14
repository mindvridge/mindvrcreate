// Next.js 서버 시작 시 1회 실행 — 백그라운드 정산/정리 작업 기동.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startBackgroundJobs } = await import("./lib/reconciler");
  const { startRateLimitSweep } = await import("./lib/ratelimit");
  startBackgroundJobs();
  startRateLimitSweep();
}
