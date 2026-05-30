"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, RefreshCw, X } from "lucide-react";
import {
  calculateOpportunityMetrics,
  filterOpportunityHistoryByPeriod,
} from "@/lib/opportunityHistory/metrics";
import {
  importYesterdayOpportunityHistory,
  listOpportunityHistory,
  updateOpportunityHistoryResults,
} from "@/lib/opportunityHistory/storage";
import OpportunityHistoryList from "./OpportunityHistoryList";
import OpportunityHistorySummary from "./OpportunityHistorySummary";

const PERIODS = [
  { label: "Recentes", value: "recent" },
  { label: "Ontem", value: "yesterday" },
  { label: "Ultimos 7 dias", value: "7d" },
];

const MARKET_FILTERS = [
  { label: "Todos", value: "all" },
  { label: "Resultado", value: "resultado" },
  { label: "Gols", value: "gols" },
  { label: "Ambas marcam", value: "ambas_marcam" },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getMarketGroup(marketLabel, marketType, filterGroup) {
  const normalizedGroup = normalizeText(filterGroup);
  const normalizedType = normalizeText(marketType);
  const normalizedMarket = normalizeText(marketLabel);

  if (["resultado", "result", "match_result", "fulltime_result"].includes(normalizedGroup)) return "resultado";
  if (["resultado", "result", "match_result", "fulltime_result"].includes(normalizedType)) return "resultado";

  if (["gols", "over_under", "total_goals", "goals"].includes(normalizedGroup)) return "gols";
  if (["gols", "over_under", "total_goals", "goals"].includes(normalizedType)) return "gols";

  if (["ambas_marcam", "btts", "both_teams_to_score"].includes(normalizedGroup)) return "ambas_marcam";
  if (["ambas_marcam", "btts", "both_teams_to_score"].includes(normalizedType)) return "ambas_marcam";

  if (
    [
      "casa vence",
      "mandante vence",
      "home win",
      "empate",
      "draw",
      "fora vence",
      "visitante vence",
      "away win",
      "resultado",
    ].includes(normalizedMarket)
  ) {
    return "resultado";
  }

  if (
    normalizedMarket.startsWith("over ") ||
    normalizedMarket.startsWith("under ") ||
    normalizedMarket.includes("total goals") ||
    normalizedMarket.includes("total de gols")
  ) {
    return "gols";
  }

  if (
    normalizedMarket.includes("ambas marcam") ||
    normalizedMarket.includes("both teams to score") ||
    normalizedMarket.includes("btts")
  ) {
    return "ambas_marcam";
  }

  return "outro";
}

function formatRate(value) {
  if (value === null || value === undefined) return "--";
  return `${Math.round(value * 100)}%`;
}

function MarketGroupSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = MARKET_FILTERS.find((option) => option.value === value) || MARKET_FILTERS[0];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function selectOption(option) {
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative w-full sm:w-[210px]">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            setOpen(false);
          }
        }}
        className={cn(
          "group flex h-8 w-full items-center justify-between gap-2 rounded-[9px] border px-3 text-left text-[12px] font-semibold transition",
          "bg-[var(--gp-surface)] text-[var(--gp-text)] shadow-[0_1px_1px_rgba(15,23,42,0.025)]",
          "hover:bg-[var(--gp-hover)] focus-visible:border-[var(--gp-primary)] focus-visible:ring-3 focus-visible:ring-[var(--gp-primary-soft)]",
          open
            ? "border-[color-mix(in_srgb,var(--gp-primary)_45%,var(--gp-border))] ring-3 ring-[var(--gp-primary-soft)]"
            : "border-[var(--gp-border-soft)]"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[var(--gp-text-secondary)]">Mercado:</span>
          <span className="min-w-0 whitespace-nowrap text-[var(--gp-text)]">{selected.label}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-[var(--gp-text-muted)] transition group-hover:text-[var(--gp-text-secondary)]",
            open && "rotate-180 text-[var(--gp-primary)]"
          )}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Mercado"
          className="absolute right-0 top-[calc(100%+6px)] z-40 w-full min-w-[210px] rounded-[12px] border border-[var(--gp-border)] bg-[var(--gp-surface)] p-1.5 text-[12px] shadow-[0_18px_42px_rgba(15,23,42,0.14)] outline-none dark:shadow-[0_22px_48px_rgba(0,0,0,0.34)]"
        >
          {MARKET_FILTERS.map((option) => {
            const selectedOption = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selectedOption}
                onClick={() => selectOption(option)}
                className={cn(
                  "flex h-8 w-full items-center justify-between gap-2 rounded-[8px] px-2.5 text-left font-semibold transition",
                  selectedOption
                    ? "bg-[var(--gp-primary-soft)] text-[var(--gp-text)]"
                    : "text-[var(--gp-text-secondary)] hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)]"
                )}
              >
                <span>{option.label}</span>
                {selectedOption ? <Check className="h-3.5 w-3.5 shrink-0 text-[var(--gp-primary)]" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function OpportunityHistoryDrawer({ open, onClose }) {
  const [period, setPeriod] = useState("recent");
  const [market, setMarket] = useState("all");
  const [records, setRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshHistory() {
    setRefreshing(true);
    try {
      await importYesterdayOpportunityHistory();
      setRecords(await updateOpportunityHistoryResults());
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    setPeriod("recent");
    setMarket("all");
    setRecords(listOpportunityHistory());
    refreshHistory();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  const periodRecords = useMemo(
    () => filterOpportunityHistoryByPeriod(records, period),
    [period, records]
  );
  const filtered = useMemo(
    () =>
      market === "all"
        ? periodRecords
        : periodRecords.filter((record) => getMarketGroup(record.market, record.marketType, record.filterGroup) === market),
    [market, periodRecords]
  );
  const metrics = useMemo(() => calculateOpportunityMetrics(filtered), [filtered]);

  if (!open) return null;

  const hasHistory = records.length > 0;
  const hasPeriodRecords = periodRecords.length > 0;
  const hasFilteredRecords = filtered.length > 0;
  const allPending = hasFilteredRecords && metrics.finalized === 0 && metrics.pending === metrics.registered;
  const emptyTitle =
    market === "resultado"
      ? "Nenhuma oportunidade de Resultado neste periodo."
      : market === "gols"
        ? "Nenhuma oportunidade de Gols neste periodo."
        : market === "ambas_marcam"
          ? "Nenhuma oportunidade de Ambas marcam neste periodo."
          : "Nenhuma oportunidade registrada neste periodo.";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar historico"
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full flex-col border-l border-[var(--gp-border)] bg-[var(--gp-bg)] text-[var(--gp-text)] shadow-[var(--gp-shadow)] sm:max-w-[820px]">
        <header className="border-b border-[var(--gp-border)] bg-[var(--gp-surface)] px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--gp-text)]">
                Historico das oportunidades
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[var(--gp-text-secondary)]">
                Resultados reais das oportunidades registradas pelo sistema.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-[var(--gp-border)] bg-[var(--gp-surface-elevated)] text-[var(--gp-text-secondary)] transition hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)]"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full gap-1 rounded-[11px] border border-[var(--gp-border-soft)] bg-[var(--gp-surface)] p-1 sm:w-auto">
              {PERIODS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPeriod(item.value)}
                  className={cn(
                    "inline-flex h-8 flex-1 items-center justify-center rounded-[8px] px-3 text-[12px] font-semibold transition sm:flex-none",
                    period === item.value
                      ? "bg-[var(--gp-primary)] text-[#07120b]"
                      : "text-[var(--gp-text-secondary)] hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)]"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <MarketGroupSelect value={market} onChange={setMarket} />

              <button
                type="button"
                onClick={refreshHistory}
                disabled={refreshing}
                className="inline-flex h-8 items-center justify-center gap-2 rounded-[9px] border border-[var(--gp-border-soft)] bg-[var(--gp-surface)] px-3 text-[12px] font-semibold text-[var(--gp-text-secondary)] transition hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Atualizar resultados
              </button>
            </div>
          </div>

          {!hasHistory ? (
            <section className="mt-4 rounded-[12px] border border-[var(--gp-border-soft)] bg-[var(--gp-surface)] px-5 py-10 text-center">
              <h3 className="text-[17px] font-semibold text-[var(--gp-text)]">Ainda nao ha historico real de oportunidades.</h3>
              <p className="mx-auto mt-2 max-w-[460px] text-[13px] leading-6 text-[var(--gp-text-secondary)]">
                As oportunidades comecarao a aparecer aqui conforme forem registradas e os jogos forem finalizados.
              </p>
            </section>
          ) : (
            <div className="mt-4 grid gap-3">
              <OpportunityHistorySummary metrics={metrics} />

              <section className="rounded-[12px] border border-[var(--gp-border-soft)] bg-[var(--gp-surface)] px-3 py-2.5">
                <p className="text-[13px] font-semibold text-[var(--gp-text)]">
                  Taxa de acerto: {formatRate(metrics.hitRate)}
                </p>
                {allPending ? (
                  <p className="mt-1 text-[12px] leading-5 text-[var(--gp-text-secondary)]">
                    Nenhuma oportunidade foi finalizada ainda neste periodo. Essas oportunidades ainda aguardam o resultado final dos jogos.
                  </p>
                ) : metrics.finalized === 0 ? (
                  <p className="mt-1 text-[12px] leading-5 text-[var(--gp-text-secondary)]">
                    Sem oportunidades finalizadas neste periodo.
                  </p>
                ) : (
                  <p className="mt-1 text-[12px] leading-5 text-[var(--gp-text-secondary)]">
                    A taxa considera apenas oportunidades Green e Red.
                  </p>
                )}
              </section>

              {hasFilteredRecords ? (
                <OpportunityHistoryList records={filtered} />
              ) : (
                <section className="rounded-[12px] border border-[var(--gp-border-soft)] bg-[var(--gp-surface)] px-5 py-8 text-center">
                  <h3 className="text-[15px] font-semibold text-[var(--gp-text)]">
                    {emptyTitle}
                  </h3>
                  <p className="mt-2 text-[13px] leading-5 text-[var(--gp-text-secondary)]">
                    {hasPeriodRecords
                      ? "Selecione Todos ou outro grupo de mercado para ver os resultados disponiveis."
                      : "As oportunidades registradas aparecerao aqui quando se encaixarem nesta aba."}
                  </p>
                </section>
              )}
            </div>
          )}
        </div>

        <footer className="border-t border-[var(--gp-border)] bg-[var(--gp-surface)] px-4 py-3 sm:px-5">
          <div className="space-y-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
            <p>Resultados anteriores nao garantem resultados futuros.</p>
            <p>O historico considera apenas oportunidades registradas pelo sistema.</p>
            <p>Este historico esta salvo localmente neste dispositivo.</p>
          </div>
        </footer>
      </aside>
    </div>
  );
}
