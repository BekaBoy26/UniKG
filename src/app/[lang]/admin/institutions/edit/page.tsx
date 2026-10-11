import { Suspense } from "react";
import { AdminInstitutionForm } from "@/components/admin/AdminInstitutionForm";
import { getI18n } from "@/i18n/dictionaries";

type SearchParams = PageProps<"/[lang]/admin/institutions/edit">["searchParams"];

// ?id= читается при запросе — поэтому внутри Suspense (Cache Components)
export default function EditInstitutionPage({ searchParams }: PageProps<"/[lang]/admin/institutions/edit">) {
  return (
    <Suspense>
      <EditInstitution searchParams={searchParams} />
    </Suspense>
  );
}

async function EditInstitution({ searchParams }: { searchParams: SearchParams }) {
  const { id } = await searchParams;
  const { lang, dict } = await getI18n();
  return <AdminInstitutionForm key={String(id)} lang={lang} dict={dict.admin} labels={dict.common} id={typeof id === "string" ? id : ""} />;
}
