"use client";

import { useEffect, useRef, useState } from "react";
import { fetchJsonWithCache } from "@/lib/client-api-cache";
import { AVATAR_TRIGGER_LINE_Y } from "@/lib/avatar-transition";

const HERO_AVATAR_VIDEO_SRC = encodeURI("/assets/logo/Кружок_сасыч.webm");

const TWITCH_EMBED_FALLBACK_PARENTS = [
  "localhost",
  "127.0.0.1",
  "sasagram.vercel.app",
  "sasagram.d.kiloapps.io",
  "www.sasavot141.ru",
  "sasavot141.ru",
];

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

interface HeroTypewriterSlide {
  text: string;
  className: string;
  typeMs: number;
  eraseMs: number;
  holdMs: number;
}

const HERO_TYPEWRITER_SLIDES: HeroTypewriterSlide[] = [
  {
    text: "Глеб Борисович Орлов",
    className: "font-audex text-white",
    typeMs: 95,
    eraseMs: 95,
    holdMs: 10_000,
  },
  {
    text: "SASAVOT",
    className: "font-them-people text-[#b5162a] text-5xl sm:text-6xl md:text-7xl drop-shadow-[0_0_16px_rgba(146,12,30,0.75)]",
    typeMs: 220,
    eraseMs: 220,
    holdMs: 10_000,
  },
];

function getTwitchEmbedSrc(hostname: string | null): string {
  const params = new URLSearchParams({ channel: "sasavot", autoplay: "true", muted: "true" });
  const parents = new Set(TWITCH_EMBED_FALLBACK_PARENTS);
  if (hostname) parents.add(hostname);
  for (const parent of parents) params.append("parent", parent);
  return `https://player.twitch.tv/?${params.toString()}`;
}

function getTwitchChatEmbedSrc(hostname: string | null): string {
  const params = new URLSearchParams({ darkpopout: "true" });
  const parents = new Set(TWITCH_EMBED_FALLBACK_PARENTS);
  if (hostname) parents.add(hostname);
  for (const parent of parents) params.append("parent", parent);
  return `https://www.twitch.tv/embed/sasavot/chat?${params.toString()}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function Hero() {
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [embedHost] = useState<string | null>(() => (typeof window === "undefined" ? null : window.location.hostname));
  const [showFloatingPlayer, setShowFloatingPlayer] = useState(false);
  const [chatHidden, setChatHidden] = useState(false);
  const [pipHidden, setPipHidden] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [avatarShouldDock, setAvatarShouldDock] = useState(false);
  const [avatarInNavbar, setAvatarInNavbar] = useState(false);
  const [titleSlideIndex, setTitleSlideIndex] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [isTitleDeleting, setIsTitleDeleting] = useState(false);
  const [isScrollActive, setIsScrollActive] = useState(false);
  const [pipWidth, setPipWidth] = useState(300);
  const [pipHeight, setPipHeight] = useState(170);
  const [pipPosition, setPipPosition] = useState({ x: 0, y: 0 });
  const isLive = streamInfo?.isLive ?? false;
  const heroRef = useRef<HTMLElement | null>(null);
  const heroAvatarRef = useRef<HTMLDivElement | null>(null);
  const heroAvatarPointRef = useRef<HTMLDivElement | null>(null);
  const scrollPauseTimeoutRef = useRef<number | null>(null);
  const onlineBackgroundRef = useRef<HTMLVideoElement | null>(null);
  const offlineBackgroundRef = useRef<HTMLVideoElement | null>(null);
  const interactionRef = useRef({
    mode: "none" as "none" | "move" | "resize",
    resizeDir: "" as "" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw",
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  useEffect(() => {
    fetchJsonWithCache<StreamInfo>("api:twitch", "/api/twitch", { ttlMs: 45_000 })
      .then((data) => {
        setStreamInfo({
          user: data.user,
          isLive: data.isLive,
          stream: data.stream,
        });
      })
      .catch(() => {/* silently fail */});
  }, []);

  useEffect(() => {
    if (!streamInfo?.isLive) return;

    const updateFloatingPlayer = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const { bottom } = hero.getBoundingClientRect();
      const shouldFloat = bottom < 160;
      if (shouldFloat) {
        const maxX = Math.max(8, window.innerWidth - pipWidth - 8);
        const maxY = Math.max(8, window.innerHeight - pipHeight - 8);
        setPipPosition((prev) => (prev.x > 0 || prev.y > 0 ? prev : { x: maxX, y: maxY }));
      } else {
        setPipHidden(false);
      }
      setShowFloatingPlayer(shouldFloat);
    };

    updateFloatingPlayer();
    window.addEventListener("scroll", updateFloatingPlayer, { passive: true });
    window.addEventListener("resize", updateFloatingPlayer);

    return () => {
      window.removeEventListener("scroll", updateFloatingPlayer);
      window.removeEventListener("resize", updateFloatingPlayer);
    };
  }, [streamInfo?.isLive, pipWidth, pipHeight]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!isLive || !showFloatingPlayer || pipHidden) return;

      if (interactionRef.current.mode === "move") {
        const maxX = Math.max(8, window.innerWidth - pipWidth - 8);
        const maxY = Math.max(8, window.innerHeight - pipHeight - 8);
        const nextX = clamp(interactionRef.current.startPosX + (event.clientX - interactionRef.current.startX), 8, maxX);
        const nextY = clamp(interactionRef.current.startPosY + (event.clientY - interactionRef.current.startY), 8, maxY);
        setPipPosition({ x: nextX, y: nextY });
      }

      if (interactionRef.current.mode === "resize") {
        const { resizeDir } = interactionRef.current;
        const dx = event.clientX - interactionRef.current.startX;
        const dy = event.clientY - interactionRef.current.startY;

        let nextX = interactionRef.current.startPosX;
        let nextY = interactionRef.current.startPosY;
        let nextWidth = interactionRef.current.startWidth;
        let nextHeight = interactionRef.current.startHeight;

        if (resizeDir.includes("e")) nextWidth = interactionRef.current.startWidth + dx;
        if (resizeDir.includes("s")) nextHeight = interactionRef.current.startHeight + dy;
        if (resizeDir.includes("w")) {
          nextWidth = interactionRef.current.startWidth - dx;
          nextX = interactionRef.current.startPosX + dx;
        }
        if (resizeDir.includes("n")) {
          nextHeight = interactionRef.current.startHeight - dy;
          nextY = interactionRef.current.startPosY + dy;
        }

        const minWidth = 220;
        const minHeight = 124;
        const maxWidth = Math.min(920, window.innerWidth - 16);
        const maxHeight = Math.min(700, window.innerHeight - 16);

        if (nextWidth < minWidth) {
          if (resizeDir.includes("w")) nextX -= minWidth - nextWidth;
          nextWidth = minWidth;
        }
        if (nextWidth > maxWidth) {
          if (resizeDir.includes("w")) nextX += nextWidth - maxWidth;
          nextWidth = maxWidth;
        }

        if (nextHeight < minHeight) {
          if (resizeDir.includes("n")) nextY -= minHeight - nextHeight;
          nextHeight = minHeight;
        }
        if (nextHeight > maxHeight) {
          if (resizeDir.includes("n")) nextY += nextHeight - maxHeight;
          nextHeight = maxHeight;
        }

        const maxX = Math.max(8, window.innerWidth - nextWidth - 8);
        const maxY = Math.max(8, window.innerHeight - nextHeight - 8);

        setPipWidth(nextWidth);
        setPipHeight(nextHeight);
        setPipPosition({ x: clamp(nextX, 8, maxX), y: clamp(nextY, 8, maxY) });
      }
    };

    const onPointerUp = () => {
      interactionRef.current.mode = "none";
      interactionRef.current.resizeDir = "";
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [isLive, showFloatingPlayer, pipHidden, pipWidth, pipHeight]);

  useEffect(() => {
    if (!isLive || !showFloatingPlayer || pipHidden) return;

    const onResize = () => {
      const maxX = Math.max(8, window.innerWidth - pipWidth - 8);
      const maxY = Math.max(8, window.innerHeight - pipHeight - 8);
      setPipPosition((prev) => ({ x: clamp(prev.x, 8, maxX), y: clamp(prev.y, 8, maxY) }));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isLive, showFloatingPlayer, pipHidden, pipWidth, pipHeight]);

  useEffect(() => {
    let frame = 0;

    const updateAvatarDockTrigger = () => {
      frame = 0;
      const avatar = heroAvatarPointRef.current;
      if (!avatar) return;
      const rect = avatar.getBoundingClientRect();
      const triggerPointY = rect.top + rect.height / 2;
      const shouldDock = triggerPointY <= AVATAR_TRIGGER_LINE_Y;
      setAvatarShouldDock((prev) => (prev === shouldDock ? prev : shouldDock));
    };

    const onScrollOrResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateAvatarDockTrigger);
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
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
  }, [isLive, isHeroInView]);

  useEffect(() => {
    const onlineVideo = onlineBackgroundRef.current;
    const offlineVideo = offlineBackgroundRef.current;

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
  }, [isLive, isHeroInView]);

  useEffect(() => {
    setAvatarInNavbar(avatarShouldDock);
  }, [avatarShouldDock]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrollActive(true);
      if (scrollPauseTimeoutRef.current) {
        window.clearTimeout(scrollPauseTimeoutRef.current);
      }
      scrollPauseTimeoutRef.current = window.setTimeout(() => {
        setIsScrollActive(false);
      }, 140);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollPauseTimeoutRef.current) {
        window.clearTimeout(scrollPauseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isScrollActive || !isHeroInView) return;

    const activeSlide = HERO_TYPEWRITER_SLIDES[titleSlideIndex];
    const targetText = activeSlide.text;

    const timeout = setTimeout(() => {
      if (!isTitleDeleting && typedTitle.length < targetText.length) {
        setTypedTitle(targetText.slice(0, typedTitle.length + 1));
        return;
      }

      if (!isTitleDeleting && typedTitle.length === targetText.length) {
        setIsTitleDeleting(true);
        return;
      }

      if (isTitleDeleting && typedTitle.length > 0) {
        setTypedTitle(targetText.slice(0, typedTitle.length - 1));
        return;
      }

      setIsTitleDeleting(false);
      setTitleSlideIndex((prev) => (prev + 1) % HERO_TYPEWRITER_SLIDES.length);
    }, !isTitleDeleting && typedTitle.length < targetText.length
      ? activeSlide.typeMs
      : !isTitleDeleting && typedTitle.length === targetText.length
        ? activeSlide.holdMs
        : isTitleDeleting && typedTitle.length > 0
          ? activeSlide.eraseMs
          : 260);

    return () => clearTimeout(timeout);
  }, [titleSlideIndex, typedTitle, isTitleDeleting, isScrollActive, isHeroInView]);

  return (
    <>
      <section
        id="home"
        ref={heroRef}
        className="relative z-20 blood-divider flex min-h-screen items-start justify-center overflow-hidden bg-transparent pt-[66px] md:pt-[78px]"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {isLive ? (
            <video
              ref={onlineBackgroundRef}
              className="h-full w-full object-cover rotate-180"
              muted
              playsInline
              preload="auto"
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
              preload="auto"
              aria-hidden="true"
            >
              <source src={encodeURI("/assets/logo/фон_сайт_онлайн.webm")} type="video/webm" />
            </video>
          )}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_10%_-10%,rgba(151,17,34,0.3),transparent_55%),radial-gradient(90%_75%_at_92%_8%,rgba(99,8,22,0.26),transparent_50%)]" />
        </div>

        <div className="relative z-10 mt-5 flex w-full flex-col items-center justify-start gap-6 px-6 pb-10">
          <h1
            className={`hero-typewriter-line flex h-[64px] items-center justify-center text-center text-2xl sm:h-[82px] sm:text-4xl md:h-[112px] md:text-5xl ${HERO_TYPEWRITER_SLIDES[titleSlideIndex].className}`}
            aria-live="polite"
            aria-label={HERO_TYPEWRITER_SLIDES[titleSlideIndex].text}
          >
              <span className="hero-typewriter-track">
                <span>{typedTitle}</span>
                <span
                  className={`hero-typewriter-cursor ${titleSlideIndex === 1 ? "hero-typewriter-cursor--them-people" : ""}`}
                  aria-hidden="true"
                />
              </span>
            </h1>
          <div
            ref={heroAvatarRef}
            data-hero-avatar-root="true"
            className="relative"
            style={{ opacity: avatarInNavbar ? 0 : 1 }}
          >
            <div
              ref={heroAvatarPointRef}
              data-hero-avatar-point="true"
              className="size-[220px] shrink-0 aspect-square overflow-hidden rounded-full border-4 border-red-700/45 shadow-2xl md:size-[276px]"
            >
              <video
                className="h-full w-full scale-[1.34] object-cover object-[center_38%]"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Аватар SASAVOT"
              >
                <source src={HERO_AVATAR_VIDEO_SRC} type="video/webm" />
              </video>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
