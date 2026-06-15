import { q, tx } from "./db";

/** 서버 전용 — 쿠폰 생성/조회/관리 및 사용(redeem) (PostgreSQL) */

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
const SELECT_COLS =
  "code, credits, max_redemptions, redeemed_count, expires_at, active, note, created_at";

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export function generateCode(prefix = "MV"): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  for (let i = 0; i < 8; i++) body += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${body}`;
}

export async function getCoupon(code: string): Promise<Coupon | undefined> {
  const r = await q<Coupon>(`SELECT ${SELECT_COLS} FROM coupons WHERE code = $1`, [normalizeCode(code)]);
  return r.rows[0];
}

export async function listCoupons(): Promise<Coupon[]> {
  const r = await q<Coupon>(`SELECT ${SELECT_COLS} FROM coupons ORDER BY created_at DESC`);
  return r.rows;
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

export async function createCoupon(input: CreateCouponInput): Promise<CreateCouponResult> {
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

  if ((await q("SELECT 1 FROM coupons WHERE code = $1", [code])).rowCount > 0) {
    return { ok: false, error: "이미 존재하는 코드입니다." };
  }
  await q(
    `INSERT INTO coupons (code, credits, max_redemptions, redeemed_count, expires_at, active, note, created_by, created_at)
     VALUES ($1,$2,$3,0,$4,1,$5,$6,$7)`,
    [code, credits, max, expires, input.note ?? null, input.createdBy ?? null, new Date().toISOString()]
  );
  return { ok: true, coupon: (await getCoupon(code))! };
}

export async function setCouponActive(code: string, active: boolean): Promise<boolean> {
  const r = await q("UPDATE coupons SET active = $1 WHERE code = $2", [active ? 1 : 0, normalizeCode(code)]);
  return r.rowCount > 0;
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const r = await q("DELETE FROM coupons WHERE code = $1", [normalizeCode(code)]);
  return r.rowCount > 0;
}

export type RedeemResult =
  | { ok: true; credits: number; balance: number; code: string }
  | { ok: false; error: string };

/** 사용자 쿠폰 사용 — 만료·중복·소진 검증 후 원자적 지급 */
export function redeemCoupon(userId: string, rawCode: string): Promise<RedeemResult> {
  const code = normalizeCode(rawCode);
  if (!code) return Promise.resolve({ ok: false as const, error: "쿠폰 코드를 입력하세요." });

  return tx(async (c): Promise<RedeemResult> => {
    const coupon = (
      await c.query(
        "SELECT credits, max_redemptions, redeemed_count, expires_at, active FROM coupons WHERE code = $1",
        [code]
      )
    ).rows[0] as
      | { credits: number; max_redemptions: number | null; redeemed_count: number; expires_at: string | null; active: number }
      | undefined;
    if (!coupon) return { ok: false, error: "존재하지 않는 쿠폰입니다." };
    if (!coupon.active) return { ok: false, error: "사용 중지된 쿠폰입니다." };
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
      return { ok: false, error: "만료된 쿠폰입니다." };
    }
    const dup = await c.query("SELECT 1 FROM coupon_redemptions WHERE code = $1 AND user_id = $2", [code, userId]);
    if ((dup.rowCount ?? 0) > 0) return { ok: false, error: "이미 사용한 쿠폰입니다." };

    // 전체 사용 한도 원자적 증가 (동시 사용 초과 방지)
    const upd = await c.query(
      "UPDATE coupons SET redeemed_count = redeemed_count + 1 WHERE code = $1 AND active = 1 AND (max_redemptions IS NULL OR redeemed_count < max_redemptions)",
      [code]
    );
    if ((upd.rowCount ?? 0) === 0) return { ok: false, error: "쿠폰이 모두 소진되었습니다." };

    const now = new Date().toISOString();
    await c.query("INSERT INTO coupon_redemptions (code, user_id, credits, created_at) VALUES ($1,$2,$3,$4)", [
      code,
      userId,
      coupon.credits,
      now,
    ]);
    const balance = (
      await c.query("UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING credits", [
        coupon.credits,
        userId,
      ])
    ).rows[0].credits as number;
    await c.query(
      `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
       VALUES ($1,'coupon',NULL,$2,0,$3,NULL,1,$4,$5)`,
      [userId, coupon.credits, balance, `쿠폰 ${code}`, now]
    );
    return { ok: true, credits: coupon.credits, balance, code };
  });
}
