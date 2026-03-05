import "server-only";
import { getDbPool } from "@/server/db/pool";
import { getStreamRatingSummary, insertStreamRating, listStreamsWithRatings, streamExists } from "@/server/streams/rating-repository";
import { NormalizedStreamRatingInput, RatedStream, StreamRatingRow, StreamRatingSummaryRow } from "@/server/streams/rating-types";

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapRatedStream(row: StreamRatingRow): RatedStream {
  return {
    id: row.id,
    started_at: row.started_at,
    duration_hours: row.duration_hours,
    title: row.title,
    stream_url: row.stream_url,
    thumbnailUrl: row.thumbnail_url,
    created_at: row.created_at,
    ratingAvg: toNumber(row.rating_avg),
    ratingCount: toNumber(row.rating_count) ?? 0,
    myRating: row.my_rating,
  };
}

function mapSummary(summary: StreamRatingSummaryRow) {
  return {
    ratingAvg: toNumber(summary.rating_avg),
    ratingCount: toNumber(summary.rating_count) ?? 0,
    myRating: summary.my_rating,
  };
}

export function normalizeStreamRatingInput(
  streamIdValue: string,
  rawBody: Record<string, unknown>
): { ok: true; value: NormalizedStreamRatingInput } | { ok: false; error: string } {
  const streamId = Number(streamIdValue);
  const rating = rawBody.rating;

  if (!Number.isInteger(streamId) || streamId <= 0) {
    return { ok: false, error: "stream_id должен быть положительным числом" };
  }

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "rating должен быть целым числом от 1 до 5" };
  }

  return { ok: true, value: { streamId, rating } };
}

export async function getRatedStreams(viewerTokenHash: string) {
  const rows = await listStreamsWithRatings(getDbPool(), viewerTokenHash);
  return rows.map(mapRatedStream);
}

export async function createStreamRating(
  streamIdValue: string,
  rawBody: Record<string, unknown>,
  viewerTokenHash: string
) {
  const parsed = normalizeStreamRatingInput(streamIdValue, rawBody);
  if (!parsed.ok) {
    return { ok: false as const, status: 400, error: parsed.error };
  }

  const pool = getDbPool();
  const exists = await streamExists(pool, parsed.value.streamId);

  if (!exists) {
    return { ok: false as const, status: 404, error: "Стрим не найден" };
  }

  const inserted = await insertStreamRating(pool, {
    streamId: parsed.value.streamId,
    viewerTokenHash,
    rating: parsed.value.rating,
  });

  const summary = mapSummary(
    await getStreamRatingSummary(pool, {
      streamId: parsed.value.streamId,
      viewerTokenHash,
    })
  );

  if (!inserted) {
    return {
      ok: false as const,
      status: 409,
      error: "Вы уже оценили этот стрим с этого браузера или устройства",
      body: {
        streamId: String(parsed.value.streamId),
        ...summary,
        policy: "single-vote-no-update" as const,
      },
    };
  }

  return {
    ok: true as const,
    status: 201,
    body: {
      streamId: String(parsed.value.streamId),
      ...summary,
      policy: "single-vote-no-update" as const,
    },
  };
}
