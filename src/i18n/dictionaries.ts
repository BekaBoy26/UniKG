import "server-only";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { hasLocale, type Locale } from "./config";

const dictionaries = {
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
  ky: () => import("./dictionaries/ky.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<typeof dictionaries.ru>>;

/** Current locale from the root `[lang]` segment; 404 for unknown locales. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

export async function getI18n() {
  const locale = await getLocale();
  return { lang: locale, dict: await dictionaries[locale]() };
}
