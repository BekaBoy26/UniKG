"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { plural } from "@/lib/format";
import type { FieldKey, InstitutionType, Ownership } from "@/lib/institutions";
import { AIButton } from "./AIButton";
import { Icon } from "./Icon";
import { InstitutionCard, type CardItem, type CardLabels } from "./InstitutionCard";
import { Select } from "./Select";

const PAGE_SIZE = 9;
type Sort = "popular" | "name" | "city" | "cost";

type Props = {
  lang: Locale;
  type: InstitutionType;
  items: CardItem[];
  fieldOptions: [FieldKey, string][];
  dict: Dictionary["directory"];
  labels: CardLabels;
};

export function Directory({ lang, type, items, fieldOptions, dict, labels }: Props) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [ownership, setOwnership] = useState<Ownership | "">("");
  const [field, setField] = useState<FieldKey | "">("");
  const [sort, setSort] = useState<Sort>("popular");
  const [view, setView] = useState<"grid" | "list">("list");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Список приходит из API уже по популярности — запоминаем исходный порядок
  const rank = useMemo(() => new Map(items.map((i, index) => [i.slug, index])), [items]);
  const cities = useMemo(() => [...new Set(items.map((i) => i.city))].sort((a, b) => a.localeCompare(b, lang)), [items, lang]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = items.filter((i) =>
      (!q || i.name.toLowerCase().includes(q) || i.short.toLowerCase().includes(q)) &&
      (!city || i.city === city) &&
      (!ownership || i.ownership === ownership) &&
      (!field || i.fields.includes(field))
    );
    const byName = (a: CardItem, b: CardItem) => a.name.localeCompare(b.name, lang);
    return result.sort((a, b) => {
      if (sort === "popular") return rank.get(a.slug)! - rank.get(b.slug)!;
      if (sort === "city") return a.city.localeCompare(b.city, lang) || byName(a, b);
      if (sort === "cost") return (a.tuitionFrom ?? Infinity) - (b.tuitionFrom ?? Infinity) || byName(a, b);
      return byName(a, b);
    });
  }, [items, search, city, ownership, field, sort, lang, rank]);

  const clear = () => { setSearch(""); setCity(""); setOwnership(""); setField(""); setVisible(PAGE_SIZE); };
  const fieldLabel = fieldOptions.find(([key]) => key === field)?.[1];
  const ownershipLabel = ownership === "state" ? labels.state : labels.private;

  return (
    <>
      <div className="directory-search">
        <Icon name="search" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }} placeholder={type === "university" ? dict.searchUniversity : dict.searchCollege} aria-label={type === "university" ? dict.searchUniversity : dict.searchCollege} />
        {search && <button onClick={() => setSearch("")} aria-label={dict.clearSearch}><Icon name="close" size={18} /></button>}
      </div>
      <div className="directory-layout">
        <aside className={mobileFilters ? "filter-panel mobile-open" : "filter-panel"}>
          <div className="filter-title"><h3>{dict.filters}</h3><button className="clear-button" onClick={clear}>{dict.reset}</button></div>
          <Select label={dict.city} value={city} onChange={setCity} options={[["", dict.allCities], ...cities.map((c): [string, string] => [c, c])]} />
          <Select label={dict.kind} value={ownership} onChange={setOwnership} options={[["", dict.anyKind], ["state", labels.state], ["private", labels.private]]} />
          <Select label={dict.field} value={field} onChange={setField} options={[["", dict.allFields], ...fieldOptions]} />
          <div className="filter-help"><Icon name="spark" size={18} /><p>{dict.helpText}<AIButton lang={lang}>{dict.askAi}</AIButton></p></div>
          <button className="primary-button apply-filter" onClick={() => setMobileFilters(false)}>{dict.showResults}</button>
        </aside>
        <section className="results">
          <div className="result-toolbar">
            <div><strong>{plural(lang, filtered.length, dict.results)}</strong><span>{dict.byQuery}</span></div>
            <button className="filter-mobile" onClick={() => setMobileFilters(!mobileFilters)}><Icon name="filter" /> {dict.filters}</button>
            <div className="toolbar-actions">
              <Select className="sort-select" label={dict.sort} value={sort} onChange={setSort} options={[["popular", dict.sortPopular], ["name", dict.sortName], ["city", dict.sortCity], ["cost", dict.sortCost]]} />
              <div className="view-toggle">
                <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label={dict.list} title={dict.list} aria-pressed={view === "list"}><Icon name="list" size={17} /></button>
                <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label={dict.grid} title={dict.grid} aria-pressed={view === "grid"}><Icon name="grid" size={17} /></button>
              </div>
            </div>
          </div>
          {(city || ownership || field) && (
            <div className="filter-chips">
              {city && <button onClick={() => setCity("")}>{city}<Icon name="close" size={14} /></button>}
              {ownership && <button onClick={() => setOwnership("")}>{ownershipLabel}<Icon name="close" size={14} /></button>}
              {field && <button onClick={() => setField("")}>{fieldLabel}<Icon name="close" size={14} /></button>}
            </div>
          )}
          {filtered.length ? (
            <div className={`result-grid ${view}`}>
              {filtered.slice(0, visible).map((item, i) => <InstitutionCard compact key={item.slug} item={item} lang={lang} labels={labels} index={i % PAGE_SIZE} />)}
            </div>
          ) : (
            <div className="empty-state">
              <span><Icon name="search" size={28} /></span><h3>{dict.emptyTitle}</h3><p>{dict.emptyText}</p>
              <button className="secondary-button" onClick={clear}>{dict.resetFilters}</button>
            </div>
          )}
          {filtered.length > visible && <button className="load-more" onClick={() => setVisible(visible + PAGE_SIZE)}>{dict.loadMore}</button>}
        </section>
      </div>
    </>
  );
}
