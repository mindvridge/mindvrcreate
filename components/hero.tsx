import { getDict } from "@/lib/i18n-server";
import DemoCta from "./demo-cta";
import Em from "./em";
import HeroStage from "./hero-stage";

// 마브 API(daVinci-MagiHuman)로 제작한 한국어 토킹헤드 데모.
const HERO_VIDEO_SRC: string | undefined = "/hero-demo.mp4";

export default async function Hero() {
  const t = await getDict();
  return (
    <section id="top" className="relative flex flex-col pt-32 pb-12 sm:pt-44 sm:pb-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="mb-5 font-mono text-xs tracking-[0.25em] text-paper-faint">{t.hero.eyebrow}</p>
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            <Em t={t.hero.title} />
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-dim">{t.hero.lede}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <DemoCta className="bg-lime px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-lime-deep">
              {t.hero.ctaPrimary}
            </DemoCta>
            <a
              href="#process"
              className="border border-ink-line px-6 py-3.5 text-base font-semibold text-paper-dim transition-colors hover:border-lime hover:text-lime"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>

        <HeroStage videoSrc={HERO_VIDEO_SRC} labels={t.heroStage} />
      </div>
    </section>
  );
}
