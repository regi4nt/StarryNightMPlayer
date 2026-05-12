# 🌌 Cosmic Music Player

A space-themed music player built with React, Vite, and Tailwind CSS — featuring an AI-powered Cosmic Navigator powered by Claude.

![Cosmic Music Player](https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&h=400&fit=crop)

## ✨ Features

- 🎵 Music player with orbital progress ring animation
- 🌠 AI Astral Insights for each track (powered by Claude)
- 🔮 AI Vibe Search — describe your mood, find the perfect track
- 🤖 Cosmic Navigator chat assistant
- 🌌 Animated starfield background
- 📱 Fully responsive (mobile & desktop)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/cosmic-music-player.git
cd cosmic-music-player
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your API key at [console.anthropic.com](https://console.anthropic.com/)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🌐 Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm install -g vercel
vercel
```

Follow the prompts, then add your environment variable:

```bash
vercel env add VITE_ANTHROPIC_API_KEY
```

Redeploy:

```bash
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. **Push to GitHub:**

```bash
git init
git add .
git commit -m "feat: initial cosmic music player"
git remote add origin https://github.com/YOUR_USERNAME/cosmic-music-player.git
git push -u origin main
```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **"Import Git Repository"**
   - Select your `cosmic-music-player` repo
   - Click **"Deploy"**

3. **Add Environment Variable:**
   - Go to your project → **Settings** → **Environment Variables**
   - Add: `VITE_ANTHROPIC_API_KEY` = `your_api_key`
   - Click **Save** then **Redeploy**

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| AI | Anthropic Claude API |
| Deployment | Vercel |

## 📁 Project Structure

```
cosmic-music-player/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx         # Main application component
│   ├── index.css       # Global styles + animations
│   └── main.jsx        # React entry point
├── .env.example        # Environment variables template
├── .gitignore
├── index.html          # HTML entry point
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json         # Vercel SPA routing config
└── vite.config.js
```

## 🎨 Customization

### Adding tracks

Edit the `SONGS_DATA` array in `src/App.jsx`:

```js
{
  id: 5,
  title: "Your Track Title",
  artist: "Artist Name",
  cover: "https://your-image-url.jpg",
  src: "https://your-audio-url.mp3",
  accent: "#ff6b6b",           // Progress ring color
  nebula: "from-red-900/40",   // Background gradient class
  mood: "energetic, upbeat"    // Used for AI insights
}
```

### Changing the AI model

In `src/App.jsx`, find `askClaude()` and change:

```js
model: "claude-sonnet-4-20250514"
// to any Claude model you prefer
```

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## ⚠️ Notes

- **CORS**: The Anthropic API is called directly from the browser. This works for personal/demo projects. For production apps, consider proxying through a backend or Vercel Edge Function to protect your API key.
- **Audio**: Sample tracks are from SoundHelix. Replace with your own MP3 sources as needed.

## 📄 License

MIT
