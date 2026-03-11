"use client";

import { useEffect } from "react";
import { clearClientApiCache } from "@/lib/client-api-cache";

const RELOAD_SCREEN_MIN_VISIBLE_MS = 650;
const RELOAD_STYLE_ELEMENT_ID = "page-reload-overlay-style";
const RELOAD_DOM_SETTLE_MS = 280;
const RELOAD_DOM_WAIT_TIMEOUT_MS = 8_000;
const RELOAD_MEDIA_WAIT_TIMEOUT_MS = 12_000;

declare global {
  interface Window {
    __sasagramPageReloading?: boolean;
    __sasagramPageReloadStartedAt?: number;
  }
}

function getNavigationType(): PerformanceNavigationTiming["type"] | null {
  const navigationEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (navigationEntry) {
    return navigationEntry.type;
  }

  const legacyNavigation = (performance as Performance & { navigation?: { type?: number } }).navigation;
  if (legacyNavigation?.type === 1) {
    return "reload";
  }

  return null;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitForDomToSettle(timeoutMs: number, settleMs: number): Promise<void> {
  return new Promise((resolve) => {
    let settledTimer = 0;
    let timeoutId = 0;
    let observer: MutationObserver | null = null;

    const finish = () => {
      if (settledTimer) {
        window.clearTimeout(settledTimer);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      observer?.disconnect();
      resolve();
    };

    const scheduleSettled = () => {
      if (settledTimer) {
        window.clearTimeout(settledTimer);
      }
      settledTimer = window.setTimeout(finish, settleMs);
    };

    timeoutId = window.setTimeout(finish, timeoutMs);
    observer = new MutationObserver(() => {
      scheduleSettled();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "poster", "class", "style"],
    });

    scheduleSettled();
  });
}

function waitForImageReady(image: HTMLImageElement, timeoutMs: number): Promise<void> {
  if (image.complete) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let timeoutId = 0;
    const finish = () => {
      window.clearTimeout(timeoutId);
      image.removeEventListener("load", finish);
      image.removeEventListener("error", finish);
      resolve();
    };

    timeoutId = window.setTimeout(finish, timeoutMs);
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  });
}

function waitForVideoReady(video: HTMLVideoElement, timeoutMs: number): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let timeoutId = 0;
    const finish = () => {
      window.clearTimeout(timeoutId);
      video.removeEventListener("canplay", finish);
      video.removeEventListener("canplaythrough", finish);
      video.removeEventListener("loadeddata", finish);
      video.removeEventListener("error", finish);
      resolve();
    };

    video.preload = "auto";
    try {
      video.load();
    } catch {
      // Ignore browsers that reject imperative load here.
    }

    timeoutId = window.setTimeout(finish, timeoutMs);
    video.addEventListener("canplay", finish, { once: true });
    video.addEventListener("canplaythrough", finish, { once: true });
    video.addEventListener("loadeddata", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
  });
}

async function waitForRenderablePageAssets(): Promise<void> {
  await waitForDomToSettle(RELOAD_DOM_WAIT_TIMEOUT_MS, RELOAD_DOM_SETTLE_MS);

  if ("fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font-loading errors and continue with media readiness.
    }
  }

  const images = Array.from(document.querySelectorAll("img"));
  const videos = Array.from(document.querySelectorAll("video"));

  await Promise.all([
    ...images.map((image) => waitForImageReady(image, RELOAD_MEDIA_WAIT_TIMEOUT_MS)),
    ...videos.map((video) => waitForVideoReady(video, RELOAD_MEDIA_WAIT_TIMEOUT_MS)),
  ]);
}

export default function NavigationReloadSync() {
  useEffect(() => {
    const resetTransientState = () => {
      clearClientApiCache();
      delete document.documentElement.dataset.disclaimerVisible;
    };

    const navigationType = getNavigationType();
    const isReloadNavigation = window.__sasagramPageReloading ?? navigationType === "reload";

    if (isReloadNavigation) {
      resetTransientState();
    }

    const hideReloadScreen = () => {
      document.getElementById(RELOAD_STYLE_ELEMENT_ID)?.remove();
      window.__sasagramPageReloading = false;
    };

    let hideTimeoutId: number | null = null;
    let removeLoadListener: (() => void) | null = null;
    let isCancelled = false;
    if (isReloadNavigation) {
      const revealStartedAt = window.__sasagramPageReloadStartedAt ?? Date.now();
      const waitForPageReadyThenHide = async () => {
        await waitForRenderablePageAssets();
        if (isCancelled) {
          return;
        }

        const elapsedMs = Date.now() - revealStartedAt;
        const remainingMs = Math.max(RELOAD_SCREEN_MIN_VISIBLE_MS - elapsedMs, 0);
        hideTimeoutId = window.setTimeout(() => {
          if (!isCancelled) {
            hideReloadScreen();
          }
        }, remainingMs);
      };

      if (document.readyState === "complete") {
        void waitForPageReadyThenHide();
      } else {
        const onLoad = () => {
          void waitForPageReadyThenHide();
        };
        window.addEventListener("load", onLoad, { once: true });
        removeLoadListener = () => window.removeEventListener("load", onLoad);
      }
    } else {
      hideReloadScreen();
    }

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }

      resetTransientState();
      window.location.reload();
    };

    window.addEventListener("pageshow", onPageShow);
    return () => {
      isCancelled = true;
      if (hideTimeoutId !== null) {
        window.clearTimeout(hideTimeoutId);
      }
      removeLoadListener?.();
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
