"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchJsonWithCache } from "@/shared/lib/client-api-cache";
import { Clip, TwitchData } from "@/features/twitch/types";

export function useTwitchMedia() {
  const [data, setData] = useState<TwitchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchJsonWithCache<TwitchData>("api:twitch", "/api/twitch", { ttlMs: 45_000 })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const clips = useMemo<Clip[]>(
    () => [...(data?.clips ?? [])].sort((a, b) => b.view_count - a.view_count),
    [data?.clips]
  );
  const vods = data?.vods ?? [];

  return {
    data,
    loading,
    error,
    vods,
    clips,
  };
}
