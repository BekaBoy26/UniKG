import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { api, ApiError } from "./api";
import type { Institution, InstitutionType } from "./institutions";

// Данные приходят из Express API (backend/), который читает Supabase

export async function getInstitutions(type?: InstitutionType) {
  "use cache";
  cacheLife("hours");
  cacheTag("institutions");
  return api<Institution[]>(type ? `/institutions?type=${type}` : "/institutions");
}

export async function getInstitution(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("institutions", `institution:${slug}`);
  try {
    return await api<Institution>(`/institutions/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
