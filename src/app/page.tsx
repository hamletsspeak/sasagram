import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Footer from "@/components/Footer";
import DisclaimerOverlay from "@/components/DisclaimerOverlay";
import HomePageScrollReset from "@/components/HomePageScrollReset";

export default function Home() {
  return (
    <main className="site-dark-glow bg-transparent text-zinc-100">
      <HomePageScrollReset />
      <DisclaimerOverlay />
      <Navbar />
      <Hero />
      <About />
      <Footer />
    </main>
  );
}
