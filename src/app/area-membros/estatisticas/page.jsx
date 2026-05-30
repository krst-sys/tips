"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Download,
  FileText,
  Gauge,
  ListChecks,
  Target,
  TrendingUp,
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

const RESULT_META = {
  green: {
    label: "Green",
    color: "#18d66b",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-400/20",
  },
  red: {
    label: "Red",
    color: "#ff4157",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    ring: "ring-rose-400/20",
  },
  cashout: {
    label: "Cashout",
    color: "#f5b82e",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    ring: "ring-amber-400/20",
  },
  pending: {
    label: "Abertas",
    color: "#60a5fa",
    text: "text-sky-300",
    bg: "bg-sky-500/10",
    ring: "ring-sky-400/20",
  },
};

const BREAKDOWN_COLORS = ["#18d66b", "#60a5fa", "#a78bfa", "#f5b82e", "#ff4157", "#94a3b8"];

function toTimestamp(entry) {
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

  if (period === "today") return { start, end };
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

  return {
    start: customRange.start ? new Date(`${customRange.start}T00:00:00`) : new Date("1970-01-01T00:00:00"),
    end: customRange.end ? new Date(`${customRange.end}T23:59:59`) : end,
  };
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

function toneClass(tone) {
  if (tone === "positive") return "text-emerald-600 dark:text-emerald-400";
  if (tone === "negative") return "text-rose-600 dark:text-rose-400";
  if (tone === "warning") return "text-amber-600 dark:text-amber-300";
  if (tone === "blue") return "text-sky-600 dark:text-sky-400";
  if (tone === "purple") return "text-violet-600 dark:text-violet-300";
  return "text-slate-900 dark:text-slate-200";
}

function getStatusLabel(status) {
  if (status === "pending") return "Aberta";
  return getStatusMeta(status).label;
}

function filterByPeriod(entries, range) {
  return entries.filter((entry) => {
    const timestamp = toTimestamp(entry);
    return timestamp >= range.start.getTime() && timestamp <= range.end.getTime();
  });
}

function buildEvolution(entries, initialBankroll, range) {
  const safeInitial = Number.isFinite(Number(initialBankroll)) ? Number(initialBankroll) : 0;
  const startTime = range.start.getTime();
  const endTime = range.end.getTime();
  const settled = [...entries]
    .filter((entry) => entry.status !== "pending")
    .sort((a, b) => toTimestamp(a) - toTimestamp(b));

  let bankroll = safeInitial;
  settled.forEach((entry) => {
    if (toTimestamp(entry) < startTime) {
      bankroll = roundToTwo(bankroll + calculateEntryResult(entry).lucro);
    }
  });

  const points = [{ label: "Início", date: "", value: bankroll }];
  settled
    .filter((entry) => {
      const timestamp = toTimestamp(entry);
      return timestamp >= startTime && timestamp <= endTime;
    })
    .forEach((entry) => {
      bankroll = roundToTwo(bankroll + calculateEntryResult(entry).lucro);
      points.push({
        label: entry.date ? formatDate(entry.date).slice(0, 5) : "Aposta",
        date: entry.date || "",
        value: bankroll,
      });
    });

  return points;
}

function buildDailyProfit(entries) {
  const buckets = new Map();

  entries
    .filter((entry) => entry.status !== "pending")
    .forEach((entry) => {
      const key = entry.date || "Sem data";
      const current = buckets.get(key) || { date: key, profit: 0 };
      current.profit += calculateEntryResult(entry).lucro;
      buckets.set(key, current);
    });

  return [...buckets.values()]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((item) => ({ ...item, profit: roundToTwo(item.profit) }));
}

function normalizeMarket(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Não informado";
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
  if (text.includes("libertadores")) return "Libertadores";
  if (text.includes("brasileirão") || text.includes("brasileirao")) return "Brasileirão Série A";
  if (text.includes("champions")) return "Champions League";
  if (text.includes("nba") || text.includes("basquete")) return "Basquete";
  if (text.includes("tenis") || text.includes("tênis") || text.includes("atp") || text.includes("wta")) return "Tênis";
  if (text.includes("futebol") || text.includes(" x ") || text.includes(" vs ")) return "Futebol";
  return "Não informado";
}

function buildDistributionRows(entries, getKey) {
  const buckets = new Map();

  entries.forEach((entry) => {
    const key = getKey(entry);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  });

  const rows = [...buckets.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  const visible = rows.slice(0, 5);
  const others = rows.slice(5).reduce((sum, row) => sum + row.value, 0);

  return others > 0 ? [...visible, { label: "Outros", value: others }] : visible;
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
      profit: roundToTwo(row.profit),
      hitRate: row.settled > 0 ? roundToTwo((row.greens / row.settled) * 100) : 0,
      roi: row.stake > 0 ? roundToTwo((row.profit / row.stake) * 100) : 0,
    }))
    .sort((a, b) => b.profit - a.profit || b.total - a.total)
    .slice(0, 5);
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
  const variation =
    Number(initialBankroll) > 0
      ? ((currentBankroll - Number(initialBankroll)) / Number(initialBankroll)) * 100
      : 0;

  let bankroll = Number(initialBankroll) || 0;
  let peak = bankroll;
  let maxDrawdown = 0;

  [...settled]
    .sort((a, b) => toTimestamp(a) - toTimestamp(b))
    .forEach((entry) => {
      bankroll += calculateEntryResult(entry).lucro;
      peak = Math.max(peak, bankroll);
      maxDrawdown = Math.max(maxDrawdown, peak - bankroll);
    });
  const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

  const orderedSettled = [...settled].sort((a, b) => toTimestamp(b) - toTimestamp(a));
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
    variation: roundToTwo(variation),
    maxDrawdown: roundToTwo(maxDrawdown),
    maxDrawdownPercent: roundToTwo(maxDrawdownPercent),
    currentStreakLabel: currentStreak ? `${currentStreak} ${currentStatus === "green" ? "greens" : "reds"}` : "Sem sequência",
    currentStreakTone: currentStatus === "green" ? "positive" : currentStatus === "red" ? "negative" : "neutral",
  };
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

function ShellButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`bankroll-mini-button gap-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Panel({ children, className = "" }) {
  return (
    <section className={`bankroll-panel ${className}`}>
      {children}
    </section>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone = "neutral" }) {
  const toneKey =
    tone === "blue"
      ? "sky"
      : tone === "purple"
      ? "violet"
      : tone === "fuchsia"
      ? "fuchsia"
      : tone === "orange"
      ? "orange"
      : tone === "warning"
      ? "amber"
      : tone === "negative"
      ? "red"
      : tone === "positive"
      ? "green"
      : "slate";
  const toneClasses = {
    green: {
      card: "border-emerald-500/25 bg-[radial-gradient(circle_at_15%_18%,rgba(34,197,94,0.18),transparent_46%),linear-gradient(135deg,rgba(11,83,55,0.18),#ffffff)] dark:border-emerald-400/28 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(34,197,94,0.22),transparent_46%),linear-gradient(135deg,rgba(18,73,49,0.86),rgba(14,24,31,0.96))]",
      icon: "bg-emerald-500/14 text-emerald-500 dark:bg-emerald-400/14 dark:text-emerald-300",
      value: "text-emerald-600 dark:text-emerald-300",
    },
    red: {
      card: "border-rose-500/18 bg-[radial-gradient(circle_at_15%_18%,rgba(244,63,94,0.08),transparent_48%),linear-gradient(135deg,rgba(190,18,60,0.045),#ffffff)] dark:border-rose-400/18 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(244,63,94,0.11),transparent_48%),linear-gradient(135deg,rgba(58,28,39,0.72),rgba(14,24,31,0.96))]",
      icon: "bg-rose-500/10 text-rose-500 dark:bg-rose-400/10 dark:text-rose-300",
      value: "text-rose-600 dark:text-rose-300",
    },
    sky: {
      card: "border-sky-500/24 bg-[radial-gradient(circle_at_15%_18%,rgba(56,189,248,0.16),transparent_46%),linear-gradient(135deg,rgba(14,116,144,0.14),#ffffff)] dark:border-sky-400/28 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(56,189,248,0.22),transparent_46%),linear-gradient(135deg,rgba(15,63,91,0.88),rgba(14,24,31,0.96))]",
      icon: "bg-sky-500/14 text-sky-500 dark:bg-sky-400/14 dark:text-sky-300",
      value: "text-sky-600 dark:text-sky-300",
    },
    violet: {
      card: "border-violet-500/18 bg-[radial-gradient(circle_at_15%_18%,rgba(139,92,246,0.09),transparent_48%),linear-gradient(135deg,rgba(109,40,217,0.055),#ffffff)] dark:border-violet-400/20 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(139,92,246,0.13),transparent_48%),linear-gradient(135deg,rgba(39,33,67,0.78),rgba(14,24,31,0.96))]",
      icon: "bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-300",
      value: "text-violet-600 dark:text-violet-300",
    },
    fuchsia: {
      card: "border-fuchsia-500/18 bg-[radial-gradient(circle_at_15%_18%,rgba(217,70,239,0.08),transparent_48%),linear-gradient(135deg,rgba(162,28,175,0.05),#ffffff)] dark:border-fuchsia-400/18 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(217,70,239,0.12),transparent_48%),linear-gradient(135deg,rgba(61,31,68,0.76),rgba(14,24,31,0.96))]",
      icon: "bg-fuchsia-500/10 text-fuchsia-500 dark:bg-fuchsia-400/10 dark:text-fuchsia-300",
      value: "text-fuchsia-600 dark:text-fuchsia-300",
    },
    orange: {
      card: "border-orange-500/18 bg-[radial-gradient(circle_at_15%_18%,rgba(249,115,22,0.08),transparent_48%),linear-gradient(135deg,rgba(194,65,12,0.05),#ffffff)] dark:border-orange-400/20 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(249,115,22,0.12),transparent_48%),linear-gradient(135deg,rgba(63,42,25,0.78),rgba(14,24,31,0.96))]",
      icon: "bg-orange-500/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-300",
      value: "text-orange-700 dark:text-orange-300",
    },
    amber: {
      card: "border-amber-500/25 bg-[radial-gradient(circle_at_15%_18%,rgba(245,158,11,0.16),transparent_46%),linear-gradient(135deg,rgba(180,83,9,0.12),#ffffff)] dark:border-amber-400/30 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(245,158,11,0.23),transparent_46%),linear-gradient(135deg,rgba(74,50,17,0.94),rgba(14,24,31,0.96))]",
      icon: "bg-amber-500/14 text-amber-600 dark:bg-amber-400/14 dark:text-amber-300",
      value: "text-amber-700 dark:text-amber-300",
    },
    slate: {
      card: "border-slate-300/80 bg-[radial-gradient(circle_at_15%_18%,rgba(100,116,139,0.11),transparent_46%),linear-gradient(135deg,rgba(100,116,139,0.08),#ffffff)] dark:border-white/[0.08] dark:bg-[radial-gradient(circle_at_15%_18%,rgba(148,163,184,0.14),transparent_46%),linear-gradient(135deg,rgba(31,41,55,0.84),rgba(14,24,31,0.96))]",
      icon: "bg-slate-500/12 text-slate-500 dark:bg-white/[0.06] dark:text-slate-300",
      value: "text-slate-950 dark:text-white",
    },
  };
  const styles = toneClasses[toneKey];

  return (
    <article className={`rounded-[8px] border p-4 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${styles.card}`}>
      <div className="flex min-h-[76px] items-center gap-3.5">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${styles.icon}`}>
          <Icon className="h-5 w-5" strokeWidth={1.85} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">{label}</p>
          <p className={`mt-1.5 truncate text-[22px] font-black leading-none tracking-[-0.03em] ${styles.value}`}>
            {value}
          </p>
          <p className="mt-2 truncate text-[11.5px] font-semibold text-slate-600 dark:text-slate-400">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function PageHeader({ period, setPeriod, customRange, setCustomRange, filteredEntries }) {
  return (
    <header className="flex justify-end">
      <div className="hidden">
        <div className="bankroll-kicker flex items-center gap-2">
          <span>Área de membros</span>
          <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
          <span className="text-slate-700 dark:text-slate-300">Estatísticas</span>
        </div>
        <h1 className="bankroll-title">
          Estatísticas
        </h1>
        <p className="bankroll-subtitle">
          Painel analítico completo da sua banca e desempenho.
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {PERIODS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`inline-flex h-9 items-center rounded-[12px] px-3.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                period === option.value
                  ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.08]"
              }`}
            >
              {option.label}
            </button>
          ))}

          {period === "custom" ? (
            <div className="flex flex-wrap gap-2">
              <label className="flex h-9 items-center gap-2 rounded-[12px] bg-white px-3 text-[12px] text-slate-600 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08]">
                <CalendarDays className="h-4 w-4" />
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(event) => setCustomRange((current) => ({ ...current, start: event.target.value }))}
                  className="bg-transparent text-slate-900 outline-none dark:text-slate-200"
                />
              </label>
              <label className="flex h-9 items-center gap-2 rounded-[12px] bg-white px-3 text-[12px] text-slate-600 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08]">
                <CalendarDays className="h-4 w-4" />
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(event) => setCustomRange((current) => ({ ...current, end: event.target.value }))}
                  className="bg-transparent text-slate-900 outline-none dark:text-slate-200"
                />
              </label>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => exportCsv(filteredEntries)}
            className="bankroll-secondary-action h-9 min-w-0 px-4"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>
    </header>
  );
}

function EvolutionChart({ data, startLabel, endLabel }) {
  if (data.length <= 1) {
    return (
      <Panel className="flex h-full min-h-[380px] flex-col p-5">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="bankroll-section-title text-[20px]">Evolução da banca</h2>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">i</span>
        </div>
        <div className="flex flex-1 items-center justify-center rounded-[10px] border border-slate-200 bg-slate-50 text-[14px] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-slate-400">
          Finalize apostas para visualizar a evolução da banca.
        </div>
      </Panel>
    );
  }

  const width = 900;
  const height = 390;
  const padding = { top: 28, right: 26, bottom: 52, left: 76 };
  const values = data.map((item) => item.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((item.value - min) / range) * chartHeight;
    return { ...item, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padding.left},${height - padding.bottom} ${line} ${width - padding.right},${height - padding.bottom}`;

  return (
    <Panel className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="bankroll-section-title text-[20px]">Evolução da banca</h2>
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">i</span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-[10px] bg-slate-50/80 dark:bg-white/[0.012]">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-h-[320px] w-full flex-1" role="img">
            <defs>
              <linearGradient id="statsLine" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#18d66b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#18d66b" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((step) => {
              const y = padding.top + chartHeight * step;
              const value = max - range * step;
              return (
                <g key={step}>
                  <line
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={y}
                    y2={y}
                    stroke="rgba(148,163,184,0.13)"
                  />
                  <text x="12" y={y + 4} className="fill-slate-400 text-[11px]">
                    {formatCurrency(value).replace(",00", "")}
                  </text>
                </g>
              );
            })}

            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + chartHeight - ((0 - min) / range) * chartHeight}
              y2={padding.top + chartHeight - ((0 - min) / range) * chartHeight}
              stroke="rgba(148,163,184,0.42)"
              strokeDasharray="3 6"
            />
            <polygon points={area} fill="url(#statsLine)" />
            <polyline points={line} fill="none" stroke="#18d66b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => (
              <circle key={`${point.label}-${index}`} cx={point.x} cy={point.y} r="3.6" fill="#18d66b">
                <title>
                  {point.label}: {formatCurrency(point.value)}
                </title>
              </circle>
            ))}

            <text x={padding.left} y={height - 14} className="fill-slate-400 text-[12px]">
              {startLabel}
            </text>
            <text x={width - padding.right} y={height - 14} textAnchor="end" className="fill-slate-400 text-[12px]">
              {endLabel}
            </text>
          </svg>
        <div className="m-3 mt-0 rounded-[8px] border border-slate-200 bg-white/70 px-3 py-2 text-[12px] font-medium text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.025] dark:text-slate-400">
          Período selecionado: {startLabel} até {endLabel}
        </div>
      </div>
    </Panel>
  );
}

function DonutPanel({ stats }) {
  const items = [
    { key: "green", label: "Green", value: stats.greenEntries },
    { key: "red", label: "Red", value: stats.redEntries },
    { key: "cashout", label: "Cashout", value: stats.cashoutEntries },
    { key: "pending", label: "Abertas", value: stats.pendingEntries },
  ];
  const total = Math.max(1, items.reduce((sum, item) => sum + item.value, 0));
  let cursor = 0;
  const conic = items
    .map((item) => {
      const start = cursor;
      const end = start + (item.value / total) * 100;
      cursor = end;
      return `${RESULT_META[item.key].color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <Panel className="p-5">
      <h2 className="bankroll-section-title text-[18px]">Distribuição dos resultados</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-[164px_minmax(0,1fr)] sm:items-center">
        <div className="relative mx-auto h-[150px] w-[150px] rounded-full" style={{ background: `conic-gradient(${conic})` }}>
          <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner dark:bg-[#111a27]">
            <span className="text-[26px] font-semibold text-slate-950 dark:text-white">{stats.totalEntries}</span>
            <span className="text-[13px] text-slate-500 dark:text-slate-400">apostas</span>
          </div>
        </div>

        <div className="grid gap-3">
          {items.map((item) => {
            const percent = (item.value / total) * 100;
            const meta = RESULT_META[item.key];
            return (
              <div key={item.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                </div>
                <span className="tabular-nums text-slate-600 dark:text-slate-300">
                  {item.value} ({formatPercent(percent)})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function BreakdownDonutPanel({ title, centerLabel, rows, emptyText }) {
  const total = rows.reduce((sum, item) => sum + item.value, 0);
  const safeTotal = Math.max(1, total);
  let cursor = 0;
  const conic =
    total > 0
      ? rows
          .map((item, index) => {
            const start = cursor;
            const end = start + (item.value / safeTotal) * 100;
            cursor = end;
            return `${BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length]} ${start}% ${end}%`;
          })
          .join(", ")
      : "rgba(148,163,184,0.24) 0% 100%";

  return (
    <Panel className="p-5">
      <h2 className="bankroll-section-title text-[18px]">{title}</h2>
      {total === 0 ? (
        <div className="mt-4 rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-[14px] text-slate-500 dark:border-white/[0.12] dark:bg-white/[0.025] dark:text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-[164px_minmax(0,1fr)] sm:items-center">
          <div className="relative mx-auto h-[150px] w-[150px] rounded-full" style={{ background: `conic-gradient(${conic})` }}>
            <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner dark:bg-[#111a27]">
              <span className="text-[26px] font-semibold text-slate-950 dark:text-white">{total}</span>
              <span className="text-[13px] text-slate-500 dark:text-slate-400">{centerLabel}</span>
            </div>
          </div>

          <div className="grid gap-3">
            {rows.map((item, index) => {
              const percent = (item.value / safeTotal) * 100;
              return (
                <div key={item.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-[13px]">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length] }} />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-200" title={item.label}>{item.label}</span>
                  </div>
                  <span className="tabular-nums text-slate-600 dark:text-slate-300">
                    {item.value} ({formatPercent(percent)})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Panel>
  );
}

function FinanceSummary({ series }) {
  if (series.length === 0) {
    return (
      <Panel className="p-5">
        <h2 className="bankroll-section-title text-[18px]">Resumo financeiro</h2>
        <p className="mt-4 text-[14px] text-slate-400">Finalize apostas para ver o resumo do período.</p>
      </Panel>
    );
  }

  const totalProfit = series.reduce((sum, item) => sum + item.profit, 0);
  const bestDay = series.reduce((best, item) => (item.profit > best.profit ? item : best), series[0]);
  const worstDay = series.reduce((worst, item) => (item.profit < worst.profit ? item : worst), series[0]);
  const lastDay = series.at(-1);
  const rows = [
    { label: "Saldo do período", value: formatSignedCurrency(totalProfit), date: "", tone: toneFromNumber(totalProfit) },
    { label: "Melhor dia", value: formatSignedCurrency(bestDay.profit), date: bestDay.date, tone: "positive" },
    { label: "Pior dia", value: formatSignedCurrency(worstDay.profit), date: worstDay.date, tone: "negative" },
    { label: "Último dia analisado", value: formatSignedCurrency(lastDay.profit), date: lastDay.date, tone: toneFromNumber(lastDay.profit) },
  ];

  return (
    <Panel className="p-5">
      <h2 className="bankroll-section-title text-[18px]">Resumo financeiro</h2>
      <div className="mt-4 grid gap-2">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[9px] border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 text-[13px] dark:border-white/[0.07] dark:bg-white/[0.025]">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-500 dark:text-slate-400">{row.label}</p>
              {row.date ? <p className="mt-0.5 text-[12px] text-slate-400">{formatDate(row.date)}</p> : null}
            </div>
            <span className={`text-right font-bold tabular-nums ${toneClass(row.tone)}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PerformanceTable({ title, type, rows, footer }) {
  const columns =
    type === "market"
      ? ["Mercado", "Qtd", "Lucro/Prejuízo", "Taxa de acerto"]
      : ["Esporte / Campeonato", "Qtd", "Lucro/Prejuízo", "ROI"];

  return (
    <Panel className="overflow-hidden">
      <div className="bankroll-panel-head">
        <h2 className="bankroll-section-title text-[18px]">{title}</h2>
      </div>
      <div className="px-4 pb-2">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[46%]" />
            <col className="w-[12%]" />
            <col className="w-[22%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="border-y border-slate-200/80 dark:border-white/[0.07]">
              {columns.map((column) => (
                <th
                  key={column}
                  className={`px-2 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 ${
                    column === "Mercado" || column === "Esporte / Campeonato" ? "text-left" : "text-right"
                  }`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-[14px] text-slate-400">
                  Nenhum dado suficiente no período.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.label} className="border-b border-slate-200/70 last:border-b-0 dark:border-white/[0.06]">
                  <td className="min-w-0 px-2 py-3 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                    <div className="flex min-w-0 items-center">
                    {type === "market" ? (
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white dark:text-slate-950">
                        {index + 1}
                      </span>
                    ) : null}
                      <span className="truncate" title={row.label}>{row.label}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right text-[13px] text-slate-600 dark:text-slate-300">{row.total}</td>
                  <td className={`px-2 py-3 text-right text-[13px] font-bold ${toneClass(toneFromNumber(row.profit))}`}>
                    {formatSignedCurrency(row.profit)}
                  </td>
                  {type === "market" ? (
                    <td className="px-2 py-3 text-right text-[13px] text-slate-600 dark:text-slate-300">{formatPercent(row.hitRate)}</td>
                  ) : (
                    <td className={`px-2 py-3 text-right text-[13px] font-bold ${toneClass(toneFromNumber(row.roi))}`}>
                      {formatPercent(row.roi)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer ? (
        <button className="flex w-full items-center justify-center gap-2 border-t border-slate-200/80 px-5 py-3 text-[13px] font-semibold text-emerald-600 hover:bg-slate-50 dark:border-white/[0.07] dark:text-emerald-400 dark:hover:bg-white/[0.025]">
          {footer}
          <ChevronDown className="h-4 w-4" />
        </button>
      ) : null}
    </Panel>
  );
}

function RiskPanel({ risk }) {
  const items = [
    {
      label: "Exposição atual",
      value: formatCurrency(risk.exposure),
      detail: "Capital em apostas abertas",
      icon: Wallet,
      tone: "blue",
    },
    {
      label: "Stake média",
      value: formatCurrency(risk.averageStake),
      detail: "Disciplina por entrada",
      icon: Activity,
      tone: "purple",
    },
    {
      label: "Maior stake",
      value: formatCurrency(risk.maxStake),
      detail: "Maior entrada registrada",
      icon: ListChecks,
      tone: "neutral",
    },
    {
      label: "Maior green",
      value: formatSignedCurrency(risk.biggestGreen),
      detail: "Melhor resultado individual",
      icon: TrendingUp,
      tone: "positive",
    },
    {
      label: "Maior red",
      value: formatSignedCurrency(risk.biggestRed),
      detail: "Pior resultado individual",
      icon: CircleDollarSign,
      tone: "negative",
    },
    {
      label: "Variação da banca",
      value: formatPercent(risk.variation),
      detail: "vs saldo inicial",
      icon: BarChart3,
      tone: toneFromNumber(risk.variation),
    },
    {
      label: "Drawdown máximo",
      value: risk.maxDrawdownPercent > 0 ? `-${formatPercent(risk.maxDrawdownPercent)}` : formatPercent(0),
      detail: "Maior recuo da banca",
      icon: TrendingUp,
      tone: risk.maxDrawdownPercent > 0 ? "negative" : "neutral",
    },
    {
      label: "Sequência atual",
      value: risk.currentStreakLabel,
      detail: "Resultado em andamento",
      icon: Target,
      tone: risk.currentStreakTone,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </section>
  );
}

function StatusBadge({ status }) {
  const meta = RESULT_META[status] || RESULT_META.pending;
  return (
    <span className={`inline-flex rounded-[7px] px-2.5 py-1 text-[12px] font-semibold ${meta.bg} ${meta.text} ring-1 ${meta.ring}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function HistoryPanel({ entries }) {
  const recent = [...entries].sort((a, b) => toTimestamp(b) - toTimestamp(a)).slice(0, 4);

  return (
    <Panel className="overflow-hidden">
      <div className="bankroll-panel-head">
        <h2 className="bankroll-section-title">Histórico recente</h2>
        <button className="bankroll-mini-button">
          Ver histórico completo
        </button>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="bankroll-table min-w-[900px]">
          <thead>
            <tr>
              {["Data", "Evento", "Mercado", "Stake", "Odd", "Resultado", "Lucro/Prejuízo", ""].map((heading) => (
                <th key={heading || "action"}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-[14px] text-slate-400">
                  Nenhuma aposta registrada ainda.
                </td>
              </tr>
            ) : (
              recent.map((entry) => {
                const result = calculateEntryResult(entry);
                return (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-[13px] text-slate-700 dark:text-slate-200">{formatDate(entry.date)}</td>
                    <td className="px-5 py-3 text-[13px] font-medium text-slate-900 dark:text-slate-100">{entry.event || "Aposta sem título"}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-600 dark:text-slate-300">{entry.market || "Não informado"}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-700 dark:text-slate-200">{formatCurrency(result.stake)}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-700 dark:text-slate-200">{result.odd.toFixed(2).replace(".", ",")}</td>
                    <td className="px-5 py-3"><StatusBadge status={entry.status} /></td>
                    <td className={`px-5 py-3 text-[13px] font-semibold ${toneClass(toneFromNumber(result.lucro))}`}>
                      {entry.status === "pending" ? "--" : formatSignedCurrency(result.lucro)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <FileText className="ml-auto h-4 w-4 text-slate-500" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {recent.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center text-[14px] text-slate-500 dark:border-white/[0.12] dark:bg-white/[0.035] dark:text-slate-400">
            Nenhuma aposta registrada ainda.
          </div>
        ) : (
          recent.map((entry) => {
            const result = calculateEntryResult(entry);
            return (
              <article key={entry.id} className="rounded-[14px] border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">{formatDate(entry.date)}</p>
                    <h3 className="mt-1 truncate text-[14px] font-bold text-slate-950 dark:text-white">{entry.event || "Aposta sem título"}</h3>
                    <p className="mt-1 truncate text-[12px] text-slate-600 dark:text-slate-400">{entry.market || "Não informado"}</p>
                  </div>
                  <StatusBadge status={entry.status} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Stake</p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">{formatCurrency(result.stake)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Odd</p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">{result.odd.toFixed(2).replace(".", ",")}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Lucro</p>
                    <p className={`mt-1 font-bold ${toneClass(toneFromNumber(result.lucro))}`}>
                      {entry.status === "pending" ? "--" : formatSignedCurrency(result.lucro)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </Panel>
  );
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
  const filteredEntries = useMemo(() => filterByPeriod(entries, range), [entries, range]);
  const allStats = useMemo(() => calculateStats(entries, settings.initialBankroll), [entries, settings.initialBankroll]);
  const periodStats = useMemo(
    () => calculateStats(filteredEntries, settings.initialBankroll),
    [filteredEntries, settings.initialBankroll]
  );
  const evolution = useMemo(
    () => buildEvolution(entries, settings.initialBankroll, range),
    [entries, settings.initialBankroll, range]
  );
  const dailyProfit = useMemo(() => buildDailyProfit(filteredEntries), [filteredEntries]);
  const marketDistribution = useMemo(
    () => buildDistributionRows(filteredEntries, (entry) => normalizeMarket(entry.market)),
    [filteredEntries]
  );
  const competitionDistribution = useMemo(
    () => buildDistributionRows(filteredEntries, inferCategory),
    [filteredEntries]
  );
  const risk = useMemo(
    () => calculateRisk(filteredEntries, settings.initialBankroll || 0, allStats.currentBankroll),
    [filteredEntries, settings.initialBankroll, allStats.currentBankroll]
  );

  const startLabel = customRange.start ? formatDate(customRange.start) : formatDate(getInputDate(range.start));
  const endLabel = customRange.end ? formatDate(customRange.end) : formatDate(getInputDate(range.end));

  const metrics = [
    {
      label: "Banca atual",
      value: formatCurrency(allStats.currentBankroll),
      detail: "Disponível para operações",
      icon: Wallet,
      tone: "positive",
    },
    {
      label: "Lucro/prejuízo total",
      value: formatSignedCurrency(allStats.netProfit),
      detail: "Desde o início",
      icon: CircleDollarSign,
      tone: toneFromNumber(allStats.netProfit),
    },
    {
      label: "Lucro/prejuízo no período",
      value: formatSignedCurrency(periodStats.netProfit),
      detail: `${formatPercent(periodStats.roi)} vs período anterior`,
      icon: TrendingUp,
      tone: toneFromNumber(periodStats.netProfit),
    },
    {
      label: "ROI",
      value: formatPercent(periodStats.roi),
      detail: "Retorno sobre investimento",
      icon: Target,
      tone: "fuchsia",
    },
    {
      label: "Taxa de acerto",
      value: formatPercent(periodStats.hitRate),
      detail: "% de apostas vencedoras",
      icon: Gauge,
      tone: "orange",
    },
    {
      label: "Total de apostas",
      value: String(periodStats.totalEntries),
      detail: "No período selecionado",
      icon: ListChecks,
      tone: "blue",
    },
    {
      label: "Greens / Reds / Cashouts",
      value: `${periodStats.greenEntries} / ${periodStats.redEntries} / ${periodStats.cashoutEntries}`,
      detail: "Ver distribuição",
      icon: BarChart3,
      tone: "neutral",
    },
    {
      label: "Stake média",
      value: formatCurrency(periodStats.averageStake),
      detail: "Valor médio por aposta",
      icon: Activity,
      tone: "purple",
    },
  ];

  return (
    <main className="bankroll-page">
      <div className="bankroll-shell flex flex-col gap-4">
        <PageHeader
          period={period}
          setPeriod={setPeriod}
          customRange={customRange}
          setCustomRange={setCustomRange}
          filteredEntries={filteredEntries}
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
          <EvolutionChart
            data={evolution}
            startLabel={startLabel}
            endLabel={endLabel}
          />
          <div className="grid content-start gap-3">
            <DonutPanel stats={periodStats} />
            <FinanceSummary series={dailyProfit} />
          </div>
        </section>

        <RiskPanel risk={risk} />

        <section className="grid gap-3 xl:grid-cols-2">
          <BreakdownDonutPanel
            title="Desempenho por mercado"
            centerLabel="apostas"
            rows={marketDistribution}
            emptyText="Nenhum mercado registrado no período."
          />
          <BreakdownDonutPanel
            title="Competições mais apostadas"
            centerLabel="apostas"
            rows={competitionDistribution}
            emptyText="Nenhuma competição identificada no período."
          />
        </section>

        <HistoryPanel entries={filteredEntries} />
      </div>
    </main>
  );
}
