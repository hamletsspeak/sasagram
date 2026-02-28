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

async function ensureDatabase() {
  if (connectionString) {
    console.log("DATABASE_URL/POSTGRES_URL detected, skipping CREATE DATABASE step.");
    return;
  }

  const adminClient = new Client({
    host,
    port,
    user,
    password,
    database: "postgres",
  });

  await adminClient.connect();

  const dbExists = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [
    databaseName,
  ]);

  if (dbExists.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE "${databaseName}"`);
    console.log(`Database ${databaseName} created.`);
  } else {
    console.log(`Database ${databaseName} already exists.`);
  }

  await adminClient.end();
}

async function ensureStreamsTable() {
  const appClient = connectionString
    ? new Client({ connectionString })
    : new Client({
        host,
        port,
        user,
        password,
        database: databaseName,
      });

  await appClient.connect();

  await appClient.query(`
    CREATE TABLE IF NOT EXISTS streams (
      id BIGSERIAL PRIMARY KEY,
      started_at TIMESTAMPTZ NOT NULL,
      duration_hours NUMERIC(5,2) NOT NULL CHECK (duration_hours >= 0),
      title TEXT,
      stream_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await appClient.query(`ALTER TABLE streams ADD COLUMN IF NOT EXISTS title TEXT`);
  await appClient.query(`ALTER TABLE streams ADD COLUMN IF NOT EXISTS stream_url TEXT`);

  await appClient.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS streams_started_at_unique_idx
    ON streams (started_at)
  `);

  await appClient.query(`
    CREATE TABLE IF NOT EXISTS twitch_vods (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      view_count INTEGER NOT NULL DEFAULT 0,
      duration TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      description TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await appClient.query(`
    CREATE INDEX IF NOT EXISTS twitch_vods_created_at_idx
    ON twitch_vods (created_at DESC)
  `);

  await appClient.query(`
    CREATE TABLE IF NOT EXISTS twitch_clips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      view_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL,
      duration_seconds NUMERIC(6,2),
      creator_name TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await appClient.query(`
    CREATE INDEX IF NOT EXISTS twitch_clips_created_at_idx
    ON twitch_clips (created_at DESC)
  `);

  await appClient.query(`
    CREATE TABLE IF NOT EXISTS app_cache_state (
      key TEXT PRIMARY KEY,
      value_text TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  console.log("Tables streams/twitch_vods/twitch_clips are ready.");
  await appClient.end();
}

await ensureDatabase();
await ensureStreamsTable();
