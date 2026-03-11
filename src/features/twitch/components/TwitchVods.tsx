"use client";

import "swiper/css";
import "swiper/css/effect-coverflow";
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
  const { data, loading, error, vods, clips } = useTwitchMedia();
  const vodsLimited = vods.slice(0, 7);
  const clipsLimited = clips.slice(0, 7);

  return (
    <section id="vods" className="relative z-10 h-[calc(100vh-66px)] scroll-mt-0 overflow-hidden bg-transparent py-2 md:h-[calc(100vh-78px)] md:py-3">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1680px] flex-col justify-center px-3 sm:px-6">
        {loading ? (
          <div className="grid h-full min-h-0 grid-rows-2 gap-3">
            <ShelfLoadingPlaceholder title="Загрузка записей" accentClassName="bg-red-300/70" />
            <ShelfLoadingPlaceholder title="Загрузка клипов" accentClassName="bg-rose-300/70" />
          </div>
        ) : error || !data ? (
          <div className="flex h-full min-h-0 items-center justify-center text-center">
            <div>
              <p className="mb-3 text-lg text-gray-200">Не удалось загрузить Twitch данные</p>
              <a href="https://www.twitch.tv/sasavot/videos" target="_blank" rel="noopener noreferrer" className="text-red-300 underline hover:text-red-200">
                Открыть Twitch
              </a>
            </div>
          </div>
        ) : (
          <div className="grid h-full min-h-0 grid-rows-2 gap-3">
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
