# BotStudio

> B2B Chatbot Management Platform — single-file concept prototype.

**Live demo:** https://tigges.github.io/BotStudio-V1/
**Repo:** https://github.com/tigges/BotStudio-V1

---

## Releases

| Version | Type | Date | Notes |
|---|---|---|---|
| **v0.1.0** | Concept prototype | May 2026 | Single-file HTML/CSS/JS. All screens illustrated, interactive. No backend. |

> Each release bumps the version number displayed in the app sidebar (bottom-left) and updates the illustrations below.

---

## v0.1.0 — Current build

Single file: `botstudio.html` · No framework · No build step · DM Sans · `#2255e8` accent

### App shell

```
┌─────────────────────────────────────────────────────────────────────┐
│  BotStudio [🤖]   │  [Contextual topbar — changes per screen]       │
│  ─────────────── │  ─────────────────────────────────────────────── │
│  BUILD            │                                                   │
│  ○ Bot setup      │                                                   │
│  ⋮ Flow builder   │           ACTIVE SCREEN CONTENT                  │
│  ▶ Emulator       │                                                   │
│  📄 Knowledge base│                                                   │
│  OPERATE          │                                                   │
│  🎧 Agent assist  │                                                   │
│  ⊞ Dashboard      │                                                   │
│  MEASURE          │                                                   │
│  ∿ Analytics      │                                                   │
│  ⬡ Integrations   │                                                   │
│  ─────────────── │                                                   │
│  ● Support Bot  LIVE    │                                            │
│  ● Sales Asst  PAUSED   │                                            │
│  ○ Onboarding  DRAFT    │                                            │
│  [+ New bot]            │                                            │
│  ─────────────────────  │                                            │
│  v0.1.0  Concept build  │                                            │
└─────────────────────────┴──────────────────────────────────────────── ┘
```

### Dashboard

```
┌──────────────────────────────────────────────────────────────────────┐
│ Dashboard                          Last 7 days ▾   [Export] [Refresh]│
├────────────┬────────────┬───────────────┬────────────────────────────┤
│  2,841     │  87.4%     │  1.3s         │  19                        │
│  Convos    │  Resolution│  Avg Response │  Active Sessions            │
│  ↑18%      │  ↑4.1%     │  ↓0.8s        │  ↑6                        │
│  ∿∿∿∿∿∿∿   │  ∿∿∿∿∿∿∿   │  ∿∿∿∿∿∿∿      │  ∿∿∿∿∿∿∿   (Canvas spark) │
├────────────┴────────────┴───────────────┴────────────────────────────┤
│ Agent Status                        │ Activity Log                   │
│ ● Alice M.  Online  47 handled  ★4.8│ ℹ New conversation — Sarah M. │
│ ● Ben K.    Busy    31 handled  ★4.6│ ✓ Bot resolved billing query  │
│ ● Clara R.  Busy    28 handled  ★4.9│ ! Agent missed SLA            │
│ ● David W.  Online  55 handled  ★4.7│ ⬡ Flow published v2.1         │
│ ○ Elena S.  Offline  0 queue   ★4.5 │ ✕ 3 convos escalated          │
├─────────────────────────────────────┤ ℹ KB retrained — 42 docs       │
│ Top Intents (Canvas bar chart)      │ ✓ Salesforce sync complete     │
│ Password Reset ████████████  38%    └────────────────────────────────┘
│ Billing       █████████     29%
│ Feature Q     ███████       22%
└─────────────────────────────────────┘
```

### Quick-start wizard  (`+ New bot`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [← Cancel]  New Bot  │ ①Business › ②Services › ③Hours › ④Notifs│Save│
├────────────────┬───────────────────────────┬────────────────────────┤
│  LIVE PREVIEW  │  STEPS                    │  CHECKLIST             │
│  ┌──────────┐  │  ┌────────────────────┐   │  ✓ Business details    │
│  │ 🤖 Aria  │  │  │▶ 1 · Business      │   │  □ Services defined    │
│  │ ● Online │  │  │  Name · industry · │   │  □ Hours configured    │
│  ├──────────┤  │  │  description       │   │  □ Notifications set   │
│  │🤖 Hi! I'm│  │  │  [Next →]          │   │  □ Test conversation   │
│  │  Aria.   │  │  ├────────────────────┤   │  □ Review prompt       │
│  │u What    │  │  │  2 · Services      │   ├────────────────────────┤
│  │  can you │  │  │  (collapsed)       │   │  🔒 GO LIVE (locked)   │
│  │  cover?  │  │  ├────────────────────┤   │  Complete all steps    │
│  │🤖 I help │  │  │  3 · Hours         │   │  to unlock deploy      │
│  │  with …  │  │  ├────────────────────┤   │  [Deploy bot →]        │
│  └──────────┘  │  │  4 · Notifications │   └────────────────────────┘
│  (updates live │  └────────────────────┘
│   as you type) │   Sidebar nav = MUTED during wizard
└────────────────┴──────────────────────────────────────────────────────┘
```

### Bot setup

```
┌──────────────────────────────────────────────────────────────────────┐
│ Bot Setup  [Support Bot ▾]                [Save changes] [Deploy →]  │
├──────────────────────────┬───────────────────────────────────────────┤
│  IDENTITY                │  GUARDRAILS                               │
│  Bot name:  Support Bot  │  Avoid topics: Politics, competitors…     │
│  Display:   Aria         │  Escalate on:  negative_sentiment…        │
│  Avatar: 🤖 🧠 💬 🌟…  │  Max turns:   6                           │
│  Language:  English ▾    │  Fallback msg: [textarea]                 │
│  Tone: [Friendly] Prof.  │                                           │
├──────────────────────────┼───────────────────────────────────────────┤
│  SYSTEM PROMPT           │  CHANNELS                                 │
│  [You are a helpful…]    │  🌐 Web Widget    ● ON                    │
│  chars: 68   [+Var]      │  🔌 REST API      ● ON                    │
│                          │  💜 Slack         ○ off                   │
│                          │  🔷 Teams         ○ off                   │
│                          │  📱 WhatsApp      ○ off                   │
├──────────────────────────┴───────────────────────────────────────────┤
│  GENERATED SYSTEM PROMPT  (read-only · rebuilds live as you type)    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ You are Aria, a friendly AI assistant… IDENTITY / GUARDRAILS  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Flow builder — Flow view

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Flow] [Journey]   Support Bot ▾   [↩][↪]   100%   [Test] [Publish] │
├─────────────┬─────────────────────────────────────┬──────────────────┤
│  PALETTE    │  · · dot-grid canvas · · · · · · ·  │  INSPECTOR       │
│  ▶ Start    │  · · ┌──────┐  ┌──────────────┐ · · │  [M] Welcome Msg │
│  M Message  │  · · │  ▶   │→→│ M Welcome Msg│ · · │  message node #2 │
│  ? Condition│  · · └──────┘  └──────┬───────┘ · · │  Label: [      ] │
│  A Action   │  · · · · · · ┌────────▼───────┐ · · │  Desc:  [      ] │
│  ⏱ Delay   │  · · · · · · │ ? Intent Check │ · · │  Connections (2) │
│  ■ End      │  · · · · · · └──┬──────────┬──┘ · · │  → Node #3       │
│  ─────────  │  ·FAQ· ·· ·Human│ ·· ·· ·· │· · · · │  ← Node #1       │
│  My nodes   │  ┌──────────┐  ┌─────────┐· · · · · │  X [370] Y [180] │
│  Custom +   │  │M FAQ Reply│  │A→ Agent │· · · · · │                  │
└─────────────┘  └─────┬─────┘  └────┬────┘·nodes   └──────────────────┘
                        └──────┬──────┘   drag freely
                            ┌──▼──┐
                            │  ■  │
                            └─────┘
```

### Flow builder — Journey view

```
┌──────────────────────────────────────────────────────────────────────┐
│         Awareness    Consideration    Decision    Onboarding   Growth │
├─────────┼────────────┼────────────────┼───────────┼────────────┼─────┤
│ Emotion │ 😐 Neutral │ 🤔 Curious      │ 😊 Hopeful │ 😅 Unsure  │ 😄  │
│ Channel │ Organic    │ Ads/retarget   │ Demo bot  │ Support   │Nudge│
│ Drop-off│ 12% ████   │ 8% ██          │ 22% █████ │ 6% █      │ 3%  │
│ Opps    │[Personalise│[FAQ bot]       │[Live chat]│[Tour]     │[Ups]│
└─────────┴────────────┴────────────────┴───────────┴────────────┴─────┘
```

### Agent assist

```
┌──────────────────────────────────────────────────────────────────────┐
│ Agent Assist  [All bots ▾] [Open ▾]                  ● 3 Live [Online]│
├───────────────┬──────────────────────────────┬───────────────────────┤
│  INBOX        │  THREAD: Sarah M.            │  AI SUGGESTIONS  GPT4o│
│  ● Sarah M. ◄ │  🤖 Hi Sarah! How can I help?│  "Check spam folder?" │
│  2m · 2 unread│  u  Need password reset      │  ░░░░░░░░░░░░ 92%     │
│  James K.     │  🤖 Confirm your email?      │                       │
│  8m · slack   │  u  sarah.m@email.com        │  "Resend to alt addr?"│
│  Priya R.     │  🤖 Found account…           │  ░░░░░░░░░░  85%      │
│  1h · bot     │  u  Didn't get the email     │                       │
│  ✓ Tom W.     │  🤖 Escalating…              │  "Manually reset creds"│
│  ✓ Emma L.    │  👤 Hi Sarah, I'm Alex.      │  ░░░░░░░░   71%       │
│               │  ─────────────────────────   │  📄 Password docs     │
│               │  [Reply][Note][Transfer]      │  📄 Email delivery    │
│               │  [Type a reply…]       [➤]   │  📄 Account FAQ       │
└───────────────┴──────────────────────────────┴───────────────────────┘
```

### Analytics

```
┌──────────────────────────────────────────────────────────────────────┐
│ Analytics                          Last 30 days ▾  [Export] [Schedule]│
├──────┬──────┬──────┬──────┬────────────────────────────────────────┤
│ 8,421│87.4% │ 1.3s │94.2% │  2,180 users  ·  23 min avg session    │
│ Convs│Res.  │ RT   │ CSAT │                                         │
├──────┴──────┴──────┴──────┴─────────────────────────────────────────┤
│ Volume (Canvas line chart)          │ Channels (Canvas donut)        │
│  ∿∿   ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿          │  ╭──╯8k╰──╮  ● Web  45%      │
│ Jan …………………………………… Dec             │  ╰─────────╯  ● API  30%      │
├─────────────────────────────────────┤               ● Slack 15%     │
│ Top Intents           │ Outcomes                    ● WA    10%     │
│ Password Reset ██ 38% │ Bot resolved   ████████ 62%                 │
│ Billing        █  29% │ Agent resolved █████    25%                 │
│ Feature Q      █  22% │ Abandoned      ██        9%                 │
└───────────────────────┴─────────────────────────────────────────────┘
```

### Integrations

```
┌──────────────────────────────────────────────────────────────────────┐
│ Integrations   [Search…]                       [Browse marketplace]  │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────┤
│ 💼 Salesforce│ 🎧 Zendesk   │ 📊 HubSpot   │ 💜 Slack     │ 🔷 Teams│
│ ● Connected  │ ● Connected  │ ○ Connect    │ ● Connected  │ ○ Connect│
├──────────────┼──────────────┼──────────────┼──────────────┼──────────┤
│ 📱 WhatsApp  │ 📦 Shopify   │ 🔔 PagerDuty │ 📈 Mixpanel  │ 🪝 Hooks │
│ ○ Connect    │ ● Connected  │ ○ Connect    │ ○ Connect    │● Connected│
└──────────────┴──────────────┴──────────────┴──────────────┴──────────┘
  Clicking Connect/Configure toggles state live (no reload)
```

### Emulator

```
┌──────────────────────────────────────────────────────────────────────┐
│ Emulator  [Support Bot ▾]             [Reset conversation] [Debug]   │
├──────────────────────────────────┬───────────────────────────────────┤
│  🤖 Aria · Support Bot  ● LIVE   │  Debug panel               [LIVE] │
│  ─────────────────────────────   │  INTENT RECOGNITION               │
│  🤖 Hi! I'm Aria…                │  Top intent    password_reset     │
│  u  hi, do you have time…        │  Confidence    0.94               │
│  🤖 Great question! Here's…      │  ALL INTENTS                      │
│                                  │  password_reset ████████████ 94%  │
│                                  │  account_access ████████     71%  │
│                                  │  FLOW PATH                        │
│                                  │  [Start]→[Welcome]→[Intent Check] │
│                                  │  →[FAQ Reply]                     │
│                                  │  SESSION  Turn 3/6  1m24s  en-US  │
│  [Type a message…]         [➤]  └───────────────────────────────────┘
└──────────────────────────────────┘
```

### Knowledge base

```
┌──────────────────────────────────────────────────────────────────────┐
│ Knowledge Base  [Search…]            [↑ Add source] [Train model]    │
├──────┬──────────────────┬──────┬───────┬──────────┬──────────┬───────┤
│      │ Name             │ Type │ Words │ Updated  │ Status   │ Train │
├──────┼──────────────────┼──────┼───────┼──────────┼──────────┼───────┤
│  📝  │ Product FAQ      │ TEXT │ 1,420 │ 2h ago   │● trained │ 100%  │
│  🔗  │ Pricing Page     │ URL  │   890 │ 1d ago   │● trained │ 100%  │
│  📄  │ Support Handbook │ PDF  │ 6,200 │ 3d ago   │● trained │ 100%  │
│  🔗  │ Release Notes    │ URL  │ 2,100 │ 5d ago   │⚠ training│  64%  │
│  📄  │ API Docs         │ PDF  │ 9,800 │ 1w ago   │○ pending │   0%  │
└──────┴──────────────────┴──────┴───────┴──────────┴──────────┴───────┘
  [Edit] [Retrain] [🗑] per row — Retrain animates 0→100% over 2s
```

---

## Roadmap — Building BotStudio for production

The concept prototype demonstrates the UI surface. Below is a prioritised plan for building the real product, with rationale for ordering.

---

### Strategic principle

```
  FOUNDATION          INTELLIGENCE          SCALE
  ──────────          ────────────          ─────
  Auth + infra   →    LLM runtime    →    Enterprise controls
  Bot runtime    →    RAG / KB       →    Marketplace
  Web widget     →    NLU + memory   →    Voice / multi-modal
  Agent handoff  →    A/B + testing  →    Compliance (GDPR / HIPAA)

  You cannot sell intelligence before the plumbing works.
  You cannot sell enterprise before intelligence is proven.
```

---

### Phase 0 — Infrastructure  `(pre-everything)`

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  WHAT                         WHY FIRST                         │
  ├──────────────────────────────────────────────────────────────────┤
  │  Multi-tenant auth            Every feature depends on identity  │
  │  (email + SSO skeleton)                                          │
  ├──────────────────────────────────────────────────────────────────┤
  │  Org / workspace model        B2B unit of sale is the org,       │
  │  (org → bots → users)         not the user                       │
  ├──────────────────────────────────────────────────────────────────┤
  │  Bot config API               Stores what the UI already shows:  │
  │  (CRUD: name/tone/channels)   name, tone, prompt, channels       │
  ├──────────────────────────────────────────────────────────────────┤
  │  Billing skeleton             Freemium → paid conversion         │
  │  (Stripe, seat + usage tiers) must be designed in from day 1     │
  └──────────────────────────────────────────────────────────────────┘

  Stack recommendation
  ─────────────────────────────────────────────────────────────────
  API         Node/Fastify or Python/FastAPI (thin, fast, typed)
  DB          Postgres (config) + Redis (sessions/queues)
  Auth        Clerk or Auth0 for speed; own it in v2
  Infra       Railway / Render to start; migrate to k8s at scale
```

---

### Phase 1 — Bot runtime + Web widget  `(ship something real)`

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  COMPONENT              DETAIL                                   │
  ├──────────────────────────────────────────────────────────────────┤
  │  Conversation engine    Turn-based state machine. Accepts        │
  │                         message → returns response + next state  │
  ├──────────────────────────────────────────────────────────────────┤
  │  LLM connector          OpenAI / Anthropic / Gemini with         │
  │  (pluggable provider)   hot-swap. System prompt from bot config. │
  ├──────────────────────────────────────────────────────────────────┤
  │  Web widget SDK         <script> embed, 8 KB, shadow DOM.        │
  │  (the product's         Connects via WebSocket to conversation   │
  │   shop window)          engine. Branded per bot.                 │
  ├──────────────────────────────────────────────────────────────────┤
  │  Session persistence    Store turns in Postgres. Powers         │
  │                         handoff context and analytics later.     │
  └──────────────────────────────────────────────────────────────────┘

  Message lifecycle (Phase 1)
  ──────────────────────────────────────────────────────────────────
  User types
      │
      ▼
  Widget  ──WebSocket──►  API gateway
                              │
                              ▼
                         Conversation engine
                              │   reads
                              ▼
                         Bot config (system prompt, guardrails, tone)
                              │   calls
                              ▼
                         LLM provider  (OpenAI / Claude / Gemini)
                              │
                              ▼
                         Response  ──WebSocket──►  Widget displays
```

---

### Phase 2 — Flow builder execution  `(structure over pure LLM)`

```
  Pure LLM is powerful but unpredictable in B2B support.
  Flows give ops teams deterministic control at key decision points.

  ┌──────────────────────────────────────────────────────────────────┐
  │  Node type       Runtime behaviour                               │
  ├──────────────────────────────────────────────────────────────────┤
  │  Message         Sends a literal or template-filled string       │
  │  Condition       Evaluates intent / entity / variable            │
  │  LLM Step        Calls the model with a scoped sub-prompt        │
  │  Action          Webhook call, CRM write, ticket create          │
  │  Handoff         Pushes session to agent queue                   │
  │  Delay           Inserts a typed pause (good for empathy beats)  │
  │  End             Closes conversation, triggers CSAT prompt       │
  └──────────────────────────────────────────────────────────────────┘

  Flow execution model
  ─────────────────────────────────────────────────
  each turn  →  load session state
              →  find current node
              →  execute node  (message / condition / LLM / action)
              →  evaluate transitions
              →  advance pointer
              →  persist state
              →  return response
```

---

### Phase 3 — Knowledge base with RAG  `(answers, not hallucinations)`

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  PIPELINE                                                        │
  │                                                                  │
  │  Source ingestion                                                │
  │  PDF / URL / plain text / Confluence / Notion sync              │
  │       │                                                          │
  │       ▼  chunk + embed                                           │
  │  Vector store  (pgvector in Postgres, or Pinecone for scale)    │
  │       │                                                          │
  │       ▼  at runtime: semantic search (top-k chunks)             │
  │  Retrieved context  ──injected into──►  LLM system prompt       │
  │       │                                                          │
  │       ▼                                                          │
  │  Grounded answer with citation  ──►  user                       │
  └──────────────────────────────────────────────────────────────────┘

  Key design decisions
  ─────────────────────────────────────────────────────────────────
  Chunk size       ~500 tokens with 10% overlap preserves context
  Embed model      text-embedding-3-small (cost) → ada-002 (quality)
  Rerank           Cross-encoder rerank top 20 → return top 3
  Citation UI      Show source doc + paragraph in widget bubble
  Staleness        Webhook-triggered re-embed on source update
```

---

### Phase 4 — Real-time agent assist  `(the retention feature)`

```
  This is what keeps enterprise customers. Pure bot is a cost save;
  agent + bot is a quality upgrade. Sell both together.

  ┌──────────────────────────────────────────────────────────────────┐
  │  INBOX SERVICE                                                   │
  │  WebSocket room per conversation.                                │
  │  Presence: bot / agent / user layers shown simultaneously.      │
  ├──────────────────────────────────────────────────────────────────┤
  │  HANDOFF PROTOCOL                                                │
  │  1. Bot detects trigger (low confidence / escalation intent)     │
  │  2. Pushes to agent queue with full context snapshot             │
  │  3. Agent accepts → bot goes silent but stays in thread          │
  │  4. Agent can @ the bot for a suggested reply mid-thread         │
  │  5. Agent resolves → bot can resume for CSAT + close            │
  ├──────────────────────────────────────────────────────────────────┤
  │  AI SUGGESTED REPLIES  (the actual AI-assist feature)           │
  │  On each new user message →                                      │
  │  embed message + conversation history →                          │
  │  retrieve KB context →                                           │
  │  generate 3 candidate replies with confidence scores →           │
  │  stream to agent panel →                                         │
  │  agent clicks to use / edits inline                              │
  ├──────────────────────────────────────────────────────────────────┤
  │  SLA TIMER                                                       │
  │  First response SLA + resolution SLA per tier.                  │
  │  Visual countdown in inbox. PagerDuty alert at 80%.             │
  └──────────────────────────────────────────────────────────────────┘

  Queue model
  ──────────────────────────────────────────────────────────────────
  Conversation
       │  triggers handoff
       ▼
  Priority queue  (Redis sorted set, score = urgency × age)
       │  agent pulls next
       ▼
  Lock  (prevent double-assign, TTL = 2 min, renews on activity)
       │  agent accepts
       ▼
  Active session  (WebSocket room, full history, bot shadow mode)
```

---

### Phase 5 — Analytics data pipeline  `(prove the ROI)`

```
  B2B buyers renew when they can see numbers. Build this before
  the sales call, not after the first churn.

  ┌──────────────────────────────────────────────────────────────────┐
  │  EVENT STREAM                                                    │
  │  Every turn emits an event:                                      │
  │  { org, bot, session, turn, intent, confidence,                 │
  │    resolved_by, duration, csat, escalated, channel }            │
  │       │                                                          │
  │       ▼  Kafka / Redis Streams                                   │
  │  Event consumer  ──writes──►  ClickHouse / TimescaleDB           │
  │       │                       (columnar, fast aggregation)       │
  │       ▼                                                          │
  │  Materialised views  (hourly roll-ups per org/bot/channel)      │
  │       │                                                          │
  │       ▼  REST API                                                │
  │  Analytics screens  (the ones already in the UI prototype)      │
  └──────────────────────────────────────────────────────────────────┘

  Metrics to expose at launch
  ─────────────────────────────────────────────────────────────────
  Containment rate       % resolved without human touch
  CSAT                   Post-conversation 1–5 rating
  Deflection value       (escalations avoided × avg handle time × $/hr)
  Intent accuracy        top intent confidence distribution
  Drop-off by node       where users abandon in a flow
  Agent utilisation      active / idle / queue depth over time
```

---

### Phase 6 — Enterprise controls  `(unlock the big contracts)`

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  FEATURE                  WHY ENTERPRISE DEMANDS IT              │
  ├──────────────────────────────────────────────────────────────────┤
  │  SSO / SAML 2.0           IT security requirement, not optional  │
  │  RBAC                     Separate builder / agent / admin roles │
  │  Audit log                Every config change, timestamped       │
  │  Data residency           EU / US data region selection          │
  │  GDPR tooling             Conversation delete, PII masking,      │
  │                           data export (DSAR) on demand           │
  │  HIPAA mode               No PII in LLM prompts, BAA signing     │
  │  Custom LLM endpoint      Bring-your-own Azure OpenAI or         │
  │                           private-hosted model                   │
  │  IP allowlist             Restrict dashboard access by CIDR      │
  │  SLA guarantees           99.9% uptime SLA in contract           │
  └──────────────────────────────────────────────────────────────────┘
```

---

### Phase 7 — Platform & marketplace  `(compounding moat)`

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  CAPABILITY               STRATEGIC VALUE                        │
  ├──────────────────────────────────────────────────────────────────┤
  │  Integration marketplace  3rd-party connectors sold/listed.      │
  │                           Revenue share. Network effect.         │
  ├──────────────────────────────────────────────────────────────────┤
  │  Public API + webhooks    Customers build on top. Switching cost │
  │                           rises with each integration they build.│
  ├──────────────────────────────────────────────────────────────────┤
  │  Fine-tuned models        Upload historical conversations →       │
  │                           domain-specific model. Huge retention. │
  ├──────────────────────────────────────────────────────────────────┤
  │  Voice channel            Twilio/LiveKit bridge. Same flows,     │
  │                           same KB, same analytics. ASR + TTS.   │
  ├──────────────────────────────────────────────────────────────────┤
  │  Proactive messaging      Bot initiates: "Your trial ends in     │
  │                           3 days. Can I help you upgrade?"       │
  ├──────────────────────────────────────────────────────────────────┤
  │  A/B flow testing         Split traffic across two flow          │
  │                           versions. Auto-pick winner by CSAT.    │
  └──────────────────────────────────────────────────────────────────┘
```

---

### Full roadmap on one page

```
QUARTER     PHASE              KEY DELIVERABLE              VERSION
──────────────────────────────────────────────────────────────────────
Q1 Yr 1     0 · Foundation     Auth · orgs · bot config API   0.2.0
            1 · Runtime        LLM connector · web widget      0.3.0

Q2 Yr 1     2 · Flows          Flow execution engine           0.4.0
            3 · KB / RAG       Vector search · citations       0.5.0

Q3 Yr 1     4 · Agent assist   Real-time inbox · handoff       0.6.0
                               AI suggested replies
            5 · Analytics      Event stream · dashboards        0.7.0

Q4 Yr 1     Polish + GTM       Beta customers · pricing         0.9.0
                               Security audit · docs
                                                                ──────
Q1 Yr 2     GA launch                                           1.0.0
                                                                ──────
Q2 Yr 2     6 · Enterprise     SSO · RBAC · audit · GDPR       1.1.0
Q3 Yr 2     7 · Platform       Marketplace · public API         1.2.0
Q4 Yr 2     Voice · A/B · fine-tune                            1.3.0
──────────────────────────────────────────────────────────────────────

CURRENT POSITION:  ▶  v0.1.0  (UI concept prototype)
                              all screens designed
                              zero backend
```

---

### What to build first — decision framework

```
  Build in this order when the time comes:

  1.  Auth + org model          (nothing else works without it)
  2.  Bot config CRUD           (lets the existing UI connect to real data)
  3.  LLM connector             (first "wow" moment for a test customer)
  4.  Web widget                (ships to a real page — proves the product)
  5.  Session persistence       (unlocks analytics and handoff)
  6.  Flow execution            (gives ops teams confidence in LLM outputs)
  7.  RAG / KB                  (reduces hallucinations, biggest trust lever)
  8.  Agent handoff + inbox     (biggest enterprise selling point)
  9.  Analytics pipeline        (proves ROI at renewal time)
  10. RBAC + SSO                (unlocks deal sizes > $50k ARR)

  Rule: don't start the next row until the current one is in production
        and has at least one paying customer using it.
```

---

*README and illustrations updated each release. App version shown bottom-left of sidebar.*
