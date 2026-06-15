import { q, tx } from "./db";
import { CREDIT_COSTS, type Service } from "./credits";

/** 서버 전용 — 크레딧 예약/정산/환불 및 로그 기록 (PostgreSQL) */

export type ReserveResult =
  | { ok: true; logId: number; balance: number; charged: number; unlimited: boolean }
  | { ok: false; balance: number; required: number };

/**
 * 마브 호출 *이전*에 크레딧을 원자적으로 예약(선차감)한다.
 * `UPDATE ... WHERE credits >= cost` 의 행 잠금으로 동시 요청 초과 사용이 불가능하다.
 */
export function reserveCredits(
  userId: string,
  service: Service,
  quantity = 1
): Promise<ReserveResult> {
  const cost = CREDIT_COSTS[service] * Math.max(1, quantity);
  const now = new Date().toISOString();

  return tx(async (c): Promise<ReserveResult> => {
    const u = (
      await c.query("SELECT credits, unlimited FROM users WHERE id = $1", [userId])
    ).rows[0] as { credits: number; unlimited: number } | undefined;
    if (!u) return { ok: false, balance: 0, required: cost };

    if (u.unlimited) {
      const r = await c.query(
        `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
         VALUES ($1,'spend',$2,$3,1,$4,NULL,1,'무제한',$5) RETURNING id`,
        [userId, service, -cost, u.credits, now]
      );
      return { ok: true, logId: Number(r.rows[0].id), balance: u.credits, charged: cost, unlimited: true };
    }

    const upd = await c.query(
      "UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1 RETURNING credits",
      [cost, userId]
    );
    if ((upd.rowCount ?? 0) === 0) return { ok: false, balance: u.credits, required: cost };

    const balance = upd.rows[0].credits as number;
    const r = await c.query(
      `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
       VALUES ($1,'spend',$2,$3,0,$4,NULL,0,NULL,$5) RETURNING id`,
      [userId, service, -cost, balance, now]
    );
    return { ok: true, logId: Number(r.rows[0].id), balance, charged: cost, unlimited: false };
  });
}

/** 예약 정산: 잡 생성 성공 시 job_id 연결. isAsyncJob=true 면 정산 대기(settled=0) */
export async function settleReservation(
  logId: number,
  jobId: string | null,
  isAsyncJob: boolean
): Promise<void> {
  await q("UPDATE credit_logs SET job_id = $1, settled = $2 WHERE id = $3", [
    jobId,
    isAsyncJob ? 0 : 1,
    logId,
  ]);
}

/** 예약 취소(즉시 환불): 잡 생성 실패 시. 차감 복구 후 예약 로그 삭제. 복구된 잔액 반환 */
export function voidReservation(logId: number): Promise<number | null> {
  return tx(async (c): Promise<number | null> => {
    const log = (
      await c.query("SELECT user_id, amount, unlimited FROM credit_logs WHERE id = $1 AND type = 'spend'", [logId])
    ).rows[0] as { user_id: string; amount: number; unlimited: number } | undefined;
    if (!log) return null;
    if (!log.unlimited) {
      await c.query("UPDATE users SET credits = credits - $1 WHERE id = $2", [log.amount, log.user_id]);
    }
    const u = (await c.query("SELECT credits FROM users WHERE id = $1", [log.user_id])).rows[0] as
      | { credits: number }
      | undefined;
    await c.query("DELETE FROM credit_logs WHERE id = $1", [logId]);
    return u?.credits ?? null;
  });
}

/** 잡 성공 확인 시 정산 완료 표시 */
export async function markSettled(jobId: string): Promise<void> {
  await q("UPDATE credit_logs SET settled = 1 WHERE job_id = $1 AND type = 'spend' AND settled = 0", [jobId]);
}

/** 사용자가 해당 잡(job_id)에 과금된 적이 있는지 — 취소 권한 확인용 */
export async function ownsJob(userId: string, jobId: string): Promise<boolean> {
  const r = await q(
    "SELECT 1 FROM credit_logs WHERE job_id = $1 AND user_id = $2 AND type = 'spend' LIMIT 1",
    [jobId, userId]
  );
  return (r.rowCount ?? 0) > 0;
}

/** 비동기 잡 실패/취소 환불 (job_id 기준, settled 플래그로 멱등) */
export function refundForFailedJobByJobId(
  jobId: string,
  reason: "failed" | "cancelled" = "failed"
): Promise<number | null> {
  const noteUnlimited = reason === "cancelled" ? "생성 취소(무제한)" : "생성 실패(무제한)";
  const noteRefund = reason === "cancelled" ? "생성 취소 환불" : "생성 실패 환불";
  return tx(async (c): Promise<number | null> => {
    const spend = (
      await c.query(
        `SELECT id, user_id, service, amount, unlimited FROM credit_logs
         WHERE job_id = $1 AND type = 'spend' AND settled = 0 LIMIT 1`,
        [jobId]
      )
    ).rows[0] as
      | { id: number; user_id: string; service: string; amount: number; unlimited: number }
      | undefined;
    if (!spend) return null;

    const now = new Date().toISOString();
    await c.query("UPDATE credit_logs SET settled = 1 WHERE id = $1", [spend.id]);

    if (spend.unlimited) {
      const u = (await c.query("SELECT credits FROM users WHERE id = $1", [spend.user_id])).rows[0] as {
        credits: number;
      };
      await c.query(
        `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
         VALUES ($1,'refund',$2,0,1,$3,$4,1,$5,$6)`,
        [spend.user_id, spend.service, u.credits, jobId, noteUnlimited, now]
      );
      return u.credits;
    }

    const refund = -spend.amount;
    const upd = await c.query("UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING credits", [
      refund,
      spend.user_id,
    ]);
    const balance = upd.rows[0].credits as number;
    await c.query(
      `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
       VALUES ($1,'refund',$2,$3,0,$4,$5,1,$6,$7)`,
      [spend.user_id, spend.service, refund, balance, jobId, noteRefund, now]
    );
    return balance;
  });
}

/** 정산 대기 중인(비동기 잡) 결제 목록 — 리컨실러용. 최근 2시간 이내 */
export async function pendingChargedJobs(): Promise<{ job_id: string }[]> {
  const cutoff = new Date(Date.now() - 2 * 3600_000).toISOString();
  const r = await q<{ job_id: string }>(
    `SELECT job_id FROM credit_logs
     WHERE type = 'spend' AND settled = 0 AND job_id IS NOT NULL AND created_at > $1`,
    [cutoff]
  );
  return r.rows;
}

/** 관리자 충전/차감. 잔액보다 큰 차감은 거부 */
export type GrantResult = { ok: true; balance: number } | { ok: false; error: string };

export function grantCredits(userId: string, amount: number, note: string): Promise<GrantResult> {
  return tx(async (c): Promise<GrantResult> => {
    const u = (await c.query("SELECT credits FROM users WHERE id = $1", [userId])).rows[0] as
      | { credits: number }
      | undefined;
    if (!u) return { ok: false, error: "사용자를 찾을 수 없습니다." };
    if (amount < 0 && u.credits + amount < 0) {
      return { ok: false, error: `잔액(${u.credits})보다 많이 차감할 수 없습니다.` };
    }
    const balance = u.credits + amount;
    await c.query("UPDATE users SET credits = $1 WHERE id = $2", [balance, userId]);
    await c.query(
      `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
       VALUES ($1,'grant',NULL,$2,0,$3,NULL,1,$4,$5)`,
      [userId, amount, balance, note || "관리자 충전", new Date().toISOString()]
    );
    return { ok: true, balance };
  });
}

export async function setUnlimited(userId: string, unlimited: boolean): Promise<boolean> {
  const r = await q("UPDATE users SET unlimited = $1 WHERE id = $2", [unlimited ? 1 : 0, userId]);
  return r.rowCount > 0;
}

export async function cleanupExpiredSessions(): Promise<number> {
  const r = await q("DELETE FROM sessions WHERE expires_at < $1", [new Date().toISOString()]);
  return r.rowCount;
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

export async function getLogs(opts: { userId?: string; limit?: number } = {}): Promise<LogRow[]> {
  const limit = Math.min(Math.max(opts.limit ?? 100, 1), 500);
  if (opts.userId) {
    const r = await q<LogRow>(
      `SELECT l.*, u.email, u.name FROM credit_logs l
       JOIN users u ON u.id = l.user_id
       WHERE l.user_id = $1 ORDER BY l.id DESC LIMIT $2`,
      [opts.userId, limit]
    );
    return r.rows;
  }
  const r = await q<LogRow>(
    `SELECT l.*, u.email, u.name FROM credit_logs l
     JOIN users u ON u.id = l.user_id
     ORDER BY l.id DESC LIMIT $1`,
    [limit]
  );
  return r.rows;
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

export async function listUsers(): Promise<AdminUserRow[]> {
  const r = await q<AdminUserRow>(
    `SELECT u.id, u.email, u.name, u.credits, u.unlimited, u.is_admin, u.created_at,
            COALESCE((SELECT -SUM(amount) FROM credit_logs
                      WHERE user_id = u.id AND type = 'spend'), 0)::int AS spent
     FROM users u ORDER BY u.created_at DESC`
  );
  return r.rows;
}

export async function serviceUsage(
  userId?: string
): Promise<{ service: string; count: number; credits: number }[]> {
  if (userId) {
    const r = await q<{ service: string; count: number; credits: number }>(
      `SELECT service, COUNT(*)::int AS count, COALESCE(-SUM(amount), 0)::int AS credits
       FROM credit_logs WHERE type = 'spend' AND service IS NOT NULL AND user_id = $1
       GROUP BY service ORDER BY credits DESC`,
      [userId]
    );
    return r.rows;
  }
  const r = await q<{ service: string; count: number; credits: number }>(
    `SELECT service, COUNT(*)::int AS count, COALESCE(-SUM(amount), 0)::int AS credits
     FROM credit_logs WHERE type = 'spend' AND service IS NOT NULL
     GROUP BY service ORDER BY credits DESC`
  );
  return r.rows;
}
