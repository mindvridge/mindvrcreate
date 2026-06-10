import Reveal from "./reveal";

const problems = [
  {
    index: "01",
    title: "비싸거나",
    body: "글로벌 아바타 서비스는 USD 구독 기반. 물량이 늘수록 비용이 가파르게 오르고, 환율 리스크까지 떠안습니다.",
  },
  {
    index: "02",
    title: "영어 같거나",
    body: "영어 중심으로 학습된 엔진은 한국어 입모양과 운율이 어색합니다. 시청자는 3초 만에 알아챕니다.",
  },
  {
    index: "03",
    title: "템플릿이거나",
    body: "정해진 아바타 중에서 고르는 방식으로는 당신의 캐릭터·브랜드를 담을 수 없고, IP 소유권도 불분명합니다.",
  },
];

export default function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">PROBLEM</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
          지금 디지털휴먼을 도입하려면,
          <br />셋 중 하나는 포기해야 합니다.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {problems.map((p, i) => (
          <Reveal key={p.index} delay={i * 100}>
            <div className="h-full rounded-lg border border-ink-line bg-ink-soft p-7">
              <p className="font-mono text-xs text-paper-faint">{p.index}</p>
              <h3 className="mt-3 text-xl font-bold">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-paper-dim">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={150}>
        <p className="mt-12 max-w-3xl text-lg leading-relaxed text-paper-dim">
          마인드브이알은 셋 다 포기하지 않습니다. 자체 GPU 인프라와 한국어가 검증된
          엔진, 그리고 <span className="font-semibold text-lime">맞춤 제작 + IP 전부 양도</span>로
          답합니다.
        </p>
      </Reveal>
    </section>
  );
}
