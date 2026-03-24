import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: 'Моля, въведете по-дълъг текст (поне 20 символа).' }, { status: 400 });
    }

    const prompt = `Анализирай следния текст и върни САМО валиден JSON (без Markdown, без обяснения) по тази точна схема:

{
  "topic": "Основната тема на текста (1-2 изречения)",
  "keywords": ["ключова1", "ключова2", "ключова3", "ключова4", "ключова5", "ключова6", "ключова7", "ключова8"],
  "summary": "Резюме на текста в 3-5 изречения, ясно и информативно.",
  "emotion": {
    "overall": "positive" | "negative" | "neutral" | "mixed",
    "score": <число от 0 до 100, където 0=изключително негативен, 50=неутрален, 100=изключително позитивен>,
    "emotions": ["емоция1", "емоция2", "емоция3"],
    "description": "Кратко описание на емоционалната натовареност (1-2 изречения)"
  }
}

Текст за анализ:
"""
${text.slice(0, 8000)}
"""`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Грешка при анализа. Проверете API ключа и опитайте отново.' }, { status: 500 });
  }
}
