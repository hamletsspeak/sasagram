import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { WatchLivePage } from "@/features/twitch/components/WatchLivePage";

export const metadata: Metadata = {
  title: "Смотреть | SASAVOT",
  description: "Отдельная страница для просмотра активного стрима SASAVOT на Twitch с чатом.",
};

export default function WatchPage() {
  return (
    <main className="site-dark-glow min-h-screen bg-transparent text-zinc-100">
      <Navbar />
      <div className="relative min-h-screen overflow-hidden bg-transparent pt-[92px]">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src={encodeURI("/assets/logo/фон_остальные_разделы.webm")} type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_10%_-10%,rgba(151,17,34,0.24),transparent_55%),radial-gradient(90%_75%_at_92%_8%,rgba(99,8,22,0.18),transparent_50%)]" />
        </div>

        <div className="relative z-10">
          <section className="pt-2">
            <WatchLivePage />
          </section>
        </div>
      </div>
    </main>
  );
}
