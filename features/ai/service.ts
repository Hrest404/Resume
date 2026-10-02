export type AIAction =
  | 'generate_about'
  | 'highlight_strengths'
  | 'improve_experience'
  | 'fix_errors'
  | 'change_tone'
  | 'adapt_to_vacancy';

export type AITone = 'professional' | 'brief' | 'confident' | 'technical' | 'friendly';

export interface AIRequestPayload {
  action: AIAction;
  data: Record<string, unknown>;
  tone?: AITone;
  vacancy?: string;
}

export interface AIResult {
  result: string;
  error?: string;
}

export async function callAI(payload: AIRequestPayload): Promise<AIResult> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await response.json() as AIResult;

  if (!response.ok) {
    throw new Error(json.error || 'Ошибка AI');
  }

  return json;
}
