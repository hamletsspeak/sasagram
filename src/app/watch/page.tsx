import type { Metadata } from "next";
import WatchPageClient from "./WatchPageClient";

export const metadata: Metadata = {
  title: "Смотреть | SASAVOT",
  description: "Отдельная страница для просмотра активного стрима SASAVOT на Twitch с чатом.",
};

export default function WatchPage() {
  return <WatchPageClient />;
}
