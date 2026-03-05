"use client";

import { RatedStreamsResponse, SubmitRatingConflict, SubmitRatingSuccess } from "@/features/ratings/types";

export async function fetchRatedStreams(): Promise<RatedStreamsResponse> {
  const response = await fetch("/api/streams/ratings", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Не удалось загрузить список стримов");
  }

  return (await response.json()) as RatedStreamsResponse;
}

export async function submitStreamRating(streamId: string, rating: number): Promise<SubmitRatingSuccess> {
  const response = await fetch(`/api/streams/${streamId}/rating`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ rating }),
  });

  const payload = (await response.json().catch(() => null)) as (SubmitRatingSuccess & { error?: string }) | null;

  if (response.status === 409) {
    const conflict = payload as SubmitRatingConflict | null;
    throw Object.assign(new Error(conflict?.error ?? "Повторное голосование запрещено"), {
      code: "ALREADY_RATED",
      payload: conflict,
    });
  }

  if (!response.ok || !payload) {
    throw new Error(payload?.error ?? "Не удалось отправить оценку");
  }

  return payload;
}
