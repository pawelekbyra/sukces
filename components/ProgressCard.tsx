"use client";

import { useSuwerenStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { pl } from "date-fns/locale";
import { RefreshCcw, Plus, Trophy, Calendar, Check, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ProgressCardProps {
  title: string;
  type: 'nicotine' | 'thc' | 'noFap' | 'running';
}

export function ProgressCard({ title, type }: ProgressCardProps) {
  const store = useSuwerenStore();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState("");

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

  const handleStartEdit = () => {
    // Convert ISO to datetime-local format: YYYY-MM-DDTHH:mm
    const date = new Date(addiction.lastReset);
    setEditDate(format(date, "yyyy-MM-dd'T'HH:mm"));
    setIsEditing(true);
  };

  const handleSaveDate = () => {
    if (editDate) {
      store.setLastReset(type as 'nicotine' | 'thc' | 'noFap', new Date(editDate).toISOString());
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider">{title}</span>
        <span className="text-[10px] bg-zinc-800 px-2 py-0.5 text-zinc-400 font-mono">
          STAŻ: {addiction.yearsOfAddiction} LAT
        </span>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <input
            type="datetime-local"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="bg-black border border-zinc-700 text-zinc-100 font-mono text-xs p-2 outline-none focus:border-emerald-500/50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveDate}
              className="flex-1 py-1 border border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-mono text-[10px] uppercase flex items-center justify-center gap-1"
            >
              <Check className="w-3 h-3" /> Zapisz
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-1 border border-zinc-700 text-zinc-500 font-mono text-[10px] uppercase flex items-center justify-center gap-1"
            >
              <X className="w-3 h-3" /> Anuluj
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <span className="text-2xl font-bold capitalize">{cleanTime}</span>
          <span className="text-zinc-600 font-mono text-[10px] uppercase">bez czystej dopaminy</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => {
            if (confirm("POTWIERDŹ RESET. STRACISZ PROGRES.")) {
              resetFn();
            }
          }}
          className="py-2 border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase text-zinc-400 hover:text-red-400"
        >
          <RefreshCcw className="w-4 h-4" /> Resetuj
        </button>
        <button
          onClick={handleStartEdit}
          className="py-2 border border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase text-zinc-400 hover:text-emerald-400"
        >
          <Calendar className="w-4 h-4" /> Ustaw datę
        </button>
      </div>
    </div>
  );
}
