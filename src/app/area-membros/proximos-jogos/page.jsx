"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useRouter } from "next/navigation";
import { fetchUpcomingGames } from "@/lib/fetchUpcomingGames";
import {
  filterPopularGames,
  groupGamesByLeague,
} from "@/lib/gamePopularity";

const SORT_OPTIONS = [
  { label: "Popularidade", value: "popularity" },
  { label: "Horário", value: "time" },
  { label: "Liga", value: "league" },
];

const VIEW_MODES = [
  { label: "Populares", value: "popular" },
  { label: "Todos", value: "all" },
];

const LEAGUE_FILTERS = [
  { label: "Todas as ligas", value: "all" },
  { label: "Brasileirão Série A", value: "brasileirao-a", leagueId: 9 },
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

function getGameStatus(game) {
  const status = String(game?.status || "").toLowerCase();
  const statusText = normalizeText(`${game?.statusLabel || ""} ${game?.statusLong || ""} ${game?.statusShort || ""}`);
  const period = String(game?.period || game?.statusPeriod || "").toLowerCase();
  const minute = game?.minute ?? game?.currentMinute;
  const { hasScore } = getGameScore(game);
  const gameDate = getGameDate(game);
  const elapsedMs = Number.isNaN(gameDate.getTime()) ? 0 : Date.now() - gameDate.getTime();
  const explicitFinished = ["finished", "ft", "aet", "pen"].includes(status)
    || period === "ft"
    || statusText.includes("encerrado")
    || statusText.includes("finished");

  if (explicitFinished) return "finished";

  if (
    ["live", "inprogress", "1h", "2h", "ht", "et", "bt", "p"].includes(status)
    || ["1st_half", "2nd_half", "halftime", "extra_time", "1h", "2h", "ht", "et"].includes(period)
    || statusText.includes("ao vivo")
    || statusText.includes("live")
    || statusText.includes("inprogress")
    || (minute !== null && minute !== undefined && Number(minute) > 0)
  ) {
    return "live";
  }
  if (["postponed", "pst"].includes(status)) return "postponed";
  if (["cancelled", "canceled", "canc", "abd", "susp", "int"].includes(status)) return "cancelled";
  if (hasScore && elapsedMs > 120 * 60 * 1000) return "finished";
  if (hasScore && elapsedMs >= 0) return "live";
  if (["scheduled", "notstarted", "upcoming", "ns"].includes(status)) return "scheduled";
  return "unknown";
}

function getStatusTone(status) {
  const normalizedStatus = getGameStatus({ status });
  if (normalizedStatus === "finished") return "finished";
  if (normalizedStatus === "live") return "live";
  if (["postponed", "cancelled"].includes(normalizedStatus)) return "alert";
  return "neutral";
}

function getGameScore(game) {
  const home = game.homeScore ?? game.scores?.home;
  const away = game.awayScore ?? game.scores?.away;
  const hasScore = home !== null && home !== undefined && away !== null && away !== undefined;

  return { home, away, hasScore };
}

function shouldShowGame(game) {
  const status = getGameStatus(game);
  const { hasScore } = getGameScore(game);
  if (hasScore) return true;
  if (status !== "scheduled") return true;

  return true;
}

function getGameBucket(game) {
  const status = getGameStatus(game);
  if (status === "live") return "live";
  if (status === "finished") return "finished";
  return "upcoming";
}

function sortFixturesForCalendar(games) {
  return games.slice().sort((a, b) => {
    const bucketOrder = { live: 0, upcoming: 1, finished: 2 };
    const aBucket = bucketOrder[getGameBucket(a)] ?? 3;
    const bBucket = bucketOrder[getGameBucket(b)] ?? 3;
    if (aBucket !== bBucket) return aBucket - bBucket;

    return (a.timestamp || 0) - (b.timestamp || 0);
  });
}

function getErrorContent(error) {
  if (!error) return null;

  if (error.code === "BZZOIRO_API_KEY_NOT_CONFIGURED") {
    return {
      title: "Token da BSD/Bzzoiro ausente",
      text: "A chave da API BSD/Bzzoiro nao esta configurada no servidor.",
      detail:
        process.env.NODE_ENV === "development"
          ? "Configure BZZOIRO_API_KEY nas variaveis de ambiente da Vercel e faca um novo deploy."
          : null,
      icon: ShieldAlert,
    };
  }

  if (error.code === "RATE_LIMIT") {
    return {
      title: "Limite de requests atingido",
      text: "A API BSD/Bzzoiro recusou novas chamadas por enquanto. Tente novamente em alguns minutos.",
      icon: ShieldAlert,
    };
  }

  if (error.code === "SERVICE_UNAVAILABLE" || error.code === "UPSTREAM_ERROR") {
    return {
      title: "API indisponivel",
      text: error.message || "Nao conseguimos contato com a API BSD/Bzzoiro agora.",
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
  const [failed, setFailed] = useState(false);

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200 dark:bg-white/[0.06] dark:ring-white/[0.1]">
      {src && !failed ? (
        <img src={src} alt="" className="h-5 w-5 object-contain" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">
          {name?.slice(0, 1) || "T"}
        </span>
      )}
    </span>
  );
}

function LeagueLogo({ src, name }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-white ring-1 ring-slate-200 dark:bg-white/[0.07] dark:ring-white/[0.1]">
      {src && !failed ? (
        <img src={src} alt="" className="h-6 w-6 object-contain" loading="lazy" onError={() => setFailed(true)} />
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

function StatusChip({ game }) {
  const normalizedStatus = getGameStatus(game);
  const tone = getStatusTone(normalizedStatus);
  const minute = game?.minute ?? game?.currentMinute;
  const label = (() => {
    if (normalizedStatus === "scheduled") return "Agendado";
    if (normalizedStatus === "finished") return "Encerrado";
    if (normalizedStatus === "live") return minute ? `AO VIVO ${minute}'` : "AO VIVO";
    if (normalizedStatus === "postponed") return "Adiado";
    if (normalizedStatus === "cancelled") return "Cancelado";
    return game?.statusLong || game?.statusLabel || "Status";
  })();

  return (
    <span
      className={cn(
        "inline-flex h-7 w-fit min-w-[76px] items-center justify-center rounded-full px-3 text-[11px] font-bold ring-1",
        tone === "live" && "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/12 dark:text-rose-200 dark:ring-rose-300/20",
        tone === "finished" && "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-white/[0.08]",
        tone === "alert" && "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-300/20",
        tone === "neutral" && "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-white/[0.045] dark:text-slate-300 dark:ring-white/[0.08]"
      )}
      title={game?.statusLong || game?.statusLabel}
    >
      {label}
    </span>
  );
}

function TeamScoreRows({ game }) {
  const { home, away, hasScore } = getGameScore(game);
  const showScore = hasScore;

  return (
    <div className="grid min-w-0 gap-2">
      {[
        { name: game.homeTeam, logo: game.homeLogo, score: home },
        { name: game.awayTeam, logo: game.awayLogo, score: away },
      ].map((team) => (
        <div key={team.name} className="grid min-w-0 grid-cols-[minmax(0,1fr)_36px] items-center gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <TeamLogo src={team.logo} name={team.name} />
            <span className="min-w-0 truncate text-[14px] font-bold text-slate-950 dark:text-white">
              {team.name}
            </span>
          </div>
          <span className={cn(
            "justify-self-end text-center text-[15px] font-black",
            showScore ? "text-slate-950 dark:text-white" : "text-slate-400 dark:text-slate-500"
          )}>
            {showScore ? team.score : "-"}
          </span>
        </div>
      ))}
    </div>
  );
}

function DateButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-[13px] font-bold ring-1 transition",
        active
          ? "bg-teal-400 text-slate-950 ring-teal-300"
          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:text-slate-950 dark:bg-white/[0.035] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07] dark:hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function DisplayToggle({ value, onChange }) {
  return (
    <div className="flex w-fit items-center rounded-full bg-slate-100 p-1 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:ring-white/[0.08]">
      {VIEW_MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={cn(
            "h-8 rounded-full px-3.5 text-[12px] font-bold transition",
            value === mode.value
              ? "bg-white text-slate-950 shadow-sm dark:bg-teal-400 dark:text-slate-950"
              : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
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
  dateMode,
  onDateModeChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  leagueFilter,
  onLeagueFilterChange,
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const today = useMemo(() => getTodayDateValue(), []);
  const tomorrow = useMemo(() => addDaysToDateValue(today, 1), [today]);

  const setPreset = (mode, dateValue) => {
    onDateModeChange(mode);
    onDateChange(dateValue);
  };

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#0d1624]">
      <div className="grid gap-3 xl:grid-cols-[auto_minmax(280px,1fr)_150px] xl:items-center">
        <div className="flex gap-2 overflow-x-auto">
          <DateButton active={dateMode === "today"} onClick={() => setPreset("today", today)}>
            Hoje
          </DateButton>
          <DateButton active={dateMode === "tomorrow"} onClick={() => setPreset("tomorrow", tomorrow)}>
            Amanhã
          </DateButton>
          <DateButton active={dateMode === "week"} onClick={() => setPreset("week", today)}>
            Esta semana
          </DateButton>
        </div>

        <label className="flex h-11 min-w-0 items-center gap-3 rounded-full bg-slate-50 px-4 text-[14px] text-slate-700 ring-1 ring-slate-200 focus-within:bg-white focus-within:ring-teal-400/45 dark:bg-slate-950/45 dark:text-slate-300 dark:ring-white/[0.08] dark:focus-within:ring-teal-300/45">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por time ou competição..."
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </label>

        <label className="flex h-11 items-center gap-2 rounded-full bg-slate-50 px-4 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950/45 dark:text-slate-300 dark:ring-white/[0.08]">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-500" />
          <span>Ordenar</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-right outline-none [color-scheme:light] dark:[color-scheme:dark]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label.replace("Ordenar por ", "")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 dark:border-white/[0.07] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <DisplayToggle value={viewMode} onChange={onViewModeChange} />
          <label className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-slate-50 px-3 text-[12px] font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white dark:bg-white/[0.035] dark:text-slate-300 dark:ring-white/[0.08]">
            <CalendarDays className="h-4 w-4 text-teal-600 dark:text-teal-300" />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                onDateModeChange("custom");
                onDateChange(event.target.value);
              }}
              className="bg-transparent text-slate-700 outline-none [color-scheme:light] dark:text-slate-200 dark:[color-scheme:dark]"
            />
          </label>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setAdvancedOpen((current) => !current)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-3 text-[12px] font-bold ring-1 transition",
              leagueFilter !== "all"
                ? "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-400/10 dark:text-teal-200 dark:ring-teal-300/20"
                : "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-white dark:bg-white/[0.035] dark:text-slate-300 dark:ring-white/[0.08]"
            )}
          >
            <Trophy className="h-4 w-4" />
            Filtros avançados
          </button>

          {advancedOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/[0.08] dark:bg-[#0b111d]">
              <p className="px-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Liga</p>
              <div className="mt-2 grid gap-1">
                {LEAGUE_FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onLeagueFilterChange(option.value);
                      setAdvancedOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition",
                      leagueFilter === option.value
                        ? "bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                    )}
                  >
                    {option.label}
                    {leagueFilter === option.value ? <span className="h-2 w-2 rounded-full bg-teal-500" /> : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function GameRow({ game, onSelect }) {
  const date = getGameDate(game);
  const status = getGameStatus(game);
  const minute = game.minute || game.currentMinute;
  const liveLabel = minute ? `AO VIVO ${minute}'` : "AO VIVO";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(game)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect(game);
      }}
      className={cn(
        "group grid cursor-pointer gap-3.5 border-t border-slate-100 px-4 py-4 transition-colors hover:bg-slate-50/90 dark:border-white/[0.06] dark:hover:bg-white/[0.04] lg:grid-cols-[130px_minmax(260px,1fr)_145px_96px_40px] lg:items-center lg:gap-4 lg:px-5",
        status === "live" && "bg-rose-50/35 dark:bg-rose-400/[0.035]"
      )}
    >
      <div className="flex items-center justify-between gap-3 lg:block">
        {status === "live" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-black text-rose-700 ring-1 ring-rose-200 dark:bg-rose-400/12 dark:text-rose-200 dark:ring-rose-300/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            {liveLabel}
          </span>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5 text-[13px] font-medium text-slate-500 dark:text-slate-400">
            <Clock3 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-300/80" />
            <span className="truncate">{WEEKDAY_FORMATTER.format(date)}</span>
          </div>
        )}
        <div className="lg:hidden">
          <StatusChip game={game} />
        </div>
      </div>

      <TeamScoreRows game={game} />

      <div className="hidden lg:block">
        <CountryFlag src={game.countryFlag} country={game.country} />
      </div>

      <div className="hidden lg:flex lg:items-center">
        <StatusChip game={game} />
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <div className="lg:hidden">
          <CountryFlag src={game.countryFlag} country={game.country} />
        </div>
        <button
          type="button"
          title="Ver detalhes do jogo"
          onClick={(event) => {
            event.stopPropagation();
            onSelect(game);
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function LeagueGroup({ group, onSelectGame }) {
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
          <GameRow key={game.id} game={game} onSelect={onSelectGame} />
        ))}
      </div>
    </section>
  );
}

function MatchStatusSection({ title, description, games, sort, onSelectGame }) {
  if (!games.length) return null;

  const groups = groupGamesByLeague(games, sort);

  return (
    <section className="grid gap-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h2 className="text-[15px] font-black text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08]">
          {games.length} jogos
        </span>
      </div>

      {groups.map((group) => (
        <LeagueGroup key={group.key} group={group} onSelectGame={onSelectGame} />
      ))}
    </section>
  );
}

function PopularHint({ visible, shownCount, totalCount, leagueFilter, dateMode }) {
  if (!visible || totalCount === 0) return null;

  const periodLabel = dateMode === "week" ? "do período" : "do dia";
  const leagueLabel = leagueFilter === "brasileirao-a" ? " no Brasileirão Série A" : "";

  return (
    <p className="px-1 text-[13px] font-medium text-slate-500 dark:text-slate-400">
      Exibindo {shownCount} jogos relevantes {periodLabel}{leagueLabel}.
      {shownCount < totalCount ? " Alterne para Todos para ampliar a lista." : ""}
    </p>
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
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateValue());
  const [dateMode, setDateMode] = useState("today");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularity");
  const [viewMode, setViewMode] = useState("popular");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const loadGames = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const activeLeague = LEAGUE_FILTERS.find((league) => league.value === leagueFilter);
      const isLeagueMode = activeLeague?.leagueId;
      const isRangeMode = dateMode === "week" || isLeagueMode;
      const rangeDays = isLeagueMode ? 14 : 7;
      const result = await fetchUpcomingGames(selectedDate, isRangeMode
        ? {
            leagueId: activeLeague?.leagueId,
            dateFrom: `${selectedDate}T03:00:00Z`,
            dateTo: `${addDaysToDateValue(selectedDate, rangeDays)}T02:59:59Z`,
            limit: 200,
          }
        : {});

      setGames(result.games);
      setMeta(result.meta);
    } catch (requestError) {
      setGames([]);
      setMeta(null);
      setError(requestError);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedDate, dateMode, leagueFilter]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const visibleGames = useMemo(() => games.filter(shouldShowGame), [games]);

  const relevantGames = useMemo(() => {
    return viewMode === "popular" ? filterPopularGames(visibleGames) : visibleGames;
  }, [visibleGames, viewMode]);

  const filteredGames = useMemo(() => {
    const term = normalizeText(search);
    if (!term) return relevantGames;

    return relevantGames.filter((game) => {
      return [game.homeTeam, game.awayTeam, game.leagueName, game.country].some((value) =>
        normalizeText(value).includes(term)
      );
    });
  }, [relevantGames, search]);

  const hasLiveGames = visibleGames.some((game) => getGameStatus(game) === "live");
  const matchSections = useMemo(() => {
    const sortedGames = sortFixturesForCalendar(filteredGames);
    return {
      live: sortedGames.filter((game) => getGameBucket(game) === "live"),
      upcoming: sortedGames.filter((game) => getGameBucket(game) === "upcoming"),
      finished: sortedGames.filter((game) => getGameBucket(game) === "finished"),
    };
  }, [filteredGames]);

  useEffect(() => {
    if (!hasLiveGames) return undefined;

    const interval = window.setInterval(() => {
      loadGames({ silent: true });
    }, 60 * 1000);

    return () => window.clearInterval(interval);
  }, [hasLiveGames, loadGames]);

  const errorContent = getErrorContent(error);
  const ErrorIcon = errorContent?.icon;
  const openGameDetails = (game) => {
    router.push(`/area-membros/proximos-jogos/${game.id}`);
  };

  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-[20px] border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-white/[0.08] dark:bg-[#0b111d]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                {"Calend\u00e1rio de partidas"}
              </p>
              <h1 className="mt-1.5 text-[28px] font-semibold text-slate-950 dark:text-white sm:text-[32px]">
                {"Pr\u00f3ximos Jogos"}
              </h1>
              <p className="mt-1.5 max-w-[680px] text-[14px] leading-6 text-slate-600 dark:text-slate-400">
                {"Acompanhe os jogos dispon\u00edveis por data."}
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[12px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08]">
              <Clock3 className="h-4 w-4" />
              {meta?.cached ? "Dados em cache" : "Atualiza\u00e7\u00e3o protegida"}
            </div>
          </div>
        </header>

        <Filters
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          dateMode={dateMode}
          onDateModeChange={setDateMode}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          leagueFilter={leagueFilter}
          onLeagueFilterChange={setLeagueFilter}
        />

        <PopularHint
          visible={viewMode === "popular" && !loading && !error}
          shownCount={relevantGames.length}
          totalCount={visibleGames.length}
          leagueFilter={leagueFilter}
          dateMode={dateMode}
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
                {errorContent.detail ? (
                  <p className="mt-2 text-[12px] leading-5 text-rose-600/80 dark:text-rose-100/55">
                    {errorContent.detail}
                  </p>
                ) : null}
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
                ? "Nao ha partidas disponiveis na API BSD/Bzzoiro para esta data."
                : visibleGames.length === 0
                  ? "Nao ha partidas para esta selecao."
                : viewMode === "popular"
                  ? "Nenhum jogo popular corresponde a busca atual. Alterne para Todos para ampliar a lista."
                  : "Nenhum time ou liga corresponde a busca atual."
            }
          />
        ) : null}

        {!loading && !error && filteredGames.length > 0 ? (
          <section className="grid gap-5">
            <MatchStatusSection
              title="Ao vivo"
              description="Partidas em andamento com placar atualizado."
              games={matchSections.live}
              sort={sort}
              onSelectGame={openGameDetails}
            />
            <MatchStatusSection
              title="Próximos"
              description="Jogos agendados para a data ou período selecionado."
              games={matchSections.upcoming}
              sort={sort}
              onSelectGame={openGameDetails}
            />
            <MatchStatusSection
              title="Encerrados"
              description="Resultados finais disponíveis para consulta."
              games={matchSections.finished}
              sort={sort}
              onSelectGame={openGameDetails}
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}
