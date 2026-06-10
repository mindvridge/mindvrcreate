/** 모바일 전용 sticky CTA — 디자인 결정 8 (모바일 별도 설계). */
export default function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-line bg-ink/90 p-3 backdrop-blur lg:hidden">
      <a
        href="#demo-request"
        className="block bg-lime px-5 py-3 text-center text-sm font-bold text-ink"
      >
        무료 아바타 데모 받기 — 30초 1컷
      </a>
    </div>
  );
}
