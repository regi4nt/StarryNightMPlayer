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
 *     body: JSON.stringify({ model: 'claude-sonnet-4-20250514', messages, max_tokens: 1000 })
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

  // ── Forward ke upstream ──────────────────────────────────────
  try {
    const upstream = await provider.call(req.body, process.env);
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
//    { "source": "/api/huggingface", "destination": "/api/ai?provider=huggingface" }
//  ]
