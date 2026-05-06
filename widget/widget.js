/**
 * BotStudio Web Widget  v0.2.0
 * Embeds a live chat bot on any website with a single <script> tag.
 *
 * Usage:
 *   <script src="https://cdn.botstudio.io/widget.js"
 *     data-key="yuzu_live_a3f9d2"
 *     data-api="https://your-api.railway.app"
 *     data-name="Coco"
 *     data-color="#2255e8"
 *     data-position="bottom-right">
 *   </script>
 */

(function () {
  'use strict';

  /* ─── Config from script tag ────────────────────────────────────────────── */
  const script   = document.currentScript || document.querySelector('script[data-key]');
  const CFG = {
    botKey:   script?.dataset.key      || '',
    apiBase:  script?.dataset.api      || 'https://botstudio-api.railway.app',
    botName:  script?.dataset.name     || 'Assistant',
    color:    script?.dataset.color    || '#2255e8',
    position: script?.dataset.position || 'bottom-right',
    avatar:   script?.dataset.avatar   || '🍋',
    delay:    parseInt(script?.dataset.delay || '0', 10),
  };

  if (!CFG.botKey) { console.warn('[BotStudio] data-key missing — widget not loaded'); return; }

  /* ─── Styles ────────────────────────────────────────────────────────────── */
  const CSS = `
    :host { all: initial; font-family: 'DM Sans', system-ui, sans-serif; }

    .bs-bubble {
      position: fixed; ${CFG.position.includes('right') ? 'right:20px' : 'left:20px'};
      bottom: 20px; z-index: 2147483646;
      width: 52px; height: 52px; border-radius: 50%;
      background: ${CFG.color}; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; box-shadow: 0 4px 16px rgba(0,0,0,.2);
      transition: transform .2s, box-shadow .2s;
      border: none; outline: none;
    }
    .bs-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,.25); }
    .bs-bubble .bs-notif {
      position: absolute; top: -3px; right: -3px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #ef4444; border: 2px solid #fff;
      display: none;
    }
    .bs-bubble .bs-notif.show { display: block; }

    .bs-window {
      position: fixed; ${CFG.position.includes('right') ? 'right:16px' : 'left:16px'};
      bottom: 82px; z-index: 2147483646;
      width: 360px; max-height: 580px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,.18);
      display: flex; flex-direction: column; overflow: hidden;
      transform: scale(.92) translateY(12px); opacity: 0;
      transition: transform .22s cubic-bezier(.34,1.56,.64,1), opacity .18s;
      pointer-events: none;
    }
    .bs-window.open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }
    @media (max-width: 400px) {
      .bs-window { left: 0; right: 0; bottom: 0; width: 100%; max-height: 100vh; border-radius: 16px 16px 0 0; }
    }

    .bs-header {
      padding: 12px 14px; background: ${CFG.color};
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    .bs-avatar {
      width: 34px; height: 34px; background: rgba(255,255,255,.2);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    .bs-header-name { font-size: 14px; font-weight: 600; color: #fff; }
    .bs-header-sub  { font-size: 11px; color: rgba(255,255,255,.75); }
    .bs-close {
      margin-left: auto; background: transparent; border: none; color: rgba(255,255,255,.8);
      font-size: 18px; cursor: pointer; padding: 4px; line-height: 1; border-radius: 6px;
    }
    .bs-close:hover { background: rgba(255,255,255,.15); color: #fff; }

    .bs-messages {
      flex: 1; overflow-y: auto; padding: 14px 12px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f8f9fc; scroll-behavior: smooth;
    }
    .bs-msg { display: flex; align-items: flex-end; gap: 7px; }
    .bs-msg.user { flex-direction: row-reverse; }
    .bs-msg-av {
      width: 26px; height: 26px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; flex-shrink: 0;
      background: rgba(34,85,232,.12);
    }
    .bs-msg.user .bs-msg-av { background: #1a1d2e; color: #fff; font-size: 11px; font-weight: 600; }
    .bs-bubble-wrap { max-width: calc(100% - 40px); }
    .bs-text {
      padding: 9px 12px; border-radius: 12px; font-size: 13px; line-height: 1.5;
      word-break: break-word;
    }
    .bs-msg.bot  .bs-text { background: #fff; border: 1px solid #e5e7eb; border-bottom-left-radius: 4px; color: #1a1d2e; }
    .bs-msg.user .bs-text { background: ${CFG.color}; color: #fff; border-bottom-right-radius: 4px; }
    .bs-text strong { font-weight: 600; }
    .bs-text br { display: block; content: ''; margin: 2px 0; }

    .bs-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
    .bs-chip {
      padding: 4px 11px; border: 1.5px solid ${CFG.color};
      border-radius: 20px; font-size: 11px; color: ${CFG.color};
      background: #fff; cursor: pointer; font-family: inherit;
      transition: background .12s, color .12s;
    }
    .bs-chip:hover { background: ${CFG.color}; color: #fff; }

    .bs-typing {
      display: flex; gap: 4px; padding: 10px 14px;
      background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
      border-bottom-left-radius: 4px; width: fit-content;
    }
    .bs-typing span {
      width: 6px; height: 6px; border-radius: 50%; background: #9ca3af;
      animation: bs-blink 1.2s infinite;
    }
    .bs-typing span:nth-child(2) { animation-delay: .2s; }
    .bs-typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes bs-blink { 0%,80%,100%{opacity:.3} 40%{opacity:1} }

    .bs-input-area {
      padding: 10px 12px; background: #fff;
      border-top: 1px solid #e5e7eb; display: flex; gap: 7px; flex-shrink: 0;
    }
    .bs-input {
      flex: 1; padding: 8px 12px; border: 1.5px solid #e0e3ef;
      border-radius: 20px; font-size: 13px; font-family: inherit;
      outline: none; transition: border-color .15s;
    }
    .bs-input:focus { border-color: ${CFG.color}; }
    .bs-send {
      width: 34px; height: 34px; border-radius: 50%;
      background: ${CFG.color}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: opacity .12s;
    }
    .bs-send:hover { opacity: .85; }
    .bs-send svg { width: 14px; height: 14px; fill: white; }

    .bs-booking-card {
      background: #fff; border: 2px solid ${CFG.color}; border-radius: 12px;
      padding: 14px; margin-top: 6px; font-size: 12px;
    }
    .bs-booking-card .title { font-weight: 700; font-size: 14px; color: ${CFG.color}; margin-bottom: 10px; }
    .bs-booking-card .row   { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f0f2f7; }
    .bs-booking-card .row:last-of-type { border-bottom: none; }
    .bs-booking-card .label { color: #6b7280; }
    .bs-booking-card .value { font-weight: 600; color: #1a1d2e; }
    .bs-booking-card .ref   { font-family: monospace; background: #eef2fd; color: ${CFG.color}; padding: 2px 8px; border-radius: 4px; }
    .bs-powered { text-align: center; font-size: 10px; color: #9ca3af; padding: 6px 0 4px; }
    .bs-powered a { color: #9ca3af; text-decoration: none; }
  `;

  /* ─── HTML template ─────────────────────────────────────────────────────── */
  const HTML = `
    <button class="bs-bubble" id="bs-bubble" aria-label="Open chat">
      <span>${CFG.avatar}</span>
      <span class="bs-notif" id="bs-notif"></span>
    </button>
    <div class="bs-window" id="bs-window" role="dialog" aria-label="${CFG.botName} chat">
      <div class="bs-header">
        <div class="bs-avatar">${CFG.avatar}</div>
        <div>
          <div class="bs-header-name">${CFG.botName}</div>
          <div class="bs-header-sub" id="bs-status">● Online</div>
        </div>
        <button class="bs-close" id="bs-close" aria-label="Close">✕</button>
      </div>
      <div class="bs-messages" id="bs-messages"></div>
      <div class="bs-input-area">
        <input class="bs-input" id="bs-input" placeholder="Type a message…" autocomplete="off">
        <button class="bs-send" id="bs-send" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div class="bs-powered"><a href="https://botstudio.io" target="_blank">Powered by BotStudio</a></div>
    </div>
  `;

  /* ─── Shadow DOM mount ──────────────────────────────────────────────────── */
  const host = document.createElement('div');
  host.id    = 'botstudio-widget';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  const style  = document.createElement('style');
  style.textContent = CSS;
  shadow.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = HTML;
  shadow.appendChild(wrapper);

  /* ─── State ─────────────────────────────────────────────────────────────── */
  const $ = id => shadow.getElementById(id);
  const state = {
    open:        false,
    ws:          null,
    history:     [],
    sessionData: {},
    typing:      false,
    connected:   false,
  };

  /* ─── DOM refs ──────────────────────────────────────────────────────────── */
  const bubble   = $('bs-bubble');
  const window_  = $('bs-window');
  const messagesEl = $('bs-messages');
  const inputEl  = $('bs-input');
  const sendBtn  = $('bs-send');
  const closeBtn = $('bs-close');
  const notifEl  = $('bs-notif');
  const statusEl = $('bs-status');

  /* ─── WebSocket connection ──────────────────────────────────────────────── */
  function connect() {
    const wsUrl = CFG.apiBase
      .replace(/^http/, 'ws')
      .replace(/\/?$/, '') + `/api/chat/ws?botKey=${CFG.botKey}`;

    state.ws = new WebSocket(wsUrl);

    state.ws.onopen = () => {
      state.connected = true;
      statusEl.textContent = '● Online';
    };

    state.ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }

      if (msg.type === 'typing') { showTyping(); return; }
      if (msg.type === 'message') {
        hideTyping();
        addMessage('bot', msg.text, msg.chips, msg.action);
        if (!state.open) { notifEl.classList.add('show'); }
      }
      if (msg.type === 'error') {
        hideTyping();
        addMessage('bot', '⚠️ ' + msg.text, []);
      }
    };

    state.ws.onclose = () => {
      state.connected = false;
      statusEl.textContent = '○ Reconnecting…';
      setTimeout(connect, 3000);
    };

    state.ws.onerror = () => state.ws.close();
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    addMessage('user', text);
    state.history.push({ role: 'user', content: text });
    inputEl.value = '';

    if (state.ws?.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({ type: 'message', text, sessionData: state.sessionData }));
    } else {
      /* fallback: REST API */
      fetchRest(text);
    }
  }

  async function fetchRest(text) {
    showTyping();
    try {
      const res = await fetch(`${CFG.apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botKey: CFG.botKey, message: text, history: state.history }),
      });
      const data = await res.json();
      hideTyping();
      addMessage('bot', data.reply || data.error, data.chips, data.action);
    } catch {
      hideTyping();
      addMessage('bot', 'Sorry, I\'m having trouble connecting. Please try again.');
    }
  }

  /* ─── Render helpers ────────────────────────────────────────────────────── */
  function mdToHtml(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function addMessage(role, text, chips = [], action = null) {
    const msgEl = document.createElement('div');
    msgEl.className = `bs-msg ${role}`;

    const avEl = document.createElement('div');
    avEl.className = 'bs-msg-av';
    avEl.textContent = role === 'bot' ? CFG.avatar : 'U';

    const wrapEl = document.createElement('div');
    wrapEl.className = 'bs-bubble-wrap';

    const textEl = document.createElement('div');
    textEl.className = 'bs-text';
    textEl.innerHTML = mdToHtml(text);
    wrapEl.appendChild(textEl);

    /* booking confirmation card */
    if (action?.type === 'confirmed') {
      const b = action.booking;
      const card = document.createElement('div');
      card.className = 'bs-booking-card';
      card.innerHTML = `
        <div class="title">Booking confirmed 🎉</div>
        <div class="row"><span class="label">Service</span><span class="value">${b.service}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${b.dateLabel}</span></div>
        <div class="row"><span class="label">Name</span><span class="value">${b.customerName}</span></div>
        <div class="row"><span class="label">Ref</span><span class="value"><span class="ref">${b.ref}</span></span></div>
      `;
      wrapEl.appendChild(card);
    }

    /* quick reply chips */
    if (chips?.length) {
      const chipsEl = document.createElement('div');
      chipsEl.className = 'bs-chips';
      chips.forEach(chip => {
        const btn = document.createElement('button');
        btn.className = 'bs-chip';
        btn.textContent = chip;
        btn.onclick = () => { sendMessage(chip); chipsEl.remove(); };
        chipsEl.appendChild(btn);
      });
      wrapEl.appendChild(chipsEl);
    }

    msgEl.appendChild(role === 'bot' ? avEl : document.createTextNode(''));
    msgEl.appendChild(wrapEl);
    if (role === 'user') msgEl.appendChild(avEl);

    messagesEl.appendChild(msgEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  let typingEl = null;
  function showTyping() {
    if (typingEl) return;
    const msg = document.createElement('div');
    msg.className = 'bs-msg bot';
    const av = document.createElement('div');
    av.className = 'bs-msg-av'; av.textContent = CFG.avatar;
    const dot = document.createElement('div');
    dot.className = 'bs-typing';
    dot.innerHTML = '<span></span><span></span><span></span>';
    msg.appendChild(av); msg.appendChild(dot);
    typingEl = msg;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  }

  /* ─── Open / close ──────────────────────────────────────────────────────── */
  function openWidget() {
    state.open = true;
    window_.classList.add('open');
    bubble.innerHTML = `<span style="font-size:18px;color:white">✕</span>`;
    notifEl.classList.remove('show');
    inputEl.focus();
    if (!state.connected && !state.ws) connect();
  }

  function closeWidget() {
    state.open = false;
    window_.classList.remove('open');
    bubble.innerHTML = `<span>${CFG.avatar}</span><span class="bs-notif" id="bs-notif"></span>`;
  }

  /* ─── Events ────────────────────────────────────────────────────────────── */
  bubble.addEventListener('click', () => state.open ? closeWidget() : openWidget());
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeWidget(); });

  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
  inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputEl.value); } });

  /* ─── Auto-open after delay ─────────────────────────────────────────────── */
  if (CFG.delay > 0) {
    setTimeout(() => {
      notifEl.classList.add('show');
    }, CFG.delay * 1000);
  }

  /* ─── Load Google Fonts ─────────────────────────────────────────────────── */
  if (!document.getElementById('bs-fonts')) {
    const link = document.createElement('link');
    link.id   = 'bs-fonts';
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }

})();
