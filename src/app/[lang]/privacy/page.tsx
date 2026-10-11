import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalPage";
import { legal } from "@/content/legal";
import { getI18n } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  return { title: legal[lang].privacy.title, description: legal[lang].privacy.lead };
}

export default async function PrivacyPage() {
  const { lang, dict } = await getI18n();
  return <LegalDocument lang={lang} home={dict.nav.home} doc="privacy" />;
}
