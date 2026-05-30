const MARKET_LABELS = {
  home: "Casa vence",
  draw: "Empate",
  away: "Fora vence",
  btts_yes: "Ambas marcam",
  btts_no: "Ambas marcam nao",
  over_15: "Over 1.5",
  over_25: "Over 2.5",
  over_35: "Over 3.5",
  under_15: "Under 1.5",
  under_25: "Under 2.5",
  under_35: "Under 3.5",
};

const STATUS_LABELS = {
  scheduled: "Agendado",
  upcoming: "Agendado",
  live: "Ao vivo",
  finished: "Encerrado",
  postponed: "Adiado",
  cancelled: "Cancelado",
  penalties: "Penaltis",
  unknown: "Status indefinido",
};

export const FILTTO_SCORE_RANGES = [
  { min: 90, label: "Destaque", tone: "strong" },
  { min: 75, label: "Forte", tone: "strong" },
  { min: 60, label: "Boa oportunidade", tone: "good" },
  { min: 40, label: "Atencao", tone: "attention" },
  { min: 0, label: "Evitar", tone: "risk" },
];

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function normalizeProbability(value) {
  const number = toNumber(value);
  if (number === null) return null;
  return number <= 1 ? clamp(number * 100) : clamp(number);
}

function normalizeOdd(value) {
  const number = toNumber(value);
  if (number === null || number <= 1) return null;
  return number;
}

function getMarketMeta(key) {
  if (key === "home" || key === "draw" || key === "away") {
    return { marketType: "result", filterGroup: "resultado" };
  }
  if (key === "btts_yes" || key === "btts_no") {
    return { marketType: "btts", filterGroup: "ambas_marcam" };
  }
  if (key?.startsWith("over_") || key?.startsWith("under_")) {
    return { marketType: "over_under", filterGroup: "gols" };
  }
  return { marketType: "unknown", filterGroup: "unknown" };
}

function getRange(score) {
  if (score === null || score === undefined) {
    return { label: "Dados insuficientes", tone: "neutral" };
  }

  return FILTTO_SCORE_RANGES.find((range) => score >= range.min) || FILTTO_SCORE_RANGES.at(-1);
}

export function getStatusLabel(status) {
  return STATUS_LABELS[String(status || "").toLowerCase()] || STATUS_LABELS.unknown;
}

export function formatOdd(value) {
  const odd = normalizeOdd(value);
  return odd ? odd.toFixed(2).replace(".", ",") : "Odds ainda nao disponiveis";
}

export function formatProbability(value) {
  const probability = normalizeProbability(value);
  return probability === null ? "Dados insuficientes" : `${Math.round(probability)}%`;
}

export function getScoreMeta(score) {
  const range = getRange(score);
  return {
    label: range.label,
    tone: range.tone,
    score: score === null || score === undefined ? null : Math.round(clamp(score)),
  };
}

function confidenceFromProbability(probability) {
  if (probability === null) return null;
  if (probability >= 72) return 86;
  if (probability >= 62) return 74;
  if (probability >= 54) return 62;
  if (probability >= 45) return 48;
  return 34;
}

function scoreFromEdge(probability, odd) {
  if (probability === null || odd === null) return null;
  const implied = 100 / odd;
  const edge = probability - implied;
  return clamp(50 + edge * 3.6);
}

function formSignal(analysis) {
  const homeRecent = analysis?.h2h?.homeRecent || [];
  const awayRecent = analysis?.h2h?.awayRecent || [];
  if (!homeRecent.length && !awayRecent.length) return null;

  const scoreTeam = (matches, teamId) => {
    if (!matches.length) return 50;
    const points = matches.slice(0, 5).reduce((sum, match) => {
      const own = match.homeTeamId === teamId ? match.homeScore : match.awayScore;
      const against = match.homeTeamId === teamId ? match.awayScore : match.homeScore;
      if (own === null || own === undefined || against === null || against === undefined) return sum + 1;
      if (own > against) return sum + 3;
      if (own === against) return sum + 1;
      return sum;
    }, 0);
    return clamp((points / (matches.slice(0, 5).length * 3)) * 100);
  };

  const home = scoreTeam(homeRecent, analysis?.event?.homeTeamId);
  const away = scoreTeam(awayRecent, analysis?.event?.awayTeamId);
  return clamp((home + (100 - away)) / 2);
}

function statsSignal(analysis) {
  const rows = analysis?.stats?.comparison || [];
  if (!rows.length) return null;

  const usable = rows.filter((row) => toNumber(row.home) !== null || toNumber(row.away) !== null);
  if (!usable.length) return null;

  const weighted = usable.reduce((sum, row) => {
    const home = toNumber(row.home) ?? 0;
    const away = toNumber(row.away) ?? 0;
    const total = Math.abs(home) + Math.abs(away);
    if (!total) return sum + 50;
    return sum + clamp((home / total) * 100);
  }, 0);

  return weighted / usable.length;
}

function statusSignal(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "live") return 60;
  if (normalized === "scheduled" || normalized === "upcoming") return 58;
  if (normalized === "finished") return 35;
  if (normalized === "postponed" || normalized === "cancelled") return 15;
  return null;
}

export function calculateFilttoScore({
  probability,
  odd,
  confidence,
  analysis,
  status,
} = {}) {
  const probabilityScore = normalizeProbability(probability);
  const oddValue = normalizeOdd(odd);
  const confidenceScore = normalizeProbability(confidence) ?? confidenceFromProbability(probabilityScore);
  const edgeScore = scoreFromEdge(probabilityScore, oddValue);
  const recentForm = formSignal(analysis);
  const stats = statsSignal(analysis);
  const eventStatus = statusSignal(status || analysis?.event?.status);

  const parts = [
    { value: probabilityScore, weight: 0.28 },
    { value: edgeScore, weight: 0.26 },
    { value: confidenceScore, weight: 0.18 },
    { value: recentForm, weight: 0.12 },
    { value: stats, weight: 0.1 },
    { value: eventStatus, weight: 0.06 },
  ].filter((part) => part.value !== null && part.value !== undefined && Number.isFinite(part.value));

  if (parts.length < 2 && probabilityScore === null && edgeScore === null) {
    return {
      score: null,
      status: "Dados insuficientes",
      tone: "neutral",
      summary: "Dados insuficientes para uma leitura confiavel agora.",
      inputs: { probability: probabilityScore, odd: oddValue, edge: null },
    };
  }

  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0) || 1;
  let rawScore = parts.reduce((sum, part) => sum + part.value * part.weight, 0) / totalWeight;

  if (oddValue && (oddValue < 1.25 || oddValue > 5.5)) rawScore -= 8;
  if (String(status || analysis?.event?.status || "").toLowerCase() === "finished") rawScore -= 18;

  const score = Math.round(clamp(rawScore));
  const meta = getScoreMeta(score);
  const edge = probabilityScore !== null && oddValue ? probabilityScore - 100 / oddValue : null;

  return {
    score,
    status: meta.label,
    tone: meta.tone,
    summary:
      score >= 75
        ? "Boa oportunidade baseada nos dados disponiveis, sem garantia de resultado."
        : score >= 60
          ? "Leitura positiva, mas ainda pede validacao antes da entrada."
          : score >= 40
            ? "Cenario de atencao. Confira odds, contexto e risco."
            : "Risco alto ou dados fracos para entrada agora.",
    inputs: { probability: probabilityScore, odd: oddValue, edge },
  };
}

function pickBest(items) {
  return items
    .filter((item) => item && normalizeProbability(item.probability) !== null && normalizeOdd(item.odd) !== null)
    .sort((a, b) => normalizeProbability(b.probability) - normalizeProbability(a.probability))[0] || null;
}

export function getMarketCandidates(analysis) {
  const probabilities = analysis?.probabilities || {};
  const odds = analysis?.odds?.odds || {};
  const fulltime = probabilities.fulltimeWinner || [];
  const btts = probabilities.btts || [];
  const overUnder = probabilities.overUnder || {};

  const candidates = [
    ...fulltime.map((item) => ({
      key: item.side === "home" ? "home" : item.side === "draw" ? "draw" : "away",
      market: MARKET_LABELS[item.side === "home" ? "home" : item.side === "draw" ? "draw" : "away"],
      label: item.label,
      probability: item.value,
      odd: item.side === "home" ? odds.home_win : item.side === "draw" ? odds.draw : odds.away_win,
      ...getMarketMeta(item.side === "home" ? "home" : item.side === "draw" ? "draw" : "away"),
    })),
    ...btts
      .filter((item) => item.side === "yes" || item.side === "no")
      .map((item) => ({
        key: item.side === "yes" ? "btts_yes" : "btts_no",
        market: item.side === "yes" ? MARKET_LABELS.btts_yes : MARKET_LABELS.btts_no,
        label: item.label,
        probability: item.value,
        odd: item.side === "yes" ? odds.btts_yes : odds.btts_no,
        ...getMarketMeta(item.side === "yes" ? "btts_yes" : "btts_no"),
      })),
    ...["1.5", "2.5", "3.5"].flatMap((line) => {
      const normalized = line.replace(".", "");
      return (overUnder[line] || []).map((item) => ({
        key: `${item.side}_${normalized}`,
        market: MARKET_LABELS[`${item.side}_${normalized}`],
        label: item.label,
        probability: item.value,
        odd: item.side === "over" ? odds[`over_${normalized}_goals`] : odds[`under_${normalized}_goals`],
        ...getMarketMeta(`${item.side}_${normalized}`),
      }));
    }),
  ].filter((item) => item.market && normalizeProbability(item.probability) !== null && normalizeOdd(item.odd) !== null);

  return candidates;
}

export function getSuggestedMarket(analysis) {
  return pickBest(getMarketCandidates(analysis));
}

function pickBestByGroup(analysis) {
  const candidates = getMarketCandidates(analysis);
  const groups = ["resultado", "ambas_marcam", "gols"];

  return groups
    .map((group) => pickBest(candidates.filter((item) => item.filterGroup === group)))
    .filter(Boolean)
    .sort((a, b) => normalizeProbability(b.probability) - normalizeProbability(a.probability));
}

function buildOpportunityWithMarket(analysis, suggested) {
  const event = analysis?.event;
  if (!event || !suggested) return null;

  const score = calculateFilttoScore({
    probability: suggested.probability,
    odd: suggested.odd,
    confidence: analysis?.model?.confidence,
    analysis,
    status: event.status,
  });

  return {
    id: `${event.id}:${suggested.key}`,
    eventId: event.id,
    homeTeam: event.homeShortName || event.homeTeam || "Mandante",
    awayTeam: event.awayShortName || event.awayTeam || "Visitante",
    homeTeamId: event.homeTeamId || null,
    awayTeamId: event.awayTeamId || null,
    homeLogo: event.homeLogo || null,
    awayLogo: event.awayLogo || null,
    leagueName: event.leagueName || "Liga nao informada",
    leagueCountry: event.country || event.venueCountry || null,
    eventDate: event.eventDate || null,
    status: event.status || "unknown",
    homeScore: event.score?.home ?? null,
    awayScore: event.score?.away ?? null,
    market: suggested.market,
    marketLabel: suggested.market,
    marketKey: suggested.key,
    marketType: suggested.marketType,
    filterGroup: suggested.filterGroup,
    odd: suggested.odd,
    probability: suggested.probability,
    confidence: analysis?.model?.confidence ?? suggested.probability ?? null,
    score,
    analysisAvailable: true,
  };
}

export function buildOpportunityFromAnalysis(analysis) {
  const suggested = getSuggestedMarket(analysis);
  return buildOpportunityWithMarket(analysis, suggested);
}

export function buildOpportunitiesFromAnalysis(analysis) {
  return pickBestByGroup(analysis)
    .map((suggested) => buildOpportunityWithMarket(analysis, suggested))
    .filter(Boolean);
}
