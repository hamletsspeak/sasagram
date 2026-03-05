"use client";

import { useEffect, useMemo, useState } from "react";

const SECTION_IDS = ["home", "about", "schedule", "vods", "contact"] as const;

function getSections(): HTMLElement[] {
  return SECTION_IDS
    .map((id) => document.getElementById(id))
    .filter((section): section is HTMLElement => section !== null);
}

function Chevron({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      className={`h-5 w-5 ${direction === "up" ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function DesktopSectionNavigator() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionCount = useMemo(() => SECTION_IDS.length, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const update = () => setIsDesktop(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    const updateActiveSection = () => {
      const sections = getSections();
      if (sections.length === 0) return;

      const triggerY = window.innerHeight * 0.35;
      let nextIndex = 0;

      for (let index = 0; index < sections.length; index += 1) {
        if (sections[index].getBoundingClientRect().top <= triggerY) {
          nextIndex = index;
        }
      }

      setActiveIndex(nextIndex);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [isDesktop]);

  const goToIndex = (nextIndex: number) => {
    const sections = getSections();
    const safeIndex = Math.max(0, Math.min(nextIndex, sections.length - 1));
    const section = sections[safeIndex];

    if (!section) return;

    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!isDesktop || sectionCount < 2) {
    return null;
  }

  const canGoUp = activeIndex > 0;
  const canGoDown = activeIndex < sectionCount - 1;

  return (
    <div className="pointer-events-none fixed right-5 top-1/2 z-[70] hidden -translate-y-1/2 md:block">
      <div className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-red-500/35 bg-black/45 p-2 backdrop-blur-md">
        {canGoUp ? (
          <button
            type="button"
            onClick={() => goToIndex(activeIndex - 1)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-700/20 text-red-100 transition hover:border-red-300/65 hover:bg-red-600/35"
            aria-label="Перейти к предыдущему разделу"
          >
            <Chevron direction="up" />
          </button>
        ) : null}

        {canGoDown ? (
          <button
            type="button"
            onClick={() => goToIndex(activeIndex + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-700/20 text-red-100 transition hover:border-red-300/65 hover:bg-red-600/35"
            aria-label="Перейти к следующему разделу"
          >
            <Chevron direction="down" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
