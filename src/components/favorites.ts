"use client";

import { useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/api";
import { accessToken } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Избранное. У гостя — в localStorage этого браузера, у вошедшего — в БД (таблица favorites через /api/favorites).
 * После входа список гостя переносится в аккаунт. Одно общее хранилище на страницу: кнопки и страница «Избранное»
 * читают его через useFavorites, а синхронизацию с аккаунтом ведёт FavoritesSync (один раз в layout).
 */

const KEY = "unikg:favorites";

type State = { slugs: string[]; ready: boolean; signedIn: boolean };
let state: State = { slugs: [], ready: false, signedIn: false };
const serverState: State = state;
const listeners = new Set<() => void>();

const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

const readLocal = (): string[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
};

const writeLocal = (slugs: string[]) => {
  try {
    if (slugs.length) localStorage.setItem(KEY, JSON.stringify(slugs));
    else localStorage.removeItem(KEY);
  } catch {
    // Хранилище недоступно (приватный режим) — избранное живёт до перезагрузки
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Добавить или убрать; в аккаунте — оптимистично, при ошибке откатываем */
async function toggle(slug: string) {
  const had = state.slugs.includes(slug);
  const next = had ? state.slugs.filter((s) => s !== slug) : [slug, ...state.slugs];
  set({ slugs: next });
  if (!state.signedIn) return writeLocal(next);
  try {
    await api(`/favorites/${encodeURIComponent(slug)}`, { method: had ? "DELETE" : "PUT", token: await accessToken() });
  } catch {
    set({ slugs: had ? [slug, ...state.slugs.filter((s) => s !== slug)] : state.slugs.filter((s) => s !== slug) });
  }
}

export function useFavorites() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => serverState);
  return { ...snapshot, has: (slug: string) => snapshot.slugs.includes(slug), toggle };
}

/** Загружает избранное и переносит список гостя в аккаунт при входе. Рендерится один раз в layout */
export function FavoritesSync() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (loading) return;
    if (!userId) {
      set({ slugs: readLocal(), ready: true, signedIn: false });
      // Гость открыл сайт в нескольких вкладках — держим их в согласии
      const onStorage = (e: StorageEvent) => e.key === KEY && set({ slugs: readLocal() });
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
    let active = true;
    const local = readLocal();
    accessToken()
      .then((token) => api<string[]>("/favorites/merge", { method: "POST", token, body: JSON.stringify({ slugs: local }) }))
      .then((slugs) => {
        if (!active) return;
        writeLocal([]);
        set({ slugs, ready: true, signedIn: true });
      })
      // Сервер недоступен — показываем хотя бы локальный список, его перенесём при следующем входе
      .catch(() => active && set({ slugs: local, ready: true, signedIn: false }));
    return () => {
      active = false;
    };
  }, [userId, loading]);

  return null;
}
