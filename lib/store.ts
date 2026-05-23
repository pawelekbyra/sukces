import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInHours, differenceInDays } from 'date-fns';

interface AddictionState {
  lastReset: string; // ISO string
  yearsOfAddiction: number;
}

interface SuwerenState {
  nicotine: AddictionState;
  thc: AddictionState;
  noFap: AddictionState;
  runningKmThisWeek: number;
  pIndex: number;

  // Actions
  resetNicotine: () => void;
  resetThc: () => void;
  resetNoFap: () => void;
  addRunningKm: (km: number) => void;
  updatePIndex: () => void;
  setYearsOfAddiction: (type: 'nicotine' | 'thc' | 'noFap', years: number) => void;
  setLastReset: (type: 'nicotine' | 'thc' | 'noFap', date: string) => void;
}

export const useSuwerenStore = create<SuwerenState>()(
  persist(
    (set, get) => ({
      nicotine: { lastReset: new Date().toISOString(), yearsOfAddiction: 18 },
      thc: { lastReset: new Date().toISOString(), yearsOfAddiction: 0 },
      noFap: { lastReset: new Date().toISOString(), yearsOfAddiction: 0 },
      runningKmThisWeek: 0,
      pIndex: 0,

      resetNicotine: () => {
        set((state) => ({
          nicotine: { ...state.nicotine, lastReset: new Date().toISOString() }
        }));
        get().updatePIndex();
      },
      resetThc: () => {
        set((state) => ({
          thc: { ...state.thc, lastReset: new Date().toISOString() }
        }));
        get().updatePIndex();
      },
      resetNoFap: () => {
        set((state) => ({
          noFap: { ...state.noFap, lastReset: new Date().toISOString() }
        }));
        get().updatePIndex();
      },

      addRunningKm: (km) => {
        set((state) => ({
          runningKmThisWeek: state.runningKmThisWeek + km
        }));
        get().updatePIndex();
      },

      setYearsOfAddiction: (type, years) => {
        set((state) => ({
          [type]: { ...state[type], yearsOfAddiction: years }
        }));
        get().updatePIndex();
      },

      setLastReset: (type, date) => {
        set((state) => ({
          [type]: { ...state[type], lastReset: date }
        }));
        get().updatePIndex();
      },

      updatePIndex: () => {
        const { nicotine, thc, noFap, runningKmThisWeek } = get();
        const now = new Date();

        // Scoring logic
        // Base (Passive)
        const nicotineHours = differenceInHours(now, new Date(nicotine.lastReset));
        const thcHours = differenceInHours(now, new Date(thc.lastReset));
        const noFapDays = differenceInDays(now, new Date(noFap.lastReset));

        // Multipliers based on years of addiction (1 + years/18)
        const nicotineMult = 1 + (nicotine.yearsOfAddiction / 18);
        const thcMult = 1 + (thc.yearsOfAddiction / 18);
        const noFapMult = 1 + (noFap.yearsOfAddiction / 18);

        // Calculate points
        // Nicotine: 0.1 pt per hour * mult
        // THC: 0.2 pt per hour * mult
        // No-Fap: 5 pts per day * mult
        const nicotinePoints = nicotineHours * 0.1 * nicotineMult;
        const thcPoints = thcHours * 0.2 * thcMult;
        const noFapPoints = noFapDays * 5 * noFapMult;

        // Catalyst (Active)
        // 2 pts per km over 35km/week
        const runningBonus = Math.max(0, runningKmThisWeek - 35) * 2;

        const totalPIndex = Math.round(nicotinePoints + thcPoints + noFapPoints + runningBonus);

        set({ pIndex: totalPIndex });
      },
    }),
    {
      name: 'suweren-storage',
    }
  )
);
