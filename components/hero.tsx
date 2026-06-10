import HeroStage from "./hero-stage";

// 0순위 A/B 데모(LongCat 1.5 vs MagiHuman) 확정 후
// /public/hero-demo.mp4 를 추가하고 아래 경로를 지정하면 영상 모드로 전환된다.
const HERO_VIDEO_SRC: string | undefined = undefined;

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen flex-col justify-center pt-24 pb-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="mb-5 font-mono text-xs tracking-[0.25em] text-paper-faint">
            MINDVR — KOREAN AI HUMAN STUDIO
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            한국어로 <span className="text-lime">자연스럽게 말하는</span>,
            <br />
            당신만의 AI 휴먼.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-dim">
            템플릿 아바타가 아닙니다. 자체 NVIDIA B200과 상용 서비스를 이긴 오픈소스
            SOTA 엔진으로, 당신의 캐릭터·브랜드·페르소나 전용 디지털휴먼을
            합리적 비용에 제작합니다. 캐릭터 IP는 100% 고객 소유.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#demo-request"
              className="rounded-md bg-lime px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-lime-deep"
            >
              무료 아바타 데모 받기
            </a>
            <a
              href="#process"
              className="rounded-md border border-ink-line px-6 py-3.5 text-base font-semibold text-paper-dim transition-colors hover:border-lime hover:text-lime"
            >
              제작 과정 보기
            </a>
          </div>
          <p className="mt-4 text-sm text-paper-faint">
            당신의 캐릭터로 한국어로 말하는 30초 영상 1컷 — 비용 없이 만들어 드립니다.
          </p>
        </div>

        <HeroStage videoSrc={HERO_VIDEO_SRC} />
      </div>
    </section>
  );
}
