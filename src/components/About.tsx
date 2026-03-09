"use client";

import dynamic from "next/dynamic";

const CinematicStorytelling = dynamic(
  () => import("@/features/storytelling/components/CinematicStorytelling"),
  {
    ssr: false,
  },
);

export default function About() {
  return <CinematicStorytelling />;
}
