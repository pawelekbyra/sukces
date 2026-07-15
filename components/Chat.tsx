"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setError("Nie udało się wczytać historii czatu"))
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: "user", content: text, createdAt: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Coś poszło nie tak");
      setMessages((prev) => [...prev, data.message]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nieznany błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 border-2 border-dashed border-zinc-800 bg-zinc-950 flex flex-col">
      <div className="flex items-center gap-3 text-emerald-500 p-4 border-b border-zinc-800">
        <MessageCircle className="w-5 h-5" />
        <h2 className="text-lg font-black uppercase tracking-tighter">Czat z trenerem</h2>
      </div>

      <div className="flex flex-col gap-3 p-4 max-h-[400px] overflow-y-auto">
        {loadingHistory && (
          <div className="text-zinc-500 font-mono text-xs text-center">Wczytuję historię...</div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <p className="text-zinc-500 text-center text-sm font-mono">
            Zadaj pytanie trenerowi — o triggerach, o tym co czujesz, o strategii.
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-emerald-600 text-black rounded-l-md rounded-tr-md"
                  : "bg-zinc-800 text-zinc-200 rounded-r-md rounded-tl-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs">
            <Loader2 className="w-4 h-4 animate-spin" /> Trener pisze...
          </div>
        )}

        {error && <div className="text-red-400 font-mono text-xs text-center">{error}</div>}

        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 p-4 border-t border-zinc-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Napisz do trenera..."
          disabled={loading}
          className="flex-1 bg-black border border-zinc-700 text-zinc-100 text-sm p-2 outline-none focus:border-emerald-500/50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-colors"
        >
          <Send className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
}
