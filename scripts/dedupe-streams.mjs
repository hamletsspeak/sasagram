import pg from "pg";

const { Client } = pg;

const connectionString =
  process.env.SUPABASE_DB_URL ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL_UNPOOLED;

const host = process.env.PGHOST ?? process.env.POSTGRES_HOST ?? "localhost";
const port = Number(process.env.PGPORT ?? process.env.POSTGRES_PORT ?? 5432);
const user = process.env.PGUSER ?? process.env.POSTGRES_USER ?? "postgres";
const password = process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? "123";
const databaseName = process.env.PGDATABASE ?? process.env.POSTGRES_DATABASE ?? "sasagram_streams";

function createClient() {
  if (connectionString) {
    return new Client({ connectionString });
  }

  return new Client({
    host,
    port,
    user,
    password,
    database: databaseName,
  });
}

async function main() {
  const client = createClient();
  await client.connect();

  try {
    await client.query("BEGIN");

    const duplicateMinutesBefore = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM (
        SELECT date_trunc('minute', started_at) AS minute_key
        FROM streams
        GROUP BY minute_key
        HAVING COUNT(*) > 1
      ) AS t
    `);

    const duplicateRowsBefore = await client.query(`
      SELECT COALESCE(SUM(group_count - 1), 0)::int AS count
      FROM (
        SELECT COUNT(*)::int AS group_count
        FROM streams
        GROUP BY date_trunc('minute', started_at)
        HAVING COUNT(*) > 1
      ) AS t
    `);

    await client.query(`
      CREATE TEMP TABLE stream_dedupe_map (
        winner_id BIGINT NOT NULL,
        loser_id BIGINT NOT NULL
      ) ON COMMIT DROP
    `);

    await client.query(`
      WITH ranked AS (
        SELECT
          s.id,
          date_trunc('minute', s.started_at) AS minute_key,
          FIRST_VALUE(s.id) OVER (
            PARTITION BY date_trunc('minute', s.started_at)
            ORDER BY
              (NULLIF(BTRIM(s.stream_url), '') IS NOT NULL) DESC,
              (NULLIF(BTRIM(s.title), '') IS NOT NULL) DESC,
              s.duration_hours DESC,
              s.created_at DESC,
              s.id DESC
          ) AS winner_id,
          ROW_NUMBER() OVER (
            PARTITION BY date_trunc('minute', s.started_at)
            ORDER BY
              (NULLIF(BTRIM(s.stream_url), '') IS NOT NULL) DESC,
              (NULLIF(BTRIM(s.title), '') IS NOT NULL) DESC,
              s.duration_hours DESC,
              s.created_at DESC,
              s.id DESC
          ) AS rn
        FROM streams AS s
      )
      INSERT INTO stream_dedupe_map (winner_id, loser_id)
      SELECT winner_id, id
      FROM ranked
      WHERE rn > 1
    `);

    await client.query(`
      UPDATE streams AS winner
      SET
        duration_hours = GREATEST(winner.duration_hours, merged.max_duration),
        title = COALESCE(NULLIF(BTRIM(winner.title), ''), merged.any_title),
        stream_url = COALESCE(NULLIF(BTRIM(winner.stream_url), ''), merged.any_stream_url)
      FROM (
        SELECT
          map.winner_id,
          MAX(source.duration_hours) AS max_duration,
          MIN(NULLIF(BTRIM(source.title), '')) AS any_title,
          MIN(NULLIF(BTRIM(source.stream_url), '')) AS any_stream_url
        FROM stream_dedupe_map AS map
        JOIN streams AS source
          ON source.id = map.loser_id
        GROUP BY map.winner_id
      ) AS merged
      WHERE winner.id = merged.winner_id
    `);

    await client.query(`
      INSERT INTO stream_ratings (stream_id, viewer_token_hash, rating, created_at)
      SELECT
        map.winner_id,
        rating.viewer_token_hash,
        rating.rating,
        rating.created_at
      FROM stream_dedupe_map AS map
      JOIN stream_ratings AS rating
        ON rating.stream_id = map.loser_id
      ON CONFLICT (stream_id, viewer_token_hash) DO UPDATE
      SET
        rating = GREATEST(stream_ratings.rating, EXCLUDED.rating),
        created_at = LEAST(stream_ratings.created_at, EXCLUDED.created_at)
    `);

    const deleted = await client.query(`
      DELETE FROM streams AS s
      USING stream_dedupe_map AS map
      WHERE s.id = map.loser_id
    `);

    await client.query(`
      UPDATE streams
      SET started_at = date_trunc('minute', started_at)
      WHERE started_at <> date_trunc('minute', started_at)
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'streams_started_at_minute_precision_check'
        ) THEN
          ALTER TABLE streams
          ADD CONSTRAINT streams_started_at_minute_precision_check
          CHECK (started_at = date_trunc('minute', started_at));
        END IF;
      END
      $$;
    `);

    await client.query("COMMIT");

    const duplicateMinutesAfter = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM (
        SELECT date_trunc('minute', started_at) AS minute_key
        FROM streams
        GROUP BY minute_key
        HAVING COUNT(*) > 1
      ) AS t
    `);

    console.log(`Duplicate minute groups before: ${duplicateMinutesBefore.rows[0].count}`);
    console.log(`Duplicate rows before: ${duplicateRowsBefore.rows[0].count}`);
    console.log(`Deleted duplicate stream rows: ${deleted.rowCount ?? 0}`);
    console.log(`Duplicate minute groups after: ${duplicateMinutesAfter.rows[0].count}`);
    console.log("Done.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
