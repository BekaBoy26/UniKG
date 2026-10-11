import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { LegalLayout } from "@/components/LegalPage";
import { legal } from "@/content/legal";
import { getI18n } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  return { title: legal[lang].faq.title, description: legal[lang].faq.lead };
}

export default async function FaqPage() {
  const { lang, dict } = await getI18n();
  const { title, lead, items } = legal[lang].faq;
  return (
    <LegalLayout lang={lang} home={dict.nav.home} title={title} lead={lead}>
      {/* details/summary — раскрытие без JS, работает с клавиатуры */}
      <div className="faq-list">
        {items.map(({ q, a }) => (
          <details key={q} className="faq-item">
            <summary>{q}<Icon name="plus" size={18} /></summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </LegalLayout>
  );
}
