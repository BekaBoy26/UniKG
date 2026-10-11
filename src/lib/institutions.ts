import type { Locale } from "@/i18n/config";

// Типы и хелперы (доступны и клиентским компонентам). Загрузка данных — institutions.server.ts

export type Localized = { ru?: string; ky?: string; en?: string };
export type InstitutionType = "university" | "college";
export type Ownership = "state" | "private";

export type Institution = {
  id: string;
  slug: string;
  type: InstitutionType;
  short: string;
  name: Localized;
  city: Localized;
  ownership: Ownership;
  fields: FieldKey[];
  image: string | null;
  description: Localized | null;
  languages: Localized | null;
  studyForm: Localized | null;
  /** Минимальная стоимость очного контракта, сом в год. null — неизвестно, 0 — бесплатно */
  tuitionFrom: number | null;
  /** Часть программ есть только на кыргызском (официальные названия с госпортала) */
  programs: Localized[];
  website: string | null;
  address: Localized | null;
  sources: string[];
};

export const fieldLabels = {
  it: { ru: "IT и технологии", ky: "IT жана технологиялар", en: "IT & technology" },
  medicine: { ru: "Медицина", ky: "Медицина", en: "Medicine" },
  engineering: { ru: "Инженерия", ky: "Инженерия", en: "Engineering" },
  economics: { ru: "Экономика", ky: "Экономика", en: "Economics" },
  humanities: { ru: "Гуманитарные науки", ky: "Гуманитардык илимдер", en: "Humanities" },
  pedagogy: { ru: "Педагогика", ky: "Педагогика", en: "Education" },
} satisfies Record<string, Localized>;

export type FieldKey = keyof typeof fieldLabels;

/** Значение на нужном языке; если перевода нет — на любом доступном */
export const t = (value: Localized | null | undefined, locale: Locale) =>
  value ? (value[locale] ?? value.ru ?? value.ky ?? value.en ?? "") : "";
