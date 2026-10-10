/** Разрешаем редирект после входа только на внутренние пути сайта */
export function safeNext(next: string | null | undefined, fallback = "/") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
