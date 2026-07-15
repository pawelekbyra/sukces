"use client";

import { useEffect } from "react";
import { useSuwerenStore } from "@/lib/store";
import { AddictionCard } from "@/components/AddictionCard";
import { RunningCard } from "@/components/RunningCard";
import { AICoach } from "@/components/AICoach";
import { Chat } from "@/components/Chat";
import { InstallPrompt } from "@/components/InstallPrompt";

export default function Home() {
  const hydrated = useSuwerenStore((s) => s.hydrated);
  const error = useSuwerenStore((s) => s.error);
  const tracks = useSuwerenStore((s) => s.tracks);
  const hydrate = useSuwerenStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <main className="min-h-screen bg-black text-zinc-100 flex flex-col pb-20">
        <header className="w-full py-12 px-6 flex flex-col items-center justify-center border-b border-zinc-800 bg-zinc-900/10">
          <div className="text-sm font-mono tracking-widest text-zinc-500 mb-2 uppercase">Suweren</div>
          <div className="text-2xl font-black tracking-tight text-white">System śledzenia postępu</div>
        </header>

        {!hydrated && (
          <div className="text-center mt-12 text-zinc-500 font-mono text-sm">Ładowanie danych...</div>
        )}

        {error && (
          <div className="text-center mt-12 text-red-400 font-mono text-sm px-6">
            Błąd połączenia z bazą danych: {error}
          </div>
        )}

        {hydrated && tracks && (
          <>
            <div className="max-w-6xl mx-auto w-full px-6 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AddictionCard type="nicotine" />
              <AddictionCard type="thc" />
              <AddictionCard type="nofap" />
              <RunningCard />
            </div>

            <AICoach />
            <Chat />
          </>
        )}

        <footer className="mt-auto pt-20 flex flex-col items-center gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="text-[10px] font-mono uppercase tracking-[0.5em]">Suweren v2.0</div>
        </footer>
      </main>
      <InstallPrompt />
    </>
  );
}
