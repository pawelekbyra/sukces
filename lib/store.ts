import { create } from 'zustand';

export type AddictionType = 'nicotine' | 'thc' | 'nofap';

export interface RelapseEvent {
  id: string;
  addiction: AddictionType;
  timestamp: string; // ISO 8601 — when the relapse actually happened
  loggedAt: string; // ISO 8601 — when the user recorded it (differs from timestamp for backdated entries)
  note?: string; // optional trigger/context, used later for pattern detection
}

export interface AddictionTrack {
  type: AddictionType;
  name: string;
  yearsOfAddiction: number;
  trackingStart: string; // ISO 8601 — first day this addiction was tracked
}

interface SuwerenState {
  tracks: Record<AddictionType, AddictionTrack> | null;
  events: RelapseEvent[];
  runningKmThisWeek: number;
  hydrated: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  logRelapse: (type: AddictionType, timestamp?: string, note?: string) => Promise<void>;
  setYearsOfAddiction: (type: AddictionType, years: number) => Promise<void>;
  addRunningKm: (km: number) => Promise<void>;
}

export const useSuwerenStore = create<SuwerenState>()((set, get) => ({
  tracks: null,
  events: [],
  runningKmThisWeek: 0,
  hydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Nie udało się pobrać danych z serwera');
      const data = await res.json();
      set({
        tracks: data.tracks,
        events: data.events,
        runningKmThisWeek: data.runningKmThisWeek,
        hydrated: true,
        error: null,
      });
    } catch (e) {
      set({ hydrated: true, error: e instanceof Error ? e.message : 'Nieznany błąd' });
    }
  },

  logRelapse: async (type, timestamp, note) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addiction: type, timestamp, note }),
    });
    if (!res.ok) throw new Error('Nie udało się zapisać relapsu');
    const event: RelapseEvent = await res.json();
    set((state) => ({ events: [...state.events, event] }));
  },

  setYearsOfAddiction: async (type, years) => {
    const res = await fetch('/api/tracks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, yearsOfAddiction: years }),
    });
    if (!res.ok) throw new Error('Nie udało się zapisać stażu');
    set((state) => ({
      tracks: state.tracks
        ? { ...state.tracks, [type]: { ...state.tracks[type], yearsOfAddiction: years } }
        : state.tracks,
    }));
  },

  addRunningKm: async (km) => {
    const res = await fetch('/api/running', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ km }),
    });
    if (!res.ok) throw new Error('Nie udało się zapisać kilometrów');
    const data = await res.json();
    set({ runningKmThisWeek: data.runningKmThisWeek });
  },
}));
