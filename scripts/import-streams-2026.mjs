import pg from "pg";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_USERNAME = process.env.TWITCH_USERNAME ?? "sasavot";

const DB_CONNECTION_STRING =
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

function parseTwitchDurationToHours(raw) {
  const hours = Number(raw.match(/(\d+)h/)?.[1] ?? 0);
  const minutes = Number(raw.match(/(\d+)m/)?.[1] ?? 0);
  const seconds = Number(raw.match(/(\d+)s/)?.[1] ?? 0);
  return Math.round((hours + minutes / 60 + seconds / 3600) * 100) / 100;
}

async function getAccessToken() {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error("TWITCH_CLIENT_ID/TWITCH_CLIENT_SECRET не заданы");
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!res.ok) {
    throw new Error(`Ошибка получения токена Twitch: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function getUserId(token) {
  const res = await fetch(`https://api.twitch.tv/helix/users?login=${TWITCH_USERNAME}`, {
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Ошибка получения пользователя Twitch: ${res.status}`);
  }

  const data = await res.json();
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

    const res = await fetch(url.toString(), {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Ошибка получения видео Twitch: ${res.status}`);
    }

    const data = await res.json();
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
    ? new Client({ connectionString: DB_CONNECTION_STRING })
    : new Client({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
      });

  await client.connect();

  let inserted = 0;
  for (const vod of videos) {
    const durationHours = parseTwitchDurationToHours(vod.duration ?? "");

    await client.query(
      `
        INSERT INTO streams (started_at, duration_hours, title, stream_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (started_at)
        DO UPDATE SET
          duration_hours = GREATEST(streams.duration_hours, EXCLUDED.duration_hours),
          title = COALESCE(EXCLUDED.title, streams.title),
          stream_url = COALESCE(EXCLUDED.stream_url, streams.stream_url)
      `,
      [vod.created_at, durationHours, vod.title ?? null, vod.url ?? null]
    );

    inserted += 1;
  }

  await client.end();
  console.log(`Импортировано стримов с 2026-01-01: ${inserted}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
