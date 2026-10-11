"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { adminApi, type AdminComment, type AdminStats } from "@/lib/admin";
import { Icon, type IconName } from "../Icon";
import { useAdminReady } from "./AdminShell";

type Props = { lang: Locale; dict: Dictionary["admin"] };

export function AdminOverview({ lang, dict }: Props) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [comments, setComments] = useState<AdminComment[] | null>(null);
  const [error, setError] = useState(false);
  const ready = useAdminReady();

  useEffect(() => {
    if (!ready) return;
    Promise.all([adminApi<AdminStats>("/stats"), adminApi<AdminComment[]>("/comments?limit=5")])
      .then(([s, c]) => {
        setStats(s);
        setComments(c);
      })
      .catch(() => setError(true));
  }, [ready]);

  const base = `/${lang}/admin`;
  const cards: [keyof AdminStats, string, IconName, string][] = [
    ["universities", dict.universities, "spark", `${base}/universities`],
    ["colleges", dict.colleges, "map", `${base}/colleges`],
    ["comments", dict.comments, "chat", `${base}/comments`],
    ["users", dict.statUsers, "users", `${base}/users`],
  ];
  const date = (iso: string) => new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "ru-RU");

  return (
    <>
      <AdminTitle kicker={dict.kicker} title={dict.overview} lead={dict.overviewLead} />
      {error && <p className="auth-alert error" role="alert">{dict.loadError}</p>}

      <div className="admin-stats">
        {cards.map(([key, label, icon, href], i) => (
          <Link key={key} href={href} className="admin-stat" style={{ "--i": i } as CSSProperties}>
            <span className="admin-stat-icon"><Icon name={icon} size={20} /></span>
            <strong>{stats ? stats[key] : <span className="admin-skeleton" />}</strong>
            <small>{label}</small>
          </Link>
        ))}
      </div>

      <div className="admin-columns">
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>{dict.recentComments}</h2>
            <Link className="text-link" href={`${base}/comments`}>{dict.allComments} <Icon name="arrow" size={16} /></Link>
          </div>
          {comments?.length === 0 && <p className="admin-empty">{dict.noComments}</p>}
          {comments?.map((c) => (
            <div className="admin-comment-row" key={c.id}>
              <div className="comment-avatar" aria-hidden="true">{(c.author?.display_name || dict.anonymous).slice(0, 1).toUpperCase()}</div>
              <div>
                <div className="admin-comment-meta">
                  <strong>{c.author?.display_name || dict.anonymous}</strong>
                  {c.institution && <Link href={`/${lang}/institutions/${c.institution.slug}`}>{c.institution.short}</Link>}
                  <span>{date(c.created_at)}</span>
                </div>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="admin-card">
          <div className="admin-card-head"><h2>{dict.quickActions}</h2></div>
          <div className="admin-actions">
            <Link className="admin-action" href={`${base}/institutions/new?type=university`}><span><Icon name="plus" size={18} /></span>{dict.addUniversity}</Link>
            <Link className="admin-action" href={`${base}/institutions/new?type=college`}><span><Icon name="plus" size={18} /></span>{dict.addCollege}</Link>
            <Link className="admin-action" href={`${base}/comments`}><span><Icon name="chat" size={18} /></span>{dict.comments}</Link>
          </div>
        </section>
      </div>
    </>
  );
}

export function AdminTitle({ kicker, title, lead, children }: { kicker: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <div className="admin-title">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
      </div>
      {children}
    </div>
  );
}
