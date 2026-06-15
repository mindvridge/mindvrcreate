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

export default function Gallery() {
  return (
    <section id="demos" className="border-t border-ink-line bg-ink-soft/60">
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <SectionHeader
          index="02"
          label="AI HUMANS"
          title="아래 인물은 전부, 실존하지 않습니다."
          lede={
            <>
              모두 AI로 만들어진 가상 인물입니다. 마우스를 올리면 한국어로 직접
              말합니다. 당신의 서비스에 필요한 페르소나도 이렇게 만들 수 있습니다 —{" "}
              <a href="/test" className="font-semibold text-lime underline-offset-4 hover:underline">
                테스트 랩에서 직접
              </a>{" "}
              만들어 보세요.
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
      </div>
    </section>
  );
}
