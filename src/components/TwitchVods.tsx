"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

interface Vod {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  view_count: number;
  duration: string;
  created_at: string;
}

interface Clip {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  view_count: number;
  created_at: string;
  duration?: number;
}

interface TwitchData {
  user: {
    id: string;
    display_name: string;
  };
  vods: Vod[];
  clips?: Clip[];
}

function formatDuration(duration: string): string {
  const hours = duration.match(/(\d+)h/)?.[1];
  const minutes = duration.match(/(\d+)m/)?.[1];
  const seconds = duration.match(/(\d+)s/)?.[1];
  if (hours) return `${hours}:${(minutes ?? "0").padStart(2, "0")}:${(seconds ?? "0").padStart(2, "0")}`;
  if (minutes) return `${minutes}:${(seconds ?? "0").padStart(2, "0")}`;
  return `0:${(seconds ?? "0").padStart(2, "0")}`;
}

function formatClipDuration(seconds?: number): string {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getThumbnailUrl(url: string, width = 640, height = 360): string {
  return url.replace("%{width}", String(width)).replace("%{height}", String(height));
}

const arrowButtonBaseClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-35 active:translate-y-[1px]";
const actionButtonBaseClass =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all active:translate-y-[1px]";

export default function TwitchVods() {
  const [data, setData] = useState<TwitchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [vodPage, setVodPage] = useState(0);
  const [clipsPage, setClipsPage] = useState(0);

  useEffect(() => {
    fetch("/api/twitch")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((json: TwitchData) => {
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

  const clips = useMemo(
    () => [...(data?.clips ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
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

  return (
    <section id="vods" className="h-screen overflow-hidden bg-[radial-gradient(75%_90%_at_50%_0%,rgba(24,30,82,0.55),transparent_65%),#0b1227] py-10">
      <div className="mx-auto flex h-full w-full max-w-[1680px] flex-col px-6">
        <div className="mb-4 shrink-0 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-purple-300">Twitch Media</p>
          <h2 className="mb-2 text-4xl font-black text-white md:text-5xl">Записи и лучшие клипы</h2>
          <p className="text-gray-400">Карточки выровнены, количество на экране ограничено</p>
        </div>

        {loading ? (
          <div className="grid h-full min-h-0 grid-rows-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] animate-pulse" />
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] animate-pulse" />
          </div>
        ) : error || !data ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="mb-3 text-lg text-gray-200">Не удалось загрузить Twitch данные</p>
              <a href="https://www.twitch.tv/sasavot/videos" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline hover:text-purple-200">
                Открыть Twitch
              </a>
            </div>
          </div>
        ) : (
          <div className="grid h-full min-h-0 grid-rows-2 gap-4">
            <div className="flex min-h-0 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Записи стримов</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVodPage((prev) => Math.max(0, Math.min(prev, totalVodPages - 1) - 1))}
                    disabled={safeVodPage === 0}
                    className={`${arrowButtonBaseClass} border border-cyan-400/35 bg-cyan-500/10 text-cyan-100 shadow-[0_3px_0_rgba(8,145,178,0.45)] hover:bg-cyan-500/20 active:shadow-[0_1px_0_rgba(8,145,178,0.45)]`}
                    aria-label="Предыдущая страница записей"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                      <path d="M11.5 4.5 6 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVodPage((prev) => Math.min(totalVodPages - 1, Math.min(prev, totalVodPages - 1) + 1))}
                    disabled={safeVodPage >= totalVodPages - 1}
                    className={`${arrowButtonBaseClass} border border-cyan-400/35 bg-cyan-500/10 text-cyan-100 shadow-[0_3px_0_rgba(8,145,178,0.45)] hover:bg-cyan-500/20 active:shadow-[0_1px_0_rgba(8,145,178,0.45)]`}
                    aria-label="Следующая страница записей"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                      <path d="M8.5 4.5 14 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <a
                    href="https://www.twitch.tv/sasavot/videos?filter=all&sort=time"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${actionButtonBaseClass} border border-cyan-400/35 bg-cyan-500/10 text-cyan-100 shadow-[0_3px_0_rgba(8,145,178,0.45)] hover:bg-cyan-500/20 active:shadow-[0_1px_0_rgba(8,145,178,0.45)]`}
                  >
                    Все видео
                  </a>
                </div>
              </div>

              <div className="min-h-0 overflow-hidden">
                <div className="grid h-full min-h-[205px] gap-3" style={{ gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))` }}>
                  {visibleVods.map((vod) => (
                    <a key={vod.id} href={vod.url} target="_blank" rel="noopener noreferrer" className="group relative h-full overflow-hidden rounded-2xl border border-cyan-300/30 bg-black/30">
                      <Image src={getThumbnailUrl(vod.thumbnail_url, 960, 540)} alt={vod.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
                      <div className="absolute right-3 top-3 rounded-lg bg-black/80 px-2 py-1 text-xs font-mono text-white">{formatDuration(vod.duration)}</div>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="line-clamp-2 text-xl font-black leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)] md:text-2xl">{vod.title}</h3>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-cyan-100/90 md:text-sm">
                          <span>👁 {formatViewCount(vod.view_count)}</span>
                          <span>{formatDate(vod.created_at)}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">Избранные клипы</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setClipsPage((prev) => Math.max(0, Math.min(prev, totalClipPages - 1) - 1))}
                    disabled={safeClipsPage === 0}
                    className={`${arrowButtonBaseClass} border border-violet-400/35 bg-violet-500/10 text-violet-100 shadow-[0_3px_0_rgba(139,92,246,0.45)] hover:bg-violet-500/20 active:shadow-[0_1px_0_rgba(139,92,246,0.45)]`}
                    aria-label="Предыдущая страница клипов"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                      <path d="M11.5 4.5 6 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClipsPage((prev) => Math.min(totalClipPages - 1, Math.min(prev, totalClipPages - 1) + 1))}
                    disabled={safeClipsPage >= totalClipPages - 1}
                    className={`${arrowButtonBaseClass} border border-violet-400/35 bg-violet-500/10 text-violet-100 shadow-[0_3px_0_rgba(139,92,246,0.45)] hover:bg-violet-500/20 active:shadow-[0_1px_0_rgba(139,92,246,0.45)]`}
                    aria-label="Следующая страница клипов"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                      <path d="M8.5 4.5 14 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <a
                    href="https://www.twitch.tv/sasavot/videos?featured=true&filter=clips&range=all"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${actionButtonBaseClass} border border-violet-400/35 bg-violet-500/10 text-violet-100 shadow-[0_3px_0_rgba(139,92,246,0.45)] hover:bg-violet-500/20 active:shadow-[0_1px_0_rgba(139,92,246,0.45)]`}
                  >
                    Все клипы
                  </a>
                </div>
              </div>

              <div className="min-h-0 overflow-hidden">
                <div className="grid h-full min-h-[195px] gap-3" style={{ gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))` }}>
                  {visibleClips.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-violet-400/25 text-gray-400" style={{ gridColumn: `1 / -1` }}>
                      Клипы пока не найдены
                    </div>
                  ) : (
                    visibleClips.map((clip) => (
                      <a key={clip.id} href={clip.url} target="_blank" rel="noopener noreferrer" className="group relative h-full overflow-hidden rounded-2xl border border-violet-300/25 bg-black/25">
                        <Image src={clip.thumbnail_url} alt={clip.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                        <div className="absolute right-3 top-3 rounded-lg bg-black/80 px-2 py-1 text-xs font-mono text-white">{formatClipDuration(clip.duration)}</div>
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <h3 className="line-clamp-2 text-base font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)] md:text-lg">{clip.title}</h3>
                          <div className="mt-2 flex items-center gap-3 text-xs text-violet-100/90">
                            <span>👁 {formatViewCount(clip.view_count)}</span>
                            <span>{formatDate(clip.created_at)}</span>
                          </div>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
