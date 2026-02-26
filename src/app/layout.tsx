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
  title: "Alex Johnson — Full-Stack Developer",
  description:
    "Full-Stack Developer & UI/UX Designer based in San Francisco. Building beautiful, performant web experiences with React, Next.js, and Node.js.",
  keywords: ["developer", "portfolio", "full-stack", "react", "nextjs", "typescript"],
  authors: [{ name: "Alex Johnson" }],
  openGraph: {
    title: "Alex Johnson — Full-Stack Developer",
    description: "Full-Stack Developer & UI/UX Designer. Building beautiful web experiences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
