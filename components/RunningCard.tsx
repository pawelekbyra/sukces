"use client";

import { useSuwerenStore } from "@/lib/store";
import { Trophy, Plus } from "lucide-react";

export function RunningCard() {
  const runningKmThisWeek = useSuwerenStore((s) => s.runningKmThisWeek);
  const addRunningKm = useSuwerenStore((s) => s.addRunningKm);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Bieganie</span>
        <Trophy className="w-4 h-4 text-zinc-700" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">{runningKmThisWeek}</span>
        <span className="text-zinc-500 font-mono text-sm">km / tydz</span>
      </div>
      <button
        onClick={() => addRunningKm(1)}
        className="mt-2 w-full py-2 border border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase"
      >
        <Plus className="w-4 h-4" /> Dodaj kilometr
      </button>
    </div>
  );
}
