import SectionHeader from "./section-header";

const faqs = [
  {
    q: "무료 데모는 정말 무료인가요? 조건이 있나요?",
    a: "네, 무료입니다. 캐릭터 1종으로 한국어로 말하는 30초 영상 1컷을 제작해 드립니다. 품질을 직접 본 뒤에 진행 여부를 결정하시면 됩니다. 시안에는 워터마크가 포함됩니다.",
  },
  {
    q: "캐릭터와 제작된 영상의 저작권은 누구 소유인가요?",
    a: "정식 제작 건의 영상과 캐릭터 IP는 100% 고객에게 귀속되며, 계약서에 명시합니다. 상업적 이용·2차 활용 모두 자유롭고, 저희 플랫폼에 종속되지 않습니다.",
  },
  {
    q: "완성된 영상은 어디에 쓸 수 있나요?",
    a: "광고·SNS·홈페이지·앱 내 콘텐츠·IR 등 상업적 용도 전부 가능합니다. 용도 제한이나 추가 사용료가 없습니다.",
  },
  {
    q: "실시간으로 대화하는 아바타도 가능한가요?",
    a: "현재 메인 상품은 고품질 영상 아바타입니다. 실시간 대화형 AI 휴먼(면접·문진·상담·튜터)은 정부 R&D 과제를 기반으로 준비하고 있습니다. 도입 계획이 있다면 미리 상담해 주세요.",
  },
  {
    q: "사람 사진이 아니라 캐릭터·일러스트도 되나요?",
    a: "가능합니다. 실사 인물, 2D/3D 캐릭터, 일러스트 모두 아바타화할 수 있으며, 멀티 캐릭터 대화 장면도 제작합니다.",
  },
  {
    q: "모두의창업 1차 통과 창업자 혜택은 무엇인가요?",
    a: "같은 프로그램을 통과한 동료 창업자에게 스타트업 플랜 전용 할인을 제공합니다. 데모 신청 시 체크박스에 표시해 주시면 적용해 드립니다.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="border-t border-ink-line bg-ink-soft/40">
      <div className="mx-auto max-w-4xl px-5 py-24 sm:py-32">
        <SectionHeader index="08" label="FAQ" title="자주 묻는 질문" />

        <div className="mt-12 divide-y divide-ink-line border-y border-ink-line">
          {faqs.map((f, i) => (
            <details key={f.q} className="group py-2">
              <summary className="flex cursor-pointer list-none items-baseline gap-5 py-4 text-base font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-xs text-paper-faint/60">
                  Q.{String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{f.q}</span>
                <span className="faq-chevron shrink-0 font-mono text-lg text-paper-faint transition-transform">
                  +
                </span>
              </summary>
              <p className="pb-5 pl-12 leading-relaxed text-paper-dim sm:pl-[60px]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
