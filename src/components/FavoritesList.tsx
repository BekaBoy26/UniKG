"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { useFavorites } from "./favorites";
import { Icon } from "./Icon";
import { InstitutionCard, type CardItem, type CardLabels } from "./InstitutionCard";
import { loginHref } from "./useAuth";

type Props = { lang: Locale; items: CardItem[]; dict: Dictionary["favorites"]; labels: CardLabels };

/** Избранное — в порядке добавления (новые сверху). Убранное сердечком сразу исчезает из списка */
export function FavoritesList({ lang, items, dict, labels }: Props) {
  const { slugs, ready, signedIn } = useFavorites();
  const pathname = usePathname();
  const bySlug = new Map(items.map((i) => [i.slug, i]));
  const saved = slugs.flatMap((slug) => bySlug.get(slug) ?? []);

  if (!ready) return <div className="result-grid">{[0, 1, 2].map((i) => <div key={i} className="favorites-skeleton" />)}</div>;

  return (
    <>
      {!signedIn && (
        <p className="favorites-note">
          <Icon name="heart" size={17} /> {dict.guestNote} <Link className="text-link" href={loginHref(lang, pathname)}>{dict.login}</Link>
        </p>
      )}
      {saved.length ? (
        <>
          <p className="favorites-count">{dict.count.replace("{n}", String(saved.length))}</p>
          <div className="result-grid">
            {saved.map((item, i) => <InstitutionCard compact key={item.slug} item={item} lang={lang} labels={labels} index={i % 9} />)}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <span><Icon name="heart" size={28} /></span>
          <h3>{dict.emptyTitle}</h3>
          <p>{dict.emptyText}</p>
          <div className="favorites-empty-actions">
            <Link className="primary-button" href={`/${lang}/universities`}>{dict.toUniversities} <Icon name="arrow" /></Link>
            <Link className="secondary-button" href={`/${lang}/colleges`}>{dict.toColleges}</Link>
          </div>
        </div>
      )}
    </>
  );
}
