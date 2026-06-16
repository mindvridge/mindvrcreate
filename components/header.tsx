import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n-server";
import AccountMenu from "./account-menu";
import LangSwitcher from "./lang-switcher";

export default async function Header() {
  const t = await getDict();
  const locale = await getLocale();
  const nav = [
    { href: "/brand", label: t.nav.items.brand },
    { href: "/#value", label: t.nav.items.why },
    { href: "/#usecases", label: t.nav.items.usecases },
    { href: "/#demos", label: t.nav.items.demos },
    { href: "/#pricing", label: t.nav.items.pricing },
    { href: "/test", label: t.nav.items.lab },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink-line/60 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/#top" className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight">MindVR</span>
          <span className="hidden text-xs text-paper-faint sm:inline">{t.nav.brandTag}</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-paper-dim lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-lime">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitcher current={locale} />
          <AccountMenu t={t.account} loginLabel={t.nav.login} signupLabel={t.nav.signup} />
        </div>
      </div>
    </header>
  );
}
