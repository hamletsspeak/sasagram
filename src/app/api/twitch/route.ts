import { NextResponse } from "next/server";
import { isDatabaseConnectivityError } from "@/server/db/pool";
import { getTwitchPayload } from "@/server/twitch/service";

export async function GET() {
  try {
    const result = await getTwitchPayload();
    return NextResponse.json(result.body, {
      status: result.status,
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (err) {
    if (isDatabaseConnectivityError(err)) {
      console.warn("Twitch media cache is unavailable; request failed due to database connectivity.");
    }
    console.error("Twitch API error:", err);
    return NextResponse.json({ error: "Failed to fetch Twitch data" }, { status: 500 });
  }
}
