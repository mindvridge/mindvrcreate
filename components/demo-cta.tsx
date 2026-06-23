"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TEST_LAB_ENABLED } from "@/lib/features";

/**
 * 무료 데모 CTA.
 * - 테스트 랩 비활성화 시: 항상 '아바타'(개발 예정) 페이지로 이동.
 * - 활성화 시: 비로그인 → /signup, 로그인 → /test 로 분기.
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
    if (!TEST_LAB_ENABLED) return;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.user))
      .catch(() => setLoggedIn(false));
  }, []);

  // 비활성화 모드: 단순 링크로 아바타 페이지 연결
  if (!TEST_LAB_ENABLED) {
    return (
      <Link href="/avatar" className={className}>
        {children}
      </Link>
    );
  }

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
