/**
 * Vercel Serverless Function: /api/jamendo
 *
 * Proxy ke Jamendo API agar client_id tidak ter-expose di kode sumber
 * (vercel.json rewrites tidak mendukung env var substitution pada destination URL).
 *
 * FIX Bug #4: sebelumnya client_id=b6747d04 hardcoded di vercel.json sehingga
 * API key bocor ke siapa saja yang melihat source code. Sekarang dibaca dari
 * environment variable JAMENDO_CLIENT_ID.
 *
 * Setup:
 *   Vercel Dashboard → Settings → Environment Variables:
 *     JAMENDO_CLIENT_ID = b6747d04   ← isi dengan client ID Jamendo kamu
 *
 *   Atau saat development:
 *     echo "JAMENDO_CLIENT_ID=b6747d04" >> .env.local
 */

import { applyRateLimit } from './_lib/rateLimit.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (await applyRateLimit(req, res, { max: 30, windowMs: 60_000, key: 'jamendo' })) return;

  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({
      error: 'Jamendo client ID not configured',
      hint: 'Set the JAMENDO_CLIENT_ID environment variable in your Vercel project settings.',
    });
  }

  const { search } = req.query;
  if (!search || !search.trim()) {
    return res.status(400).json({ error: 'Missing ?search= parameter' });
  }

  const upstream = new URL('https://api.jamendo.com/v3.0/tracks/');
  upstream.searchParams.set('client_id',   clientId);
  upstream.searchParams.set('format',      'json');
  upstream.searchParams.set('limit',       '5');
  upstream.searchParams.set('search',      search.trim());
  upstream.searchParams.set('include',     'musicinfo');
  upstream.searchParams.set('audioformat', 'mp32');

  try {
    const resp = await fetch(upstream.toString(), {
      headers: { 'User-Agent': 'StarryNightMPlayer/1.0' },
      signal: AbortSignal.timeout(8_000),
    });

    if (!resp.ok) {
      return res.status(resp.status).json({ error: `Jamendo returned ${resp.status}` });
    }

    const data = await resp.json();
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream error', detail: e.message });
  }
}
