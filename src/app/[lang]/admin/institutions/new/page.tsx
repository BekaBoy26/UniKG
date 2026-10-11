import { Suspense } from "react";
import { AdminInstitutionForm } from "@/components/admin/AdminInstitutionForm";
import { getI18n } from "@/i18n/dictionaries";

type SearchParams = PageProps<"/[lang]/admin/institutions/new">["searchParams"];

// ?type= читается при запросе — поэтому внутри Suspense (Cache Components)
export default function NewInstitutionPage({ searchParams }: PageProps<"/[lang]/admin/institutions/new">) {
  return (
    <Suspense>
      <NewInstitution searchParams={searchParams} />
    </Suspense>
  );
}

async function NewInstitution({ searchParams }: { searchParams: SearchParams }) {
  const { type } = await searchParams;
  const { lang, dict } = await getI18n();
  return <AdminInstitutionForm lang={lang} dict={dict.admin} labels={dict.common} initialType={type === "college" ? "college" : "university"} />;
}
