/**
 * Chat route — handles both REST (POST /api/chat) and WebSocket (/api/chat/ws)
 * Supports: LLM responses, calendar booking, conversation logging
 */

import { getBotByKey, createConversation, appendTurn, closeConversation } from '../lib/db.js';
import { callLLM, buildSystemPrompt } from '../lib/llm.js';
import { getAvailableSlots, createBooking } from '../lib/calendar.js';
import { sendBookingConfirmation, sendEscalationAlert } from '../lib/email.js';

/* ─── Intent detection from LLM response ────────────────────────────────────── */
const BOOKING_SIGNALS = [/\bbook\b/i, /appoint/i, /reserv/i, /schedul/i, /slot/i];
const SLOT_SIGNALS    = [/saturday|sunday|monday|tuesday|wednesday|thursday|friday/i, /\bwhen\b.*\bcome\b/i, /availab/i];
const CONFIRM_SIGNALS = [/\byes\b/i, /confirm/i, /\bok\b/i, /perfect/i, /book it/i, /\bgo ahead\b/i];
const ESCALATE_SIGNALS= [/speak.*human/i, /real person/i, /manager/i, /help.*can't/i];

function detectIntent(text) {
  if (CONFIRM_SIGNALS.some(r  => r.test(text))) return 'confirm';
  if (BOOKING_SIGNALS.some(r  => r.test(text))) return 'booking';
  if (SLOT_SIGNALS.some(r     => r.test(text))) return 'availability';
  if (ESCALATE_SIGNALS.some(r => r.test(text))) return 'escalate';
  return 'general';
}

function genRef(prefix = 'BOT') {
  return `#${prefix}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

/* ─── Core chat handler (shared by REST + WS) ───────────────────────────────── */
/* demo bot config — used when embed key isn't in DB yet */
const DEMO_BOT = {
  id: 'demo',
  config: {
    displayName: 'Coco',
    name: 'Coco',
    businessName: 'Yuzu Hair & Beauty',
    address: '5 Dickens Yard, Ealing, W5 2TD',
    tone: 'Friendly',
    lang: 'English',
    llmProvider: 'gemini',
  },
  kb_text: `Yuzu Hair & Beauty — 5 Dickens Yard, Ealing W5 2TD
Hours: Tuesday-Friday 10am-8pm, Saturday 9am-6pm. Closed Monday & Sunday.

SENIOR STYLIST PRICES
Ladies Wash Cut & Style: £87 (60min) | Gents Wash Cut & Style: £58 (45min)
Kids (12 & under): £29 | Teen Boys (13-16): £41 | Teen Girls (13-16): £52
Blowdry: £58 | Full Head Colour: £101 | Roots: £88 | Illumina: £133
Full Highlights/Balayage: £150 | Half Head: £115 | T-Section: £89
Pre-lighten Full: £179 | Toner: £38 | Blending: £41 | Long hair extra: +£41

NEXT GEN STYLIST PRICES
Ladies Wash Cut & Style: £58 | Kids: £23 | Teens: £35 | Blowdry: £41
Full Head Colour: £87 | Roots: £75 | Full Highlights: £98 | Half: £75 | T-Section: £64

TREATMENTS: Nashi Filler Express £33 | Filler 1,2,3 £46
K2.0 Keratin: Short £41 | Medium £52 | Long £64 | Extra long £75
Aura Smoothing (3-4 months): Short £117-165 | Above shoulder £228 | Below shoulder £294 | Long £357

PACKAGES: 4 Blowdrys £156 (6 months) | 4 Roots for price of 3: £264 (16 weeks)

CLIENT ROUTING — DO THIS BEFORE ANYTHING ELSE
When a customer first asks about services, prices, or booking — before showing any list — ask exactly this one question:
"Just to make sure I show you the right options — is this for a lady, gentleman, or child/teen?"
Then show ONLY the relevant section:
  Lady/female  → Ladies Cut (£87/£58), Blowdry, Colour, Highlights, Treatments
  Gent/male    → Gents Cut £58 (Senior), mention colour if they ask
  Child/teen   → Kids (12 & under): £29/£23 · Teen Boys: £41/£35 · Teen Girls: £52/£35
If they say "myself" or use a gender pronoun — infer and proceed without asking again.
Once you know — carry it through the whole conversation. Never ask again.
If they explicitly ask to see everything — then show all categories.`,
  cig: { name: 'Hair Salon Booking', industry: 'hair-beauty' },
};

async function handleMessage({ botKey, sessionId, message, history = [], sessionData = {} }) {
  let bot = null;
  try { bot = await getBotByKey(botKey); } catch (e) { console.warn('[chat] DB lookup failed:', e.message); }
  if (!bot) bot = DEMO_BOT; /* fall back to demo config */

  const config  = bot.config  || {};
  const intent  = detectIntent(message);
  let   reply   = '';
  let   chips   = [];
  let   action  = null;

  /* ─── Slot request ─────────────────────────────────────────────────────── */
  if (intent === 'availability' && bot.calendar_tokens) {
    try {
      const slots = await getAvailableSlots({
        calendarId: bot.calendar_id || 'primary',
        tokens:     bot.calendar_tokens,
        slotMinutes: sessionData.serviceDuration || 60,
      });
      if (slots.length) {
        const topSlots = slots.slice(0, 3);
        reply  = `I have these slots available:\n\n${topSlots.map(s => `📅 **${s.dayLabel}** at **${s.timeLabel}**`).join('\n')}\n\nWhich works for you?`;
        chips  = topSlots.map(s => s.label);
        action = { type: 'slots', slots: topSlots };
      } else {
        reply = `I don't have any slots free in the next week. Would you like to join the waitlist?`;
        chips = ['Join waitlist', 'Try next week'];
      }
    } catch (e) {
      console.warn('[chat] Calendar error:', e.message);
      /* fall through to LLM */
    }
  }

  /* ─── Booking confirmation ─────────────────────────────────────────────── */
  if (intent === 'confirm' && sessionData.pendingSlot && bot.calendar_tokens) {
    try {
      const ref     = genRef(config.refPrefix || 'BOT');
      const booking = {
        customerName:  sessionData.customerName || 'Guest',
        customerEmail: sessionData.customerEmail,
        service:       sessionData.service      || 'Appointment',
        startTime:     sessionData.pendingSlot.start,
        endTime:       sessionData.pendingSlot.end,
        dateLabel:     sessionData.pendingSlot.label,
        ref,
      };

      const event = await createBooking({
        calendarId: bot.calendar_id || 'primary',
        tokens:     bot.calendar_tokens,
        booking,
      });

      if (booking.customerEmail) {
        await sendBookingConfirmation({ to: booking.customerEmail, booking, bot }).catch(console.warn);
      }

      reply  = `**Booked!** 🎉\n\n${booking.service} · ${booking.dateLabel}\nRef: **${ref}**\n\n${booking.customerEmail ? 'Confirmation sent to your email.' : 'See you then!'}`;
      chips  = ['Add to calendar', 'Get directions'];
      action = { type: 'confirmed', booking, eventId: event?.id };
    } catch (e) {
      console.warn('[chat] Booking error:', e.message);
      reply = `Sorry, I couldn't complete the booking — ${e.message}. Please call us directly.`;
    }
  }

  /* ─── Escalation ───────────────────────────────────────────────────────── */
  if (intent === 'escalate') {
    if (config.ownerEmail) {
      await sendEscalationAlert({ ownerEmail: config.ownerEmail, conversation: { id: sessionId, turns: history }, bot }).catch(console.warn);
    }
    reply = `Of course — I'll flag this for the team. Someone will get back to you shortly. Can I take your name and best contact?`;
    chips = ['Call us instead'];
    action = { type: 'escalated' };
  }

  /* ─── LLM call (default path) ──────────────────────────────────────────── */
  if (!reply) {
    const kbContext = bot.kb_text || '';
    const system    = buildSystemPrompt(bot, kbContext);
    const messages  = [
      ...history.slice(-14).map(t => ({ role: t.role === 'bot' ? 'assistant' : 'user', content: t.content })),
      { role: 'user', content: message },
    ];

    reply = await callLLM({
      messages,
      system,
      maxTokens: 600,
      provider:  config.llmProvider || 'gemini',
    });
  }

  return { reply, chips, action };
}

/* ─── REST route ────────────────────────────────────────────────────────────── */
export async function chatRestRoute(fastify) {
  fastify.post('/api/chat', async (req, reply) => {
    const { botKey, sessionId, message, history, sessionData } = req.body;
    if (!botKey || !message) return reply.code(400).send({ error: 'botKey and message required' });

    try {
      const result = await handleMessage({ botKey, sessionId, message, history, sessionData });

      /* log turn to DB */
      if (sessionId) {
        await appendTurn(sessionId, { role: 'user',      content: message        }).catch(() => {});
        await appendTurn(sessionId, { role: 'assistant', content: result.reply   }).catch(() => {});
      }

      return reply.send(result);
    } catch (e) {
      fastify.log.error(e);
      return reply.code(500).send({ error: e.message });
    }
  });
}

/* ─── WebSocket route ───────────────────────────────────────────────────────── */
export async function chatWsRoute(fastify) {
  fastify.get('/api/chat/ws', { websocket: true }, async (socket, req) => {
    const botKey  = req.query.botKey;
    const history = [];
    let   convId  = null;
    const sessionData = {};

    /* create conversation record */
    try {
      const bot  = await getBotByKey(botKey);
      if (bot) {
        const conv = await createConversation({ bot_id: bot.id, session_id: `ws-${Date.now()}`, provider: 'live' });
        convId = conv?.id;
      }
    } catch (_) {}

    /* send greeting */
    const bot     = await getBotByKey(botKey);
    const greeting = bot?.config?.greeting || `Hi! I'm ${bot?.config?.displayName || 'your assistant'}. How can I help?`;
    socket.send(JSON.stringify({ type: 'message', role: 'bot', text: greeting, chips: ['Book appointment', 'See services', 'Ask a question'] }));

    socket.on('message', async (raw) => {
      let payload;
      try { payload = JSON.parse(raw.toString()); } catch { return; }

      if (payload.type === 'message') {
        const { text, sessionData: sd } = payload;
        Object.assign(sessionData, sd || {});

        /* typing indicator */
        socket.send(JSON.stringify({ type: 'typing' }));

        history.push({ role: 'user', content: text });
        if (convId) appendTurn(convId, { role: 'user', content: text }).catch(() => {});

        try {
          const result = await handleMessage({ botKey, sessionId: convId, message: text, history, sessionData });
          history.push({ role: 'bot', content: result.reply });
          if (convId) appendTurn(convId, { role: 'assistant', content: result.reply }).catch(() => {});

          socket.send(JSON.stringify({
            type:   'message',
            role:   'bot',
            text:   result.reply,
            chips:  result.chips  || [],
            action: result.action || null,
          }));

          if (result.action?.type === 'escalated' && convId) {
            closeConversation(convId, 'escalated').catch(() => {});
          }
        } catch (e) {
          socket.send(JSON.stringify({ type: 'error', text: `Sorry, something went wrong. (${e.message})` }));
        }
      }

      if (payload.type === 'close') {
        if (convId) closeConversation(convId, 'completed').catch(() => {});
      }
    });

    socket.on('close', () => {
      if (convId) closeConversation(convId, 'abandoned').catch(() => {});
    });
  });
}
