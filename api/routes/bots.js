/**
 * Bot management routes — CRUD, embed key generation, calendar OAuth
 */

import { db, getBotById, upsertBot } from '../lib/db.js';
import { getAuthUrl, exchangeCode } from '../lib/calendar.js';
import crypto from 'crypto';

function genEmbedKey(name = 'bot') {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  const rand = crypto.randomBytes(8).toString('hex');
  return `${slug}_live_${rand}`;
}

export async function botsRoute(fastify) {

  /* GET /api/bots — list all bots (auth required) */
  fastify.get('/api/bots', async (req, reply) => {
    const ownerId = req.user?.sub;
    if (!ownerId) return reply.code(401).send({ error: 'Unauthorized' });

    const { data, error } = await db()
      .from('bots')
      .select('id, name, industry, status, embed_key, created_at, updated_at')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) return reply.code(500).send({ error: error.message });
    return reply.send(data);
  });

  /* GET /api/bots/:id */
  fastify.get('/api/bots/:id', async (req, reply) => {
    const bot = await getBotById(req.params.id);
    if (!bot) return reply.code(404).send({ error: 'Not found' });
    /* strip sensitive fields for non-owners */
    const { calendar_tokens, ...safe } = bot;
    return reply.send(safe);
  });

  /* POST /api/bots — create bot */
  fastify.post('/api/bots', async (req, reply) => {
    const ownerId = req.user?.sub;
    if (!ownerId) return reply.code(401).send({ error: 'Unauthorized' });

    const body = req.body;
    const embedKey = genEmbedKey(body.name);

    const bot = await upsertBot({
      owner_id:  ownerId,
      name:      body.name,
      industry:  body.industry  || 'general',
      status:    body.status    || 'draft',
      cig:       body.cig       || null,
      config:    body.config    || {},
      embed_key: embedKey,
    });

    return reply.code(201).send(bot);
  });

  /* PUT /api/bots/:id — update bot */
  fastify.put('/api/bots/:id', async (req, reply) => {
    const ownerId = req.user?.sub;
    if (!ownerId) return reply.code(401).send({ error: 'Unauthorized' });

    const { id } = req.params;
    const updates = { ...req.body, id, updated_at: new Date().toISOString() };
    delete updates.owner_id; /* can't change owner */
    delete updates.embed_key; /* can't change embed key this way */

    const bot = await upsertBot(updates);
    return reply.send(bot);
  });

  /* POST /api/bots/:id/publish — go live */
  fastify.post('/api/bots/:id/publish', async (req, reply) => {
    const ownerId = req.user?.sub;
    if (!ownerId) return reply.code(401).send({ error: 'Unauthorized' });

    const bot = await upsertBot({ id: req.params.id, status: 'live', updated_at: new Date().toISOString() });
    return reply.send({ ok: true, embedKey: bot.embed_key, bot });
  });

  /* ─── Calendar OAuth ──────────────────────────────────────────────────── */

  /* GET /api/bots/:id/calendar/connect — returns Google OAuth URL */
  fastify.get('/api/bots/:id/calendar/connect', async (req, reply) => {
    const url = getAuthUrl(req.params.id);
    return reply.send({ url });
  });

  /* GET /api/calendar/callback — Google redirects here with code */
  fastify.get('/api/calendar/callback', async (req, reply) => {
    const { code, state: botId } = req.query;
    if (!code || !botId) return reply.code(400).send({ error: 'Missing code or state' });

    try {
      const tokens = await exchangeCode(code);
      await upsertBot({ id: botId, calendar_tokens: tokens, updated_at: new Date().toISOString() });

      /* close the popup and tell the opener we're done */
      return reply.type('text/html').send(`
        <script>
          window.opener && window.opener.postMessage({ type: 'calendar_connected', botId: '${botId}' }, '*');
          window.close();
        </script>
        <p>Calendar connected! You can close this window.</p>
      `);
    } catch (e) {
      return reply.code(500).send({ error: e.message });
    }
  });
}
