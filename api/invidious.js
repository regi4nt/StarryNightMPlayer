/**
 * Vercel Serverless Function: /api/invidious
 *
 * Acts as a server-side proxy for Invidious API calls.
 * Bypasses CORS entirely — the browser talks to our own origin,
 * Vercel's server makes the actual outbound request.
 *
 * Usage:
 *   GET /api/invidious?path=/api/v1/trending&type=Music&fields=title,videoId
 *   GET /api/invidious?path=/api/v1/search&q=lofi&type=video
 */

const INSTANCES = [
  'https://inv.tux.pizza',
  'https://invidious.privacyredirect.com',
  'https://yt.drgnz.club',
  'https://iv.datura.network',
  'https://invidious.fdn.fr',
  'https://invidious.perennialte.ch',
];

export default async function handler(req, res) {
  // CORS headers — allow the deployed origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Build the Invidious path + query from request
  const { path: apiPath, ...queryParams } = req.query;
  if (!apiPath) {
    return res.status(400).json({ error: 'Missing ?path= parameter' });
  }

  const qs = new URLSearchParams(queryParams).toString();
  const suffix = `${apiPath}${qs ? '?' + qs : ''}`;

  // Try each instance until one succeeds
  let lastError = null;
  for (const base of INSTANCES) {
    try {
      const url = `${base}${suffix}`;
      const upstream = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StarryNightMPlayer/1.0)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!upstream.ok) {
        lastError = `${base} returned ${upstream.status}`;
        continue;
      }

      const data = await upstream.json();
      return res.status(200).json(data);
    } catch (e) {
      lastError = e.message;
      // try next instance
    }
  }

  // All instances failed — return error (client will use hardcoded fallback chips)
  return res.status(503).json({ error: 'All Invidious instances unavailable', detail: lastError });
}
