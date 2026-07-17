import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { sql } from '@vercel/postgres';
import { ensureSchema } from '@/lib/db';

const RESET_TOKEN = 'c5f9625025677a470f6a2438d2d14871';

/** Which database + connection this serverless function is actually talking to, plus row counts. */
async function inspect() {
  const { rows: ident } = await sql`
    SELECT current_database() AS db,
           current_user AS usr,
           inet_server_addr()::text AS host,
           current_setting('server_version') AS version;
  `;
  const { rows: counts } = await sql`
    SELECT
      (SELECT count(*) FROM relapse_events)::int AS relapses,
      (SELECT count(*) FROM running_events)::int AS runs,
      (SELECT count(*) FROM chat_messages)::int AS chat,
      (SELECT count(*) FROM tracks)::int AS tracks;
  `;
  const { rows: trackRows } = await sql`
    SELECT type, tracking_start FROM tracks ORDER BY type;
  `;
  const { rows: nowRows } = await sql`SELECT now() AS server_now;`;
  return {
    connection: ident[0],
    counts: counts[0],
    serverNow: nowRows[0].server_now,
    trackingStart: Object.fromEntries(trackRows.map((r) => [r.type, r.tracking_start])),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (token !== RESET_TOKEN) {
    return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 403 });
  }

  await ensureSchema();

  // Non-destructive probe: reports which database this function is bound to and what
  // it currently holds, without touching any data. Used to diagnose whether the reset
  // path and the app's read path share a database.
  if (url.searchParams.get('dry') === '1') {
    return NextResponse.json({ ok: true, dryRun: true, ...(await inspect()) });
  }

  const before = await inspect();

  // DELETE rather than TRUNCATE: over Neon's serverless (HTTP) driver a multi-table
  // TRUNCATE returns success but leaves the rows in place, so the reset silently did
  // nothing. Plain DELETE statements clear the tables reliably.
  await sql`DELETE FROM relapse_events;`;
  await sql`DELETE FROM running_events;`;
  await sql`DELETE FROM chat_messages;`;
  await sql`UPDATE tracks SET tracking_start = NOW();`;

  const after = await inspect();

  return NextResponse.json({
    ok: true,
    message: 'Baza zresetowana — wszystkie relapsy, biegi i czat wyczyszczone, liczniki startują od teraz.',
    connection: before.connection,
    before: before.counts,
    after: after.counts,
  });
}
