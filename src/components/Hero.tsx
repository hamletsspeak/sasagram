"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { fetchJsonWithCache } from "@/lib/client-api-cache";
const HERO_PHOTO_SRC = encodeURI("/assets/logo/глеб_слей_фото.svg");
const HERO_TITLE = "Глеб Борисович Орлов";

interface StreamInfo {
  user: {
    id: string;
    login: string;
    display_name: string;
    profile_image_url: string;
    description: string;
    view_count: number;
  };
  isLive: boolean;
  stream: {
    title: string;
    game_name: string;
    viewer_count: number;
  } | null;
}

export default function Hero() {
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.documentElement.dataset.disclaimerVisible === "true";
  });
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [heroIntroStage, setHeroIntroStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [typedTitle, setTypedTitle] = useState("");

  const isLive = streamInfo?.isLive ?? false;
  const heroRef = useRef<HTMLElement | null>(null);
  const onlineBackgroundRef = useRef<HTMLVideoElement | null>(null);
  const offlineBackgroundRef = useRef<HTMLVideoElement | null>(null);
  const heroIntroStartedRef = useRef(false);

  useEffect(() => {
    fetchJsonWithCache<StreamInfo>("api:twitch", "/api/twitch", { ttlMs: 45_000 })
      .then((data) => {
        setStreamInfo({
          user: data.user,
          isLive: data.isLive,
          stream: data.stream,
        });
      })
      .catch(() => {
        // Silently fail if stream payload is unavailable.
      });
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting && entry.intersectionRatio > 0.12);
      },
      { threshold: [0, 0.12, 0.35] },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      setIsDisclaimerVisible(Boolean(customEvent.detail));
    };

    const onFinished = () => {
      setIsDisclaimerVisible(false);
    };

    window.addEventListener("sasagram:disclaimer-visibility", onVisibility as EventListener);
    window.addEventListener("sasagram:disclaimer-finished", onFinished);

    return () => {
      window.removeEventListener("sasagram:disclaimer-visibility", onVisibility as EventListener);
      window.removeEventListener("sasagram:disclaimer-finished", onFinished);
    };
  }, []);

  useEffect(() => {
    const onFinished = () => {
      const onlineVideo = onlineBackgroundRef.current;
      const offlineVideo = offlineBackgroundRef.current;

      if (onlineVideo) {
        onlineVideo.pause();
        onlineVideo.currentTime = 0;
      }
      if (offlineVideo) {
        offlineVideo.pause();
        offlineVideo.currentTime = 0;
      }

      const activeVideo = isLive ? onlineVideo : offlineVideo;
      if (activeVideo && isHeroInView) {
        void activeVideo.play().catch(() => {});
      }
    };

    window.addEventListener("sasagram:disclaimer-finished", onFinished);

    return () => {
      window.removeEventListener("sasagram:disclaimer-finished", onFinished);
    };
  }, [isHeroInView, isLive]);

  useEffect(() => {
    const onlineVideo = onlineBackgroundRef.current;
    const offlineVideo = offlineBackgroundRef.current;

    if (isDisclaimerVisible) {
      onlineVideo?.pause();
      offlineVideo?.pause();
      return;
    }

    if (isLive) {
      if (offlineVideo) {
        offlineVideo.pause();
        offlineVideo.currentTime = 0;
      }
      if (!onlineVideo) return;
      if (!isHeroInView) {
        onlineVideo.pause();
        return;
      }
      if (!onlineVideo.ended) {
        void onlineVideo.play().catch(() => {});
      }
      return;
    }

    if (onlineVideo) {
      onlineVideo.pause();
      onlineVideo.currentTime = 0;
    }
    if (!offlineVideo) return;
    if (!isHeroInView) {
      offlineVideo.pause();
      return;
    }
    void offlineVideo.play().catch(() => {});
  }, [isDisclaimerVisible, isHeroInView, isLive]);

  useEffect(() => {
    if (isDisclaimerVisible || heroIntroStartedRef.current) return;

    heroIntroStartedRef.current = true;

    const pageTimer = window.setTimeout(() => {
      setHeroIntroStage(1);
    }, 320);
    const welcomeTimer = window.setTimeout(() => {
      setHeroIntroStage(2);
    }, 1100);
    const photoTimer = window.setTimeout(() => {
      setHeroIntroStage(3);
    }, 2380);
    const titleTimer = window.setTimeout(() => {
      setHeroIntroStage(4);
    }, 3720);

    return () => {
      window.clearTimeout(pageTimer);
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(photoTimer);
      window.clearTimeout(titleTimer);
    };
  }, [isDisclaimerVisible]);

  useEffect(() => {
    if (heroIntroStage < 4 || !isHeroInView || typedTitle.length >= HERO_TITLE.length) return;

    const timeoutId = window.setTimeout(() => {
      setTypedTitle(HERO_TITLE.slice(0, typedTitle.length + 1));
    }, typedTitle.length === 0 ? 320 : 92);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [heroIntroStage, isHeroInView, typedTitle]);

  const pageVisible = heroIntroStage >= 1;
  const welcomeVisible = heroIntroStage >= 2 && heroIntroStage < 4;
  const photoVisible = heroIntroStage >= 3;
  const titleVisible = heroIntroStage >= 4;

  return (
    <section
      id="home"
      ref={heroRef}
      className={`relative z-20 blood-divider flex min-h-screen items-start justify-center overflow-hidden bg-transparent px-6 pb-10 pt-[72px] transition-opacity duration-[1100ms] md:px-10 md:pt-[82px] ${
        pageVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isLive ? (
          <video
            ref={onlineBackgroundRef}
            className="h-full w-full object-cover rotate-180"
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src={encodeURI("/assets/logo/фон_сайт_онлайн.webm")} type="video/webm" />
          </video>
        ) : (
          <video
            ref={offlineBackgroundRef}
            className="h-full w-full object-cover rotate-180"
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src={encodeURI("/assets/logo/фон_сайт_онлайн.webm")} type="video/webm" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/48" />
        <div className="absolute inset-0 bg-[radial-gradient(110%_85%_at_14%_18%,rgba(151,17,34,0.24),transparent_58%),radial-gradient(95%_82%_at_84%_18%,rgba(99,8,22,0.2),transparent_56%)]" />
      </div>

      <div className="relative z-10 flex h-full w-full max-w-[1440px] items-start pt-[3vh] md:pt-[1vh]">
        <div
          className={`pointer-events-none absolute left-1/2 top-[6vh] z-20 -translate-x-1/2 text-center transition-all duration-[900ms] ${
            welcomeVisible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
          }`}
        >
          <p className="font-audex text-[clamp(1.6rem,4.2vw,3.8rem)] uppercase tracking-[0.14em] text-white/96 drop-shadow-[0_0_22px_rgba(0,0,0,0.42)]">
            Добро пожаловать
          </p>
        </div>

        <div className="flex w-full flex-col items-center justify-start md:flex-row md:items-end md:justify-between">
          <div
            className={`relative flex w-full justify-center transition-all duration-[1100ms] md:w-[58%] md:justify-start ${
              photoVisible ? "translate-x-0 opacity-100" : "-translate-x-24 opacity-0"
            }`}
          >
            <div className="relative flex h-[min(82vh,900px)] w-full max-w-[min(86vw,880px)] items-end justify-center md:justify-start">
              <div className="absolute bottom-[3%] left-[2%] right-[26%] top-[10%] rounded-[64px] bg-[radial-gradient(circle_at_40%_24%,rgba(255,255,255,0.2),rgba(255,255,255,0)_26%),radial-gradient(circle_at_42%_42%,rgba(255,244,214,0.16),rgba(255,244,214,0)_34%),radial-gradient(circle_at_44%_84%,rgba(146,16,34,0.16),rgba(0,0,0,0)_60%)] blur-3xl" />
              <div className="absolute bottom-[18%] left-[11%] right-[33%] top-[20%] rounded-[50%] bg-[radial-gradient(circle,rgba(255,252,240,0.16)_0%,rgba(255,252,240,0.08)_26%,rgba(255,252,240,0)_68%)] blur-2xl" />
              <Image
                src={HERO_PHOTO_SRC}
                alt="Глеб"
                width={920}
                height={1280}
                priority
                className="relative h-full w-auto max-w-full object-contain object-left-bottom drop-shadow-[0_26px_90px_rgba(0,0,0,0.58)] [filter:drop-shadow(0_0_22px_rgba(255,244,214,0.16))]"
              />
            </div>
          </div>

          <div className="mt-2 flex w-full flex-col items-center md:mt-0 md:w-[34%] md:items-start md:pb-[12vh]">
            <h1
              className={`hero-typewriter-line flex min-h-[64px] items-center justify-center text-center font-audex text-2xl text-white transition-all duration-[900ms] sm:min-h-[82px] sm:text-4xl md:min-h-[112px] md:justify-start md:text-5xl ${
                titleVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              aria-live="polite"
              aria-label={HERO_TITLE}
            >
              <span className="hero-typewriter-track">
                <span>{typedTitle}</span>
                <span className="hero-typewriter-cursor" aria-hidden="true" />
              </span>
            </h1>

            <p
              className={`mt-4 max-w-md text-center font-type-light-sans text-[11px] uppercase tracking-[0.34em] text-white/50 transition-all duration-700 md:text-left ${
                titleVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
              }`}
            >
              {isLive ? "Live now" : "Official page"}
            </p>
          </div>
        </div>
      </div>

      <div className="hero-scene-divider" aria-hidden="true">
        <div className="hero-scene-divider__line" />
      </div>
    </section>
  );
}
