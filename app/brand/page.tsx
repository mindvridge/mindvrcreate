import type { Metadata } from "next";
import Link from "next/link";
import Em from "@/components/em";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Reveal from "@/components/reveal";
import SectionHeader from "@/components/section-header";
import { TEST_LAB_ENABLED } from "@/lib/features";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.brandTitle, description: t.meta.brandDescription };
}

const PRODUCT_URLS = ["https://mindvridge.com/", "http://mindprep.co.kr/", "https://mindvr.co.kr/meditation"];

export default async function BrandPage() {
  const t = await getDict();
  const b = t.brand;
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        {/* 인트로 */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <Reveal>
            <div className="border-b border-ink-line pb-4">
              <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
                <span className="text-lime">BRAND</span>
                <span className="mx-2">—</span>
                {b.eyebrow}
              </p>
            </div>
            <h1 className="mt-10 max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
              <Em t={b.title} />
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper-dim">{b.lede}</p>
          </Reveal>
        </section>

        {/* 브랜드 이야기 */}
        <section className="border-t border-ink-line bg-ink-soft/60">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <SectionHeader index="01" label="WHO WE ARE" title={b.whoTitle} />
            <Reveal delay={80}>
              <div className="mt-10 grid max-w-4xl gap-6 text-lg leading-relaxed text-paper-dim">
                {b.whoParagraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* 하는 일 */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <SectionHeader index="02" label="WHAT WE DO" title={b.doTitle} lede={b.doLede} />
          <Reveal delay={80}>
            <div className="mt-12 grid gap-px border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
              {b.doings.map((d) => (
                <div key={d.tag} className="bg-ink p-8">
                  <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">{d.tag}</p>
                  <h3 className="mt-3 text-xl font-bold">{d.title}</h3>
                  <p className="mt-3 leading-relaxed text-paper-dim">{d.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 운영 중인 서비스 */}
        <section className="border-t border-ink-line bg-ink-soft/60">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <SectionHeader index="03" label="PRODUCTS" title={b.productsTitle} lede={b.productsLede} />
            <Reveal delay={80}>
              <div className="mt-12 grid gap-px border border-ink-line bg-ink-line sm:grid-cols-3">
                {b.products.map((p, i) => (
                  <a
                    key={p.tag}
                    href={PRODUCT_URLS[i]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col bg-ink p-8 transition-colors hover:bg-ink-raise"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">{p.tag}</p>
                      <span className="border border-lime/40 px-2 py-0.5 font-mono text-[10px] tracking-widest text-lime">
                        {b.operating}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold transition-colors group-hover:text-lime">{p.name}</h3>
                    <p className="mt-3 flex-1 leading-relaxed text-paper-dim">{p.body}</p>
                    <span className="mt-5 font-mono text-xs tracking-wider text-paper-faint transition-colors group-hover:text-lime">
                      {b.goto}
                    </span>
                  </a>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 text-sm text-paper-faint">
                {b.prepNote}{" "}
                <a
                  href="https://mindvr.co.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lime underline-offset-4 hover:underline"
                >
                  {b.officialSite}
                </a>
              </p>
            </Reveal>
          </div>
        </section>

        {/* 신뢰 */}
        <section className="border-t border-ink-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <SectionHeader index="04" label="WHY US" title={b.whyTitle} />
            <Reveal delay={80}>
              <div className="mt-12 grid gap-px border border-ink-line bg-ink-line sm:grid-cols-3">
                {b.facts.map((f) => (
                  <div key={f.label} className="bg-ink p-8">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">{f.label}</p>
                    <p className="mt-3 text-lg font-bold">{f.value}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:py-28">
          <Reveal>
            <h2 className="text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">{b.ctaTitle}</h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-paper-dim">{b.ctaLede}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href={TEST_LAB_ENABLED ? "/test" : "/avatar"} className="bg-lime px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-lime-deep">
                {b.ctaButton}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
