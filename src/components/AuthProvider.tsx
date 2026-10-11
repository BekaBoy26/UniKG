"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export type AuthState = { user: User | null; loading: boolean };

export const AuthContext = createContext<AuthState | null>(null);

/** Одна подписка на вход/выход на всё приложение; компоненты читают её через useAuth() */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const auth = supabaseBrowser().auth;
    auth.getSession().then(({ data }) => setState({ user: data.session?.user ?? null, loading: false }));
    const { data } = auth.onAuthStateChange((_event, session) => setState({ user: session?.user ?? null, loading: false }));
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext value={state}>{children}</AuthContext>;
}
