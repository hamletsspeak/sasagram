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
  title: "SASASITE",
  description:
    "Официальный сайт стримера SASAVOT. Прямые эфиры на Twitch и YouTube, игровой контент, коллаборации и многое другое.",
  keywords: ["SASAVOT", "стример", "twitch", "youtube", "стрим", "игры", "контент"],
  authors: [{ name: "SASAVOT" }],
  openGraph: {
    title: "SASASITE",
    description: "Официальный сайт стримера SASAVOT. Прямые эфиры, игровой контент и коллаборации.",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
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
      <head>
        <link rel="icon" type="image/png" href="/icon.png?v=2" />
        <link rel="shortcut icon" type="image/png" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2" />
      </head>
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
