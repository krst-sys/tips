"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FilePenLine,
  Landmark,
  Minus,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  TrendingDown,
  TrendingUp,
  Trash2,
  Upload,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import {
  calculateEntryResult,
  calculateStats,
  formatCurrency,
  formatDate,
  getTodayInputValue,
  loadBankrollEntries,
  loadBankrollSettings,
  saveBankrollEntries,
  saveBankrollSettings,
  toNumber,
} from "@/lib/bankrollStorage";

const INITIAL_FORM = {
  date: "",
  event: "",
  market: "",
  stake: "",
  odd: "",
  notes: "",
};

const INITIAL_TRANSACTION_FORM = {
  value: "",
  notes: "",
};

const PAGE_SIZE = 8;
const RECENT_HISTORY_SIZE = 5;
const MARKET_SUGGESTIONS = [
  "Resultado",
  "Over/Under",
  "Ambas marcam",
  "Escanteios",
  "Cartões",
  "Outro",
];

const STAKE_PRESETS = [10, 25, 50, 100];

const historyStatusFilters = [
  { label: "Todas", value: "all" },
  { label: "Green", value: "green" },
  { label: "Red", value: "red" },
  { label: "Cashout", value: "cashout" },
];

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
    const value = new Date(`${entry.date}T12:00:00`).getTime();
    if (Number.isFinite(value)) return value;
  }

  return 0;
}

function getStatusLabel(status) {
  if (status === "green") return "Green";
  if (status === "red") return "Red";
  if (status === "cashout") return "Cashout";
  return "Aberta";
}

function getToneFromValue(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function getToneClasses(tone) {
  if (tone === "positive") {
    return {
      text: "text-emerald-700 dark:text-emerald-300",
      surface:
        "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
      border:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
      button:
        "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400",
    };
  }

  if (tone === "negative") {
    return {
      text: "text-rose-700 dark:text-rose-300",
      surface:
        "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
      border:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300",
      button:
        "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400",
    };
  }

  if (tone === "warning") {
    return {
      text: "text-amber-800 dark:text-amber-300",
      surface:
        "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
      border:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
      button:
        "bg-amber-500 text-slate-950 hover:bg-amber-400 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300",
    };
  }

  return {
    text: "text-slate-700 dark:text-slate-300",
    surface:
      "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
    border:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300",
    button:
      "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
  };
}

function getStatusTone(status) {
  if (status === "green") return "positive";
  if (status === "red") return "negative";
  if (status === "cashout") return "warning";
  return "neutral";
}

function formatSignedCurrency(value) {
  return `${value > 0 ? "+" : ""}${formatCurrency(value)}`;
}

function getEntryEvent(entry) {
  const value = String(entry?.event || "").trim();
  return value || "Evento sem nome";
}

function getEntryMarket(entry) {
  const value = String(entry?.market || "").trim();
  return value || "Mercado não informado";
}

function getEntrySportIcon(entry) {
  const text = `${entry?.event || ""} ${entry?.market || ""} ${entry?.notes || ""}`.toLowerCase();
  if (/(tennis|tênis|tenis|atp|wta|alcaraz|sinner|djokovic|medvedev)/i.test(text)) return "🎾";
  return "⚽";
}

function Panel({ children, className = "" }) {
  return (
    <section className={`bankroll-panel ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
          {title}
        </h2>
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

function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <input
        {...props}
        className={`h-11 w-full rounded-[14px] border bg-white px-3.5 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/10 ${
          error
            ? "border-rose-300 dark:border-rose-400/40"
            : "border-slate-200 dark:border-white/[0.08]"
        } ${className}`}
      />
      {error ? <span className="mt-1.5 block text-[12px] text-rose-600 dark:text-rose-300">{error}</span> : null}
    </label>
  );
}

function Textarea({ label, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <textarea
        {...props}
        className={`min-h-24 w-full resize-none rounded-[14px] border border-slate-200 bg-white px-3.5 py-3 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/10 ${className}`}
      />
    </label>
  );
}

function Modal({ title, description, children, onClose, size = "md" }) {
  const sizeClass = size === "lg" ? "max-w-[680px]" : "max-w-[480px]";

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 px-4 py-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bankroll-modal-title"
        className={`max-h-[92vh] w-full ${sizeClass} overflow-y-auto rounded-[24px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] dark:border-white/[0.1] dark:bg-slate-950 dark:shadow-[0_28px_90px_rgba(0,0,0,0.52)]`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur dark:border-white/[0.08] dark:bg-slate-950/95">
          <div className="min-w-0">
            <h2 id="bankroll-modal-title" className="text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.1]"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-32px)] max-w-[460px] -translate-x-1/2 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-medium text-emerald-800 shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
      {message}
    </div>
  );
}

function BankrollHero({ onRegister, onDeposit, onWithdraw, onExport }) {
  return (
    <section className="bankroll-hero">
      <div className="bankroll-hero-content">
        <div className="bankroll-hero-actions">
          <PrimaryButton onClick={onRegister} className="bankroll-hero-primary">
            <Plus className="h-4 w-4" />
            Registrar aposta
          </PrimaryButton>
          <div className="bankroll-hero-secondary">
            <SecondaryButton onClick={onDeposit}>
              <Download className="h-4 w-4 rotate-180" />
              Depositar
            </SecondaryButton>
            <SecondaryButton onClick={onWithdraw}>
              <Upload className="h-4 w-4" />
              Sacar
            </SecondaryButton>
            <SecondaryButton onClick={onExport}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </SecondaryButton>
            <Link href="/area-membros/estatisticas" className="bankroll-secondary-action bankroll-stats-action">
              <BarChart3 className="h-4 w-4" />
              Ver estatísticas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ label, value, detail, tone = "neutral", valueTone = "default", icon: Icon }) {
  const cardTone =
    tone === "negative"
      ? "negative"
      : tone === "info"
        ? "info"
        : tone === "positive"
          ? "positive"
          : tone === "muted"
            ? "muted"
            : "neutral";

  return (
    <article className={`bankroll-summary-card ${cardTone}`}>
      <div className="bankroll-summary-content">
        <span className="bankroll-summary-icon">
          <Icon className="h-7 w-7" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <p className="bankroll-summary-label">{label}</p>
          <p className={`bankroll-summary-value bankroll-summary-value-${valueTone}`}>{value}</p>
          <p className="bankroll-summary-detail">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`bankroll-primary-action disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`bankroll-secondary-action disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const toneClass =
    status === "green"
      ? "bankroll-green"
      : status === "red"
        ? "bankroll-red"
        : status === "cashout"
          ? "bankroll-cashout"
          : "bankroll-more";

  return (
    <span className={`bankroll-status ${toneClass}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center rounded-[12px] px-3.5 text-[13px] font-semibold transition ${
        active
          ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.08]"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center dark:border-white/[0.12] dark:bg-white/[0.035]">
      <h3 className="text-[15px] font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mx-auto mt-1 max-w-[420px] text-[13px] leading-5 text-slate-600 dark:text-slate-400">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function ValuePill({ label, value, tone = "neutral" }) {
  const toneClass = getToneClasses(tone);

  return (
    <div className={`min-w-0 rounded-[14px] px-3 py-2 ring-1 ${toneClass.surface}`}>
      <p className="text-[11px] font-medium opacity-75">{label}</p>
      <p className="mt-1 truncate text-[13px] font-semibold">{value}</p>
    </div>
  );
}

function OpenBetCard({ entry, onStatusChange, onCashout, onDelete }) {
  const result = calculateEntryResult(entry);
  const possibleReturn = result.stake * result.odd;

  return (
    <article className="rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition hover:border-slate-300 dark:border-white/[0.08] dark:bg-slate-900/92 dark:hover:border-white/[0.14]">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.8fr)] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="pending" />
            <span className="text-[12px] text-slate-500 dark:text-slate-400">{formatDate(entry.date)}</span>
          </div>
          <h3 className="mt-2 truncate text-[16px] font-semibold tracking-[-0.01em] text-slate-950 dark:text-white">
            {getEntryEvent(entry)}
          </h3>
          <p className="mt-1 truncate text-[13px] text-slate-600 dark:text-slate-400">
            {getEntryMarket(entry)}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <ValuePill label="Odd" value={result.odd.toFixed(2).replace(".", ",")} />
            <ValuePill label="Stake" value={formatCurrency(result.stake)} />
            <ValuePill label="Retorno possível" value={formatCurrency(possibleReturn)} tone="positive" />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center xl:justify-end">
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={() => onStatusChange(entry.id, "green")}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] bg-emerald-50 px-3 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20 dark:hover:bg-emerald-400/15"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Green
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(entry.id, "red")}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20 dark:hover:bg-rose-400/15"
            >
              <XCircle className="h-3.5 w-3.5" />
              Red
            </button>
            <button
              type="button"
              onClick={() => onCashout(entry)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] bg-amber-50 px-3 text-[12px] font-semibold text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20 dark:hover:bg-amber-400/15"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Cashout
            </button>
          </div>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[12px] bg-slate-50 px-3 text-[12px] font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/[0.08] dark:hover:bg-rose-400/10 dark:hover:text-rose-300 dark:hover:ring-rose-400/20 sm:w-9 sm:px-0"
            aria-label="Excluir aposta"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sm:hidden">Excluir</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function OpenBetsTable({ entries, onStatusChange, onCashout, onDelete, onRegister }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nenhuma aposta aberta."
        description="Registre uma nova aposta para começar a acompanhar."
        action={
          <PrimaryButton onClick={onRegister}>
            <Plus className="h-4 w-4" />
            Registrar aposta
          </PrimaryButton>
        }
      />
    );
  }

  const totals = entries.reduce(
    (current, entry) => {
      const result = calculateEntryResult(entry);
      return {
        stake: current.stake + result.stake,
        possibleReturn: current.possibleReturn + result.stake * result.odd,
      };
    },
    { stake: 0, possibleReturn: 0 }
  );

  return (
    <>
      <div className="bankroll-table-wrap">
        <table className="bankroll-table bankroll-open-table">
          <thead>
            <tr className="text-left">
              <th>
                Evento
              </th>
              <th>
                Mercado
              </th>
              <th className="numeric">
                Odd
              </th>
              <th className="numeric">
                Stake
              </th>
              <th className="numeric">
                Retorno possível
              </th>
              <th className="numeric">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const result = calculateEntryResult(entry);
              const possibleReturn = result.stake * result.odd;

              return (
                <tr key={entry.id}>
                  <td>
                    <div className="bankroll-event-cell">
                      <span className="bankroll-sport-icon">
                        {getEntrySportIcon(entry)}
                      </span>
                      <div className="min-w-0">
                        <p className="bankroll-event-title">
                          {getEntryEvent(entry)}
                        </p>
                        <p className="bankroll-event-meta">
                          {formatDate(entry.date)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="bankroll-market-title">
                      {getEntryMarket(entry)}
                    </p>
                    {entry.notes ? (
                      <p className="bankroll-market-meta">{entry.notes}</p>
                    ) : null}
                  </td>
                  <td className="numeric bankroll-odd">
                    {result.odd.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="numeric">
                    {formatCurrency(result.stake)}
                  </td>
                  <td className="numeric">
                    {formatCurrency(possibleReturn)}
                  </td>
                  <td>
                    <div className="bankroll-row-actions">
                      <button
                        type="button"
                        onClick={() => onStatusChange(entry.id, "green")}
                        className="bankroll-result-btn bankroll-green"
                      >
                        Green
                      </button>
                      <button
                        type="button"
                        onClick={() => onStatusChange(entry.id, "red")}
                        className="bankroll-result-btn bankroll-red"
                      >
                        Red
                      </button>
                      <button
                        type="button"
                        onClick={() => onCashout(entry)}
                        className="bankroll-result-btn bankroll-cashout"
                      >
                        Cashout
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(entry)}
                        className="bankroll-more"
                        aria-label="Excluir aposta"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bankroll-card-list">
        {entries.map((entry) => (
          <OpenBetCard
            key={entry.id}
            entry={entry}
            onStatusChange={onStatusChange}
            onCashout={onCashout}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="bankroll-open-footer">
        <span>
          Total em stake: <strong>{formatCurrency(totals.stake)}</strong>
        </span>
        <span>
          Retorno possível total: <strong>{formatCurrency(totals.possibleReturn)}</strong>
        </span>
      </div>
    </>
  );
}

function HistoryBetCard({ entry, onCorrect, onDelete }) {
  const result = calculateEntryResult(entry);
  const tone = getToneFromValue(result.lucro);

  return (
    <article className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-white/[0.08] dark:bg-slate-900/92">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.status} />
            <span className="text-[12px] text-slate-500 dark:text-slate-400">{formatDate(entry.date)}</span>
          </div>
          <h3 className="mt-2 truncate text-[15px] font-semibold text-slate-950 dark:text-white">
            {getEntryEvent(entry)}
          </h3>
          <p className="mt-1 truncate text-[13px] text-slate-600 dark:text-slate-400">
            {getEntryMarket(entry)}
          </p>
          {entry.notes ? (
            <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-slate-500 dark:text-slate-400">
              {entry.notes}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ValuePill label="Odd" value={result.odd.toFixed(2).replace(".", ",")} />
            <ValuePill label="Stake" value={formatCurrency(result.stake)} />
            <ValuePill label="Retorno" value={formatCurrency(result.retorno)} />
            <ValuePill label="Lucro/Prejuízo" value={formatSignedCurrency(result.lucro)} tone={tone} />
          </div>
          <div className="flex gap-2 sm:justify-end">
            <SecondaryButton onClick={() => onCorrect(entry)} className="h-9 px-3">
              <FilePenLine className="h-3.5 w-3.5" />
              Corrigir
            </SecondaryButton>
            <button
              type="button"
              onClick={() => onDelete(entry)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] bg-slate-50 text-slate-500 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/[0.08] dark:hover:bg-rose-400/10 dark:hover:text-rose-300 dark:hover:ring-rose-400/20"
              aria-label="Excluir aposta"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function HistoryTable({ entries, onCorrect, onDelete }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nenhuma aposta finalizada ainda."
        description="Quando você marcar Green, Red ou Cashout, os registros aparecem aqui."
      />
    );
  }

  return (
    <>
      <div className="bankroll-table-wrap">
        <table className="bankroll-table">
          <thead>
            <tr className="text-left">
              <th className="w-[10%]">
                Data
              </th>
              <th className="w-[23%]">
                Evento
              </th>
              <th className="w-[20%]">
                Mercado
              </th>
              <th className="numeric w-[8%]">
                Odd
              </th>
              <th className="numeric w-[11%]">
                Stake
              </th>
              <th className="w-[12%] text-center">
                Resultado
              </th>
              <th className="numeric w-[12%]">
                Lucro/Prejuízo
              </th>
              <th className="numeric w-[4%]">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const result = calculateEntryResult(entry);
              const profitToneClass = result.lucro >= 0 ? "bankroll-profit" : "bankroll-loss";

              return (
                <tr key={entry.id}>
                  <td>
                    {formatDate(entry.date)}
                  </td>
                  <td>
                    <div className="bankroll-event-cell">
                      <span className="bankroll-sport-icon">{getEntrySportIcon(entry)}</span>
                      <div className="min-w-0">
                        <p className="bankroll-event-title">
                          {getEntryEvent(entry)}
                        </p>
                        {entry.notes ? (
                          <p className="bankroll-event-meta">{entry.notes}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="bankroll-market-title">{getEntryMarket(entry)}</p>
                  </td>
                  <td className="numeric">
                    {result.odd.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="numeric">
                    {formatCurrency(result.stake)}
                  </td>
                  <td className="text-center">
                    <StatusBadge status={entry.status} />
                  </td>
                  <td className={`numeric ${profitToneClass}`}>
                    {formatSignedCurrency(result.lucro)}
                  </td>
                  <td className="numeric">
                    <button
                      type="button"
                      onClick={() => onCorrect(entry)}
                      className="bankroll-more"
                      aria-label="Corrigir aposta"
                    >
                      <FilePenLine className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bankroll-card-list">
        {entries.map((entry) => (
          <HistoryBetCard key={entry.id} entry={entry} onCorrect={onCorrect} onDelete={onDelete} />
        ))}
      </div>
    </>
  );
}

function BetFormModal({
  form,
  errors,
  preview,
  bankroll,
  onClose,
  onSubmit,
  onChange,
  onStakePreset,
}) {
  return (
    <Modal
      title="Registrar aposta"
      description="Preencha o essencial para acompanhar essa entrada na banca."
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={onSubmit} className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Evento"
              type="text"
              placeholder="Ex: Flamengo x Palmeiras"
              value={form.event}
              error={errors.event}
              onChange={(event) => onChange("event", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Mercado"
              type="text"
              placeholder="Ex: Over 2.5 gols"
              value={form.market}
              error={errors.market}
              onChange={(event) => onChange("market", event.target.value)}
              list="market-suggestions"
            />
            <datalist id="market-suggestions">
              {MARKET_SUGGESTIONS.map((market) => (
                <option key={market} value={market} />
              ))}
            </datalist>
            <div className="mt-2 flex flex-wrap gap-2">
              {MARKET_SUGGESTIONS.map((market) => (
                <button
                  key={market}
                  type="button"
                  onClick={() => onChange("market", market)}
                  className="inline-flex h-8 items-center rounded-[10px] bg-slate-50 px-2.5 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.08]"
                >
                  {market}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Odd"
            type="number"
            step="0.01"
            placeholder="Ex: 2.00"
            value={form.odd}
            error={errors.odd}
            onChange={(event) => onChange("odd", event.target.value)}
          />
          <div>
            <Input
              label="Stake"
              type="number"
              step="0.01"
              placeholder="Ex: 50"
              value={form.stake}
              error={errors.stake}
              onChange={(event) => onChange("stake", event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {STAKE_PRESETS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onStakePreset(value)}
                  className="inline-flex h-8 items-center rounded-[10px] bg-slate-50 px-2.5 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.08]"
                >
                  {formatCurrency(value)}
                </button>
              ))}
              {[1, 2, 5].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => onStakePreset((bankroll * percent) / 100)}
                  disabled={bankroll <= 0}
                  className="inline-flex h-8 items-center rounded-[10px] bg-slate-50 px-2.5 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.08]"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Data"
            type="date"
            value={form.date}
            error={errors.date}
            onChange={(event) => onChange("date", event.target.value)}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Observação opcional"
              placeholder="Ex: entrada seguindo método X"
              value={form.notes}
              onChange={(event) => onChange("notes", event.target.value)}
            />
          </div>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
          <div className="grid gap-3 sm:grid-cols-3">
            <ValuePill label="Retorno possível" value={formatCurrency(preview.returnValue)} tone="positive" />
            <ValuePill label="Lucro possível" value={formatCurrency(preview.profit)} tone="positive" />
            <ValuePill label="Peso na banca" value={`${preview.bankrollPercent.toFixed(1).replace(".", ",")}%`} tone={preview.riskTone} />
          </div>
          {preview.bankrollPercent >= 5 ? (
            <div className="mt-3 flex gap-2 rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Essa stake representa {preview.bankrollPercent.toFixed(1).replace(".", ",")}% da sua banca.
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrimaryButton type="submit">
            <Plus className="h-4 w-4" />
            Salvar aposta
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function TransactionModal({ type, form, error, onClose, onChange, onSubmit }) {
  const isDeposit = type === "deposit";

  return (
    <Modal
      title={isDeposit ? "Depositar na banca" : "Sacar da banca"}
      description={
        isDeposit
          ? "Registre uma entrada manual na banca base."
          : "Registre uma retirada manual sem deixar a banca negativa."
      }
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <Input
          label="Valor"
          type="number"
          step="0.01"
          placeholder="Ex: 100"
          value={form.value}
          error={error}
          onChange={(event) => onChange("value", event.target.value)}
        />
        <Textarea
          label="Observação opcional"
          placeholder={isDeposit ? "Ex: reforço de banca" : "Ex: retirada mensal"}
          value={form.notes}
          onChange={(event) => onChange("notes", event.target.value)}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrimaryButton type="submit" className={isDeposit ? "" : "bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"}>
            {isDeposit ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            {isDeposit ? "Confirmar depósito" : "Confirmar saque"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function InitialBankrollModal({ value, onChange, onClose, onSave }) {
  return (
    <Modal
      title="Definir banca inicial"
      description="Use este valor como base para calcular a banca atual."
      onClose={onClose}
    >
      <form onSubmit={onSave} className="grid gap-4">
        <Input
          label="Valor da banca inicial"
          type="number"
          step="0.01"
          placeholder="Ex: 1000"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] leading-5 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-400">
          A banca atual continuará sendo calculada por banca inicial somada ao resultado das apostas finalizadas.
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrimaryButton type="submit">Salvar banca</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function CashoutModal({ entry, value, onValueChange, onClose, onConfirm }) {
  const stake = toNumber(entry?.stake);
  const received = toNumber(value);
  const result = received - stake;

  return (
    <Modal
      title="Informar cashout"
      description="Digite o valor recebido para encerrar esta aposta."
      onClose={onClose}
    >
      <div className="grid gap-4">
        <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
          <p className="truncate text-[15px] font-semibold text-slate-950 dark:text-white">
            {getEntryEvent(entry)}
          </p>
          <p className="mt-1 truncate text-[13px] text-slate-600 dark:text-slate-400">
            {getEntryMarket(entry)}
          </p>
        </div>
        <Input
          label="Valor recebido"
          type="number"
          step="0.01"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
        <div className="grid gap-2 sm:grid-cols-3">
          <ValuePill label="Stake" value={formatCurrency(stake)} />
          <ValuePill label="Valor recebido" value={formatCurrency(received)} tone="warning" />
          <ValuePill label="Resultado" value={formatSignedCurrency(result)} tone={getToneFromValue(result)} />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrimaryButton onClick={onConfirm} className="bg-amber-500 text-slate-950 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300">
            Confirmar cashout
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

function CorrectionModal({
  entry,
  cashoutValue,
  onCashoutValueChange,
  onClose,
  onChangeStatus,
}) {
  const [selectedStatus, setSelectedStatus] = useState(entry?.status || "green");
  const result = calculateEntryResult(entry || {});
  const cashoutResult = toNumber(cashoutValue) - result.stake;
  const needsCashout = selectedStatus === "cashout";

  function handleSubmit(event) {
    event.preventDefault();
    onChangeStatus(entry.id, selectedStatus);
  }

  return (
    <Modal
      title="Corrigir aposta"
      description="Ajuste o resultado sem perder o registro da entrada."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry?.status} />
            <span className="text-[12px] text-slate-500 dark:text-slate-400">{formatDate(entry?.date)}</span>
          </div>
          <p className="mt-2 truncate text-[15px] font-semibold text-slate-950 dark:text-white">
            {getEntryEvent(entry)}
          </p>
          <p className="mt-1 truncate text-[13px] text-slate-600 dark:text-slate-400">
            {getEntryMarket(entry)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ValuePill label="Odd" value={result.odd.toFixed(2).replace(".", ",")} />
            <ValuePill label="Stake" value={formatCurrency(result.stake)} />
          </div>
        </div>

        <div className="grid gap-2">
          {[
            { label: "Alterar para Green", value: "green", tone: "positive" },
            { label: "Alterar para Red", value: "red", tone: "negative" },
            { label: "Alterar para Cashout", value: "cashout", tone: "warning" },
            { label: "Reabrir aposta", value: "pending", tone: "neutral" },
          ].map((option) => {
            const toneClass = getToneClasses(option.tone);
            const active = selectedStatus === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedStatus(option.value)}
                className={`flex h-11 items-center justify-between rounded-[14px] px-3.5 text-[13px] font-semibold ring-1 transition ${
                  active
                    ? `${toneClass.surface} ring-current/20`
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.08]"
                }`}
              >
                {option.label}
                {active ? <CheckCircle2 className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>

        {needsCashout ? (
          <div className="rounded-[16px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
            <Input
              label="Valor recebido no cashout"
              type="number"
              step="0.01"
              value={cashoutValue}
              onChange={(event) => onCashoutValueChange(event.target.value)}
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <ValuePill label="Valor recebido" value={formatCurrency(toNumber(cashoutValue))} tone="warning" />
              <ValuePill label="Resultado" value={formatSignedCurrency(cashoutResult)} tone={getToneFromValue(cashoutResult)} />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrimaryButton type="submit">
            Aplicar correção
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({ entry, onClose, onConfirm }) {
  return (
    <Modal
      title="Excluir aposta"
      description="Essa ação remove a aposta da banca e recalcula os totais."
      onClose={onClose}
    >
      <div className="grid gap-4">
        <div className="rounded-[16px] border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          <p className="font-semibold">{getEntryEvent(entry)}</p>
          <p className="mt-1 text-[13px] opacity-85">{getEntryMarket(entry)}</p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-rose-600 px-4 text-[13px] font-semibold text-white transition hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400"
          >
            <Trash2 className="h-4 w-4" />
            Excluir aposta
          </button>
        </div>
      </div>
    </Modal>
  );
}

function QuickActions({ onInitialBankroll, onShowFilters }) {
  const actions = [
    {
      label: "Definir banca inicial",
      icon: Wallet,
      onClick: onInitialBankroll,
      enabled: true,
    },
    {
      label: "Importar apostas",
      icon: Upload,
      enabled: false,
    },
    {
      label: "Gerenciar mercados",
      icon: Tags,
      enabled: false,
    },
    {
      label: "Filtros e exibições",
      icon: SlidersHorizontal,
      onClick: onShowFilters,
      enabled: true,
    },
  ];

  return (
    <div className="bankroll-quick-grid">
      <div className="bankroll-quick-card">
          <h2 className="bankroll-quick-title">
            Ações rápidas
          </h2>
          <div className="bankroll-quick-actions">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  disabled={!action.enabled}
                  className="bankroll-quick-link disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
      </div>

      <div className="bankroll-quick-card">
        <div className="flex items-start gap-3">
          <span className="bankroll-tip-icon">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p className="bankroll-tip-text">
            Mantenha sua banca sempre atualizada e registre cada aposta para ter controle total dos seus resultados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BancaPage() {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({ initialBankroll: "" });
  const [form, setForm] = useState({ ...INITIAL_FORM, date: getTodayInputValue() });
  const [transactionForm, setTransactionForm] = useState(INITIAL_TRANSACTION_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [transactionError, setTransactionError] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [cashoutValue, setCashoutValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const messageTimeoutRef = useRef(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setEntries(loadBankrollEntries());
      setSettings(loadBankrollSettings());
      setForm((current) => ({
        ...current,
        date: current.date || getTodayInputValue(),
      }));
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const betEntries = useMemo(
    () => entries.filter((entry) => !entry.movementType),
    [entries]
  );

  const stats = useMemo(
    () => calculateStats(betEntries, settings.initialBankroll),
    [betEntries, settings.initialBankroll]
  );

  const openEntries = useMemo(() => {
    return betEntries
      .filter((entry) => (entry.status || "pending") === "pending")
      .sort((a, b) => getSortableTimestamp(b) - getSortableTimestamp(a));
  }, [betEntries]);

  const settledEntries = useMemo(() => {
    return betEntries
      .filter((entry) => (entry.status || "pending") !== "pending")
      .sort((a, b) => getSortableTimestamp(b) - getSortableTimestamp(a));
  }, [betEntries]);

  const filteredSettledEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return settledEntries.filter((entry) => {
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [entry.event, entry.market, entry.notes]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });
  }, [searchTerm, settledEntries, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSettledEntries.length / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const paginatedSettledEntries = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE;
    return filteredSettledEntries.slice(start, start + PAGE_SIZE);
  }, [effectivePage, filteredSettledEntries]);

  const visibleHistoryEntries = showFullHistory
    ? paginatedSettledEntries
    : settledEntries.slice(0, RECENT_HISTORY_SIZE);

  const preview = useMemo(() => {
    const stake = toNumber(form.stake);
    const odd = toNumber(form.odd);
    const returnValue = stake > 0 && odd > 1 ? stake * odd : 0;
    const profit = returnValue > 0 ? returnValue - stake : 0;
    const bankroll = toNumber(stats.currentBankroll);
    const bankrollPercent = bankroll > 0 && stake > 0 ? (stake / bankroll) * 100 : 0;
    const riskTone = bankrollPercent >= 5 ? "warning" : "neutral";

    return {
      returnValue,
      profit,
      bankrollPercent,
      riskTone,
    };
  }, [form.odd, form.stake, stats.currentBankroll]);

  const profitTone = getToneFromValue(stats.netProfit);
  const profitVisualTone = profitTone === "neutral" ? "muted" : profitTone;
  const ProfitIcon = stats.netProfit > 0 ? TrendingUp : stats.netProfit < 0 ? TrendingDown : Minus;

  const summaryCards = [
    {
      label: "Banca atual",
      value: formatCurrency(stats.currentBankroll),
      detail: "Disponível para operações",
      tone: stats.currentBankroll > 0 ? "positive" : "neutral",
      icon: Wallet,
    },
    {
      label: "Banca inicial",
      value: settings.initialBankroll === "" ? "Não definida" : formatCurrency(stats.initialBankroll),
      detail: "Valor definido como base",
      tone: "neutral",
      icon: Landmark,
    },
    {
      label: "Apostas abertas",
      value: String(openEntries.length),
      detail: "Total de apostas em aberto",
      tone: "info",
      icon: Clock3,
    },
    {
      label: "Lucro/Prejuízo",
      value: formatSignedCurrency(stats.netProfit),
      detail: "Resultado das apostas encerradas",
      tone: profitVisualTone,
      valueTone: profitTone,
      icon: ProfitIcon,
    },
  ];
  function showMessage(text) {
    setMessage(text);

    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = window.setTimeout(() => {
      setMessage("");
    }, 2600);
  }

  function openModal(name, entry = null) {
    setActiveModal(name);
    setSelectedEntry(entry);
    setFormErrors({});
    setTransactionError("");

    if (name === "bet") {
      setForm({ ...INITIAL_FORM, date: getTodayInputValue() });
    }

    if (name === "deposit" || name === "withdraw") {
      setTransactionForm(INITIAL_TRANSACTION_FORM);
    }

    if (name === "cashout" || (name === "correction" && entry?.status === "cashout")) {
      setCashoutValue(entry?.cashoutAmount ? String(entry.cashoutAmount) : String(entry?.stake || ""));
    } else {
      setCashoutValue("");
    }
  }

  function closeModal() {
    setActiveModal(null);
    setSelectedEntry(null);
    setCashoutValue("");
    setFormErrors({});
    setTransactionError("");
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }
  }

  function updateTransactionForm(field, value) {
    setTransactionForm((current) => ({
      ...current,
      [field]: value,
    }));
    setTransactionError("");
  }

  function validateBetForm() {
    const errors = {};

    if (!form.event.trim()) errors.event = "Informe o evento.";
    if (!form.market.trim()) errors.market = "Informe o mercado.";
    if (toNumber(form.odd) <= 1) errors.odd = "A odd precisa ser maior que 1.";
    if (toNumber(form.stake) <= 0) errors.stake = "A stake precisa ser maior que zero.";
    if (!form.date) errors.date = "Informe a data.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSaveEntry(event) {
    event.preventDefault();

    if (!validateBetForm()) return;

    const newEntry = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: form.date,
      event: form.event.trim(),
      market: form.market.trim(),
      stake: toNumber(form.stake),
      odd: toNumber(form.odd),
      bookmaker: "",
      notes: form.notes.trim(),
      status: "pending",
      cashoutAmount: 0,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);
    closeModal();
    showMessage("Aposta registrada.");
  }

  function handleInitialBankrollChange(value) {
    const updatedSettings = {
      initialBankroll: value === "" ? "" : toNumber(value),
    };

    setSettings(updatedSettings);
    saveBankrollSettings(updatedSettings);
    showMessage("Banca inicial atualizada.");
  }

  function handleTransaction(event) {
    event.preventDefault();

    const value = toNumber(transactionForm.value);
    if (value <= 0) {
      setTransactionError("Informe um valor maior que zero.");
      return;
    }

    const currentInitial = toNumber(settings.initialBankroll);
    const nextInitial = activeModal === "deposit" ? currentInitial + value : currentInitial - value;

    if (nextInitial < 0) {
      setTransactionError("O saque não pode deixar a banca base negativa.");
      return;
    }

    const updatedSettings = { initialBankroll: nextInitial };
    setSettings(updatedSettings);
    saveBankrollSettings(updatedSettings);
    closeModal();
    showMessage(activeModal === "deposit" ? "Depósito realizado." : "Saque realizado.");
  }

  function updateEntryStatus(id, status) {
    if (status === "cashout") {
      const target = entries.find((entry) => entry.id === id);
      openModal("cashout", target || null);
      return;
    }

    const updatedEntries = entries.map((entry) => {
      if (entry.id !== id) return entry;

      return {
        ...entry,
        status,
        cashoutAmount: 0,
        resolvedAt: status === "pending" ? null : entry.resolvedAt || new Date().toISOString(),
      };
    });

    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);
    showMessage(
      `Aposta marcada como ${
        status === "green" ? "Green" : status === "red" ? "Red" : "Aberta"
      }.`
    );
  }

  function applyCashout() {
    if (!selectedEntry) return;

    const value = toNumber(cashoutValue);
    if (value <= 0) {
      showMessage("Informe um valor de cashout válido.");
      return;
    }

    const updatedEntries = entries.map((entry) => {
      if (entry.id !== selectedEntry.id) return entry;

      return {
        ...entry,
        status: "cashout",
        cashoutAmount: value,
        resolvedAt: entry.resolvedAt || new Date().toISOString(),
      };
    });

    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);
    closeModal();
    showMessage("Cashout aplicado.");
  }

  function applyCorrection(id, status) {
    if (status === "cashout") {
      const value = toNumber(cashoutValue);

      if (value <= 0) {
        showMessage("Informe um valor de cashout válido.");
        return;
      }

      const updatedEntries = entries.map((entry) => {
        if (entry.id !== id) return entry;

        return {
          ...entry,
          status: "cashout",
          cashoutAmount: value,
          resolvedAt: entry.resolvedAt || new Date().toISOString(),
        };
      });

      setEntries(updatedEntries);
      saveBankrollEntries(updatedEntries);
      closeModal();
      showMessage("Resultado corrigido para Cashout.");
      return;
    }

    const updatedEntries = entries.map((entry) => {
      if (entry.id !== id) return entry;

      return {
        ...entry,
        status,
        cashoutAmount: 0,
        resolvedAt: status === "pending" ? null : entry.resolvedAt || new Date().toISOString(),
      };
    });

    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);
    closeModal();
    showMessage(status === "pending" ? "Aposta reaberta." : "Resultado corrigido.");
  }

  function confirmDelete() {
    if (!selectedEntry) return;

    const updatedEntries = entries.filter((entry) => entry.id !== selectedEntry.id);
    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);
    closeModal();
    showMessage("Aposta excluída.");
  }

  function exportHistory() {
    const headers = ["Data", "Evento", "Mercado", "Odd", "Stake", "Status", "Retorno", "Lucro", "Observacao"];
    const lines = betEntries.map((entry) => {
      const result = calculateEntryResult(entry);
      return [
        entry.date || "",
        entry.event || "",
        entry.market || "",
        result.odd,
        result.stake,
        entry.status || "",
        result.retorno,
        result.lucro,
        entry.notes || "",
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");
    });
    const today = getTodayInputValue();
    const blob = new Blob([`\uFEFF${[headers.join(","), ...lines].join("\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `historico-banca-filtto-${today}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showMessage("Histórico exportado.");
  }

  return (
    <main className="bankroll-page">
      <div className="bankroll-shell">
        <BankrollHero
          onRegister={() => openModal("bet")}
          onDeposit={() => openModal("deposit")}
          onWithdraw={() => openModal("withdraw")}
          onExport={exportHistory}
        />

        <section className="bankroll-summary-grid">
          {summaryCards.map((card) => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </section>

        <Panel className="mb-[14px]">
          <div className="bankroll-panel-head">
            <h2 className="bankroll-section-title">
              Apostas em aberto
              <span className="bankroll-count-pill">{openEntries.length}</span>
            </h2>
            <button type="button" className="bankroll-mini-button" onClick={() => setShowFullHistory(false)}>
              Ver todas
            </button>
          </div>
            <OpenBetsTable
              entries={openEntries}
              onStatusChange={updateEntryStatus}
              onCashout={(target) => openModal("cashout", target)}
              onDelete={(target) => openModal("delete", target)}
              onRegister={() => openModal("bet")}
            />
        </Panel>

        <Panel className="mb-[14px]">
          <div className="bankroll-panel-head">
            <h2 className="bankroll-section-title">
              {showFullHistory ? "Histórico completo" : "Histórico recente"}
            </h2>
              <button
                type="button"
                onClick={() => {
                  setShowFullHistory((current) => !current);
                  setPage(1);
                }}
                className="bankroll-mini-button"
              >
                {showFullHistory ? "Ver recentes" : "Ver histórico completo"}
              </button>
          </div>

          {showFullHistory ? (
            <div className="grid gap-4 border-b border-slate-200/80 px-5 py-4 dark:border-white/[0.08] lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-center">
              <label className="relative block w-full">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Buscar por evento, mercado ou observação"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(1);
                  }}
                  className="h-11 w-full rounded-[14px] border border-slate-200 bg-white pl-10 pr-3.5 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
                />
              </label>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {historyStatusFilters.map((option) => (
                  <FilterButton
                    key={option.value}
                    active={statusFilter === option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setPage(1);
                    }}
                  >
                    {option.label}
                  </FilterButton>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <HistoryTable
              entries={visibleHistoryEntries}
              onCorrect={(target) => openModal("correction", target)}
              onDelete={(target) => openModal("delete", target)}
            />

            {showFullHistory && totalPages > 1 ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Página <span className="font-semibold text-slate-900 dark:text-white">{effectivePage}</span> de{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <SecondaryButton
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={effectivePage === 1}
                    className="h-9 px-3"
                  >
                    Anterior
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={effectivePage === totalPages}
                    className="h-9 px-3"
                  >
                    Próxima
                  </SecondaryButton>
                </div>
              </div>
            ) : null}
          </div>
        </Panel>

        <QuickActions
          onInitialBankroll={() => openModal("initial")}
          onShowFilters={() => setShowFullHistory(true)}
        />
      </div>

      <Toast message={message} />

      {activeModal === "bet" ? (
        <BetFormModal
          form={form}
          errors={formErrors}
          preview={preview}
          bankroll={stats.currentBankroll}
          onClose={closeModal}
          onSubmit={handleSaveEntry}
          onChange={updateForm}
          onStakePreset={(value) => updateForm("stake", String(Math.max(0, value.toFixed(2))))}
        />
      ) : null}

      {activeModal === "deposit" || activeModal === "withdraw" ? (
        <TransactionModal
          type={activeModal}
          form={transactionForm}
          error={transactionError}
          onClose={closeModal}
          onChange={updateTransactionForm}
          onSubmit={handleTransaction}
        />
      ) : null}

      {activeModal === "initial" ? (
        <InitialBankrollModal
          value={settings.initialBankroll}
          onChange={(value) =>
            setSettings((current) => ({
              ...current,
              initialBankroll: value,
            }))
          }
          onClose={closeModal}
          onSave={(event) => {
            event.preventDefault();
            handleInitialBankrollChange(settings.initialBankroll);
            closeModal();
          }}
        />
      ) : null}

      {activeModal === "cashout" ? (
        <CashoutModal
          entry={selectedEntry}
          value={cashoutValue}
          onValueChange={setCashoutValue}
          onClose={closeModal}
          onConfirm={applyCashout}
        />
      ) : null}

      {activeModal === "correction" && selectedEntry ? (
        <CorrectionModal
          entry={selectedEntry}
          cashoutValue={cashoutValue}
          onCashoutValueChange={setCashoutValue}
          onClose={closeModal}
          onChangeStatus={applyCorrection}
        />
      ) : null}

      {activeModal === "delete" ? (
        <DeleteModal entry={selectedEntry} onClose={closeModal} onConfirm={confirmDelete} />
      ) : null}
    </main>
  );
}
