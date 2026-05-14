import { BzzoiroApiError } from "@/services/bzzoiro/client";
import { getFootballFull } from "@/services/football/footballAnalysisService";

export const runtime = "nodejs";

function errorResponse(message, status, code) {
  return Response.json({ success: false, error: code, message }, { status });
}

export async function GET(_request, context) {
  const { id } = await context.params;

  try {
    const analysis = await getFootballFull(id);
    return Response.json({ success: true, analysis });
  } catch (error) {
    if (error?.code === "BZZOIRO_API_KEY_NOT_CONFIGURED") {
      return errorResponse(
        "A chave da API Bzzoiro nao esta configurada no servidor.",
        500,
        "BZZOIRO_API_KEY_NOT_CONFIGURED"
      );
    }

    if (error instanceof BzzoiroApiError && error.status === 404) {
      return errorResponse("Jogo nao encontrado.", 404, "EVENT_NOT_FOUND");
    }

    return errorResponse("Nao foi possivel carregar os dados completos do jogo agora.", 503, "SERVICE_UNAVAILABLE");
  }
}
