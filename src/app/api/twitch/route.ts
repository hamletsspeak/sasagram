import { NextResponse } from "next/server";
import { getDbPool, isDatabaseConnectivityError } from "@/lib/db";
import { getTwitchAppAccessToken } from "@/lib/twitch-auth";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const TWITCH_USERNAME = "sasavot";
const MEDIA_CACHE_KEY = "twitch_media_last_synced_at";
const MEDIA_CACHE_TTL_MS = 10 * 60 * 1000;

type TwitchVod = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  view_count: number;
  duration: string;
  created_at: string;
  description: string;
};

type TwitchClip = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  view_count: number;
  created_at: string;
  duration: number;
  creator_name: string;
};

async function getCachedMediaState() {
  const pool = getDbPool();
  const [vodsRes, clipsRes, cacheStateRes] = await Promise.all([
    pool.query(
      `
        SELECT id, title, url, thumbnail_url, view_count, duration, created_at, description
        FROM twitch_vods
        ORDER BY created_at DESC
        LIMIT 20
      `
    ),
    pool.query(
      `
        SELECT id, title, url, thumbnail_url, view_count, created_at, duration_seconds AS duration, creator_name
        FROM twitch_clips
        ORDER BY created_at DESC
        LIMIT 20
      `
    ),
    pool.query(
      `
        SELECT value_text
        FROM app_cache_state
        WHERE key = $1
        LIMIT 1
      `,
      [MEDIA_CACHE_KEY]
    ),
  ]);

  const lastSyncedAtRaw = cacheStateRes.rows[0]?.value_text as string | undefined;
  const lastSyncedAt = lastSyncedAtRaw ? new Date(lastSyncedAtRaw) : null;
  const hasRecentSync =
    Boolean(lastSyncedAt) &&
    Number.isFinite(lastSyncedAt?.getTime()) &&
    Date.now() - (lastSyncedAt?.getTime() ?? 0) < MEDIA_CACHE_TTL_MS;

  return {
    vods: vodsRes.rows,
    clips: clipsRes.rows,
    hasRecentSync,
  };
}

async function syncMediaCache(headers: Record<string, string>, userId: string) {
  const pool = getDbPool();

  const [vodsRes, clipsRes] = await Promise.all([
    fetch(`https://api.twitch.tv/helix/videos?user_id=${userId}&type=archive&first=20`, { headers }),
    fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${userId}&first=20`, { headers }),
  ]);

  if (!vodsRes.ok || !clipsRes.ok) {
    throw new Error("Failed to fetch Twitch media");
  }

  const vodsJson = (await vodsRes.json()) as { data?: TwitchVod[] };
  const clipsJson = (await clipsRes.json()) as { data?: TwitchClip[] };
  const vods = vodsJson.data ?? [];
  const clips = clipsJson.data ?? [];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const vod of vods) {
      await client.query(
        `
          INSERT INTO twitch_vods (id, title, url, thumbnail_url, view_count, duration, created_at, description, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (id)
          DO UPDATE SET
            title = EXCLUDED.title,
            url = EXCLUDED.url,
            thumbnail_url = EXCLUDED.thumbnail_url,
            view_count = EXCLUDED.view_count,
            duration = EXCLUDED.duration,
            created_at = EXCLUDED.created_at,
            description = EXCLUDED.description,
            updated_at = NOW()
        `,
        [
          vod.id,
          vod.title,
          vod.url,
          vod.thumbnail_url,
          Number(vod.view_count ?? 0),
          vod.duration,
          vod.created_at,
          vod.description,
        ]
      );
    }

    for (const clip of clips) {
      await client.query(
        `
          INSERT INTO twitch_clips (id, title, url, thumbnail_url, view_count, created_at, duration_seconds, creator_name, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (id)
          DO UPDATE SET
            title = EXCLUDED.title,
            url = EXCLUDED.url,
            thumbnail_url = EXCLUDED.thumbnail_url,
            view_count = EXCLUDED.view_count,
            created_at = EXCLUDED.created_at,
            duration_seconds = EXCLUDED.duration_seconds,
            creator_name = EXCLUDED.creator_name,
            updated_at = NOW()
        `,
        [
          clip.id,
          clip.title,
          clip.url,
          clip.thumbnail_url,
          Number(clip.view_count ?? 0),
          clip.created_at,
          Number(clip.duration ?? 0),
          clip.creator_name ?? null,
        ]
      );
    }

    await client.query(
      `
        INSERT INTO app_cache_state (key, value_text, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key)
        DO UPDATE SET
          value_text = EXCLUDED.value_text,
          updated_at = NOW()
      `,
      [MEDIA_CACHE_KEY, new Date().toISOString()]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    const token = await getTwitchAppAccessToken(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);

    const headers = {
      "Client-ID": TWITCH_CLIENT_ID,
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      const cacheState = await getCachedMediaState();
      vods = cacheState.vods;
      clips = cacheState.clips;
      hasRecentSync = cacheState.hasRecentSync;
    } catch (cacheError) {
      if (!isDatabaseConnectivityError(cacheError)) {
        throw cacheError;
      }

      console.warn("Twitch media cache read skipped: database is unavailable.");
    }

    if (!hasRecentSync || vods.length === 0 || clips.length === 0) {
      try {
        await syncMediaCache(headers, userId);
        const fresh = await getCachedMediaState();
        vods = fresh.vods;
        clips = fresh.clips;
      } catch (syncError) {
        if (isDatabaseConnectivityError(syncError)) {
          console.warn("Twitch media cache sync skipped: database is unavailable.");
        } else {
          console.error("Twitch media cache sync error:", syncError);
        }
      }
    }

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
        vods,
        clips,
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
    return NextResponse.json({ error: "Failed to fetch Twitch data" }, { status: 500 });
  }
}
