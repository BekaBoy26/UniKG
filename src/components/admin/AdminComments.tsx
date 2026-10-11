"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { adminApi, fill, type AdminComment } from "@/lib/admin";
import { Icon } from "../Icon";
import { useCommentsRealtime } from "../useCommentsRealtime";
import { AdminTitle } from "./AdminOverview";
import { useAdminReady } from "./AdminShell";

/** Все комментарии сайта (новые сверху) — админ может удалить любой */
export function AdminComments({ lang, dict }: { lang: Locale; dict: Dictionary["admin"] }) {
  const [items, setItems] = useState<AdminComment[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const ready = useAdminReady();

  useEffect(() => {
    if (!ready) return;
    let active = true;
    adminApi<AdminComment[]>("/comments?limit=500")
      .then((list) => active && setItems(list))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [ready]);

  // Новые и удалённые комментарии со всего сайта — без перезагрузки страницы
  useCommentsRealtime(
    (change) => {
      if (change.eventType === "DELETE") {
        setItems((list) => list?.filter((c) => c.id !== change.old.id) ?? null);
        return;
      }
      adminApi<AdminComment[]>("/comments?limit=500")
        .then(setItems)
        .catch(() => undefined);
    },
    { enabled: ready },
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!items || !q) return items ?? [];
    return items.filter((c) => [c.body, c.author?.display_name, c.institution?.short].some((v) => v?.toLowerCase().includes(q)));
  }, [items, search]);

  const remove = async (id: string) => {
    if (!window.confirm(dict.commentDeleteConfirm)) return;
    try {
      await adminApi(`/comments/${id}`, { method: "DELETE" });
      setItems((list) => list?.filter((c) => c.id !== id) ?? null);
    } catch {
      window.alert(dict.errSave);
    }
  };

  const date = (iso: string) =>
    new Date(iso).toLocaleString(lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <AdminTitle kicker={dict.kicker} title={dict.comments} lead={dict.commentsLead} />
      <div className="admin-toolbar">
        <label className="directory-search admin-search">
          <Icon name="search" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={dict.searchComments} aria-label={dict.searchComments} />
        </label>
        {items && <span className="admin-count">{fill(dict.total, { n: filtered.length })}</span>}
      </div>

      {error && <p className="auth-alert error" role="alert">{dict.loadError}</p>}
      <div className="admin-card admin-comment-list">
        {!items && !error && <span className="admin-skeleton wide" />}
        {items && filtered.length === 0 && <p className="admin-empty">{items.length ? dict.nothingFound : dict.noComments}</p>}
        {filtered.map((c) => (
          <div className="admin-comment-row" key={c.id}>
            <div className="comment-avatar" aria-hidden="true">{(c.author?.display_name || dict.anonymous).slice(0, 1).toUpperCase()}</div>
            <div>
              <div className="admin-comment-meta">
                <strong>{c.author?.display_name || dict.anonymous}</strong>
                {c.institution && <Link href={`/${lang}/institutions/${c.institution.slug}`} target="_blank">{c.institution.short}</Link>}
                <span>{date(c.created_at)}</span>
              </div>
              <p>{c.body}</p>
            </div>
            <button className="comment-delete" onClick={() => remove(c.id)} aria-label={dict.delete} title={dict.delete}><Icon name="trash" size={17} /></button>
          </div>
        ))}
      </div>
    </>
  );
}
