import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { StreamRatingsPage } from "@/features/ratings/components/StreamRatingsPage";
import { RatingHelpPopup } from "@/features/ratings/components/RatingHelpPopup";

export const metadata: Metadata = {
  title: "Оценка стримов | SASAVOT",
  description: "Отдельная страница для анонимной оценки прошедших стримов SASAVOT без регистрации и без сбора персональных данных.",
};

export default function RatingPage() {
  return (
    <main className="site-dark-glow h-screen overflow-hidden bg-transparent text-zinc-100">
      <Navbar />
      <div className="relative h-screen overflow-hidden bg-transparent pt-[56px] md:pt-[92px]">
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

        <div className="relative z-10">
          <section className="flex h-[calc(100vh-56px)] flex-col overflow-hidden px-0 pb-0 md:h-[calc(100vh-92px)] md:px-6 md:pb-6">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
              <div className="min-h-0 flex-1">
                <StreamRatingsPage />
              </div>
            </div>
          </section>
        </div>
      </div>
      <RatingHelpPopup />
    </main>
  );
}
