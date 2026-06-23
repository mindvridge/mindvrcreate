import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Reveal from "@/components/reveal";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.appMeta.avatarTitle };
}

export default async function AvatarPage() {
  const t = await getDict();
  const a = t.avatarPage;
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-5 py-24 text-center sm:py-32">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.3em] text-lime">{a.comingSoon}</p>
            <p className="mt-6 font-mono text-[11px] tracking-[0.25em] text-paper-faint">{a.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{a.title}</h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-paper-dim">{a.lede}</p>

            {/* 라이브 도트 모티프 */}
            <div className="mt-8 flex items-center justify-center gap-2 text-paper-faint">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-lime" />
              <span className="font-mono text-[11px] tracking-[0.2em]">IN DEVELOPMENT</span>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="mailto:mindvridge.official@gmail.com?subject=%5BMindVR%5D%20AI%20%EC%95%84%EB%B0%94%ED%83%80%20%EB%8F%84%EC%9E%85%20%EB%AC%B8%EC%9D%98"
                className="bg-lime px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-lime-deep"
              >
                {a.contact}
              </a>
              <Link
                href="/"
                className="border border-ink-line px-6 py-3.5 text-base font-semibold text-paper-dim transition-colors hover:border-lime hover:text-lime"
              >
                {a.backHome}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
