"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchJsonWithCache } from "@/shared/lib/client-api-cache";
import { Clip, TwitchData } from "@/features/twitch/types";

export function useTwitchMedia() {
  const [data, setData] = useState<TwitchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [vodPage, setVodPage] = useState(0);
  const [clipsPage, setClipsPage] = useState(0);

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

  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 768) setItemsPerPage(1);
      else if (width < 1200) setItemsPerPage(2);
      else if (width < 1536) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const clips = useMemo<Clip[]>(
    () => [...(data?.clips ?? [])].sort((a, b) => b.view_count - a.view_count),
    [data?.clips]
  );

  const totalVodPages = Math.max(1, Math.ceil((data?.vods.length ?? 0) / itemsPerPage));
  const totalClipPages = Math.max(1, Math.ceil(clips.length / itemsPerPage));

  const safeVodPage = Math.min(vodPage, totalVodPages - 1);
  const safeClipsPage = Math.min(clipsPage, totalClipPages - 1);

  const visibleVods = useMemo(() => {
    const start = safeVodPage * itemsPerPage;
    return (data?.vods ?? []).slice(start, start + itemsPerPage);
  }, [data?.vods, safeVodPage, itemsPerPage]);

  const visibleClips = useMemo(() => {
    const start = safeClipsPage * itemsPerPage;
    return clips.slice(start, start + itemsPerPage);
  }, [clips, safeClipsPage, itemsPerPage]);

  return {
    data,
    loading,
    error,
    itemsPerPage,
    clips,
    visibleVods,
    visibleClips,
    totalVodPages,
    totalClipPages,
    safeVodPage,
    safeClipsPage,
    setVodPage,
    setClipsPage,
  };
}
