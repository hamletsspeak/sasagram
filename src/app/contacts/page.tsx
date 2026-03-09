import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";

export default function ContactsPage() {
  return (
    <main className="site-dark-glow h-screen overflow-hidden bg-transparent text-zinc-100">
      <Navbar />
      <div className="relative h-full overflow-hidden">
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
        </div>
        <div className="relative z-10 h-full pt-[66px] md:pt-[78px]">
          <Contact />
        </div>
      </div>
    </main>
  );
}
