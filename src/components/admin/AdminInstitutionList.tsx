"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { adminApi, fill, refreshCatalog, type AdminInstitution } from "@/lib/admin";
import { formatSom } from "@/lib/format";
import { t, type InstitutionType } from "@/lib/institutions";
import { Icon } from "../Icon";
import { AdminTitle } from "./AdminOverview";
import { useAdminReady } from "./AdminShell";

type Props = {
  lang: Locale;
  type: InstitutionType;
  dict: Dictionary["admin"];
  labels: Pick<Dictionary["common"], "state" | "private" | "notSpecified">;
};

/** Таблица университетов или колледжей: поиск, переход к редактированию, удаление */
export function AdminInstitutionList({ lang, type, dict, labels }: Props) {
  const [items, setItems] = useState<AdminInstitution[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const ready = useAdminReady();

  useEffect(() => {
    if (!ready) return;
    let active = true;
    adminApi<AdminInstitution[]>(`/institutions?type=${type}`)
      .then((list) => active && setItems(list))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [type, attempt, ready]);

  const retry = () => {
    setError(false);
    setAttempt((n) => n + 1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!items || !q) return items ?? [];
    return items.filter((i) =>
      [i.short, i.slug, i.name.ru, i.name.ky, i.name.en, i.city.ru, i.city.ky, i.city.en].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [items, search]);

  const remove = async (item: AdminInstitution) => {
    if (!window.confirm(fill(dict.deleteConfirm, { name: t(item.name, lang) }))) return;
    setBusy(item.id);
    try {
      await adminApi(`/institutions/${item.id}`, { method: "DELETE" });
      setItems((list) => list?.filter((i) => i.id !== item.id) ?? null);
      await refreshCatalog();
    } catch {
      window.alert(dict.errSave);
    } finally {
      setBusy(null);
    }
  };

  const university = type === "university";

  return (
    <>
      <AdminTitle kicker={dict.kicker} title={university ? dict.universities : dict.colleges} lead={university ? dict.universitiesLead : dict.collegesLead}>
        <Link className="primary-button" href={`/${lang}/admin/institutions/new?type=${type}`}>
          <Icon name="plus" size={18} /> {university ? dict.addUniversity : dict.addCollege}
        </Link>
      </AdminTitle>

      <div className="admin-toolbar">
        <label className="directory-search admin-search">
          <Icon name="search" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={dict.search} aria-label={dict.search} />
          {search && <button type="button" onClick={() => setSearch("")} aria-label={dict.cancel}><Icon name="close" size={18} /></button>}
        </label>
        {items && <span className="admin-count">{fill(dict.total, { n: filtered.length })}</span>}
      </div>

      {error && (
        <div className="admin-card admin-empty">
          {dict.loadError} <button className="text-link" onClick={retry}>{dict.retry}</button>
        </div>
      )}

      {!error && (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{dict.colName}</th>
                <th>{dict.colCity}</th>
                <th>{dict.colOwnership}</th>
                <th>{dict.colTuition}</th>
                <th>{dict.colPopularity}</th>
                <th aria-label={dict.edit} />
              </tr>
            </thead>
            <tbody>
              {!items && Array.from({ length: 6 }, (_, i) => (
                <tr key={i} className="admin-row-skeleton"><td colSpan={6}><span className="admin-skeleton" /></td></tr>
              ))}
              {items && filtered.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">{dict.nothingFound}</td></tr>
              )}
              {filtered.map((item, i) => (
                <tr key={item.id} style={{ "--i": Math.min(i, 12) } as CSSProperties}>
                  <td>
                    <Link className="admin-entity" href={`/${lang}/admin/institutions/edit?id=${item.id}`}>
                      <span className="admin-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element -- фото с внешних сайтов */}
                        {item.image ? <img src={item.image} alt="" loading="lazy" /> : item.short.slice(0, 4)}
                      </span>
                      <span>
                        <strong>{t(item.name, lang)}</strong>
                        <small>{item.short} · /{item.slug}</small>
                      </span>
                    </Link>
                  </td>
                  <td data-label={dict.colCity}>{t(item.city, lang)}</td>
                  <td data-label={dict.colOwnership}>
                    <span className={item.ownership === "state" ? "admin-pill" : "admin-pill private"}>
                      {item.ownership === "state" ? labels.state : labels.private}
                    </span>
                  </td>
                  <td data-label={dict.colTuition}>{item.tuitionFrom === null ? <span className="admin-muted">—</span> : formatSom(lang, item.tuitionFrom)}</td>
                  <td data-label={dict.colPopularity}>{item.popularity ?? <span className="admin-muted">—</span>}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link className="icon-button" href={`/${lang}/admin/institutions/edit?id=${item.id}`} aria-label={dict.edit} title={dict.edit}><Icon name="edit" size={17} /></Link>
                      <a className="icon-button" href={`/${lang}/institutions/${item.slug}`} target="_blank" rel="noreferrer" aria-label={dict.view} title={dict.view}><Icon name="external" size={17} /></a>
                      <button className="icon-button danger" onClick={() => remove(item)} disabled={busy === item.id} aria-label={dict.delete} title={dict.delete}><Icon name="trash" size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
