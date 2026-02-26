"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Vod {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  view_count: number;
  duration: string;
  created_at: string;
  description: string;
}

interface TwitchData {
  isLive: boolean;
  stream: {
    title: string;
    game_name: string;
    viewer_count: number;
    thumbnail_url: string;
  } | null;
  vods: Vod[];
  followersCount: number;
}

function formatDuration(duration: string): string {
  // Twitch duration format: "1h2m3s" or "45m30s" or "1h30m"
  const hours = duration.match(/(\d+)h/)?.[1];
  const minutes = duration.match(/(\d+)m/)?.[1];
  const seconds = duration.match(/(\d+)s/)?.[1];

  if (hours) {
    return `${hours}:${(minutes ?? "0").padStart(2, "0")}:${(seconds ?? "0").padStart(2, "0")}`;
  }
  if (minutes) {
    return `${minutes}:${(seconds ?? "0").padStart(2, "0")}`;
  }
  return `0:${(seconds ?? "0").padStart(2, "0")}`;
}

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getThumbnailUrl(url: string, width = 640, height = 360): string {
  return url.replace("%{width}", String(width)).replace("%{height}", String(height));
}

export default function TwitchVods() {
  const [data, setData] = useState<TwitchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  return (
    <section id="vods" className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Twitch
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Записи стримов
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Последние трансляции с Twitch — смотри в любое время
          </p>
        </div>

        {/* Live banner */}
        {data?.isLive && data.stream && (
          <a
            href="https://www.twitch.tv/sasavot"
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-10 rounded-2xl overflow-hidden border border-red-500/40 hover:border-red-500/70 transition-colors group"
          >
            <div className="relative">
              <Image
                src={getThumbnailUrl(data.stream.thumbnail_url, 1280, 720)}
                alt={data.stream.title}
                width={1280}
                height={720}
                className="w-full object-cover max-h-72 group-hover:scale-[1.01] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg md:text-xl line-clamp-1">
                  {data.stream.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-purple-300 text-sm">{data.stream.game_name}</span>
                  <span className="text-gray-400 text-sm">
                    👁 {formatViewCount(data.stream.viewer_count)} зрителей
                  </span>
                </div>
              </div>
            </div>
          </a>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-700" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📡</div>
            <p className="text-gray-400 text-lg mb-2">Не удалось загрузить записи</p>
            <p className="text-gray-600 text-sm mb-6">
              Проверьте настройки Twitch API или попробуйте позже
            </p>
            <a
              href="https://www.twitch.tv/sasavot/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
              </svg>
              Смотреть на Twitch
            </a>
          </div>
        )}

        {/* VODs grid */}
        {!loading && !error && data && (
          <>
            {data.vods.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🎬</div>
                <p className="text-gray-400 text-lg">Записей пока нет</p>
                <p className="text-gray-600 text-sm mt-2">
                  Следи за стримами в прямом эфире!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.vods.map((vod) => (
                  <a
                    key={vod.id}
                    href={vod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-gray-700">
                      {vod.thumbnail_url ? (
                        <Image
                          src={getThumbnailUrl(vod.thumbnail_url, 640, 360)}
                          alt={vod.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                          </svg>
                        </div>
                      )}
                      {/* Duration badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-mono px-2 py-0.5 rounded">
                        {formatDuration(vod.duration)}
                      </div>
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30">
                        <div className="w-14 h-14 rounded-full bg-purple-600/90 flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-purple-300 transition-colors leading-snug">
                        {vod.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto pt-2">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {formatViewCount(vod.view_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(vod.created_at)}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* View all link */}
            <div className="text-center mt-10">
              <a
                href="https://www.twitch.tv/sasavot/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/40 text-white font-semibold rounded-xl transition-all duration-200"
              >
                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                </svg>
                Все записи на Twitch
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
