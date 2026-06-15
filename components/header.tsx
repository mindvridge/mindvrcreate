import Link from "next/link";
import AccountMenu from "./account-menu";

const nav = [
  { href: "/brand", label: "브랜드 소개" },
  { href: "/#value", label: "왜 마인드브이알" },
  { href: "/#usecases", label: "활용 사례" },
  { href: "/#demos", label: "데모" },
  { href: "/#pricing", label: "가격" },
  { href: "/test", label: "테스트 랩" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink-line/60 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/#top" className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight">MindVR</span>
          <span className="hidden text-xs text-paper-faint sm:inline">마인드브이알</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-paper-dim lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-lime">
              {item.label}
            </Link>
          ))}
        </nav>

        <AccountMenu />
      </div>
    </header>
  );
}
