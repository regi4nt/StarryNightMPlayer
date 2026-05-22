/**
 * Shared rate limiter — diimpor oleh semua Vercel Serverless Functions di /api/
 *
 * Strategi: in-memory sliding window per IP.
 * Karena Vercel serverless bisa scale ke banyak instance, counter tidak shared
 * antar instance — tapi tetap efektif menghentikan burst dari satu IP.
 *
 * ── Upgrade ke Upstash Redis (akurat lintas instance) ────────
 * 1. npm install @upstash/ratelimit @upstash/redis
 * 2. Vercel env vars:
 *      UPSTASH_REDIS_REST_URL   = https://xxx.upstash.io
 *      UPSTASH_REDIS_REST_TOKEN = AXxx...
 * 3. Uncomment blok UPSTASH di bawah, comment blok IN-MEMORY
 * ─────────────────────────────────────────────────────────────
 */

// ══════════════════════════════════════════════════════════════
//  IN-MEMORY MODE (default)
// ══════════════════════════════════════════════════════════════

const store = new Map();
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
}

/**
 * @param {string} ip
 * @param {object} opts { max: number, windowMs: number }
 * @param {string} key  unique key per endpoint, e.g. 'openai'
 * @returns {{ allowed: boolean, remaining: number, resetAt: number, max: number }}
 */
export function checkRateLimit(ip, { max, windowMs }, key) {
  cleanup();
  const storeKey = `${ip}:${key}`;
  const now = Date.now();

  let e = store.get(storeKey);
  if (!e || now > e.resetAt) {
    e = { count: 1, resetAt: now + windowMs };
    store.set(storeKey, e);
    return { allowed: true, remaining: max - 1, resetAt: e.resetAt, max };
  }

  e.count++;
  return {
    allowed:   e.count <= max,
    remaining: Math.max(0, max - e.count),
    resetAt:   e.resetAt,
    max,
  };
}

// ══════════════════════════════════════════════════════════════
//  UPSTASH MODE (uncomment setelah install + env vars diset)
//  npm install @upstash/ratelimit @upstash/redis
// ══════════════════════════════════════════════════════════════
/*
import { Ratelimit } from '@upstash/ratelimit';
import { Redis }     from '@upstash/redis';

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const limiters = {};
function getLimiter(max, windowMs) {
  const k = `${max}:${windowMs}`;
  if (!limiters[k]) {
    limiters[k] = new Ratelimit({
      redis,
      limiter:   Ratelimit.slidingWindow(max, `${windowMs}ms`),
      analytics: true,
    });
  }
  return limiters[k];
}

export async function checkRateLimit(ip, { max, windowMs }, key) {
  const { success, remaining, reset } = await getLimiter(max, windowMs).limit(`${ip}:${key}`);
  return { allowed: success, remaining, resetAt: reset, max };
}
*/

/**
 * Helper: jalankan rate limit check dan kirim response 429 jika terlampaui.
 * Return true  → request diblokir (caller harus return segera)
 * Return false → request boleh lanjut
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse}  res
 * @param {object} opts { max, windowMs, key }
 */
export async function applyRateLimit(req, res, { max, windowMs, key }) {
  const ip =
    (req.headers['x-real-ip'] ||
     req.headers['x-forwarded-for']?.split(',')[0] ||
     req.socket?.remoteAddress ||
     '127.0.0.1').trim();

  const result = await checkRateLimit(ip, { max, windowMs }, key);

  res.setHeader('X-RateLimit-Limit',     String(result.max));
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  res.setHeader('X-RateLimit-Reset',     String(Math.ceil(result.resetAt / 1000)));

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({
      error:      'Too Many Requests',
      message:    `Batas request tercapai. Coba lagi dalam ${retryAfter} detik.`,
      retryAfter,
    });
    return true; // diblokir
  }

  return false; // lanjut
}
