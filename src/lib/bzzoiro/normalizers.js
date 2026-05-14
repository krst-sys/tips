import { BZZOIRO_IMAGE_BASE_URL } from "./client";

export function normalizeBzzoiroStatus(event) {
  if (event?.status === "finished") return "finished";
  if (event?.status === "inprogress") return "live";
  if (event?.status === "penalties") return "penalties";
  if (event?.status === "postponed") return "postponed";
  if (event?.status === "cancelled") return "cancelled";
  return "upcoming";
}

export function normalizeFixtureStatus(event) {
  const rawStatus = String(event?.status || "").toLowerCase();
  const period = String(event?.period || "").toLowerCase();
  const currentMinute = Number(event?.current_minute ?? event?.minute ?? 0);
  const hasScore = event?.home_score !== null
    && event?.home_score !== undefined
    && event?.away_score !== null
    && event?.away_score !== undefined;
  const kickoffTime = event?.event_date ? new Date(event.event_date).getTime() : Number.NaN;
  const elapsedMs = Number.isNaN(kickoffTime) ? 0 : Date.now() - kickoffTime;

  if (["finished", "ft", "ended"].includes(rawStatus)) return "finished";
  if (["inprogress", "live"].includes(rawStatus) || ["1h", "2h", "ht", "et"].includes(period) || currentMinute > 0) return "live";
  if (["postponed", "pst"].includes(rawStatus)) return "postponed";
  if (["cancelled", "canceled", "canc"].includes(rawStatus)) return "cancelled";
  if (hasScore && elapsedMs > 120 * 60 * 1000) return "finished";
  if (hasScore && elapsedMs >= 0) return "live";
  if (["notstarted", "scheduled", "upcoming", ""].includes(rawStatus)) return "scheduled";

  return "unknown";
}

export function getFixtureStatusLabel(status) {
  const labels = {
    cancelled: "Cancelado",
    finished: "Encerrado",
    live: "Ao vivo",
    postponed: "Adiado",
    scheduled: "Agendado",
    unknown: "Status indefinido",
  };

  return labels[status] || labels.unknown;
}

function normalizeCoach(coach, coachId) {
  if (!coach && !coachId) return null;

  return {
    id: coach?.id || coachId || undefined,
    name: coach?.name || coach?.full_name || coach?.short_name || (coachId ? `Treinador ID ${coachId}` : undefined),
    shortName: coach?.short_name || coach?.name || coach?.full_name || undefined,
    photo: coach?.id || coachId ? `${BZZOIRO_IMAGE_BASE_URL}/manager/${coach?.id || coachId}/` : undefined,
    nationality: coach?.nationality || coach?.country || undefined,
    tacticalProfile: coach?.tactical_profile || undefined,
    preferredFormation: coach?.preferred_formation || undefined,
    winPct: coach?.win_pct ?? undefined,
    avgPossession: coach?.avg_possession ?? undefined,
    matchesTotal: coach?.matches_total ?? undefined,
  };
}

export function normalizeBzzoiroEvent(event, { league, homeTeam, awayTeam, venue, homeCoach, awayCoach } = {}) {
  if (!event) return null;

  return {
    id: String(event.id),
    leagueId: event.league_id || undefined,
    leagueName: league?.name || event.league_name || undefined,
    leagueLogo: event.league_id ? `${BZZOIRO_IMAGE_BASE_URL}/league/${event.league_id}/` : undefined,
    country: league?.country || undefined,
    homeTeamId: event.home_team_id || undefined,
    awayTeamId: event.away_team_id || undefined,
    homeTeam: homeTeam?.name || event.home_team || "Mandante",
    awayTeam: awayTeam?.name || event.away_team || "Visitante",
    homeShortName: homeTeam?.short_name || event.home_team || "Mandante",
    awayShortName: awayTeam?.short_name || event.away_team || "Visitante",
    homeLogo: event.home_team_id ? `${BZZOIRO_IMAGE_BASE_URL}/team/${event.home_team_id}/` : undefined,
    awayLogo: event.away_team_id ? `${BZZOIRO_IMAGE_BASE_URL}/team/${event.away_team_id}/` : undefined,
    eventDate: event.event_date || null,
    status: normalizeBzzoiroStatus(event),
    statusRaw: event.status || null,
    period: event.period || null,
    currentMinute: event.current_minute ?? null,
    venue: venue?.name || undefined,
    venueCity: venue?.city || undefined,
    venueCountry: venue?.country || undefined,
    referee: event.referee_id ? `ID ${event.referee_id}` : undefined,
    round: event.round_name || (event.round_number ? `Rodada ${event.round_number}` : undefined),
    coaches: {
      home: normalizeCoach(homeCoach || event.home_coach, event.home_coach_id),
      away: normalizeCoach(awayCoach || event.away_coach, event.away_coach_id),
    },
    score: {
      home: event.home_score,
      away: event.away_score,
      homeHt: event.home_score_ht,
      awayHt: event.away_score_ht,
    },
    context: {
      isLocalDerby: Boolean(event.is_local_derby),
      isNeutralGround: Boolean(event.is_neutral_ground),
      travelDistanceKm: event.travel_distance_km,
      weather: event.weather || null,
      pitchCondition: event.pitch_condition,
      attendance: event.attendance,
      liveWebsocket: Boolean(event.live_websocket),
    },
    source: "bzzoiro",
  };
}

export function normalizeFixtureEvent(event, league) {
  const normalized = normalizeBzzoiroEvent(event, { league });
  const status = normalizeFixtureStatus(event);
  const timestamp = normalized.eventDate ? Math.floor(new Date(normalized.eventDate).getTime() / 1000) : null;

  return {
    id: String(event.id),
    source: "bzzoiro",
    leagueId: normalized.leagueId || null,
    league: normalized.leagueName || `Liga ${event.league_id || ""}`.trim(),
    leagueName: normalized.leagueName || `Liga ${event.league_id || ""}`.trim(),
    leagueLogo: normalized.leagueLogo || null,
    country: normalized.country || "World",
    countryFlag: null,
    round: normalized.round || null,
    homeTeam: normalized.homeTeam,
    homeLogo: normalized.homeLogo || null,
    awayTeam: normalized.awayTeam,
    awayLogo: normalized.awayLogo || null,
    date: normalized.eventDate,
    timestamp,
    time: normalized.eventDate ? new Date(normalized.eventDate).toISOString() : null,
    homeScore: normalized.score.home,
    awayScore: normalized.score.away,
    status,
    statusLabel: getFixtureStatusLabel(status),
    statusShort: status === "finished" ? "FT" : status === "live" ? "LIVE" : status === "scheduled" ? "NS" : status.toUpperCase(),
    statusLong: normalized.status,
    period: normalized.period,
    minute: normalized.currentMinute,
    scores: normalized.score,
    analysisContext: normalized.context,
  };
}

export function probabilityItem(market, label, value, side, meta = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;

  return {
    market,
    label,
    value: Number(value),
    side,
    ...meta,
  };
}

export function normalizeOddsAsProbabilities(oddsPayload) {
  const odds = oddsPayload?.odds || {};

  const normalizeMarket = (items) => {
    const parsed = items
      .filter((item) => item.odds)
      .map((item) => ({ ...item, implied: 1 / Number(item.odds) }));
    const total = parsed.reduce((sum, item) => sum + item.implied, 0);

    return parsed.map((item) =>
      probabilityItem(item.market, item.label, (item.implied / total) * 100, item.side, {
        source: "odds_implied",
        odds: item.odds,
      })
    );
  };

  return {
    btts: normalizeMarket([
      { market: "btts", label: "Sim", side: "yes", odds: odds.btts_yes },
      { market: "btts", label: "Nao", side: "no", odds: odds.btts_no },
    ]),
    fulltimeWinner: normalizeMarket([
      { market: "fulltime_winner", label: "Mandante", side: "home", odds: odds.home_win },
      { market: "fulltime_winner", label: "Empate", side: "draw", odds: odds.draw },
      { market: "fulltime_winner", label: "Visitante", side: "away", odds: odds.away_win },
    ]),
    overUnder: {
      "1.5": normalizeMarket([
        { market: "over_under_1_5", label: "Over 1.5", side: "over", odds: odds.over_15_goals },
        { market: "over_under_1_5", label: "Under 1.5", side: "under", odds: odds.under_15_goals },
      ]),
      "2.5": normalizeMarket([
        { market: "over_under_2_5", label: "Over 2.5", side: "over", odds: odds.over_25_goals },
        { market: "over_under_2_5", label: "Under 2.5", side: "under", odds: odds.under_25_goals },
      ]),
      "3.5": normalizeMarket([
        { market: "over_under_3_5", label: "Over 3.5", side: "over", odds: odds.over_35_goals },
        { market: "over_under_3_5", label: "Under 3.5", side: "under", odds: odds.under_35_goals },
      ]),
      "4.5": [],
    },
  };
}

function factorial(value) {
  if (value <= 1) return 1;
  let result = 1;
  for (let index = 2; index <= value; index += 1) result *= index;
  return result;
}

function poisson(lambda, goals) {
  return (Math.exp(-lambda) * lambda ** goals) / factorial(goals);
}

function buildCorrectScores(expectedGoals) {
  if (!expectedGoals?.home || !expectedGoals?.away) return [];

  const scores = [];
  for (let home = 0; home <= 5; home += 1) {
    for (let away = 0; away <= 5; away += 1) {
      scores.push({
        score: `${home}-${away}`,
        value: poisson(Number(expectedGoals.home), home) * poisson(Number(expectedGoals.away), away) * 100,
      });
    }
  }

  return scores
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map((score) =>
      probabilityItem("correct_score", score.score, score.value, undefined, {
        source: "poisson_expected_goals",
      })
    );
}

export function normalizePrediction(predictionPayload, oddsPayload, metadata) {
  const markets = predictionPayload?.markets || {};
  const oddsProbabilities = normalizeOddsAsProbabilities(oddsPayload);
  const predictionSource = predictionPayload ? "bzzoiro_prediction" : "odds_implied";
  const overUnderPrediction = markets.over_under || {};

  const probabilities = {
    btts: markets.btts?.prob_yes !== undefined
      ? [
          probabilityItem("btts", "Sim", markets.btts.prob_yes, "yes", { source: predictionSource }),
          probabilityItem("btts", "Nao", 100 - markets.btts.prob_yes, "no", { source: predictionSource }),
        ].filter(Boolean)
      : oddsProbabilities.btts,
    fulltimeWinner: markets.match_result
      ? [
          probabilityItem("fulltime_winner", "Mandante", markets.match_result.prob_home, "home", { source: predictionSource }),
          probabilityItem("fulltime_winner", "Empate", markets.match_result.prob_draw, "draw", { source: predictionSource }),
          probabilityItem("fulltime_winner", "Visitante", markets.match_result.prob_away, "away", { source: predictionSource }),
        ].filter(Boolean)
      : oddsProbabilities.fulltimeWinner,
    firstHalfWinner: [],
    firstToScore: [],
    overUnder: {
      "1.5": overUnderPrediction.prob_over_15 !== undefined
        ? [
            probabilityItem("over_under_1_5", "Over 1.5", overUnderPrediction.prob_over_15, "over", { source: predictionSource }),
            probabilityItem("over_under_1_5", "Under 1.5", 100 - overUnderPrediction.prob_over_15, "under", { source: predictionSource }),
          ].filter(Boolean)
        : oddsProbabilities.overUnder["1.5"],
      "2.5": overUnderPrediction.prob_over_25 !== undefined
        ? [
            probabilityItem("over_under_2_5", "Over 2.5", overUnderPrediction.prob_over_25, "over", { source: predictionSource }),
            probabilityItem("over_under_2_5", "Under 2.5", 100 - overUnderPrediction.prob_over_25, "under", { source: predictionSource }),
          ].filter(Boolean)
        : oddsProbabilities.overUnder["2.5"],
      "3.5": overUnderPrediction.prob_over_35 !== undefined
        ? [
            probabilityItem("over_under_3_5", "Over 3.5", overUnderPrediction.prob_over_35, "over", { source: predictionSource }),
            probabilityItem("over_under_3_5", "Under 3.5", 100 - overUnderPrediction.prob_over_35, "under", { source: predictionSource }),
          ].filter(Boolean)
        : oddsProbabilities.overUnder["3.5"],
      "4.5": oddsProbabilities.overUnder["4.5"],
    },
    correctScore: buildCorrectScores(markets.expected_goals),
  };

  if (probabilities.correctScore.length === 0 && markets.score?.most_likely) {
    probabilities.correctScore = [
      probabilityItem("correct_score", markets.score.most_likely, 0, undefined, {
        source: predictionSource,
        displayOnly: true,
      }),
    ].filter(Boolean);
  }

  return {
    probabilities,
    model: predictionPayload?.model || null,
    recommendations: predictionPayload?.recommendations || null,
    expectedGoals: markets.expected_goals || null,
    aiPreview: metadata?.ai_preview || null,
    source: predictionSource,
  };
}

export function normalizeStats(statsPayload) {
  const home = statsPayload?.stats?.home || {};
  const away = statsPayload?.stats?.away || {};

  return {
    raw: statsPayload || null,
    hasStats: Boolean(statsPayload?.stats?.home || statsPayload?.stats?.away),
    comparison: [
      { label: "xG", home: home.xg?.actual, away: away.xg?.actual },
      { label: "Posse", home: home.ball_possession, away: away.ball_possession, suffix: "%" },
      { label: "Finalizacoes", home: home.total_shots, away: away.total_shots },
      { label: "No alvo", home: home.shots_on_target, away: away.shots_on_target },
      { label: "Ataques perigosos", home: home.dangerous_attack, away: away.dangerous_attack },
      { label: "Escanteios", home: home.corner_kicks, away: away.corner_kicks },
      { label: "Cartoes amarelos", home: home.yellow_cards, away: away.yellow_cards },
      { label: "Cartoes vermelhos", home: home.red_cards, away: away.red_cards },
    ].filter((item) => item.home !== undefined || item.away !== undefined),
    momentum: statsPayload?.momentum || [],
    shotmap: statsPayload?.shotmap || [],
    xgPerMinute: statsPayload?.xg_per_minute || [],
  };
}

export function normalizeStandings(standingsPayload, event) {
  const rows = standingsPayload?.standings || Object.values(standingsPayload?.groups || {}).flat();

  return {
    raw: standingsPayload || null,
    season: standingsPayload?.season || null,
    rows: Array.isArray(rows)
      ? rows.map((row) => ({
          position: row.position,
          teamId: row.team_id,
          teamName: row.team_name,
          played: row.played,
          won: row.won,
          drawn: row.drawn,
          lost: row.lost,
          goalsFor: row.gf,
          goalsAgainst: row.ga,
          goalDifference: row.gd,
          points: row.pts,
          form: row.form || "",
          live: Boolean(row.live),
          isHomeTeam: row.team_id === event?.home_team_id,
          isAwayTeam: row.team_id === event?.away_team_id,
        }))
      : [],
  };
}

export function normalizeTeamFixtures(fixturesPayload) {
  const events = Array.isArray(fixturesPayload?.results) ? fixturesPayload.results : [];

  return events
    .map((event) => ({
      id: String(event.id),
      leagueId: event.league_id,
      leagueName: event.league_name,
      homeTeamId: event.home_team_id,
      awayTeamId: event.away_team_id,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      eventDate: event.event_date,
      status: normalizeBzzoiroStatus(event),
      homeScore: event.home_score,
      awayScore: event.away_score,
    }))
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
}

export function normalizeH2h(homeFixturesPayload, awayFixturesPayload, event, formFixturesPayload = {}) {
  const homeFixtures = normalizeTeamFixtures(homeFixturesPayload);
  const awayFixtures = normalizeTeamFixtures(awayFixturesPayload);
  const homeForm = normalizeTeamFixtures(formFixturesPayload.home || homeFixturesPayload);
  const awayForm = normalizeTeamFixtures(formFixturesPayload.away || awayFixturesPayload);
  const byId = new Map();

  [...homeFixtures, ...awayFixtures].forEach((fixture) => {
    byId.set(fixture.id, fixture);
  });

  const all = [...byId.values()].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
  const direct = all.filter((fixture) => {
    return (
      [fixture.homeTeamId, fixture.awayTeamId].includes(event?.home_team_id) &&
      [fixture.homeTeamId, fixture.awayTeamId].includes(event?.away_team_id)
    );
  });

  return {
    direct: direct.slice(0, 8),
    homeRecent: homeForm.slice(0, 8),
    awayRecent: awayForm.slice(0, 8),
    summary: direct.reduce(
      (acc, fixture) => {
        if (fixture.homeScore === null || fixture.awayScore === null) return acc;
        const homeIsEventHome = fixture.homeTeamId === event?.home_team_id;
        const eventHomeScore = homeIsEventHome ? fixture.homeScore : fixture.awayScore;
        const eventAwayScore = homeIsEventHome ? fixture.awayScore : fixture.homeScore;

        if (eventHomeScore > eventAwayScore) acc.homeWins += 1;
        else if (eventHomeScore < eventAwayScore) acc.awayWins += 1;
        else acc.draws += 1;

        return acc;
      },
      { homeWins: 0, draws: 0, awayWins: 0 }
    ),
  };
}
