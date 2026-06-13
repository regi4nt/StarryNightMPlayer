/**
 * Vercel Serverless: /api/radio
 *
 * Unified proxy untuk semua sumber radio yang butuh server-side fetch (CORS bypass).
 * Dispatch berdasarkan query param ?source=
 *
 * GET /api/radio?source=nts[&limit=200&offset=0]
 * GET /api/radio?source=icecast[&genre=jazz&search=blues&limit=100]
 * GET /api/radio?source=lautfm[&genre=rock&search=jazz&per_page=80&page=1]
 */

import { applyRateLimit } from './_lib/rateLimit.js';

export const config = { runtime: 'nodejs22.x', maxDuration: 20 };

// ── Helpers ─────────────────────────────────────────────────────────────────

const UA = 'Mozilla/5.0 (compatible; StarryNightMPlayer/1.0)';

function json(res, status, data, cache = 0) {
  if (cache) res.setHeader('Cache-Control', `public, max-age=${cache}`);
  return res.status(status).json(data);
}

// ── Icecast YP XML parser ────────────────────────────────────────────────────

function parseYP(xml) {
  const stations = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/gi;
  const tagRe   = /<(\w+)>([\s\S]*?)<\/\1>/g;
  let entry;
  while ((entry = entryRe.exec(xml)) !== null) {
    const block = entry[1];
    const obj = {};
    let m;
    tagRe.lastIndex = 0;
    while ((m = tagRe.exec(block)) !== null) obj[m[1]] = m[2].trim();
    if (obj.server_name && obj.listen_url) stations.push(obj);
  }
  return stations;
}

// ── Source handlers ──────────────────────────────────────────────────────────

async function handleNTS(req) {
  const limit  = Math.min(parseInt(req.query.limit  || '200', 10), 200);
  const offset = parseInt(req.query.offset || '0', 10);
  const url    = `https://www.nts.live/api/v2/shows?limit=${limit}&offset=${offset}`;

  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json', 'Referer': 'https://www.nts.live/' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw Object.assign(new Error('NTS API error'), { status: r.status });
  return { data: await r.json(), cache: 3600 };
}

async function handleIcecast(req) {
  const genre  = (req.query.genre  || '').toLowerCase();
  const search = (req.query.search || '').toLowerCase();
  const limit  = Math.min(parseInt(req.query.limit || '100', 10), 150);

  const ypUrl = genre
    ? `https://dir.xiph.org/yp.php?genre=${encodeURIComponent(genre)}`
    : 'https://dir.xiph.org/yp.php';

  const r = await fetch(ypUrl, {
    headers: { 'User-Agent': UA, 'Accept': 'text/xml,application/xml,*/*' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!r.ok) throw Object.assign(new Error('Icecast YP error'), { status: r.status });

  let stations = parseYP(await r.text());

  if (search) {
    stations = stations.filter(s =>
      (s.server_name        || '').toLowerCase().includes(search) ||
      (s.genre              || '').toLowerCase().includes(search) ||
      (s.server_description || '').toLowerCase().includes(search)
    );
  }

  const normalized = stations.slice(0, limit).map((s, i) => ({
    id:          `ice_yp_${i}_${s.server_name.replace(/\s+/g, '_').slice(0, 20)}`,
    name:        s.server_name,
    url:         s.listen_url,
    genre:       s.genre              || '',
    description: s.server_description || '',
    bitrate:     parseInt(s.bitrate   || '0', 10),
    country:     '',
    sourceLabel: 'Icecast',
    color:       '#6366f1',
  }));

  return { data: { stations: normalized, total: normalized.length }, cache: 1800 };
}

async function handleLautfm(req) {
  const page     = parseInt(req.query.page     || '1',  10);
  const per_page = Math.min(parseInt(req.query.per_page || '80', 10), 100);
  const genre    = req.query.genre  || '';
  const search   = req.query.search || '';

  const url = search
    ? `https://api.laut.fm/stations?search=${encodeURIComponent(search)}&per_page=${per_page}&page=${page}`
    : genre
      ? `https://api.laut.fm/stations/genre/${encodeURIComponent(genre)}?per_page=${per_page}&page=${page}`
      : `https://api.laut.fm/stations?per_page=${per_page}&page=${page}`;

  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw Object.assign(new Error('laut.fm API error'), { status: r.status });

  const raw  = await r.json();
  const list = Array.isArray(raw) ? raw : (raw.stations || []);

  const stations = list.map(s => ({
    id:          `lautfm_${s.name || s.id}`,
    name:        s.display_name || s.name,
    url:         s.stream_url   || `https://stream.laut.fm/${s.name}`,
    genre:       Array.isArray(s.genres) ? s.genres.map(g => g.title || g).join(', ') : (s.genre || ''),
    description: s.description  || '',
    favicon:     s.images?.station || s.logo || '',
    country:     s.country      || 'DE',
    listeners:   s.listeners    || 0,
    sourceLabel: 'FM Stream',
    color:       '#06b6d4',
  }));

  return { data: { stations, total: stations.length, page, per_page }, cache: 3600 };
}

// ── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  if (await applyRateLimit(req, res, { max: 60, windowMs: 60_000, key: 'radio' })) return;

  const source = (req.query.source || '').toLowerCase();

  const handlers = { nts: handleNTS, icecast: handleIcecast, lautfm: handleLautfm };
  const fn = handlers[source];

  if (!fn) {
    return json(res, 400, {
      error: 'Unknown source',
      valid: Object.keys(handlers),
    });
  }

  try {
    const { data, cache } = await fn(req);
    return json(res, 200, data, cache);
  } catch (e) {
    const status = e.status || 502;
    return json(res, status, { error: e.message });
  }
}
