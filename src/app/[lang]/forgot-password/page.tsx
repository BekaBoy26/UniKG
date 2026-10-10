import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";
import { getI18n } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.auth.forgotTitle, robots: { index: false } };
}

export default async function ForgotPasswordPage() {
  const { lang, dict } = await getI18n();
  return (
    <AuthShell lang={lang} dict={dict.auth}>
      {/* Форма читает ?next= и ?error= из адреса — это делается в браузере */}
      <Suspense>
        <AuthForm lang={lang} dict={dict.auth} mode="forgot" />
      </Suspense>
    </AuthShell>
  );
}
