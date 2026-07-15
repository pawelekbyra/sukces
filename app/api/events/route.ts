import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { insertEvent } from '@/lib/db';
import type { AddictionType, RelapseEvent } from '@/lib/store';

const VALID_TYPES: AddictionType[] = ['nicotine', 'thc', 'nofap'];

export async function POST(request: Request) {
  const body = await request.json();
  const { addiction, timestamp, note } = body as { addiction: AddictionType; timestamp?: string; note?: string };

  if (!VALID_TYPES.includes(addiction)) {
    return NextResponse.json({ error: 'Invalid addiction type' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const event: RelapseEvent = {
    id: crypto.randomUUID(),
    addiction,
    timestamp: timestamp ?? now,
    loggedAt: now,
    note,
  };

  await insertEvent(event);
  return NextResponse.json(event, { status: 201 });
}
