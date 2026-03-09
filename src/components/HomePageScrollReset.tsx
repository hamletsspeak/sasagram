"use client";

import { useEffect } from "react";

export default function HomePageScrollReset() {
  useEffect(() => {
    const resetToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const prevRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    resetToTop();
    const rafId = window.requestAnimationFrame(resetToTop);
    const timeoutId = window.setTimeout(resetToTop, 0);
    window.addEventListener("pageshow", resetToTop);

    return () => {
      window.removeEventListener("pageshow", resetToTop);
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      history.scrollRestoration = prevRestoration;
    };
  }, []);

  return null;
}
