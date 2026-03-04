import { Pool } from "pg";

let pool: Pool | null = null;
const CONNECTIVITY_ERROR_CODES = new Set(["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ETIMEDOUT", "ENETUNREACH"]);

type ErrorLike = {
  code?: string;
  message?: string;
};

function normalizeConnectionString(connectionString: string): string {
  try {
    const parsed = new URL(connectionString);
    const host = parsed.hostname;
    const isSupabasePooler = host.includes("pooler.supabase.com");
    const requiresSsl = host.includes("neon.tech") || host.includes("supabase.co");
    const hasSslConfig = parsed.searchParams.has("sslmode") || parsed.searchParams.has("ssl");

    if (requiresSsl && !hasSslConfig && !isSupabasePooler) {
      parsed.searchParams.set("sslmode", "verify-full");
    }

    return parsed.toString();
  } catch {
    return connectionString;
  }
}

function getConnectionString(): string {
  const envConnectionString =
    process.env.SUPABASE_DB_URL ??
    process.env.SUPABASE_DATABASE_URL ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL_UNPOOLED;

  if (envConnectionString) {
    return normalizeConnectionString(envConnectionString);
  }

  const host = process.env.PGHOST ?? process.env.POSTGRES_HOST ?? "localhost";
  const port = process.env.PGPORT ?? process.env.POSTGRES_PORT ?? "5432";
  const user = process.env.PGUSER ?? process.env.POSTGRES_USER ?? "postgres";
  const password = process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? "123";
  const database = process.env.PGDATABASE ?? process.env.POSTGRES_DATABASE ?? "sasagram_streams";
  const sslMode =
    process.env.PGSSLMODE ??
    (host.includes("neon.tech") || host.includes("supabase.co") ? "verify-full" : null);

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

  const connectionString = getConnectionString();
  const ssl = connectionString.includes("pooler.supabase.com")
    ? { rejectUnauthorized: false }
    : undefined;

  pool = new Pool({ connectionString, ssl });
  return pool;
}

export function isDatabaseConnectivityError(error: unknown): boolean {
  const err = error as ErrorLike | null | undefined;
  const code = err?.code?.toUpperCase();

  if (code && CONNECTIVITY_ERROR_CODES.has(code)) {
    return true;
  }

  const message = err?.message?.toLowerCase() ?? "";
  return message.includes("getaddrinfo") || message.includes("connect etimedout");
}
