import { api } from "./api";
import type { Institution, InstitutionType } from "./institutions";
import { accessToken } from "./supabase/client";

// Админка: запросы к /api/admin бэкенда от имени вошедшего админа

export type AdminInstitution = Omit<Institution, "programs"> & {
  id: string;
  programs: Institution["programs"];
  popularity: number | null;
  updatedAt: string;
};

/** Тело для создания/изменения: всё, кроме служебных полей */
export type InstitutionDraft = Omit<AdminInstitution, "id" | "updatedAt">;

export type AdminStats = { universities: number; colleges: number; comments: number; users: number };

export type AdminComment = {
  id: string;
  body: string;
  created_at: string;
  author: { display_name: string | null } | null;
  institution: { slug: string; short: string; type: InstitutionType } | null;
};

export type AdminUser = {
  id: string;
  display_name: string | null;
  role: "user" | "admin";
  created_at: string;
  email: string | null;
  avatar_url: string | null;
  /** email, google… (raw_app_meta_data.provider) */
  provider: string | null;
  last_sign_in_at: string | null;
  comments: number;
};

export async function adminApi<T>(path: string, init: RequestInit = {}) {
  return api<T>(`/admin${path}`, { ...init, token: await accessToken() });
}

/** Сбрасывает кэш каталога на сайте, чтобы изменения были видны сразу */
export async function refreshCatalog() {
  const token = await accessToken();
  await fetch("/api/revalidate", { method: "POST", headers: { authorization: `Bearer ${token}` } }).catch(() => undefined);
}

export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
