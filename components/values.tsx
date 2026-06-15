import Reveal from "./reveal";
import SectionHeader from "./section-header";

const values = [
  {
    no: "A",
    tag: "KOREAN-NATIVE",
    title: "한국어가 자연스럽습니다",
    body: "영어를 번역해 입힌 듯한 어색함이 없습니다. 한국어의 입모양·억양·호흡에 맞춰 제작하며, “자연스럽다”는 말 대신 무료 데모로 직접 보여드립니다.",
  },
  {
    no: "B",
    tag: "CUSTOM, NOT TEMPLATE",
    title: "템플릿이 아닌 전용 제작",
    body: "당신의 캐릭터·브랜드·페르소나 전용으로 디지털휴먼을 설계합니다.",
  },
  {
    no: "C",
    tag: "FULL-STACK",
    title: "풀스택 원스톱",
    body: "아바타 + 한국어 음성(TTS) + 립싱크 + 영상 + 이미지까지 한 곳에서. 여러 툴을 이어 붙이는 수고 없이 완성본으로 받으세요.",
  },
  {
    no: "D",
    tag: "FAIR PRICING",
    title: "합리적 비용 구조",
    body: "직접 제작하기에 거품이 없습니다. 달러 구독 없이 원화 기준 물량·프로젝트 단위로만 비용이 발생하며, 초기 팀을 위한 스타트업 플랜을 운영합니다.",
  },
];

export default function Values() {
  return (
    <section id="value" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <SectionHeader
          index="03"
          label="WHY MINDVR"
          title={
            <>
              한국어로 자연스럽게 말하는 AI 휴먼을,
              <br />
              합리적 비용에.
            </>
          }
        />

        {/* 헤어라인 스펙 그리드 — 카드 대신 1px 분할 */}
        <Reveal delay={80}>
          <div className="mt-14 grid border border-ink-line bg-ink-line gap-px sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.tag} className="group bg-ink p-8 sm:p-10">
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint transition-colors group-hover:text-lime">
                    {v.tag}
                  </p>
                  <span className="font-mono text-xs text-paper-faint/40">{v.no}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-paper-dim">{v.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
