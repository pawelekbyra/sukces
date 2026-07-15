# Architektura aplikacji Suweren v2 — System śledzenia uzależnień z AI coach'em

## Cel
Aplikacja webowa do śledzenia postępu w walce z nałogami (papierosy, THC, masturbacja) poprzez:
1. **Wizualny dziennik** — kalendarz dni zielonych (czystych) i czerwonych (relapse), pełna historia
2. **Licznik precyzyjny** — dni + godziny od ostatniego resetu
3. **Reset wsteczny** — korekta przeoczonego dnia bez limitu czasowego, ale bez możliwości usunięcia/edycji już zapisanych zdarzeń
4. **Ekran po relapsie** — współczujący reframe zamiast karania, z opcjonalną notatką o triggerze (surowiec pod przyszłe wykrywanie wzorców)
5. **AI coach** — analiza kombinacji wszystkich nałogów naraz + motywacyjny komunikat generowany przez Claude Haiku, oparty na statycznej bazie wiedzy
6. **Streaki** — widoczność aktualnego i najlepszego zapamiętanego streaka dla psychicznej motywacji (loss aversion)

## Persistencja: Vercel Postgres (Neon), bez logowania

Dane żyją w prawdziwej bazie danych (nie w `localStorage`) — jeden wspólny zestaw danych, bez ekranu logowania/kont. Baza: **Vercel Postgres** (Neon pod spodem), połączona przez `@vercel/postgres`.

### Schemat SQL (tworzony leniwie przy pierwszym zapytaniu, patrz `lib/db.ts`)

```sql
CREATE TABLE tracks (
  type TEXT PRIMARY KEY,               -- 'nicotine' | 'thc' | 'nofap'
  name TEXT NOT NULL,
  years_of_addiction INTEGER NOT NULL DEFAULT 0,
  tracking_start TIMESTAMPTZ NOT NULL
);

CREATE TABLE relapse_events (
  id UUID PRIMARY KEY,
  addiction TEXT NOT NULL REFERENCES tracks(type),
  timestamp TIMESTAMPTZ NOT NULL,      -- kiedy relaps naprawdę się wydarzył
  logged_at TIMESTAMPTZ NOT NULL,      -- kiedy user go zgłosił (różni się przy reset wstecznym)
  note TEXT                            -- opcjonalny trigger/kontekst
);

CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

**`relapse_events` jest append-only** — aplikacja nigdy nie generuje UPDATE/DELETE na tej tabeli. Jedyna operacja to INSERT (na żywo albo z datą wsteczną).

### Model TypeScript (`lib/store.ts`, `lib/streaks.ts`)

```typescript
type AddictionType = 'nicotine' | 'thc' | 'nofap';

interface RelapseEvent {
  id: string;
  addiction: AddictionType;
  timestamp: string;   // ISO — kiedy relaps się wydarzył
  loggedAt: string;    // ISO — kiedy zgłoszony
  note?: string;
}

interface AddictionTrack {
  type: AddictionType;
  name: string;
  yearsOfAddiction: number;
  trackingStart: string; // ISO — od kiedy śledzimy ten nałóg
}
```

Streaki, status dni kalendarza i wykrywanie rekordu liczone są **czystymi funkcjami** w `lib/streaks.ts` (`getCurrentStreak`, `getLongestStreak`, `getDayStatus`, `getRecentEvents`) — nie trzymane w bazie jako osobne pola, tylko wyliczane na żądanie z `events`.

## Przepływ danych

1. `app/page.tsx` woła `useSuwerenStore.hydrate()` przy montowaniu → `GET /api/state` → zwraca `{ tracks, events, runningKmThisWeek }` z bazy.
2. Każda mutacja (relaps, reset wsteczny, zmiana stażu, dodanie km) idzie przez dedykowany endpoint (`POST /api/events`, `PATCH /api/tracks`, `POST /api/running`) i dopiero po sukcesie aktualizuje lokalny stan Zustand — źródłem prawdy jest zawsze baza, Zustand to tylko cache w pamięci karty.
3. `AI Coach` (`POST /api/ai-insight`) **nie ufa danym z klienta** — sam odczytuje aktualny stan z bazy po stronie serwera, liczy streaki i buduje snapshot, więc nie da się go oszukać wysyłając spreparowany request.

## Funkcjonalności

### 1. Licznik i kalendarz
- Licznik: "X dni Y godzin" liczony od najnowszego zdarzenia w logu (`getCurrentStreak`)
- Kalendarz (`HistoryCalendar.tsx`): miesiąc po miesiącu, nawigacja wstecz/w przód, dzień czerwony jeśli ma zdarzenie tego dnia, zielony jeśli nie, wyszarzony jeśli przed początkiem śledzenia lub w przyszłości
- Widoczny aktualny streak + najlepszy streak w historii (`getLongestStreak`), z wyróżnieniem gdy user właśnie bije rekord

### 2. Reset (triggering event)
- **Relapse teraz** — otwiera `PostRelapseModal`: krok 1 (potwierdzenie + opcjonalna notatka o triggerze) → krok 2 (współczujący reframe, pokazuje zamknięty streak, przypomina że rekord zostaje zapisany)
- **Zgłoś wsteczny** — inline date picker w karcie, bez limitu czasowego, dodaje zdarzenie z wybraną datą

### 3. AI Coach (on-demand, nie automatyczny)
- Przycisk "Co się teraz dzieje?" w `AICoach.tsx`
- Serwer (`/api/ai-insight`) czyta z bazy stan wszystkich nałogów, liczy streaki, bierze 5 ostatnich zdarzeń per nałóg (kontekst wzorców — pora dnia, dzień tygodnia, notatki o triggerach)
- System prompt zawiera pełną treść `docs/knowledge-base/*.md` jako jedyne dozwolone źródło faktów — model ma zakaz wymyślania danych spoza tego kontekstu
- Haiku syntetyzuje to w jedną narrację (nie osobne akapity per nałóg), z jawnym rozróżnieniem tonu dla NoFap (motywacyjny styl społeczności, ale bez podszywania się pod ugruntowaną naukę)

## Struktura katalogów

```
/home/user/sukces
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard, hydratacja store'a
│   └── api/
│       ├── state/route.ts          # GET — pełny snapshot (tracks + events + running km)
│       ├── events/route.ts         # POST — nowy relaps (live lub wsteczny)
│       ├── tracks/route.ts         # PATCH — zmiana lat uzależnienia
│       ├── running/route.ts        # POST — dodanie km biegu
│       └── ai-insight/route.ts     # POST — Claude Haiku, czyta bazę wiedzy + dane z DB
├── components/
│   ├── AddictionCard.tsx           # Licznik, streak, przyciski reset, toggle kalendarza
│   ├── HistoryCalendar.tsx         # Miesięczny grid zielone/czerwone
│   ├── PostRelapseModal.tsx        # Ekran po kliknięciu "Relapse"
│   ├── RunningCard.tsx             # Bieganie jako "waluta naprawcza"
│   └── AICoach.tsx                 # UI dla AI coach'a
├── lib/
│   ├── store.ts                    # Zustand — cienki klient nad API, nie localStorage
│   ├── streaks.ts                  # Czyste funkcje: streak, rekord, status dnia
│   ├── db.ts                       # Zapytania SQL do Vercel Postgres, schema setup
│   └── utils.ts
├── docs/
│   ├── knowledge-base/             # Statyczna baza wiedzy dla AI (research-backed)
│   │   ├── thc.md
│   │   ├── nicotine.md
│   │   ├── nofap.md
│   │   └── exercise.md
│   └── ARCHITECTURE.md
├── .env.example                    # POSTGRES_URL*, ANTHROPIC_API_KEY
└── package.json
```

## Technologia

- **Framework**: Next.js 14 (App Router), TypeScript
- **Baza danych**: Vercel Postgres (Neon) przez `@vercel/postgres` — bez ORM, surowe zapytania SQL w `lib/db.ts`
- **Stan klienta**: Zustand jako cienka warstwa nad API (nie `persist`/localStorage)
- **Styling**: Tailwind CSS
- **AI**: Claude Haiku (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk`, klucz tylko po stronie serwera
- **Deployment**: Vercel — API routes jako serverless functions (`export const dynamic = 'force-dynamic'`, bo zależą od zmiennych środowiskowych bazy w runtime, nie da się ich prerenderować statycznie)

## Konfiguracja na Vercelu

1. Storage → Create Database → Postgres (lub Neon integration) → połącz z projektem — zmienne `POSTGRES_URL*` wstrzykują się automatycznie
2. Dodaj `ANTHROPIC_API_KEY` w zmiennych środowiskowych projektu
3. Lokalnie: `vercel env pull .env.local` albo ręcznie skopiuj `.env.example` → `.env.local`

## Co świadomie zostało poza zakresem (na razie)

- Logowanie/konta — jeden wspólny zestaw danych, appka tylko dla jednego użytkownika na danym URL-u
- Automatyczne wywołanie AI coach'a przy każdym wejściu — tylko on-demand (przycisk), żeby nie generować niepotrzebnych kosztów/requestów
- Tracking snu/nastroju jako osobny system — notatka o triggerze przy relapsie to na razie jedyny surowiec pod wykrywanie wzorców

## Zastrzeżenie

To nie jest porada medyczna. Aplikacja ma śledzić postęp i wspierać motywacyjnie, nie diagnozować ani leczyć.
