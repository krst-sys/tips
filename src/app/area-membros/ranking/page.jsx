"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleHelp,
  Flame,
  ListFilter,
  Medal,
  MoveRight,
  Target,
  Trophy,
  UsersRound,
  XCircle,
} from "lucide-react";

const MIN_USER_FINISHED_PICKS = 10;
const MIN_LEAGUE_FINISHED_PICKS = 20;

const PERIODS = [
  { label: "Hoje", value: "today", factor: 0.12 },
  { label: "7 dias", value: "7d", factor: 0.38 },
  { label: "30 dias", value: "30d", factor: 0.72 },
  { label: "Este mês", value: "month", factor: 0.58 },
  { label: "Geral", value: "all", factor: 1 },
];

const STATUS_FILTERS = [
  { label: "Todos", value: "all" },
  { label: "Finalizados", value: "finished" },
  { label: "Acertos", value: "hit" },
  { label: "Erros", value: "miss" },
  { label: "Pendentes", value: "pending" },
];

const USER_SORTS = [
  { label: "Mais acertos", value: "hits" },
  { label: "Melhor taxa", value: "hitRate" },
  { label: "Consistência", value: "consistency" },
  { label: "Sequência", value: "streak" },
  { label: "Mais palpites", value: "total" },
];

const COMMUNITY_USERS = [
  {
    id: "ana",
    name: "Ana Martins",
    initials: "AM",
    hits: 82,
    misses: 31,
    pending: 9,
    currentStreak: 7,
    bestStreak: 13,
    bestLeague: "Premier League",
    primarySport: "Futebol",
    trend: 3,
    badge: "Mais consistente",
  },
  {
    id: "bruno",
    name: "Bruno Castro",
    initials: "BC",
    hits: 74,
    misses: 24,
    pending: 6,
    currentStreak: 5,
    bestStreak: 10,
    bestLeague: "NBA",
    primarySport: "Basquete",
    trend: 5,
    badge: "Melhor taxa",
  },
  {
    id: "camila",
    name: "Camila Rocha",
    initials: "CR",
    hits: 96,
    misses: 48,
    pending: 13,
    currentStreak: 9,
    bestStreak: 15,
    bestLeague: "Brasileirão",
    primarySport: "Futebol",
    trend: -1,
    badge: "Maior sequência",
  },
  {
    id: "diego",
    name: "Diego Lima",
    initials: "DL",
    hits: 68,
    misses: 36,
    pending: 8,
    currentStreak: 4,
    bestStreak: 9,
    bestLeague: "La Liga",
    primarySport: "Futebol",
    trend: 1,
    badge: "Regular",
  },
  {
    id: "elisa",
    name: "Elisa Nunes",
    initials: "EN",
    hits: 61,
    misses: 27,
    pending: 5,
    currentStreak: 6,
    bestStreak: 11,
    bestLeague: "ATP",
    primarySport: "Tênis",
    trend: 4,
    badge: "Em alta",
  },
  {
    id: "felipe",
    name: "Felipe Torres",
    initials: "FT",
    hits: 89,
    misses: 57,
    pending: 18,
    currentStreak: 2,
    bestStreak: 8,
    bestLeague: "Champions League",
    primarySport: "Futebol",
    trend: -2,
    badge: "Volume alto",
  },
  {
    id: "giovana",
    name: "Giovana Reis",
    initials: "GR",
    hits: 47,
    misses: 18,
    pending: 4,
    currentStreak: 5,
    bestStreak: 9,
    bestLeague: "Libertadores",
    primarySport: "Futebol",
    trend: 2,
    badge: "Boa leitura",
  },
  {
    id: "henrique",
    name: "Henrique Prado",
    initials: "HP",
    hits: 58,
    misses: 41,
    pending: 7,
    currentStreak: 0,
    bestStreak: 6,
    bestLeague: "NFL",
    primarySport: "Futebol americano",
    trend: 0,
    badge: "Estável",
  },
  {
    id: "isabela",
    name: "Isabela Moraes",
    initials: "IM",
    hits: 42,
    misses: 20,
    pending: 3,
    currentStreak: 3,
    bestStreak: 7,
    bestLeague: "Serie A",
    primarySport: "Futebol",
    trend: 1,
    badge: "Eficiente",
  },
  {
    id: "current-user",
    name: "Você",
    initials: "VC",
    hits: 39,
    misses: 21,
    pending: 6,
    currentStreak: 4,
    bestStreak: 8,
    bestLeague: "Premier League",
    primarySport: "Futebol",
    trend: 2,
    badge: "Sua conta",
    isCurrentUser: true,
  },
];

const COMMUNITY_LEAGUES = [
  { id: "premier-league", league: "Premier League", sport: "Futebol", hits: 428, misses: 184, pending: 38 },
  { id: "brasileirao", league: "Brasileirão", sport: "Futebol", hits: 392, misses: 232, pending: 42 },
  { id: "nba", league: "NBA", sport: "Basquete", hits: 318, misses: 129, pending: 31 },
  { id: "la-liga", league: "La Liga", sport: "Futebol", hits: 286, misses: 137, pending: 26 },
  { id: "champions", league: "Champions League", sport: "Futebol", hits: 244, misses: 101, pending: 19 },
  { id: "libertadores", league: "Libertadores", sport: "Futebol", hits: 211, misses: 156, pending: 24 },
  { id: "serie-a", league: "Serie A", sport: "Futebol", hits: 198, misses: 92, pending: 18 },
  { id: "atp", league: "ATP", sport: "Tênis", hits: 174, misses: 74, pending: 14 },
  { id: "nfl", league: "NFL", sport: "Futebol americano", hits: 136, misses: 96, pending: 21 },
  { id: "mls", league: "MLS", sport: "Futebol", hits: 108, misses: 97, pending: 17 },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getPeriodFactor(period) {
  return PERIODS.find((item) => item.value === period)?.factor || 1;
}

function scaleCount(value, factor, minimum = 0) {
  if (value === 0) return 0;
  return Math.max(minimum, Math.round(value * factor));
}

function enrichUser(user, factor) {
  const hits = scaleCount(user.hits, factor, 1);
  const misses = scaleCount(user.misses, factor, 0);
  const pending = scaleCount(user.pending, factor, 0);
  const finished = hits + misses;
  const total = finished + pending;
  const hitRate = finished > 0 ? (hits / finished) * 100 : 0;
  const missRate = finished > 0 ? (misses / finished) * 100 : 0;
  const currentStreak = scaleCount(user.currentStreak, Math.min(1, factor + 0.16), 0);
  const consistency = Math.min(99, Math.round(hitRate * 0.78 + currentStreak * 2.2 + Math.min(finished, 80) * 0.12));

  return {
    ...user,
    hits,
    misses,
    pending,
    finished,
    total,
    hitRate,
    missRate,
    currentStreak,
    consistency,
    eligibleForRate: finished >= MIN_USER_FINISHED_PICKS,
  };
}

function enrichLeague(league, factor) {
  const hits = scaleCount(league.hits, factor, 1);
  const misses = scaleCount(league.misses, factor, 0);
  const pending = scaleCount(league.pending, factor, 0);
  const finished = hits + misses;
  const total = finished + pending;
  const hitRate = finished > 0 ? (hits / finished) * 100 : 0;
  const missRate = finished > 0 ? (misses / finished) * 100 : 0;

  return {
    ...league,
    hits,
    misses,
    pending,
    finished,
    total,
    hitRate,
    missRate,
    eligibleForRate: finished >= MIN_LEAGUE_FINISHED_PICKS,
  };
}

function formatPercent(value) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function getToneClasses(tone) {
  if (tone === "positive") {
    return {
      text: "text-emerald-700 dark:text-emerald-300",
      soft: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
      border: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
      bar: "bg-emerald-600 dark:bg-emerald-400",
    };
  }

  if (tone === "negative") {
    return {
      text: "text-rose-700 dark:text-rose-300",
      soft: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
      border: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300",
      bar: "bg-rose-600 dark:bg-rose-400",
    };
  }

  if (tone === "warning") {
    return {
      text: "text-amber-800 dark:text-amber-300",
      soft: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
      border: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
      bar: "bg-amber-500 dark:bg-amber-300",
    };
  }

  return {
    text: "text-slate-700 dark:text-slate-300",
    soft: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
    border: "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300",
    bar: "bg-slate-500 dark:bg-slate-300",
  };
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={cn(
        "rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900",
        className
      )}
    >
      {children}
    </section>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center rounded-[12px] px-3.5 text-[13px] font-semibold ring-1 transition",
        active
          ? "bg-slate-950 text-white ring-slate-950 dark:bg-white dark:text-slate-950 dark:ring-white"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
      )}
    >
      {children}
    </button>
  );
}

function SelectFilter({ label, value, onChange, options }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-[12px] bg-white px-3 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08]">
      <ListFilter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-[210px] bg-transparent outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryCard({ label, value, detail, tone = "neutral", icon: Icon }) {
  const toneClass = getToneClasses(tone);

  return (
    <article className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-white/[0.08] dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2.5 truncate text-[22px] font-semibold tracking-[-0.035em] text-slate-950 dark:text-white">
            {value}
          </p>
          <p className={cn("mt-1.5 truncate text-[12px] font-medium", toneClass.text)}>{detail}</p>
        </div>
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ring-1", toneClass.soft)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}

function Badge({ children, tone = "neutral" }) {
  const toneClass = getToneClasses(tone);
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold", toneClass.border)}>{children}</span>;
}

function Avatar({ user }) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-[13px] font-bold ring-1",
        user.isCurrentUser
          ? "bg-emerald-600 text-white ring-emerald-600 dark:bg-emerald-400 dark:text-slate-950 dark:ring-emerald-400"
          : "bg-slate-950 text-white ring-slate-950/10 dark:bg-white dark:text-slate-950 dark:ring-white/10"
      )}
    >
      {user.initials}
    </span>
  );
}

function TrendPill({ trend }) {
  const tone = trend > 0 ? "positive" : trend < 0 ? "negative" : "neutral";
  const toneClass = getToneClasses(tone);
  const Icon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : MoveRight;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1", toneClass.soft)}>
      <Icon className="h-3.5 w-3.5" />
      {trend > 0 ? `+${trend}` : trend}
    </span>
  );
}

function TopUsers({ users }) {
  return (
    <Panel className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Destaques
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
            Top 3 usuários
          </h2>
        </div>
        <Badge tone="neutral">Mínimo de {MIN_USER_FINISHED_PICKS} palpites finalizados</Badge>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {users.slice(0, 3).map((user, index) => (
          <article
            key={user.id}
            className={cn(
              "rounded-[18px] border p-4",
              user.isCurrentUser
                ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-400/25 dark:bg-emerald-400/10"
                : "border-slate-200 bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.035]"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar user={user} />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-slate-950 dark:text-white">{user.name}</p>
                  <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{user.badge}</p>
                </div>
              </div>
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-[10px] bg-white px-2 text-[12px] font-bold text-slate-800 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-white dark:ring-white/[0.08]">
                #{index + 1}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <SmallStat label="Acertos" value={user.hits} tone="positive" />
              <SmallStat label="Erros" value={user.misses} tone="negative" />
              <SmallStat label="Taxa" value={formatPercent(user.hitRate)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="positive">{user.currentStreak} em sequência</Badge>
              <Badge tone="neutral">{user.bestLeague}</Badge>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function SmallStat({ label, value, tone = "neutral" }) {
  const toneClass = getToneClasses(tone);

  return (
    <div className="min-w-0 rounded-[14px] border border-slate-200 bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.035]">
      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={cn("mt-1 truncate text-[15px] font-semibold", toneClass.text)}>{value}</p>
    </div>
  );
}

function UserRanking({ users, sort }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/[0.08] lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Ranking de usuários
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
            Acertos, taxa e consistência
          </h2>
        </div>
        <div className="inline-flex w-fit items-start gap-2 rounded-[14px] bg-slate-50 px-3 py-2 text-[12px] leading-5 text-slate-600 ring-1 ring-slate-200 dark:bg-white/[0.035] dark:text-slate-400 dark:ring-white/[0.08]">
          <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Taxa de acerto exibida para usuários com pelo menos {MIN_USER_FINISHED_PICKS} palpites finalizados.
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px]">
          <thead className="bg-slate-50 dark:bg-white/[0.035]">
            <tr className="text-left">
              {["Posição", "Usuário", "Acertos", "Erros", "Finalizados", "Taxa de acerto", "Sequência", "Melhor liga", "Tendência"].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {users.map((user, index) => (
              <UserRow key={user.id} user={user} rank={index + 1} sort={sort} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {users.map((user, index) => (
          <UserCard key={user.id} user={user} rank={index + 1} />
        ))}
      </div>
    </Panel>
  );
}

function UserRow({ user, rank }) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.025]",
        user.isCurrentUser ? "bg-emerald-50/60 dark:bg-emerald-400/[0.07]" : "bg-white dark:bg-slate-900"
      )}
    >
      <td className="whitespace-nowrap px-4 py-4">
        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-[12px] bg-slate-100 px-2 text-[13px] font-bold text-slate-800 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-white dark:ring-white/[0.08]">
          #{rank}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="max-w-[210px] truncate text-[14px] font-semibold text-slate-950 dark:text-white">{user.name}</p>
            <p className="mt-1 max-w-[230px] truncate text-[12px] text-slate-500 dark:text-slate-400">{user.badge}</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-[14px] font-semibold text-emerald-700 dark:text-emerald-300">{user.hits}</td>
      <td className="whitespace-nowrap px-4 py-4 text-[14px] font-semibold text-rose-700 dark:text-rose-300">{user.misses}</td>
      <td className="whitespace-nowrap px-4 py-4 text-[14px] text-slate-600 dark:text-slate-300">{user.finished}</td>
      <td className="whitespace-nowrap px-4 py-4 text-[14px] font-semibold text-slate-950 dark:text-white">
        {user.eligibleForRate ? formatPercent(user.hitRate) : "Aguardando volume"}
      </td>
      <td className="whitespace-nowrap px-4 py-4">
        <Badge tone={user.currentStreak > 0 ? "positive" : "neutral"}>{user.currentStreak} acertos</Badge>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-[14px] text-slate-600 dark:text-slate-300">{user.bestLeague}</td>
      <td className="whitespace-nowrap px-4 py-4">
        <TrendPill trend={user.trend} />
      </td>
    </tr>
  );
}

function UserCard({ user, rank }) {
  return (
    <article
      className={cn(
        "rounded-[16px] border p-4",
        user.isCurrentUser
          ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-400/25 dark:bg-emerald-400/10"
          : "border-slate-200 bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.035]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-[12px] bg-white px-2 text-[13px] font-bold text-slate-800 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-white dark:ring-white/[0.08]">
            #{rank}
          </span>
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-slate-950 dark:text-white">{user.name}</p>
            <p className="mt-1 truncate text-[12px] text-slate-500 dark:text-slate-400">{user.bestLeague}</p>
          </div>
        </div>
        <TrendPill trend={user.trend} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <SmallStat label="Acertos" value={user.hits} tone="positive" />
        <SmallStat label="Erros" value={user.misses} tone="negative" />
        <SmallStat label="Finalizados" value={user.finished} />
        <SmallStat label="Taxa" value={user.eligibleForRate ? formatPercent(user.hitRate) : "Sem volume"} />
      </div>
    </article>
  );
}

function LeagueRanking({ leagues }) {
  const hardest = leagues
    .filter((league) => league.eligibleForRate)
    .slice()
    .sort((a, b) => b.missRate - a.missRate || b.finished - a.finished)[0];

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/[0.08] lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Ranking por ligas
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
              Onde a comunidade mais acerta e erra
            </h2>
          </div>
          <Badge tone="neutral">Mínimo de {MIN_LEAGUE_FINISHED_PICKS} palpites por taxa</Badge>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[860px]">
            <thead className="bg-slate-50 dark:bg-white/[0.035]">
              <tr className="text-left">
                {["Liga", "Esporte", "Total", "Acertos", "Erros", "Taxa de acerto", "Taxa de erro"].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {leagues.map((league) => (
                <LeagueRow key={league.id} league={league} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 lg:hidden">
          {leagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Liga mais difícil
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
              {hardest?.league || "Sem dados suficientes"}
            </h2>
          </div>
        </div>

        {hardest ? (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <SmallStat label="Palpites" value={hardest.finished} />
              <SmallStat label="Taxa de erro" value={formatPercent(hardest.missRate)} tone="negative" />
            </div>
            <p className="mt-4 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
              Essa liga teve a maior proporção de palpites errados no período selecionado, considerando apenas ligas com volume mínimo.
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.08]">
              <div className="h-full rounded-full bg-rose-600 dark:bg-rose-400" style={{ width: `${hardest.missRate}%` }} />
            </div>
          </>
        ) : (
          <p className="mt-4 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
            Ainda não há ligas com volume suficiente para destacar dificuldade no período.
          </p>
        )}
      </Panel>
    </section>
  );
}

function LeagueRow({ league }) {
  return (
    <tr className="bg-white transition-colors hover:bg-slate-50/80 dark:bg-slate-900 dark:hover:bg-white/[0.025]">
      <td className="px-4 py-4">
        <p className="text-[14px] font-semibold text-slate-950 dark:text-white">{league.league}</p>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-[14px] text-slate-600 dark:text-slate-300">{league.sport}</td>
      <td className="whitespace-nowrap px-4 py-4 text-[14px] text-slate-600 dark:text-slate-300">{league.total}</td>
      <td className="whitespace-nowrap px-4 py-4 text-[14px] font-semibold text-emerald-700 dark:text-emerald-300">{league.hits}</td>
      <td className="whitespace-nowrap px-4 py-4 text-[14px] font-semibold text-rose-700 dark:text-rose-300">{league.misses}</td>
      <td className="whitespace-nowrap px-4 py-4 text-[14px] font-semibold text-slate-950 dark:text-white">
        {league.eligibleForRate ? formatPercent(league.hitRate) : "Sem volume"}
      </td>
      <td className="whitespace-nowrap px-4 py-4">
        <Badge tone={league.missRate >= 40 ? "negative" : "neutral"}>
          {league.eligibleForRate ? formatPercent(league.missRate) : "Sem volume"}
        </Badge>
      </td>
    </tr>
  );
}

function LeagueCard({ league }) {
  return (
    <article className="rounded-[16px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-slate-950 dark:text-white">{league.league}</p>
          <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{league.sport}</p>
        </div>
        <Badge tone={league.missRate >= 40 ? "negative" : "positive"}>
          {league.eligibleForRate ? formatPercent(league.hitRate) : "Sem volume"}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <SmallStat label="Total" value={league.total} />
        <SmallStat label="Acertos" value={league.hits} tone="positive" />
        <SmallStat label="Erros" value={league.misses} tone="negative" />
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <Panel className="p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]">
            <Medal className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            Ainda não há palpites finalizados suficientes
          </h2>
          <p className="mt-2 max-w-[620px] text-[14px] leading-6 text-slate-600 dark:text-slate-300">
            O ranking aparece quando a comunidade tiver palpites marcados como acerto ou erro no período selecionado.
          </p>
        </div>
        <Link
          href="/area-membros"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-[13px] font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 sm:w-auto"
        >
          <Target className="h-4 w-4" />
          Ir para Palpites
        </Link>
      </div>
    </Panel>
  );
}

export default function RankingPage() {
  const [period, setPeriod] = useState("30d");
  const [scope, setScope] = useState("all");
  const [status, setStatus] = useState("all");
  const [userSort, setUserSort] = useState("hits");

  const scopeOptions = useMemo(() => {
    const sports = [...new Set(COMMUNITY_LEAGUES.map((item) => item.sport))].map((sport) => ({
      label: sport,
      value: `sport:${sport}`,
    }));
    const leagues = COMMUNITY_LEAGUES.map((league) => ({
      label: league.league,
      value: `league:${league.league}`,
    }));

    return [{ label: "Todos esportes e ligas", value: "all" }, ...sports, ...leagues];
  }, []);

  const factor = getPeriodFactor(period);

  const leagues = useMemo(() => {
    return COMMUNITY_LEAGUES.map((league) => enrichLeague(league, factor))
      .filter((league) => {
        if (scope === "all") return true;
        if (scope.startsWith("sport:")) return league.sport === scope.replace("sport:", "");
        if (scope.startsWith("league:")) return league.league === scope.replace("league:", "");
        return true;
      })
      .filter((league) => {
        if (status === "hit") return league.hits > 0;
        if (status === "miss") return league.misses > 0;
        if (status === "pending") return league.pending > 0;
        if (status === "finished") return league.finished > 0;
        return true;
      })
      .sort((a, b) => b.hits - a.hits || b.hitRate - a.hitRate);
  }, [factor, scope, status]);

  const users = useMemo(() => {
    const filteredScope = scope === "all" ? null : scope.replace(/^(sport|league):/, "");

    return COMMUNITY_USERS.map((user) => enrichUser(user, factor))
      .filter((user) => {
        if (!filteredScope) return true;
        return user.primarySport === filteredScope || user.bestLeague === filteredScope;
      })
      .filter((user) => {
        if (status === "hit") return user.hits > 0;
        if (status === "miss") return user.misses > 0;
        if (status === "pending") return user.pending > 0;
        if (status === "finished") return user.finished > 0;
        return true;
      })
      .sort((a, b) => {
        if (userSort === "hitRate") {
          if (a.eligibleForRate !== b.eligibleForRate) return a.eligibleForRate ? -1 : 1;
          return b.hitRate - a.hitRate || b.finished - a.finished;
        }
        if (userSort === "consistency") return b.consistency - a.consistency || b.hits - a.hits;
        if (userSort === "streak") return b.currentStreak - a.currentStreak || b.hits - a.hits;
        if (userSort === "total") return b.total - a.total || b.hits - a.hits;
        return b.hits - a.hits || b.hitRate - a.hitRate;
      });
  }, [factor, scope, status, userSort]);

  const summary = useMemo(() => {
    const total = leagues.reduce((sum, league) => sum + league.total, 0);
    const hits = leagues.reduce((sum, league) => sum + league.hits, 0);
    const misses = leagues.reduce((sum, league) => sum + league.misses, 0);
    const finished = hits + misses;
    const hitRate = finished > 0 ? (hits / finished) * 100 : 0;
    const eligibleLeagues = leagues.filter((league) => league.eligibleForRate);
    const bestHitLeague = eligibleLeagues.slice().sort((a, b) => b.hitRate - a.hitRate || b.finished - a.finished)[0];
    const worstLeague = eligibleLeagues.slice().sort((a, b) => b.missRate - a.missRate || b.finished - a.finished)[0];

    return { total, hits, misses, finished, hitRate, bestHitLeague, worstLeague };
  }, [leagues]);

  const hasData = summary.finished > 0 && users.length > 0 && leagues.length > 0;

  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6 px-5 py-6 md:px-8">
        <header className="rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                Comunidade de palpites
              </p>
              <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                Ranking
              </h1>
              <p className="mt-2 max-w-[760px] text-[14px] leading-6 text-slate-600 dark:text-slate-300">
                Acompanhe os usuários e ligas com melhor desempenho nos palpites da comunidade.
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex w-fit max-w-full flex-wrap gap-1 rounded-[13px] border border-slate-200 bg-slate-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
                {PERIODS.map((option) => (
                  <FilterButton key={option.value} active={period === option.value} onClick={() => setPeriod(option.value)}>
                    {option.label}
                  </FilterButton>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <SelectFilter label="Filtrar por esporte ou liga" value={scope} onChange={setScope} options={scopeOptions} />
                <SelectFilter label="Filtrar por status" value={status} onChange={setStatus} options={STATUS_FILTERS} />
                <SelectFilter label="Ordenar usuários" value={userSort} onChange={setUserSort} options={USER_SORTS} />
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <SummaryCard label="Total de palpites" value={summary.total.toLocaleString("pt-BR")} detail="Inclui pendentes" icon={BarChart3} />
          <SummaryCard label="Palpites acertados" value={summary.hits.toLocaleString("pt-BR")} detail="Marcados como acerto" tone="positive" icon={CheckCircle2} />
          <SummaryCard label="Palpites errados" value={summary.misses.toLocaleString("pt-BR")} detail="Marcados como erro" tone="negative" icon={XCircle} />
          <SummaryCard label="Taxa média" value={formatPercent(summary.hitRate)} detail="Só finalizados" tone="positive" icon={Target} />
          <SummaryCard label="Melhor liga" value={summary.bestHitLeague?.league || "Sem volume"} detail={summary.bestHitLeague ? formatPercent(summary.bestHitLeague.hitRate) : "Aguardando dados"} tone="positive" icon={Trophy} />
          <SummaryCard label="Maior erro" value={summary.worstLeague?.league || "Sem volume"} detail={summary.worstLeague ? formatPercent(summary.worstLeague.missRate) : "Aguardando dados"} tone="negative" icon={AlertTriangle} />
        </section>

        {!hasData ? <EmptyState /> : null}

        <TopUsers users={users} />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <UserRanking users={users} sort={userSort} />

          <div className="grid gap-5">
            <Panel className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                  <Flame className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Consistência
                  </p>
                  <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                    Sequência atual conta contexto
                  </h2>
                  <p className="mt-2 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                    A sequência mostra acertos consecutivos recentes. Ela ajuda a destacar consistência sem ignorar volume de palpites finalizados.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]">
                  <CircleHelp className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Regras
                  </p>
                  <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                    Como calculamos
                  </h2>
                  <p className="mt-2 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
                    Ranking calculado apenas com palpites finalizados no período selecionado. Palpites pendentes não entram na taxa de acerto.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Comunidade
                  </p>
                  <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                    Palpites ativos
                  </h2>
                </div>
                <UsersRound className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <SmallStat label="Pendentes" value={leagues.reduce((sum, league) => sum + league.pending, 0)} />
                <SmallStat label="Finalizados" value={summary.finished} />
              </div>
            </Panel>
          </div>
        </section>

        <LeagueRanking leagues={leagues} />
      </div>
    </main>
  );
}
