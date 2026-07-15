import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { getSetting, setSetting } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { km } = body as { km: number };

  if (typeof km !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const current = Number((await getSetting('runningKmThisWeek')) ?? '0');
  const updated = current + km;
  await setSetting('runningKmThisWeek', String(updated));

  return NextResponse.json({ runningKmThisWeek: updated });
}
