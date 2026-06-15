import Reveal from "./reveal";
import SectionHeader from "./section-header";

const problems = [
  {
    index: "01",
    title: "비싸거나",
    body: "해외 아바타 서비스는 달러 구독이 기본입니다. 환율 따라 비용이 출렁이고, 물량이 늘수록 가파르게 오릅니다.",
  },
  {
    index: "02",
    title: "영어 같거나",
    body: "영어 중심으로 만들어진 서비스는 한국어 입모양과 운율이 어색합니다. 시청자는 3초 만에 알아챕니다.",
  },
  {
    index: "03",
    title: "템플릿이거나",
    body: "정해진 아바타 중에서 고르는 방식으로는 당신의 캐릭터·브랜드를 온전히 담을 수 없습니다.",
  },
];

export default function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <SectionHeader
        index="03"
        label="PROBLEM"
        title={
          <>
            지금 디지털휴먼을 도입하려면,
            <br />셋 중 하나는 포기해야 합니다.
          </>
        }
      />

      <div className="mt-14 border-y border-ink-line">
        {problems.map((p, i) => (
          <Reveal key={p.index} delay={i * 80}>
            <div className="grid items-baseline gap-3 border-b border-ink-line py-9 last:border-b-0 md:grid-cols-[100px_220px_1fr] md:gap-8">
              <span className="font-mono text-2xl text-paper-faint/50">{p.index}</span>
              <h3 className="text-xl font-bold">{p.title}</h3>
              <p className="leading-relaxed text-paper-dim">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={150}>
        <p className="mt-12 max-w-3xl text-lg leading-relaxed text-paper-dim">
          마인드브이알은 셋 다 포기하지 않습니다. 한국어에 최적화된{" "}
          <span className="font-semibold text-lime">자체 제작 역량과 전용 제작</span>으로
          답합니다.
        </p>
      </Reveal>
    </section>
  );
}
