export const locales = ["ru", "ky", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeNames: Record<Locale, { label: string; code: string }> = {
  ru: { label: "Русский", code: "RU" },
  ky: { label: "Кыргызча", code: "KG" },
  en: { label: "English", code: "EN" },
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Replaces the locale prefix of a pathname: /ru/about -> /en/about */
export function switchLocalePath(pathname: string, locale: Locale) {
  const parts = pathname.split("/");
  if (hasLocale(parts[1] ?? "")) parts[1] = locale;
  else parts.splice(1, 0, locale);
  return parts.join("/") || `/${locale}`;
}
