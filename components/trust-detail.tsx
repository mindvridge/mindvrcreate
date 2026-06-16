import { getDict } from "@/lib/i18n-server";
import Reveal from "./reveal";
import SectionHeader from "./section-header";

export default async function TrustDetail() {
  const t = await getDict();
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <SectionHeader index="08" label="EVIDENCE" title={t.trust.title} />

      {/* 등기부 톤의 헤어라인 그리드 */}
      <Reveal delay={80}>
        <div className="mt-14 grid border border-ink-line bg-ink-line gap-px sm:grid-cols-3">
          {t.trust.stamps.map((s) => (
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
