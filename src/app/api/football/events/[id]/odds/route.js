import { BzzoiroApiError } from "@/services/bzzoiro/client";
import { getFootballOdds } from "@/services/football/footballAnalysisService";

export const runtime = "nodejs";

function errorResponse(message, status, code) {
  return Response.json({ success: false, error: code, message }, { status });
}

export async function GET(_request, context) {
  const { id } = await context.params;

  try {
    const result = await getFootballOdds(id);
    return Response.json({ success: true, ...result });
  } catch (error) {
    if (error?.code === "BZZOIRO_API_KEY_NOT_CONFIGURED") {
      return errorResponse(
        "A chave da API Bzzoiro nao esta configurada no servidor.",
        500,
        "BZZOIRO_API_KEY_NOT_CONFIGURED"
      );
    }

    if (error instanceof BzzoiroApiError && error.status === 404) {
      return errorResponse("Odds ainda nao disponiveis para este evento.", 404, "ODDS_NOT_FOUND");
    }

    return errorResponse("Nao foi possivel carregar odds agora.", 503, "SERVICE_UNAVAILABLE");
  }
}
