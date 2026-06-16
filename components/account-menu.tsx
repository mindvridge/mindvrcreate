"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Me = {
  id: string;
  name: string;
  email: string;
  credits: number;
  unlimited: number;
  is_admin: number;
};

type AccountLabels = {
  unlimited: string;
  unlimitedUse: string;
  creditsSuffix: string;
  lab: string;
  account: string;
  admin: string;
  logout: string;
};

export default function AccountMenu({
  t,
  loginLabel,
  signupLabel,
}: {
  t: AccountLabels;
  loginLabel: string;
  signupLabel: string;
}) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined); // undefined=로딩, null=비로그인
  const [open, setOpen] = useState(false);

  const load = () =>
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));

  useEffect(() => {
    load();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  if (me === undefined) return <span className="h-9 w-20" />;

  if (!me) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="hidden text-sm text-paper-dim hover:text-lime sm:inline">
          {loginLabel}
        </Link>
        <Link
          href="/signup"
          className="bg-lime px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-lime-deep"
        >
          {signupLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-ink-line px-3 py-2 text-sm transition-colors hover:border-lime"
      >
        <span className="font-mono text-xs text-lime">
          {me.unlimited ? t.unlimited : `${me.credits.toLocaleString()} CR`}
        </span>
        <span className="hidden text-paper-dim sm:inline">{me.name}</span>
        <span className="text-paper-faint">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-52 border border-ink-line bg-ink shadow-lg">
            <div className="border-b border-ink-line px-4 py-3">
              <p className="truncate text-sm font-semibold">{me.name}</p>
              <p className="truncate text-xs text-paper-faint">{me.email}</p>
              <p className="mt-2 font-mono text-xs text-lime">
                {me.unlimited ? t.unlimitedUse : `${me.credits.toLocaleString()} ${t.creditsSuffix}`}
              </p>
            </div>
            <Link href="/test" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-ink-soft">
              {t.lab}
            </Link>
            <Link href="/account" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-ink-soft">
              {t.account}
            </Link>
            {me.is_admin === 1 && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-lime hover:bg-ink-soft"
              >
                {t.admin}
              </Link>
            )}
            <button
              onClick={logout}
              className="block w-full border-t border-ink-line px-4 py-2.5 text-left text-sm text-paper-dim hover:bg-ink-soft"
            >
              {t.logout}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
