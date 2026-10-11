import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getI18n } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.admin.title, robots: { index: false, follow: false } };
}

export default async function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  const { lang, dict } = await getI18n();
  return (
    <AdminShell lang={lang} dict={dict.admin} settings={dict.settings} auth={dict.auth} toHome={dict.nav.toHome} account={dict.nav.account}>
      {children}
    </AdminShell>
  );
}
