export type Theme = "light" | "dark" | "system";
const THEME_KEY = "theme";

/** Runs inline in <head> before first paint to avoid a theme flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}")||"light";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export function readTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_KEY);
    if (value === "dark" || value === "system") return value;
  } catch {}
  return "light";
}

export function applyTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}
