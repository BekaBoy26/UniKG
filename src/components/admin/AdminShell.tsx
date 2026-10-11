"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Icon, type IconName } from "../Icon";
import { Logo } from "../Logo";
import { SETTINGS_TOGGLE, SettingsModal } from "../SettingsModal";
import { displayName, loginHref, useAuth, useRole } from "../useAuth";

/** true, когда роль админа подтверждена: страницы админки грузят данные только после этого */
const AdminReady = createContext(false);
export const useAdminReady = () => useContext(AdminReady);

type Props = {
  lang: Locale;
  dict: Dictionary["admin"];
  settings: Dictionary["settings"];
  auth: Dictionary["auth"];
  toHome: string;
  account: string;
  children: ReactNode;
};

/** Оболочка админки: боковое меню и проверка роли. Данные отдаёт только бэкенд — он сам проверяет права */
export function AdminShell({ lang, dict, settings, auth, toHome, account, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const role = useRole(user);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace(loginHref(lang, pathname));
  }, [loading, user, lang, pathname, router]);

  const base = `/${lang}/admin`;
  const links: [string, string, IconName][] = [
    ["", dict.overview, "grid"],
    ["/universities", dict.universities, "spark"],
    ["/colleges", dict.colleges, "map"],
    ["/comments", dict.comments, "chat"],
  ];
  const isActive = (path: string) => (path ? pathname.startsWith(base + path) : pathname === base);
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = user ? displayName(user) : "";

  // Страница рендерится всегда (так Next проверяет мгновенную навигацию), но скрыта, пока роль не подтверждена
  let state: ReactNode = null;
  if (role === "user" || role === "error")
    state = (
      <div className="admin-state">
        <span className="admin-state-icon"><Icon name={role === "user" ? "close" : "history"} size={26} /></span>
        <h1>{role === "user" ? dict.noAccessTitle : dict.loadError}</h1>
        {role === "user" && <p>{dict.noAccessText}</p>}
        {role === "user" ? (
          <Link className="primary-button" href={`/${lang}`}>{dict.home}</Link>
        ) : (
          <button className="primary-button" onClick={() => window.location.reload()}>{dict.retry}</button>
        )}
      </div>
    );
  else if (role !== "admin") state = <div className="admin-state"><span className="admin-spinner" aria-hidden="true" /><p>{dict.checking}</p></div>;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Logo lang={lang} label={toHome} />
          <span className="admin-badge">Admin</span>
        </div>
        {role === "admin" && (
          <nav className="admin-nav" aria-label={dict.title}>
            {links.map(([path, label, icon]) => (
              <Link key={path} href={base + path} className={isActive(path) ? "active" : undefined} aria-current={isActive(path) ? "page" : undefined}>
                <Icon name={icon} size={19} /> {label}
              </Link>
            ))}
          </nav>
        )}
        <div className="admin-sidebar-foot">
          {user && (
            // Блок профиля открывает настройки (тема, язык, выход) — как в шапке сайта
            <div className="settings-anchor admin-settings">
              <button className="admin-user" onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen} aria-label={`${account}: ${name}`} {...{ [SETTINGS_TOGGLE]: "" }}>
                <span className="account-avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element -- аватар Google, внешний домен */}
                  {avatar ? <img src={avatar} alt="" referrerPolicy="no-referrer" /> : name.slice(0, 1).toUpperCase()}
                </span>
                <span><strong>{name}</strong>{user.email && user.email !== name && <small>{user.email}</small>}</span>
              </button>
              {/* Ссылка «Админ-панель» здесь не нужна — мы уже в ней */}
              {settingsOpen && <SettingsModal lang={lang} dict={settings} auth={auth} user={user} isAdmin={false} close={() => setSettingsOpen(false)} />}
            </div>
          )}
          <Link className="admin-to-site" href={`/${lang}`}><Icon name="external" size={17} /> {dict.toSite}</Link>
        </div>
      </aside>
      <main className="admin-main">
        {state}
        <div hidden={role !== "admin"}>
          <AdminReady value={role === "admin"}>{children}</AdminReady>
        </div>
      </main>
    </div>
  );
}
