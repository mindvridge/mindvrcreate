import { getDict } from "@/lib/i18n-server";
import Reveal from "./reveal";
import SectionHeader from "./section-header";

export default async function Process() {
  const t = await getDict();
  return (
    <section id="process" className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <SectionHeader index="06" label="HOW IT WORKS" title={t.process.title} />

      <ol className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
        {t.process.steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 70}>
            <li className="border-t border-ink-line pt-6">
              <p className="text-5xl font-extrabold tracking-tight text-paper-faint/30">
                {i + 1}
                <span className="text-lime">.</span>
              </p>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
