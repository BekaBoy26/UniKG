"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { AIButton } from "./AIButton";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { SETTINGS_TOGGLE, SettingsModal } from "./SettingsModal";
import { displayName, isAdminPath, isAuthPath, loginHref, useAuth, useRole } from "./useAuth";

export function Header({ lang, dict }: { lang: Locale; dict: Pick<Dictionary, "nav" | "settings" | "auth"> }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const role = useRole(user);
  const [menu, setMenu] = useState(false);
  const [settings, setSettings] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Лёгкая тень у шапки, когда страница прокручена
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const { nav } = dict;
  const links: [string, string][] = [["", nav.home], ["/universities", nav.universities], ["/colleges", nav.colleges], ["/about", nav.about]];
  const isActive = (path: string) => (path ? pathname.startsWith(`/${lang}${path}`) : pathname === `/${lang}`);

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = user ? displayName(user) : "";

  if (isAuthPath(pathname) || isAdminPath(pathname)) return null;

  return (
    <header className={scrolled ? "site-header scrolled" : "site-header"}>
      <div className="nav-wrap">
        <Logo lang={lang} label={nav.toHome} />
        <nav className={menu ? "main-nav open" : "main-nav"} aria-label={nav.mainNav}>
          {links.map(([path, label]) => (
            <Link key={path} href={`/${lang}${path}`} className={isActive(path) ? "nav-link active" : "nav-link"} onClick={() => setMenu(false)}>{label}</Link>
          ))}
          {/* Видна только админу; доступ к данным всё равно проверяет бэкенд */}
          {role === "admin" && (
            <Link href={`/${lang}/admin`} className="nav-link nav-admin" onClick={() => setMenu(false)} title={nav.admin} aria-label={nav.admin}>
              <Icon name="grid" size={16} /> <span className="nav-admin-text">{nav.admin}</span>
            </Link>
          )}
        </nav>
        <div className="nav-actions">
          <AIButton lang={lang} className="ai-button" label={nav.ai}><Icon name="spark" size={17} /> {nav.ai}</AIButton>
          {user ? (
            // Блок аккаунта открывает настройки (тема, язык, выход)
            <div className="settings-anchor">
              <button className="account-button" onClick={() => setSettings((open) => !open)} aria-expanded={settings} aria-label={`${nav.account}: ${name}`} {...{ [SETTINGS_TOGGLE]: "" }}>
                <span className="account-avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element -- аватар Google, внешний домен */}
                  {avatar ? <img src={avatar} alt="" referrerPolicy="no-referrer" /> : name.slice(0, 1).toUpperCase()}
                </span>
                {/* Почта видна в самих настройках */}
                <span className="account-text"><strong>{name}</strong></span>
              </button>
              {settings && <SettingsModal lang={lang} dict={dict.settings} auth={dict.auth} user={user} isAdmin={role === "admin"} close={() => setSettings(false)} />}
            </div>
          ) : (
            !loading && <Link className="login-button" href={loginHref(lang, pathname)}>{nav.login}</Link>
          )}
          <button className="icon-button menu-button" onClick={() => setMenu(!menu)} aria-label={nav.openMenu} aria-expanded={menu}><Icon name={menu ? "close" : "menu"} /></button>
        </div>
      </div>
    </header>
  );
}
