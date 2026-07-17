export type HabitId = 'papierosy' | 'trawa' | 'walenie';

export const HABITS: { id: HabitId; label: string }[] = [
  { id: 'papierosy', label: 'Papierosy' },
  { id: 'trawa', label: 'Trawa' },
  { id: 'walenie', label: 'Walenie' },
];

export interface RelapseEvent {
  id: string;
  habitId: HabitId;
  dateKey: string; // dzień relapsu
  createdAt: number;
}

export interface RunEvent {
  id: string;
  dateKey: string;
  km: number;
  createdAt: number;
}

export type FinanceEventType = 'expense' | 'income' | 'debt_incur' | 'debt_payoff';

export interface FinanceEvent {
  id: string;
  type: FinanceEventType;
  dateKey: string;
  amount: number; // zawsze dodatnia, znak wynika z `type`
  description: string;
  createdAt: number;
}

export interface FinanceStart {
  assets: number;
  liabilities: number;
  dateKey: string;
}

export interface AppState {
  schemaVersion: number;
  relapses: RelapseEvent[];
  runs: RunEvent[];
  financeEvents: FinanceEvent[];
  financeStart: FinanceStart | null;
  habitStart: Record<HabitId, string | null>; // data od kiedy liczymy streak (onboarding)
}

export const CURRENT_SCHEMA_VERSION = 1;

export function emptyState(): AppState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    relapses: [],
    runs: [],
    financeEvents: [],
    financeStart: null,
    habitStart: { papierosy: null, trawa: null, walenie: null },
  };
}
