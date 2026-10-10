"use client";

import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, switchLocalePath, type Locale } from "@/i18n/config";

export function useSwitchLocale() {
  const pathname = usePathname();
  return (locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    // Полная загрузка, а не мягкий переход: корневой layout с <html>/<head> зависит от языка,
    // и при перерисовке в браузере терялись бы тема и скрипт темы в <head>
    window.location.assign(switchLocalePath(pathname, locale) + window.location.search);
  };
}
