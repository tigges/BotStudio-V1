-- BotStudio — Supabase schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New query

-- ─── Bots / projects ────────────────────────────────────────────────────────
create table if not exists bots (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  industry    text,
  status      text default 'draft',  -- draft | live | paused
  cig         jsonb,                 -- full Conversational Intent Graph
  config      jsonb,                 -- name, tone, avatar, channels etc.
  kb_sources  jsonb default '[]',    -- uploaded document metadata
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Conversations ──────────────────────────────────────────────────────────
create table if not exists conversations (
  id            uuid default gen_random_uuid() primary key,
  bot_id        uuid references bots(id) on delete cascade,
  session_id    text,
  provider      text,               -- 'keywords' | 'gemini' | 'claude'
  turns         jsonb default '[]', -- [{role, content, intent, node, ts}]
  outcome       text,               -- completed | abandoned | escalated | booked
  extracted_cig jsonb,              -- CIG extracted by LLM post-conversation
  quality_score int,
  created_at    timestamptz default now()
);

-- ─── Pattern library ────────────────────────────────────────────────────────
create table if not exists patterns (
  id            uuid default gen_random_uuid() primary key,
  industry      text not null,
  bot_id        uuid references bots(id) on delete set null,
  source_conv   uuid references conversations(id) on delete set null,
  cig           jsonb not null,     -- extracted CIG
  quality_score int,
  notes         text,
  use_count     int default 0,
  created_at    timestamptz default now()
);

-- ─── Row Level Security (open for demo — tighten with auth in production) ───
alter table bots          enable row level security;
alter table conversations  enable row level security;
alter table patterns       enable row level security;

drop policy if exists "open_bots"          on bots;
drop policy if exists "open_conversations" on conversations;
drop policy if exists "open_patterns"      on patterns;

create policy "open_bots"          on bots          for all using (true) with check (true);
create policy "open_conversations" on conversations  for all using (true) with check (true);
create policy "open_patterns"      on patterns       for all using (true) with check (true);

-- ─── Helper: auto-update updated_at ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists bots_updated_at on bots;
create trigger bots_updated_at
  before update on bots
  for each row execute function update_updated_at();
