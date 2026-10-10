"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { loginHref, useAuth } from "./useAuth";

const OPEN_EVENT = "unikg:ai-open";
/** Параметры адреса, по которым панель AI открывается после входа (ask — вопрос, который сразу отправить) */
export const AI_PARAM = "ai";
export const ASK_PARAM = "ask";

/** Открыть панель AI; с prompt — начать новый чат с этим вопросом */
export const openAI = (prompt?: string) => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: prompt }));

export const onOpenAI = (listener: (prompt?: string) => void) => {
  const handler = (e: Event) => listener((e as CustomEvent<string | undefined>).detail);
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
};

type Props = { lang: Locale; className?: string; label?: string; prompt?: string; children: ReactNode };

/** Открывает панель AI-помощника; без входа — ведёт на вход и обратно с открытой панелью */
export function AIButton({ lang, className, label, prompt, children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const open = () => {
    if (loading) return;
    if (user) return openAI(prompt);
    const params = new URLSearchParams({ [AI_PARAM]: "1" });
    if (prompt) params.set(ASK_PARAM, prompt);
    router.push(loginHref(lang, `${pathname}?${params}`));
  };

  return <button type="button" className={className} onClick={open} aria-label={label}>{children}</button>;
}
