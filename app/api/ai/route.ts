import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const requestSchema = z.object({
  action: z.enum([
    'generate_about',
    'highlight_strengths',
    'improve_experience',
    'fix_errors',
    'change_tone',
    'adapt_to_vacancy',
  ]),
  data: z.record(z.unknown()),
  tone: z.string().optional(),
  vacancy: z.string().optional(),
});

type AIRequest = z.infer<typeof requestSchema>;

function buildPrompt(req: AIRequest): string {
  const { action, data, tone, vacancy } = req;

  const rules = `
ВАЖНО: Отвечай ТОЛЬКО на русском языке (если данные на русском) или на языке входных данных.
Не придумывай компании, должности, навыки, цифры, достижения, проекты, сертификаты, образование.
Если информации недостаточно, используй нейтральную формулировку.
Верни ТОЛЬКО готовый текст, без пояснений, без markdown, без кавычек.
`.trim();

  switch (action) {
    case 'generate_about': {
      const { position, experience, skills, projects } = data as {
        position?: string;
        experience?: string;
        skills?: string;
        projects?: string;
      };
      return `${rules}

Напиши раздел "О себе" для резюме на основе следующих данных:
Должность: ${position || 'не указана'}
Опыт: ${experience || 'не указан'}
Навыки: ${skills || 'не указаны'}
Проекты: ${projects || 'не указаны'}

Раздел должен быть 3-5 предложений, профессиональным, от первого лица, без выдуманных фактов.`;
    }

    case 'highlight_strengths': {
      const { about, experience, skills } = data as {
        about?: string;
        experience?: string;
        skills?: string;
      };
      return `${rules}

Выдели 3-5 сильных сторон специалиста на основе:
О себе: ${about || '—'}
Опыт: ${experience || '—'}
Навыки: ${skills || '—'}

Оформи как короткий связный текст (не список).`;
    }

    case 'improve_experience': {
      const { position, company, description, achievements } = data as {
        position?: string;
        company?: string;
        description?: string;
        achievements?: string;
      };
      return `${rules}

Улучши описание опыта работы. Сделай его более профессиональным и конкретным.
Должность: ${position || '—'}
Компания: ${company || '—'}
Текущее описание: ${description || '—'}
Текущие достижения: ${achievements || '—'}

Верни улучшенное описание.`;
    }

    case 'fix_errors': {
      const { text } = data as { text?: string };
      return `${rules}

Исправь грамматические, орфографические и стилистические ошибки в тексте. Сохрани смысл и структуру.
Текст: ${text || ''}

Верни исправленный текст.`;
    }

    case 'change_tone': {
      const { text } = data as { text?: string };
      const toneMap: Record<string, string> = {
        professional: 'профессиональный и деловой',
        brief: 'краткий и лаконичный',
        confident: 'уверенный и убедительный',
        technical: 'технический и точный',
        friendly: 'дружелюбный и открытый',
      };
      const toneDesc = tone ? (toneMap[tone] || tone) : 'профессиональный';
      return `${rules}

Перепиши текст в ${toneDesc} тоне. Сохрани все факты.
Текст: ${text || ''}

Верни переписанный текст.`;
    }

    case 'adapt_to_vacancy': {
      const { about, experience } = data as { about?: string; experience?: string };
      return `${rules}

Адаптируй текст резюме под вакансию. Расставь акценты на релевантных навыках и опыте.
НЕ выдумывай новые факты.

Текст вакансии:
${vacancy || ''}

Текущий раздел "О себе":
${about || ''}

Текущий опыт:
${experience || ''}

Верни адаптированный раздел "О себе".`;
    }

    default:
      return rules;
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY не настроен. Добавьте его в .env.local' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Неверные параметры запроса', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(parsed.data);

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text ?? '';
    return NextResponse.json({ result: text.trim() });
  } catch (err) {
    console.error('Gemini API error:', err);
    return NextResponse.json(
      { error: 'Ошибка Gemini API. Проверьте ключ и попробуйте снова.' },
      { status: 502 }
    );
  }
}
