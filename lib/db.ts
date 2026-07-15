import { sql } from '@vercel/postgres';
import type { AddictionType, AddictionTrack, RelapseEvent } from './store';

const DEFAULT_TRACKS: AddictionTrack[] = [
  { type: 'nicotine', name: 'Papierosy', yearsOfAddiction: 18, trackingStart: new Date().toISOString() },
  { type: 'thc', name: 'Trawa', yearsOfAddiction: 0, trackingStart: new Date().toISOString() },
  { type: 'nofap', name: 'Walenie', yearsOfAddiction: 0, trackingStart: new Date().toISOString() },
];

let schemaReady: Promise<void> | null = null;

/** Idempotent schema setup, run lazily on first request in a given serverless instance. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS tracks (
          type TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          years_of_addiction INTEGER NOT NULL DEFAULT 0,
          tracking_start TIMESTAMPTZ NOT NULL
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS relapse_events (
          id UUID PRIMARY KEY,
          addiction TEXT NOT NULL REFERENCES tracks(type),
          timestamp TIMESTAMPTZ NOT NULL,
          logged_at TIMESTAMPTZ NOT NULL,
          note TEXT
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL
        );
      `;

      for (const track of DEFAULT_TRACKS) {
        await sql`
          INSERT INTO tracks (type, name, years_of_addiction, tracking_start)
          VALUES (${track.type}, ${track.name}, ${track.yearsOfAddiction}, ${track.trackingStart})
          ON CONFLICT (type) DO NOTHING;
        `;
      }
    })();
  }
  return schemaReady;
}

export async function getTracks(): Promise<Record<AddictionType, AddictionTrack>> {
  await ensureSchema();
  const { rows } = await sql`SELECT type, name, years_of_addiction, tracking_start FROM tracks;`;
  const result = {} as Record<AddictionType, AddictionTrack>;
  for (const row of rows) {
    result[row.type as AddictionType] = {
      type: row.type,
      name: row.name,
      yearsOfAddiction: row.years_of_addiction,
      trackingStart: new Date(row.tracking_start).toISOString(),
    };
  }
  return result;
}

export async function updateYearsOfAddiction(type: AddictionType, years: number): Promise<void> {
  await ensureSchema();
  await sql`UPDATE tracks SET years_of_addiction = ${years} WHERE type = ${type};`;
}

export async function getEvents(): Promise<RelapseEvent[]> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT id, addiction, timestamp, logged_at, note
    FROM relapse_events
    ORDER BY timestamp ASC;
  `;
  return rows.map((row) => ({
    id: row.id,
    addiction: row.addiction as AddictionType,
    timestamp: new Date(row.timestamp).toISOString(),
    loggedAt: new Date(row.logged_at).toISOString(),
    note: row.note ?? undefined,
  }));
}

export async function insertEvent(event: RelapseEvent): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO relapse_events (id, addiction, timestamp, logged_at, note)
    VALUES (${event.id}, ${event.addiction}, ${event.timestamp}, ${event.loggedAt}, ${event.note ?? null});
  `;
}

export async function getSetting(key: string): Promise<string | null> {
  await ensureSchema();
  const { rows } = await sql`SELECT value FROM app_settings WHERE key = ${key};`;
  return rows.length > 0 ? rows[0].value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO app_settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value};
  `;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export async function getChatMessages(limit = 50): Promise<ChatMessage[]> {
  await ensureSchema();
  const { rows } = await sql`
    SELECT id, role, content, created_at
    FROM chat_messages
    ORDER BY created_at ASC
    LIMIT ${limit};
  `;
  return rows.map((row) => ({
    id: row.id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function insertChatMessage(message: ChatMessage): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO chat_messages (id, role, content, created_at)
    VALUES (${message.id}, ${message.role}, ${message.content}, ${message.createdAt});
  `;
}
