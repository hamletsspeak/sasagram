import pg from "pg";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_USERNAME = process.env.TWITCH_USERNAME ?? "sasavot";

const DB_CONNECTION_STRING =
  process.env.SUPABASE_DB_URL ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL_UNPOOLED;

const DB_HOST = process.env.PGHOST ?? process.env.POSTGRES_HOST ?? "localhost";
const DB_PORT = Number(process.env.PGPORT ?? process.env.POSTGRES_PORT ?? 5432);
const DB_USER = process.env.PGUSER ?? process.env.POSTGRES_USER ?? "postgres";
const DB_PASSWORD = process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? "123";
const DB_NAME = process.env.PGDATABASE ?? process.env.POSTGRES_DATABASE ?? "sasagram_streams";

const START_2026 = new Date("2026-01-01T00:00:00.000Z");

const { Client } = pg;

async function getAccessToken() {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error("TWITCH_CLIENT_ID/TWITCH_CLIENT_SECRET не заданы");
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!response.ok) {
    throw new Error(`Ошибка получения токена Twitch: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getUserId(token) {
  const response = await fetch(`https://api.twitch.tv/helix/users?login=${TWITCH_USERNAME}`, {
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка получения пользователя Twitch: ${response.status}`);
  }

  const data = await response.json();
  const user = data.data?.[0];

  if (!user) {
    throw new Error(`Пользователь ${TWITCH_USERNAME} не найден`);
  }

  return user.id;
}

async function fetchAllVideosSince2026(token, userId) {
  const videos = [];
  let cursor = null;
  let stop = false;

  while (!stop) {
    const url = new URL("https://api.twitch.tv/helix/videos");
    url.searchParams.set("user_id", userId);
    url.searchParams.set("type", "archive");
    url.searchParams.set("first", "100");

    if (cursor) {
      url.searchParams.set("after", cursor);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения видео Twitch: ${response.status}`);
    }

    const data = await response.json();
    const batch = data.data ?? [];

    if (batch.length === 0) {
      break;
    }

    for (const vod of batch) {
      const createdAt = new Date(vod.created_at);
      if (createdAt < START_2026) {
        stop = true;
        break;
      }

      videos.push(vod);
    }

    cursor = data.pagination?.cursor ?? null;
    if (!cursor) {
      break;
    }
  }

  return videos;
}

async function main() {
  const token = await getAccessToken();
  const userId = await getUserId(token);
  const videos = await fetchAllVideosSince2026(token, userId);

  const client = DB_CONNECTION_STRING
    ? new Client({
        connectionString: DB_CONNECTION_STRING,
        ssl: DB_CONNECTION_STRING.includes("pooler.supabase.com") ? { rejectUnauthorized: false } : undefined,
      })
    : new Client({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
      });

  await client.connect();

  let synced = 0;

  try {
    for (const vod of videos) {
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
        [
          vod.id,
          vod.title ?? null,
          vod.url ?? null,
          vod.thumbnail_url ?? null,
          Number(vod.view_count ?? 0),
          vod.duration ?? null,
          vod.created_at,
          vod.description ?? null,
        ]
      );

      synced += 1;
    }
  } finally {
    await client.end();
  }

  console.log(`Импортировано VOD с 2026-01-01: ${synced}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
