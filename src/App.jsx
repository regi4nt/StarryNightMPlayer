import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Music2,
  ListMusic, Compass, Heart, Volume2, VolumeX,
  Sparkles, MessageSquare, X, Send, Zap,
  ChevronUp, Radio, Headphones, Bot
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════
const SONGS = [
  {
    id: 1,
    title: "Deep Space Night",
    artist: "SoundHelix",
    album: "Vol. 1",
    cover: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
    mood: "calm, expansive, mysterious"
  },
  {
    id: 2,
    title: "Lunar Reflection",
    artist: "SoundHelix",
    album: "Vol. 2",
    cover: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.15)",
    mood: "melancholic, bright, reflective"
  },
  {
    id: 3,
    title: "Nebula Pulse",
    artist: "SoundHelix",
    album: "Vol. 3",
    cover: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.15)",
    mood: "energetic, rhythmic, futuristic"
  },
  {
    id: 4,
    title: "Aurora Glow",
    artist: "SoundHelix",
    album: "Vol. 8",
    cover: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.15)",
    mood: "uplifting, organic, vibrant"
  }
];

// ═══════════════════════════════════════════════════════
//  AI — OpenRouter dual key + auto-fallback
// ═══════════════════════════════════════════════════════
const API_KEYS = [
  "GANTI_KEY_1_DISINI",  // ← key dari openrouter.ai/keys
  "GANTI_KEY_2_DISINI",
];

const FREE_MODELS = [
  "deepseek/deepseek-chat-v3-0324:free",
  "meta-llama/llama-4-maverick:free",
  "deepseek/deepseek-r1:free",
  "qwen/qwen3-235b-a22b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "google/gemma-3-12b-it:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "openrouter/quasar-alpha:free",
];

const SLOTS = API_KEYS.flatMap(k => FREE_MODELS.map(m => ({ k, m })));
let slotIdx = 0;

async function askAI(user, system = "", tries = 0) {
  const valid = API_KEYS.filter(k => k && !k.includes("GANTI_KEY"));
  if (!valid.length) return "⚠️ Belum ada API key. Isi API_KEYS di App.jsx — gratis di openrouter.ai/keys";
  if (tries >= SLOTS.length) { slotIdx = 0; return "Semua model sedang sibuk, coba lagi nanti."; }
  const { k, m } = SLOTS[slotIdx % SLOTS.length];
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${k}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Starry Night"
      },
      body: JSON.stringify({
        model: m, max_tokens: 300,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          { role: "user", content: user }
        ]
      })
    });
    const data = await res.json();
    if (res.status === 429 || res.status === 503 || data.error) {
      slotIdx = (slotIdx + 1) % SLOTS.length;
      return askAI(user, system, tries + 1);
    }
    const txt = data.choices?.[0]?.message?.content;
    if (!txt) { slotIdx = (slotIdx + 1) % SLOTS.length; return askAI(user, system, tries + 1); }
    return txt.trim();
  } catch {
    slotIdx = (slotIdx + 1) % SLOTS.length;
    return askAI(user, system, tries + 1);
  }
}

const activeModel = () => SLOTS[slotIdx % SLOTS.length].m.split('/')[1]?.replace(':free','') || '';
const hasKey = () => API_KEYS.some(k => k && !k.includes("GANTI_KEY"));

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
const fmt = t => {
  if (!t || isNaN(t)) return "0:00";
  return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
};

// ═══════════════════════════════════════════════════════
//  ORBITAL RING  — album art + circular progress + time
// ═══════════════════════════════════════════════════════
function OrbitalRing({ size, pct, color, progress, duration, isPlaying, cover, title }) {
  const cx = size / 2, cy = size / 2;
  // Ring sits 18px outside art
  const artR  = size / 2 - 36;   // album art radius
  const ringR = artR + 18;        // progress ring radius
  const circ  = 2 * Math.PI * ringR;

  // Dot position (starts at top = -90°)
  const deg    = pct * 360 - 90;
  const rad    = deg * Math.PI / 180;
  const dotX   = cx + Math.cos(rad) * ringR;
  const dotY   = cy + Math.sin(rad) * ringR;

  // Time label follows dot — pushed 22px further out
  const lblR  = ringR + 22;
  const lblX  = cx + Math.cos(rad) * lblR;
  const lblY  = cy + Math.sin(rad) * lblR;

  // Duration label — always at bottom (90°)
  const durX  = cx + Math.cos(Math.PI / 2) * lblR;
  const durY  = cy + Math.sin(Math.PI / 2) * lblR;

  // Start marker — top (−90°)
  const startX = cx;
  const startY = cy - ringR;

  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      {/* Album art — rotates when playing */}
      <div style={{
        position:'absolute',
        top: cy - artR, left: cx - artR,
        width: artR*2, height: artR*2,
        borderRadius:'50%', overflow:'hidden',
        border:`3px solid rgba(255,255,255,0.12)`,
        boxShadow:`0 0 40px -8px ${color}80`,
        animation: isPlaying ? 'spin20 20s linear infinite' : 'none',
        zIndex:2
      }}>
        <img src={cover} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>

      {/* SVG ring layer */}
      <svg width={size} height={size} style={{ position:'absolute', inset:0, zIndex:3, overflow:'visible' }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={ringR}
          stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />

        {/* Progress arc */}
        <circle cx={cx} cy={cy} r={ringR}
          stroke={color} strokeWidth="3.5" fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ - circ * pct}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition:'stroke-dashoffset 0.35s linear', filter:`drop-shadow(0 0 4px ${color})` }} />

        {/* Start tick mark */}
        <line x1={startX} y1={startY - 6} x2={startX} y2={startY + 6}
          stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" />

        {/* Dot glow */}
        <circle cx={dotX} cy={dotY} r={11} fill={color} opacity="0.2" />
        {/* Dot */}
        <circle cx={dotX} cy={dotY} r={6} fill="white"
          style={{ filter:'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }} />

        {/* Current time label — follows dot, only show after 1% */}
        {pct > 0.01 && (
          <text x={lblX} y={lblY}
            textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize="11" fontWeight="800" fontFamily="monospace"
            style={{ filter:'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>
            {fmt(progress)}
          </text>
        )}

        {/* Duration label — fixed at bottom */}
        <text x={durX} y={durY}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.35)" fontSize="10" fontWeight="600" fontFamily="monospace">
          {fmt(duration)}
        </text>

        {/* "0:00" start label — top */}
        <text x={startX} y={startY - 16}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.25)" fontSize="10" fontWeight="600" fontFamily="monospace">
          0:00
        </text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════
export default function App() {
  const [track, setTrack]         = useState(SONGS[0]);
  const [playing, setPlaying]     = useState(false);
  const [progress, setProgress]   = useState(0);
  const [duration, setDuration]   = useState(0);
  const [volume, setVolume]       = useState(0.75);
  const [muted, setMuted]         = useState(false);
  const [liked, setLiked]         = useState({});
  const [tab, setTab]             = useState('player');  // player | queue | ai

  // AI states
  const [insight, setInsight]     = useState('');
  const [insightLoading, setIL]   = useState(false);
  const [messages, setMessages]   = useState([
    { from:'ai', text:'Halo! Saya Starry AI 🌟 Tanya apa saja tentang musik yang sedang diputar, atau minta rekomendasi berdasarkan suasana hati kamu.' }
  ]);
  const [input, setInput]         = useState('');
  const [chatLoading, setCL]      = useState(false);
  const [vibeInput, setVibeInput] = useState('');
  const [vibeLoading, setVL]      = useState(false);

  // Responsive size
  const [ringSize, setRingSize]   = useState(280);
  const audioRef   = useRef(null);
  const chatEndRef = useRef(null);

  // ── Responsive ring ──────────────────────────────────
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Player tab: ring + controls + title + tabs = ~280px overhead
      const maxH = vh - 280;
      const maxW = vw - 48;
      setRingSize(Math.max(220, Math.min(320, Math.min(maxH, maxW))));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // ── Audio init ───────────────────────────────────────
  useEffect(() => {
    audioRef.current = new Audio(track.src);
    audioRef.current.volume = volume;
    return () => { audioRef.current?.pause(); };
  }, []);

  // ── Audio events ─────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onMeta = () => setDuration(a.duration);
    const onEnd  = () => next();
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
    };
  }, [track]);

  // ── Play/pause ───────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    if (playing) a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [playing]);

  // ── Volume/mute ──────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // ── Chat scroll ──────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  // ── Track change ─────────────────────────────────────
  const play = useCallback((t) => {
    setInsight('');
    if (track.id === t.id) { setPlaying(p => !p); return; }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = t.src;
      audioRef.current.load();
    }
    setTrack(t); setProgress(0); setDuration(0); setPlaying(true);
  }, [track]);

  const next = useCallback(() => {
    const i = SONGS.findIndex(s => s.id === track.id);
    play(SONGS[(i+1) % SONGS.length]);
  }, [track, play]);

  const prev = useCallback(() => {
    const i = SONGS.findIndex(s => s.id === track.id);
    play(SONGS[(i-1+SONGS.length) % SONGS.length]);
  }, [track, play]);

  // Seek on ring click (simple: pass pct based on progress bar click)
  const seek = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audioRef.current && duration) {
      audioRef.current.currentTime = p * duration;
      setProgress(p * duration);
    }
  };

  // ── AI ───────────────────────────────────────────────
  const getInsight = async () => {
    setIL(true);
    const r = await askAI(
      `Buat 1 kalimat puitis singkat untuk lagu "${track.title}" dengan vibe ${track.mood}. Sebutkan bintang atau alam semesta.`,
      "Kamu oracle puitis. Maks 20 kata. Hanya kalimat puitis, tanpa tanda petik."
    );
    setInsight(r); setIL(false);
  };

  const sendChat = async () => {
    if (!input.trim()) return;
    const msg = input; setInput('');
    setMessages(p => [...p, { from:'user', text:msg }]);
    setCL(true);
    const r = await askAI(msg,
      `Kamu Starry AI, asisten musik yang ramah dan futuristik. Jawab singkat maks 80 kata. Sedang diputar: "${track.title}" oleh ${track.artist}.`
    );
    setMessages(p => [...p, { from:'ai', text:r }]);
    setCL(false);
  };

  const searchVibe = async () => {
    if (!vibeInput.trim() || vibeLoading) return;
    setVL(true);
    const r = await askAI(
      `Vibe: ${vibeInput}`,
      `Pilih lagu terbaik dari daftar ini berdasarkan vibe. Balas HANYA angka 1-4.
1=Deep Space Night(tenang,misterius) 2=Lunar Reflection(melankolis,reflektif) 3=Nebula Pulse(energik,futuristik) 4=Aurora Glow(semangat,cerah)`
    );
    const id = parseInt(r.trim());
    const found = SONGS.find(s => s.id === id);
    if (found) { play(found); setVibeInput(`✨ Cocok: ${found.title}`); }
    setVL(false);
  };

  const pct = duration > 0 ? progress / duration : 0;

  // ── Tab labels ───────────────────────────────────────
  const tabs = [
    { id:'player', icon:<Compass size={18}/>, label:'Player' },
    { id:'queue',  icon:<ListMusic size={18}/>, label:'Daftar Lagu' },
    { id:'ai',     icon:<Bot size={18}/>, label:'Starry AI' },
  ];

  return (
    <div style={{
      height:'100dvh', width:'100vw', overflow:'hidden',
      background:'#07071a', color:'#f1f5f9',
      fontFamily:"'Segoe UI',system-ui,-apple-system,sans-serif",
      display:'flex', flexDirection:'column',
      userSelect:'none', WebkitTapHighlightColor:'transparent'
    }}>

      {/* ══ Background glow */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
        background:`radial-gradient(ellipse at 60% 10%, ${track.color}20 0%, transparent 60%)`,
        transition:'background 2s ease'
      }}/>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div className="stars"/>
      </div>

      {/* ══ Header */}
      <header style={{
        position:'relative', zIndex:10, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 20px',
        borderBottom:'1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{
            width:32, height:32, borderRadius:10,
            background:`linear-gradient(135deg, ${track.color}, #6366f1)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:`0 0 14px ${track.color}60`,
            transition:'all 0.5s'
          }}>
            <Headphones size={16} style={{ color:'white' }}/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:14, lineHeight:1, letterSpacing:'-0.02em' }}>Starry Night</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Music Player</div>
          </div>
        </div>

        {/* AI status badge */}
        <div style={{
          display:'flex', alignItems:'center', gap:5,
          padding:'5px 10px', borderRadius:999,
          background: hasKey() ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border:`1px solid ${hasKey() ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          <div style={{
            width:6, height:6, borderRadius:'50%',
            background: hasKey() ? '#22c55e' : '#ef4444',
            animation: hasKey() ? 'pulse 2s infinite' : 'none'
          }}/>
          <span style={{ fontSize:10, fontWeight:700, color: hasKey() ? '#86efac' : '#fca5a5' }}>
            {hasKey() ? 'AI Online' : 'AI Offline'}
          </span>
        </div>
      </header>

      {/* ══ Content area */}
      <main style={{ flex:1, overflow:'hidden', position:'relative', zIndex:5 }}>

        {/* ─── PLAYER TAB */}
        {tab === 'player' && (
          <div style={{
            height:'100%', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            padding:'8px 20px 0', gap:0,
            animation:'fadeUp 0.4s ease'
          }}>

            {/* Orbital ring with album art */}
            <OrbitalRing
              size={ringSize}
              pct={pct}
              color={track.color}
              progress={progress}
              duration={duration}
              isPlaying={playing}
              cover={track.cover}
              title={track.title}
            />

            {/* Track info */}
            <div style={{ textAlign:'center', marginTop:16, width:'100%', maxWidth:320, padding:'0 8px' }}>
              <h2 style={{
                margin:0, fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1,
                fontSize:'clamp(20px,5.5vw,28px)',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
              }}>{track.title}</h2>
              <p style={{ margin:'4px 0 0', fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:600, letterSpacing:'0.08em' }}>
                {track.artist} — {track.album}
              </p>
            </div>

            {/* Seek bar — tappable progress bar */}
            <div style={{ width:'100%', maxWidth:320, margin:'14px 0 0', padding:'0 8px' }}>
              <div
                onClick={seek}
                style={{
                  height:4, borderRadius:999, cursor:'pointer', position:'relative',
                  background:'rgba(255,255,255,0.1)'
                }}
              >
                <div style={{
                  height:'100%', borderRadius:999, width:`${pct*100}%`,
                  background:`linear-gradient(90deg, ${track.color}, ${track.color}aa)`,
                  transition:'width 0.3s linear', position:'relative'
                }}>
                  <div style={{
                    position:'absolute', right:-5, top:'50%', transform:'translateY(-50%)',
                    width:10, height:10, borderRadius:'50%', background:'white',
                    boxShadow:`0 0 6px ${track.color}`
                  }}/>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:'monospace' }}>{fmt(progress)}</span>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:'monospace' }}>{fmt(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div style={{
              display:'flex', alignItems:'center', gap:12, marginTop:12
            }}>
              <button
                onClick={() => setLiked(l => ({ ...l, [track.id]: !l[track.id] }))}
                style={{ ...btn, color: liked[track.id] ? '#f472b6' : 'rgba(255,255,255,0.4)' }}
                title="Suka"
              >
                <Heart size={20} fill={liked[track.id] ? '#f472b6' : 'none'}/>
              </button>

              <button onClick={prev} style={btn} title="Sebelumnya">
                <SkipBack size={22} fill="currentColor"/>
              </button>

              <button
                onClick={() => setPlaying(p => !p)}
                style={{
                  width:58, height:58, borderRadius:'50%', border:'none',
                  background:'white', color:'#07071a', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:`0 0 20px ${track.color}80, 0 4px 20px rgba(0,0,0,0.4)`,
                  transition:'transform 0.1s, box-shadow 0.3s',
                  flexShrink:0
                }}
                title={playing ? 'Pause' : 'Play'}
              >
                {playing
                  ? <Pause size={24} fill="currentColor"/>
                  : <Play size={24} fill="currentColor" style={{ marginLeft:3 }}/>}
              </button>

              <button onClick={next} style={btn} title="Berikutnya">
                <SkipForward size={22} fill="currentColor"/>
              </button>

              <button onClick={() => setMuted(m => !m)} style={{ ...btn, color: muted ? '#ef4444' : 'rgba(255,255,255,0.4)' }} title="Volume">
                {muted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
              </button>
            </div>

            {/* Volume slider */}
            <div style={{ width:'100%', maxWidth:200, marginTop:10, padding:'0 8px' }}>
              <input type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume}
                onChange={e => { setVolume(+e.target.value); setMuted(false); }}
                style={{ width:'100%', accentColor: track.color, height:3 }}
              />
            </div>

            {/* Astral insight */}
            <div style={{ width:'100%', maxWidth:320, marginTop:10, padding:'0 8px', marginBottom:4 }}>
              {!insight ? (
                <button onClick={getInsight} disabled={insightLoading} style={{
                  width:'100%', padding:'9px 0', borderRadius:12, border:'none',
                  background: track.bg, color:'white',
                  fontSize:12, fontWeight:700, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  opacity: insightLoading ? 0.6 : 1, transition:'opacity 0.2s'
                }}>
                  {insightLoading
                    ? <><Zap size={13} style={{ animation:'spin 0.8s linear infinite' }}/> Meramal bintang...</>
                    : <><Sparkles size={13}/> Dapat Wawasan Kosmik ✨</>
                  }
                </button>
              ) : (
                <div onClick={() => setInsight('')} style={{
                  padding:'10px 14px', borderRadius:12,
                  background: track.bg,
                  border:`1px solid ${track.color}40`,
                  cursor:'pointer', animation:'fadeUp 0.3s ease'
                }}>
                  <div style={{ fontSize:10, color:track.color, fontWeight:700, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.1em' }}>✨ Wawasan Kosmik</div>
                  <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.85)', fontStyle:'italic', lineHeight:1.6 }}>
                    {insight}
                  </p>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', marginTop:5 }}>Ketuk untuk tutup</div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ─── QUEUE TAB */}
        {tab === 'queue' && (
          <div style={{
            height:'100%', display:'flex', flexDirection:'column',
            padding:'16px 16px 0', animation:'fadeUp 0.4s ease'
          }}>
            {/* Vibe search */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>
                🔮 Cari Lagu Berdasarkan Suasana Hati
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input
                  value={vibeInput}
                  onChange={e => setVibeInput(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && searchVibe()}
                  placeholder='cth: "semangat pagi", "sedih tapi indah"...'
                  style={{
                    flex:1, background:'rgba(255,255,255,0.06)',
                    border:'1px solid rgba(255,255,255,0.12)',
                    borderRadius:10, padding:'9px 12px',
                    fontSize:13, color:'white', outline:'none'
                  }}
                />
                <button onClick={searchVibe} disabled={vibeLoading} style={{
                  padding:'9px 14px', borderRadius:10, border:'none',
                  background:track.color, color:'white', cursor:'pointer',
                  fontWeight:700, fontSize:12, flexShrink:0,
                  opacity: vibeLoading ? 0.5 : 1
                }}>
                  {vibeLoading ? <Zap size={14} style={{ animation:'spin 0.8s linear infinite' }}/> : 'Cari'}
                </button>
              </div>
            </div>

            {/* Song list */}
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:8 }}>
              🎵 Semua Lagu ({SONGS.length})
            </div>
            <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, paddingBottom:16 }}>
              {SONGS.map((s, i) => {
                const isActive = track.id === s.id;
                return (
                  <div key={s.id} onClick={() => play(s)} style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'10px 12px', borderRadius:14, cursor:'pointer',
                    background: isActive ? s.bg : 'rgba(255,255,255,0.04)',
                    border:`1px solid ${isActive ? s.color+'50' : 'transparent'}`,
                    transition:'all 0.2s'
                  }}>
                    {/* Track number / playing indicator */}
                    <div style={{
                      width:28, height:28, borderRadius:8, flexShrink:0,
                      background: isActive ? s.color : 'rgba(255,255,255,0.08)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:800, color: isActive ? 'white' : 'rgba(255,255,255,0.4)'
                    }}>
                      {isActive && playing
                        ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end' }}>
                            {[12,6,10].map((h,j) => (
                              <div key={j} style={{
                                width:2.5, height:h, background:'white', borderRadius:1,
                                animation:`bounce 0.8s ease-in-out ${j*0.15}s infinite`
                              }}/>
                            ))}
                          </div>
                        : i+1
                      }
                    </div>

                    <img src={s.cover} alt={s.title} style={{ width:44, height:44, borderRadius:10, objectFit:'cover', flexShrink:0 }}/>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: isActive ? 'white' : 'rgba(255,255,255,0.85)' }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>
                        {s.artist} · {s.album}
                      </div>
                    </div>

                    <button onClick={e => { e.stopPropagation(); setLiked(l => ({ ...l, [s.id]: !l[s.id] })); }}
                      style={{ ...btn, color: liked[s.id] ? '#f472b6' : 'rgba(255,255,255,0.2)' }}>
                      <Heart size={16} fill={liked[s.id] ? '#f472b6' : 'none'}/>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── AI TAB */}
        {tab === 'ai' && (
          <div style={{
            height:'100%', display:'flex', flexDirection:'column',
            animation:'fadeUp 0.4s ease'
          }}>
            {/* AI header */}
            <div style={{
              padding:'14px 16px 10px',
              borderBottom:'1px solid rgba(255,255,255,0.06)',
              flexShrink:0
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{
                  width:34, height:34, borderRadius:10,
                  background:'linear-gradient(135deg,#6366f1,#a855f7)',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <Bot size={18} style={{ color:'white' }}/>
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:13 }}>Starry AI</div>
                  <div style={{ fontSize:10, color: hasKey() ? '#86efac' : '#fca5a5' }}>
                    {hasKey() ? `Online · ${activeModel()}` : 'Offline — tambahkan API key'}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop:10, padding:'8px 10px', borderRadius:10,
                background: track.bg, border:`1px solid ${track.color}30`,
                display:'flex', alignItems:'center', gap:8
              }}>
                <img src={track.cover} style={{ width:32, height:32, borderRadius:7, objectFit:'cover' }}/>
                <div>
                  <div style={{ fontSize:11, fontWeight:700 }}>{track.title}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>Sedang diputar</div>
                </div>
                <div style={{ marginLeft:'auto', display:'flex', gap:2, alignItems:'flex-end', height:14 }}>
                  {playing && [12,7,10].map((h,i) => (
                    <div key={i} style={{ width:3, height:h, background:track.color, borderRadius:1, animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite` }}/>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="scrollbar-hide" style={{
              flex:1, overflowY:'auto', padding:'12px 16px',
              display:'flex', flexDirection:'column', gap:10
            }}>
              {messages.map((m,i) => (
                <div key={i} style={{ display:'flex', justifyContent: m.from==='user' ? 'flex-end' : 'flex-start' }}>
                  {m.from==='ai' && (
                    <div style={{
                      width:24, height:24, borderRadius:7, flexShrink:0,
                      background:'linear-gradient(135deg,#6366f1,#a855f7)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      marginRight:6, marginTop:2
                    }}>
                      <Bot size={12} style={{ color:'white' }}/>
                    </div>
                  )}
                  <div style={{
                    maxWidth:'78%', padding:'10px 13px', fontSize:13, lineHeight:1.55,
                    borderRadius: m.from==='user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                    background: m.from==='user' ? track.color : 'rgba(255,255,255,0.07)',
                    border: m.from==='user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    color: 'white'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{
                    width:24, height:24, borderRadius:7,
                    background:'linear-gradient(135deg,#6366f1,#a855f7)',
                    display:'flex', alignItems:'center', justifyContent:'center'
                  }}>
                    <Bot size={12} style={{ color:'white' }}/>
                  </div>
                  <div style={{
                    padding:'10px 14px', borderRadius:'4px 16px 16px 16px',
                    background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
                    display:'flex', gap:5
                  }}>
                    {[0,0.15,0.3].map((d,i) => (
                      <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#818cf8', animation:`bounce 0.8s ease-in-out ${d}s infinite` }}/>
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>

            {/* Suggested prompts */}
            {messages.length === 1 && (
              <div style={{ padding:'0 16px 10px', display:'flex', flexWrap:'wrap', gap:6 }}>
                {[
                  '🎵 Ceritakan lagu ini',
                  '💫 Rekomendasikan lagu sejenis',
                  '🌙 Apa vibe lagu ini?',
                ].map((q,i) => (
                  <button key={i} onClick={() => { setInput(q); }} style={{
                    padding:'6px 12px', borderRadius:999, border:`1px solid rgba(255,255,255,0.15)`,
                    background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)',
                    fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.2s'
                  }}>{q}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding:'10px 16px 14px', flexShrink:0, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', gap:8 }}>
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && sendChat()}
                  placeholder="Tanya Starry AI..."
                  style={{
                    flex:1, background:'rgba(255,255,255,0.07)',
                    border:'1px solid rgba(255,255,255,0.12)', borderRadius:12,
                    padding:'10px 14px', fontSize:13, color:'white', outline:'none'
                  }}/>
                <button onClick={sendChat} disabled={chatLoading || !input.trim()} style={{
                  width:42, height:42, borderRadius:12, border:'none',
                  background:input.trim() ? track.color : 'rgba(255,255,255,0.1)',
                  color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'background 0.2s', opacity: chatLoading ? 0.5 : 1, flexShrink:0
                }}>
                  <Send size={16}/>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ══ Bottom Tab Bar */}
      <nav style={{
        position:'relative', zIndex:10, flexShrink:0,
        display:'flex', alignItems:'center',
        background:'rgba(7,7,26,0.95)', backdropFilter:'blur(20px)',
        borderTop:'1px solid rgba(255,255,255,0.08)',
        padding:'8px 16px 12px',
        paddingBottom:`max(12px, env(safe-area-inset-bottom))`
      }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              padding:'6px 0', background:'none', border:'none', cursor:'pointer',
              color: active ? track.color : 'rgba(255,255,255,0.35)',
              transition:'color 0.2s'
            }}>
              <div style={{
                padding:'4px 14px', borderRadius:999,
                background: active ? `${track.color}22` : 'transparent',
                transition:'background 0.2s'
              }}>
                {t.icon}
              </div>
              <span style={{ fontSize:10, fontWeight: active ? 700 : 500, letterSpacing:'0.02em' }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        @keyframes spin20{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.9)}}
        .stars{
          position:absolute;width:200%;height:200%;
          background-image:
            radial-gradient(1px 1px at 15px 25px,rgba(255,255,255,0.6),transparent),
            radial-gradient(1.5px 1.5px at 90px 130px,rgba(255,255,255,0.4),transparent),
            radial-gradient(1px 1px at 180px 70px,rgba(255,255,255,0.5),transparent),
            radial-gradient(2px 2px at 280px 220px,rgba(255,255,255,0.3),transparent),
            radial-gradient(1px 1px at 40px 180px,rgba(255,255,255,0.5),transparent),
            radial-gradient(1.5px 1.5px at 160px 30px,rgba(255,255,255,0.4),transparent),
            radial-gradient(1px 1px at 240px 100px,rgba(255,255,255,0.3),transparent),
            radial-gradient(2px 2px at 60px 260px,rgba(255,255,255,0.2),transparent);
          background-size:300px 300px;
          animation:starMove 120s linear infinite;
        }
        @keyframes starMove{from{transform:translate(0,0)}to{transform:translate(-300px,-300px)}}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        input::placeholder{color:rgba(148,163,184,0.35)}
        input[type=range]{cursor:pointer;height:4px;border-radius:999px}
      `}</style>
    </div>
  );
}

// Shared button style
const btn = {
  background:'none', border:'none', cursor:'pointer',
  color:'rgba(255,255,255,0.5)', padding:8, display:'flex',
  transition:'color 0.2s', borderRadius:8
};
