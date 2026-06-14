import { cookies } from "next/headers";
import { randomBytes, randomUUID, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "./db";
import { SIGNUP_BONUS } from "./credits";

const scrypt = promisify(_scrypt) as (pw: string, salt: string, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = "mv_session";
const SESSION_DAYS = 30;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "mindvridge.official@gmail.com").toLowerCase();
// 설정 시, ADMIN_EMAIL 가입자가 이 코드를 제출해야 관리자 권한 부여 (선점 방지)
const ADMIN_SETUP_CODE = process.env.ADMIN_SETUP_CODE || "";

export type User = {
  id: string;
  email: string;
  name: string;
  credits: number;
  unlimited: number;
  is_admin: number;
  created_at: string;
};

type UserRow = User & { password_hash: string };

/* ── 비밀번호 해싱 (비동기 scrypt — 이벤트 루프 비차단) ── */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)).toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = await scrypt(password, salt, 64);
  return hashBuf.length === test.length && timingSafeEqual(hashBuf, test);
}

/* ── 사용자 ───────────────────────────────────────────── */

export function getUserByEmail(email: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase()) as UserRow | undefined;
}

export function getUserById(id: string): User | undefined {
  return getDb()
    .prepare(
      "SELECT id, email, name, credits, unlimited, is_admin, created_at FROM users WHERE id = ?"
    )
    .get(id) as User | undefined;
}

export type CreateResult = { ok: true; user: User } | { ok: false; error: string };

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  adminCode?: string;
}): Promise<CreateResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "올바른 이메일을 입력하세요." };
  if (input.password.length < 8) return { ok: false, error: "비밀번호는 8자 이상이어야 합니다." };
  if (name.length < 1 || name.length > 40) return { ok: false, error: "이름을 입력하세요." };
  if (getUserByEmail(email)) return { ok: false, error: "이미 가입된 이메일입니다." };

  const passwordHash = await hashPassword(input.password); // tx 진입 전 await
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  try {
    const tx = db.transaction(() => {
      // 관리자 부트스트랩: ADMIN_EMAIL 이면서 (최초 가입자이거나, 설정 코드 일치) 일 때만.
      // → 소유자보다 늦게 ADMIN_EMAIL 로 가입해도 관리자 탈취 불가.
      const total = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number }).c;
      const codeOk = ADMIN_SETUP_CODE.length > 0 && input.adminCode === ADMIN_SETUP_CODE;
      const isAdmin = email === ADMIN_EMAIL && (total === 0 || codeOk) ? 1 : 0;
      const unlimited = isAdmin;

      db.prepare(
        `INSERT INTO users (id, email, password_hash, name, credits, unlimited, is_admin, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(id, email, passwordHash, name, SIGNUP_BONUS, unlimited, isAdmin, now);

      db.prepare(
        `INSERT INTO credit_logs (user_id, type, service, amount, unlimited, balance_after, job_id, settled, note, created_at)
         VALUES (?, 'signup_bonus', NULL, ?, ?, ?, NULL, 1, '가입 보너스', ?)`
      ).run(id, SIGNUP_BONUS, unlimited, SIGNUP_BONUS, now);
    });
    tx();
  } catch {
    // UNIQUE 제약 등 경쟁 상황
    return { ok: false, error: "이미 가입된 이메일입니다." };
  }

  return { ok: true, user: getUserById(id)! };
}

/* ── 세션 ─────────────────────────────────────────────── */

export function createSession(userId: string): string {
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 864e5);
  getDb()
    .prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(token, userId, now.toISOString(), expires.toISOString());
  return token;
}

export function destroySession(token: string): void {
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

function userForToken(token: string | undefined): User | undefined {
  if (!token) return undefined;
  const row = getDb()
    .prepare("SELECT user_id, expires_at FROM sessions WHERE token = ?")
    .get(token) as { user_id: string; expires_at: string } | undefined;
  if (!row) return undefined;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroySession(token);
    return undefined;
  }
  return getUserById(row.user_id);
}

/** 서버 컴포넌트·라우트 핸들러 공통: 현재 로그인 사용자 (쿠키 기반) */
export async function getCurrentUser(): Promise<User | undefined> {
  const store = await cookies();
  return userForToken(store.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(maxAgeDays = SESSION_DAYS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeDays * 86400,
  };
}
