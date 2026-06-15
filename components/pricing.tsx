import DemoCta from "./demo-cta";
import Reveal from "./reveal";
import SectionHeader from "./section-header";

const plans = [
  {
    name: "무료 데모",
    price: "₩0",
    unit: "",
    desc: "당신의 캐릭터로 한국어로 말하는 30초 영상 1컷. 품질을 직접 확인한 뒤 결정하세요.",
    features: ["캐릭터 1종 · 30초 1컷", "한국어 음성 시안 포함", "워터마크 포함 시안"],
    cta: "무료로 체험하기",
    highlight: true,
  },
  {
    name: "스타트업 플랜",
    price: "프로젝트 단위",
    unit: "견적",
    desc: "초기 팀을 위한 시작 부담 없는 플랜. 모두의창업 1차 통과 창업자에게는 전용 할인을 적용합니다.",
    features: ["전용 캐릭터 제작", "영상 단위·물량 단위 과금", "1차 통과 창업자 전용 할인"],
    cta: "견적 문의",
    highlight: false,
  },
  {
    name: "전용 · API",
    price: "별도 협의",
    unit: "",
    desc: "LLM·TTS·아바타 영상·실시간 아바타를 개별 API와 제작으로 — 아바타 없이 필요한 기능만 도입할 수 있습니다.",
    features: ["LLM · TTS · 아바타 영상 개별 제공", "실시간 아바타 도입 상담", "API · 서비스 연동"],
    cta: "도입 상담",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <SectionHeader
          index="06"
          label="PRICING"
          title="월 구독 없이, 쓴 만큼만."
          lede="직접 제작하기 때문에 가능한 구조입니다. 무료 데모로 품질을 확인한 뒤, 원화 기준 물량·프로젝트 단위로만 비용이 발생합니다."
        />

        {/* 헤어라인 분할 요금표 — 박스 카드 대신 한 장의 표처럼 */}
        <Reveal delay={80}>
          <div className="mt-14 grid border border-ink-line bg-ink-line gap-px lg:grid-cols-3">
            {plans.map((p) => (
              <div key={p.name} className="relative flex h-full flex-col bg-ink p-8 sm:p-10">
                {p.highlight && <span className="absolute inset-x-0 top-0 h-0.5 bg-lime" />}
                <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">
                  {p.name}
                </p>
                <p className="mt-4 text-3xl font-extrabold tracking-tight">
                  {p.price}
                  {p.unit && (
                    <span className="ml-1 text-base font-medium text-paper-faint">{p.unit}</span>
                  )}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-paper-dim">{p.desc}</p>
                <ul className="mt-7 flex-1 space-y-0 divide-y divide-ink-line/60 border-y border-ink-line/60">
                  {p.features.map((f) => (
                    <li key={f} className="py-2.5 text-sm text-paper-dim">
                      {f}
                    </li>
                  ))}
                </ul>
                {(() => {
                  const cls = `mt-8 px-5 py-3 text-center text-sm font-bold transition-colors ${
                    p.highlight
                      ? "bg-lime text-ink hover:bg-lime-deep"
                      : "border border-ink-line text-paper-dim hover:border-lime hover:text-lime"
                  }`;
                  return p.name === "무료 데모" ? (
                    <DemoCta className={cls}>{p.cta}</DemoCta>
                  ) : (
                    <a
                      href={`mailto:mindvridge.official@gmail.com?subject=${encodeURIComponent(
                        `[마인드브이알] ${p.cta}`
                      )}`}
                      className={cls}
                    >
                      {p.cta}
                    </a>
                  );
                })()}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
