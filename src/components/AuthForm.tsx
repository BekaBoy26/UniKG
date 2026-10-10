"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { supabaseBrowser } from "@/lib/supabase/client";
import { safeNext } from "@/lib/supabase/safe-next";
import { Icon } from "./Icon";
import { useAuth } from "./useAuth";

export type AuthMode = "login" | "register" | "forgot" | "reset";
type Props = { lang: Locale; dict: Dictionary["auth"]; mode: AuthMode };

const MIN_PASSWORD = 8;

/** Вход, регистрация и восстановление пароля через Supabase Auth (email + Google) */
export function AuthForm({ lang, dict, mode }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const next = safeNext(params.get("next"), `/${lang}`);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(params.has("error") ? dict.error : "");
  const [notice, setNotice] = useState("");

  const query = params.has("next") ? `?next=${encodeURIComponent(next)}` : "";
  const href = (page: string) => `/${lang}/${page}${query}`;
  const callback = (to: string) => `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(to)}`;

  // Уже вошёл — на вход и регистрацию не пускаем (страница смены пароля — исключение)
  useEffect(() => {
    if (user && mode !== "reset") router.replace(next);
  }, [user, mode, next, router]);

  const fail = (message: string) => {
    setError(message);
    setPending(false);
  };

  // Сообщения Supabase Auth → понятный текст
  const explain = (e: { message: string; code?: string; status?: number }) => {
    const code = e.code ?? "";
    if (code === "invalid_credentials") return dict.errInvalid;
    if (code === "email_not_confirmed") return dict.errNotConfirmed;
    if (code === "user_already_exists") return dict.errExists;
    if (code === "weak_password") return dict.errShort;
    if (e.status === 429 || code.includes("rate_limit")) return dict.errRate;
    return dict.error;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    setNotice("");
    if (mode === "register" && !name.trim()) return fail(dict.errName);
    if ((mode === "register" || mode === "reset") && password.length < MIN_PASSWORD) return fail(dict.errShort);
    setPending(true);
    const auth = supabaseBrowser().auth;

    if (mode === "login") {
      const { error } = await auth.signInWithPassword({ email: email.trim(), password });
      if (error) return fail(explain(error));
      router.replace(next);
      router.refresh();
      return;
    }

    if (mode === "register") {
      const { data, error } = await auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() }, emailRedirectTo: callback(next) },
      });
      if (error) return fail(explain(error));
      // Supabase не раскрывает существующие аккаунты ошибкой: у такого пользователя нет identities
      if (data.user && !data.user.identities?.length) return fail(dict.errExists);
      if (data.session) {
        router.replace(next);
        router.refresh();
        return;
      }
      setNotice(dict.checkEmail.replace("{email}", email.trim()));
      setPending(false);
      return;
    }

    if (mode === "forgot") {
      const { error } = await auth.resetPasswordForEmail(email.trim(), { redirectTo: callback(`/${lang}/reset-password`) });
      if (error) return fail(explain(error));
      setNotice(dict.forgotSent);
      setPending(false);
      return;
    }

    // reset: сессию создал переход по ссылке из письма (через /api/auth/callback)
    if (!user) return fail(dict.resetNoSession);
    const { error } = await auth.updateUser({ password });
    if (error) return fail(explain(error));
    setNotice(dict.resetDone);
    setTimeout(() => router.replace(`/${lang}`), 1500);
  };

  const google = async () => {
    setPending(true);
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback(next), queryParams: { prompt: "select_account" } },
    });
    if (error) fail(dict.error);
  };

  const title = { login: dict.loginTitle, register: dict.registerTitle, forgot: dict.forgotTitle, reset: dict.resetTitle }[mode];
  const text = { login: dict.loginText, register: dict.registerText, forgot: dict.forgotText, reset: dict.resetText }[mode];
  const submitLabel = { login: dict.submitLogin, register: dict.submitRegister, forgot: dict.forgotSubmit, reset: dict.resetSubmit }[mode];
  const withPassword = mode !== "forgot";
  const withEmail = mode !== "reset";
  const done = Boolean(notice) && mode !== "login";

  return (
    <div className="auth-form">
      <h1>{title}</h1>
      <p className="auth-lead">{text}</p>

      {error && <p className="auth-alert error" role="alert">{error}</p>}
      {notice && <p className="auth-alert success" role="status">{notice}</p>}

      {!done && (
        <form onSubmit={submit}>
          {mode === "register" && (
            <label className="auth-field">
              <span>{dict.name}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={dict.namePlaceholder} autoComplete="name" maxLength={80} required />
            </label>
          )}
          {withEmail && (
            <label className="auth-field">
              <span>{dict.email}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={dict.emailPlaceholder} autoComplete="email" required />
            </label>
          )}
          {withPassword && (
            <label className="auth-field">
              <span className="auth-field-head">
                {dict.password}
                {mode === "login" && <Link href={href("forgot-password")}>{dict.forgot}</Link>}
              </span>
              <span className="auth-password">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "" : dict.passwordPlaceholder}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={mode === "login" ? undefined : MIN_PASSWORD}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? dict.hidePassword : dict.showPassword} title={showPassword ? dict.hidePassword : dict.showPassword}>
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
                </button>
              </span>
            </label>
          )}
          <button className="auth-submit" type="submit" disabled={pending || (mode === "reset" && loading)}>
            {pending ? dict.sending : submitLabel}
          </button>
        </form>
      )}

      {(mode === "login" || mode === "register") && (
        <>
          <div className="auth-divider"><span>{dict.or}</span></div>
          <button className="auth-google" type="button" onClick={google} disabled={pending}>
            <GoogleMark /> {mode === "login" ? dict.google : dict.googleRegister}
          </button>
        </>
      )}

      <p className="auth-switch">
        {mode === "login" && <>{dict.noAccount} <Link href={href("register")}>{dict.toRegister}</Link></>}
        {mode === "register" && <>{dict.haveAccount} <Link href={href("login")}>{dict.toLogin}</Link></>}
        {(mode === "forgot" || mode === "reset") && <Link href={href("login")}>{dict.backToLogin}</Link>}
      </p>
      {(mode === "login" || mode === "register") && <p className="auth-privacy">{dict.privacy}</p>}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
