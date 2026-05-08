"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  LineChart,
  Plus,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const summaryMetrics = [
  {
    label: "Resultado do período",
    value: "+R$ 2.146",
    detail: "34 apostas finalizadas",
    tone: "positive",
    icon: TrendingUp,
  },
  {
    label: "Lucro médio por aposta",
    value: "R$ 63,11",
    detail: "média do período atual",
    tone: "positive",
    icon: Target,
  },
  {
    label: "ROI",
    value: "14,2%",
    detail: "período atual",
    tone: "positive",
    icon: LineChart,
  },
  {
    label: "Saldo final",
    value: "R$ 18.420",
    detail: "+R$ 2.146 no mês",
    tone: "neutral",
    icon: Wallet,
  },
];

const chartPoints = [
  { label: "01 Mai", value: 13200 },
  { label: "05 Mai", value: 13850 },
  { label: "10 Mai", value: 14200 },
  { label: "15 Mai", value: 15100 },
  { label: "20 Mai", value: 15850 },
  { label: "25 Mai", value: 17100 },
  { label: "31 Mai", value: 18420 },
];

const recentActivities = [
  {
    title: "Barcelona x Sevilla",
    description: "Over 2.5 gols",
    amount: "+R$ 139",
    status: "Green",
    tone: "positive",
  },
  {
    title: "Chelsea x Brighton",
    description: "Draw no bet",
    amount: "-R$ 150",
    status: "Red",
    tone: "negative",
  },
  {
    title: "Palmeiras x Santos",
    description: "Palmeiras vence",
    amount: "Em aberto",
    status: "Pendente",
    tone: "neutral",
  },
  {
    title: "Real Madrid x Betis",
    description: "Mais de 1.5 gols",
    amount: "+R$ 84",
    status: "Green",
    tone: "positive",
  },
];

function getTone(tone) {
  if (tone === "positive") {
    return {
      text: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
      icon: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    };
  }

  if (tone === "negative") {
    return {
      text: "text-rose-700 dark:text-rose-300",
      bg: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
      icon: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
    };
  }

  return {
    text: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
    icon: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
  };
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900 ${className}`}
    >
      {children}
    </section>
  );
}

function MetricCard({ metric }) {
  const Icon = metric.icon;
  const tone = getTone(metric.tone);

  return (
    <article className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_8px_18px_rgba(15,23,42,0.035)] dark:border-white/[0.08] dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
            {metric.label}
          </p>

          <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
            {metric.value}
          </p>

          <p className={`mt-2 text-[12px] font-medium ${tone.text}`}>
            {metric.detail}
          </p>
        </div>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ring-1 ${tone.icon}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}

function BankrollChart() {
  const max = Math.max(...chartPoints.map((item) => item.value));
  const min = Math.min(...chartPoints.map((item) => item.value));
  const range = max - min || 1;

  const points = chartPoints
    .map((item, index) => {
      const x = (index / (chartPoints.length - 1)) * 100;
      const y = 100 - ((item.value - min) / range) * 74 - 13;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="mt-6">
      <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-5 dark:border-white/[0.08] dark:bg-white/[0.035]">
        <div className="h-[300px] w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="bankrollFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[20, 40, 60, 80].map((y) => (
              <line
                key={y}
                x1="0"
                x2="100"
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth="0.4"
                className="text-slate-900 dark:text-white"
              />
            ))}

            <polygon points={areaPoints} fill="url(#bankrollFill)" />

            <polyline
              points={points}
              fill="none"
              stroke="rgb(16 185 129)"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {chartPoints.map((item, index) => {
              const x = (index / (chartPoints.length - 1)) * 100;
              const y = 100 - ((item.value - min) / range) * 74 - 13;

              return (
                <circle
                  key={item.label}
                  cx={x}
                  cy={y}
                  r="1.4"
                  fill="rgb(16 185 129)"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {chartPoints.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentActivities() {
  return (
    <Panel className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Atividade
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
            Atividades recentes
          </h2>
        </div>

        <Link
          href="/area-membros/banca"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
        >
          Ver todas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 divide-y divide-slate-100 dark:divide-white/[0.06]">
        {recentActivities.map((activity) => {
          const tone = getTone(activity.tone);

          return (
            <div
              key={`${activity.title}-${activity.description}`}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ring-1 ${tone.bg}`}>
                  <ClipboardList className="h-4 w-4" strokeWidth={2} />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-slate-950 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="mt-1 truncate text-[13px] text-slate-500 dark:text-slate-400">
                    {activity.description}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${tone.bg}`}>
                  {activity.status}
                </span>

                <span className={`min-w-[84px] text-right text-[13px] font-semibold ${tone.text}`}>
                  {activity.amount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-5 py-6 md:px-8">
        <header className="flex flex-col gap-4 rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              {t("dashboard.greeting")}
            </p>

            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
              {t("dashboard.overview")}
            </h1>

            <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-slate-600 dark:text-slate-300">
              Resumo da sua banca, desempenho do período e últimas movimentações.
            </p>
          </div>

          <Link
            href="/area-membros/banca"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-[13px] font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nova entrada
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <Panel className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Evolução
              </p>
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                Evolução da banca
              </h2>
            </div>

            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20">
              +R$ 2.146 no período
            </span>
          </div>

          <BankrollChart />
        </Panel>

        <RecentActivities />
      </div>
    </main>
  );
}