"use client";

import { useEffect, useState } from "react";
import { fetchJsonWithCache } from "@/lib/client-api-cache";

const TWITCH_EMBED_FALLBACK_PARENTS = [
  "localhost",
  "127.0.0.1",
  "sasagram.vercel.app",
  "sasagram.d.kiloapps.io",
  "www.sasavot141.ru",
  "sasavot141.ru",
];

type LivePayload = {
  isLive: boolean;
  stream: {
    title: string;
    started_at?: string;
  } | null;
};

function getTwitchEmbedSrc(hostname: string | null): string {
  const params = new URLSearchParams({ channel: "sasavot", autoplay: "true", muted: "true" });
  const parents = new Set(TWITCH_EMBED_FALLBACK_PARENTS);
  if (hostname) parents.add(hostname);
  for (const parent of parents) params.append("parent", parent);
  return `https://player.twitch.tv/?${params.toString()}`;
}

function getTwitchChatEmbedSrc(hostname: string | null): string {
  const params = new URLSearchParams({ darkpopout: "true" });
  const parents = new Set(TWITCH_EMBED_FALLBACK_PARENTS);
  if (hostname) parents.add(hostname);
  for (const parent of parents) params.append("parent", parent);
  return `https://www.twitch.tv/embed/sasavot/chat?${params.toString()}`;
}

export function WatchLivePage() {
  const [embedHost] = useState<string | null>(() => (typeof window === "undefined" ? null : window.location.hostname));
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState("SASAVOT на Twitch");
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const uptimeLabel = (() => {
    if (!startedAt) return "В эфире";
    const startedMs = Date.parse(startedAt);
    if (!Number.isFinite(startedMs)) return "В эфире";
    const elapsedSec = Math.max(0, Math.floor((now - startedMs) / 1000));
    const hours = Math.floor(elapsedSec / 3600);
    const minutes = Math.floor((elapsedSec % 3600) / 60);
    const seconds = elapsedSec % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  })();

  useEffect(() => {
    let mounted = true;

    const checkLive = () => {
      fetchJsonWithCache<LivePayload>("api:twitch", "/api/twitch", { ttlMs: 45_000, forceRefresh: true })
        .then((payload) => {
          if (!mounted) return;
          setIsLive(Boolean(payload.isLive));
          setTitle(payload.stream?.title?.trim() || "SASAVOT на Twitch");
          setStartedAt(payload.stream?.started_at ?? null);
          setLoading(false);
        })
        .catch(() => {
          if (!mounted) return;
          setIsLive(false);
          setStartedAt(null);
          setLoading(false);
        });
    };

    checkLive();
    const intervalId = window.setInterval(checkLive, 60_000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isLive || !startedAt) return;
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [isLive, startedAt]);

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-6xl px-6 pb-6">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-black/35 px-4 py-2">
          <div className="h-7 w-3/5 animate-pulse rounded-lg bg-zinc-700/70" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-700/70" />
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
          <div className="h-[52vh] min-h-[330px] animate-pulse rounded-2xl border border-red-500/30 bg-zinc-800/70" />
          <div className="h-[52vh] min-h-[330px] animate-pulse rounded-2xl border border-red-500/30 bg-zinc-800/70" />
        </div>
      </section>
    );
  }

  if (!isLive) {
    return (
      <section className="mx-auto w-full max-w-6xl px-6 pb-6">
        <div className="rounded-2xl border border-red-500/25 bg-black/45 px-5 py-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-300/80">Смотреть</p>
          <p className="mt-2 text-xl text-zinc-100">Сейчас оффлайн</p>
          <p className="mt-2 text-sm text-zinc-300">Кнопка в навбаре появится автоматически, когда эфир снова начнется.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-6">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-black/35 px-4 py-2">
        <h1 className="font-audex min-w-0 truncate text-xl text-zinc-100 md:text-2xl">{title}</h1>
        <p className="font-type-light-sans shrink-0 rounded-lg border border-emerald-300 bg-emerald-600 px-3 py-1 text-sm font-semibold text-emerald-50 md:text-base">
          {uptimeLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-red-500/30 bg-black/55 shadow-2xl">
          <iframe
            src={getTwitchEmbedSrc(embedHost)}
            title="Twitch player"
            className="h-[52vh] min-h-[330px] w-full"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-red-500/30 bg-black/55 shadow-2xl">
          <iframe
            src={getTwitchChatEmbedSrc(embedHost)}
            title="Twitch chat"
            className="h-[52vh] min-h-[330px] w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
