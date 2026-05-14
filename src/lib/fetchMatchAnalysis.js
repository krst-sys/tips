export async function fetchMatchAnalysis(eventId) {
  const response = await fetch(`/api/football/events/${encodeURIComponent(eventId)}/full`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      code: payload?.error || "FETCH_MATCH_ANALYSIS_ERROR",
      message: payload?.message || "Nao foi possivel carregar a analise do jogo.",
    };
  }

  return payload.analysis;
}
