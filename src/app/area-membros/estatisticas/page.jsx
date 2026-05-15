"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Download,
  Gauge,
  LineChart,
  ShieldCheck,
  Target,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  calculateEntryResult,
  calculateStats,
  formatCurrency,
  formatDate,
  getStatusMeta,
  loadBankrollEntries,
  loadBankrollSettings,
  roundToTwo,
} from "@/lib/bankrollStorage";

const PERIODS = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Este mês", value: "month" },
  { label: "Personalizado", value: "custom" },
];

const RESULT_COLORS = {
  green: "#059669",
  red: "#dc2626",
  cashout: "#d97706",
  pending: "#64748b",
};

function getSortableTimestamp(entry) {
  if (entry?.resolvedAt) {
    const value = new Date(entry.resolvedAt).getTime();
    if (Number.isFinite(value)) return value;
  }

  if (entry?.date) {
    const value = new Date(`${entry.date}T12:00:00`).getTime();
    if (Number.isFinite(value)) return value;
  }

  if (entry?.createdAt) {
    const value = new Date(entry.createdAt).getTime();
    if (Number.isFinite(value)) return value;
  }

  return 0;
}

function getInputDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function getPeriodRange(period, customRange) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "today") {
    return { start, end };
  }

  if (period === "7d") {
    start.setDate(start.getDate() - 6);
    return { start, end };
  }

  if (period === "30d") {
    start.setDate(start.getDate() - 29);
    return { start, end };
  }

  if (period === "month") {
    start.setDate(1);
    return { start, end };
  }

  const customStart = customRange.start
    ? new Date(`${customRange.start}T00:00:00`)
    : new Date("1970-01-01T00:00:00");
  const customEnd = customRange.end
    ? new Date(`${customRange.end}T23:59:59`)
    : end;

  return { start: customStart, end: customEnd };
}

function filterEntriesByPeriod(entries, range) {
  return entries.filter((entry) => {
    const timestamp = getSortableTimestamp(entry);
    return timestamp >= range.start.getTime() && timestamp <= range.end.getTime();
  });
}

function formatPercent(value) {
  return `${roundToTwo(value).toFixed(1).replace(".", ",")}%`;
}

function formatSignedCurrency(value) {
  return `${value > 0 ? "+" : ""}${formatCurrency(value)}`;
}

function toneFromNumber(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function getToneClasses(tone) {
  if (tone === "positive") {
    return {
      text: "text-emerald-700 dark:text-emerald-300",
      soft: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
      border: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
    };
  }

  if (tone === "negative") {
    return {
      text: "text-rose-700 dark:text-rose-300",
      soft: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
      border: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300",
    };
  }

  if (tone === "warning") {
    return {
      text: "text-amber-800 dark:text-amber-300",
      soft: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
      border: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
    };
  }

  return {
    text: "text-slate-700 dark:text-slate-300",
    soft: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
    border: "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300",
  };
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-[18px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-slate-900/92 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 text-[17px] font-semibold tracking-[-0.01em] text-slate-950 dark:text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function MetricCard({ label, value, detail, tone = "neutral", icon: Icon }) {
  const toneClass = getToneClasses(tone);

  return (
    <article className="rounded-[16px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-colors dark:border-white/[0.08] dark:bg-slate-900/92">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2.5 truncate text-[22px] font-semibold tracking-[-0.035em] text-slate-950 dark:text-white">
            {value}
          </p>
          <p className={`mt-1.5 truncate text-[12px] font-medium ${toneClass.text}`}>{detail}</p>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ring-1 ${toneClass.soft}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}

function PeriodButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center rounded-[11px] px-3 text-[13px] font-semibold transition ${
        active
          ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.07] dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const tone =
    status === "green"
      ? "positive"
      : status === "red"
      ? "negative"
      : status === "cashout"
      ? "warning"
      : "neutral";
  const toneClass = getToneClasses(tone);
  const label = status === "pending" ? "Aberta" : getStatusMeta(status).label;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${toneClass.border}`}
    >
      {label}
    </span>
  );
}

function EmptyBlock({ children }) {
  return (
    <div className="flex min-h-[140px] items-center justify-center rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-[14px] text-slate-500 dark:border-white/[0.12] dark:bg-white/[0.035] dark:text-slate-400">
      {children}
    </div>
  );
}

function buildBankrollEvolution(entries, initialBankroll, range = null) {
  const safeInitial = Number.isFinite(Number(initialBankroll)) ? Number(initialBankroll) : 0;
  const settledEntries = [...entries]
    .filter((entry) => entry.status !== "pending")
    .sort((a, b) => getSortableTimestamp(a) - getSortableTimestamp(b));

  let bankroll = safeInitial;
  const startTime = range?.start?.getTime?.() ?? Number.NEGATIVE_INFINITY;
  const endTime = range?.end?.getTime?.() ?? Number.POSITIVE_INFINITY;

  settledEntries.forEach((entry) => {
    if (getSortableTimestamp(entry) < startTime) {
      bankroll = roundToTwo(bankroll + calculateEntryResult(entry).lucro);
    }
  });

  let peak = bankroll;
  let maxDrawdown = 0;
  const data = [{ label: range ? "Início" : "Inicial", date: "Inicial", value: roundToTwo(bankroll), profit: 0 }];

  settledEntries
    .filter((entry) => {
      const timestamp = getSortableTimestamp(entry);
      return timestamp >= startTime && timestamp <= endTime;
    })
    .forEach((entry) => {
    const result = calculateEntryResult(entry);
    bankroll = roundToTwo(bankroll + result.lucro);
    peak = Math.max(peak, bankroll);
    maxDrawdown = Math.max(maxDrawdown, peak - bankroll);

    data.push({
      label: entry.date ? formatDate(entry.date) : "Aposta",
      date: entry.date || "",
      value: bankroll,
      profit: result.lucro,
    });
  });

  return { data, maxDrawdown: roundToTwo(maxDrawdown) };
}

function buildProfitSeries(entries) {
  const buckets = new Map();

  entries
    .filter((entry) => entry.status !== "pending")
    .forEach((entry) => {
      const key = entry.date || "Sem data";
      const current = buckets.get(key) || { date: key, profit: 0, total: 0 };
      current.profit += calculateEntryResult(entry).lucro;
      current.total += 1;
      buckets.set(key, current);
    });

  return [...buckets.values()]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((item) => ({
      ...item,
      label: item.date === "Sem data" ? "Sem data" : formatDate(item.date).slice(0, 5),
      profit: roundToTwo(item.profit),
    }));
}

function normalizeMarket(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Mercado não informado";

  const lower = raw.toLowerCase();
  if (lower.includes("over") || lower.includes("under")) return "Over/Under";
  if (lower.includes("ambas") || lower.includes("btts")) return "Ambas marcam";
  if (lower.includes("handicap")) return "Handicap";
  if (lower.includes("escanteio") || lower.includes("canto")) return "Escanteios";
  if (lower.includes("cart")) return "Cartões";
  if (lower.includes("resultado") || lower.includes("vencedor") || lower.includes("moneyline")) {
    return "Resultado final";
  }

  return raw;
}

function inferCategory(entry) {
  const text = `${entry.event || ""} ${entry.market || ""} ${entry.notes || ""}`.toLowerCase();

  if (text.includes("nba") || text.includes("basquete")) return "Basquete";
  if (text.includes("tenis") || text.includes("tênis") || text.includes("atp") || text.includes("wta")) {
    return "Tênis";
  }
  if (text.includes("libertadores")) return "Libertadores";
  if (text.includes("brasileirão") || text.includes("brasileirao")) return "Brasileirão";
  if (text.includes("champions")) return "Champions League";
  if (text.includes("futebol") || text.includes(" x ") || text.includes(" vs ")) return "Futebol";

  return "Outras categorias";
}

function buildPerformanceRows(entries, getKey) {
  const buckets = new Map();

  entries.forEach((entry) => {
    const key = getKey(entry);
    const current =
      buckets.get(key) || {
        label: key,
        total: 0,
        settled: 0,
        greens: 0,
        stake: 0,
        profit: 0,
      };
    const result = calculateEntryResult(entry);

    current.total += 1;
    current.stake += result.stake;

    if (entry.status !== "pending") {
      current.settled += 1;
      current.profit += result.lucro;
      if (entry.status === "green") current.greens += 1;
    }

    buckets.set(key, current);
  });

  return [...buckets.values()]
    .map((row) => ({
      ...row,
      stake: roundToTwo(row.stake),
      profit: roundToTwo(row.profit),
      hitRate: row.settled > 0 ? roundToTwo((row.greens / row.settled) * 100) : 0,
      roi: row.stake > 0 ? roundToTwo((row.profit / row.stake) * 100) : 0,
    }))
    .sort((a, b) => b.profit - a.profit || b.total - a.total)
    .slice(0, 6);
}

function calculateRisk(entries, initialBankroll, currentBankroll) {
  const results = entries.map((entry) => ({ entry, result: calculateEntryResult(entry) }));
  const pending = results.filter(({ entry }) => entry.status === "pending");
  const settled = results.filter(({ entry }) => entry.status !== "pending");
  const exposure = pending.reduce((sum, item) => sum + item.result.stake, 0);
  const totalStake = results.reduce((sum, item) => sum + item.result.stake, 0);
  const averageStake = results.length > 0 ? totalStake / results.length : 0;
  const maxStake = Math.max(0, ...results.map((item) => item.result.stake));
  const biggestGreen = Math.max(0, ...settled.map((item) => item.result.lucro));
  const biggestRed = Math.min(0, ...settled.map((item) => item.result.lucro));
  const { maxDrawdown } = buildBankrollEvolution(entries, initialBankroll);
  const variation =
    Number(initialBankroll) > 0 ? ((currentBankroll - Number(initialBankroll)) / Number(initialBankroll)) * 100 : 0;

  const orderedSettled = [...entries]
    .filter((entry) => entry.status !== "pending")
    .sort((a, b) => getSortableTimestamp(b) - getSortableTimestamp(a));
  const currentStatus = orderedSettled[0]?.status;
  let currentStreak = 0;

  for (const entry of orderedSettled) {
    if (entry.status !== currentStatus || (entry.status !== "green" && entry.status !== "red")) break;
    currentStreak += 1;
  }

  return {
    averageStake: roundToTwo(averageStake),
    maxStake: roundToTwo(maxStake),
    biggestGreen: roundToTwo(biggestGreen),
    biggestRed: roundToTwo(biggestRed),
    exposure: roundToTwo(exposure),
    exposureRate: currentBankroll > 0 ? roundToTwo((exposure / currentBankroll) * 100) : 0,
    variation: roundToTwo(variation),
    maxDrawdown,
    currentStreak,
    currentStreakLabel:
      currentStreak === 0
        ? "Sem sequência"
        : `${currentStreak} ${currentStatus === "green" ? "greens" : "reds"}`,
    currentStreakTone: currentStatus === "green" ? "positive" : currentStatus === "red" ? "negative" : "neutral",
  };
}

function LineAreaChart({ data }) {
  if (data.length <= 1) {
    return <EmptyBlock>Registre e finalize apostas para visualizar a evolução da banca.</EmptyBlock>;
  }

  const width = 720;
  const height = 260;
  const padding = { top: 18, right: 18, bottom: 30, left: 52 };
  const values = data.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((item.value - min) / range) * chartHeight;
    return { ...item, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padding.left},${height - padding.bottom} ${line} ${
    width - padding.right
  },${height - padding.bottom}`;

  return (
    <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-slate-50 p-2 dark:border-white/[0.08] dark:bg-white/[0.035]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img">
        <defs>
          <linearGradient id="bankrollLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="bankrollArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.33, 0.66, 1].map((step) => {
          const y = padding.top + chartHeight * step;
          const value = max - range * step;
          return (
            <g key={step}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeDasharray="4 6"
                className="text-slate-300/80 dark:text-white/10"
              />
              <text x="8" y={y + 4} className="fill-slate-500 text-[11px] dark:fill-slate-400">
                {formatCurrency(value).replace("R$", "")}
              </text>
            </g>
          );
        })}

        <polygon points={area} fill="url(#bankrollArea)" />
        <polyline points={line} fill="none" stroke="url(#bankrollLine)" strokeWidth="2.6" strokeLinecap="round" />
        {points.map((point, index) => (
          <circle key={`${point.label}-${index}`} cx={point.x} cy={point.y} r="3.4" fill="#059669">
            <title>
              {point.label}: {formatCurrency(point.value)}
            </title>
          </circle>
        ))}

        <text x={padding.left} y={height - 10} className="fill-slate-500 text-[11px] dark:fill-slate-400">
          {data[0]?.label}
        </text>
        <text
          x={width - padding.right}
          y={height - 10}
          textAnchor="end"
          className="fill-slate-500 text-[11px] dark:fill-slate-400"
        >
          {data[data.length - 1]?.label}
        </text>
      </svg>
    </div>
  );
}

function PeriodResultSummary({ data }) {
  if (data.length === 0) {
    return <EmptyBlock>Finalize apostas no período para ver lucro e prejuízo por data.</EmptyBlock>;
  }

  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  const bestDay = data.reduce((best, item) => (item.profit > best.profit ? item : best), data[0]);
  const worstDay = data.reduce((worst, item) => (item.profit < worst.profit ? item : worst), data[0]);
  const lastDay = data.at(-1);

  const summary = [
    {
      label: "Saldo do período",
      value: formatSignedCurrency(totalProfit),
      detail: totalProfit >= 0 ? "Resultado positivo no filtro" : "Resultado negativo no filtro",
      tone: toneFromNumber(totalProfit),
    },
    {
      label: "Melhor dia",
      value: formatSignedCurrency(bestDay.profit),
      detail: bestDay.date === "Sem data" ? "Sem data" : formatDate(bestDay.date),
      tone: "positive",
    },
    {
      label: "Pior dia",
      value: formatSignedCurrency(worstDay.profit),
      detail: worstDay.date === "Sem data" ? "Sem data" : formatDate(worstDay.date),
      tone: "negative",
    },
    {
      label: "Último dia",
      value: formatSignedCurrency(lastDay.profit),
      detail: lastDay.date === "Sem data" ? "Sem data" : formatDate(lastDay.date),
      tone: toneFromNumber(lastDay.profit),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {summary.map((item) => {
        const toneClass = getToneClasses(item.tone);

        return (
          <div key={item.label} className="min-w-0 rounded-[14px] border border-slate-200 bg-slate-50 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.035]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p className={`mt-2 truncate text-[18px] font-semibold tracking-[-0.03em] ${toneClass.text}`}>
              {item.value}
            </p>
            <p className="mt-1 truncate text-[12px] text-slate-500 dark:text-slate-400">{item.detail}</p>
          </div>
        );
      })}
    </div>
  );
}

function ResultDistribution({ stats }) {
  const items = [
    { label: "Green", value: stats.greenEntries, color: RESULT_COLORS.green },
    { label: "Red", value: stats.redEntries, color: RESULT_COLORS.red },
    { label: "Cashout", value: stats.cashoutEntries, color: RESULT_COLORS.cashout },
    { label: "Abertas", value: stats.pendingEntries, color: RESULT_COLORS.pending },
  ];
  const rawTotal = items.reduce((sum, item) => sum + item.value, 0);
  const total = Math.max(1, rawTotal);
  const donutBackground =
    rawTotal === 0
      ? "#cbd5e1"
      : `conic-gradient(${items
          .reduce(
            (segments, item) => {
              const start = segments.offset;
              const end = start + (item.value / total) * 100;
              segments.parts.push(`${item.color} ${start}% ${end}%`);
              segments.offset = end;
              return segments;
            },
            { offset: 0, parts: [] }
          )
          .parts.join(", ")})`;

  return (
    <div className="grid gap-4 sm:grid-cols-[118px_minmax(0,1fr)] sm:items-center">
      <div
        className="mx-auto h-[118px] w-[118px] rounded-full"
        style={{
          background: donutBackground,
        }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full p-3.5">
          <div className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-white text-center shadow-inner dark:bg-slate-900">
            <span className="text-[20px] font-semibold text-slate-950 dark:text-white">{stats.totalEntries}</span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">apostas</span>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        {items.map((item) => {
          const percent = (item.value / total) * 100;
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {item.value} · {formatPercent(percent)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06]">
                <div className="h-1.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PerformanceTable({ rows, titleColumn }) {
  if (rows.length === 0) {
    return <EmptyBlock>Nenhum dado suficiente para esta análise no período selecionado.</EmptyBlock>;
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 dark:border-white/[0.08] md:block">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-white/[0.035]">
            <tr className="text-left">
              {[titleColumn, "Apostas", "Lucro/prejuízo", "Acerto", "ROI"].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {rows.map((row) => {
              const toneClass = getToneClasses(toneFromNumber(row.profit));
              return (
                <tr key={row.label} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.025]">
                  <td className="px-4 py-3.5 text-[14px] font-semibold text-slate-950 dark:text-white">
                    {row.label}
                  </td>
                  <td className="px-4 py-3.5 text-[14px] text-slate-600 dark:text-slate-300">{row.total}</td>
                  <td className={`px-4 py-3.5 text-[14px] font-semibold ${toneClass.text}`}>
                    {formatSignedCurrency(row.profit)}
                  </td>
                  <td className="px-4 py-3.5 text-[14px] text-slate-600 dark:text-slate-300">
                    {formatPercent(row.hitRate)}
                  </td>
                  <td className={`px-4 py-3.5 text-[14px] font-semibold ${toneClass.text}`}>
                    {formatPercent(row.roi)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {rows.map((row) => {
          const toneClass = getToneClasses(toneFromNumber(row.profit));
          return (
            <article
              key={row.label}
              className="rounded-[14px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-semibold text-slate-950 dark:text-white">{row.label}</h3>
                  <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{row.total} apostas</p>
                </div>
                <span className={`text-[14px] font-semibold ${toneClass.text}`}>
                  {formatSignedCurrency(row.profit)}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Acerto</p>
                  <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{formatPercent(row.hitRate)}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">ROI</p>
                  <p className={`mt-1 font-semibold ${toneClass.text}`}>{formatPercent(row.roi)}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function RiskGrid({ risk }) {
  const items = [
    { label: "Stake média", value: formatCurrency(risk.averageStake), tone: "neutral" },
    { label: "Maior stake", value: formatCurrency(risk.maxStake), tone: "neutral" },
    { label: "Maior green", value: formatSignedCurrency(risk.biggestGreen), tone: "positive" },
    { label: "Maior red", value: formatSignedCurrency(risk.biggestRed), tone: "negative" },
    { label: "Exposição atual", value: formatCurrency(risk.exposure), detail: formatPercent(risk.exposureRate), tone: "warning" },
    { label: "Variação da banca", value: formatPercent(risk.variation), tone: toneFromNumber(risk.variation) },
    { label: "Drawdown máximo", value: formatCurrency(risk.maxDrawdown), tone: "negative" },
    { label: "Sequência atual", value: risk.currentStreakLabel, tone: risk.currentStreakTone },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const toneClass = getToneClasses(item.tone);
        return (
          <div
            key={item.label}
            className="rounded-[14px] border border-slate-200 bg-slate-50 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.035]"
          >
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className={`mt-2 truncate text-[17px] font-semibold ${toneClass.text}`}>{item.value}</p>
            {item.detail ? <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{item.detail}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

function RecentHistory({ entries }) {
  const recent = [...entries].sort((a, b) => getSortableTimestamp(b) - getSortableTimestamp(a)).slice(0, 7);

  if (recent.length === 0) {
    return <EmptyBlock>Nenhuma aposta registrada ainda.</EmptyBlock>;
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[14px] border border-slate-200 dark:border-white/[0.08] lg:block">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-white/[0.035]">
            <tr className="text-left">
              {["Data", "Evento", "Mercado", "Stake", "Odd", "Resultado", "Lucro/prejuízo"].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {recent.map((entry) => {
              const result = calculateEntryResult(entry);
              const toneClass = getToneClasses(toneFromNumber(result.lucro));
              return (
                <tr key={entry.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.025]">
                  <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-slate-600 dark:text-slate-300">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="max-w-[280px] truncate text-[14px] font-semibold text-slate-950 dark:text-white">
                      {entry.event || "Aposta sem título"}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-[14px] text-slate-600 dark:text-slate-300">
                    <span className="block max-w-[180px] truncate">{entry.market || "Não informado"}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[14px] font-medium text-slate-950 dark:text-white">
                    {formatCurrency(result.stake)}
                  </td>
                  <td className="px-4 py-3.5 text-[14px] text-slate-600 dark:text-slate-300">
                    {result.odd.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={entry.status} />
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3.5 text-[14px] font-semibold ${toneClass.text}`}>
                    {entry.status === "pending" ? "--" : formatSignedCurrency(result.lucro)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {recent.map((entry) => {
          const result = calculateEntryResult(entry);
          const toneClass = getToneClasses(toneFromNumber(result.lucro));

          return (
            <article
              key={entry.id}
              className="rounded-[14px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">{formatDate(entry.date)}</p>
                  <h3 className="mt-1 truncate text-[14px] font-semibold text-slate-950 dark:text-white">
                    {entry.event || "Aposta sem título"}
                  </h3>
                  <p className="mt-1 truncate text-[12px] text-slate-500 dark:text-slate-400">
                    {entry.market || "Não informado"}
                  </p>
                </div>
                <StatusBadge status={entry.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Stake</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">{formatCurrency(result.stake)}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Odd</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">{result.odd.toFixed(2).replace(".", ",")}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Lucro</p>
                  <p className={`mt-1 font-semibold ${toneClass.text}`}>
                    {entry.status === "pending" ? "--" : formatSignedCurrency(result.lucro)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function exportCsv(entries) {
  const headers = ["Data", "Evento", "Mercado", "Stake", "Odd", "Status", "Retorno", "Lucro"];
  const lines = entries.map((entry) => {
    const result = calculateEntryResult(entry);
    return [
      entry.date || "",
      entry.event || "",
      entry.market || "",
      result.stake,
      result.odd,
      entry.status || "",
      result.retorno,
      result.lucro,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");
  });
  const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "estatisticas-banca.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function EstatisticasPage() {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({ initialBankroll: "" });
  const [period, setPeriod] = useState("30d");
  const [customRange, setCustomRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return { start: getInputDate(start), end: getInputDate(end) };
  });

  useEffect(() => {
    window.queueMicrotask(() => {
      setEntries(loadBankrollEntries().filter((entry) => !entry.movementType));
      setSettings(loadBankrollSettings());
    });
  }, []);

  const range = useMemo(() => getPeriodRange(period, customRange), [period, customRange]);
  const filteredEntries = useMemo(() => filterEntriesByPeriod(entries, range), [entries, range]);
  const allStats = useMemo(
    () => calculateStats(entries, settings.initialBankroll),
    [entries, settings.initialBankroll]
  );
  const periodStats = useMemo(
    () => calculateStats(filteredEntries, settings.initialBankroll),
    [filteredEntries, settings.initialBankroll]
  );
  const bankrollEvolution = useMemo(
    () => buildBankrollEvolution(entries, settings.initialBankroll, range),
    [entries, settings.initialBankroll, range]
  );
  const profitSeries = useMemo(() => buildProfitSeries(filteredEntries), [filteredEntries]);
  const marketRows = useMemo(
    () => buildPerformanceRows(filteredEntries, (entry) => normalizeMarket(entry.market)),
    [filteredEntries]
  );
  const categoryRows = useMemo(
    () => buildPerformanceRows(filteredEntries, inferCategory),
    [filteredEntries]
  );
  const risk = useMemo(
    () => calculateRisk(filteredEntries, settings.initialBankroll || 0, allStats.currentBankroll),
    [filteredEntries, settings.initialBankroll, allStats.currentBankroll]
  );

  const cards = [
    {
      label: "Banca atual",
      value: formatCurrency(allStats.currentBankroll),
      detail:
        settings.initialBankroll === ""
          ? "Defina a banca inicial na página Banca"
          : `Base ${formatCurrency(allStats.initialBankroll)}`,
      tone: toneFromNumber(allStats.netProfit),
      icon: Wallet,
    },
    {
      label: "Lucro/prejuízo total",
      value: formatSignedCurrency(allStats.netProfit),
      detail: `${allStats.totalEntries} apostas registradas`,
      tone: toneFromNumber(allStats.netProfit),
      icon: CircleDollarSign,
    },
    {
      label: "Lucro/prejuízo no período",
      value: formatSignedCurrency(periodStats.netProfit),
      detail: `${filteredEntries.length} apostas no filtro`,
      tone: toneFromNumber(periodStats.netProfit),
      icon: periodStats.netProfit >= 0 ? ArrowUpRight : ArrowDownRight,
    },
    {
      label: "ROI",
      value: formatPercent(periodStats.roi),
      detail: `Stake liquidada ${formatCurrency(periodStats.settledStake)}`,
      tone: toneFromNumber(periodStats.roi),
      icon: Gauge,
    },
    {
      label: "Taxa de acerto",
      value: formatPercent(periodStats.hitRate),
      detail: `${periodStats.greenEntries} greens de ${Math.max(0, periodStats.totalEntries - periodStats.pendingEntries)}`,
      tone: periodStats.hitRate >= 50 ? "positive" : periodStats.hitRate > 0 ? "warning" : "neutral",
      icon: Target,
    },
    {
      label: "Total de apostas",
      value: String(periodStats.totalEntries),
      detail: `${periodStats.pendingEntries} abertas`,
      tone: "neutral",
      icon: BarChart3,
    },
    {
      label: "Greens / Reds / Cashouts",
      value: `${periodStats.greenEntries}/${periodStats.redEntries}/${periodStats.cashoutEntries}`,
      detail: "Resultados finalizados",
      tone: "neutral",
      icon: Trophy,
    },
    {
      label: "Stake média",
      value: formatCurrency(periodStats.averageStake),
      detail: `Odd média ${periodStats.averageOdd.toFixed(2).replace(".", ",")}`,
      tone: "neutral",
      icon: Activity,
    },
  ];

  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-5 md:px-8">
        <header className="rounded-[18px] border border-slate-200/80 bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-slate-900/92">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                  Estatísticas
                </h1>
                <Link
                  href="/area-membros/banca"
                  className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-[11px] px-3 text-[13px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para Banca
                </Link>
              </div>
              <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-slate-600 dark:text-slate-400">
                Acompanhe a evolução da banca, resultados, risco e desempenho das apostas em um painel de análise.
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex w-fit max-w-full flex-wrap gap-1 rounded-[13px] border border-slate-200 bg-slate-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
                {PERIODS.map((option) => (
                  <PeriodButton
                    key={option.value}
                    active={period === option.value}
                    onClick={() => setPeriod(option.value)}
                  >
                    {option.label}
                  </PeriodButton>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                {period === "custom" ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="flex h-10 items-center gap-2 rounded-[11px] bg-white px-3 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08]">
                      <CalendarDays className="h-4 w-4" />
                      <input
                        type="date"
                        value={customRange.start}
                        onChange={(event) => setCustomRange((current) => ({ ...current, start: event.target.value }))}
                        className="bg-transparent text-[13px] text-slate-950 outline-none dark:text-white"
                      />
                    </label>
                    <label className="flex h-10 items-center gap-2 rounded-[11px] bg-white px-3 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08]">
                      <CalendarDays className="h-4 w-4" />
                      <input
                        type="date"
                        value={customRange.end}
                        onChange={(event) => setCustomRange((current) => ({ ...current, end: event.target.value }))}
                        className="bg-transparent text-[13px] text-slate-950 outline-none dark:text-white"
                      />
                    </label>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => exportCsv(filteredEntries)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[11px] bg-white px-3.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </section>

        <section>
          <Panel className="p-5">
            <SectionHeader
              eyebrow="Evolução"
              title="Evolução da banca"
              description="Linha principal da página, calculada com as apostas finalizadas no período selecionado."
              action={
                <span className="inline-flex h-9 items-center gap-2 rounded-[12px] px-3 text-[13px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:text-emerald-300 dark:ring-emerald-400/20">
                  <LineChart className="h-4 w-4" />
                  {formatCurrency(bankrollEvolution.data.at(-1)?.value || 0)}
                </span>
              }
            />
            <div className="mt-4">
              <LineAreaChart data={bankrollEvolution.data} />
            </div>
          </Panel>
        </section>

        <section>
          <Panel className="p-5">
            <SectionHeader
              eyebrow="Resultados"
              title="Resultados do período"
              description="Distribuição dos status e saldo consolidado do filtro atual."
            />

            <div className="mt-5 grid gap-6 xl:grid-cols-[0.85fr_1.15fr] xl:items-center">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-[14px] font-semibold text-slate-950 dark:text-white">
                    Distribuição
                  </h3>
                  <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                    {periodStats.totalEntries} apostas
                  </span>
                </div>
                <ResultDistribution stats={periodStats} />
              </div>

              <div className="border-t border-slate-200 pt-5 dark:border-white/[0.06] xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                <div className="mb-3">
                  <h3 className="text-[14px] font-semibold text-slate-950 dark:text-white">
                    Resumo financeiro
                  </h3>
                  <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">
                    Principais números do lucro/prejuízo no período.
                  </p>
                </div>
                <PeriodResultSummary data={profitSeries} />
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid items-start gap-5 xl:grid-cols-2">
          <Panel className="p-5">
            <SectionHeader
              eyebrow="Mercados"
              title="Desempenho por mercado"
              description="Ranking dos mercados por lucro, acerto e ROI."
            />
            <div className="mt-4">
              <PerformanceTable rows={marketRows} titleColumn="Mercado" />
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionHeader
              eyebrow="Categorias"
              title="Desempenho por esporte/campeonato"
              description="Agrupamento simples por categoria inferida dos registros."
            />
            <div className="mt-4">
              <PerformanceTable rows={categoryRows} titleColumn="Esporte/campeonato" />
            </div>
          </Panel>
        </section>

        <Panel className="p-5">
          <SectionHeader
            eyebrow="Risco"
            title="Gestão de risco"
            description="Indicadores de exposição, drawdown e variação para acompanhar disciplina de banca."
            action={
              <Link
                href="/area-membros/banca"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-[12px] bg-white px-3.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
              >
                <ShieldCheck className="h-4 w-4" />
                Gerenciar banca
              </Link>
            }
          />
          <div className="mt-4">
            <RiskGrid risk={risk} />
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHeader
            eyebrow="Histórico resumido"
            title="Últimos resultados"
            description="Uma visão compacta das apostas mais recentes, sem competir com a página de Banca."
          />
          <div className="mt-4">
            <RecentHistory entries={filteredEntries} />
          </div>
        </Panel>
      </div>
    </main>
  );
}
