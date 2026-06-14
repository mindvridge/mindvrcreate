import { getDb } from "./db";
import { CREDIT_COSTS, type Service } from "./credits";

/** 서버 전용 — 크레딧 예약/정산/환불 및 로그 기록 */

export type ReserveResult =
  | { ok: true; logId: number; balance: number; charged: number; unlimited: boolean }
  | { ok: false; balance: number; required: number };

/**
 * 마브 호출 *이전*에 크레딧을 원자적으로 예약(선차감)한다.
 * 동시 요청은 `WHERE credits >= cost` 원자 UPDATE 로 직렬화되어 초과 사용이 불가능하다.
 * 잡 생성 실패 시 voidReservation 으로 즉시 환불한다.
 */
export function reserveCredits(userId: string, service: Service): ReserveResult {
  const cost = CREDIT_COSTS[service];
  const db = getDb();
  const now = new Date().toISOString();

  return db.transaction((): ReserveResult => {
    const u = db
      .prepare("SELECT credits, unlimited FROM users WHERE id = ?")
      .get(userId) as { credits: number; unlimited: number } | undefined;
    if (!u) return { ok: false, balance: 0, required: cost };

    if (u.unlimited) {
      const info = db
        .prepare(
          `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
           VALUES (?, 'spend', ?, ?, 1, ?, NULL, 1, '무제한', ?)`
        )
        .run(userId, service, -cost, u.credits, now);
      return { ok: true, logId: Number(info.lastInsertRowid), balance: u.credits, charged: cost, unlimited: true };
    }

    // 원자적 차감 — 잔액이 충분할 때만 성공
    const upd = db
      .prepare("UPDATE users SET credits = credits - ? WHERE id = ? AND credits >= ?")
      .run(cost, userId, cost);
    if (upd.changes === 0) return { ok: false, balance: u.credits, required: cost };

    const balance = u.credits - cost;
    const info = db
      .prepare(
        `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
         VALUES (?, 'spend', ?, ?, 0, ?, NULL, 0, NULL, ?)`
      )
      .run(userId, service, -cost, balance, now);
    return { ok: true, logId: Number(info.lastInsertRowid), balance, charged: cost, unlimited: false };
  })();
}

/** 예약 정산: 잡 생성 성공 시 job_id 연결. async=true(잡 기반)면 정산 대기, false(즉시 응답=llm)면 완료 */
export function settleReservation(logId: number, jobId: string | null, isAsyncJob: boolean): void {
  getDb()
    .prepare("UPDATE credit_logs SET job_id = ?, settled = ? WHERE id = ?")
    .run(jobId, isAsyncJob ? 0 : 1, logId);
}

/** 예약 취소(즉시 환불): 잡 생성 실패 시. 차감 복구 후 예약 로그 삭제. 복구된 잔액 반환 */
export function voidReservation(logId: number): number | null {
  const db = getDb();
  return db.transaction((): number | null => {
    const log = db
      .prepare("SELECT user_id, amount, unlimited FROM credit_logs WHERE id = ? AND type = 'spend'")
      .get(logId) as { user_id: string; amount: number; unlimited: number } | undefined;
    if (!log) return null;
    if (!log.unlimited) {
      db.prepare("UPDATE users SET credits = credits - ? WHERE id = ?").run(log.amount, log.user_id); // amount는 음수 → 복구
    }
    const u = db.prepare("SELECT credits FROM users WHERE id = ?").get(log.user_id) as
      | { credits: number }
      | undefined;
    db.prepare("DELETE FROM credit_logs WHERE id = ?").run(logId);
    return u?.credits ?? null;
  })();
}

/** 잡 성공 확인 시 정산 완료 표시 (재폴링 중단) */
export function markSettled(jobId: string): void {
  getDb()
    .prepare("UPDATE credit_logs SET settled = 1 WHERE job_id = ? AND type = 'spend' AND settled = 0")
    .run(jobId);
}

/** 비동기 잡 실패 환불 (job_id 기준, settled 플래그로 멱등). 세션 불필요 — 로그의 user_id 사용 */
export function refundForFailedJobByJobId(jobId: string): number | null {
  const db = getDb();
  return db.transaction((): number | null => {
    const spend = db
      .prepare(
        `SELECT id, user_id, service, amount, unlimited FROM credit_logs
         WHERE job_id = ? AND type = 'spend' AND settled = 0 LIMIT 1`
      )
      .get(jobId) as
      | { id: number; user_id: string; service: string; amount: number; unlimited: number }
      | undefined;
    if (!spend) return null;

    const now = new Date().toISOString();
    db.prepare("UPDATE credit_logs SET settled = 1 WHERE id = ?").run(spend.id);

    if (spend.unlimited) {
      const u = db.prepare("SELECT credits FROM users WHERE id = ?").get(spend.user_id) as { credits: number };
      db.prepare(
        `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
         VALUES (?, 'refund', ?, 0, 1, ?, ?, 1, '생성 실패(무제한)', ?)`
      ).run(spend.user_id, spend.service, u.credits, jobId, now);
      return u.credits;
    }

    const refund = -spend.amount; // 양수
    db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(refund, spend.user_id);
    const balance = (db.prepare("SELECT credits FROM users WHERE id = ?").get(spend.user_id) as { credits: number }).credits;
    db.prepare(
      `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
       VALUES (?, 'refund', ?, ?, 0, ?, ?, 1, '생성 실패 환불', ?)`
    ).run(spend.user_id, spend.service, refund, balance, jobId, now);
    return balance;
  })();
}

/** 정산 대기 중인(비동기 잡) 결제 목록 — 리컨실러용. 최근 2시간 이내 */
export function pendingChargedJobs(): { job_id: string }[] {
  const cutoff = new Date(Date.now() - 2 * 3600_000).toISOString();
  return getDb()
    .prepare(
      `SELECT job_id FROM credit_logs
       WHERE type = 'spend' AND settled = 0 AND job_id IS NOT NULL AND created_at > ?`
    )
    .all(cutoff) as { job_id: string }[];
}

/** 관리자 충전/차감. 잔액보다 큰 차감은 거부 */
export type GrantResult = { ok: true; balance: number } | { ok: false; error: string };

export function grantCredits(userId: string, amount: number, note: string): GrantResult {
  const db = getDb();
  return db.transaction((): GrantResult => {
    const u = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as
      | { credits: number }
      | undefined;
    if (!u) return { ok: false, error: "사용자를 찾을 수 없습니다." };
    if (amount < 0 && u.credits + amount < 0) {
      return { ok: false, error: `잔액(${u.credits})보다 많이 차감할 수 없습니다.` };
    }
    const balance = u.credits + amount;
    db.prepare("UPDATE users SET credits = ? WHERE id = ?").run(balance, userId);
    db.prepare(
      `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
       VALUES (?, 'grant', NULL, ?, 0, ?, NULL, 1, ?, ?)`
    ).run(userId, amount, balance, note || "관리자 충전", new Date().toISOString());
    return { ok: true, balance };
  })();
}

export function setUnlimited(userId: string, unlimited: boolean): boolean {
  const r = getDb()
    .prepare("UPDATE users SET unlimited = ? WHERE id = ?")
    .run(unlimited ? 1 : 0, userId);
  return r.changes > 0;
}

export function cleanupExpiredSessions(): number {
  return getDb()
    .prepare("DELETE FROM sessions WHERE expires_at < ?")
    .run(new Date().toISOString()).changes;
}

export type LogRow = {
  id: number;
  user_id: string;
  email?: string;
  name?: string;
  type: string;
  service: string | null;
  amount: number;
  unlimited: number;
  balance_after: number;
  job_id: string | null;
  note: string | null;
  created_at: string;
};

export function getLogs(opts: { userId?: string; limit?: number } = {}): LogRow[] {
  const limit = Math.min(Math.max(opts.limit ?? 100, 1), 500);
  const db = getDb();
  if (opts.userId) {
    return db
      .prepare(
        `SELECT l.*, u.email, u.name FROM credit_logs l
         JOIN users u ON u.id = l.user_id
         WHERE l.user_id = ? ORDER BY l.id DESC LIMIT ?`
      )
      .all(opts.userId, limit) as LogRow[];
  }
  return db
    .prepare(
      `SELECT l.*, u.email, u.name FROM credit_logs l
       JOIN users u ON u.id = l.user_id
       ORDER BY l.id DESC LIMIT ?`
    )
    .all(limit) as LogRow[];
}

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  credits: number;
  unlimited: number;
  is_admin: number;
  created_at: string;
  spent: number;
};

export function listUsers(): AdminUserRow[] {
  return getDb()
    .prepare(
      `SELECT u.id, u.email, u.name, u.credits, u.unlimited, u.is_admin, u.created_at,
              COALESCE((SELECT -SUM(amount) FROM credit_logs
                        WHERE user_id = u.id AND type = 'spend'), 0) AS spent
       FROM users u ORDER BY u.created_at DESC`
    )
    .all() as AdminUserRow[];
}

export function serviceUsage(userId?: string): { service: string; count: number; credits: number }[] {
  const db = getDb();
  const where = userId ? "AND user_id = ?" : "";
  const args = userId ? [userId] : [];
  return db
    .prepare(
      `SELECT service, COUNT(*) AS count, COALESCE(-SUM(amount), 0) AS credits
       FROM credit_logs
       WHERE type = 'spend' AND service IS NOT NULL ${where}
       GROUP BY service ORDER BY credits DESC`
    )
    .all(...args) as { service: string; count: number; credits: number }[];
}
