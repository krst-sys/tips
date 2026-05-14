export async function fetchGameDetails(gameId) {
  const response = await fetch(`/api/football/fixtures/${encodeURIComponent(gameId)}`, {
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      code: payload?.error || "FETCH_GAME_DETAILS_ERROR",
      message: payload?.message || "Nao foi possivel carregar os detalhes do jogo.",
    };
  }

  return payload;
}
