import { AdminInstitutionList } from "@/components/admin/AdminInstitutionList";
import { getI18n } from "@/i18n/dictionaries";

export default async function AdminUniversitiesPage() {
  const { lang, dict } = await getI18n();
  return <AdminInstitutionList lang={lang} type="university" dict={dict.admin} labels={dict.common} />;
}
