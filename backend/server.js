/**
 * StarryNight MPlayer — Backend Converter
 * =========================================
 * Server Node.js untuk download + convert audio YouTube menggunakan yt-dlp & FFmpeg.
 * Di-hosting di Render.com atau Railway.app (gratis, persistent server).
 *
 * Endpoint:
 *   GET  /health              — health check
 *   GET  /download?videoId=   — download audio YT → MP3, stream ke client
 *   GET  /info?videoId=       — ambil metadata video (judul, artis, durasi, thumbnail)
 *
 * Environment variables (.env):
 *   PORT          — port server (default: 3001)
 *   ALLOWED_ORIGIN — URL frontend Vercel kamu (mis: https://starry.vercel.app)
 *                    Pisahkan beberapa URL dengan koma.
 *                    Default: * (semua origin, cocok untuk development)
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '*')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Izinkan request tanpa origin (mis. curl, Postman, server-to-server)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} tidak diizinkan`));
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Range', 'X-Backend-Key'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Accept-Ranges', 'X-Video-Title', 'X-Video-Artist', 'X-Video-Duration'],
}));

app.options('*', cors());
app.use(express.json());

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,        // 1 menit
  max: 30,                     // maks 30 request per IP per menit
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak request, coba lagi sebentar.' },
});
app.use('/download', limiter);
app.use('/info', limiter);

// ── Optional: Backend API Key (opsional, untuk membatasi akses) ──────────────
// Jika BACKEND_KEY diset di env, setiap request harus kirim header X-Backend-Key
const BACKEND_KEY = process.env.BACKEND_KEY || '';
function checkKey(req, res, next) {
  if (!BACKEND_KEY) return next(); // tidak ada key = semua boleh akses
  const provided = req.headers['x-backend-key'] || req.query.key || '';
  if (provided !== BACKEND_KEY) {
    return res.status(401).json({ error: 'Backend key tidak valid' });
  }
  next();
}

// ── Deteksi yt-dlp ────────────────────────────────────────────────────────────
function findYtDlp() {
  const candidates = ['yt-dlp', '/usr/local/bin/yt-dlp', '/usr/bin/yt-dlp'];
  for (const c of candidates) {
    try { execSync(`${c} --version`, { stdio: 'ignore' }); return c; }
    catch { /* tidak ada */ }
  }
  return null;
}

// ── Deteksi ffmpeg ────────────────────────────────────────────────────────────
function findFfmpeg() {
  const candidates = ['ffmpeg', '/usr/local/bin/ffmpeg', '/usr/bin/ffmpeg', '/nix/store/*/bin/ffmpeg'];
  for (const c of candidates) {
    if (c.includes('*')) continue; // skip glob
    try { execSync(`${c} -version`, { stdio: 'ignore' }); return c; }
    catch { /* tidak ada */ }
  }
  return null;
}

const YTDLP  = findYtDlp();
const FFMPEG = findFfmpeg();

console.log(`[StarryNight Backend] yt-dlp : ${YTDLP  || '❌ tidak ditemukan'}`);
console.log(`[StarryNight Backend] ffmpeg : ${FFMPEG || '❌ tidak ditemukan'}`);
if (!YTDLP)  console.warn('[WARN] yt-dlp tidak terinstall! Jalankan: pip install yt-dlp');
if (!FFMPEG) console.warn('[WARN] ffmpeg tidak terinstall! Install via apt/brew/winget.');

// ── Validasi videoId ──────────────────────────────────────────────────────────
function isValidVideoId(id) {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

// ── GET /health ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    ytdlp:  !!YTDLP,
    ffmpeg: !!FFMPEG,
    ready:  !!(YTDLP && FFMPEG),
    version: '1.0.0',
  });
});

// ── GET /info?videoId=<id> ────────────────────────────────────────────────────
// Ambil metadata video tanpa download
app.get('/info', checkKey, async (req, res) => {
  const { videoId } = req.query;
  if (!videoId || !isValidVideoId(videoId)) {
    return res.status(400).json({ error: 'videoId tidak valid' });
  }
  if (!YTDLP) return res.status(503).json({ error: 'yt-dlp tidak terinstall di server' });

  const args = [
    '--dump-json',
    '--no-playlist',
    '--socket-timeout', '15',
    `https://www.youtube.com/watch?v=${videoId}`,
  ];

  let output = '';
  const proc = spawn(YTDLP, args);
  proc.stdout.on('data', d => { output += d.toString(); });
  proc.stderr.on('data', () => {}); // abaikan stderr

  proc.on('close', code => {
    if (code !== 0 || !output.trim()) {
      return res.status(404).json({ error: 'Video tidak ditemukan atau tidak dapat diakses' });
    }
    try {
      const info = JSON.parse(output);
      res.json({
        videoId,
        title:     info.title     || '',
        artist:    info.uploader  || info.channel || 'YouTube',
        album:     'YouTube',
        duration:  info.duration  || 0,
        thumbnail: info.thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        webpage:   info.webpage_url || `https://youtu.be/${videoId}`,
      });
    } catch {
      res.status(500).json({ error: 'Gagal parse metadata video' });
    }
  });

  proc.on('error', e => res.status(500).json({ error: 'yt-dlp error: ' + e.message }));
});

// ── GET /download?videoId=<id>&format=mp3|opus|m4a ───────────────────────────
// Download audio YT dan stream ke client sebagai MP3 (default)
app.get('/download', checkKey, (req, res) => {
  const { videoId, format = 'mp3' } = req.query;

  if (!videoId || !isValidVideoId(videoId)) {
    return res.status(400).json({ error: 'videoId tidak valid' });
  }
  if (!YTDLP) {
    return res.status(503).json({ error: 'yt-dlp tidak terinstall di server' });
  }
  if (!FFMPEG) {
    return res.status(503).json({ error: 'ffmpeg tidak terinstall di server' });
  }

  const safeFormat = ['mp3', 'opus', 'm4a'].includes(format) ? format : 'mp3';

  // Tentukan codec + MIME berdasarkan format
  const codecMap = {
    mp3:  { codec: 'libmp3lame', quality: '5', mime: 'audio/mpeg',      ext: 'mp3' },
    opus: { codec: 'libopus',    quality: '0', mime: 'audio/ogg',       ext: 'ogg' },
    m4a:  { codec: 'aac',        quality: '2', mime: 'audio/mp4',       ext: 'm4a' },
  };
  const { codec, quality, mime, ext } = codecMap[safeFormat];

  // ── Langkah 1: yt-dlp —— ambil URL audio stream terbaik dari YouTube ──────
  // yt-dlp -g: print URL audio stream tanpa download file
  const ytArgs = [
    '-f', 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio',
    '-g',                           // hanya print URL
    '--no-playlist',
    '--socket-timeout', '15',
    `https://www.youtube.com/watch?v=${videoId}`,
  ];

  const ytProc = spawn(YTDLP, ytArgs);
  let audioUrl = '';
  let ytErr    = '';

  ytProc.stdout.on('data', d => { audioUrl += d.toString(); });
  ytProc.stderr.on('data', d => { ytErr    += d.toString(); });

  ytProc.on('close', (code) => {
    audioUrl = audioUrl.trim().split('\n')[0];

    if (code !== 0 || !audioUrl) {
      console.error(`[yt-dlp] exit ${code}: ${ytErr.slice(0, 200)}`);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Gagal ambil URL audio dari YouTube', detail: ytErr.slice(0, 300) });
      }
      return;
    }

    // ── Langkah 2: ffmpeg —— fetch audioUrl → convert → stream ke client ───
    // ffmpeg membaca URL audio langsung dari YouTube CDN, convert ke MP3/Opus/M4A,
    // lalu pipe stdout → response Express → browser.
    const ffArgs = [
      '-reconnect', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-user_agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      '-i', audioUrl,               // input: URL audio stream YouTube
      '-vn',                        // no video
      '-acodec', codec,
      ...(safeFormat === 'mp3'  ? ['-q:a', quality] : []),
      ...(safeFormat === 'opus' ? ['-b:a', '128k']  : []),
      ...(safeFormat === 'm4a'  ? ['-b:a', '192k']  : []),
      '-f', ext === 'ogg' ? 'ogg' : ext === 'm4a' ? 'mp4' : 'mp3',
      'pipe:1',                     // output: stdout
    ];

    if (!res.headersSent) {
      res.setHeader('Content-Type', mime);
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Accept-Ranges', 'none');
      res.setHeader('Cache-Control', 'no-store');
      // Header metadata video (dibaca frontend untuk nama file download)
      res.setHeader('Access-Control-Expose-Headers',
        'X-Video-Title, X-Video-Artist, X-Video-Duration, Content-Type');
    }

    const ffProc = spawn(FFMPEG, ffArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

    // Pipe ffmpeg stdout → response
    ffProc.stdout.pipe(res);

    let ffErr = '';
    ffProc.stderr.on('data', d => { ffErr += d.toString(); });

    ffProc.on('close', (code) => {
      if (code !== 0 && !res.writableEnded) {
        console.error(`[ffmpeg] exit ${code}: ${ffErr.slice(-300)}`);
      }
      if (!res.writableEnded) res.end();
    });

    ffProc.on('error', (e) => {
      console.error('[ffmpeg] spawn error:', e.message);
      if (!res.writableEnded) res.end();
    });

    // Jika client disconnect, kill ffmpeg agar tidak sia-sia
    req.on('close', () => {
      if (!ffProc.killed) ffProc.kill('SIGTERM');
    });
  });

  ytProc.on('error', (e) => {
    console.error('[yt-dlp] spawn error:', e.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'yt-dlp tidak dapat dijalankan: ' + e.message });
    }
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint ${req.method} ${req.path} tidak ditemukan` });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 StarryNight Backend berjalan di port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Download    : http://localhost:${PORT}/download?videoId=dQw4w9WgXcQ`);
  console.log(`   Info        : http://localhost:${PORT}/info?videoId=dQw4w9WgXcQ\n`);
});
