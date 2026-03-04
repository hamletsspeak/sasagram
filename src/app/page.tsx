import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import DisclaimerOverlay from "@/components/DisclaimerOverlay";
import StreamSchedule from "@/features/schedule/components/StreamSchedule";
import TwitchVods from "@/features/twitch/components/TwitchVods";

export default function Home() {
  return (
    <main className="site-dark-glow bg-transparent text-zinc-100">
      <DisclaimerOverlay />
      <Navbar />
      <Hero />
      <div className="relative">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src={encodeURI("/assets/logo/фон_остальные_разделы.webm")} type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-black/52" />
          <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_10%_0%,rgba(149,18,35,0.28),transparent_58%),radial-gradient(80%_70%_at_88%_12%,rgba(121,13,29,0.2),transparent_54%)]" />
        </div>
        <div className="relative z-10">
          <About />
          <StreamSchedule />
          <TwitchVods />
          <Contact />
          <Footer />
        </div>
      </div>
    </main>
  );
}
