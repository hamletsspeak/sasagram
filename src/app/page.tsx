import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import StreamSchedule from "@/components/StreamSchedule";
import TwitchVods from "@/components/TwitchVods";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import DisclaimerOverlay from "@/components/DisclaimerOverlay";

export default function Home() {
  return (
    <main className="site-dark-glow bg-transparent text-zinc-100">
      <DisclaimerOverlay />
      <Navbar />
      <Hero />
      <About />
      <StreamSchedule />
      <TwitchVods />
      <Contact />
      <Footer />
    </main>
  );
}
