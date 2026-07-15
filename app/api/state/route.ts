import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { getTracks, getEvents, getSetting } from '@/lib/db';

export async function GET() {
  const [tracks, events, runningKmSetting] = await Promise.all([
    getTracks(),
    getEvents(),
    getSetting('runningKmThisWeek'),
  ]);

  return NextResponse.json({
    tracks,
    events,
    runningKmThisWeek: runningKmSetting ? Number(runningKmSetting) : 0,
  });
}
