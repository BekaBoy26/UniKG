"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/** Текущий пользователь Supabase Auth (обновляется при входе/выходе) */
export function useAuth() {
  const [state, setState] = useState<{ user: User | null; loading: boolean }>({ user: null, loading: true });

  useEffect(() => {
    const auth = supabaseBrowser().auth;
    auth.getSession().then(({ data }) => setState({ user: data.session?.user ?? null, loading: false }));
    const { data } = auth.onAuthStateChange((_event, session) => setState({ user: session?.user ?? null, loading: false }));
    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}

export const loginHref = (lang: string, next: string) => `/${lang}/login?next=${encodeURIComponent(next)}`;

export const displayName = (user: User) =>
  (user.user_metadata?.full_name as string | undefined) ?? (user.user_metadata?.name as string | undefined) ?? user.email ?? "";

/** Страницы входа/регистрации — без шапки и подвала сайта */
export const isAuthPath = (pathname: string) => /^\/[a-z]{2}\/(login|register|forgot-password|reset-password)(\/|$)/.test(pathname);
