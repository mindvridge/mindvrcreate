import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/*
 * SQLite 데이터 계층.
 * - 로컬: ./data/app.db (기본)
 * - Railway: 볼륨을 /data 에 마운트하고 DB_PATH=/data/app.db 설정
 *   (볼륨 없이는 재배포 시 데이터가 초기화되므로 반드시 볼륨 필요)
 */
const DB_PATH = process.env.DB_PATH || "./data/app.db";

type GlobalWithDb = typeof globalThis & { __mvDb?: Database.Database };
const g = globalThis as GlobalWithDb;

function init(): Database.Database {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  db.exec(`
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
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type          TEXT NOT NULL,           -- signup_bonus | spend | grant | refund
      service       TEXT,                    -- llm | tts | image | video | avatar | null
      amount        INTEGER NOT NULL,        -- 음수=차감, 양수=충전
      unlimited     INTEGER NOT NULL DEFAULT 0,
      balance_after INTEGER NOT NULL,
      job_id        TEXT,
      settled       INTEGER NOT NULL DEFAULT 1,  -- 0=비동기 잡 정산 대기, 1=정산 완료
      note          TEXT,
      created_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_logs_user ON credit_logs(user_id, id DESC);
    CREATE INDEX IF NOT EXISTS idx_logs_job  ON credit_logs(job_id);
    CREATE INDEX IF NOT EXISTS idx_logs_pending ON credit_logs(settled, type) WHERE job_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS coupons (
      code            TEXT PRIMARY KEY,        -- 정규화: 대문자
      credits         INTEGER NOT NULL,        -- 지급 크레딧
      max_redemptions INTEGER,                 -- NULL = 전체 무제한
      redeemed_count  INTEGER NOT NULL DEFAULT 0,
      expires_at      TEXT,                    -- NULL = 무기한
      active          INTEGER NOT NULL DEFAULT 1,
      note            TEXT,
      created_by      TEXT,
      created_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS coupon_redemptions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      code       TEXT NOT NULL,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      credits    INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_redemption_once ON coupon_redemptions(code, user_id);
    CREATE INDEX IF NOT EXISTS idx_redemption_uid ON coupon_redemptions(user_id);
  `);

  // 기존 DB 파일(settled 컬럼 없음) 대비 방어적 마이그레이션
  try {
    db.exec("ALTER TABLE credit_logs ADD COLUMN settled INTEGER NOT NULL DEFAULT 1");
  } catch {
    /* 이미 존재 */
  }

  return db;
}

export function getDb(): Database.Database {
  if (!g.__mvDb) g.__mvDb = init();
  return g.__mvDb;
}
