"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns";
import { pl } from "date-fns/locale";
import { useSuwerenStore, type AddictionType } from "@/lib/store";
import { getDayStatus } from "@/lib/streaks";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HistoryCalendarProps {
  type: AddictionType;
}

export function HistoryCalendar({ type }: HistoryCalendarProps) {
  const track = useSuwerenStore((s) => s.tracks![type]);
  const events = useSuwerenStore((s) => s.events);
  const [month, setMonth] = useState(() => new Date());

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="border-t border-zinc-800 pt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button onClick={() => setMonth((m) => subMonths(m, 1))} className="text-zinc-500 hover:text-zinc-200">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono uppercase text-zinc-400">
          {format(month, "LLLL yyyy", { locale: pl })}
        </span>
        <button onClick={() => setMonth((m) => addMonths(m, 1))} className="text-zinc-500 hover:text-zinc-200">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((d) => (
          <div key={d} className="text-center text-[9px] text-zinc-600 font-mono">{d}</div>
        ))}
        {days.map((day) => {
          const status = getDayStatus(events, type, day, track.trackingStart);
          const dimmed = !isSameMonth(day, month);
          return (
            <div
              key={day.toISOString()}
              title={format(day, "d MMMM yyyy", { locale: pl })}
              className={cn(
                "aspect-square flex items-center justify-center text-[10px] font-mono rounded-sm",
                dimmed && "opacity-30",
                status === "green" && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                status === "red" && "bg-red-500/20 text-red-400 border border-red-500/30",
                status === "future" && "bg-transparent text-zinc-700",
                status === "untracked" && "bg-transparent text-zinc-800"
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 text-[9px] font-mono text-zinc-600 justify-center">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500/40 inline-block" /> czysty</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500/40 inline-block" /> relapse</span>
      </div>
    </div>
  );
}
