import { applyRateLimit } from './_lib/rateLimit.js';

export const config = { runtime: 'nodejs' };

/**
 * /api/cobalt
 *
 * Server-side proxy ke Cobalt API.
 * Mengatasi dua masalah sekaligus:
 *   1. CORS — browser tidak bisa POST ke cobalt.tools karena Turnstile/bot protection
 *   2. Turnstile — request dari server (bukan browser) tidak kena challenge
 *
 * POST /api/cobalt
 * Body: { url, downloadMode?, audioFormat?, ... } — sama seperti Cobalt API
 *
 * Respon: tunnel JSON dari Cobalt, atau error
 */

// Instance cobalt yang dicoba berurutan — pilih yang tidak require auth
// Server-to-server tidak kena Turnstile challenge
const COBALT_INSTANCES = [
  'https://api.cobalt.tools/',
  'https://cobalt.api.timelessnesses.me/',
  'https://cobalt.drgns.space/',
  'https://cobalt.darkness.services/',
  'https://cob.lolcat.casa/',
  'https://cobalt.sevenbus.com/',
];

const TIMEOUT_MS = 12000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (await applyRateLimit(req, res, { max: 15, windowMs: 60_000, key: 'cobalt' })) return;

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body?.url) return res.status(400).json({ error: 'Missing url in request body' });
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // Validasi URL — harus YouTube, SoundCloud, dll (tidak boleh SSRF ke private)
  let targetUrl;
  try { targetUrl = new URL(body.url); } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  const ALLOWED_HOSTS = [
    'youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com',
    'soundcloud.com', 'on.soundcloud.com',
    'spotify.com', 'open.spotify.com',
    'tiktok.com', 'vm.tiktok.com',
    'twitter.com', 'x.com', 'twitch.tv',
    'vimeo.com', 'dailymotion.com',
    'bilibili.com', 'b23.tv',
    'instagram.com', 'facebook.com',
  ];
  if (!ALLOWED_HOSTS.some(h => targetUrl.hostname === h || targetUrl.hostname.endsWith('.' + h))) {
    return res.status(403).json({ error: 'URL host tidak diizinkan' });
  }

  // Tambah alwaysProxy: true agar cobalt selalu kembalikan tunnel URL
  // (bukan redirect ke CDN eksternal yang bisa CORS-blocked)
  const cobaltBody = {
    ...body,
    alwaysProxy: true,
  };

  let lastError = null;
  for (const instance of COBALT_INSTANCES) {
    try {
      const upstream = await fetch(instance, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; StarryNightMPlayer/1.0)',
        },
        body: JSON.stringify(cobaltBody),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: 'follow',
      });

      const data = await upstream.json();

      // Jika instance butuh auth, coba instance berikutnya
      if (data?.status === 'error') {
        const code = data?.error?.code || '';
        if (code.includes('auth') || code.includes('token') || code.includes('key')) {
          lastError = new Error(`${instance}: requires auth (${code})`);
          continue;
        }
        // Error lain (video not found, dll) — kembalikan ke client
        return res.status(upstream.status || 400).json(data);
      }

      // Sukses — teruskan response ke client
      return res.status(upstream.ok ? 200 : upstream.status).json(data);

    } catch (e) {
      lastError = e;
      continue;
    }
  }

  return res.status(503).json({
    status: 'error',
    error: { code: 'api.all_instances_failed' },
    detail: lastError?.message || 'All cobalt instances failed',
  });
}
