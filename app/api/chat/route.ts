import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import Anthropic from '@anthropic-ai/sdk';
import { getChatMessages, insertChatMessage } from '@/lib/db';
import { buildCoachSystemPrompt } from '@/lib/coach-context';

export async function GET() {
  const messages = await getChatMessages();
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Brak skonfigurowanego klucza ANTHROPIC_API_KEY na serwerze.' },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { message } = body as { message: string };
  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Wiadomość nie może być pusta' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const userMessage = {
    id: crypto.randomUUID(),
    role: 'user' as const,
    content: message,
    createdAt: now,
  };
  await insertChatMessage(userMessage);

  const history = await getChatMessages();
  const systemPrompt = await buildCoachSystemPrompt();

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: systemPrompt,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content.find((block) => block.type === 'text')?.text ?? '';

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: text,
      createdAt: new Date().toISOString(),
    };
    await insertChatMessage(assistantMessage);

    return NextResponse.json({ message: assistantMessage });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Nieznany błąd podczas komunikacji z AI' },
      { status: 500 }
    );
  }
}
