"use client";

import { useEffect, useState } from "react";
import { useSuwerenStore, type AddictionType } from "@/lib/store";
import { getCurrentStreak } from "@/lib/streaks";
import { cn } from "@/lib/utils";

const ORDER: AddictionType[] = ["nicotine", "thc", "nofap"];

interface SummaryProps {
  onSelect: (type: AddictionType) => void;
}

export function Summary({ onSelect }: SummaryProps) {
  const tracks = useSuwerenStore((s) => s.tracks!);
  const events = useSuwerenStore((s) => s.events);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {ORDER.filter((type) => tracks[type]).map((type) => {
        const track = tracks[type];
        const streak = getCurrentStreak(events, type, track.trackingStart, now);
        const clean = streak.days > 0;

        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 transition-colors p-6 text-left"
          >
            <span className="text-zinc-400 font-mono text-sm uppercase tracking-wider">
              {track.name}
            </span>
            <span
              className={cn(
                "text-4xl font-black tabular-nums",
                clean ? "text-emerald-400" : "text-red-500"
              )}
            >
              {clean ? streak.days : 0}
              <span className="text-base font-mono text-zinc-500 ml-1">dni</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
