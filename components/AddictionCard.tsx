"use client";

import { useEffect, useState } from "react";
import { differenceInHours } from "date-fns";
import { useSuwerenStore, type AddictionType } from "@/lib/store";
import { getCurrentStreak, getLongestStreak, getLastRelapse } from "@/lib/streaks";
import { cn, toLocalDateTimeInputValue } from "@/lib/utils";
import { RefreshCcw, CalendarClock, Trophy } from "lucide-react";
import { HistoryCalendar } from "./HistoryCalendar";
import { PostRelapseModal } from "./PostRelapseModal";

interface AddictionCardProps {
  type: AddictionType;
}

export function AddictionCard({ type }: AddictionCardProps) {
  const track = useSuwerenStore((s) => s.tracks![type]);
  const events = useSuwerenStore((s) => s.events);
  const logRelapse = useSuwerenStore((s) => s.logRelapse);
  const editRelapseTimestamp = useSuwerenStore((s) => s.editRelapseTimestamp);

  const [showCalendar, setShowCalendar] = useState(false);
  const [showBackdate, setShowBackdate] = useState(false);
  const [backdateValue, setBackdateValue] = useState("");
  const [postRelapseOpen, setPostRelapseOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const streak = getCurrentStreak(events, type, track.trackingStart, now);
  const longest = getLongestStreak(events, type, track.trackingStart, now);
  const isPersonalBest = streak.days > 0 && streak.days >= longest;
  const lastRelapse = getLastRelapse(events, type);

  // Toggle the backdate form; when opening, pre-fill it with the current last-relapse
  // time so the date is always visible and editable.
  const toggleBackdate = () => {
    setShowBackdate((open) => {
      if (!open) {
        setBackdateValue(
          lastRelapse ? toLocalDateTimeInputValue(new Date(lastRelapse.timestamp)) : ""
        );
      }
      return !open;
    });
  };

  const handleBackdate = async () => {
    if (!backdateValue) return;
    const picked = new Date(backdateValue);
    if (Number.isNaN(picked.getTime()) || picked > now) return;
    const iso = picked.toISOString();
    // Editing the reference point (the most recent relapse) is what actually moves the
    // counter. If there is no relapse yet, create the first one.
    if (lastRelapse) {
      await editRelapseTimestamp(lastRelapse.id, iso);
    } else {
      await logRelapse(type, iso);
    }
    setShowBackdate(false);
  };

  const backdatePreview = (() => {
    if (!backdateValue) return null;
    const picked = new Date(backdateValue);
    if (Number.isNaN(picked.getTime())) return null;
    if (picked > now) return { kind: "future" as const };

    const totalHours = differenceInHours(now, picked);
    return { kind: "ok" as const, days: Math.floor(totalHours / 24), hours: totalHours % 24 };
  })();

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-none flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider">{track.name}</span>
        <span className="text-[10px] bg-zinc-800 px-2 py-0.5 text-zinc-400 font-mono">
          STAŻ: {track.yearsOfAddiction} LAT
        </span>
      </div>

      <div className="flex flex-col">
        <span className="text-3xl font-bold">
          {streak.days}
          <span className="text-lg text-zinc-500"> dni </span>
          {streak.hours}
          <span className="text-lg text-zinc-500"> godz.</span>
        </span>
        <span className="text-zinc-600 font-mono text-[10px] uppercase">bez czystej dopaminy</span>
      </div>

      <div className={cn(
        "flex items-center gap-2 text-xs font-mono",
        isPersonalBest ? "text-emerald-400" : "text-zinc-500"
      )}>
        <Trophy className="w-3.5 h-3.5" />
        {isPersonalBest ? "TO TWÓJ NAJLEPSZY WYNIK" : `Rekord: ${longest} dni`}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => setPostRelapseOpen(true)}
          className="py-2 border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase text-zinc-400 hover:text-red-400"
        >
          <RefreshCcw className="w-4 h-4" /> Relapse
        </button>
        <button
          onClick={toggleBackdate}
          className="py-2 border border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase text-zinc-400 hover:text-emerald-400"
        >
          <CalendarClock className="w-4 h-4" /> Popraw datę
        </button>
      </div>

      {showBackdate && (
        <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
          <label className="text-[10px] text-zinc-500 font-mono uppercase">
            {lastRelapse
              ? "Kiedy naprawdę doszło do ostatniego relapsu?"
              : "Kiedy doszło do ostatniego relapsu?"}
          </label>
          <input
            type="datetime-local"
            value={backdateValue}
            onChange={(e) => setBackdateValue(e.target.value)}
            max={toLocalDateTimeInputValue(now)}
            className="bg-black border border-zinc-700 text-zinc-100 font-mono text-xs p-2 outline-none focus:border-emerald-500/50"
          />
          {backdatePreview?.kind === "future" && (
            <span className="text-[10px] font-mono uppercase text-red-400">
              Data musi być z przeszłości
            </span>
          )}
          {backdatePreview?.kind === "ok" && (
            <span className="text-[10px] font-mono uppercase text-zinc-500">
              Licznik pokaże: <span className="text-emerald-400">{backdatePreview.days} dni {backdatePreview.hours} godz.</span>
            </span>
          )}
          <button
            onClick={handleBackdate}
            disabled={backdatePreview?.kind !== "ok"}
            className="py-1 border border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-mono text-[10px] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Zapisz datę
          </button>
        </div>
      )}

      <button
        onClick={() => setShowCalendar((v) => !v)}
        className="text-[10px] font-mono uppercase text-zinc-600 hover:text-zinc-300 transition-colors self-start"
      >
        {showCalendar ? "Ukryj kalendarz ▲" : "Pokaż kalendarz ▼"}
      </button>

      {showCalendar && <HistoryCalendar type={type} />}

      {postRelapseOpen && (
        <PostRelapseModal
          type={type}
          endedStreakDays={streak.days}
          onClose={() => setPostRelapseOpen(false)}
        />
      )}
    </div>
  );
}
