import Link from "next/link";
import { CREDIT_COSTS, SERVICE_LABELS, type Service } from "@/lib/credits";
import Reveal from "./reveal";

const services: Service[] = ["tts", "llm", "image", "video", "avatar"];

// 홈페이지 '직접 체험' 밴드 — 테스트 랩(/test)으로 가는 눈에 띄는 진입점.
export default function LabCta() {
  return (
    <section id="lab" className="border-y border-ink-line bg-ink-soft/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
        <Reveal>
          <div className="flex items-baseline justify-between border-b border-ink-line pb-4">
            <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
              <span className="text-lime">LIVE LAB</span>
              <span className="mx-2">—</span>
              직접 체험
            </p>
            <span className="hidden font-mono text-[10px] tracking-[0.25em] text-paper-faint/60 sm:block">
              로그인 시 100 크레딧 무료
            </span>
          </div>

          <h2 className="mt-10 max-w-3xl text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
            음성·대화·이미지·영상·아바타,
            <br />
            <span className="text-lime">지금 직접</span> 만들어 보세요.
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-paper-dim">
            설명 대신 결과로 확인하세요. 마인드브이알 생성 스튜디오에 실시간 연결된
            테스트 랩에서 5가지를 직접 만들어 볼 수 있습니다. 회원가입하면 100 크레딧을
            무료로 드립니다.
          </p>
        </Reveal>

        {/* 5가지 기능 — 헤어라인 그리드 */}
        <Reveal delay={80}>
          <div className="mt-12 grid grid-cols-2 gap-px border border-ink-line bg-ink-line sm:grid-cols-3 lg:grid-cols-5">
            {services.map((s) => (
              <div key={s} className="bg-ink p-5">
                <p className="font-mono text-[10px] tracking-[0.15em] text-paper-faint">
                  {SERVICE_LABELS[s]}
                </p>
                <p className="mt-2 text-2xl font-extrabold">{CREDIT_COSTS[s]}</p>
                <p className="mt-0.5 text-xs text-paper-faint">크레딧 / 회</p>
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
              테스트 랩 열기
            </Link>
            <Link
              href="/signup"
              className="border border-ink-line px-6 py-3.5 text-base font-semibold text-paper-dim transition-colors hover:border-lime hover:text-lime"
            >
              회원가입 · 100 크레딧
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
