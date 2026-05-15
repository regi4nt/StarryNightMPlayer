import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  ListMusic, Compass, Heart, Volume2, VolumeX,
  Sparkles, X, Send, Zap, Headphones, Bot,
  Upload, LogIn, LogOut, Plus, Cloud, Music,
  CheckCircle, Loader2, User, Shuffle, Repeat,
  Repeat1, Settings, Moon, FileText, Clock,
  ChevronRight, SlidersHorizontal, History,
  Search, Mic2, Trash2, ListPlus, FolderOpen,
  PenLine, ChevronLeft
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
//  SONGS
// ═══════════════════════════════════════════════════════
const SONGS = [
  { id:1, title:"Deep Space Night",   artist:"SoundHelix", album:"Vol. 1", cover:"https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&h=400&fit=crop", src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", color:"#3b82f6", bg:"rgba(59,130,246,0.15)",  mood:"calm, expansive, mysterious" },
  { id:2, title:"Lunar Reflection",   artist:"SoundHelix", album:"Vol. 2", cover:"https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=400&h=400&fit=crop", src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", color:"#a855f7", bg:"rgba(168,85,247,0.15)", mood:"melancholic, bright, reflective" },
  { id:3, title:"Nebula Pulse",        artist:"SoundHelix", album:"Vol. 3", cover:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=400&fit=crop", src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", color:"#6366f1", bg:"rgba(99,102,241,0.15)",  mood:"energetic, rhythmic, futuristic" },
  { id:4, title:"Aurora Glow",         artist:"SoundHelix", album:"Vol. 8", cover:"https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=400&fit=crop", src:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", color:"#14b8a6", bg:"rgba(20,184,166,0.15)",  mood:"uplifting, organic, vibrant" },
];

// ═══════════════════════════════════════════════════════
//  GOOGLE DRIVE
// ═══════════════════════════════════════════════════════
const GOOGLE_CLIENT_ID = '1028346781018-vbeafem60jrt8ctu1k1q07pfk41ejlnn.apps.googleusercontent.com';
const GOOGLE_SCOPES    = 'https://www.googleapis.com/auth/drive.file profile email';
const DRIVE_FOLDER     = 'Starry Night Music';
const SONG_COLORS = [
  { color:'#3b82f6', bg:'rgba(59,130,246,0.15)' },  { color:'#a855f7', bg:'rgba(168,85,247,0.15)' },
  { color:'#6366f1', bg:'rgba(99,102,241,0.15)' },  { color:'#14b8a6', bg:'rgba(20,184,166,0.15)' },
  { color:'#f59e0b', bg:'rgba(245,158,11,0.15)' },  { color:'#ec4899', bg:'rgba(236,72,153,0.15)' },
  { color:'#22c55e', bg:'rgba(34,197,94,0.15)' },   { color:'#ef4444', bg:'rgba(239,68,68,0.15)' },
];
const COVERS = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
];
const randItem = arr => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════
//  EQUALIZER CONFIG
// ═══════════════════════════════════════════════════════
const EQ_FREQS   = [60, 250, 1000, 4000, 16000];
const EQ_LABELS  = ['60Hz','250Hz','1kHz','4kHz','16kHz'];
const EQ_PRESETS = {
  'Normal':     [0,   0,   0,   0,   0],
  'Bass Boost': [7,   5,   0,  -2,  -2],
  'Treble':     [-3, -2,   0,   5,   7],
  'Pop':        [-1,  2,   4,   2,  -1],
  'Rock':       [4,   2,  -2,   2,   4],
  'Classical':  [4,   3,  -2,   3,   4],
  'Electronic': [5,   3,   0,   3,   5],
  'Hip-Hop':    [5,   4,   0,  -2,  -1],
  'Jazz':       [3,   2,   0,   2,   3],
  'Acoustic':   [3,   2,   0,   2,   1],
};
const SLEEP_OPTIONS = [
  { label:'5 menit',  min:5  },
  { label:'10 menit', min:10 },
  { label:'15 menit', min:15 },
  { label:'30 menit', min:30 },
  { label:'45 menit', min:45 },
  { label:'1 jam',    min:60 },
];

// ═══════════════════════════════════════════════════════
//  AI
// ═══════════════════════════════════════════════════════
const API_KEYS = ["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"];
const FREE_MODELS = [
  "deepseek/deepseek-chat-v3-0324:free","meta-llama/llama-4-maverick:free",
  "deepseek/deepseek-r1:free","qwen/qwen3-235b-a22b:free",
  "meta-llama/llama-3.3-70b-instruct:free","qwen/qwen-2.5-72b-instruct:free",
  "google/gemma-3-12b-it:free","openrouter/quasar-alpha:free",
];
const SLOTS = API_KEYS.flatMap(k => FREE_MODELS.map(m => ({ k, m })));
let slotIdx = 0;
async function askAI(user, system='', tries=0) {
  const valid = API_KEYS.filter(k => k && !k.includes('GANTI_KEY'));
  if (!valid.length) return '⚠️ Belum ada API key.';
  if (tries >= SLOTS.length) { slotIdx=0; return 'Semua model sibuk, coba lagi.'; }
  const {k,m} = SLOTS[slotIdx % SLOTS.length];
  try {
    const res  = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method:'POST',
      headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${k}`,'HTTP-Referer':window.location.origin,'X-Title':'Starry Night' },
      body: JSON.stringify({ model:m, max_tokens:500, messages:[...(system?[{role:'system',content:system}]:[]),{role:'user',content:user}] })
    });
    const data = await res.json();
    if (res.status===429||res.status===503||data.error) { slotIdx=(slotIdx+1)%SLOTS.length; return askAI(user,system,tries+1); }
    const txt = data.choices?.[0]?.message?.content;
    if (!txt) { slotIdx=(slotIdx+1)%SLOTS.length; return askAI(user,system,tries+1); }
    return txt.trim();
  } catch { slotIdx=(slotIdx+1)%SLOTS.length; return askAI(user,system,tries+1); }
}
const activeModel = () => SLOTS[slotIdx%SLOTS.length].m.split('/')[1]?.replace(':free','') || '';
const hasKey = () => API_KEYS.some(k => k && !k.includes('GANTI_KEY'));

// ═══════════════════════════════════════════════════════
//  GOOGLE DRIVE HELPERS
// ═══════════════════════════════════════════════════════
async function driveGetFolderId(token) {
  const q = encodeURIComponent(`name='${DRIVE_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const res  = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`, { headers:{ Authorization:`Bearer ${token}` } });
  const data = await res.json();
  if (data.files?.length>0) return data.files[0].id;
  const c = await fetch('https://www.googleapis.com/drive/v3/files',{ method:'POST', headers:{ Authorization:`Bearer ${token}`,'Content-Type':'application/json' }, body:JSON.stringify({ name:DRIVE_FOLDER, mimeType:'application/vnd.google-apps.folder' }) });
  return (await c.json()).id;
}
async function driveListSongs(token) {
  const fid  = await driveGetFolderId(token);
  const q    = encodeURIComponent(`'${fid}' in parents and mimeType contains 'audio' and trashed=false`);
  const res  = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,appProperties,mimeType)&pageSize=100`, { headers:{ Authorization:`Bearer ${token}` } });
  const data = await res.json();
  return (data.files||[]).map(f => {
    const ap=f.appProperties||{}, clr=ap.color||randItem(SONG_COLORS).color;
    return { id:`drive_${f.id}`, driveId:f.id, title:ap.title||f.name.replace(/\.[^/.]+$/,''), artist:ap.artist||'Unknown', album:ap.album||'My Songs', cover:ap.cover||randItem(COVERS), color:clr, bg:ap.bg||'rgba(99,102,241,0.15)', mood:'personal, custom', isDrive:true, src:null };
  });
}
async function driveStreamBlob(driveId, token) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${driveId}?alt=media`, { headers:{ Authorization:`Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive ${res.status}`);
  return URL.createObjectURL(await res.blob());
}
async function driveUploadSong(file, meta, token) {
  const folderId=await driveGetFolderId(token), ci=randItem(SONG_COLORS), cover=randItem(COVERS);
  const metadata={ name:file.name, parents:[folderId], appProperties:{ title:meta.title||file.name.replace(/\.[^/.]+$/,''), artist:meta.artist||'Unknown', album:meta.album||'My Songs', cover, color:ci.color, bg:ci.bg } };
  const form=new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)],{type:'application/json'}));
  form.append('file', file);
  const res=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,appProperties',{ method:'POST', headers:{ Authorization:`Bearer ${token}` }, body:form });
  if (!res.ok) { const e=await res.json(); throw new Error(e.error?.message||'Upload gagal'); }
  const fd=await res.json();
  return { id:`drive_${fd.id}`, driveId:fd.id, title:metadata.appProperties.title, artist:metadata.appProperties.artist, album:metadata.appProperties.album, cover, color:ci.color, bg:ci.bg, mood:'personal, custom', isDrive:true, src:URL.createObjectURL(file) };
}

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
const fmt = t => { if (!t||isNaN(t)) return '0:00'; return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`; };
const fmtSec = s => { const m=Math.floor(s/60), sec=s%60; return `${m}:${String(sec).padStart(2,'0')}`; };


// ═══════════════════════════════════════════════════════
//  PLAYLIST MODAL - Create / Edit
// ═══════════════════════════════════════════════════════
function PlaylistModal({ onClose, onSave, allSongs, existing }) {
  const isEdit = !!existing;
  const [name, setName] = useState(existing?.name || '');
  const [selected, setSelected] = useState(new Set(existing?.songIds || []));

  const toggle = id => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', animation:'fadeUp 0.25s ease' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:'100%', maxHeight:'92dvh', overflowY:'auto', background:'#0f0f2a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px 24px 0 0', padding:'20px 20px 32px' }}>
        <div style={{ width:36, height:4, borderRadius:999, background:'rgba(255,255,255,0.15)', margin:'0 auto 18px' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {isEdit ? <PenLine size={16} style={{color:'white'}}/> : <ListPlus size={16} style={{color:'white'}}/>}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:15 }}>{isEdit ? 'Edit Playlist' : 'Buat Playlist Baru'}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{selected.size} lagu dipilih</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}><X size={20}/></button>
        </div>

        {/* Name */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Nama Playlist</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama playlist kamu..."
            style={{ width:'100%', marginTop:6, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 12px', fontSize:13, color:'white', outline:'none' }}/>
        </div>

        {/* Song picker */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Pilih Lagu</label>
          <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:4 }}>
            {allSongs.map(s => {
              const on = selected.has(s.id);
              return (
                <div key={s.id} onClick={()=>toggle(s.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:12, cursor:'pointer', background:on?s.bg:'rgba(255,255,255,0.03)', border:`1px solid ${on?s.color+'50':'rgba(255,255,255,0.08)'}`, transition:'all 0.15s' }}>
                  <img src={s.cover} style={{ width:34, height:34, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:on?'white':'rgba(255,255,255,0.8)' }}>{s.title}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{s.artist}</div>
                  </div>
                  <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${on?s.color:'rgba(255,255,255,0.2)'}`, background:on?s.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                    {on && <CheckCircle size={12} style={{color:'white'}}/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px 0', borderRadius:14, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:700, cursor:'pointer' }}>Batal</button>
          <button onClick={()=>{ if(!name.trim()) return alert('Isi nama playlist!'); onSave({ name:name.trim(), songIds:[...selected] }); }}
            style={{ flex:2, padding:'12px 0', borderRadius:14, border:'none', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:13, fontWeight:800, cursor:'pointer' }}>
            {isEdit ? 'Simpan Perubahan' : 'Buat Playlist'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  APP LOGO
// ═══════════════════════════════════════════════════════
function AppLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#c084fc"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Dark background */}
      <circle cx="16" cy="16" r="15.5" fill="#07071e"/>
      {/* Outer border gradient */}
      <circle cx="16" cy="16" r="15.5" stroke="url(#lg1)" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Orbit ring - dashed like the player ring */}
      <circle cx="16" cy="16" r="10.5" stroke="url(#lg1)" strokeWidth="2.2" fill="none"
        strokeDasharray="46 20" strokeLinecap="round" transform="rotate(-60 16 16)"/>
      {/* Glowing dot on orbit (top-right position) */}
      <circle cx="23.4" cy="9.4" r="2.2" fill="white" filter="url(#glow)"/>
      {/* 4-pointed star / spark in center */}
      <path d="M16 9.5 L17.1 14.9 L22.5 16 L17.1 17.1 L16 22.5 L14.9 17.1 L9.5 16 L14.9 14.9 Z"
        fill="white" opacity="0.95" filter="url(#glow)"/>
      {/* Tiny accent stars */}
      <circle cx="7.5" cy="8.5" r="0.9" fill="white" opacity="0.55"/>
      <circle cx="24.5" cy="24" r="0.7" fill="white" opacity="0.45"/>
      <circle cx="9" cy="23.5" r="0.6" fill="#60a5fa" opacity="0.7"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
//  ORBITAL RING  — tap OR drag to seek
// ═══════════════════════════════════════════════════════
function OrbitalRing({ size, pct, color, progress, duration, isPlaying, cover, title, onSeek }) {
  const cx=size/2, cy=size/2, artR=size/2-36, ringR=artR+18, circ=2*Math.PI*ringR;
  const deg=pct*360-90, rad=deg*Math.PI/180;
  const dotX=cx+Math.cos(rad)*ringR, dotY=cy+Math.sin(rad)*ringR;
  const lblR=ringR+26, lblX=cx+Math.cos(rad)*lblR, lblY=cy+Math.sin(rad)*lblR;
  const durX=cx+Math.cos(Math.PI/2)*lblR, durY=cy+Math.sin(Math.PI/2)*lblR;

  const svgRef  = useRef(null);
  const dragging = useRef(false);

  const getPct = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - cx, y = clientY - rect.top - cy;
    let a = Math.atan2(x, -y); if (a < 0) a += 2 * Math.PI;
    return a / (2 * Math.PI);
  };
  const nearRing = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - cx, y = clientY - rect.top - cy;
    return Math.abs(Math.sqrt(x*x+y*y) - ringR) <= 38;
  };

  // Mouse events
  const onMouseDown = e => { if (!onSeek||!duration||!nearRing(e.clientX,e.clientY)) return; dragging.current=true; onSeek(getPct(e.clientX,e.clientY)); };
  const onMouseMove = e => { if (!dragging.current||!onSeek) return; onSeek(getPct(e.clientX,e.clientY)); };
  const onMouseUp   = () => { dragging.current=false; };

  // Touch events — need non-passive to call preventDefault (stops page scroll during drag)
  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    const tStart = e => {
      const t=e.touches[0]; if (!onSeek||!duration||!nearRing(t.clientX,t.clientY)) return;
      dragging.current=true; onSeek(getPct(t.clientX,t.clientY)); e.preventDefault();
    };
    const tMove = e => {
      if (!dragging.current||!onSeek) return;
      const t=e.touches[0]; onSeek(getPct(t.clientX,t.clientY)); e.preventDefault();
    };
    const tEnd = () => { dragging.current=false; };
    svg.addEventListener('touchstart', tStart, { passive:false });
    svg.addEventListener('touchmove',  tMove,  { passive:false });
    svg.addEventListener('touchend',   tEnd);
    return () => { svg.removeEventListener('touchstart',tStart); svg.removeEventListener('touchmove',tMove); svg.removeEventListener('touchend',tEnd); };
  }, [onSeek, duration, size]); // eslint-disable-line

  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      {/* Album art */}
      <div style={{ position:'absolute', top:cy-artR, left:cx-artR, width:artR*2, height:artR*2, borderRadius:'50%', overflow:'hidden', border:'3px solid rgba(255,255,255,0.13)', boxShadow:`0 0 40px -8px ${color}90`, animation:isPlaying?'spin20 20s linear infinite':'none', zIndex:2 }}>
        <img src={cover} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
      </div>
      {/* SVG ring — mouse drag + click */}
      <svg ref={svgRef} width={size} height={size}
        style={{ position:'absolute', inset:0, zIndex:3, overflow:'visible', cursor:duration?'grab':'default', touchAction:'none' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        {/* Wide invisible hit area */}
        <circle cx={cx} cy={cy} r={ringR} stroke="transparent" strokeWidth="44" fill="none"/>
        {/* Track */}
        <circle cx={cx} cy={cy} r={ringR} stroke="rgba(255,255,255,0.09)" strokeWidth="3.5" fill="none"/>
        {/* Progress arc */}
        <circle cx={cx} cy={cy} r={ringR} stroke={color} strokeWidth="4.5" fill="none"
          strokeDasharray={circ} strokeDashoffset={circ-circ*pct} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: dragging.current?'none':'stroke-dashoffset 0.35s linear', filter:`drop-shadow(0 0 6px ${color})` }}/>
        {/* 0:00 tick */}
        <line x1={cx} y1={cy-ringR-7} x2={cx} y2={cy-ringR+7} stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Dot glow */}
        <circle cx={dotX} cy={dotY} r={14} fill={color} opacity="0.15"/>
        {/* Draggable dot */}
        <circle cx={dotX} cy={dotY} r={7} fill="white"
          style={{ filter:'drop-shadow(0 0 8px rgba(255,255,255,1))', cursor:'grab' }}/>
        {/* Current time */}
        {pct>0.01&&<text x={lblX} y={lblY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="monospace" style={{ filter:'drop-shadow(0 1px 5px rgba(0,0,0,1))', pointerEvents:'none' }}>{fmt(progress)}</text>}
        {/* Duration */}
        <text x={durX} y={durY} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.28)" fontSize="10" fontWeight="600" fontFamily="monospace" style={{ pointerEvents:'none' }}>{fmt(duration)}</text>
        {/* Start label */}
        <text x={cx} y={cy-ringR-20} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.18)" fontSize="10" fontWeight="600" fontFamily="monospace" style={{ pointerEvents:'none' }}>0:00</text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SONG ROW
// ═══════════════════════════════════════════════════════
function SongRow({ s, i, track, playing, liked, setLiked, play, isDrive, onRemove, playlists, addToPlaylist }) {
  const isActive = track.id === s.id;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:14, cursor:'pointer', background:isActive?s.bg:'rgba(255,255,255,0.04)', border:`1px solid ${isActive?s.color+'50':'transparent'}`, transition:'all 0.2s' }} onClick={()=>play(s)}>
      <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:isActive?s.color:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:isActive?'white':'rgba(255,255,255,0.4)' }}>
        {isActive&&playing ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end' }}>{[12,6,10].map((h,j)=>(<div key={j} style={{ width:2.5, height:h, background:'white', borderRadius:1, animation:`bounce 0.8s ease-in-out ${j*0.15}s infinite` }}/>))}</div> : isDrive?<Cloud size={12}/>:i+1}
      </div>
      <img src={s.cover} alt={s.title} style={{ width:42, height:42, borderRadius:10, objectFit:'cover', flexShrink:0 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:isActive?'white':'rgba(255,255,255,0.85)' }}>{s.title}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{s.artist} · {s.album}{isDrive&&<span style={{ color:s.color, marginLeft:4 }}>· Drive</span>}</div>
      </div>
      <div style={{ display:'flex', gap:2 }}>
        {onRemove&&<button onClick={e=>{e.stopPropagation();onRemove(s.id)}} style={{ ...btn, color:'rgba(255,255,255,0.2)', padding:6 }}><Trash2 size={14}/></button>}
        {playlists&&addToPlaylist&&(
          <div style={{ position:'relative' }} onClick={e=>e.stopPropagation()}>
            <button
              style={{ ...btn, color:'rgba(255,255,255,0.2)', padding:6 }}
              title="Tambah ke Playlist"
              onClick={e=>{ e.stopPropagation(); const el=e.currentTarget.nextSibling; el.style.display=el.style.display==='block'?'none':'block'; }}
            ><ListPlus size={14}/></button>
            <div style={{ display:'none', position:'absolute', right:0, top:'110%', zIndex:50, background:'#1a1a3e', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, minWidth:160, padding:'6px 0', boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', padding:'4px 12px 6px', textTransform:'uppercase', letterSpacing:'0.1em' }}>Tambah ke</div>
              {playlists.map(pl=>(
                <div key={pl.id} onClick={()=>{ addToPlaylist(pl.id, s.id); }} style={{ padding:'7px 12px', fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.8)', cursor:'pointer', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  {pl.name}
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={e=>{e.stopPropagation();setLiked(l=>({...l,[s.id]:!l[s.id]}))}} style={{ ...btn, color:liked[s.id]?'#f472b6':'rgba(255,255,255,0.2)', padding:6 }}><Heart size={15} fill={liked[s.id]?'#f472b6':'none'}/></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SETTINGS PANEL  (EQ, Crossfade, Sleep Timer)
// ═══════════════════════════════════════════════════════
function SettingsPanel({ onClose, color, eqEnabled, setEqEnabled, eqPreset, setEqPreset, eqGains, setEqGains, crossfade, setCrossfade, sleepTimer, startSleepTimer, cancelSleepTimer }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', animation:'fadeUp 0.25s ease' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:'100%', maxHeight:'92dvh', overflowY:'auto', background:'#0d0d24', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px 24px 0 0', padding:'20px 20px 36px' }}>
        <div style={{ width:36, height:4, borderRadius:999, background:'rgba(255,255,255,0.15)', margin:'0 auto 20px' }}/>

        {/* ── EQUALIZER */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <SlidersHorizontal size={16} style={{ color }}/>
              <span style={{ fontWeight:800, fontSize:14 }}>Equalizer</span>
            </div>
            {/* Toggle */}
            <div onClick={()=>setEqEnabled(v=>!v)} style={{ width:44, height:24, borderRadius:999, background:eqEnabled?color:'rgba(255,255,255,0.1)', cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
              <div style={{ position:'absolute', top:3, left:eqEnabled?22:3, width:18, height:18, borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
            </div>
          </div>

          {/* Preset pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
            {Object.keys(EQ_PRESETS).map(p=>(
              <button key={p} onClick={()=>{ setEqPreset(p); setEqGains([...EQ_PRESETS[p]]); }} style={{ padding:'5px 12px', borderRadius:999, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', background:eqPreset===p?color:'rgba(255,255,255,0.08)', color:eqPreset===p?'white':'rgba(255,255,255,0.5)', transition:'all 0.15s' }}>{p}</button>
            ))}
          </div>

          {/* 5-band sliders */}
          <div style={{ opacity:eqEnabled?1:0.35, transition:'opacity 0.2s' }}>
            {EQ_FREQS.map((_, i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', width:36, textAlign:'right', fontFamily:'monospace' }}>{EQ_LABELS[i]}</span>
                <input type="range" min="-10" max="10" step="0.5" value={eqGains[i]} disabled={!eqEnabled}
                  onChange={e=>setEqGains(g=>g.map((v,j)=>j===i?+e.target.value:v))}
                  style={{ flex:1, accentColor:color, height:4 }}/>
                <span style={{ fontSize:10, fontWeight:700, color:eqGains[i]>0?color:eqGains[i]<0?'#ef4444':'rgba(255,255,255,0.35)', width:28, textAlign:'left', fontFamily:'monospace' }}>{eqGains[i]>0?'+':''}{eqGains[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CROSSFADE */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <Zap size={16} style={{ color }}/>
            <span style={{ fontWeight:800, fontSize:14 }}>Crossfade</span>
            <span style={{ marginLeft:'auto', fontSize:12, fontWeight:700, color, fontFamily:'monospace' }}>{crossfade}s</span>
          </div>
          <input type="range" min="0" max="8" step="1" value={crossfade} onChange={e=>setCrossfade(+e.target.value)} style={{ width:'100%', accentColor:color, height:4 }}/>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>Mati</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>8 detik</span>
          </div>
        </div>

        {/* ── SLEEP TIMER */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <Moon size={16} style={{ color }}/>
            <span style={{ fontWeight:800, fontSize:14 }}>Sleep Timer</span>
            {sleepTimer&&(
              <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, fontWeight:800, color, fontFamily:'monospace' }}>{fmtSec(sleepTimer.remaining)}</span>
                <button onClick={cancelSleepTimer} style={{ padding:'4px 10px', borderRadius:999, border:'none', background:'rgba(239,68,68,0.2)', color:'#fca5a5', fontSize:11, fontWeight:700, cursor:'pointer' }}>Batal</button>
              </div>
            )}
          </div>
          {!sleepTimer ? (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {SLEEP_OPTIONS.map(o=>(
                <button key={o.min} onClick={()=>{ startSleepTimer(o.min); onClose(); }} style={{ padding:'8px 14px', borderRadius:12, border:`1px solid rgba(255,255,255,0.12)`, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>{o.label}</button>
              ))}
            </div>
          ) : (
            <div style={{ padding:'12px 14px', borderRadius:12, background:`${color}15`, border:`1px solid ${color}30`, textAlign:'center' }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Musik berhenti dalam</div>
              <div style={{ fontSize:24, fontWeight:900, color, fontFamily:'monospace', marginTop:4 }}>{fmtSec(sleepTimer.remaining)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  UPLOAD MODAL
// ═══════════════════════════════════════════════════════
function UploadModal({ onClose, onUpload, uploading, uploadProgress, color }) {
  const [file,setFile]=useState(null), [title,setTitle]=useState(''), [artist,setArtist]=useState(''), [album,setAlbum]=useState(''), [dragging,setDragging]=useState(false);
  const fileRef=useRef(null);
  const handleFile=f=>{ if(!f||!f.type.startsWith('audio/')) return alert('Pilih file audio'); setFile(f); if(!title) setTitle(f.name.replace(/\.[^/.]+$/,'')); };
  const inp = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 12px', fontSize:13, color:'white', outline:'none', marginTop:6 };
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', animation:'fadeUp 0.25s ease' }} onClick={e=>e.target===e.currentTarget&&!uploading&&onClose()}>
      <div style={{ width:'100%', maxHeight:'92dvh', overflowY:'auto', background:'#0f0f2a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px 24px 0 0', padding:'20px 20px 32px' }}>
        <div style={{ width:36, height:4, borderRadius:999, background:'rgba(255,255,255,0.15)', margin:'0 auto 18px' }}/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${color},#6366f1)`, display:'flex', alignItems:'center', justifyContent:'center' }}><Upload size={16} style={{ color:'white' }}/></div>
            <div><div style={{ fontWeight:800, fontSize:15 }}>Tambah Lagu</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Upload ke Google Drive</div></div>
          </div>
          {!uploading&&<button onClick={onClose} style={{ ...btn, color:'rgba(255,255,255,0.5)' }}><X size={20}/></button>}
        </div>
        <div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0])}} onClick={()=>!uploading&&fileRef.current?.click()} style={{ border:`2px dashed ${file?color:dragging?color:'rgba(255,255,255,0.15)'}`, borderRadius:16, padding:'24px 20px', textAlign:'center', cursor:uploading?'default':'pointer', background:file?`${color}10`:dragging?`${color}08`:'rgba(255,255,255,0.02)', transition:'all 0.2s', marginBottom:18 }}>
          <input ref={fileRef} type="file" accept="audio/*" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])}/>
          {file ? (<><CheckCircle size={28} style={{ color, margin:'0 auto 8px', display:'block' }}/><div style={{ fontWeight:700, fontSize:13 }}>{file.name}</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{(file.size/1024/1024).toFixed(1)} MB</div></>) : (<><Music size={28} style={{ color:'rgba(255,255,255,0.2)', margin:'0 auto 8px', display:'block' }}/><div style={{ fontWeight:700, fontSize:13 }}>{dragging?'Lepas di sini!':'Ketuk atau drag & drop'}</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>MP3, M4A, WAV, FLAC, OGG</div></>)}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:18 }}>
          {[['Judul Lagu *',title,setTitle,'Nama lagu...'],['Artis',artist,setArtist,'Nama artis...'],['Album',album,setAlbum,'Nama album...']].map(([label,val,set,ph])=>(
            <div key={label}><label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</label><input value={val} onChange={e=>set(e.target.value)} placeholder={ph} disabled={uploading} style={inp}/></div>
          ))}
        </div>
        {uploading&&<div style={{ marginBottom:14 }}><div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}><span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Mengupload…</span><span style={{ fontSize:12, color, fontWeight:700 }}>{uploadProgress}%</span></div><div style={{ height:5, borderRadius:999, background:'rgba(255,255,255,0.08)' }}><div style={{ height:'100%', borderRadius:999, width:`${uploadProgress}%`, background:`linear-gradient(90deg,${color},${color}aa)`, transition:'width 0.3s' }}/></div></div>}
        <div style={{ display:'flex', gap:10 }}>
          {!uploading&&<button onClick={onClose} style={{ flex:1, padding:'12px 0', borderRadius:14, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:700, cursor:'pointer' }}>Batal</button>}
          <button onClick={()=>{ if(!file){alert('Pilih file dulu!');return;} onUpload(file,{title,artist,album}); }} disabled={uploading||!file} style={{ flex:2, padding:'12px 0', borderRadius:14, border:'none', background:!file?'rgba(255,255,255,0.08)':`linear-gradient(135deg,${color},#6366f1)`, color:'white', fontSize:13, fontWeight:800, cursor:uploading||!file?'default':'pointer', opacity:uploading?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {uploading?<><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>Mengupload...</>:<><Cloud size={15}/>Upload ke Drive</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════
export default function App() {
  // ── Core playback
  const [track, setTrack]       = useState(SONGS[0]);
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume]     = useState(0.75);
  const [muted, setMuted]       = useState(false);
  const [liked, setLiked]       = useState({});
  const [tab, setTab]           = useState('player');

  // ── New playback features
  const [shuffle, setShuffle]   = useState(false);
  const [repeat, setRepeat]     = useState('off'); // 'off'|'all'|'one'
  const [crossfade, setCrossfade] = useState(0);
  const [history, setHistory]   = useState([]);

  // ── EQ
  const [eqEnabled, setEqEnabled] = useState(false);
  const [eqPreset, setEqPreset]   = useState('Normal');
  const [eqGains, setEqGains]     = useState([0,0,0,0,0]);

  // ── Sleep timer
  const [sleepTimer, setSleepTimer]   = useState(null);
  const sleepIntervalRef              = useRef(null);

  // ── Lyrics
  const [lyrics, setLyrics]           = useState('');
  const [lyricsLoading, setLL]        = useState(false);

  // ── Settings panel
  const [showSettings, setShowSettings] = useState(false);

  // ── Queue / search
  const [searchQuery, setSearchQuery]   = useState('');

  // ── AI
  const [insight, setInsight]   = useState('');
  const [insightLoading, setIL] = useState(false);
  const [messages, setMessages] = useState([{ from:'ai', text:'Halo! Saya Starry AI 🌟 Tanya apa saja tentang musik yang sedang diputar!' }]);
  const [input, setInput]       = useState('');
  const [chatLoading, setCL]    = useState(false);
  const [vibeInput, setVibeInput] = useState('');
  const [vibeLoading, setVL]    = useState(false);

  // ── Google Drive
  const [googleUser, setGoogleUser]     = useState(null);
  const [accessToken, setAccessToken]   = useState(null);
  const [customSongs, setCustomSongs]   = useState([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [showUpload, setShowUpload]     = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProg] = useState(0);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [driveError, setDriveError]     = useState('');

  // ── Playlists
  const [playlists, setPlaylists]         = useState([
    { id:'pl_fav', name:'❤️ Favorit', songIds:[], locked:false },
    { id:'pl_chill', name:'🌙 Chill Night', songIds:[1,2], locked:false },
  ]);
  const [activePl, setActivePl]           = useState(null); // null = all songs, else playlist id
  const [showPlModal, setShowPlModal]     = useState(false);
  const [editingPl, setEditingPl]         = useState(null);
  const [plView, setPlView]               = useState('list'); // 'list' | 'detail'

  // ── Responsive
  const [ringSize, setRingSize] = useState(260);

  // ── Refs
  const audioRef      = useRef(null);
  const chatEndRef    = useRef(null);
  const tokenRef      = useRef(null);
  const shuffleRef    = useRef(false);
  const repeatRef     = useRef('off');
  const audioCtxRef   = useRef(null);
  const eqNodesRef    = useRef([]);
  const masterGainRef = useRef(null);
  const cfGainRef     = useRef(null); // crossfade gain
  const crossfadeRef  = useRef(0);

  const allSongs = [...SONGS, ...customSongs];

  // ── Keep refs in sync
  useEffect(() => { shuffleRef.current  = shuffle;   }, [shuffle]);
  useEffect(() => { repeatRef.current   = repeat;    }, [repeat]);
  useEffect(() => { tokenRef.current    = accessToken; }, [accessToken]);
  useEffect(() => { crossfadeRef.current = crossfade; }, [crossfade]);

  // ── Load GIS
  useEffect(() => {
    if (!document.getElementById('gis-script')) {
      const s=document.createElement('script'); s.id='gis-script'; s.src='https://accounts.google.com/gsi/client'; s.async=true; document.head.appendChild(s);
    }
  }, []);

  // ── Responsive ring
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Measure all fixed UI elements:
      // header ~50 + tabbar ~60 + trackInfo ~55 + controls ~58 + secControls ~46 + insight ~42 + gaps ~36 = ~347
      const overhead = 347;
      const available = Math.min(vh - overhead, vw - 48);
      setRingSize(Math.max(185, Math.min(310, available)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // ── Audio init
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(track.src);
      audioRef.current.volume = volume;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ── Init Web Audio API (EQ + crossfade gain)
  const ensureAudioCtx = useCallback(() => {
    if (audioCtxRef.current || !audioRef.current) return;
    try {
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const src = ctx.createMediaElementSource(audioRef.current);
      const filters = EQ_FREQS.map((freq, i) => {
        const f = ctx.createBiquadFilter();
        f.type = i===0?'lowshelf':i===EQ_FREQS.length-1?'highshelf':'peaking';
        f.frequency.value = freq; f.gain.value = 0; return f;
      });
      const masterGain = ctx.createGain(); masterGain.gain.value = 1;
      src.connect(filters[0]);
      filters.forEach((f,i)=>{ if(i<filters.length-1) f.connect(filters[i+1]); });
      filters[filters.length-1].connect(masterGain);
      masterGain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      eqNodesRef.current  = filters;
      masterGainRef.current = masterGain;
    } catch(e) { console.warn('AudioContext error:', e); }
  }, []);

  // ── Apply EQ gains
  useEffect(() => {
    eqNodesRef.current.forEach((f, i) => { if (f) f.gain.value = eqEnabled ? eqGains[i] : 0; });
  }, [eqGains, eqEnabled]);

  // ── Audio events
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onMeta = () => setDuration(a.duration);
    const onEnd  = () => {
      if (repeatRef.current==='one') { a.currentTime=0; a.play(); }
      else goNext();
    };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    return () => { a.removeEventListener('timeupdate',onTime); a.removeEventListener('loadedmetadata',onMeta); a.removeEventListener('ended',onEnd); };
  }, [track, customSongs]);

  // ── Play/pause
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    if (playing) {
      ensureAudioCtx();
      if (audioCtxRef.current?.state==='suspended') audioCtxRef.current.resume();
      a.play().catch(e => { console.warn('play error:', e); setPlaying(false); });
    } else { a.pause(); }
  }, [playing, ensureAudioCtx]);

  // ── Volume/mute
  useEffect(() => { if (audioRef.current) audioRef.current.volume = muted?0:volume; }, [volume, muted]);

  // ── Chat scroll
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  // ── Track history
  useEffect(() => {
    setHistory(prev => { const f=prev.filter(s=>s.id!==track.id); return [track,...f].slice(0,15); });
    setLyrics(''); setInsight('');
  }, [track.id]);

  // ── Sleep timer cleanup
  useEffect(() => () => { if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current); }, []);

  // ── SLEEP TIMER
  const startSleepTimer = useCallback((minutes) => {
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    const endTime = Date.now() + minutes * 60_000;
    setSleepTimer({ minutes, remaining: minutes*60 });
    sleepIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setSleepTimer(p => ({ ...p, remaining }));
      if (remaining <= 0) { clearInterval(sleepIntervalRef.current); setSleepTimer(null); setPlaying(false); }
    }, 1000);
  }, []);
  const cancelSleepTimer = useCallback(() => { if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current); setSleepTimer(null); }, []);

  // ── PLAY (with crossfade support)
  const play = useCallback(async (t) => {
    let td = { ...t };
    if (t.isDrive && !t.src) {
      setLoadingTrack(true);
      try {
        const tok = tokenRef.current;
        if (!tok) throw new Error('Login Google dulu');
        const url = await driveStreamBlob(t.driveId, tok);
        setCustomSongs(prev => prev.map(s=>s.id===t.id?{...s,src:url}:s));
        td = { ...t, src: url };
      } catch(e) { alert('Gagal memutar: '+e.message); setLoadingTrack(false); return; }
      setLoadingTrack(false);
    }

    if (track.id === td.id) { setPlaying(p=>!p); return; }

    const cf = crossfadeRef.current;
    const doSwitch = () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src=td.src; audioRef.current.load(); }
      setTrack(td); setProgress(0); setDuration(0); setPlaying(true);
    };

    // Crossfade fade-out
    if (cf > 0 && masterGainRef.current && audioCtxRef.current) {
      const ctx  = audioCtxRef.current;
      const gain = masterGainRef.current.gain;
      const now  = ctx.currentTime;
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(gain.value, now);
      gain.linearRampToValueAtTime(0, now + cf);
      setTimeout(() => {
        doSwitch();
        // fade in
        setTimeout(() => {
          if (masterGainRef.current && audioCtxRef.current) {
            const g = masterGainRef.current.gain;
            const t2 = audioCtxRef.current.currentTime;
            g.cancelScheduledValues(t2); g.setValueAtTime(0, t2); g.linearRampToValueAtTime(1, t2 + cf);
          }
        }, 50);
      }, cf * 1000);
    } else { doSwitch(); }
  }, [track]);

  // ── NEXT / PREV
  const goNext = useCallback(() => {
    const songs = [...SONGS, ...customSongs];
    if (repeatRef.current==='one') { if(audioRef.current){audioRef.current.currentTime=0;audioRef.current.play();} return; }
    if (shuffleRef.current) {
      const others = songs.filter(s=>s.id!==track.id);
      if (others.length) play(others[Math.floor(Math.random()*others.length)]);
    } else {
      const i = songs.findIndex(s=>s.id===track.id);
      play(songs[(i+1)%songs.length]);
    }
  }, [track, play, customSongs]);

  const goPrev = useCallback(() => {
    if (progress > 3) { if(audioRef.current){audioRef.current.currentTime=0;setProgress(0);} return; }
    const songs = [...SONGS, ...customSongs];
    const i = songs.findIndex(s=>s.id===track.id);
    play(songs[(i-1+songs.length)%songs.length]);
  }, [track, play, customSongs, progress]);

  // ── SEEK
  const seekByPct = useCallback((p) => { if(audioRef.current&&duration){audioRef.current.currentTime=p*duration;setProgress(p*duration);} }, [duration]);

  // ── REPEAT cycle
  const cycleRepeat = () => setRepeat(r => r==='off'?'all':r==='all'?'one':'off');

  // ── LYRICS
  const getLyrics = async () => {
    setLL(true);
    const r = await askAI(
      `Tulis lirik lagu fiktif untuk lagu "${track.title}" oleh ${track.artist}. Mood: ${track.mood}. Format lirik dengan label [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus]. Puitis dan sesuai tema. Maks 200 kata.`,
      'Kamu penulis lirik profesional. Tulis saja liriknya tanpa intro atau penjelasan tambahan.'
    );
    setLyrics(r); setLL(false);
  };

  // ── AI
  const getInsight = async () => {
    setIL(true);
    const r = await askAI(`Buat 1 kalimat puitis untuk "${track.title}" vibe ${track.mood}. Sebutkan bintang/alam semesta.`, 'Maks 20 kata. Kalimat puitis saja, tanpa tanda petik.');
    setInsight(r); setIL(false);
  };
  const sendChat = async () => {
    if (!input.trim()) return;
    const msg=input; setInput(''); setMessages(p=>[...p,{from:'user',text:msg}]); setCL(true);
    const r = await askAI(msg, `Kamu Starry AI, asisten musik ramah. Jawab singkat maks 80 kata. Diputar: "${track.title}" oleh ${track.artist}.`);
    setMessages(p=>[...p,{from:'ai',text:r}]); setCL(false);
  };
  const searchVibe = async () => {
    if (!vibeInput.trim()||vibeLoading) return; setVL(true);
    const r = await askAI(`Vibe: ${vibeInput}`, 'Pilih lagu dari list. Balas HANYA angka 1-4. 1=Deep Space Night(tenang) 2=Lunar Reflection(melankolis) 3=Nebula Pulse(energik) 4=Aurora Glow(semangat)');
    const found = SONGS.find(s=>s.id===parseInt(r.trim()));
    if (found) { play(found); setVibeInput(`✨ Cocok: ${found.title}`); } setVL(false);
  };

  // ── Playlists
  const createPlaylist = useCallback(({ name, songIds }) => {
    const id = 'pl_' + Date.now();
    setPlaylists(p => [...p, { id, name, songIds, locked:false }]);
    setShowPlModal(false);
    setEditingPl(null);
  }, []);

  const updatePlaylist = useCallback(({ name, songIds }) => {
    setPlaylists(p => p.map(pl => pl.id===editingPl.id ? { ...pl, name, songIds } : pl));
    setShowPlModal(false);
    setEditingPl(null);
  }, [editingPl]);

  const deletePlaylist = useCallback((id) => {
    if (!window.confirm('Hapus playlist ini?')) return;
    setPlaylists(p => p.filter(pl => pl.id!==id));
    if (activePl===id) setActivePl(null);
  }, [activePl]);

  const addToPlaylist = useCallback((plId, songId) => {
    setPlaylists(p => p.map(pl => pl.id===plId && !pl.songIds.includes(songId)
      ? { ...pl, songIds:[...pl.songIds, songId] } : pl));
  }, []);

  const removeFromPlaylist = useCallback((plId, songId) => {
    setPlaylists(p => p.map(pl => pl.id===plId
      ? { ...pl, songIds: pl.songIds.filter(id=>id!==songId) } : pl));
  }, []);

  // ── Google
  const handleGoogleLogin = useCallback(() => {
    if (!window.google) return setDriveError('Google API belum siap, coba lagi.');
    if (GOOGLE_CLIENT_ID.includes('GANTI_DENGAN')) return setDriveError('⚙️ Isi GOOGLE_CLIENT_ID di App.jsx terlebih dahulu!');
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID, scope: GOOGLE_SCOPES,
      callback: async resp => {
        if (resp.error) return setDriveError('Login gagal: '+resp.error);
        const tok=resp.access_token; setAccessToken(tok); tokenRef.current=tok;
        try {
          const u=await (await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{ headers:{ Authorization:`Bearer ${tok}` } })).json();
          setGoogleUser(u); setDriveError(''); setLoadingDrive(true);
          setCustomSongs(await driveListSongs(tok)); setLoadingDrive(false);
        } catch(e) { setDriveError('Gagal memuat Drive: '+e.message); setLoadingDrive(false); }
      }
    });
    client.requestAccessToken();
  }, []);
  const handleGoogleLogout = useCallback(() => {
    if (accessToken&&window.google) window.google.accounts.oauth2.revoke(accessToken,()=>{});
    setGoogleUser(null); setAccessToken(null); tokenRef.current=null; setCustomSongs([]); setDriveError('');
  }, [accessToken]);
  const handleUpload = useCallback(async (file, meta) => {
    if (!accessToken) return alert('Login Google dulu!');
    setUploading(true); setUploadProg(10);
    const t=setInterval(()=>setUploadProg(p=>p<85?p+5:p),400);
    try {
      const s=await driveUploadSong(file,meta,accessToken); clearInterval(t); setUploadProg(100);
      setCustomSongs(p=>[...p,s]);
      setTimeout(()=>{ setShowUpload(false); setUploading(false); setUploadProg(0); },700);
    } catch(e) { clearInterval(t); alert('Upload gagal: '+e.message); setUploading(false); setUploadProg(0); }
  }, [accessToken]);

  const pct = duration>0?progress/duration:0;

  // ── Search filter
  const q = searchQuery.toLowerCase();
  const filteredSongs = allSongs.filter(s => !q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q));
  const filteredBuiltin = filteredSongs.filter(s => !s.isDrive);
  const filteredCustom  = filteredSongs.filter(s =>  s.isDrive);

  // ── Active playlist songs
  const activePlSongs = activePl
    ? (() => { const pl = playlists.find(p=>p.id===activePl); return pl ? allSongs.filter(s=>pl.songIds.includes(s.id)) : allSongs; })()
    : allSongs;

  const tabs = [
    { id:'player',   icon:<Compass size={17}/>,   label:'Player' },
    { id:'queue',    icon:<ListMusic size={17}/>,  label:'Antrian' },
    { id:'playlist', icon:<FolderOpen size={17}/>, label:'Playlist' },
    { id:'lyrics',   icon:<Mic2 size={17}/>,       label:'Lirik' },
    { id:'ai',       icon:<Bot size={17}/>,        label:'AI' },
  ];

  return (
    <div style={{ height:'100dvh', width:'100vw', overflow:'hidden', background:'#07071a', color:'#f1f5f9', fontFamily:"'Segoe UI',system-ui,sans-serif", display:'flex', flexDirection:'column', userSelect:'none', WebkitTapHighlightColor:'transparent' }}>

      {/* BG */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, background:`radial-gradient(ellipse at 60% 10%,${track.color}20 0%,transparent 60%)`, transition:'background 2s ease' }}/>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}><div className="stars"/></div>

      {/* ══ HEADER */}
      <header style={{ position:'relative', zIndex:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <AppLogo size={30}/>
          <div>
            <div style={{ fontWeight:900, fontSize:13, lineHeight:1, letterSpacing:'-0.03em', background:'linear-gradient(90deg,#60a5fa,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Starry Night</div>
            <div style={{ fontSize:9.5, fontWeight:700, color:'rgba(255,255,255,0.35)', marginTop:0.5, letterSpacing:'0.06em', textTransform:'uppercase' }}>MPlayer</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {/* Sleep timer badge */}
          {sleepTimer&&(
            <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 8px', borderRadius:999, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)' }}>
              <Moon size={11} style={{ color:'#fbbf24' }}/>
              <span style={{ fontSize:10, fontWeight:700, color:'#fbbf24', fontFamily:'monospace' }}>{fmtSec(sleepTimer.remaining)}</span>
            </div>
          )}
          {/* AI badge */}
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 8px', borderRadius:999, background:hasKey()?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)', border:`1px solid ${hasKey()?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}` }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:hasKey()?'#22c55e':'#ef4444', animation:hasKey()?'pulse 2s infinite':'none' }}/>
            <span style={{ fontSize:9, fontWeight:700, color:hasKey()?'#86efac':'#fca5a5' }}>{hasKey()?'AI':'Offline'}</span>
          </div>
          {/* Google */}
          {googleUser ? (
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              {googleUser.picture?<img src={googleUser.picture} style={{ width:26, height:26, borderRadius:'50%', border:`2px solid ${track.color}` }}/>:<div style={{ width:26, height:26, borderRadius:'50%', background:track.color, display:'flex', alignItems:'center', justifyContent:'center' }}><User size={13} style={{ color:'white' }}/></div>}
              <button onClick={handleGoogleLogout} style={{ ...btn, padding:4, color:'rgba(255,255,255,0.4)' }}><LogOut size={14}/></button>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 9px', borderRadius:999, border:'none', background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)', fontSize:10, fontWeight:700, cursor:'pointer' }}>
              <LogIn size={12}/>Google
            </button>
          )}
        </div>
      </header>

      {driveError&&<div style={{ position:'relative', zIndex:10, flexShrink:0, padding:'6px 16px', background:'rgba(239,68,68,0.15)', borderBottom:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:11, color:'#fca5a5', flex:1 }}>{driveError}</span><button onClick={()=>setDriveError('')} style={{ ...btn, padding:2, color:'#fca5a5' }}><X size={13}/></button></div>}

      {/* ══ CONTENT */}
      <main style={{ flex:1, overflow:'hidden', position:'relative', zIndex:5 }}>

        {/* ─── PLAYER TAB */}
        {tab==='player'&&(
          <div className="scrollbar-hide" style={{ height:'100%', overflowY:'auto' }}>
          <div style={{ minHeight:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'clamp(4px,1.5vh,12px) 20px clamp(4px,1vh,8px)', animation:'fadeUp 0.4s ease' }}>
            {loadingTrack&&(
              <div style={{ position:'fixed', inset:0, zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(7,7,26,0.85)', backdropFilter:'blur(6px)', gap:12 }}>
                <Loader2 size={30} style={{ color:track.color, animation:'spin 1s linear infinite' }}/>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>Memuat dari Google Drive…</div>
              </div>
            )}

            {/* Ring */}
            <OrbitalRing size={ringSize} pct={pct} color={track.color} progress={progress} duration={duration} isPlaying={playing} cover={track.cover} title={track.title} onSeek={seekByPct}/>

            {/* Track info */}
            <div style={{ textAlign:'center', marginTop:'clamp(8px,1.8vh,16px)', width:'100%', maxWidth:320, padding:'0 8px' }}>
              {track.isDrive&&<div style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'2px 7px', borderRadius:999, marginBottom:4, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}><Cloud size={9} style={{ color:track.color }}/><span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Drive</span></div>}
              <h2 style={{ margin:0, fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, fontSize:'clamp(16px,4.2vw,24px)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{track.title}</h2>
              <p style={{ margin:'2px 0 0', fontSize:'clamp(10px,2.5vw,12px)', color:'rgba(255,255,255,0.45)', fontWeight:600 }}>{track.artist} — {track.album}</p>
            </div>

            {/* Main controls: Shuffle | Prev | Play | Next | Repeat */}
            <div style={{ display:'flex', alignItems:'center', gap:'clamp(4px,2vw,10px)', marginTop:'clamp(10px,2vh,16px)' }}>
              <button onClick={()=>setShuffle(s=>!s)} style={{ ...btn, color:shuffle?track.color:'rgba(255,255,255,0.3)', position:'relative', padding:'clamp(5px,1.2vw,8px)' }}>
                <Shuffle size={18}/>
                {shuffle&&<div style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:track.color }}/>}
              </button>
              <button onClick={goPrev} style={{ ...btn, padding:'clamp(5px,1.2vw,8px)' }}><SkipBack size={22} fill="currentColor"/></button>
              <button onClick={()=>setPlaying(p=>!p)} style={{ width:'clamp(48px,13vw,56px)', height:'clamp(48px,13vw,56px)', borderRadius:'50%', border:'none', background:'white', color:'#07071a', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 22px ${track.color}90,0 4px 20px rgba(0,0,0,0.4)`, transition:'transform 0.1s,box-shadow 0.3s', flexShrink:0 }}>
                {playing?<Pause size={21} fill="currentColor"/>:<Play size={21} fill="currentColor" style={{ marginLeft:3 }}/>}
              </button>
              <button onClick={goNext} style={{ ...btn, padding:'clamp(5px,1.2vw,8px)' }}><SkipForward size={22} fill="currentColor"/></button>
              <button onClick={cycleRepeat} style={{ ...btn, color:repeat!=='off'?track.color:'rgba(255,255,255,0.3)', position:'relative', padding:'clamp(5px,1.2vw,8px)' }}>
                {repeat==='one'?<Repeat1 size={18}/>:<Repeat size={18}/>}
                {repeat!=='off'&&<div style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:track.color }}/>}
              </button>
            </div>

            {/* Secondary: Like | Mute | Volume slider | Settings */}
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:'clamp(3px,0.8vh,7px)', width:'100%', maxWidth:290 }}>
              <button onClick={()=>setLiked(l=>({...l,[track.id]:!l[track.id]}))} style={{ ...btn, color:liked[track.id]?'#f472b6':'rgba(255,255,255,0.3)', padding:6 }}><Heart size={17} fill={liked[track.id]?'#f472b6':'none'}/></button>
              <button onClick={()=>setMuted(m=>!m)} style={{ ...btn, color:muted?'#ef4444':'rgba(255,255,255,0.3)', padding:6 }}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button>
              <input type="range" min="0" max="1" step="0.01" value={muted?0:volume} onChange={e=>{setVolume(+e.target.value);setMuted(false)}} style={{ flex:1, accentColor:track.color, height:3 }}/>
              <button onClick={()=>setShowSettings(true)} style={{ ...btn, color:eqEnabled||sleepTimer?track.color:'rgba(255,255,255,0.3)', padding:6 }}><Settings size={17}/></button>
            </div>

            {/* AI Insight */}
            <div style={{ width:'100%', maxWidth:300, marginTop:'clamp(6px,1.2vh,10px)', padding:'0 8px', paddingBottom:'clamp(8px,1.5vh,14px)' }}>
              {!insight?(
                <button onClick={getInsight} disabled={insightLoading} style={{ width:'100%', padding:'8px 0', borderRadius:12, border:'none', background:track.bg, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, opacity:insightLoading?0.6:1 }}>
                  {insightLoading?<><Zap size={12} style={{ animation:'spin 0.8s linear infinite' }}/>Meramal...</>:<><Sparkles size={12}/>Wawasan Kosmik ✨</>}
                </button>
              ):(
                <div onClick={()=>setInsight('')} style={{ padding:'9px 13px', borderRadius:12, background:track.bg, border:`1px solid ${track.color}40`, cursor:'pointer', animation:'fadeUp 0.3s ease' }}>
                  <div style={{ fontSize:9, color:track.color, fontWeight:700, marginBottom:3, textTransform:'uppercase', letterSpacing:'0.1em' }}>✨ Wawasan Kosmik</div>
                  <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.85)', fontStyle:'italic', lineHeight:1.6 }}>{insight}</p>
                </div>
              )}
            </div>
          </div>
          </div>
        )}

        {/* ─── QUEUE TAB */}
        {tab==='queue'&&(
          <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:'14px 16px 0', animation:'fadeUp 0.4s ease' }}>
            {/* Search */}
            <div style={{ position:'relative', marginBottom:12 }}>
              <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)', pointerEvents:'none' }}/>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Cari lagu, artis, album..."
                style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'9px 12px 9px 34px', fontSize:13, color:'white', outline:'none' }}/>
              {searchQuery&&<button onClick={()=>setSearchQuery('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}><X size={14}/></button>}
            </div>

            {/* Vibe search */}
            {!searchQuery&&(
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>🔮 Cari Berdasarkan Suasana Hati</div>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={vibeInput} onChange={e=>setVibeInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchVibe()} placeholder='"semangat pagi", "sedih tapi indah"...'
                    style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'8px 11px', fontSize:12, color:'white', outline:'none' }}/>
                  <button onClick={searchVibe} disabled={vibeLoading} style={{ padding:'8px 12px', borderRadius:10, border:'none', background:track.color, color:'white', cursor:'pointer', fontWeight:700, fontSize:12, flexShrink:0, opacity:vibeLoading?0.5:1 }}>
                    {vibeLoading?<Zap size={13} style={{ animation:'spin 0.8s linear infinite' }}/>:'Cari'}
                  </button>
                </div>
              </div>
            )}

            {/* Upload button */}
            <div style={{ marginBottom:12 }}>
              {googleUser?(
                <button onClick={()=>setShowUpload(true)} style={{ width:'100%', padding:'9px 0', borderRadius:12, background:`linear-gradient(135deg,${track.color}22,rgba(99,102,241,0.2))`, border:`1px solid ${track.color}40`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                  <Plus size={15} style={{ color:track.color }}/>Tambah Lagu ke Drive
                </button>
              ):(
                <button onClick={handleGoogleLogin} style={{ width:'100%', padding:'9px 0', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px dashed rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                  <LogIn size={13}/>Login Google untuk tambah lagu
                </button>
              )}
            </div>

            {/* List */}
            <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:5, paddingBottom:16 }}>
              {/* Built-in songs */}
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:4 }}>🎵 Lagu Bawaan ({filteredBuiltin.length})</div>
              {filteredBuiltin.map((s,i)=><SongRow key={s.id} s={s} i={i} track={track} playing={playing} liked={liked} setLiked={setLiked} play={play} playlists={playlists} addToPlaylist={addToPlaylist}/>)}

              {/* Drive songs */}
              {(googleUser||customSongs.length>0)&&(
                <>
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.15em', marginTop:10, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
                    <Cloud size={11}/>Lagu Saya ({filteredCustom.length})
                    {loadingDrive&&<Loader2 size={11} style={{ animation:'spin 1s linear infinite', color:track.color }}/>}
                  </div>
                  {loadingDrive&&filteredCustom.length===0&&<div style={{ textAlign:'center', padding:16, color:'rgba(255,255,255,0.3)', fontSize:12 }}>Memuat dari Drive…</div>}
                  {!loadingDrive&&filteredCustom.length===0&&googleUser&&<div style={{ padding:'16px', textAlign:'center', background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px dashed rgba(255,255,255,0.1)' }}><Cloud size={22} style={{ color:'rgba(255,255,255,0.12)', margin:'0 auto 8px', display:'block' }}/><div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Belum ada lagu di Drive</div></div>}
                  {filteredCustom.map((s,i)=><SongRow key={s.id} s={s} i={i} track={track} playing={playing} liked={liked} setLiked={setLiked} play={play} isDrive onRemove={id=>setCustomSongs(p=>p.filter(x=>x.id!==id))} playlists={playlists} addToPlaylist={addToPlaylist}/>)}
                </>
              )}

              {/* Recently played */}
              {!searchQuery&&history.length>1&&(
                <>
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.15em', marginTop:14, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
                    <History size={11}/>Baru Dimainkan
                  </div>
                  {history.slice(1, 6).map((s,i)=>(
                    <div key={`h-${s.id}-${i}`} onClick={()=>play(s)} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 12px', borderRadius:12, cursor:'pointer', background:'rgba(255,255,255,0.03)', border:'1px solid transparent', transition:'all 0.2s' }}>
                      <img src={s.cover} style={{ width:36, height:36, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'rgba(255,255,255,0.7)' }}>{s.title}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{s.artist}</div>
                      </div>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:s.color, boxShadow:`0 0 6px ${s.color}` }}/>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── PLAYLIST TAB */}
        {tab==='playlist'&&(
          <div style={{ height:'100%', display:'flex', flexDirection:'column', animation:'fadeUp 0.4s ease' }}>

            {/* ── Playlist list view */}
            {plView==='list'&&(
              <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:'14px 16px 0' }}>
                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:15 }}>Playlist Saya</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{playlists.length} playlist</div>
                  </div>
                  <button onClick={()=>{ setEditingPl(null); setShowPlModal(true); }}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    <ListPlus size={14}/>Baru
                  </button>
                </div>

                {/* All songs shortcut */}
                <div onClick={()=>{ setActivePl(null); setTab('queue'); }}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:14, cursor:'pointer', background:activePl===null?'rgba(99,102,241,0.15)':'rgba(255,255,255,0.04)', border:`1px solid ${activePl===null?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.08)'}`, marginBottom:10, transition:'all 0.2s' }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(168,85,247,0.3))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <ListMusic size={20} style={{color:'#a78bfa'}}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'white' }}>Semua Lagu</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{allSongs.length} lagu</div>
                  </div>
                  <ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}}/>
                </div>

                {/* Playlist cards */}
                <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, paddingBottom:16 }}>
                  {playlists.map(pl => {
                    const songs = allSongs.filter(s=>pl.songIds.includes(s.id));
                    const isActive = activePl===pl.id;
                    const covers = songs.slice(0,4).map(s=>s.cover);
                    return (
                      <div key={pl.id} style={{ borderRadius:16, background:isActive?'rgba(99,102,241,0.12)':'rgba(255,255,255,0.03)', border:`1px solid ${isActive?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.08)'}`, overflow:'hidden', transition:'all 0.2s' }}>
                        <div onClick={()=>{ setActivePl(pl.id); setPlView('detail'); }} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', cursor:'pointer' }}>
                          {/* Cover mosaic */}
                          <div style={{ width:48, height:48, borderRadius:10, overflow:'hidden', flexShrink:0, display:'grid', gridTemplateColumns:'1fr 1fr', gap:1.5, background:'rgba(255,255,255,0.06)' }}>
                            {covers.length>0 ? covers.map((c,i)=>(
                              <img key={i} src={c} style={{ width:'100%', height:'100%', objectFit:'cover', display: covers.length===1&&i>0?'none':covers.length===2&&i>1?'none':covers.length===3&&i===3?'none':'block' }}/>
                            )) : <Music size={20} style={{color:'rgba(255,255,255,0.2)',margin:'auto',gridColumn:'span 2'}}/>}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:700, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'white' }}>{pl.name}</div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{songs.length} lagu</div>
                          </div>
                          <ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}}/>
                        </div>
                        {/* Actions */}
                        <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                          {songs.length>0&&(
                            <button onClick={()=>{ setActivePl(pl.id); play(songs[0]); setTab('player'); }}
                              style={{ flex:1, padding:'8px 0', background:'none', border:'none', color:isActive?'#a78bfa':'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                              <Play size={12} fill="currentColor"/>Putar
                            </button>
                          )}
                          <button onClick={()=>{ setEditingPl(pl); setShowPlModal(true); }}
                            style={{ flex:1, padding:'8px 0', background:'none', border:'none', borderLeft:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                            <PenLine size={12}/>Edit
                          </button>
                          {!pl.locked&&(
                            <button onClick={()=>deletePlaylist(pl.id)}
                              style={{ flex:1, padding:'8px 0', background:'none', border:'none', borderLeft:'1px solid rgba(255,255,255,0.06)', color:'rgba(239,68,68,0.6)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                              <Trash2 size={12}/>Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {playlists.length===0&&(
                    <div style={{ textAlign:'center', padding:'40px 20px' }}>
                      <FolderOpen size={44} style={{color:'rgba(255,255,255,0.1)',display:'block',margin:'0 auto 12px'}}/>
                      <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.3)' }}>Belum ada playlist</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', marginTop:4 }}>Ketuk "Baru" untuk membuat playlist pertamamu</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Playlist detail view */}
            {plView==='detail'&&activePl&&(()=>{
              const pl = playlists.find(p=>p.id===activePl);
              if (!pl) return null;
              const songs = allSongs.filter(s=>pl.songIds.includes(s.id));
              return (
                <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                  {/* Header */}
                  <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <button onClick={()=>setPlView('list')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4, display:'flex' }}>
                        <ChevronLeft size={20}/>
                      </button>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:800, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pl.name}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{songs.length} lagu</div>
                      </div>
                      {songs.length>0&&(
                        <button onClick={()=>{ play(songs[0]); setTab('player'); }}
                          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, border:'none', background:track.color, color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                          <Play size={13} fill="currentColor"/>Putar Semua
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Songs */}
                  <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'10px 16px 16px', display:'flex', flexDirection:'column', gap:5 }}>
                    {songs.length===0&&(
                      <div style={{ textAlign:'center', padding:'40px 20px' }}>
                        <Music size={44} style={{color:'rgba(255,255,255,0.1)',display:'block',margin:'0 auto 12px'}}/>
                        <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>Playlist ini masih kosong</div>
                        <button onClick={()=>{ setEditingPl(pl); setShowPlModal(true); }} style={{ marginTop:12, padding:'8px 16px', borderRadius:10, border:'none', background:'rgba(99,102,241,0.2)', color:'#a78bfa', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Tambah Lagu</button>
                      </div>
                    )}
                    {songs.map((s,i)=>{
                      const isActive = track.id===s.id;
                      return (
                        <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:12, cursor:'pointer', background:isActive?s.bg:'rgba(255,255,255,0.02)', border:`1px solid ${isActive?s.color+'50':'rgba(255,255,255,0.06)'}`, transition:'all 0.15s' }}>
                          <div onClick={()=>play(s)} style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                            <img src={s.cover} style={{ width:36, height:36, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:isActive?'white':'rgba(255,255,255,0.85)' }}>{s.title}</div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.artist} · {s.album}</div>
                            </div>
                          </div>
                          {isActive&&playing&&(
                            <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:14, marginRight:4 }}>
                              {[12,6,10].map((h,j)=><div key={j} style={{ width:2.5, height:h, background:s.color, borderRadius:1, animation:`bounce 0.8s ease-in-out ${j*0.15}s infinite` }}/>)}
                            </div>
                          )}
                          <button onClick={()=>removeFromPlaylist(pl.id, s.id)}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.5)', padding:'4px 6px', display:'flex', borderRadius:6, flexShrink:0 }}>
                            <X size={14}/>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ─── LYRICS TAB */}
        {tab==='lyrics'&&(
          <div style={{ height:'100%', display:'flex', flexDirection:'column', animation:'fadeUp 0.4s ease' }}>
            {/* Header */}
            <div style={{ padding:'14px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <img src={track.cover} style={{ width:40, height:40, borderRadius:10, objectFit:'cover' }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{track.title}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{track.artist}</div>
                </div>
                <button onClick={getLyrics} disabled={lyricsLoading} style={{ padding:'7px 14px', borderRadius:999, border:'none', background:track.color, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', opacity:lyricsLoading?0.6:1, display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                  {lyricsLoading?<><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>Generate...</>:<><Sparkles size={13}/>{lyrics?'Refresh':' Buat Lirik'}</>}
                </button>
              </div>
            </div>

            {/* Lyrics body */}
            <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'20px 20px 24px' }}>
              {!lyrics&&!lyricsLoading&&(
                <div style={{ textAlign:'center', paddingTop:48 }}>
                  <Mic2 size={48} style={{ color:'rgba(255,255,255,0.1)', margin:'0 auto 16px', display:'block' }}/>
                  <div style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.3)', marginBottom:8 }}>Lirik belum tersedia</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>Ketuk "Buat Lirik" untuk generate lirik AI</div>
                </div>
              )}
              {lyricsLoading&&(
                <div style={{ textAlign:'center', paddingTop:48 }}>
                  <Loader2 size={40} style={{ color:track.color, margin:'0 auto 14px', display:'block', animation:'spin 1s linear infinite' }}/>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>Starry AI sedang menulis lirik…</div>
                </div>
              )}
              {lyrics&&!lyricsLoading&&(
                <div style={{ lineHeight:1.9 }}>
                  {lyrics.split('\n').map((line, i) => {
                    const isTag = line.startsWith('[') && line.endsWith(']');
                    return (
                      <div key={i} style={{
                        fontSize: isTag ? 11 : 15,
                        fontWeight: isTag ? 800 : 400,
                        color: isTag ? track.color : 'rgba(255,255,255,0.9)',
                        marginTop: isTag && i>0 ? 18 : 0,
                        marginBottom: isTag ? 6 : 0,
                        textTransform: isTag ? 'uppercase' : 'none',
                        letterSpacing: isTag ? '0.12em' : 0,
                        fontStyle: !isTag&&line ? 'normal' : 'normal',
                      }}>
                        {line || <br/>}
                      </div>
                    );
                  })}
                  <div style={{ marginTop:24, padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>✨ Lirik ini dibuat oleh Starry AI berdasarkan judul dan mood lagu. Bukan lirik asli.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── AI TAB */}
        {tab==='ai'&&(
          <div style={{ height:'100%', display:'flex', flexDirection:'column', animation:'fadeUp 0.4s ease' }}>
            <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}><Bot size={17} style={{ color:'white' }}/></div>
                <div>
                  <div style={{ fontWeight:800, fontSize:13 }}>Starry AI</div>
                  <div style={{ fontSize:10, color:hasKey()?'#86efac':'#fca5a5' }}>{hasKey()?`Online · ${activeModel()}`:'Offline'}</div>
                </div>
              </div>
              <div style={{ marginTop:8, padding:'7px 10px', borderRadius:10, background:track.bg, border:`1px solid ${track.color}30`, display:'flex', alignItems:'center', gap:8 }}>
                <img src={track.cover} style={{ width:30, height:30, borderRadius:7, objectFit:'cover' }}/>
                <div><div style={{ fontSize:11, fontWeight:700 }}>{track.title}</div><div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>Sedang diputar</div></div>
                <div style={{ marginLeft:'auto', display:'flex', gap:2, alignItems:'flex-end', height:13 }}>
                  {playing&&[11,6,9].map((h,i)=>(<div key={i} style={{ width:3, height:h, background:track.color, borderRadius:1, animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite` }}/>))}
                </div>
              </div>
            </div>
            <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'10px 16px', display:'flex', flexDirection:'column', gap:9 }}>
              {messages.map((m,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start' }}>
                  {m.from==='ai'&&<div style={{ width:22, height:22, borderRadius:7, flexShrink:0, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', marginRight:6, marginTop:2 }}><Bot size={11} style={{ color:'white' }}/></div>}
                  <div style={{ maxWidth:'78%', padding:'9px 13px', fontSize:13, lineHeight:1.55, borderRadius:m.from==='user'?'16px 16px 4px 16px':'4px 16px 16px 16px', background:m.from==='user'?track.color:'rgba(255,255,255,0.07)', border:m.from==='user'?'none':'1px solid rgba(255,255,255,0.1)', color:'white' }}>{m.text}</div>
                </div>
              ))}
              {chatLoading&&<div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:22, height:22, borderRadius:7, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}><Bot size={11} style={{ color:'white' }}/></div><div style={{ padding:'9px 13px', borderRadius:'4px 16px 16px 16px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', gap:5 }}>{[0,0.15,0.3].map((d,i)=>(<div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#818cf8', animation:`bounce 0.8s ease-in-out ${d}s infinite` }}/>))}</div></div>}
              <div ref={chatEndRef}/>
            </div>
            {messages.length===1&&<div style={{ padding:'0 16px 8px', display:'flex', flexWrap:'wrap', gap:6 }}>{['🎵 Ceritakan lagu ini','💫 Lagu sejenis','🌙 Vibe lagu ini','🎸 Artis terkait'].map((q,i)=>(<button key={i} onClick={()=>setInput(q)} style={{ padding:'5px 11px', borderRadius:999, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', fontSize:11, fontWeight:600, cursor:'pointer' }}>{q}</button>))}</div>}
            <div style={{ padding:'8px 16px 14px', flexShrink:0, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', gap:8 }}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Tanya Starry AI..."
                  style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'9px 13px', fontSize:13, color:'white', outline:'none' }}/>
                <button onClick={sendChat} disabled={chatLoading||!input.trim()} style={{ width:40, height:40, borderRadius:12, border:'none', background:input.trim()?track.color:'rgba(255,255,255,0.1)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:chatLoading?0.5:1, flexShrink:0 }}>
                  <Send size={15}/>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ══ TAB BAR */}
      <nav style={{ position:'relative', zIndex:10, flexShrink:0, display:'flex', alignItems:'center', background:'rgba(7,7,26,0.95)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.08)', padding:'6px 8px 10px', paddingBottom:'max(10px,env(safe-area-inset-bottom))' }}>
        {tabs.map(t=>{
          const active=tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'5px 0', background:'none', border:'none', cursor:'pointer', color:active?track.color:'rgba(255,255,255,0.35)', transition:'color 0.2s' }}>
              <div style={{ padding:'3px 12px', borderRadius:999, background:active?`${track.color}22`:'transparent', transition:'background 0.2s' }}>{t.icon}</div>
              <span style={{ fontSize:9, fontWeight:active?700:500, letterSpacing:'0.02em' }}>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ══ MODALS */}
      {showPlModal&&<PlaylistModal
        allSongs={allSongs}
        existing={editingPl}
        onClose={()=>{ setShowPlModal(false); setEditingPl(null); }}
        onSave={editingPl ? updatePlaylist : createPlaylist}
      />}
      {showSettings&&<SettingsPanel onClose={()=>setShowSettings(false)} color={track.color} eqEnabled={eqEnabled} setEqEnabled={setEqEnabled} eqPreset={eqPreset} setEqPreset={setEqPreset} eqGains={eqGains} setEqGains={setEqGains} crossfade={crossfade} setCrossfade={setCrossfade} sleepTimer={sleepTimer} startSleepTimer={startSleepTimer} cancelSleepTimer={cancelSleepTimer}/>}
      {showUpload&&<UploadModal onClose={()=>!uploading&&setShowUpload(false)} onUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress} color={track.color}/>}

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        @keyframes spin20{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.9)}}
        .stars{position:absolute;width:200%;height:200%;background-image:radial-gradient(1px 1px at 15px 25px,rgba(255,255,255,0.6),transparent),radial-gradient(1.5px 1.5px at 90px 130px,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 180px 70px,rgba(255,255,255,0.5),transparent),radial-gradient(2px 2px at 280px 220px,rgba(255,255,255,0.3),transparent),radial-gradient(1px 1px at 40px 180px,rgba(255,255,255,0.5),transparent),radial-gradient(1.5px 1.5px at 160px 30px,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 240px 100px,rgba(255,255,255,0.3),transparent),radial-gradient(2px 2px at 60px 260px,rgba(255,255,255,0.2),transparent);background-size:300px 300px;animation:starMove 120s linear infinite}
        @keyframes starMove{from{transform:translate(0,0)}to{transform:translate(-300px,-300px)}}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        input::placeholder{color:rgba(148,163,184,0.35)}
        input[type=range]{cursor:pointer;height:4px;border-radius:999px}
      `}</style>
    </div>
  );
}

const btn = { background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:8, display:'flex', transition:'color 0.2s', borderRadius:8 };
