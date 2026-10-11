import Image from "next/image";
import Link from "next/link";
import { AIButton } from "@/components/AIButton";
import { Carousel } from "@/components/Carousel";
import { Icon } from "@/components/Icon";
import { InstitutionCard, toCard } from "@/components/InstitutionCard";
import { getI18n } from "@/i18n/dictionaries";
import { plural } from "@/lib/format";
import type { InstitutionType } from "@/lib/institutions";
import { getInstitutions } from "@/lib/institutions.server";

const heroImage = "https://images.unsplash.com/photo-1571260898218-97850999cc7e?auto=format&fit=crop&w=1400&q=85";

export default async function HomePage() {
  const { lang, dict } = await getI18n();
  const { home, common } = dict;
  const all = await getInstitutions();

  // На главной — первые 3 по популярности и плитка «Смотреть все»
  const row = (type: InstitutionType) => {
    const university = type === "university";
    const items = all.filter((i) => i.type === type);
    if (!items.length) return null;
    return (
      <Carousel
        kicker={university ? home.browseUniversities : home.browseColleges}
        title={university ? home.popularUniversities : home.popularColleges}
        text={home.popularText}
        seeAllHref={`/${lang}/${university ? "universities" : "colleges"}`}
        total={plural(lang, items.length, dict.directory.results)}
        labels={common}
      >
        {items.slice(0, 3).map((i, index) => <InstitutionCard key={i.slug} item={toCard(i, lang)} lang={lang} labels={common} index={index} />)}
      </Carousel>
    );
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Icon name="spark" size={16} /> {home.eyebrow}</div>
          {/* Подчёркнуто только слово-акцент; хвост (на кыргызском — «тап») идёт отдельной строкой */}
          <h1>{home.titleStart} <span>{home.titleAccent}</span>{home.titleEnd && <><br />{home.titleEnd}</>}</h1>
          <p>{home.lead}</p>
          <div className="hero-actions">
            <Link className="primary-button" href={`/${lang}/universities`}>{home.findUniversity} <Icon name="arrow" /></Link>
            <Link className="secondary-button" href={`/${lang}/colleges`}>{home.seeColleges}</Link>
          </div>
          <div className="trust-note">
            <div className="avatar-stack" aria-hidden="true"><span>А</span><span>Б</span><span>Э</span></div>
            <p><strong>{home.trustTitle}</strong><br />{home.trustText}</p>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-shape" />
          {/* eslint-disable-next-line @next/next/no-img-element -- absolutely positioned by the design's CSS */}
          <img src={heroImage} alt={home.heroImageAlt} fetchPriority="high" />
          <div className="float-card float-top"><span className="mini-icon"><Icon name="search" size={18} /></span><div><b>{home.smartSearch}</b><small>{home.smartSearchText}</small></div></div>
          <div className="float-card float-bottom"><Image className="mini-logo" src="/logo.png" width={36} height={36} alt="" /><div><b>{home.programsCount}</b><small>{home.programsText}</small></div><span className="status-dot" /></div>
          <div className="dots-decoration" />
        </div>
      </section>
      <section className="quick-search" data-reveal="up">
        <div className="quick-icon"><Icon name="search" /></div>
        <div><span>{home.whatToStudy}</span><strong>{home.whatToStudyHint}</strong></div>
        <div className="quick-divider" />
        <div><span>{home.where}</span><strong>{home.whereHint}</strong></div>
        <Link className="primary-button" href={`/${lang}/universities`}>{home.startSearch}</Link>
      </section>
      {row("university")}
      {row("college")}
      <section className="advisor-banner" data-reveal="zoom">
        <div className="advisor-icon"><Icon name="bot" size={30} /></div>
        <div><span className="section-kicker">{home.advisorKicker}</span><h2>{home.advisorTitle}</h2><p>{home.advisorText}</p></div>
        <AIButton lang={lang} className="light-button">{home.advisorButton} <Icon name="arrow" /></AIButton>
      </section>
    </main>
  );
}
