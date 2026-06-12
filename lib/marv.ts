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
]);
