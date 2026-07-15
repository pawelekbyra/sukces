import { isSameDay, isAfter, isBefore, differenceInDays, differenceInHours, startOfDay } from 'date-fns';
import type { AddictionType, RelapseEvent } from './store';

export type DayStatus = 'green' | 'red' | 'future' | 'untracked';

function eventsFor(events: RelapseEvent[], type: AddictionType) {
  return events
    .filter((e) => e.addiction === type)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/** Most recent relapse (live or backdated) for this addiction, or null if never relapsed. */
export function getLastRelapse(events: RelapseEvent[], type: AddictionType): RelapseEvent | null {
  const list = eventsFor(events, type);
  return list.length > 0 ? list[list.length - 1] : null;
}

/** Current streak: days + hours since the most recent relapse (or since tracking start if none). */
export function getCurrentStreak(
  events: RelapseEvent[],
  type: AddictionType,
  trackingStart: string,
  referenceNow: Date = new Date()
): { days: number; hours: number; since: Date } {
  const last = getLastRelapse(events, type);
  const since = last ? new Date(last.timestamp) : new Date(trackingStart);
  const totalHours = differenceInHours(referenceNow, since);
  return { days: Math.floor(totalHours / 24), hours: totalHours % 24, since };
}

/** Longest streak ever recorded (in days), across all gaps between relapses plus the current one. */
export function getLongestStreak(
  events: RelapseEvent[],
  type: AddictionType,
  trackingStart: string,
  referenceNow: Date = new Date()
): number {
  const list = eventsFor(events, type);
  const boundaries = [new Date(trackingStart), ...list.map((e) => new Date(e.timestamp)), referenceNow];

  let longest = 0;
  for (let i = 0; i < boundaries.length - 1; i++) {
    const days = differenceInDays(boundaries[i + 1], boundaries[i]);
    if (days > longest) longest = days;
  }
  return longest;
}

/** Status of a single calendar day for this addiction: red if a relapse happened that day. */
export function getDayStatus(
  events: RelapseEvent[],
  type: AddictionType,
  day: Date,
  trackingStart: string,
  referenceNow: Date = new Date()
): DayStatus {
  const dayStart = startOfDay(day);
  if (isAfter(dayStart, startOfDay(referenceNow))) return 'future';
  if (isBefore(dayStart, startOfDay(new Date(trackingStart)))) return 'untracked';

  const hasRelapse = eventsFor(events, type).some((e) => isSameDay(new Date(e.timestamp), day));
  return hasRelapse ? 'red' : 'green';
}

/** Recent events for this addiction, newest first — used for AI context and pattern detection. */
export function getRecentEvents(events: RelapseEvent[], type: AddictionType, limit = 10): RelapseEvent[] {
  return eventsFor(events, type).slice(-limit).reverse();
}
