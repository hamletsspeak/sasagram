import { Pool, PoolClient, QueryResultRow } from "pg";

// Live stream start time and finalized VOD start time can drift by several minutes.
// Keep this window wide enough so they collapse into one stream row.
const NEAR_DUPLICATE_WINDOW_MINUTES = 20;
const FORCE_MERGE_WINDOW_MINUTES = 2;

const UPSERT_STREAM_SQL = `
  INSERT INTO streams (started_at, duration_hours, title, stream_url)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (started_at)
  DO UPDATE SET
    duration_hours = GREATEST(streams.duration_hours, EXCLUDED.duration_hours),
    title = COALESCE(EXCLUDED.title, streams.title),
    stream_url = COALESCE(EXCLUDED.stream_url, streams.stream_url)
  RETURNING id, started_at, duration_hours, created_at, title, stream_url
`;

const FIND_NEAR_DUPLICATE_STREAM_SQL = `
  SELECT
    id,
    started_at,
    duration_hours,
    created_at,
    title,
    stream_url,
    ABS(EXTRACT(EPOCH FROM (started_at - $1::timestamptz))) AS diff_seconds,
    CASE
      WHEN NULLIF(LOWER(BTRIM(title)), '') IS NOT DISTINCT FROM NULLIF(LOWER(BTRIM($2::text)), '') THEN TRUE
      ELSE FALSE
    END AS title_matches,
    CASE
      WHEN NULLIF(BTRIM(stream_url), '') IS NOT DISTINCT FROM NULLIF(BTRIM($3::text), '') THEN TRUE
      ELSE FALSE
    END AS stream_url_matches
  FROM streams
  WHERE
    ABS(EXTRACT(EPOCH FROM (started_at - $1::timestamptz))) <= ($4 * 60)
    AND DATE_TRUNC('day', started_at AT TIME ZONE 'UTC') = DATE_TRUNC('day', $1::timestamptz AT TIME ZONE 'UTC')
  ORDER BY
    title_matches DESC,
    stream_url_matches DESC,
    diff_seconds ASC,
    created_at DESC,
    id DESC
  LIMIT 1
`;

const UPDATE_STREAM_SQL = `
  UPDATE streams
  SET
    duration_hours = GREATEST(duration_hours, $2),
    title = COALESCE($3, title),
    stream_url = COALESCE($4, stream_url)
  WHERE id = $1
  RETURNING id, started_at, duration_hours, created_at, title, stream_url
`;

type StreamUpsertInput = {
  startedAtIso: string;
  durationHours: number;
  title: string | null;
  streamUrl: string | null;
};

type ExistingStreamMatchRow = QueryResultRow & {
  id: string | number;
  started_at: string;
  duration_hours: number;
  created_at: string;
  title: string | null;
  stream_url: string | null;
  diff_seconds: string | number;
  title_matches: boolean;
  stream_url_matches: boolean;
};

export async function listStreams(pool: Pool) {
  const result = await pool.query(
    `
      SELECT
        s.id,
        s.started_at,
        s.duration_hours,
        s.created_at,
        s.title,
        s.stream_url,
        stats.rating_avg AS "ratingAvg",
        COALESCE(stats.rating_count, 0)::int AS "ratingCount"
      FROM streams AS s
      LEFT JOIN (
        SELECT
          stream_id,
          ROUND(AVG(rating)::numeric, 2)::float8 AS rating_avg,
          COUNT(*)::int AS rating_count
        FROM stream_ratings
        GROUP BY stream_id
      ) AS stats
        ON stats.stream_id = s.id
      ORDER BY s.started_at DESC
    `
  );

  return result.rows;
}

async function findNearDuplicateStream<T extends ExistingStreamMatchRow>(
  executor: Pool | PoolClient,
  input: StreamUpsertInput
) {
  const result = await executor.query<T>(FIND_NEAR_DUPLICATE_STREAM_SQL, [
    input.startedAtIso,
    input.title,
    input.streamUrl,
    NEAR_DUPLICATE_WINDOW_MINUTES,
  ]);

  const match = result.rows[0];
  if (!match) {
    return null;
  }

  const diffSeconds = typeof match.diff_seconds === "number" ? match.diff_seconds : Number(match.diff_seconds);
  const isSafeForcedMerge = Number.isFinite(diffSeconds) && diffSeconds <= FORCE_MERGE_WINDOW_MINUTES * 60;

  if (match.title_matches || match.stream_url_matches || isSafeForcedMerge) {
    return match;
  }

  return null;
}

async function upsertWithExecutor<T extends QueryResultRow>(
  executor: Pool | PoolClient,
  input: StreamUpsertInput
) {
  const nearDuplicate = await findNearDuplicateStream<ExistingStreamMatchRow>(executor, input);
  if (nearDuplicate) {
    const updateResult = await executor.query<T>(UPDATE_STREAM_SQL, [
      nearDuplicate.id,
      input.durationHours,
      input.title,
      input.streamUrl,
    ]);

    return updateResult.rows[0];
  }

  const result = await executor.query<T>(UPSERT_STREAM_SQL, [
    input.startedAtIso,
    input.durationHours,
    input.title,
    input.streamUrl,
  ]);

  return result.rows[0];
}

export async function upsertStream(pool: Pool, input: StreamUpsertInput) {
  return upsertWithExecutor(pool, input);
}

export async function upsertStreams(pool: Pool, inputs: StreamUpsertInput[]) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const rows = [];
    for (const input of inputs) {
      rows.push(await upsertWithExecutor(client, input));
    }

    await client.query("COMMIT");
    return rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
