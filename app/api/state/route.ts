import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { getTracks, getEvents, getRunningEvents } from '@/lib/db';

export async function GET() {
  const [tracks, events, runningEvents] = await Promise.all([
    getTracks(),
    getEvents(),
    getRunningEvents(),
  ]);

  return NextResponse.json({ tracks, events, runningEvents });
}
