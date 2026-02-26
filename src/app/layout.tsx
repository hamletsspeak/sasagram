import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
