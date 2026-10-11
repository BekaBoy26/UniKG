import Link from "next/link";
import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { t, type FieldKey, type Institution, type InstitutionType, type Ownership } from "@/lib/institutions";
import { FavoriteButton } from "./FavoriteButton";
import { Icon } from "./Icon";

/** Serializable, already-localized view of an institution for cards and client filtering. */
export type CardItem = {
  slug: string;
  type: InstitutionType;
  short: string;
  name: string;
  city: string;
  ownership: Ownership;
  fields: FieldKey[];
  image: string | null;
  description: string;
  tuitionFrom: number | null;
};

export const toCard = (i: Institution, lang: Locale): CardItem => ({
  slug: i.slug,
  type: i.type,
  short: i.short,
  name: t(i.name, lang),
  city: t(i.city, lang),
  ownership: i.ownership,
  fields: i.fields,
  image: i.image,
  description: t(i.description, lang),
  tuitionFrom: i.tuitionFrom,
});

export type CardLabels = Pick<Dictionary["common"], "university" | "college" | "more" | "state" | "private" | "favoriteAdd" | "favoriteRemove">;

type CardProps = { item: CardItem; lang: Locale; labels: CardLabels; compact?: boolean; /** Позиция в ряду — для появления лесенкой */ index?: number };

export function InstitutionCard({ item, lang, labels, compact = false, index = 0 }: CardProps) {
  return (
    // Вся карточка — ссылка; сердечко — отдельная кнопка поверх неё (кнопку нельзя вкладывать в ссылку)
    <div className="card-shell" style={{ "--i": index } as CSSProperties}>
      <Link href={`/${lang}/institutions/${item.slug}`} className={compact ? "institution-card compact" : "institution-card"}>
        <div className="card-image">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- styled by the design's CSS (object-fit, hover zoom)
            <img src={item.image} alt="" loading="lazy" />
          ) : (
            <div className="image-placeholder" aria-hidden="true">{item.short}</div>
          )}
          <span className="type-pill">{item.type === "university" ? labels.university : labels.college}</span>
        </div>
        <div className="card-body">
          {/* Без фото сокращение уже крупно на обложке — значок не дублируем */}
          {item.image && <div className="institution-logo">{item.short}</div>}
          <div className="location"><Icon name="map" size={15} /> {item.city} · {item.ownership === "state" ? labels.state : labels.private}</div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <span className="text-link">{labels.more} <Icon name="arrow" size={17} /></span>
        </div>
      </Link>
      <FavoriteButton slug={item.slug} labels={{ add: labels.favoriteAdd, remove: labels.favoriteRemove }} />
    </div>
  );
}
