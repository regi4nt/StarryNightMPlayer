/**
 * Vercel Serverless Function: /api/ccmixter
 *
 * Server-side proxy untuk ccMixter API — bypass CORS.
 *
 * Usage:
 *   GET /api/ccmixter?title=jazz&limit=5
 */

const BASE = 'https://ccmixter.org/api/query';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { title = '', limit = '5' } = req.query;
  if (!title.trim()) return res.status(400).json({ error: 'Missing ?title=' });

  const params = new URLSearchParams({
    title,
    limit,
    f: 'json',
    lic_gentag: 'attribution',
  });

  try {
    const r = await fetch(`${BASE}?${params}`, {
      headers: { 'User-Agent': 'StarryNightPlayer/1.0' },
      signal: AbortSignal.timeout(7000),
    });
    if (!r.ok) return res.status(r.status).json({ error: `ccMixter ${r.status}` });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
