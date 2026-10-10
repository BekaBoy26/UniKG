import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

function preferredLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && hasLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => hasLocale(r.lang))?.lang as Locale | undefined ?? defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const locale = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  // Supabase вернул ?code= не на колбэк (адрес не в Redirect URLs → ушло на Site URL) — доводим вход до конца
  const code = searchParams.get("code");
  if (code) {
    const callback = new URL("/api/auth/callback", request.url);
    callback.searchParams.set("code", code);
    callback.searchParams.set("next", locale ? pathname : `/${preferredLocale(request)}`);
    return NextResponse.redirect(callback);
  }
  if (!locale) {
    request.nextUrl.pathname = `/${preferredLocale(request)}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Отдельной страницы AI больше нет — помощник открывается панелью справа
  if (pathname === `/${locale}/ai`) {
    const home = new URL(`/${locale}`, request.url);
    home.searchParams.set("ai", "1");
    return NextResponse.redirect(home);
  }
}

export const config = {
  // Skip Next internals, API routes and files with an extension (icon.svg, robots.txt, ...)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
