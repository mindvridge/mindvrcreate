import { getDict } from "@/lib/i18n-server";
import DemoCta from "./demo-cta";
import Reveal from "./reveal";
import SectionHeader from "./section-header";

export default async function Pricing() {
  const t = await getDict();
  return (
    <section id="pricing" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <SectionHeader index="07" label="PRICING" title={t.pricing.title} lede={t.pricing.lede} />

        {/* 헤어라인 분할 요금표 — 박스 카드 대신 한 장의 표처럼 */}
        <Reveal delay={80}>
          <div className="mt-14 grid border border-ink-line bg-ink-line gap-px lg:grid-cols-3">
            {t.pricing.plans.map((p, i) => {
              const highlight = i === 0;
              const cls = `mt-8 px-5 py-3 text-center text-sm font-bold transition-colors ${
                highlight
                  ? "bg-lime text-ink hover:bg-lime-deep"
                  : "border border-ink-line text-paper-dim hover:border-lime hover:text-lime"
              }`;
              return (
                <div key={p.name} className="relative flex h-full flex-col bg-ink p-8 sm:p-10">
                  {highlight && <span className="absolute inset-x-0 top-0 h-0.5 bg-lime" />}
                  <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">{p.name}</p>
                  <p className="mt-4 text-3xl font-extrabold tracking-tight">
                    {p.price}
                    {p.unit && (
                      <span className="ml-1 text-base font-medium text-paper-faint">{p.unit}</span>
                    )}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-paper-dim">{p.desc}</p>
                  <ul className="mt-7 flex-1 space-y-0 divide-y divide-ink-line/60 border-y border-ink-line/60">
                    {p.features.map((f) => (
                      <li key={f} className="py-2.5 text-sm text-paper-dim">
                        {f}
                      </li>
                    ))}
                  </ul>
                  {highlight ? (
                    <DemoCta className={cls}>{p.cta}</DemoCta>
                  ) : (
                    <a
                      href={`mailto:mindvridge.official@gmail.com?subject=${encodeURIComponent(
                        `${t.pricing.mailSubjectPrefix}${p.cta}`
                      )}`}
                      className={cls}
                    >
                      {p.cta}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
