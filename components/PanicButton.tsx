"use client";

import { cn } from "@/lib/utils";
import { Zap, Timer, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

export function PanicButton() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setTimeLeft(180);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 p-8 border-2 border-dashed border-zinc-800 flex flex-col items-center gap-6 bg-zinc-950">
      {!isActive ? (
        <>
          <div className="flex items-center gap-3 text-red-500 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
            <h2 className="text-xl font-black uppercase tracking-tighter">Protokół Zwarcia</h2>
          </div>
          <p className="text-zinc-500 text-center text-sm font-mono max-w-md">
            W CHWILI SILNEGO GŁODU: AKTYWUJ PROTOKÓŁ.
            3 MINUTY FIZYCZNEGO RESETU. NIE NEGOCJUJ Z MÓZGIEM.
          </p>
          <button
            onClick={() => setIsActive(true)}
            className="group relative px-12 py-4 bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-3"
          >
            <Zap className="w-5 h-5 fill-white" />
            <span className="font-black uppercase tracking-widest text-lg">ZWARCIE</span>
            <div className="absolute inset-0 border border-red-400 translate-x-1 translate-y-1 group-active:translate-x-0 group-active:translate-y-0 transition-transform"></div>
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="text-6xl font-black font-mono tracking-tighter text-white">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 180) * 100}%` }}
            ></div>
          </div>
          <div className="bg-red-950/20 border border-red-900/50 p-6 w-full text-center">
            <h3 className="text-red-500 font-bold uppercase mb-2">KOMENDA FIZYCZNA:</h3>
            <p className="text-2xl font-black text-white uppercase italic">30 POMPEK / LODOWATA WODA</p>
            <p className="mt-4 text-xs text-zinc-500 font-mono">ODDYCHAJ. TO TYLKO IMPULS. PRZEJDZIE.</p>
          </div>
        </div>
      )}
    </div>
  );
}
