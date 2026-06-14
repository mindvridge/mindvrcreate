import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/*
 * SQLite 데이터 계층.
 * - 로컬: ./data/app.db (기본)
 * - Railway: 볼륨을 /data 에 마운트하고 DB_PATH=/data/app.db 설정
 *   (볼륨 없이는 재배포 시 데이터가 초기화되므로 반드시 볼륨 필요)
 *
 * 핫 리로드/서버리스 재사용을 위해 전역에 단일 인스턴스를 캐싱한다.
 */
const DB_PATH = process.env.DB_PATH || "./data/app.db";

type GlobalWithDb = typeof globalThis & { __mvDb?: Database.Database };
const g = globalThis as GlobalWithDb;

function init(): Database.Database {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

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
      note          TEXT,
      created_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_logs_user ON credit_logs(user_id, id DESC);
    CREATE INDEX IF NOT EXISTS idx_logs_job  ON credit_logs(job_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);

  return db;
}

export function getDb(): Database.Database {
  if (!g.__mvDb) g.__mvDb = init();
  return g.__mvDb;
}
