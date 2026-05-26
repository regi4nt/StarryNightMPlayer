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
  maxDuration: 30, // Vercel max untuk Hobby plan
};

// Whitelist domain yang diizinkan di-proxy
// (cegah penyalahgunaan sebagai open proxy)
const ALLOWED_DOMAINS = [
  'stream.live.vc.bbcmedia.co.uk',
  'rfe21.akacast.akamaistream.net',
  'ibb.akacast.akamaistream.net',
  'stream.radioparadise.com',
  'ice1.somafm.com',
  'ice2.somafm.com',
  'ice3.somafm.com',
  'ice4.somafm.com',
  'ice5.somafm.com',
  'ice6.somafm.com',
  'stream.laut.fm',
  'icecast.radiofrance.fr',
  'stream.wfmu.org',
  'kexp-mp3-128.streamguys1.com',
  'stream.live.vc.bbcmedia.co.uk',
  'playerservices.streamtheworld.com',
  // tambah domain lain jika diperlukan
];

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

  // Hanya proxy http:// — https:// tidak perlu
  if (!url.startsWith('http://')) {
    return res.status(400).json({ error: 'Only http:// URLs need proxying' });
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
        // Ganti hostname dengan IP hasil resolusi custom DNS
        // Tambah Host header agar virtual hosting di server tujuan tetap berfungsi
        headers['Host'] = parsedUrl.hostname;
        parsedUrl.hostname = resolvedIp;
        fetchUrl = parsedUrl.toString();
      }
    }

    const upstream = await fetch(fetchUrl, {
      headers,
      signal: AbortSignal.timeout(10_000),
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
    const reader = upstream.body.getReader();
    const write = () => reader.read().then(({ done, value }) => {
      if (done) { res.end(); return; }
      res.write(Buffer.from(value));
      write();
    }).catch(() => res.end());
    write();

  } catch (e) {
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy error', detail: e.message });
    }
  }
}
