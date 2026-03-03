import { NextResponse } from "next/server";
import { getTwitchAppAccessToken } from "@/lib/twitch-auth";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const KICK_API_KEY = process.env.KICK_API_KEY;
const KICK_CLIENT_ID = process.env.KICK_CLIENT_ID;
const KICK_CLIENT_SECRET = process.env.KICK_CLIENT_SECRET;
const KICK_AUTH_URL = process.env.KICK_AUTH_URL ?? "https://id.kick.com/oauth/token";

const TWITCH_LOGINS = [
  "rostikfacekid",
  "poisonika",
  "tankzor",
  "formixyouknow",
  "narekcr",
  "r4dom1r",
  "yurapivo",
];

const KICK_SLUGS = ["helin139ban"];

let cachedKickAccessToken: { token: string; expiresAt: number } | null = null;

type CreatorState = {
  isLive: boolean;
  avatarUrl?: string;
  displayName?: string;
  platform: "Twitch" | "Kick";
};

async function getTwitchAccessToken(): Promise<string | null> {
  try {
    return await getTwitchAppAccessToken(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
  } catch {
    return null;
  }
}

function findLiveFlag(value: unknown, depth = 0): boolean | null {
  if (!value || depth > 4) return null;

  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findLiveFlag(entry, depth + 1);
      if (found !== null) return found;
    }
    return null;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const direct = [
      obj.is_live,
      obj.isLive,
      obj.online,
      obj.is_streaming,
      obj.livestream,
      obj.stream,
      obj.stream_data,
    ];

    for (const candidate of direct) {
      if (typeof candidate === "boolean") return candidate;
      if (typeof candidate === "number") return candidate > 0;
      if (typeof candidate === "string") {
        const normalized = candidate.trim().toLowerCase();
        if (["live", "online", "streaming"].includes(normalized)) return true;
        if (["offline", "ended", "end"].includes(normalized)) return false;
      }
      if (candidate && typeof candidate === "object") {
        const nested = findLiveFlag(candidate, depth + 1);
        if (nested !== null) return nested;
      }
    }

    for (const entry of Object.values(obj)) {
      const found = findLiveFlag(entry, depth + 1);
      if (found !== null) return found;
    }
  }

  return null;
}

async function fetchKickJson(url: string): Promise<unknown | null> {
  const token = await getKickAccessToken();

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    if (KICK_API_KEY) {
      headers["x-api-key"] = KICK_API_KEY;
    }
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 60 },
  });

  if (!response.ok) return null;
  return response.json();
}

async function getKickAccessToken(): Promise<string | null> {
  if (KICK_API_KEY) return KICK_API_KEY;

  const now = Date.now();
  if (cachedKickAccessToken && cachedKickAccessToken.expiresAt > now + 15_000) {
    return cachedKickAccessToken.token;
  }

  if (!KICK_CLIENT_ID || !KICK_CLIENT_SECRET) return null;

  const formBody = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: KICK_CLIENT_ID,
    client_secret: KICK_CLIENT_SECRET,
  });

  const attempts: Array<Promise<Response>> = [
    fetch(KICK_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formBody,
      cache: "no-store",
    }),
    fetch(KICK_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: KICK_CLIENT_ID,
        client_secret: KICK_CLIENT_SECRET,
      }),
      cache: "no-store",
    }),
  ];

  for (const attempt of attempts) {
    const response = await attempt;
    if (!response.ok) continue;

    const tokenJson = (await response.json()) as {
      access_token?: string;
      token?: string;
      expires_in?: number;
    };

    const token = tokenJson.access_token ?? tokenJson.token;
    if (!token) continue;

    const expiresIn = tokenJson.expires_in ?? 3600;
    cachedKickAccessToken = {
      token,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    return token;
  }

  return null;
}

export async function GET() {
  const creators: Record<string, CreatorState> = {};

  try {
    const token = await getTwitchAccessToken();

    if (token && TWITCH_CLIENT_ID) {
      const headers = {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      };

      const usersParams = new URLSearchParams();
      for (const login of TWITCH_LOGINS) usersParams.append("login", login);

      const streamsParams = new URLSearchParams();
      for (const login of TWITCH_LOGINS) streamsParams.append("user_login", login);

      const [usersRes, streamsRes] = await Promise.all([
        fetch(`https://api.twitch.tv/helix/users?${usersParams.toString()}`, {
          headers,
          next: { revalidate: 60 },
        }),
        fetch(`https://api.twitch.tv/helix/streams?${streamsParams.toString()}`, {
          headers,
          next: { revalidate: 60 },
        }),
      ]);

      const usersJson = usersRes.ok
        ? ((await usersRes.json()) as {
            data?: Array<{ login?: string; display_name?: string; profile_image_url?: string }>;
          })
        : { data: [] };

      const streamsJson = streamsRes.ok
        ? ((await streamsRes.json()) as {
            data?: Array<{ user_login?: string }>;
          })
        : { data: [] };

      const liveLogins = new Set(
        (streamsJson.data ?? []).map((item) => (item.user_login ?? "").toLowerCase()).filter(Boolean)
      );

      for (const login of TWITCH_LOGINS) {
        const user = (usersJson.data ?? []).find(
          (item) => (item.login ?? "").toLowerCase() === login.toLowerCase()
        );

        creators[login.toLowerCase()] = {
          platform: "Twitch",
          isLive: liveLogins.has(login.toLowerCase()),
          avatarUrl: `/api/twitch/avatar/${encodeURIComponent(login.toLowerCase())}`,
          displayName: user?.display_name ?? login,
        };
      }
    }
  } catch {
    // Keep fallback values from client-side config.
  }

  try {
    for (const slug of KICK_SLUGS) {
      const channelPayload = await fetchKickJson(
        `https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(slug)}`
      );
      const live = findLiveFlag(channelPayload);

      creators[slug.toLowerCase()] = {
        platform: "Kick",
        isLive: live ?? false,
        avatarUrl: `/api/kick/avatar/${encodeURIComponent(slug.toLowerCase())}`,
        displayName: slug,
      };
    }
  } catch {
    // Keep fallback values from client-side config.
  }

  return NextResponse.json(
    {
      creators,
      fetchedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
      },
    }
  );
}
