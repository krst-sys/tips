export const POPULARITY_THRESHOLD = 70;
export const POPULAR_FALLBACK_LIMIT = 20;
export const POPULAR_FALLBACK_MINIMUM = 10;

export const LEAGUE_PRIORITY = {
  1: 100,
  2: 100,
  3: 95,
  9: 95,
  11: 85,
  13: 95,
  39: 95,
  61: 85,
  71: 95,
  72: 80,
  73: 78,
  78: 88,
  88: 72,
  94: 75,
  135: 90,
  140: 92,
  203: 70,
};

export const COUNTRY_PRIORITY = {
  Argentina: 35,
  Brazil: 50,
  England: 45,
  Europe: 42,
  France: 41,
  Germany: 42,
  Italy: 43,
  Netherlands: 30,
  Portugal: 35,
  Spain: 44,
  "South America": 40,
  World: 45,
};

const BIG_TEAM_PRIORITY = {};

const INTERNATIONAL_KEYWORDS = [
  "afc",
  "caf",
  "champions league",
  "concacaf",
  "conmebol",
  "copa america",
  "europa league",
  "euro",
  "libertadores",
  "sudamericana",
  "uefa",
  "world",
];

const FIRST_DIVISION_KEYWORDS = [
  "1. liga",
  "a-league",
  "allsvenskan",
  "bundesliga",
  "championship",
  "division 1",
  "eredivisie",
  "first league",
  "j1 league",
  "la liga",
  "league one",
  "liga i",
  "liga mx",
  "ligue 1",
  "major league soccer",
  "mls",
  "premier league",
  "primera division",
  "primeira liga",
  "pro league",
  "serie a",
  "super league",
  "super liga",
  "superliga",
  "super lig",
];

const LOW_RELEVANCE_KEYWORDS = [
  "amateur",
  "division 2",
  "division 3",
  "division 4",
  "friendlies clubs",
  "liga 3",
  "national 2",
  "national 3",
  "premier league 2",
  "reserve",
  "reserves",
  "segunda",
  "serie c",
  "serie d",
  "u17",
  "u18",
  "u19",
  "u20",
  "u21",
  "u23",
  "women",
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasAnyKeyword(value, keywords) {
  const normalized = normalizeText(value);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function getKickoffTimeBonus(game) {
  if (!game?.date && !game?.timestamp) return 0;

  const date = game.date ? new Date(game.date) : new Date((game.timestamp || 0) * 1000);
  const hour = date.getHours();

  if (hour >= 12 && hour <= 23) return 4;
  if (hour >= 8 && hour < 12) return 2;

  return 0;
}

function getTeamPriority(game) {
  const home = BIG_TEAM_PRIORITY[normalizeText(game?.homeTeam)];
  const away = BIG_TEAM_PRIORITY[normalizeText(game?.awayTeam)];

  return Math.max(home || 0, away || 0);
}

export function getGamePopularityScore(game) {
  const leagueName = game?.leagueName || "";
  const country = game?.country || "";
  const leaguePriority = LEAGUE_PRIORITY[Number(game?.leagueId)] || 0;
  const countryPriority = COUNTRY_PRIORITY[country] || 0;
  const isInternational =
    COUNTRY_PRIORITY[country] >= 40 &&
    ["World", "South America"].includes(country);
  const hasInternationalName = hasAnyKeyword(leagueName, INTERNATIONAL_KEYWORDS);
  const isFirstDivision = hasAnyKeyword(leagueName, FIRST_DIVISION_KEYWORDS);
  const isLowRelevance = hasAnyKeyword(leagueName, LOW_RELEVANCE_KEYWORDS);

  let score = leaguePriority || Math.round(countryPriority * 0.9);

  if (leaguePriority) {
    score += Math.round(countryPriority * 0.18);
  }

  if (isInternational || hasInternationalName) score += 18;
  if (isFirstDivision) score += 12;
  if (isLowRelevance) score -= 35;

  score += getTeamPriority(game);
  score += getKickoffTimeBonus(game);

  return Math.max(0, Math.min(120, score));
}

export function filterPopularGames(games) {
  const scoredGames = games
    .map((game) => ({ game, score: getGamePopularityScore(game) }))
    .sort((a, b) => b.score - a.score || (a.game.timestamp || 0) - (b.game.timestamp || 0));

  const popularGames = scoredGames
    .filter((item) => item.score >= POPULARITY_THRESHOLD)
    .map((item) => item.game);

  if (popularGames.length >= POPULAR_FALLBACK_MINIMUM || games.length === 0) {
    return popularGames;
  }

  return scoredGames.slice(0, POPULAR_FALLBACK_LIMIT).map((item) => item.game);
}

export function sortGames(games, sort) {
  return games.slice().sort((a, b) => {
    if (sort === "time") return (a.timestamp || 0) - (b.timestamp || 0);

    if (sort === "country") {
      return (
        a.country.localeCompare(b.country, "pt-BR") ||
        a.leagueName.localeCompare(b.leagueName, "pt-BR") ||
        (a.timestamp || 0) - (b.timestamp || 0)
      );
    }

    if (sort === "league") {
      return (
        a.leagueName.localeCompare(b.leagueName, "pt-BR") ||
        (a.timestamp || 0) - (b.timestamp || 0)
      );
    }

    return (
      getGamePopularityScore(b) - getGamePopularityScore(a) ||
      (a.timestamp || 0) - (b.timestamp || 0)
    );
  });
}

export function groupGamesByLeague(games, sort) {
  const groups = new Map();

  sortGames(games, sort).forEach((game) => {
    const key = `${game.leagueId || game.leagueName}-${game.country}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        leagueName: game.leagueName,
        leagueLogo: game.leagueLogo,
        country: game.country,
        games: [],
        score: 0,
        firstTimestamp: game.timestamp || 0,
      });
    }

    const group = groups.get(key);
    group.games.push(game);
    group.score = Math.max(group.score, getGamePopularityScore(game));
    group.firstTimestamp = Math.min(group.firstTimestamp || game.timestamp || 0, game.timestamp || 0);
  });

  return [...groups.values()].sort((a, b) => {
    if (sort === "time") return a.firstTimestamp - b.firstTimestamp;
    if (sort === "country") {
      return (
        a.country.localeCompare(b.country, "pt-BR") ||
        b.score - a.score ||
        a.leagueName.localeCompare(b.leagueName, "pt-BR")
      );
    }
    if (sort === "league") return a.leagueName.localeCompare(b.leagueName, "pt-BR");

    return b.score - a.score || a.leagueName.localeCompare(b.leagueName, "pt-BR");
  });
}
