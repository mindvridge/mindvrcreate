"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type AuthLabels = {
  name: string;
  namePlaceholder: string;
  email: string;
  password: string;
  passwordPlaceholder: string;
  processing: string;
  signupSubmit: string;
  loginSubmit: string;
  genericError: string;
  requestError: string;
  haveAccount: string;
  noAccount: string;
  toLogin: string;
  toSignup: string;
};

const inputCls =
  "w-full border-0 border-b border-ink-line bg-transparent px-1 py-3 text-sm text-paper placeholder:text-paper-faint focus:border-lime focus:outline-none transition-colors";

export default function AuthForm({
  mode,
  t,
  bonus,
}: {
  mode: "login" | "signup";
  t: AuthLabels;
  bonus: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const payload = {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      ...(isSignup ? { name: String(data.get("name") ?? "") } : {}),
    };
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? t.genericError);
        setBusy(false);
        return;
      }
      // 가입/로그인 후 새로고침으로 헤더 상태 갱신 + 테스트 랩 이동
      router.push("/test");
      router.refresh();
    } catch {
      setError(t.requestError);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSignup && (
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">{t.name}</p>
          <input name="name" required placeholder={t.namePlaceholder} className={inputCls} autoComplete="name" />
        </div>
      )}
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">{t.email}</p>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={inputCls}
          autoComplete="email"
        />
      </div>
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">{t.password}</p>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder={t.passwordPlaceholder}
          className={inputCls}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-lime px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
      >
        {busy
          ? t.processing
          : isSignup
            ? t.signupSubmit.replace("{bonus}", String(bonus))
            : t.loginSubmit}
      </button>

      <p className="text-center text-sm text-paper-faint">
        {isSignup ? (
          <>
            {t.haveAccount}{" "}
            <Link href="/login" className="font-semibold text-lime">
              {t.toLogin}
            </Link>
          </>
        ) : (
          <>
            {t.noAccount}{" "}
            <Link href="/signup" className="font-semibold text-lime">
              {t.toSignup}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
