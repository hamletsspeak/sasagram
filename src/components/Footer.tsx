"use client";

const OPEN_DISCLAIMER_EVENT = "sasagram:open-disclaimer";

export default function Footer() {
  const techSupportUrl = "https://t.me/haworking";
  const primaryLinks = [
    {
      label: "Twitch",
      href: "https://www.twitch.tv/sasavot",
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4.286 1 1 4.286v11.428h4.571V20h4.572l3.428-3.429h4.572L23 11.714V1H4.286Zm16.428 9.428-2.286 2.286h-4.571L10.43 16.143v-3.429H5.857V3.286h14.857v7.142ZM14.857 6h2.286v4.571h-2.286V6Zm-6.286 0h2.286v4.571H8.571V6Z" />
        </svg>
      ),
    },
    {
      label: "Telegram",
      href: "https://t.me/sasavot",
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.371 0 0 5.371 0 12s5.371 12 12 12 12-5.371 12-12S18.629 0 12 0Zm5.894 7.89-1.97 9.288c-.149.66-.538.822-1.086.512l-3.003-2.214-1.448 1.395c-.16.16-.295.295-.603.295l.216-3.06 5.57-5.034c.242-.216-.054-.336-.376-.12L8.31 13.286l-2.965-.926c-.645-.201-.657-.645.135-.954l11.577-4.462c.538-.201 1.007.12.837.946Z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/gleb0413",
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.9 1.35a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
        </svg>
      ),
    },
    {
      label: "Discord",
      href: "https://discord.com/invite/wl-141",
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.317 4.369A19.791 19.791 0 0 0 15.717 3c-.197.354-.426.828-.583 1.2a18.27 18.27 0 0 0-5.268 0c-.157-.372-.391-.846-.588-1.2a19.736 19.736 0 0 0-4.602 1.371C1.764 8.781.976 13.082 1.37 17.323a19.9 19.9 0 0 0 5.653 2.877c.454-.62.858-1.277 1.204-1.968-.662-.253-1.295-.568-1.89-.937.157-.114.31-.233.458-.354 3.646 1.698 7.605 1.698 11.207 0 .149.121.301.24.459.354-.596.37-1.23.685-1.893.938.346.69.75 1.347 1.204 1.967a19.86 19.86 0 0 0 5.655-2.878c.462-4.914-.79-9.176-3.11-12.953ZM8.02 14.736c-1.1 0-2-.99-2-2.204s.886-2.204 2-2.204c1.119 0 2.019.999 2 2.204 0 1.214-.886 2.204-2 2.204Zm7.96 0c-1.1 0-2-.99-2-2.204s.886-2.204 2-2.204c1.118 0 2.018.999 2 2.204 0 1.214-.882 2.204-2 2.204Z" />
        </svg>
      ),
    },
  ];

  const openIntro = () => {
    window.dispatchEvent(new Event(OPEN_DISCLAIMER_EVENT));
  };

  return (
    <footer className="border-t border-white/10 bg-black/55 py-6">
      <div className="mx-auto w-full max-w-6xl overflow-x-auto px-6">
        <div className="flex min-w-max items-center gap-6 whitespace-nowrap">
          <button
            type="button"
            onClick={openIntro}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:text-white"
            aria-label="Смотреть интро заново"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 transition group-hover:translate-x-0.5">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 10H15M15 10L10.5 5.5M15 10L10.5 14.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Смотреть интро заново</span>
          </button>

          <div className="ml-auto flex items-center gap-5">
            {primaryLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 transition-colors hover:text-white"
                aria-label={link.label}
              >
                <span className="text-zinc-400">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
              <span className="text-zinc-400">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7.5 12 14l9-6.5M4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-9A1.5 1.5 0 0 1 4.5 6Z" />
                </svg>
              </span>
              <span>VOTVOPROS.13@yandex.ru</span>
            </span>
            <span className="h-3.5 w-px bg-white/20" aria-hidden="true" />
            <a
              href={techSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Tech Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
