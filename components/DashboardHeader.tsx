"use client";

import { useSuwerenStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const { pIndex, updatePIndex } = useSuwerenStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    updatePIndex();
    const interval = setInterval(updatePIndex, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [updatePIndex]);

  if (!mounted) return (
    <header className="w-full py-12 px-6 flex flex-col items-center justify-center border-b border-zinc-800 bg-zinc-900/10">
      <div className="text-sm font-mono tracking-widest text-zinc-500 mb-2 uppercase">Wskaźnik P</div>
      <div className="text-8xl font-black tracking-tighter text-white">--</div>
    </header>
  );

  const isLow = pIndex < 30;
  const isHigh = pIndex > 70;

  return (
    <header className={cn(
      "w-full py-12 px-6 flex flex-col items-center justify-center border-b transition-all duration-1000",
      isLow ? "border-red-900/50 bg-red-950/10 shadow-[0_0_50px_rgba(153,27,27,0.2)]" :
      isHigh ? "border-emerald-500/50 bg-emerald-950/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]" :
      "border-zinc-800 bg-zinc-900/10"
    )}>
      <div className="text-sm font-mono tracking-widest text-zinc-500 mb-2 uppercase">Wskaźnik P</div>
      <div className={cn(
        "text-8xl font-black tracking-tighter transition-all duration-1000",
        isLow ? "text-red-600 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" :
        isHigh ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" :
        "text-white"
      )}>
        {pIndex}
      </div>
      <div className={cn(
        "mt-4 text-xs font-mono uppercase tracking-[0.3em]",
        isLow ? "text-red-500" : isHigh ? "text-emerald-500" : "text-zinc-500"
      )}>
        {isLow ? "STATUS: TOKSYCZNY / RESET WYMAGANY" :
         isHigh ? "STATUS: SUWERENNY / KLAROWNOŚĆ" :
         "STATUS: REGENERACJA W TOKU"}
      </div>
    </header>
  );
}
