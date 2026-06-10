import Reveal from "./reveal";

// 모두의창업 1차 통과 창업자 4-Tier 조사 결과를 거울처럼 반영한 유스케이스.
const segments = [
  {
    code: "T1",
    title: "사람형 아바타 · 디지털휴먼",
    desc: "디지털트윈 안부전화, 버추얼 IP·K-POP, AI 페르소나 면접관, 문진·상담 케어 아바타, 가상 피팅까지 — 사람의 얼굴이 제품인 서비스.",
    offer: "아바타 + TTS + 립싱크 + 영상 풀스택",
    main: true,
  },
  {
    code: "T2",
    title: "대화형 AI에 얼굴 입히기",
    desc: "텍스트·음성 챗봇으로 시작한 서비스에 아바타 레이어를 얹어, 신뢰와 몰입을 만드는 ‘얼굴 있는 AI’로 업그레이드.",
    offer: "기존 대화 엔진 위에 아바타 레이어",
    main: false,
  },
  {
    code: "T3",
    title: "영상 콘텐츠 생성",
    desc: "숏폼·홍보영상·북트레일러·지역 소상공인 콘텐츠. 자체 B200 배치 렌더로 물량을 감당합니다.",
    offer: "B200 영상 생성 부가 서비스",
    main: false,
  },
  {
    code: "T4",
    title: "이미지 · 광고 소재",
    desc: "이커머스 상세페이지, 브랜드 화풍이 일관된 이미지, URL 기반 광고 소재 대량 생산.",
    offer: "B200 이미지 생성 부가 서비스",
    main: false,
  },
];

export default function Segments() {
  return (
    <section id="usecases" className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">USE CASES</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
          만들고 있는 제품에 따라,
          <br />
          필요한 레이어만 가져가세요.
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-paper-dim">
          창업자 수천 명의 아이디어를 직접 분석해 설계한 네 가지 적용 트랙입니다.
          당신의 제품이 어디에 해당하는지 보이면, 데모도 그 모습으로 만들어 드립니다.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        {segments.map((s, i) => (
          <Reveal key={s.code} delay={(i % 2) * 100}>
            <div
              className={`h-full rounded-lg border p-8 ${
                s.main
                  ? "border-lime/50 bg-ink-soft"
                  : "border-ink-line bg-ink-soft/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs tracking-[0.2em] text-paper-faint">
                  TRACK {s.code}
                </p>
                {s.main && (
                  <span className="rounded-sm border border-lime/40 px-2 py-0.5 font-mono text-[10px] tracking-widest text-lime">
                    MAIN
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-paper-dim">{s.desc}</p>
              <p className="mt-5 border-t border-ink-line pt-4 font-mono text-xs tracking-wider text-paper-faint">
                제공 — {s.offer}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
