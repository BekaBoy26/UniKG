import type { Locale } from "@/i18n/config";

type PluralForms = { one: string; few: string; many: string; other: string };

export function plural(locale: Locale, n: number, forms: PluralForms) {
  const rule = new Intl.PluralRules(locale).select(n) as keyof PluralForms;
  return (forms[rule] ?? forms.other).replace("{n}", String(n));
}

export function formatSom(locale: Locale, amount: number) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "ru-RU").format(amount);
}
