import { GET as getAnalysis } from "@/app/api/football/events/[id]/analysis/route";

export const runtime = "nodejs";

export async function GET(request, context) {
  return getAnalysis(request, context);
}
