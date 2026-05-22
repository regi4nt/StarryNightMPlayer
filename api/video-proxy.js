/**
 * Vercel Serverless Function: /api/video-proxy
 *
 * Unified server-side proxy for Piped and Invidious API calls — no CORS issues.
 * Replaces the separate piped.js and invidious.js functions.
 *
 * Usage:
 *   GET /api/video-proxy?provider=piped&path=/trending&region=ID
 *   GET /api/video-proxy?provider=piped&path=/streams/dQw4w9WgXcQ
 *   GET /api/video-proxy?provider=piped&path=/search&q=lofi&filter=music_songs
 *
 *   GET /api/video-proxy?provider=invidious&path=/api/v1/trending&type=Music
 *   GET /api/video-proxy?provider=invidious&path=/api/v1/search&q=lofi&type=video
 *
 * Defaults to 'piped' if provider is omitted.
 */

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.tokhmi.xyz',
  'https://piped-api.garudalinux.org',
  'https://pipedapi.moomoo.me',
  'https://api.piped.yt',
  'https://api.piped.projectsegfault.net',
];

const INVIDIOUS_INSTANCES = [
  'https://inv.tux.pizza',
  'https://invidious.privacyredirect.com',
  'https://yt.drgnz.club',
  'https://iv.datura.network',
  'https://invidious.fdn.fr',
  'https://invidious.perennialte.ch',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { provider = 'piped', path: apiPath, ...queryParams } = req.query;

  if (!apiPath) {
    return res.status(400).json({ error: 'Missing ?path= parameter' });
  }

  const instances = provider === 'invidious' ? INVIDIOUS_INSTANCES : PIPED_INSTANCES;
  const timeout   = provider === 'invidious' ? 6000 : 8000;

  const qs     = new URLSearchParams(queryParams).toString();
  const suffix = `${apiPath}${qs ? '?' + qs : ''}`;

  let lastError = null;
  for (const base of instances) {
    try {
      const upstream = await fetch(`${base}${suffix}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StarryNightMPlayer/1.0)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(timeout),
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

  return res.status(503).json({
    error: `All ${provider} instances unavailable`,
    detail: lastError,
  });
}
