# BotStudio

> B2B Chatbot Management Platform — from conversation design to live deployment.

**Live demo (dashboard):** https://tigges.github.io/BotStudio-V1/
**Direct chat link format:** `https://tigges.github.io/BotStudio-V1/chat/?k=YOUR_EMBED_KEY`
**Repo:** https://github.com/tigges/BotStudio-V1

---

## Releases

| Version | Date | Notes |
|---|---|---|
| **v0.2.0** | May 2026 | CIG engine, LLM integration, Supabase + Google Drive, web widget, API |
| v0.1.0 | May 2026 | Single-file concept prototype, 9 screens |

> Version shown bottom-left of sidebar. Illustrations below update each release.

---

## Architecture

```
┌──────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│  BotStudio       │    │  API Server          │    │  External APIs  │
│  Dashboard       │───►│  /api (Node.js)      │───►│  Claude/Gemini  │
│  (GitHub Pages)  │    │  Fastify + WebSocket │    │  Google Calendar│
│  botstudio.html  │    │  /api/chat           │    │  Resend (email) │
└──────────────────┘    │  /api/bots           │    │  Supabase       │
                        │  /api/auth           │    └─────────────────┘
┌──────────────────┐    │  /api/calendar       │
│  Web Widget      │───►│                      │    ┌─────────────────┐
│  widget/         │    └─────────────────────┘    │  Storage        │
│  12KB vanilla JS │                               │  Supabase PG    │
│  shadow DOM      │                               │  Google Drive   │
└──────────────────┘                               └─────────────────┘
                        ┌─────────────────────┐
                        │  Direct Chat Page   │
                        │  chat/index.html    │
                        │  Full-screen mobile │
                        └─────────────────────┘
```

---

## Project structure

```
BotStudio-V1/
├── botstudio.html        ← Dashboard (single-file, no build)
├── index.html            ← GitHub Pages root (copy of dashboard)
│
├── chat/
│   └── index.html        ← Direct chat link (shareable URL)
│
├── widget/
│   ├── widget.js         ← Embeddable widget (<script> tag)
│   └── demo.html         ← Demo page (Yuzu Hair & Beauty)
│
├── api/                  ← Node.js backend
│   ├── server.js         ← Fastify entry point
│   ├── routes/
│   │   ├── chat.js       ← WebSocket + REST chat endpoint
│   │   ├── bots.js       ← Bot CRUD + calendar OAuth
│   │   └── auth.js       ← JWT auth (Supabase Auth backed)
│   ├── lib/
│   │   ├── llm.js        ← Claude + Gemini connector
│   │   ├── calendar.js   ← Google Calendar read/write
│   │   ├── email.js      ← Resend booking confirmations
│   │   └── db.js         ← Supabase client + helpers
│   ├── package.json
│   ├── railway.toml      ← Railway deployment config
│   └── .env.example      ← All required environment variables
│
└── deploy/
    ├── cloudflare-worker.js  ← LLM proxy (Cloudflare Workers)
    ├── claude-proxy.php      ← LLM proxy (PHP / Cloudways)
    └── supabase-schema.sql   ← Database schema
```

---

## Quick start

### 1 — Dashboard (already live)

Open https://tigges.github.io/BotStudio-V1/

- **Design → Conversation design** → describe your bot or pick a template
- **Design → Review & approve** → inspect CIG + conversation script
- **Design → Gather knowledge** → upload price list, connect calendar
- **Publish** → get embed code and share link
- **Platform → Settings** → connect Supabase, Google Drive, LLM

### 2 — Backend API

```bash
cd api
cp .env.example .env        # fill in your keys
npm install
npm run dev                  # runs on http://localhost:3001
```

**Required env vars:**
| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` | LLM for conversations |
| `SUPABASE_URL` | Storage |
| `SUPABASE_SERVICE_KEY` | Service role key (not anon) |
| `JWT_SECRET` | Any 32+ char secret |

**Optional (enables extra features):**
| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | Calendar booking |
| `RESEND_API_KEY` | Booking confirmation emails |

### 3 — Deploy API

**Railway (recommended, 5 min):**
1. Fork this repo
2. New project → deploy from GitHub → select `BotStudio-V1`
3. Set root dir to `/api`
4. Add env vars in Railway dashboard
5. Done — `railway.toml` handles the rest

**Cloudways (existing server):**
1. Create a Node.js application
2. SFTP upload `/api/` folder to app root
3. Set env vars in Cloudways dashboard
4. Start command: `node server.js`

### 4 — Web widget

```html
<script src="https://tigges.github.io/BotStudio-V1/widget/widget.js"
  data-key="your_embed_key"
  data-api="https://your-api.railway.app"
  data-name="Coco"
  data-color="#2255e8"
  data-avatar="🍋"
  data-delay="5">
</script>
```

Attributes:
| Attribute | Default | Description |
|---|---|---|
| `data-key` | required | Embed key from Publish screen |
| `data-api` | `https://botstudio-api.railway.app` | Your API base URL |
| `data-name` | `Assistant` | Bot display name |
| `data-color` | `#2255e8` | Accent / bubble colour |
| `data-avatar` | `🤖` | Bot emoji avatar |
| `data-delay` | `0` | Seconds before notification dot appears |
| `data-position` | `bottom-right` | `bottom-right` or `bottom-left` |

### 5 — Direct share link

No website needed. Share this URL on Instagram bio, WhatsApp, Google profile:

```
https://tigges.github.io/BotStudio-V1/chat/?k=YOUR_EMBED_KEY&name=Coco&api=https://your-api.railway.app
```

---

## Database schema

Run once in Supabase SQL Editor (`deploy/supabase-schema.sql`):

```sql
create table bots          (id uuid primary key, name text, industry text,
                            status text, cig jsonb, config jsonb,
                            embed_key text unique, owner_id text,
                            calendar_id text, calendar_tokens jsonb,
                            kb_text text, created_at timestamptz, updated_at timestamptz);

create table conversations (id uuid primary key, bot_id uuid,
                            session_id text, provider text, turns jsonb,
                            outcome text, extracted_cig jsonb,
                            quality_score int, created_at timestamptz);

create table patterns      (id uuid primary key, industry text,
                            cig jsonb, quality_score int, notes text,
                            use_count int, created_at timestamptz);

create table kb_chunks     (id uuid primary key, bot_id uuid,
                            text text, embedding vector(1536));
```

---

## CIG Industry templates (v0.2.0)

| Template | Key intents | Integrations |
|---|---|---|
| 💈 Hair salon | Explore services → Price → Book → Confirm | Calendar + Email |
| 🍽 Restaurant | Menu browse → Reserve table → Confirm | Calendar + Email |
| 🦷 Clinic / dental | New/returning → Treatments → Insurance → Book | Calendar + Email |
| 🏋 Gym *(coming)* | Classes → Memberships → Trial booking | — |
| 📚 Tutor *(coming)* | Subjects → Trial lesson → Regular booking | — |

---

## v0.2.0 — Screen illustrations

### App shell
```
┌──────────────────────┬──────────────────────────────────────────────────┐
│  BotStudio [🍋]      │  [Contextual topbar]                              │
│  ─────────────────── │  ────────────────────────────────────────────── │
│  DESIGN              │                                                  │
│  ✍ Conversation design│                                                  │
│  ◈ Review & approve  │         ACTIVE SCREEN                            │
│  📋 Gather knowledge │                                                  │
│  BUILD               │                                                  │
│  ○ Bot identity      │                                                  │
│  ⋮ Flow builder      │                                                  │
│  📄 Knowledge base   │                                                  │
│  RUN                 │                                                  │
│  ▶ Preview           │                                                  │
│  🎧 Agent assist     │                                                  │
│  ⊞ Dashboard         │                                                  │
│  MEASURE             │                                                  │
│  ∿ Analytics         │                                                  │
│  ⬡ Integrations      │                                                  │
│  PLATFORM            │                                                  │
│  ⚙ Settings          │                                                  │
│  ─────────────────── │                                                  │
│  ● Coco       LIVE   │                                                  │
│  v0.2.0  ● SB+GD     │                                                  │
└──────────────────────┴──────────────────────────────────────────────────┘
```

### Conversation design (new in v0.2.0)
```
┌──────────────────────────────────────────────────────────────────────┐
│  ✍️ Describe it  │  💬 Show a conversation  │  ⚡ Template  │  🎨 Chat │
├──────────────────────────────────────────────────────────────────────┤
│  Hair salon [selected]  Restaurant  Clinic  Gym  Tutor  Custom       │
│                                                                      │
│  [Use Hair salon design →]   Instant · built from 400+ real bots    │
└──────────────────────────────────────────────────────────────────────┘
```

### Review & approve (CIG + three panels)
```
┌──────────────────────────────────────────────────────────────────────┐
│  INTENT GRAPH: Hair Salon Booking                                    │
│  [Greet]→[Explore]→[Price]→[Book]→[Confirm]→[End]                   │
│                   ↓        ↓        ↓                                │
│              [Duration] [Duration] [No slots]                        │
│  [Open Q&A]→[Escalate]                                               │
├──────────────────┬──────────────────┬───────────────────────────────┤
│ 💬 Script        │ ⋮ Intent flow    │ 📋 Requirements               │
│ Coco: "Hi!"      │ ● Greet          │ □ Price list     [Upload]     │
│ User: "Services?"│ ● Explore (KB)   │ □ Google Cal     [Connect]    │
│ Coco: "We offer…"│ ● Price (KB)     │ □ Email          [Connect]    │
│ User: "Book Sat?"│ ● Book (API)     │ □ FAQ/policies   [Skip]       │
│ Coco: "1pm free" │ ● Confirm (API)  │                               │
│ User: "1pm, Sarah"│ ● End           │                               │
│ Coco: "Booked! ✓"│                  │ [Gather →]                    │
└──────────────────┴──────────────────┴───────────────────────────────┘
```

### Settings (v0.2.0)
```
┌──────────────────────────────────────────────────────────────────────┐
│  CLOUD STORAGE                                                       │
│  ┌─── Supabase ────────────────────────────────── ● Connected ─┐    │
│  │  [Project URL]  [Anon key]  [Test connection →]              │    │
│  │  Result: "Connected — 3 bot(s) found"                        │    │
│  └──────────────────────────────────────────────────────────────┘    │
│  ┌─── Google Drive ─────────────────────── ○ Not connected ────┐    │
│  │  [OAuth Client ID]  [G Connect Google]                       │    │
│  │  Setup guide with your exact redirect URI                    │    │
│  └──────────────────────────────────────────────────────────────┘    │
│  AI / LLM                                                            │
│  [Gemini 2.0 Flash ●] [Claude 3.5]  Key: [***]  Proxy: [https://…]  │
│  [●] Enable AI responses in Preview                                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Roadmap

```
DONE (v0.2.0)                   NEXT
─────────────────────────────   ─────────────────────────────────
✓ CIG engine (3 templates)      □ RAG pipeline (pgvector search)
✓ Conversational design wizard  □ Real Google Calendar in emulator
✓ LLM: Claude + Gemini          □ Supabase Auth login flow
✓ Supabase + Google Drive       □ Gym + Tutor CIG templates
✓ Web widget (shadow DOM)       □ Analytics from real conversations
✓ Node.js API (Fastify + WS)    □ Pattern library from real data
✓ Google Calendar integration   □ Voice channel (Twilio/LiveKit)
✓ Booking confirmation emails   □ Enterprise: SSO, RBAC, audit log
✓ Direct share link page        □ Marketplace: community templates
✓ Publish screen + embed code
✓ Restaurant + Clinic CIGs
```

---

*README updated each release. App version shown bottom-left of sidebar.*
