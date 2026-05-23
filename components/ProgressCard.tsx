"use client";

import { useSuwerenStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { RefreshCcw, Plus, Trophy } from "lucide-react";
import { useState, useEffect } from "react";

interface ProgressCardProps {
  title: string;
  type: 'nicotine' | 'thc' | 'noFap' | 'running';
}

export function ProgressCard({ title, type }: ProgressCardProps) {
  const store = useSuwerenStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (type === 'running') {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider">{title}</span>
          <Trophy className="w-4 h-4 text-zinc-700" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{store.runningKmThisWeek}</span>
          <span className="text-zinc-500 font-mono text-sm">km / tydz</span>
        </div>
        <button
          onClick={() => store.addRunningKm(1)}
          className="mt-2 w-full py-2 border border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase"
        >
          <Plus className="w-4 h-4" /> Dodaj kilometr
        </button>
      </div>
    );
  }

  const addiction = store[type];
  const cleanTime = formatDistanceToNow(new Date(addiction.lastReset), { locale: pl });
  const resetFn = type === 'nicotine' ? store.resetNicotine : type === 'thc' ? store.resetThc : store.resetNoFap;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider">{title}</span>
        <span className="text-[10px] bg-zinc-800 px-2 py-0.5 text-zinc-400 font-mono">
          STAŻ: {addiction.yearsOfAddiction} LAT
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold capitalize">{cleanTime}</span>
        <span className="text-zinc-600 font-mono text-[10px] uppercase">bez czystej dopaminy</span>
      </div>
      <button
        onClick={() => {
          if (confirm("POTWIERDŹ RESET. STRACISZ PROGRES.")) {
            resetFn();
            store.updatePIndex();
          }
        }}
        className="mt-2 w-full py-2 border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase text-zinc-400 hover:text-red-400"
      >
        <RefreshCcw className="w-4 h-4" /> Resetuj licznik
      </button>
    </div>
  );
}
