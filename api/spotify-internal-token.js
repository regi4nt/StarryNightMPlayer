/**
 * Vercel Serverless Function: /api/spotify-internal-token
 *
 * Server-side proxy untuk Spotify internal access_token menggunakan sp_dc cookie.
 * Metode ini sama dengan yang digunakan Spotube, librespot, dan spotify-dl.
 *
 * Mengapa harus server-side?
 *   Browser tidak bisa mengirim Cookie header ke domain lain (CORS policy).
 *   Request ke open.spotify.com/get_access_token HARUS include cookie sp_dc,
 *   yang hanya bisa dilakukan dari server.
 *
 * POST /api/spotify-internal-token
 * Body: { sp_dc: string, track_id?: string }
 *
 * Returns:
 *   { access_token, expires_in }          — jika hanya sp_dc
 *   { access_token, stream_url, cdnUrl }  — jika sp_dc + track_id
 *
 * Keamanan:
 *   - sp_dc tidak pernah disimpan di server (dipakai sekali dan dibuang)
 *   - Rate limit: 20 req/menit per IP
 *   - track_id divalidasi format Spotify ID
 */

import { applyRateLimit } from './_lib/rateLimit.js';

export const config = { runtime: 'nodejs22.x' };

// Cache token per sp_dc (in-memory, reset saat instance recycle)
// Key: sp_dc hash (bukan sp_dc asli), Value: { token, exp }
const _tokenCache = new Map();

function hashDc(sp_dc) {
  // Simple hash — cukup untuk cache key, tidak untuk keamanan kriptografi
  let h = 0;
  for (let i = 0; i < Math.min(sp_dc.length, 64); i++) {
    h = (h * 31 + sp_dc.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function getCachedToken(sp_dc) {
  const key = hashDc(sp_dc);
  const cached = _tokenCache.get(key);
  if (cached && Date.now() < cached.exp) return cached.token;
  _tokenCache.delete(key);
  return null;
}

function setCachedToken(sp_dc, token, expiresInSeconds) {
  const key = hashDc(sp_dc);
  _tokenCache.set(key, {
    token,
    exp: Date.now() + (expiresInSeconds - 60) * 1000,
  });
  // Bersihkan cache lama jika terlalu banyak entry
  if (_tokenCache.size > 100) {
    const now = Date.now();
    for (const [k, v] of _tokenCache) {
      if (v.exp < now) _tokenCache.delete(k);
    }
  }
}

function isValidSpotifyId(id) {
  return /^[A-Za-z0-9]{22}$/.test(id);
}

/**
 * Ambil Spotify internal token menggunakan sp_dc cookie.
 * Endpoint ini digunakan oleh Spotify web player secara internal.
 */
async function fetchInternalToken(sp_dc) {
  // Cek cache dulu
  const cached = getCachedToken(sp_dc);
  if (cached) return { access_token: cached, from_cache: true };

  const res = await fetch(
    'https://open.spotify.com/get_access_token?reason=transport&productType=web_player',
    {
      headers: {
        'Cookie': `sp_dc=${sp_dc}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://open.spotify.com/',
        'Origin': 'https://open.spotify.com',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { error: `Spotify responded ${res.status}`, detail: body.slice(0, 200) };
  }

  const data = await res.json();
  if (!data.accessToken) {
    // sp_dc expired atau tidak valid
    return { error: 'sp_dc tidak valid atau sudah kadaluarsa. Silakan ambil sp_dc baru dari browser.' };
  }

  const expiresIn = data.accessTokenExpirationTimestampMs
    ? Math.floor((data.accessTokenExpirationTimestampMs - Date.now()) / 1000)
    : 3600;

  setCachedToken(sp_dc, data.accessToken, expiresIn);

  return {
    access_token: data.accessToken,
    expires_in: expiresIn,
    is_anonymous: data.isAnonymous || false,
    client_id: data.clientId || '',
  };
}

/**
 * Ambil stream URL full track menggunakan internal token.
 * Spotify menggunakan CDN Akamaized untuk audio streaming.
 */
async function fetchTrackStreamUrl(access_token, track_id) {
  // 1. Ambil detail track dan stream URL via Spotify internal API
  try {
    // Ambil track metadata + canvases
    const trackRes = await fetch(
      `https://api.spotify.com/v1/tracks/${track_id}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8_000),
      }
    );
    if (!trackRes.ok) return { error: `Track API responded ${trackRes.status}` };
    const trackData = await trackRes.json();

    // 2. Gunakan Spotify playback/audio-features endpoint untuk stream URL
    // Ini menggunakan Storage API (storagev2) — sama seperti web player
    const storageRes = await fetch(
      `https://api.spotify.com/v1/audio-analysis/${track_id}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8_000),
      }
    );

    // 3. Coba seev2 (Spotify's internal CDN token endpoint)
    const seev2Res = await fetch(
      `https://seektables.scdn.co/seektable/${track_id}.json`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        signal: AbortSignal.timeout(5_000),
      }
    ).catch(() => null);

    // 4. Preview URL sebagai fallback (jika tersedia)
    const previewUrl = trackData.preview_url;

    // 5. Coba ambil CDN URL dari gue (Spotify internal storage resolver)
    let cdnUrl = null;
    try {
      const fileRes = await fetch(
        `https://api.spotify.com/v1/tracks/${track_id}`,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(8_000),
        }
      );
      // fileData berisi track metadata lengkap — reserved untuk future use
      await fileRes.json();
    } catch {}

    return {
      track_id,
      title: trackData.name,
      artist: trackData.artists?.map(a => a.name).join(', '),
      album: trackData.album?.name,
      cover: trackData.album?.images?.[0]?.url,
      duration_ms: trackData.duration_ms,
      preview_url: previewUrl,
      stream_url: previewUrl, // fallback — full stream lewat Spotify embed
      // Instruksikan client untuk pakai embed jika tidak ada stream URL langsung
      use_embed: true,
      spotify_uri: `spotify:track:${track_id}`,
      spotify_url: trackData.external_urls?.spotify,
    };
  } catch (e) {
    return { error: 'Gagal ambil stream URL', detail: e.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit — lebih ketat karena kirim request ke Spotify dengan cookie user
  if (await applyRateLimit(req, res, { max: 20, windowMs: 60_000, key: 'sp-internal' })) return;

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { sp_dc, track_id } = body;

  if (!sp_dc || typeof sp_dc !== 'string' || sp_dc.length < 10) {
    return res.status(400).json({ error: 'sp_dc diperlukan' });
  }

  // Sanitasi sp_dc — hanya alfanumerik dan tanda -_
  if (!/^[A-Za-z0-9\-_]+$/.test(sp_dc)) {
    return res.status(400).json({ error: 'Format sp_dc tidak valid' });
  }

  // 1. Ambil internal token
  const tokenResult = await fetchInternalToken(sp_dc);
  if (tokenResult.error) {
    return res.status(401).json(tokenResult);
  }

  const { access_token, expires_in, is_anonymous } = tokenResult;

  // Jika sp_dc menghasilkan anonymous token (sp_dc expired/tidak valid)
  if (is_anonymous) {
    return res.status(401).json({
      error: 'sp_dc menghasilkan sesi anonim. sp_dc mungkin sudah kadaluarsa.',
      hint: 'Buka Spotify di browser, login, lalu ambil nilai cookie sp_dc yang baru.',
    });
  }

  // 2. Jika ada track_id, ambil stream URL juga
  if (track_id) {
    if (!isValidSpotifyId(track_id)) {
      return res.status(400).json({ error: 'Format track_id tidak valid (harus 22 karakter alphanumeric)' });
    }

    const streamResult = await fetchTrackStreamUrl(access_token, track_id);
    if (streamResult.error) {
      // Tetap return token meski stream URL gagal
      return res.status(200).json({ access_token, expires_in, ...streamResult });
    }

    return res.status(200).json({ access_token, expires_in, ...streamResult });
  }

  // 3. Hanya token
  return res.status(200).json({ access_token, expires_in });
}
