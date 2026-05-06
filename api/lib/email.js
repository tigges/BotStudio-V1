import { Resend } from 'resend';

let _resend = null;
function resend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

/* ─── Booking confirmation ──────────────────────────────────────────────────── */
export async function sendBookingConfirmation({ to, booking, bot }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email');
    return;
  }

  const from     = process.env.EMAIL_FROM || 'Coco <noreply@botstudio.io>';
  const botName  = bot?.config?.displayName || bot?.config?.name || 'Your assistant';
  const bizName  = bot?.config?.businessName || 'us';

  const html = `
  <!DOCTYPE html>
  <html><head><meta charset="UTF-8">
  <style>
    body { font-family: 'DM Sans', sans-serif; background: #f4f5f9; margin: 0; padding: 20px; }
    .card { background: white; border-radius: 12px; padding: 28px 32px; max-width: 480px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 24px; }
    .avatar { width: 52px; height: 52px; background: #fef9c3; border-radius: 14px; font-size: 28px;
              display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px; }
    h1 { font-size: 20px; color: #1a1d2e; margin: 0 0 4px; }
    p.sub { color: #6b7280; font-size: 13px; margin: 0; }
    .booking-box { background: #f8f9fc; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 7px 0;
           border-bottom: 1px solid #f0f2f7; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .value { color: #1a1d2e; font-weight: 500; }
    .ref { display: inline-block; background: #eef2fd; color: #2255e8; border-radius: 6px;
           padding: 3px 10px; font-size: 12px; font-weight: 600; font-family: monospace; }
    .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #9ca3af; }
    .cta { display: block; text-align: center; background: #2255e8; color: white; border-radius: 8px;
           padding: 12px; text-decoration: none; font-size: 13px; font-weight: 600; margin-top: 16px; }
  </style>
  </head>
  <body>
  <div class="card">
    <div class="header">
      <div class="avatar">🍋</div>
      <h1>Booking confirmed!</h1>
      <p class="sub">See you soon at ${bizName}</p>
    </div>
    <div class="booking-box">
      <div class="row"><span class="label">Name</span><span class="value">${booking.customerName}</span></div>
      <div class="row"><span class="label">Service</span><span class="value">${booking.service}</span></div>
      <div class="row"><span class="label">Date & time</span><span class="value">${booking.dateLabel}</span></div>
      ${booking.duration ? `<div class="row"><span class="label">Duration</span><span class="value">~${booking.duration}</span></div>` : ''}
      ${booking.price ? `<div class="row"><span class="label">Price</span><span class="value">${booking.price}</span></div>` : ''}
      <div class="row"><span class="label">Reference</span><span class="value"><span class="ref">${booking.ref}</span></span></div>
    </div>
    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bot?.config?.address || bizName)}" class="cta">
      Get directions →
    </a>
    <div class="footer">
      <p>Booked via ${botName} · <a href="#" style="color:#9ca3af">Cancellation policy</a></p>
      <p>To cancel or reschedule, reply to this email or message ${botName} again.</p>
    </div>
  </div>
  </body></html>`;

  await resend().emails.send({
    from,
    to,
    subject: `Booking confirmed — ${booking.service} at ${bizName}`,
    html,
  });
}

/* ─── Escalation alert to owner ─────────────────────────────────────────────── */
export async function sendEscalationAlert({ ownerEmail, conversation, bot }) {
  if (!process.env.RESEND_API_KEY || !ownerEmail) return;

  const from    = process.env.EMAIL_FROM || 'Coco <noreply@botstudio.io>';
  const botName = bot?.config?.displayName || 'Coco';
  const last3   = conversation.turns.slice(-3).map(t =>
    `${t.role === 'user' ? 'Customer' : botName}: ${t.content}`).join('\n');

  await resend().emails.send({
    from,
    to: ownerEmail,
    subject: `${botName} needs your help — customer waiting`,
    text: `A customer needs assistance that ${botName} couldn't resolve.\n\nLast messages:\n${last3}\n\nSession: ${conversation.id}`,
  });
}
