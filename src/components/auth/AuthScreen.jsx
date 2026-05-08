"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const MODES = {
  login: {
    label: "Login",
    title: "Entrar na conta",
    description: "Acesse sua banca, apostas e estatísticas com clareza.",
    button: "Entrar",
    switchText: "Ainda não tem conta?",
    switchAction: "Criar conta",
  },
  register: {
    label: "Registro",
    title: "Criar conta",
    description: "Organize sua operação e acompanhe sua evolução desde o início.",
    button: "Criar conta",
    switchText: "Já tem conta?",
    switchAction: "Entrar",
  },
};

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  remember: true,
};

function getInitialMode() {
  if (typeof window === "undefined") return "login";

  const params = new URLSearchParams(window.location.search);
  const requestedMode = params.get("mode") || params.get("modo");

  return ["register", "registro", "cadastro"].includes(requestedMode)
    ? "register"
    : "login";
}

function Brand({ compact = false }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="Filtto">
      <span className="relative h-8 w-7 shrink-0 text-emerald-700 dark:text-emerald-400">
        <span className="absolute left-0 top-0 h-2.5 w-7 skew-x-[-24deg] rounded-[2px] bg-current" />
        <span className="absolute left-0 top-3 h-2.5 w-5 skew-x-[-24deg] rounded-[2px] bg-current" />
        <span className="absolute left-0 top-6 h-2.5 w-3 skew-x-[-24deg] rounded-[2px] bg-current" />
      </span>
      <span className="min-w-0">
        <span
          className={`block font-black tracking-[-0.04em] text-slate-950 dark:text-white ${
            compact ? "text-[24px]" : "text-[30px]"
          }`}
        >
          Filtto
        </span>
      </span>
    </Link>
  );
}

function InstitutionalPanel() {
  const principles = [
    "Banca, entradas e método no mesmo contexto.",
    "Histórico pronto para revisão.",
    "Rotina clara antes da próxima aposta.",
  ];

  return (
    <aside className="hidden flex-col justify-center border-r border-slate-200 pr-10 dark:border-white/[0.07] lg:flex">
      <div className="flex items-center justify-between gap-6">
        <Brand />
        <span className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-400">
          Painel privado
        </span>
      </div>

      <div className="mt-14 max-w-[380px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
          Área de membros
        </p>
        <h1 className="mt-3 text-[27px] font-semibold leading-[1.14] tracking-[-0.04em] text-slate-950 dark:text-white xl:text-[30px]">
          Seu painel de controle antes da próxima decisão.
        </h1>
        <p className="mt-3 max-w-[350px] text-[14px] leading-6 text-slate-600 dark:text-slate-300">
          Gestão de banca, progressões e estatísticas em uma rotina mais objetiva.
        </p>
      </div>

      <div className="mt-7 max-w-[390px]">
        <div className="rounded-[16px] border border-slate-200 bg-white/70 p-3.5 shadow-[0_8px_18px_rgba(15,23,42,0.03)] dark:border-white/[0.08] dark:bg-white/[0.032]">
          <div className="grid gap-2.5">
            {principles.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                  <Check className="h-3 w-3" strokeWidth={2.4} />
                </span>
                <p className="text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 max-w-[370px] text-[12px] leading-5 text-slate-500 dark:text-slate-500">
          Ambiente privado para acompanhar sua operação com consistência.
        </p>
      </div>
    </aside>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  icon: Icon,
  placeholder,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[12px] font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <div className="relative mt-2">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        ) : null}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-[46px] w-full rounded-[12px] border bg-white px-3 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-slate-500 dark:hover:border-white/[0.14] dark:focus:border-emerald-400/70 dark:focus:ring-emerald-400/10 ${
            Icon ? "pl-10" : ""
          } ${isPassword ? "pr-11" : ""} ${
            error
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-400/45 dark:focus:border-rose-300 dark:focus:ring-rose-400/10"
              : "border-slate-200 dark:border-white/[0.09]"
          }`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[8px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 text-[12px] font-medium text-rose-700 dark:text-rose-300"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export default function AuthScreen() {
  const [mode, setMode] = useState(getInitialMode);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const copy = MODES[mode];

  function setValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function validate() {
    const nextErrors = {};
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);

    if (mode === "register" && values.name.trim().length < 2) {
      nextErrors.name = "Informe seu nome.";
    }

    if (!emailValid) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (values.password.length < 6) {
      nextErrors.password = "A senha precisa ter pelo menos 6 caracteres.";
    }

    if (mode === "register" && values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = "As senhas precisam ser iguais.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setErrors({});
    setLoading(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setErrors({
        form: "Autenticação demonstrativa pronta para conectar ao backend.",
      });
    }, 700);
  }

  function handleGoogleAuth() {
    setErrors({
      form: "Login com Google pronto para conectar ao provedor de autenticação.",
    });
  }

  return (
    <main className="min-h-screen bg-[#f5f7f9] text-slate-950 transition-colors dark:bg-[#070d16] dark:text-white">
      <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(245,247,249,0)_260px)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(7,13,22,0)_320px)]">
        <div className="fixed right-5 top-5 z-50">
          <LanguageSwitcher light />
        </div>
        <div className="mx-auto grid min-h-screen w-full max-w-[1080px] items-center gap-10 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,440px)_minmax(440px,480px)] lg:gap-12 lg:px-8 xl:gap-14">
          <InstitutionalPanel />

          <section className="flex w-full justify-center">
            <div className="w-full max-w-[480px]">
              <div className="mb-3 flex items-center justify-between gap-4 lg:hidden">
                <div className="lg:hidden">
                  <Brand compact />
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#0b111d] dark:shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:p-7">
                <div className="flex rounded-[14px] border border-slate-200 bg-slate-50 p-1 dark:border-white/[0.08] dark:bg-white/[0.035]">
                  {Object.entries(MODES).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleModeChange(key)}
                      className={`relative flex h-9 flex-1 items-center justify-center rounded-[10px] px-2 text-[13px] font-medium transition ${
                        mode === key
                          ? "bg-white text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.07)] ring-1 ring-slate-200 dark:bg-white/[0.08] dark:text-white dark:ring-white/[0.08]"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                    {copy.title}
                  </h1>
                  <p className="mt-2 text-[14px] leading-6 text-slate-600 dark:text-slate-300">
                    {copy.description}
                  </p>
                </div>

                <form className="mt-5 space-y-3.5" onSubmit={handleSubmit} noValidate>
                  {mode === "register" ? (
                    <Field
                      id="name"
                      label="Nome"
                      value={values.name}
                      onChange={(value) => setValue("name", value)}
                      error={errors.name}
                      icon={UserRound}
                      placeholder="Seu nome"
                      autoComplete="name"
                    />
                  ) : null}

                  <Field
                    id="email"
                    label="E-mail"
                    type="email"
                    value={values.email}
                    onChange={(value) => setValue("email", value)}
                    error={errors.email}
                    icon={Mail}
                    placeholder="voce@email.com"
                    autoComplete="email"
                  />

                  <Field
                    id="password"
                    label="Senha"
                    type="password"
                    value={values.password}
                    onChange={(value) => setValue("password", value)}
                    error={errors.password}
                    icon={LockKeyhole}
                    placeholder="Sua senha"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />

                  {mode === "register" ? (
                    <Field
                      id="confirmPassword"
                      label="Confirmar senha"
                      type="password"
                      value={values.confirmPassword}
                      onChange={(value) => setValue("confirmPassword", value)}
                      error={errors.confirmPassword}
                      icon={LockKeyhole}
                      placeholder="Repita sua senha"
                      autoComplete="new-password"
                    />
                  ) : null}

                  {mode === "login" ? (
                    <div className="flex flex-col gap-3 pt-0.5 sm:flex-row sm:items-center sm:justify-between">
                      <label className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={values.remember}
                          onChange={(event) => setValue("remember", event.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 accent-emerald-600 dark:border-white/[0.14] dark:accent-emerald-400"
                        />
                        Lembrar acesso
                      </label>
                      <Link
                        href="#"
                        className="text-[13px] font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                      >
                        Esqueci minha senha
                      </Link>
                    </div>
                  ) : null}

                  {errors.form ? (
                    <div className="rounded-[12px] border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13px] font-medium text-amber-900 dark:border-amber-400/24 dark:bg-amber-400/10 dark:text-amber-200">
                      {errors.form}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-emerald-600 px-4 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.16),0_10px_22px_rgba(5,150,105,0.14)] transition hover:bg-emerald-700 hover:shadow-[0_1px_2px_rgba(15,23,42,0.16),0_13px_26px_rgba(5,150,105,0.18)] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-500 dark:text-white dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_12px_28px_rgba(16,185,129,0.12)] dark:hover:bg-emerald-400"
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {loading ? "Validando..." : copy.button}
                  </button>
                </form>

                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]" />
                  <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                    ou continue com e-mail
                  </span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="inline-flex h-[46px] w-full items-center justify-center gap-2.5 rounded-[12px] border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-white/[0.09] dark:bg-white/[0.035] dark:text-slate-200 dark:hover:border-white/[0.16] dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <GoogleIcon />
                  Continuar com Google
                </button>

                <p className="mt-5 text-center text-[13px] text-slate-500 dark:text-slate-400">
                  {copy.switchText}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      handleModeChange(mode === "login" ? "register" : "login")
                    }
                    className="font-medium text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                  >
                    {copy.switchAction}
                  </button>
                </p>
              </div>

              <p className="mx-auto mt-3 max-w-[360px] text-center text-[11px] leading-4 text-slate-500 dark:text-slate-500">
                Ambiente privado para gestão de banca, progressões e estatísticas.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
