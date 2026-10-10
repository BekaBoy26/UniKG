"use client";

import { hasLocale, locales, localeNames, type Locale } from "@/i18n/config";
import { useSwitchLocale } from "./useSwitchLocale";

export function LanguageSelect({ lang, label }: { lang: Locale; label: string }) {
  const switchLocale = useSwitchLocale();
  return (
    <select aria-label={label} value={lang} onChange={(e) => hasLocale(e.target.value) && switchLocale(e.target.value)}>
      {locales.map((l) => <option key={l} value={l}>{localeNames[l].label}</option>)}
    </select>
  );
}
