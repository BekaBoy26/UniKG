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
    // Вход в новый аккаунт не удался — прежнюю сессию не оставляем,
    // иначе пользователь молча остаётся в старом аккаунте
    await supabase.auth.signOut({ scope: "local" });
  } else {
    console.error("OAuth callback without code:", searchParams.get("error_description") ?? searchParams.get("error"));
    // Повторный заход на колбэк без кода (кнопка «назад») — уже вошедшего ведём дальше
    const { data } = await supabase.auth.getUser();
    if (data.user) return response;
  }

  const lang = next.split("/")[1];
  const login = new URL(`/${hasLocale(lang) ? lang : defaultLocale}/login`, origin);
  login.searchParams.set("error", "1");
  login.searchParams.set("next", next);
  const failure = NextResponse.redirect(login);
  // Куки, которые записал signOut (удаление сессии и PKCE-ключей), переносим в редирект на вход
  response.cookies.getAll().forEach((cookie) => failure.cookies.set(cookie));
  return failure;
}
