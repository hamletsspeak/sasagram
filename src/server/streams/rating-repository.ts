import { Pool } from "pg";
import { StreamRatingRow, StreamRatingSummaryRow } from "@/server/streams/rating-types";

export async function listStreamsWithRatings(pool: Pool, viewerTokenHash: string) {
  const result = await pool.query<StreamRatingRow>(
    `
      SELECT
        s.id::text,
        s.started_at,
        s.duration_hours,
        s.title,
        s.stream_url,
        vod.thumbnail_url,
        s.created_at,
        stats.rating_avg,
        COALESCE(stats.rating_count, 0) AS rating_count,
        viewer.rating AS my_rating
      FROM streams AS s
      LEFT JOIN (
        SELECT
          stream_id,
          ROUND(AVG(rating)::numeric, 2) AS rating_avg,
          COUNT(*)::int AS rating_count
        FROM stream_ratings
        GROUP BY stream_id
      ) AS stats
        ON stats.stream_id = s.id
      LEFT JOIN stream_ratings AS viewer
        ON viewer.stream_id = s.id
       AND viewer.viewer_token_hash = $1
      LEFT JOIN twitch_vods AS vod
        ON vod.url = s.stream_url
      ORDER BY s.started_at DESC
    `,
    [viewerTokenHash]
  );

  return result.rows;
}

export async function streamExists(pool: Pool, streamId: number) {
  const result = await pool.query<{ exists: boolean }>(
    `
      SELECT EXISTS(
        SELECT 1
        FROM streams
        WHERE id = $1
      ) AS exists
    `,
    [streamId]
  );

  return Boolean(result.rows[0]?.exists);
}

export async function insertStreamRating(
  pool: Pool,
  input: { streamId: number; viewerTokenHash: string; rating: number }
) {
  const result = await pool.query<{ rating: number }>(
    `
      INSERT INTO stream_ratings (stream_id, viewer_token_hash, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (stream_id, viewer_token_hash) DO NOTHING
      RETURNING rating
    `,
    [input.streamId, input.viewerTokenHash, input.rating]
  );

  return result.rows[0] ?? null;
}

export async function getStreamRatingSummary(
  pool: Pool,
  input: { streamId: number; viewerTokenHash: string }
) {
  const result = await pool.query<StreamRatingSummaryRow>(
    `
      SELECT
        stats.rating_avg,
        COALESCE(stats.rating_count, 0) AS rating_count,
        viewer.rating AS my_rating
      FROM (SELECT $1::bigint AS stream_id) AS target
      LEFT JOIN (
        SELECT
          stream_id,
          ROUND(AVG(rating)::numeric, 2) AS rating_avg,
          COUNT(*)::int AS rating_count
        FROM stream_ratings
        WHERE stream_id = $1
        GROUP BY stream_id
      ) AS stats
        ON stats.stream_id = target.stream_id
      LEFT JOIN stream_ratings AS viewer
        ON viewer.stream_id = target.stream_id
       AND viewer.viewer_token_hash = $2
    `,
    [input.streamId, input.viewerTokenHash]
  );

  return result.rows[0] ?? { rating_avg: null, rating_count: 0, my_rating: null };
}
