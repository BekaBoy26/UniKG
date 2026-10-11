import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { AIChat } from "@/components/AIChat";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { FavoritesSync } from "@/components/favorites";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Header } from "@/components/Header";
import { themeScript } from "@/components/theme";
import { locales } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionaries";
import "../globals.css";

// Inter — вариативный шрифт; cyrillic-ext нужен для кыргызских букв (ң, ү, ө)
const inter = Inter({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-inter" });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { lang, dict } = await getI18n();
  return {
    title: { default: dict.meta.title, template: "%s — UniKG" },
    description: dict.meta.description,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
    openGraph: { siteName: "UniKG", locale: lang },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { lang, dict } = await getI18n();
  return (
    <html lang={lang} className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthProvider>
          <div className="app-shell">
            <Header lang={lang} dict={{ nav: dict.nav, settings: dict.settings, auth: dict.auth }} />
            <FavoritesSync />
            {children}
            <Footer lang={lang} dict={{ nav: dict.nav, footer: dict.footer }} />
          </div>
          {/* Панель AI читает ?ai=1 из адреса — это делается в браузере */}
          <Suspense>
            <AIChat lang={lang} dict={dict.ai} />
          </Suspense>
          <ScrollReveal />
        </AuthProvider>
      </body>
    </html>
  );
}
