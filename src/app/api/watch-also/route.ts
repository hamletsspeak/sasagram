import { NextResponse } from "next/server";
import { getWatchAlsoPayload } from "@/server/watch-also/service";

export async function GET() {
  return NextResponse.json(
    await getWatchAlsoPayload(),
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
      },
    }
  );
}
