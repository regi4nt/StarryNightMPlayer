/**
 * Vercel Serverless Function: /api/grok
 *
 * Server-side proxy for xAI Grok chat completions.
 * The API key lives in GROK_API_KEY (Vercel env var) — never exposed to browser.
 *
 * Browser sends:
 *   POST /api/grok
 *   { model, messages, max_tokens, ... }   ← same body as xAI's API
 *
 * Proxy forwards to:
 *   https://api.x.ai/v1/chat/completions
 *   Authorization: Bearer <GROK_API_KEY>
 *
 * xAI is OpenAI-compatible so the response shape is identical.
 */

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GROK_API_KEY not configured on server' });
  }

  try {
    const upstream = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(30000),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream Grok (xAI) request failed', detail: e.message });
  }
}
