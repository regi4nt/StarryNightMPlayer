/**
 * Vercel Serverless Function: /api/deepseek
 *
 * Server-side proxy for DeepSeek chat completions.
 * The API key lives in DEEPSEEK_API_KEY (Vercel env var) — never exposed to browser.
 *
 * Browser sends:
 *   POST /api/deepseek
 *   { model, messages, max_tokens, ... }   ← same body as DeepSeek's API
 *
 * Proxy forwards to:
 *   https://api.deepseek.com/v1/chat/completions
 *   Authorization: Bearer <DEEPSEEK_API_KEY>
 *
 * DeepSeek is OpenAI-compatible so the response shape is identical.
 */

import { applyRateLimit } from './_lib/rateLimit.js';


export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Rate limiting ────────────────────────────────────────────
  if (await applyRateLimit(req, res, { max: 20, windowMs: 60000, key: 'deepseek' })) return;
  // ─────────────────────────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'DEEPSEEK_API_KEY not configured on server' });
  }

  try {
    const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
    return res.status(502).json({ error: 'Upstream DeepSeek request failed', detail: e.message });
  }
}
