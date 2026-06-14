import { getDb } from "./db";
import { CREDIT_COSTS, type Service } from "./credits";

/** 서버 전용 — 크레딧 차감/충전/환불 및 로그 기록 */

export type ChargeResult =
  | { ok: true; balance: number; charged: number; unlimited: boolean }
  | { ok: false; reason: "insufficient"; balance: number; required: number };

export function chargeCredits(
  userId: string,
  service: Service,
  jobId: string | null
): ChargeResult {
  const cost = CREDIT_COSTS[service];
  const db = getDb();

  return db.transaction((): ChargeResult => {
    const u = db
      .prepare("SELECT credits, unlimited FROM users WHERE id = ?")
      .get(userId) as { credits: number; unlimited: number } | undefined;
    if (!u) return { ok: false, reason: "insufficient", balance: 0, required: cost };

    const now = new Date().toISOString();

    if (u.unlimited) {
      // 무제한 사용자: 잔액 변동 없이 사용 내역만 기록 (소모량 = 정가)
      db.prepare(
        `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, note, created_at)
         VALUES (?, 'spend', ?, ?, 1, ?, ?, '무제한', ?)`
      ).run(userId, service, -cost, u.credits, jobId, now);
      return { ok: true, balance: u.credits, charged: cost, unlimited: true };
    }

    if (u.credits < cost) {
      return { ok: false, reason: "insufficient", balance: u.credits, required: cost };
    }

    const balance = u.credits - cost;
    db.prepare("UPDATE users SET credits = ? WHERE id = ?").run(balance, userId);
    db.prepare(
      `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, note, created_at)
       VALUES (?, 'spend', ?, ?, 0, ?, ?, NULL, ?)`
    ).run(userId, service, -cost, balance, jobId, now);
    return { ok: true, balance, charged: cost, unlimited: false };
  })();
}

/** 비동기 생성 실패 시 환불 (job_id 기준, 멱등) */
export function refundForFailedJob(userId: string, jobId: string): number | null {
  const db = getDb();
  return db.transaction((): number | null => {
    const spend = db
      .prepare(
        `SELECT id, service, amount, unlimited FROM credit_logs
         WHERE user_id = ? AND job_id = ? AND type = 'spend' LIMIT 1`
      )
      .get(userId, jobId) as
      | { id: number; service: string; amount: number; unlimited: number }
      | undefined;
    if (!spend) return null;

    const already = db
      .prepare("SELECT 1 FROM credit_logs WHERE job_id = ? AND type = 'refund' LIMIT 1")
      .get(jobId);
    if (already) return null;

    const u = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as
      | { credits: number }
      | undefined;
    if (!u) return null;

    const refund = -spend.amount; // 차감액(음수)의 절댓값
    const now = new Date().toISOString();

    if (spend.unlimited) {
      // 무제한 사용자는 잔액 차감이 없었으므로 표시용 로그만 남긴다
      db.prepare(
        `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, note, created_at)
         VALUES (?, 'refund', ?, 0, 1, ?, ?, '생성 실패(무제한)', ?)`
      ).run(userId, spend.service, u.credits, jobId, now);
      return u.credits;
    }

    const balance = u.credits + refund;
    db.prepare("UPDATE users SET credits = ? WHERE id = ?").run(balance, userId);
    db.prepare(
      `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, note, created_at)
       VALUES (?, 'refund', ?, ?, 0, ?, ?, '생성 실패 환불', ?)`
    ).run(userId, spend.service, refund, balance, jobId, now);
    return balance;
  })();
}

/** 관리자 충전 */
export function grantCredits(userId: string, amount: number, note: string): number | null {
  const db = getDb();
  return db.transaction((): number | null => {
    const u = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as
      | { credits: number }
      | undefined;
    if (!u) return null;
    const balance = u.credits + amount;
    db.prepare("UPDATE users SET credits = ? WHERE id = ?").run(balance, userId);
    db.prepare(
      `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, note, created_at)
       VALUES (?, 'grant', NULL, ?, 0, ?, NULL, ?, ?)`
    ).run(userId, amount, balance, note || "관리자 충전", new Date().toISOString());
    return balance;
  })();
}

export function setUnlimited(userId: string, unlimited: boolean): boolean {
  const r = getDb()
    .prepare("UPDATE users SET unlimited = ? WHERE id = ?")
    .run(unlimited ? 1 : 0, userId);
  return r.changes > 0;
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
  spent: number; // 누적 소모 크레딧(정가 기준)
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

/** 서비스별 소모 집계 (관리자 통계) */
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
