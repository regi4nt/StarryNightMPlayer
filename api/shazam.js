/**
 * Vercel Serverless Function: /api/shazam
 *
 * ══════════════════════════════════════════════════════════════
 *  AUDIO RECOGNITION — 2 layanan GRATIS (tanpa trial, tanpa CC)
 * ══════════════════════════════════════════════════════════════
 *
 *  Urutan fallback:
 *
 *  1. AudD.io         — 10 req/hari TANPA key, ~300/bulan dengan key gratis
 *                       Daftar: https://audd.io (tanpa kartu kredit)
 *
 *  2. Acoustid        — GRATIS SELAMANYA, open source (MusicBrainz)
 *                       Daftar: https://acoustid.org/login → buat aplikasi
 *
 *  3. Shazam (Rapid)  — 500 req/bulan gratis
 *                       Daftar: https://rapidapi.com → search "Shazam" → Subscribe Basic
 *
 * ── Env vars (semua OPSIONAL) ─────────────────────────────────
 *
 *   AUDD_API_TOKEN     dari https://audd.io
 *   ACOUSTID_API_KEY   dari https://acoustid.org
 *   RAPIDAPI_KEY       dari https://rapidapi.com
 *
 * ── Request body (JSON) ───────────────────────────────────────
 *   { audio: "<base64>", format: "webm" | "ogg" | "mp4" }
 *
 * ── Response sukses ───────────────────────────────────────────
 *   { success: true, title, artist, album, source, extra }
 *
 * ── Response gagal ────────────────────────────────────────────
 *   { success: false, msg, tried: [...] }
 */

import crypto from 'crypto';

export const config = {
  runtime: 'nodejs',
  api: { bodyParser: { sizeLimit: '12mb' } },
};

// ══════════════════════════════════════════════════════════════
//  HELPER: build multipart/form-data buffer
// ══════════════════════════════════════════════════════════════
function buildMultipart(fields, fileField) {
  const boundary = '----SNBoundary' + crypto.randomBytes(8).toString('hex');
  const parts = [];

  for (const [name, value] of Object.entries(fields)) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
        'utf8'
      )
    );
  }

  if (fileField) {
    const { name, filename, contentType, buffer } = fileField;
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`,
        'utf8'
      )
    );
    parts.push(buffer);
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8'));
  } else {
    parts.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
  }

  return { body: Buffer.concat(parts), boundary };
}

// ══════════════════════════════════════════════════════════════
//  PROVIDER 1 — AudD.io
//  Gratis: 10 req/hari tanpa key | ~300/bulan dengan key gratis
//  Daftar: https://audd.io (tanpa kartu kredit)
// ══════════════════════════════════════════════════════════════
async function tryAudd(audioBuffer, format, env) {
  const fields = { return: 'timecode,apple_music,spotify' };
  if (env.AUDD_API_TOKEN) fields.api_token = env.AUDD_API_TOKEN;

  const { body, boundary } = buildMultipart(fields, {
    name:        'file',
    filename:    `audio.${format}`,
    contentType: `audio/${format}`,
    buffer:      audioBuffer,
  });

  const res = await fetch('https://api.audd.io/', {
    method: 'POST',
    headers: {
      'Content-Type':   `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length.toString(),
    },
    body,
    signal: AbortSignal.timeout(12_000),
  });

  const data = await res.json();

  if (data.status === 'success' && data.result) {
    const r = data.result;
    return {
      title:  r.title  || '',
      artist: r.artist || '',
      album:  r.album  || '',
      source: 'AudD.io',
      extra: {
        releaseDate: r.release_date || '',
        songLink:    r.song_link    || '',
        spotify:     r.spotify      || null,
        appleMusic:  r.apple_music  || null,
      },
    };
  }

  return null;
}

// ══════════════════════════════════════════════════════════════
//  PROVIDER 2 — Acoustid  (MusicBrainz / open source)
//  Gratis: tanpa batas request, selamanya
//  Daftar: https://acoustid.org/login → buat aplikasi → dapat key
//
//  Memerlukan fingerprint Chromaprint dari audio.
//  Menggunakan npm package `fpcalc` yang membungkus fpcalc binary.
// ══════════════════════════════════════════════════════════════
async function tryAcoustid(audioBuffer, format, env) {
  const apiKey = env.ACOUSTID_API_KEY;
  if (!apiKey) return null;

  let fpcalc;
  try {
    const mod = await import('fpcalc').catch(() => null);
    fpcalc = mod?.default || mod;
  } catch {
    fpcalc = null;
  }
  if (!fpcalc) return null;

  const { writeFile, unlink } = await import('fs/promises');
  const tmpPath = `/tmp/shazam_${Date.now()}.${format}`;

  try {
    await writeFile(tmpPath, audioBuffer);

    const result = await new Promise((resolve, reject) => {
      fpcalc(tmpPath, { length: 10 }, (err, data) => {
        if (err) reject(err); else resolve(data);
      });
    });

    await unlink(tmpPath).catch(() => {});

    if (!result?.fingerprint || !result?.duration) return null;

    const params = new URLSearchParams({
      client:      apiKey,
      duration:    Math.round(result.duration).toString(),
      fingerprint: result.fingerprint,
      meta:        'recordings+releasegroups',
    });

    const res = await fetch(`https://api.acoustid.org/v2/lookup?${params}`, {
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();

    if (data.status === 'ok' && data.results?.length > 0) {
      const rec = data.results[0].recordings?.[0];
      if (rec) {
        return {
          title:  rec.title                      || '',
          artist: rec.artists?.[0]?.name         || '',
          album:  rec.releasegroups?.[0]?.title  || '',
          source: 'Acoustid (MusicBrainz)',
          extra:  { mbid: rec.id },
        };
      }
    }
    return null;
  } catch {
    await unlink(tmpPath).catch(() => {});
    return null;
  }
}


// ══════════════════════════════════════════════════════════════
//  PROVIDER 3 — Shazam via RapidAPI
//  Gratis: 500 req/bulan (Basic plan, tanpa kartu kredit)
//  Daftar: https://rapidapi.com → search "Shazam" → Subscribe Basic
//  Env var: RAPIDAPI_KEY
// ══════════════════════════════════════════════════════════════
async function tryShazamRapid(audioBuffer, env) {
  const apiKey = env.RAPIDAPI_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://shazam.p.rapidapi.com/songs/detect', {
    method: 'POST',
    headers: {
      'content-type':      'text/plain',
      'X-RapidAPI-Key':    apiKey,
      'X-RapidAPI-Host':   'shazam.p.rapidapi.com',
    },
    body:   audioBuffer,
    signal: AbortSignal.timeout(12_000),
  });

  const data = await res.json();
  if (!data?.track) return null;

  const track    = data.track;
  const sections = track.sections || [];
  const songMeta = sections.find(s => s.type === 'SONG');
  const album    = songMeta?.metadata?.find(m => m.title === 'Album')?.text || '';
  const label    = songMeta?.metadata?.find(m => m.title === 'Label')?.text || '';

  return {
    title:  track.title    || '',
    artist: track.subtitle || '',
    album,
    source: 'Shazam (RapidAPI)',
    extra:  { label, shazamUrl: track.url || '' },
  };
}

// ══════════════════════════════════════════════════════════════
//  HANDLER UTAMA
// ══════════════════════════════════════════════════════════════
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { audio, format: rawFormat = 'webm' } = req.body || {};
  if (!audio) return res.status(400).json({ error: 'Field "audio" (base64) wajib ada' });

  // FIX Bug #2: whitelist format agar tidak bisa dipakai untuk path traversal.
  // Tanpa ini, nilai seperti "../etc/passwd" bisa membentuk path /tmp/shazam_xxx.../etc/passwd
  const ALLOWED_FORMATS = ['webm', 'ogg', 'mp4'];
  const format = ALLOWED_FORMATS.includes(rawFormat) ? rawFormat : 'webm';

  let audioBuffer;
  try {
    audioBuffer = Buffer.from(audio, 'base64');
  } catch {
    return res.status(400).json({ error: 'Audio base64 tidak valid' });
  }

  const env   = process.env;
  const tried = [];

  const providers = [
    { name: 'AudD.io',              fn: () => tryAudd(audioBuffer, format, env)         },
    { name: 'Acoustid/MusicBrainz', fn: () => tryAcoustid(audioBuffer, format, env)     },
    { name: 'Shazam (RapidAPI)',    fn: () => tryShazamRapid(audioBuffer, env)          },
  ];

  for (const { name, fn } of providers) {
    tried.push(name);
    try {
      const result = await fn();
      if (result) return res.json({ success: true, ...result });
    } catch (e) {
      console.warn(`[shazam] ${name} error:`, e.message);
    }
  }

  return res.json({ success: false, msg: 'Lagu tidak dikenali', tried });
}
