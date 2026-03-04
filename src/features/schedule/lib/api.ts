"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchJsonWithCache } from "@/shared/lib/client-api-cache";
import { DbStream, LiveActualStart, StreamData, StreamsResponse } from "@/features/schedule/types";
import { dateKey, elapsedHours, parseTwitchDurationToHours } from "@/features/schedule/lib/date";

function mergeDbStreams(prev: DbStream[], incoming: DbStream): DbStream[] {
  const next = [...prev];
  const index = next.findIndex((item) => item.started_at === incoming.started_at);
  if (index >= 0) next[index] = incoming;
  else next.push(incoming);
  return next;
}

export function useScheduleData() {
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [dbStreams, setDbStreams] = useState<DbStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const syncedVodSignaturesRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [stream, persisted] = await Promise.all([
          fetchJsonWithCache<StreamData>("api:twitch", "/api/twitch", { ttlMs: 45_000 }),
          fetchJsonWithCache<StreamsResponse>("api:streams", "/api/streams", { ttlMs: 45_000 }),
        ]);

        if (!isMounted) return;

        setStreamData(stream);
        setDbStreams(persisted.streams ?? []);
        setError(false);
        setLoading(false);
      } catch {
        if (!isMounted) return;
        setError(true);
        setLoading(false);
      }
    };

    loadData();
    const intervalId = window.setInterval(loadData, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const liveActualStart = useMemo<LiveActualStart | null>(() => {
    if (!streamData?.isLive || !streamData.stream?.started_at) return null;
    const startedAt = new Date(streamData.stream.started_at);
    return { key: dateKey(startedAt), startedAt: streamData.stream.started_at, title: streamData.stream.title || "Прямой эфир" };
  }, [streamData]);

  useEffect(() => {
    if (!liveActualStart) return;

    let isMounted = true;
    const syncLiveDuration = async () => {
      const durationHours = elapsedHours(liveActualStart.startedAt);
      const response = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startedAt: liveActualStart.startedAt,
          durationHours,
          title: liveActualStart.title,
          streamUrl: "https://www.twitch.tv/sasavot",
        }),
      });

      if (!response.ok) throw new Error("Не удалось сохранить активный стрим");
      const payload = (await response.json()) as { stream: DbStream };
      if (isMounted) {
        setDbStreams((prev) => mergeDbStreams(prev, payload.stream));
      }
    };

    syncLiveDuration().catch(() => {});
    const intervalId = window.setInterval(() => {
      syncLiveDuration().catch(() => {});
    }, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [liveActualStart]);

  const vodSyncKey = useMemo(
    () =>
      (streamData?.vods ?? [])
        .map((vod) => `${vod.id}|${vod.created_at}|${vod.duration}|${vod.url}|${vod.title}`)
        .join(";"),
    [streamData?.vods]
  );

  useEffect(() => {
    if (!streamData?.vods?.length) return;

    const syncVods = async () => {
      const changedVods = streamData.vods.filter((vod) => {
        const signature = `${vod.created_at}|${vod.duration}|${vod.url}|${vod.title}`;
        return syncedVodSignaturesRef.current.get(vod.id) !== signature;
      });

      if (changedVods.length === 0) return;

      const response = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streams: changedVods.map((vod) => ({
            startedAt: vod.created_at,
            durationHours: parseTwitchDurationToHours(vod.duration),
            title: vod.title,
            streamUrl: vod.url,
          })),
        }),
      });

      if (!response.ok) return;

      const payload = (await response.json()) as { streams?: DbStream[]; stream?: DbStream };
      const syncedStreams = payload.streams ?? (payload.stream ? [payload.stream] : []);

      setDbStreams((prev) => syncedStreams.reduce(mergeDbStreams, prev));

      for (const vod of changedVods) {
        const signature = `${vod.created_at}|${vod.duration}|${vod.url}|${vod.title}`;
        syncedVodSignaturesRef.current.set(vod.id, signature);
      }
    };

    syncVods().catch(() => {});
  }, [streamData?.vods, vodSyncKey]);

  useEffect(() => {
    if (!streamData?.vods?.length) return;

    const activeIds = new Set(streamData.vods.map((vod) => vod.id));
    for (const id of syncedVodSignaturesRef.current.keys()) {
      if (!activeIds.has(id)) {
        syncedVodSignaturesRef.current.delete(id);
      }
    }
  }, [streamData?.vods]);

  return {
    streamData,
    liveActualStart,
    dbStreams,
    loading,
    error,
  };
}
