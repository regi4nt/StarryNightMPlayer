/**
 * Vercel Serverless Function: /api/radio-proxy
 *
 * Proxy stream radio HTTP → HTTPS.
 * Browser tidak bisa fetch http:// dari halaman https:// (Mixed Content),
 * tapi server Vercel bisa. Fungsi ini meneruskan stream dari server ke browser via HTTPS.
 *
 * Usage:
 *   GET /api/radio-proxy?url=http://stream.example.com/radio
 *   GET /api/radio-proxy?url=http://stream.example.com/radio&dns=1.1.1.1
 *
 * Keamanan:
 * - Hanya izinkan URL http:// (https:// tidak perlu proxy)
 * - Batasi ke domain audio stream yang dikenal
 * - Rate limiting
 */

import { applyRateLimit } from './_lib/rateLimit.js';
import dns from 'dns';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60, // Vercel Pro/Hobby: 60s. Lebih dari ini perlu upgrade plan.
  // CATATAN: Batas 30s lama adalah penyebab utama buffering — stream diputus paksa
  // oleh Vercel setiap 30 detik, browser harus reconnect terus-menerus.
  // Dengan 60s, frekuensi reconnect berkurang 50%.
  // Untuk Hobby plan (gratis), maxDuration max adalah 60s.
  // Untuk Pro plan, bisa diset sampai 300s atau lebih.
};

// Whitelist domain yang diizinakan di-proxy
// (cegah penyalahgunaan sebagai open proxy)
// FIX RADIO SUARA: diperluas untuk mendukung stasiun dari RadioBrowser, SomaFM, NTS, dll.
const ALLOWED_DOMAINS = [
  'stream.live.vc.bbcmedia.co.uk',
  'rfe21.akacast.akamaistream.net',
  'ibb.akacast.akamaistream.net',
  'stream.radioparadise.com',
  'ice1.somafm.com', 'ice2.somafm.com', 'ice3.somafm.com',
  'ice4.somafm.com', 'ice5.somafm.com', 'ice6.somafm.com',
  'stream.laut.fm',
  'icecast.radiofrance.fr',
  'icecast2.radiofrance.fr',
  'stream.wfmu.org',
  'kexp-mp3-128.streamguys1.com',
  'playerservices.streamtheworld.com',
  'streaming.radio.co',
  'strm.radio.co',
  'streamingp.shoutcast.com',
  'listen.shoutcast.com',
  'edge.mixlr.com',
  'streams.radiomast.io',
  'cast1.torontocast.com',
  'cast2.torontocast.com',
  'stream-relay-geo.ntslive.co.uk',
  'akacast.akamaistream.net',
  'cdnstream1.com',
  // tambah domain lain jika diperlukan
];

/**
 * FIX Bug #1 (SSRF via DNS rebinding): validasi bahwa IP hasil resolusi custom DNS
 * bukan alamat private/loopback/link-local/multicast.
 *
 * Tanpa ini, attacker bisa menunjuk DNS server milik sendiri agar domain whitelist
 * seperti 'stream.live.vc.bbcmedia.co.uk' ter-resolve ke 10.0.0.1, 169.254.169.254
 * (AWS metadata), 192.168.x.x, dst — sehingga Vercel server connect ke jaringan internal.
 *
 * Range yang diblokir (IPv4):
 *   10.0.0.0/8       — private class A
 *   172.16.0.0/12    — private class B
 *   192.168.0.0/16   — private class C
 *   127.0.0.0/8      — loopback
 *   169.254.0.0/16   — link-local (AWS/GCP metadata endpoint)
 *   100.64.0.0/10    — shared address space (Carrier-grade NAT)
 *   0.0.0.0/8        — "this" network
 *   224.0.0.0/4      — multicast
 *   240.0.0.0/4      — reserved
 */
function isPrivateIp(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return true; // malformed → block
  const [a, b] = parts;
  if (a === 10)                          return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31)  return true; // 172.16.0.0/12
  if (a === 192 && b === 168)            return true; // 192.168.0.0/16
  if (a === 127)                         return true; // 127.0.0.0/8  loopback
  if (a === 169 && b === 254)            return true; // 169.254.0.0/16 link-local
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 0)                           return true; // 0.0.0.0/8
  if (a >= 224)                          return true; // multicast + reserved
  return false;
}

function isAllowed(urlStr) {
  try {
    const u = new URL(urlStr);
    return ALLOWED_DOMAINS.some(d => u.hostname === d || u.hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

/**
 * Resolve hostname menggunakan DNS-over-TCP dengan custom resolver.
 * Hanya dipanggil jika parameter ?dns= tersedia.
 * Menggunakan Node.js dns.Resolver agar tidak mengubah DNS global proses.
 */
async function resolveWithCustomDns(hostname, dnsServer) {
  if (!dnsServer) return null;
  // Validasi: hanya izinkan IP address sebagai DNS server (cegah SSRF)
  if (!/^[\d.]+$/.test(dnsServer) && !/^[0-9a-f:]+$/i.test(dnsServer)) return null;
  return new Promise((resolve) => {
    try {
      const resolver = new dns.Resolver({ timeout: 3000 });
      resolver.setServers([dnsServer]);
      resolver.resolve4(hostname, (err, addresses) => {
        if (err || !addresses || !addresses.length) { resolve(null); return; }
        resolve(addresses[0]);
      });
    } catch {
      resolve(null);
    }
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (await applyRateLimit(req, res, { max: 60, windowMs: 60_000, key: 'radio-proxy' })) return;

  const { url, dns: customDns } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing ?url= parameter' });

  // FIX RADIO SUARA: proxy http:// DAN https:// — https:// juga bisa kena CORS block
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return res.status(400).json({ error: 'Only http:// or https:// URLs are supported' });
  }

  if (!isAllowed(url)) {
    return res.status(403).json({
      error: 'Domain not in allowlist',
      hint: 'Tambahkan domain ke ALLOWED_DOMAINS di api/radio-proxy.js',
    });
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; StarryNightMPlayer/1.0)',
      'Accept': '*/*',
    };

    // Forward Range header jika ada (untuk seek)
    if (req.headers['range']) {
      headers['Range'] = req.headers['range'];
    }

    // ── Custom DNS: resolve hostname dengan DNS server kustom lalu sambung via IP
    // Ini memungkinkan bypass DNS blocking oleh ISP pada stream HTTP.
    let fetchUrl = url;
    if (customDns) {
      const parsedUrl = new URL(url);
      const resolvedIp = await resolveWithCustomDns(parsedUrl.hostname, customDns);
      if (resolvedIp) {
        // FIX Bug #1: blokir IP internal/loopback/link-local untuk cegah SSRF
        if (isPrivateIp(resolvedIp)) {
          return res.status(403).json({
            error: 'Resolved IP is in a private/reserved range',
            hint: 'Custom DNS tidak boleh me-resolve ke alamat IP internal atau loopback.',
          });
        }
        // Ganti hostname dengan IP hasil resolusi custom DNS
        // Tambah Host header agar virtual hosting di server tujuan tetap berfungsi
        headers['Host'] = parsedUrl.hostname;
        parsedUrl.hostname = resolvedIp;
        fetchUrl = parsedUrl.toString();
      }
    }

    const upstream = await fetch(fetchUrl, {
      headers,
      signal: AbortSignal.timeout(25_000), // cukup lama untuk koneksi lambat
    });

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).json({
        error: `Upstream returned ${upstream.status}`,
        url,
      });
    }

    // Forward content headers yang relevan
    const contentType = upstream.headers.get('content-type') || 'audio/mpeg';
    const contentLength = upstream.headers.get('content-length');
    const acceptRanges = upstream.headers.get('accept-ranges');
    const icecastName = upstream.headers.get('icy-name');
    const icecastGenre = upstream.headers.get('icy-genre');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache, no-store');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
    if (icecastName) res.setHeader('icy-name', icecastName);
    if (icecastGenre) res.setHeader('icy-genre', icecastGenre);

    res.status(upstream.status);

    // Stream langsung ke client
    // FIX Bug #1: ganti rekursi tak terbatas dengan iterative async loop.
    // Rekursi di dalam .then() membentuk call-stack baru setiap chunk — untuk
    // live radio yang tidak pernah selesai, ini menyebabkan stack overflow.
    const reader = upstream.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // res.write() bisa return false (backpressure). Tunggu 'drain' agar
        // buffer tidak meledak saat client lambat menerima data.
        const canContinue = res.write(Buffer.from(value));
        if (!canContinue) {
          await new Promise(resolve => res.once('drain', resolve));
        }
      }
    } catch {
      // Client disconnect / upstream error — tutup saja
    } finally {
      res.end();
    }

  } catch (e) {
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy error', detail: e.message });
    }
  }
}
