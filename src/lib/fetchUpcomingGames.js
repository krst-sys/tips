export async function fetchUpcomingGames(date) {
  const response = await fetch(`/api/football/fixtures?date=${encodeURIComponent(date)}`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = payload?.error || {
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
