import type { Metadata } from "next";
import Footer from "@/components/footer";
import Header from "@/components/header";
import TestLab from "@/components/test-lab";

export const metadata: Metadata = {
  title: "테스트 랩 — 마인드브이알 MindVR",
  description: "마인드브이알의 음성·대화·이미지·영상·아바타 생성 기술을 직접 테스트해 보세요.",
  robots: { index: false },
};

export default function TestPage() {
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
            직접 만들어 보세요.
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-paper-dim">
            마인드브이알의 생성 스튜디오에 실시간으로 연결된 테스트 페이지입니다.
            음성·대화·이미지·영상·아바타를 직접 만들어 품질을 확인해 보세요.
            모든 결과물은 GPU에서 즉석 생성됩니다.
          </p>

          <div className="mt-12">
            <TestLab />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
