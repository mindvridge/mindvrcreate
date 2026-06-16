import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.appMeta.adminTitle, robots: { index: false } };
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.is_admin) redirect("/");
  const t = await getDict();

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
          <h1 className="mt-8 text-3xl font-extrabold tracking-tight">{t.adminPage.heading}</h1>
          <p className="mt-3 text-sm text-paper-dim">{t.adminPage.lede}</p>
          <div className="mt-10">
            <AdminDashboard t={t.admin} serviceLabels={t.serviceLabels} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
