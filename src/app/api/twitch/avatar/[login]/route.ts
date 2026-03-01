import { NextResponse } from "next/server";
import { getTwitchAppAccessToken } from "@/lib/twitch-auth";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const DEFAULT_TWITCH_AVATAR =
  "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_300x300.png";
const FALLBACK_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/qGsAAAAASUVORK5CYII=";

function pngFallbackResponse(cacheControl: string): NextResponse {
  const body = Buffer.from(FALLBACK_PNG_BASE64, "base64");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": cacheControl,
    },
  });
}

async function proxyImage(url: string, cacheControl: string): Promise<NextResponse> {
  const imageRes = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!imageRes.ok) {
    throw new Error("Image fetch failed");
  }

  const contentType = imageRes.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error("Image response has invalid content type");
  }

  const body = await imageRes.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
    },
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ login: string }> }
) {
  const { login } = await context.params;

  if (!login) {
    return pngFallbackResponse("public, max-age=300, s-maxage=300");
  }

  try {
    const token = await getTwitchAppAccessToken(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!userRes.ok) {
      throw new Error("Failed to load Twitch user");
    }

    const userData = (await userRes.json()) as {
      data?: Array<{ profile_image_url?: string }>;
    };

    const profileImageUrl = userData.data?.[0]?.profile_image_url ?? DEFAULT_TWITCH_AVATAR;

    return await proxyImage(
      profileImageUrl,
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    );
  } catch {
    try {
      return await proxyImage(DEFAULT_TWITCH_AVATAR, "public, max-age=600, s-maxage=600");
    } catch {
      return pngFallbackResponse("public, max-age=120, s-maxage=120");
    }
  }
}
