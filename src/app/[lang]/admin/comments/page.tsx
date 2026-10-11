import { AdminComments } from "@/components/admin/AdminComments";
import { getI18n } from "@/i18n/dictionaries";

export default async function AdminCommentsPage() {
  const { lang, dict } = await getI18n();
  return <AdminComments lang={lang} dict={dict.admin} />;
}
