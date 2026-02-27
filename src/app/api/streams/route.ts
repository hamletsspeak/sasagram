import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export const runtime = "nodejs";

interface CreateStreamBody {
  startedAt?: string;
  durationHours?: number;
  title?: string;
  streamUrl?: string;
}

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
    const body = (await request.json()) as CreateStreamBody;

    if (!body.startedAt || typeof body.durationHours !== "number") {
      return NextResponse.json(
        { error: "Передайте startedAt (ISO дата) и durationHours (число)" },
        { status: 400 }
      );
    }

    const startedAt = new Date(body.startedAt);
    const durationHours = body.durationHours;
    const title = typeof body.title === "string" ? body.title.trim() : null;
    const streamUrl = typeof body.streamUrl === "string" ? body.streamUrl.trim() : null;

    if (Number.isNaN(startedAt.getTime())) {
      return NextResponse.json({ error: "startedAt должен быть валидной датой" }, { status: 400 });
    }

    if (!Number.isFinite(durationHours) || durationHours < 0) {
      return NextResponse.json(
        { error: "durationHours должен быть неотрицательным числом" },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    const result = await pool.query(
      `
        INSERT INTO streams (started_at, duration_hours, title, stream_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (started_at)
        DO UPDATE SET
          duration_hours = GREATEST(streams.duration_hours, EXCLUDED.duration_hours),
          title = COALESCE(EXCLUDED.title, streams.title),
          stream_url = COALESCE(EXCLUDED.stream_url, streams.stream_url)
        RETURNING id, started_at, duration_hours, created_at, title, stream_url
      `,
      [startedAt.toISOString(), durationHours, title || null, streamUrl || null]
    );

    return NextResponse.json({ stream: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/streams error:", error);
    return NextResponse.json({ error: "Не удалось сохранить трансляцию" }, { status: 500 });
  }
}
