import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import TwitchVods from "@/components/TwitchVods";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-gray-950 text-white">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <TwitchVods />
      <Contact />
      <Footer />
    </main>
  );
}
