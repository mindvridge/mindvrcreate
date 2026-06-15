import { q } from "./db";
import type { Service } from "./credits";

/** 테스트 랩 생성물(이미지/영상/오디오) 기록 — 내 갤러리용 */

export type CreationKind = "image" | "video" | "audio";

/** 서비스 → 결과 파일 종류. 파일이 없는 서비스(llm)는 null */
export function kindForService(service: Service): CreationKind | null {
  switch (service) {
    case "image":
      return "image";
    case "video":
      return "video";
    case "avatar":
      return "video";
    case "tts":
      return "audio";
    case "music":
      return "audio";
    default:
      return null;
  }
}

export type CreationRow = {
  id: number;
  job_id: string;
  service: string;
  kind: CreationKind;
  prompt: string | null;
  created_at: string;
};

/** 생성 잡 1건 기록. 이미 같은 job_id가 있으면 무시(멱등). */
export async function recordCreation(
  userId: string,
  jobId: string,
  service: Service,
  prompt: string | null
): Promise<void> {
  const kind = kindForService(service);
  if (!kind) return;
  const existing = await q("SELECT 1 FROM creations WHERE user_id = $1 AND job_id = $2", [userId, jobId]);
  if ((existing.rowCount ?? 0) > 0) return;
  await q(
    `INSERT INTO creations (user_id, job_id, service, kind, prompt, created_at)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId, jobId, service, kind, prompt ? prompt.slice(0, 500) : null, new Date().toISOString()]
  );
}

export async function listCreations(userId: string, limit = 60): Promise<CreationRow[]> {
  const lim = Math.min(Math.max(limit, 1), 200);
  const r = await q<CreationRow>(
    `SELECT id, job_id, service, kind, prompt, created_at
     FROM creations WHERE user_id = $1 ORDER BY id DESC LIMIT $2`,
    [userId, lim]
  );
  return r.rows;
}

/** 소유권 확인용 — 내 생성물의 job_id 조회 */
export async function getCreationJobId(userId: string, id: number): Promise<string | null> {
  const r = await q<{ job_id: string }>(
    "SELECT job_id FROM creations WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return r.rows[0]?.job_id ?? null;
}
