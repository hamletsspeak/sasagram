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
      SELECT id, started_at, duration_hours, created_at, title, stream_url
      FROM streams
      ORDER BY started_at DESC
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
