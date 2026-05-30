"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { fetchUpcomingGames } from "@/lib/fetchUpcomingGames";
import { sortGames } from "@/lib/gamePopularity";
import {
  buildOpportunitiesFromAnalysis,
  formatOdd,
  formatProbability,
  getScoreMeta,
  getStatusLabel,
} from "@/lib/filttoScore";
import { saveOpportunitySnapshots } from "@/lib/opportunityHistory/storage";
import OpportunityHistoryButton from "@/components/opportunities/OpportunityHistoryButton";
import OpportunityHistoryDrawer from "@/components/opportunities/OpportunityHistoryDrawer";

const APP_TIME_ZONE = "America/Sao_Paulo";
const MAX_ANALYSIS_REQUESTS = 24;

const MARKET_GROUPS = [
  {
    label: null,
    options: [
      { label: "Todos", value: "Todos os mercados" },
      { label: "Resultado", value: "Resultado" },
      { label: "Gols", value: "Gols" },
      { label: "Ambas marcam", value: "Ambas marcam" },
    ],
  },
];

const CONFIDENCE_FILTERS = [
  { label: "Todas", value: "all" },
  { label: "60+", value: "60" },
  { label: "75+", value: "75" },
  { label: "90+", value: "90" },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getTodayDateValue() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: APP_TIME_ZONE,
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function marketMatchesFilter(itemMarket, selectedMarket) {
  if (selectedMarket === "Todos os mercados") return true;
  const normalized = normalizeText(itemMarket);

  if (selectedMarket === "Resultado") {
    return ["casa vence", "empate", "fora vence"].includes(normalized);
  }

  if (selectedMarket === "Gols") {
    return normalized.startsWith("over ") || normalized.startsWith("under ");
  }

  if (selectedMarket === "Ambas marcam") {
    return normalized.includes("ambas marcam");
  }

  return itemMarket === selectedMarket;
}

function opportunityMatchesMarket(item, selectedMarket) {
  if (selectedMarket === "Todos os mercados") return true;
  if (selectedMarket === "Resultado") return item.filterGroup === "resultado" || marketMatchesFilter(item.market, selectedMarket);
  if (selectedMarket === "Gols") return item.filterGroup === "gols" || marketMatchesFilter(item.market, selectedMarket);
  if (selectedMarket === "Ambas marcam") return item.filterGroup === "ambas_marcam" || marketMatchesFilter(item.market, selectedMarket);
  return marketMatchesFilter(item.market, selectedMarket);
}

function safeText(value, fallback = "Não informado") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function getMarketDisplayText(opportunity) {
  const key = opportunity?.marketKey;
  const rawMarket = safeText(opportunity?.market, "Dados insuficientes");
  const normalized = normalizeText(rawMarket);

  if (key === "btts_no" || normalized === "ambas marcam nao") {
    return "Ambas marcam: Não";
  }
  if (key === "btts_yes" || normalized === "ambas marcam") {
    return "Ambas marcam: Sim";
  }

  return rawMarket;
}

function getDateParts(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: APP_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function formatCompactDateTime(value) {
  const parts = getDateParts(value);
  if (!parts) return "Horário indefinido";

  const dateValue = `${parts.year}-${parts.month}-${parts.day}`;
  const today = getTodayDateValue();
  const label = dateValue === today ? "Hoje" : dateValue === addDays(today, 1) ? "Amanhã" : `${parts.day}/${parts.month}`;
  return `${label}, ${parts.hour}:${parts.minute}`;
}

async function fetchFullAnalysis(eventId) {
  const response = await fetch(`/api/football/events/${encodeURIComponent(eventId)}/full`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return null;
  return payload?.analysis || null;
}

function TeamLogo({ src, name }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--gp-surface-elevated)] text-[11px] font-semibold text-[var(--gp-text-secondary)] shadow-[0_1px_1px_rgba(15,23,42,0.04)] ring-1 ring-[var(--gp-border-soft)]">
      {src && !failed ? (
        <img src={src} alt="" className="h-6 w-6 object-contain" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        name?.slice(0, 1) || "T"
      )}
    </span>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-[31px] shrink-0 items-center rounded-[8px] px-3 text-[12px] font-semibold ring-1 transition focus-visible:ring-3 focus-visible:ring-[var(--gp-primary-soft)]",
        "flex-1 justify-center lg:flex-none",
        active
          ? "bg-slate-950 text-white ring-transparent shadow-sm dark:bg-white dark:text-slate-950"
          : "bg-transparent text-[var(--gp-text-secondary)] ring-transparent hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)]"
      )}
    >
      {children}
    </button>
  );
}

function normalizeOption(option) {
  return typeof option === "string" ? { label: option, value: option } : option;
}

function normalizeGroups(options) {
  const source = Array.isArray(options) ? options : [];
  if (source.some((item) => Array.isArray(item?.options))) {
    return source.map((group) => ({
      label: group.label,
      options: group.options.map(normalizeOption),
    }));
  }

  return [{ label: null, options: source.map(normalizeOption) }];
}

function SelectFilter({ label, value, onChange, options, className = "" }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const groups = useMemo(() => normalizeGroups(options), [options]);
  const flatOptions = useMemo(() => groups.flatMap((group) => group.options), [groups]);
  const selectedIndex = Math.max(flatOptions.findIndex((option) => option.value === value), 0);
  const selected = flatOptions[selectedIndex] || flatOptions[0];
  const listboxId = `opportunity-select-${label.toLowerCase().replace(/\W+/g, "-")}`;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function selectOption(option) {
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) selectOption(flatOptions[activeIndex] || selected);
      else {
        setActiveIndex(selectedIndex);
        setOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const base = open ? current : selectedIndex;
        const next = base + direction;
        if (next < 0) return flatOptions.length - 1;
        if (next >= flatOptions.length) return 0;
        return next;
      });
    }
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-[170px] flex-[1_1_170px] sm:flex-none", className)}>
      <button
        type="button"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "group flex h-9 w-full items-center gap-2.5 rounded-[10px] border px-3.5 text-left text-[12px] shadow-[0_1px_1px_rgba(15,23,42,0.025)] transition",
          "bg-[color-mix(in_srgb,var(--gp-input-bg)_94%,var(--gp-surface-elevated))] text-[var(--gp-text-secondary)]",
          "hover:border-[color-mix(in_srgb,var(--gp-border)_68%,var(--gp-text-muted))] hover:bg-[color-mix(in_srgb,var(--gp-input-bg)_88%,var(--gp-surface-elevated))]",
          "focus-visible:border-[var(--gp-primary)] focus-visible:ring-3 focus-visible:ring-[var(--gp-primary-soft)]",
          open
            ? "border-[color-mix(in_srgb,var(--gp-primary)_45%,var(--gp-border))] ring-3 ring-[var(--gp-primary-soft)]"
            : "border-[var(--gp-border-soft)]"
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 font-semibold text-[var(--gp-text-secondary)]">{label}</span>
          <span className="min-w-0 whitespace-nowrap font-semibold text-[var(--gp-text)]">{selected?.label || "Todos"}</span>
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
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          className="absolute left-0 top-[calc(100%+6px)] z-40 max-h-[280px] w-full min-w-[220px] overflow-y-auto rounded-[12px] border border-[var(--gp-border)] bg-[var(--gp-surface)] p-1.5 text-[12px] shadow-[0_18px_42px_rgba(15,23,42,0.14)] outline-none dark:shadow-[0_22px_48px_rgba(0,0,0,0.34)]"
        >
          {groups.map((group, groupIndex) => (
            <div key={group.label || `group-${groupIndex}`} className={groupIndex ? "mt-1 border-t border-[var(--gp-border-soft)] pt-1" : ""}>
              {group.label ? (
                <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--gp-text-muted)]">
                  {group.label}
                </p>
              ) : null}
              {group.options.map((option) => {
                const optionIndex = flatOptions.findIndex((item) => item.value === option.value);
                const selectedOption = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selectedOption}
                    onMouseEnter={() => setActiveIndex(optionIndex)}
                    onClick={() => selectOption(option)}
                    className={cn(
                      "flex h-8 w-full items-center justify-between gap-2 rounded-[8px] px-2.5 text-left font-semibold transition",
                      optionIndex === activeIndex && "bg-[var(--gp-hover)] text-[var(--gp-text)]",
                      selectedOption
                        ? "bg-[var(--gp-primary-soft)] text-[var(--gp-text)]"
                        : "text-[var(--gp-text-secondary)] hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)]"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {selectedOption ? <Check className="h-3.5 w-3.5 shrink-0 text-[var(--gp-primary)]" /> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OpportunitySkeleton() {
  return (
    <div className="grid gap-2.5">
      {[0, 1, 2].map((item) => (
        <div key={item} className="bankroll-panel p-3">
          <div className="grid animate-pulse gap-2.5 lg:grid-cols-[minmax(360px,1.2fr)_minmax(220px,0.68fr)_minmax(220px,0.64fr)] lg:items-center">
            <div className="h-11 rounded-[8px] bg-[var(--gp-surface-elevated)]" />
            <div className="h-11 rounded-[8px] bg-[var(--gp-surface-elevated)]" />
            <div className="h-11 rounded-[8px] bg-[var(--gp-surface-elevated)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatePanel({ type, title, text, onRetry }) {
  const Icon = type === "error" ? AlertCircle : type === "api" ? ShieldAlert : Sparkles;
  return (
    <section className="bankroll-panel px-5 py-9 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--gp-primary-soft)] text-[var(--gp-primary)] ring-1 ring-[var(--gp-border)]">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-[18px] font-semibold text-[var(--gp-text)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-[560px] text-[14px] leading-6 text-[var(--gp-text-secondary)]">{text}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="gp-button-primary mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-[13px] font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </button>
      ) : null}
    </section>
  );
}

function scoreToneClasses(tone) {
  if (tone === "strong") return "bg-emerald-500/12 text-emerald-700 ring-emerald-500/24 dark:text-emerald-300";
  if (tone === "good") return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/18 dark:text-emerald-300";
  if (tone === "attention") return "bg-amber-500/12 text-amber-700 ring-amber-500/22 dark:text-amber-300";
  if (tone === "risk") return "bg-rose-500/10 text-rose-700 ring-rose-500/22 dark:text-rose-300";
  return "bg-[var(--gp-surface-elevated)] text-[var(--gp-text-secondary)] ring-[var(--gp-border)]";
}

function InlineMetric({ label, value }) {
  return (
    <div className="min-w-0 cursor-default select-none rounded-full bg-[color-mix(in_srgb,var(--gp-surface-elevated)_88%,transparent)] px-2.5 py-[3px] ring-1 ring-[var(--gp-border-soft)]">
      <span className="text-[10.5px] font-semibold text-[var(--gp-text-secondary)]">{label}</span>
      <span className="ml-1.5 text-[12px] font-semibold text-[var(--gp-text)]">{value}</span>
    </div>
  );
}

function OpportunityCard({ opportunity }) {
  const score = opportunity.score;
  const meta = getScoreMeta(score?.score);
  const scoreLabel = meta.score === null ? "--" : meta.score;
  const scoreProgress = meta.score ?? 0;
  const statusLabel = getStatusLabel(opportunity.status);
  const summary = safeText(score?.summary, "Score estimado com os dados disponíveis. Valide o contexto antes da entrada.");
  const marketDisplay = getMarketDisplayText(opportunity);

  return (
    <article className="bankroll-panel grid gap-2.5 p-3 transition hover:border-[color-mix(in_srgb,var(--gp-border)_58%,var(--gp-primary))] lg:grid-cols-[minmax(360px,1.2fr)_minmax(220px,0.68fr)_minmax(220px,0.64fr)] lg:items-center">
      <div className="min-w-0 border-b border-[var(--gp-border-soft)] pb-2.5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex shrink-0 items-center">
            <TeamLogo src={opportunity.homeLogo} name={opportunity.homeTeam} />
            <span className="-ml-2">
              <TeamLogo src={opportunity.awayLogo} name={opportunity.awayTeam} />
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[15.5px] font-semibold leading-5 tracking-[-0.01em] text-[var(--gp-text)]">
              {safeText(opportunity.homeTeam, "Mandante")} x {safeText(opportunity.awayTeam, "Visitante")}
            </h2>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-[var(--gp-text-secondary)]">
              <span className="max-w-[210px] truncate">{safeText(opportunity.leagueName, "Liga não informada")}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--gp-border)]" />
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {formatCompactDateTime(opportunity.eventDate)}
              </span>
              <span className="rounded-full bg-[var(--gp-surface-elevated)] px-2 py-0.5 text-[11px] font-semibold text-[var(--gp-text-secondary)] ring-1 ring-[var(--gp-border-soft)]">
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0 border-b border-[var(--gp-border-soft)] pb-2.5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.11em] text-[var(--gp-text-secondary)]">Mercado sugerido</p>
        <p className="mt-1 truncate text-[14px] font-semibold text-[var(--gp-text)]">{marketDisplay}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <InlineMetric label="Odd" value={formatOdd(opportunity.odd)} />
          <InlineMetric label="Probabilidade" value={formatProbability(opportunity.probability)} />
          <InlineMetric label="Confiança" value={formatProbability(opportunity.confidence)} />
        </div>
      </div>

      <div className="min-w-0 lg:pl-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.11em] text-[var(--gp-text-secondary)]">Filtto Score</p>
            <p className="mt-0.5 text-[23px] font-semibold leading-none tracking-[-0.03em] text-[var(--gp-text)]">
              {scoreLabel}<span className="text-[13px] font-semibold text-[var(--gp-text-muted)]">/100</span>
            </p>
          </div>
          <span className={cn("max-w-[132px] shrink-0 truncate rounded-full px-2.5 py-[3px] text-[10.5px] font-semibold ring-1", scoreToneClasses(meta.tone))}>
            {safeText(score?.status || meta.label, "Dados insuficientes")}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--gp-bg-secondary)_82%,var(--gp-border-soft))] ring-1 ring-[var(--gp-border-soft)]">
          <span
            className={cn(
              "block h-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.18)]",
              meta.tone === "attention" ? "bg-amber-500" : meta.tone === "risk" ? "bg-rose-500" : "bg-[var(--gp-primary)]"
            )}
            style={{ width: `${scoreProgress}%` }}
          />
        </div>
        <p className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-[1.45] text-[var(--gp-text-secondary)]">{summary}</p>
        <Link
          href={`/area-membros/proximos-jogos/${opportunity.eventId || opportunity.id}`}
          className="mt-2 inline-flex w-fit items-center text-[12px] font-semibold text-[var(--gp-primary)] transition hover:text-[var(--gp-primary-hover)] focus-visible:rounded-[6px] focus-visible:ring-3 focus-visible:ring-[var(--gp-primary-soft)]"
        >
          Detalhes do jogo
        </Link>
      </div>
    </article>
  );
}

export default function OportunidadesPage() {
  const [period, setPeriod] = useState("today");
  const [search, setSearch] = useState("");
  const [league, setLeague] = useState("Todas as ligas");
  const [market, setMarket] = useState("Todos os mercados");
  const [confidence, setConfidence] = useState("all");
  const [opportunities, setOpportunities] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = getTodayDateValue();
      const dateTo = period === "today" ? today : period === "tomorrow" ? addDays(today, 1) : addDays(today, 7);
      const date = period === "tomorrow" ? addDays(today, 1) : today;
      const result = await fetchUpcomingGames(date, period === "week" ? {
        dateFrom: `${today}T03:00:00Z`,
        dateTo: `${dateTo}T02:59:59Z`,
        limit: 120,
      } : { limit: 80 });

      const games = sortGames(result.games || [], "popular").slice(0, MAX_ANALYSIS_REQUESTS);
      const analyses = await Promise.all(games.map((game) => fetchFullAnalysis(game.id)));
      const built = analyses
        .flatMap((analysis) => buildOpportunitiesFromAnalysis(analysis))
        .sort((a, b) => (b.score?.score ?? -1) - (a.score?.score ?? -1));

      setOpportunities(built);
    } catch (requestError) {
      setOpportunities([]);
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  useEffect(() => {
    if (!opportunities.length) return;
    saveOpportunitySnapshots(opportunities);
  }, [opportunities]);

  useEffect(() => {
    function handleHistoryTrigger(event) {
      if (event.target?.closest?.("[data-opportunity-history-trigger]")) {
        setHistoryOpen(true);
      }
    }

    document.addEventListener("click", handleHistoryTrigger);
    return () => document.removeEventListener("click", handleHistoryTrigger);
  }, []);

  const leagues = useMemo(() => {
    const names = opportunities.map((item) => item.leagueName).filter(Boolean);
    return ["Todas as ligas", ...Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))];
  }, [opportunities]);

  const leagueOptions = useMemo(
    () => leagues.map((item) => (item === "Todas as ligas" ? { label: "Todas", value: item } : item)),
    [leagues]
  );

  const filtered = useMemo(() => {
    const term = normalizeText(search);
    const minConfidence = confidence === "all" ? 0 : Number(confidence);

    return opportunities.filter((item) => {
      const matchesSearch = !term || [item.homeTeam, item.awayTeam, item.leagueName].some((value) => normalizeText(value).includes(term));
      const matchesLeague = league === "Todas as ligas" || item.leagueName === league;
      const matchesMarket = opportunityMatchesMarket(item, market);
      const matchesConfidence = (item.score?.score ?? 0) >= minConfidence;
      return matchesSearch && matchesLeague && matchesMarket && matchesConfidence;
    });
  }, [confidence, league, market, opportunities, search]);

  const errorIsApiKey = error?.code === "BZZOIRO_API_KEY_NOT_CONFIGURED";
  const marketEmptyTitle =
    market === "Resultado"
      ? "Nenhuma oportunidade de Resultado disponível agora"
      : market === "Ambas marcam"
        ? "Nenhuma oportunidade de Ambas marcam disponível agora"
        : market === "Gols"
          ? "Nenhuma oportunidade de Gols disponível agora"
          : "Nenhuma oportunidade encontrada agora";
  const marketEmptyText =
    market === "Todos os mercados"
      ? opportunities.length
        ? "Ajuste os filtros para ampliar a lista."
        : "Não há jogos com dados suficientes para destacar neste momento."
      : "A API não retornou odds/probabilidades suficientes para esse mercado neste período.";

  return (
    <main className="bankroll-page">
      <div className="bankroll-shell flex flex-col gap-4">
        <header className="flex flex-col gap-4 py-1 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--gp-text)]">
              Oportunidades
            </h1>
            <p className="mt-1.5 max-w-[680px] text-[14px] leading-6 text-[var(--gp-text-secondary)]">
              Jogos com melhor combinação entre mercado, probabilidade e Filtto Score.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <OpportunityHistoryButton onClick={() => setHistoryOpen(true)} />
            <Link
              href="/area-membros/proximos-jogos"
              className="gp-button-secondary inline-flex h-9 w-full items-center justify-center gap-2 rounded-[10px] border px-3.5 text-[12px] font-semibold sm:w-auto"
            >
              <CalendarDays className="h-4 w-4" />
              Ver próximos jogos
            </Link>
          </div>
        </header>

        <section className="bankroll-panel flex flex-col items-stretch gap-2 p-2 lg:flex-row lg:items-center" style={{ overflow: "visible" }}>
          <div className="flex w-full shrink-0 rounded-[12px] bg-[var(--gp-surface-elevated)] p-0.5 ring-1 ring-[var(--gp-border)] lg:w-auto">
            <FilterButton active={period === "today"} onClick={() => setPeriod("today")}>Hoje</FilterButton>
            <FilterButton active={period === "tomorrow"} onClick={() => setPeriod("tomorrow")}>Amanhã</FilterButton>
            <FilterButton active={period === "week"} onClick={() => setPeriod("week")}>Semana</FilterButton>
          </div>

          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:flex-1">
            <label className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-[10px] border border-[var(--gp-border)] bg-[var(--gp-input-bg)] px-3 text-[12px] text-[var(--gp-text-secondary)] focus-within:border-[var(--gp-primary)] lg:max-w-[280px]">
              <Search className="h-4 w-4 shrink-0" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar time"
                className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[var(--gp-text)] outline-none placeholder:text-[var(--gp-text-muted)]"
              />
            </label>
            <SelectFilter label="Liga" value={league} onChange={setLeague} options={leagueOptions} className="min-w-[178px] sm:w-[178px] lg:w-[188px]" />
            <SelectFilter label="Mercado" value={market} onChange={setMarket} options={MARKET_GROUPS} className="min-w-[228px] sm:w-[228px] lg:w-[242px]" />
            <SelectFilter label="Conf." value={confidence} onChange={setConfidence} options={CONFIDENCE_FILTERS} className="min-w-[182px] sm:w-[182px] lg:w-[192px]" />
          </div>
        </section>

        {loading ? <OpportunitySkeleton /> : null}

        {!loading && error ? (
          <StatePanel
            type={errorIsApiKey ? "api" : "error"}
            title={errorIsApiKey ? "Dados indisponíveis com segurança" : "Não foi possível carregar oportunidades"}
            text={errorIsApiKey ? "A chave da API precisa estar configurada no servidor. Nenhum token foi exposto no navegador." : "Tente novamente em instantes. Mantemos a mensagem simples para não expor detalhes sensíveis."}
            onRetry={loadOpportunities}
          />
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <StatePanel
            title={marketEmptyTitle}
            text={marketEmptyText}
          />
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <section className="grid gap-3">
            {filtered.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </section>
        ) : null}
      </div>
      <OpportunityHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </main>
  );
}
