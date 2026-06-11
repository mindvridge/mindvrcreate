import Reveal from "./reveal";
import SectionHeader from "./section-header";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// 데모 영상이 확보되면 각 항목에 videoSrc를 추가하고 호버 재생으로 교체한다.
const personas = [
  { label: "상담사", en: "COUNSELOR", tc: "00:00:12:08", img: "persona-counselor.jpg" },
  { label: "면접관", en: "INTERVIEWER", tc: "00:00:31:16", img: "persona-interviewer.jpg" },
  { label: "인플루언서", en: "INFLUENCER", tc: "00:01:02:04", img: "persona-influencer.jpg" },
  { label: "디지털트윈", en: "DIGITAL TWIN", tc: "00:00:45:20", img: "persona-twin.jpg" },
];

export default function Gallery() {
  return (
    <section id="demos" className="border-t border-ink-line bg-ink-soft/60">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <SectionHeader
          index="04"
          label="AI HUMANS"
          title="아래 인물은 전부, 실존하지 않습니다."
          lede={
            <>
              모두 AI로 만들어진 가상 인물입니다. 당신의 서비스에 필요한 페르소나도
              이렇게 만들 수 있습니다 —{" "}
              <a
                href="#demo-request"
                className="font-semibold text-lime underline-offset-4 hover:underline"
              >
                무료 데모를 신청
              </a>
              하면 당신의 캐릭터로 한국어로 말하는 첫 컷을 보내드립니다.
            </>
          }
        />

        <div className="mt-14 grid grid-cols-2 gap-px border border-ink-line bg-ink-line lg:grid-cols-4">
          {personas.map((p, i) => (
            <Reveal key={p.en} delay={i * 60}>
              <div className="group relative aspect-[3/4] overflow-hidden bg-ink">
                <img
                  src={`${BASE}/images/${p.img}`}
                  alt={`AI 생성 가상 인물 — ${p.label}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                  <div>
                    <p className="text-sm font-bold text-white">{p.label}</p>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-white/70">{p.en}</p>
                  </div>
                  <p className="font-mono text-[10px] text-white/70">{p.tc}</p>
                </div>

                <span className="absolute right-3 top-3 rounded-sm bg-black/45 px-2 py-0.5 font-mono text-[9px] tracking-widest text-white/85 backdrop-blur-sm">
                  AI GENERATED
                </span>
                <span className="absolute left-3 top-3 live-dot h-1.5 w-1.5 rounded-full bg-lime opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
