"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { api } from "@/lib/api";
import { accessToken } from "@/lib/supabase/client";
import { Icon } from "./Icon";
import { loginHref, useAuth } from "./useAuth";

type Comment = { id: string; body: string; created_at: string; author: { display_name: string | null } | null };
type Labels = Pick<
  Dictionary["details"],
  "noComments" | "commentPlaceholder" | "send" | "loginToComment" | "login" | "commentPending" | "commentError" | "commentsLoadError" | "anonymous"
>;

const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export function Comments({ slug, lang, dict }: { slug: string; lang: Locale; dict: Labels }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<"pending" | "error" | null>(null);

  // Одобренные комментарии видны всем, без входа
  useEffect(() => {
    api<Comment[]>(`/institutions/${encodeURIComponent(slug)}/comments`)
      .then(setComments)
      .catch(() => setLoadError(true));
  }, [slug]);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setNotice(null);
    try {
      await api(`/institutions/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        token: await accessToken(),
        body: JSON.stringify({ body: text.trim() }),
      });
      setText("");
      setNotice("pending");
    } catch {
      setNotice("error");
    } finally {
      setSending(false);
    }
  };

  const date = (iso: string) => new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "ru-RU");

  return (
    <>
      {loadError && <p className="comment-empty">{dict.commentsLoadError}</p>}
      {comments?.length === 0 && <p className="comment-empty">{dict.noComments}</p>}
      {comments?.map((c) => {
        const name = c.author?.display_name || dict.anonymous;
        return (
          <div className="comment" key={c.id}>
            <div className="comment-avatar" aria-hidden="true">{initials(name)}</div>
            <div>
              <div className="comment-meta"><strong>{name}</strong><span>{date(c.created_at)}</span></div>
              <p>{c.body}</p>
            </div>
          </div>
        );
      })}

      {notice && <p className={notice === "error" ? "comment-notice error" : "comment-notice"} role="status">{notice === "error" ? dict.commentError : dict.commentPending}</p>}

      <div className="comment-form">
        <div className="comment-avatar self" aria-hidden="true"><Icon name="send" size={14} /></div>
        {user ? (
          <div>
            <textarea rows={3} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} placeholder={dict.commentPlaceholder} aria-label={dict.commentPlaceholder} />
            <button className="primary-button" onClick={submit} disabled={sending || !text.trim()}>{dict.send}</button>
          </div>
        ) : (
          !authLoading && (
            <p className="comment-login">
              {dict.loginToComment}
              <Link className="text-link" href={loginHref(lang, pathname)}>{dict.login}</Link>
            </p>
          )
        )}
      </div>
    </>
  );
}
