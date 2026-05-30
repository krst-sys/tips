"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  Check,
  Clock3,
  LockKeyhole,
  RefreshCw,
  Search,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { fetchUpcomingGames } from "@/lib/fetchUpcomingGames";
import {
  POINTS_PER_CORRECT_PICK,
  VOTE_OPTIONS,
  getLocalUserStats,
  getPickRoundsStore,
  resolveRoundWithGames,
  saveRoundDraft,
  saveRoundPick,
  summarizeRound,
} from "@/lib/communityVotes/storage";

const APP_TIME_ZONE = "America/Sao_Paulo";
const MAX_ROUND_GAMES = 10;
const MAX_ANALYSIS_REQUESTS = 28;
const PICKS_ROUND_LOCK_MINUTES_BEFORE_FIRST_MATCH = 15;
const NEXT_ROUND_LOOKAHEAD_DAYS = 7;

const STATUS_FILTERS = [
  { label: "Todos", value: "all" },
  { label: "Abertos", value: "open" },
  { label: "Fechados", value: "closed" },
  { label: "Finalizados", value: "finished" },
];

const MAIN_LEAGUE_KEYWORDS = [
  "world cup",
  "champions league",
  "libertadores",
  "sul-americana",
  "premier league",
  "la liga",
  "serie a",
  "bundesliga",
  "ligue 1",
  "brasileirao",
  "copa do brasil",
  "mls",
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
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

function formatMatchDateTime(value) {
  const parts = getDateParts(value);
  if (!parts) return "Horário indefinido";

  const dateValue = `${parts.year}-${parts.month}-${parts.day}`;
  const today = getTodayDateValue();
  const label = dateValue === today ? "Hoje" : dateValue === addDays(today, 1) ? "Amanhã" : `${parts.day}/${parts.month}`;
  return `${label} ${parts.hour}:${parts.minute}`;
}

function formatRoundDate(dateValue) {
  if (!dateValue) return "Rodada atual";
  const today = getTodayDateValue();
  if (dateValue === today) return "Rodada de hoje";
  if (dateValue === addDays(today, 1)) return "Rodada de amanhã";
  const [year, month, day] = dateValue.split("-");
  return `Rodada ${day}/${month}/${year}`;
}

function formatCountdown(target, now) {
  if (!target) return "Horário indefinido";
  const diff = new Date(target).getTime() - (now?.getTime?.() ?? Date.now());
  if (!Number.isFinite(diff) || diff <= 0) return "Encerrada";
  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}min`;
  return `${hours}h ${String(minutes).padStart(2, "0")}min`;
}

function isUnavailableStatus(status) {
  return ["cancelled", "postponed"].includes(String(status || "").toLowerCase());
}

function getActualResult(game) {
  const status = String(game?.status || "").toLowerCase();
  if (status === "cancelled" || status === "postponed") return "void";
  if (status !== "finished") return null;
  const home = Number(game.homeScore);
  const away = Number(game.awayScore);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

function getEventRelevance(game) {
  const league = normalizeText(`${game?.leagueName || ""} ${game?.league || ""}`);
  const country = normalizeText(game?.country);
  const startsAt = game?.eventDate ? new Date(game.eventDate).getTime() : Number.NaN;
  const hoursUntilKickoff = Number.isNaN(startsAt) ? 48 : Math.max(0, (startsAt - Date.now()) / 36e5);

  let score = 0;
  if (MAIN_LEAGUE_KEYWORDS.some((keyword) => league.includes(normalizeText(keyword)))) score += 42;
  if (["brazil", "brasil", "england", "spain", "italy", "germany", "france", "argentina", "usa", "europe", "world"].some((item) => country.includes(item))) score += 18;
  if (game?.homeLogo && game?.awayLogo) score += 8;
  if (game?.leagueName || game?.league) score += 8;
  if (game?.status === "scheduled") score += 12;
  if (game?.status === "live") score += 5;
  if (game?.status === "finished") score -= 26;
  if (isUnavailableStatus(game?.status)) score -= 100;
  if (Number.isFinite(hoursUntilKickoff)) score += Math.max(0, 18 - Math.min(18, hoursUntilKickoff));
  return score;
}

function hasResultOdds(analysis) {
  const odds = analysis?.odds?.odds || {};
  return Boolean(odds.home_win || odds.draw || odds.away_win);
}

function hasResultAnalysis(analysis) {
  const rows = analysis?.probabilities?.fulltimeWinner;
  return Array.isArray(rows) && rows.length > 0;
}

function normalizeGameFromAnalysis(analysis, fallback, relevance) {
  const event = analysis?.event;
  const source = event || fallback;
  if (!source) return null;

  return {
    eventId: String(source.id || source.eventId),
    homeTeam: source.homeShortName || source.homeTeam || "Mandante",
    awayTeam: source.awayShortName || source.awayTeam || "Visitante",
    homeLogo: source.homeLogo || null,
    awayLogo: source.awayLogo || null,
    leagueName: source.leagueName || source.league || "Liga não informada",
    country: source.country || null,
    eventDate: source.eventDate || source.date || source.time || null,
    status: source.status || "unknown",
    homeScore: source.score?.home ?? source.homeScore ?? null,
    awayScore: source.score?.away ?? source.awayScore ?? null,
    hasOdds: hasResultOdds(analysis),
    hasAnalysis: hasResultAnalysis(analysis),
    relevance,
  };
}

function getRoundCloseAt(games) {
  const firstGameTime = games
    .map((game) => new Date(game.eventDate).getTime())
    .filter((time) => Number.isFinite(time))
    .sort((a, b) => a - b)[0];
  if (!firstGameTime) return null;
  return new Date(firstGameTime - PICKS_ROUND_LOCK_MINUTES_BEFORE_FIRST_MATCH * 60000).toISOString();
}

function getRoundStatus(round, games, now) {
  if (!round?.closesAt) return "preparing";
  const closed = new Date(round.closesAt).getTime() <= (now?.getTime?.() ?? Date.now());
  if (!closed) return "open";

  const activeGames = games.length ? games : round.games || [];
  const actualResults = activeGames.map(getActualResult);
  const resolved = actualResults.filter(Boolean).length;
  const allResolved = activeGames.length > 0 && resolved === activeGames.length;

  if (allResolved) return "finished";
  if (resolved > 0) return "resolving";
  return "closed";
}

function roundStatusLabel(status) {
  if (status === "open") return "Aberta";
  if (status === "closed") return "Fechada";
  if (status === "resolving") return "Em apuracao";
  if (status === "finished") return "Finalizada";
  return "Proxima rodada em preparacao";
}

function getGameVoteStatus(roundStatus, game) {
  const actual = getActualResult(game);
  if (actual && actual !== "void") return "finished";
  if (actual === "void") return "void";
  if (String(game.status || "").toLowerCase() === "live") return "live";
  if (roundStatus === "open") return "open";
  return "closed";
}

async function fetchFullAnalysis(eventId) {
  const response = await fetch(`/api/football/events/${encodeURIComponent(eventId)}/full`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return null;
  return payload?.analysis || null;
}

async function fetchRoundGames(dateValue) {
  const result = await fetchUpcomingGames(dateValue, { limit: 90 });
  const rankedGames = (result.games || [])
    .filter((game) => !isUnavailableStatus(game.status))
    .map((game) => ({
      game: normalizeGameFromAnalysis(null, game, getEventRelevance(game)),
      relevance: getEventRelevance(game),
    }))
    .filter((item) => item.game)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, MAX_ANALYSIS_REQUESTS);

  const analyses = await Promise.all(rankedGames.map(({ game }) => fetchFullAnalysis(game.eventId)));
  return rankedGames
    .map(({ game, relevance }, index) => {
      const analysis = analyses[index];
      const normalized = normalizeGameFromAnalysis(analysis, game, relevance);
      if (!normalized) return null;
      return {
        ...normalized,
        relevance: relevance + (hasResultOdds(analysis) ? 18 : 0) + (hasResultAnalysis(analysis) ? 16 : 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const scoreDiff = b.relevance - a.relevance;
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(a.eventDate || 0).getTime() - new Date(b.eventDate || 0).getTime();
    })
    .slice(0, MAX_ROUND_GAMES);
}

function TeamLogo({ src, name }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--gp-surface-elevated)] text-[11px] font-semibold text-[var(--gp-text-secondary)] ring-1 ring-[var(--gp-border-soft)]">
      {src && !failed ? (
        <img src={src} alt="" className="h-7 w-7 object-contain" loading="lazy" onError={() => setFailed(true)} />
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
        "inline-flex h-[31px] shrink-0 items-center justify-center rounded-[8px] px-3 text-[12px] font-semibold ring-1 transition focus-visible:ring-3 focus-visible:ring-[var(--gp-primary-soft)]",
        active
          ? "bg-slate-950 text-white ring-transparent shadow-sm dark:bg-white dark:text-slate-950"
          : "bg-transparent text-[var(--gp-text-secondary)] ring-transparent hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)]"
      )}
    >
      {children}
    </button>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="bankroll-panel px-3.5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[var(--gp-text-muted)]">{label}</p>
      <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.03em] text-[var(--gp-text)]">{value}</p>
      {detail ? <p className="mt-1 text-[12px] text-[var(--gp-text-secondary)]">{detail}</p> : null}
    </div>
  );
}

function RoundSkeleton() {
  return (
    <section className="grid gap-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="bankroll-panel p-4">
          <div className="grid animate-pulse gap-3 lg:grid-cols-[minmax(300px,1fr)_minmax(310px,0.85fr)_auto] lg:items-center">
            <div className="h-14 rounded-[10px] bg-[var(--gp-surface-elevated)]" />
            <div className="h-16 rounded-[10px] bg-[var(--gp-surface-elevated)]" />
            <div className="h-10 rounded-[10px] bg-[var(--gp-surface-elevated)] lg:w-28" />
          </div>
        </div>
      ))}
    </section>
  );
}

function StatePanel({ type = "empty", title, text, onRetry }) {
  const Icon = type === "error" ? AlertCircle : Sparkles;
  return (
    <section className="bankroll-panel px-5 py-10 text-center">
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

function VoteButton({ disabled, label, selected, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 flex-1 items-center justify-center rounded-[10px] px-3 text-[13px] font-semibold ring-1 transition focus-visible:ring-3 focus-visible:ring-[var(--gp-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60",
        selected
          ? "bg-slate-950 text-white ring-transparent shadow-sm dark:bg-white dark:text-slate-950"
          : "bg-[var(--gp-surface-elevated)] text-[var(--gp-text)] ring-[var(--gp-border-soft)] hover:bg-[var(--gp-hover)]"
      )}
    >
      {selected ? <Check className="mr-1.5 h-4 w-4" /> : null}
      {label}
    </button>
  );
}

function GameCard({ game, pick, roundStatus, onPick }) {
  const voteStatus = getGameVoteStatus(roundStatus, game);
  const disabled = roundStatus !== "open";
  const actual = getActualResult(game);
  const hasPick = Boolean(pick?.userPick);
  const resolved = pick?.result && pick.result !== "pending";

  return (
    <article className="bankroll-panel p-4 transition hover:border-[color-mix(in_srgb,var(--gp-border)_62%,var(--gp-primary))]">
      <div className="grid gap-4 lg:grid-cols-[minmax(300px,1fr)_minmax(310px,0.85fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                voteStatus === "open"
                  ? "bg-[var(--gp-primary-soft)] text-[var(--gp-primary)] ring-[color-mix(in_srgb,var(--gp-primary)_30%,var(--gp-border))]"
                  : "bg-[var(--gp-surface-elevated)] text-[var(--gp-text-secondary)] ring-[var(--gp-border-soft)]"
              )}
            >
              {voteStatus === "open" ? <Clock3 className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
              {voteStatus === "open" ? "Aberta" : voteStatus === "live" ? "Ao vivo" : voteStatus === "finished" ? "Finalizado" : voteStatus === "void" ? "Anulado" : "Fechada"}
            </span>
            <span className="text-[12px] font-medium text-[var(--gp-text-secondary)]">{formatMatchDateTime(game.eventDate)}</span>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 items-center">
              <TeamLogo src={game.homeLogo} name={game.homeTeam} />
              <span className="-ml-2">
                <TeamLogo src={game.awayLogo} name={game.awayTeam} />
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold leading-5 tracking-[-0.01em] text-[var(--gp-text)]">
                {game.homeTeam} x {game.awayTeam}
              </h2>
              <p className="mt-1 text-[12px] font-medium text-[var(--gp-text-secondary)]">{game.leagueName}</p>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[var(--gp-text-muted)]">
            {disabled ? "Seu palpite" : "Vote no resultado"}
          </p>
          <div className="mt-2 flex gap-2">
            {Object.entries(VOTE_OPTIONS).map(([value, label]) => (
              <VoteButton
                key={value}
                disabled={disabled}
                label={label}
                selected={pick?.userPick === value}
                onClick={() => onPick(game, value)}
              />
            ))}
          </div>
          <p className="mt-2 text-[12.5px] leading-5 text-[var(--gp-text-secondary)]">
            {hasPick
              ? `Seu palpite: ${VOTE_OPTIONS[pick.userPick]}`
              : disabled
                ? "Você não enviou palpite neste jogo."
                : "Você pode alterar seu palpite até o fechamento da rodada."}
          </p>
          {roundStatus !== "open" && !resolved && hasPick ? (
            <p className="mt-1 text-[12px] leading-5 text-[var(--gp-text-muted)]">Rodada fechada. Aguarde a apuracao dos resultados.</p>
          ) : null}
        </div>

        <div className="flex min-w-[180px] flex-col gap-2 lg:items-end">
          <div className="w-full rounded-[12px] bg-[var(--gp-surface-elevated)] px-3.5 py-3 ring-1 ring-[var(--gp-border-soft)] lg:w-[180px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[var(--gp-text-muted)]">Apuração</p>
            {actual && actual !== "void" ? (
              <>
                <p className="mt-1 text-[13px] font-semibold text-[var(--gp-text)]">Resultado: {VOTE_OPTIONS[actual]}</p>
                <p className="mt-1 text-[12px] leading-5 text-[var(--gp-text-secondary)]">
                  {pick?.result === "correct" ? "Acertou" : pick?.result === "wrong" ? "Errou" : "Pendente"} · +{pick?.points || 0} pontos
                </p>
              </>
            ) : actual === "void" ? (
              <p className="mt-1 text-[12px] leading-5 text-[var(--gp-text-secondary)]">Jogo anulado · +0 pontos</p>
            ) : (
              <p className="mt-1 text-[12px] leading-5 text-[var(--gp-text-secondary)]">Resultado ainda pendente</p>
            )}
          </div>
          <Link
            href={`/area-membros/proximos-jogos/${game.eventId}`}
            className="gp-button-secondary inline-flex h-10 w-full items-center justify-center rounded-[10px] border px-4 text-[13px] font-semibold lg:w-[180px]"
          >
            Ver análise
          </Link>
        </div>
      </div>
    </article>
  );
}

function PreviousRoundDrawer({ open, round, onClose }) {
  const summary = summarizeRound(round);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 p-3 backdrop-blur-sm">
      <aside className="flex h-full w-full max-w-[520px] flex-col rounded-[16px] border border-[var(--gp-border)] bg-[var(--gp-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <header className="flex items-start justify-between gap-3 border-b border-[var(--gp-border-soft)] p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--gp-text-muted)]">Rodada anterior</p>
            <h2 className="mt-1 text-[20px] font-semibold text-[var(--gp-text)]">{round ? formatRoundDate(round.date) : "Nenhuma rodada anterior"}</h2>
            {round ? <p className="mt-1 text-[13px] text-[var(--gp-text-secondary)]">{summary.correct}/{summary.sent || summary.games} acertos · {summary.points} pontos</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-[10px] p-2 text-[var(--gp-text-secondary)] hover:bg-[var(--gp-hover)]">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          {!round ? (
            <StatePanel title="Nenhuma rodada anterior encontrada." text="Quando você participar de uma rodada, o resumo ficará salvo neste dispositivo." />
          ) : (
            <div className="grid gap-3">
              {(round.games || []).map((game) => {
                const pick = round.picks?.[String(game.eventId)];
                const actual = getActualResult(game);
                return (
                  <div key={game.eventId} className="rounded-[12px] border border-[var(--gp-border-soft)] bg-[var(--gp-surface-elevated)] p-3">
                    <p className="text-[13px] font-semibold text-[var(--gp-text)]">{game.homeTeam} x {game.awayTeam}</p>
                    <p className="mt-1 text-[12px] text-[var(--gp-text-secondary)]">
                      Seu palpite: {pick?.userPick ? VOTE_OPTIONS[pick.userPick] : "Não enviado"}
                    </p>
                    <p className="mt-1 text-[12px] text-[var(--gp-text-secondary)]">
                      Resultado: {actual && actual !== "void" ? VOTE_OPTIONS[actual] : actual === "void" ? "Anulado" : "Pendente"}
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-[var(--gp-text)]">
                      {pick?.result === "correct" ? "Acertou" : pick?.result === "wrong" ? "Errou" : pick?.result === "void" ? "Anulado" : "Pendente"} · +{pick?.points || 0}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function PalpitesPage() {
  const [round, setRound] = useState(null);
  const [games, setGames] = useState([]);
  const [store, setStore] = useState({ rounds: {} });
  const [stats, setStats] = useState({
    totalPoints: 0,
    roundsPlayed: 0,
    correctPicks: 0,
    wrongPicks: 0,
    voidPicks: 0,
    currentMedal: { name: "Sem medalha", min: 0 },
    nextMedal: null,
    pointsToNextMedal: 0,
    rankPosition: null,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previousOpen, setPreviousOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const refreshLocalState = useCallback(() => {
    setStore(getPickRoundsStore());
    setStats(getLocalUserStats());
  }, []);

  const loadRound = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = getTodayDateValue();
      let selected = null;

      for (let offset = 0; offset <= NEXT_ROUND_LOOKAHEAD_DAYS; offset += 1) {
        const dateValue = addDays(today, offset);
        const roundGames = await fetchRoundGames(dateValue);
        if (!roundGames.length) continue;

        const closesAt = getRoundCloseAt(roundGames);
        const shouldUseRound = !selected || (closesAt && new Date(closesAt).getTime() > Date.now());
        if (shouldUseRound) {
          selected = { id: dateValue, date: dateValue, games: roundGames, closesAt };
        }
        if (closesAt && new Date(closesAt).getTime() > Date.now()) break;
      }

      if (!selected) {
        setRound(null);
        setGames([]);
        return;
      }

      saveRoundDraft({
        id: selected.id,
        date: selected.date,
        games: selected.games,
        closesAt: selected.closesAt,
      });
      resolveRoundWithGames(selected.id, selected.games);
      refreshLocalState();
      setRound(getPickRoundsStore().rounds[selected.id] || null);
      setGames(selected.games);
    } catch (requestError) {
      setRound(null);
      setGames([]);
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [refreshLocalState]);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  const picks = round?.picks || {};
  const roundStatus = getRoundStatus(round, games, now);
  const roundSummary = summarizeRound(round);
  const previousRound = useMemo(() => {
    const rounds = Object.values(store.rounds || {})
      .filter((storedRound) => storedRound?.id && storedRound.id !== round?.id)
      .sort((a, b) => String(b.date || b.id).localeCompare(String(a.date || a.id)));
    return rounds[0] || null;
  }, [round?.id, store.rounds]);

  function handlePick(game, selection) {
    if (!round || roundStatus !== "open") return;
    saveRoundPick(round.id, game, selection);
    refreshLocalState();
    setRound(getPickRoundsStore().rounds[round.id] || round);
  }

  const filteredGames = useMemo(() => {
    const term = normalizeText(search);
    return games.filter((game) => {
      const voteStatus = getGameVoteStatus(roundStatus, game);
      const normalizedStatus = voteStatus === "live" ? "closed" : voteStatus === "void" ? "finished" : voteStatus;
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
      const matchesSearch = !term || [game.homeTeam, game.awayTeam, game.leagueName].some((value) => normalizeText(value).includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [games, roundStatus, search, statusFilter]);

  const errorIsApiKey = error?.code === "BZZOIRO_API_KEY_NOT_CONFIGURED";
  const closeText = roundStatus === "open" ? `Fecha em ${formatCountdown(round?.closesAt, now)}` : "Rodada fechada";

  return (
    <main className="bankroll-page">
      <div className="bankroll-shell flex flex-col gap-4">
        <header className="flex flex-col gap-4 py-1 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--gp-text)]">Palpites do Dia</h1>
            <p className="mt-1.5 max-w-[720px] text-[14px] leading-6 text-[var(--gp-text-secondary)]">
              Vote no resultado dos jogos selecionados e acumule pontos no ranking.
            </p>
            <p className="mt-1 text-[12.5px] leading-5 text-[var(--gp-text-muted)]">
              Os palpites representam a opinião dos usuários e não garantem resultado. Seus palpites e pontos estão salvos localmente neste dispositivo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviousOpen(true)}
            className="gp-button-secondary inline-flex h-9 w-full items-center justify-center gap-2 rounded-[10px] border px-3.5 text-[12px] font-semibold sm:w-auto"
          >
            <Trophy className="h-4 w-4" />
            Ver resultado anterior
          </button>
        </header>

        <section className="bankroll-panel p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--gp-text-muted)]">{round ? formatRoundDate(round.date) : "Rodada atual"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--gp-primary-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--gp-primary)] ring-1 ring-[color-mix(in_srgb,var(--gp-primary)_30%,var(--gp-border))]">
                  {roundStatusLabel(roundStatus)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gp-surface-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--gp-text-secondary)] ring-1 ring-[var(--gp-border-soft)]">
                  <Clock3 className="h-3.5 w-3.5" />
                  {closeText}
                </span>
              </div>
              {roundStatus !== "open" ? (
                <p className="mt-3 text-[13px] leading-5 text-[var(--gp-text-secondary)]">
                  Os palpites desta rodada foram encerrados. Aguarde a apuração dos resultados.
                </p>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[420px]">
              <Metric label="Jogos da rodada" value={roundSummary.games || games.length} detail={`${POINTS_PER_CORRECT_PICK} pontos por acerto`} />
              <Metric label="Meus palpites" value={`${roundSummary.sent}/${roundSummary.games || games.length}`} detail={`${roundSummary.possiblePoints} pontos possíveis`} />
            </div>
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-3">
          <Metric label="Meus pontos" value={stats.totalPoints} detail={`${roundSummary.points} nesta rodada`} />
          <Metric label="Medalha atual" value={stats.currentMedal.name} detail={stats.nextMedal ? `Faltam ${stats.pointsToNextMedal} para ${stats.nextMedal.name}` : "Nível máximo local"} />
          <Metric label="Desempenho local" value={`${stats.correctPicks}/${stats.correctPicks + stats.wrongPicks || 0}`} detail={`${stats.roundsPlayed} rodada(s) com palpite`} />
        </section>

        <section className="bankroll-panel flex flex-col items-stretch gap-2 p-2 lg:flex-row lg:items-center" style={{ overflow: "visible" }}>
          <label className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-[10px] border border-[var(--gp-border)] bg-[var(--gp-input-bg)] px-3 text-[12px] text-[var(--gp-text-secondary)] focus-within:border-[var(--gp-primary)] lg:max-w-[360px]">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar time"
              className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[var(--gp-text)] outline-none placeholder:text-[var(--gp-text-muted)]"
            />
          </label>
          <div className="flex w-full shrink-0 rounded-[11px] bg-[var(--gp-surface-elevated)] p-0.5 ring-1 ring-[var(--gp-border)] sm:w-auto">
            {STATUS_FILTERS.map((item) => (
              <FilterButton key={item.value} active={statusFilter === item.value} onClick={() => setStatusFilter(item.value)}>
                {item.label}
              </FilterButton>
            ))}
          </div>
        </section>

        {loading ? <RoundSkeleton /> : null}

        {!loading && error ? (
          <StatePanel
            type="error"
            title={errorIsApiKey ? "Dados indisponíveis com segurança" : "Não foi possível carregar a rodada"}
            text={errorIsApiKey ? "A chave da API precisa estar configurada no servidor. Nenhum token foi exposto no navegador." : "Tente novamente em instantes. Mantemos a mensagem simples para não expor detalhes sensíveis."}
            onRetry={loadRound}
          />
        ) : null}

        {!loading && !error && !filteredGames.length ? (
          <StatePanel title="Nenhum jogo disponível para a rodada agora." text="A próxima rodada será preparada conforme os jogos forem carregados." />
        ) : null}

        {!loading && !error && filteredGames.length > 0 ? (
          <section className="grid gap-3">
            {filteredGames.map((game) => (
              <GameCard
                key={game.eventId}
                game={game}
                pick={picks[String(game.eventId)]}
                roundStatus={roundStatus}
                onPick={handlePick}
              />
            ))}
          </section>
        ) : null}
      </div>
      <PreviousRoundDrawer open={previousOpen} round={previousRound} onClose={() => setPreviousOpen(false)} />
    </main>
  );
}
