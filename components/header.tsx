const nav = [
  { href: "#value", label: "왜 마인드브이알" },
  { href: "#usecases", label: "유스케이스" },
  { href: "#demos", label: "데모" },
  { href: "#process", label: "작동 방식" },
  { href: "#pricing", label: "가격" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink-line/60 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight">MindVR</span>
          <span className="hidden text-xs text-paper-faint sm:inline">마인드브이알</span>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-paper-dim lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-lime">
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#demo-request"
          className="bg-lime px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-lime-deep"
        >
          무료 데모 신청
        </a>
      </div>
    </header>
  );
}
