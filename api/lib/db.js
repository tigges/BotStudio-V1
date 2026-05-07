import { createClient } from '@supabase/supabase-js';

let _client = null;

export function db() {
  if (!_client) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
    }
    _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      realtime: { enabled: false },   /* we use REST only — no WebSocket needed */
      auth: { persistSession: false },
    });
  }
  return _client;
}

/* ─── Bots ─────────────────────────────────────────────────────────────────── */
export async function getBotByKey(embedKey) {
  const { data, error } = await db()
    .from('bots')
    .select('*')
    .eq('embed_key', embedKey)
    .eq('status', 'live')
    .single();
  if (error) return null;
  return data;
}

export async function getBotById(id) {
  const { data } = await db().from('bots').select('*').eq('id', id).single();
  return data;
}

export async function upsertBot(bot) {
  const { data, error } = await db().from('bots').upsert(bot).select().single();
  if (error) throw error;
  return data;
}

/* ─── Conversations ────────────────────────────────────────────────────────── */
export async function createConversation(conv) {
  const { data, error } = await db().from('conversations').insert(conv).select().single();
  if (error) throw error;
  return data;
}

export async function appendTurn(convId, turn) {
  const { data: conv } = await db()
    .from('conversations')
    .select('turns')
    .eq('id', convId)
    .single();
  const turns = [...(conv?.turns || []), { ...turn, ts: new Date().toISOString() }];
  await db().from('conversations').update({ turns }).eq('id', convId);
  return turns;
}

export async function closeConversation(convId, outcome) {
  await db().from('conversations').update({
    outcome,
    ended_at: new Date().toISOString(),
  }).eq('id', convId);
}

/* ─── Patterns ─────────────────────────────────────────────────────────────── */
export async function savePattern(pattern) {
  const { data, error } = await db().from('patterns').insert(pattern).select().single();
  if (error) throw error;
  return data;
}

export async function getPatternsByIndustry(industry, limit = 5) {
  const { data } = await db()
    .from('patterns')
    .select('*')
    .eq('industry', industry)
    .order('quality_score', { ascending: false })
    .limit(limit);
  return data || [];
}

/* ─── KB chunks (for RAG) ──────────────────────────────────────────────────── */
export async function getKbChunks(botId) {
  const { data } = await db()
    .from('kb_chunks')
    .select('text, embedding')
    .eq('bot_id', botId);
  return data || [];
}

export async function saveKbChunk(chunk) {
  await db().from('kb_chunks').insert(chunk);
}
