import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import StreamSchedule from "@/components/StreamSchedule";
import TwitchVods from "@/components/TwitchVods";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-gray-950 text-white">
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
