"use client";

import { useState } from "react";
import { useSuwerenStore, type AddictionType } from "@/lib/store";
import { X } from "lucide-react";

interface PostRelapseModalProps {
  type: AddictionType;
  endedStreakDays: number;
  onClose: () => void;
}

export function PostRelapseModal({ type, endedStreakDays, onClose }: PostRelapseModalProps) {
  const track = useSuwerenStore((s) => s.tracks![type]);
  const logRelapse = useSuwerenStore((s) => s.logRelapse);

  const [stage, setStage] = useState<"confirm" | "aftermath">("confirm");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await logRelapse(type, undefined, note.trim() || undefined);
      setStage("aftermath");
    } catch {
      alert("Nie udało się zapisać relapsu — sprawdź połączenie i spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="bg-zinc-950 border border-zinc-800 max-w-md w-full p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-500">{track.name}</h3>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {stage === "confirm" ? (
          <>
            <p className="text-zinc-300 text-sm">
              Zapisujesz relaps teraz. Tego wpisu nie da się później usunąć ani przesunąć —
              tylko dodać kolejny.
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-500 font-mono uppercase">
                Co było triggerem? (opcjonalnie)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="np. stres w pracy, impreza, nuda wieczorem..."
                className="bg-black border border-zinc-700 text-zinc-100 text-xs p-2 outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="py-2 border border-red-500/50 bg-red-500/10 text-red-400 font-mono text-xs uppercase hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              {saving ? "Zapisuję..." : "Potwierdź relaps"}
            </button>
          </>
        ) : (
          <>
            {endedStreakDays > 0 && (
              <p className="text-zinc-500 text-xs font-mono uppercase">
                Zamknięty streak: {endedStreakDays} {endedStreakDays === 1 ? "dzień" : "dni"}
              </p>
            )}
            <p className="text-zinc-200 text-sm leading-relaxed">
              Jeden dzień na czerwono nie kasuje tego, czego się nauczyłeś/aś przez ostatnie{" "}
              {endedStreakDays > 0 ? `${endedStreakDays} dni` : "podejście"}. To normalna część procesu,
              nie dowód porażki — liczy się to, co zrobisz w kolejnej godzinie, nie to, że jeden dzień poszedł
              nie tak.
            </p>
            <p className="text-zinc-500 text-xs">
              Licznik zaczyna się od zera, ale Twój najlepszy wynik zostaje zapisany na zawsze — i wciąż
              jest do pobicia.
            </p>
            <button
              onClick={onClose}
              className="py-2 border border-zinc-700 text-zinc-400 font-mono text-xs uppercase hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
            >
              Zamknij
            </button>
          </>
        )}
      </div>
    </div>
  );
}
