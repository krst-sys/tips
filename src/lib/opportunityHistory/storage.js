import { resolveOpportunityResult } from "./resultResolver";
import { fetchUpcomingGames } from "@/lib/fetchUpcomingGames";
import { buildOpportunitiesFromAnalysis } from "@/lib/filttoScore";

export const OPPORTUNITY_HISTORY_STORAGE = "filtto:opportunity-history:v1";
export const OPPORTUNITY_HISTORY_STORAGE_KIND = "local-browser";
const APP_TIME_ZONE = "America/Sao_Paulo";
const YESTERDAY_IMPORT_LIMIT = 24;

function canUseStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function toNumberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function safeText(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function readRawHistory() {
  if (!canUseStorage()) return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(OPPORTUNITY_HISTORY_STORAGE) || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeRawHistory(records) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(OPPORTUNITY_HISTORY_STORAGE, JSON.stringify(records));
}

function getDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function getSaoPauloDateValue(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: APP_TIME_ZONE,
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = new Date(`${values.year}-${values.month}-${values.day}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function buildOpportunityKey(opportunity, registeredAt) {
  return [
    safeText(opportunity?.eventId || opportunity?.id, "evento"),
    safeText(opportunity?.market, "mercado"),
    getDateKey(registeredAt),
  ]
    .map((part) => String(part).toLowerCase().replace(/\s+/g, "-"))
    .join(":");
}

export function createOpportunitySnapshot(opportunity, registeredAt = new Date().toISOString()) {
  const score = opportunity?.score || {};
  const key = buildOpportunityKey(opportunity, registeredAt);

  return {
    id: key,
    uniqueKey: key,
    eventId: safeText(opportunity?.eventId || opportunity?.id),
    eventDate: opportunity?.eventDate || null,
    registeredAt,
    leagueName: safeText(opportunity?.leagueName, "Liga nao informada"),
    leagueCountry: safeText(opportunity?.leagueCountry || opportunity?.country),
    homeTeam: safeText(opportunity?.homeTeam, "Mandante"),
    awayTeam: safeText(opportunity?.awayTeam, "Visitante"),
    homeTeamId: safeText(opportunity?.homeTeamId),
    awayTeamId: safeText(opportunity?.awayTeamId),
    homeLogo: opportunity?.homeLogo || null,
    awayLogo: opportunity?.awayLogo || null,
    market: safeText(opportunity?.market, "Dados insuficientes para analise"),
    odd: toNumberOrNull(opportunity?.odd),
    probability: toNumberOrNull(opportunity?.probability),
    confidence: toNumberOrNull(opportunity?.confidence),
    filttoScore: toNumberOrNull(score?.score),
    eventStatus: safeText(opportunity?.status, "unknown"),
    scoreAtRegistration: {
      home: toNumberOrNull(opportunity?.homeScore),
      away: toNumberOrNull(opportunity?.awayScore),
    },
    result: "pending",
    resultReason: null,
    resolvedAt: null,
    resolvedScore: null,
    route: opportunity?.eventId || opportunity?.id ? `/area-membros/proximos-jogos/${encodeURIComponent(opportunity.eventId || opportunity.id)}` : null,
    storageKind: OPPORTUNITY_HISTORY_STORAGE_KIND,
    updatedAt: registeredAt,
  };
}

export function listOpportunityHistory() {
  return readRawHistory().sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
}

export function saveOpportunitySnapshots(opportunities = []) {
  if (!Array.isArray(opportunities) || !opportunities.length || !canUseStorage()) {
    return listOpportunityHistory();
  }

  const current = readRawHistory();
  const byKey = new Map(current.map((item) => [item.uniqueKey || item.id, item]));
  const registeredAt = new Date().toISOString();

  opportunities.forEach((opportunity) => {
    const snapshot = createOpportunitySnapshot(opportunity, registeredAt);
    const existing = byKey.get(snapshot.uniqueKey);

    if (!existing) {
      byKey.set(snapshot.uniqueKey, snapshot);
      return;
    }

    byKey.set(snapshot.uniqueKey, {
      ...existing,
      eventStatus: snapshot.eventStatus,
      scoreAtRegistration: existing.scoreAtRegistration || snapshot.scoreAtRegistration,
      homeLogo: existing.homeLogo || snapshot.homeLogo,
      awayLogo: existing.awayLogo || snapshot.awayLogo,
      updatedAt: registeredAt,
    });
  });

  const records = [...byKey.values()].sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
  writeRawHistory(records);
  return records;
}

async function fetchEvent(eventId) {
  const response = await fetch(`/api/football/events/${encodeURIComponent(eventId)}`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return null;
  return payload?.event || null;
}

async function fetchFullAnalysis(eventId) {
  const response = await fetch(`/api/football/events/${encodeURIComponent(eventId)}/full`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return null;
  return payload?.analysis || null;
}

export async function importYesterdayOpportunityHistory() {
  if (!canUseStorage()) return listOpportunityHistory();

  const yesterday = getSaoPauloDateValue(-1);
  const importedAt = new Date().toISOString();
  const current = readRawHistory();
  const byKey = new Map(current.map((item) => [item.uniqueKey || item.id, item]));

  try {
    const result = await fetchUpcomingGames(yesterday, { limit: 80 });
    const games = (result.games || []).slice(0, YESTERDAY_IMPORT_LIMIT);
    const analyses = await Promise.all(games.map((game) => fetchFullAnalysis(game.id)));

    analyses
      .flatMap((analysis) => buildOpportunitiesFromAnalysis(analysis).map((opportunity) => ({ analysis, opportunity })))
      .forEach(({ analysis, opportunity }) => {
        const snapshot = createOpportunitySnapshot(opportunity, importedAt);
        const eventDateKey = getDateKey(opportunity.eventDate || yesterday);
        const importedKey = [
          safeText(opportunity?.eventId || opportunity?.id, "evento"),
          safeText(opportunity?.market, "mercado"),
          eventDateKey,
        ]
          .map((part) => String(part).toLowerCase().replace(/\s+/g, "-"))
          .join(":");
        const resolved = resolveOpportunityResult(snapshot, analysis?.event);

        byKey.set(importedKey, {
          ...snapshot,
          id: importedKey,
          uniqueKey: importedKey,
          source: "yesterday-import",
          registeredAt: importedAt,
          importedAt,
          result: resolved.result,
          resultReason: resolved.resultReason,
          resolvedAt: resolved.resolvedAt,
          resolvedScore: resolved.resolvedScore,
          updatedAt: importedAt,
        });
      });

    const records = [...byKey.values()].sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
    writeRawHistory(records);
    return listOpportunityHistory();
  } catch {
    return listOpportunityHistory();
  }
}

export async function updateOpportunityHistoryResults({ limit = 50 } = {}) {
  if (!canUseStorage()) return listOpportunityHistory();

  const records = readRawHistory();
  const pending = records
    .filter((record) => record?.eventId && record.result === "pending")
    .slice(0, limit);

  if (!pending.length) return listOpportunityHistory();

  const resolvedByKey = new Map();

  await Promise.all(
    pending.map(async (record) => {
      try {
        const event = await fetchEvent(record.eventId);
        if (!event) return;
        const resolved = resolveOpportunityResult(record, event);
        resolvedByKey.set(record.uniqueKey || record.id, {
          ...record,
          eventStatus: event.status || record.eventStatus,
          result: resolved.result,
          resultReason: resolved.resultReason,
          resolvedAt: resolved.resolvedAt,
          resolvedScore: resolved.resolvedScore,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // Keep the snapshot pending if the internal API is temporarily unavailable.
      }
    })
  );

  if (!resolvedByKey.size) return listOpportunityHistory();

  const merged = records.map((record) => resolvedByKey.get(record.uniqueKey || record.id) || record);
  writeRawHistory(merged);
  return listOpportunityHistory();
}
