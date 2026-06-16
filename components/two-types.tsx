import { getDict } from "@/lib/i18n-server";
import Em from "./em";
import Reveal from "./reveal";

export default async function TwoTypes() {
  const t = await getDict();
  const types = [
    { no: "01", en: "REALTIME AVATAR", href: "#realtime", ...t.twoTypes.realtime },
    { no: "02", en: "AI HUMANS", href: "#demos", ...t.twoTypes.content },
  ];

  return (
    <section className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
            <span className="text-lime">{t.twoTypes.eyebrowEm}</span>
            <span className="mx-2">—</span>
            {t.twoTypes.eyebrowRest}
          </p>
          <h2 className="mt-6 max-w-3xl text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            <Em t={t.twoTypes.heading} />
          </h2>
        </Reveal>

        <div className="mt-10 grid border border-ink-line bg-ink-line gap-px sm:grid-cols-2">
          {types.map((type, i) => (
            <Reveal key={type.en} delay={i * 80}>
              <a href={type.href} className="group flex h-full flex-col bg-ink p-8 transition-colors hover:bg-ink-soft sm:p-10">
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint transition-colors group-hover:text-lime">
                    {type.en}
                  </p>
                  <span className="font-mono text-xs text-paper-faint/40">{type.no}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold sm:text-2xl">{type.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-paper-dim">{type.body}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-lime">
                  {t.twoTypes.cta}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
