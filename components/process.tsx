import Reveal from "./reveal";

const steps = [
  {
    no: "STEP 1",
    title: "캐릭터·대본 전달",
    body: "캐릭터 이미지(또는 기획안)와 말할 내용을 보내주세요. 사람·캐릭터·일러스트 모두 가능합니다.",
  },
  {
    no: "STEP 2",
    title: "한국어 음성 확정",
    body: "CosyVoice 2 기반 한국어 음색 시안을 제시하고, 톤·속도·페르소나를 함께 확정합니다. 프리미엄 음성 옵션도 제공합니다.",
  },
  {
    no: "STEP 3",
    title: "B200 렌더링",
    body: "자체 NVIDIA B200에서 SOTA 립싱크 엔진으로 렌더링합니다. 장편·멀티 캐릭터·1080p 단편까지 용도별 최적 엔진을 적용합니다.",
  },
  {
    no: "STEP 4",
    title: "납품 + IP 양도",
    body: "완성 영상을 납품하고 생성물·캐릭터 IP를 100% 고객에게 귀속시킵니다. 이후 물량 제작·업데이트는 단위 견적으로.",
  },
];

export default function Process() {
  return (
    <section id="process" className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">HOW IT WORKS</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
          대본에서 완성 영상까지, 4단계.
        </h2>
      </Reveal>

      <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.no} delay={i * 80}>
            <li className="h-full rounded-lg border border-ink-line bg-ink-soft p-7">
              <p className="font-mono text-[11px] tracking-[0.2em] text-lime">{s.no}</p>
              <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
