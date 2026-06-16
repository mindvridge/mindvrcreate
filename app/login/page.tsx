import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { SIGNUP_BONUS } from "@/lib/credits";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.appMeta.loginTitle, robots: { index: false } };
}

export default async function LoginPage() {
  const t = await getDict();
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <section className="mx-auto max-w-md px-5 py-20">
          <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
            <span className="text-lime">LOGIN</span>
          </p>
          <h1 className="mt-6 mb-10 text-3xl font-extrabold tracking-tight">{t.auth.loginHeading}</h1>
          <AuthForm mode="login" t={t.auth} bonus={SIGNUP_BONUS} />
        </section>
      </main>
      <Footer />
    </>
  );
}
