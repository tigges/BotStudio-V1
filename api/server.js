/**
 * BotStudio API server
 * Routes: /api/chat, /api/chat/ws, /api/bots, /api/auth, /api/calendar
 *
 * Deploy:
 *   Railway  — connect repo, set env vars, done
 *   Render   — node server.js, set env vars
 *   Manual   — npm start (requires Node 20+)
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';

/* log env at startup so Railway Deploy Logs show what's loaded */
console.log('[startup] PORT:', process.env.PORT);
console.log('[startup] NODE_ENV:', process.env.NODE_ENV);
console.log('[startup] providers: claude=%s gemini=%s supabase=%s',
  !!process.env.ANTHROPIC_API_KEY,
  !!process.env.GEMINI_API_KEY,
  !!process.env.SUPABASE_URL);

import { chatRestRoute, chatWsRoute } from './routes/chat.js';
import { botsRoute } from './routes/bots.js';
import { authRoute, registerAuthMiddleware } from './routes/auth.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const fastify = Fastify({
  logger: { level: process.env.NODE_ENV === 'production' ? 'warn' : 'info' },
});

/* ─── Plugins ────────────────────────────────────────────────────────────────── */
await fastify.register(cors, {
  origin: (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

await fastify.register(websocket);

/* ─── Auth middleware ────────────────────────────────────────────────────────── */
registerAuthMiddleware(fastify);

/* ─── Routes ─────────────────────────────────────────────────────────────────── */
await fastify.register(chatRestRoute);
await fastify.register(chatWsRoute);
await fastify.register(botsRoute);
await fastify.register(authRoute);

/* ─── List available Gemini models ──────────────────────────────────────────── */
fastify.get('/api/gemini-models', async (req, reply) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return reply.code(400).send({ error: 'GEMINI_API_KEY not set' });
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    if (data.error) return reply.code(400).send({ ok: false, error: data.error.message, hint: 'Key may not have Generative Language API enabled' });
    const models = (data.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
    return reply.send({ ok: true, count: models.length, models });
  } catch (e) {
    return reply.code(500).send({ error: e.message });
  }
});

/* ─── Quick LLM test ────────────────────────────────────────────────────────── */
fastify.get('/api/test-llm', async (req, reply) => {
  const { callLLM } = await import('./lib/llm.js');
  try {
    const text = await callLLM({
      messages: [{ role: 'user', content: 'Reply with exactly this word: WORKING' }],
      system: 'You are a test assistant. Always reply with exactly one word as instructed.',
      maxTokens: 50,
      provider: req.query.provider || 'gemini',
    });
    return reply.send({ ok: true, response: text });
  } catch (e) {
    return reply.code(500).send({ ok: false, error: e.message });
  }
});

/* ─── Health check ───────────────────────────────────────────────────────────── */
fastify.get('/api/health', async () => ({
  ok: true,
  version: '0.2.0',
  ts: new Date().toISOString(),
  providers: {
    claude: !!process.env.ANTHROPIC_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    supabase: !!process.env.SUPABASE_URL,
    calendar: !!process.env.GOOGLE_CLIENT_ID,
    email: !!process.env.RESEND_API_KEY,
  },
}));

/* ─── Start ───────────────────────────────────────────────────────────────────── */
try {
  await fastify.listen({ port: PORT, host: HOST });
  console.log(`\n  BotStudio API running on http://${HOST}:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health\n`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
