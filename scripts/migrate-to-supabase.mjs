import pg from "pg";

const { Client } = pg;

const sourceConnectionString =
  process.env.SOURCE_DATABASE_URL ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL;

const targetConnectionString =
  process.env.TARGET_DATABASE_URL ??
  process.env.SUPABASE_DB_URL ??
  process.env.SUPABASE_DATABASE_URL;

if (!sourceConnectionString) {
  throw new Error("Missing SOURCE_DATABASE_URL (or DATABASE_URL/POSTGRES_URL) for source DB");
}

if (!targetConnectionString) {
  throw new Error("Missing TARGET_DATABASE_URL (or SUPABASE_DB_URL/SUPABASE_DATABASE_URL) for Supabase DB");
}

const TABLES = ["streams", "twitch_vods", "twitch_clips", "app_cache_state"];

async function run() {
  const source = new Client({ connectionString: sourceConnectionString });
  const target = new Client({ connectionString: targetConnectionString });

  await source.connect();
  await target.connect();

  try {
    for (const table of TABLES) {
      const result = await source.query(`SELECT * FROM ${table}`);
      const rows = result.rows;

      if (rows.length === 0) {
        console.log(`[${table}] no rows to migrate`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const quotedColumns = columns.map((col) => `"${col}"`).join(", ");
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

      let conflictClause = "";
      if (table === "streams") {
        conflictClause = ` ON CONFLICT (started_at) DO UPDATE SET ${columns
          .filter((col) => col !== "id")
          .map((col) => `"${col}" = EXCLUDED."${col}"`)
          .join(", ")}`;
      } else if (["twitch_vods", "twitch_clips", "app_cache_state"].includes(table)) {
        conflictClause = ` ON CONFLICT (id) DO UPDATE SET ${columns
          .filter((col) => col !== "id")
          .map((col) => `"${col}" = EXCLUDED."${col}"`)
          .join(", ")}`;
        if (table === "app_cache_state") {
          conflictClause = ` ON CONFLICT (key) DO UPDATE SET ${columns
            .filter((col) => col !== "key")
            .map((col) => `"${col}" = EXCLUDED."${col}"`)
            .join(", ")}`;
        }
      }

      const insertSql = `INSERT INTO ${table} (${quotedColumns}) VALUES (${placeholders})${conflictClause}`;

      for (const row of rows) {
        const values = columns.map((column) => row[column]);
        await target.query(insertSql, values);
      }

      console.log(`[${table}] migrated ${rows.length} rows`);
    }
  } finally {
    await source.end();
    await target.end();
  }
}

await run();
