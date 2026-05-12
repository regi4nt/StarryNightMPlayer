import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  LayoutGrid, Compass, Clock, Star, Award,
  Sparkles, MessageSquare, X, Send, Zap, User
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────────────
const SONGS_DATA = [
  {
    id: 1,
    title: "Deep Space Night",
    artist: "SoundHelix Vol. 1",
    cover: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    accent: "#3b82f6",
    nebula: "from-blue-900/40",
    mood: "calm, expansive, mysterious"
  },
  {
    id: 2,
    title: "Lunar Reflection",
    artist: "SoundHelix Vol. 2",
    cover: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    accent: "#a855f7",
    nebula: "from-purple-900/40",
    mood: "melancholic, bright, reflective"
  },
  {
    id: 3,
    title: "Nebula Pulse",
    artist: "SoundHelix Vol. 3",
    cover: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    accent: "#6366f1",
    nebula: "from-indigo-900/40",
    mood: "energetic, rhythmic, futuristic"
  },
  {
    id: 4,
    title: "Aurora Glow",
    artist: "SoundHelix Vol. 8",
    cover: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=400&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    accent: "#14b8a6",
    nebula: "from-teal-900/40",
    mood: "uplifting, organic, vibrant"
  }
];

// ─── Claude API Helper ──────────────────────────────────────────────────────
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

async function askClaude(userPrompt, systemPrompt = "") {
  if (!ANTHROPIC_API_KEY) {
    return "⚠️ No API key configured. Add VITE_ANTHROPIC_API_KEY to your .env.local file or Vercel environment variables.";
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });
    const data = await response.json();
    return data.content?.[0]?.text || "The cosmos is silent right now.";
  } catch {
    return "Connection to the neural nebula lost. Please try again.";
  }
}

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [currentTrack, setCurrentTrack] = useState(SONGS_DATA[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume] = useState(0.7);
  const [view, setView] = useState('orbital');

  // AI States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: "Greetings, Traveler. I am your Cosmic Navigator. Ask me anything about the tracks or the universe." }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [astralInsight, setAstralInsight] = useState("");
  const [vibeQuery, setVibeQuery] = useState("");

  const audioRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Init audio
  useEffect(() => {
    audioRef.current = new Audio(currentTrack.src);
    audioRef.current.volume = volume;
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => handleNext();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrack]);

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Scroll chat to bottom
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

  const getAstralInsight = async () => {
    setIsAiLoading(true);
    const insight = await askClaude(
      `Provide a poetic 1-sentence 'astral insight' for a song titled "${currentTrack.title}" by ${currentTrack.artist}. Its vibe is ${currentTrack.mood}. Mention something about cosmic energy or stars.`,
      "You are a poetic space oracle. Keep your response under 25 words. Return only the poetic sentence, no quotes, no preamble."
    );
    setAstralInsight(insight);
    setIsAiLoading(false);
  };

  const sendChatMessage = async () => {
    if (!userInput.trim()) return;
    const msgText = userInput;
    setChatMessages(prev => [...prev, { role: 'user', text: msgText }]);
    setUserInput("");
    setIsAiLoading(true);

    const reply = await askClaude(
      msgText,
      `You are the Cosmic Navigator, an AI guide for a space-themed music station. You are helpful, slightly futuristic, and knowledgeable about music vibes and astronomy. Keep responses concise (under 80 words). The user is currently listening to "${currentTrack.title}" by ${currentTrack.artist}.`
    );
    setChatMessages(prev => [...prev, { role: 'bot', text: reply }]);
    setIsAiLoading(false);
  };

  const searchByVibe = async () => {
    if (!vibeQuery.trim() || isAiLoading) return;
    setIsAiLoading(true);
    const reply = await askClaude(
      `Find the best song for this vibe: ${vibeQuery}`,
      `Analyze the user's vibe description and return ONLY a single digit: 1, 2, 3, or 4.
Songs: 1=Deep Space Night (calm, expansive, mysterious), 2=Lunar Reflection (melancholic, reflective), 3=Nebula Pulse (energetic, futuristic), 4=Aurora Glow (uplifting, vibrant).
Return only the digit, nothing else.`
    );
    const id = parseInt(reply.trim());
    const match = SONGS_DATA.find(s => s.id === id);
    if (match) {
      selectTrack(match);
      setVibeQuery(`✨ ${match.title}`);
    }
    setIsAiLoading(false);
  };

  const formatTime = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  const radius = 155;
  const circumference = 2 * Math.PI * radius;
  const pct = duration > 0 ? progress / duration : 0;
  const angle = pct * 360 - 90;
  const dotX = Math.cos(angle * (Math.PI / 180)) * radius;
  const dotY = Math.sin(angle * (Math.PI / 180)) * radius;

  return (
    <div className="relative h-screen w-full bg-[#0a0a23] text-slate-100 overflow-hidden font-sans select-none">

      {/* Starscape */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="stars-layer" />
        <div className={`absolute inset-0 bg-gradient-to-tr ${currentTrack.nebula} to-transparent opacity-60 transition-all duration-[3000ms]`} />
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Star size={17} className="text-white fill-current" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase hidden sm:block">Cosmic</span>
        </div>

        <nav className="flex items-center gap-1 bg-white/5 backdrop-blur-2xl p-1 rounded-2xl border border-white/10">
          {[
            { id: 'orbital', icon: Compass },
            { id: 'library', icon: LayoutGrid },
            { id: 'profile', icon: User }
          ].map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`p-2.5 rounded-xl transition-all ${view === id ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:bg-white/5'}`}
            >
              <Icon size={19} />
            </button>
          ))}
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-2.5 rounded-xl text-indigo-400 hover:bg-indigo-500/10 transition-all"
          >
            <Sparkles size={19} />
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="relative z-10 h-[calc(100vh-88px)] w-full flex items-center justify-center p-4 overflow-hidden">

        {/* ── Orbital View ── */}
        {view === 'orbital' && (
          <div className="flex flex-col items-center w-full max-w-md animate-in fade-in zoom-in duration-700">

            {/* Ring + Album Art */}
            <div className="relative mb-14 flex items-center justify-center">
              <svg
                width="340" height="340"
                className="absolute pointer-events-none"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle cx="170" cy="170" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
                <circle
                  cx="170" cy="170" r={radius}
                  stroke={currentTrack.accent} strokeWidth="3" fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - circumference * pct}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s linear' }}
                />
              </svg>

              {/* Orbiting dot */}
              <div
                className="absolute z-30 pointer-events-none"
                style={{ transform: `translate(${dotX}px, ${dotY}px)` }}
              >
                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] ring-4 ring-white/20" />
              </div>

              {/* Album art */}
              <div
                className={`w-52 h-52 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative z-10 ${isPlaying ? 'rotate-slow' : ''}`}
                style={{ boxShadow: `0 0 60px -10px ${currentTrack.accent}70` }}
              >
                <img src={currentTrack.cover} className="w-full h-full object-cover" alt={currentTrack.title} />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Controls */}
              <div className="absolute -bottom-7 flex items-center gap-3 bg-white/10 backdrop-blur-3xl px-5 py-3 rounded-full border border-white/10 shadow-2xl z-40">
                <button onClick={handlePrev} className="p-2 hover:text-indigo-400 transition-colors">
                  <SkipBack size={19} fill="currentColor" />
                </button>
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className="w-13 h-13 bg-white text-indigo-950 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                  style={{ width: 52, height: 52 }}
                >
                  {isPlaying
                    ? <Pause size={22} fill="currentColor" />
                    : <Play size={22} fill="currentColor" className="ml-0.5" />}
                </button>
                <button onClick={handleNext} className="p-2 hover:text-indigo-400 transition-colors">
                  <SkipForward size={19} fill="currentColor" />
                </button>
              </div>
            </div>

            {/* Track info */}
            <div className="text-center w-full px-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-1 text-white truncate">{currentTrack.title}</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] opacity-60">{currentTrack.artist}</p>

              {/* Time */}
              <div className="mt-3 flex justify-between text-xs text-slate-500 font-mono px-1">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Astral Insight */}
              <div className="mt-4 flex flex-col items-center">
                {!astralInsight ? (
                  <button
                    onClick={getAstralInsight}
                    disabled={isAiLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-300 transition-all disabled:opacity-50"
                  >
                    {isAiLoading ? <Zap size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {isAiLoading ? "Channeling cosmos..." : "Get Astral Insight"}
                  </button>
                ) : (
                  <div
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl max-w-sm cursor-pointer animate-in fade-in slide-in-from-top-2"
                    onClick={() => setAstralInsight("")}
                  >
                    <p className="text-xs text-indigo-200 italic leading-relaxed">"{astralInsight}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Library View ── */}
        {view === 'library' && (
          <div className="w-full max-w-2xl h-full flex flex-col animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-4 gap-4">
              <h3 className="text-2xl md:text-3xl font-black">Galaxy Stash</h3>

              {/* Vibe Finder */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Describe your vibe..."
                  value={vibeQuery}
                  onChange={e => setVibeQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchByVibe()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <Sparkles size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                <button onClick={searchByVibe} disabled={isAiLoading} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 disabled:opacity-40">
                  <Zap size={14} className={isAiLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 px-4 pb-8 scrollbar-hide">
              {SONGS_DATA.map(song => (
                <div
                  key={song.id}
                  onClick={() => selectTrack(song)}
                  className={`flex items-center gap-4 p-3 rounded-3xl cursor-pointer transition-all border ${currentTrack.id === song.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:bg-white/8'}`}
                >
                  <img src={song.cover} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt={song.title} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base truncate">{song.title}</h4>
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5">{song.artist}</p>
                  </div>
                  {currentTrack.id === song.id && isPlaying && (
                    <div className="flex gap-0.5 items-end h-4 pr-3">
                      {[1, 0.5, 0.8].map((h, i) => (
                        <div key={i} className="w-1 bg-indigo-400 rounded-full animate-pulse" style={{ height: `${h * 16}px`, animationDelay: `${i * 0.1}s` }} />
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
          <div className="w-full max-w-sm bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 animate-in zoom-in-95 duration-500 shadow-2xl text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 shadow-xl rotate-3">
              <User size={40} className="text-white" />
            </div>
            <h3 className="text-xl font-black mb-1">Star Voyager</h3>
            <p className="text-indigo-400 text-[10px] font-bold tracking-widest uppercase mb-7">Level: Nebula Scout</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                <Clock className="text-slate-500 mb-2" size={18} />
                <span className="text-xl font-black block">12.4h</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Flight Time</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                <Award className="text-indigo-400 mb-2" size={18} />
                <span className="text-xl font-black block">42</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Badges Won</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left col-span-2">
                <Star className="text-yellow-400 mb-2 fill-yellow-400" size={18} />
                <span className="text-xl font-black block">{SONGS_DATA.find(s => s.id === currentTrack.id)?.title}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Currently Playing</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Chat Drawer ── */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsChatOpen(false)} />
          <div className="relative w-full max-w-sm h-full bg-[#0d0d2b] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-xl">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Cosmic Navigator</h4>
                  <p className="text-[10px] text-indigo-400 uppercase tracking-widest">AI Online</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 rounded-tl-none text-indigo-50'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex gap-1.5 items-center">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <div className="p-4 border-t border-white/10 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask the Navigator..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={isAiLoading || !userInput.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-white transition-colors"
                >
                  <Send size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
