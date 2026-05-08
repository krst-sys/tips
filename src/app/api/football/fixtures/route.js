const API_URL = "https://v3.football.api-sports.io/fixtures";
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_VERSION = 4;
const FIXTURES_TIMEZONE = "America/Sao_Paulo";

const LEAGUE_DISPLAY_OVERRIDES = {
  2: { country: "Europe" },
  3: { country: "Europe" },
  11: { leagueName: "Copa Sudamericana", country: "South America" },
  13: { leagueName: "Copa Libertadores", country: "South America" },
  848: { country: "Europe" },
};

const memoryCache = globalThis.__filttoFixturesCache || new Map();
globalThis.__filttoFixturesCache = memoryCache;

function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date || "");
}

function formatFixture(item) {
  const leagueId = item?.league?.id || null;
  const display = LEAGUE_DISPLAY_OVERRIDES[leagueId] || {};

  return {
    id: item?.fixture?.id,
    leagueId,
    leagueName: display.leagueName || item?.league?.name || "Liga nao informada",
    leagueLogo: item?.league?.logo || null,
    country: display.country || item?.league?.country || "Pais nao informado",
    countryFlag: Object.hasOwn(display, "countryFlag")
      ? display.countryFlag
      : item?.league?.flag || null,
    homeTeam: item?.teams?.home?.name || "Mandante",
    homeLogo: item?.teams?.home?.logo || null,
    awayTeam: item?.teams?.away?.name || "Visitante",
    awayLogo: item?.teams?.away?.logo || null,
    date: item?.fixture?.date || null,
    timestamp: item?.fixture?.timestamp || null,
    status: item?.fixture?.status?.short || "NS",
    statusLong: item?.fixture?.status?.long || "Nao iniciado",
  };
}

function errorResponse(message, status, code) {
  return Response.json({ error: { message, code } }, { status });
}

function hasRateLimitError(payload) {
  const errors = payload?.errors;

  if (Array.isArray(errors)) {
    return errors.some((error) => String(error).toLowerCase().includes("request"));
  }

  if (errors && typeof errors === "object") {
    return Object.values(errors).some((error) =>
      String(error).toLowerCase().includes("request")
    );
  }

  return false;
}

export async function GET(request) {
  const date = request.nextUrl.searchParams.get("date");

  if (!isValidDate(date)) {
    return errorResponse("Informe uma data valida no formato YYYY-MM-DD.", 400, "INVALID_DATE");
  }

  const cached = memoryCache.get(date);
  const now = Date.now();

  if (cached && cached.version === CACHE_VERSION && now - cached.createdAt < CACHE_TTL_MS) {
    return Response.json({
      games: cached.games,
      meta: {
        date,
        cached: true,
        revalidateSeconds: CACHE_TTL_MS / 1000,
        timezone: FIXTURES_TIMEZONE,
      },
    });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return errorResponse(
      "A chave da API-Football nao esta configurada no servidor.",
      500,
      "MISSING_API_KEY"
    );
  }

  try {
    const upstreamUrl = new URL(API_URL);
    upstreamUrl.searchParams.set("date", date);
    upstreamUrl.searchParams.set("timezone", FIXTURES_TIMEZONE);

    const response = await fetch(upstreamUrl, {
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: 3600 },
    });

    const payload = await response.json().catch(() => null);

    if (response.status === 429 || hasRateLimitError(payload)) {
      return errorResponse(
        "Limite de requests da API-Football atingido. Tente novamente em alguns minutos.",
        429,
        "RATE_LIMIT"
      );
    }

    if (!response.ok) {
      return errorResponse(
        "A API-Football esta indisponivel no momento.",
        response.status,
        "UPSTREAM_ERROR"
      );
    }

    const games = Array.isArray(payload?.response) ? payload.response.map(formatFixture) : [];

    memoryCache.set(date, { games, createdAt: now, version: CACHE_VERSION });

    return Response.json({
      games,
      meta: {
        date,
        cached: false,
        revalidateSeconds: CACHE_TTL_MS / 1000,
        timezone: FIXTURES_TIMEZONE,
      },
    });
  } catch (error) {
    return errorResponse(
      "Nao foi possivel buscar os jogos agora. Verifique a conexao do servidor.",
      503,
      "SERVICE_UNAVAILABLE"
    );
  }
}
