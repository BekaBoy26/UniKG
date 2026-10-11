"use client";

import type { ReactNode } from "react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { useSwitchLocale } from "./useSwitchLocale";

type Props = { lang: Locale; className: string; label?: string; children?: ReactNode };

/** Кнопки языков (страницы входа, подвал); children — значок перед кнопками */
export function LanguageButtons({ lang, className, label, children }: Props) {
  const switchLocale = useSwitchLocale();
  return (
    <div className={className} role="group" aria-label={label}>
      {children}
      {locales.map((l) => (
        <button key={l} type="button" className={l === lang ? "active" : undefined} aria-pressed={l === lang} onClick={() => l !== lang && switchLocale(l)}>
          {localeNames[l].label}
        </button>
      ))}
    </div>
  );
}
