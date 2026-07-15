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

  const now = new Date();
  if (timestamp && new Date(timestamp) > now) {
    return NextResponse.json({ error: 'Data nie może być z przyszłości' }, { status: 400 });
  }

  const event = {
    id: crypto.randomUUID(),
    timestamp: timestamp ?? now.toISOString(),
    km,
    loggedAt: now.toISOString(),
  };

  await insertRunningEvent(event);
  return NextResponse.json(event, { status: 201 });
}
