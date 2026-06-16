import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountPanel from "@/components/account-panel";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.appMeta.accountTitle, robots: { index: false } };
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <section className="mx-auto max-w-4xl px-5 py-16">
          <div className="border-b border-ink-line pb-4">
            <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
              <span className="text-lime">ACCOUNT</span>
              <span className="mx-2">—</span>
              {user.name}
            </p>
          </div>
          <AccountPanel
            initialCredits={user.credits}
            unlimited={user.unlimited === 1}
            name={user.name}
            email={user.email}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
