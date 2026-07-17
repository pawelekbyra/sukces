// Logiczny dzień zaczyna się o 4:00 rano, nie o północy —
// żeby nocna aktywność (2:00) liczyła się do poprzedniego dnia.
const DAY_BOUNDARY_HOUR = 4;

export function logicalDateKey(d: Date = new Date()): string {
  const shifted = new Date(d);
  shifted.setHours(shifted.getHours() - DAY_BOUNDARY_HOUR);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  const day = String(shifted.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return logicalDateKey(new Date());
}

export function dateKeyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, DAY_BOUNDARY_HOUR + 1);
}

export function daysBetween(fromKey: string, toKey: string): number {
  const a = dateKeyToDate(fromKey);
  const b = dateKeyToDate(toKey);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function addDays(key: string, n: number): string {
  const d = dateKeyToDate(key);
  d.setDate(d.getDate() + n);
  return logicalDateKey(d);
}

export function monthKey(key: string = todayKey()): string {
  return key.slice(0, 7); // YYYY-MM
}

export function daysInMonth(monthKeyStr: string): string[] {
  const [y, m] = monthKeyStr.split('-').map(Number);
  const count = new Date(y, m, 0).getDate();
  const out: string[] = [];
  for (let d = 1; d <= count; d++) {
    out.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return out;
}

export function formatDisplay(key: string): string {
  const d = dateKeyToDate(key);
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function shiftMonth(monthKeyStr: string, delta: number): string {
  const [y, m] = monthKeyStr.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
