/**
 * Shared rate limiter — diimpor oleh semua Vercel Serverless Functions di /api/
 *
 * Strategi: HYBRID — otomatis pilih backend tergantung environment:
 *
 *   • Jika UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN tersedia
 *     → gunakan Upstash Redis (sliding window, akurat lintas instance)
 *   • Jika tidak ada env vars tersebut
 *     → fallback ke in-memory sliding window (cukup untuk dev / single-instance)
 *
 * FIX Bug #2: sebelumnya selalu in-memory sehingga setiap Vercel cold-start
 * mendapat counter baru — user bisa bypass limit dengan menekan banyak instance.
 * Sekarang jika env vars Upstash diset, semua instance berbagi counter yang sama.
 *
 * ── Setup Upstash (opsional, disarankan untuk production) ─────────────────
 * 1. npm install @upstash/ratelimit @upstash/redis
 * 2. Tambah di Vercel Dashboard → Settings → Environment Variables:
 *      UPSTASH_REDIS_REST_URL   = https://xxx.upstash.io
 *      UPSTASH_REDIS_REST_TOKEN = AXxx...
 * ─────────────────────────────────────────────────────────────────────────
 */

// ── Tentukan backend saat module di-load (sekali per instance) ─────────────
const USE_UPSTASH =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

// ══════════════════════════════════════════════════════════════
//  IN-MEMORY BACKEND (fallback jika Upstash tidak dikonfigurasi)
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

function checkRateLimitInMemory(ip, { max, windowMs }, key) {
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
//  UPSTASH BACKEND (aktif jika env vars tersedia)
// ══════════════════════════════════════════════════════════════

let _upstashLimiters = null; // lazy-init agar tidak crash jika package tidak ada

async function checkRateLimitUpstash(ip, { max, windowMs }, key) {
  // Lazy import — tidak crash jika @upstash/* belum di-install
  if (!_upstashLimiters) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const { Redis }     = await import('@upstash/redis');
      const redis = new Redis({
        url:   process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      _upstashLimiters = { Ratelimit, redis, cache: {} };
    } catch {
      // Package belum di-install → fallback in-memory untuk request ini
      return checkRateLimitInMemory(ip, { max, windowMs }, key);
    }
  }

  const { Ratelimit, redis, cache } = _upstashLimiters;
  const limiterKey = `${max}:${windowMs}`;
  if (!cache[limiterKey]) {
    cache[limiterKey] = new Ratelimit({
      redis,
      limiter:   Ratelimit.slidingWindow(max, `${windowMs}ms`),
      analytics: false,
    });
  }

  const { success, remaining, reset } = await cache[limiterKey].limit(`${ip}:${key}`);
  return { allowed: success, remaining, resetAt: reset, max };
}

// ══════════════════════════════════════════════════════════════
//  UNIFIED ENTRY POINT
// ══════════════════════════════════════════════════════════════

/**
 * @param {string} ip
 * @param {object} opts { max: number, windowMs: number }
 * @param {string} key  unique key per endpoint, e.g. 'openai'
 * @returns {{ allowed: boolean, remaining: number, resetAt: number, max: number }}
 */
export function checkRateLimit(ip, { max, windowMs }, key) {
  if (USE_UPSTASH) {
    return checkRateLimitUpstash(ip, { max, windowMs }, key);
  }
  return Promise.resolve(checkRateLimitInMemory(ip, { max, windowMs }, key));
}

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
