import { getDict } from "@/lib/i18n-server";
import Em from "./em";
import Reveal from "./reveal";
import SectionHeader from "./section-header";

export default async function Problem() {
  const t = await getDict();
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <SectionHeader
        index="03"
        label="PROBLEM"
        title={
          <>
            {t.problem.title.lead}
            <br />
            {t.problem.title.tail}
          </>
        }
      />

      <div className="mt-14 border-y border-ink-line">
        {t.problem.items.map((p, i) => (
          <Reveal key={p.index} delay={i * 80}>
            <div className="grid items-baseline gap-3 border-b border-ink-line py-9 last:border-b-0 md:grid-cols-[100px_220px_1fr] md:gap-8">
              <span className="font-mono text-2xl text-paper-faint/50">{p.index}</span>
              <h3 className="text-xl font-bold">{p.title}</h3>
              <p className="leading-relaxed text-paper-dim">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={150}>
        <p className="mt-12 max-w-3xl text-lg leading-relaxed text-paper-dim">
          <Em t={t.problem.closing} className="font-semibold text-lime" />
        </p>
      </Reveal>
    </section>
  );
}
