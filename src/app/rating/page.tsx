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
      <p className="fixed left-4 top-4 z-40 text-lg font-bold uppercase tracking-[0.28em] text-red-300/80 md:hidden">
        Рейтинг стримов
      </p>
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
            <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3 md:gap-5">
              <div className="px-4 pt-2 md:px-0 md:pt-0">
                <div className="hidden space-y-3 md:block">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-300/80">Рейтинг стримов</p>
                  <h1 className="font-fontick text-3xl text-white md:text-4xl">Оцените стримы</h1>
                  <p className="max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
                    Выберите неделю, найдите нужный стрим и поставьте оценку. Здесь показаны только реальные эфиры, чтобы было проще быстро найти нужную запись.
                  </p>
                </div>
              </div>

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
