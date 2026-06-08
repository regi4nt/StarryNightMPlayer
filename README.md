# 🌌 Starry Night Music Player

Music player bertema luar angkasa, dibangun dengan React + Vite + Tailwind CSS, didukung multi-provider AI.

![Starry Night Music Player](https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&h=400&fit=crop)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/starry-night-mplayer&env=VITE_ANTHROPIC_API_KEY&envDescription=Get%20your%20key%20at%20console.anthropic.com&project-name=starry-night-mplayer)

---

## ✨ Fitur

**Pemutaran**
- 🎵 Player lokal — upload MP3/FLAC/WAV/OGG dari perangkat atau Google Drive
- 📻 Radio live — RadioBrowser (50.000+ stasiun), SomaFM, NTS, Radio Garden
- 🎬 Streaming embed — YouTube Music, SoundCloud, Spotify, dan 600+ platform lain
- 🔍 Web search audio — Jamendo, ccMixter, Free Music Archive, Audius
- 🔁 Repeat / shuffle / sleep timer / antrian putar

**AI (multi-provider, race ke yang tercepat)**
- 🔮 Vibe Search — deskripsikan mood, AI temukan lagunya
- ✨ Cosmic Insight — puisi singkat tentang lagu yang sedang diputar
- 💬 Chat Starry AI — asisten musik yang tahu lagu aktif & cuaca saat ini
- 🎯 For You — rekomendasi lagu personal berdasarkan histori
- 🎵 Lyrics + terjemahan + romanisasi (LRCLib + AI)
- 🎙️ Shazam — kenali lagu dari mikrofon atau audio perangkat

**Tampilan & UX**
- 🌌 9 tema background animasi: Starry, Bedroom, Journey, Ocean, Fantasy, Future City, Night Garden, Night Highway, Solar System
- ⚡ Mode Lite — matikan semua animasi & fitur AI, hemat baterai & data (auto-aktif di RAM ≤ 2GB)
- 📱 Responsif penuh: mobile portrait/landscape, desktop portrait/landscape
- 🔧 PWA — bisa diinstall di HP seperti aplikasi native
- 🌐 Bilingual — Indonesia / English

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| AI Proxy | Vercel Serverless Functions |
| AI Providers | Claude, GPT, Gemini, Groq, DeepSeek, Grok, OpenRouter, dll |
| Deployment | Vercel |
| PWA | vite-plugin-pwa + Workbox |
| Rate Limiting | Upstash Redis (opsional) |

---

## 🚀 Jalankan Lokal

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/starry-night-mplayer.git
cd starry-night-mplayer

# 2. Install (butuh Node.js 20+)
npm install

# 3. Buat file env
cp .env.example .env.local
# Isi minimal satu API key AI di .env.local (lihat bagian Environment Variables)

# 4. Jalankan
npm run dev
# Buka http://localhost:5173
```

---

## 🌐 Deploy ke Vercel

### Step 1 — Push ke GitHub

```bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/starry-night-mplayer.git
git push -u origin main
```

### Step 2 — Import di Vercel

1. Buka [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. Pilih repo yang baru di-push
3. Tambahkan environment variables (lihat tabel di bawah)
4. Klik **Deploy** ✅

### Step 3 — GitHub Secrets untuk CI/CD otomatis

Di GitHub repo → **Settings → Secrets and variables → Actions**:

| Secret | Cara dapat |
|---|---|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Jalankan `vercel` CLI → lihat `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | File `.vercel/project.json` yang sama |

Setelah ini, setiap push ke `main` akan auto-deploy ke production.

---

## 🔑 Environment Variables

Semua key bersifat opsional — app tetap jalan tanpa satu pun. Tambahkan sesuai fitur yang ingin diaktifkan.

### AI Providers (minimal satu untuk fitur AI)

| Variable | Provider | Cara dapat |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude (Haiku/Sonnet) | [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | GPT-4o / GPT-3.5 | [platform.openai.com](https://platform.openai.com) |
| `GEMINI_API_KEY` | Gemini 2.0 Flash | [aistudio.google.com](https://aistudio.google.com) |
| `GROQ_API_KEY` | Llama / Gemma (cepat) | [console.groq.com](https://console.groq.com) |
| `GROK_API_KEY` | Grok 3 | [console.x.ai](https://console.x.ai) |
| `DEEPSEEK_API_KEY` | DeepSeek V3 / R1 | [platform.deepseek.com](https://platform.deepseek.com) |
| `OPENROUTER_API_KEY` | 100+ model (ada yang gratis) | [openrouter.ai](https://openrouter.ai) |
| `CLOUDFLARE_API_KEY` + `CLOUDFLARE_ACCOUNT_ID` | Llama / Qwen via Cloudflare | [dash.cloudflare.com](https://dash.cloudflare.com) |
| `HUGGINGFACE_API_KEY` | Llama / Qwen via HuggingFace | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `GITHUB_API_KEY` | GPT-4o / Llama via GitHub | [github.com/settings/tokens](https://github.com/settings/tokens) |
| `SAMBANOVA_API_KEY` | Llama / Qwen via SambaNova | [cloud.sambanova.ai](https://cloud.sambanova.ai) |

> App menggunakan race — semua provider yang ada key-nya dipanggil bersamaan, respons tercepat yang dipakai.

### Fitur Lainnya

| Variable | Fungsi |
|---|---|
| `GOOGLE_CLIENT_ID` | Login Google Drive (upload/stream lagu dari Drive) |
| `YOUTUBE_API_KEY` | YouTube search via Google API (fallback ke Piped/Invidious jika kosong) |
| `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET` | Search & preview Spotify |
| `JAMENDO_CLIENT_ID` | Search audio gratis Jamendo |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Rate limiting via Redis (opsional, ada fallback in-memory) |

---

## 📁 Struktur Project

```
starry-night-mplayer/
├── api/                        # Vercel Serverless Functions
│   ├── _lib/
│   │   └── rateLimit.js        # Rate limiting (Upstash Redis / in-memory)
│   ├── ai.js                   # Proxy multi-provider AI
│   ├── jamendo.js              # Proxy Jamendo API
│   ├── radio-proxy.js          # Proxy stream radio HTTP→HTTPS
│   ├── radio.js                # RadioBrowser search
│   ├── shazam.js               # Identifikasi lagu
│   ├── spotify-token.js        # Spotify client credentials flow
│   ├── youtube.js              # YouTube search (API + Piped + Invidious)
│   └── yt-status.js            # Cek ketersediaan YouTube API key
├── public/
│   ├── favicon.svg
│   ├── icon-192.png / icon-512.png
│   ├── manifest.webmanifest    # PWA manifest
│   └── screenshot-*.png
├── src/
│   ├── components/
│   │   ├── Player.jsx          # Komponen player (progress ring, kontrol)
│   │   ├── PlaylistViews.jsx   # Tampilan playlist & form
│   │   ├── SettingsPanel.jsx   # Panel pengaturan
│   │   ├── SongRow.jsx         # Baris lagu di library
│   │   ├── UploadModal.jsx     # Modal upload file
│   │   └── PlatformLogo.jsx    # Logo platform streaming
│   ├── App.jsx                 # Komponen utama (~13.500 baris)
│   ├── constants.js            # Konstanta, SONGS, provider AI, utilitas
│   ├── index.css               # Global styles + animasi tema
│   ├── main.jsx                # Entry point React
│   ├── radioStations.js        # Data stasiun radio built-in
│   ├── reducers.js             # useReducer untuk state besar (search, radio, dll)
│   ├── streamingPlatforms.js   # Data 600+ platform streaming (lazy loaded)
│   ├── translations.js         # String UI Indonesia/English
│   └── useMemoizedValues.js    # Custom hooks useMemo untuk performa
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── vercel.json                 # Routing SPA + cache headers
└── vite.config.js              # Vite + PWA + manual chunk splitting
```

---

## 📝 NPM Scripts

```bash
npm run dev      # Dev server (http://localhost:5173)
npm run build    # Build production → /dist
npm run preview  # Preview hasil build secara lokal
```

---

## ⚙️ Kustomisasi

### Menambah lagu built-in

Edit array `SONGS` di `src/constants.js`:

```js
{
  id: 10,
  title: "Judul Lagu",
  artist: "Nama Artist",
  album: "Nama Album",
  cover: "https://url-gambar.jpg",
  src: "https://url-audio.mp3",
  color: "#6366f1",
  bg: "rgba(99,102,241,0.15)",
  mood: "chill, lo-fi"
}
```

### Menambah stasiun radio

Edit `src/radioStations.js` atau tambah stasiun via UI (tab Stream → RadioBrowser).

### Menambah domain radio ke proxy

Edit `ALLOWED_DOMAINS` di `api/radio-proxy.js`:

```js
const ALLOWED_DOMAINS = [
  'stream.live.vc.bbcmedia.co.uk',
  'nama-domain-stream-kamu.com',   // ← tambah di sini
];
```

---

## 📄 Lisensi

MIT
