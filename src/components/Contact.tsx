"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const contactLinks = [
  {
    label: "YouTube Нарезки",
    description: "Канал с нарезками",
    value: "@141kishkiFM",
    href: "https://www.youtube.com/@141kishkiFM",
    avatarUrl: "https://unavatar.io/youtube/141kishkiFM",
    avatar: "141",
    color: "from-red-500/30 via-rose-500/20 to-orange-500/30",
    border: "border-red-400/35",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "Telegram Канал",
    description: "Официальный TG канал",
    value: "t.me/sasavot",
    href: "https://t.me/sasavot",
    avatarUrl: "https://unavatar.io/telegram/sasavot",
    avatar: "SA",
    color: "from-sky-500/30 via-cyan-500/20 to-blue-500/30",
    border: "border-sky-400/35",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    description: "Комьюнити сервер",
    value: "discord.gg/wl-141",
    href: "https://discord.com/invite/wl-141",
    avatarUrl: "/assets/logo/ds_logo.jpg",
    avatar: "WL",
    color: "from-indigo-500/30 via-violet-500/20 to-blue-500/30",
    border: "border-indigo-400/35",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.369A19.791 19.791 0 0 0 15.717 3c-.197.354-.426.828-.583 1.2a18.27 18.27 0 0 0-5.268 0c-.157-.372-.391-.846-.588-1.2a19.736 19.736 0 0 0-4.602 1.371C1.764 8.781.976 13.082 1.37 17.323a19.9 19.9 0 0 0 5.653 2.877c.454-.62.858-1.277 1.204-1.968-.662-.253-1.295-.568-1.89-.937.157-.114.31-.233.458-.354 3.646 1.698 7.605 1.698 11.207 0 .149.121.301.24.459.354-.596.37-1.23.685-1.893.938.346.69.75 1.347 1.204 1.967a19.86 19.86 0 0 0 5.655-2.878c.462-4.914-.79-9.176-3.11-12.953ZM8.02 14.736c-1.1 0-2-.99-2-2.204s.886-2.204 2-2.204c1.119 0 2.019.999 2 2.204 0 1.214-.886 2.204-2 2.204Zm7.96 0c-1.1 0-2-.99-2-2.204s.886-2.204 2-2.204c1.118 0 2.018.999 2 2.204 0 1.214-.882 2.204-2 2.204Z" />
      </svg>
    ),
  },
  {
    label: "Предложить контент",
    description: "Пиши модератору в TG",
    value: "@uran_mod",
    href: "https://t.me/uran_mod",
    avatarVideoUrl: "/assets/logo/alert_orig.mp4",
    avatar: "UM",
    color: "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
    border: "border-emerald-400/35",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
];

const watchAlsoLinks = [
  {
    key: "rostikfacekid",
    label: "rostikfacekid",
    realName: "Ростик",
    href: "https://www.twitch.tv/rostikfacekid",
    platform: "Twitch",
    avatarUrl: "/api/twitch/avatar/rostikfacekid",
  },
  {
    key: "poisonika",
    label: "poisonika",
    realName: "Вероника",
    href: "https://www.twitch.tv/poisonika",
    platform: "Twitch",
    avatarUrl: "/api/twitch/avatar/poisonika",
  },
  {
    key: "tankzor",
    label: "tankzor",
    realName: "Танк",
    href: "https://www.twitch.tv/tankzor",
    platform: "Twitch",
    avatarUrl: "/api/twitch/avatar/tankzor",
  },
  {
    key: "formixyouknow",
    label: "formixyouknow",
    realName: "Витя",
    href: "https://www.twitch.tv/formixyouknow",
    platform: "Twitch",
    avatarUrl: "/api/twitch/avatar/formixyouknow",
  },
  {
    key: "narekcr",
    label: "narekCR",
    realName: "Нарек",
    href: "https://www.twitch.tv/narekcr",
    platform: "Twitch",
    avatarUrl: "/api/twitch/avatar/narekcr",
  },
  {
    key: "r4dom1r",
    label: "r4dom1r",
    realName: "Рома",
    href: "https://www.twitch.tv/r4dom1r",
    platform: "Twitch",
    avatarUrl: "/api/twitch/avatar/r4dom1r",
  },
  {
    key: "yurapivo",
    label: "yurapivo",
    realName: "Юра",
    href: "https://www.twitch.tv/yurapivo",
    platform: "Twitch",
    avatarUrl: "/api/twitch/avatar/yurapivo",
  },
  {
    key: "helin139ban",
    label: "helin139ban",
    realName: "Кирилл (Альфредо)",
    href: "https://kick.com/helin139ban",
    platform: "Kick",
    avatarUrl: "/api/kick/avatar/helin139ban",
  },
];

type CreatorLiveState = {
  isLive: boolean;
  avatarUrl?: string;
  displayName?: string;
  platform: "Twitch" | "Kick";
};

export default function Contact() {
  const [creatorStates, setCreatorStates] = useState<Record<string, CreatorLiveState>>({});

  useEffect(() => {
    let isActive = true;

    const loadStates = () => {
      fetch("/api/watch-also")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!isActive || !data?.creators) return;
          setCreatorStates(data.creators as Record<string, CreatorLiveState>);
        })
        .catch(() => {
          // Keep static fallback data when request fails.
        });
    };

    loadStates();
    const intervalId = window.setInterval(loadStates, 60_000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section id="contact" className="min-h-screen py-24 bg-gray-950 flex items-center">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Полезные ссылки
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Полезные ссылки
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Основные ссылки и площадки для связи, контента и общения.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {contactLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center"
              onMouseEnter={(event) => {
                if (!item.avatarVideoUrl) return;
                const video = event.currentTarget.querySelector("video");
                if (!video) return;
                video.currentTime = 0;
                video.play().catch(() => {});
              }}
              onMouseLeave={(event) => {
                if (!item.avatarVideoUrl) return;
                const video = event.currentTarget.querySelector("video");
                if (!video) return;
                video.pause();
                video.currentTime = 0;
              }}
            >
              <div
                className={`relative flex h-28 w-28 items-center justify-center rounded-full border bg-gradient-to-br ${item.color} ${item.border} shadow-xl transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-2xl sm:h-32 sm:w-32`}
              >
                {item.avatarVideoUrl ? (
                  <video
                    src={item.avatarVideoUrl}
                    className="h-full w-full rounded-full object-cover"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={item.label}
                  />
                ) : item.avatarUrl ? (
                  <Image
                    src={item.avatarUrl}
                    alt={item.label}
                    width={128}
                    height={128}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-black tracking-wide text-white sm:text-2xl">{item.avatar}</span>
                )}
                <span className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border border-gray-900 bg-gray-900 text-white shadow-lg">
                  {item.icon}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-white sm:text-base">{item.label}</p>
              <p className="mt-1 text-xs text-gray-400 sm:text-sm">{item.description}</p>
              <p className="mt-1 text-xs text-gray-300 sm:text-sm">{item.value}</p>
            </a>
          ))}
        </div>

        <div className="mt-16">
          <p className="mb-4 text-center text-purple-300 text-sm font-semibold uppercase tracking-[0.22em]">
            Смотреть также
          </p>
          <div className="flex flex-wrap items-start justify-center gap-4">
            {watchAlsoLinks.map((item) => (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-24 flex-col items-center text-center sm:w-28"
              >
                <div className="relative">
                  <Image
                    src={creatorStates[item.key]?.avatarUrl ?? item.avatarUrl}
                    alt={item.label}
                    width={80}
                    height={80}
                    className="h-16 w-16 rounded-full border border-gray-700/80 object-cover shadow-lg transition-transform duration-200 group-hover:-translate-y-1 sm:h-20 sm:w-20"
                  />
                  <span className="absolute bottom-0 right-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                    {item.platform === "Kick" ? (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 24 24" fill="currentColor" aria-label="Kick">
                        <path d="M3 2h7v8h4l7-8h0v6l-5 6 5 6v2h-6l-4-5h-2v5H3V2Z" />
                      </svg>
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-purple-300 bg-purple-500/95">
                        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-label="Twitch">
                          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <span
                    className={`absolute -top-1 -left-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      creatorStates[item.key]?.isLive
                        ? "bg-red-500/90 text-white"
                        : "bg-gray-800/90 text-gray-200"
                    }`}
                  >
                    {creatorStates[item.key]?.isLive ? "LIVE" : "OFF"}
                  </span>
                </div>
                <span className="mt-2 text-xs text-gray-300 transition-colors group-hover:text-white sm:text-sm">
                  @{item.label}
                </span>
                <span className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">
                  {item.realName}
                </span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
