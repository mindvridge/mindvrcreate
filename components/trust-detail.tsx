import Reveal from "./reveal";
import SectionHeader from "./section-header";

const stamps = [
  {
    label: "GOV R&D",
    title: "정부 R&D 과제 수행",
    detail: "RS-2026-25508342",
    body: "한국어 면접·상담 영상 멀티모달 인식 — 2단계 실시간 대화형 AI 휴먼의 기반 기술입니다.",
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
    body: "이미 실사용자가 쓰는 제품을 운영하며 검증한 기술 스택 위에서 제작합니다.",
  },
  {
    label: "INFRA",
    title: "자체 GPU 인프라",
    detail: "NVIDIA B200 192GB",
    body: "외부 API 의존 없이 자체 인프라에서 렌더링합니다. 비용 구조와 납기를 우리가 통제합니다.",
  },
];

const engines = [
  { role: "아바타 본체 엔진", name: "LongCat-Video-Avatar 1.5", license: "MIT", note: "상용 아바타 대비 인간 선호도 우위 · 5분+ 장편 · 멀티 캐릭터" },
  { role: "한국어 · 1080p 단편", name: "daVinci-MagiHuman", license: "Apache 2.0", note: "한국어 명시 지원 · 1080p 네이티브 · 음성 명료도(WER) 최저" },
  { role: "장편 더빙", name: "InfiniteTalk", license: "Apache 2.0", note: "무한 길이 립싱크 더빙" },
  { role: "한국어 음성(TTS)", name: "CosyVoice 2 + 프리미엄 옵션", license: "—", note: "아바타 음색 통제" },
];

export default function TrustDetail() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <SectionHeader index="07" label="EVIDENCE" title="과장 대신, 번호로 말합니다." />

      {/* 등기부 톤의 헤어라인 그리드 */}
      <Reveal delay={80}>
        <div className="mt-14 grid border border-ink-line bg-ink-line gap-px sm:grid-cols-2">
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

      <Reveal delay={120}>
        <div className="mt-10 overflow-x-auto border border-ink-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">엔진 스택 및 라이선스</caption>
            <thead>
              <tr className="border-b border-ink-line bg-ink-soft font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint">
                <th className="px-5 py-3.5 font-medium">역할</th>
                <th className="px-5 py-3.5 font-medium">엔진</th>
                <th className="px-5 py-3.5 font-medium">라이선스</th>
                <th className="px-5 py-3.5 font-medium">비고</th>
              </tr>
            </thead>
            <tbody>
              {engines.map((e) => (
                <tr key={e.name} className="border-b border-ink-line/60 last:border-0">
                  <td className="px-5 py-4 text-paper-dim">{e.role}</td>
                  <td className="px-5 py-4 font-mono text-[13px]">{e.name}</td>
                  <td className="px-5 py-4 font-mono text-[13px] text-lime">{e.license}</td>
                  <td className="px-5 py-4 text-paper-faint">{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-paper-faint">
          핵심 엔진은 전부 MIT/Apache 2.0 — 상업 사용·수정·배포가 자유롭고, 생성물·캐릭터 IP를
          고객에게 100% 귀속시킬 수 있습니다. 특정 국가 제외 조항이 있는 모델은 사용하지 않습니다.
        </p>
      </Reveal>
    </section>
  );
}
