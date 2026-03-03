"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DISCLAIMER_SRC = encodeURI(
  process.env.NEXT_PUBLIC_DISCLAIMER_VIDEO_URL ?? "/assets/logo/дисклеймер_final.webm",
);
const DISCLAIMER_TYPE = DISCLAIMER_SRC.toLowerCase().endsWith(".webm")
  ? "video/webm"
  : "video/mp4";

export default function DisclaimerOverlay() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof performance === "undefined") {
      return true;
    }
    const navigationEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    return navigationEntry?.type !== "reload";
  });
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [playBlocked, setPlayBlocked] = useState(false);
  const [hasError, setHasError] = useState(false);

  const tryPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    try {
      setHasError(false);
      await video.play();
      setPlayBlocked(false);
    } catch {
      setPlayBlocked(true);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    window.dispatchEvent(new CustomEvent("sasagram:disclaimer-visibility", { detail: isVisible }));

    if (!isVisible) {
      return;
    }

    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Обязательный дисклеймер"
      onClick={playBlocked ? () => void tryPlay() : undefined}
    >
      {!isVideoReady && !hasError ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black text-zinc-300">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm uppercase tracking-[0.3em]">Подготовка видео...</p>
            <div className="h-1 w-44 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-zinc-300" />
            </div>
          </div>
        </div>
      ) : null}

      <video
        ref={videoRef}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          isVideoReady ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        onCanPlay={() => {
          setIsVideoReady(true);
          requestAnimationFrame(() => {
            void tryPlay();
          });
        }}
        onEnded={() => {
          setIsVisible(false);
          window.dispatchEvent(new Event("sasagram:disclaimer-finished"));
        }}
        onError={() => {
          setHasError(true);
          setPlayBlocked(false);
        }}
      >
        <source src={DISCLAIMER_SRC} type={DISCLAIMER_TYPE} />
      </video>

      {playBlocked && !hasError ? (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-zinc-600 bg-black/70 px-4 py-2 text-center text-xs text-zinc-200">
          Нажмите в любое место для запуска видео
        </div>
      ) : null}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 px-6 text-center text-zinc-100">
          <p className="text-sm uppercase tracking-[0.22em]">
            Не удалось загрузить дисклеймер
          </p>
          <button
            type="button"
            className="rounded-md border border-zinc-500 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800"
            onClick={() => {
              const video = videoRef.current;
              if (!video) {
                return;
              }
              setIsVideoReady(false);
              setHasError(false);
              video.load();
            }}
          >
            Повторить
          </button>
        </div>
      ) : null}
    </div>
  );
}
