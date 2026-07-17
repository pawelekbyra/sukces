import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState,
  CURRENT_SCHEMA_VERSION,
  emptyState,
  HabitId,
  FinanceEventType,
} from './types';
import { todayKey } from './dates';

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface Actions {
  addRelapse: (habitId: HabitId, dateKey?: string) => string;
  removeRelapse: (id: string) => void;
  setHabitStart: (habitId: HabitId, dateKey: string) => void;

  addRun: (km: number, dateKey?: string) => string;
  removeRun: (id: string) => void;
  updateRun: (id: string, km: number, dateKey: string) => void;

  addFinanceEvent: (
    type: FinanceEventType,
    amount: number,
    description: string,
    dateKey?: string
  ) => string;
  removeFinanceEvent: (id: string) => void;
  setFinanceStart: (assets: number, liabilities: number, dateKey?: string) => void;
}

export const useStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...emptyState(),

      addRelapse: (habitId, dateKey) => {
        const id = genId();
        set((s) => ({
          relapses: [
            ...s.relapses,
            { id, habitId, dateKey: dateKey ?? todayKey(), createdAt: Date.now() },
          ],
        }));
        return id;
      },
      removeRelapse: (id) =>
        set((s) => ({ relapses: s.relapses.filter((r) => r.id !== id) })),
      setHabitStart: (habitId, dateKey) =>
        set((s) => ({ habitStart: { ...s.habitStart, [habitId]: dateKey } })),

      addRun: (km, dateKey) => {
        const id = genId();
        set((s) => ({
          runs: [...s.runs, { id, km, dateKey: dateKey ?? todayKey(), createdAt: Date.now() }],
        }));
        return id;
      },
      removeRun: (id) => set((s) => ({ runs: s.runs.filter((r) => r.id !== id) })),
      updateRun: (id, km, dateKey) =>
        set((s) => ({
          runs: s.runs.map((r) => (r.id === id ? { ...r, km, dateKey } : r)),
        })),

      addFinanceEvent: (type, amount, description, dateKey) => {
        const id = genId();
        set((s) => ({
          financeEvents: [
            ...s.financeEvents,
            { id, type, amount, description, dateKey: dateKey ?? todayKey(), createdAt: Date.now() },
          ],
        }));
        return id;
      },
      removeFinanceEvent: (id) =>
        set((s) => ({ financeEvents: s.financeEvents.filter((e) => e.id !== id) })),
      setFinanceStart: (assets, liabilities, dateKey) =>
        set(() => ({
          financeStart: { assets, liabilities, dateKey: dateKey ?? todayKey() },
        })),
    }),
    {
      name: 'zycie-storage-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: CURRENT_SCHEMA_VERSION,
      migrate: (persisted) => persisted as AppState & Actions,
    }
  )
);
