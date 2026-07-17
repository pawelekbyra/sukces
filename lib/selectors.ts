import { AppState, HabitId } from './types';
import { daysBetween, todayKey } from './dates';

export function currentStreak(state: AppState, habitId: HabitId): number {
  const relapses = state.relapses
    .filter((r) => r.habitId === habitId)
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
  const lastRelapse = relapses[0]?.dateKey;
  const start = lastRelapse ?? state.habitStart[habitId];
  if (!start) return 0;
  return Math.max(0, daysBetween(start, todayKey()));
}

export function longestStreak(state: AppState, habitId: HabitId): number {
  const relapses = state.relapses
    .filter((r) => r.habitId === habitId)
    .map((r) => r.dateKey)
    .sort();
  const points = [...(state.habitStart[habitId] ? [state.habitStart[habitId] as string] : []), ...relapses, todayKey()];
  if (points.length < 2) return currentStreak(state, habitId);
  let longest = 0;
  for (let i = 1; i < points.length; i++) {
    longest = Math.max(longest, daysBetween(points[i - 1], points[i]));
  }
  return Math.max(longest, currentStreak(state, habitId));
}

export function relapseDatesInMonth(state: AppState, habitId: HabitId): Set<string> {
  return new Set(
    state.relapses.filter((r) => r.habitId === habitId).map((r) => r.dateKey)
  );
}

export function totalKm(state: AppState): number {
  return round1(state.runs.reduce((sum, r) => sum + r.km, 0));
}

export function kmInRange(state: AppState, fromKey: string, toKey: string): number {
  return round1(
    state.runs
      .filter((r) => r.dateKey >= fromKey && r.dateKey <= toKey)
      .reduce((sum, r) => sum + r.km, 0)
  );
}

export function longestRun(state: AppState): number {
  return state.runs.reduce((max, r) => Math.max(max, r.km), 0);
}

export function bestWeekKm(state: AppState): number {
  const byWeek = new Map<string, number>();
  for (const r of state.runs) {
    const week = isoWeekKey(r.dateKey);
    byWeek.set(week, (byWeek.get(week) ?? 0) + r.km);
  }
  let best = 0;
  for (const v of byWeek.values()) best = Math.max(best, v);
  return round1(best);
}

function isoWeekKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Saldo netto (assets - liabilities) na dany dzień, licząc od punktu startowego + wszystkie zdarzenia do tego dnia włącznie. */
export function netWorthAt(state: AppState, dateKey: string): number {
  if (!state.financeStart) return 0;
  let assets = state.financeStart.assets;
  let liabilities = state.financeStart.liabilities;
  for (const e of state.financeEvents) {
    if (e.dateKey > dateKey) continue;
    if (e.dateKey < state.financeStart.dateKey) continue;
    switch (e.type) {
      case 'expense':
        assets -= e.amount;
        break;
      case 'income':
        assets += e.amount;
        break;
      case 'debt_incur':
        liabilities += e.amount;
        break;
      case 'debt_payoff':
        liabilities -= e.amount;
        assets -= e.amount;
        break;
    }
  }
  return round1(assets - liabilities);
}

export function currentNetWorth(state: AppState): number {
  return netWorthAt(state, todayKey());
}

export function dayNetChange(state: AppState, dateKey: string): number {
  return state.financeEvents
    .filter((e) => e.dateKey === dateKey)
    .reduce((sum, e) => {
      if (e.type === 'income') return sum + e.amount;
      if (e.type === 'expense') return sum - e.amount;
      if (e.type === 'debt_payoff') return sum - e.amount; // spłata rusza gotówkę
      return sum; // debt_incur nie zmienia gotówki, tylko dług
    }, 0);
}
