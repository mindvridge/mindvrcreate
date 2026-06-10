import Reveal from "./reveal";
import Waveform from "./waveform";

// 데모 영상이 확보되면 각 항목에 videoSrc를 추가하고 호버 재생으로 교체한다.
const personas = [
  { label: "상담사", en: "COUNSELOR", tc: "00:00:12:08" },
  { label: "면접관", en: "INTERVIEWER", tc: "00:00:31:16" },
  { label: "인플루언서", en: "INFLUENCER", tc: "00:01:02:04" },
  { label: "디지털트윈", en: "DIGITAL TWIN", tc: "00:00:45:20" },
];

export default function Gallery() {
  return (
    <section id="demos" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">DEMO REEL</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
            말은 데모가 합니다.
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-paper-dim">
            페르소나별 한국어 데모 릴을 준비하고 있습니다. 기다릴 필요는 없습니다 —{" "}
            <a href="#demo-request" className="font-semibold text-lime underline-offset-4 hover:underline">
              무료 데모를 신청
            </a>
            하면 당신의 캐릭터로 첫 컷을 만들어 드립니다.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {personas.map((p, i) => (
            <Reveal key={p.en} delay={i * 80}>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-ink-line bg-ink transition-colors hover:border-lime/60">
                <div className="flex h-full flex-col items-center justify-center gap-4 px-4">
                  <Waveform bars={14} className="text-paper-faint transition-colors group-hover:text-lime" />
                  <p className="font-mono text-[10px] tracking-[0.25em] text-paper-faint">
                    IN PRODUCTION
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                  <div>
                    <p className="text-sm font-bold">{p.label}</p>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">{p.en}</p>
                  </div>
                  <p className="font-mono text-[10px] text-paper-faint">{p.tc}</p>
                </div>
                <span className="absolute left-4 top-4 live-dot h-1.5 w-1.5 rounded-full bg-lime opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
