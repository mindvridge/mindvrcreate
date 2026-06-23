import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth-form";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { SIGNUP_BONUS } from "@/lib/credits";
import { SIGNUP_ENABLED } from "@/lib/features";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.appMeta.signupTitle, robots: { index: false } };
}

export default async function SignupPage() {
  if (!SIGNUP_ENABLED) redirect("/login"); // 회원가입 비활성화
  const t = await getDict();
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <section className="mx-auto max-w-md px-5 py-20">
          <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
            <span className="text-lime">SIGN UP</span>
          </p>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">{t.auth.signupHeading}</h1>
          <p className="mt-3 mb-10 text-sm leading-relaxed text-paper-dim">
            {t.auth.signupLede.split("{bonus}")[0]}
            <span className="font-semibold text-lime">{SIGNUP_BONUS}</span>
            {t.auth.signupLede.split("{bonus}")[1]}
          </p>
          <AuthForm mode="signup" t={t.auth} bonus={SIGNUP_BONUS} />
        </section>
      </main>
      <Footer />
    </>
  );
}
