"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useRef, useState } from "react";

const CinematicStorytelling = dynamic(
  () => import("@/features/storytelling/components/CinematicStorytelling"),
  {
    ssr: false,
  },
);

export default function About() {
  const [shouldRenderStory, setShouldRenderStory] = useState(false);
  const sentinelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startTransition(() => {
          setShouldRenderStory(true);
        });
        observer.disconnect();
      },
      { rootMargin: "500px 0px 500px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (!shouldRenderStory) {
    return <section id="about" ref={sentinelRef} className="min-h-[50vh]" aria-hidden="true" />;
  }

  return <CinematicStorytelling />;
}
