/**
 * Vercel Serverless Function: /api/openrouter
 *
 * Server-side proxy for OpenRouter.
 * Key: OPENROUTER_API_KEY (Vercel env var) — never exposed to browser.
 */

import { applyRateLimit } from './_lib/rateLimit.js';


export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Rate limiting ────────────────────────────────────────────
  if (await applyRateLimit(req, res, { max: 30, windowMs: 60000, key: 'openrouter' })) return;
  // ─────────────────────────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'OPENROUTER_API_KEY not configured on server' });
  }

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://starrynight.app',
        'X-Title': 'Starry Night',
      },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(30000),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream OpenRouter request failed', detail: e.message });
  }
}
