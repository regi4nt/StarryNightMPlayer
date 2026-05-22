import { applyRateLimit } from './_lib/rateLimit.js';

export const config = { runtime: 'nodejs' };

/**
 * Vercel Serverless Function: /api/youtube
 *
 * Unified proxy untuk tiga sumber data YouTube:
 *
 * 1. YouTube Data API v3  (action=search|trending|videos — butuh YOUTUBE_API_KEY)
 *    GET /api/youtube?action=search&q=lofi&maxResults=10
 *    GET /api/youtube?action=trending&regionCode=ID&maxResults=8
 *    GET /api/youtube?action=videos&id=dQw4w9WgXcQ
 *
 * 2. Invidious  (backend=invidious — tidak butuh key, fallback antar instance)
 *    GET /api/youtube?backend=invidious&path=/api/v1/trending&type=Music
 *    GET /api/youtube?backend=invidious&path=/api/v1/search&q=lofi&type=video
 *
 * 3. Piped  (backend=piped — tidak butuh key, fallback antar instance)
 *    GET /api/youtube?backend=piped&path=/trending&region=ID
 *    GET /api/youtube?backend=piped&path=/search&q=lofi&filter=music_songs
 *    GET /api/youtube?backend=piped&path=/streams/dQw4w9WgXcQ
 *
 * Legacy routes /api/invidious dan /api/piped di-redirect via vercel.json rewrites.
 */

// ── Instance lists ────────────────────────────────────────────────────────────

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

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (await applyRateLimit(req, res, { max: 60, windowMs: 60_000, key: 'youtube' })) return;

  const { action, backend, path: apiPath, ...clientParams } = req.query;

  // ── Route: Invidious / Piped proxy ─────────────────────────────────────────
  if (backend === 'invidious' || backend === 'piped') {
    if (!apiPath) {
      return res.status(400).json({ error: 'Missing ?path= parameter for backend proxy' });
    }

    const usePiped   = backend === 'piped';
    const instances  = usePiped ? PIPED_INSTANCES : INVIDIOUS_INSTANCES;
    const timeout    = usePiped ? 8000 : 6000;
    const cacheVal   = usePiped
      ? 's-maxage=60, stale-while-revalidate=120'
      : 's-maxage=300, stale-while-revalidate=600';

    res.setHeader('Cache-Control', cacheVal);

    const qs     = new URLSearchParams(clientParams).toString();
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

        if (!upstream.ok) { lastError = `${base} returned ${upstream.status}`; continue; }

        const data = await upstream.json();
        return res.status(200).json(data);
      } catch (e) {
        lastError = e.message;
      }
    }

    return res.status(503).json({
      error: `All ${usePiped ? 'Piped' : 'Invidious'} instances unavailable`,
      detail: lastError,
    });
  }

  // ── Route: YouTube Data API v3 ─────────────────────────────────────────────
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'YOUTUBE_API_KEY not configured on server' });
  }

  try {
    let endpoint, params;

    if (action === 'search') {
      endpoint = `${YT_BASE}/search`;
      params = new URLSearchParams({
        key: apiKey,
        part: 'snippet',
        type: clientParams.type || 'video',
        videoCategoryId: '10',
        maxResults: clientParams.maxResults || '10',
        q: clientParams.q || '',
        safeSearch: 'none',
        relevanceLanguage: clientParams.lang || 'id',
        regionCode: clientParams.regionCode || 'ID',
        fields: 'items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails/medium)',
      });

    } else if (action === 'trending') {
      endpoint = `${YT_BASE}/videos`;
      params = new URLSearchParams({
        key: apiKey,
        part: 'snippet,contentDetails',
        chart: 'mostPopular',
        videoCategoryId: clientParams.videoCategoryId || '10',
        regionCode: clientParams.regionCode || 'ID',
        maxResults: clientParams.maxResults || '8',
        fields: 'items(id,snippet/title,snippet/channelTitle,snippet/thumbnails/medium,contentDetails/duration)',
      });

    } else if (action === 'videos') {
      endpoint = `${YT_BASE}/videos`;
      params = new URLSearchParams({
        key: apiKey,
        part: 'snippet,contentDetails',
        id: clientParams.id || '',
        fields: 'items(id,snippet/title,snippet/channelTitle,snippet/thumbnails/medium,contentDetails/duration)',
      });

    } else {
      return res.status(400).json({
        error: `Unknown action "${action}". Use action=search|trending|videos or backend=invidious|piped.`,
      });
    }

    const response = await fetch(`${endpoint}?${params}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: 'YouTube API error',
        status: response.status,
        detail: err?.error?.message || response.statusText,
      });
    }

    const data = await response.json();
    const maxAge = action === 'trending' ? 600 : 120;
    res.setHeader('Cache-Control', `s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);

    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ error: 'Proxy error', detail: e.message });
  }
}
