"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  stake: "",
  odd: "",
};

const MAX_RECENT_SETTLED = 15;
const PENDING_PAGE_SIZE = 10;
const SETTLED_PAGE_SIZE = 5;

function PlusIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5V19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 18V11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10 18V7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15 18V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M20 18V9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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

function TrashIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 7H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M9 7V5.8C9 5.36 9.36 5 9.8 5H14.2C14.64 5 15 5.36 15 5.8V7"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M8 10V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 10V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 10V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M6.5 7L7 18.2C7.04 19.19 7.85 20 8.84 20H15.16C16.15 20 16.96 19.19 17 18.2L17.5 7"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 8.5V12L14.5 13.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function StatCard({ label, value, meta, icon, tone = "default" }) {
  const iconTone =
    tone === "green"
      ? "text-[#8df126]"
      : tone === "red"
      ? "text-[#db8f8f]"
      : "text-sky-600 dark:text-[#86a5cf]";

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
          className={`flex h-11 w-11 items-center justify-center rounded-[14px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#152131_0%,#111b29_100%)] ${iconTone}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function TopMiniCard({ label, value }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-white/34">
        {label}
      </div>
      <div className="mt-2 text-[24px] font-black tracking-[-0.05em] text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-white/42">
        {label}
      </span>
      <input
        {...props}
        className={`h-12 w-full rounded-[16px] border border-slate-200 bg-white px-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8df126]/50 focus:bg-white dark:border-white/[0.06] dark:bg-[rgba(255,255,255,0.03)] dark:text-white dark:placeholder:text-white/20 dark:focus:bg-[rgba(255,255,255,0.04)] ${className}`}
      />
    </label>
  );
}

function EmptyState({ text }) {
  return (
    <div className="px-4 py-10 text-center text-[14px] text-slate-500 dark:text-white/42">
      {text}
    </div>
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

function getSortableTimestamp(entry, fallbackField = "createdAt") {
  if (entry?.resolvedAt) {
    const value = new Date(entry.resolvedAt).getTime();
    if (Number.isFinite(value)) return value;
  }

  if (entry?.[fallbackField]) {
    const value = new Date(entry[fallbackField]).getTime();
    if (Number.isFinite(value)) return value;
  }

  if (entry?.date) {
    const value = new Date(entry.date).getTime();
    if (Number.isFinite(value)) return value;
  }

  return 0;
}

function EntriesTable({
  entries,
  title,
  subtitle,
  allowClockAction = false,
  onStatusChange,
  onDelete,
  page,
  totalPages,
  onPageChange,
  sectionKey,
  activeCashoutSection,
  cashoutTarget,
  cashoutValue,
  onCashoutValueChange,
  onApplyCashout,
  onCancelCashout,
}) {
  const showCashoutPanel =
    activeCashoutSection === sectionKey && cashoutTarget !== null;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] dark:shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-black uppercase tracking-[0.10em] text-[#6ea900] dark:text-[#8df126]">
          Planilha
        </p>
        <h2 className="text-[24px] font-black tracking-[-0.05em] text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-white/44">{subtitle}</p>
      </div>

      {showCashoutPanel ? (
        <div className="mt-6 rounded-[22px] border border-[#d6c565] bg-[rgba(234,214,99,0.12)] p-4 dark:border-[#3b3a20] dark:bg-[rgba(234,214,99,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.10em] text-[#8a7410] dark:text-[#ead663]">
                Cashout
              </p>
              <h3 className="mt-2 truncate text-[18px] font-black text-slate-900 dark:text-white">
                {cashoutTarget.event}
              </h3>
              <p className="mt-1 text-[13px] text-slate-600 dark:text-white/56">
                Stake {formatCurrency(calculateEntryResult(cashoutTarget).stake)} • Odd{" "}
                {calculateEntryResult(cashoutTarget).odd.toFixed(2).replace(".", ",")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full sm:w-[220px]">
                <Input
                  label="Valor do cashout"
                  type="number"
                  step="0.01"
                  value={cashoutValue}
                  onChange={(e) => onCashoutValueChange(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={onApplyCashout}
                className="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#ead663] px-5 text-[14px] font-bold text-[#201c08]"
              >
                Aplicar cashout
              </button>

              <button
                type="button"
                onClick={onCancelCashout}
                className="inline-flex h-12 items-center justify-center rounded-[16px] border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.06] dark:bg-[rgba(255,255,255,0.03)] dark:text-white/78 dark:hover:bg-[rgba(255,255,255,0.05)]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-[22px] border border-slate-200 dark:border-white/[0.06]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px]">
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
                <th className="px-4 py-4 text-[11px] font-black uppercase tracking-[0.09em] text-slate-500 dark:text-white/34">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState text="Nenhuma aposta nessa seção." />
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const result = calculateEntryResult(entry);
                  const status = getStatusMeta(entry.status);

                  return (
                    <tr
                      key={entry.id}
                      className="border-t border-slate-200 dark:border-white/[0.06]"
                    >
                      <td className="px-4 py-4 text-[14px] text-slate-600 dark:text-white/76">
                        {formatDate(entry.date)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="max-w-[250px] truncate text-[14px] font-semibold text-slate-900 dark:text-white">
                          {entry.event}
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

                      <td className="px-4 py-4">
                        <div className="flex min-w-[252px] flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onStatusChange(entry.id, "green", sectionKey)}
                            className="h-8 rounded-[9px] border border-[#2c4720] bg-[rgba(141,241,38,0.08)] px-3 text-[11px] font-bold text-[#6ea900] dark:text-[#8df126]"
                          >
                            Green
                          </button>

                          <button
                            type="button"
                            onClick={() => onStatusChange(entry.id, "red", sectionKey)}
                            className="h-8 rounded-[9px] border border-[#4a2729] bg-[rgba(219,143,143,0.08)] px-3 text-[11px] font-bold text-[#b85d5d] dark:text-[#db8f8f]"
                          >
                            Red
                          </button>

                          <button
                            type="button"
                            onClick={() => onStatusChange(entry.id, "cashout", sectionKey)}
                            className="h-8 rounded-[9px] border border-[#7b6d20] bg-[rgba(234,214,99,0.12)] px-3 text-[11px] font-bold text-[#8a7410] dark:border-[#3b3a20] dark:bg-[rgba(234,214,99,0.08)] dark:text-[#ead663]"
                          >
                            Cashout
                          </button>

                          {allowClockAction ? (
                            <button
                              type="button"
                              title="Voltar para pendente"
                              onClick={() => onStatusChange(entry.id, "pending", sectionKey)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.05]"
                            >
                              <ClockIcon className="h-4 w-4" />
                            </button>
                          ) : null}

                          <button
                            type="button"
                            title="Excluir aposta"
                            onClick={() => onDelete(entry.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/60 dark:hover:bg-white/[0.05]"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}

export default function BancaPage() {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({ initialBankroll: "" });
  const [form, setForm] = useState({ ...INITIAL_FORM, date: getTodayInputValue() });
  const [cashoutTarget, setCashoutTarget] = useState(null);
  const [cashoutValue, setCashoutValue] = useState("");
  const [activeCashoutSection, setActiveCashoutSection] = useState(null);
  const [message, setMessage] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [settledPage, setSettledPage] = useState(1);
  const messageTimeoutRef = useRef(null);

  useEffect(() => {
    const loadedEntries = loadBankrollEntries();
    const loadedSettings = loadBankrollSettings();

    setEntries(loadedEntries);
    setSettings(loadedSettings);
    setForm((current) => ({
      ...current,
      date: current.date || getTodayInputValue(),
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        window.clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const stats = useMemo(() => {
    return calculateStats(entries, settings.initialBankroll);
  }, [entries, settings.initialBankroll]);

  const pendingEntries = useMemo(() => {
    return [...entries]
      .filter((entry) => entry.status === "pending")
      .sort((a, b) => getSortableTimestamp(b) - getSortableTimestamp(a));
  }, [entries]);

  const recentSettledEntries = useMemo(() => {
    return [...entries]
      .filter((entry) => entry.status !== "pending")
      .sort((a, b) => getSortableTimestamp(b, "resolvedAt") - getSortableTimestamp(a, "resolvedAt"))
      .slice(0, MAX_RECENT_SETTLED);
  }, [entries]);

  const totalPendingPages = Math.max(1, Math.ceil(pendingEntries.length / PENDING_PAGE_SIZE));
  const totalSettledPages = Math.max(1, Math.ceil(recentSettledEntries.length / SETTLED_PAGE_SIZE));

  useEffect(() => {
    if (pendingPage > totalPendingPages) {
      setPendingPage(totalPendingPages);
    }
  }, [pendingPage, totalPendingPages]);

  useEffect(() => {
    if (settledPage > totalSettledPages) {
      setSettledPage(totalSettledPages);
    }
  }, [settledPage, totalSettledPages]);

  const paginatedPendingEntries = useMemo(() => {
    const start = (pendingPage - 1) * PENDING_PAGE_SIZE;
    const end = start + PENDING_PAGE_SIZE;
    return pendingEntries.slice(start, end);
  }, [pendingEntries, pendingPage]);

  const paginatedRecentSettledEntries = useMemo(() => {
    const start = (settledPage - 1) * SETTLED_PAGE_SIZE;
    const end = start + SETTLED_PAGE_SIZE;
    return recentSettledEntries.slice(start, end);
  }, [recentSettledEntries, settledPage]);

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

  function handleSaveInitialBankroll() {
    if (settings.initialBankroll === "" || settings.initialBankroll === null) {
      showMessage("Informe um valor para a banca inicial.");
      return;
    }

    const safeValue = toNumber(settings.initialBankroll);
    const updatedSettings = { initialBankroll: safeValue };

    setSettings(updatedSettings);
    saveBankrollSettings(updatedSettings);
    showMessage("Banca inicial salva com sucesso.");
  }

  function handleSaveEntry(event) {
    event.preventDefault();

    if (toNumber(form.stake) <= 0) {
      showMessage("Informe um valor apostado maior que zero.");
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
      market: "",
      stake: toNumber(form.stake),
      odd: toNumber(form.odd),
      bookmaker: "",
      notes: "",
      status: "pending",
      cashoutAmount: 0,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);

    setForm({
      ...INITIAL_FORM,
      date: getTodayInputValue(),
    });

    showMessage("Aposta salva com sucesso.");
  }

  function updateEntryStatus(id, status, sectionKey = null) {
    if (status === "cashout") {
      const target = entries.find((entry) => entry.id === id);
      setCashoutTarget(target || null);
      setActiveCashoutSection(sectionKey);
      setCashoutValue(
        target?.cashoutAmount ? String(target.cashoutAmount) : String(target?.stake || "")
      );
      return;
    }

    const updatedEntries = entries.map((entry) => {
      if (entry.id !== id) return entry;

      const wasPending = entry.status === "pending";
      const goingToPending = status === "pending";

      return {
        ...entry,
        status,
        cashoutAmount: goingToPending ? 0 : status === "cashout" ? entry.cashoutAmount || 0 : 0,
        resolvedAt: goingToPending
          ? null
          : wasPending
          ? new Date().toISOString()
          : entry.resolvedAt || new Date().toISOString(),
      };
    });

    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);
    setCashoutTarget(null);
    setCashoutValue("");
    setActiveCashoutSection(null);

    showMessage(
      `Aposta marcada como ${
        status === "green"
          ? "green"
          : status === "red"
          ? "red"
          : status === "cashout"
          ? "cashout"
          : "pendente"
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

      const wasPending = entry.status === "pending";

      return {
        ...entry,
        status: "cashout",
        cashoutAmount: value,
        resolvedAt: wasPending
          ? new Date().toISOString()
          : entry.resolvedAt || new Date().toISOString(),
      };
    });

    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);
    setCashoutTarget(null);
    setCashoutValue("");
    setActiveCashoutSection(null);
    showMessage("Cashout aplicado com sucesso.");
  }

  function cancelCashout() {
    setCashoutTarget(null);
    setCashoutValue("");
    setActiveCashoutSection(null);
  }

  function deleteEntry(id) {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
    saveBankrollEntries(updatedEntries);

    if (cashoutTarget?.id === id) {
      setCashoutTarget(null);
      setCashoutValue("");
      setActiveCashoutSection(null);
    }

    showMessage("Aposta removida.");
  }

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
                Planilha da banca
              </h1>

              <p className="mt-2 text-[14px] text-slate-500 dark:text-white/48">
                Salve apostas rápido e depois marque como green, red ou cashout.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/area-membros/estatisticas"
                className="inline-flex h-12 items-center gap-2 rounded-[16px] border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.06] dark:bg-[rgba(255,255,255,0.03)] dark:text-white/84 dark:hover:bg-[rgba(255,255,255,0.05)]"
              >
                <ChartIcon className="h-4 w-4" />
                Estatísticas
              </Link>

              <button
                type="button"
                onClick={() => {
                  const formElement = document.getElementById("nova-aposta-card");
                  formElement?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex h-12 items-center gap-2 rounded-[16px] bg-[#8df126] px-5 text-[14px] font-bold text-[#071000] shadow-[0_10px_24px_rgba(141,241,38,0.18)] transition hover:brightness-105"
              >
                <PlusIcon className="h-4 w-4" />
                Nova aposta
              </button>
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-[18px] border border-[#2c4720] bg-[rgba(141,241,38,0.08)] px-4 py-3 text-[14px] font-medium text-[#6ea900] dark:text-[#8df126]">
              {message}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Banca atual"
              value={formatCurrency(stats.currentBankroll)}
              meta={`Banca inicial ${
                settings.initialBankroll === ""
                  ? "não definida"
                  : formatCurrency(stats.initialBankroll)
              }`}
              tone={stats.netProfit >= 0 ? "green" : "red"}
              icon={<WalletIcon />}
            />

            <StatCard
              label="Lucro líquido"
              value={`${stats.netProfit >= 0 ? "+" : ""}${formatCurrency(stats.netProfit)}`}
              meta={`${stats.greenEntries} greens / ${stats.redEntries} reds / ${stats.cashoutEntries} cashouts`}
              tone={stats.netProfit >= 0 ? "green" : "red"}
              icon={<ChartIcon />}
            />

            <StatCard
              label="Entradas"
              value={String(stats.totalEntries)}
              meta={`${pendingEntries.length} pendentes no momento`}
              tone="default"
              icon={<TicketIcon />}
            />

            <StatCard
              label="ROI"
              value={`${stats.roi.toFixed(1).replace(".", ",")}%`}
              meta={`Total apostado ${formatCurrency(stats.totalStaked)}`}
              tone={stats.roi >= 0 ? "green" : "red"}
              icon={<ChartIcon />}
            />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <TopMiniCard
              label="Taxa de green"
              value={`${stats.hitRate.toFixed(1).replace(".", ",")}%`}
            />
            <TopMiniCard label="Stake média" value={formatCurrency(stats.averageStake)} />
            <TopMiniCard
              label="Odd média"
              value={stats.averageOdd.toFixed(2).replace(".", ",")}
            />
          </div>

          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div
              id="nova-aposta-card"
              className="self-start rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] dark:shadow-[0_16px_34px_rgba(0,0,0,0.22)]"
            >
              <div className="mb-6">
                <p className="text-[11px] font-black uppercase tracking-[0.10em] text-[#6ea900] dark:text-[#8df126]">
                  Nova aposta
                </p>
                <h2 className="mt-2 text-[24px] font-black tracking-[-0.05em] text-slate-900 dark:text-white">
                  Registrar entrada
                </h2>
                <p className="mt-2 text-[14px] text-slate-500 dark:text-white/46">
                  Preencha apenas o essencial para salvar rápido.
                </p>
              </div>

              <form onSubmit={handleSaveEntry}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Input
                    label="Valor apostado"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 50"
                    value={form.stake}
                    onChange={(e) => updateForm("stake", e.target.value)}
                  />

                  <Input
                    label="Odd"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1.85"
                    value={form.odd}
                    onChange={(e) => updateForm("odd", e.target.value)}
                  />

                  <Input
                    label="Evento"
                    type="text"
                    placeholder="Ex: Flamengo x Palmeiras"
                    value={form.event}
                    onChange={(e) => updateForm("event", e.target.value)}
                  />

                  <Input
                    label="Data"
                    type="date"
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center gap-2 rounded-[16px] bg-[#8df126] px-5 text-[14px] font-bold text-[#071000] shadow-[0_10px_24px_rgba(141,241,38,0.18)] transition hover:brightness-105"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Salvar aposta
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...INITIAL_FORM,
                        date: getTodayInputValue(),
                      })
                    }
                    className="inline-flex h-12 items-center rounded-[16px] border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.06] dark:bg-[rgba(255,255,255,0.03)] dark:text-white/76 dark:hover:bg-[rgba(255,255,255,0.05)]"
                  >
                    Limpar
                  </button>
                </div>
              </form>
            </div>

            <aside className="self-start rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,#101925_0%,#0d1520_100%)] dark:shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
              <p className="text-[11px] font-black uppercase tracking-[0.10em] text-[#6ea900] dark:text-[#8df126]">
                Configuração
              </p>

              <h2 className="mt-2 text-[24px] font-black tracking-[-0.05em] text-slate-900 dark:text-white">
                Banca inicial
              </h2>

              <div className="mt-5">
                <Input
                  label="Valor da banca"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 1000"
                  value={settings.initialBankroll}
                  onChange={(e) =>
                    setSettings((current) => ({
                      ...current,
                      initialBankroll: e.target.value,
                    }))
                  }
                />
              </div>

              <button
                type="button"
                onClick={handleSaveInitialBankroll}
                className="mt-5 inline-flex h-12 items-center rounded-[16px] border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.06] dark:bg-[rgba(255,255,255,0.03)] dark:text-white/82 dark:hover:bg-[rgba(255,255,255,0.05)]"
              >
                Salvar banca inicial
              </button>
            </aside>
          </div>

          <div className="mt-6 space-y-6">
            <EntriesTable
              entries={paginatedPendingEntries}
              title="Apostas pendentes"
              subtitle={`Mostrando até ${PENDING_PAGE_SIZE} apostas por página.`}
              onStatusChange={updateEntryStatus}
              onDelete={deleteEntry}
              page={pendingPage}
              totalPages={totalPendingPages}
              onPageChange={setPendingPage}
              sectionKey="pending"
              activeCashoutSection={activeCashoutSection}
              cashoutTarget={cashoutTarget}
              cashoutValue={cashoutValue}
              onCashoutValueChange={setCashoutValue}
              onApplyCashout={applyCashout}
              onCancelCashout={cancelCashout}
            />

            <EntriesTable
              entries={paginatedRecentSettledEntries}
              title="Finalizadas recentes"
              subtitle={`Mostrando até ${SETTLED_PAGE_SIZE} apostas por página entre as últimas ${MAX_RECENT_SETTLED} finalizadas.`}
              allowClockAction
              onStatusChange={updateEntryStatus}
              onDelete={deleteEntry}
              page={settledPage}
              totalPages={totalSettledPages}
              onPageChange={setSettledPage}
              sectionKey="recent-settled"
              activeCashoutSection={activeCashoutSection}
              cashoutTarget={cashoutTarget}
              cashoutValue={cashoutValue}
              onCashoutValueChange={setCashoutValue}
              onApplyCashout={applyCashout}
              onCancelCashout={cancelCashout}
            />
          </div>
        </section>
      </div>
    </main>
  );
}