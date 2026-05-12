import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  LayoutGrid, Compass, Clock, Star, Award,
  Sparkles, MessageSquare, X, Send, Zap, User, Wifi, WifiOff
} from 'lucide-react';

// ─── Data ───────────────────────────────────────────────────────────────────
const SONGS_DATA = [
  {
    id: 1,
    title: "Deep Space Night",
    artist: "SoundHelix Vol. 1",
    cover: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    accent: "#3b82f6",
    mood: "calm, expansive, mysterious"
  },
  {
    id: 2,
    title: "Lunar Reflection",
    artist: "SoundHelix Vol. 2",
    cover: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    accent: "#a855f7",
    mood: "melancholic, bright, reflective"
  },
  {
    id: 3,
    title: "Nebula Pulse",
    artist: "SoundHelix Vol. 3",
    cover: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    accent: "#6366f1",
    mood: "energetic, rhythmic, futuristic"
  },
  {
    id: 4,
    title: "Aurora Glow",
    artist: "SoundHelix Vol. 8",
    cover: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    accent: "#14b8a6",
    mood: "uplifting, organic, vibrant"
  }
];

// ─── OpenRouter Free Models — Auto-Fallback ──────────────────────────────────
// Daftar: https://openrouter.ai/collections/free-models
// Ganti YOUR_OPENROUTER_KEY dengan key dari https://openrouter.ai/keys (gratis, tanpa kartu kredit)
const OPENROUTER_API_KEY = "YOUR_OPENROUTER_KEY_HERE";

// Model gratis tersedia di OpenRouter (semua berakhiran :free)
// Sistem akan mencoba satu per satu dari atas ke bawah jika terjadi error/rate limit
const FREE_MODELS = [
  "deepseek/deepseek-chat-v3-0324:free",       // DeepSeek V3 — terbaik, 131K ctx
  "meta-llama/llama-4-maverick:free",            // Llama 4 Maverick — 1M ctx
  "deepseek/deepseek-r1:free",                   // DeepSeek R1 reasoning — 164K ctx
  "qwen/qwen3-235b-a22b:free",                   // Qwen3 235B — 131K ctx
  "meta-llama/llama-3.3-70b-instruct:free",      // Llama 3.3 70B — solid fallback
  "qwen/qwen-2.5-72b-instruct:free",             // Qwen 2.5 72B
  "google/gemma-3-12b-it:free",                  // Gemma 3 12B — ringan & cepat
  "mistralai/mistral-small-3.1-24b-instruct:free", // Mistral Small 3.1
  "openrouter/quasar-alpha:free",                // Quasar Alpha — OpenRouter native
];

// State model: track index model yang sedang dipakai
let currentModelIdx = 0;

async function askAI(userPrompt, systemPrompt = "", retryCount = 0) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "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") {
    return "⚠️ Tambahkan OpenRouter API key di App.jsx baris OPENROUTER_API_KEY.\n\nDapat key gratis di: https://openrouter.ai/keys";
  }

  // Sudah coba semua model, menyerah
  if (retryCount >= FREE_MODELS.length) {
    currentModelIdx = 0; // reset untuk request berikutnya
    return "🌌 Semua model sedang sibuk. Coba lagi dalam beberapa menit.";
  }

  const modelId = FREE_MODELS[currentModelIdx % FREE_MODELS.length];

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Starry Night Music Player"
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 300,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await res.json();

    // Rate limit atau error → coba model berikutnya
    if (res.status === 429 || res.status === 503 || data.error) {
      console.warn(`Model ${modelId} limit/error, mencoba model berikutnya...`, data.error?.message);
      currentModelIdx = (currentModelIdx + 1) % FREE_MODELS.length;
      return await askAI(userPrompt, systemPrompt, retryCount + 1);
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      currentModelIdx = (currentModelIdx + 1) % FREE_MODELS.length;
      return await askAI(userPrompt, systemPrompt, retryCount + 1);
    }

    return text.trim();
  } catch (err) {
    console.warn(`Error pada model ${modelId}:`, err.message);
    currentModelIdx = (currentModelIdx + 1) % FREE_MODELS.length;
    return await askAI(userPrompt, systemPrompt, retryCount + 1);
  }
}

function getCurrentModelName() {
  const id = FREE_MODELS[currentModelIdx % FREE_MODELS.length];
  return id.split('/')[1]?.replace(':free', '') || id;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (t) => {
  if (!t || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s < 10 ? '0' + s : s}`;
};

// ─── Orbital Ring ─────────────────────────────────────────────────────────────
function OrbitalRing({ pct, accent, progress, duration, artSize, ringSize }) {
  const cx = ringSize / 2;
  const cy = ringSize / 2;
  const r = artSize / 2 + 22;
  const circ = 2 * Math.PI * r;
  const angleDeg = pct * 360 - 90;
  const angleRad = angleDeg * (Math.PI / 180);
  const dotX = cx + Math.cos(angleRad) * r;
  const dotY = cy + Math.sin(angleRad) * r;
  const labelR = r + 20;
  const curLX = cx + Math.cos(angleRad) * labelR;
  const curLY = cy + Math.sin(angleRad) * labelR;
  const botRad = 90 * (Math.PI / 180);
  const durLX = cx + Math.cos(botRad) * labelR;
  const durLY = cy + Math.sin(botRad) * labelR;

  return (
    <svg width={ringSize} height={ringSize}
      className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
      <circle cx={cx} cy={cy} r={r} stroke={accent} strokeWidth="2.5" fill="none"
        strokeDasharray={circ} strokeDashoffset={circ - circ * pct}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.3s linear' }} />
      <circle cx={dotX} cy={dotY} r={9} fill="white" opacity="0.12" />
      <circle cx={dotX} cy={dotY} r={5} fill="white"
        style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.9))' }} />
      {pct > 0.015 && (
        <text x={curLX} y={curLY} textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="10" fontWeight="700" fontFamily="monospace" opacity="0.95">
          {fmt(progress)}
        </text>
      )}
      <text x={durLX} y={durLY + 1} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="600" fontFamily="monospace">
        {fmt(duration)}
      </text>
    </svg>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentTrack, setCurrentTrack] = useState(SONGS_DATA[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [view, setView] = useState('orbital');
  const [ringSize, setRingSize] = useState(280);
  const [activeModel, setActiveModel] = useState(getCurrentModelName());

  // AI
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: "Halo, Penjelajah! Aku Starry Navigator. Tanya apa saja tentang musik atau alam semesta ✨" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [astralInsight, setAstralInsight] = useState("");
  const [vibeQuery, setVibeQuery] = useState("");

  const audioRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Responsive ring size
  useEffect(() => {
    const update = () => {
      const sz = Math.max(200, Math.min(300, Math.min(window.innerWidth - 40, window.innerHeight - 280)));
      setRingSize(sz);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const artSize = ringSize - 72;

  // Init audio
  useEffect(() => {
    audioRef.current = new Audio(currentTrack.src);
    audioRef.current.volume = 0.7;
    return () => { audioRef.current?.pause(); };
  }, []);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => handleNext();
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const selectTrack = useCallback((track) => {
    setAstralInsight("");
    if (currentTrack.id === track.id) {
      setIsPlaying(p => !p);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = track.src;
        audioRef.current.load();
      }
      setCurrentTrack(track);
      setProgress(0);
      setDuration(0);
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const handleNext = useCallback(() => {
    const idx = SONGS_DATA.findIndex(s => s.id === currentTrack.id);
    selectTrack(SONGS_DATA[(idx + 1) % SONGS_DATA.length]);
  }, [currentTrack, selectTrack]);

  const handlePrev = useCallback(() => {
    const idx = SONGS_DATA.findIndex(s => s.id === currentTrack.id);
    selectTrack(SONGS_DATA[(idx - 1 + SONGS_DATA.length) % SONGS_DATA.length]);
  }, [currentTrack, selectTrack]);

  const runAI = async (prompt, system) => {
    const result = await askAI(prompt, system);
    setActiveModel(getCurrentModelName());
    return result;
  };

  const getAstralInsight = async () => {
    setIsAiLoading(true);
    const insight = await runAI(
      `Buat 1 kalimat puitis 'astral insight' untuk lagu "${currentTrack.title}" oleh ${currentTrack.artist}. Vibe: ${currentTrack.mood}. Sebutkan energi kosmik atau bintang.`,
      "Kamu adalah oracle puitis luar angkasa. Maks 25 kata. Balas hanya kalimat puitis saja, tanpa kutip, tanpa pembuka."
    );
    setAstralInsight(insight);
    setIsAiLoading(false);
  };

  const sendChatMessage = async () => {
    if (!userInput.trim()) return;
    const msg = userInput;
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setUserInput("");
    setIsAiLoading(true);
    const reply = await runAI(msg,
      `Kamu adalah Starry Navigator, pemandu AI untuk stasiun musik Starry Night. Ramah, futuristik, paham musik dan astronomi. Maks 80 kata. User sedang mendengarkan "${currentTrack.title}" oleh ${currentTrack.artist}.`
    );
    setChatMessages(prev => [...prev, { role: 'bot', text: reply }]);
    setIsAiLoading(false);
  };

  const searchByVibe = async () => {
    if (!vibeQuery.trim() || isAiLoading) return;
    setIsAiLoading(true);
    const reply = await runAI(
      `Lagu terbaik untuk vibe ini: ${vibeQuery}`,
      `Kembalikan HANYA satu angka 1-4. Lagu: 1=Deep Space Night(tenang), 2=Lunar Reflection(melankolis), 3=Nebula Pulse(energik), 4=Aurora Glow(semangat). Tidak ada teks lain.`
    );
    const id = parseInt(reply.trim());
    const match = SONGS_DATA.find(s => s.id === id);
    if (match) { selectTrack(match); setVibeQuery(`✨ ${match.title}`); }
    setIsAiLoading(false);
  };

  const pct = duration > 0 ? progress / duration : 0;
  const hasKey = OPENROUTER_API_KEY !== "YOUR_OPENROUTER_KEY_HERE";

  // ── Shared styles ──────────────────────────────────────────────────────────
  const pill = {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)',
    borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)'
  };
  const card = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 14
  };

  return (
    <div style={{
      position: 'relative', height: '100dvh', width: '100vw',
      overflow: 'hidden', background: '#080818',
      display: 'flex', flexDirection: 'column',
      color: '#f1f5f9', fontFamily: 'system-ui,-apple-system,sans-serif',
      userSelect: 'none'
    }}>

      {/* Starscape bg */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div className="stars-layer" />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.4,
          background: `radial-gradient(ellipse at 65% 15%, ${currentTrack.accent}28 0%, transparent 55%)`,
          transition: 'background 3s ease'
        }} />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: 'relative', zIndex: 50, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 16px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, background: '#6366f1', borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.5)'
          }}>
            <Star size={14} style={{ color: 'white', fill: 'white' }} />
          </div>
          <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
            Starry Night
          </span>
        </div>

        {/* Nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 1,
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          padding: 3, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {[
            { id: 'orbital', icon: Compass },
            { id: 'library', icon: LayoutGrid },
            { id: 'profile', icon: User }
          ].map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => setView(id)} style={{
              padding: '6px 9px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: view === id ? '#6366f1' : 'transparent',
              color: view === id ? 'white' : '#94a3b8',
              transition: 'all 0.2s', display: 'flex'
            }}>
              <Icon size={16} />
            </button>
          ))}
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />
          <button onClick={() => setIsChatOpen(true)} style={{
            padding: '6px 9px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#818cf8', display: 'flex'
          }}>
            <Sparkles size={16} />
          </button>
        </nav>
      </header>

      {/* AI Model badge — shows active model */}
      {hasKey && (
        <div style={{
          position: 'absolute', top: 58, left: '50%', transform: 'translateX(-50%)',
          zIndex: 40, display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 999, padding: '3px 10px'
        }}>
          <Wifi size={9} style={{ color: '#818cf8' }} />
          <span style={{ fontSize: 9, color: '#a5b4fc', fontWeight: 600, letterSpacing: '0.05em' }}>
            {activeModel}
          </span>
        </div>
      )}

      {/* No key warning */}
      {!hasKey && (
        <div style={{
          position: 'absolute', top: 58, left: '50%', transform: 'translateX(-50%)',
          zIndex: 40, display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap'
        }}>
          <WifiOff size={9} style={{ color: '#f87171' }} />
          <span style={{ fontSize: 9, color: '#fca5a5', fontWeight: 600 }}>
            AI offline — tambahkan OpenRouter key
          </span>
        </div>
      )}

      {/* ── Main ── */}
      <main style={{
        position: 'relative', zIndex: 10, flex: 1, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px 16px 12px'
      }}>

        {/* ── Orbital / Player View ── */}
        {view === 'orbital' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            width: '100%', maxWidth: 400, animation: 'fadeIn 0.5s ease'
          }}>
            {/* Ring */}
            <div style={{ position: 'relative', width: ringSize, height: ringSize, flexShrink: 0 }}>
              <OrbitalRing pct={pct} accent={currentTrack.accent}
                progress={progress} duration={duration}
                artSize={artSize} ringSize={ringSize} />
              {/* Album art */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: artSize, height: artSize, borderRadius: '50%',
                overflow: 'hidden', border: '3px solid rgba(255,255,255,0.1)',
                zIndex: 3, boxShadow: `0 0 50px -5px ${currentTrack.accent}60`,
                animation: isPlaying ? 'rotateSlow 20s linear infinite' : 'none'
              }}>
                <img src={currentTrack.cover} alt={currentTrack.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>

            {/* Controls */}
            <div style={{ ...pill, padding: '7px 20px', marginTop: 4 }}>
              <button onClick={handlePrev} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 6, display: 'flex' }}>
                <SkipBack size={17} fill="currentColor" />
              </button>
              <button onClick={() => setIsPlaying(p => !p)} style={{
                width: 46, height: 46, borderRadius: '50%', border: 'none',
                background: 'white', color: '#1e1b4b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(255,255,255,0.25)', transition: 'transform 0.1s'
              }}>
                {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" style={{ marginLeft: 2 }} />}
              </button>
              <button onClick={handleNext} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 6, display: 'flex' }}>
                <SkipForward size={17} fill="currentColor" />
              </button>
            </div>

            {/* Track info */}
            <div style={{ textAlign: 'center', width: '100%', padding: '12px 8px 0', maxWidth: 340 }}>
              <h2 style={{
                fontSize: 'clamp(20px, 5.5vw, 30px)', fontWeight: 900,
                letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15,
                color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {currentTrack.title}
              </h2>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#94a3b8', opacity: 0.6, margin: '4px 0 0' }}>
                {currentTrack.artist}
              </p>

              {/* Astral Insight */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 12 }}>
                {!astralInsight ? (
                  <button onClick={getAstralInsight} disabled={isAiLoading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 999,
                      background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)',
                      color: '#a5b4fc', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      opacity: isAiLoading ? 0.5 : 1, transition: 'all 0.2s'
                    }}>
                    {isAiLoading ? <Zap size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={11} />}
                    {isAiLoading ? "Channeling cosmos..." : "Get Astral Insight"}
                  </button>
                ) : (
                  <div onClick={() => setAstralInsight("")} style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14, padding: '10px 14px', maxWidth: 280, cursor: 'pointer',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    <p style={{ fontSize: 11, color: '#c7d2fe', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                      "{astralInsight}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Library View ── */}
        {view === 'library' && (
          <div style={{
            width: '100%', maxWidth: 480, height: '100%',
            display: 'flex', flexDirection: 'column', animation: 'slideUp 0.4s ease'
          }}>
            <div style={{ flexShrink: 0, marginBottom: 12 }}>
              <h3 style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
                Galaxy Stash
              </h3>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Ceritakan vibe kamu..."
                  value={vibeQuery}
                  onChange={e => setVibeQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchByVibe()}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, padding: '9px 36px 9px 34px',
                    fontSize: 13, color: 'white', outline: 'none'
                  }} />
                <Sparkles size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#818cf8' }} />
                <button onClick={searchByVibe} disabled={isAiLoading} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer',
                  display: 'flex', opacity: isAiLoading ? 0.4 : 1
                }}>
                  <Zap size={13} style={isAiLoading ? { animation: 'spin 0.8s linear infinite' } : {}} />
                </button>
              </div>
            </div>

            <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7, paddingBottom: 8 }}>
              {SONGS_DATA.map(song => (
                <div key={song.id} onClick={() => selectTrack(song)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 13px', borderRadius: 18, cursor: 'pointer',
                  background: currentTrack.id === song.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                  border: currentTrack.id === song.id ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}>
                  <img src={song.cover} alt={song.title}
                    style={{ width: 48, height: 48, borderRadius: 13, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {song.title}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2 }}>
                      {song.artist}
                    </div>
                  </div>
                  {currentTrack.id === song.id && isPlaying && (
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14, flexShrink: 0 }}>
                      {[14, 7, 11].map((h, i) => (
                        <div key={i} style={{
                          width: 3, height: h, background: '#818cf8', borderRadius: 2,
                          animation: `pulse 0.9s ease-in-out ${i * 0.12}s infinite`
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Profile View ── */}
        {view === 'profile' && (
          <div style={{
            width: '100%', maxWidth: 320,
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 26,
            padding: 'clamp(20px,5vw,32px)', textAlign: 'center', animation: 'fadeIn 0.4s ease'
          }}>
            <div style={{
              width: 64, height: 64, margin: '0 auto 12px',
              background: 'linear-gradient(135deg,#6366f1,#9333ea)',
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'rotate(3deg)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
            }}>
              <User size={32} style={{ color: 'white' }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 900, margin: '0 0 3px' }}>Star Voyager</h3>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#818cf8', margin: '0 0 20px' }}>
              Level: Nebula Scout
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {[
                { icon: <Clock size={14} style={{ color: '#64748b', marginBottom: 7 }} />, val: '12.4h', label: 'Flight Time' },
                { icon: <Award size={14} style={{ color: '#818cf8', marginBottom: 7 }} />, val: '42', label: 'Badges Won' },
              ].map((c, i) => (
                <div key={i} style={{ ...card }}>
                  {c.icon}
                  <div style={{ fontSize: 17, fontWeight: 900 }}>{c.val}</div>
                  <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>{c.label}</div>
                </div>
              ))}
              <div style={{ ...card, gridColumn: '1/-1' }}>
                <Star size={14} style={{ color: '#facc15', fill: '#facc15', marginBottom: 7 }} />
                <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentTrack.title}
                </div>
                <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>Currently Playing</div>
              </div>
              {/* AI Model info */}
              <div style={{ ...card, gridColumn: '1/-1', background: 'rgba(99,102,241,0.08)' }}>
                <Wifi size={14} style={{ color: '#818cf8', marginBottom: 7 }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc' }}>
                  {hasKey ? activeModel : 'Tidak ada key'}
                </div>
                <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>
                  {hasKey ? `Model aktif (${currentModelIdx + 1}/${FREE_MODELS.length})` : 'AI offline'}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Chat Drawer ── */}
      {isChatOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsChatOpen(false)} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 350, height: '100%',
            background: '#0a0a1e', borderLeft: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', flexDirection: 'column', animation: 'slideRight 0.3s ease'
          }}>
            {/* Chat header */}
            <div style={{
              padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 30, height: 30, background: '#6366f1', borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <MessageSquare size={14} style={{ color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Starry Navigator</div>
                  <div style={{ fontSize: 9, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                    {hasKey ? `via ${activeModel}` : 'AI Offline'}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 5, display: 'flex' }}>
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="scrollbar-hide" style={{
              flex: 1, overflowY: 'auto', padding: 13,
              display: 'flex', flexDirection: 'column', gap: 9
            }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '9px 13px', fontSize: 13, lineHeight: 1.5,
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? '#4f46e5' : 'rgba(255,255,255,0.06)',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    color: msg.role === 'user' ? 'white' : '#e0e7ff'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div style={{ display: 'flex' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px 16px 16px 4px', padding: '9px 13px',
                    display: 'flex', gap: 5, alignItems: 'center'
                  }}>
                    {[0, 0.15, 0.3].map((d, i) => (
                      <div key={i} style={{
                        width: 6, height: 6, background: '#818cf8', borderRadius: '50%',
                        animation: `bounce 0.8s ease-in-out ${d}s infinite`
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: 11, borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 7 }}>
                <input type="text" value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Tanya navigator..."
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11,
                    padding: '9px 13px', fontSize: 13, color: 'white', outline: 'none'
                  }} />
                <button onClick={sendChatMessage}
                  disabled={isAiLoading || !userInput.trim()}
                  style={{
                    background: '#4f46e5', border: 'none', borderRadius: 11,
                    padding: '9px 11px', color: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    opacity: (isAiLoading || !userInput.trim()) ? 0.4 : 1, transition: 'opacity 0.2s'
                  }}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideRight{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
        @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;height:var(--h)}50%{opacity:0.4;height:4px}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .stars-layer{
          position:absolute;width:200%;height:200%;
          background-image:
            radial-gradient(1px 1px at 20px 30px,#fff,rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 100px 150px,#fff,rgba(0,0,0,0)),
            radial-gradient(1px 1px at 200px 80px,#fff,rgba(0,0,0,0)),
            radial-gradient(2px 2px at 300px 250px,#fff,rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 200px,#fff,rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 180px 40px,#fff,rgba(0,0,0,0));
          background-size:300px 300px;opacity:0.16;
          animation:panStars 150s linear infinite;
        }
        @keyframes panStars{from{transform:translate(0,0)}to{transform:translate(-300px,-300px)}}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        input::placeholder{color:rgba(148,163,184,0.4)}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
      `}</style>
    </div>
  );
}
