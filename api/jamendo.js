/**
 * Vercel Serverless Function: /api/jamendo
 *
 * Server-side proxy untuk Jamendo API — bypass CORS.
 *
 * Usage:
 *   GET /api/jamendo?search=jazz&limit=5
 */

const JAMENDO_CLIENT_ID = 'b6747d04';
const BASE = 'https://api.jamendo.com/v3.0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { search = '', limit = '5' } = req.query;
  if (!search.trim()) return res.status(400).json({ error: 'Missing ?search=' });

  const params = new URLSearchParams({
    client_id: JAMENDO_CLIENT_ID,
    format: 'json',
    limit,
    search,
    include: 'musicinfo',
    imagesize: '200',
  });

  try {
    const r = await fetch(`${BASE}/tracks/?${params}`, {
      headers: { 'User-Agent': 'StarryNightPlayer/1.0' },
      signal: AbortSignal.timeout(7000),
    });
    if (!r.ok) return res.status(r.status).json({ error: `Jamendo ${r.status}` });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
