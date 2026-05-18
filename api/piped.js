/**
 * Vercel Serverless Function: /api/piped
 *
 * Server-side proxy for Piped API calls — no CORS issues.
 *
 * Usage:
 *   GET /api/piped?path=/trending&region=ID
 *   GET /api/piped?path=/streams/dQw4w9WgXcQ
 *   GET /api/piped?path=/search&q=lofi&filter=music_songs
 */

const INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.tokhmi.xyz',
  'https://piped-api.garudalinux.org',
  'https://pipedapi.moomoo.me',
  'https://api.piped.yt',
  'https://api.piped.projectsegfault.net',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path: apiPath, ...queryParams } = req.query;
  if (!apiPath) {
    return res.status(400).json({ error: 'Missing ?path= parameter' });
  }

  const qs = new URLSearchParams(queryParams).toString();
  const suffix = `${apiPath}${qs ? '?' + qs : ''}`;

  let lastError = null;
  for (const base of INSTANCES) {
    try {
      const url = `${base}${suffix}`;
      const upstream = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StarryNightMPlayer/1.0)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!upstream.ok) {
        lastError = `${base} returned ${upstream.status}`;
        continue;
      }

      const data = await upstream.json();
      return res.status(200).json(data);
    } catch (e) {
      lastError = e.message;
    }
  }

  return res.status(503).json({ error: 'All Piped instances unavailable', detail: lastError });
}
