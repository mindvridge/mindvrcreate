# 마인드브이알 MindVR — 홈페이지 + 생성 테스트 랩

한국어 특화 AI 아바타 스튜디오 소개 사이트와, 회원·크레딧 기반 생성 테스트 랩(음성·대화·이미지·영상·아바타).

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:3000
# 또는 운영 빌드
npm run build && npm run start
```

## 환경 변수

| 변수 | 기본값 | 설명 |
|---|---|---|
| `MARV_API_BASE` | `https://maket.mindvr.co.kr` | 마브 생성 API 베이스 URL |
| `MARV_API_KEY` | (없음) | 마브 API 인증키. 마브에 인증이 켜지면 설정. 코드에 두지 않음 |
| `ADMIN_EMAIL` | `mindvridge.official@gmail.com` | 관리자 계정 이메일 |
| `ADMIN_SETUP_CODE` | (없음) | 관리자 부트스트랩 코드. `ADMIN_EMAIL`이 **최초 가입자**면 자동 관리자가 되고, 이후에 가입할 때는 이 코드를 함께 제출해야 관리자 권한을 받습니다(이메일 선점 탈취 방지) |
| `DB_PATH` | `./data/app.db` | SQLite 파일 경로 |

`.env.local` 에 설정합니다 (이 파일은 git 에 커밋되지 않습니다).

## 배포 (Railway)

이 앱은 서버 기능(인증·크레딧·마브 프록시)을 쓰므로 **정적 호스팅이 아니라 Node 서버**가 필요합니다.

1. Railway → New Project → Deploy from GitHub repo → `mindvridge/mindvrcreate`
2. 빌드/실행은 자동 감지됩니다 (`npm run build` → `npm run start`).
3. **볼륨 필수** — SQLite 데이터를 영속화하려면:
   - 서비스에 Volume 추가 후 마운트 경로를 `/data` 로 지정
   - 환경변수 `DB_PATH=/data/app.db` 설정
   - (볼륨이 없으면 재배포·재시작마다 회원/크레딧 데이터가 초기화됩니다)
4. 필요 시 `MARV_API_KEY`, `ADMIN_EMAIL` 환경변수 추가
5. 배포 후 Settings → Networking → Generate Domain 으로 공개 주소 발급

## 크레딧 정책

기준 단가 1 크레딧 ≈ ₩10, 신규 가입 보너스 100 크레딧.
경쟁 서비스(ElevenLabs·HeyGen·Runway·Kling·fal.ai) 단가를 참고해 책정.

| 서비스 | 크레딧/회 |
|---|---|
| 대화 (LLM) | 1 |
| 음성 (TTS) | 3 |
| 이미지 생성 | 8 |
| 영상 생성 (5초) | 40 |
| 아바타 (6초) | 60 |

단가·패키지는 `lib/credits.ts` 에서 조정합니다.

### 관리자

`ADMIN_EMAIL` 로 가입한 계정은 `/admin` 에서:
- 사용자별 크레딧 **충전/차감**
- **무제한** 권한 토글 (잔액 차감 없이 사용, 내역은 계속 기록)
- **쿠폰** 생성·관리 (지급 크레딧·최대 사용 횟수·만료일·활성/중지·삭제)
- 서비스별 소모 집계 + 전체 사용 **로그** 조회

### 쿠폰

관리자가 발급한 쿠폰 코드를 사용자가 `/account` 에서 등록하면 크레딧이 충전됩니다.
- 코드별 **1인 1회**, 전체 **최대 사용 횟수**·**만료일** 지정 가능
- 동시 사용 시에도 한도를 초과하지 않도록 원자적으로 처리
- 사용 내역은 크레딧 로그에 `쿠폰` 으로 기록

## 주요 경로

| 경로 | 설명 |
|---|---|
| `/` | 소개 홈페이지 |
| `/test` | 생성 테스트 랩 (로그인 필요) |
| `/signup` `/login` | 회원가입 · 로그인 |
| `/account` | 내 잔액 · 단가 · 충전 패키지 · 사용 내역 |
| `/admin` | 관리자 (크레딧·무제한·로그) |
