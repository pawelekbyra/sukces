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

export interface RunningEvent {
  id: string;
  timestamp: string; // ISO 8601 — when the run actually happened
  km: number;
  loggedAt: string; // ISO 8601 — when the user recorded it
}

interface SuwerenState {
  tracks: Record<AddictionType, AddictionTrack> | null;
  events: RelapseEvent[];
  runningEvents: RunningEvent[];
  hydrated: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  logRelapse: (type: AddictionType, timestamp?: string, note?: string) => Promise<void>;
  editRelapseTimestamp: (id: string, timestamp: string) => Promise<void>;
  setYearsOfAddiction: (type: AddictionType, years: number) => Promise<void>;
  logRunningKm: (km: number, timestamp?: string) => Promise<void>;
}

export const useSuwerenStore = create<SuwerenState>()((set, get) => ({
  tracks: null,
  events: [],
  runningEvents: [],
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
        runningEvents: data.runningEvents,
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

  editRelapseTimestamp: async (id, timestamp) => {
    const res = await fetch('/api/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, timestamp }),
    });
    if (!res.ok) throw new Error('Nie udało się zaktualizować daty relapsu');
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, timestamp } : e)),
    }));
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

  logRunningKm: async (km, timestamp) => {
    const res = await fetch('/api/running', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ km, timestamp }),
    });
    if (!res.ok) throw new Error('Nie udało się zapisać kilometrów');
    const event: RunningEvent = await res.json();
    set((state) => ({ runningEvents: [...state.runningEvents, event] }));
  },
}));
