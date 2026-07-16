import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { insertEvent, updateEventTimestamp } from '@/lib/db';
import type { AddictionType, RelapseEvent } from '@/lib/store';

const VALID_TYPES: AddictionType[] = ['nicotine', 'thc', 'nofap'];

export async function POST(request: Request) {
  const body = await request.json();
  const { addiction, timestamp, note } = body as { addiction: AddictionType; timestamp?: string; note?: string };

  if (!VALID_TYPES.includes(addiction)) {
    return NextResponse.json({ error: 'Invalid addiction type' }, { status: 400 });
  }

  const now = new Date();
  if (timestamp && new Date(timestamp) > now) {
    return NextResponse.json({ error: 'Data nie może być z przyszłości' }, { status: 400 });
  }

  const event: RelapseEvent = {
    id: crypto.randomUUID(),
    addiction,
    timestamp: timestamp ?? now.toISOString(),
    loggedAt: now.toISOString(),
    note,
  };

  await insertEvent(event);
  return NextResponse.json(event, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, timestamp } = body as { id?: string; timestamp?: string };

  if (!id || !timestamp) {
    return NextResponse.json({ error: 'Brak id lub daty' }, { status: 400 });
  }

  const picked = new Date(timestamp);
  if (Number.isNaN(picked.getTime())) {
    return NextResponse.json({ error: 'Nieprawidłowa data' }, { status: 400 });
  }
  if (picked > new Date()) {
    return NextResponse.json({ error: 'Data nie może być z przyszłości' }, { status: 400 });
  }

  await updateEventTimestamp(id, picked.toISOString());
  return NextResponse.json({ ok: true });
}
