"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import LazyVideo from "@/components/LazyVideo";

const TwitchVods = dynamic(
  () => import("@/features/twitch/components/TwitchVods"),
  { ssr: false },
);

export default function VodsPageClient() {
  return (
    <main className="site-dark-glow h-screen overflow-hidden bg-transparent text-zinc-100">
      <Navbar />
      <div className="relative h-full overflow-hidden">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <LazyVideo
            src={encodeURI("/assets/logo/фон_остальные_разделы.webm")}
            className="h-full w-full"
          />
        </div>
        <div className="relative z-10 h-full">
          <TwitchVods />
        </div>
      </div>
    </main>
  );
}
