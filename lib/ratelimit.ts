/*
 * 경량 인메모리 레이트 리미터 (슬라이딩 윈도우).
 * 단일 인스턴스 기준 — 수평 확장 시 Redis 등으로 대체 필요.
 */
type Hit = number[];
const store = new Map<string, Hit>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (store.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= limit) {
    const retryAfter = Math.ceil((hits[0] + windowMs - now) / 1000);
    store.set(key, hits);
    return { ok: false, retryAfter };
  }
  hits.push(now);
  store.set(key, hits);
  return { ok: true, retryAfter: 0 };
}

export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// 메모리 누수 방지: 주기적으로 오래된 키 정리
let sweeping = false;
export function startRateLimitSweep() {
  if (sweeping) return;
  sweeping = true;
  setInterval(() => {
    const cutoff = Date.now() - 3600_000;
    for (const [k, hits] of store) {
      const live = hits.filter((t) => t > cutoff);
      if (live.length === 0) store.delete(k);
      else store.set(k, live);
    }
  }, 600_000).unref?.();
}
