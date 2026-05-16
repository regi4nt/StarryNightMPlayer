# 🌌 Starry Night Music Player

A space-themed music player built with **React + Vite + Tailwind CSS** — powered by Claude AI (Anthropic).

![Starry Night Music Player](https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&h=400&fit=crop)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/starry-night-mplayer&env=VITE_ANTHROPIC_API_KEY&envDescription=Get%20your%20key%20at%20console.anthropic.com&project-name=starry-night-mplayer)

---

## ✨ Features

- 🎵 Music player with orbital progress ring animation
- 🌠 AI Astral Insights for each track (powered by Claude)
- 🔮 AI Vibe Search — describe your mood, find the perfect track
- 🤖 Cosmic Navigator chat assistant
- 🌌 Animated starfield background
- 📱 Fully responsive (mobile & desktop)
- ⚡ PWA-ready (installable on mobile)
- 🚀 Auto-deploy via GitHub Actions → Vercel

---

## 🚀 Quick Start (Local Dev)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/starry-night-mplayer.git
cd starry-night-mplayer

# 2. Install
npm install

# 3. Set up env vars
cp .env.example .env.local
# Edit .env.local dan paste Anthropic API key kamu

# 4. Run
npm run dev
# Buka http://localhost:5173
```

---

## 🌐 Deploy: GitHub + Vercel (Auto CI/CD)

Proyek ini sudah dilengkapi GitHub Actions workflow yang **otomatis deploy ke Vercel** setiap push ke `main`.

### Step 1 — Push ke GitHub

```bash
git init
git add .
git commit -m "feat: initial starry night mplayer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/starry-night-mplayer.git
git push -u origin main
```

### Step 2 — Connect ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Klik **"Import Git Repository"** → pilih repo kamu
3. Di bagian **Environment Variables**, tambahkan:
   ```
   VITE_ANTHROPIC_API_KEY = sk-ant-your-key-here
   ```
4. Klik **Deploy** ✅

### Step 3 — Tambah GitHub Secrets (untuk CI/CD workflow)

Di GitHub repo → **Settings → Secrets and variables → Actions**, tambahkan:

| Secret | Cara dapat |
|---|---|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Jalankan `vercel` CLI sekali → cek `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | File `.vercel/project.json` yang sama |
| `VITE_ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |

### Step 4 — Selesai! 🎉

Mulai sekarang:
- Push ke `main` → **auto-deploy ke production**
- Buka Pull Request → **auto-deploy preview URL** (di-comment di PR)

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| AI | Anthropic Claude API |
| CI/CD | GitHub Actions |
| Deployment | Vercel |
| PWA | vite-plugin-pwa + Workbox |

---

## 📁 Project Structure

```
starry-night-mplayer/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Auto-deploy ke Vercel saat push
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── App.jsx             # Komponen utama
│   ├── index.css           # Global styles + animasi
│   └── main.jsx            # React entry point
├── .env.example            # ← Copy ke .env.local & isi key
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json             # SPA routing + cache headers
└── vite.config.js          # Vite + PWA config
```

---

## 🎨 Kustomisasi

### Menambah lagu

Edit array `SONGS_DATA` di `src/App.jsx`:

```js
{
  id: 5,
  title: "Judul Lagu",
  artist: "Nama Artist",
  cover: "https://url-gambar.jpg",
  src: "https://url-audio.mp3",
  accent: "#ff6b6b",
  nebula: "from-red-900/40",
  mood: "energetic, upbeat"
}
```

---

## 📝 NPM Scripts

```bash
npm run dev      # Dev server (localhost:5173)
npm run build    # Build production → /dist
npm run preview  # Preview build lokal
npm run lint     # ESLint
```

---

## ⚠️ Catatan

- **API Key**: Key Anthropic dipanggil langsung dari browser (prefix `VITE_` = publik). Aman untuk demo. Untuk produksi, pertimbangkan proxy via [Vercel Edge Function](https://vercel.com/docs/functions/edge-functions).
- **Audio**: Sample lagu dari SoundHelix. Ganti dengan URL MP3 kamu sendiri.

---

## 📄 License

MIT
