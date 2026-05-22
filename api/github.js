/**
 * Vercel Serverless Function: /api/github
 *
 * Server-side proxy for GitHub Models (OpenAI-compatible).
 * The API key lives in GITHUB_MODELS_TOKEN (Vercel env var) — never exposed to browser.
 *
 * Browser sends:
 *   POST /api/github
 *   { model, messages, max_tokens, ... }   ← OpenAI-compatible body
 *
 * Proxy forwards to:
 *   https://models.inference.ai.azure.com/chat/completions
 *   Authorization: Bearer <GITHUB_MODELS_TOKEN>
 */

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GITHUB_MODELS_TOKEN;
  if (!apiKey) {
    return res.status(503).json({ error: 'GITHUB_MODELS_TOKEN not configured on server' });
  }

  try {
    const upstream = await fetch('https://models.inference.ai.azure.com/chat/completions', {
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
    return res.status(502).json({ error: 'Upstream GitHub Models request failed', detail: e.message });
  }
}
