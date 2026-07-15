import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';

const RESET_TOKEN = 'c5f9625025677a470f6a2438d2d14871';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  if (token !== RESET_TOKEN) {
    return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 403 });
  }

  await ensureSchema();

  await sql`TRUNCATE relapse_events, running_events, chat_messages;`;
  await sql`UPDATE tracks SET tracking_start = NOW();`;

  return NextResponse.json({ ok: true, message: 'Baza zresetowana — wszystkie relapsy, biegi i czat wyczyszczone, liczniki startują od teraz.' });
}
