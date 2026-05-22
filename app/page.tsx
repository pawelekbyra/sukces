'use client';

import React, { useState, useEffect, useMemo } from 'react';

export default function Home() {
  // State initialization
  const [noFapDays, setNoFapDays] = useState(0);
  const [cigHours, setCigHours] = useState(0);
  const [weedHours, setWeedHours] = useState(0);
  const [runKm, setRunKm] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('protokol-p-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setNoFapDays(data.noFapDays || 0);
        setCigHours(data.cigHours || 0);
        setWeedHours(data.weedHours || 0);
        setRunKm(data.runKm || 0);
      } catch (e) {
        console.error('Failed to load data from localStorage', e);
      }
    }
    setIsMounted(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('protokol-p-data', JSON.stringify({
        noFapDays,
        cigHours,
        weedHours,
        runKm
      }));
    }
  }, [noFapDays, cigHours, weedHours, runKm, isMounted]);

  // Calculation Logic
  const calculations = useMemo(() => {
    const nfPoints = Math.min(noFapDays * 5.71, 40);
    const cigPoints = Math.min(cigHours * 0.15, 25);
    const weedPoints = weedHours < 24 ? -5 : 5;

    let runPoints = 0;
    if (runKm <= 35) {
      runPoints = runKm * 0.86;
    } else {
      runPoints = 30 + (runKm - 35) * 1;
    }

    const total = nfPoints + cigPoints + weedPoints + runPoints;

    return {
      nfPoints,
      cigPoints,
      weedPoints,
      runPoints,
      total: Number(total.toFixed(2))
    };
  }, [noFapDays, cigHours, weedHours, runKm]);

  // UI Helpers
  const getScoreColor = (score: number) => {
    if (score < 20) return 'text-rose-500';
    if (score <= 50) return 'text-amber-400';
    return 'text-emerald-500';
  };

  const getStatusMessage = (score: number) => {
    if (score < 20) return "Faza Krytyczna. Uruchom walutę naprawczą (bieg).";
    if (score <= 50) return "Odzyskujesz kontrolę. System się stabilizuje.";
    return "Wysoka wydajność. Tryb suwerenności włączony.";
  };

  if (!isMounted) return <div className="min-h-screen bg-slate-900" />;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-mono">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-widest text-slate-100 opacity-90">
            PROTOKÓŁ P
          </h1>
          <div className="h-1 w-32 bg-emerald-500 mx-auto rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
        </header>

        {/* Main Counter */}
        <section className="text-center py-8 bg-slate-900/50 rounded-3xl border border-slate-800 shadow-2xl">
          <div className={`text-7xl md:text-9xl font-black tabular-nums ${getScoreColor(calculations.total)}`}>
            {calculations.total}
            <span className="text-3xl md:text-5xl text-slate-500 ml-2">/ 100</span>
          </div>
        </section>

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NoFap Card */}
          <Card
            title="No-Fap (Dni)"
            value={noFapDays}
            max={7}
            onChange={setNoFapDays}
            points={calculations.nfPoints}
          />

          {/* Cigarettes Card */}
          <Card
            title="Papierosy (Godziny czystości)"
            value={cigHours}
            max={168}
            onChange={setCigHours}
            points={calculations.cigPoints}
          />

          {/* Weed Card */}
          <Card
            title="Trawa (Godziny czystości)"
            value={weedHours}
            max={48}
            onChange={setWeedHours}
            points={calculations.weedPoints}
            isSpecial
            specialLabel={weedHours < 24 ? "KARA" : "OK"}
            specialColor={weedHours < 24 ? "text-rose-500" : "text-emerald-500"}
          />

          {/* Run Card */}
          <Card
            title="Bieganie (Kilometry)"
            value={runKm}
            max={100}
            onChange={setRunKm}
            points={calculations.runPoints}
            isSpecial={runKm > 35}
            specialLabel="BONUS +"
            specialColor="text-emerald-500"
          />
        </div>

        {/* Status Message */}
        <footer className="text-center pt-8">
          <div className={`text-xl md:text-2xl font-bold py-4 px-6 rounded-xl border border-slate-800 bg-slate-900/40 ${getScoreColor(calculations.total)}`}>
            {getStatusMessage(calculations.total)}
          </div>
        </footer>
      </div>
    </main>
  );
}

interface CardProps {
  title: string;
  value: number;
  max: number;
  onChange: (val: number) => void;
  points: number;
  isSpecial?: boolean;
  specialLabel?: string;
  specialColor?: string;
}

function Card({ title, value, max, onChange, points, isSpecial, specialLabel, specialColor }: CardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start">
        <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider">{title}</h3>
        <div className="flex flex-col items-end">
          <span className={`text-xl font-bold ${points >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            {points >= 0 ? '+' : ''}{points.toFixed(2)} pkt
          </span>
          {isSpecial && (
            <span className={`text-[10px] font-black uppercase tracking-tighter ${specialColor}`}>
              {specialLabel}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="range"
          min="0"
          max={max}
          step={max > 10 ? 1 : 0.1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex items-center space-x-4">
          <input
            type="number"
            min="0"
            max={max}
            value={value}
            onChange={(e) => {
              const val = Math.min(max, Math.max(0, Number(e.target.value)));
              onChange(val);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 w-24 text-center font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <span className="text-slate-500 text-xs">/ {max}</span>
        </div>
      </div>
    </div>
  );
}
