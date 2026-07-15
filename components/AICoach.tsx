"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function AICoach() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    setLoading(true);
    setError(null);
    setInsight(null);
    try {
      const res = await fetch("/api/ai-insight", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Coś poszło nie tak");
      setInsight(data.insight);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nieznany błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 p-8 border-2 border-dashed border-zinc-800 flex flex-col items-center gap-6 bg-zinc-950">
      {!insight && !loading && (
        <>
          <div className="flex items-center gap-3 text-emerald-500">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-black uppercase tracking-tighter">AI Coach</h2>
          </div>
          <p className="text-zinc-500 text-center text-sm font-mono max-w-md">
            Zapytaj, co teraz dzieje się w Twoim ciele i mózgu — na podstawie Twojej aktualnej
            kombinacji streaków i historii.
          </p>
          <button
            onClick={handleAsk}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 transition-colors font-black uppercase tracking-widest text-sm"
          >
            Co się teraz dzieje?
          </button>
        </>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-zinc-500 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin" /> Analizuję...
        </div>
      )}

      {error && (
        <div className="text-red-400 font-mono text-xs text-center">{error}</div>
      )}

      {insight && (
        <div className="flex flex-col gap-4 w-full">
          <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{insight}</p>
          <button
            onClick={() => setInsight(null)}
            className="self-center text-[10px] font-mono uppercase text-zinc-600 hover:text-zinc-300"
          >
            Zapytaj ponownie
          </button>
        </div>
      )}
    </div>
  );
}
