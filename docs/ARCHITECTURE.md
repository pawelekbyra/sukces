# PROTOKÓŁ P (SUWEREN) - ARCHITEKTURA

## Cel
System operacyjny dla regeneracji dopaminowej. Zastąpienie taniej gratyfikacji mierzalnym progresem (biohacking + grywalizacja).

## Rdzeń: Algorytm Bio-Fizyczny
Użytkownik operuje Wskaźnikiem P (0-100+):

1. **Baza (Pasywna)**: Czystość od nałogów (nikotyna, trawa, No-Fap). Staż uzależnienia (np. 18 lat) zwiększa wagi punktowe.
2. **Katalizator (Aktywna)**: Bieganie jako "waluta naprawcza". Każdy km > 35km/tydz to bonus.
3. **Wizualizacja (Bio-Feedback)**: UI zmienia się od "zardzewiałego" (faza toksyczna <30 pkt) po "krystaliczny/szmaragdowy" (faza suwerenności >70 pkt).

## Kluczowe Moduły MVP (Bez logowania)
1. **Panic Button (Protokół Zwarcia)**: 3-minutowy bloker z komendą fizyczną (pompki/lód).
2. **Dziennik Suwerenności**: Zapis stanu (LocalStorage) - godziny od ostatniego nałogu, km biegu.
3. **Upublicznij Nałogi**: Moduł w ustawieniach do absurdalnego "obnażania" swoich słabości (np. "Zabytkowy Komin - staż 18 lat").

## Technologia
- **Framework**: Next.js 14+ (App Router), TypeScript.
- **Stylizacja**: Tailwind CSS (Dark Mode/Cyber-Hacker Vibe).
- **Stan**: Zustand z middleware persist (localStorage).
- **Logika czasu**: date-fns.

## Logika Punktacji (Wskaźnik P)
Wskaźnik P jest obliczany na podstawie:
- Czasu od ostatniego resetu każdego nałogu.
- Mnożnika stażu (np. Multiplier = 1 + years/18).
- Aktywności fizycznej (np. 2 pkt za każdy km powyżej 35km/tydzień).
