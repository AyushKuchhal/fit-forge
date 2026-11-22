import fs from 'node:fs';
import path from 'node:path';
import type { UserContext } from './aiCoach';

const promptDirectory = path.resolve(__dirname, '../../../prompts/final');
const systemPrompt = fs.readFileSync(path.join(promptDirectory, 'P1.txt'), 'utf8').trim();
const responseFormat = JSON.parse(fs.readFileSync(path.join(promptDirectory, 'P1.schema.json'), 'utf8'));

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
        response_format: responseFormat,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Profile: ${JSON.stringify(context)}\nQuestion: ${question}` },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Model returned HTTP ${response.status}`);
    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    const { answer, next_step: nextStep } = JSON.parse(content);
    if (typeof answer !== 'string' || typeof nextStep !== 'string' || !answer.trim() || !nextStep.trim()) {
      return null;
    }
    return `Answer: ${answer.trim().replace(/\s+/g, ' ')}\nNext step: ${nextStep.trim().replace(/\s+/g, ' ')}`;
  } catch (error) {
    console.warn('FitForge coach model unavailable:', error instanceof Error ? error.message : 'unknown error');
    return null;
  }
}
