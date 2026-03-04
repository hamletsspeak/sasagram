import { getTwitchAppAccessToken } from "@/server/twitch/auth";
import { isDatabaseConnectivityError } from "@/server/db/pool";
import { getCachedMediaState, syncMediaCache } from "@/server/twitch/repository";
import { TwitchClip, TwitchVod } from "@/server/twitch/types";

const TWITCH_USERNAME = "sasavot";
const MEDIA_CACHE_TTL_MS = 10 * 60 * 1000;

export async function getTwitchPayload() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const token = await getTwitchAppAccessToken(clientId, clientSecret);

  const headers = {
    "Client-ID": clientId!,
    Authorization: `Bearer ${token}`,
  };

  const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${TWITCH_USERNAME}`, {
    headers,
    next: { revalidate: 60 },
  });
  const userData = (await userRes.json()) as {
    data?: Array<{
      id: string;
      login: string;
      display_name: string;
      profile_image_url: string;
      description: string;
      view_count: number;
    }>;
  };
  const user = userData.data?.[0];

  if (!user) {
    return { ok: false as const, status: 404, body: { error: "User not found" } };
  }

  const userId = user.id;

  const [streamRes, followersRes] = await Promise.all([
    fetch(`https://api.twitch.tv/helix/streams?user_login=${TWITCH_USERNAME}`, {
      headers,
      next: { revalidate: 30 },
    }),
    fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}`, {
      headers,
      next: { revalidate: 60 },
    }),
  ]);

  const streamData = (await streamRes.json()) as {
    data?: Array<{
      title: string;
      game_name: string;
      viewer_count: number;
      started_at: string;
      thumbnail_url: string;
    }>;
  };
  const stream = streamData.data?.[0] ?? null;

  const followersData = (await followersRes.json()) as { total?: number };
  const followersCount = followersData.total ?? 0;

  let vods: unknown[] = [];
  let clips: unknown[] = [];
  let hasRecentSync = false;

  try {
    const cacheState = await getCachedMediaState(MEDIA_CACHE_TTL_MS);
    vods = cacheState.vods;
    clips = cacheState.clips;
    hasRecentSync = cacheState.hasRecentSync;
  } catch (error) {
    if (!isDatabaseConnectivityError(error)) {
      throw error;
    }

    console.warn("Twitch media cache read skipped: database is unavailable.");
  }

  if (!hasRecentSync || vods.length === 0 || clips.length === 0) {
    try {
      const [vodsRes, clipsRes] = await Promise.all([
        fetch(`https://api.twitch.tv/helix/videos?user_id=${userId}&type=archive&first=20`, { headers }),
        fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${userId}&first=20`, { headers }),
      ]);

      if (!vodsRes.ok || !clipsRes.ok) {
        throw new Error("Failed to fetch Twitch media");
      }

      const vodsJson = (await vodsRes.json()) as { data?: TwitchVod[] };
      const clipsJson = (await clipsRes.json()) as { data?: TwitchClip[] };
      await syncMediaCache(vodsJson.data ?? [], clipsJson.data ?? []);

      const fresh = await getCachedMediaState(MEDIA_CACHE_TTL_MS);
      vods = fresh.vods;
      clips = fresh.clips;
    } catch (error) {
      if (isDatabaseConnectivityError(error)) {
        console.warn("Twitch media cache sync skipped: database is unavailable.");
      } else {
        console.error("Twitch media cache sync error:", error);
      }
    }
  }

  return {
    ok: true as const,
    status: 200,
    body: {
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
      vods,
      clips,
      followersCount,
    },
  };
}
