import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper/types";
import { A11y, EffectCoverflow, Keyboard } from "swiper/modules";
import { Clip } from "@/features/twitch/types";
import { formatClipDuration, formatDate, formatViewCount } from "@/features/twitch/lib/format";

type ClipsShelfProps = {
  items: Clip[];
};

const overlayNavButtonBaseClass =
  "absolute top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-rose-300/70 bg-rose-700/85 text-white shadow-[0_4px_0_rgba(122,16,44,0.5)] transition-all hover:bg-rose-600/95 active:translate-y-[calc(-50%+1px)] active:shadow-[0_1px_0_rgba(122,16,44,0.5)] disabled:cursor-not-allowed disabled:opacity-35 lg:inline-flex";
const overlayPrevButtonClass = `${overlayNavButtonBaseClass} -left-7`;
const overlayNextButtonClass = `${overlayNavButtonBaseClass} -right-7`;

export function ClipsShelf({ items }: ClipsShelfProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const totalSlides = items.length + 1;
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(totalSlides > 1);

  const updateShades = (swiper: SwiperInstance) => {
    swiper.slides.forEach((slideEl) => {
      const progress = Math.abs((slideEl as HTMLElement & { progress?: number }).progress ?? 0);
      const min = 0.05;
      const max = 0.7;
      const t = Math.min(progress / 1.25, 1);
      const opacity = min + (max - min) * t;
      const shade = slideEl.querySelector<HTMLElement>(".clip-shade");
      if (shade) shade.style.opacity = opacity.toFixed(3);
    });
  };

  const syncNavState = (swiper: SwiperInstance) => {
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  };

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    swiper.update();
    swiper.slideTo(0, 0, false);
    syncNavState(swiper);
    updateShades(swiper);
  }, [items.length, totalSlides]);

  const handlePrev = () => swiperRef.current?.slidePrev();
  const handleNext = () => swiperRef.current?.slideNext();

  return (
    <div className="flex min-h-0 flex-col">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-rose-300 md:hidden">Избранные клипы</p>

      <div className="relative mx-auto min-h-0 w-full max-w-[1320px] overflow-visible">
        <button
          type="button"
          onClick={handlePrev}
          aria-disabled={!canPrev}
          className={`${overlayPrevButtonClass} transition-opacity duration-300 ${canPrev ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-label="Предыдущая страница клипов"
        >
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="none">
            <path d="M11.5 4.5 6 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" onClick={handleNext} disabled={!canNext} className={overlayNextButtonClass} aria-label="Следующая страница клипов">
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="none">
            <path d="M8.5 4.5 14 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {items.length === 0 ? (
          <div className="flex h-full min-h-[195px] items-center justify-center rounded-2xl border border-dashed border-rose-500/25 text-gray-400">
            Клипы пока не найдены
          </div>
        ) : (
          <Swiper
            modules={[Keyboard, A11y, EffectCoverflow]}
            speed={650}
            effect="coverflow"
            centeredSlides
            slidesPerView="auto"
            loop={false}
            initialSlide={0}
            grabCursor
            spaceBetween={80}
            slidesPerGroup={1}
            keyboard={{ enabled: true }}
            watchSlidesProgress
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 180,
              modifier: 1,
              slideShadows: false,
            }}
            breakpoints={{
              0: { spaceBetween: 10 },
              768: { spaceBetween: 12 },
              1200: { spaceBetween: 14 },
              1536: { spaceBetween: 16 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              swiper.slideTo(0, 0, false);
              syncNavState(swiper);
              updateShades(swiper);
            }}
            onSlideChange={(swiper) => {
              syncNavState(swiper);
              updateShades(swiper);
            }}
            onProgress={updateShades}
            onSetTransition={(swiper, speed) => {
              swiper.slides.forEach((slideEl) => {
                const shade = slideEl.querySelector<HTMLElement>(".clip-shade");
                if (shade) shade.style.transitionDuration = `${speed}ms`;
              });
            }}
            className="h-[248px] sm:h-[264px] xl:h-[280px]"
          >
            {items.map((clip, index) => (
              <SwiperSlide key={`${clip.id}-${index}`} className="!h-auto !w-[88%] sm:!w-[48%] xl:!w-[500px]">
                <a href={clip.url} target="_blank" rel="noopener noreferrer" className="group relative block h-full w-full overflow-hidden rounded-2xl border border-rose-400/25 bg-black/30">
                  <Image src={clip.thumbnail_url} alt={clip.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" unoptimized />
                  <div className="clip-shade pointer-events-none absolute inset-0 bg-black/65 opacity-[0.55] transition-opacity duration-150" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                  <div className="absolute right-3 top-3 rounded-lg bg-black/80 px-2 py-1 text-xs font-mono text-white">{formatClipDuration(clip.duration)}</div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-fontick line-clamp-2 text-base font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)] md:text-lg">{clip.title}</h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-rose-100/85">
                      <span>👁 {formatViewCount(clip.view_count)}</span>
                      <span>{formatDate(clip.created_at)}</span>
                    </div>
                  </div>
                </a>
              </SwiperSlide>
            ))}
            <SwiperSlide key="all-clips-banner" className="!h-auto !w-[88%] sm:!w-[48%] xl:!w-[500px]">
              <a
                href="https://www.twitch.tv/sasavot/videos?featured=true&filter=clips&range=all"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full min-h-[248px] items-center justify-center rounded-2xl border border-rose-300/45 bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.2),transparent_60%),linear-gradient(180deg,rgba(18,18,24,0.95),rgba(8,8,12,0.98))] px-6 text-center"
              >
                <span className="font-fontick text-3xl font-black uppercase tracking-[0.08em] text-rose-100 transition-transform duration-300 group-hover:scale-[1.03]">
                  Все клипы
                </span>
              </a>
            </SwiperSlide>
          </Swiper>
        )}
      </div>
    </div>
  );
}
