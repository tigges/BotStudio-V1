import { google } from 'googleapis';

/* ─── OAuth client (one per request using stored token) ─────────────────────── */
function oauthClient(tokens) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  if (tokens) client.setCredentials(tokens);
  return client;
}

/* ─── Get available slots for a date range ──────────────────────────────────── */
export async function getAvailableSlots({ calendarId, tokens, daysAhead = 7, slotMinutes = 60 }) {
  const auth     = oauthClient(tokens);
  const calendar = google.calendar({ version: 'v3', auth });

  const now    = new Date();
  const end    = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  /* get existing events */
  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin: now.toISOString(),
      timeMax: end.toISOString(),
      items:   [{ id: calendarId || 'primary' }],
    },
  });
  const busy = (data.calendars?.[calendarId || 'primary']?.busy || [])
    .map(b => ({ start: new Date(b.start), end: new Date(b.end) }));

  /* generate candidate slots (09:00–18:00, Mon–Sat) */
  const slots = [];
  const cursor = new Date(now);
  cursor.setMinutes(0, 0, 0);
  cursor.setHours(cursor.getHours() + 1); /* start from next full hour */

  while (cursor < end && slots.length < 12) {
    const dow = cursor.getDay();
    const hr  = cursor.getHours();

    if (dow !== 0 /* Sunday */ && hr >= 9 && hr < 18) {
      const slotEnd = new Date(cursor.getTime() + slotMinutes * 60 * 1000);
      const isFree  = !busy.some(b => cursor < b.end && slotEnd > b.start);

      if (isFree) {
        slots.push({
          start:    cursor.toISOString(),
          end:      slotEnd.toISOString(),
          label:    cursor.toLocaleString('en-GB', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }),
          dayLabel: cursor.toLocaleString('en-GB', { weekday:'long', day:'numeric', month:'long' }),
          timeLabel:cursor.toLocaleString('en-GB', { hour:'2-digit', minute:'2-digit' }),
        });
      }
    }
    cursor.setMinutes(cursor.getMinutes() + 30);
  }
  return slots;
}

/* ─── Create a booking ──────────────────────────────────────────────────────── */
export async function createBooking({ calendarId, tokens, booking }) {
  const auth     = oauthClient(tokens);
  const calendar = google.calendar({ version: 'v3', auth });

  const { data: event } = await calendar.events.insert({
    calendarId: calendarId || 'primary',
    requestBody: {
      summary:     `${booking.service} — ${booking.customerName}`,
      description: [
        `Customer: ${booking.customerName}`,
        `Contact:  ${booking.customerEmail || booking.customerPhone || '—'}`,
        `Service:  ${booking.service}`,
        `Ref:      ${booking.ref}`,
        booking.notes ? `Notes: ${booking.notes}` : '',
      ].filter(Boolean).join('\n'),
      start: { dateTime: booking.startTime, timeZone: booking.timeZone || 'Europe/London' },
      end:   { dateTime: booking.endTime,   timeZone: booking.timeZone || 'Europe/London' },
      attendees: booking.customerEmail ? [{ email: booking.customerEmail }] : [],
      reminders: {
        useDefault: false,
        overrides:  [{ method: 'email', minutes: 60 * 24 }, { method: 'popup', minutes: 60 }],
      },
    },
  });
  return event;
}

/* ─── OAuth: generate auth URL ──────────────────────────────────────────────── */
export function getAuthUrl(botId) {
  const client = oauthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope:       ['https://www.googleapis.com/auth/calendar'],
    state:       botId,
    prompt:      'consent',
  });
}

/* ─── OAuth: exchange code for tokens ──────────────────────────────────────── */
export async function exchangeCode(code) {
  const client         = oauthClient();
  const { tokens }     = await client.getToken(code);
  return tokens;
}
