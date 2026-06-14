import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { SIGNUP_BONUS } from "@/lib/credits";

export const metadata: Metadata = {
  title: "회원가입 — 마인드브이알 MindVR",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <section className="mx-auto max-w-md px-5 py-20">
          <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
            <span className="text-lime">SIGN UP</span>
          </p>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">회원가입</h1>
          <p className="mt-3 mb-10 text-sm leading-relaxed text-paper-dim">
            가입하면 <span className="font-semibold text-lime">{SIGNUP_BONUS} 크레딧</span>을 무료로
            드립니다. 음성·이미지·영상·아바타를 바로 만들어 보세요.
          </p>
          <AuthForm mode="signup" />
        </section>
      </main>
      <Footer />
    </>
  );
}
