import Link from "next/link";
import { getI18n } from "@/i18n/dictionaries";
import { fieldLabels, t, type FieldKey, type InstitutionType } from "@/lib/institutions";
import { getInstitutions } from "@/lib/institutions.server";
import { Directory } from "./Directory";
import { Icon } from "./Icon";
import { toCard } from "./InstitutionCard";
import { ScrollTopButton } from "./ScrollTopButton";

export async function DirectoryPage({ type }: { type: InstitutionType }) {
  const { lang, dict } = await getI18n();
  const university = type === "university";
  const items = (await getInstitutions(type)).map((i) => toCard(i, lang));
  const fieldOptions = (Object.keys(fieldLabels) as FieldKey[]).map((key): [FieldKey, string] => [key, t(fieldLabels[key], lang)]);

  return (
    <main className="directory">
      <div className="breadcrumb">
        <Link href={`/${lang}`}>{dict.nav.home}</Link><Icon name="chevron" size={14} />
        <span>{university ? dict.nav.universities : dict.nav.colleges}</span>
      </div>
      <div className="directory-title">
        <div>
          <span className="section-kicker">{dict.directory.kicker}</span>
          <h1>{university ? dict.directory.universitiesTitle : dict.directory.collegesTitle}</h1>
          <p>{dict.directory.lead}</p>
        </div>
        <div className="title-art"><Icon name={university ? "spark" : "map"} size={32} /></div>
      </div>
      <Directory lang={lang} type={type} items={items} fieldOptions={fieldOptions} dict={dict.directory} labels={dict.common} />
      <ScrollTopButton label={dict.common.toTop} />
    </main>
  );
}

export async function directoryMetadata(type: InstitutionType) {
  const { dict } = await getI18n();
  return { title: type === "university" ? dict.directory.universitiesTitle : dict.directory.collegesTitle };
}
