import Reveal from "./reveal";
import SectionHeader from "./section-header";

const steps = [
  {
    no: "1",
    title: "캐릭터·대본 전달",
    body: "캐릭터 이미지(또는 기획안)와 말할 내용을 보내주세요. 사람·캐릭터·일러스트 모두 가능합니다.",
  },
  {
    no: "2",
    title: "한국어 음성 확정",
    body: "캐릭터에 어울리는 한국어 음색 시안을 여러 개 제시하고, 톤·속도·페르소나를 함께 확정합니다. 프리미엄 음성 옵션도 제공합니다.",
  },
  {
    no: "3",
    title: "스튜디오 제작",
    body: "확정된 음성에 맞춰 입모양과 표정을 정교하게 입힙니다. 장편·멀티 캐릭터·고화질 단편까지 용도에 맞게 제작합니다.",
  },
  {
    no: "4",
    title: "납품 + IP 양도",
    body: "완성 영상을 납품하고 생성물·캐릭터 IP를 100% 고객에게 귀속시킵니다. 이후 물량 제작·업데이트는 단위 견적으로.",
  },
];

export default function Process() {
  return (
    <section id="process" className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <SectionHeader index="05" label="HOW IT WORKS" title="대본에서 완성 영상까지, 4단계." />

      <ol className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.no} delay={i * 70}>
            <li className="border-t border-ink-line pt-6">
              <p className="text-5xl font-extrabold tracking-tight text-paper-faint/30">
                {s.no}
                <span className="text-lime">.</span>
              </p>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
