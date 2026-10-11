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

/** Направления; порядок и состав — как в backend (lib/fields.ts, scripts/fields.mjs) */
export const fieldLabels = {
  it: { ru: "IT и технологии", ky: "IT жана технологиялар", en: "IT & technology" },
  medicine: { ru: "Медицина", ky: "Медицина", en: "Medicine" },
  engineering: { ru: "Инженерия", ky: "Инженерия", en: "Engineering" },
  construction: { ru: "Архитектура и строительство", ky: "Архитектура жана курулуш", en: "Architecture & construction" },
  transport: { ru: "Транспорт и логистика", ky: "Транспорт жана логистика", en: "Transport & logistics" },
  economics: { ru: "Экономика", ky: "Экономика", en: "Economics" },
  law: { ru: "Право", ky: "Укук", en: "Law" },
  social: { ru: "Социальные науки", ky: "Социалдык илимдер", en: "Social sciences" },
  humanities: { ru: "Гуманитарные науки", ky: "Гуманитардык илимдер", en: "Humanities" },
  languages: { ru: "Языки и перевод", ky: "Тилдер жана котормо", en: "Languages & translation" },
  media: { ru: "Журналистика и медиа", ky: "Журналистика жана медиа", en: "Journalism & media" },
  arts: { ru: "Искусство и дизайн", ky: "Искусство жана дизайн", en: "Arts & design" },
  natural: { ru: "Естественные и точные науки", ky: "Табигый жана так илимдер", en: "Natural sciences & math" },
  agriculture: { ru: "Аграрные науки", ky: "Агрардык илимдер", en: "Agriculture" },
  pedagogy: { ru: "Педагогика", ky: "Педагогика", en: "Education" },
  tourism: { ru: "Туризм и сервис", ky: "Туризм жана тейлөө", en: "Tourism & hospitality" },
} satisfies Record<string, Localized>;

export type FieldKey = keyof typeof fieldLabels;

/** Значение на нужном языке; если перевода нет — на любом доступном */
export const t = (value: Localized | null | undefined, locale: Locale) =>
  value ? (value[locale] ?? value.ru ?? value.ky ?? value.en ?? "") : "";
