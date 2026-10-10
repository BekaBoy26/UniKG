import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale } from "@/i18n/config";
import { safeNext } from "@/lib/supabase/safe-next";
import { supabaseServer } from "@/lib/supabase/server";

// Сюда Supabase возвращает пользователя после входа через Google (PKCE: ?code=...)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"), `/${defaultLocale}`);
  const code = searchParams.get("code");

  // Куки сессии пишем прямо в ответ-редирект
  const response = NextResponse.redirect(new URL(next, origin));
  const supabase = supabaseServer({
    getAll: () => request.cookies.getAll(),
    setAll(cookies, headers) {
      cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
    console.error("OAuth callback error:", error.message);
  } else {
    console.error("OAuth callback without code:", searchParams.get("error_description") ?? searchParams.get("error"));
  }

  // Код не обменялся (уже использован, повторный запрос колбэка, нет PKCE-ключа), но пользователь
  // уже вошёл — ведём дальше, а не на страницу ошибки
  const { data } = await supabase.auth.getUser();
  if (data.user) return response;

  const lang = next.split("/")[1];
  const login = new URL(`/${hasLocale(lang) ? lang : defaultLocale}/login`, origin);
  login.searchParams.set("error", "1");
  login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}
