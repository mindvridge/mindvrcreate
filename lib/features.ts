/**
 * 기능 토글 — 마케팅 모드.
 * 회원가입과 테스트 랩을 비활성화하고, 헤더의 '테스트 랩' 자리에 '아바타'(개발 예정) 탭을 노출한다.
 * 재오픈 시 아래 값을 true로 바꾸면 된다.
 */
export const SIGNUP_ENABLED = false;
export const TEST_LAB_ENABLED = false;
/** 로그인 버튼 노출 여부. false라도 /login 라우트는 살아 있어(관리자 직접 접속) 로그인은 가능. */
export const LOGIN_ENABLED = false;
