/**
 * 쿠키 기반 다국어(i18n) — 순수 상수·타입·사전. (서버 전용 함수는 lib/i18n-server.ts)
 * URL은 그대로 두고, 브라우저 언어(Accept-Language)로 자동 감지하며
 * 사용자가 언어 전환기로 고른 값은 쿠키(mv_lang)에 저장해 유지한다.
 */

export const LOCALES = ["ko", "en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "mv_lang";

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
};

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** 클라이언트에서 언어 쿠키를 저장한다(1년). */
export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/** Accept-Language 헤더에서 지원 언어를 고른다. ko/zh 우선, 그 외 언어는 en으로. */
export function pickFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  // "ko-KR,ko;q=0.9,en;q=0.8" → [ko-KR, ko, en]
  const tags = header
    .split(",")
    .map((p) => p.split(";")[0].trim().toLowerCase())
    .filter(Boolean);
  for (const tag of tags) {
    if (tag.startsWith("ko")) return "ko";
    if (tag.startsWith("zh")) return "zh";
    if (tag.startsWith("en")) return "en";
  }
  // 한국어/중국어/영어가 전혀 없으면 국제 기본값(영어)
  return tags.length ? "en" : DEFAULT_LOCALE;
}

/* ── 사전 ─────────────────────────────────────────────── */

type EmText = { lead: string; em: string; tail: string };

const ko = {
  meta: {
    homeTitle: "마인드브이알 MindVR — 한국어 특화 AI 아바타 스튜디오",
    homeDescription: "한국어로 자연스럽게 말하는, 당신만의 AI 휴먼을 합리적 비용에. 테스트 랩에서 직접 만들어 보세요.",
    brandTitle: "브랜드 소개 — 마인드브이알 MindVR",
    brandDescription: "마인드브이알(MindVR)은 한국어에 특화된 AI 아바타 스튜디오입니다. 사람처럼 자연스럽게 한국어로 말하는 디지털휴먼을 자체 제작 역량으로 만듭니다.",
    ogLocale: "ko_KR",
  },
  nav: {
    brandTag: "마인드브이알",
    items: {
      brand: "브랜드 소개",
      why: "왜 마인드브이알",
      usecases: "활용 사례",
      demos: "데모",
      pricing: "가격",
      lab: "테스트 랩",
    },
    login: "로그인",
    signup: "회원가입",
  },
  account: {
    unlimited: "무제한",
    unlimitedUse: "무제한 사용",
    creditsSuffix: "크레딧",
    lab: "테스트 랩",
    account: "내 계정 · 사용 내역",
    admin: "관리자",
    logout: "로그아웃",
  },
  hero: {
    eyebrow: "MINDVR — KOREAN AI HUMAN STUDIO",
    title: { lead: "당신만의 AI 휴먼, ", em: "한국어로 자연스럽게", tail: " 말합니다." } as EmText,
    lede:
      "템플릿 아바타가 아닙니다. 당신의 캐릭터·브랜드·페르소나 전용 디지털휴먼을, 한국어 입모양과 억양까지 자연스럽게 만들어 드립니다.",
    ctaPrimary: "무료 테스트 해보기",
    ctaSecondary: "제작 과정 보기",
  },
  heroStage: {
    soundOn: "SOUND ON · 소리 켜기",
    soundOff: "SOUND OFF · 소리 끄기",
    alt: "마인드브이알이 제작한 AI 휴먼 프레젠터",
  },
  twoTypes: {
    eyebrowEm: "TWO",
    eyebrowRest: "AI HUMANS",
    heading: { lead: "MINDVR가 제공하는 ", em: "두 가지 AI 휴먼", tail: "." } as EmText,
    cta: "자세히 보기",
    realtime: {
      title: "실시간 인터랙티브 AI 휴먼",
      body: "말로 대화하는 AI 직원. 음성으로 묻고 답하는 양방향 대화형으로, 고객 상담 데모·모의 면접·교육 연습 상대로 활용합니다.",
    },
    content: {
      title: "AI 마케팅 콘텐츠",
      body: "대본을 말하는 영상. 실사 수준의 AI 휴먼이 촬영 인력·장비 없이 SNS·유튜브·제품 소개·광고 영상을 만들어 드립니다.",
    },
  },
  realtime: {
    title: { lead: "실시간 인터랙티브 AI 휴먼 — ", em: "말로 대화하는", tail: " AI 직원." } as EmText,
    lede:
      "음성으로 묻고 답하는 양방향 대화형 AI 휴먼입니다. 고객 상담 데모, 모의 면접, 교육·발표 연습 상대로 활용할 수 있습니다. 사용자의 말을 알아듣고(STT), 맥락을 이해해 답을 만들고(LLM), 자연스러운 목소리로 답하는(TTS) 과정이 실시간으로 이어집니다. 한국인의 발화와 표정에 최적화되어 어색함이 적고, 사용자의 반응을 인식해 표정과 태도로 응답합니다. 단순 챗봇이 아니라, 실사형 아바타가 함께하는 인터랙티브 솔루션입니다.",
    liveTag: "LIVE · 끊김 없이 실시간으로 순환합니다",
    pipeline: [
      { tag: "STT", title: "듣기", body: "사용자의 말을 실시간으로 알아듣습니다." },
      { tag: "LLM", title: "이해·생성", body: "맥락을 이해해 답을 만듭니다." },
      { tag: "TTS", title: "말하기", body: "자연스러운 목소리로 답합니다." },
    ],
    highlights: ["STT·LLM·TTS 실시간 연결", "한국인 발화·표정 최적화", "사용자 반응 인식 응답", "실사형 인터랙티브 아바타"],
    useCasesLabel: "활용 예시",
    useCases: ["고객 응대 시나리오 연습", "채용 모의 면접", "직원 교육 및 발표 리허설", "서비스 상담 데모"],
  },
  gallery: {
    title: "사람 없이 만드는 AI 마케팅 콘텐츠",
    lede:
      "실사 수준의 AI 휴먼이 대본을 말하는 영상을 만들어 드립니다. SNS·블로그·유튜브 홍보 영상, 제품 소개, 브랜드 메시지를 촬영 인력이나 장비 없이 제작할 수 있습니다. 대본만 입력하면 AI 휴먼이 말하는 영상이 완성됩니다. 외주 제작이나 반복 촬영 없이, 필요할 때마다 빠르게 콘텐츠를 만들 수 있습니다.",
    hoverPlay: "HOVER · 재생",
    aiGenerated: "AI GENERATED",
    personas: { counselor: "상담사", interviewer: "면접관", influencer: "인플루언서", twin: "디지털트윈" },
    useCasesLabel: "활용 예시",
    useCases: ["유튜브 채널 운영", "인스타그램·SNS 숏폼", "블로그 영상", "제품 소개·광고 영상", "브랜드 안내"],
  },
  problem: {
    title: { lead: "지금 디지털휴먼을 도입하려면,", em: "", tail: "셋 중 하나는 포기해야 합니다." } as EmText,
    items: [
      { index: "01", title: "비싸거나", body: "해외 아바타 서비스는 달러 구독이 기본입니다. 환율 따라 비용이 출렁이고, 물량이 늘수록 가파르게 오릅니다." },
      { index: "02", title: "영어 같거나", body: "영어 중심으로 만들어진 서비스는 한국어 입모양과 운율이 어색합니다. 시청자는 3초 만에 알아챕니다." },
      { index: "03", title: "템플릿이거나", body: "정해진 아바타 중에서 고르는 방식으로는 당신의 캐릭터·브랜드를 온전히 담을 수 없습니다." },
    ],
    closing: { lead: "마인드브이알은 셋 다 포기하지 않습니다. 한국어에 최적화된 ", em: "자체 제작 역량과 전용 제작", tail: "으로 답합니다." } as EmText,
  },
  values: {
    title: { lead: "한국어로 자연스럽게 말하는 AI 휴먼을, ", em: "합리적 비용", tail: "에." } as EmText,
    items: [
      { tag: "KOREAN-NATIVE", title: "한국어가 자연스럽습니다", body: "영어를 번역해 입힌 듯한 어색함이 없습니다. 한국어의 입모양·억양·호흡에 맞춰 제작하며, “자연스럽다”는 말 대신 무료 데모로 직접 보여드립니다." },
      { tag: "CUSTOM, NOT TEMPLATE", title: "템플릿이 아닌 전용 제작", body: "당신의 캐릭터·브랜드·페르소나 전용으로 디지털휴먼을 설계합니다." },
      { tag: "FULL-STACK", title: "풀스택 원스톱", body: "아바타 + 한국어 음성(TTS) + 립싱크 + 영상 + 이미지까지 한 곳에서. 여러 툴을 이어 붙이는 수고 없이 완성본으로 받으세요." },
      { tag: "FAIR PRICING", title: "합리적 비용 구조", body: "직접 제작하기에 거품이 없습니다. 달러 구독 없이 원화 기준 물량·프로젝트 단위로만 비용이 발생하며, 초기 팀을 위한 스타트업 플랜을 운영합니다." },
    ],
  },
  segments: {
    title: { lead: "만들고 있는 제품에 따라,", em: "", tail: "필요한 레이어만 가져가세요." } as EmText,
    lede: "창업자 수천 명의 아이디어를 직접 분석해 설계한 네 가지 적용 트랙입니다. 당신의 제품이 어디에 해당하는지 보이면, 데모도 그 모습으로 만들어 드립니다.",
    tracks: [
      { code: "T1", title: "사람형 아바타 · 디지털휴먼", desc: "디지털트윈 안부전화, 버추얼 IP·K-POP, AI 페르소나 면접관, 문진·상담 케어 아바타, 가상 피팅까지 — 사람의 얼굴이 제품인 서비스.", offer: "아바타 + TTS + 립싱크 + 영상 풀스택" },
      { code: "T2", title: "대화형 AI에 얼굴 입히기", desc: "텍스트·음성 챗봇으로 시작한 서비스에 아바타 레이어를 얹어, 신뢰와 몰입을 만드는 ‘얼굴 있는 AI’로 업그레이드.", offer: "기존 챗봇 위에 아바타 레이어" },
      { code: "T3", title: "영상 콘텐츠 제작", desc: "숏폼·홍보영상·북트레일러·지역 소상공인 콘텐츠까지. 대량 제작도 일정 안에 소화합니다.", offer: "영상 콘텐츠 제작 서비스" },
      { code: "T4", title: "이미지 · 광고 소재", desc: "이커머스 상세페이지, 브랜드 화풍이 일관된 이미지, 광고 소재 대량 제작.", offer: "이미지 제작 서비스" },
    ],
    mainTrack: "MAIN TRACK",
    closing: { lead: "각 기능은 ", em: "개별 API·제작", tail: "으로도 도입할 수 있습니다. 아바타 없이 LLM·TTS·아바타 영상 등 필요한 것만 골라 쓰세요. (실시간 아바타는 도입 상담)" } as EmText,
  },
  labCta: {
    eyebrow: "직접 체험",
    freeBadge: "로그인 시 300 크레딧 무료",
    services: ["음성 (TTS)", "대화 (LLM)", "이미지 생성", "영상 생성", "아바타"],
    title: { lead: "음성·대화·이미지·영상·아바타, ", em: "지금 직접", tail: " 만들어 보세요." } as EmText,
    lede: "설명 대신 결과로 확인하세요. 마인드브이알 생성 스튜디오에 실시간 연결된 테스트 랩에서 5가지를 직접 만들어 볼 수 있습니다. 회원가입하면 300 크레딧을 무료로 드립니다.",
    creditUnit: "크레딧 / 회",
    ctaOpen: "테스트 랩 열기",
    ctaSignup: "회원가입 · 300 크레딧",
  },
  process: {
    title: "대본에서 완성 영상까지, 4단계.",
    steps: [
      { title: "캐릭터·대본 전달", body: "캐릭터 이미지(또는 기획안)와 말할 내용을 보내주세요. 사람·캐릭터·일러스트 모두 가능합니다." },
      { title: "한국어 음성 확정", body: "캐릭터에 어울리는 한국어 음색 시안을 여러 개 제시하고, 톤·속도·페르소나를 함께 확정합니다. 프리미엄 음성 옵션도 제공합니다." },
      { title: "스튜디오 제작", body: "확정된 음성에 맞춰 입모양과 표정을 정교하게 입힙니다. 장편·멀티 캐릭터·고화질 단편까지 용도에 맞게 제작합니다." },
      { title: "납품", body: "완성 영상을 납품합니다. 이후 물량 제작·업데이트는 단위 견적으로 진행합니다." },
    ],
  },
  pricing: {
    title: "월 구독 없이, 쓴 만큼만.",
    lede: "직접 제작하기 때문에 가능한 구조입니다. 무료 데모로 품질을 확인한 뒤, 원화 기준 물량·프로젝트 단위로만 비용이 발생합니다.",
    plans: [
      { name: "무료 데모", price: "₩0", unit: "", desc: "당신의 캐릭터로 한국어로 말하는 30초 영상 1컷. 품질을 직접 확인한 뒤 결정하세요.", features: ["캐릭터 1종 · 30초 1컷", "한국어 음성 시안 포함", "워터마크 포함 시안"], cta: "무료로 체험하기" },
      { name: "스타트업 플랜", price: "프로젝트 단위", unit: "견적", desc: "초기 팀을 위한 시작 부담 없는 플랜. 모두의창업 1차 통과 창업자에게는 전용 할인을 적용합니다.", features: ["전용 캐릭터 제작", "영상 단위·물량 단위 과금", "1차 통과 창업자 전용 할인"], cta: "견적 문의" },
      { name: "전용 · API", price: "별도 협의", unit: "", desc: "LLM·TTS·아바타 영상·실시간 아바타를 개별 API와 제작으로 — 아바타 없이 필요한 기능만 도입할 수 있습니다.", features: ["LLM · TTS · 아바타 영상 개별 제공", "실시간 아바타 도입 상담", "API · 서비스 연동"], cta: "도입 상담" },
    ],
    mailSubjectPrefix: "[마인드브이알] ",
  },
  trust: {
    title: "과장 대신, 번호로 말합니다.",
    stamps: [
      { label: "GOV R&D", title: "정부 R&D 과제 수행", detail: "RS-2026-25508342", body: "한국어 면접·상담 영상 인식 분야의 국가 연구 과제를 수행하며 기술력을 검증받았습니다." },
      { label: "PATENT", title: "특허 출원 2건", detail: "10-2026-0007692 · 10-2026-0007697", body: "AI 휴먼 관련 핵심 기술을 출원해 권리화를 진행하고 있습니다." },
      { label: "PRODUCT", title: "운영 중 제품 — 마인드프랩", detail: "AI 페르소나 면접 코칭", body: "이미 실사용자가 쓰는 제품을 직접 운영하며 다듬어 온 제작 역량으로 만듭니다." },
    ],
  },
  faq: {
    title: "자주 묻는 질문",
    items: [
      { q: "완성된 영상은 어디에 쓸 수 있나요?", a: "광고·SNS·홈페이지·앱 내 콘텐츠·IR 등 상업적 용도 전부 가능합니다. 용도 제한이나 추가 사용료가 없습니다." },
      { q: "실시간으로 대화하는 아바타도 가능한가요?", a: "현재 메인 상품은 고품질 영상 아바타입니다. 실시간 대화형 AI 휴먼(면접·문진·상담·튜터)은 정부 R&D 과제를 기반으로 준비하고 있습니다. 도입 계획이 있다면 미리 상담해 주세요." },
      { q: "아바타 없이 LLM·TTS 같은 기능만 따로 쓸 수 있나요?", a: "네. LLM(대화)·TTS(음성)·아바타 영상은 각각 개별 API와 제작 형태로 제공합니다. 아바타 없이 필요한 기능만 — 예를 들어 음성 합성만, 또는 대화 엔진만 — 도입할 수 있습니다. 실시간 아바타는 별도 도입 상담으로 진행합니다." },
      { q: "사람 사진이 아니라 캐릭터·일러스트도 되나요?", a: "가능합니다. 실사 인물, 2D/3D 캐릭터, 일러스트 모두 아바타화할 수 있으며, 멀티 캐릭터 대화 장면도 제작합니다." },
      { q: "모두의창업 1차 통과 창업자 혜택은 무엇인가요?", a: "같은 프로그램을 통과한 동료 창업자에게 스타트업 플랜 전용 할인을 제공합니다." },
    ],
  },
  footer: {
    tagline: "마인드브이알 — 한국어 특화 AI 아바타 스튜디오",
    phoneLabel: "대표전화",
    bizInfo: "사업자 정보",
    company: "상호",
    ceo: "대표자",
    bizNo: "사업자등록번호",
    address: "사업장 소재지",
    hq: "본사",
    rights: "All rights reserved.",
    companyName: "주식회사 마인드브이알",
    ceoName: "이대엽",
    addressValue: "서울특별시 중구 칠패로 36 3층 (연세대학교 봉래빌딩)",
    hqValue: "충청남도 천안시 서북구 천안천4길 32",
  },
  brand: {
    eyebrow: "브랜드 소개",
    title: { lead: "한국어로 말하는 ", em: "AI 휴먼", tail: "을 만듭니다." },
    lede: "마인드브이알(MindVR)은 한국어에 특화된 AI 아바타 스튜디오입니다. 사람처럼 자연스럽게 한국어로 말하는 디지털휴먼을, 자체 제작 역량으로 합리적 비용에 만듭니다.",
    whoTitle: "해외 서비스의 한계를 넘습니다.",
    whoParagraphs: [
      "해외 AI 아바타 서비스는 어색한 한국어, 달러 구독의 부담, 천편일률적인 템플릿이라는 한계를 안고 있습니다. 마인드브이알은 한국어 환경에 맞는 AI 휴먼을 직접 만들어 이 세 가지를 모두 해결합니다.",
      "정해진 아바타 중에서 고르는 방식이 아니라, 당신의 캐릭터·브랜드·페르소나에 맞는 전용 디지털휴먼을 제작합니다. 음성·영상·이미지까지 한 곳에서 완성합니다.",
    ],
    doTitle: "우리가 만드는 것.",
    doLede: "음성·이미지·영상·음악·LLM까지, AI 휴먼 제작에 필요한 생성 기술을 직접 만들고 API로 제공합니다.",
    doings: [
      { tag: "AI HUMAN", title: "AI 아바타 · 디지털휴먼", body: "캐릭터·브랜드·페르소나에 맞는 전용 디지털휴먼을 설계하고 제작합니다." },
      { tag: "VOICE", title: "한국어 음성(TTS)", body: "한국어의 입모양·억양·호흡에 맞춰 자연스럽게 말하는 음성을 만듭니다." },
      { tag: "IMAGE", title: "이미지 생성", body: "인물·제품·콘셉트 이미지를 생성합니다. API로도 제공합니다." },
      { tag: "VIDEO", title: "영상 생성", body: "아바타 영상은 물론 홍보·콘텐츠 영상까지 제작합니다." },
      { tag: "MUSIC", title: "음악 생성", body: "분위기·장르에 맞는 배경 음악을 생성합니다. API로도 제공합니다." },
      { tag: "LLM", title: "대화형 LLM", body: "한국어 대화·생성을 처리하는 언어모델을 API로 제공합니다." },
    ],
    productsTitle: "이미 운영 중인 서비스들.",
    productsLede: "아바타·AI를 활용한 상담·훈련 서비스를 직접 운영해 왔습니다. 한국어 사용자와 AI 휴먼을 다뤄 온 경험이 AI 아바타 스튜디오의 바탕입니다.",
    operating: "운영 중",
    goto: "바로가기 →",
    products: [
      { tag: "MAV", name: "메타버스 상담 MAV", body: "아바타 기반 익명 심리상담 플랫폼. AI 감정 분석으로 청소년 상담 현장에서 운영되고 있습니다." },
      { tag: "MINDPREP", name: "AI 면접훈련 마인드프랩", body: "AI 아바타 면접관과의 모의 면접으로 면접 불안을 줄이고, 표정·음성·답변 분석 리포트를 제공합니다." },
      { tag: "VR MEDITATION", name: "마음챙김 VR 명상", body: "자연 환경의 몰입형 VR로 명상과 이완을 훈련하는 프로그램입니다." },
    ],
    prepNote: "준비 중 — 프레젠테이션 훈련 · 사회불안 훈련.",
    officialSite: "마인드브이알 공식 사이트 →",
    whyTitle: "검증된 기술력으로 만듭니다.",
    facts: [
      { label: "GOV R&D", value: "정부 R&D 과제 수행" },
      { label: "PATENT", value: "특허 출원 2건" },
      { label: "OPERATION", value: "상담·훈련 서비스 운영" },
    ],
    ctaTitle: "직접 만들어 보세요.",
    ctaLede: "테스트 랩에서 음성·대화·이미지·영상·아바타를 바로 만들어 볼 수 있습니다. 회원가입하면 300 크레딧을 무료로 드립니다.",
    ctaButton: "테스트 랩 열기",
  },
};

export type Dict = typeof ko;

const en: Dict = {
  meta: {
    homeTitle: "MindVR — Korean-specialized AI avatar studio",
    homeDescription: "Your own AI human that speaks natural Korean, at a fair price. Build one yourself in the Test Lab.",
    brandTitle: "About — MindVR",
    brandDescription: "MindVR is a Korean-specialized AI avatar studio. We build digital humans that speak Korean as naturally as a person, with our own production capability.",
    ogLocale: "en_US",
  },
  nav: {
    brandTag: "AI Human Studio",
    items: {
      brand: "About",
      why: "Why MindVR",
      usecases: "Use Cases",
      demos: "Demos",
      pricing: "Pricing",
      lab: "Test Lab",
    },
    login: "Log in",
    signup: "Sign up",
  },
  account: {
    unlimited: "Unlimited",
    unlimitedUse: "Unlimited use",
    creditsSuffix: "credits",
    lab: "Test Lab",
    account: "My account · History",
    admin: "Admin",
    logout: "Log out",
  },
  hero: {
    eyebrow: "MINDVR — KOREAN AI HUMAN STUDIO",
    title: { lead: "Your own AI human, ", em: "speaking natural Korean", tail: "." },
    lede:
      "Not a template avatar. We build a digital human dedicated to your character, brand, or persona — natural down to Korean lip-sync and intonation.",
    ctaPrimary: "Try it free",
    ctaSecondary: "See how it works",
  },
  heroStage: {
    soundOn: "SOUND ON",
    soundOff: "SOUND OFF",
    alt: "An AI human presenter created by MindVR",
  },
  twoTypes: {
    eyebrowEm: "TWO",
    eyebrowRest: "AI HUMANS",
    heading: { lead: "Two kinds of ", em: "AI humans", tail: " from MINDVR." },
    cta: "Learn more",
    realtime: {
      title: "Real-time interactive AI human",
      body: "An AI staffer you talk to. A two-way, voice-driven conversation for customer-service demos, mock interviews, and training practice.",
    },
    content: {
      title: "AI marketing content",
      body: "Videos that speak your script. A photoreal AI human makes your social, YouTube, product, and ad videos — no crew or equipment needed.",
    },
  },
  realtime: {
    title: { lead: "Real-time interactive AI human — ", em: "the AI staffer", tail: " you talk to." },
    lede:
      "A two-way conversational AI human you talk to by voice. Use it for customer-service demos, mock interviews, and training or presentation practice. It hears what you say (STT), understands the context and forms a reply (LLM), and responds in a natural voice (TTS) — all in real time. Optimized for Korean speech and expressions so it feels natural, it reads your reactions and responds with matching expressions and tone. Not just a chatbot, but an interactive solution with a photoreal avatar.",
    liveTag: "LIVE · loops in real time, without interruption",
    pipeline: [
      { tag: "STT", title: "Listen", body: "Hears what the user says in real time." },
      { tag: "LLM", title: "Understand & generate", body: "Understands context and forms a reply." },
      { tag: "TTS", title: "Speak", body: "Replies in a natural voice." },
    ],
    highlights: ["Real-time STT·LLM·TTS", "Tuned for Korean speech & expression", "Reads & responds to reactions", "Photoreal interactive avatar"],
    useCasesLabel: "Examples",
    useCases: ["Customer-service role-play", "Recruitment mock interviews", "Staff training & presentation rehearsal", "Service consultation demos"],
  },
  gallery: {
    title: "AI marketing content, made without a crew",
    lede:
      "A photoreal AI human makes videos that speak your script. Create social, blog, and YouTube promos, product intros, and brand messages with no crew or equipment. Just enter a script and the talking AI-human video is done. No outsourcing, no reshoots — make content fast, whenever you need it.",
    hoverPlay: "HOVER · play",
    aiGenerated: "AI GENERATED",
    personas: { counselor: "Counselor", interviewer: "Interviewer", influencer: "Influencer", twin: "Digital Twin" },
    useCasesLabel: "Examples",
    useCases: ["YouTube channels", "Instagram & social shorts", "Blog videos", "Product & ad videos", "Brand intros"],
  },
  problem: {
    title: { lead: "To adopt a digital human today,", em: "", tail: "you give up one of three things." },
    items: [
      { index: "01", title: "Too expensive", body: "Overseas avatar services default to USD subscriptions. Costs swing with exchange rates and climb steeply as volume grows." },
      { index: "02", title: "Sounds non-native", body: "English-first services produce awkward Korean lip-sync and prosody. Viewers notice within three seconds." },
      { index: "03", title: "Just a template", body: "Picking from preset avatars can't fully capture your character or brand." },
    ],
    closing: { lead: "MindVR gives up none of the three. We answer with ", em: "in-house production and dedicated builds", tail: " optimized for Korean." },
  },
  values: {
    title: { lead: "An AI human that speaks natural Korean, ", em: "at a fair price", tail: "." },
    items: [
      { tag: "KOREAN-NATIVE", title: "Natural Korean", body: "None of the awkwardness of English translated and dubbed over. We build to Korean lip-shapes, intonation, and breathing — and rather than claim it's “natural,” we show you in a free demo." },
      { tag: "CUSTOM, NOT TEMPLATE", title: "Dedicated, not template", body: "We design a digital human dedicated to your character, brand, or persona." },
      { tag: "FULL-STACK", title: "Full-stack, one stop", body: "Avatar + Korean voice (TTS) + lip-sync + video + images, all in one place. No stitching tools together — receive the finished work." },
      { tag: "FAIR PRICING", title: "Fair cost structure", body: "Because we build it ourselves, there's no markup. No USD subscription — you pay only per volume or project in KRW, and we run a startup plan for early teams." },
    ],
  },
  segments: {
    title: { lead: "Depending on what you're building,", em: "", tail: "take only the layers you need." },
    lede: "Four adoption tracks designed from a direct analysis of thousands of founders' ideas. Tell us where your product fits and we'll build the demo in that shape.",
    tracks: [
      { code: "T1", title: "Human-like avatar · digital human", desc: "Digital-twin check-in calls, virtual IP & K-POP, AI persona interviewers, intake & care avatars, virtual try-on — services where a human face is the product.", offer: "Avatar + TTS + lip-sync + video, full stack" },
      { code: "T2", title: "Give your conversational AI a face", desc: "Add an avatar layer to a text or voice chatbot to upgrade it into an “AI with a face” that builds trust and immersion.", offer: "Avatar layer over your chatbot" },
      { code: "T3", title: "Video content production", desc: "Shorts, promos, book trailers, local-business content. We handle high-volume production on schedule.", offer: "Video content production" },
      { code: "T4", title: "Images · ad creative", desc: "E-commerce detail pages, images with consistent brand style, high-volume ad creative.", offer: "Image production service" },
    ],
    mainTrack: "MAIN TRACK",
    closing: { lead: "Each capability can also be adopted as a ", em: "standalone API or build", tail: ". Pick only what you need — LLM, TTS, avatar video — without the avatar. (Real-time avatar by consultation.)" },
  },
  labCta: {
    eyebrow: "Try it yourself",
    freeBadge: "300 free credits when you sign in",
    services: ["Voice (TTS)", "Chat (LLM)", "Image", "Video", "Avatar"],
    title: { lead: "Voice, chat, image, video, avatar — ", em: "build them yourself", tail: ", right now." },
    lede: "See results, not explanations. The Test Lab is wired live to MindVR's generation studio, so you can build all five yourself. Sign up and get 300 credits free.",
    creditUnit: "credits / run",
    ctaOpen: "Open the Test Lab",
    ctaSignup: "Sign up · 300 credits",
  },
  process: {
    title: "From script to finished video, in four steps.",
    steps: [
      { title: "Send character & script", body: "Send the character image (or a brief) and what it should say. People, characters, and illustrations all work." },
      { title: "Lock the Korean voice", body: "We propose several Korean voice samples that suit the character and lock the tone, pace, and persona with you. Premium voice options are available." },
      { title: "Studio production", body: "We carefully apply lip-sync and expressions to the locked voice — from long-form to multi-character to high-res shorts, made to fit your use." },
      { title: "Delivery", body: "We deliver the finished video. Further volume production and updates proceed by per-unit quote." },
    ],
  },
  pricing: {
    title: "No monthly subscription — pay only for what you use.",
    lede: "A structure made possible because we produce it ourselves. Check quality with a free demo, then pay only per volume or project, in KRW.",
    plans: [
      { name: "Free demo", price: "₩0", unit: "", desc: "One 30-second clip of your character speaking Korean. Check the quality before you decide.", features: ["1 character · one 30-sec clip", "Korean voice sample included", "Watermarked sample"], cta: "Try it free" },
      { name: "Startup plan", price: "Per project", unit: "quote", desc: "A low-barrier plan for early teams. Founders who passed the first round of the Modu Startup program get a dedicated discount.", features: ["Dedicated character production", "Billed per video or per volume", "Discount for first-round founders"], cta: "Request a quote" },
      { name: "Dedicated · API", price: "By arrangement", unit: "", desc: "LLM, TTS, avatar video, and real-time avatar as standalone APIs and builds — adopt only what you need, without the avatar.", features: ["LLM · TTS · avatar video, à la carte", "Real-time avatar by consultation", "API · service integration"], cta: "Talk to us" },
    ],
    mailSubjectPrefix: "[MindVR] ",
  },
  trust: {
    title: "Numbers instead of hype.",
    stamps: [
      { label: "GOV R&D", title: "Government R&D project", detail: "RS-2026-25508342", body: "We've validated our technology by carrying out a national research project in Korean interview & counseling video recognition." },
      { label: "PATENT", title: "Two patents filed", detail: "10-2026-0007692 · 10-2026-0007697", body: "We've filed core AI-human technologies and are securing the rights." },
      { label: "PRODUCT", title: "Live product — MindPrep", detail: "AI persona interview coaching", body: "Built with production know-how refined by operating a product that real users already use." },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      { q: "Where can I use the finished video?", a: "All commercial uses — ads, social, websites, in-app content, IR, and more. No usage restrictions or extra fees." },
      { q: "Can the avatar converse in real time?", a: "Our main product today is high-quality video avatars. A real-time conversational AI human (interviews, intake, counseling, tutoring) is in preparation, built on a government R&D project. If you're planning to adopt one, talk to us early." },
      { q: "Can I use just LLM or TTS without the avatar?", a: "Yes. LLM (chat), TTS (voice), and avatar video are each offered as standalone APIs and builds. Adopt only what you need — voice synthesis alone, or the chat engine alone. Real-time avatar proceeds by separate consultation." },
      { q: "Do characters or illustrations work, not just photos of people?", a: "Yes. Photoreal people, 2D/3D characters, and illustrations can all be turned into avatars, and we produce multi-character dialogue scenes too." },
      { q: "What's the benefit for first-round Modu Startup founders?", a: "We offer a dedicated startup-plan discount to fellow founders who passed the same program." },
    ],
  },
  footer: {
    tagline: "MindVR — a Korean-specialized AI avatar studio",
    phoneLabel: "Phone",
    bizInfo: "Business information",
    company: "Company",
    ceo: "CEO",
    bizNo: "Business reg. no.",
    address: "Address",
    hq: "Head office",
    rights: "All rights reserved.",
    companyName: "MindVR Inc.",
    ceoName: "Daeyeop Lee",
    addressValue: "3F, 36 Chilpae-ro, Jung-gu, Seoul (Yonsei Bongnae Bldg.)",
    hqValue: "32 Cheonancheon 4-gil, Seobuk-gu, Cheonan, Chungcheongnam-do",
  },
  brand: {
    eyebrow: "About",
    title: { lead: "We build ", em: "AI humans", tail: " that speak Korean." },
    lede: "MindVR is a Korean-specialized AI avatar studio. With our own production capability, we build digital humans that speak Korean as naturally as a person — at a fair price.",
    whoTitle: "Beyond the limits of overseas services.",
    whoParagraphs: [
      "Overseas AI avatar services come with awkward Korean, the burden of USD subscriptions, and one-size-fits-all templates. MindVR builds AI humans suited to a Korean context and solves all three.",
      "Rather than picking from preset avatars, we produce a digital human dedicated to your character, brand, or persona — finishing voice, video, and images all in one place.",
    ],
    doTitle: "What we make.",
    doLede: "Voice, image, video, music, and LLM — we build the generative technology that AI-human production needs, and offer it as APIs.",
    doings: [
      { tag: "AI HUMAN", title: "AI avatar · digital human", body: "We design and build a digital human dedicated to your character, brand, or persona." },
      { tag: "VOICE", title: "Korean voice (TTS)", body: "We make voices that speak naturally, matched to Korean lip-shapes, intonation, and breathing." },
      { tag: "IMAGE", title: "Image generation", body: "We generate people, product, and concept images. Also offered as an API." },
      { tag: "VIDEO", title: "Video generation", body: "We produce avatar videos as well as promo and content videos." },
      { tag: "MUSIC", title: "Music generation", body: "We generate background music to fit the mood and genre. Also offered as an API." },
      { tag: "LLM", title: "Conversational LLM", body: "We provide a language model for Korean conversation and generation, via API." },
    ],
    productsTitle: "Products already in operation.",
    productsLede: "We've operated avatar- and AI-based counseling and training services ourselves. Our experience with Korean users and AI humans is the foundation of this studio.",
    operating: "LIVE",
    goto: "Visit →",
    products: [
      { tag: "MAV", name: "Metaverse counseling MAV", body: "An avatar-based anonymous psychological counseling platform, operating in youth-counseling settings with AI emotion analysis." },
      { tag: "MINDPREP", name: "MindPrep AI interview training", body: "Mock interviews with an AI avatar interviewer reduce interview anxiety and provide reports analyzing expression, voice, and answers." },
      { tag: "VR MEDITATION", name: "Mindfulness VR meditation", body: "A program for training meditation and relaxation through immersive VR of natural environments." },
    ],
    prepNote: "In preparation — presentation training · social-anxiety training.",
    officialSite: "MindVR official site →",
    whyTitle: "Built on proven technology.",
    facts: [
      { label: "GOV R&D", value: "Government R&D project" },
      { label: "PATENT", value: "Two patents filed" },
      { label: "OPERATION", value: "Counseling & training services" },
    ],
    ctaTitle: "Build it yourself.",
    ctaLede: "In the Test Lab you can make voice, chat, image, video, and avatar right away. Sign up and get 300 credits free.",
    ctaButton: "Open the Test Lab",
  },
};

const zh: Dict = {
  meta: {
    homeTitle: "MindVR — 专注韩语的 AI 虚拟形象工作室",
    homeDescription: "会自然说韩语的、专属你的 AI 数字人，价格合理。在体验实验室亲自制作。",
    brandTitle: "品牌介绍 — MindVR",
    brandDescription: "MindVR是专注韩语的 AI 虚拟形象工作室。以自研制作能力，打造像真人一样自然说韩语的数字人。",
    ogLocale: "zh_CN",
  },
  nav: {
    brandTag: "AI 数字人工作室",
    items: {
      brand: "品牌介绍",
      why: "为何选择",
      usecases: "应用场景",
      demos: "演示",
      pricing: "价格",
      lab: "体验实验室",
    },
    login: "登录",
    signup: "注册",
  },
  account: {
    unlimited: "无限",
    unlimitedUse: "无限使用",
    creditsSuffix: "积分",
    lab: "体验实验室",
    account: "我的账户 · 使用记录",
    admin: "管理员",
    logout: "退出登录",
  },
  hero: {
    eyebrow: "MINDVR — KOREAN AI HUMAN STUDIO",
    title: { lead: "专属你的 AI 数字人，", em: "用韩语自然地", tail: "说话。" },
    lede:
      "不是模板化的虚拟形象。我们为你的角色、品牌或人设打造专属数字人，连韩语口型与语调都自然到位。",
    ctaPrimary: "免费体验",
    ctaSecondary: "查看制作流程",
  },
  heroStage: {
    soundOn: "开启声音",
    soundOff: "关闭声音",
    alt: "MindVR 制作的 AI 数字人主持",
  },
  twoTypes: {
    eyebrowEm: "TWO",
    eyebrowRest: "AI HUMANS",
    heading: { lead: "MINDVR 提供的", em: "两种 AI 数字人", tail: "。" },
    cta: "了解更多",
    realtime: {
      title: "实时互动 AI 数字人",
      body: "能对话的 AI 员工。以语音双向对话，适用于客服演示、模拟面试与培训演练。",
    },
    content: {
      title: "AI 营销内容",
      body: "会念稿的视频。写实级 AI 数字人无需拍摄团队和设备，为你制作社媒、YouTube、产品介绍与广告视频。",
    },
  },
  realtime: {
    title: { lead: "实时互动 AI 数字人 — ", em: "能对话的", tail: " AI 员工。" },
    lede:
      "这是一位用语音双向对话的 AI 数字人。可用于客服演示、模拟面试，以及培训与演讲练习。它听懂你的话（STT），理解语境并生成回答（LLM），再用自然的声音回应（TTS），全程实时衔接。针对韩国人的发音与表情优化，几乎不生硬，并能识别你的反应，用表情与态度作出回应。它不只是聊天机器人，而是有写实级数字人陪伴的互动解决方案。",
    liveTag: "LIVE · 实时不间断循环",
    pipeline: [
      { tag: "STT", title: "聆听", body: "实时听懂用户说的话。" },
      { tag: "LLM", title: "理解·生成", body: "理解语境并生成回答。" },
      { tag: "TTS", title: "说话", body: "用自然的声音回应。" },
    ],
    highlights: ["STT·LLM·TTS 实时衔接", "针对韩语发音·表情优化", "识别并回应用户反应", "写实级互动数字人"],
    useCasesLabel: "应用示例",
    useCases: ["客服情景演练", "招聘模拟面试", "员工培训与演讲彩排", "服务咨询演示"],
  },
  gallery: {
    title: "无需团队即可制作的 AI 营销内容",
    lede:
      "写实级 AI 数字人为你制作会念稿的视频。无需拍摄团队和设备，即可制作社媒、博客、YouTube 宣传视频、产品介绍与品牌信息。只需输入文案，会说话的 AI 数字人视频即可完成。无需外包、无需反复拍摄，随时快速产出内容。",
    hoverPlay: "悬停 · 播放",
    aiGenerated: "AI 生成",
    personas: { counselor: "咨询师", interviewer: "面试官", influencer: "网红", twin: "数字分身" },
    useCasesLabel: "应用示例",
    useCases: ["YouTube 频道运营", "Instagram · 社媒短视频", "博客视频", "产品介绍 · 广告视频", "品牌介绍"],
  },
  problem: {
    title: { lead: "如今要引入数字人，", em: "", tail: "三者之中必须放弃其一。" },
    items: [
      { index: "01", title: "要么很贵", body: "海外虚拟形象服务普遍按美元订阅。费用随汇率波动，用量越大涨得越陡。" },
      { index: "02", title: "要么像外语", body: "以英语为主打造的服务，韩语口型与韵律生硬，观众三秒就能察觉。" },
      { index: "03", title: "要么是模板", body: "从既定形象中挑选的方式，无法完整承载你的角色与品牌。" },
    ],
    closing: { lead: "MindVR 三者都不放弃。我们以针对韩语优化的", em: "自研制作能力与专属定制", tail: "来回应。" },
  },
  values: {
    title: { lead: "会自然说韩语的 AI 数字人，", em: "价格合理", tail: "。" },
    items: [
      { tag: "KOREAN-NATIVE", title: "韩语自然地道", body: "没有把英语翻译配音那种生硬感。我们按韩语的口型、语调与气息来制作，与其口头说“自然”，不如用免费演示直接展示给你看。" },
      { tag: "CUSTOM, NOT TEMPLATE", title: "专属定制，而非模板", body: "我们为你的角色、品牌或人设量身设计数字人。" },
      { tag: "FULL-STACK", title: "全栈一站式", body: "数字人 + 韩语语音（TTS）+ 口型同步 + 视频 + 图像，都在一处完成。无需拼接多种工具，直接拿到成品。" },
      { tag: "FAIR PRICING", title: "合理的费用结构", body: "因为自己制作，所以没有水分。无需美元订阅，仅按韩元的用量或项目计费，并为初创团队提供创业方案。" },
    ],
  },
  segments: {
    title: { lead: "依据你正在打造的产品，", em: "", tail: "只取你需要的那一层。" },
    lede: "这是直接分析数千位创业者的想法后设计的四条应用路线。看清你的产品属于哪一类，我们就照那个样子做演示。",
    tracks: [
      { code: "T1", title: "拟人形象 · 数字人", desc: "数字分身问候来电、虚拟 IP 与 K-POP、AI 人设面试官、问诊与咨询关怀形象、虚拟试衣——以人脸为产品的服务。", offer: "数字人 + TTS + 口型同步 + 视频全栈" },
      { code: "T2", title: "为对话式 AI 赋予面孔", desc: "在以文本或语音聊天机器人起步的服务上叠加形象层，升级为带来信任与沉浸感的“有面孔的 AI”。", offer: "在现有聊天机器人之上叠加形象层" },
      { code: "T3", title: "视频内容制作", desc: "短视频、宣传片、书籍预告，乃至本地小微商户内容。大批量制作也能按期完成。", offer: "视频内容制作服务" },
      { code: "T4", title: "图像 · 广告素材", desc: "电商详情页、画风一致的品牌图像、大批量广告素材制作。", offer: "图像制作服务" },
    ],
    mainTrack: "MAIN TRACK",
    closing: { lead: "每项功能也可作为", em: "独立 API 或定制", tail: "引入。无需数字人，只挑你需要的——如 LLM、TTS、数字人视频。（实时数字人请咨询引入。）" },
  },
  labCta: {
    eyebrow: "亲自体验",
    freeBadge: "登录即送 300 积分",
    services: ["语音 (TTS)", "对话 (LLM)", "图像生成", "视频生成", "数字人"],
    title: { lead: "语音·对话·图像·视频·数字人，", em: "现在就亲自", tail: "做做看。" },
    lede: "用结果说话，而非解释。体验实验室与MindVR 生成工作室实时连接，五项功能都能亲手制作。注册即免费获得 300 积分。",
    creditUnit: "积分 / 次",
    ctaOpen: "打开体验实验室",
    ctaSignup: "注册 · 300 积分",
  },
  process: {
    title: "从文案到成片，四步完成。",
    steps: [
      { title: "提供角色与文案", body: "请发来角色图（或策划案）和要说的内容。真人、角色、插画皆可。" },
      { title: "确定韩语语音", body: "我们提供多个契合角色的韩语音色样稿，与你一起确定音调、语速与人设。也提供高级语音选项。" },
      { title: "工作室制作", body: "依据已确定的语音，精细地配上口型与表情。从长片、多角色到高清短片，按用途制作。" },
      { title: "交付", body: "交付成片。后续的批量制作与更新按单计价进行。" },
    ],
  },
  pricing: {
    title: "无需月度订阅，用多少付多少。",
    lede: "因为自己制作才得以实现的结构。先用免费演示确认品质，之后仅按韩元的用量或项目计费。",
    plans: [
      { name: "免费演示", price: "₩0", unit: "", desc: "用你的角色制作一段 30 秒的韩语口播视频。亲自确认品质后再决定。", features: ["1 个角色 · 30 秒 1 条", "含韩语语音样稿", "含水印样片"], cta: "免费体验" },
      { name: "创业方案", price: "按项目", unit: "报价", desc: "为初创团队准备的低门槛方案。通过 Modu 创业初选的创业者享专属折扣。", features: ["专属角色制作", "按视频或用量计费", "初选通过创业者专属折扣"], cta: "咨询报价" },
      { name: "专属 · API", price: "另行商议", unit: "", desc: "将 LLM、TTS、数字人视频与实时数字人作为独立 API 与定制提供——无需数字人，只引入你需要的功能。", features: ["LLM · TTS · 数字人视频单独提供", "实时数字人引入咨询", "API · 服务对接"], cta: "引入咨询" },
    ],
    mailSubjectPrefix: "[MindVR] ",
  },
  trust: {
    title: "不夸张，用数字说话。",
    stamps: [
      { label: "GOV R&D", title: "承担政府 R&D 课题", detail: "RS-2026-25508342", body: "承担韩语面试·咨询视频识别领域的国家研究课题，技术实力获得验证。" },
      { label: "PATENT", title: "已申请 2 项专利", detail: "10-2026-0007692 · 10-2026-0007697", body: "已申请 AI 数字人相关核心技术，正推进权利化。" },
      { label: "PRODUCT", title: "在运营产品 — MindPrep", detail: "AI 人设面试辅导", body: "以亲自运营、面向真实用户打磨而来的制作能力来制作。" },
    ],
  },
  faq: {
    title: "常见问题",
    items: [
      { q: "成片可以用在哪些地方？", a: "广告、社媒、官网、应用内内容、IR 等商业用途全部可用。没有用途限制或额外使用费。" },
      { q: "也能做实时对话的数字人吗？", a: "目前主打产品是高品质视频数字人。实时对话式 AI 数字人（面试、问诊、咨询、辅导）正基于政府 R&D 课题筹备中。若有引入计划，请提前咨询。" },
      { q: "可以不要数字人，只单独用 LLM、TTS 等功能吗？", a: "可以。LLM（对话）、TTS（语音）、数字人视频均以独立 API 与定制形式提供。无需数字人，只引入你需要的——例如仅语音合成，或仅对话引擎。实时数字人通过另行咨询进行。" },
      { q: "不是真人照片，角色或插画也可以吗？", a: "可以。真人、2D/3D 角色、插画都能做成数字人，也能制作多角色对话场景。" },
      { q: "通过 Modu 创业初选的创业者有什么优惠？", a: "向通过同一项目的同行创业者提供创业方案专属折扣。" },
    ],
  },
  footer: {
    tagline: "MindVR — 专注韩语的 AI 虚拟形象工作室",
    phoneLabel: "客服电话",
    bizInfo: "企业信息",
    company: "公司名称",
    ceo: "法人代表",
    bizNo: "营业执照号",
    address: "营业地址",
    hq: "总部",
    rights: "All rights reserved.",
    companyName: "MindVR 株式会社",
    ceoName: "李大烨",
    addressValue: "首尔特别市中区七牌路 36 号 3 层（延世大学蓬莱大厦）",
    hqValue: "忠清南道天安市西北区天安川 4 街 32",
  },
  brand: {
    eyebrow: "品牌介绍",
    title: { lead: "我们打造", em: "会说韩语", tail: "的 AI 数字人。" },
    lede: "MindVR是专注韩语的 AI 虚拟形象工作室。我们以自研制作能力，打造像真人一样自然说韩语的数字人，价格合理。",
    whoTitle: "超越海外服务的局限。",
    whoParagraphs: [
      "海外 AI 虚拟形象服务存在韩语生硬、美元订阅负担、千篇一律模板等局限。MindVR 亲自打造契合韩语环境的 AI 数字人，三者一并解决。",
      "不是从既定形象中挑选，而是为你的角色、品牌或人设量身制作专属数字人。语音、视频、图像都在一处完成。",
    ],
    doTitle: "我们所做的。",
    doLede: "从语音、图像、视频、音乐到 LLM，我们自研 AI 数字人制作所需的生成技术，并以 API 提供。",
    doings: [
      { tag: "AI HUMAN", title: "AI 虚拟形象 · 数字人", body: "为契合角色、品牌、人设的专属数字人进行设计与制作。" },
      { tag: "VOICE", title: "韩语语音（TTS）", body: "按韩语的口型、语调与气息，制作自然说话的语音。" },
      { tag: "IMAGE", title: "图像生成", body: "生成人物、产品、概念图像。也以 API 提供。" },
      { tag: "VIDEO", title: "视频生成", body: "不仅制作数字人视频，也制作宣传与内容视频。" },
      { tag: "MUSIC", title: "音乐生成", body: "生成契合氛围与风格的背景音乐。也以 API 提供。" },
      { tag: "LLM", title: "对话式 LLM", body: "以 API 提供处理韩语对话与生成的语言模型。" },
    ],
    productsTitle: "已在运营的服务。",
    productsLede: "我们亲自运营基于虚拟形象与 AI 的咨询、训练服务。与韩语用户和 AI 数字人打交道的经验，是这个工作室的根基。",
    operating: "运营中",
    goto: "前往 →",
    products: [
      { tag: "MAV", name: "元宇宙咨询 MAV", body: "基于虚拟形象的匿名心理咨询平台，借助 AI 情绪分析，已在青少年咨询现场运营。" },
      { tag: "MINDPREP", name: "AI 面试训练 MindPrep", body: "通过与 AI 虚拟面试官的模拟面试缓解面试焦虑，并提供表情、语音、回答分析报告。" },
      { tag: "VR MEDITATION", name: "正念 VR 冥想", body: "以自然环境的沉浸式 VR 训练冥想与放松的项目。" },
    ],
    prepNote: "筹备中 — 演讲训练 · 社交焦虑训练。",
    officialSite: "MindVR 官方网站 →",
    whyTitle: "以经过验证的技术实力打造。",
    facts: [
      { label: "GOV R&D", value: "承担政府 R&D 课题" },
      { label: "PATENT", value: "已申请 2 项专利" },
      { label: "OPERATION", value: "运营咨询·训练服务" },
    ],
    ctaTitle: "亲自做做看。",
    ctaLede: "在体验实验室可立即制作语音、对话、图像、视频与数字人。注册即免费获得 300 积分。",
    ctaButton: "打开体验实验室",
  },
};

export const dictionaries: Record<Locale, Dict> = { ko, en, zh };
