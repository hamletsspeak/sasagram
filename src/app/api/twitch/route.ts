import { NextResponse } from "next/server";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const TWITCH_USERNAME = "sasavot";

async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to get Twitch access token");
  const data = await res.json();
  return data.access_token as string;
}

export async function GET() {
  try {
    const token = await getAccessToken();

    const headers = {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    };

    // Get user info
    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${TWITCH_USERNAME}`,
      { headers }
    );
    const userData = await userRes.json();
    const user = userData.data?.[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id as string;

    // Get live stream status
    const streamRes = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${TWITCH_USERNAME}`,
      { headers }
    );
    const streamData = await streamRes.json();
    const stream = streamData.data?.[0] ?? null;

    // Get VODs (past broadcasts)
    const vodsRes = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${userId}&type=archive&first=6`,
      { headers }
    );
    const vodsData = await vodsRes.json();
    const vods = vodsData.data ?? [];

    // Get channel followers count
    const followersRes = await fetch(
      `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}`,
      { headers }
    );
    const followersData = await followersRes.json();
    const followersCount: number = followersData.total ?? 0;

    return NextResponse.json(
      {
        user: {
          id: user.id,
          login: user.login,
          display_name: user.display_name,
          profile_image_url: user.profile_image_url,
          description: user.description,
          view_count: user.view_count,
        },
        isLive: !!stream,
        stream: stream
          ? {
              title: stream.title,
              game_name: stream.game_name,
              viewer_count: stream.viewer_count,
              started_at: stream.started_at,
              thumbnail_url: stream.thumbnail_url,
            }
          : null,
        vods: vods.map((v: Record<string, unknown>) => ({
          id: v.id,
          title: v.title,
          url: v.url,
          thumbnail_url: v.thumbnail_url,
          view_count: v.view_count,
          duration: v.duration,
          created_at: v.created_at,
          description: v.description,
        })),
        followersCount,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (err) {
    console.error("Twitch API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Twitch data" },
      { status: 500 }
    );
  }
}
