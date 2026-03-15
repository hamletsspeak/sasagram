"use client";

import "swiper/css";
import "swiper/css/effect-coverflow";
import { useEffect, useState } from "react";
import { ClipsShelf } from "@/features/twitch/components/ClipsShelf";
import { VodsShelf } from "@/features/twitch/components/VodsShelf";
import { useTwitchMedia } from "@/features/twitch/lib/api";

function ShelfLoadingPlaceholder({
  title,
  accentClassName,
}: {
  title: string;
  accentClassName: string;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className={`h-3 w-28 rounded-full ${accentClassName}`} />
        <div className="hidden h-10 w-24 rounded-full bg-white/8 lg:block" />
      </div>

      <div className="relative mx-auto min-h-0 w-full max-w-[1320px] overflow-visible">
        <div className="grid h-[248px] grid-cols-1 gap-4 sm:h-[264px] sm:grid-cols-2 xl:h-[280px] xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`${title}-${index}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]"
            >
              <div className="h-full animate-pulse">
                <div className="h-[68%] bg-white/[0.07]" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded-full bg-white/[0.09]" />
                  <div className="h-4 w-1/2 rounded-full bg-white/[0.07]" />
                  <div className="h-3 w-2/5 rounded-full bg-white/[0.06]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full border border-white/10 bg-black/35 px-5 py-2 text-sm uppercase tracking-[0.28em] text-zinc-300">
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TwitchVods() {
  const [topBarVisible, setTopBarVisible] = useState(false);
  const { data, loading, error, vods, clips } = useTwitchMedia();
  const vodsLimited = vods.slice(0, 7);
  const clipsLimited = clips.slice(0, 7);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setTopBarVisible(true);
    }, 780);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section id="vods" className="relative flex h-full flex-col scroll-mt-0 overflow-hidden bg-transparent">
      <div className="relative z-10 flex min-h-0 flex-1 w-full flex-col">
        <div
          className={`relative z-20 w-full border-y border-white/12 bg-black/82 px-[12px] py-3 shadow-[0_12px_30px_rgba(0,0,0,0.32)] transition-all duration-[900ms] ease-out will-change-transform ${
            topBarVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        >
          <div className="flex w-full items-center justify-between gap-3">
            <h2 className="font-fontick text-2xl font-bold text-white md:text-3xl">Записи стримов</h2>
            <a
              href="https://www.twitch.tv/sasavot/videos?filter=all&sort=time"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-red-500/80 bg-black/85 px-4 py-2 text-sm font-bold text-red-200 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition hover:border-red-400 hover:bg-red-700/85 hover:text-white"
            >
              Открыть Twitch
            </a>
          </div>
        </div>

        {loading ? (
          <div className="grid min-h-0 flex-1 content-center gap-6">
            <ShelfLoadingPlaceholder title="Загрузка записей" accentClassName="bg-red-300/70" />
            <ShelfLoadingPlaceholder title="Загрузка клипов" accentClassName="bg-rose-300/70" />
          </div>
        ) : error || !data ? (
          <div className="flex min-h-0 flex-1 items-center justify-center text-center">
            <div>
              <p className="mb-3 text-lg text-gray-200">Не удалось загрузить Twitch данные</p>
              <a href="https://www.twitch.tv/sasavot/videos" target="_blank" rel="noopener noreferrer" className="text-red-300 underline hover:text-red-200">
                Открыть Twitch
              </a>
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 content-center gap-21">
            <VodsShelf
              items={vodsLimited}
            />
            <ClipsShelf
              items={clipsLimited}
            />
          </div>
        )}
      </div>
    </section>
  );
}
