# Suweren — System motywacyjnego śledzenia uzależnień z AI coach'em

## O projekcie

Suweren to aplikacja webowa do śledzenia postępu w walce z nałogami (papierosy, THC, masturbacja). Zamiast tylko pokazywać suchą liczbę godzin/dni od ostatniego relapsu, aplikacja:

1. **Wizualizuje historię** — kalendarz z dniami zielonymi (czystymi) i czerwonymi (relapsy), żebyś widział/widziała swój łuk postępu nie tylko "teraz", ale nad całym okresem śledzenia
2. **Motywuje contrastem** — widząc np. 10 dni czerwonych potem 3 zielone, naturalnie nie chcesz tego "splamić" (loss aversion — strata boli bardziej niż zysk cieszy)
3. **Wspiera AI coach'em** — Claude Haiku analizuje Twoją kombinację nałogów (np. "dzień 2 bez nikotyny, ale już dzień 7 bez THC"), sprawdza je pod kątem Twojej osobistej historii (wzorce, kiedy zrywacie się najczęściej) i daje spersonalizowany, motywacyjny komunikat oparty na **naukowo gruntowanej bazie wiedzy** — nie mgłę.

## Jak to działa

### Licznik i kalendarz
- Każdy nałóg ma licznik "X dni Y godzin" od ostatniego resetu
- Kalendarz pokazuje pełną historię dni zielonych i czerwonych
- Widać również najdłuższy streak ("miałem/am już 14 dni, teraz jestem na 3")

### Reset
- **Klik "Relapse"** → dodaje dzisiaj do czerwonych
- **Reset wsteczny** → wybrać dzień w przeszłości, gdy faktycznie się zerwali/ś, ale zapomniałeś/ś zgłosić na czas (bez limitu czasowego)
- Licznik się przelicza, kalendarz się zmienia

### AI Coach
- Przycisk "Co się teraz dzieje w moim ciele?"
- Aplikacja wysyła snapshot: czasy wszystkich nałogów, lata uzależnienia, ostatnie relapsy
- Claude Haiku czyta statyczną bazę wiedzy (`docs/knowledge-base/`) i syntetyzuje:
  - "Jesteś w szczycie głodu nikotynowego (dzień 2–3), ale to właśnie okno, gdzie mózg jest najbardziej buntowniczy — to przejdzie"
  - "Patrząc na Twoją historię: zawsze zrywacie się w weekendy, o 22:00 — to nie słabość, to sytuacja, możemy ją zaplanować"
  - "THC ma długi okres półtrwania, teraz możliwe wydziwne sny — to normalnie, to Twój REM rebound"

Baza wiedzy jest statyczna (szybko, bez latencji internetu), już zweryfikowana i cytowana (nie ma zmyślania przez AI).

## Czym różni się od istniejących "sober trackerów"

| Cecha | Konkurencja | Suweren |
|-------|-------------|---------|
| Widzenie historii | Zwykle tylko licznik "teraz" | Pełny kalendarz — widać wzorce nad miesiącami |
| Motywacja | Mówią "powinieneś być dumny" | Pokazują "patrz, ty już wiesz jak być 14 dni czysty" |
| AI | Chat ogólny / brak | AI coach zna Twoją historię i bazę naukową |
| Reset wsteczny | Brak | Możliwy bez limitu — uczciwa korekcja |
| Nałogi | Zwykle 1–2 (palenie, alkohol) | Dowolne 3+ (papierosy, THC, masturbacja, hazard, itp.) |

## Baza wiedzy

Aplikacja korzysta ze statycznej bazy napisanej przez autorów:

- **`docs/knowledge-base/thc.md`** — Odstawienie THC: mechanizm ECS, down-regulacja receptorów CB1, REM rebound, oś czasu (0–24h, 1–3 dni, tydzień, miesiące). Źródła: Budney 2004, Hirvonen 2012 (PET imaging), DSM-5.
- **`docs/knowledge-base/nicotine.md`** — Odstawienie nikotyny: up-regulacja nAChR, krótkie półtrwanie (2h), szczyt objawów dzień 2–3, ale "32× wyższa szansa na długoterm. abstynencję jeśli przebrniesz pierwsze 7 dni". Źródła: Hughes 2007, Ferguson 2009, Cochrane.
- **`docs/knowledge-base/nofap.md`** — Perspektywa społeczności NoFap — jaka jest ich filozofia i co zgłaszają użytkownicy + uczciwe rozgraniczenie: to nie jest potwierdzony "porn addiction" (DSM-5 go nie ma), ale ICD-11 uznaje CSBD jako zaburzenie kontroli impulsów. Pokazujemy oba widoki.
- **`docs/knowledge-base/exercise.md`** — Bieganie jako "waluta naprawcza": endokannabinoidowy "runner's high" (nie endorfiny), BDNF, kortyzol, wpływ na somatycze głodu i sen. Mocne dowody dla nikotyny, słabsze dla THC.

Wszystkie źródła są realne (nie zmyślone przez AI). Baza ma być **żywa** — w przyszłości można ją aktualizować.

## Jak uruchomić

```bash
npm install
npm run dev
```

Otwórz `http://localhost:3000`.

Dane są przechowywane w `localStorage` — przy pierwszym odwiedzeniu aplikacja zainicjalizuje domyślne nałogi, możesz je zmienić.

## Struktura kodu

```
├── app/page.tsx              # Dashboard
├── app/api/ai-insight/route.ts # Claude Haiku endpoint
├── lib/store.ts              # Zustand store (event log model)
├── components/               # UI components (Dashboard, Calendar, AICoach)
├── docs/knowledge-base/      # Statyczna baza wiedzy dla AI
└── docs/ARCHITECTURE.md      # Szczegóły techniczne
```

## Disclaimer

To narzędzie motywacyjne, nie porada medyczna. Jeśli masz poważne problemy ze zdrowiem psychicznym lub fizycznym związane z używkami, skonsultuj się z lekarzem.

---

**Wersja**: 2.0 (restart od nowa)  
**Stack**: Next.js + TypeScript + Zustand + Tailwind + Claude Haiku  
**Status**: W budowie (MVP phase)
