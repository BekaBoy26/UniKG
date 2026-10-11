"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { adminApi, fill, type AdminUser } from "@/lib/admin";
import { Icon } from "../Icon";
import { AdminTitle } from "./AdminOverview";
import { useAdminReady } from "./AdminShell";

/** Список пользователей (новые сверху). Только просмотр: роль меняется вручную в БД */
export function AdminUsers({ lang, dict }: { lang: Locale; dict: Dictionary["admin"] }) {
  const [items, setItems] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const ready = useAdminReady();

  useEffect(() => {
    if (!ready) return;
    let active = true;
    adminApi<AdminUser[]>("/users")
      .then((list) => active && setItems(list))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [ready]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!items || !q) return items ?? [];
    return items.filter((u) => [u.display_name, u.email].some((v) => v?.toLowerCase().includes(q)));
  }, [items, search]);

  const locale = lang === "en" ? "en-GB" : "ru-RU";
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const dateTime = (iso: string) =>
    new Date(iso).toLocaleString(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const provider = (p: string | null) => (p === "google" ? "Google" : p === "email" || !p ? dict.providerEmail : p);

  return (
    <>
      <AdminTitle kicker={dict.kicker} title={dict.statUsers} lead={dict.usersLead} />
      <div className="admin-toolbar">
        <label className="directory-search admin-search">
          <Icon name="search" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={dict.searchUsers} aria-label={dict.searchUsers} />
          {search && <button type="button" onClick={() => setSearch("")} aria-label={dict.cancel}><Icon name="close" size={18} /></button>}
        </label>
        {items && <span className="admin-count">{fill(dict.total, { n: filtered.length })}</span>}
      </div>

      {error && <p className="auth-alert error" role="alert">{dict.loadError}</p>}
      {!error && (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table admin-users">
            <thead>
              <tr>
                <th>{dict.colUser}</th>
                <th>{dict.colProvider}</th>
                <th>{dict.colRole}</th>
                <th>{dict.colJoined}</th>
                <th>{dict.colLastSeen}</th>
                <th>{dict.colComments}</th>
              </tr>
            </thead>
            <tbody>
              {!items && Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="admin-row-skeleton"><td colSpan={6}><span className="admin-skeleton" /></td></tr>
              ))}
              {items && filtered.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">{items.length ? dict.nothingFound : dict.noUsers}</td></tr>
              )}
              {filtered.map((u, i) => {
                const name = u.display_name || dict.noName;
                return (
                  <tr key={u.id} style={{ "--i": Math.min(i, 12) } as CSSProperties}>
                    <td>
                      <div className="admin-entity">
                        <span className="admin-thumb admin-avatar">
                          {/* eslint-disable-next-line @next/next/no-img-element -- аватар Google, внешний домен */}
                          {u.avatar_url ? <img src={u.avatar_url} alt="" referrerPolicy="no-referrer" loading="lazy" /> : name.slice(0, 1).toUpperCase()}
                        </span>
                        <span>
                          <strong>{name}</strong>
                          {u.email && <small>{u.email}</small>}
                        </span>
                      </div>
                    </td>
                    <td data-label={dict.colProvider}>
                      <span className="admin-provider">
                        <Icon name={u.provider === "google" ? "globe" : "mail"} size={15} /> {provider(u.provider)}
                      </span>
                    </td>
                    <td data-label={dict.colRole}>
                      <span className={u.role === "admin" ? "admin-pill role-admin" : "admin-pill role-user"}>{u.role === "admin" ? dict.roleAdmin : dict.roleUser}</span>
                    </td>
                    <td data-label={dict.colJoined}>{date(u.created_at)}</td>
                    <td data-label={dict.colLastSeen}>{u.last_sign_in_at ? dateTime(u.last_sign_in_at) : <span className="admin-muted">{dict.never}</span>}</td>
                    <td data-label={dict.colComments}>{u.comments || <span className="admin-muted">0</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
