import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NavigationReloadSync from "@/components/NavigationReloadSync";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var navigationEntries = performance.getEntriesByType("navigation");
                  var navigationEntry = navigationEntries && navigationEntries[0];
                  var legacyNavigation = performance.navigation;
                  var isReload = (navigationEntry && navigationEntry.type === "reload") || (legacyNavigation && legacyNavigation.type === 1);
                  window.__sasagramPageReloading = isReload;
                  if (isReload) {
                    window.__sasagramPageReloadStartedAt = Date.now();
                    var styleElement = document.createElement("style");
                    styleElement.id = "page-reload-overlay-style";
                    styleElement.textContent = "#page-reload-overlay{opacity:1;visibility:visible;pointer-events:auto}";
                    document.head.appendChild(styleElement);
                  }
                } catch (error) {
                  window.__sasagramPageReloading = false;
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${ubuntu.variable} antialiased`}
      >
        <div
          id="page-reload-overlay"
          className="page-reload-overlay"
          aria-hidden="true"
        >
          <div className="page-reload-overlay__panel">
            <h2 className="page-reload-overlay__title">Reloading</h2>
            <div className="page-reload-overlay__progress" aria-hidden="true">
              <span className="page-reload-overlay__progress-bar" />
            </div>
          </div>
        </div>
        <NavigationReloadSync />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
