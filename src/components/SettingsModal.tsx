"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Icon, type IconName } from "./Icon";
import { applyTheme, readTheme, type Theme } from "./theme";
import { displayName } from "./useAuth";
import { useSwitchLocale } from "./useSwitchLocale";

/** Помечает кнопки, которые сами открывают/закрывают настройки — клик по ним не считается «снаружи» */
export const SETTINGS_TOGGLE = "data-settings-toggle";

type Props = { lang: Locale; dict: Dictionary["settings"]; auth: Dictionary["auth"]; user: User; isAdmin: boolean; close: () => void };

/** Настройки — выпадающее окно под шестерёнкой; закрывается кликом вне окна и по Esc */
export function SettingsModal({ lang, dict, auth, user, isAdmin, close }: Props) {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const switchLocale = useSwitchLocale();
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Element;
      if (panel.current?.contains(target) || target.closest(`[${SETTINGS_TOGGLE}]`)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);

  const signOut = async () => {
    await supabaseBrowser().auth.signOut();
    close();
    router.refresh();
  };
  const themes: [Theme, string, IconName][] = [["light", dict.light, "sun"], ["dark", dict.dark, "moon"], ["system", dict.system, "gear"]];
  const chooseTheme = (value: Theme) => { setTheme(value); applyTheme(value); };

  return (
    <div className="settings-popover" role="dialog" aria-labelledby="settings-title" ref={panel}>
      <div className="modal-header">
        <div><span className="section-kicker">{dict.kicker}</span><h2 id="settings-title">{dict.title}</h2></div>
        <button className="icon-button" onClick={close} aria-label={dict.close}><Icon name="close" /></button>
      </div>
      <section>
        <h3>{auth.kicker}</h3>
        <div className="account-row">
          <div><span>{auth.signedInAs}</span><strong>{displayName(user)}</strong>{user.email && displayName(user) !== user.email && <span>{user.email}</span>}</div>
          <button className="secondary-button" onClick={signOut}>{auth.logout}</button>
        </div>
        {isAdmin && (
          <Link className="admin-entry" href={`/${lang}/admin`} onClick={close}>
            <span><Icon name="grid" size={18} /></span>{auth.adminPanel}<Icon name="chevron" size={16} />
          </Link>
        )}
      </section>
      <section>
        <h3>{dict.appearance}</h3><p>{dict.appearanceText}</p>
        <div className="settings-options theme-options">
          {themes.map(([value, label, icon]) => (
            <button className={theme === value ? "selected" : ""} onClick={() => chooseTheme(value)} key={value}>
              <span><Icon name={icon} /></span><strong>{label}</strong>{theme === value && <i><Icon name="check" size={14} /></i>}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3>{dict.language}</h3><p>{dict.languageText}</p>
        <div className="settings-options language-options">
          {locales.map((locale) => (
            <button className={lang === locale ? "selected" : ""} onClick={() => switchLocale(locale)} key={locale}>
              <span>{localeNames[locale].code}</span><strong>{localeNames[locale].label}</strong>{lang === locale && <i><Icon name="check" size={14} /></i>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
