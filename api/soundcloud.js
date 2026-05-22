/**
 * Vercel Serverless Function: /api/soundcloud
 *
 * Server-side proxy for SoundCloud search API.
 * The client_id lives in SOUNDCLOUD_CLIENT_ID (Vercel env var) — never exposed to browser.
 *
 * Browser sends:
 *   GET /api/soundcloud?q=<query>&limit=<limit>
 *
 * Proxy forwards to:
 *   https://api.soundcloud.com/tracks?q=...&limit=...&client_id=<SOUNDCLOUD_CLIENT_ID>
 */

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.SOUNDCLOUD_CLIENT_ID;
  if (!apiKey) {
    return res.status(503).json({ error: 'SOUNDCLOUD_CLIENT_ID not configured on server' });
  }

  const { q, limit = 10 } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter: q' });

  try {
    const upstream = await fetch(
      `https://api.soundcloud.com/tracks?q=${encodeURIComponent(q)}&limit=${limit}&client_id=${apiKey}`,
      {
        headers: { Accept: 'application/json; charset=utf-8' },
        signal: AbortSignal.timeout(15000),
      }
    );

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream SoundCloud request failed', detail: e.message });
  }
}
