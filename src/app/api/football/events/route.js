import { BzzoiroApiError } from "@/services/bzzoiro/client";
import { listFootballEvents } from "@/services/football/footballAnalysisService";

export const runtime = "nodejs";

function errorResponse(message, status, code) {
  return Response.json({ success: false, error: code, message }, { status });
}

export async function GET(request) {
  const params = request.nextUrl.searchParams;

  try {
    const result = await listFootballEvents({
      date: params.get("date"),
      dateFrom: params.get("date_from"),
      dateTo: params.get("date_to"),
      leagueId: params.get("league_id"),
      status: params.get("status"),
      limit: params.get("limit"),
      offset: params.get("offset"),
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    if (error?.code === "BZZOIRO_API_KEY_NOT_CONFIGURED") {
      return errorResponse(
        "A chave da API BSD/Bzzoiro nao esta configurada no servidor.",
        500,
        "BZZOIRO_API_KEY_NOT_CONFIGURED"
      );
    }

    if (error instanceof BzzoiroApiError && (error.status === 401 || error.status === 403)) {
      return errorResponse("O token da API BSD/Bzzoiro foi recusado.", error.status, "BZZOIRO_API_KEY_INVALID");
    }

    if (error instanceof BzzoiroApiError && error.status === 429) {
      return errorResponse("Limite de requests da API BSD/Bzzoiro atingido.", 429, "RATE_LIMIT");
    }

    return errorResponse("Nao foi possivel buscar os jogos agora.", 503, "SERVICE_UNAVAILABLE");
  }
}
