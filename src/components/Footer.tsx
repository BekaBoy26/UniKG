"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { AIButton } from "./AIButton";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { isAdminPath, isAuthPath } from "./useAuth";
import { useSwitchLocale } from "./useSwitchLocale";

/** Открытые источники, из которых собраны данные каталога (те же, что в колонке sources) */
const SOURCES = [
  ["2020.edu.gov.kg", "https://2020.edu.gov.kg"],
  ["kaktus.media", "https://kaktus.media"],
] as const;

export function Footer({ lang, dict }: { lang: Locale; dict: Pick<Dictionary, "nav" | "footer"> }) {
  const { nav, footer } = dict;
  const pathname = usePathname();
  const switchLocale = useSwitchLocale();
  if (isAuthPath(pathname) || isAdminPath(pathname)) return null;
  const to = (path: string) => `/${lang}${path}`;

  return (
    <footer>
      <div className="footer-main">
        <div className="footer-brand"><Logo lang={lang} label={nav.toHome} /><p>{footer.tagline}</p></div>
        <div className="footer-cols">
          <div><strong>{footer.catalog}</strong><Link href={to("/universities")}>{nav.universities}</Link><Link href={to("/colleges")}>{nav.colleges}</Link><Link href={to("/favorites")}>{nav.favorites}</Link></div>
          <div><strong>UniKG</strong><Link href={to("/about")}>{nav.about}</Link><AIButton lang={lang}>{nav.ai}</AIButton><Link href={to("/faq")}>{footer.faq}</Link></div>
          <div>
            <strong>{footer.sources}</strong>
            {SOURCES.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noreferrer">{label} <Icon name="external" size={13} /></a>)}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{footer.rights}</span>
        <div className="footer-langs" role="group" aria-label={footer.languages}>
          <Icon name="globe" size={16} />
          {locales.map((l) => (
            <button key={l} type="button" className={l === lang ? "active" : undefined} aria-pressed={l === lang} onClick={() => l !== lang && switchLocale(l)}>{localeNames[l].label}</button>
          ))}
        </div>
        <nav className="footer-legal" aria-label="UniKG">
          <Link href={to("/privacy")}>{footer.privacy}</Link>
          <Link href={to("/terms")}>{footer.terms}</Link>
          <Link href={to("/faq")}>{footer.faq}</Link>
        </nav>
      </div>
    </footer>
  );
}
