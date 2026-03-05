import { getDbPool } from "@/server/db/pool";
import { TwitchClip, TwitchVod } from "@/server/twitch/types";

const MEDIA_CACHE_KEY = "twitch_media_last_synced_at";

export async function getCachedMediaState(ttlMs: number) {
  const pool = getDbPool();
  const [vodsRes, clipsRes, cacheStateRes] = await Promise.all([
    pool.query(
      `
        SELECT id, title, url, thumbnail_url, view_count, duration, created_at, description
        FROM twitch_vods
        ORDER BY created_at DESC
      `
    ),
    pool.query(
      `
        SELECT id, title, url, thumbnail_url, view_count, created_at, duration_seconds AS duration, creator_name
        FROM twitch_clips
        ORDER BY created_at DESC
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
    Date.now() - (lastSyncedAt?.getTime() ?? 0) < ttlMs;

  return {
    vods: vodsRes.rows,
    clips: clipsRes.rows,
    hasRecentSync,
  };
}

export async function syncMediaCache(vods: TwitchVod[], clips: TwitchClip[]) {
  const pool = getDbPool();
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
        [vod.id, vod.title, vod.url, vod.thumbnail_url, Number(vod.view_count ?? 0), vod.duration, vod.created_at, vod.description]
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
        [clip.id, clip.title, clip.url, clip.thumbnail_url, Number(clip.view_count ?? 0), clip.created_at, Number(clip.duration ?? 0), clip.creator_name ?? null]
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
