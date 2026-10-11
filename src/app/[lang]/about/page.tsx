import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AIButton } from "@/components/AIButton";
import { Icon, type IconName } from "@/components/Icon";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getI18n } from "@/i18n/dictionaries";

const bishkekImage = "https://images.unsplash.com/photo-1690269788335-81ed655aaef2?auto=format&fit=crop&w=1200&q=85";

/** Задержка появления блока, мс (читает CSS через --d) */
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.nav.about };
}

export default async function AboutPage() {
  const { lang, dict } = await getI18n();
  const a = dict.about;
  const features: [IconName, string, string][] = [["search", a.f1Title, a.f1Text], ["bot", a.f2Title, a.f2Text], ["spark", a.f3Title, a.f3Text]];

  return (
    <main className="about-page">
      <section className="about-hero">
        <span className="eyebrow"><Icon name="spark" size={16} /> {a.eyebrow}</span>
        <h1>{a.titleStart}<br /><span>{a.titleAccent}</span></h1>
        <p>{a.lead}</p>
        <Link className="primary-button" href={`/${lang}/universities`}>{a.startSearch} <Icon name="arrow" /></Link>
        <div className="about-image">
          {/* eslint-disable-next-line @next/next/no-img-element -- styled by the design's CSS */}
          <img src={bishkekImage} alt={a.imageAlt} />
          <div data-reveal="up" style={delay(250)}><span>{a.missionKicker}</span><strong>{a.mission}</strong></div>
        </div>
      </section>
      {/* Ниже первого экрана блоки проявляются по ходу прокрутки (ScrollReveal) */}
      <section className="problem-section">
        <div data-reveal="left">
          <span className="section-kicker">{a.whyKicker}</span>
          <h2>{a.whyTitle}</h2>
          <span className="about-line" data-reveal="line" style={delay(300)} aria-hidden="true" />
        </div>
        <p data-reveal="right" style={delay(150)}>{a.whyText}</p>
      </section>
      <section className="features">
        {features.map(([icon, title, text], i) => (
          <article key={title} data-reveal="up" style={delay(i * 140)}>
            <span>0{i + 1}</span><div className="feature-icon"><Icon name={icon} /></div><h3>{title}</h3><p>{text}</p>
          </article>
        ))}
      </section>
      <section className="closing-cta" data-reveal="zoom">
        <div><span className="section-kicker">{a.nextKicker}</span><h2>{a.nextTitle}</h2><p>{a.nextText}</p></div>
        <div>
          <Link className="light-button" href={`/${lang}/universities`}>{a.openCatalog} <Icon name="arrow" /></Link>
          <AIButton lang={lang} className="outline-light"><Icon name="spark" size={17} /> {a.askAi}</AIButton>
        </div>
      </section>
      <ScrollReveal />
    </main>
  );
}
