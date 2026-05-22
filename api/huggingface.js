/**
 * Vercel Serverless Function: /api/huggingface
 *
 * Server-side proxy for HuggingFace Inference API (OpenAI-compatible).
 * The API key lives in HUGGINGFACE_API_KEY (Vercel env var) — never exposed to browser.
 *
 * Browser sends:
 *   POST /api/huggingface
 *   { model, messages, max_tokens, ... }   ← OpenAI-compatible body
 *
 * Proxy forwards to:
 *   https://router.huggingface.co/v1/chat/completions
 *   Authorization: Bearer <HUGGINGFACE_API_KEY>
 */

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'HUGGINGFACE_API_KEY not configured on server' });
  }

  try {
    const upstream = await fetch('https://router.huggingface.co/v1/chat/completions', {
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
    return res.status(502).json({ error: 'Upstream HuggingFace request failed', detail: e.message });
  }
}
