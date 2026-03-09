import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { WatchLivePage } from "@/features/twitch/components/WatchLivePage";

export const metadata: Metadata = {
  title: "Смотреть | SASAVOT",
  description: "Отдельная страница для просмотра активного стрима SASAVOT на Twitch с чатом.",
};

export default function WatchPage() {
  return (
    <main className="site-dark-glow h-screen overflow-hidden bg-transparent text-zinc-100">
      <Navbar />
      <div className="relative h-full overflow-hidden bg-transparent pt-[66px] md:pt-[92px]">
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
        </div>

        <div className="relative z-10 h-full">
          <section className="h-full pt-2">
            <WatchLivePage />
          </section>
        </div>
      </div>
    </main>
  );
}
