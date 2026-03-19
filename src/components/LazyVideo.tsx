"use client";

import { useEffect, useRef, useState } from "react";

interface LazyVideoProps {
  src: string;
  type?: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  rootMargin?: string;
}

export default function LazyVideo({
  src,
  type = "video/webm",
  poster,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = "none",
  rootMargin = "200px 0px",
}: LazyVideoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!isVisible || !autoPlay) return;
    const video = videoRef.current;
    if (video) {
      void video.play().catch(() => {});
    }
  }, [isVisible, autoPlay]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          preload={preload}
          poster={poster}
          aria-hidden="true"
        >
          <source src={src} type={type} />
        </video>
      ) : (
        poster && (
          <img src={poster} alt="" className="h-full w-full object-cover" aria-hidden="true" />
        )
      )}
    </div>
  );
}
