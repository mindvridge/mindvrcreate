import Link from "next/link";
import { CREDIT_COSTS, type Service } from "@/lib/credits";
import { getDict } from "@/lib/i18n-server";
import Em from "./em";
import Reveal from "./reveal";

const services: Service[] = ["tts", "llm", "image", "video", "avatar"];

// 홈페이지 '직접 체험' 밴드 — 테스트 랩(/test)으로 가는 눈에 띄는 진입점.
export default async function LabCta() {
  const t = await getDict();
  return (
    <section id="lab" className="border-y border-ink-line bg-ink-soft/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
        <Reveal>
          <div className="flex items-baseline justify-between border-b border-ink-line pb-4">
            <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
              <span className="text-lime">LIVE LAB</span>
              <span className="mx-2">—</span>
              {t.labCta.eyebrow}
            </p>
            <span className="hidden font-mono text-[10px] tracking-[0.25em] text-paper-faint/60 sm:block">
              {t.labCta.freeBadge}
            </span>
          </div>

          <h2 className="mt-10 max-w-3xl text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
            <Em t={t.labCta.title} />
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-paper-dim">{t.labCta.lede}</p>
        </Reveal>

        {/* 5가지 기능 — 헤어라인 그리드 */}
        <Reveal delay={80}>
          <div className="mt-12 grid grid-cols-2 gap-px border border-ink-line bg-ink-line sm:grid-cols-3 lg:grid-cols-5">
            {services.map((s, i) => (
              <div key={s} className="bg-ink p-5">
                <p className="font-mono text-[10px] tracking-[0.15em] text-paper-faint">
                  {t.labCta.services[i]}
                </p>
                <p className="mt-2 text-2xl font-extrabold">{CREDIT_COSTS[s]}</p>
                <p className="mt-0.5 text-xs text-paper-faint">{t.labCta.creditUnit}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/test"
              className="bg-lime px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-lime-deep"
            >
              {t.labCta.ctaOpen}
            </Link>
            <Link
              href="/signup"
              className="border border-ink-line px-6 py-3.5 text-base font-semibold text-paper-dim transition-colors hover:border-lime hover:text-lime"
            >
              {t.labCta.ctaSignup}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
