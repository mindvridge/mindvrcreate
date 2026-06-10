import Reveal from "./reveal";

const plans = [
  {
    name: "무료 데모",
    price: "₩0",
    unit: "",
    desc: "당신의 캐릭터로 한국어로 말하는 30초 영상 1컷. 품질을 직접 확인한 뒤 결정하세요.",
    features: ["캐릭터 1종 · 30초 1컷", "한국어 음성 시안 포함", "워터마크 포함 시안"],
    cta: "무료 데모 신청",
    highlight: true,
  },
  {
    name: "스타트업 플랜",
    price: "프로젝트 단위",
    unit: "견적",
    desc: "초기 팀을 위한 시작 부담 없는 플랜. 모두의창업 1차 통과 창업자에게는 전용 할인을 적용합니다.",
    features: ["맞춤 캐릭터 제작", "영상 단위·물량 단위 과금", "1차 통과 창업자 전용 할인"],
    cta: "견적 문의",
    highlight: false,
  },
  {
    name: "맞춤 · API",
    price: "별도 협의",
    unit: "",
    desc: "전용 페르소나 구축, 대량 렌더링 파이프라인, 서비스 연동(API)까지 — 제품 안에 AI 휴먼을 심습니다.",
    features: ["전용 페르소나 · 멀티 캐릭터", "대량 배치 렌더링", "API · 파이프라인 연동"],
    cta: "도입 상담",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">PRICING</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
            USD 구독 없이, 쓴 만큼만.
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-paper-dim">
            자체 GPU로 렌더링하기 때문에 가능한 구조입니다. 무료 데모로 품질을 확인한 뒤,
            물량·프로젝트 단위로만 비용이 발생합니다.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <div
                className={`flex h-full flex-col rounded-lg border p-8 ${
                  p.highlight ? "border-lime/60 bg-ink" : "border-ink-line bg-ink"
                }`}
              >
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="mt-3 text-3xl font-extrabold tracking-tight">
                  {p.price}
                  {p.unit && (
                    <span className="ml-1 text-base font-medium text-paper-faint">{p.unit}</span>
                  )}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-paper-dim">{p.desc}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-paper-dim">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#demo-request"
                  className={`mt-8 rounded-md px-5 py-3 text-center text-sm font-bold transition-colors ${
                    p.highlight
                      ? "bg-lime text-ink hover:bg-lime-deep"
                      : "border border-ink-line text-paper-dim hover:border-lime hover:text-lime"
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
