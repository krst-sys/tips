"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  LineChart,
  Plus,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

const metrics = [
  {
    label: "Banca atual",
    value: "R$ 18.420",
    detail: "+7,5% no mês",
    tone: "positive",
    icon: Wallet,
  },
  {
    label: "Resultado do mês",
    value: "+R$ 2.146",
    detail: "34 apostas finalizadas",
    tone: "positive",
    icon: TrendingUp,
  },
  {
    label: "Taxa de acerto",
    value: "68,4%",
    detail: "Meta: 62%",
    tone: "positive",
    icon: Target,
  },
  {
    label: "ROI",
    value: "14,2%",
    detail: "Período atual",
    tone: "positive",
    icon: LineChart,
  },
  {
    label: "Apostas em aberto",
    value: "7",
    detail: "R$ 620 expostos",
    tone: "neutral",
    icon: ClipboardList,
  },
  {
    label: "Status de risco",
    value: "Baixo",
    detail: "Stake média: 1,8%",
    tone: "safe",
    icon: ShieldCheck,
  },
];

const performance = [
  { label: "Greens", value: "24", tone: "positive" },
  { label: "Reds", value: "10", tone: "negative" },
  { label: "Pendentes", value: "7", tone: "neutral" },
];

const chartBars = [46, 54, 42, 61, 58, 66, 73, 68, 79, 76, 84, 88];

const alerts = [
  {
    title: "Gestão dentro do plano",
    text: "Nenhuma entrada acima do limite de stake configurado.",
    tone: "safe",
    icon: CheckCircle2,
  },
  {
    title: "Atenção em mercados de escanteios",
    text: "ROI negativo no recorte recente. Vale revisar antes da próxima entrada.",
    tone: "warning",
    icon: AlertTriangle,
  },
];

const recentActivities = [
  {
    title: "Barcelona x Sevilla",
    detail: "Over 2.5 gols",
    result: "+R$ 139",
    tone: "positive",
  },
  {
    title: "Chelsea x Brighton",
    detail: "Empate anula",
    result: "-R$ 150",
    tone: "negative",
  },
  {
    title: "Palmeiras x Santos",
    detail: "Palmeiras vence",
    result: "Aberta",
    tone: "neutral",
  },
];

const quickActions = [
  {
    label: "Registrar aposta",
    href: "/area-membros/banca",
    icon: Plus,
  },
  {
    label: "Ver estatísticas",
    href: "/area-membros/estatisticas",
    icon: BarChart3,
  },
  {
    label: "Abrir métodos",
    href: "/area-membros/metodos",
    icon: ShieldCheck,
  },
];

function getTone(tone) {
  if (tone === "positive") {
    return {
      text: "text-emerald-700 dark:text-emerald-300",
      subtle: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
      icon: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    };
  }

  if (tone === "negative") {
    return {
      text: "text-rose-700 dark:text-rose-300",
      subtle: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
      icon: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
    };
  }

  if (tone === "warning") {
    return {
      text: "text-amber-800 dark:text-amber-300",
      subtle: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
      icon: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    };
  }

  if (tone === "safe") {
    return {
      text: "text-teal-700 dark:text-teal-300",
      subtle: "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20",
      icon: "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20",
    };
  }

  return {
    text: "text-slate-700 dark:text-slate-300",
    subtle: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
    icon: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
  };
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
        {title}
      </h2>
    </div>
  );
}

function MetricCard({ metric }) {
  const Icon = metric.icon;
  const tone = getTone(metric.tone);

  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_18px_rgba(15,23,42,0.035)] dark:border-white/[0.08] dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
            {metric.label}
          </p>
          <p className="mt-3 text-[25px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
            {metric.value}
          </p>
          <p className={`mt-2 text-[12px] font-medium ${tone.text}`}>{metric.detail}</p>
        </div>

        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ring-1 ${tone.icon}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}

function PerformanceChart() {
  return (
    <div className="mt-6">
      <div className="flex h-[150px] items-end gap-2 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
        {chartBars.map((height, index) => (
          <div
            key={`${height}-${index}`}
            className="flex flex-1 items-end"
            aria-hidden="true"
          >
            <span
              className="w-full rounded-t-[7px] bg-slate-800 dark:bg-slate-200"
              style={{ height: `${height}%`, opacity: 0.32 + index * 0.045 }}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {performance.map((item) => {
          const tone = getTone(item.tone);
          return (
            <div
              key={item.label}
              className="rounded-[14px] border border-slate-200 bg-white px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]"
            >
              <p className="text-[12px] text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className={`mt-1 text-[20px] font-semibold tracking-[-0.03em] ${tone.text}`}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6 px-5 py-6 md:px-8">
        <header className="flex flex-col gap-4 rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Olá, Thyago
            </p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
              Resumo do painel
            </h1>
            <p className="mt-2 max-w-[640px] text-[14px] leading-6 text-slate-600 dark:text-slate-300">
              Visão rápida da sua banca, desempenho e pontos que merecem atenção hoje.
            </p>
          </div>

          <Link
            href="/area-membros/banca"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-[13px] font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nova aposta
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Panel className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <SectionTitle eyebrow="Performance" title="Resumo dos últimos 30 dias" />
              <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]">
                +R$ 2.146
              </span>
            </div>
            <PerformanceChart />
          </Panel>

          <Panel className="p-6">
            <SectionTitle eyebrow="Avisos" title="Pontos importantes" />

            <div className="mt-5 space-y-3">
              {alerts.map((alert) => {
                const Icon = alert.icon;
                const tone = getTone(alert.tone);

                return (
                  <div
                    key={alert.title}
                    className="rounded-[16px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]"
                  >
                    <div className="flex gap-3">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ring-1 ${tone.icon}`}>
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold text-slate-950 dark:text-white">
                          {alert.title}
                        </p>
                        <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                          {alert.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Panel className="p-6">
            <div className="flex items-start justify-between gap-4">
              <SectionTitle eyebrow="Atividade" title="Recentes" />
              <Link
                href="/area-membros/banca"
                className="text-[13px] font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                Ver tudo
              </Link>
            </div>

            <div className="mt-5 divide-y divide-slate-100 dark:divide-white/[0.06]">
              {recentActivities.map((activity) => {
                const tone = getTone(activity.tone);

                return (
                  <div
                    key={`${activity.title}-${activity.detail}`}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-slate-950 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="mt-1 truncate text-[13px] text-slate-500 dark:text-slate-400">
                        {activity.detail}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${tone.subtle}`}>
                      {activity.result}
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionTitle eyebrow="Atalhos" title="Ações rápidas" />

            <div className="mt-5 grid gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex items-center justify-between gap-4 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.035] dark:hover:border-white/[0.14] dark:hover:bg-white/[0.06]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-white/[0.08]">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <span className="text-[14px] font-semibold text-slate-900 dark:text-white">
                        {action.label}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-white" />
                  </Link>
                );
              })}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
