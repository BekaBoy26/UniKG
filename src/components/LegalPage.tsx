import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { legal } from "@/content/legal";
import { Icon } from "./Icon";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

/** Каркас страниц «Конфиденциальность», «Условия», FAQ: хлебные крошки, заголовок, дата редакции, контакты */
export function LegalLayout({ lang, home, title, lead, children }: { lang: Locale; home: string; title: string; lead: string; children: ReactNode }) {
  const content = legal[lang];
  return (
    <main className="legal-page">
      <div className="breadcrumb">
        <Link href={`/${lang}`}>{home}</Link><Icon name="chevron" size={14} />
        <span>{title}</span>
      </div>
      <header className="legal-head">
        <h1>{title}</h1>
        <p>{lead}</p>
        <span className="legal-updated">{content.updated}</span>
      </header>
      {children}
      {/* Почту для обращений задаёт NEXT_PUBLIC_CONTACT_EMAIL; пока её нет — блок не показываем */}
      {CONTACT_EMAIL && (
        <section className="legal-contact">
          <h2>{content.contactTitle}</h2>
          <p>{content.contactText} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        </section>
      )}
    </main>
  );
}

/** Политика конфиденциальности или условия использования */
export function LegalDocument({ lang, home, doc }: { lang: Locale; home: string; doc: "privacy" | "terms" }) {
  const { title, lead, sections } = legal[lang][doc];
  return (
    <LegalLayout lang={lang} home={home} title={title} lead={lead}>
      <article className="legal-body">
        {sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p?.map((text) => <p key={text}>{text}</p>)}
            {s.list && <ul>{s.list.map((item) => <li key={item}>{item}</li>)}</ul>}
          </section>
        ))}
      </article>
    </LegalLayout>
  );
}
