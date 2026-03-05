import { Pool, PoolClient, QueryResultRow } from "pg";

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

async function upsertWithExecutor<T extends QueryResultRow>(
  executor: Pool | PoolClient,
  input: { startedAtIso: string; durationHours: number; title: string | null; streamUrl: string | null }
) {
  const result = await executor.query<T>(UPSERT_STREAM_SQL, [
    input.startedAtIso,
    input.durationHours,
    input.title,
    input.streamUrl,
  ]);

  return result.rows[0];
}

export async function upsertStream(pool: Pool, input: { startedAtIso: string; durationHours: number; title: string | null; streamUrl: string | null }) {
  return upsertWithExecutor(pool, input);
}

export async function upsertStreams(pool: Pool, inputs: Array<{ startedAtIso: string; durationHours: number; title: string | null; streamUrl: string | null }>) {
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
