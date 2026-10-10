import { createBrowserClient } from "@supabase/ssr";

// В браузере createBrowserClient возвращает один и тот же экземпляр (singleton)
export const supabaseBrowser = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

export async function accessToken() {
  const { data } = await supabaseBrowser().auth.getSession();
  return data.session?.access_token ?? null;
}
