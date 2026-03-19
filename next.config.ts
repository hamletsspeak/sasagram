import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: configDir,
  },
  experimental: {
    optimizePackageImports: ["@react-three/drei", "gsap", "swiper", "three", "lenis"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.kick.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.kick.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unavatar.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "clips-media-assets2.twitch.tv",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
