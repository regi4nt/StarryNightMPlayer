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

// ── Instance lists (updated 2025 — sorted by reliability)
// Updated May 2026 — dari docs.invidious.io/instances/ (official list)
// Catatan: list resmi Invidious sangat pendek di 2026 karena Google makin agresif block instance publik
const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',           // 🇨🇱 Chile — instance terlama, paling stabil
  'https://invidious.nerdvpn.de',     // 🇺🇦 Ukraine
  'https://inv.thepixora.com',        // 🇨🇦 Canada — baru, API enabled
  'https://yt.chocolatemoo53.com',    // 🇺🇸 US
  'https://invidious.tiekoetter.com', // 🇩🇪 Jerman
  'https://invidious.f5.si',          // 🇯🇵 Jepang
];

// Updated May 2026 — dari github.com/TeamPiped/documentation (official list)
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',          // 🌍 Official, multi-region CDN
  'https://pipedapi-libre.kavin.rocks',    // 🇳🇱 Official libre (no CDN)
  'https://pipedapi.leptons.xyz',          // 🇦🇹 Austria
  'https://piped-api.privacy.com.de',      // 🇩🇪 Jerman
  'https://pipedapi.adminforge.de',        // 🇩🇪 Jerman
  'https://api.piped.yt',                  // 🇩🇪 Jerman
  'https://pipedapi.drgns.space',          // 🇺🇸 US
  'https://pipedapi.owo.si',               // 🇩🇪 Jerman
  'https://pipedapi.ducks.party',          // 🇳🇱 Belanda
  'https://piped-api.codespace.cz',        // 🇨🇿 Ceko
  'https://pipedapi.reallyaweso.me',       // 🇩🇪 Jerman
  'https://api.piped.private.coffee',      // 🇦🇹 Austria
  'https://pipedapi.darkness.services',    // 🇺🇸 US
];

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

// ── Helper: ekstrak videoId 11 karakter dari URL Piped (/watch?v=... atau /watch/...) ──
const extractVideoIdFromUrl = (url = '') => {
  const m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  const plain = url.replace('/watch?v=', '').split('&')[0].split('?')[0].replace('/watch/', '');
  return /^[A-Za-z0-9_-]{11}$/.test(plain) ? plain : null;
};

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
    const timeout    = 4500; // balance antara kecepatan dan reliabilitas instance
    const cacheVal   = usePiped
      ? 's-maxage=60, stale-while-revalidate=180'
      : 's-maxage=120, stale-while-revalidate=300';

    res.setHeader('Cache-Control', cacheVal);

    const qs     = new URLSearchParams(clientParams).toString();
    const suffix = `${apiPath}${qs ? '?' + qs : ''}`;

    // Race semua instance paralel — kembalikan yang tercepat berhasil
    const tryInstance = async (base) => {
      const upstream = await fetch(`${base}${suffix}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StarryNightMPlayer/1.0)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(timeout),
      });
      if (!upstream.ok) throw new Error(`${base} returned ${upstream.status}`);
      const data = await upstream.json();
      // Validasi: harus ada data yang berguna
      if (Array.isArray(data) && data.length === 0) throw new Error('empty');
      if (data && typeof data === 'object' && Array.isArray(data.items) && data.items.length === 0) throw new Error('empty');
      // Validasi Invidious/Piped: array items harus lolos filter embeddable ketat
      if (Array.isArray(data)) {
        const valid = data.filter(i => {
          // ── videoId harus valid 11 karakter (Base64url) ──────────────────
          const vid = i.videoId || extractVideoIdFromUrl(i.url || '');
          if (!vid || !/^[A-Za-z0-9_-]{11}$/.test(vid)) return false;

          // ── Tolak live / upcoming / premiere ────────────────────────────
          if (i.liveNow || i.isLive || i.live) return false;
          if (i.isUpcoming || i.premiereTimestamp) return false;

          // ── Tolak Shorts: URL /shorts/, durasi <62 s, atau flag isShort ──
          const url = (i.url || '').toLowerCase();
          if (url.includes('/shorts/')) return false;
          if (i.isShort === true) return false;
          const dur = i.lengthSeconds || i.duration || 0;
          if (dur > 0 && dur < 62) return false;

          // ── Tolak jika title mengandung penanda Shorts/live ──────────────
          const title = (i.title || '').toLowerCase();
          if (title.includes('#shorts') || title.includes('#short')) return false;
          // Judul sangat pendek (<3 karakter) = kemungkinan data rusak
          if (i.title && i.title.trim().length < 3) return false;

          // ── Piped: pastikan ada uploaderUrl (channel valid, bukan ghost) ─
          // uploaderUrl biasanya '/channel/UCxxxxxx' — kosong = data tidak lengkap
          if (i.uploaderUrl !== undefined && !i.uploaderUrl) return false;

          // ── Invidious: pastikan viewCount > 0 jika tersedia ─────────────
          if (i.viewCount !== undefined && i.viewCount === 0) return false;

          return true;
        });
        if (valid.length === 0) throw new Error('no embeddable videoIds');
        return valid;
      }
      return data;
    };

    try {
      const data = await Promise.any(instances.map(tryInstance));
      return res.status(200).json(data);
    } catch (e) {
      return res.status(503).json({
        error: `All ${usePiped ? 'Piped' : 'Invidious'} instances unavailable`,
        detail: e?.errors?.map(x => x.message).join(', ') || e.message,
      });
    }
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
        videoEmbeddable: 'true',
        videoSyndicated: 'true',          // hanya video yang bisa diembed di luar YT
        eventType: 'none',                // exclude live streams & upcoming
        videoDuration: clientParams.videoDuration || 'any', // caller bisa override
        // FIX Search: relevanceLanguage & regionCode TIDAK di-default ke 'id'/'ID' —
        // param ini menyebabkan hasil lagu asing (English, Korean, dll) ngawur karena
        // YT API memprioritaskan konten berbahasa Indonesia.
        // Hanya sertakan jika caller eksplisit kirim param tersebut.
        ...(clientParams.lang       ? { relevanceLanguage: clientParams.lang }       : {}),
        ...(clientParams.regionCode ? { regionCode: clientParams.regionCode }         : {}),
        fields: 'items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails/medium,snippet/liveBroadcastContent)',
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
