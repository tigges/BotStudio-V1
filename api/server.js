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
