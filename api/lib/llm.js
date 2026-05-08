/**
 * LLM connector — supports Claude (Anthropic) and Gemini (Google)
 * Each provider tries multiple models in order until one succeeds.
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const GEMINI_BASE   = 'https://generativelanguage.googleapis.com/v1beta/models'; /* v1beta has gemini-1.5-flash + system_instruction */

/* ─── Claude — tries models in order ────────────────────────────────────────── */
const CLAUDE_MODELS = [
  'claude-3-haiku-20240307',
  'claude-3-5-haiku-20241022',
  'claude-instant-1.2',
];

export async function callClaude({ messages, system, maxTokens = 600, model }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');

  const modelsToTry = model ? [model] : CLAUDE_MODELS;
  let lastErr = 'no models tried';

  for (const m of modelsToTry) {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: m, max_tokens: maxTokens, system, messages }),
    });

    const raw = await res.text();
    let data;
    try { data = JSON.parse(raw); } catch { lastErr = `${m}: parse error ${raw.slice(0, 80)}`; continue; }

    if (res.ok && !data.error) return data.content?.[0]?.text || '';

    lastErr = `${m} (${res.status}): ${data.error?.message || data.error?.type || raw.slice(0, 80)}`;
    console.warn('[claude] failed:', lastErr);
  }
  throw new Error(`Claude failed — ${lastErr}`);
}

/* ─── Gemini — tries models in order ────────────────────────────────────────── */
const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro',
];

export async function callGemini({ messages, system, maxTokens = 600, model }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const modelsToTry = model ? [model] : GEMINI_MODELS;
  let lastErr = 'no models tried';

  for (const m of modelsToTry) {
    const res = await fetch(`${GEMINI_BASE}/${m}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      }),
    });

    const data = await res.json();
    if (!data.error) return data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    lastErr = `${m}: ${data.error.message}`;
    console.warn('[gemini] failed:', lastErr);
  }
  throw new Error(`Gemini failed — ${lastErr}`);
}

/* ─── Router ─────────────────────────────────────────────────────────────────── */
export async function callLLM({ messages, system, maxTokens = 600, provider }) {
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
If out of scope: "I'm not sure about that — let me connect you with the team."

BEHAVIOUR
- Be natural and conversational, 2–4 sentences unless showing a price list
- For booking: collect service, date/time, and contact name before confirming
- Bold key prices using **markdown**

${cig.name ? `CONVERSATION DESIGN\nThis bot follows the "${cig.name}" conversation pattern.` : ''}`.trim();
}
