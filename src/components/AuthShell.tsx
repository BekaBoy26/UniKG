import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Icon } from "./Icon";
import { AuthLanguages } from "./AuthLanguages";

/** Экран входа/регистрации: слева — бренд и преимущества, справа — форма. Без шапки и подвала сайта */
export function AuthShell({ lang, dict, children }: { lang: Locale; dict: Dictionary["auth"]; children: ReactNode }) {
  const points = [dict.heroPoint1, dict.heroPoint2, dict.heroPoint3];
  return (
    <main className="auth-split">
      <aside className="auth-hero">
        <Link className="auth-brand" href={`/${lang}`} aria-label={dict.toHome}>
          <Image src="/logo.png" width={40} height={40} alt="" priority />
          <span>UniKG</span>
        </Link>
        <div className="auth-hero-body">
          <h2>{dict.heroTitle}</h2>
          <ul>
            {points.map((p) => <li key={p}><span><Icon name="check" size={14} /></span>{p}</li>)}
          </ul>
        </div>
        <p className="auth-hero-note">{dict.heroNote}</p>
      </aside>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          {children}
          <AuthLanguages lang={lang} />
        </div>
      </section>
    </main>
  );
}
