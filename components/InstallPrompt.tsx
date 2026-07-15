"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-emerald-600 text-black p-4 rounded flex items-center gap-3 shadow-lg z-50">
      <Download className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-bold">Zainstaluj aplikację</p>
        <p className="text-xs opacity-90">Dostęp z ekranu głównego telefonu</p>
      </div>
      <button
        onClick={handleInstall}
        className="px-3 py-1 bg-black text-emerald-400 text-xs font-bold rounded hover:bg-zinc-900 flex-shrink-0"
      >
        Instaluj
      </button>
      <button
        onClick={() => setShowPrompt(false)}
        className="text-black hover:opacity-70 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
