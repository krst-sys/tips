"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateEntryResult,
  calculateStats,
  formatCurrency,
  formatDate,
  getStatusMeta,
  loadBankrollEntries,
  loadBankrollSettings,
} from "@/lib/bankrollStorage";

const HISTORY_PAGE_SIZE = 10;

function ChartIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 16L10 11L13.2 14.2L19 8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5H19V12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WalletIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 8.5C4 7.12 5.12 6 6.5 6H17.5C18.88 6 20 7.12 20 8.5V15.5C20 16.88 18.88 18 17.5 18H6.5C5.12 18 4 16.88 4 15.5V8.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M15.5 12H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="15.5" cy="12" r="1" fill="currentColor" />
      <path
        d="M7 6V5.7C7 4.76 7.76 4 8.7 4H17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TicketIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 7H17C18.1 7 19 7.9 19 9V10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14V15C19 16.1 18.1 17 17 17H7C5.9 17 5 16.1 5 15V14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10V9C5 7.9 5.9 7 7 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.5V15.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="1.8 1.8"
      />
    </svg>
  );
}

function getStatusBadgeClass(status) {
  if (status === "green") {
    return "border-[#2c4720] bg-[rgba(141,241,38,0.08)] text-[#6ea900] dark:text-[#8df126]";
  }

  if (status === "red") {
    return "border-[#4a2729] bg-[rgba(219,143,143,0.08)] text-[#b85d5d] dark:text-[#db8f8f]";
  }

  if (status === "cashout") {
    return "border-[#7b6d20] bg-[rgba(234,214,99,0.12)] text-[#8a7410] dark:border-[#3b3a20] dark:bg-[rgba(234,214,99,0.08)] dark:text-[#ead663]";
  }

  return "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/72";
}

function StatCard({ label, value, meta, tone = "default", icon }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500 dark:text-white/32">
            {label}
          </p>
          <h3 className="mt-3 text-[30px] font-black tracking-[-0.05em] text-slate-900 dark:text-white">
            {value}
          </h3>
          <p
            className={`mt-3 text-[13px] font-medium ${
              tone === "green"
                ? "text-[#6ea900] dark:text-[#8df126]"
                : tone === "red"
                ? "text-[#b85d5d] dark:text-[#db8f8f]"
                : "text-slate-500 dark:text-white/52"
            }`}
          >
            {meta}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-[14px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#152131_0%,#111b29_100%)] ${
            tone === "green"
              ? "text-[#8df126]"
              : tone === "red"
              ? "text-[#db8f8f]"
              : "text-sky-600 dark:text-[#86a5cf]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SummaryPill({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "green"
      ? "border-[#b9dea2] bg-[linear-gradient(180deg,#f3fde9_0%,#edf8e6_100%)] text-[#6ea900] dark:border-[#2c4720] dark:bg-[linear-gradient(180deg,#132012_0%,#111a12_100%)] dark:text-[#8df126]"
      : tone === "red"
      ? "border-[#e6b8bb] bg-[linear-gradient(180deg,#fff3f4_0%,#fceced_100%)] text-[#b85d5d] dark:border-[#4a2729] dark:bg-[linear-gradient(180deg,#1b1214_0%,#171012_100%)] dark:text-[#db8f8f]"
      : tone === "yellow"
      ? "border-[#eadf9f] bg-[linear-gradient(180deg,#fffbe8_0%,#fdf7df_100%)] text-[#8a7410] dark:border-[#3b3a20] dark:bg-[linear-gradient(180deg,#1c1a10_0%,#17150e_100%)] dark:text-[#ead663]"
      : "border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-slate-700 dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] dark:text-white/78";

  return (
    <div className={`rounded-[16px] border px-4 py-4 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-60">
        {label}
      </p>
      <div className="mt-2 text-[20px] font-black tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center rounded-[12px] border px-4 text-[13px] font-semibold transition ${
        active
          ? "border-[#8df126]/40 bg-[rgba(141,241,38,0.12)] text-[#6ea900] dark:text-[#8df126]"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/72 dark:hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function PaginationControls({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[13px] text-slate-500 dark:text-white/42">
        Página <span className="font-semibold text-slate-900 dark:text-white">{page}</span> de{" "}
        <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="inline-flex h-10 items-center rounded-[12px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/78 dark:hover:bg-white/[0.05]"
        >
          Anterior
        </button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1;
          const active = pageNumber === page;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-[12px] border text-[13px] font-bold transition ${
                active
                  ? "border-[#8df126]/40 bg-[rgba(141,241,38,0.12)] text-[#6ea900] dark:text-[#8df126]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/72 dark:hover:bg-white/[0.05]"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="inline-flex h-10 items-center rounded-[12px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/78 dark:hover:bg-white/[0.05]"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

function getSortableTimestamp(entry) {
  if (entry?.resolvedAt) {
    const value = new Date(entry.resolvedAt).getTime();
    if (Number.isFinite(value)) return value;
  }

  if (entry?.createdAt) {
    const value = new Date(entry.createdAt).getTime();
    if (Number.isFinite(value)) return value;
  }

  if (entry?.date) {
    const value = new Date(entry.date).getTime();
    if (Number.isFinite(value)) return value;
  }

  return 0;
}

function buildEvolution(entries, initialBankroll) {
  const safeInitial = Number.isFinite(Number(initialBankroll))
    ? Number(initialBankroll)
    : 0;

  const settledEntries = [...entries]
    .filter((entry) => entry.status !== "pending")
    .sort((a, b) => getSortableTimestamp(a) - getSortableTimestamp(b));

  let bankroll = safeInitial;

  const evolution = [
    {
      label: "Inicial",
      value: bankroll,
    },
  ];

  settledEntries.forEach((entry, index) => {
    bankroll += calculateEntryResult(entry).lucro;

    evolution.push({
      label: entry.date ? formatDate(entry.date) : `Aposta ${index + 1}`,
      value: bankroll,
    });
  });

  return evolution;
}

function calculateSequences(entries) {
  const settledEntries = [...entries]
    .filter((entry) => entry.status !== "pending")
    .sort((a, b) => getSortableTimestamp(a) - getSortableTimestamp(b));

  let currentGreen = 0;
  let currentRed = 0;
  let bestGreen = 0;
  let worstRed = 0;

  settledEntries.forEach((entry) => {
    if (entry.status === "green") {
      currentGreen += 1;
      currentRed = 0;
    } else if (entry.status === "red") {
      currentRed += 1;
      currentGreen = 0;
    } else {
      currentGreen = 0;
      currentRed = 0;
    }

    if (currentGreen > bestGreen) bestGreen = currentGreen;
    if (currentRed > worstRed) worstRed = currentRed;
  });

  return {
    bestGreenStreak: bestGreen,
    worstRedStreak: worstRed,
  };
}

function EvolutionChart({ evolution }) {
  const data =
    Array.isArray(evolution) && evolution.length > 0
      ? evolution
      : [{ label: "Inicial", value: 0 }];

  const max = Math.max(...data.map((item) => item.value));
  const min = Math.min(...data.map((item) => item.value));
  const range = max - min || 1;

  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 100 - ((item.value - min) / range) * 76 - 12;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#0d1520_0%,#0b121b_100%)]">
      <div className="h-[300px] w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="bankrollStatsLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6e8fbe" />
              <stop offset="55%" stopColor="#86a5cf" />
              <stop offset="100%" stopColor="#8df126" />
            </linearGradient>
            <linearGradient id="bankrollStatsArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(110,143,190,0.22)" />
              <stop offset="100%" stopColor="rgba(110,143,190,0.02)" />
            </linearGradient>
          </defs>

          {[20, 40, 60, 80].map((line) => (
            <line
              key={line}
              x1="0"
              y1={line}
              x2="100"
              y2={line}
              stroke="currentColor"
              strokeWidth="0.6"
              strokeDasharray="2 3"
              className="text-slate-300 dark:text-white/10"
            />
          ))}

          <polygon points={areaPoints} fill="url(#bankrollStatsArea)" />
          <polyline
            points={points}
            fill="none"
            stroke="url(#bankrollStatsLine)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((item, index) => {
            const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
            const y = 100 - ((item.value - min) / range) * 76 - 12;

            return (
              <g key={`${item.label}-${index}`}>
                <circle cx={x} cy={y} r="1.9" fill="#86a5cf" />
                <circle cx={x} cy={y} r="3.2" fill="rgba(134,165,207,0.10)" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 overflow-x-auto text-[12px] font-medium text-slate-500 dark:text-white/36">
        <span>{data[0]?.label || "Inicial"}</span>
        <span>Evolução da banca</span>
        <span>{data[data.length - 1]?.label || "Atual"}</span>
      </div>
    </div>
  );
}

export default function EstatisticasPage() {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({ initialBankroll: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setEntries(loadBankrollEntries());
    setSettings(loadBankrollSettings());
  }, []);

  const stats = useMemo(() => {
    return calculateStats(entries, settings.initialBankroll);
  }, [entries, settings.initialBankroll]);

  const extraStats = useMemo(() => {
    return {
      evolution: buildEvolution(entries, settings.initialBankroll),
      ...calculateSequences(entries),
    };
  }, [entries, settings.initialBankroll]);

  const orderedEntries = useMemo(() => {
    return [...entries].sort((a, b) => getSortableTimestamp(b) - getSortableTimestamp(a));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (statusFilter === "all") return orderedEntries;
    return orderedEntries.filter((entry) => entry.status === statusFilter);
  }, [orderedEntries, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / HISTORY_PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedEntries = useMemo(() => {
    const start = (page - 1) * HISTORY_PAGE_SIZE;
    const end = start + HISTORY_PAGE_SIZE;
    return filteredEntries.slice(start, end);
  }, [filteredEntries, page]);

  const initialBankrollLabel =
    settings.initialBankroll === "" || settings.initialBankroll === null
      ? "R$ 0,00"
      : formatCurrency(stats.initialBankroll);

  const initialBankrollMeta =
    settings.initialBankroll === "" || settings.initialBankroll === null
      ? "Defina esse valor na página Banca"
      : "Valor base definido na planilha";

  return (
    <main className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent text-slate-900 dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_92%_10%,rgba(141,241,38,0.08),transparent_20%),linear-gradient(180deg,#f8fafc_0%,#eef3f8_100%)] dark:bg-[radial-gradient(circle_at_12%_8%,rgba(92,126,176,0.16),transparent_22%),radial-gradient(circle_at_92%_10%,rgba(141,241,38,0.06),transparent_18%),linear-gradient(180deg,#08111b_0%,#0a1320_100%)]" />
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <section className="mx-auto max-w-[1550px] px-5 py-6 md:px-8">
          <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,250,252,0.92)_100%)] p-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)] lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,rgba(16,25,37,0.92)_0%,rgba(13,21,32,0.92)_100%)] dark:shadow-[0_16px_34px_rgba(0,0,0,0.20)]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.11em] text-[#6ea900] dark:text-[#8df126]">
                Gestão de banca
              </p>

              <h1 className="mt-1 text-[30px] font-black tracking-[-0.06em] text-slate-900 dark:text-white">
                Estatísticas
              </h1>

              <p className="mt-2 text-[14px] text-slate-500 dark:text-white/48">
                Histórico completo, indicadores e evolução da banca.
              </p>
            </div>

            <Link
              href="/area-membros/banca"
              className="inline-flex h-12 w-fit items-center gap-2 rounded-[16px] border border-[#a6ff4d]/20 bg-[#8df126] px-5 text-[14px] font-bold text-[#081200] shadow-[0_10px_24px_rgba(141,241,38,0.18)] transition hover:brightness-105"
            >
              <TicketIcon className="h-4 w-4 text-[#081200]" />
              <span className="text-[#081200]">Voltar para banca</span>
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Banca inicial"
              value={initialBankrollLabel}
              meta={initialBankrollMeta}
              tone="default"
              icon={<WalletIcon />}
            />

            <StatCard
              label="Banca atual"
              value={formatCurrency(stats.currentBankroll)}
              meta={`${stats.totalEntries} apostas registradas`}
              tone={stats.netProfit >= 0 ? "green" : "red"}
              icon={<WalletIcon />}
            />

            <StatCard
              label="Lucro líquido"
              value={`${stats.netProfit >= 0 ? "+" : ""}${formatCurrency(stats.netProfit)}`}
              meta={`Retorno total ${formatCurrency(stats.totalReturn)}`}
              tone={stats.netProfit >= 0 ? "green" : "red"}
              icon={<ChartIcon />}
            />

            <StatCard
              label="ROI"
              value={`${stats.roi.toFixed(1).replace(".", ",")}%`}
              meta={`Taxa de green ${stats.hitRate.toFixed(1).replace(".", ",")}%`}
              tone={stats.roi >= 0 ? "green" : "red"}
              icon={<ChartIcon />}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] dark:shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.10em] text-[#6ea900] dark:text-[#8df126]">
                    Evolução
                  </p>
                  <h2 className="mt-2 text-[24px] font-black tracking-[-0.05em] text-slate-900 dark:text-white">
                    Evolução da banca
                  </h2>
                </div>

                <div className="rounded-full border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-3 py-1.5 text-[12px] font-semibold text-[#6ea900] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#152131_0%,#111a26_100%)] dark:text-[#8df126]">
                  {formatCurrency(stats.currentBankroll)} atual
                </div>
              </div>

              <div className="mt-6">
                <EvolutionChart evolution={extraStats.evolution} />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] dark:shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.10em] text-[#6ea900] dark:text-[#8df126]">
                  Resumo do período
                </p>
                <h2 className="mt-2 text-[24px] font-black tracking-[-0.05em] text-slate-900 dark:text-white">
                  Indicadores
                </h2>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <SummaryPill label="Greens" value={String(stats.greenEntries)} tone="green" />
                <SummaryPill label="Reds" value={String(stats.redEntries)} tone="red" />
                <SummaryPill label="Cashouts" value={String(stats.cashoutEntries)} tone="yellow" />
                <SummaryPill label="Pendentes" value={String(stats.pendingEntries)} tone="neutral" />
                <SummaryPill
                  label="Stake média"
                  value={formatCurrency(stats.averageStake)}
                  tone="neutral"
                />
                <SummaryPill
                  label="Odd média"
                  value={stats.averageOdd.toFixed(2).replace(".", ",")}
                  tone="neutral"
                />
                <SummaryPill
                  label="Melhor sequência"
                  value={`${extraStats.bestGreenStreak} greens`}
                  tone="green"
                />
                <SummaryPill
                  label="Pior sequência"
                  value={`${extraStats.worstRedStreak} reds`}
                  tone="red"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] dark:shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-black uppercase tracking-[0.10em] text-[#6ea900] dark:text-[#8df126]">
                  Histórico completo
                </p>
                <h2 className="text-[24px] font-black tracking-[-0.05em] text-slate-900 dark:text-white">
                  Todas as apostas
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                  Todas
                </FilterButton>
                <FilterButton
                  active={statusFilter === "pending"}
                  onClick={() => setStatusFilter("pending")}
                >
                  Pendentes
                </FilterButton>
                <FilterButton
                  active={statusFilter === "green"}
                  onClick={() => setStatusFilter("green")}
                >
                  Greens
                </FilterButton>
                <FilterButton active={statusFilter === "red"} onClick={() => setStatusFilter("red")}>
                  Reds
                </FilterButton>
                <FilterButton
                  active={statusFilter === "cashout"}
                  onClick={() => setStatusFilter("cashout")}
                >
                  Cashouts
                </FilterButton>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[22px] border border-slate-200 dark:border-white/[0.06]">
              <div className="overflow-x-auto">
                <table className="min-w-[1080px] w-full">
                  <thead className="bg-slate-50 dark:bg-[rgba(255,255,255,0.03)]">
                    <tr className="text-left">
                      <th className="px-4 py-4 text-[11px] font-black uppercase tracking-[0.09em] text-slate-500 dark:text-white/34">
                        Data
                      </th>
                      <th className="px-4 py-4 text-[11px] font-black uppercase tracking-[0.09em] text-slate-500 dark:text-white/34">
                        Evento
                      </th>
                      <th className="px-4 py-4 text-[11px] font-black uppercase tracking-[0.09em] text-slate-500 dark:text-white/34">
                        Stake
                      </th>
                      <th className="px-4 py-4 text-[11px] font-black uppercase tracking-[0.09em] text-slate-500 dark:text-white/34">
                        Odd
                      </th>
                      <th className="px-4 py-4 text-[11px] font-black uppercase tracking-[0.09em] text-slate-500 dark:text-white/34">
                        Status
                      </th>
                      <th className="px-4 py-4 text-[11px] font-black uppercase tracking-[0.09em] text-slate-500 dark:text-white/34">
                        Retorno
                      </th>
                      <th className="px-4 py-4 text-[11px] font-black uppercase tracking-[0.09em] text-slate-500 dark:text-white/34">
                        Lucro
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-[14px] text-slate-500 dark:text-white/42"
                        >
                          Nenhuma aposta encontrada nesse filtro.
                        </td>
                      </tr>
                    ) : (
                      paginatedEntries.map((entry) => {
                        const result = calculateEntryResult(entry);
                        const status = getStatusMeta(entry.status);

                        return (
                          <tr key={entry.id} className="border-t border-slate-200 dark:border-white/[0.06]">
                            <td className="px-4 py-4 text-[14px] text-slate-600 dark:text-white/76">
                              {formatDate(entry.date)}
                            </td>

                            <td className="px-4 py-4">
                              <div className="max-w-[320px]">
                                <div className="truncate text-[14px] font-semibold text-slate-900 dark:text-white">
                                  {entry.event}
                                </div>
                                <div className="mt-1 truncate text-[12px] text-slate-500 dark:text-white/38">
                                  {entry.market || "Sem mercado informado"}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-[14px] font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(result.stake)}
                            </td>

                            <td className="px-4 py-4 text-[14px] text-slate-700 dark:text-white/82">
                              {result.odd.toFixed(2).replace(".", ",")}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-bold ${getStatusBadgeClass(
                                  entry.status
                                )}`}
                              >
                                {status.label}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-[14px] text-slate-700 dark:text-white/82">
                              {entry.status === "pending" ? "--" : formatCurrency(result.retorno)}
                            </td>

                            <td
                              className={`px-4 py-4 text-[14px] font-bold ${
                                result.lucro > 0
                                  ? "text-[#6ea900] dark:text-[#8df126]"
                                  : result.lucro < 0
                                  ? "text-[#b85d5d] dark:text-[#db8f8f]"
                                  : "text-slate-500 dark:text-white/60"
                              }`}
                            >
                              {entry.status === "pending"
                                ? "--"
                                : `${result.lucro > 0 ? "+" : ""}${formatCurrency(result.lucro)}`}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </section>
      </div>
    </main>
  );
}