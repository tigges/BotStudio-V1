/**
 * LLM connector — supports Claude (Anthropic), Gemini (Google), OpenAI
 * Provider is selected per bot config, falls back in order.
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const GEMINI_BASE   = 'https://generativelanguage.googleapis.com/v1beta/models';

/* ─── Claude ────────────────────────────────────────────────────────────────── */
export async function callClaude({ messages, system, maxTokens = 600, model = 'claude-3-5-haiku-20241022' }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
  });

  const raw = await res.text();
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error(`Claude parse error (${res.status}): ${raw.slice(0,200)}`); }
  if (!res.ok || data.error) throw new Error(`Claude ${res.status}: ${data.error?.message || data.error?.type || raw.slice(0,200)}`);
  return data.content?.[0]?.text || '';
}

/* ─── Gemini ─────────────────────────────────────────────────────────────────── */
export async function callGemini({ messages, system, maxTokens = 600, model = 'gemini-1.5-flash' }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`Gemini error: ${data.error.message}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/* ─── Router ─────────────────────────────────────────────────────────────────── */
export async function callLLM({ messages, system, maxTokens = 600, provider }) {
  /* try preferred provider first, then fall back */
  const order = provider === 'claude'
    ? ['claude', 'gemini']
    : ['gemini', 'claude'];

  const errors = [];
  for (const p of order) {
    try {
      if (p === 'claude' && process.env.ANTHROPIC_API_KEY) {
        return await callClaude({ messages, system, maxTokens });
      }
      if (p === 'gemini' && process.env.GEMINI_API_KEY) {
        return await callGemini({ messages, system, maxTokens });
      }
    } catch (e) {
      console.error(`[llm] ${p} failed:`, e.message);
      errors.push(`${p}: ${e.message}`);
    }
  }
  throw new Error(`LLM calls failed — ${errors.join(' | ') || 'no API keys found'}`);
}

/* ─── System prompt builder ──────────────────────────────────────────────────── */
export function buildSystemPrompt(bot, kbContext = '') {
  const config = bot.config || {};
  const cig    = bot.cig    || {};

  return `You are ${config.displayName || config.name || 'Coco'}, an AI assistant for ${config.businessName || 'this business'}.

PERSONALITY
Tone: ${config.tone || 'Friendly'}
Language: ${config.lang || 'English'}
${config.prompt ? `\nINSTRUCTIONS\n${config.prompt}` : ''}

${kbContext ? `KNOWLEDGE\n${kbContext}` : ''}

GUARDRAILS
${config.topics ? `Never discuss: ${config.topics}` : ''}
${config.escalation ? `Escalate when: ${config.escalation}` : ''}
${config.maxTurns ? `After ${config.maxTurns} turns without resolution, suggest speaking to a human.` : ''}
If out of scope: "I'm not sure about that — let me connect you with the team."

BEHAVIOUR
- Be natural and conversational, 2–4 sentences unless showing a price list
- For booking: collect service, date/time, and contact name before confirming
- When confirming a booking use format: service · date/time · ref #[BUSINESS_PREFIX]-[3digits]
- Bold key prices and times using **markdown**

${cig.name ? `CONVERSATION DESIGN\nThis bot follows the "${cig.name}" conversation pattern.` : ''}`.trim();
}
