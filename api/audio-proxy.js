import { applyRateLimit } from './_lib/rateLimit.js';

export const config = { runtime: 'nodejs' };

/**
 * /api/audio-proxy
 *
 * Server-side audio proxy — fetch URL audio di server lalu stream ke client.
 * Tujuan utama: mengatasi masalah CORS pada URL dari Piped/Invidious/Cobalt/Jamendo/dll
 * yang tidak bisa di-fetch langsung dari browser.
 *
 * GET /api/audio-proxy?url=<encoded_audio_url>
 *
 * Keamanan:
 *   - Hanya mengizinkan domain audio yang masuk whitelist
 *   - Rate limit ketat: 30 req/menit per IP
 *   - Tidak boleh proxy ke localhost / IP private
 *   - Validasi MIME response harus audio atau octet-stream
 *   - Max size 64 MB (cukup untuk lagu ~1 jam di 128kbps)
 */

// ── Whitelist domain yang diizinkan di-proxy ──────────────────────────────────
const ALLOWED_HOSTS = new Set([
  // Piped instances
  'pipedapi.kavin.rocks',
  'pipedapi-libre.kavin.rocks',
  'pipedapi.leptons.xyz',
  'piped-api.privacy.com.de',
  'pipedapi.adminforge.de',
  'api.piped.yt',
  'pipedapi.drgns.space',
  'pipedapi.owo.si',
  'pipedapi.ducks.party',
  'piped-api.codespace.cz',
  'pipedapi.reallyaweso.me',
  'api.piped.private.coffee',
  'pipedapi.darkness.services',
  // Invidious instances + CDN mereka
  'inv.nadeko.net',
  'invidious.nerdvpn.de',
  'inv.thepixora.com',
  'yt.chocolatemoo53.com',
  'invidious.tiekoetter.com',
  'invidious.f5.si',
  // Cobalt instances
  'api.cobalt.tools',
  'cobalt.api.timelessnesses.me',
  'cobalt.esmBot.net',
  // Jamendo
  'storage.jamendo.com',
  'mp3l.jamendo.com',
  'mp3d.jamendo.com',
  // Free Music Archive
  'files.freemusicarchive.org',
  'freemusicarchive.org',
  // CCMixter
  'ccmixter.org',
  // Audius CDN
  'audius.co',
  'creatornode.audius.co',
  // Google / YouTube manifest CDN (googlevideo.com)
  'googlevideo.com',
  // Deezer CDN
  'e-cdns.dzcdn.net',
  'cdns.dzcdn.net',
  // Spotify CDN
  'p.scdn.co',
  'audio-ak-spotify-com.akamaized.net',
  'audio-sp-fa.spotifycdn.com',
  'audio-sp-lon6.spotifycdn.com',
  'audio4.spotify.com',
  'seektables.scdn.co',
  'heads-fa.spotify.com',
  'heads-lon6.spotify.com',
  'cf-ex-apple-ads.scdn.co',
  // Archive.org
  'archive.org',
  'ia800.us.archive.org',
  'ia903.us.archive.org',
  'ia601.us.archive.org',
  // SoundCloud CDN
  'cf-media.sndcdn.com',
  'cf-hls-media.sndcdn.com',
]);

// Wildcard suffix check (untuk CDN dengan subdomain dinamis)
const ALLOWED_HOST_SUFFIXES = [
  '.googlevideo.com',
  '.sndcdn.com',
  '.archive.org',
  '.audius.co',
  '.jamendo.com',
  '.dzcdn.net',
  '.akamaized.net',
  '.cobalt.tools',         // cobalt tunnel subdomains
  '.timelessnesses.me',    // cobalt instance
  '.esmBot.net',           // cobalt instance
  '.scdn.co',              // Spotify CDN (preview + full track)
  '.spotifycdn.com',       // Spotify CDN full track
  '.spotify.com',          // Spotify audio CDN
];

// Private IP ranges — tidak boleh di-proxy
const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^localhost$/i,
];

const MAX_SIZE_BYTES = 64 * 1024 * 1024; // 64 MB

function isAllowedHost(hostname) {
  if (ALLOWED_HOSTS.has(hostname)) return true;
  return ALLOWED_HOST_SUFFIXES.some(suffix => hostname.endsWith(suffix));
}

function isPrivateHost(hostname) {
  return PRIVATE_IP_PATTERNS.some(p => p.test(hostname));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Rate limit ketat — proxy berpotensi mahal
  if (await applyRateLimit(req, res, { max: 30, windowMs: 60_000, key: 'audio-proxy' })) return;

  const { url: rawUrl } = req.query;
  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing ?url= parameter' });
  }

  let targetUrl;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Harus HTTPS
  if (targetUrl.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only HTTPS URLs are allowed' });
  }

  const hostname = targetUrl.hostname.toLowerCase();

  // Tolak private/localhost
  if (isPrivateHost(hostname)) {
    return res.status(403).json({ error: 'Private/localhost URLs are not allowed' });
  }

  // Cek whitelist
  if (!isAllowedHost(hostname)) {
    return res.status(403).json({
      error: `Host not in allowlist: ${hostname}`,
      hint: 'Tambahkan host ke ALLOWED_HOSTS di api/audio-proxy.js jika diperlukan',
    });
  }

  // Forward Range header jika ada (untuk streaming seekable)
  const upstreamHeaders = {
    'User-Agent': 'Mozilla/5.0 (compatible; StarryNightMPlayer/1.0)',
    'Accept': 'audio/*, application/octet-stream, */*',
  };
  if (req.headers['range']) {
    upstreamHeaders['Range'] = req.headers['range'];
  }
  // Referer diperlukan beberapa CDN
  upstreamHeaders['Referer'] = 'https://piped.video/';
  upstreamHeaders['Origin'] = 'https://piped.video';

  let upstream;
  try {
    upstream = await fetch(targetUrl.toString(), {
      headers: upstreamHeaders,
      signal: AbortSignal.timeout(20_000),
      redirect: 'follow',
    });
  } catch (e) {
    return res.status(502).json({ error: 'Upstream fetch failed', detail: e.message });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return res.status(upstream.status).json({
      error: `Upstream returned ${upstream.status}`,
    });
  }

  // Validasi MIME — harus audio atau octet-stream
  const upstreamMime = upstream.headers.get('content-type') || '';
  const isMimeOk =
    upstreamMime.includes('audio/') ||
    upstreamMime.includes('video/') || // beberapa audio dikemas sbg video/mp4 atau video/webm
    upstreamMime.includes('application/octet-stream') ||
    upstreamMime.includes('application/ogg') ||
    upstreamMime.includes('binary/');

  if (!isMimeOk) {
    return res.status(415).json({
      error: `Unexpected MIME type: ${upstreamMime}`,
      hint: 'URL bukan audio',
    });
  }

  // Cek ukuran jika Content-Length tersedia
  const contentLength = upstream.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_SIZE_BYTES) {
    return res.status(413).json({ error: 'File terlalu besar (max 64 MB)' });
  }

  // Forward header yang berguna ke client
  const forwardHeaders = [
    'content-type', 'content-length', 'content-range',
    'accept-ranges', 'cache-control', 'last-modified', 'etag',
  ];
  for (const h of forwardHeaders) {
    const v = upstream.headers.get(h);
    if (v) res.setHeader(h, v);
  }

  // Tambah CORS eksplisit
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type');

  res.status(upstream.status);

  // Stream langsung tanpa buffer penuh
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
    // Client disconnected — normal
    res.end();
  }
}
