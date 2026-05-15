import { BZZOIRO_EXTERNAL_IMAGE_BASE_URL } from "@/lib/bzzoiro/client";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["team", "league", "manager", "player"]);

export async function GET(_request, context) {
  const { type, id } = await context.params;

  if (!ALLOWED_TYPES.has(type) || !/^[a-zA-Z0-9_-]+$/.test(String(id || ""))) {
    return new Response(null, { status: 404 });
  }

  const response = await fetch(`${BZZOIRO_EXTERNAL_IMAGE_BASE_URL}/${type}/${id}/`, {
    next: { revalidate: 24 * 60 * 60 },
  });

  if (!response.ok || !response.body) {
    return new Response(null, { status: 404 });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      "Content-Type": response.headers.get("content-type") || "image/png",
    },
  });
}
