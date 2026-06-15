import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Reveal from "@/components/reveal";
import SectionHeader from "@/components/section-header";

export const metadata: Metadata = {
  title: "브랜드 소개 — 마인드브이알 MindVR",
  description:
    "마인드브이알(MindVR)은 한국어에 특화된 AI 아바타 스튜디오입니다. 사람처럼 자연스럽게 한국어로 말하는 디지털휴먼을 자체 제작 역량으로 만듭니다.",
};

const doings = [
  { tag: "AI HUMAN", title: "AI 아바타 · 디지털휴먼", body: "캐릭터·브랜드·페르소나에 맞는 전용 디지털휴먼을 설계하고 제작합니다." },
  { tag: "VOICE", title: "한국어 음성(TTS)", body: "한국어의 입모양·억양·호흡에 맞춰 자연스럽게 말하는 음성을 만듭니다." },
  { tag: "IMAGE", title: "이미지 생성", body: "인물·제품·콘셉트 이미지를 생성합니다. API로도 제공합니다." },
  { tag: "VIDEO", title: "영상 생성", body: "아바타 영상은 물론 홍보·콘텐츠 영상까지 제작합니다." },
  { tag: "MUSIC", title: "음악 생성", body: "분위기·장르에 맞는 배경 음악을 생성합니다. API로도 제공합니다." },
  { tag: "LLM", title: "대화형 LLM", body: "한국어 대화·생성을 처리하는 언어모델을 API로 제공합니다." },
];

const products = [
  {
    tag: "MAV",
    name: "메타버스 상담 MAV",
    body: "아바타 기반 익명 심리상담 플랫폼. AI 감정 분석으로 청소년 상담 현장에서 운영되고 있습니다.",
    url: "https://mindvridge.com/",
  },
  {
    tag: "MINDPREP",
    name: "AI 면접훈련 마인드프랩",
    body: "AI 아바타 면접관과의 모의 면접으로 면접 불안을 줄이고, 표정·음성·답변 분석 리포트를 제공합니다.",
    url: "http://mindprep.co.kr/",
  },
  {
    tag: "VR MEDITATION",
    name: "마음챙김 VR 명상",
    body: "자연 환경의 몰입형 VR로 명상과 이완을 훈련하는 프로그램입니다.",
    url: "https://mindvr.co.kr/meditation",
  },
];

const facts = [
  { label: "GOV R&D", value: "정부 R&D 과제 수행" },
  { label: "PATENT", value: "특허 출원 2건" },
  { label: "OPERATION", value: "상담·훈련 서비스 운영" },
];

export default function BrandPage() {
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
                브랜드 소개
              </p>
            </div>
            <h1 className="mt-10 max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
              한국어로 말하는 <span className="text-lime">AI 휴먼</span>을 만듭니다.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper-dim">
              마인드브이알(MindVR)은 한국어에 특화된 AI 아바타 스튜디오입니다. 사람처럼
              자연스럽게 한국어로 말하는 디지털휴먼을, 자체 제작 역량으로 합리적 비용에
              만듭니다.
            </p>
          </Reveal>
        </section>

        {/* 브랜드 이야기 */}
        <section className="border-t border-ink-line bg-ink-soft/60">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <SectionHeader index="01" label="WHO WE ARE" title="해외 서비스의 한계를 넘습니다." />
            <Reveal delay={80}>
              <div className="mt-10 grid max-w-4xl gap-6 text-lg leading-relaxed text-paper-dim">
                <p>
                  해외 AI 아바타 서비스는 어색한 한국어, 달러 구독의 부담, 천편일률적인
                  템플릿이라는 한계를 안고 있습니다. 마인드브이알은 한국어 환경에 맞는
                  AI 휴먼을 직접 만들어 이 세 가지를 모두 해결합니다.
                </p>
                <p>
                  정해진 아바타 중에서 고르는 방식이 아니라, 당신의 캐릭터·브랜드·페르소나에
                  맞는 전용 디지털휴먼을 제작합니다. 음성·영상·이미지까지 한 곳에서
                  완성합니다.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 하는 일 */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <SectionHeader
            index="02"
            label="WHAT WE DO"
            title="우리가 만드는 것."
            lede="음성·이미지·영상·음악·LLM까지, AI 휴먼 제작에 필요한 생성 기술을 직접 만들고 API로 제공합니다."
          />
          <Reveal delay={80}>
            <div className="mt-12 grid gap-px border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
              {doings.map((d) => (
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
            <SectionHeader
              index="03"
              label="PRODUCTS"
              title="이미 운영 중인 서비스들."
              lede="아바타·AI를 활용한 상담·훈련 서비스를 직접 운영해 왔습니다. 한국어 사용자와 AI 휴먼을 다뤄 온 경험이 AI 아바타 스튜디오의 바탕입니다."
            />
            <Reveal delay={80}>
              <div className="mt-12 grid gap-px border border-ink-line bg-ink-line sm:grid-cols-3">
                {products.map((p) => (
                  <a
                    key={p.tag}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col bg-ink p-8 transition-colors hover:bg-ink-raise"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">{p.tag}</p>
                      <span className="border border-lime/40 px-2 py-0.5 font-mono text-[10px] tracking-widest text-lime">
                        운영 중
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold transition-colors group-hover:text-lime">{p.name}</h3>
                    <p className="mt-3 flex-1 leading-relaxed text-paper-dim">{p.body}</p>
                    <span className="mt-5 font-mono text-xs tracking-wider text-paper-faint transition-colors group-hover:text-lime">
                      바로가기 →
                    </span>
                  </a>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 text-sm text-paper-faint">
                준비 중 — 프레젠테이션 훈련 · 사회불안 훈련.{" "}
                <a
                  href="https://mindvr.co.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lime underline-offset-4 hover:underline"
                >
                  마인드브이알 공식 사이트 →
                </a>
              </p>
            </Reveal>
          </div>
        </section>

        {/* 신뢰 */}
        <section className="border-t border-ink-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <SectionHeader index="04" label="WHY US" title="검증된 기술력으로 만듭니다." />
            <Reveal delay={80}>
              <div className="mt-12 grid gap-px border border-ink-line bg-ink-line sm:grid-cols-3">
                {facts.map((f) => (
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
            <h2 className="text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
              직접 만들어 보세요.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-paper-dim">
              테스트 랩에서 음성·대화·이미지·영상·아바타를 바로 만들어 볼 수 있습니다.
              회원가입하면 300 크레딧을 무료로 드립니다.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/test" className="bg-lime px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-lime-deep">
                테스트 랩 열기
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
