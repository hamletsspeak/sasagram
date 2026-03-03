"use client";

import { useState, useEffect } from "react";
import { AVATAR_TRIGGER_LINE_Y } from "@/lib/avatar-transition";

const NAVBAR_AVATAR_SRC = encodeURI("/assets/logo/Кружок_сасыч.webm");

const navLinks = [
  { label: "Главная", href: "#home" },
  { label: "О стримере", href: "#about" },
  { label: "Расписание", href: "#schedule" },
  { label: "Записи", href: "#vods" },
  { label: "Контакты", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [heroPassed, setHeroPassed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateHeroPassed = () => {
      frame = 0;
      const heroAvatar = document.querySelector<HTMLElement>("[data-hero-avatar-point='true']");
      if (!heroAvatar) return;
      const rect = heroAvatar.getBoundingClientRect();
      const triggerPointY = rect.top + rect.height / 2;
      const shouldPass = triggerPointY <= AVATAR_TRIGGER_LINE_Y;
      setHeroPassed((prev) => (prev === shouldPass ? prev : shouldPass));
    };

    const onScrollOrResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateHeroPassed);
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

  return (
    <header className="fixed top-2 left-0 right-0 z-50 px-4 pointer-events-none md:top-3 md:px-6">
      <a
        id="navbar-logo-anchor"
        href="#home"
        className={`fixed top-2 left-3 z-[60] flex items-center cursor-pointer md:top-3 md:left-6 ${
          heroPassed
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          id="navbar-logo-visual"
          className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-red-700/80 bg-black/35 shadow-[0_10px_28px_rgba(122,8,24,0.55)] md:h-16 md:w-16"
        >
          <video
            className="h-full w-full rounded-full scale-[1.34] object-cover object-[center_38%]"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label="SASAVOT"
          >
            <source src={NAVBAR_AVATAR_SRC} type="video/webm" />
          </video>
        </div>
        <span className="sr-only">SASAVOT</span>
      </a>

      <nav
        className={`pointer-events-auto mx-auto mt-0 flex w-fit items-center rounded-full border px-5 py-2 shadow-2xl transition-all duration-300 md:mt-0 md:px-8 md:py-3 ${
          scrolled
            ? "native-glass--strong shadow-[0_14px_40px_rgba(0,0,0,0.62)]"
            : "native-glass shadow-[0_12px_34px_rgba(0,0,0,0.5)]"
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
        <div className="native-glass--strong pointer-events-auto mx-auto mt-3 w-[min(94vw,880px)] rounded-3xl border px-6 py-5 shadow-[0_20px_55px_rgba(0,0,0,0.65)] md:hidden">
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
