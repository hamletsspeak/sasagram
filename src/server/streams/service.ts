import { getDbPool } from "@/server/db/pool";
import { listStreams, upsertStream, upsertStreams } from "@/server/streams/repository";
import { getTwitchPayload } from "@/server/twitch/service";
import { CreateStreamBody, NormalizedStreamInput } from "@/server/streams/types";

function toMinutePrecision(date: Date): Date {
  date.setSeconds(0, 0);
  return date;
}

export function normalizeStreamInput(body: CreateStreamBody):
  | { ok: true; value: NormalizedStreamInput }
  | { ok: false; error: string } {
  if (!body.startedAt || typeof body.durationHours !== "number") {
    return { ok: false, error: "Передайте startedAt (ISO дата) и durationHours (число)" };
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
      startedAtIso: toMinutePrecision(startedAt).toISOString(),
      durationHours: body.durationHours,
      title: typeof body.title === "string" ? body.title.trim() || null : null,
      streamUrl: typeof body.streamUrl === "string" ? body.streamUrl.trim() || null : null,
    },
  };
}

export async function getStreams() {
  return listStreams(getDbPool());
}

function elapsedHoursServer(isoDate: string): number {
  const startedAt = new Date(isoDate).getTime();
  if (Number.isNaN(startedAt)) return 0;
  const diffMs = Math.max(0, Date.now() - startedAt);
  return Math.round((diffMs / 3600000) * 100) / 100;
}

export async function syncCurrentLiveStream() {
  const twitchPayload = await getTwitchPayload();
  if (!twitchPayload.ok || !twitchPayload.body.isLive || !twitchPayload.body.stream?.started_at) {
    return null;
  }

  const parsed = normalizeStreamInput({
    startedAt: twitchPayload.body.stream.started_at,
    durationHours: elapsedHoursServer(twitchPayload.body.stream.started_at),
    title: twitchPayload.body.stream.title,
    streamUrl: "https://www.twitch.tv/sasavot",
  });

  if (!parsed.ok) {
    return null;
  }

  return upsertStream(getDbPool(), parsed.value);
}

export async function createStreams(rawBody: CreateStreamBody | { streams?: CreateStreamBody[] }) {
  const payloads = Array.isArray((rawBody as { streams?: CreateStreamBody[] }).streams)
    ? (rawBody as { streams: CreateStreamBody[] }).streams
    : [rawBody as CreateStreamBody];

  if (payloads.length === 0) {
    return { ok: false as const, status: 400, error: "Передайте хотя бы один стрим" };
  }

  const normalized: NormalizedStreamInput[] = [];
  for (const payload of payloads) {
    const parsed = normalizeStreamInput(payload);
    if (!parsed.ok) {
      return { ok: false as const, status: 400, error: parsed.error };
    }
    normalized.push(parsed.value);
  }

  const pool = getDbPool();

  if (normalized.length === 1) {
    const stream = await upsertStream(pool, normalized[0]);
    return { ok: true as const, status: 201, body: { stream } };
  }

  const streams = await upsertStreams(pool, normalized);
  return { ok: true as const, status: 201, body: { streams, count: streams.length } };
}
