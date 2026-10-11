import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AIButton } from "@/components/AIButton";
import { Comments } from "@/components/Comments";
import { Icon } from "@/components/Icon";
import { getI18n } from "@/i18n/dictionaries";
import { formatSom } from "@/lib/format";
import { t } from "@/lib/institutions";
import { getInstitution, getInstitutions } from "@/lib/institutions.server";

export async function generateStaticParams() {
  return (await getInstitutions()).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/institutions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await getI18n();
  const item = await getInstitution(slug);
  if (!item) return {};
  return { title: t(item.name, lang), description: t(item.description, lang) };
}

type Params = PageProps<"/[lang]/institutions/[slug]">["params"];

// Оболочка отдаётся сразу, данные по slug — внутри Suspense (мгновенная навигация, Cache Components)
export default function InstitutionPage({ params }: PageProps<"/[lang]/institutions/[slug]">) {
  return (
    <Suspense fallback={<main className="details-page"><div className="profile-cover skeleton" /></main>}>
      <InstitutionDetails params={params} />
    </Suspense>
  );
}

async function InstitutionDetails({ params }: { params: Params }) {
  const { slug } = await params;
  const { lang, dict } = await getI18n();
  const item = await getInstitution(slug);
  if (!item) notFound();

  const { common, details: d, nav } = dict;
  const university = item.type === "university";
  const city = t(item.city, lang);
  const facts: [string, string][] = [
    [d.language, t(item.languages, lang) || common.notSpecified],
    [d.form, t(item.studyForm, lang) || common.notSpecified],
    [d.type, item.ownership === "state" ? common.state : common.private],
    [d.cost, cost(item.tuitionFrom)],
  ];
  function cost(value: number | null) {
    if (value === null) return common.notSpecified;
    if (value === 0) return d.free;
    return `${d.costFrom.replace("{n}", formatSom(lang, value))} ${common.som} ${common.perYear}`;
  }

  return (
    <main className="details-page">
      <div className="breadcrumb">
        <Link href={`/${lang}`}>{nav.home}</Link><Icon name="chevron" size={14} />
        <Link href={`/${lang}/${university ? "universities" : "colleges"}`}>{university ? nav.universities : nav.colleges}</Link><Icon name="chevron" size={14} />
        <span>{item.short}</span>
      </div>
      <section className="profile-cover">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- cover image styled by the design's CSS
          <img src={item.image} alt="" />
        ) : (
          <div className="image-placeholder" aria-hidden="true">{item.short}</div>
        )}
        <div className="cover-overlay" />
        <div className="profile-title">
          <div className="profile-logo">{item.short}</div>
          <div>
            <span className="profile-type">{university ? common.university : common.college}</span>
            <h1>{t(item.name, lang)}</h1>
            <p><Icon name="map" size={17} /> {city}, {common.kyrgyzstan}</p>
          </div>
        </div>
      </section>
      <div className="profile-layout">
        <div className="profile-main">
          <section className="profile-section">
            <span className="section-kicker">{university ? d.aboutUniversity : d.aboutCollege}</span>
            {item.description && <p>{t(item.description, lang)}</p>}
            <div className="fact-row">{facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          </section>
          <section className="profile-section">
            <span className="section-kicker">{d.programsKicker}</span>
            <h2>{d.programsTitle}</h2>
            {item.programs.length ? (
              <div className="program-grid">
                {item.programs.map((p, i) => <div key={i}><span>{String(i + 1).padStart(2, "0")}</span>{t(p, lang)}</div>)}
              </div>
            ) : <p>{d.noPrograms}</p>}
          </section>
          <section className="profile-section admission">
            <span className="section-kicker">{d.admissionKicker}</span>
            <h2>{d.admissionTitle}</h2>
            <div className="info-notice"><Icon name="spark" /><p><strong>{d.checkTitle}</strong>{d.checkText}</p></div>
            <ul>{[d.step1, d.step2, d.step3].map((s) => <li key={s}><Icon name="check" />{s}</li>)}</ul>
          </section>
          <section className="profile-section discussion">
            <div className="discussion-title"><div><span className="section-kicker">{d.discussionKicker}</span><h2>{d.discussionTitle}</h2></div></div>
            <div className="opinion-note">{d.opinionNote}</div>
            <Comments slug={item.slug} institutionId={item.id} lang={lang} dict={d} />
          </section>
        </div>
        <aside className="contact-card">
          <h3>{d.contacts}</h3>
          {item.website && <p><span>{d.website}</span><a href={item.website} target="_blank" rel="noreferrer">{new URL(item.website).host} <Icon name="external" size={15} /></a></p>}
          <p><span>{d.city}</span><strong>{city}</strong></p>
          {item.address && <p><span>{d.address}</span><strong>{t(item.address, lang)}</strong></p>}
          <AIButton lang={lang} className="primary-button" prompt={d.askAbout.replace("{name}", t(item.name, lang))}><Icon name="spark" size={17} /> {d.askAi}</AIButton>
          <small>{d.disclaimer}</small>
          {!!item.sources.length && (
            <>
              <h3 className="sources-title">{d.sources}</h3>
              <ul className="sources-list">
                {item.sources.map((s) => <li key={s}><a href={s} target="_blank" rel="noreferrer">{new URL(s).host}</a></li>)}
              </ul>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
