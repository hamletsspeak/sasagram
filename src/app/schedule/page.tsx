import Navbar from "@/components/Navbar";
import StreamSchedule from "@/features/schedule/components/StreamSchedule";

export default function SchedulePage() {
  return (
    <main className="h-dvh min-h-dvh overflow-hidden bg-black text-zinc-100">
      <Navbar />
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <StreamSchedule />
        </div>
      </div>
    </main>
  );
}
