"use client";

import { useEffect, useState } from "react";
import { useSuwerenStore, type AddictionType } from "@/lib/store";
import { AddictionCard } from "@/components/AddictionCard";
import { RunningCard } from "@/components/RunningCard";
import { AICoach } from "@/components/AICoach";
import { Chat } from "@/components/Chat";
import { InstallPrompt } from "@/components/InstallPrompt";
import { cn } from "@/lib/utils";

type Tab = AddictionType | "running" | "coach";

const TABS: { id: Tab; label: string }[] = [
  { id: "nicotine", label: "Papierosy" },
  { id: "thc", label: "Trawa" },
  { id: "nofap", label: "Walenie" },
  { id: "running", label: "Bieganie" },
  { id: "coach", label: "Trener" },
];

export default function Home() {
  const hydrated = useSuwerenStore((s) => s.hydrated);
  const error = useSuwerenStore((s) => s.error);
  const tracks = useSuwerenStore((s) => s.tracks);
  const hydrate = useSuwerenStore((s) => s.hydrate);
  const [tab, setTab] = useState<Tab>("nicotine");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <main className="min-h-screen bg-black text-zinc-100 flex flex-col pb-20">
        <header className="w-full py-6 px-6 flex flex-col items-center justify-center border-b border-zinc-800 bg-zinc-900/10">
          <div className="text-sm font-mono tracking-widest text-zinc-500 mb-1 uppercase">Suweren</div>
          <div className="text-xl font-black tracking-tight text-white">System śledzenia postępu</div>
        </header>

        {hydrated && tracks && (
          <nav className="sticky top-0 z-10 flex gap-1 px-4 py-2 overflow-x-auto bg-black/90 backdrop-blur border-b border-zinc-800">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-4 py-2 whitespace-nowrap font-mono text-xs uppercase tracking-wider transition-colors",
                  tab === t.id
                    ? "bg-emerald-600 text-black"
                    : "text-zinc-500 hover:text-zinc-200 border border-zinc-800"
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
        )}

        {!hydrated && (
          <div className="text-center mt-12 text-zinc-500 font-mono text-sm">Ładowanie danych...</div>
        )}

        {error && (
          <div className="text-center mt-12 text-red-400 font-mono text-sm px-6">
            Błąd połączenia z bazą danych: {error}
          </div>
        )}

        {hydrated && tracks && (
          <div className="max-w-2xl mx-auto w-full px-6 mt-6">
            {tab === "nicotine" && <AddictionCard type="nicotine" />}
            {tab === "thc" && <AddictionCard type="thc" />}
            {tab === "nofap" && <AddictionCard type="nofap" />}
            {tab === "running" && <RunningCard />}
            {tab === "coach" && (
              <>
                <AICoach />
                <Chat />
              </>
            )}
          </div>
        )}

        <footer className="mt-auto pt-20 flex flex-col items-center gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="text-[10px] font-mono uppercase tracking-[0.5em]">Suweren v2.0</div>
        </footer>
      </main>
      <InstallPrompt />
    </>
  );
}
