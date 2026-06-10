import Reveal from "./reveal";
import SectionHeader from "./section-header";

const values = [
  {
    no: "A",
    tag: "KOREAN-NATIVE",
    title: "한국어 네이티브, 검증으로 증명",
    body: "한국어를 명시 지원하고 음성 명료도(WER)가 가장 낮은 엔진과, 상용 아바타 서비스를 인간 선호도 평가에서 이긴 엔진을 자체 운용합니다. “자연스럽다”를 데모로 증명합니다.",
  },
  {
    no: "B",
    tag: "CUSTOM, NOT TEMPLATE",
    title: "템플릿이 아닌 맞춤 제작",
    body: "당신의 캐릭터·브랜드·페르소나 전용으로 디지털휴먼을 설계합니다. 생성물과 캐릭터 IP는 100% 고객에게 귀속됩니다.",
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
    body: "자체 NVIDIA B200으로 렌더링하므로 USD 구독료가 없습니다. 물량·프로젝트 단위 견적과 스타트업 플랜으로 시작 부담을 낮췄습니다.",
  },
];

export default function Values() {
  return (
    <section id="value" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <SectionHeader
          index="02"
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
