// 마브(MARV) 외부 API 프록시 설정.
// 키가 도입되면 MARV_API_KEY 환경변수만 설정하면 된다 (코드에 키를 두지 않는다).
export const MARV_BASE = process.env.MARV_API_BASE ?? "https://maket.mindvr.co.kr";

export function marvHeaders(): HeadersInit {
  const key = process.env.MARV_API_KEY;
  return key ? { "x-api-key": key } : {};
}

/** 테스트 랩에서 허용하는 마브 생성 경로 화이트리스트 */
export const ALLOWED_SUBMIT_PATHS = new Set([
  "/v1/tts",
  "/v1/image",
  "/v1/video",
  "/v1/talking_head",
  "/v1/chat",
  "/v1/music",
]);

/** 업로드 제한 — 참조 이미지 등 */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 파일당 15MB
export const MAX_TOTAL_UPLOAD_BYTES = 30 * 1024 * 1024; // 합계 30MB

/** 타임아웃 + 네트워크 오류를 던지는 fetch 래퍼 */
export async function marvFetch(
  path: string,
  init: RequestInit = {},
  timeoutMs = 30_000
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(`${MARV_BASE}${path}`, {
      ...init,
      headers: { ...marvHeaders(), ...(init.headers ?? {}) },
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }
}
