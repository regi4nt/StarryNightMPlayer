/**
 * Vercel Serverless Function: /api/spotify-token
 *
 * Server-side proxy untuk Spotify Client Credentials token.
 * Keys: SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET (Vercel env vars) — never in browser.
 *
 * Browser sends: POST /api/spotify-token  (no body needed)
 * Returns: { access_token, expires_in }
 *
 * ── Strategi cache (3 layer, dari tercepat ke terlambat) ──────
 *
 * Layer 1 — In-process memory (< 1ms)
 *   Variabel modul yang hidup selama instance serverless masih warm.
 *   Gratis, tanpa setup. Hilang saat instance di-recycle (~15 menit idle).
 *
 * Layer 2 — HTTP response cache via Vercel CDN (s-maxage)
 *   Vercel meng-cache response di edge selama token masih valid.
 *   Browser/edge tidak perlu hit fungsi sama sekali sampai token expired.
 *   Gratis, tanpa setup, otomatis.
 *
 * Layer 3 — Vercel KV (persistent, lintas instance) [OPSIONAL]
 *   Persistent key-value store. Token tetap tersimpan walau semua
 *   instance di-recycle. Butuh akun Vercel + KV database.
 *   Setup: Vercel Dashboard → Storage → Create KV Database → Connect to Project
 *   Env vars yang otomatis ditambahkan: KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN
 *   Lalu: npm install @vercel/kv
 *   Uncomment blok VERCEL KV di bawah untuk mengaktifkan.
 * ─────────────────────────────────────────────────────────────
 */

import { applyRateLimit } from './_lib/rateLimit.js';

export const config = { runtime: 'nodejs' };

// ════════════════════════════════════════════════════════════════
//  LAYER 1: IN-PROCESS MEMORY CACHE
//  Hidup selama instance warm — hilang saat recycle (~15 mnt idle)
// ════════════════════════════════════════════════════════════════

let _cachedToken  = null;
let _tokenExpires = 0;   // Unix ms

function getMemoryCache() {
  if (_cachedToken && Date.now() < _tokenExpires) return _cachedToken;
  return null;
}

function setMemoryCache(token, expiresInSeconds) {
  _cachedToken  = token;
  // Kurangi 60 detik sebagai buffer agar tidak pakai token yang hampir expired
  _tokenExpires = Date.now() + (expiresInSeconds - 60) * 1000;
}

// ════════════════════════════════════════════════════════════════
//  LAYER 3: VERCEL KV  (uncomment setelah setup KV database)
//  npm install @vercel/kv
//  Docs: https://vercel.com/docs/storage/vercel-kv
// ════════════════════════════════════════════════════════════════
/*
import { kv } from '@vercel/kv';

const KV_KEY = 'spotify:access_token';

async function getKVCache() {
  try {
    const cached = await kv.get(KV_KEY);
    if (cached) return cached;            // string token
  } catch (e) {
    console.warn('[spotify-token] KV get failed:', e.message);
  }
  return null;
}

async function setKVCache(token, expiresInSeconds) {
  try {
    // ex: set TTL agar KV otomatis hapus key saat token expired (minus 60s buffer)
    await kv.set(KV_KEY, token, { ex: expiresInSeconds - 60 });
  } catch (e) {
    console.warn('[spotify-token] KV set failed:', e.message);
  }
}
*/

// ════════════════════════════════════════════════════════════════
//  HANDLER
// ════════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // FIX Bug #4: cek method SEBELUM rate limit agar request GET/PUT/DELETE yang tidak valid
  // tidak mengonsumsi kuota IP pengguna — sebelumnya attacker bisa menghabiskan jatah
  // rate limit dengan mengirim request method murah (non-POST) secara massal.
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── Rate limiting (hanya untuk POST yang valid) ───────────────
  if (await applyRateLimit(req, res, { max: 30, windowMs: 60_000, key: 'spotify' })) return;

  const clientId     = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(503).json({ error: 'Spotify credentials not configured on server' });
  }

  // ── Layer 1: cek memory cache dulu ───────────────────────────
  const memToken = getMemoryCache();
  if (memToken) {
    const ttlMs  = _tokenExpires - Date.now();
    const ttlSec = Math.floor(ttlMs / 1000);
    res.setHeader('X-Token-Source', 'memory-cache');
    res.setHeader('Cache-Control', `private, max-age=${ttlSec}`);
    return res.status(200).json({ access_token: memToken, expires_in: ttlSec });
  }

  // ── Layer 3: cek Vercel KV (jika diaktifkan) ─────────────────
  // const kvToken = await getKVCache();
  // if (kvToken) {
  //   setMemoryCache(kvToken, 3600);   // isi ulang memory cache
  //   res.setHeader('X-Token-Source', 'kv-cache');
  //   res.setHeader('Cache-Control', 'private, max-age=3540');
  //   return res.status(200).json({ access_token: kvToken, expires_in: 3540 });
  // }

  // ── Cache miss — ambil token baru dari Spotify ────────────────
  try {
    const upstream = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body:   'grant_type=client_credentials',
      signal: AbortSignal.timeout(10_000),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json(data);
    }

    const { access_token, expires_in } = data;

    // Simpan di memory cache
    setMemoryCache(access_token, expires_in);

    // Simpan di Vercel KV (jika diaktifkan)
    // await setKVCache(access_token, expires_in);

    // ── Layer 2: instruksikan Vercel CDN untuk cache response ini
    // s-maxage: edge cache selama (expires_in - 60) detik
    // stale-while-revalidate: izinkan serving stale sambil refresh di background
    const cdnTtl = expires_in - 60;
    res.setHeader('Cache-Control', `s-maxage=${cdnTtl}, stale-while-revalidate=60`);
    res.setHeader('X-Token-Source', 'spotify-api');

    return res.status(200).json({ access_token, expires_in });
  } catch (e) {
    return res.status(502).json({ error: 'Spotify token request failed', detail: e.message });
  }
}
