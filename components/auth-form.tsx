"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const inputCls =
  "w-full border-0 border-b border-ink-line bg-transparent px-1 py-3 text-sm text-paper placeholder:text-paper-faint focus:border-lime focus:outline-none transition-colors";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
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
        setError(json.error ?? "오류가 발생했습니다.");
        setBusy(false);
        return;
      }
      // 가입/로그인 후 새로고침으로 헤더 상태 갱신 + 테스트 랩 이동
      router.push("/test");
      router.refresh();
    } catch {
      setError("요청 중 오류가 발생했습니다.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSignup && (
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">이름</p>
          <input name="name" required placeholder="홍길동" className={inputCls} autoComplete="name" />
        </div>
      )}
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">이메일</p>
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
        <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">비밀번호</p>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="8자 이상"
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
        {busy ? "처리 중…" : isSignup ? "가입하고 100 크레딧 받기" : "로그인"}
      </button>

      <p className="text-center text-sm text-paper-faint">
        {isSignup ? (
          <>
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-semibold text-lime">
              로그인
            </Link>
          </>
        ) : (
          <>
            계정이 없으신가요?{" "}
            <Link href="/signup" className="font-semibold text-lime">
              회원가입
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
