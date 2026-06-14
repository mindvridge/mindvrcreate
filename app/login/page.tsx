import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";
import Footer from "@/components/footer";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "로그인 — 마인드브이알 MindVR",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <section className="mx-auto max-w-md px-5 py-20">
          <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
            <span className="text-lime">LOGIN</span>
          </p>
          <h1 className="mt-6 mb-10 text-3xl font-extrabold tracking-tight">로그인</h1>
          <AuthForm mode="login" />
        </section>
      </main>
      <Footer />
    </>
  );
}
