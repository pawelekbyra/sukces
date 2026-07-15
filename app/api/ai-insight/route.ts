import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { getTracks, getEvents } from '@/lib/db';
import { getCurrentStreak, getLongestStreak, getRecentEvents } from '@/lib/streaks';
import type { AddictionType } from '@/lib/store';

const KNOWLEDGE_FILES: Record<AddictionType, string> = {
  nicotine: 'nicotine.md',
  thc: 'thc.md',
  nofap: 'nofap.md',
};

function loadKnowledgeBase(): string {
  const dir = path.join(process.cwd(), 'docs', 'knowledge-base');
  const files = [...Object.values(KNOWLEDGE_FILES), 'exercise.md'];
  return files
    .map((file) => {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      return `--- ${file} ---\n${content}`;
    })
    .join('\n\n');
}

export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Brak skonfigurowanego klucza ANTHROPIC_API_KEY na serwerze.' },
      { status: 503 }
    );
  }

  const [tracks, events] = await Promise.all([getTracks(), getEvents()]);
  const now = new Date();

  const snapshot = (Object.keys(tracks) as AddictionType[]).map((type) => {
    const track = tracks[type];
    const streak = getCurrentStreak(events, type, track.trackingStart, now);
    const longest = getLongestStreak(events, type, track.trackingStart, now);
    const recent = getRecentEvents(events, type, 5);
    return {
      name: track.name,
      type,
      yearsOfAddiction: track.yearsOfAddiction,
      currentStreakDays: streak.days,
      currentStreakHours: streak.hours,
      longestStreakDays: longest,
      recentRelapses: recent.map((e) => ({ timestamp: e.timestamp, note: e.note ?? null })),
    };
  });

  const knowledgeBase = loadKnowledgeBase();

  const systemPrompt = `Jesteś AI coachem w aplikacji Suweren, która pomaga użytkownikowi śledzić postęp w walce z nałogami (papierosy, THC, kompulsywne masturbowanie). Twoim zadaniem jest przeanalizować AKTUALNY STAN wszystkich śledzonych nałogów naraz i napisać JEDNĄ spójną, motywacyjną narrację (nie osobne akapity per nałóg), która łączy fakty o tym, co dzieje się w ciele/mózgu użytkownika na obecnym etapie każdego z nich.

Zasady:
1. Opieraj się WYŁĄCZNIE na dostarczonej bazie wiedzy poniżej — nie wymyślaj żadnych faktów naukowych, liczb ani cytowań spoza niej.
2. Dla NoFap: NIE przedstawiaj tego jako ugruntowaną naukę — możesz przyjąć motywacyjny, wspierający ton społeczności NoFap, ale nie twierdź, że to jest zweryfikowana neurobiologia.
3. Jeśli w danych widać wzorzec (np. powtarzające się relapsy o podobnej porze dnia/dniu tygodnia, widoczny w polu "recentRelapses"), zwróć na to uwagę — to jest najbardziej wartościowa, spersonalizowana część odpowiedzi.
4. Ton: bezpośredni, wspierający, bez moralizowania i bez używania słowa "powinieneś". Krótkie zdania. Możesz używać polskiego, nieformalnego rejestru.
5. Długość: 150-250 słów, zwarta narracja, nie lista punktowana.
6. Nie udawaj terapeuty ani lekarza — to wsparcie motywacyjne, nie diagnoza.

BAZA WIEDZY:
${knowledgeBase}`;

  const userMessage = `Oto aktualny stan użytkownika:\n\n${JSON.stringify(snapshot, null, 2)}\n\nNapisz spersonalizowaną, spójną narrację łączącą te dane.`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = message.content.find((block) => block.type === 'text')?.text ?? '';
    return NextResponse.json({ insight: text });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Nieznany błąd podczas komunikacji z AI' },
      { status: 500 }
    );
  }
}
