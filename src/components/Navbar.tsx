"use client";

import { useState, useEffect, useRef, useCallback, type MouseEvent } from "react";

const navLinks = [
  { label: "Главная", href: "#home" },
  { label: "О стримере", href: "#about" },
  { label: "Расписание", href: "#schedule" },
  { label: "Записи", href: "#vods" },
  { label: "Контакты", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const logoVideoRef = useRef<HTMLVideoElement | null>(null);
  const logoIntervalRef = useRef<number | null>(null);

  const clearLogoInterval = useCallback(() => {
    if (logoIntervalRef.current !== null) {
      window.clearInterval(logoIntervalRef.current);
      logoIntervalRef.current = null;
    }
  }, []);

  const playLogo = useCallback(() => {
    const video = logoVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  }, []);

  const restartLogoInterval = useCallback(() => {
    clearLogoInterval();
    logoIntervalRef.current = window.setInterval(() => {
      playLogo();
    }, 8000);
  }, [clearLogoInterval, playLogo]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    restartLogoInterval();
    return () => clearLogoInterval();
  }, [clearLogoInterval, restartLogoInterval]);

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const video = logoVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
    restartLogoInterval();
  };

  return (
    <header className="fixed top-1 left-0 right-0 z-50 px-4 pointer-events-none md:top-2 md:px-6">
      <a
        href="#home"
        className="fixed top-2 left-3 z-[60] flex items-center cursor-pointer pointer-events-auto md:top-3 md:left-6"
        onClick={handleLogoClick}
      >
        <video
          ref={logoVideoRef}
          className="h-20 w-auto md:h-28"
          muted
          playsInline
          preload="metadata"
          aria-label="SASAVOT"
        >
          <source src="/assets/logo/sasavot_logo_v3.webm" type="video/webm" />
          <source src="/assets/logo/sasavot_logo_v2.webm" type="video/webm" />
          <source src="/assets/logo/sasavot_logo.webm" type="video/webm" />
        </video>
        <span className="sr-only">SASAVOT</span>
      </a>

      <a
        href="https://www.twitch.tv/sasavot"
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto fixed top-8 right-6 z-[60] hidden items-center gap-2 rounded-full border border-rose-500/55 bg-gradient-to-r from-rose-800 to-red-800 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(122,8,24,0.45)] transition-colors duration-200 hover:from-rose-700 hover:to-red-700 md:flex"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        Смотреть
      </a>

      <nav
        className={`pointer-events-auto mx-auto mt-5 flex w-fit items-center rounded-full border px-5 py-2 shadow-2xl backdrop-blur-xl transition-all duration-300 md:mt-6 md:px-8 md:py-3 ${
          scrolled
            ? "border-rose-900/65 bg-black/85 shadow-[0_14px_40px_rgba(0,0,0,0.7)]"
            : "border-zinc-800/90 bg-zinc-950/70 shadow-[0_12px_34px_rgba(0,0,0,0.56)]"
        }`}
      >
        {/* Desktop nav */}
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-zinc-400 hover:text-rose-200 text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile burger */}
        <button
          className="text-zinc-300 transition-colors hover:text-rose-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="pointer-events-auto mx-auto mt-3 w-[min(94vw,880px)] rounded-3xl border border-rose-900/50 bg-zinc-950/95 px-6 py-5 shadow-[0_20px_55px_rgba(0,0,0,0.7)] backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-zinc-300 hover:text-rose-200 text-sm font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="https://www.twitch.tv/sasavot"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-fit items-center gap-2 rounded-full border border-rose-500/60 bg-gradient-to-r from-rose-800 to-red-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-rose-700 hover:to-red-700"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Смотреть на Twitch
          </a>
        </div>
      )}
    </header>
  );
}
