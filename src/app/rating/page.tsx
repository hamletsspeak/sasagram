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
    <main className="h-dvh min-h-dvh overflow-hidden bg-black text-zinc-100">
      <Navbar />
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <StreamRatingsPage />
        </div>
      </div>
      <RatingHelpPopup />
    </main>
  );
}
