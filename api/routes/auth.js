/**
 * Auth routes — sign up, login, refresh
 * Uses Supabase Auth under the hood; issues our own short-lived JWTs
 * so the API isn't coupled to Supabase client SDK on every request.
 */

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

function authClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

function issueToken(userId, email) {
  return jwt.sign(
    { sub: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );
}

export async function authRoute(fastify) {

  /* POST /api/auth/signup */
  fastify.post('/api/auth/signup', async (req, reply) => {
    const { email, password, name } = req.body;
    if (!email || !password) return reply.code(400).send({ error: 'email and password required' });

    const { data, error } = await authClient().auth.admin.createUser({
      email, password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) return reply.code(400).send({ error: error.message });

    const token = issueToken(data.user.id, email);
    return reply.code(201).send({ token, userId: data.user.id });
  });

  /* POST /api/auth/login */
  fastify.post('/api/auth/login', async (req, reply) => {
    const { email, password } = req.body;
    if (!email || !password) return reply.code(400).send({ error: 'email and password required' });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) return reply.code(401).send({ error: 'Invalid credentials' });

    const token = issueToken(data.user.id, email);
    return reply.send({ token, userId: data.user.id, email });
  });

  /* GET /api/auth/me — validate token */
  fastify.get('/api/auth/me', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    return reply.send({ userId: req.user.sub, email: req.user.email });
  });
}

/* ─── JWT middleware (attach to fastify as decorator) ───────────────────────── */
export function registerAuthMiddleware(fastify) {
  fastify.decorate('authenticate', async (req, reply) => {
    try {
      const auth  = req.headers.authorization || '';
      const token = auth.replace(/^Bearer\s+/i, '');
      req.user    = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });
}
