"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type KeyboardEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { api } from "@/lib/api";
import { accessToken } from "@/lib/supabase/client";
import { Icon } from "./Icon";
import { loginHref, useAuth } from "./useAuth";

type Comment = { id: string; body: string; created_at: string; canDelete: boolean; author: { display_name: string | null } | null };
type Labels = Pick<
  Dictionary["details"],
  "noComments" | "commentPlaceholder" | "send" | "loginToComment" | "login" | "commentError" | "commentsLoadError" | "anonymous" | "commentDelete" | "commentDeleteConfirm"
>;

const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

/** Комментарии публикуются сразу; удалить может автор или админ (признак canDelete считает сервер) */
export function Comments({ slug, lang, dict }: { slug: string; lang: Locale; dict: Labels }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const path = `/institutions/${encodeURIComponent(slug)}/comments`;

  // С токеном сервер отмечает, какие комментарии текущий пользователь может удалить — перезагружаем при входе/выходе
  useEffect(() => {
    if (authLoading) return;
    accessToken()
      .then((token) => api<Comment[]>(path, { token }))
      .then(setComments)
      .catch(() => setLoadError(true));
  }, [path, authLoading, user?.id]);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setError(false);
    try {
      const created = await api<Comment>(path, { method: "POST", token: await accessToken(), body: JSON.stringify({ body: text.trim() }) });
      setComments((list) => [created, ...(list ?? [])]);
      setText("");
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  // Enter — отправить, Shift+Enter — новая строка
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(dict.commentDeleteConfirm)) return;
    try {
      await api(`${path}/${id}`, { method: "DELETE", token: await accessToken() });
      setComments((list) => list?.filter((c) => c.id !== id) ?? null);
    } catch {
      setError(true);
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
              <div className="comment-meta">
                <strong>{name}</strong>
                <span>
                  {date(c.created_at)}
                  {c.canDelete && (
                    <button type="button" className="comment-delete" onClick={() => remove(c.id)} aria-label={dict.commentDelete} title={dict.commentDelete}>
                      <Icon name="trash" size={15} />
                    </button>
                  )}
                </span>
              </div>
              <p>{c.body}</p>
            </div>
          </div>
        );
      })}

      {error && <p className="comment-notice error" role="status">{dict.commentError}</p>}

      <div className="comment-form">
        {user ? (
          <div className="compose-box comment-compose">
            <textarea rows={1} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} placeholder={dict.commentPlaceholder} aria-label={dict.commentPlaceholder} />
            <button type="button" onClick={submit} disabled={sending || !text.trim()} aria-label={dict.send} title={dict.send}><Icon name="send" size={19} /></button>
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
