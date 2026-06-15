import Reveal from "./reveal";
import SectionHeader from "./section-header";

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
    offer: "기존 챗봇 위에 아바타 레이어",
    main: false,
  },
  {
    code: "T3",
    title: "영상 콘텐츠 제작",
    desc: "숏폼·홍보영상·북트레일러·지역 소상공인 콘텐츠까지. 대량 제작도 일정 안에 소화합니다.",
    offer: "영상 콘텐츠 제작 서비스",
    main: false,
  },
  {
    code: "T4",
    title: "이미지 · 광고 소재",
    desc: "이커머스 상세페이지, 브랜드 화풍이 일관된 이미지, 광고 소재 대량 제작.",
    offer: "이미지 제작 서비스",
    main: false,
  },
];

export default function Segments() {
  return (
    <section id="usecases" className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <SectionHeader
        index="04"
        label="USE CASES"
        title={
          <>
            만들고 있는 제품에 따라,
            <br />
            필요한 레이어만 가져가세요.
          </>
        }
        lede="창업자 수천 명의 아이디어를 직접 분석해 설계한 네 가지 적용 트랙입니다. 당신의 제품이 어디에 해당하는지 보이면, 데모도 그 모습으로 만들어 드립니다."
      />

      {/* 인덱스 리스트 — 트랙을 목차처럼 읽게 한다 */}
      <div className="mt-14 border-y border-ink-line">
        {segments.map((s, i) => (
          <Reveal key={s.code} delay={i * 60}>
            <div className="group grid gap-3 border-b border-ink-line py-9 last:border-b-0 md:grid-cols-[110px_280px_1fr_auto] md:items-baseline md:gap-8">
              <p className="font-mono text-sm tracking-[0.2em] text-paper-faint">
                {s.code}
                {s.main && <span className="ml-2 text-lime">●</span>}
              </p>
              <h3 className="text-xl font-bold transition-colors group-hover:text-lime">
                {s.title}
              </h3>
              <p className="leading-relaxed text-paper-dim">{s.desc}</p>
              <p className="font-mono text-xs leading-relaxed tracking-wider text-paper-faint md:max-w-[180px] md:text-right">
                {s.offer}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-paper-faint">
          <span className="text-lime">●</span> MAIN TRACK
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-paper-dim">
          각 기능은 <span className="font-semibold text-lime">개별 API·제작</span>으로도 도입할 수
          있습니다. 아바타 없이 LLM·TTS·아바타 영상 등 필요한 것만 골라 쓰세요. (실시간 아바타는 도입
          상담)
        </p>
      </Reveal>
    </section>
  );
}
