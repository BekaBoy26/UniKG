import { AdminOverview } from "@/components/admin/AdminOverview";
import { getI18n } from "@/i18n/dictionaries";

export default async function AdminPage() {
  const { lang, dict } = await getI18n();
  return <AdminOverview lang={lang} dict={dict.admin} />;
}
