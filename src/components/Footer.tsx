"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { AIButton } from "./AIButton";
import { Icon } from "./Icon";
import { LanguageSelect } from "./LanguageSelect";
import { Logo } from "./Logo";
import { isAuthPath } from "./useAuth";

export function Footer({ lang, dict }: { lang: Locale; dict: Pick<Dictionary, "nav" | "footer"> }) {
  const { nav, footer } = dict;
  const pathname = usePathname();
  if (isAuthPath(pathname)) return null;
  return (
    <footer>
      <div className="footer-main">
        <div><Logo lang={lang} label={nav.toHome} /><p>{footer.tagline}</p></div>
        <div><strong>{footer.platform}</strong><Link href={`/${lang}/universities`}>{nav.universities}</Link><Link href={`/${lang}/colleges`}>{nav.colleges}</Link></div>
        <div><strong>UniKG</strong><Link href={`/${lang}/about`}>{nav.about}</Link><AIButton lang={lang}>{nav.ai}</AIButton></div>
        <div><strong>{footer.language}</strong><LanguageSelect lang={lang} label={footer.language} /></div>
      </div>
      <div className="footer-bottom">
        <span>{footer.rights}</span>
        <Link href={`/${lang}/universities`}><Icon name="search" size={16} /> {footer.search}</Link>
      </div>
    </footer>
  );
}
