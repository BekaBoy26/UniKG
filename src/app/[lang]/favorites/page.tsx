import type { Metadata } from "next";
import Link from "next/link";
import { FavoritesList } from "@/components/FavoritesList";
import { Icon } from "@/components/Icon";
import { toCard } from "@/components/InstitutionCard";
import { getI18n } from "@/i18n/dictionaries";
import { getInstitutions } from "@/lib/institutions.server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.favorites.title, robots: { index: false } };
}

export default async function FavoritesPage() {
  const { lang, dict } = await getI18n();
  // Все учебные заведения — какие из них в избранном, знает только браузер (localStorage или аккаунт)
  const items = (await getInstitutions()).map((i) => toCard(i, lang));

  return (
    <main className="directory favorites-page">
      <div className="breadcrumb">
        <Link href={`/${lang}`}>{dict.nav.home}</Link><Icon name="chevron" size={14} />
        <span>{dict.favorites.title}</span>
      </div>
      <div className="directory-title">
        <div>
          <span className="section-kicker">UniKG</span>
          <h1>{dict.favorites.title}</h1>
          <p>{dict.favorites.lead}</p>
        </div>
        <div className="title-art"><Icon name="heart" size={32} /></div>
      </div>
      <FavoritesList lang={lang} items={items} dict={dict.favorites} labels={dict.common} />
    </main>
  );
}
