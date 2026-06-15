/*
 * 크레딧 가격 정책.
 *
 * 책정 근거(2026년 경쟁 서비스 조사):
 * - TTS: ElevenLabs ~ $0.30 / 1,000자 (Multilingual)
 * - 이미지: fal.ai FLUX ~ $0.003 / MP, Replicate SDXL ~ $0.03~0.04 / 장
 * - 영상: fal.ai Wan 2.5 $0.05/초 (5초 ≈ $0.25), Runway/Kling 더 높음
 * - 아바타(토킹헤드): HeyGen Avatar IV ~ $1/분(프리미엄), 립싱크+음성 결합으로 가장 비쌈
 *
 * 기준 단위: 1 크레딧 ≈ ₩10. 신규 가입 시 300 크레딧(₩3,000 상당) 무료 제공.
 */

export type Service = "llm" | "tts" | "image" | "video" | "avatar" | "music";

export const CREDIT_COSTS: Record<Service, number> = {
  llm: 1, // 대화 — 텍스트, 거의 무료
  tts: 3, // 음성 — 짧은 클립
  image: 8, // 이미지 1장
  video: 40, // 영상 5초
  avatar: 60, // 아바타 6초 (립싱크 + 음성)
  music: 20, // 음악 한 곡 (작곡 + 보컬/연주)
};

export const SERVICE_LABELS: Record<Service, string> = {
  llm: "대화 (LLM)",
  tts: "음성 (TTS)",
  image: "이미지 생성",
  video: "영상 생성",
  avatar: "아바타",
  music: "음악 생성",
};

export const SIGNUP_BONUS = 300;
export const WON_PER_CREDIT = 10;

/** 충전 패키지 — 결제 연동 전까지 표시·관리자 수동 충전 기준 */
export const CREDIT_PACKS = [
  { id: "starter", name: "스타터", krw: 9900, credits: 1000, bonusPct: 0 },
  { id: "basic", name: "베이직", krw: 39000, credits: 4500, bonusPct: 12 },
  { id: "pro", name: "프로", krw: 99000, credits: 12000, bonusPct: 20 },
] as const;

const PATH_TO_SERVICE: Record<string, Service> = {
  "/v1/tts": "tts",
  "/v1/image": "image",
  "/v1/video": "video",
  "/v1/talking_head": "avatar",
  "/v1/chat": "llm",
  "/v1/music": "music",
};

export function serviceForPath(path: string): Service | null {
  return PATH_TO_SERVICE[path] ?? null;
}
