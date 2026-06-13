/**
 * Vercel Serverless Function: /api/ai
 *
 * ══════════════════════════════════════════════════════════════
 *  UNIFIED AI PROXY — semua provider dalam 1 file
 * ══════════════════════════════════════════════════════════════
 *
 * Gantikan semua file ini dengan satu endpoint /api/ai:
 *   /api/anthropic    → POST /api/ai?provider=anthropic
 *   /api/openai       → POST /api/ai?provider=openai
 *   /api/gemini       → POST /api/ai?provider=gemini
 *   /api/groq         → POST /api/ai?provider=groq
 *   /api/grok         → POST /api/ai?provider=grok
 *   /api/deepseek     → POST /api/ai?provider=deepseek
 *   /api/openrouter   → POST /api/ai?provider=openrouter
 *   /api/cloudflare   → POST /api/ai?provider=cloudflare
 *   /api/huggingface  → POST /api/ai?provider=huggingface
 *
 * ── Cara pakai dari frontend ─────────────────────────────────
 *
 *   // OpenAI-compatible (semua provider kecuali anthropic)
 *   fetch('/api/ai?provider=openai', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 1000 })
 *   });
 *
 *   // Anthropic (format native — model + messages + max_tokens + optional system)
 *   fetch('/api/ai?provider=anthropic', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', messages, max_tokens: 1000 })
 *   });
 *
 * ── Env vars yang dibutuhkan (Vercel) ────────────────────────
 *   ANTHROPIC_API_KEY
 *   OPENAI_API_KEY
 *   GEMINI_API_KEY
 *   GROQ_API_KEY
 *   GROK_API_KEY
 *   DEEPSEEK_API_KEY
 *   OPENROUTER_API_KEY
 *   CLOUDFLARE_API_KEY + CLOUDFLARE_ACCOUNT_ID
 *   HUGGINGFACE_API_KEY
 *   GITHUB_API_KEY
 *   SAMBANOVA_API_KEY
 *
 * ── Backward compat via vercel.json rewrites ─────────────────
 *   { "source": "/api/anthropic",  "destination": "/api/ai?provider=anthropic" }
 *   { "source": "/api/openai",     "destination": "/api/ai?provider=openai" }
 *   ... dst (lihat bagian bawah file ini)
 * ─────────────────────────────────────────────────────────────
 */

import { applyRateLimit } from './_lib/rateLimit.js';

export const config = { runtime: 'nodejs' };

// ══════════════════════════════════════════════════════════════
//  BATAS KEAMANAN GLOBAL
//  Semua req.body divalidasi sebelum dikirim ke upstream.
// ══════════════════════════════════════════════════════════════

/** Token maksimum yang boleh diminta client — kurangi sesuai budget kamu */
const MAX_TOKENS_ALLOWED = 4096;

/**
 * Whitelist model per provider.
 * Tambahkan model baru di sini, bukan di frontend.
 * Kalau client kirim model yang tidak ada di list → ditolak 400.
 */
const ALLOWED_MODELS = {
  anthropic:   [
    'claude-haiku-4-5-20251001',
    'claude-sonnet-4-6',
    // tambah model Anthropic lain di sini
  ],
  openai:      [
    'gpt-4o-mini',
    'gpt-4o',
    'o4-mini',
    // tambah model OpenAI lain di sini
  ],
  gemini:      [
    'gemini-2.0-flash',
    'gemini-2.5-flash-preview-05-20',
    // tambah model Gemini lain di sini
  ],
  groq:        [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'gemma2-9b-it',
    // tambah model Groq lain di sini
  ],
  grok:        [
    'grok-3-mini',
    'grok-3',
  ],
  deepseek:    [
    'deepseek-chat',
    'deepseek-reasoner',
  ],
  openrouter:  [
    'meta-llama/llama-3.3-70b-instruct',
    'google/gemini-2.0-flash-001',
    'mistralai/mistral-7b-instruct',
    // tambah model OpenRouter lain di sini
  ],
  cloudflare:  [
    '@cf/meta/llama-3.1-8b-instruct',
    '@cf/mistral/mistral-7b-instruct-v0.1',
  ],
  huggingface: [
    'meta-llama/Llama-3.1-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3',
  ],
  github:      [
    'gpt-4o-mini',
    'gpt-4o',
    'Phi-4-mini-instruct',
  ],
  sambanova:   [
    'Meta-Llama-3.1-8B-Instruct',
    'Meta-Llama-3.3-70B-Instruct',
  ],
};

/**
 * Sanitasi req.body:
 * - Hanya ambil field yang diizinkan (messages, model, max_tokens, system, stream, temperature)
 * - Paksa model harus ada di whitelist provider
 * - Cap max_tokens ke MAX_TOKENS_ALLOWED
 * - Tolak stream: true (tidak didukung proxy ini)
 *
 * @param {object} body   - req.body mentah dari client
 * @param {string} providerName
 * @returns {{ sanitized: object }|{ error: string }}
 */
function sanitizeBody(body, providerName) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Body harus berupa JSON object.' };
  }

  const { model, messages, max_tokens, system, temperature } = body;

  // ── Validasi model ───────────────────────────────────────────
  const allowed = ALLOWED_MODELS[providerName] || [];
  if (!model || typeof model !== 'string') {
    return { error: 'Field "model" wajib diisi dan harus berupa string.' };
  }
  if (!allowed.includes(model)) {
    return {
      error: `Model "${model}" tidak diizinkan untuk provider "${providerName}".`,
      allowed_models: allowed,
    };
  }

  // ── Validasi messages ────────────────────────────────────────
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: 'Field "messages" wajib berupa array non-kosong.' };
  }

  // ── Bangun body yang bersih — hanya field yang kita izinkan ──
  const sanitized = { model, messages };

  // max_tokens: default 1024, cap ke MAX_TOKENS_ALLOWED
  const requestedTokens = Number.isInteger(max_tokens) && max_tokens > 0
    ? max_tokens
    : 1024;
  sanitized.max_tokens = Math.min(requestedTokens, MAX_TOKENS_ALLOWED);

  // system prompt (Anthropic) — opsional, harus string
  if (typeof system === 'string' && system.length > 0) {
    sanitized.system = system;
  }

  // temperature — opsional, harus number 0-2
  if (typeof temperature === 'number' && temperature >= 0 && temperature <= 2) {
    sanitized.temperature = temperature;
  }

  // stream TIDAK diteruskan — proxy ini tidak mendukung SSE streaming
  // (jika client kirim stream:true, diabaikan secara diam-diam)

  return { sanitized };
}

// ══════════════════════════════════════════════════════════════
//  KONFIGURASI PROVIDER
//  Tambah provider baru cukup di sini — tidak perlu buat file baru
// ══════════════════════════════════════════════════════════════

const PROVIDERS = {

  // ── Anthropic Claude (format native, bukan OpenAI-compat) ────
  anthropic: {
    rateLimit: { max: 20, windowMs: 60_000 },
    async call(body, env) {
      return fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    },
    envKeys: ['ANTHROPIC_API_KEY'],
  },

  // ── OpenAI ───────────────────────────────────────────────────
  openai: {
    rateLimit: { max: 20, windowMs: 60_000 },
    async call(body, env) {
      return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    },
    envKeys: ['OPENAI_API_KEY'],
  },

  // ── Google Gemini (OpenAI-compatible endpoint) ───────────────
  gemini: {
    rateLimit: { max: 20, windowMs: 60_000 },
    async call(body, env) {
      return fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GEMINI_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    },
    envKeys: ['GEMINI_API_KEY'],
  },

  // ── Groq ─────────────────────────────────────────────────────
  groq: {
    rateLimit: { max: 30, windowMs: 60_000 },
    async call(body, env) {
      return fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    },
    envKeys: ['GROQ_API_KEY'],
  },

  // ── xAI Grok ─────────────────────────────────────────────────
  grok: {
    rateLimit: { max: 20, windowMs: 60_000 },
    async call(body, env) {
      return fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROK_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    },
    envKeys: ['GROK_API_KEY'],
  },

  // ── DeepSeek ─────────────────────────────────────────────────
  deepseek: {
    rateLimit: { max: 20, windowMs: 60_000 },
    async call(body, env) {
      return fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    },
    envKeys: ['DEEPSEEK_API_KEY'],
  },

  // ── OpenRouter ───────────────────────────────────────────────
  openrouter: {
    rateLimit: { max: 30, windowMs: 60_000 },
    async call(body, env) {
      return fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://starrynight.app',
          'X-Title': 'Starry Night',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    },
    envKeys: ['OPENROUTER_API_KEY'],
  },

  // ── Cloudflare Workers AI ────────────────────────────────────
  cloudflare: {
    rateLimit: { max: 30, windowMs: 60_000 },
    async call(body, env) {
      return fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.CLOUDFLARE_API_KEY}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(30_000),
        }
      );
    },
    envKeys: ['CLOUDFLARE_API_KEY', 'CLOUDFLARE_ACCOUNT_ID'],
  },

  // ── HuggingFace Inference API ────────────────────────────────
  huggingface: {
    rateLimit: { max: 30, windowMs: 60_000 },
    async call(body, env) {
      return fetch('https://router.huggingface.co/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    },
    envKeys: ['HUGGINGFACE_API_KEY'],
  },

  // ── GitHub Models (Azure inference endpoint) ─────────────────
  github: {
    rateLimit: { max: 20, windowMs: 60_000 },
    async call(body, env) {
      return fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GITHUB_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    },
    envKeys: ['GITHUB_API_KEY'],
  },

  // ── SambaNova Cloud ──────────────────────────────────────────
  sambanova: {
    rateLimit: { max: 20, windowMs: 60_000 },
    async call(body, env) {
      return fetch('https://api.sambanova.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SAMBANOVA_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    },
    envKeys: ['SAMBANOVA_API_KEY'],
  },
};

// ══════════════════════════════════════════════════════════════
//  HANDLER UTAMA
// ══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  // ── Tentukan provider dari ?provider= atau header X-AI-Provider ──
  const providerName = (
    req.query.provider ||
    req.headers['x-ai-provider'] ||
    ''
  ).toLowerCase().trim();

  const provider = PROVIDERS[providerName];

  if (!provider) {
    return res.status(400).json({
      error: `Provider tidak dikenal: "${providerName}"`,
      available: Object.keys(PROVIDERS),
    });
  }

  // ── Rate limiting ────────────────────────────────────────────
  if (await applyRateLimit(req, res, { ...provider.rateLimit, key: providerName })) return;

  // ── Cek env vars yang dibutuhkan ─────────────────────────────
  const missingKeys = provider.envKeys.filter(k => !process.env[k]);
  if (missingKeys.length > 0) {
    return res.status(503).json({
      error: `Env var tidak terkonfigurasi di server: ${missingKeys.join(', ')}`,
    });
  }

  // ── Sanitasi & validasi body (KRITIS — jangan hapus) ─────────
  const { sanitized, error: bodyError } = sanitizeBody(req.body, providerName);
  if (bodyError) {
    return res.status(400).json({ error: bodyError });
  }

  // ── Forward ke upstream ──────────────────────────────────────
  try {
    const upstream = await provider.call(sanitized, process.env);
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({
      error: `Upstream ${providerName} request gagal`,
      detail: e.message,
    });
  }
}

// ══════════════════════════════════════════════════════════════
//  TAMBAHKAN KE vercel.json UNTUK BACKWARD COMPATIBILITY
//  (agar endpoint lama /api/anthropic dll masih jalan)
// ══════════════════════════════════════════════════════════════
//
//  "rewrites": [
//    { "source": "/api/anthropic",   "destination": "/api/ai?provider=anthropic" },
//    { "source": "/api/openai",      "destination": "/api/ai?provider=openai" },
//    { "source": "/api/gemini",      "destination": "/api/ai?provider=gemini" },
//    { "source": "/api/groq",        "destination": "/api/ai?provider=groq" },
//    { "source": "/api/grok",        "destination": "/api/ai?provider=grok" },
//    { "source": "/api/deepseek",    "destination": "/api/ai?provider=deepseek" },
//    { "source": "/api/openrouter",  "destination": "/api/ai?provider=openrouter" },
//    { "source": "/api/cloudflare",  "destination": "/api/ai?provider=cloudflare" },
//    { "source": "/api/huggingface", "destination": "/api/ai?provider=huggingface" },
//    { "source": "/api/github",      "destination": "/api/ai?provider=github" },
//    { "source": "/api/sambanova",   "destination": "/api/ai?provider=sambanova" }
//  ]
