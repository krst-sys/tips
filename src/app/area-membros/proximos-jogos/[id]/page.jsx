"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Clock3,
  Loader2,
  ShieldAlert,
  MapPin,
  Table2,
} from "lucide-react";
import { fetchMatchAnalysis } from "@/lib/fetchMatchAnalysis";
import MatchLiveReading from "@/components/match-analysis/MatchLiveReading";
import FilttoScoreCard from "@/components/filtto/FilttoScoreCard";
import {
  calculateFilttoScore,
  formatOdd as formatFilttoOdd,
  formatProbability,
  getSuggestedMarket,
} from "@/lib/filttoScore";

const APP_TIME_ZONE = "America/Sao_Paulo";

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "full",
  timeZone: APP_TIME_ZONE,
});

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

const TABS = [
  { id: "facts", label: "Resumo" },
  { id: "odds", label: "Odds" },
  { id: "stats", label: "Estatísticas" },
  { id: "lineups", label: "Escalações" },
  { id: "h2h", label: "H2H" },
  { id: "standings", label: "Classificação" },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toFixed(Number(value) % 1 === 0 ? 0 : 1)}%`;
}

function statusLabel(status) {
  const labels = {
    cancelled: "Cancelado",
    finished: "Finished",
    live: "Live",
    penalties: "Penalties",
    postponed: "Adiado",
    upcoming: "Upcoming",
  };
  return labels[status] || "Upcoming";
}

function resultTone(result) {
  if (result === "W") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200";
  if (result === "L") return "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200";
  if (result === "D") return "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200";
  return "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400";
}

function TeamLogo({ src, name }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white text-[20px] font-black text-slate-500 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-200 dark:ring-white/[0.1] sm:h-20 sm:w-20">
      {src && !failed ? (
        <img src={src} alt="" className="h-14 w-14 object-contain sm:h-16 sm:w-16" onError={() => setFailed(true)} />
      ) : (
        name?.slice(0, 1) || "T"
      )}
    </span>
  );
}

function SmallTeamLogo({ teamId, name, src }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = !failed ? src || (teamId ? `/api/football/assets/team/${teamId}/` : null) : null;

  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[10px] font-black text-slate-500 ring-1 ring-slate-200 dark:bg-white dark:text-slate-600 dark:ring-white/[0.16]">
      {imageSrc ? (
        <img src={imageSrc} alt="" className="h-6 w-6 object-contain" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        name?.slice(0, 1) || "T"
      )}
    </span>
  );
}

function PageState({ loading, error }) {
  const Icon = loading ? Loader2 : ShieldAlert;
  const isToken = error?.code === "BZZOIRO_API_KEY_NOT_CONFIGURED";

  return (
    <main className="min-h-full bg-slate-50 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="mx-auto max-w-[760px] rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/[0.08] dark:bg-[#0b111d]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
          <Icon className={cn("h-5 w-5", loading && "animate-spin")} />
        </div>
        <h1 className="mt-4 text-[22px] font-black">
          {loading ? "Carregando análise do jogo" : isToken ? "Chave da API não configurada" : "Não foi possível carregar o jogo"}
        </h1>
        <p className="mx-auto mt-2 max-w-[540px] text-[14px] leading-6 text-slate-600 dark:text-slate-400">
          {loading
            ? "Estamos buscando as informações disponíveis para este jogo."
            : error?.message || "Tente novamente em instantes."}
        </p>
      </section>
    </main>
  );
}

function EmptyState({ children = "Dados ainda não disponíveis para este jogo." }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-[14px] font-semibold text-slate-500 dark:border-white/[0.12] dark:bg-white/[0.03] dark:text-slate-400">
      {children}
    </div>
  );
}

function Section({ title, eyebrow, children, right }) {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#0d1624]">
      <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-white/[0.07]">
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{eyebrow}</p>
          ) : null}
          <h2 className="mt-1 text-[17px] font-black text-slate-950 dark:text-white">{title}</h2>
        </div>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function getTopPick(analysis) {
  const candidates = [
    ["Both Teams To Score", analysis.probabilities?.btts],
    ["Total Goals 1.5", analysis.probabilities?.overUnder?.["1.5"]],
    ["Total Goals 2.5", analysis.probabilities?.overUnder?.["2.5"]],
    ["Total Goals 3.5", analysis.probabilities?.overUnder?.["3.5"]],
    ["Resultado final", analysis.probabilities?.fulltimeWinner],
  ].flatMap(([market, items]) => (items || []).map((item) => ({ ...item, displayMarket: market })));

  return candidates
    .filter((item) => item.value !== undefined && !item.displayOnly)
    .sort((a, b) => b.value - a.value)[0];
}

function pairedMarket(items = []) {
  const [first, second] = [...items].sort((a, b) => (b.value || 0) - (a.value || 0));
  return { first, second };
}

function PredictionMarket({ title, items, isPick }) {
  const { first, second } = pairedMarket(items);

  if (!first) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <p className="text-[13px] font-black text-slate-900 dark:text-white">{title}</p>
        <p className="mt-3 text-[13px] text-slate-500 dark:text-slate-400">Indisponível</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        isPick
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-300/20 dark:bg-emerald-400/10"
          : "border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-black text-slate-900 dark:text-white">{title}</p>
        {isPick ? (
          <span className="rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-black text-white">PICK</span>
        ) : null}
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-200">{first.label}</p>
          <p className="mt-1 text-[24px] font-black text-slate-950 dark:text-white">{formatPercent(first.value)}</p>
        </div>
        {second ? (
          <div className="text-right">
            <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400">{second.label}</p>
            <p className="mt-1 text-[16px] font-black text-slate-500 dark:text-slate-300">{formatPercent(second.value)}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ModelPredictions({ analysis }) {
  const topPick = getTopPick(analysis);
  const pickKey = topPick ? `${topPick.displayMarket}:${topPick.label}` : null;
  const confidence = topPick?.value || analysis.model?.confidence;
  const markets = [
    ["Both Teams To Score", analysis.probabilities?.btts],
    ["Total Goals 1.5", analysis.probabilities?.overUnder?.["1.5"]],
    ["Total Goals 2.5", analysis.probabilities?.overUnder?.["2.5"]],
    ["Total Goals 3.5", analysis.probabilities?.overUnder?.["3.5"]],
  ];

  return (
    <Section
      title="Model Predictions"
      eyebrow="Filtto Intelligence"
      right={
        topPick ? (
          <div className="text-right">
            <p className="text-[30px] font-black leading-none text-emerald-500">{formatPercent(confidence)}</p>
            <p className="mt-1 text-[11px] font-bold text-slate-400">confidence</p>
          </div>
        ) : null
      }
    >
      <div className="mb-5">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Top pick</p>
        <p className="mt-1 text-[22px] font-black text-slate-950 dark:text-white">
          {topPick ? topPick.label : "Aguardando dados suficientes"}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {markets.map(([title, items]) => {
          const { first } = pairedMarket(items);
          const key = first ? `${title}:${first.label}` : null;
          return <PredictionMarket key={title} title={title} items={items} isPick={key === pickKey} />;
        })}
      </div>
    </Section>
  );
}

function shouldShowLiveAnalysis(analysis) {
  return ["live", "finished", "penalties"].includes(analysis.event?.status);
}

function getFixtureResult(match, teamId) {
  if (match.homeScore === null || match.awayScore === null) return "-";
  const own = match.homeTeamId === teamId ? match.homeScore : match.awayScore;
  const against = match.homeTeamId === teamId ? match.awayScore : match.homeScore;
  if (own > against) return "W";
  if (own < against) return "L";
  return "D";
}

function TeamFormColumn({ teamName, teamId, teamLogo, matches }) {
  const lastFive = (matches || []).slice(0, 5);
  const record = lastFive.reduce(
    (acc, match) => {
      const result = getFixtureResult(match, teamId);
      if (result === "W") acc.w += 1;
      if (result === "D") acc.d += 1;
      if (result === "L") acc.l += 1;
      return acc;
    },
    { w: 0, d: 0, l: 0 }
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <SmallTeamLogo teamId={teamId} name={teamName} src={teamLogo} />
          <h3 className="min-w-0 truncate font-black text-slate-950 dark:text-white">{teamName}</h3>
        </div>
        <span className="text-[13px] font-black text-slate-700 dark:text-slate-300">
          {record.w}W · {record.d}D · {record.l}L
        </span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/[0.07]">
        {lastFive.length ? (
          lastFive.map((match) => {
            const result = getFixtureResult(match, teamId);
            const opponent = match.homeTeamId === teamId ? match.awayTeam : match.homeTeam;
            const opponentId = match.homeTeamId === teamId ? match.awayTeamId : match.homeTeamId;
            const opponentLogo = match.homeTeamId === teamId ? match.awayLogo : match.homeLogo;
            const prefix = match.homeTeamId === teamId ? "vs" : "@";
            return (
              <div key={match.id} className="grid grid-cols-[minmax(0,1fr)_64px] items-center gap-3 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <SmallTeamLogo teamId={opponentId} name={opponent} src={opponentLogo} />
                  <p className="min-w-0 truncate text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    {prefix} {opponent}
                  </p>
                </div>
                <span className={cn("justify-self-end rounded-lg px-2.5 py-1 text-[12px] font-black", resultTone(result))}>
                  {match.homeScore ?? "-"}-{match.awayScore ?? "-"}
                </span>
              </div>
            );
          })
        ) : (
          <EmptyState>Forma recente indisponível.</EmptyState>
        )}
      </div>
    </div>
  );
}

function TeamForm({ analysis }) {
  return (
    <Section title="Team Form" eyebrow="Últimos jogos">
      <div className="grid gap-8 md:grid-cols-2">
        <TeamFormColumn
          teamName={analysis.event.homeShortName || analysis.event.homeTeam}
          teamId={analysis.event.homeTeamId}
          teamLogo={analysis.event.homeLogo}
          matches={analysis.h2h?.homeRecent}
        />
        <TeamFormColumn
          teamName={analysis.event.awayShortName || analysis.event.awayTeam}
          teamId={analysis.event.awayTeamId}
          teamLogo={analysis.event.awayLogo}
          matches={analysis.h2h?.awayRecent}
        />
      </div>
    </Section>
  );
}

function H2HSummary({ analysis, showTable = true }) {
  const summary = analysis.h2h?.summary || { homeWins: 0, draws: 0, awayWins: 0 };
  const total = Math.max(1, summary.homeWins + summary.draws + summary.awayWins);
  const direct = analysis.h2h?.direct || [];
  const avgGoals =
    direct.length > 0
      ? direct.reduce((sum, match) => sum + (Number(match.homeScore) || 0) + (Number(match.awayScore) || 0), 0) / direct.length
      : null;

  return (
    <Section title="Head to Head" eyebrow="Confrontos diretos">
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          [analysis.event.homeShortName || analysis.event.homeTeam, summary.homeWins, "text-blue-600"],
          ["Draws", summary.draws, "text-amber-500"],
          [analysis.event.awayShortName || analysis.event.awayTeam, summary.awayWins, "text-rose-500"],
        ].map(([label, value, color]) => (
          <div key={label}>
            <p className={cn("text-[28px] font-black", color)}>{value}</p>
            <p className="mt-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.08]">
        <span className="bg-blue-500" style={{ width: `${(summary.homeWins / total) * 100}%` }} />
        <span className="bg-amber-400" style={{ width: `${(summary.draws / total) * 100}%` }} />
        <span className="bg-rose-500" style={{ width: `${(summary.awayWins / total) * 100}%` }} />
      </div>
      <p className="mt-3 text-center text-[12px] font-medium text-slate-500 dark:text-slate-400">
        Last {direct.length || 0} meetings {avgGoals ? `· ${avgGoals.toFixed(1)} avg goals` : ""}
      </p>

      {showTable ? <H2HTable matches={direct} event={analysis.event} /> : null}
    </Section>
  );
}

function H2HTable({ matches, event }) {
  if (!matches?.length) return <div className="mt-5"><EmptyState>Histórico entre equipes não disponível.</EmptyState></div>;

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead className="text-slate-400">
          <tr className="border-b border-slate-200 dark:border-white/[0.08]">
            <th className="py-3 pr-4 font-black">Date</th>
            <th className="px-4 py-3 font-black">Home</th>
            <th className="px-4 py-3 text-center font-black">Score</th>
            <th className="py-3 pl-4 font-black">Away</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => {
            const winner =
              match.homeScore > match.awayScore ? "home" : match.homeScore < match.awayScore ? "away" : "draw";
            return (
              <tr key={match.id} className="border-b border-slate-100 dark:border-white/[0.06]">
                <td className="py-3 pr-4 text-slate-500">{match.eventDate ? new Date(match.eventDate).toISOString().slice(0, 10) : "-"}</td>
                <td className={cn("px-4 py-3", winner === "home" && "font-black text-slate-950 dark:text-white")}>{match.homeTeam}</td>
                <td className="px-4 py-3 text-center font-black">{match.homeScore ?? "-"} - {match.awayScore ?? "-"}</td>
                <td className={cn("py-3 pl-4", winner === "away" && "font-black text-slate-950 dark:text-white")}>{match.awayTeam}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MatchFacts({ analysis }) {
  const facts = [
    ["Estádio", analysis.event.venue],
    ["Cidade", analysis.event.venueCity],
    ["País", analysis.event.country || analysis.event.venueCountry],
    ["Competição", analysis.event.leagueName],
    ["Rodada", analysis.event.round],
    ["Kickoff", analysis.event.eventDate ? `${DATE_FORMATTER.format(new Date(analysis.event.eventDate))} · ${TIME_FORMATTER.format(new Date(analysis.event.eventDate))}` : null],
    ["Status", statusLabel(analysis.event.status)],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  return (
    <Section title="Informações da partida" eyebrow="Resumo do evento">
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 dark:divide-white/[0.07] dark:border-white/[0.08] dark:bg-white/[0.03]">
        {facts.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3">
            <p className="text-[12px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
            <p className="text-right text-[14px] font-black text-slate-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function KeyReadingCard({ analysis }) {
  const suggested = getSuggestedMarket(analysis);
  const score = calculateFilttoScore({
    probability: suggested?.probability,
    odd: suggested?.odd,
    confidence: analysis.model?.confidence,
    analysis,
    status: analysis.event?.status,
  });
  const risk =
    score.score === null
      ? "Dados insuficientes"
      : score.score >= 75
        ? "Controlado"
        : score.score >= 60
          ? "Moderado"
          : score.score >= 40
            ? "Atencao"
            : "Alto";

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1fr)]">
      <FilttoScoreCard score={score.score} status={score.status} summary={score.summary} />

      <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0d1624]">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
          Melhor leitura
        </p>
        <h2 className="mt-1 text-[18px] font-black text-slate-950 dark:text-white">
          {suggested?.market || "Dados insuficientes para definir mercado"}
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            ["Odd atual", suggested?.odd ? formatFilttoOdd(suggested.odd) : "Odds ainda não disponíveis"],
            ["Probabilidade", suggested?.probability !== undefined ? formatProbability(suggested.probability) : "Dados insuficientes"],
            ["Confiança", analysis.model?.confidence !== undefined ? formatProbability(analysis.model.confidence) : "Dados insuficientes"],
            ["Risco", risk],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/[0.08] dark:bg-white/[0.035]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <p className="mt-1.5 text-[14px] font-black text-slate-950 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[12px] leading-5 text-slate-500 dark:text-slate-400">
          O score combina dados disponíveis e pode mudar quando odds, escalações ou estatísticas ao vivo forem atualizadas. Ele não é garantia de acerto.
        </p>
      </div>
    </section>
  );
}

function FactsTab({ analysis }) {
  return (
    <div className="grid gap-5">
      <KeyReadingCard analysis={analysis} />
      <ModelPredictions analysis={analysis} />
      {shouldShowLiveAnalysis(analysis) ? <MatchLiveReading analysis={analysis} /> : null}
      <TeamForm analysis={analysis} />
      <H2HSummary analysis={analysis} showTable={false} />
      <MatchFacts analysis={analysis} />
    </div>
  );
}

function LineupsTab({ analysis }) {
  const lineups = analysis.lineups?.lineups;
  if (!lineups) return <EmptyState>Escalações ainda não disponíveis para este jogo.</EmptyState>;

  const unavailable = analysis.lineups?.unavailable_players || {};
  const teams = [
    { side: "home", data: lineups.home },
    { side: "away", data: lineups.away },
  ].filter((item) => item.data);

  return (
    <div className="grid gap-5">
      <HeadCoaches analysis={analysis} lineups={lineups} />

      <div className="grid gap-5 md:grid-cols-2">
      {teams.map(({ side, data: team }) => (
        <Section key={team.team_id || team.team_name} title={team.team_name || "Time"} eyebrow={team.formation ? `Formation: ${team.formation}` : "Lineup"}>
          <PlayerList title="Predicted Starting XI" players={team.players} />
          <PlayerList title="Bench" players={team.substitutes} subtle />
          <PlayerList title="Unavailable" players={unavailable[side]} empty="Sem indisponíveis informados." subtle />
        </Section>
      ))}
      </div>
    </div>
  );
}

function getCoachCandidate(analysis, lineups, side) {
  const lineup = lineups?.[side] || {};
  const rawCoach = analysis.raw?.[`${side}Coach`];
  const eventCoach = analysis.event?.coaches?.[side];
  const rawEvent = analysis.raw?.event || {};
  const coachId = eventCoach?.id || rawCoach?.id || lineup.coach_id || rawEvent[`${side}_coach_id`];

  return {
    id: coachId,
    name:
      eventCoach?.name ||
      rawCoach?.name ||
      rawCoach?.full_name ||
      rawCoach?.short_name ||
      lineup.coach_name ||
      lineup.manager_name ||
      lineup.coach?.name ||
      lineup.manager?.name ||
      (coachId ? `Treinador ID ${coachId}` : "Treinador indisponÃ­vel"),
    photo: eventCoach?.photo || rawCoach?.photo || (coachId ? `/api/football/assets/manager/${coachId}/` : null),
    formation: lineup.formation || eventCoach?.preferredFormation || rawCoach?.preferred_formation,
    confidence: lineup.confidence || lineup.prediction_confidence || lineup.lineup_confidence || null,
    nationality: eventCoach?.nationality || rawCoach?.nationality || rawCoach?.country || lineup.coach?.nationality || null,
    tacticalProfile: eventCoach?.tacticalProfile || rawCoach?.tactical_profile || null,
    winPct: eventCoach?.winPct ?? rawCoach?.win_pct ?? null,
    avgPossession: eventCoach?.avgPossession ?? rawCoach?.avg_possession ?? null,
    matchesTotal: eventCoach?.matchesTotal ?? rawCoach?.matches_total ?? null,
  };
}

function CoachPhoto({ coach }) {
  const [failed, setFailed] = useState(false);
  const src = coach?.photo && !failed ? coach.photo : null;
  const initial = (coach?.name || "T").slice(0, 1);

  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[18px] font-black text-slate-500 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-200 dark:ring-white/[0.1]">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        initial
      )}
    </span>
  );
}

function CoachCard({ coach }) {
  const tacticalLevel = coach.avgPossession || coach.winPct || (coach.confidence ? Number(coach.confidence) * 100 : null);
  const tacticalLabel = coach.avgPossession ? "Posse mÃ©dia" : coach.winPct ? "Aproveitamento" : "Leitura tÃ¡tica";

  return (
    <div className="flex flex-col items-center px-5 py-5 text-center">
      <CoachPhoto coach={coach} />
      <h3 className="mt-3 text-[16px] font-black text-slate-950 dark:text-white">{coach.name}</h3>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {coach.formation ? (
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
            {coach.formation}
          </span>
        ) : null}
        {coach.nationality ? (
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
            {coach.nationality}
          </span>
        ) : null}
        {coach.tacticalProfile ? (
          <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-black capitalize text-teal-700 dark:bg-teal-400/10 dark:text-teal-200">
            {coach.tacticalProfile}
          </span>
        ) : null}
      </div>
      <div className="mt-5 w-full">
        <div className="mb-2 flex items-center justify-between text-[12px] font-semibold text-slate-500 dark:text-slate-400">
          <span>Leitura tÃ¡tica</span>
          <span>{tacticalLevel ? `${tacticalLevel}%` : "Dados parciais"}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.08]">
          <span className="block h-full rounded-full bg-teal-500" style={{ width: `${tacticalLevel || 42}%` }} />
        </div>
      </div>
    </div>
  );
}

function HeadCoaches({ analysis, lineups }) {
  const homeCoach = getCoachCandidate(analysis, lineups, "home");
  const awayCoach = getCoachCandidate(analysis, lineups, "away");

  return (
    <Section title="Head Coaches" eyebrow="Comando tÃ¡tico">
      <div className="grid divide-y divide-slate-100 dark:divide-white/[0.07] md:grid-cols-2 md:divide-x md:divide-y-0">
        <CoachCard coach={homeCoach} />
        <CoachCard coach={awayCoach} />
      </div>
    </Section>
  );
}

function PlayerPhoto({ player }) {
  const [failed, setFailed] = useState(false);
  const src = player?.id && !failed ? `/api/football/assets/player/${player.id}/` : null;
  const initial = (player?.short_name || player?.name || "P").slice(0, 1);

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[12px] font-black text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/[0.1]">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        initial
      )}
    </span>
  );
}

function PlayerList({ title, players, empty = "Dados indisponíveis.", subtle = false }) {
  const list = players || [];
  return (
    <div className="mt-4 first:mt-0">
      <p className={cn("mb-2 text-[11px] font-black uppercase tracking-[0.12em]", subtle ? "text-slate-400" : "text-slate-500 dark:text-slate-300")}>{title}</p>
      {list.length ? (
        <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {list.slice(0, title === "Bench" ? 12 : 20).map((player) => (
            <div key={player.id || player.name} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <PlayerPhoto player={player} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-black !text-slate-900 dark:!text-white">
                    {player.jersey_number ? `${player.jersey_number}. ` : ""}{player.short_name || player.name}
                  </p>
                  <p className="text-[11px] !text-slate-500 dark:!text-slate-300">{player.position || player.reason || player.status || ""}</p>
                </div>
              </div>
              {player.rating || player.score || player.ai_score ? (
                <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[12px] font-black text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                  {player.rating || player.score || Math.round(player.ai_score * 100)}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 px-3 py-3 text-[13px] font-semibold text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">{empty}</p>
      )}
    </div>
  );
}

function formatOdd(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : value;
}

function hasOdd(value) {
  return value !== null && value !== undefined && value !== "";
}

function OddsOption({ label, sublabel, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition dark:border-white/[0.08] dark:bg-white/[0.04]">
      <p className="text-[12px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      {sublabel ? <p className="mt-1 truncate text-[12px] font-semibold text-slate-500 dark:text-slate-400">{sublabel}</p> : null}
      <p className="mt-3 text-[22px] font-black text-slate-950 dark:text-white">{formatOdd(value)}</p>
    </div>
  );
}

function OddsMarketCard({ title, description, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#0d1624]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
      >
        <div>
          <h2 className="text-[16px] font-black text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>
      {open ? <div className="border-t border-slate-100 p-5 dark:border-white/[0.07]">{children}</div> : null}
    </section>
  );
}

function OddsTab({ analysis }) {
  const odds = analysis.odds?.odds || {};
  const homeTeam = analysis.event.homeShortName || analysis.event.homeTeam || "Mandante";
  const awayTeam = analysis.event.awayShortName || analysis.event.awayTeam || "Visitante";
  const availableOdds = Object.values(odds).filter(hasOdd).length;

  if (!availableOdds) {
    return (
      <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-white/[0.12] dark:bg-white/[0.03]">
        <h2 className="text-[18px] font-black text-slate-950 dark:text-white">Odds indisponíveis</h2>
        <p className="mx-auto mt-2 max-w-[520px] text-[14px] font-semibold leading-6 text-slate-500 dark:text-slate-400">
          Ainda não há odds consolidadas para esta partida. Quando os mercados forem atualizados, eles aparecerão aqui de forma organizada.
        </p>
      </div>
    );
  }

  const mainOdds = [
    { label: "Casa", sublabel: homeTeam, value: odds.home_win },
    { label: "Empate", sublabel: "X", value: odds.draw },
    { label: "Fora", sublabel: awayTeam, value: odds.away_win },
  ];
  const goalLines = [
    { line: "1.5", over: odds.over_15_goals, under: odds.under_15_goals },
    { line: "2.5", over: odds.over_25_goals, under: odds.under_25_goals },
    { line: "3.5", over: odds.over_35_goals, under: odds.under_35_goals },
  ].filter((row) => hasOdd(row.over) || hasOdd(row.under));

  return (
    <div className="grid gap-4">
      <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-white/[0.08] dark:bg-[#0d1624]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">Mercados disponíveis</p>
            <h2 className="mt-1 text-[20px] font-black text-slate-950 dark:text-white">Odds da partida</h2>
          </div>
          <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
            {availableOdds} cotações consolidadas
          </p>
        </div>
      </div>

      <OddsMarketCard title="Resultado final" description="Mercado 1X2" defaultOpen>
        <div className="grid gap-3 md:grid-cols-3">
          {mainOdds.map((item) => (
            <OddsOption
              key={item.label}
              label={item.label}
              sublabel={item.sublabel}
              value={item.value}
            />
          ))}
        </div>
      </OddsMarketCard>

      <OddsMarketCard title="Total de gols" description="Linhas principais de over/under" defaultOpen>
        {goalLines.length ? (
          <div className="grid gap-3">
            {goalLines.map((row) => {
              return (
                <div key={row.line} className="grid grid-cols-[1fr_72px_1fr] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Over {row.line}</p>
                    <p className="mt-1 text-[20px] font-black text-slate-950 dark:text-white">{formatOdd(row.over)}</p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-center text-[12px] font-black text-slate-500 dark:border-white/[0.08] dark:bg-slate-950/30 dark:text-slate-300">
                    {row.line}
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Under {row.line}</p>
                    <p className="mt-1 text-[20px] font-black text-slate-950 dark:text-white">{formatOdd(row.under)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState>Linhas de gols ainda não disponíveis.</EmptyState>
        )}
      </OddsMarketCard>

      <OddsMarketCard title="Ambos marcam" description="Sim ou não" defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          <OddsOption label="Sim" value={odds.btts_yes} />
          <OddsOption label="Não" value={odds.btts_no} />
        </div>
      </OddsMarketCard>

      <p className="text-center text-[12px] font-semibold leading-5 text-slate-500 dark:text-slate-400">
        Odds podem variar até o início da partida. Use como referência e valide antes de criar uma entrada.
      </p>
    </div>
  );
}

function formatStatValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return `${number % 1 === 0 ? number.toFixed(0) : number.toFixed(2).replace(".", ",")}${suffix}`;
}

function StatsTab({ analysis }) {
  const rows = analysis.stats?.comparison || [];
  const showLive = shouldShowLiveAnalysis(analysis);

  if (!rows.length && !showLive) {
    return <EmptyState>Estatísticas ainda não disponíveis para este jogo.</EmptyState>;
  }

  return (
    <div className="grid gap-5">
      {showLive ? <MatchLiveReading analysis={analysis} /> : null}

      {rows.length ? (
        <Section title="Estatísticas da partida" eyebrow="Comparativo">
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/60 dark:divide-white/[0.07] dark:border-white/[0.08] dark:bg-white/[0.03]">
            {rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[72px_minmax(0,1fr)_72px] items-center gap-3 px-4 py-3">
                <p className="text-[14px] font-black text-slate-950 dark:text-white">
                  {formatStatValue(row.home, row.suffix)}
                </p>
                <div className="min-w-0 text-center">
                  <p className="truncate text-[12px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    {row.label}
                  </p>
                </div>
                <p className="text-right text-[14px] font-black text-slate-950 dark:text-white">
                  {formatStatValue(row.away, row.suffix)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      ) : (
        <EmptyState>Estatísticas ainda não disponíveis para este jogo.</EmptyState>
      )}
    </div>
  );
}

function StandingsTab({ analysis }) {
  const rows = analysis.standings?.rows || [];

  if (!rows.length) return <EmptyState>Classificação indisponível para esta competição.</EmptyState>;

  return (
    <Section title="Classificação" eyebrow={analysis.event.leagueName}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-200 dark:border-white/[0.08]">
              {["#", "Time", "J", "V", "E", "D", "SG", "Pts", "Últimos 5"].map((header) => (
                <th key={header} className="px-3 py-3 font-black">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 24).map((row) => (
              <tr
                key={row.teamId}
                className={cn(
                  "border-b border-slate-100 text-slate-700 dark:border-white/[0.06] dark:text-slate-200",
                  (row.isHomeTeam || row.isAwayTeam) && "bg-teal-50 text-slate-950 dark:bg-teal-400/10 dark:text-white"
                )}
              >
                <td className="px-3 py-3 font-black">{row.position}</td>
                <td className="px-3 py-3 font-black">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <SmallTeamLogo teamId={row.teamId} name={row.teamName} />
                    <span className="min-w-0 truncate">{row.teamName}</span>
                  </div>
                </td>
                <td className="px-3 py-3">{row.played ?? "-"}</td>
                <td className="px-3 py-3">{row.won ?? "-"}</td>
                <td className="px-3 py-3">{row.drawn ?? "-"}</td>
                <td className="px-3 py-3">{row.lost ?? "-"}</td>
                <td className="px-3 py-3">{row.goalDifference ?? "-"}</td>
                <td className="px-3 py-3 font-black">{row.points ?? "-"}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    {String(row.form || "").split("").slice(-5).map((result, index) => (
                      <span key={`${row.teamId}-${index}`} className={cn("flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black", resultTone(result))}>
                        {result}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export default function MatchAnalysisPage() {
  const params = useParams();
  const eventId = params?.id;
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("facts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchMatchAnalysis(eventId);
        if (active) setAnalysis(result);
      } catch (requestError) {
        if (active) setError(requestError);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [eventId]);

  useEffect(() => {
    if (!eventId || analysis?.event?.status !== "live") return undefined;
    let active = true;

    const interval = window.setInterval(async () => {
      try {
        const result = await fetchMatchAnalysis(eventId);
        if (active) setAnalysis(result);
      } catch {
        // Mantem os dados atuais se a atualizacao ao vivo falhar.
      }
    }, 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [analysis?.event?.status, eventId]);

  const kickoff = useMemo(() => {
    if (!analysis?.event?.eventDate) return null;
    const date = new Date(analysis.event.eventDate);
    return {
      date: DATE_FORMATTER.format(date),
      time: TIME_FORMATTER.format(date),
    };
  }, [analysis]);

  if (loading) return <PageState loading />;
  if (error || !analysis) return <PageState error={error} />;

  const event = analysis.event;

  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/area-membros/proximos-jogos"
          className="mb-4 inline-flex h-9 items-center gap-2 rounded-full bg-white px-3 text-[13px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-white/[0.05] dark:text-slate-300 dark:ring-white/[0.08]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <header className="rounded-[28px] border border-slate-200 bg-white px-5 py-7 text-center shadow-sm dark:border-white/[0.08] dark:bg-[#0b111d] sm:px-8">
          <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            {event.leagueName || "Competição"} {event.round ? `· ${event.round}` : ""} {kickoff?.date ? `· ${kickoff.date}` : ""}
          </p>

          <div className="mx-auto mt-6 grid max-w-[720px] grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] items-center gap-4">
            <div className="min-w-0 justify-self-end text-center">
              <TeamLogo src={event.homeLogo} name={event.homeTeam} />
              <h1 className="mt-3 truncate text-[18px] font-black sm:text-[20px]">{event.homeShortName || event.homeTeam}</h1>
            </div>
            <div className="text-center">
              <p className="text-[38px] font-black leading-none tracking-[0] text-slate-700 dark:text-slate-100 sm:text-[44px]">
                {event.score?.home !== null && event.score?.away !== null && event.score?.home !== undefined
                  ? `${event.score.home}-${event.score.away}`
                  : kickoff?.time || "--:--"}
              </p>
              <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
                {statusLabel(event.status)}
              </span>
            </div>
            <div className="min-w-0 justify-self-start text-center">
              <TeamLogo src={event.awayLogo} name={event.awayTeam} />
              <h1 className="mt-3 truncate text-[18px] font-black sm:text-[20px]">{event.awayShortName || event.awayTeam}</h1>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            {event.venue ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {event.venue}{event.venueCity ? `, ${event.venueCity}` : ""}
              </span>
            ) : null}
          </div>

        </header>

        <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-white/[0.08]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-[14px] font-black transition",
                activeTab === tab.id
                  ? "border-teal-500 text-slate-950 dark:border-teal-300 dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-5">
          {activeTab === "facts" ? <FactsTab analysis={analysis} /> : null}
          {activeTab === "odds" ? <OddsTab analysis={analysis} /> : null}
          {activeTab === "stats" ? <StatsTab analysis={analysis} /> : null}
          {activeTab === "lineups" ? <LineupsTab analysis={analysis} /> : null}
          {activeTab === "h2h" ? <H2HSummary analysis={analysis} showTable /> : null}
          {activeTab === "standings" ? <StandingsTab analysis={analysis} /> : null}
        </div>

        <p className="mx-auto mt-6 max-w-[760px] text-center text-[12px] leading-5 text-slate-500 dark:text-slate-500">
          As probabilidades e análises são estimativas com base nos dados disponíveis. O Filtto não garante resultados financeiros. Aposte com responsabilidade.
        </p>
      </div>
    </main>
  );
}
