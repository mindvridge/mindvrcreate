"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOCALES, setLocaleCookie, type Locale } from "@/lib/i18n";

const SHORT: Record<Locale, string> = { ko: "한국어", en: "EN", zh: "中文" };

/** 언어 전환기 — 쿠키(mv_lang)에 저장하고 서버 컴포넌트를 새로고침한다. */
export default function LangSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const choose = (l: Locale) => {
    setLocaleCookie(l);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        className="flex items-center gap-1.5 border border-ink-line px-2.5 py-2 text-xs font-semibold text-paper-dim transition-colors hover:border-lime hover:text-lime"
      >
        <span aria-hidden>🌐</span>
        <span>{SHORT[current]}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-28 border border-ink-line bg-ink shadow-lg">
            {LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => choose(l)}
                className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-ink-soft ${
                  l === current ? "font-bold text-lime" : "text-paper-dim"
                }`}
              >
                {SHORT[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
