"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Clock3,
  Globe2,
  Loader2,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import { fetchUpcomingGames } from "@/lib/fetchUpcomingGames";
import {
  filterPopularGames,
  groupGamesByLeague,
} from "@/lib/gamePopularity";

const SORT_OPTIONS = [
  { label: "Ordenar por Popularidade", value: "popularity" },
  { label: "Ordenar por Liga", value: "league" },
  { label: "Ordenar por Horário", value: "time" },
  { label: "Ordenar por País", value: "country" },
];

const VIEW_MODES = [
  { label: "Populares", value: "popular" },
  { label: "Todos", value: "all" },
];

const APP_TIME_ZONE = "America/Sao_Paulo";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

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

function dateValueToUtcNoon(dateValue) {
  return new Date(`${dateValue}T12:00:00.000Z`);
}

function addDaysToDateValue(dateValue, days) {
  const date = dateValueToUtcNoon(dateValue);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatQuickDateLabel(offset, dateValue) {
  if (offset === -1) return "Ontem";
  if (offset === 0) return "Hoje";
  if (offset === 1) return "Amanhã";

  return DAY_MONTH_FORMATTER.format(dateValueToUtcNoon(dateValue)).replace(".", "");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getGameDate(game) {
  return game.date ? new Date(game.date) : new Date((game.timestamp || 0) * 1000);
}

function getStatusTone(status) {
  if (["FT", "AET", "PEN"].includes(status)) return "finished";
  if (["1H", "HT", "2H", "ET", "BT", "P"].includes(status)) return "live";
  if (["PST", "CANC", "ABD", "SUSP", "INT"].includes(status)) return "alert";
  return "neutral";
}

function getErrorContent(error) {
  if (!error) return null;

  if (error.code === "RATE_LIMIT") {
    return {
      title: "Limite de requests atingido",
      text: "A API-Football recusou novas chamadas por enquanto. Os dados em cache continuam sendo usados quando disponiveis.",
      icon: ShieldAlert,
    };
  }

  if (error.code === "SERVICE_UNAVAILABLE" || error.code === "UPSTREAM_ERROR") {
    return {
      title: "API indisponivel",
      text: error.message || "Nao conseguimos contato com a API-Football agora.",
      icon: AlertCircle,
    };
  }

  return {
    title: "Erro ao buscar jogos",
    text: error.message || "Tente novamente em instantes.",
    icon: AlertCircle,
  };
}

function TeamLogo({ src, name }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200 dark:bg-white/[0.06] dark:ring-white/[0.1]">
      {src ? (
        <img src={src} alt="" className="h-5 w-5 object-contain" loading="lazy" />
      ) : (
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">
          {name?.slice(0, 1) || "T"}
        </span>
      )}
    </span>
  );
}

function LeagueLogo({ src, name }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-white ring-1 ring-slate-200 dark:bg-white/[0.07] dark:ring-white/[0.1]">
      {src ? (
        <img src={src} alt="" className="h-6 w-6 object-contain" loading="lazy" />
      ) : (
        <Trophy className="h-4 w-4 text-teal-300" />
      )}
    </span>
  );
}

function CountryFlag({ src, country }) {
  if (src) {
    return (
      <span className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
        <img src={src} alt="" className="h-3.5 w-5 rounded-[3px] object-cover" loading="lazy" />
        <span className="max-w-[120px] truncate">{country}</span>
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-400/12 dark:text-indigo-200 dark:ring-indigo-300/20">
        <Globe2 className="h-3 w-3" />
      </span>
      <span className="max-w-[140px] truncate">{country}</span>
    </span>
  );
}

function StatusChip({ status, statusLong }) {
  const tone = getStatusTone(status);
  const label = (() => {
    if (status === "NS") return "Agendado";
    if (status === "FT") return "Encerrado";
    if (status === "HT") return "Intervalo";
    if (["1H", "2H", "ET", "BT", "P"].includes(status)) return "Ao Vivo";
    if (tone === "live") return "Ao Vivo";
    return status || "Agendado";
  })();

  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit min-w-[76px] items-center justify-center rounded-full px-3 text-[11px] font-bold ring-1",
        tone === "live" && "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-400/12 dark:text-teal-200 dark:ring-teal-300/20",
        tone === "finished" && "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-white/[0.08]",
        tone === "alert" && "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-300/20",
        tone === "neutral" && "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-white/[0.045] dark:text-slate-300 dark:ring-white/[0.08]"
      )}
      title={statusLong}
    >
      {label}
    </span>
  );
}

function VersusBadge() {
  return (
    <span className="shrink-0 px-1 text-[12px] font-bold text-slate-500 dark:text-slate-400">
      x
    </span>
  );
}

function Matchup({ game }) {
  return (
    <div className="mx-auto flex w-full max-w-[520px] min-w-0 items-center justify-center gap-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <TeamLogo src={game.homeLogo} name={game.homeTeam} />
        <span className="min-w-0 max-w-[180px] truncate text-[14px] font-bold text-slate-950 dark:text-white">
          {game.homeTeam}
        </span>
      </div>

      <VersusBadge />

      <div className="flex min-w-0 items-center gap-2">
        <TeamLogo src={game.awayLogo} name={game.awayTeam} />
        <span className="min-w-0 max-w-[180px] truncate text-[14px] font-bold text-slate-950 dark:text-white">
          {game.awayTeam}
        </span>
      </div>
    </div>
  );
}

function DateButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center rounded-[12px] px-4 text-[13px] font-semibold ring-1 transition",
        active
          ? "bg-teal-400 text-slate-950 ring-teal-300 shadow-[0_10px_28px_rgba(45,212,191,0.22)]"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 hover:text-slate-950 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07] dark:hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function DisplayToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-[13px] bg-slate-100 p-1 ring-1 ring-slate-200 dark:bg-slate-950/55 dark:ring-white/[0.08]">
      <span className="px-2 text-[12px] font-semibold text-slate-500">Exibição</span>
      {VIEW_MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={cn(
            "h-8 rounded-[10px] px-3 text-[12px] font-bold transition",
            value === mode.value
              ? "bg-teal-400 text-slate-950 shadow-[0_8px_22px_rgba(45,212,191,0.18)]"
              : "text-slate-500 hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.055] dark:hover:text-white"
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

function Filters({
  selectedDate,
  onDateChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
}) {
  const quickDates = useMemo(() => {
    const today = getTodayDateValue();
    return [-1, 0, 1, 2, 3, 4, 5].map((offset) => {
      const value = addDaysToDateValue(today, offset);
      return {
        label: formatQuickDateLabel(offset, value),
        value,
      };
    });
  }, []);

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-[#0d1624] dark:shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {quickDates.map((option) => (
          <DateButton
            key={option.value}
            active={selectedDate === option.value}
            onClick={() => onDateChange(option.value)}
          >
            {option.label}
          </DateButton>
        ))}

        <label className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[12px] bg-white px-3 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]">
          <CalendarDays className="h-4 w-4 text-teal-600 dark:text-teal-300" />
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => onDateChange(event.target.value)}
            className="bg-transparent text-slate-700 outline-none [color-scheme:light] dark:text-slate-200 dark:[color-scheme:dark]"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[auto_minmax(0,1fr)_280px]">
        <DisplayToggle value={viewMode} onChange={onViewModeChange} />

        <label className="flex h-11 min-w-0 items-center gap-3 rounded-[13px] bg-white px-4 text-[14px] text-slate-700 ring-1 ring-slate-200 focus-within:ring-teal-400/45 dark:bg-slate-950/55 dark:text-slate-300 dark:ring-white/[0.08] dark:focus-within:ring-teal-300/45">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Pesquisar por time ou liga..."
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="flex h-11 items-center gap-3 rounded-[13px] bg-white px-4 text-[14px] font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950/55 dark:text-slate-300 dark:ring-white/[0.08]">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-500" />
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent outline-none [color-scheme:light] dark:[color-scheme:dark]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function GameRow({ game }) {
  const date = getGameDate(game);

  return (
    <article className="group grid gap-3.5 border-t border-slate-100 px-4 py-4 transition-colors hover:bg-slate-50/90 dark:border-white/[0.06] dark:hover:bg-white/[0.04] lg:min-h-[64px] lg:grid-cols-[210px_minmax(360px,1fr)_145px_96px_40px] lg:items-center lg:gap-4 lg:px-5">
      <div className="flex items-center justify-between gap-3 lg:justify-start">
        <div className="flex min-w-0 items-center gap-2.5 text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <Clock3 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-300/80" />
          <span className="truncate">{WEEKDAY_FORMATTER.format(date)}</span>
        </div>
        <div className="lg:hidden">
          <StatusChip status={game.status} statusLong={game.statusLong} />
        </div>
      </div>

      <Matchup game={game} />

      <div className="hidden lg:block">
        <CountryFlag src={game.countryFlag} country={game.country} />
      </div>

      <div className="hidden lg:flex lg:items-center">
        <StatusChip status={game.status} statusLong={game.statusLong} />
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <div className="lg:hidden">
          <CountryFlag src={game.countryFlag} country={game.country} />
        </div>
        <button
          type="button"
          title="Ver detalhes futuramente"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function LeagueGroup({ group }) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.035)] dark:border-white/[0.08] dark:bg-[#0d1624] dark:shadow-none">
      <header className="flex min-h-12 items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.045] lg:px-5">
        <div className="flex min-w-0 items-center gap-3.5">
          <LeagueLogo src={group.leagueLogo} name={group.leagueName} />
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-bold text-slate-950 dark:text-white">
              {group.leagueName}
            </h2>
            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500/85 dark:text-slate-400">
              {group.country}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.09] dark:shadow-none">
          {group.games.length} jogos
        </span>
      </header>

      <div>
        {group.games.map((game) => (
          <GameRow key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

function PopularHint({ visible, shownCount, totalCount }) {
  if (!visible || totalCount === 0) return null;

  return (
    <div className="rounded-[16px] border border-teal-200 bg-teal-50 px-4 py-3 text-[13px] font-medium leading-5 text-teal-800 dark:border-teal-300/15 dark:bg-teal-300/[0.06] dark:text-teal-100/80">
      Mostrando jogos mais relevantes ({shownCount} de {totalCount}). Você pode alternar para
      {" “Todos” "}para ver a lista completa.
    </div>
  );
}

function StatePanel({ type, title, text }) {
  const Icon = type === "loading" ? Loader2 : type === "empty" ? CalendarDays : AlertCircle;

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white px-5 py-10 text-center shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-[#0d1624] dark:shadow-none">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-white/[0.055] dark:text-teal-300 dark:ring-white/[0.08]">
        <Icon className={cn("h-5 w-5", type === "loading" && "animate-spin")} />
      </div>
      <h2 className="mt-4 text-[18px] font-semibold text-slate-950 dark:text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-[560px] text-[14px] leading-6 text-slate-600 dark:text-slate-400">{text}</p>
    </section>
  );
}

export default function ProximosJogosPage() {
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateValue());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularity");
  const [viewMode, setViewMode] = useState("popular");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadGames() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchUpcomingGames(selectedDate);
        if (!active) return;
        setGames(result.games);
        setMeta(result.meta);
      } catch (requestError) {
        if (!active) return;
        setGames([]);
        setMeta(null);
        setError(requestError);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGames();

    return () => {
      active = false;
    };
  }, [selectedDate]);

  const relevantGames = useMemo(() => {
    return viewMode === "popular" ? filterPopularGames(games) : games;
  }, [games, viewMode]);

  const filteredGames = useMemo(() => {
    const term = normalizeText(search);
    if (!term) return relevantGames;

    return relevantGames.filter((game) => {
      return [game.homeTeam, game.awayTeam, game.leagueName, game.country].some((value) =>
        normalizeText(value).includes(term)
      );
    });
  }, [relevantGames, search]);

  const groups = useMemo(() => groupGamesByLeague(filteredGames, sort), [filteredGames, sort]);
  const errorContent = getErrorContent(error);
  const ErrorIcon = errorContent?.icon;

  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-[#0b111d] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                {"Calend\u00e1rio de partidas"}
              </p>
              <h1 className="mt-2 text-[30px] font-semibold text-slate-950 dark:text-white sm:text-[34px]">
                {"Pr\u00f3ximos Jogos"}
              </h1>
              <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-slate-600 dark:text-slate-400">
                {"Acompanhe os jogos dispon\u00edveis por data, liga e pa\u00eds."}
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-[12px] font-semibold text-teal-700 ring-1 ring-teal-200 dark:bg-teal-400/10 dark:text-teal-200 dark:ring-teal-300/20">
              <Clock3 className="h-4 w-4" />
              {meta?.cached ? "Dados em cache" : "Atualiza\u00e7\u00e3o protegida"}
            </div>
          </div>
        </header>

        <Filters
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <PopularHint
          visible={viewMode === "popular" && !loading && !error}
          shownCount={relevantGames.length}
          totalCount={games.length}
        />

        {loading ? (
          <StatePanel
            type="loading"
            title="Carregando jogos"
            text="Estamos buscando a lista de partidas para a data selecionada."
          />
        ) : null}

        {!loading && errorContent ? (
          <section className="rounded-[20px] border border-rose-200 bg-rose-50 px-5 py-8 dark:border-rose-300/15 dark:bg-rose-400/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-300/10 dark:text-rose-200 dark:ring-rose-300/20">
                {ErrorIcon ? <ErrorIcon className="h-5 w-5" /> : null}
              </span>
              <div>
                <h2 className="text-[18px] font-semibold text-slate-950 dark:text-white">{errorContent.title}</h2>
                <p className="mt-2 text-[14px] leading-6 text-rose-700 dark:text-rose-100/75">{errorContent.text}</p>
              </div>
            </div>
          </section>
        ) : null}

        {!loading && !error && filteredGames.length === 0 ? (
          <StatePanel
            type="empty"
            title="Nenhum jogo encontrado"
            text={
              games.length === 0
                ? "Nao ha partidas disponiveis na API-Football para esta data."
                : viewMode === "popular"
                  ? "Nenhum jogo popular corresponde a busca atual. Alterne para Todos para ampliar a lista."
                  : "Nenhum time ou liga corresponde a busca atual."
            }
          />
        ) : null}

        {!loading && !error && groups.length > 0 ? (
          <section className="grid gap-4">
            {groups.map((group) => (
              <LeagueGroup key={group.key} group={group} />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
