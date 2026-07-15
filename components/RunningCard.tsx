"use client";

import { useEffect, useState } from "react";
import { useSuwerenStore } from "@/lib/store";
import { Trophy, Plus } from "lucide-react";
import { differenceInDays } from "date-fns";
import { toLocalDateTimeInputValue } from "@/lib/utils";

export function RunningCard() {
  const runningEvents = useSuwerenStore((s) => s.runningEvents);
  const logRunningKm = useSuwerenStore((s) => s.logRunningKm);

  const [showForm, setShowForm] = useState(false);
  const [dateValue, setDateValue] = useState(() => toLocalDateTimeInputValue(new Date()));
  const [kmValue, setKmValue] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const kmThisWeek = runningEvents
    .filter((e) => differenceInDays(now, new Date(e.timestamp)) < 7)
    .reduce((sum, e) => sum + e.km, 0);

  const recent = [...runningEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const handleSubmit = async () => {
    const km = Number(kmValue);
    if (!km || km <= 0) return;
    await logRunningKm(km, new Date(dateValue).toISOString());
    setKmValue("");
    setShowForm(false);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Bieganie</span>
        <Trophy className="w-4 h-4 text-zinc-700" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">{kmThisWeek}</span>
        <span className="text-zinc-500 font-mono text-sm">km / 7 dni</span>
      </div>

      <button
        onClick={() => setShowForm((v) => !v)}
        className="py-2 border border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase"
      >
        <Plus className="w-4 h-4" /> Zapisz bieg
      </button>

      {showForm && (
        <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
          <label className="text-[10px] text-zinc-500 font-mono uppercase">Kiedy i ile km?</label>
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            max={toLocalDateTimeInputValue(now)}
            className="bg-black border border-zinc-700 text-zinc-100 font-mono text-xs p-2 outline-none focus:border-emerald-500/50"
          />
          <input
            type="number"
            step="0.1"
            min="0"
            value={kmValue}
            onChange={(e) => setKmValue(e.target.value)}
            placeholder="Liczba km"
            className="bg-black border border-zinc-700 text-zinc-100 font-mono text-xs p-2 outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={handleSubmit}
            className="py-1 border border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-mono text-[10px] uppercase"
          >
            Zapisz
          </button>
        </div>
      )}

      {recent.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-zinc-800 pt-3">
          {recent.map((e) => (
            <div key={e.id} className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>{new Date(e.timestamp).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
              <span className="text-zinc-300">{e.km} km</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
