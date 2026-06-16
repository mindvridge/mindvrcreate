import { getDict } from "@/lib/i18n-server";
import Em from "./em";
import Reveal from "./reveal";
import SectionHeader from "./section-header";

const NOS = ["A", "B", "C", "D"];

export default async function Values() {
  const t = await getDict();
  return (
    <section id="value" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <SectionHeader index="04" label="WHY MINDVR" title={<Em t={t.values.title} />} />

        {/* 헤어라인 스펙 그리드 — 카드 대신 1px 분할 */}
        <Reveal delay={80}>
          <div className="mt-14 grid border border-ink-line bg-ink-line gap-px sm:grid-cols-2">
            {t.values.items.map((v, i) => (
              <div key={v.tag} className="group bg-ink p-8 sm:p-10">
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint transition-colors group-hover:text-lime">
                    {v.tag}
                  </p>
                  <span className="font-mono text-xs text-paper-faint/40">{NOS[i]}</span>
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
