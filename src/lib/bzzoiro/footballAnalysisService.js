import { createBzzoiroClient } from "./client";
import {
  normalizeBzzoiroEvent,
  normalizeFixtureEvent,
  normalizeH2h,
  normalizePrediction,
  normalizeStandings,
  normalizeStats,
} from "./normalizers";

const APP_TIME_ZONE = "America/Sao_Paulo";
const fixturesCache = globalThis.__filttoBzzoiroEventsCache || new Map();
const analysisCache = globalThis.__filttoBzzoiroAnalysisCache || new Map();
const leaguesCache = globalThis.__filttoBzzoiroLeaguesCache || new Map();
const ANALYSIS_CACHE_VERSION = 5;
globalThis.__filttoBzzoiroEventsCache = fixturesCache;
globalThis.__filttoBzzoiroAnalysisCache = analysisCache;
globalThis.__filttoBzzoiroLeaguesCache = leaguesCache;

function addDaysToDateValue(dateValue, days) {
  const date = new Date(`${dateValue}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getUtcWindowForSaoPauloDate(dateValue) {
  const nextDate = addDaysToDateValue(dateValue, 1);

  return {
    dateFrom: `${dateValue}T03:00:00Z`,
    dateTo: `${nextDate}T02:59:59Z`,
  };
}

function addMonthsToDateTime(value, months) {
  if (!value) return undefined;
  const date = new Date(value);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString();
}

function getCache(cache, key, ttlMs) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.createdAt < ttlMs) return cached.value;
  return null;
}

function setCache(cache, key, value) {
  cache.set(key, { value, createdAt: Date.now() });
  return value;
}

function getAnalysisTtlMs(event) {
  if (event?.status === "inprogress") return 60 * 1000;
  if (event?.status === "finished") return 12 * 60 * 60 * 1000;
  return 30 * 60 * 1000;
}

function getEventsTtlMs(searchParams) {
  const now = Date.now();
  const from = searchParams.date_from ? new Date(searchParams.date_from).getTime() : null;
  const to = searchParams.date_to ? new Date(searchParams.date_to).getTime() : null;

  if (from && to && from <= now && now <= to) return 60 * 1000;

  return 30 * 60 * 1000;
}

async function getLeague(leagueId, client) {
  if (!leagueId) return null;

  const cached = getCache(leaguesCache, String(leagueId), 24 * 60 * 60 * 1000);
  if (cached) return cached;

  const league = await client.safeRequest(`/leagues/${leagueId}/`, {
    next: { revalidate: 24 * 60 * 60 },
  });

  return setCache(leaguesCache, String(leagueId), league);
}

async function getLeaguesById(events, client) {
  const leagueIds = [...new Set(events.map((event) => event.league_id).filter(Boolean))];
  const entries = await Promise.all(
    leagueIds.map(async (leagueId) => [leagueId, await getLeague(leagueId, client)])
  );

  return new Map(entries);
}

async function fetchAllEvents(params, client, revalidateSeconds = 30 * 60) {
  const firstPage = await client.request("/events/", {
    searchParams: { ...params, limit: params.limit || 200 },
    next: { revalidate: revalidateSeconds },
  });
  const events = Array.isArray(firstPage?.results) ? [...firstPage.results] : [];
  const count = Number(firstPage?.count || events.length);
  const limit = Number(params.limit || 200);

  for (let offset = limit; offset < count; offset += limit) {
    const page = await client.request("/events/", {
      searchParams: { ...params, limit, offset },
      next: { revalidate: revalidateSeconds },
    });
    events.push(...(Array.isArray(page?.results) ? page.results : []));
  }

  return events;
}

async function fetchAllTeamFixtures(teamId, params, client) {
  if (!teamId) return null;

  const limit = Number(params.limit || 200);
  const requestParams = { ...params, limit };
  delete requestParams.next;

  const firstPage = await client.safeRequest(`/teams/${teamId}/fixtures/`, {
    searchParams: requestParams,
    next: params.next || { revalidate: 60 * 60 },
  });
  const events = Array.isArray(firstPage?.results) ? [...firstPage.results] : [];
  const count = Number(firstPage?.count || events.length);

  for (let offset = limit; offset < count; offset += limit) {
    const page = await client.safeRequest(`/teams/${teamId}/fixtures/`, {
      searchParams: { ...requestParams, offset },
      next: params.next || { revalidate: 60 * 60 },
    });
    events.push(...(Array.isArray(page?.results) ? page.results : []));
  }

  return { ...(firstPage || {}), count: count || events.length, results: events };
}

export async function listFootballEvents({ date, dateFrom, dateTo, leagueId, status, limit, offset } = {}) {
  const client = createBzzoiroClient();
  const window = date ? getUtcWindowForSaoPauloDate(date) : {};
  const searchParams = {
    date_from: dateFrom || window.dateFrom,
    date_to: dateTo || window.dateTo,
    league_id: leagueId,
    status,
    limit: limit || 200,
    offset,
  };
  const cacheKey = JSON.stringify(searchParams);
  const ttlMs = getEventsTtlMs(searchParams);
  const cached = getCache(fixturesCache, cacheKey, ttlMs);
  if (cached) return { ...cached, meta: { ...cached.meta, cached: true } };

  const events = await fetchAllEvents(searchParams, client, Math.max(30, Math.floor(ttlMs / 1000)));
  const leaguesById = await getLeaguesById(events, client);
  const games = events.map((event) => normalizeFixtureEvent(event, leaguesById.get(event.league_id)));
  const result = {
    games,
    events: games,
    meta: {
      cached: false,
      provider: "bzzoiro",
      revalidateSeconds: ttlMs / 1000,
      timezone: APP_TIME_ZONE,
    },
  };

  return setCache(fixturesCache, cacheKey, result);
}

export async function getFootballEvent(eventId) {
  const client = createBzzoiroClient();
  const event = await client.request(`/events/${eventId}/`, {
    next: { revalidate: 60 },
  });
  const [league, homeTeam, awayTeam, venue, homeCoach, awayCoach] = await Promise.all([
    getLeague(event.league_id, client),
    event.home_team_id ? client.safeRequest(`/teams/${event.home_team_id}/`, { next: { revalidate: 24 * 60 * 60 } }) : null,
    event.away_team_id ? client.safeRequest(`/teams/${event.away_team_id}/`, { next: { revalidate: 24 * 60 * 60 } }) : null,
    event.venue_id ? client.safeRequest(`/venues/${event.venue_id}/`, { next: { revalidate: 24 * 60 * 60 } }) : null,
    event.home_coach_id ? client.safeRequest(`/managers/${event.home_coach_id}/`, { next: { revalidate: 24 * 60 * 60 } }) : null,
    event.away_coach_id ? client.safeRequest(`/managers/${event.away_coach_id}/`, { next: { revalidate: 24 * 60 * 60 } }) : null,
  ]);

  return {
    raw: { event, league, homeTeam, awayTeam, venue, homeCoach, awayCoach },
    event: normalizeBzzoiroEvent(event, { league, homeTeam, awayTeam, venue, homeCoach, awayCoach }),
  };
}

export async function getFootballMatchAnalysis(eventId) {
  const cacheKey = `${ANALYSIS_CACHE_VERSION}:${eventId}`;
  const cached = analysisCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < cached.ttlMs) return { ...cached.value, meta: { ...cached.value.meta, cached: true } };

  const client = createBzzoiroClient();
  const detail = await getFootballEvent(eventId);
  const eventRaw = detail.raw.event;
  const formDateFrom = addMonthsToDateTime(eventRaw.event_date, -24);
  const h2hDateFrom = addMonthsToDateTime(eventRaw.event_date, -120);
  const liveRevalidateSeconds = eventRaw.status === "inprogress" ? 60 : 5 * 60;
  const [stats, odds, metadata, lineups, incidents, prediction, standings, homeFixtures, awayFixtures, homeFormFixtures, awayFormFixtures] = await Promise.all([
    client.safeRequest(`/events/${eventId}/stats/`, { next: { revalidate: eventRaw.status === "finished" ? 12 * 60 * 60 : liveRevalidateSeconds } }),
    client.safeRequest(`/events/${eventId}/odds/`, { next: { revalidate: 5 * 60 } }),
    client.safeRequest(`/events/${eventId}/metadata/`, { next: { revalidate: 60 * 60 } }),
    client.safeRequest(`/events/${eventId}/lineups/`, { next: { revalidate: eventRaw.status === "notstarted" ? 15 * 60 : 60 * 60 } }),
    client.safeRequest(`/events/${eventId}/incidents/`, { next: { revalidate: eventRaw.status === "inprogress" ? 60 : 60 * 60 } }),
    client.safeRequest(`/events/${eventId}/prediction/`, { next: { revalidate: 60 * 60 } }),
    eventRaw.league_id ? client.safeRequest(`/leagues/${eventRaw.league_id}/standings/`, {
      searchParams: { season_id: eventRaw.season_id },
      next: { revalidate: 6 * 60 * 60 },
    }) : null,
    fetchAllTeamFixtures(eventRaw.home_team_id, {
      date_from: h2hDateFrom,
      date_to: eventRaw.event_date,
      league_id: eventRaw.league_id,
      status: "finished",
      limit: 200,
      next: { revalidate: 12 * 60 * 60 },
    }, client),
    fetchAllTeamFixtures(eventRaw.away_team_id, {
      date_from: h2hDateFrom,
      date_to: eventRaw.event_date,
      league_id: eventRaw.league_id,
      status: "finished",
      limit: 200,
      next: { revalidate: 12 * 60 * 60 },
    }, client),
    fetchAllTeamFixtures(eventRaw.home_team_id, {
      date_from: formDateFrom,
      date_to: eventRaw.event_date,
      league_id: eventRaw.league_id,
      status: "finished",
      limit: 100,
      next: { revalidate: 60 * 60 },
    }, client),
    fetchAllTeamFixtures(eventRaw.away_team_id, {
      date_from: formDateFrom,
      date_to: eventRaw.event_date,
      league_id: eventRaw.league_id,
      status: "finished",
      limit: 100,
      next: { revalidate: 60 * 60 },
    }, client),
  ]);
  const predictionData = normalizePrediction(prediction, odds, metadata);
  const normalizedStats = normalizeStats(stats);

  const result = {
    event: detail.event,
    probabilities: predictionData.probabilities,
    odds,
    stats: normalizedStats,
    metadata,
    lineups,
    incidents,
    standings: normalizeStandings(standings, eventRaw),
    h2h: normalizeH2h(homeFixtures, awayFixtures, eventRaw, {
      home: homeFormFixtures,
      away: awayFormFixtures,
    }),
    prediction,
    model: predictionData.model,
    recommendations: predictionData.recommendations,
    expectedGoals: predictionData.expectedGoals,
    aiPreview: predictionData.aiPreview,
    raw: {
      event: eventRaw,
      league: detail.raw.league,
      homeTeam: detail.raw.homeTeam,
      awayTeam: detail.raw.awayTeam,
      venue: detail.raw.venue,
      homeCoach: detail.raw.homeCoach,
      awayCoach: detail.raw.awayCoach,
    },
    meta: {
      cached: false,
      provider: "bzzoiro",
      probabilitySource: predictionData.source,
      revalidateSeconds: getAnalysisTtlMs(eventRaw) / 1000,
    },
  };

  analysisCache.set(cacheKey, {
    value: result,
    createdAt: Date.now(),
    ttlMs: getAnalysisTtlMs(eventRaw),
  });

  return result;
}

export async function getFootballOdds(eventId) {
  const client = createBzzoiroClient();
  const odds = await client.request(`/events/${eventId}/odds/`, {
    next: { revalidate: 5 * 60 },
  });

  return { odds, meta: { provider: "bzzoiro", revalidateSeconds: 5 * 60 } };
}

export async function getFootballStats(eventId) {
  const client = createBzzoiroClient();
  const event = await client.request(`/events/${eventId}/`, {
    next: { revalidate: 60 },
  });
  const liveRevalidateSeconds = event.status === "inprogress" ? 60 : 5 * 60;
  const stats = await client.safeRequest(`/events/${eventId}/stats/`, {
    next: { revalidate: event.status === "finished" ? 12 * 60 * 60 : liveRevalidateSeconds },
  });

  return {
    stats: normalizeStats(stats),
    meta: {
      provider: "bzzoiro",
      revalidateSeconds: event.status === "finished" ? 12 * 60 * 60 : liveRevalidateSeconds,
    },
  };
}

export async function getFootballFull(eventId) {
  return getFootballMatchAnalysis(eventId);
}
