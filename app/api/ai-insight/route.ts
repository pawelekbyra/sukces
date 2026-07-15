import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import Anthropic from '@anthropic-ai/sdk';
import { buildCoachSystemPrompt } from '@/lib/coach-context';

export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Brak skonfigurowanego klucza ANTHROPIC_API_KEY na serwerze.' },
      { status: 503 }
    );
  }

  const systemPrompt = await buildCoachSystemPrompt();
  const userMessage = `Napisz JEDNĄ spójną, motywacyjną narrację (nie osobne akapity per nałóg, nie lista punktowana) łączącą fakty o tym co dzieje się w ciele/mózgu użytkownika na obecnym etapie każdego nałogu. Długość: 150-250 słów.`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
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
