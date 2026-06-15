import { Pool, type PoolClient, types } from "pg";

/*
 * PostgreSQL 데이터 계층 (Railway Postgres 등).
 * 연결 문자열은 환경변수 DATABASE_URL 로 주입한다.
 * - Railway: Postgres 플러그인을 추가하면 DATABASE_URL 이 자동 설정된다.
 * - 공개 프록시(SSL 필요) 사용 시 DATABASE_SSL=true 설정.
 */

// bigint(int8, BIGSERIAL) 를 number 로 파싱 (id 범위상 안전)
types.setTypeParser(20, (v: string) => parseInt(v, 10));

type GlobalWithPool = typeof globalThis & { __mvPool?: Pool; __mvSchema?: Promise<void> };
const g = globalThis as GlobalWithPool;

function getPool(): Pool {
  if (!g.__mvPool) {
    g.__mvPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
  }
  return g.__mvPool;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    credits       INTEGER NOT NULL DEFAULT 0,
    unlimited     INTEGER NOT NULL DEFAULT 0,
    is_admin      INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS credit_logs (
    id            BIGSERIAL PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type          TEXT NOT NULL,
    service       TEXT,
    amount        INTEGER NOT NULL,
    unlimited     INTEGER NOT NULL DEFAULT 0,
    balance_after INTEGER NOT NULL,
    job_id        TEXT,
    settled       INTEGER NOT NULL DEFAULT 1,
    note          TEXT,
    created_at    TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_logs_user ON credit_logs(user_id, id DESC);
  CREATE INDEX IF NOT EXISTS idx_logs_job  ON credit_logs(job_id);
  CREATE INDEX IF NOT EXISTS idx_logs_pending ON credit_logs(settled, type) WHERE job_id IS NOT NULL;
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS coupons (
    code            TEXT PRIMARY KEY,
    credits         INTEGER NOT NULL,
    max_redemptions INTEGER,
    redeemed_count  INTEGER NOT NULL DEFAULT 0,
    expires_at      TEXT,
    active          INTEGER NOT NULL DEFAULT 1,
    note            TEXT,
    created_by      TEXT,
    created_at      TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id         BIGSERIAL PRIMARY KEY,
    code       TEXT NOT NULL,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credits    INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_redemption_once ON coupon_redemptions(code, user_id);
  CREATE INDEX IF NOT EXISTS idx_redemption_uid ON coupon_redemptions(user_id);
`;

/** 스키마를 1회만 생성 (전역 프로미스 캐시) */
export function ensureSchema(): Promise<void> {
  if (!g.__mvSchema) {
    g.__mvSchema = getPool()
      .query(SCHEMA)
      .then(() => undefined);
  }
  return g.__mvSchema;
}

export type Row = Record<string, unknown>;

/** 단발 쿼리 (스키마 보장 후 실행) */
export async function q<T extends Row = Row>(
  text: string,
  params: unknown[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  await ensureSchema();
  const r = await getPool().query(text, params);
  return { rows: r.rows as T[], rowCount: r.rowCount ?? 0 };
}

/** 트랜잭션 — 콜백에 클라이언트를 넘기고 BEGIN/COMMIT/ROLLBACK 처리 */
export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw e;
  } finally {
    client.release();
  }
}
