import { BzzoiroApiError } from "@/services/bzzoiro/client";
import { getFootballMatchAnalysis } from "@/services/football/footballAnalysisService";

export const runtime = "nodejs";

function errorResponse(message, status, code) {
  return Response.json({ success: false, error: code, message }, { status });
}

export async function GET(_request, context) {
  const { id } = await context.params;

  try {
    const analysis = await getFootballMatchAnalysis(id);
    return Response.json({ success: true, analysis });
  } catch (error) {
    if (error?.code === "BZZOIRO_API_KEY_NOT_CONFIGURED") {
      return errorResponse(
        "A chave da API BSD/Bzzoiro nao esta configurada no servidor.",
        500,
        "BZZOIRO_API_KEY_NOT_CONFIGURED"
      );
    }

    if (error instanceof BzzoiroApiError && error.status === 404) {
      return errorResponse("Jogo nao encontrado.", 404, "EVENT_NOT_FOUND");
    }

    if (error instanceof BzzoiroApiError && (error.status === 401 || error.status === 403)) {
      return errorResponse("O token da API BSD/Bzzoiro foi recusado.", error.status, "BZZOIRO_API_KEY_INVALID");
    }

    if (error instanceof BzzoiroApiError && error.status === 429) {
      return errorResponse("Limite de requests da API BSD/Bzzoiro atingido.", 429, "RATE_LIMIT");
    }

    return errorResponse("Nao foi possivel montar a analise do jogo agora.", 503, "SERVICE_UNAVAILABLE");
  }
}
