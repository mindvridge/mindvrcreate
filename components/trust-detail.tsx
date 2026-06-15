import Reveal from "./reveal";
import SectionHeader from "./section-header";

const stamps = [
  {
    label: "GOV R&D",
    title: "정부 R&D 과제 수행",
    detail: "RS-2026-25508342",
    body: "한국어 면접·상담 영상 인식 분야의 국가 연구 과제를 수행하며 기술력을 검증받았습니다.",
  },
  {
    label: "PATENT",
    title: "특허 출원 2건",
    detail: "10-2026-0007692 · 10-2026-0007697",
    body: "AI 휴먼 관련 핵심 기술을 출원해 권리화를 진행하고 있습니다.",
  },
  {
    label: "PRODUCT",
    title: "운영 중 제품 — 마인드프랩",
    detail: "AI 페르소나 면접 코칭",
    body: "이미 실사용자가 쓰는 제품을 직접 운영하며 다듬어 온 제작 역량으로 만듭니다.",
  },
];

export default function TrustDetail() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <SectionHeader index="08" label="EVIDENCE" title="과장 대신, 번호로 말합니다." />

      {/* 등기부 톤의 헤어라인 그리드 */}
      <Reveal delay={80}>
        <div className="mt-14 grid border border-ink-line bg-ink-line gap-px sm:grid-cols-3">
          {stamps.map((s) => (
            <div key={s.label} className="bg-ink-soft p-7 sm:p-9">
              <p className="font-mono text-[11px] tracking-[0.25em] text-paper-faint">{s.label}</p>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 font-mono text-sm text-lime">{s.detail}</p>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">{s.body}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
