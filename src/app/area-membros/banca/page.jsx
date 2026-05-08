"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  DollarSign,
  Plus,
  RotateCcw,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  calculateEntryResult,
  calculateStats,
  formatCurrency,
  formatDate,
  getStatusMeta,
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

const PAGE_SIZE = 9;
const MONTH_REFERENCE = new Date();

const historyStatusFilters = [
  { label: "Finalizadas", value: "all" },
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
    const value = new Date(entry.date).getTime();
    if (Number.isFinite(value)) return value;
  }

  return 0;
}

function getToneClass(tone) {
  if (tone === "positive") {
    return {
      text: "text-emerald-700 dark:text-emerald-300",
      icon: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
    };
  }

  if (tone === "negative") {
    return {
      text: "text-rose-700 dark:text-rose-300",
      icon: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
      badge: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300",
    };
  }

  if (tone === "warning") {
    return {
      text: "text-amber-800 dark:text-amber-300",
      icon: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
      badge: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
    };
  }

  return {
    text: "text-slate-700 dark:text-slate-300",
    icon: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
    badge: "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300",
  };
}

function getStatusTone(status) {
  if (status === "green") return "positive";
  if (status === "red") return "negative";
  if (status === "cashout") return "warning";
  return "neutral";
}

function getStatusLabel(status) {
  if (status === "pending") return "Aberta";
  return getStatusMeta(status).label;
}

function Panel({ children, className = "", id }) {
  return (
    <section
      id={id}
      className={`min-w-0 rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900 ${className}`}
    >
      {children}
    </section>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <input
        {...props}
        className={`h-11 w-full rounded-[14px] border border-slate-200 bg-white px-3.5 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/10 ${className}`}
      />
    </label>
  );
}

function SummaryCard({ label, value, detail, tone = "neutral", icon: Icon }) {
  const toneClass = getToneClass(tone);

  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_18px_rgba(15,23,42,0.035)] dark:border-white/[0.08] dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 truncate text-[24px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
            {value}
          </p>
          <p className={`mt-2 text-[12px] font-medium ${toneClass.text}`}>{detail}</p>
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ring-1 ${toneClass.icon}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center rounded-[12px] px-3.5 text-[13px] font-semibold ring-1 transition ${
        active
          ? "bg-slate-950 text-white ring-slate-950 dark:bg-white/[0.12] dark:text-white dark:ring-white/[0.16]"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const toneClass = getToneClass(getStatusTone(status));

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${toneClass.badge}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function EmptyState({ statusFilter }) {
  const text =
    statusFilter === "pending"
      ? "Nenhuma aposta aberta no momento."
      : "Nenhuma aposta encontrada nesse filtro.";

  return (
    <div className="rounded-[16px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-[14px] text-slate-500 dark:border-white/[0.12] dark:bg-white/[0.035] dark:text-slate-400">
      {text}
    </div>
  );
}

function CashoutInlineForm({
  entry,
  cashoutValue,
  onCashoutValueChange,
  onApplyCashout,
  onCancelCashout,
}) {
  return (
    <div className="rounded-[16px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-300">
            Cashout
          </p>
          <h3 className="mt-1 truncate text-[14px] font-semibold text-slate-950 dark:text-white">
            {entry.event || "Aposta sem título"}
          </h3>
          <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-300">
            Informe o valor recebido para encerrar esta aposta.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[180px_auto_auto] sm:items-end">
          <Input
            label="Valor do cashout"
            type="number"
            step="0.01"
            value={cashoutValue}
            onChange={(event) => onCashoutValueChange(event.target.value)}
          />
          <button
            type="button"
            onClick={onApplyCashout}
            className="inline-flex h-11 items-center justify-center rounded-[14px] bg-amber-500 px-4 text-[13px] font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={onCancelCashout}
            className="inline-flex h-11 items-center justify-center rounded-[14px] bg-white px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.06] dark:text-slate-200 dark:ring-white/[0.08] dark:hover:bg-white/[0.1]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function BetsTable({
  entries,
  statusFilter,
  page,
  totalPages,
  onPageChange,
  onStatusChange,
  onDelete,
  cashoutTarget,
  cashoutValue,
  onCashoutValueChange,
  onApplyCashout,
  onCancelCashout,
  correctionMenuId,
  onToggleCorrectionMenu,
  mode = "open",
}) {
  if (entries.length === 0) {
    return <EmptyState statusFilter={statusFilter} />;
  }

  return (
    <>
      <div className="hidden max-w-full overflow-x-auto overflow-y-visible rounded-[16px] border border-slate-200 dark:border-white/[0.08] 2xl:block">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-50 dark:bg-white/[0.035]">
            <tr className="text-left">
              {["Data", "Jogo/evento", "Mercado", "Odd", "Stake", "Retorno possível", "Status", "Ações"].map(
                (heading) => {
                  const numeric = ["Odd", "Stake", "Retorno possível"].includes(heading);
                  const actions = heading === "Ações";

                  return (
                  <th
                    key={heading}
                    className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 ${
                      numeric ? "text-right" : ""
                    } ${actions ? (mode === "open" ? "w-[260px] text-left" : "w-[150px] text-right") : ""}`}
                  >
                    {heading}
                  </th>
                  );
                }
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {entries.map((entry) => {
              const showCashout = cashoutTarget?.id === entry.id;

              return (
                <Fragment key={entry.id}>
                  <BetRow
                    entry={entry}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    correctionMenuId={correctionMenuId}
                    onToggleCorrectionMenu={onToggleCorrectionMenu}
                    mode={mode}
                  />
                  {showCashout ? (
                    <tr className="bg-white dark:bg-slate-900">
                      <td colSpan={8} className="px-4 pb-4">
                        <CashoutInlineForm
                          entry={entry}
                          cashoutValue={cashoutValue}
                          onCashoutValueChange={onCashoutValueChange}
                          onApplyCashout={onApplyCashout}
                          onCancelCashout={onCancelCashout}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 2xl:hidden">
        {entries.map((entry) => (
          <BetCard
            key={entry.id}
            entry={entry}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            showCashout={cashoutTarget?.id === entry.id}
            cashoutValue={cashoutValue}
            onCashoutValueChange={onCashoutValueChange}
            onApplyCashout={onApplyCashout}
            onCancelCashout={onCancelCashout}
            correctionMenuId={correctionMenuId}
            onToggleCorrectionMenu={onToggleCorrectionMenu}
            mode={mode}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Página <span className="font-semibold text-slate-900 dark:text-white">{page}</span> de{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="inline-flex h-9 items-center rounded-[12px] bg-white px-3.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="inline-flex h-9 items-center rounded-[12px] bg-white px-3.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
            >
              Próxima
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function BetRow({
  entry,
  onStatusChange,
  onDelete,
  correctionMenuId,
  onToggleCorrectionMenu,
  mode = "open",
}) {
  const result = calculateEntryResult(entry);
  const possibleReturn = result.stake * result.odd;

  return (
    <tr className="bg-white dark:bg-slate-900">
      <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-slate-600 dark:text-slate-300">
        {formatDate(entry.date)}
      </td>
      <td className="px-4 py-3.5">
        <p className="max-w-[260px] truncate text-[14px] font-semibold text-slate-950 dark:text-white">
          {entry.event || "Aposta sem título"}
        </p>
        {entry.notes ? (
          <p className="mt-1 max-w-[260px] truncate text-[12px] text-slate-500 dark:text-slate-400">
            {entry.notes}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-3.5 text-[14px] text-slate-600 dark:text-slate-300">
        <span className="block max-w-[170px] truncate">{entry.market || "Não informado"}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-right text-[14px] font-medium text-slate-900 dark:text-white">
        {result.odd.toFixed(2).replace(".", ",")}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-right text-[14px] font-medium text-slate-900 dark:text-white">
        {formatCurrency(result.stake)}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-right text-[14px] text-slate-600 dark:text-slate-300">
        {formatCurrency(possibleReturn)}
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={entry.status} />
      </td>
      <td className="px-4 py-3.5">
        <BetActions
          entry={entry}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          correctionMenuId={correctionMenuId}
          onToggleCorrectionMenu={onToggleCorrectionMenu}
          mode={mode}
        />
      </td>
    </tr>
  );
}

function BetCard({
  entry,
  onStatusChange,
  onDelete,
  showCashout,
  cashoutValue,
  onCashoutValueChange,
  onApplyCashout,
  onCancelCashout,
  correctionMenuId,
  onToggleCorrectionMenu,
  mode = "open",
}) {
  const result = calculateEntryResult(entry);
  const possibleReturn = result.stake * result.odd;

  return (
    <article className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.035)] dark:border-white/[0.08] dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] text-slate-500 dark:text-slate-400">{formatDate(entry.date)}</p>
          <h3 className="mt-1 truncate text-[15px] font-semibold text-slate-950 dark:text-white">
            {entry.event || "Aposta sem título"}
          </h3>
          <p className="mt-1 truncate text-[13px] text-slate-500 dark:text-slate-400">
            {entry.market || "Mercado não informado"}
          </p>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-[14px] border border-slate-200 bg-slate-50 p-3 dark:border-white/[0.08] dark:bg-white/[0.035]">
        <SmallValue label="Odd" value={result.odd.toFixed(2).replace(".", ",")} />
        <SmallValue label="Stake" value={formatCurrency(result.stake)} />
        <SmallValue label="Retorno" value={formatCurrency(possibleReturn)} />
      </div>

      <div className="mt-4">
        <BetActions
          entry={entry}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          compact
          correctionMenuId={correctionMenuId}
          onToggleCorrectionMenu={onToggleCorrectionMenu}
          mode={mode}
        />
      </div>

      {showCashout ? (
        <div className="mt-4">
          <CashoutInlineForm
            entry={entry}
            cashoutValue={cashoutValue}
            onCashoutValueChange={onCashoutValueChange}
            onApplyCashout={onApplyCashout}
            onCancelCashout={onCancelCashout}
          />
        </div>
      ) : null}
    </article>
  );
}

function SmallValue({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 truncate text-[13px] font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function BetActions({
  entry,
  onStatusChange,
  onDelete,
  compact = false,
  correctionMenuId,
  onToggleCorrectionMenu,
  mode = "open",
}) {
  const actionBase =
    "inline-flex h-8 items-center justify-center rounded-[10px] px-2.5 text-[12px] font-semibold ring-1 transition whitespace-nowrap";
  const iconBase =
    "inline-flex h-8 w-8 items-center justify-center rounded-[10px] ring-1 transition";

  if (mode === "history") {
    const menuOpen = correctionMenuId === entry.id;
    const correctionOptions = [
      { label: "Alterar para Green", value: "green", tone: "positive", disabled: entry.status === "green" },
      { label: "Alterar para Red", value: "red", tone: "negative", disabled: entry.status === "red" },
      { label: "Alterar para Cashout", value: "cashout", tone: "warning", disabled: entry.status === "cashout" },
      { label: "Reabrir aposta", value: "pending", tone: "neutral" },
    ];

    return (
      <div className="relative flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onToggleCorrectionMenu(entry.id)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[10px] bg-slate-50 px-3 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.08] dark:focus:ring-emerald-400/10"
        >
          Corrigir
          <ChevronDown className={`h-3.5 w-3.5 transition ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        {menuOpen ? (
          <div className="absolute right-10 top-[calc(100%+8px)] z-30 w-[218px] overflow-hidden rounded-[14px] border border-slate-200 bg-white p-1.5 shadow-[0_18px_44px_rgba(15,23,42,0.16)] dark:border-white/[0.1] dark:bg-slate-900 dark:shadow-[0_18px_44px_rgba(0,0,0,0.42)]">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Corrigir resultado
            </p>
            {correctionOptions.map((option) => {
              const dotClass =
                option.tone === "positive"
                  ? "bg-emerald-500"
                  : option.tone === "negative"
                  ? "bg-rose-500"
                  : option.tone === "warning"
                  ? "bg-amber-500"
                  : "bg-slate-400";

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    onToggleCorrectionMenu(null);
                    onStatusChange(entry.id, option.value);
                  }}
                  className="flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 focus:bg-slate-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-white/[0.08] dark:focus:bg-white/[0.08]"
                >
                  <span>{option.label}</span>
                  <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                </button>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className={`${iconBase} bg-white text-slate-500 ring-slate-200 hover:bg-rose-50 hover:text-rose-700 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/[0.08] dark:hover:bg-rose-400/10 dark:hover:text-rose-300`}
          title="Excluir aposta"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 ${
        compact ? "min-w-0 flex-wrap justify-between" : "min-w-[238px]"
      }`}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onStatusChange(entry.id, "green")}
            className={`${compact ? actionBase : actionBase} bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20 dark:hover:bg-emerald-400/15`}
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Green
          </button>

          <button
            type="button"
            onClick={() => onStatusChange(entry.id, "red")}
            className={`${compact ? actionBase : actionBase} bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20 dark:hover:bg-rose-400/15`}
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Red
          </button>
        </div>

        <button
          type="button"
          onClick={() => onStatusChange(entry.id, "cashout")}
          className={`${compact ? actionBase : actionBase} w-fit bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20 dark:hover:bg-amber-400/15`}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Cashout
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDelete(entry.id)}
        className={`${iconBase} bg-white text-slate-500 ring-slate-200 hover:bg-rose-50 hover:text-rose-700 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/[0.08] dark:hover:bg-rose-400/10 dark:hover:text-rose-300`}
        title="Excluir aposta"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function BancaPage() {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({ initialBankroll: "" });
  const [form, setForm] = useState({ ...INITIAL_FORM, date: getTodayInputValue() });
  const [cashoutTarget, setCashoutTarget] = useState(null);
  const [cashoutValue, setCashoutValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [correctionMenuId, setCorrectionMenuId] = useState(null);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const messageTimeoutRef = useRef(null);

  useEffect(() => {
    window.queueMicrotask(() => {
      setEntries(loadBankrollEntries());
      setSettings(loadBankrollSettings());
      setForm((current) => ({
        ...current,
        date: current.date || getTodayInputValue(),
      }));
    });
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const betEntries = useMemo(() => {
    return entries.filter((entry) => !entry.movementType);
  }, [entries]);

  const stats = useMemo(() => {
    return calculateStats(betEntries, settings.initialBankroll);
  }, [betEntries, settings.initialBankroll]);

  const monthStats = useMemo(() => {
    const month = MONTH_REFERENCE.getMonth();
    const year = MONTH_REFERENCE.getFullYear();
    const settledThisMonth = betEntries.filter((entry) => {
      if (entry.status === "pending") return false;
      const timestamp = getSortableTimestamp(entry);
      if (!timestamp) return false;
      const date = new Date(timestamp);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const result = settledThisMonth.reduce((sum, entry) => {
      return sum + calculateEntryResult(entry).lucro;
    }, 0);

    return {
      result,
      settled: settledThisMonth.length,
    };
  }, [betEntries]);

  const orderedEntries = useMemo(() => {
    return [...betEntries].sort((a, b) => getSortableTimestamp(b) - getSortableTimestamp(a));
  }, [betEntries]);

  const openEntries = useMemo(() => {
    return orderedEntries.filter((entry) => entry.status === "pending");
  }, [orderedEntries]);

  const settledEntries = useMemo(() => {
    return orderedEntries.filter((entry) => entry.status !== "pending");
  }, [orderedEntries]);

  const filteredSettledEntries = useMemo(() => {
    if (statusFilter === "all") return settledEntries;
    return settledEntries.filter((entry) => entry.status === statusFilter);
  }, [settledEntries, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSettledEntries.length / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);

  const paginatedSettledEntries = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE;
    return filteredSettledEntries.slice(start, start + PAGE_SIZE);
  }, [effectivePage, filteredSettledEntries]);

  const recentSettledProfit = useMemo(() => {
    return orderedEntries
      .filter((entry) => entry.status !== "pending")
      .slice(0, 5)
      .reduce((sum, entry) => sum + calculateEntryResult(entry).lucro, 0);
  }, [orderedEntries]);

  const cards = [
    {
      label: "Banca atual",
      value: formatCurrency(stats.currentBankroll),
      detail:
        settings.initialBankroll === ""
          ? "Defina sua banca inicial"
          : `Base ${formatCurrency(stats.initialBankroll)}`,
      tone: stats.netProfit >= 0 ? "positive" : "negative",
      icon: Wallet,
    },
    {
      label: "Resultado do mês",
      value: `${monthStats.result >= 0 ? "+" : ""}${formatCurrency(monthStats.result)}`,
      detail: `${monthStats.settled} apostas encerradas`,
      tone: monthStats.result >= 0 ? "positive" : "negative",
      icon: monthStats.result >= 0 ? TrendingUp : TrendingDown,
    },
    {
      label: "Apostas abertas",
      value: String(stats.pendingEntries),
      detail: `${formatCurrency(
        betEntries
          .filter((entry) => entry.status === "pending")
          .reduce((sum, entry) => sum + calculateEntryResult(entry).stake, 0)
      )} em stake`,
      tone: "neutral",
      icon: Clock3,
    },
    {
      label: "Lucro/prejuízo recente",
      value: `${recentSettledProfit >= 0 ? "+" : ""}${formatCurrency(recentSettledProfit)}`,
      detail: "Últimas 5 encerradas",
      tone: recentSettledProfit >= 0 ? "positive" : "negative",
      icon: DollarSign,
    },
  ];

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function showMessage(text) {
    setMessage(text);

    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = window.setTimeout(() => {
      setMessage("");
    }, 2400);
  }

  function toggleCorrectionMenu(id) {
    setCorrectionMenuId((current) => (current === id ? null : id));
  }

  function handleSaveInitialBankroll() {
    if (settings.initialBankroll === "" || settings.initialBankroll === null) {
      showMessage("Informe um valor para a banca inicial.");
      return;
    }

    const updatedSettings = { initialBankroll: toNumber(settings.initialBankroll) };
    setSettings(updatedSettings);
    saveBankrollSettings(updatedSettings);
    showMessage("Banca inicial salva com sucesso.");
  }

  function handleSaveEntry(event) {
    event.preventDefault();

    if (toNumber(form.stake) <= 0) {
      showMessage("Informe um stake maior que zero.");
      return;
    }

    if (toNumber(form.odd) <= 1) {
      showMessage("Informe uma odd válida.");
      return;
    }

    const newEntry = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: form.date || getTodayInputValue(),
      event: form.event.trim() || "Aposta sem título",
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
    setForm({ ...INITIAL_FORM, date: getTodayInputValue() });
    showMessage("Aposta registrada.");
  }

  function updateEntryStatus(id, status) {
    setCorrectionMenuId(null);

    if (status === "cashout") {
      const target = entries.find((entry) => entry.id === id);
      setCashoutTarget(target || null);
      setCashoutValue(
        target?.cashoutAmount ? String(target.cashoutAmount) : String(target?.stake || "")
      );
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
    if (!cashoutTarget) return;

    const value = toNumber(cashoutValue);

    if (value <= 0) {
      showMessage("Informe um valor de cashout válido.");
      return;
    }

    const updatedEntries = entries.map((entry) => {
      if (entry.id !== cashoutTarget.id) return entry;

      return {
        ...entry,
        status: "cashout",
        cashoutAmount: value,
        resolvedAt: entry.resolvedAt || new Date().toISOString(),
      };
    });

    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);
    setCashoutTarget(null);
    setCashoutValue("");
    showMessage("Cashout aplicado.");
  }

  function deleteEntry(id) {
    setCorrectionMenuId(null);

    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);

    if (cashoutTarget?.id === id) {
      setCashoutTarget(null);
      setCashoutValue("");
    }

    showMessage("Aposta excluída.");
  }

  return (
    <main className="min-h-full overflow-x-hidden bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex w-full max-w-[1480px] min-w-0 flex-col gap-6 px-5 py-6 md:px-8">
        <header className="flex flex-col gap-4 rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Gestão de banca
            </p>
            <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
              Banca
            </h1>
            <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-slate-600 dark:text-slate-300">
              Registre apostas, acompanhe abertas e encerre resultados como Green, Red ou Cashout.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href="/area-membros/estatisticas"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-white px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07] sm:w-auto"
            >
              <BarChart3 className="h-4 w-4" />
              Ver estatísticas
            </Link>
            <button
              type="button"
              onClick={() => {
                const formElement = document.getElementById("registrar-aposta");
                formElement?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Registrar aposta
            </button>
          </div>
        </header>

        {message ? (
          <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-medium text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </section>

        <section className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
          <div className="grid min-w-0 gap-6">
            <Panel id="registrar-aposta" className="p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Nova aposta
                </p>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                  Registrar aposta
                </h2>
              </div>

              <form onSubmit={handleSaveEntry} className="mt-5 grid gap-4">
                <Input
                  label="Evento"
                  type="text"
                  placeholder="Ex: Flamengo x Palmeiras"
                  value={form.event}
                  onChange={(event) => updateForm("event", event.target.value)}
                />
                <Input
                  label="Mercado"
                  type="text"
                  placeholder="Ex: Over 2.5 gols"
                  value={form.market}
                  onChange={(event) => updateForm("market", event.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <Input
                    label="Odd"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1.85"
                    value={form.odd}
                    onChange={(event) => updateForm("odd", event.target.value)}
                  />
                  <Input
                    label="Stake"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 50"
                    value={form.stake}
                    onChange={(event) => updateForm("stake", event.target.value)}
                  />
                </div>
                <Input
                  label="Data"
                  type="date"
                  value={form.date}
                  onChange={(event) => updateForm("date", event.target.value)}
                />
                <Input
                  label="Observação"
                  type="text"
                  placeholder="Opcional"
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                />

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-[13px] font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                >
                  <Plus className="h-4 w-4" />
                  Salvar aposta
                </button>
              </form>
            </Panel>

            <Panel className="p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Configuração
                </p>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                  Banca inicial
                </h2>
              </div>

              <div className="mt-5">
                <Input
                  label="Valor"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 1000"
                  value={settings.initialBankroll}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      initialBankroll: event.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={handleSaveInitialBankroll}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[12px] bg-white px-3.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-white/[0.06] dark:text-slate-200 dark:ring-white/[0.08] dark:hover:bg-white/[0.1]"
                >
                  Salvar banca inicial
                </button>
              </div>
            </Panel>
          </div>

          <div className="grid min-w-0 gap-6">
            <Panel className="p-6 ring-1 ring-emerald-500/5">
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Apostas em aberto
                </p>
                <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                  Pendentes de resultado
                </h2>
                <p className="text-[13px] text-slate-600 dark:text-slate-300">
                  Essas apostas ainda exigem ação: Green, Red, Cashout ou exclusão.
                </p>
              </div>

              <div className="mt-5">
                <BetsTable
                  entries={openEntries}
                  statusFilter="pending"
                  page={1}
                  totalPages={1}
                  onPageChange={setPage}
                  onStatusChange={updateEntryStatus}
                  onDelete={deleteEntry}
                  cashoutTarget={cashoutTarget}
                  cashoutValue={cashoutValue}
                  onCashoutValueChange={setCashoutValue}
                  onApplyCashout={applyCashout}
                  onCancelCashout={() => {
                    setCashoutTarget(null);
                    setCashoutValue("");
                  }}
                  correctionMenuId={correctionMenuId}
                  onToggleCorrectionMenu={toggleCorrectionMenu}
                  mode="open"
                />
              </div>
            </Panel>

          <Panel className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Histórico de apostas
                </p>
                <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                  Finalizadas
                </h2>
                <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-300">
                  Consulte apostas encerradas e corrija resultados quando necessário.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
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

            <div className="mt-5">
                <BetsTable
                  entries={paginatedSettledEntries}
                  statusFilter={statusFilter}
                  page={effectivePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onStatusChange={updateEntryStatus}
                  onDelete={deleteEntry}
                  cashoutTarget={cashoutTarget}
                  cashoutValue={cashoutValue}
                  onCashoutValueChange={setCashoutValue}
                  onApplyCashout={applyCashout}
                  onCancelCashout={() => {
                    setCashoutTarget(null);
                    setCashoutValue("");
                  }}
                  correctionMenuId={correctionMenuId}
                  onToggleCorrectionMenu={toggleCorrectionMenu}
                  mode="history"
                />
            </div>
          </Panel>
          </div>
        </section>

      </div>
    </main>
  );
}
