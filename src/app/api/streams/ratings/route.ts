import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConnectivityError } from "@/server/db/pool";
import { getAnonymousViewer } from "@/server/streams/rating-cookie";
import { getRatedStreams } from "@/server/streams/rating-service";
import { syncCurrentLiveStream } from "@/server/streams/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const viewer = getAnonymousViewer(request);

  try {
    await syncCurrentLiveStream().catch(() => null);
    const streams = await getRatedStreams(viewer.tokenHash);
    const response = NextResponse.json(
      {
        streams,
        policy: "single-vote-no-update",
        viewerScope: "browser-device",
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );

    viewer.applyCookie(response);
    return response;
  } catch (error) {
    console.error("GET /api/streams/ratings error:", error);

    if (isDatabaseConnectivityError(error)) {
      const response = NextResponse.json(
        { error: "База данных временно недоступна. Повторите попытку позже." },
        { status: 503 }
      );
      viewer.applyCookie(response);
      return response;
    }

    const response = NextResponse.json({ error: "Не удалось получить рейтинги стримов" }, { status: 500 });
    viewer.applyCookie(response);
    return response;
  }
}
