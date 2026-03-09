"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  label: string;
  href: string;
  prefetch?: boolean;
};

const navLinks: NavLink[] = [
  { label: "Главная", href: "/", prefetch: false },
  { label: "Расписание", href: "/schedule", prefetch: false },
  { label: "Записи", href: "/vods", prefetch: false },
  { label: "Контакты", href: "/contacts", prefetch: false },
  { label: "Оценки", href: "/rating", prefetch: false },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (hoveredHref) {
      return hoveredHref === href;
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    const applyRailOffset = () => {
      const railWidth = window.matchMedia("(max-width: 767px)").matches ? "54px" : "76px";
      document.body.style.paddingLeft = railWidth;
      document.documentElement.style.setProperty("--left-rail-offset", railWidth);
    };

    applyRailOffset();
    window.addEventListener("resize", applyRailOffset);

    return () => {
      document.body.style.paddingLeft = "";
      document.documentElement.style.removeProperty("--left-rail-offset");
      window.removeEventListener("resize", applyRailOffset);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (menuOpen) {
      document.body.style.overflow = "hidden";
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-[90] w-[54px] border-r border-white/10 bg-black/86 backdrop-blur-sm md:w-[76px]">
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 md:bottom-6">
          <video
            className="h-8 w-8 object-contain opacity-95 [filter:grayscale(1)_brightness(0)_invert(1)_contrast(1.2)] md:h-9 md:w-9"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src={encodeURI("/assets/icons/Mouse scroll animation.webm")} type="video/webm" />
          </video>
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="fixed left-[27px] top-1/2 z-[130] -translate-x-1/2 -translate-y-1/2 text-zinc-100 transition-colors hover:text-white md:left-[38px]"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        <span className={`nav-rail-toggle ${menuOpen ? "is-open" : ""}`} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div className={`fixed inset-y-0 left-[54px] right-0 z-[100] md:left-[76px] ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
        />

        <div
          className={`absolute inset-0 border-t border-white/10 bg-black transition-transform duration-500 ease-out ${
            menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="grid h-full min-h-full grid-cols-1 min-[992px]:grid-cols-[minmax(0,58%)_minmax(0,42%)]">
            <ul className="relative z-10 flex h-full flex-col">
              {navLinks.map((link, index) => (
                <li key={link.href} className="flex-1 border-b border-white/10 first:border-t">
                  <Link
                    href={link.href}
                    prefetch={link.prefetch}
                    onMouseEnter={() => setHoveredHref(link.href)}
                    onMouseLeave={() => setHoveredHref(null)}
                    onFocus={() => setHoveredHref(link.href)}
                    onBlur={() => setHoveredHref(null)}
                    onClick={() => setMenuOpen(false)}
                    className="group flex h-full items-center px-6 md:px-10"
                  >
                    <span className="mr-3 text-xs font-medium align-middle text-white/45 md:text-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-[clamp(2rem,7vw,4.5rem)] uppercase leading-[0.9] tracking-[-0.02em] transition-all duration-200 ${
                        isLinkActive(link.href)
                          ? "font-gropled-bold text-white"
                          : "font-gropled-hollow text-white/20 [text-shadow:0_0_0_rgba(0,0,0,0)]"
                      }`}
                      style={isLinkActive(link.href) ? undefined : { WebkitTextStroke: "1px rgba(255,255,255,0.75)" }}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="relative hidden min-[992px]:block border-l border-white/10">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
              >
                <source src={encodeURI("/assets/bg/edit_navbar_slay.webm")} type="video/webm" />
              </video>
              <div className="absolute inset-0 bg-black/45" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
