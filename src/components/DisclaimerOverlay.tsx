"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";
const DESKTOP_DISCLAIMER_SRC =
  process.env.NEXT_PUBLIC_DISCLAIMER_VIDEO_URL ?? "/assets/logo/дисклеймер_final.webm";
const MOBILE_DISCLAIMER_SRC =
  process.env.NEXT_PUBLIC_DISCLAIMER_VIDEO_URL_MOBILE ??
  "/assets/logo/дисклеймен_final_mob.webm";
const desktopDisclaimerSrc = encodeURI(DESKTOP_DISCLAIMER_SRC);
const mobileDisclaimerSrc = encodeURI(MOBILE_DISCLAIMER_SRC);
const desktopDisclaimerType = desktopDisclaimerSrc.toLowerCase().endsWith(".webm")
  ? "video/webm"
  : "video/mp4";
const mobileDisclaimerType = mobileDisclaimerSrc.toLowerCase().endsWith(".webm")
  ? "video/webm"
  : "video/mp4";

export default function DisclaimerOverlay() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startupTimeoutRef = useRef<number | null>(null);
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
  const [isPageReady, setIsPageReady] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.readyState !== "loading";
  });
  const [playBlocked, setPlayBlocked] = useState(false);
  const [hasError, setHasError] = useState(false);
  const pageLoadProgress = isPageReady ? 1 : 0;
  const videoLoadProgress = isVideoReady ? 1 : 0;
  const loadingProgress = Math.round((pageLoadProgress * 0.4 + videoLoadProgress * 0.6) * 100);

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
    if (isPageReady) {
      return;
    }

    const onReady = () => {
      setIsPageReady(true);
    };

    document.addEventListener("DOMContentLoaded", onReady);

    startupTimeoutRef.current = window.setTimeout(() => {
      setIsPageReady(true);
    }, 1500);

    return () => {
      document.removeEventListener("DOMContentLoaded", onReady);
      if (startupTimeoutRef.current !== null) {
        window.clearTimeout(startupTimeoutRef.current);
      }
    };
  }, [isPageReady]);

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

  useEffect(() => {
    if (!isVisible || hasError || !isVideoReady || !isPageReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void tryPlay();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasError, isPageReady, isVideoReady, isVisible, tryPlay]);

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
      {(!isVideoReady || !isPageReady) && !hasError ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black text-zinc-300">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm uppercase tracking-[0.3em]">Загрузка</p>
            <div className="h-1 w-44 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-300 transition-[width] duration-200 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-xs tabular-nums text-zinc-400">{loadingProgress}%</p>
          </div>
        </div>
      ) : null}

      <video
        ref={videoRef}
        className={`h-full w-full max-w-full object-contain transition-opacity duration-200 md:object-cover ${
          isVideoReady ? "opacity-100" : "opacity-0"
        }`}
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        onLoadedData={(event) => {
          setIsVideoReady(true);
          event.currentTarget.pause();
        }}
        onCanPlay={() => {
          setIsVideoReady(true);
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
        <source src={mobileDisclaimerSrc} type={mobileDisclaimerType} media={MOBILE_QUERY} />
        <source src={desktopDisclaimerSrc} type={desktopDisclaimerType} />
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
              setPlayBlocked(false);
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
