const FINISHED_STATUSES = new Set(["finished", "penalties"]);
const VOID_STATUSES = new Set(["cancelled", "canceled"]);
const POSTPONED_STATUSES = new Set(["postponed", "delayed"]);

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeMarket(market) {
  return String(market || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function settled(status, reason, resolvedScore) {
  return {
    result: status,
    resultReason: reason,
    resolvedAt: new Date().toISOString(),
    resolvedScore,
  };
}

function pending(reason, resolvedScore) {
  return {
    result: "pending",
    resultReason: reason,
    resolvedAt: null,
    resolvedScore,
  };
}

export function resolveOpportunityResult(snapshot, event) {
  const status = String(event?.status || snapshot?.eventStatus || "unknown").toLowerCase();
  const homeScore = toNumber(event?.score?.home ?? event?.homeScore ?? event?.scores?.home);
  const awayScore = toNumber(event?.score?.away ?? event?.awayScore ?? event?.scores?.away);
  const resolvedScore = {
    home: homeScore,
    away: awayScore,
  };

  if (VOID_STATUSES.has(status)) {
    return settled("void", "Jogo cancelado pela fonte oficial.", resolvedScore);
  }

  if (POSTPONED_STATUSES.has(status)) {
    return pending("Jogo adiado. Resultado ainda nao resolvido.", resolvedScore);
  }

  if (!FINISHED_STATUSES.has(status)) {
    return pending("Jogo ainda nao finalizado.", resolvedScore);
  }

  if (homeScore === null || awayScore === null) {
    return pending("Placar final ainda nao esta confiavel.", resolvedScore);
  }

  const totalGoals = homeScore + awayScore;
  const market = normalizeMarket(snapshot?.market);
  let isGreen = null;

  if (market === "over 1.5") isGreen = totalGoals >= 2;
  if (market === "over 2.5") isGreen = totalGoals >= 3;
  if (market === "over 3.5") isGreen = totalGoals >= 4;
  if (market === "under 1.5") isGreen = totalGoals <= 1;
  if (market === "under 2.5") isGreen = totalGoals <= 2;
  if (market === "under 3.5") isGreen = totalGoals <= 3;
  if (market === "casa vence") isGreen = homeScore > awayScore;
  if (market === "empate") isGreen = homeScore === awayScore;
  if (market === "fora vence") isGreen = awayScore > homeScore;
  if (market === "ambas marcam") isGreen = homeScore > 0 && awayScore > 0;
  if (market === "ambas marcam nao") isGreen = homeScore === 0 || awayScore === 0;

  if (isGreen === null) {
    return pending("Mercado sem regra automatica confiavel para resolucao.", resolvedScore);
  }

  return settled(
    isGreen ? "green" : "red",
    `${homeScore} x ${awayScore} no placar final.`,
    resolvedScore
  );
}
