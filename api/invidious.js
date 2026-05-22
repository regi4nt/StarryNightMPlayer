import { applyRateLimit } from './_lib/rateLimit.js';

export const config = { runtime: 'nodejs' };

/**
 * Vercel Serverless Function: /api/invidious
 *
 * Unified server-side proxy for Invidious AND Piped API calls.
 * Bypasses CORS entirely — the browser talks to our own origin,
 * Vercel's server makes the actual outbound request.
 *
 * Usage (Invidious — default):
 *   GET /api/invidious?path=/api/v1/trending&type=Music&fields=title,videoId
 *   GET /api/invidious?path=/api/v1/search&q=lofi&type=video
 *
 * Usage (Piped):
 *   GET /api/invidious?backend=piped&path=/trending&region=ID
 *   GET /api/invidious?backend=piped&path=/streams/dQw4w9WgXcQ
 *   GET /api/invidious?backend=piped&path=/search&q=lofi&filter=music_songs
 */

const INVIDIOUS_INSTANCES = [
  'https://inv.tux.pizza',
  'https://invidious.privacyredirect.com',
  'https://yt.drgnz.club',
  'https://iv.datura.network',
  'https://invidious.fdn.fr',
  'https://invidious.perennialte.ch',
];

const PIPED_INSTANCES = [
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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── Rate limiting ─────────────────────────────────────────────
  if (await applyRateLimit(req, res, { max: 60, windowMs: 60_000, key: 'invidious' })) return;
  // ──────────────────────────────────────────────────────────────

  const { path: apiPath, backend, ...queryParams } = req.query;
  if (!apiPath) {
    return res.status(400).json({ error: 'Missing ?path= parameter' });
  }

  const usePiped = backend === 'piped';
  const instances = usePiped ? PIPED_INSTANCES : INVIDIOUS_INSTANCES;
  const timeout  = usePiped ? 8000 : 6000;

  // Piped responses change more often; Invidious can be cached longer
  res.setHeader(
    'Cache-Control',
    usePiped
      ? 's-maxage=60, stale-while-revalidate=120'
      : 's-maxage=300, stale-while-revalidate=600'
  );

  const qs = new URLSearchParams(queryParams).toString();
  const suffix = `${apiPath}${qs ? '?' + qs : ''}`;

  let lastError = null;
  for (const base of instances) {
    try {
      const url = `${base}${suffix}`;
      const upstream = await fetch(url, {
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

  const backendName = usePiped ? 'Piped' : 'Invidious';
  return res.status(503).json({
    error: `All ${backendName} instances unavailable`,
    detail: lastError,
  });
}

