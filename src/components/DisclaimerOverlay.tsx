"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";
const DESKTOP_DISCLAIMER_SRC =
  process.env.NEXT_PUBLIC_DISCLAIMER_VIDEO_URL ?? "/assets/logo/дисклеймер_final.webm";
const MOBILE_DISCLAIMER_SRC =
  process.env.NEXT_PUBLIC_DISCLAIMER_VIDEO_URL_MOBILE ??
  "/assets/logo/дисклеймен_final_mob.webm";

const getDisclaimerSrc = (isMobile: boolean) =>
  encodeURI(isMobile ? MOBILE_DISCLAIMER_SRC : DESKTOP_DISCLAIMER_SRC);

const getVideoBufferedProgress = (video: HTMLVideoElement) => {
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return 1;
  }

  if (video.buffered.length === 0) {
    return 0;
  }

  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0.85;
  }

  const bufferedEnd = video.buffered.end(video.buffered.length - 1);
  return Math.max(0, Math.min(1, bufferedEnd / duration));
};

export default function DisclaimerOverlay() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [disclaimerSrc, setDisclaimerSrc] = useState(() => {
    if (typeof window === "undefined") {
      return getDisclaimerSrc(false);
    }
    return getDisclaimerSrc(window.matchMedia(MOBILE_QUERY).matches);
  });
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
  const [isPageLoaded, setIsPageLoaded] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.readyState === "complete";
  });
  const [playBlocked, setPlayBlocked] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [videoLoadProgress, setVideoLoadProgress] = useState(0);
  const disclaimerType = disclaimerSrc.toLowerCase().endsWith(".webm")
    ? "video/webm"
    : "video/mp4";
  const pageLoadProgress = isPageLoaded ? 1 : 0;
  const loadingProgress = Math.round((pageLoadProgress * 0.35 + videoLoadProgress * 0.65) * 100);

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
    if (isPageLoaded) {
      return;
    }

    const onLoad = () => {
      setIsPageLoaded(true);
    };

    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, [isPageLoaded]);

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
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const updateSource = () => {
      setDisclaimerSrc(getDisclaimerSrc(mediaQuery.matches));
    };

    updateSource();
    mediaQuery.addEventListener("change", updateSource);

    return () => {
      mediaQuery.removeEventListener("change", updateSource);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setIsVideoReady(false);
    setPlayBlocked(false);
    setHasError(false);
    setVideoLoadProgress(0);
    video.load();
  }, [disclaimerSrc]);

  useEffect(() => {
    if (!isVisible || hasError || !isVideoReady || !isPageLoaded) {
      return;
    }
    void tryPlay();
  }, [hasError, isPageLoaded, isVideoReady, isVisible, tryPlay]);

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
      {(!isVideoReady || !isPageLoaded) && !hasError ? (
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
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        onLoadedMetadata={(event) => {
          setVideoLoadProgress(getVideoBufferedProgress(event.currentTarget));
        }}
        onProgress={(event) => {
          setVideoLoadProgress(getVideoBufferedProgress(event.currentTarget));
        }}
        onLoadedData={(event) => {
          setVideoLoadProgress(getVideoBufferedProgress(event.currentTarget));
        }}
        onCanPlay={() => {
          setIsVideoReady(true);
          setVideoLoadProgress(1);
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
        <source src={disclaimerSrc} type={disclaimerType} />
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
              setVideoLoadProgress(0);
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
