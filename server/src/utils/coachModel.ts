import fs from 'node:fs';
import path from 'node:path';
import type { UserContext } from './aiCoach';

const systemPrompt = fs.readFileSync(
  path.resolve(__dirname, '../../../prompts/final/P1.txt'), 'utf8',
).trim();

export function requiresRuleBasedResponse(question: string): boolean {
  return /steroid|\btren\b|sarm|anavar|cycle|dbol|crash diet|500 calorie|800 calorie|starve|sharp pain|tearing|pop in my|swollen joint/i.test(question);
}

export async function generateCoachAnswer(question: string, context: UserContext): Promise<string | null> {
  const modelUrl = process.env.COACH_MODEL_URL;
  if (!modelUrl) return null;

  try {
    const response = await fetch(new URL('/v1/chat/completions', modelUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({
        model: 'fitforge-coach',
        temperature: 0,
        max_tokens: 180,
        seed: 42,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Profile: ${JSON.stringify(context)}\nQuestion: ${question}` },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Model returned HTTP ${response.status}`);
    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const answer = data.choices?.[0]?.message?.content?.trim();
    return answer && /^Answer:/i.test(answer) && /\nNext step:/i.test(answer) ? answer : null;
  } catch (error) {
    console.warn('FitForge coach model unavailable:', error instanceof Error ? error.message : 'unknown error');
    return null;
  }
}
