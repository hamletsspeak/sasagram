"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

const StreamRatingsPage = dynamic(
  () => import("@/features/ratings/components/StreamRatingsPage").then((m) => m.StreamRatingsPage),
  { ssr: false },
);

const RatingHelpPopup = dynamic(
  () => import("@/features/ratings/components/RatingHelpPopup").then((m) => m.RatingHelpPopup),
  { ssr: false },
);

export default function RatingPageClient() {
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
