import Reveal from "./reveal";

// MINDVR가 제공하는 두 가지 AI 휴먼 — 메인 상단 개요. 각 카드는 해당 섹션으로 연결.
const types = [
  {
    no: "01",
    en: "REALTIME AVATAR",
    href: "#realtime",
    title: "실시간 인터랙티브 AI 휴먼",
    body: "말로 대화하는 AI 직원. 음성으로 묻고 답하는 양방향 대화형으로, 고객 상담 데모·모의 면접·교육 연습 상대로 활용합니다.",
  },
  {
    no: "02",
    en: "AI HUMANS",
    href: "#demos",
    title: "AI 마케팅 콘텐츠",
    body: "대본을 말하는 영상. 실사 수준의 AI 휴먼이 촬영 인력·장비 없이 SNS·유튜브·제품 소개·광고 영상을 만들어 드립니다.",
  },
];

export default function TwoTypes() {
  return (
    <section className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
            <span className="text-lime">TWO</span>
            <span className="mx-2">—</span>
            AI HUMANS
          </p>
          <h2 className="mt-6 max-w-3xl text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            MINDVR가 제공하는 <span className="text-lime">두 가지 AI 휴먼</span>.
          </h2>
        </Reveal>

        <div className="mt-10 grid border border-ink-line bg-ink-line gap-px sm:grid-cols-2">
          {types.map((t, i) => (
            <Reveal key={t.en} delay={i * 80}>
              <a href={t.href} className="group flex h-full flex-col bg-ink p-8 transition-colors hover:bg-ink-soft sm:p-10">
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint transition-colors group-hover:text-lime">
                    {t.en}
                  </p>
                  <span className="font-mono text-xs text-paper-faint/40">{t.no}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold sm:text-2xl">{t.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-paper-dim">{t.body}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-lime">
                  자세히 보기
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
