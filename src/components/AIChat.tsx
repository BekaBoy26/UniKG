"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { api, ApiError } from "@/lib/api";
import { accessToken } from "@/lib/supabase/client";
import { AI_PARAM, ASK_PARAM, onOpenAI, openAI } from "./AIButton";
import { Icon } from "./Icon";
import { loginHref, useAuth } from "./useAuth";

type Mention = { slug: string; short: string; name: string | null; city: string | null };
type Message = { from: "ai" | "user"; text: string; links?: Mention[]; error?: boolean };
type ChatReply = { reply: string; institutions: Mention[]; chatId: string };
type ChatSummary = { id: string; title: string; updated_at: string };
type StoredChat = { id: string; messages: { role: "user" | "model"; text: string; links?: Mention[] }[] };

type Props = { lang: Locale; dict: Dictionary["ai"] };

/** AI-помощник — панель справа на всю высоту; открывается кнопками AIButton, только для вошедших */
export function AIChat(props: Props) {
  const { user } = useAuth();
  // key: при выходе или смене аккаунта панель закрывается, а диалог начинается заново
  return user ? <ChatDrawer key={user.id} {...props} /> : null;
}

function ChatDrawer({ lang, dict }: Props) {
  const greeting: Message = { from: "ai", text: dict.greeting };
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatSummary[] | null>(null);
  const [historyError, setHistoryError] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const feed = useRef<HTMLDivElement>(null);
  const toLogin = () => router.push(loginHref(lang, `${pathname}?${AI_PARAM}=1`));

  const newChat = () => {
    setChatId(null);
    setMessages([greeting]);
    setView("chat");
  };

  const send = async (value: string, fresh = false) => {
    if (!value.trim() || loading) return;
    const id = fresh ? null : chatId;
    setMessages((m) => [...(fresh ? [greeting] : m), { from: "user", text: value.trim() }]);
    if (fresh) setChatId(null);
    setText("");
    setView("chat");
    setLoading(true);
    try {
      // История диалога хранится на сервере — отправляем только новое сообщение
      const data = await api<ChatReply>("/ai/chat", {
        method: "POST",
        token: await accessToken(),
        body: JSON.stringify({ message: value.trim(), chatId: id, lang }),
      });
      setChatId(data.chatId);
      setMessages((m) => [...m, { from: "ai", text: data.reply, links: data.institutions }]);
      setHistory(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return toLogin();
      const rateLimited = e instanceof ApiError && e.status === 429;
      setMessages((m) => [...m, { from: "ai", text: rateLimited ? dict.rateLimited : dict.error, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  // Открытие панели кнопкой AIButton; с вопросом — сразу новый чат с ним
  const onOpen = useEffectEvent((prompt?: string) => {
    setOpen(true);
    if (prompt) send(prompt, true);
  });
  useEffect(() => onOpenAI(onOpen), []);

  // После входа возвращаемся с ?ai=1 (и ?ask=вопрос) — открываем панель и убираем параметры из адреса
  const requested = searchParams.has(AI_PARAM);
  const ask = searchParams.get(ASK_PARAM) ?? undefined;
  useEffect(() => {
    if (!requested) return;
    openAI(ask);
    const params = new URLSearchParams(searchParams);
    params.delete(AI_PARAM);
    params.delete(ASK_PARAM);
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  }, [requested, ask, searchParams, pathname, router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open, view]);

  const showHistory = async () => {
    if (view === "history") return setView("chat");
    setView("history");
    setHistoryError(false);
    try {
      setHistory(await api<ChatSummary[]>("/ai/chats", { token: await accessToken() }));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return toLogin();
      setHistoryError(true);
    }
  };

  const openChat = async (id: string) => {
    try {
      const chat = await api<StoredChat>(`/ai/chats/${id}`, { token: await accessToken() });
      setChatId(chat.id);
      setMessages([greeting, ...chat.messages.map((m): Message => ({ from: m.role === "model" ? "ai" : "user", text: m.text, links: m.links }))]);
      setView("chat");
    } catch {
      setHistoryError(true);
    }
  };

  const deleteChat = async (id: string) => {
    try {
      await api(`/ai/chats/${id}`, { method: "DELETE", token: await accessToken() });
      setHistory((h) => h?.filter((c) => c.id !== id) ?? null);
      if (id === chatId) newChat();
    } catch {
      setHistoryError(true);
    }
  };

  const date = (iso: string) => new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "short" });

  return (
    // Панель всегда в DOM — так она плавно выезжает и уезжает; закрытая недоступна для фокуса (inert)
    <aside className={open ? "ai-drawer open" : "ai-drawer"} inert={!open} aria-hidden={!open} aria-label="UniKG AI">
      <header className="chat-header">
        <div className="assistant-avatar"><Icon name="bot" /></div>
        <div><h2>UniKG AI</h2><span><i /> {dict.ready}</span></div>
        <div className="chat-actions">
          <button className={view === "history" ? "icon-button active" : "icon-button"} onClick={showHistory} aria-pressed={view === "history"} aria-label={dict.history} title={dict.history}><Icon name="history" size={18} /></button>
          <button className="icon-button" onClick={newChat} disabled={loading} aria-label={dict.newChat} title={dict.newChat}><Icon name="plus" size={18} /></button>
          <button className="icon-button" onClick={() => setOpen(false)} aria-label={dict.close} title={dict.close}><Icon name="close" size={18} /></button>
        </div>
      </header>

      {view === "history" ? (
        <div className="chat-history">
          <h3>{dict.history}</h3>
          {historyError && <p className="chat-history-note">{dict.historyError}</p>}
          {history?.length === 0 && <p className="chat-history-note">{dict.historyEmpty}</p>}
          {history?.map((c) => (
            <div className={c.id === chatId ? "chat-history-item current" : "chat-history-item"} key={c.id}>
              <button onClick={() => openChat(c.id)}><strong>{c.title}</strong><small>{date(c.updated_at)}</small></button>
              <button className="chat-history-delete" onClick={() => deleteChat(c.id)} aria-label={`${dict.deleteChat}: ${c.title}`} title={dict.deleteChat}><Icon name="trash" size={16} /></button>
            </div>
          ))}
          <button className="text-link" onClick={() => setView("chat")}>{dict.backToChat}</button>
        </div>
      ) : (
        <div className="chat-feed" aria-live="polite" ref={feed}>
          <div className="chat-intro"><span><Icon name="spark" size={26} /></span><h2>{dict.introTitle}</h2><p>{dict.introText}</p></div>
          {messages.map((m, i) => (
            <div className={`message-row ${m.from}`} key={i}>
              {m.from === "ai" && <div className="message-avatar"><Icon name="bot" size={17} /></div>}
              <div className="message">
                {m.from === "ai" ? <RichText text={m.text} /> : m.text}
                {!!m.links?.length && (
                  <div className="message-links" aria-label={dict.mentioned}>
                    {m.links.map((l) => <Link key={l.slug} href={`/${lang}/institutions/${l.slug}`} title={l.name ?? undefined}>{l.short}</Link>)}
                  </div>
                )}
                <small>{m.from === "ai" ? "UniKG AI" : dict.you}</small>
              </div>
            </div>
          ))}
          {messages.length === 1 && <div className="prompt-grid">{dict.prompts.map((p) => <button key={p} onClick={() => send(p)}>{p}<Icon name="arrow" size={16} /></button>)}</div>}
          {loading && <div className="message-row ai"><div className="message-avatar"><Icon name="bot" size={17} /></div><div className="message typing"><i /><i /><i /></div></div>}
        </div>
      )}

      <div className="chat-compose">
        <div className="compose-box">
          <textarea value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }} placeholder={dict.placeholder} aria-label={dict.placeholder} />
          <button onClick={() => send(text)} disabled={loading || !text.trim()} aria-label={dict.send}><Icon name="send" size={19} /></button>
        </div>
        <small>{dict.disclaimer}</small>
      </div>
    </aside>
  );
}

/** Ответ AI: **жирный** и строки «- » как список. Без HTML — только React-узлы */
function RichText({ text }: { text: string }) {
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
    );
  const blocks: ReactNode[] = [];
  let items: string[] = [];
  const flush = () => {
    if (items.length) blocks.push(<ul key={blocks.length}>{items.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>);
    items = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (/^[-•*] /.test(line)) items.push(line.slice(2));
    else {
      flush();
      if (line) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
    }
  }
  flush();
  return <div className="rich-text">{blocks}</div>;
}
