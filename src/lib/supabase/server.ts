import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

// Серверный клиент создаётся на каждый запрос — с куками этого запроса
export const supabaseServer = (cookies: CookieMethodsServer) =>
  createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { cookies });
