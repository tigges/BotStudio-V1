/**
 * BotStudio — Claude API proxy (Cloudflare Worker)
 *
 * Deploy:
 *   1. npx wrangler deploy cloudflare-worker.js --name botstudio-claude-proxy
 *   2. wrangler secret put ANTHROPIC_API_KEY   ← paste your key
 *   3. Copy the worker URL into BotStudio Settings → Proxy URL
 *
 * Free tier: 100,000 requests/day, <1ms cold start, global CDN.
 * Your API key never touches the browser — stored as a Worker secret.
 */

const ALLOWED_ORIGIN = '*'; // restrict to 'https://tigges.github.io' in production

export default {
  async fetch(request, env) {

    /* CORS preflight */
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-provider',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const provider = request.headers.get('x-provider') || 'claude';
    const body = await request.json();

    let upstream, upstreamHeaders;

    if (provider === 'gemini') {
      const model = body.model || 'gemini-2.0-flash';
      delete body.model;
      upstream = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      upstreamHeaders = { 'Content-Type': 'application/json' };
    } else {
      /* claude (default) */
      upstream = 'https://api.anthropic.com/v1/messages';
      upstreamHeaders = {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      };
    }

    const resp = await fetch(upstream, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(body),
    });

    const data = await resp.text();
    return new Response(data, {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      },
    });
  },
};
