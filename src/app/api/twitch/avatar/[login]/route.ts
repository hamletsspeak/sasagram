import { NextResponse } from "next/server";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const DEFAULT_TWITCH_AVATAR =
  "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_300x300.png";

async function getAccessToken(): Promise<string> {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error("Missing Twitch credentials");
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!res.ok) {
    throw new Error("Failed to get Twitch access token");
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ login: string }> }
) {
  const { login } = await context.params;

  if (!login) {
    return NextResponse.redirect(DEFAULT_TWITCH_AVATAR, {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  }

  try {
    const token = await getAccessToken();
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

    return NextResponse.redirect(profileImageUrl, {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.redirect(DEFAULT_TWITCH_AVATAR, {
      status: 307,
      headers: {
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    });
  }
}
