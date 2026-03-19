import type { Metadata } from "next";
import RatingPageClient from "./RatingPageClient";

export const metadata: Metadata = {
  title: "Оценка стримов | SASAVOT",
  description: "Отдельная страница для анонимной оценки прошедших стримов SASAVOT без регистрации и без сбора персональных данных.",
};

export default function RatingPage() {
  return <RatingPageClient />;
}
