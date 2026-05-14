export async function fetchUpcomingGames(date, options = {}) {
  const params = new URLSearchParams();
  const endpoint = options.leagueId || options.dateFrom || options.dateTo ? "/api/football/events" : "/api/football/fixtures";

  if (date) params.set("date", date);
  if (options.dateFrom) params.set("date_from", options.dateFrom);
  if (options.dateTo) params.set("date_to", options.dateTo);
  if (options.leagueId) params.set("league_id", String(options.leagueId));
  if (options.status) params.set("status", options.status);
  if (options.limit) params.set("limit", String(options.limit));

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = payload?.error
      ? {
          code: typeof payload.error === "string" ? payload.error : payload.error.code,
          message:
            payload.message ||
            (typeof payload.error === "object" ? payload.error.message : null),
        }
      : {
          message: "Nao foi possivel buscar os jogos.",
          code: "FETCH_ERROR",
        };

    throw error;
  }

  return {
    games: Array.isArray(payload?.games) ? payload.games : [],
    meta: payload?.meta || null,
  };
}
