/**
 * Vercel Serverless Function: /api/cloudflare
 *
 * Server-side proxy for Cloudflare Workers AI (OpenAI-compatible gateway).
 * The API key and account ID live in CLOUDFLARE_API_KEY and CLOUDFLARE_ACCOUNT_ID
 * (Vercel env vars) — never exposed to browser.
 *
 * Browser sends:
 *   POST /api/cloudflare
 *   { model, messages, max_tokens, ... }   ← OpenAI-compatible body
 *
 * Proxy forwards to:
 *   https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/ai/v1/chat/completions
 *   Authorization: Bearer <CLOUDFLARE_API_KEY>
 */

import { applyRateLimit } from './_lib/rateLimit.js';


export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Rate limiting ────────────────────────────────────────────
  if (await applyRateLimit(req, res, { max: 30, windowMs: 60000, key: 'cloudflare' })) return;
  // ─────────────────────────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.CLOUDFLARE_API_KEY;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!apiKey || !accountId) {
    return res.status(503).json({ error: 'CLOUDFLARE_API_KEY or CLOUDFLARE_ACCOUNT_ID not configured on server' });
  }

  try {
    const upstream = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(30000),
      }
    );

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream Cloudflare AI request failed', detail: e.message });
  }
}
