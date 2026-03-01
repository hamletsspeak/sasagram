import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export const runtime = "nodejs";

interface CreateStreamBody {
  startedAt?: string;
  durationHours?: number;
  title?: string;
  streamUrl?: string;
}

interface NormalizedStreamInput {
  startedAtIso: string;
  durationHours: number;
  title: string | null;
  streamUrl: string | null;
}

function normalizeStreamInput(body: CreateStreamBody):
  | { ok: true; value: NormalizedStreamInput }
  | { ok: false; error: string } {
  if (!body.startedAt || typeof body.durationHours !== "number") {
    return {
      ok: false,
      error: "Передайте startedAt (ISO дата) и durationHours (число)",
    };
  }

  const startedAt = new Date(body.startedAt);
  if (Number.isNaN(startedAt.getTime())) {
    return { ok: false, error: "startedAt должен быть валидной датой" };
  }

  if (!Number.isFinite(body.durationHours) || body.durationHours < 0) {
    return { ok: false, error: "durationHours должен быть неотрицательным числом" };
  }

  return {
    ok: true,
    value: {
      startedAtIso: startedAt.toISOString(),
      durationHours: body.durationHours,
      title: typeof body.title === "string" ? body.title.trim() || null : null,
      streamUrl: typeof body.streamUrl === "string" ? body.streamUrl.trim() || null : null,
    },
  };
}

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

export async function GET() {
  try {
    const pool = getDbPool();
    const result = await pool.query(
      `
        SELECT id, started_at, duration_hours, created_at
             , title, stream_url
        FROM streams
        ORDER BY started_at DESC
      `
    );

    return NextResponse.json({ streams: result.rows });
  } catch (error) {
    console.error("GET /api/streams error:", error);
    return NextResponse.json({ error: "Не удалось получить трансляции" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = (await request.json()) as CreateStreamBody | { streams?: CreateStreamBody[] };
    const payloads = Array.isArray((rawBody as { streams?: CreateStreamBody[] }).streams)
      ? (rawBody as { streams: CreateStreamBody[] }).streams
      : [rawBody as CreateStreamBody];

    if (payloads.length === 0) {
      return NextResponse.json({ error: "Передайте хотя бы один стрим" }, { status: 400 });
    }

    const normalized: NormalizedStreamInput[] = [];
    for (const payload of payloads) {
      const parsed = normalizeStreamInput(payload);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      normalized.push(parsed.value);
    }

    const pool = getDbPool();

    if (normalized.length === 1) {
      const item = normalized[0];
      const result = await pool.query(UPSERT_STREAM_SQL, [
        item.startedAtIso,
        item.durationHours,
        item.title,
        item.streamUrl,
      ]);

      return NextResponse.json({ stream: result.rows[0] }, { status: 201 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const rows: unknown[] = [];
      for (const item of normalized) {
        const result = await client.query(UPSERT_STREAM_SQL, [
          item.startedAtIso,
          item.durationHours,
          item.title,
          item.streamUrl,
        ]);
        rows.push(result.rows[0]);
      }

      await client.query("COMMIT");
      return NextResponse.json({ streams: rows, count: rows.length }, { status: 201 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("POST /api/streams error:", error);
    return NextResponse.json({ error: "Не удалось сохранить трансляцию" }, { status: 500 });
  }
}
