import { getDict } from "@/lib/i18n-server";
import SectionHeader from "./section-header";

export default async function Faq() {
  const t = await getDict();
  return (
    <section id="faq" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-4xl px-5 py-24 sm:py-32">
        <SectionHeader index="09" label="FAQ" title={t.faq.title} />

        <div className="mt-12 divide-y divide-ink-line border-y border-ink-line">
          {t.faq.items.map((f, i) => (
            <details key={f.q} className="group py-2">
              <summary className="flex cursor-pointer list-none items-baseline gap-5 py-4 text-base font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-xs text-paper-faint/60">
                  Q.{String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{f.q}</span>
                <span className="faq-chevron shrink-0 font-mono text-lg text-paper-faint transition-transform">
                  +
                </span>
              </summary>
              <p className="pb-5 pl-12 leading-relaxed text-paper-dim sm:pl-[60px]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
