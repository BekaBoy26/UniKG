"use client";

import { locales, localeNames, type Locale } from "@/i18n/config";
import { useSwitchLocale } from "./useSwitchLocale";

export function AuthLanguages({ lang }: { lang: Locale }) {
  const switchLocale = useSwitchLocale();
  return (
    <div className="auth-languages">
      {locales.map((l) => (
        <button key={l} type="button" className={l === lang ? "active" : ""} aria-pressed={l === lang} onClick={() => l !== lang && switchLocale(l)}>
          {localeNames[l].label}
        </button>
      ))}
    </div>
  );
}
