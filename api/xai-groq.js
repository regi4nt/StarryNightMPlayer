/**
 * Vercel Serverless Function: /api/xai-groq
 *
 * Unified proxy for xAI Grok and Groq — both OpenAI-compatible.
 * Use ?provider=grok or ?provider=groq (defaults to groq).
 *
 * Env vars:
 *   GROK_API_KEY  → xAI (api.x.ai)
 *   GROQ_API_KEY  → Groq (api.groq.com)
 */

export const config = { runtime: 'nodejs' };

const PROVIDERS = {
  grok: {
    endpoint: 'https://api.x.ai/v1/chat/completions',
    envKey:   'GROK_API_KEY',
    label:    'Grok (xAI)',
  },
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    envKey:   'GROQ_API_KEY',
    label:    'Groq',
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const providerName = (req.query.provider || 'groq').toLowerCase();
  const provider = PROVIDERS[providerName];
  if (!provider) {
    return res.status(400).json({ error: `Unknown provider: ${providerName}. Use grok or groq.` });
  }

  const apiKey = process.env[provider.envKey];
  if (!apiKey) {
    return res.status(503).json({ error: `${provider.envKey} not configured on server` });
  }

  try {
    const upstream = await fetch(provider.endpoint, {
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
    return res.status(502).json({ error: `Upstream ${provider.label} request failed`, detail: e.message });
  }
}
