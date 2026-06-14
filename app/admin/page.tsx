import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "관리자 — 마인드브이알 MindVR",
  robots: { index: false },
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.is_admin) redirect("/");

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="border-b border-ink-line pb-4">
            <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
              <span className="text-lime">ADMIN</span>
              <span className="mx-2">—</span>
              CREDITS & USAGE
            </p>
          </div>
          <h1 className="mt-8 text-3xl font-extrabold tracking-tight">관리자</h1>
          <p className="mt-3 text-sm text-paper-dim">
            사용자 크레딧 충전, 무제한 권한 부여, 서비스별 사용 로그를 관리합니다.
          </p>
          <div className="mt-10">
            <AdminDashboard />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
