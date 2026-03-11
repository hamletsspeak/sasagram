"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";
const DESKTOP_DISCLAIMER_SRC =
  process.env.NEXT_PUBLIC_DISCLAIMER_VIDEO_URL ?? "/assets/logo/дисклеймер_final.webm";
const MOBILE_DISCLAIMER_SRC =
  process.env.NEXT_PUBLIC_DISCLAIMER_VIDEO_URL_MOBILE ??
  "/assets/logo/дисклеймен_final_mob.webm";
const DOWNLOAD_PROGRESS_MAX = 95;
const INTRO_WATCHED_STORAGE_KEY = "sasagram:intro-watched";
const OPEN_DISCLAIMER_EVENT = "sasagram:open-disclaimer";

type DeviceType = "mobile" | "desktop" | null;

function getMimeType(src: string): string {
  return src.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4";
}

export default function DisclaimerOverlay() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const introStartTimeoutRef = useRef<number | null>(null);
  const introFinishTimeoutRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasVisibilityDecision, setHasVisibilityDecision] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [isVideoDownloaded, setIsVideoDownloaded] = useState(false);
  const [isVideoPrepared, setIsVideoPrepared] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [playBlocked, setPlayBlocked] = useState(false);
  const [hasError, setHasError] = useState(false);

  const selectedSrc = useMemo(() => {
    if (deviceType === "mobile") {
      return encodeURI(MOBILE_DISCLAIMER_SRC);
    }
    if (deviceType === "desktop") {
      return encodeURI(DESKTOP_DISCLAIMER_SRC);
    }
    return null;
  }, [deviceType]);

  const selectedMimeType = useMemo(() => {
    if (!selectedSrc) {
      return null;
    }
    return getMimeType(selectedSrc);
  }, [selectedSrc]);

  const isReadyToStart = deviceType !== null && isVideoDownloaded && isVideoPrepared && !hasError;

  const resetOverlayState = useCallback(() => {
    setHasStarted(false);
    setIsStarting(false);
    setIsFinishing(false);
    setPlayBlocked(false);
    setHasError(false);
    setDownloadProgress((current) => {
      if (isVideoPrepared) {
        return 100;
      }
      if (isVideoDownloaded) {
        return DOWNLOAD_PROGRESS_MAX;
      }
      return current;
    });
  }, [isVideoDownloaded, isVideoPrepared]);

  useEffect(() => {
    const hasSeenIntro = window.localStorage.getItem(INTRO_WATCHED_STORAGE_KEY) === "true";
    setIsVisible(!hasSeenIntro);
    setHasVisibilityDecision(true);
  }, []);

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setVideoObjectUrl(null);
  }, []);

  const cleanupRequest = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
  }, []);

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

  const startLoadingSelectedVideo = useCallback((src: string) => {
    cleanupRequest();
    cleanupObjectUrl();
    setDownloadProgress(0);
    setIsVideoDownloaded(false);
    setIsVideoPrepared(false);
    setHasStarted(false);
    setIsStarting(false);
    setIsFinishing(false);
    setPlayBlocked(false);
    setHasError(false);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("GET", src, true);
    xhr.responseType = "blob";

    xhr.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return;
      }
      setDownloadProgress(
        Math.min(DOWNLOAD_PROGRESS_MAX, Math.round((event.loaded / event.total) * DOWNLOAD_PROGRESS_MAX)),
      );
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        setHasError(true);
        return;
      }

      cleanupObjectUrl();
      objectUrlRef.current = URL.createObjectURL(xhr.response);
      setVideoObjectUrl(objectUrlRef.current);
      setDownloadProgress(DOWNLOAD_PROGRESS_MAX);
      setIsVideoDownloaded(true);
      xhrRef.current = null;
    };

    xhr.onerror = () => {
      setHasError(true);
      xhrRef.current = null;
    };

    xhr.onabort = () => {
      xhrRef.current = null;
    };

    xhr.send();
  }, [cleanupObjectUrl, cleanupRequest]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const updateDeviceType = () => {
      setDeviceType(mediaQuery.matches ? "mobile" : "desktop");
    };

    updateDeviceType();
    mediaQuery.addEventListener("change", updateDeviceType);

    return () => {
      mediaQuery.removeEventListener("change", updateDeviceType);
    };
  }, []);

  useEffect(() => {
    const onOpenDisclaimer = () => {
      resetOverlayState();
      setIsVisible(true);

      if (selectedSrc && !videoObjectUrl) {
        startLoadingSelectedVideo(selectedSrc);
      } else {
        window.requestAnimationFrame(() => {
          const video = videoRef.current;
          if (video) {
            video.pause();
            video.currentTime = 0;
          }
        });
      }
    };

    window.addEventListener(OPEN_DISCLAIMER_EVENT, onOpenDisclaimer);
    return () => {
      window.removeEventListener(OPEN_DISCLAIMER_EVENT, onOpenDisclaimer);
    };
  }, [resetOverlayState, selectedSrc, startLoadingSelectedVideo, videoObjectUrl]);

  useEffect(() => {
    const html = document.documentElement;
    html.dataset.disclaimerVisible = isVisible ? "true" : "false";
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
      html.dataset.disclaimerVisible = "false";
    };
  }, [isVisible]);

  useEffect(() => {
    if (!selectedSrc || hasStarted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startLoadingSelectedVideo(selectedSrc);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasStarted, selectedSrc, startLoadingSelectedVideo]);

  useEffect(() => {
    return () => {
      if (introStartTimeoutRef.current !== null) {
        window.clearTimeout(introStartTimeoutRef.current);
      }
      if (introFinishTimeoutRef.current !== null) {
        window.clearTimeout(introFinishTimeoutRef.current);
      }
      cleanupRequest();
      cleanupObjectUrl();
    };
  }, [cleanupObjectUrl, cleanupRequest]);

  if (!hasVisibilityDecision || !isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 ease-out ${
        isFinishing ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Обязательный дисклеймер"
      onClick={playBlocked ? () => void tryPlay() : undefined}
    >
      {!hasStarted ? (
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center bg-[radial-gradient(120%_120%_at_50%_100%,rgba(132,16,29,0.2),transparent_42%),radial-gradient(90%_90%_at_50%_0%,rgba(255,255,255,0.06),transparent_55%),#000] px-6 text-zinc-300 transition-opacity duration-500 ease-out ${
            isStarting ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-[32px] border border-white/10 bg-white/[0.03] px-7 py-9 text-center shadow-[0_0_80px_rgba(120,12,24,0.16)] backdrop-blur-[10px]">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.5em] text-zinc-500">INTRO</p>
              <div className="flex items-baseline justify-center gap-3">
                <h2 className="font-fontick text-xl font-semibold uppercase tracking-[0.28em] text-zinc-100">
                  Загрузка
                </h2>
                <span className="font-audex relative top-[1px] text-[1.35rem] uppercase tracking-[0.18em] text-zinc-300 tabular-nums leading-none">
                  {downloadProgress}%
                </span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="relative h-2 overflow-hidden rounded-full bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.72),rgba(255,255,255,1))] transition-[width] duration-150 ease-out"
                  style={{ width: `${downloadProgress}%` }}
                />
                <div className="disclaimer-progress-sheen absolute inset-y-0 left-0 w-20 rounded-full" />
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                <span className="disclaimer-status-pulse">Идет загрузка</span>
                <span className="disclaimer-loading-dots" aria-hidden="true" />
              </div>
            </div>

            {isReadyToStart ? (
              <button
                type="button"
                className="font-type-light-sans min-w-40 rounded-full border border-white/20 bg-[linear-gradient(180deg,#ffffff,#d8d8d8)] px-8 py-3.5 text-sm uppercase tracking-[0.34em] text-black shadow-[0_10px_30px_rgba(255,255,255,0.16)] transition hover:scale-[1.02] hover:bg-white"
                onClick={() => {
                  setIsStarting(true);
                  introStartTimeoutRef.current = window.setTimeout(() => {
                    setHasStarted(true);
                    void tryPlay();
                  }, 420);
                }}
              >
                Start
              </button>
            ) : (
              <div className="flex h-[50px] flex-col items-center justify-center gap-1 text-center">
                <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-600">
                  Пожалуйста, подождите.
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Не обновляйте страницу во время загрузки
                </div>
              </div>
            )}

            {hasError ? (
              <button
                type="button"
                className="rounded-full border border-zinc-500 bg-zinc-900 px-5 py-2.5 text-xs uppercase tracking-[0.22em] text-zinc-100 transition hover:bg-zinc-800"
                onClick={() => {
                  if (!selectedSrc) {
                    return;
                  }
                  startLoadingSelectedVideo(selectedSrc);
                }}
              >
                Повторить загрузку
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <video
        ref={videoRef}
        className={`h-full w-full max-w-full object-contain transition-opacity duration-500 md:object-cover ${
          hasStarted ? "opacity-100" : "opacity-0"
        }`}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        onLoadedData={() => {
          setDownloadProgress(100);
          setIsVideoPrepared(true);
        }}
        onEnded={() => {
          window.localStorage.setItem(INTRO_WATCHED_STORAGE_KEY, "true");
          setIsFinishing(true);
          window.dispatchEvent(new Event("sasagram:disclaimer-finished"));
          introFinishTimeoutRef.current = window.setTimeout(() => {
            setIsVisible(false);
          }, 900);
        }}
        onError={() => {
          setHasError(true);
          setPlayBlocked(false);
          setHasStarted(false);
          setIsStarting(false);
        }}
      >
        {videoObjectUrl && selectedMimeType ? (
          <source src={videoObjectUrl} type={selectedMimeType} />
        ) : null}
      </video>

      {playBlocked && !hasError && hasStarted ? (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-zinc-600 bg-black/70 px-4 py-2 text-center text-xs text-zinc-200">
          Нажмите в любое место для запуска видео
        </div>
      ) : null}
    </div>
  );
}
