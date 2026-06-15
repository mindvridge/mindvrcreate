"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * 무료 데모 CTA — 로그인 상태에 따라 분기.
 * - 비로그인: /signup (회원가입)
 * - 로그인:   /test (테스트 랩)
 * href는 접근성/SEO용으로 채우되, onClick에서 클릭 시점에 한 번 더 확인해 정확히 라우팅한다.
 */
export default function DemoCta({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.user))
      .catch(() => setLoggedIn(false));
  }, []);

  const go = async (e: React.MouseEvent) => {
    e.preventDefault();
    let li = loggedIn;
    if (li === null) {
      try {
        const d = await fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json());
        li = !!d.user;
      } catch {
        li = false;
      }
    }
    router.push(li ? "/test" : "/signup");
  };

  return (
    <a href={loggedIn ? "/test" : "/signup"} onClick={go} className={className}>
      {children}
    </a>
  );
}
