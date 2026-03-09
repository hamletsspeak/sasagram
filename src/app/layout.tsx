import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-ubuntu",
});

export const metadata: Metadata = {
  title: "SASAVOT — Стример & Контент-мейкер",
  description:
    "Официальный сайт стримера SASAVOT. Прямые эфиры на Twitch и YouTube, игровой контент, коллаборации и многое другое.",
  keywords: ["SASAVOT", "стример", "twitch", "youtube", "стрим", "игры", "контент"],
  authors: [{ name: "SASAVOT" }],
  openGraph: {
    title: "SASAVOT — Стример & Контент-мейкер",
    description: "Официальный сайт стримера SASAVOT. Прямые эфиры, игровой контент и коллаборации.",
    type: "website",
  },
  icons: {
    icon: "/assets/logo/%D0%BB%D0%BE%D0%B3%D0%BE_%D1%81%D0%B0%D0%B9%D1%82.png",
    shortcut: "/assets/logo/%D0%BB%D0%BE%D0%B3%D0%BE_%D1%81%D0%B0%D0%B9%D1%82.png",
    apple: "/assets/logo/%D0%BB%D0%BE%D0%B3%D0%BE_%D1%81%D0%B0%D0%B9%D1%82.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body
        className={`${ubuntu.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
