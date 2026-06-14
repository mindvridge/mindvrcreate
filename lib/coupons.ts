import { getDb } from "./db";

/** 서버 전용 — 쿠폰 생성/조회/관리 및 사용자 사용(redeem) */

export type Coupon = {
  code: string;
  credits: number;
  max_redemptions: number | null;
  redeemed_count: number;
  expires_at: string | null;
  active: number;
  note: string | null;
  created_at: string;
};

const CODE_RE = /^[A-Z0-9][A-Z0-9-]{2,31}$/;

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/** 무작위 쿠폰 코드 생성 (혼동 문자 제외) */
export function generateCode(prefix = "MV"): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  for (let i = 0; i < 8; i++) body += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${body}`;
}

const SELECT_COLS =
  "code, credits, max_redemptions, redeemed_count, expires_at, active, note, created_at";

export function getCoupon(code: string): Coupon | undefined {
  return getDb()
    .prepare(`SELECT ${SELECT_COLS} FROM coupons WHERE code = ?`)
    .get(normalizeCode(code)) as Coupon | undefined;
}

export function listCoupons(): Coupon[] {
  return getDb()
    .prepare(`SELECT ${SELECT_COLS} FROM coupons ORDER BY created_at DESC`)
    .all() as Coupon[];
}

export type CreateCouponInput = {
  code?: string;
  credits: number;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
  note?: string;
  createdBy?: string;
};
export type CreateCouponResult = { ok: true; coupon: Coupon } | { ok: false; error: string };

export function createCoupon(input: CreateCouponInput): CreateCouponResult {
  const code = input.code ? normalizeCode(input.code) : generateCode();
  if (!CODE_RE.test(code)) {
    return { ok: false, error: "코드는 영문 대문자·숫자·하이픈 3~32자여야 합니다." };
  }
  const credits = Math.trunc(Number(input.credits));
  if (!Number.isFinite(credits) || credits <= 0) {
    return { ok: false, error: "지급 크레딧은 1 이상이어야 합니다." };
  }
  const max =
    input.maxRedemptions == null || `${input.maxRedemptions}` === ""
      ? null
      : Math.trunc(Number(input.maxRedemptions));
  if (max !== null && (!Number.isFinite(max) || max < 1)) {
    return { ok: false, error: "최대 사용 횟수가 올바르지 않습니다." };
  }
  let expires: string | null = null;
  if (input.expiresAt) {
    const d = new Date(input.expiresAt);
    if (Number.isNaN(d.getTime())) return { ok: false, error: "만료일이 올바르지 않습니다." };
    expires = d.toISOString();
  }

  const db = getDb();
  if (db.prepare("SELECT 1 FROM coupons WHERE code = ?").get(code)) {
    return { ok: false, error: "이미 존재하는 코드입니다." };
  }
  db.prepare(
    `INSERT INTO coupons (code, credits, max_redemptions, redeemed_count, expires_at, active, note, created_by, created_at)
     VALUES (?, ?, ?, 0, ?, 1, ?, ?, ?)`
  ).run(code, credits, max, expires, input.note ?? null, input.createdBy ?? null, new Date().toISOString());
  return { ok: true, coupon: getCoupon(code)! };
}

export function setCouponActive(code: string, active: boolean): boolean {
  return (
    getDb().prepare("UPDATE coupons SET active = ? WHERE code = ?").run(active ? 1 : 0, normalizeCode(code))
      .changes > 0
  );
}

export function deleteCoupon(code: string): boolean {
  return getDb().prepare("DELETE FROM coupons WHERE code = ?").run(normalizeCode(code)).changes > 0;
}

export type RedeemResult =
  | { ok: true; credits: number; balance: number; code: string }
  | { ok: false; error: string };

/** 사용자 쿠폰 사용 — 만료·중복·소진 검증 후 원자적 지급 */
export function redeemCoupon(userId: string, rawCode: string): RedeemResult {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, error: "쿠폰 코드를 입력하세요." };

  const db = getDb();
  return db.transaction((): RedeemResult => {
    const c = db
      .prepare(
        "SELECT credits, max_redemptions, redeemed_count, expires_at, active FROM coupons WHERE code = ?"
      )
      .get(code) as
      | { credits: number; max_redemptions: number | null; redeemed_count: number; expires_at: string | null; active: number }
      | undefined;
    if (!c) return { ok: false, error: "존재하지 않는 쿠폰입니다." };
    if (!c.active) return { ok: false, error: "사용 중지된 쿠폰입니다." };
    if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) {
      return { ok: false, error: "만료된 쿠폰입니다." };
    }
    if (db.prepare("SELECT 1 FROM coupon_redemptions WHERE code = ? AND user_id = ?").get(code, userId)) {
      return { ok: false, error: "이미 사용한 쿠폰입니다." };
    }

    // 전체 사용 한도 원자적 증가 (동시 사용 초과 방지)
    const upd = db
      .prepare(
        "UPDATE coupons SET redeemed_count = redeemed_count + 1 WHERE code = ? AND active = 1 AND (max_redemptions IS NULL OR redeemed_count < max_redemptions)"
      )
      .run(code);
    if (upd.changes === 0) return { ok: false, error: "쿠폰이 모두 소진되었습니다." };

    const now = new Date().toISOString();
    db.prepare(
      "INSERT INTO coupon_redemptions (code, user_id, credits, created_at) VALUES (?, ?, ?, ?)"
    ).run(code, userId, c.credits, now);
    db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(c.credits, userId);
    const balance = (db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as { credits: number }).credits;
    db.prepare(
      `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
       VALUES (?, 'coupon', NULL, ?, 0, ?, NULL, 1, ?, ?)`
    ).run(userId, c.credits, balance, `쿠폰 ${code}`, now);
    return { ok: true, credits: c.credits, balance, code };
  })();
}
