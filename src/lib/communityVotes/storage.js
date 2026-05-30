const STORAGE_KEY = "filtto:pick-rounds:local:v1";

export const VOTE_OPTIONS = {
  home: "Casa",
  draw: "Empate",
  away: "Fora",
};

export const POINTS_PER_CORRECT_PICK = 10;

export const MEDALS = [
  { name: "Sem medalha", min: 0 },
  { name: "Bronze", min: 50 },
  { name: "Prata", min: 150 },
  { name: "Ouro", min: 300 },
  { name: "Diamante", min: 700 },
  { name: "Lenda", min: 1500 },
];

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function emptyStore() {
  return {
    rounds: {},
    updatedAt: null,
  };
}

function readStore() {
  if (!canUseStorage()) return emptyStore();

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...emptyStore(),
      ...(parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}),
      rounds: parsed?.rounds && typeof parsed.rounds === "object" && !Array.isArray(parsed.rounds) ? parsed.rounds : {},
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store) {
  if (!canUseStorage()) return store;
  const nextStore = { ...store, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  return nextStore;
}

function pickGameSnapshot(game) {
  return {
    eventId: String(game.eventId),
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    leagueName: game.leagueName,
    eventDate: game.eventDate,
    status: game.status,
    homeScore: game.homeScore ?? null,
    awayScore: game.awayScore ?? null,
  };
}

export function getPickRoundsStore() {
  return readStore();
}

export function getRound(roundId) {
  return readStore().rounds[String(roundId)] || null;
}

export function saveRoundDraft({ id, date, games, closesAt, opensAt }) {
  if (!id || !Array.isArray(games)) return readStore();

  const store = readStore();
  const previous = store.rounds[String(id)] || {};
  const previousPicks = previous.picks && typeof previous.picks === "object" ? previous.picks : {};

  store.rounds[String(id)] = {
    id: String(id),
    date,
    opensAt: opensAt || previous.opensAt || new Date().toISOString(),
    closesAt: closesAt || previous.closesAt || null,
    games: games.map(pickGameSnapshot),
    picks: previousPicks,
    createdAt: previous.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return writeStore(store);
}

export function saveRoundPick(roundId, game, selection) {
  if (!roundId || !game?.eventId || !VOTE_OPTIONS[selection]) return readStore();

  const store = readStore();
  const round = store.rounds[String(roundId)];
  if (!round) return store;

  round.picks = round.picks && typeof round.picks === "object" ? round.picks : {};
  round.picks[String(game.eventId)] = {
    roundId: String(roundId),
    eventId: String(game.eventId),
    userPick: selection,
    votedAt: new Date().toISOString(),
    lockedAt: round.closesAt || null,
    result: "pending",
    points: 0,
    finalScore: null,
    resolvedAt: null,
    matchDate: game.eventDate || null,
    matchStatusAtVote: game.status || "unknown",
  };
  round.updatedAt = new Date().toISOString();

  return writeStore(store);
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

export function resolveRoundWithGames(roundId, games) {
  if (!roundId || !Array.isArray(games)) return readStore();

  const store = readStore();
  const round = store.rounds[String(roundId)];
  if (!round) return store;

  const byId = new Map(games.map((game) => [String(game.eventId), game]));
  round.games = (round.games || []).map((storedGame) => ({
    ...storedGame,
    ...(byId.has(String(storedGame.eventId)) ? pickGameSnapshot(byId.get(String(storedGame.eventId))) : {}),
  }));

  round.picks = round.picks && typeof round.picks === "object" ? round.picks : {};
  Object.values(round.picks).forEach((pick) => {
    const game = byId.get(String(pick.eventId));
    if (!game) return;

    const actual = getActualResult(game);
    if (!actual) return;

    pick.finalScore = {
      home: game.homeScore ?? null,
      away: game.awayScore ?? null,
    };
    pick.resolvedAt = new Date().toISOString();

    if (actual === "void") {
      pick.result = "void";
      pick.points = 0;
      return;
    }

    pick.actualResult = actual;
    pick.result = pick.userPick === actual ? "correct" : "wrong";
    pick.points = pick.result === "correct" ? POINTS_PER_CORRECT_PICK : 0;
  });

  round.updatedAt = new Date().toISOString();
  return writeStore(store);
}

export function getPreviousRound(currentRoundId) {
  const rounds = Object.values(readStore().rounds || {})
    .filter((round) => round?.id && round.id !== currentRoundId)
    .sort((a, b) => String(b.date || b.id).localeCompare(String(a.date || a.id)));

  return rounds[0] || null;
}

export function summarizeRound(round) {
  const games = Array.isArray(round?.games) ? round.games : [];
  const picks = round?.picks && typeof round.picks === "object" ? round.picks : {};
  const values = Object.values(picks);

  return {
    games: games.length,
    sent: values.length,
    possiblePoints: games.length * POINTS_PER_CORRECT_PICK,
    points: values.reduce((sum, pick) => sum + (Number(pick.points) || 0), 0),
    correct: values.filter((pick) => pick.result === "correct").length,
    wrong: values.filter((pick) => pick.result === "wrong").length,
    void: values.filter((pick) => pick.result === "void").length,
    pending: values.filter((pick) => pick.result === "pending").length,
    missing: Math.max(0, games.length - values.length),
  };
}

export function getLocalUserStats() {
  const rounds = Object.values(readStore().rounds || {});
  const picks = rounds.flatMap((round) => Object.values(round.picks || {}));
  const totalPoints = picks.reduce((sum, pick) => sum + (Number(pick.points) || 0), 0);
  const currentMedal = MEDALS.filter((medal) => totalPoints >= medal.min).at(-1) || MEDALS[0];
  const nextMedal = MEDALS.find((medal) => medal.min > totalPoints) || null;

  return {
    totalPoints,
    roundsPlayed: rounds.filter((round) => Object.keys(round.picks || {}).length > 0).length,
    correctPicks: picks.filter((pick) => pick.result === "correct").length,
    wrongPicks: picks.filter((pick) => pick.result === "wrong").length,
    voidPicks: picks.filter((pick) => pick.result === "void").length,
    currentMedal,
    nextMedal,
    pointsToNextMedal: nextMedal ? nextMedal.min - totalPoints : 0,
    rankPosition: null,
  };
}
