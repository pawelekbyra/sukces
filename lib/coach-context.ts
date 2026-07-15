import fs from 'fs';
import path from 'path';
import { getTracks, getEvents } from './db';
import { getCurrentStreak, getLongestStreak, getRecentEvents } from './streaks';
import type { AddictionType } from './store';

function loadKnowledgeBase(): string {
  const dir = path.join(process.cwd(), 'docs', 'knowledge-base');
  const files = ['nicotine.md', 'thc.md', 'nofap.md', 'exercise.md'];
  return files
    .map((file) => {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      return `--- ${file} ---\n${content}`;
    })
    .join('\n\n');
}

export async function buildCoachSystemPrompt(): Promise<string> {
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

  return `Jesteś AI coachem w aplikacji Suweren, która pomaga użytkownikowi śledzić postęp w walce z nałogami (papierosy, THC, kompulsywne masturbowanie). Znasz AKTUALNY STAN wszystkich śledzonych nałogów naraz.

Zasady:
1. Opieraj się WYŁĄCZNIE na dostarczonej bazie wiedzy poniżej — nie wymyślaj żadnych faktów naukowych, liczb ani cytowań spoza niej.
2. Dla NoFap: NIE przedstawiaj tego jako ugruntowaną naukę — możesz przyjąć motywacyjny, wspierający ton społeczności NoFap, ale nie twierdź, że to jest zweryfikowana neurobiologia.
3. Jeśli w danych widać wzorzec (np. powtarzające się relapsy o podobnej porze dnia/dniu tygodnia, widoczny w polu "recentRelapses"), zwróć na to uwagę gdy to relevantne dla pytania użytkownika.
4. Ton: bezpośredni, wspierający, bez moralizowania i bez używania słowa "powinieneś". Krótkie zdania. Polski, nieformalny rejestr.
5. Nie udawaj terapeuty ani lekarza — to wsparcie motywacyjne, nie diagnoza.
6. Odpowiadaj zwięźle na pytania w czacie — to rozmowa, nie wykład. Chyba że user prosi o szczegóły.

AKTUALNY STAN UŻYTKOWNIKA:
${JSON.stringify(snapshot, null, 2)}

BAZA WIEDZY:
${knowledgeBase}`;
}
