import { Request, Response } from 'express';

// In-Memory Rate Limiter: Max 20 requests per minute per IP
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(ip: string, limit = 20, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserContext {
  goal?: string;
  weightKg?: number;
  heightCm?: number;
  dailyCalories?: number;
  split?: string;
}

/**
 * Knowledge-based response engine
 */
export function getKnowledgeBaseResponse(query: string, context?: UserContext): string {
  const q = query.toLowerCase();

  // Safety checks
  if (q.includes('steroid') || q.includes('tren') || q.includes('sarm') || q.includes('anavar') || q.includes('cycle') || q.includes('dbol')) {
    return "⚠️ **Safety Notice**: I cannot provide dosing, protocols, or encouragement for anabolic steroids, SARMs, or unprescribed performance-enhancing drugs. These substances carry serious cardiovascular, hormonal, and liver/kidney risks. You can achieve phenomenal natural progress through progressive overload, caloric optimization, and adequate recovery.";
  }

  if (q.includes('crash diet') || q.includes('500 calorie') || q.includes('800 calorie') || q.includes('starve')) {
    return "⚠️ **Health Warning**: I cannot recommend extreme crash diets or dropping below safe caloric thresholds (minimum 1,500 kcal for men, 1,200 kcal for women). Severe starvation diets result in muscle catabolism, metabolic slowdown, gallstones, and nutrient deficiencies. A moderate deficit of 300–500 kcal per day preserves muscle while burning fat sustainably.";
  }

  if (q.includes('sharp pain') || q.includes('tearing') || q.includes('pop in my') || q.includes('swollen joint')) {
    return "🚨 **Medical Consultation Recommended**: Sharp pain or audible popping during an exercise may indicate a sprain, tendon strain, or ligament injury. Please stop the movement immediately, apply R.I.C.E. principles if appropriate, and consult a doctor or physical therapist. *Disclaimer: This is general fitness guidance, not medical advice.*";
  }

  // Exercise Swaps
  if (q.includes('swap squat') || q.includes('knee friendly') || q.includes('knee pain') || (q.includes('squat') && q.includes('knee'))) {
    return `### Knee-Friendly Squat Alternatives 🦵
If barbell back squats bother your knees, try these biomechanically friendly alternatives:
1. **Romanian Deadlifts (RDLs)**: Focuses on the posterior chain (hamstrings & glutes) with minimal knee flexion.
2. **Reverse Lunges / Bulgarian Split Squats**: Much lower patellar shear force while building unilateral leg strength.
3. **Goblet Squat to a Box**: Enforces a vertical shin angle and controlled depth.
4. **Leg Press (High & Wide Foot Placement)**: Shifts load away from the patella onto glutes and adductors.

💡 *Tip: Warm up with 5 minutes on the stationary bike and do hamstring curls before pressing to lubricate the knee joint.*`;
  }

  if (q.includes('shoulder friendly') || q.includes('shoulder pain') || q.includes('swap bench') || (q.includes('bench') && q.includes('shoulder'))) {
    return `### Shoulder-Friendly Pressing Swaps 🛡️
To reduce anterior shoulder impingement:
1. **Neutral-Grip Dumbbell Press**: Palms facing each other reduces subacromial friction.
2. **Floor Press**: Limits elbow descent past torso level, protecting the anterior capsule.
3. **Push-Ups with Handles**: Allows natural scapular movement rather than pinning blades against a bench.
4. **Landmine Press**: Arc path is gentle on rotator cuffs and builds upper chest & delts.`;
  }

  // Protein / Macros
  if (q.includes('protein') || q.includes('how much protein') || q.includes('protein intake')) {
    const weight = context?.weightKg || 75;
    const low = Math.round(weight * 1.6);
    const high = Math.round(weight * 2.2);
    return `### Daily Protein Requirements 🥩
Based on current sports nutrition science:
- **Optimal Range**: **1.6 to 2.2 grams per kg** of bodyweight.
${context?.weightKg ? `- For your weight (**${weight} kg**), your daily target is **${low}g – ${high}g** of protein.` : '- E.g., for a 75 kg individual, aim for 120g – 165g daily.'}
- **Pacing**: Distribute protein across 3–5 meals (~25–40g per meal) to maximize Muscle Protein Synthesis (MPS).
- **Good sources**: Chicken breast, eggs, paneer, Greek yogurt, whey protein, dal/lentils, tofu, and fish.`;
  }

  // Creatine
  if (q.includes('creatine')) {
    return `### Creatine Monohydrate Facts ⚡
- **Dosage**: 3 to 5 grams daily at any time (timing doesn't matter, saturation does).
- **Loading Phase**: Optional. 20g/day for 5 days saturates stores faster, or 5g/day saturates in 3–4 weeks.
- **Myths**: Does not cause hair loss (unsupported by modern clinical trials) and is not a steroid.
- **Benefits**: Increases phosphocreatine reserves in muscle, boosting power output by 5–15% on high-intensity sets.`;
  }

  // Abs / Core
  if (q.includes('abs') || q.includes('six pack') || q.includes('belly fat')) {
    return `### The Truth About Getting Defined Abs 🔥
1. **Spot Reduction is a Myth**: You cannot burn fat exclusively from your belly by doing crunches. Fat loss occurs systematically through a consistent caloric deficit.
2. **Hypertrophy for Abs**: Treat abs like any other muscle. Progressive overload with **Hanging Leg Raises** (curling pelvis up) and **Cable Rope Crunches** (3 sets of 12–15 reps).
3. **Body Fat Thresholds**: Abs typically become visible around **10–14% body fat** for men, and **18–22%** for women.`;
  }

  // Progressive Overload
  if (q.includes('progressive overload') || q.includes('build muscle') || q.includes('hypertrophy')) {
    return `### Mastering Progressive Overload 📈
Progressive overload is the fundamental law of muscle hypertrophy:
1. **Add Weight**: Increase the load by 1–2.5 kg when you hit the top of your target rep range.
2. **Add Reps**: Progress from 8 reps to 10–12 reps with the same weight before increasing load.
3. **Improve Execution**: Slow down the eccentric (lowering) phase to 2–3 seconds or pause at deep stretch.
4. **Log Your Workouts**: Track your numbers every session so you know what milestone to beat.`;
  }

  // Greeting
  if (q === 'hello' || q === 'hi' || q === 'hey' || q.includes('hello coach')) {
    return `Hey there! 🏋️ I'm your FitForge AI Coach.
I'm ready to help you optimize your training, dial in your nutrition, or answer any exercise doubts. 

What are you working on today? Let me know your goal or question!`;
  }

  // Profile-aware fallback
  const goalStr = context?.goal ? `for your **${context.goal.toUpperCase()}** goal` : 'for your fitness journey';
  return `### Coach Recommendations ${goalStr} 🏋️
Here is the evidence-based perspective on **"${query}"**:
- **Consistency**: Progressive overload (adding 1 rep or small weight each week) drives 80% of muscle adaptation.
- **Recovery**: Aim for 7–9 hours of sleep; muscle protein synthesis peaks during deep sleep.
- **Nutrition**: Maintain your daily caloric target ${context?.dailyCalories ? `(**${context.dailyCalories} kcal**)` : ''} and hit your protein goals.

*Feel free to ask about specific exercise forms, diet swaps, or routine tweaks!*`;
}

/**
 * Handle streaming chat request
 */
export async function streamChatResponse(req: Request, res: Response) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // 1. Rate Limit Check
  if (!checkRateLimit(ip, 60, 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute before messaging again.' });
  }

  const { messages, userContext } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Valid messages array is required' });
  }

  const lastUserMessage = messages[messages.length - 1].content;

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  const fullAnswer = getKnowledgeBaseResponse(lastUserMessage, userContext);
  const words = fullAnswer.split(' ');

  let index = 0;
  const interval = setInterval(() => {
    if (index < words.length) {
      // Send 3 words per tick for snappy, responsive stream
      const slice = words.slice(index, index + 3).join(' ');
      const prefix = index === 0 ? '' : ' ';
      res.write(`data: ${JSON.stringify({ text: prefix + slice })}\n\n`);
      index += 3;
    } else {
      clearInterval(interval);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }, 30);

  // Crucial: listen to res.on('close') NOT req.on('close')!
  res.on('close', () => {
    clearInterval(interval);
  });
}
