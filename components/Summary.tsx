"use client";

import { useEffect, useState } from "react";
import { useSuwerenStore, type AddictionType } from "@/lib/store";
import { getCurrentStreak } from "@/lib/streaks";
import { cn } from "@/lib/utils";
import { Cigarette, Leaf, Hand, Footprints, ChevronRight, type LucideIcon } from "lucide-react";

type SummaryTarget = AddictionType | "running";

const ORDER: AddictionType[] = ["nicotine", "thc", "nofap"];

const ICONS: Record<AddictionType, LucideIcon> = {
  nicotine: Cigarette,
  thc: Leaf,
  nofap: Hand,
};

interface SummaryProps {
  onSelect: (target: SummaryTarget) => void;
}

export function Summary({ onSelect }: SummaryProps) {
  const tracks = useSuwerenStore((s) => s.tracks!);
  const events = useSuwerenStore((s) => s.events);
  const runningEvents = useSuwerenStore((s) => s.runningEvents);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const totalKm = runningEvents.reduce((sum, e) => sum + e.km, 0);
  const totalKmLabel = Number.isInteger(totalKm) ? String(totalKm) : totalKm.toFixed(1);

  return (
    <div className="flex flex-col gap-3">
      {ORDER.filter((type) => tracks[type]).map((type) => {
        const track = tracks[type];
        const streak = getCurrentStreak(events, type, track.trackingStart, now);
        const clean = streak.days > 0;
        const Icon = ICONS[type];

        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 transition-colors p-6 text-left"
          >
            <span className="flex items-center gap-2.5 text-zinc-400 font-mono text-sm uppercase tracking-wider">
              <Icon className="w-4 h-4 text-zinc-600" />
              {track.name}
            </span>
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  "text-4xl font-black tabular-nums",
                  clean ? "text-emerald-400" : "text-red-500"
                )}
              >
                {clean ? streak.days : 0}
                <span className="text-base font-mono text-zinc-500 ml-1">dni</span>
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-700" />
            </span>
          </button>
        );
      })}

      <button
        onClick={() => onSelect("running")}
        className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 transition-colors p-6 text-left"
      >
        <span className="flex items-center gap-2.5 text-zinc-400 font-mono text-sm uppercase tracking-wider">
          <Footprints className="w-4 h-4 text-zinc-600" />
          Przebiegnięte
        </span>
        <span className="flex items-center gap-3">
          <span className="text-4xl font-black tabular-nums text-emerald-400">
            {totalKmLabel}
            <span className="text-base font-mono text-zinc-500 ml-1">km</span>
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-700" />
        </span>
      </button>
    </div>
  );
}
