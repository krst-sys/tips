const API_BASE_URL = "https://sports.bzzoiro.com/api/v2";
export const BZZOIRO_IMAGE_BASE_URL = "https://sports.bzzoiro.com/img";

export class BzzoiroApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "BzzoiroApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function getBzzoiroApiKey() {
  return process.env.BZZOIRO_API_KEY || process.env.BSD_API_TOKEN;
}

export function createBzzoiroClient() {
  const apiKey = getBzzoiroApiKey();

  async function request(path, { searchParams = {}, cache = "no-store", next } = {}) {
    if (!apiKey) {
      const error = new BzzoiroApiError(
        "A chave da API BSD/Bzzoiro nao esta configurada no servidor.",
        500,
        { error: "BZZOIRO_API_KEY_NOT_CONFIGURED" }
      );
      error.code = "BZZOIRO_API_KEY_NOT_CONFIGURED";
      throw error;
    }

    const url = new URL(`${API_BASE_URL}${path}`);
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${apiKey}`,
      },
      cache,
      next,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new BzzoiroApiError("Bzzoiro API request failed", response.status, payload);
    }

    return payload;
  }

  async function safeRequest(path, options) {
    try {
      return await request(path, options);
    } catch {
      return null;
    }
  }

  return { request, safeRequest };
}
