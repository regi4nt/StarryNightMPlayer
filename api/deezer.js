/**
 * Vercel Serverless Function: /api/deezer
 *
 * Server-side proxy untuk Deezer search API — bypass CORS.
 *
 * Usage:
 *   GET /api/deezer?q=jazz&limit=5
 */

const BASE = 'https://api.deezer.com/search';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q = '', limit = '5' } = req.query;
  if (!q.trim()) return res.status(400).json({ error: 'Missing ?q=' });

  const params = new URLSearchParams({ q, limit, output: 'json' });

  try {
    const r = await fetch(`${BASE}?${params}`, {
      headers: { 'User-Agent': 'StarryNightPlayer/1.0' },
      signal: AbortSignal.timeout(7000),
    });
    if (!r.ok) return res.status(r.status).json({ error: `Deezer ${r.status}` });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
