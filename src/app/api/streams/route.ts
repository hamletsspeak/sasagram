import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConnectivityError } from "@/server/db/pool";
import { createStreams, getStreams, syncCurrentLiveStream } from "@/server/streams/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    await syncCurrentLiveStream().catch(() => null);
    const streams = await getStreams();
    return NextResponse.json(
      { streams },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/streams error:", error);

    if (isDatabaseConnectivityError(error)) {
      return NextResponse.json(
        {
          streams: [],
          warning: "Database is temporarily unavailable; returning empty stream history.",
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "s-maxage=10, stale-while-revalidate=20",
          },
        }
      );
    }

    return NextResponse.json({ error: "Не удалось получить трансляции" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await createStreams((await request.json()) as Record<string, unknown>);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("POST /api/streams error:", error);

    if (isDatabaseConnectivityError(error)) {
      return NextResponse.json(
        { error: "База данных временно недоступна. Повторите попытку позже." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Не удалось сохранить трансляцию" }, { status: 500 });
  }
}
