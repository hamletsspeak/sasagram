import { Pool } from "pg";

let pool: Pool | null = null;

function getConnectionString(): string {
  const envConnectionString =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL_UNPOOLED;

  if (envConnectionString) {
    return envConnectionString;
  }

  const host = process.env.PGHOST ?? process.env.POSTGRES_HOST ?? "localhost";
  const port = process.env.PGPORT ?? process.env.POSTGRES_PORT ?? "5432";
  const user = process.env.PGUSER ?? process.env.POSTGRES_USER ?? "postgres";
  const password = process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? "123";
  const database = process.env.PGDATABASE ?? process.env.POSTGRES_DATABASE ?? "sasagram_streams";
  const sslMode = process.env.PGSSLMODE ?? (host.includes("neon.tech") ? "require" : null);

  const connection = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;

  if (!sslMode) {
    return connection;
  }

  return `${connection}?sslmode=${encodeURIComponent(sslMode)}`;
}

export function getDbPool(): Pool {
  if (pool) {
    return pool;
  }

  pool = new Pool({ connectionString: getConnectionString() });
  return pool;
}
