import LeadForm from "./lead-form";
import Reveal from "./reveal";

export default function FinalCta() {
  return (
    <section id="demo-request" className="mx-auto max-w-3xl px-5 py-24 sm:py-32">
      <Reveal>
        <div className="border-b border-ink-line pb-4">
          <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
            <span className="text-lime">09</span>
            <span className="mx-2">—</span>
            FREE DEMO
          </p>
        </div>
        <h2 className="mt-10 text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
          당신의 캐릭터가 한국어로 말하는
          <br />
          <span className="text-lime">30초</span>를, 무료로 받아보세요.
        </h2>
        <p className="mt-5 max-w-xl leading-relaxed text-paper-dim">
          긴 설명 대신 결과물로 보여드리겠습니다. 신청 후 캐릭터·대본만 보내주시면
          한국어로 자연스럽게 말하는 데모 영상 1컷을 제작해 드립니다.
          모두의창업 1차 통과 창업자에게는 전용 혜택이 있습니다.
        </p>
        <LeadForm />
      </Reveal>
    </section>
  );
}
