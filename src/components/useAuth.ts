"use client";

import type { User } from "@supabase/supabase-js";
import { useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { accessToken } from "@/lib/supabase/client";
import { AuthContext } from "./AuthProvider";

/** Текущий пользователь Supabase Auth (обновляется при входе/выходе). Подписка одна — в AuthProvider (layout) */
export function useAuth() {
  const state = useContext(AuthContext);
  if (!state) throw new Error("useAuth() must be used inside <AuthProvider>");
  return state;
}

export const loginHref = (lang: string, next: string) => `/${lang}/login?next=${encodeURIComponent(next)}`;

export const displayName = (user: User) =>
  (user.user_metadata?.full_name as string | undefined) ?? (user.user_metadata?.name as string | undefined) ?? user.email ?? "";

/** Страницы входа/регистрации — без шапки и подвала сайта */
export const isAuthPath = (pathname: string) => /^\/[a-z]{2}\/(login|register|forgot-password|reset-password)(\/|$)/.test(pathname);

/** Админка — своя оболочка, без шапки и подвала сайта */
export const isAdminPath = (pathname: string) => /^\/[a-z]{2}\/admin(\/|$)/.test(pathname);

/**
 * Роль текущего пользователя с бэкенда: null — ещё неизвестна (или не вошёл), "error" — не удалось узнать.
 * Нужна только для интерфейса — доступ к данным админки проверяют бэкенд и RLS.
 */
export function useRole(user: User | null) {
  const [state, setState] = useState<{ id: string; role: "user" | "admin" | "error" } | null>(null);

  const id = user?.id;

  useEffect(() => {
    if (!id) return;
    let active = true;
    accessToken()
      .then((token) => api<{ role: "user" | "admin" }>("/me", { token }))
      .then(({ role }) => active && setState({ id, role }))
      .catch(() => active && setState({ id, role: "error" }));
    return () => {
      active = false;
    };
  }, [id]);

  return id && state?.id === id ? state.role : null;
}
