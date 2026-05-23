import { DashboardHeader } from "@/components/DashboardHeader";
import { ProgressCard } from "@/components/ProgressCard";
import { PanicButton } from "@/components/PanicButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col pb-20">
      <DashboardHeader />

      <div className="max-w-6xl mx-auto w-full px-6 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProgressCard title="Nikotyna" type="nicotine" />
        <ProgressCard title="THC" type="thc" />
        <ProgressCard title="No-Fap" type="noFap" />
        <ProgressCard title="Bieganie" type="running" />
      </div>

      <PanicButton />

      <footer className="mt-auto pt-20 flex flex-col items-center gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <div className="text-[10px] font-mono uppercase tracking-[0.5em]">System Operacyjny Suweren v0.1-Alpha</div>
        <div className="flex gap-8 text-[9px] font-mono text-zinc-500">
          <span>BIOHACKING</span>
          <span>NEUROPLASTYCZNOŚĆ</span>
          <span>DYSCYPLINA</span>
        </div>
      </footer>
    </main>
  );
}
