import { getDict } from "@/lib/i18n-server";
import Em from "./em";
import Reveal from "./reveal";
import SectionHeader from "./section-header";

export default async function Segments() {
  const t = await getDict();
  return (
    <section id="usecases" className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <SectionHeader
        index="05"
        label="USE CASES"
        title={
          <>
            {t.segments.title.lead}
            <br />
            {t.segments.title.tail}
          </>
        }
        lede={t.segments.lede}
      />

      {/* 인덱스 리스트 — 트랙을 목차처럼 읽게 한다 */}
      <div className="mt-14 border-y border-ink-line">
        {t.segments.tracks.map((s, i) => (
          <Reveal key={s.code} delay={i * 60}>
            <div className="group grid gap-3 border-b border-ink-line py-9 last:border-b-0 md:grid-cols-[110px_280px_1fr_auto] md:items-baseline md:gap-8">
              <p className="font-mono text-sm tracking-[0.2em] text-paper-faint">
                {s.code}
                {i === 0 && <span className="ml-2 text-lime">●</span>}
              </p>
              <h3 className="text-xl font-bold transition-colors group-hover:text-lime">{s.title}</h3>
              <p className="leading-relaxed text-paper-dim">{s.desc}</p>
              <p className="font-mono text-xs leading-relaxed tracking-wider text-paper-faint md:max-w-[180px] md:text-right">
                {s.offer}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-paper-faint">
          <span className="text-lime">●</span> {t.segments.mainTrack}
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-paper-dim">
          <Em t={t.segments.closing} className="font-semibold text-lime" />
        </p>
      </Reveal>
    </section>
  );
}
