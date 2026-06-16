import { getDict } from "@/lib/i18n-server";
import Em from "./em";
import Reveal from "./reveal";
import SectionHeader from "./section-header";

export default async function RealtimeAvatar() {
  const t = await getDict();
  const r = t.realtime;
  return (
    <section id="realtime" className="border-t border-ink-line">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <SectionHeader
          index="01"
          label="REALTIME AVATAR"
          title={<Em t={r.title} />}
          lede={r.lede}
        />

        {/* 실시간 대화 파이프라인 */}
        <Reveal delay={80}>
          <div className="mt-14">
            <div className="mb-4 flex items-center gap-2">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-lime" />
              <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">{r.liveTag}</p>
            </div>
            <div className="grid border border-ink-line bg-ink-line gap-px sm:grid-cols-3">
              {r.pipeline.map((p, i) => (
                <div key={p.tag} className="relative bg-ink p-8 sm:p-10">
                  <div className="flex items-baseline justify-between">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-lime">{p.tag}</p>
                    <span className="font-mono text-xs text-paper-faint/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-paper-dim">{p.body}</p>
                  {i < r.pipeline.length - 1 && (
                    <span className="pointer-events-none absolute -right-px top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center bg-ink text-lime sm:flex">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 특징 칩 */}
        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap gap-2">
            {r.highlights.map((h) => (
              <span
                key={h}
                className="border border-ink-line px-3 py-1.5 text-xs font-semibold text-paper-dim"
              >
                {h}
              </span>
            ))}
          </div>
        </Reveal>

        {/* 활용 예시 */}
        <Reveal delay={160}>
          <div className="mt-12 border-t border-ink-line pt-8">
            <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">{r.useCasesLabel}</p>
            <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {r.useCases.map((u) => (
                <li key={u} className="flex items-start gap-3 text-paper-dim">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                  <span className="leading-relaxed">{u}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
