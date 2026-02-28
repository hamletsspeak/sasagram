import { NextResponse } from "next/server";

const KICK_API_BASE = "https://api.kick.com/public/v1";
const KICK_API_KEY = process.env.KICK_API_KEY;
const KICK_CLIENT_ID = process.env.KICK_CLIENT_ID;
const KICK_CLIENT_SECRET = process.env.KICK_CLIENT_SECRET;
const KICK_AUTH_URL = process.env.KICK_AUTH_URL ?? "https://id.kick.com/oauth/token";
const FALLBACK_AVATAR = (slug: string) =>
  `https://api.dicebear.com/9.x/thumbs/png?seed=${encodeURIComponent(slug)}&backgroundColor=0f172a,111827,030712`;

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getKickAccessToken(): Promise<string | null> {
  if (KICK_API_KEY) return KICK_API_KEY;

  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 15_000) {
    return cachedAccessToken.token;
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
    cachedAccessToken = {
      token,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    return token;
  }

  return null;
}

function findAvatarUrl(value: unknown, depth = 0): string | null {
  if (!value || depth > 4) return null;

  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if ((lower.startsWith("http://") || lower.startsWith("https://")) && (lower.includes("avatar") || lower.includes("profile") || lower.includes("picture") || lower.includes("photo"))) {
      return value;
    }
    return null;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findAvatarUrl(entry, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    const directCandidates = [
      obj.profile_picture,
      obj.profile_picture_url,
      obj.profile_image,
      obj.profile_image_url,
      obj.avatar,
      obj.avatar_url,
      obj.picture,
      obj.photo,
      obj.user_profile_picture,
    ];

    for (const candidate of directCandidates) {
      const found = findAvatarUrl(candidate, depth + 1);
      if (found) return found;
    }

    for (const entry of Object.values(obj)) {
      const found = findAvatarUrl(entry, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

function getFirstDataItem(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  return first && typeof first === "object" ? (first as Record<string, unknown>) : null;
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
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;
  return response.json();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.redirect(FALLBACK_AVATAR("kick"), {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  }

  const safeSlug = slug.trim().toLowerCase();

  try {
    const channelPayload = await fetchKickJson(
      `${KICK_API_BASE}/channels?slug=${encodeURIComponent(safeSlug)}`
    );
    const channel = getFirstDataItem(channelPayload);

    const broadcasterUserId =
      typeof channel?.broadcaster_user_id === "number" || typeof channel?.broadcaster_user_id === "string"
        ? String(channel.broadcaster_user_id)
        : null;

    const userPayload = broadcasterUserId
      ? await fetchKickJson(`${KICK_API_BASE}/users?id=${encodeURIComponent(broadcasterUserId)}`)
      : null;

    const avatar = findAvatarUrl(userPayload) ?? findAvatarUrl(channelPayload);

    if (avatar) {
      return NextResponse.redirect(avatar, {
        status: 307,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    const fallbackUserPayload = await fetchKickJson(
      `${KICK_API_BASE}/users?name=${encodeURIComponent(safeSlug)}`
    );
    const fallbackAvatar = findAvatarUrl(fallbackUserPayload);
    if (fallbackAvatar) {
      return NextResponse.redirect(fallbackAvatar, {
        status: 307,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }
  } catch {
    // Ignore and fallback below.
  }

  return NextResponse.redirect(FALLBACK_AVATAR(safeSlug), {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
