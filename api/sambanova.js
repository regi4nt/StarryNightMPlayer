/**
 * Vercel Serverless Function: /api/sambanova
 *
 * Server-side proxy for SambaNova Cloud (OpenAI-compatible).
 * The API key lives in SAMBANOVA_API_KEY (Vercel env var) — never exposed to browser.
 *
 * Browser sends:
 *   POST /api/sambanova
 *   { model, messages, max_tokens, ... }   ← OpenAI-compatible body
 *
 * Proxy forwards to:
 *   https://api.sambanova.ai/v1/chat/completions
 *   Authorization: Bearer <SAMBANOVA_API_KEY>
 */

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.SAMBANOVA_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'SAMBANOVA_API_KEY not configured on server' });
  }

  try {
    const upstream = await fetch('https://api.sambanova.ai/v1/chat/completions', {
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
    return res.status(502).json({ error: 'Upstream SambaNova request failed', detail: e.message });
  }
}
