"use client";

import "swiper/css";
import "swiper/css/effect-coverflow";
import { ClipsShelf } from "@/features/twitch/components/ClipsShelf";
import { VodsShelf } from "@/features/twitch/components/VodsShelf";
import { useTwitchMedia } from "@/features/twitch/lib/api";

export default function TwitchVods() {
  const { data, loading, error, vods, clips } = useTwitchMedia();
  const vodsLimited = vods.slice(0, 7);
  const clipsLimited = clips.slice(0, 7);

  return (
    <section id="vods" className="relative z-10 min-h-screen scroll-mt-0 overflow-hidden bg-black/45 py-20 md:py-24">
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-[1680px] flex-col justify-center px-3 sm:px-6">
        {loading ? (
          <div className="grid h-[calc(100vh-12rem)] min-h-[560px] grid-rows-2 gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] animate-pulse" />
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] animate-pulse" />
          </div>
        ) : error || !data ? (
          <div className="flex h-[calc(100vh-12rem)] min-h-[560px] items-center justify-center text-center">
            <div>
              <p className="mb-3 text-lg text-gray-200">Не удалось загрузить Twitch данные</p>
              <a href="https://www.twitch.tv/sasavot/videos" target="_blank" rel="noopener noreferrer" className="text-red-300 underline hover:text-red-200">
                Открыть Twitch
              </a>
            </div>
          </div>
        ) : (
          <div className="grid h-[calc(100vh-12rem)] min-h-[560px] grid-rows-2 gap-3">
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
