import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConnectivityError } from "@/server/db/pool";
import { getAnonymousViewer } from "@/server/streams/rating-cookie";
import { createStreamRating } from "@/server/streams/rating-service";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const viewer = getAnonymousViewer(request);

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createStreamRating(id, body, viewer.tokenHash);

    if (!result.ok) {
      const response = NextResponse.json(
        result.body ? { error: result.error, ...result.body } : { error: result.error },
        { status: result.status }
      );
      viewer.applyCookie(response);
      return response;
    }

    const response = NextResponse.json(result.body, { status: result.status });
    viewer.applyCookie(response);
    return response;
  } catch (error) {
    console.error("POST /api/streams/[id]/rating error:", error);

    if (isDatabaseConnectivityError(error)) {
      const response = NextResponse.json(
        { error: "База данных временно недоступна. Повторите попытку позже." },
        { status: 503 }
      );
      viewer.applyCookie(response);
      return response;
    }

    const response = NextResponse.json({ error: "Не удалось сохранить оценку" }, { status: 500 });
    viewer.applyCookie(response);
    return response;
  }
}
