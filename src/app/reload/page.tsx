import type { Metadata } from "next";
import { Suspense } from "react";
import ReloadPageClient from "@/components/ReloadPageClient";

export const metadata: Metadata = {
  title: "Перезагрузка | SASAVOT",
  description: "Техническая страница полной перезагрузки маршрута и очистки клиентского кэша.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReloadPage() {
  return (
    <Suspense fallback={null}>
      <ReloadPageClient />
    </Suspense>
  );
}
