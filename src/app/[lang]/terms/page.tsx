import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalPage";
import { legal } from "@/content/legal";
import { getI18n } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  return { title: legal[lang].terms.title, description: legal[lang].terms.lead };
}

export default async function TermsPage() {
  const { lang, dict } = await getI18n();
  return <LegalDocument lang={lang} home={dict.nav.home} doc="terms" />;
}
