import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { getRunningEvents, insertRunningEvent } from '@/lib/db';

export async function GET() {
  const events = await getRunningEvents();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { timestamp, km } = body as { timestamp?: string; km: number };

  if (typeof km !== 'number' || km <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const event = {
    id: crypto.randomUUID(),
    timestamp: timestamp ?? now,
    km,
    loggedAt: now,
  };

  await insertRunningEvent(event);
  return NextResponse.json(event, { status: 201 });
}
