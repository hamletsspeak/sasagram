"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
  const [embedHost, setEmbedHost] = useState<string | null>(null);
  const [showFloatingPlayer, setShowFloatingPlayer] = useState(false);
  const [chatHidden, setChatHidden] = useState(false);
  const [pipHidden, setPipHidden] = useState(false);
  const [pipWidth, setPipWidth] = useState(300);
  const [pipHeight, setPipHeight] = useState(170);
  const [pipPosition, setPipPosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement | null>(null);
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
    fetch("/api/twitch")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setStreamInfo({ 
            user: data.user,
            isLive: data.isLive, 
            stream: data.stream 
          });
        }
      })
      .catch(() => {/* silently fail */});
  }, []);

  useEffect(() => {
    setEmbedHost(window.location.hostname);
  }, []);

  useEffect(() => {
    if (!streamInfo?.isLive) {
      setShowFloatingPlayer(false);
      setPipHidden(false);
      return;
    }

    const updateFloatingPlayer = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const { bottom } = hero.getBoundingClientRect();
      setShowFloatingPlayer(bottom < 160);
    };

    updateFloatingPlayer();
    window.addEventListener("scroll", updateFloatingPlayer, { passive: true });
    window.addEventListener("resize", updateFloatingPlayer);

    return () => {
      window.removeEventListener("scroll", updateFloatingPlayer);
      window.removeEventListener("resize", updateFloatingPlayer);
    };
  }, [streamInfo?.isLive]);

  useEffect(() => {
    if (!showFloatingPlayer) {
      setPipHidden(false);
    }
  }, [showFloatingPlayer]);

  useEffect(() => {
    if (!showFloatingPlayer || pipHidden) return;

    const maxX = Math.max(8, window.innerWidth - pipWidth - 8);
    const maxY = Math.max(8, window.innerHeight - pipHeight - 8);

    setPipPosition((prev) => {
      const hasPosition = prev.x > 0 || prev.y > 0;
      if (!hasPosition) {
        return { x: maxX, y: maxY };
      }
      return {
        x: clamp(prev.x, 8, maxX),
        y: clamp(prev.y, 8, maxY),
      };
    });
  }, [showFloatingPlayer, pipHidden, pipWidth]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!showFloatingPlayer || pipHidden) return;

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
  }, [showFloatingPlayer, pipHidden, pipWidth, pipHeight]);

  useEffect(() => {
    if (!showFloatingPlayer || pipHidden) return;

    const onResize = () => {
      const maxX = Math.max(8, window.innerWidth - pipWidth - 8);
      const maxY = Math.max(8, window.innerHeight - pipHeight - 8);
      setPipPosition((prev) => ({ x: clamp(prev.x, 8, maxX), y: clamp(prev.y, 8, maxY) }));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showFloatingPlayer, pipHidden, pipWidth, pipHeight]);

  const isLive = streamInfo?.isLive ?? false;

  return (
    <>
      <section
        id="home"
        ref={heroRef}
        className={`relative flex justify-center overflow-hidden bg-gray-950 ${
          isLive ? "min-h-screen items-start pt-28 pb-16" : "min-h-screen items-center"
        }`}
      >
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-3xl" />
      </div>

      <div className={`relative z-10 mx-auto px-6 text-center ${isLive ? "max-w-6xl" : "max-w-4xl"}`}>
        {/* Avatar */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {isLive ? (
              showFloatingPlayer && pipHidden ? null : (
                <div className={`${showFloatingPlayer && !pipHidden ? "" : "w-[min(94vw,1120px)]"}`}>
                  <div
                    className={`overflow-hidden border border-red-500/50 bg-black transition-all duration-500 ease-out ${
                      showFloatingPlayer && !pipHidden
                        ? "fixed z-50 rounded-xl shadow-2xl select-none"
                        : "rounded-3xl shadow-[0_24px_80px_rgba(239,68,68,0.28)]"
                    }`}
                    style={
                      showFloatingPlayer && !pipHidden
                        ? { width: `${pipWidth}px`, height: `${pipHeight}px`, left: `${pipPosition.x}px`, top: `${pipPosition.y}px` }
                        : undefined
                    }
                  >
                    {showFloatingPlayer && !pipHidden ? (
                      <iframe
                        src={getTwitchEmbedSrc(embedHost)}
                        className="h-full w-full"
                        frameBorder="0"
                        scrolling="no"
                        allowFullScreen
                        title="Live stream"
                      />
                    ) : (
                      <div className={`grid gap-0 ${chatHidden ? "" : "md:grid-cols-[minmax(0,1fr)_320px]"}`}>
                        <iframe
                          src={getTwitchEmbedSrc(embedHost)}
                          className={`w-full aspect-video md:min-h-[620px] ${chatHidden ? "" : "md:aspect-auto"}`}
                          frameBorder="0"
                          scrolling="no"
                          allowFullScreen
                          title="Live stream"
                        />
                        {!chatHidden ? (
                          <iframe
                            src={getTwitchChatEmbedSrc(embedHost)}
                            className="h-[360px] w-full border-t border-red-500/40 md:h-auto md:min-h-[620px] md:border-l md:border-t-0 md:border-red-500/40"
                            frameBorder="0"
                            scrolling="no"
                            title="Twitch chat"
                          />
                        ) : null}
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                    {!showFloatingPlayer ? (
                      <button
                        type="button"
                        onClick={() => setChatHidden((prev) => !prev)}
                        className="absolute top-3 right-3 z-[3] inline-flex items-center gap-1 rounded-full bg-gray-950/85 px-2.5 py-1 text-xs font-semibold text-gray-100 transition-colors hover:bg-gray-900"
                        aria-label={chatHidden ? "Показать чат" : "Скрыть чат"}
                      >
                        <svg
                          className={`h-3.5 w-3.5 transition-transform ${chatHidden ? "rotate-180" : ""}`}
                          viewBox="0 0 20 20"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path d="M7 4.5 12.5 10 7 15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {chatHidden ? "Показать чат" : "Скрыть чат"}
                      </button>
                    ) : null}
                    {showFloatingPlayer && !pipHidden ? (
                      <>
                        <div
                          className="absolute inset-x-0 top-0 z-[2] h-8 cursor-move bg-gradient-to-b from-gray-950/70 to-transparent"
                          onPointerDown={(event) => {
                            interactionRef.current.mode = "move";
                            interactionRef.current.startX = event.clientX;
                            interactionRef.current.startY = event.clientY;
                            interactionRef.current.startPosX = pipPosition.x;
                            interactionRef.current.startPosY = pipPosition.y;
                          }}
                        />
                        {[
                          { dir: "n", className: "absolute left-2 right-2 top-0 z-[2] h-1.5 cursor-ns-resize" },
                          { dir: "s", className: "absolute left-2 right-2 bottom-0 z-[2] h-1.5 cursor-ns-resize" },
                          { dir: "e", className: "absolute right-0 top-2 bottom-2 z-[2] w-1.5 cursor-ew-resize" },
                          { dir: "w", className: "absolute left-0 top-2 bottom-2 z-[2] w-1.5 cursor-ew-resize" },
                          { dir: "ne", className: "absolute right-0 top-0 z-[2] h-3 w-3 cursor-nesw-resize" },
                          { dir: "nw", className: "absolute left-0 top-0 z-[2] h-3 w-3 cursor-nwse-resize" },
                          { dir: "se", className: "absolute right-0 bottom-0 z-[2] h-3 w-3 cursor-nwse-resize" },
                          { dir: "sw", className: "absolute left-0 bottom-0 z-[2] h-3 w-3 cursor-nesw-resize" },
                        ].map((handle) => (
                          <div
                            key={handle.dir}
                            className={handle.className}
                            onPointerDown={(event) => {
                              interactionRef.current.mode = "resize";
                              interactionRef.current.resizeDir = handle.dir as "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
                              interactionRef.current.startX = event.clientX;
                              interactionRef.current.startY = event.clientY;
                              interactionRef.current.startWidth = pipWidth;
                              interactionRef.current.startHeight = pipHeight;
                              interactionRef.current.startPosX = pipPosition.x;
                              interactionRef.current.startPosY = pipPosition.y;
                            }}
                          />
                        ))}
                        <div className="absolute top-3 right-3 z-[3] flex items-center gap-1 rounded-lg bg-gray-950/85 p-1">
                          <button
                            type="button"
                            onClick={() => setPipHidden(true)}
                            className="h-6 w-6 rounded text-gray-200 hover:bg-red-500/20 hover:text-red-300"
                            aria-label="Закрыть плеер"
                          >
                            x
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              )
            ) : streamInfo?.user?.profile_image_url ? (
              <Image
                src={streamInfo.user.profile_image_url}
                alt={streamInfo.user.display_name}
                width={144}
                height={144}
                className="w-36 h-36 rounded-full shadow-2xl ring-4 ring-purple-500/40"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-5xl font-black text-white shadow-2xl ring-4 ring-purple-500/40">
                S
              </div>
            )}
            {/* Live indicator — dynamic */}
            {!isLive ? (
              <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-gray-700 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                OFFLINE
              </div>
            ) : null}
          </div>
        </div>

        {/* Live stream info banner */}
        {isLive && streamInfo?.stream && (
          <a
            href="https://www.twitch.tv/sasavot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-red-600/10 border border-red-500/30 rounded-full px-5 py-2 mb-6 hover:bg-red-600/20 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-300 text-sm font-medium">
              В эфире сейчас: {streamInfo.stream.game_name}
            </span>
            <span className="text-gray-500 text-sm">
              👁 {streamInfo.stream.viewer_count.toLocaleString("ru-RU")}
            </span>
          </a>
        )}

        {!isLive && (
          <>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-purple-300 text-sm font-medium">Стример • Контент-мейкер</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              Привет, я{" "}
              <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                SASAVOT
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-8 font-light">
              Стримлю, играю, развлекаю 🎮
            </p>

            <p className="text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Добро пожаловать на мой официальный сайт! Здесь ты найдёшь всё о стримах, контенте и способах связи.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.twitch.tv/sasavot"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 hover:shadow-purple-500/40"
              >
                {/* Twitch icon */}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                </svg>
                Смотреть на Twitch
              </a>
              <a
                href="#contact"
                className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                Написать мне
              </a>
            </div>

            {/* Social links */}
            <div className="mt-12 flex justify-center gap-5">
          {[
            {
              label: "Twitch",
              href: "https://www.twitch.tv/sasavot",
              icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                </svg>
              ),
            },
            {
              label: "YouTube",
              href: "https://www.youtube.com/@sasavot",
              icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              ),
            },
            {
              label: "VK",
              href: "https://vk.com/sasavot",
              icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
                </svg>
              ),
            },
            {
              label: "Telegram",
              href: "https://t.me/sasavot",
              icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              ),
            },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/50 flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all duration-200"
            >
              {social.icon}
            </a>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Scroll indicator */}
      {!isLive && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-xs uppercase tracking-widest">Листай вниз</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      )}
      </section>

    </>
  );
}
