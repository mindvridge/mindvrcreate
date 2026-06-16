import type { Metadata } from "next";
import Footer from "@/components/footer";
import Header from "@/components/header";
import TestLab from "@/components/test-lab";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: t.appMeta.testTitle,
    description: t.appMeta.testDescription,
    robots: { index: false },
  };
}

export default async function TestPage() {
  const t = await getDict();
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <section className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
          <div className="border-b border-ink-line pb-4">
            <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
              <span className="text-lime">LAB</span>
              <span className="mx-2">—</span>
              LIVE TEST
            </p>
          </div>
          <h1 className="mt-10 text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
            {t.testPage.heading}
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-paper-dim">{t.testPage.lede}</p>

          <div className="mt-12">
            <TestLab />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
