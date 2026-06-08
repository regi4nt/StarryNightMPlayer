import { applyRateLimit } from './_lib/rateLimit.js';

export const config = { runtime: 'nodejs' };

/**
 * /api/yt-audio?videoId=<id>
 *
 * Server-side proxy: ambil audio stream YouTube via Piped/Invidious dari server,
 * lalu stream ke client. Ini mengatasi masalah IP-lock YouTube CDN — URL audio
 * dari Piped/Invidious hanya valid untuk IP server Piped tersebut, bukan browser user.
 *
 * Alur:
 *   1. Tanya Piped API untuk dapat URL audio stream (server→Piped, OK)
 *   2. Fetch URL audio dari YouTube CDN menggunakan Referer/Origin Piped (server→YT CDN, OK)
 *   3. Stream audio ke browser user
 *
 * GET /api/yt-audio?videoId=dQw4w9WgXcQ
 */

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi-libre.kavin.rocks',
  'https://pipedapi.leptons.xyz',
  'https://piped-api.privacy.com.de',
  'https://pipedapi.adminforge.de',
  'https://api.piped.yt',
  'https://pipedapi.owo.si',
  'https://piped-api.codespace.cz',
  'https://api.piped.private.coffee',
];

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://invidious.tiekoetter.com',
  'https://invidious.f5.si',
];

const TIMEOUT_MS = 8000;
const MAX_SIZE_BYTES = 64 * 1024 * 1024; // 64 MB

// Acak urutan instance agar load lebih merata
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function getAudioUrlViaPiped(videoId) {
  const instances = shuffle(PIPED_INSTANCES);
  for (const base of instances) {
    try {
      const res = await fetch(`${base}/streams/${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StarryNightMPlayer/1.0)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const streams = (data.audioStreams || [])
        .filter(s => s.url && (s.mimeType || '').includes('audio'));
      if (!streams.length) continue;
      streams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
      // Prioritaskan opus/webm lebih kecil, atau mp4a — tergantung bitrate terbaik
      const best = streams[0];
      return { url: best.url, mime: best.mimeType?.split(';')[0] || 'audio/webm', source: base };
    } catch { continue; }
  }
  return null;
}

async function getAudioUrlViaInvidious(videoId) {
  const instances = shuffle(INVIDIOUS_INSTANCES);
  for (const base of instances) {
    try {
      const res = await fetch(`${base}/api/v1/videos/${videoId}?fields=adaptiveFormats,formatStreams`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StarryNightMPlayer/1.0)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const adaptive = (data.adaptiveFormats || [])
        .filter(f => f.url && (f.type || '').includes('audio'));
      if (adaptive.length) {
        adaptive.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
        return {
          url: adaptive[0].url,
          mime: adaptive[0].type?.split(';')[0] || 'audio/webm',
          source: base,
        };
      }
    } catch { continue; }
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (await applyRateLimit(req, res, { max: 20, windowMs: 60_000, key: 'yt-audio' })) return;

  const { videoId } = req.query;
  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'videoId tidak valid (harus 11 karakter Base64url)' });
  }

  // ── Step 1: Dapatkan URL audio stream dari Piped atau Invidious ─────────────
  let audioInfo = null;
  try {
    audioInfo = await getAudioUrlViaPiped(videoId);
  } catch { /* lanjut */ }
  if (!audioInfo) {
    try {
      audioInfo = await getAudioUrlViaInvidious(videoId);
    } catch { /* lanjut */ }
  }

  if (!audioInfo?.url) {
    return res.status(503).json({
      error: 'Semua instance Piped/Invidious tidak tersedia atau video tidak ditemukan',
      hint: 'Coba beberapa saat lagi, atau gunakan Cobalt sebagai alternatif',
    });
  }

  // ── Step 2: Fetch audio stream dari YouTube CDN (server-to-server) ──────────
  // YouTube CDN mengizinkan request dari IP server Piped/Invidious karena
  // kita kirim Referer yang sesuai dengan origin instance Piped tersebut.
  const pipedOrigin = new URL(audioInfo.source).origin;
  const forwardHeaders = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Encoding': 'identity',
    'Referer': `${pipedOrigin}/`,
    'Origin': pipedOrigin,
  };
  if (req.headers['range']) {
    forwardHeaders['Range'] = req.headers['range'];
  }

  let upstream;
  try {
    upstream = await fetch(audioInfo.url, {
      headers: forwardHeaders,
      signal: AbortSignal.timeout(20_000),
      redirect: 'follow',
    });
  } catch (e) {
    return res.status(502).json({ error: 'Gagal fetch audio dari CDN YouTube', detail: e.message });
  }

  if (!upstream.ok && upstream.status !== 206) {
    // Jika YouTube CDN tolak (403/410/sering terjadi karena token expired), kembalikan error
    return res.status(upstream.status).json({
      error: `YouTube CDN menolak: HTTP ${upstream.status}`,
      hint: 'URL stream sudah expired — coba lagi untuk mendapat URL baru',
    });
  }

  // ── Step 3: Stream audio ke client ──────────────────────────────────────────
  const contentType = upstream.headers.get('content-type') || audioInfo.mime;
  const contentLength = upstream.headers.get('content-length');
  const contentRange = upstream.headers.get('content-range');
  const acceptRanges = upstream.headers.get('accept-ranges');

  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type, Accept-Ranges');
  if (contentLength) res.setHeader('Content-Length', contentLength);
  if (contentRange) res.setHeader('Content-Range', contentRange);
  if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
  // Izinkan cache singkat di CDN Vercel
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  res.status(upstream.status);

  const reader = upstream.body.getReader();
  let totalStreamed = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalStreamed += value.length;
      if (totalStreamed > MAX_SIZE_BYTES) {
        res.end();
        return;
      }
      res.write(Buffer.from(value));
    }
    res.end();
  } catch {
    res.end(); // Client disconnect — normal
  }
}
