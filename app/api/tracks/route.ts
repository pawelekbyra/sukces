import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { updateYearsOfAddiction } from '@/lib/db';
import type { AddictionType } from '@/lib/store';

const VALID_TYPES: AddictionType[] = ['nicotine', 'thc', 'nofap'];

export async function PATCH(request: Request) {
  const body = await request.json();
  const { type, yearsOfAddiction } = body as { type: AddictionType; yearsOfAddiction: number };

  if (!VALID_TYPES.includes(type) || typeof yearsOfAddiction !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await updateYearsOfAddiction(type, yearsOfAddiction);
  return NextResponse.json({ ok: true });
}
