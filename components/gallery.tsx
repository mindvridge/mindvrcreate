import PersonaCard from "./persona-card";
import Reveal from "./reveal";
import SectionHeader from "./section-header";

// 마브 API(daVinci-MagiHuman)로 제작한 페르소나별 한국어 발화 데모.
const personas = [
  {
    label: "상담사",
    en: "COUNSELOR",
    tc: "00:00:06:00",
    img: "/images/persona-counselor-poster.jpg",
    videoSrc: "/videos/persona-counselor.mp4",
  },
  {
    label: "면접관",
    en: "INTERVIEWER",
    tc: "00:00:06:00",
    img: "/images/persona-interviewer-poster.jpg",
    videoSrc: "/videos/persona-interviewer.mp4",
  },
  {
    label: "인플루언서",
    en: "INFLUENCER",
    tc: "00:00:06:00",
    img: "/images/persona-influencer-poster.jpg",
    videoSrc: "/videos/persona-influencer.mp4",
  },
  {
    label: "디지털트윈",
    en: "DIGITAL TWIN",
    tc: "00:00:06:00",
    img: "/images/persona-twin-poster.jpg",
    videoSrc: "/videos/persona-twin.mp4",
  },
];

const useCases = [
  "유튜브 채널 운영",
  "인스타그램·SNS 숏폼",
  "블로그 영상",
  "제품 소개·광고 영상",
  "브랜드 안내",
];

export default function Gallery() {
  return (
    <section id="demos" className="border-t border-ink-line bg-ink-soft/60">
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <SectionHeader
          index="02"
          label="AI HUMANS"
          title="사람 없이 만드는 AI 마케팅 콘텐츠"
          lede={
            <>
              실사 수준의 AI 휴먼이 대본을 말하는 영상을 만들어 드립니다. SNS·블로그·유튜브
              홍보 영상, 제품 소개, 브랜드 메시지를 촬영 인력이나 장비 없이 제작할 수
              있습니다. 대본만 입력하면 AI 휴먼이 말하는 영상이 완성됩니다. 외주 제작이나
              반복 촬영 없이, 필요할 때마다 빠르게 콘텐츠를 만들 수 있습니다.
            </>
          }
        />

        <div className="mt-14 grid grid-cols-2 gap-px border border-ink-line bg-ink-line lg:grid-cols-4">
          {personas.map((p, i) => (
            <Reveal key={p.en} delay={i * 60}>
              <PersonaCard {...p} />
            </Reveal>
          ))}
        </div>

        {/* 활용 예시 */}
        <Reveal delay={120}>
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
