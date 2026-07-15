# Architektura aplikacji Suweren v2 — System śledzenia uzależnień z AI coach'em

## Cel
Aplikacja mobilna/webowa do śledzenia postępu w walce z nałogami (papierosy, THC, masturbacja) poprzez:
1. **Wizualny dziennik** — kalendarz dni zielonych (czystych) i czerwonych (relapse)
2. **Licznik precyzyjny** — dni + godziny od ostatniego resetu
3. **Reset wsteczny** — korekta przywłaszczonego dnia bez limitu czasowego
4. **AI coach** — analiza wzorców z historii + motywacyjny komunikat generowany przez Claude Haiku, oparty na statycznej bazie wiedzy
5. **Streaki** — widoczność aktualnego i najlepszego zapamiętanego streaka dla psychicznej motywacji

## Model danych

### Struktura główna (Zustand store + localStorage)

```typescript
interface RelapsEvent {
  timestamp: string; // ISO 8601 — dokładna data/godzina relapsu
  addiction: 'nicotine' | 'thc' | 'nofap'; // typ nałogu
  notes?: string; // opcjonalne — kontekst (gdzie, dlaczego, trigger)
}

interface AddictionTrack {
  name: string; // "Papierosy", "Trawa", "Walenie"
  type: 'nicotine' | 'thc' | 'nofap';
  yearsOfAddiction: number; // dla kontekstu AI ("walczysz z tym 18 lat")
  enabled: boolean; // czy śledzić
  historyStart: string; // ISO — od kiedy zacząliśmy śledzenie (dla kontekstu historii)
}

interface SuwerenState {
  // Śledzenie nałogów
  tracks: AddictionTrack[]; // lista nałogów, które aktualnie śledzisz
  events: RelapsEvent[]; // append-only log wszystkich relapsów
  
  // Statystyka dla każdego nałogu (kalkulowana)
  currentStreaks: { [key: string]: { days: number; hours: number } }; // dni/godziny od ostatniego relapsu
  longestStreaks: { [key: string]: { days: number } }; // najlepszy streak w historii
  
  // Aktywność fizyczna (wsparcie)
  runningKmThisWeek: number;
  
  // Akcje
  addEvent: (event: RelapsEvent) => void;
  removeTrack: (type: string) => void;
  addTrack: (track: AddictionTrack) => void;
  setYearsOfAddiction: (type: string, years: number) => void;
  addRunningKm: (km: number) => void;
  getAIContext: () => object; // dane dla AI coach'a
}
```

### Logika kalendarza

Dla każdego dnia w historii: istnieje event relapse = czerwony dzień, brak event = zielony dzień.

**Brak edycji już zaraportowanych dni** — raz dodany event jest append-only (nie da się go usunąć ani przesunąć), ale można dodać nowy event wstecznie bez limitu czasowego.

## Funkcjonalności

### 1. Licznik i kalendarz
- Licznik każdego nałogu: "X dni Y godzin" — liczony od najnowszego event w loggu
- Kalendarz: dni zielone/czerwone na podstawie logu zdarzeń, pełna historia (nie tylko bieżący miesiąc)
- Streak aktualny + najlepszy streak kiedykolwiek

### 2. Reset (triggering event)
- **Reset teraz** — przycisk "Relapse" dodaje event z bieżącą datą/godziną
- **Reset wsteczny** — user wybiera dzień w przeszłości, gdy faktycznie się zerwał (ale zapomniał zgłosić na czas) — dodaje event z tamtą datą
- Licznik automatycznie się przelicza, kalendarz się zmienia

### 3. AI Coach (on-demand)
- Przycisk / endpoint "Czemu się dzieje w moim ciele/mózgu?"
- Wysyła snapshot stanu do Claude Haiku (Next.js API route, `/api/ai-insight`)
- Haiku dostaje:
  - Dni/godziny od ostatniego relapsu dla każdego nałogu
  - Lata uzależnienia dla każdego
  - Ostatnie 10 eventów (kontekst wzorców)
  - System prompt z treścią z `/docs/knowledge-base/*.md` (THC, nikotyna, NoFap, bieganie)
- Haiku syntetyzuje to w jedną narrację, mówiącą "Ty jesteś na etapie X THC-owo, ale Y nikotynowo, a Z to sygnał, że..." — łączące dane
- Odpowiedź pojawia się w UI (streaming, jeśli chcemy)

## Struktura katalogów

```
/home/user/sukces
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Główna strona (dashboard)
│   └── api/
│       └── ai-insight/
│           └── route.ts     # POST /api/ai-insight — Claude Haiku call
├── components/
│   ├── Dashboard.tsx        # Dashboard z liczbami, strekami, przyciskami
│   ├── Calendar.tsx         # Wizualizacja dni zielonych/czerwonych
│   └── AICoach.tsx          # Chat/rezultat z AI coach'em
├── lib/
│   ├── store.ts             # Zustand store z nowym modelem danych
│   └── utils.ts             # Utility functions
├── docs/
│   ├── knowledge-base/      # Baza wiedzy dla AI
│   │   ├── thc.md
│   │   ├── nicotine.md
│   │   ├── nofap.md
│   │   └── exercise.md
│   └── ARCHITECTURE.md      # Ten plik
├── public/
└── package.json
```

## Technologia

- **Framework**: Next.js 14+ (App Router)
- **Język**: TypeScript
- **Stan**: Zustand + persist (localStorage)
- **Styling**: Tailwind CSS
- **AI**: Claude Haiku via Anthropic SDK (API key po stronie serwera)
- **Deployment**: Vercel (serverless functions dla `/api/ai-insight`)

## Oś czasu implementacji

1. **Faza 1** — Nowy model danych + dashboard z liczbą i kalendarzem
2. **Faza 2** — Reset teraz/wsteczny
3. **Faza 3** — AI coach z Claude Haiku
4. **Faza 4** — Streaki i statystyka
5. **Faza 5** — Opcjonalnie: tracking snu, nastroju, integracja z bieganiem

## Zastrzeżenie

To nie jest porada medyczna. Aplikacja śledzić postęp i wspierać motywacyjnie, nie diagnozować ani leczyć.
