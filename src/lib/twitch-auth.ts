type CachedToken = {
  token: string;
  expiresAt: number;
};

let cachedTwitchToken: CachedToken | null = null;
let pendingTokenPromise: Promise<string> | null = null;

export async function getTwitchAppAccessToken(
  clientId: string | undefined,
  clientSecret: string | undefined
): Promise<string> {
  if (!clientId || !clientSecret) {
    throw new Error("Missing Twitch credentials");
  }

  const now = Date.now();
  if (cachedTwitchToken && cachedTwitchToken.expiresAt > now + 15_000) {
    return cachedTwitchToken.token;
  }

  if (pendingTokenPromise) {
    return pendingTokenPromise;
  }

  pendingTokenPromise = fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: "POST",
      cache: "no-store",
    }
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Failed to get Twitch access token");
      }

      const payload = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
      };

      if (!payload.access_token) {
        throw new Error("Twitch access token missing in response");
      }

      const ttlSeconds = Math.max(60, Number(payload.expires_in ?? 3600));
      cachedTwitchToken = {
        token: payload.access_token,
        expiresAt: Date.now() + (ttlSeconds - 30) * 1000,
      };

      return payload.access_token;
    })
    .finally(() => {
      pendingTokenPromise = null;
    });

  return pendingTokenPromise;
}
