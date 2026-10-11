import { AdminUsers } from "@/components/admin/AdminUsers";
import { getI18n } from "@/i18n/dictionaries";

export default async function AdminUsersPage() {
  const { lang, dict } = await getI18n();
  return <AdminUsers lang={lang} dict={dict.admin} />;
}
