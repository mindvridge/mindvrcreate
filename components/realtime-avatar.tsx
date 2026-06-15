import Reveal from "./reveal";
import SectionHeader from "./section-header";

// 실시간 양방향 대화 파이프라인 — 듣고(STT) → 이해·생성(LLM) → 말하기(TTS)가 끊김 없이 순환.
const pipeline = [
  { tag: "STT", title: "듣기", body: "사용자의 말을 실시간으로 알아듣습니다." },
  { tag: "LLM", title: "이해·생성", body: "맥락을 이해해 답을 만듭니다." },
  { tag: "TTS", title: "말하기", body: "자연스러운 목소리로 답합니다." },
];

const highlights = [
  "STT·LLM·TTS 실시간 연결",
  "한국인 발화·표정 최적화",
  "사용자 반응 인식 응답",
  "실사형 인터랙티브 아바타",
];

const useCases = [
  "고객 응대 시나리오 연습",
  "채용 모의 면접",
  "직원 교육 및 발표 리허설",
  "서비스 상담 데모",
];

export default function RealtimeAvatar() {
  return (
    <section id="realtime" className="border-t border-ink-line">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <SectionHeader
          index="01"
          label="REALTIME AVATAR"
          title={
            <>
              실시간 인터랙티브 AI 휴먼 —
              <br />
              <span className="text-lime">말로 대화하는</span> AI 직원.
            </>
          }
          lede={
            <>
              음성으로 묻고 답하는 양방향 대화형 AI 휴먼입니다. 고객 상담 데모, 모의
              면접, 교육·발표 연습 상대로 활용할 수 있습니다. 사용자의 말을 알아듣고(STT),
              맥락을 이해해 답을 만들고(LLM), 자연스러운 목소리로 답하는(TTS) 과정이
              실시간으로 이어집니다. 한국인의 발화와 표정에 최적화되어 어색함이 적고,
              사용자의 반응을 인식해 표정과 태도로 응답합니다. 단순 챗봇이 아니라, 실사형
              아바타가 함께하는 인터랙티브 솔루션입니다.
            </>
          }
        />

        {/* 실시간 대화 파이프라인 */}
        <Reveal delay={80}>
          <div className="mt-14">
            <div className="mb-4 flex items-center gap-2">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-lime" />
              <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">
                LIVE · 끊김 없이 실시간으로 순환합니다
              </p>
            </div>
            <div className="grid border border-ink-line bg-ink-line gap-px sm:grid-cols-3">
              {pipeline.map((p, i) => (
                <div key={p.tag} className="relative bg-ink p-8 sm:p-10">
                  <div className="flex items-baseline justify-between">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-lime">{p.tag}</p>
                    <span className="font-mono text-xs text-paper-faint/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-paper-dim">{p.body}</p>
                  {i < pipeline.length - 1 && (
                    <span className="pointer-events-none absolute -right-px top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center bg-ink text-lime sm:flex">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 특징 칩 */}
        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap gap-2">
            {highlights.map((h) => (
              <span
                key={h}
                className="border border-ink-line px-3 py-1.5 text-xs font-semibold text-paper-dim"
              >
                {h}
              </span>
            ))}
          </div>
        </Reveal>

        {/* 활용 예시 */}
        <Reveal delay={160}>
          <div className="mt-12 border-t border-ink-line pt-8">
            <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">활용 예시</p>
            <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {useCases.map((u) => (
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
