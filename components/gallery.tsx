import { getDict } from "@/lib/i18n-server";
import PersonaCard from "./persona-card";
import Reveal from "./reveal";
import SectionHeader from "./section-header";

// 마브 API(daVinci-MagiHuman)로 제작한 페르소나별 발화 데모.
const PERSONA_MEDIA = [
  { key: "counselor", en: "COUNSELOR", img: "/images/persona-counselor-poster.jpg", videoSrc: "/videos/persona-counselor.mp4" },
  { key: "interviewer", en: "INTERVIEWER", img: "/images/persona-interviewer-poster.jpg", videoSrc: "/videos/persona-interviewer.mp4" },
  { key: "influencer", en: "INFLUENCER", img: "/images/persona-influencer-poster.jpg", videoSrc: "/videos/persona-influencer.mp4" },
  { key: "twin", en: "DIGITAL TWIN", img: "/images/persona-twin-poster.jpg", videoSrc: "/videos/persona-twin.mp4" },
] as const;

export default async function Gallery() {
  const t = await getDict();
  return (
    <section id="demos" className="border-t border-ink-line bg-ink-soft/60">
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <SectionHeader index="02" label="AI HUMANS" title={t.gallery.title} lede={t.gallery.lede} />

        <div className="mt-14 grid grid-cols-2 gap-px border border-ink-line bg-ink-line lg:grid-cols-4">
          {PERSONA_MEDIA.map((p, i) => (
            <Reveal key={p.en} delay={i * 60}>
              <PersonaCard
                label={t.gallery.personas[p.key]}
                en={p.en}
                tc="00:00:06:00"
                img={p.img}
                videoSrc={p.videoSrc}
                hoverLabel={t.gallery.hoverPlay}
                aiLabel={t.gallery.aiGenerated}
              />
            </Reveal>
          ))}
        </div>

        {/* 활용 예시 */}
        <Reveal delay={120}>
          <div className="mt-12 border-t border-ink-line pt-8">
            <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">{t.gallery.useCasesLabel}</p>
            <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {t.gallery.useCases.map((u) => (
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
