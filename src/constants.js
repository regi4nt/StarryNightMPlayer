
export function openNewTab(url) {
  // Cara 1: window.open langsung — paling andal jika dipanggil dari user gesture
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (w) { w.opener = null; return; }
  // Cara 2: fallback <a> jika window.open diblokir (misal iOS PWA mode)
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── STREAMING_PLATFORMS: lazy-loaded on first access ──────────────────────────
// Tidak dimuat saat startup — hanya dimuat saat tab Streaming pertama kali dibuka
let _streamingPlatformsCache = null;
let _streamingPlatformsPromise = null;

export async function getStreamingPlatforms() {
  if (_streamingPlatformsCache) return _streamingPlatformsCache;
  if (!_streamingPlatformsPromise) {
    _streamingPlatformsPromise = import('./streamingPlatforms.js')
      .then(m => { _streamingPlatformsCache = m.STREAMING_PLATFORMS; return _streamingPlatformsCache; });
  }
  return _streamingPlatformsPromise;
}

// Synchronous accessor (returns cache or empty array if not loaded yet)
export function getStreamingPlatformsSync() {
  return _streamingPlatformsCache || [];
}

// Keep STREAMING_PLATFORMS as alias for backward-compat (lazy-loaded, initially empty)
// Components that need it synchronously should use getStreamingPlatformsSync()
export const STREAMING_PLATFORMS = new Proxy([], {
  get(target, prop) {
    const cache = _streamingPlatformsCache;
    if (cache) return cache[prop];
    return target[prop];
  }
});

export const MUSIC_SOURCES = [];

// ── Placeholder supaya SONGS tetap ada
export const _PLACEHOLDER_SONGS = [
  {
    id: 'soundhelix',
    name: 'SoundHelix',
    icon: '🎛️',
    description: 'Synthetic electronic & instrumental',
    color: '#3b82f6',
    songs: [
      { id:'sh1', title:'Deep Space Night',    artist:'SoundHelix', album:'SoundHelix Vol.1',  cover:'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',  color:'#3b82f6', bg:'rgba(59,130,246,0.15)',  mood:'calm, expansive, mysterious' },
      { id:'sh2', title:'Lunar Reflection',    artist:'SoundHelix', album:'SoundHelix Vol.2',  cover:'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',  color:'#a855f7', bg:'rgba(168,85,247,0.15)', mood:'melancholic, bright, reflective' },
      { id:'sh3', title:'Nebula Pulse',         artist:'SoundHelix', album:'SoundHelix Vol.3',  cover:'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',  color:'#6366f1', bg:'rgba(99,102,241,0.15)',  mood:'energetic, rhythmic, futuristic' },
      { id:'sh4', title:'Aurora Glow',          artist:'SoundHelix', album:'SoundHelix Vol.4',  cover:'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',  color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  mood:'uplifting, organic, vibrant' },
      { id:'sh5', title:'Cosmic Drive',         artist:'SoundHelix', album:'SoundHelix Vol.5',  cover:'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',  color:'#f59e0b', bg:'rgba(245,158,11,0.15)',  mood:'driving, powerful, intense' },
      { id:'sh6', title:'Starfield Journey',    artist:'SoundHelix', album:'SoundHelix Vol.6',  cover:'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',  color:'#ec4899', bg:'rgba(236,72,153,0.15)',  mood:'romantic, dreamy, soft' },
      { id:'sh7', title:'Orbital Drift',        artist:'SoundHelix', album:'SoundHelix Vol.7',  cover:'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',  color:'#22c55e', bg:'rgba(34,197,94,0.15)',   mood:'fresh, hopeful, upbeat' },
      { id:'sh8', title:'Midnight Frequency',   artist:'SoundHelix', album:'SoundHelix Vol.8',  cover:'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',  color:'#ef4444', bg:'rgba(239,68,68,0.15)',   mood:'energetic, intense, bold' },
      { id:'sh9', title:'Solar Wind',           artist:'SoundHelix', album:'SoundHelix Vol.9',  cover:'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',  color:'#0ea5e9', bg:'rgba(14,165,233,0.15)',  mood:'airy, wide, expansive' },
      { id:'sh10',title:'Quantum Echo',         artist:'SoundHelix', album:'SoundHelix Vol.10', cover:'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', color:'#8b5cf6', bg:'rgba(139,92,246,0.15)',  mood:'mysterious, deep, immersive' },
      { id:'sh11',title:'Event Horizon',        artist:'SoundHelix', album:'SoundHelix Vol.11', cover:'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', color:'#f97316', bg:'rgba(249,115,22,0.15)',  mood:'cinematic, grand, epic' },
      { id:'sh12',title:'Hyperspace',           artist:'SoundHelix', album:'SoundHelix Vol.12', cover:'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', color:'#06b6d4', bg:'rgba(6,182,212,0.15)',   mood:'fast, electrifying, neon' },
      { id:'sh13',title:'Dark Matter',          artist:'SoundHelix', album:'SoundHelix Vol.13', cover:'https://images.unsplash.com/photo-1484589065579-248aad0d8b13?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', color:'#64748b', bg:'rgba(100,116,139,0.15)', mood:'dark, brooding, cinematic' },
      { id:'sh14',title:'Pulsar Rhythm',        artist:'SoundHelix', album:'SoundHelix Vol.14', cover:'https://images.unsplash.com/photo-1531907700752-62799b2a3e84?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', color:'#d946ef', bg:'rgba(217,70,239,0.15)',  mood:'groovy, funky, bouncy' },
      { id:'sh15',title:'Void Signal',          artist:'SoundHelix', album:'SoundHelix Vol.15', cover:'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', color:'#10b981', bg:'rgba(16,185,129,0.15)',  mood:'calm, organic, ambient' },
      { id:'sh16',title:'Warp Gate',            artist:'SoundHelix', album:'SoundHelix Vol.16', cover:'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', color:'#3b82f6', bg:'rgba(59,130,246,0.15)',  mood:'energetic, tense, build-up' },
      { id:'sh17',title:'Andromeda Call',       artist:'SoundHelix', album:'SoundHelix Vol.17', cover:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3', color:'#a855f7', bg:'rgba(168,85,247,0.15)', mood:'ethereal, floating, spiritual' },
    ]
  },
  {
    id: 'bensound',
    name: 'Bensound',
    icon: '🎸',
    description: 'Cinematic, jazz & acoustic royalty-free',
    color: '#f59e0b',
    songs: [
      { id:'bs1',  title:'Ukulele',           artist:'Bensound', album:'Acoustic',   cover:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-ukulele.mp3',           color:'#f59e0b', bg:'rgba(245,158,11,0.15)',  mood:'happy, light, playful' },
      { id:'bs2',  title:'Sunny',             artist:'Bensound', album:'Acoustic',   cover:'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-sunny.mp3',             color:'#fbbf24', bg:'rgba(251,191,36,0.15)',  mood:'sunny, cheerful, warm' },
      { id:'bs3',  title:'Acoustic Breeze',   artist:'Bensound', album:'Acoustic',   cover:'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',    color:'#22c55e', bg:'rgba(34,197,94,0.15)',   mood:'breeze, peaceful, acoustic' },
      { id:'bs4',  title:'Creative Minds',    artist:'Bensound', album:'Corporate',  cover:'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3',     color:'#3b82f6', bg:'rgba(59,130,246,0.15)',  mood:'inspiring, motivated, creative' },
      { id:'bs5',  title:'Epic',              artist:'Bensound', album:'Cinematic',  cover:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-epic.mp3',             color:'#ef4444', bg:'rgba(239,68,68,0.15)',   mood:'epic, powerful, cinematic' },
      { id:'bs6',  title:'Once Again',        artist:'Bensound', album:'Cinematic',  cover:'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-onceagain.mp3',        color:'#8b5cf6', bg:'rgba(139,92,246,0.15)',  mood:'reflective, emotional, nostalgic' },
      { id:'bs7',  title:'Jazz Comedy',       artist:'Bensound', album:'Jazz',       cover:'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-jazzcomedy.mp3',      color:'#f97316', bg:'rgba(249,115,22,0.15)',  mood:'fun, jazzy, upbeat' },
      { id:'bs8',  title:'Jazzy Frenchy',     artist:'Bensound', album:'Jazz',       cover:'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3',    color:'#ec4899', bg:'rgba(236,72,153,0.15)',  mood:'french, romantic, charming' },
      { id:'bs9',  title:'Memories',          artist:'Bensound', album:'Cinematic',  cover:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-memories.mp3',        color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  mood:'nostalgic, tender, beautiful' },
      { id:'bs10', title:'Tenderness',        artist:'Bensound', album:'Romantic',   cover:'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-tenderness.mp3',      color:'#a855f7', bg:'rgba(168,85,247,0.15)', mood:'soft, tender, intimate' },
      { id:'bs11', title:'Relaxing',          artist:'Bensound', album:'Ambient',    cover:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-relaxing.mp3',        color:'#06b6d4', bg:'rgba(6,182,212,0.15)',   mood:'calm, relaxing, serene' },
      { id:'bs12', title:'Cute',              artist:'Bensound', album:'Acoustic',   cover:'https://images.unsplash.com/photo-1490750967868-88df5691cc8b?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-cute.mp3',             color:'#f43f5e', bg:'rgba(244,63,94,0.15)',   mood:'cute, sweet, positive' },
    ]
  },
  {
    id: 'musopen',
    name: 'Musopen',
    icon: '🎻',
    description: 'Klasik & orkestra bebas hak cipta',
    color: '#8b5cf6',
    songs: [
      { id:'mo1', title:'Moonlight Sonata Mvt.1',   artist:'Beethoven',   album:'Piano Sonatas',      cover:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/1326/', color:'#8b5cf6', bg:'rgba(139,92,246,0.15)',  mood:'melancholic, contemplative, moonlit' },
      { id:'mo2', title:'Für Elise',                artist:'Beethoven',   album:'Bagatelles',         cover:'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/219/',  color:'#a855f7', bg:'rgba(168,85,247,0.15)', mood:'delicate, flowing, classical' },
      { id:'mo3', title:'Clair de Lune',             artist:'Debussy',     album:'Suite Bergamasque',  cover:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/734/',  color:'#06b6d4', bg:'rgba(6,182,212,0.15)',   mood:'dreamy, impressionist, moonlight' },
      { id:'mo4', title:'Canon in D',               artist:'Pachelbel',   album:'Chamber Music',      cover:'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/878/',  color:'#f59e0b', bg:'rgba(245,158,11,0.15)',  mood:'elegant, timeless, ceremonial' },
      { id:'mo5', title:'Symphony No.5 Mvt.1',      artist:'Beethoven',   album:'Symphonies',         cover:'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/587/',  color:'#ef4444', bg:'rgba(239,68,68,0.15)',   mood:'dramatic, powerful, triumphant' },
      { id:'mo6', title:'The Four Seasons - Spring', artist:'Vivaldi',     album:'The Four Seasons',   cover:'https://images.unsplash.com/photo-1490750967868-88df5691cc8b?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/2864/', color:'#22c55e', bg:'rgba(34,197,94,0.15)',   mood:'joyful, vibrant, seasonal' },
      { id:'mo7', title:'Gymnopédie No.1',           artist:'Erik Satie',  album:'Gymnopédies',        cover:'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/1241/', color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  mood:'slow, peaceful, introspective' },
      { id:'mo8', title:'Waltz of the Snowflakes',   artist:'Tchaikovsky', album:'The Nutcracker',     cover:'https://images.unsplash.com/photo-1544511916-0148ccdeb877?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/2212/', color:'#0ea5e9', bg:'rgba(14,165,233,0.15)',  mood:'magical, whimsical, festive' },
    ]
  },
  {
    id: 'pixabay',
    name: 'Pixabay Music',
    icon: '🎧',
    description: 'Lo-fi, chill & electronic beats',
    color: '#ec4899',
    songs: [
      { id:'px1',  title:'Lofi Study',           artist:'Pixabay', album:'Lo-Fi Chill',  cover:'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', color:'#ec4899', bg:'rgba(236,72,153,0.15)',  mood:'focus, calm, study' },
      { id:'px2',  title:'Ambient Piano',         artist:'Pixabay', album:'Ambient',      cover:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1fbe.mp3', color:'#8b5cf6', bg:'rgba(139,92,246,0.15)',  mood:'ambient, peaceful, reflective' },
      { id:'px3',  title:'Chill Hip Hop Beat',    artist:'Pixabay', album:'Hip-Hop',      cover:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/03/15/audio_9b3d8ca61a.mp3', color:'#f97316', bg:'rgba(249,115,22,0.15)',  mood:'chill, urban, laid-back' },
      { id:'px4',  title:'Corporate Upbeat',      artist:'Pixabay', album:'Corporate',    cover:'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3', color:'#3b82f6', bg:'rgba(59,130,246,0.15)',  mood:'energetic, professional, upbeat' },
      { id:'px5',  title:'Acoustic Guitar Folk',  artist:'Pixabay', album:'Acoustic',     cover:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/03/10/audio_270f49c370.mp3', color:'#22c55e', bg:'rgba(34,197,94,0.15)',   mood:'natural, warm, campfire' },
      { id:'px6',  title:'Cinematic Adventure',   artist:'Pixabay', album:'Cinematic',    cover:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/10/16/audio_f8cef61ac1.mp3', color:'#ef4444', bg:'rgba(239,68,68,0.15)',   mood:'adventure, cinematic, heroic' },
      { id:'px7',  title:'Tropical House Vibes',  artist:'Pixabay', album:'Electronic',   cover:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/08/31/audio_2f79e5f0ba.mp3', color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  mood:'tropical, summer, fresh' },
      { id:'px8',  title:'Deep Electronic',       artist:'Pixabay', album:'Electronic',   cover:'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/07/25/audio_ba1e4c90af.mp3', color:'#06b6d4', bg:'rgba(6,182,212,0.15)',   mood:'deep, electronic, nightclub' },
      { id:'px9',  title:'Inspiring Morning',     artist:'Pixabay', album:'Motivational', cover:'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/10/25/audio_2a5e65caaa.mp3', color:'#fbbf24', bg:'rgba(251,191,36,0.15)',  mood:'inspiring, morning, fresh start' },
      { id:'px10', title:'Sad Piano',             artist:'Pixabay', album:'Emotional',    cover:'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/10/25/audio_c21f3d8049.mp3', color:'#64748b', bg:'rgba(100,116,139,0.15)', mood:'sad, emotional, introspective' },
    ]
  },
  {
    id: 'incompetech',
    name: 'Incompetech',
    icon: '🎺',
    description: 'Kevin MacLeod — ratusan genre bebas',
    color: '#14b8a6',
    songs: [
      { id:'km1',  title:'Cipher',               artist:'Kevin MacLeod', album:'Electronic',  cover:'https://images.unsplash.com/photo-1462331420958-a05d1e002413?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher.mp3',               color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  mood:'mysterious, electronic, dark' },
      { id:'km2',  title:'Cephalopod',            artist:'Kevin MacLeod', album:'Ambient',     cover:'https://images.unsplash.com/photo-1484589065579-248aad0d8b13?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cephalopod.mp3',            color:'#0ea5e9', bg:'rgba(14,165,233,0.15)',  mood:'floating, underwater, ambient' },
      { id:'km3',  title:'Sneaky Snitch',         artist:'Kevin MacLeod', album:'Comedy',      cover:'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Sneaky%20Snitch.mp3',       color:'#f97316', bg:'rgba(249,115,22,0.15)',  mood:'sneaky, jazzy, comedic' },
      { id:'km4',  title:'Scheming Weasel',       artist:'Kevin MacLeod', album:'Comedy',      cover:'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Scheming%20Weasel.mp3',     color:'#ec4899', bg:'rgba(236,72,153,0.15)',  mood:'cartoonish, playful, mischievous' },
      { id:'km5',  title:'Intended Force',        artist:'Kevin MacLeod', album:'Cinematic',   cover:'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Intended%20Force.mp3',      color:'#ef4444', bg:'rgba(239,68,68,0.15)',   mood:'epic, forceful, action' },
      { id:'km6',  title:'Hyperfun',              artist:'Kevin MacLeod', album:'Electronic',  cover:'https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hyperfun.mp3',              color:'#a855f7', bg:'rgba(168,85,247,0.15)', mood:'upbeat, silly, hyper' },
      { id:'km7',  title:'Hitman',                artist:'Kevin MacLeod', album:'Electronic',  cover:'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hitman.mp3',                color:'#64748b', bg:'rgba(100,116,139,0.15)', mood:'dark, tense, thriller' },
      { id:'km8',  title:'Local Forecast',        artist:'Kevin MacLeod', album:'Jazz',        cover:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Local%20Forecast.mp3',     color:'#22c55e', bg:'rgba(34,197,94,0.15)',   mood:'easy, breezy, morning news' },
      { id:'km9',  title:'Pixel Peeker Polka',    artist:'Kevin MacLeod', album:'Folk',        cover:'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Pixel%20Peeker%20Polka%20-%20slower.mp3', color:'#fbbf24', bg:'rgba(251,191,36,0.15)', mood:'folk, bouncy, fun' },
    ]
  },
];

// Default placeholder track — ditampilkan sebelum lagu dari Drive/lokal diputar
export const SONGS = [
  {
    id: 'placeholder',
    title: 'Pilih Lagu',
    artist: 'Cari di platform streaming atau upload dari Drive',
    album: '',
    cover: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&h=400&fit=crop',
    src: '',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    mood: '',
  }
];

// ── Built-in songs (empty — all music comes from external platforms/Drive)
export const builtinSongs = [];

// Helper: semua lagu dari semua sumber yang sudah di-load
// ═══════════════════════════════════════════════════════
//  GOOGLE DRIVE
// ═══════════════════════════════════════════════════════
export const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID;
export const GOOGLE_SCOPES    = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly profile email';
export const DRIVE_FOLDER     = 'Starry Night Music';
export const SONG_COLORS = [
  { color:'#3b82f6', bg:'rgba(59,130,246,0.15)' },  { color:'#a855f7', bg:'rgba(168,85,247,0.15)' },
  { color:'#6366f1', bg:'rgba(99,102,241,0.15)' },  { color:'#14b8a6', bg:'rgba(20,184,166,0.15)' },
  { color:'#f59e0b', bg:'rgba(245,158,11,0.15)' },  { color:'#ec4899', bg:'rgba(236,72,153,0.15)' },
  { color:'#22c55e', bg:'rgba(34,197,94,0.15)' },   { color:'#ef4444', bg:'rgba(239,68,68,0.15)' },
];
export const COVERS = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
];
export const randItem = arr => arr[Math.floor(Math.random() * arr.length)];

export const SLEEP_OPTIONS = [
  { label:'5 menit',  min:5  },
  { label:'10 menit', min:10 },
  { label:'15 menit', min:15 },
  { label:'30 menit', min:30 },
  { label:'45 menit', min:45 },
  { label:'1 jam',    min:60 },
];

// ═══════════════════════════════════════════════════════
//  AI — Multi-provider: OpenRouter, Gemini, Groq
// ═══════════════════════════════════════════════════════

// Public Piped/Invidious API instances (YouTube search, no key needed)
// /api/youtube (dengan backend=invidious atau backend=piped) adalah Vercel Serverless Function
// yang proxy request server-side — no CORS, otomatis fallback ke instance lain.
// Hanya gunakan proxy server-side — instance eksternal tidak boleh dipanggil
// langsung dari browser karena CORS. Fallback antar instance ditangani di /api/youtube.js.
export const PIPED_INSTANCES = [
  '/api/youtube?backend=piped',
];
export const INVIDIOUS_INSTANCES = [
  '/api/youtube?backend=invidious',
];

// ── URL builder helpers for Invidious and Piped
// Saat base adalah proxy kita ('/api/youtube?backend=...'),
// API path masuk sebagai ?path= query parameter.
// Saat base adalah URL eksternal, path langsung di-append.
// ── Radio URL helper
// Browser tidak bisa fetch http:// dari halaman https:// (Mixed Content).
// Fungsi ini otomatis wrap URL http:// ke /api/radio-proxy?url=...
// URL https:// dikembalikan apa adanya.
export function radioUrl(url, customDns = '') {
  if (!url) return url;
  return url;
}

export function buildInvidiousUrl(base, apiPath, params = {}) {
  if (base.startsWith('/')) {
    // base may already contain ?backend=invidious (e.g. '/api/youtube?backend=invidious')
    const [path, existing] = base.split('?');
    const merged = Object.fromEntries(new URLSearchParams(existing || ''));
    const qs = new URLSearchParams({ path: apiPath, ...merged, ...params }).toString();
    return `${path}?${qs}`;
  }
  const qs = new URLSearchParams(params).toString();
  return `${base}${apiPath}${qs ? '?' + qs : ''}`;
}
export function buildPipedUrl(base, apiPath, params = {}) {
  if (base.startsWith('/')) {
    // base may already contain ?backend=piped (e.g. '/api/youtube?backend=piped')
    const [path, existing] = base.split('?');
    const merged = Object.fromEntries(new URLSearchParams(existing || ''));
    const qs = new URLSearchParams({ path: apiPath, backend: 'piped', ...merged, ...params }).toString();
    return `${path}?${qs}`;
  }
  const qs = new URLSearchParams(params).toString();
  return `${base}${apiPath}${qs ? '?' + qs : ''}`;
}

// ── Provider definitions
// PROVIDERS built lazily to avoid window.location access at module init time
export function getProviders() {
  const origin = (typeof window !== 'undefined' && window.location?.origin) || '';
  const userKey = getUserAiKey();
  return [
    // ── User-supplied AI key (highest priority) — auto-detect provider
    ...(userKey && userKey.length > 10 ? (() => {
      if (userKey.startsWith('sk-or-')) return [
        { provider:'OpenRouter', key:userKey, model:'deepseek/deepseek-chat:free', endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
        { provider:'OpenRouter', key:userKey, model:'meta-llama/llama-3.3-70b-instruct:free',    endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
      ];
      if (userKey.startsWith('sk-ant-')) return [
        { provider:'Claude', key:userKey, model:'claude-haiku-4-5-20251001', endpoint:'https://api.anthropic.com/v1/messages', isOpenAI:false, extra:{ 'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' } },
      ];
      if (userKey.startsWith('gsk_')) return [
        { provider:'Groq', key:userKey, model:'llama-3.3-70b-versatile', endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'Groq', key:userKey, model:'llama-3.1-8b-instant',    endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('AIza')) return [
        { provider:'Gemini', key:userKey, model:'gemini-2.0-flash', endpoint:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('xai-')) return [
        { provider:'Grok', key:userKey, model:'grok-3',      endpoint:'https://api.x.ai/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'Grok', key:userKey, model:'grok-3-mini', endpoint:'https://api.x.ai/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('hf_')) return [
        { provider:'HuggingFace', key:userKey, model:'meta-llama/Llama-3.3-70B-Instruct', endpoint:'https://router.huggingface.co/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'HuggingFace', key:userKey, model:'Qwen/Qwen2.5-72B-Instruct',         endpoint:'https://router.huggingface.co/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('ghp_') || userKey.startsWith('github_pat_')) return [
        { provider:'GitHub', key:userKey, model:'gpt-4o-mini',              endpoint:'https://models.inference.ai.azure.com/chat/completions', isOpenAI:true, extra:{} },
        { provider:'GitHub', key:userKey, model:'meta-llama-3.3-70b-instruct', endpoint:'https://models.inference.ai.azure.com/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('sk-') && !userKey.startsWith('sk-or-')) {
        // OpenAI and DeepSeek share the sk- prefix — include both so the
        // round-robin / race logic can try whichever actually accepts the key.
        return [
          { provider:'OpenAI',   key:userKey, model:'gpt-4o-mini',        endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
          { provider:'OpenAI',   key:userKey, model:'gpt-4o',             endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
          { provider:'DeepSeek', key:userKey, model:'deepseek-chat',      endpoint:'https://api.deepseek.com/v1/chat/completions', isOpenAI:true, extra:{} },
          { provider:'DeepSeek', key:userKey, model:'deepseek-reasoner',  endpoint:'https://api.deepseek.com/v1/chat/completions', isOpenAI:true, extra:{} },
        ];
      }
      // Unknown format — try as OpenRouter
      return [{ provider:'OpenRouter', key:userKey, model:'deepseek/deepseek-chat:free', endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } }];
    })() : []),
    // OpenAI — via /api/openai server-side proxy (OPENAI_API_KEY in Vercel env vars, never in browser)
    { provider:'OpenAI', key:'__proxy__', model:'gpt-4o-mini',   endpoint:'/api/ai?provider=openai', isOpenAI:true, extra:{} },
    { provider:'OpenAI', key:'__proxy__', model:'gpt-4o',         endpoint:'/api/ai?provider=openai', isOpenAI:true, extra:{} },
    { provider:'OpenAI', key:'__proxy__', model:'gpt-3.5-turbo', endpoint:'/api/ai?provider=openai', isOpenAI:true, extra:{} },
    // Anthropic — /api/anthropic proxy (ANTHROPIC_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'Claude', key:'__proxy__', model:'claude-haiku-4-5-20251001', endpoint:'/api/ai?provider=anthropic', isOpenAI:false, extra:{} },
    { provider:'Claude', key:'__proxy__', model:'claude-sonnet-4-6',         endpoint:'/api/ai?provider=anthropic', isOpenAI:false, extra:{} },
    // OpenRouter — /api/openrouter proxy (OPENROUTER_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'OpenRouter', key:'__proxy__', model:'deepseek/deepseek-chat:free',            endpoint:'/api/ai?provider=openrouter', isOpenAI:true, extra:{} },
    { provider:'OpenRouter', key:'__proxy__', model:'meta-llama/llama-3.3-70b-instruct:free', endpoint:'/api/ai?provider=openrouter', isOpenAI:true, extra:{} },
    { provider:'OpenRouter', key:'__proxy__', model:'qwen/qwen3-4b:free',                     endpoint:'/api/ai?provider=openrouter', isOpenAI:true, extra:{} },
    { provider:'OpenRouter', key:'__proxy__', model:'mistralai/mistral-7b-instruct:free',     endpoint:'/api/ai?provider=openrouter', isOpenAI:true, extra:{} },
    // Gemini — /api/gemini proxy (GEMINI_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'Gemini', key:'__proxy__', model:'gemini-2.0-flash', endpoint:'/api/ai?provider=gemini', isOpenAI:true, extra:{} },
    { provider:'Gemini', key:'__proxy__', model:'gemini-2.0-flash-lite', endpoint:'/api/ai?provider=gemini', isOpenAI:true, extra:{} },
    // Groq — /api/groq proxy (GROQ_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'Groq', key:'__proxy__', model:'llama-3.3-70b-versatile', endpoint:'/api/ai?provider=groq', isOpenAI:true, extra:{} },
    { provider:'Groq', key:'__proxy__', model:'gemma2-9b-it',            endpoint:'/api/ai?provider=groq', isOpenAI:true, extra:{} },
    { provider:'Groq', key:'__proxy__', model:'llama-3.1-8b-instant',    endpoint:'/api/ai?provider=groq', isOpenAI:true, extra:{} },
    // DeepSeek — /api/deepseek proxy (DEEPSEEK_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'DeepSeek', key:'__proxy__', model:'deepseek-chat',     endpoint:'/api/ai?provider=deepseek', isOpenAI:true, extra:{} },
    { provider:'DeepSeek', key:'__proxy__', model:'deepseek-reasoner', endpoint:'/api/ai?provider=deepseek', isOpenAI:true, extra:{} },
    // Grok (xAI) — /api/grok proxy (GROK_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'Grok', key:'__proxy__', model:'grok-3',      endpoint:'/api/ai?provider=grok', isOpenAI:true, extra:{} },
    { provider:'Grok', key:'__proxy__', model:'grok-3-mini', endpoint:'/api/ai?provider=grok', isOpenAI:true, extra:{} },
    // HuggingFace — hf_ key via sn_ai_key handled above; here only legacy sn_hf_key or proxy fallback
    ...((() => {
      if (userKey && userKey.startsWith('hf_')) return []; // already handled in user-key block
      const k = getUserHfKey(); // legacy sn_hf_key fallback
      if (k && k.length > 10) return [
        { provider:'HuggingFace', key:k, model:'meta-llama/Llama-3.3-70B-Instruct', endpoint:'https://router.huggingface.co/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'HuggingFace', key:k, model:'Qwen/Qwen2.5-72B-Instruct',         endpoint:'https://router.huggingface.co/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'HuggingFace', key:k, model:'mistralai/Mistral-7B-Instruct-v0.3', endpoint:'https://router.huggingface.co/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      return [
        { provider:'HuggingFace', key:'__proxy__', model:'meta-llama/Llama-3.3-70B-Instruct', endpoint:'/api/ai?provider=huggingface', isOpenAI:true, extra:{} },
        { provider:'HuggingFace', key:'__proxy__', model:'Qwen/Qwen2.5-72B-Instruct',         endpoint:'/api/ai?provider=huggingface', isOpenAI:true, extra:{} },
      ];
    })()),
    // Cloudflare Workers AI — user key direct OR via /api/cloudflare server-side proxy
    ...((() => {
      const k = getUserCfKey();
      if (k && k.length > 10) {
        // Cloudflare user keys need account_id too — only proxy mode supported for direct calls
        // If user provides key in format "accountId:apiKey" we parse it, else use proxy
        const parts = k.split(':');
        if (parts.length === 2) {
          const [acctId, cfKey] = parts;
          const cfBase = `https://api.cloudflare.com/client/v4/accounts/${acctId}/ai/v1/chat/completions`;
          return [
            { provider:'Cloudflare', key:cfKey, model:'@cf/meta/llama-3.3-70b-instruct-fp8-fast', endpoint:cfBase, isOpenAI:true, extra:{} },
            { provider:'Cloudflare', key:cfKey, model:'@cf/qwen/qwen2.5-72b-instruct',             endpoint:cfBase, isOpenAI:true, extra:{} },
          ];
        }
      }
      return [
        { provider:'Cloudflare', key:'__proxy__', model:'@cf/meta/llama-3.3-70b-instruct-fp8-fast', endpoint:'/api/ai?provider=cloudflare', isOpenAI:true, extra:{} },
        { provider:'Cloudflare', key:'__proxy__', model:'@cf/qwen/qwen2.5-72b-instruct',             endpoint:'/api/ai?provider=cloudflare', isOpenAI:true, extra:{} },
      ];
    })()),
    // GitHub Models — user key only (ghp_/github_pat_ via sn_ai_key or legacy sn_gh_key); no server proxy
    ...((() => {
      if (userKey && (userKey.startsWith('ghp_') || userKey.startsWith('github_pat_'))) return []; // already handled above
      const k = getUserGhKey(); // legacy sn_gh_key fallback
      if (k && k.length > 10) return [
        { provider:'GitHub', key:k, model:'gpt-4o-mini',                 endpoint:'https://models.inference.ai.azure.com/chat/completions', isOpenAI:true, extra:{} },
        { provider:'GitHub', key:k, model:'meta-llama-3.3-70b-instruct', endpoint:'https://models.inference.ai.azure.com/chat/completions', isOpenAI:true, extra:{} },
        { provider:'GitHub', key:k, model:'Phi-4',                       endpoint:'https://models.inference.ai.azure.com/chat/completions', isOpenAI:true, extra:{} },
      ];
      return [
        { provider:'GitHub', key:'__proxy__', model:'gpt-4o-mini',                 endpoint:'/api/ai?provider=github', isOpenAI:true, extra:{} },
        { provider:'GitHub', key:'__proxy__', model:'meta-llama-3.3-70b-instruct', endpoint:'/api/ai?provider=github', isOpenAI:true, extra:{} },
        { provider:'GitHub', key:'__proxy__', model:'Phi-4',                       endpoint:'/api/ai?provider=github', isOpenAI:true, extra:{} },
      ];
    })()),
    // SambaNova Cloud — user key only (sn_sn_key); no server proxy
    ...((() => {
      const k = getUserSnKey();
      if (k && k.length > 10) return [
        { provider:'SambaNova', key:k, model:'Meta-Llama-3.3-70B-Instruct', endpoint:'https://api.sambanova.ai/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'SambaNova', key:k, model:'Qwen2.5-72B-Instruct',        endpoint:'https://api.sambanova.ai/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'SambaNova', key:k, model:'DeepSeek-R1',                 endpoint:'https://api.sambanova.ai/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      return [
        { provider:'SambaNova', key:'__proxy__', model:'Meta-Llama-3.3-70B-Instruct', endpoint:'/api/ai?provider=sambanova', isOpenAI:true, extra:{} },
        { provider:'SambaNova', key:'__proxy__', model:'Qwen2.5-72B-Instruct',        endpoint:'/api/ai?provider=sambanova', isOpenAI:true, extra:{} },
        { provider:'SambaNova', key:'__proxy__', model:'DeepSeek-R1',                 endpoint:'/api/ai?provider=sambanova', isOpenAI:true, extra:{} },
      ];
    })()),
    // ── EXTERNAL FALLBACK (no key required — public free endpoints)
    // Digunakan otomatis jika SEMUA provider di atas gagal / sibuk
    // Pollinations AI — free, no key, OpenAI-compatible
    { provider:'Pollinations', key:'__nokey__', model:'openai', endpoint:'https://text.pollinations.ai/openai', isOpenAI:true, extra:{} },
    { provider:'Pollinations', key:'__nokey__', model:'phi-4', endpoint:'https://text.pollinations.ai/openai', isOpenAI:true, extra:{} },
    { provider:'Pollinations', key:'__nokey__', model:'llama', endpoint:'https://text.pollinations.ai/openai', isOpenAI:true, extra:{} },
  ];
}

let slotIdx = 0;

// ═══════════════════════════════════════════════════════
//  USER RUNTIME API KEYS — diisi dari Settings > API Keys
//  User key diutamakan; fallback ke env/built-in jika kosong
// ═══════════════════════════════════════════════════════
const _ENV_SP_ID     = ''; // handled via /api/spotify-token server proxy
const _ENV_SP_SECRET = ''; // handled via /api/spotify-token server proxy
const _ENV_SC_ID     = ''; // user supplies via Settings; server key via /api/soundcloud proxy
// DeepSeek & Grok keys are now handled server-side in /api/deepseek and /api/grok
const _ENV_DS_KEY    = ''; // unused — key lives in Vercel env var DEEPSEEK_API_KEY
const _ENV_GROK_KEY  = ''; // unused — key lives in Vercel env var GROK_API_KEY
// YouTube Data API v3 — bisa via env (server proxy) ATAU user key langsung dari browser
const _ENV_YT_KEY = ''; // user supplies via Settings — env key would be VITE_ (client) so removed
// Flag: apakah server (Vercel) punya YOUTUBE_API_KEY — di-set saat startup via /api/yt-status
let _SERVER_HAS_YT_KEY = false;
export const setServerYtKeyStatus = (hasKey) => { _SERVER_HAS_YT_KEY = !!hasKey; };
// Runtime mutable — diupdate oleh App saat settings berubah
let _USER_SP_ID     = '';
let _USER_SP_SECRET = '';
let _USER_SP_DC     = ''; // Spotify internal session cookie (sp_dc) — untuk full track
let _USER_SP_KEY    = ''; // Spotify internal client key (sp_key) — untuk full track
let _USER_SC_ID     = '';
let _USER_SC_OAUTH  = ''; // SoundCloud OAuth token — untuk full track streaming
let _USER_AI_KEY    = ''; // Universal AI key — auto-detect provider from prefix
let _USER_YT_KEY    = ''; // YouTube Data API v3 key dari user
let _USER_HF_KEY    = ''; // HuggingFace Inference API key (hf_...)
let _USER_CF_KEY    = ''; // Cloudflare Workers AI key
let _USER_GH_KEY    = ''; // GitHub Models token (ghp_... or github_pat_...)
let _USER_SN_KEY    = ''; // SambaNova Cloud API key
let _USER_DS_KEY    = ''; // DeepSeek API key (user-supplied, opsional — bisa pakai sk- universal)
let _USER_GROK_KEY  = ''; // xAI Grok API key (user-supplied, opsional — bisa pakai xai- universal)
// FIX Bug #4: ganti parameter _u1/_u2 yang selalu '' dengan ds_key dan grok_key yang benar,
// sehingga key dari Settings benar-benar disimpan ke runtime dan tidak hilang diam-diam.
export const setRuntimeKeys = (sp_id, sp_secret, sc_id, ai_key, ds_key, grok_key, yt_key, hf_key, cf_key, gh_key, sn_key, sp_dc, sp_key, sc_oauth) => {
  _USER_SP_ID = sp_id || ''; _USER_SP_SECRET = sp_secret || '';
  _USER_SP_DC = sp_dc || ''; _USER_SP_KEY = sp_key || '';
  _USER_SC_ID = sc_id || ''; _USER_AI_KEY    = ai_key    || '';
  _USER_SC_OAUTH = sc_oauth || '';
  _USER_DS_KEY   = ds_key   || '';
  _USER_GROK_KEY = grok_key || '';
  _USER_YT_KEY = yt_key || '';
  _USER_HF_KEY = hf_key || '';
  _USER_CF_KEY = cf_key || '';
  _USER_GH_KEY = gh_key || '';
  _USER_SN_KEY = sn_key || '';
  _spToken = null; _spTokenExp = 0;
  _spInternalToken = null; _spInternalTokenExp = 0;
};
export const getSpId      = () => _USER_SP_ID     || _ENV_SP_ID;
export const getSpSecret  = () => _USER_SP_SECRET || _ENV_SP_SECRET;
export const getSpDc      = () => _USER_SP_DC     || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_sp_dc')  || '' : '');
export const getSpKey     = () => _USER_SP_KEY    || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_sp_key') || '' : '');
export const hasSpInternalLogin = () => !!(getSpDc());
export const getScId      = () => _USER_SC_ID     || _ENV_SC_ID;
export const getScOAuth   = () => _USER_SC_OAUTH  || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_sc_oauth') || '' : '');
export const hasScOAuth   = () => !!(getScOAuth());
export const getUserAiKey  = () => _USER_AI_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_ai_key') || '' : '');
// FIX Bug #5: getUserDsKey dan getUserGrokKey sebelumnya selalu return '' (hanya _ENV_DS_KEY/GROK_KEY
// yang kosong). Sekarang ikut pola yang sama dengan key lain: cek runtime key, lalu localStorage.
export const getUserDsKey   = () => _USER_DS_KEY   || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_ds_key')   || '' : '') || _ENV_DS_KEY;
export const getUserGrokKey = () => _USER_GROK_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_grok_key') || '' : '') || _ENV_GROK_KEY;
export const getUserHfKey  = () => {
  if (_USER_HF_KEY) return _USER_HF_KEY;
  const aiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('sn_ai_key') || '' : '';
  if (aiKey.startsWith('hf_')) return aiKey;
  return typeof localStorage !== 'undefined' ? localStorage.getItem('sn_hf_key') || '' : '';
};
export const getUserCfKey  = () => _USER_CF_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_cf_key') || '' : '');
export const getUserGhKey  = () => {
  if (_USER_GH_KEY) return _USER_GH_KEY;
  const aiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('sn_ai_key') || '' : '';
  if (aiKey.startsWith('ghp_') || aiKey.startsWith('github_pat_')) return aiKey;
  return typeof localStorage !== 'undefined' ? localStorage.getItem('sn_gh_key') || '' : '';
};
export const getUserSnKey  = () => _USER_SN_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_sn_key') || '' : '');
// Ambil YT key: user key (langsung ke Google) atau fallback ke env (via proxy)
export const getYtKey     = () => _USER_YT_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_yt_key') || '' : '') || _ENV_YT_KEY;
export const isYtApiEnabled = () => !!(getYtKey()) || _SERVER_HAS_YT_KEY;

// ═══════════════════════════════════════════════════════
//  SPOTIFY — Client Credentials token + search
// ═══════════════════════════════════════════════════════
export const SP_CLIENT_ID     = ''; // server-side via /api/spotify-token
export const SP_CLIENT_SECRET = ''; // server-side via /api/spotify-token

let _spToken = null;
let _spTokenExp = 0;

// ─── Internal token (sp_dc login) — untuk full track streaming ───────────────
let _spInternalToken = null;
let _spInternalTokenExp = 0;

/**
 * Ambil Spotify internal access_token menggunakan sp_dc cookie.
 * Ini adalah metode yang sama yang digunakan Spotube & spotipy untuk bypass
 * client_credentials dan mendapat akses full-track.
 * Karena browser tidak bisa kirim Cookie ke domain lain (CORS),
 * kita proxy lewat /api/spotify-internal-token di server.
 */
export async function getSpotifyInternalToken() {
  if (_spInternalToken && Date.now() < _spInternalTokenExp) return _spInternalToken;
  const spDc = getSpDc();
  if (!spDc) return null;
  try {
    const res = await fetch('/api/spotify-internal-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sp_dc: spDc }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.access_token) return null;
    _spInternalToken = data.access_token;
    // Spotify internal token biasanya valid ~1 jam
    _spInternalTokenExp = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
    return _spInternalToken;
  } catch { return null; }
}

/**
 * Ambil URL stream full track Spotify menggunakan internal token.
 * Returns URL audio yang bisa diputar, atau null jika gagal.
 */
export async function getSpotifyTrackStreamUrl(trackId) {
  const token = await getSpotifyInternalToken();
  if (!token || !trackId) return null;
  try {
    // Gunakan Spotify Partner API (digunakan internal oleh web player)
    const res = await fetch(
      `https://api-partner.spotify.com/pathfinder/v1/query?operationName=getTrack&variables=%7B%22uri%22%3A%22spotify%3Atrack%3A${trackId}%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22e101aead6d78faa11d75bec5e36385a07b2f1c4227171e2e45fd6f9eff1ac35d%22%7D%7D`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    // Partner API tidak langsung return stream URL; gunakan playback endpoint
    // Ambil track detail dulu untuk validasi
    const trackRes = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!trackRes.ok) return null;
    const track = await trackRes.json();
    // Kembalikan preview_url jika ada (fallback) — full stream lewat proxy
    return track.preview_url || null;
  } catch { return null; }
}

/**
 * Fetch full track audio stream via server proxy (sp_dc authenticated).
 * Server proxy di /api/spotify-internal-token akan handle playback URL.
 */
export async function getSpotifyFullTrackUrl(trackId) {
  const spDc = getSpDc();
  if (!spDc || !trackId) return null;
  try {
    const res = await fetch('/api/spotify-internal-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sp_dc: spDc, track_id: trackId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stream_url || data.cdnUrl || null;
  } catch { return null; }
}

async function getSpotifyToken() {
  if (_spToken && Date.now() < _spTokenExp) return _spToken;
  const spId = getSpId(); const spSec = getSpSecret();
  try {
    let res;
    if (spId && spSec) {
      // User-supplied credentials — call Spotify directly from browser
      res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${spId}:${spSec}`),
        },
        body: 'grant_type=client_credentials',
      });
    } else {
      // No user key — use server-side proxy (SPOTIFY_CLIENT_ID/SECRET in Vercel env)
      res = await fetch('/api/spotify-token', { method: 'POST' });
    }
    if (!res.ok) return null;
    const data = await res.json();
    _spToken = data.access_token;
    _spTokenExp = Date.now() + (data.expires_in - 60) * 1000;
    return _spToken;
  } catch { return null; }
}

export async function searchSpotify(query, limit = 10) {
  let token = await getSpotifyToken();
  // Fallback: gunakan internal token dari sp_dc jika client credentials gagal
  if (!token) token = await getSpotifyInternalToken();
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=ID`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.tracks?.items || []).map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      album: t.album.name,
      cover: t.album.images?.[1]?.url || t.album.images?.[0]?.url || '',
      duration: t.duration_ms,
      previewUrl: t.preview_url,
      spotifyUrl: t.external_urls?.spotify || '',
    }));
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════
//  SOUNDCLOUD — API search (requires client_id) + resolve
// ═══════════════════════════════════════════════════════
export const SC_CLIENT_ID = ''; // user supplies via Settings

export async function searchSoundCloud(query, limit = 10) {
  const scId = getScId();
  if (!scId) return null;
  try {
    // Coba api-v2 terlebih dahulu (lebih andal)
    let res = await fetch(
      `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&limit=${limit}&client_id=${scId}`,
      { headers: { Accept: 'application/json; charset=utf-8' } }
    );
    let data = null;
    if (res.ok) {
      data = await res.json();
      const items = data.collection || [];
      if (items.length > 0) return items.map(t => ({
        id: String(t.id),
        title: t.title || 'Unknown',
        artist: t.user?.username || 'SoundCloud',
        cover: (t.artwork_url || t.user?.avatar_url || '').replace('-large', '-t300x300'),
        duration: Math.round((t.duration || 0) / 1000),
        permalinkUrl: t.permalink_url || '',
        streamUrl: t.permalink_url || '',
        waveformUrl: t.waveform_url || '',
      }));
    }
    // Fallback ke api v1
    res = await fetch(
      `https://api.soundcloud.com/tracks?q=${encodeURIComponent(query)}&limit=${limit}&client_id=${scId}`,
      { headers: { Accept: 'application/json; charset=utf-8' } }
    );
    if (!res.ok) return null;
    data = await res.json();
    return (Array.isArray(data) ? data : data.collection || []).map(t => ({
      id: String(t.id),
      title: t.title || 'Unknown',
      artist: t.user?.username || 'SoundCloud',
      cover: (t.artwork_url || t.user?.avatar_url || '').replace('-large', '-t300x300'),
      duration: Math.round((t.duration || 0) / 1000),
      permalinkUrl: t.permalink_url || '',
      streamUrl: t.permalink_url || '',
      waveformUrl: t.waveform_url || '',
    }));
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════
//  SOUNDCLOUD OAUTH — Full track streaming via OAuth token
//  Mirip pola sp_dc Spotify — user paste token dari browser
// ═══════════════════════════════════════════════════════

let _scOAuthToken = null;
let _scOAuthTokenExp = 0;

/**
 * Ambil SoundCloud access_token menggunakan OAuth token dari cookie/localStorage.
 * Token bisa didapat dari: Developer Tools → Application → Cookies → soundcloud.com → oauth_token
 * ATAU dari Network tab: cari request ke api-v2.soundcloud.com, lihat header Authorization: OAuth <token>
 */
export async function getScAccessToken() {
  if (_scOAuthToken && Date.now() < _scOAuthTokenExp) return _scOAuthToken;
  const oauthToken = getScOAuth();
  if (!oauthToken) return null;
  // OAuth token SoundCloud langsung dipakai sebagai Bearer/OAuth token
  // Validasi token dengan hit /me endpoint
  try {
    const res = await fetch('https://api-v2.soundcloud.com/me', {
      headers: { 'Authorization': `OAuth ${oauthToken}` }
    });
    if (!res.ok) return null;
    // Token valid — cache selama 50 menit
    _scOAuthToken = oauthToken;
    _scOAuthTokenExp = Date.now() + 50 * 60 * 1000;
    return _scOAuthToken;
  } catch { return null; }
}

/**
 * Cari lagu SoundCloud dengan OAuth token (mendapat lebih banyak hasil + unblocked tracks).
 */
export async function searchSoundCloudOAuth(query, limit = 10) {
  const token = await getScAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&limit=${limit}&access=playable,preview`,
      { headers: { 'Authorization': `OAuth ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.collection || []).map(t => ({
      id: String(t.id),
      title: t.title || 'Unknown',
      artist: t.user?.username || 'SoundCloud',
      cover: (t.artwork_url || t.user?.avatar_url || '').replace('-large', '-t300x300'),
      duration: Math.round((t.duration || 0) / 1000),
      permalinkUrl: t.permalink_url || '',
      streamUrl: t.permalink_url || '',
      waveformUrl: t.waveform_url || '',
      // Media transcoding untuk direct stream
      _transcodings: t.media?.transcodings || [],
      _policy: t.policy || '',
    }));
  } catch { return null; }
}

/**
 * Ambil direct stream URL untuk track SoundCloud via OAuth.
 * Mencoba progressive MP3 terlebih dahulu, fallback ke HLS.
 * Returns { url, format } atau null jika gagal.
 */
export async function getScTrackStreamUrl(trackIdOrTranscodings) {
  const token = await getScAccessToken();
  if (!token) return null;
  try {
    let transcodings = Array.isArray(trackIdOrTranscodings) ? trackIdOrTranscodings : null;
    // Jika diberikan track ID (string/number), fetch track detail dulu
    if (!transcodings) {
      const trackRes = await fetch(
        `https://api-v2.soundcloud.com/tracks/${trackIdOrTranscodings}`,
        { headers: { 'Authorization': `OAuth ${token}` } }
      );
      if (!trackRes.ok) return null;
      const trackData = await trackRes.json();
      transcodings = trackData.media?.transcodings || [];
    }
    if (!transcodings.length) return null;
    // Prioritas: progressive MP3 > HLS MP3 > apapun progressive > apapun HLS
    const progressive = transcodings.find(tc =>
      tc.format?.protocol === 'progressive' && tc.format?.mime_type?.includes('mpeg')
    ) || transcodings.find(tc => tc.format?.protocol === 'progressive');
    const hls = transcodings.find(tc =>
      tc.format?.protocol === 'hls' && tc.format?.mime_type?.includes('mpeg')
    ) || transcodings.find(tc => tc.format?.protocol === 'hls');
    const chosen = progressive || hls;
    if (!chosen?.url) return null;
    // Resolve transcoding URL ke CDN stream URL
    const streamRes = await fetch(
      `${chosen.url}?client_id=${getScId() || 'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX'}`,
      { headers: { 'Authorization': `OAuth ${token}` } }
    );
    if (!streamRes.ok) return null;
    const streamData = await streamRes.json();
    return { url: streamData.url, format: chosen.format?.protocol || 'progressive' };
  } catch { return null; }
}
const buildMessages = (user, history = []) => {
  // Ambil maks 10 pesan terakhir (5 turn) agar tidak overflow context
  const recent = history.slice(-10);
  const msgs = [];
  for (const m of recent) {
    if (m.from === 'user') msgs.push({ role: 'user', content: m.text });
    else if (m.from === 'ai' && m.text) msgs.push({ role: 'assistant', content: m.text });
  }
  // Pastikan diawali role user (beberapa API menolak jika pertama assistant)
  while (msgs.length > 0 && msgs[0].role === 'assistant') msgs.shift();
  msgs.push({ role: 'user', content: user });
  return msgs;
};

export const askAI = async (user, system='', tries=0, history=[]) => {
  const PROVIDERS = getProviders();
  if (!PROVIDERS.length) return '⚠️ No API key found. Add one in Settings or Vercel Environment Variables.';
  if (tries >= PROVIDERS.length) { slotIdx = 0; return 'Semua provider tidak tersedia saat ini, coba beberapa saat lagi.'; }
  // Round-robin: mulai dari slotIdx, tapi jangan reset global sampai berhasil
  const startSlot = slotIdx % PROVIDERS.length;
  const slot = PROVIDERS[startSlot];
  const msgs = buildMessages(user, history);
  try {
    let res, data, txt;
    if (!slot.isOpenAI) {
      // ── Format Anthropic native (Claude)
      res = await fetch(slot.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': slot.key,
          ...slot.extra,
        },
        body: JSON.stringify({
          model: slot.model,
          max_tokens: 500,
          ...(system ? { system } : {}),
          messages: msgs,
        }),
      });
      data = await res.json();
      if (res.status === 429 || res.status === 503 || res.status === 401 || res.status === 404 || data.error) {
        console.warn(`[Chat] ${slot.provider}/${slot.model} status ${res.status}`, data.error?.message || '');
        slotIdx = (startSlot + 1) % PROVIDERS.length;
        return askAI(user, system, tries + 1, history);
      }
      txt = data.content?.[0]?.text;
    } else {
      // ── Format OpenAI-compatible (OpenAI, OpenRouter, Gemini, Groq, dll.)
      res = await fetch(slot.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // __proxy__ slots are server-side proxies — key is injected by Vercel, not the browser
          // __nokey__ slots are public free endpoints — no auth header at all
          ...(slot.key !== '__proxy__' && slot.key !== '__nokey__' ? { 'Authorization': `Bearer ${slot.key}` } : {}),
          ...slot.extra,
        },
        body: JSON.stringify({
          model: slot.model,
          max_tokens: 500,
          messages: [
            ...(system ? [{ role:'system', content:system }] : []),
            ...msgs,
          ],
        }),
      });
      data = await res.json();
      if (res.status === 429 || res.status === 503 || res.status === 401 || res.status === 404 || data.error) {
        console.warn(`[Chat] ${slot.provider}/${slot.model} status ${res.status}`, data.error?.message || '');
        slotIdx = (startSlot + 1) % PROVIDERS.length;
        return askAI(user, system, tries + 1, history);
      }
      txt = data.choices?.[0]?.message?.content;
    }
    if (!txt) {
      console.warn(`[Chat] ${slot.provider}/${slot.model} returned no text`);
      slotIdx = (startSlot + 1) % PROVIDERS.length;
      return askAI(user, system, tries + 1, history);
    }
    // Berhasil — majukan slot supaya request berikutnya pakai provider berikutnya (round-robin)
    slotIdx = (startSlot + 1) % PROVIDERS.length;
    return (typeof txt === "string" ? txt : JSON.stringify(txt)).trim();
  } catch(e) {
    console.warn(`[Chat] ${slot.provider}/${slot.model} network error:`, e?.message);
    slotIdx = (startSlot + 1) % PROVIDERS.length;
    return askAI(user, system, tries + 1, history);
  }
}

// ── askAIRace: kirim ke SEMUA provider paralel, ambil yang pertama berhasil balas
// history: array of {from:'user'|'ai', text:string} — untuk menjaga konteks percakapan
export const askAIRace = async (user, system='', history=[], maxTokens=500) => {
  const PROVIDERS = getProviders();
  if (!PROVIDERS.length) return '⚠️ No API key found. Add one in Settings or Vercel Environment Variables.';

  // Deduplicate by endpoint+model
  const seen = new Set();
  const uniq = PROVIDERS.filter(p => {
    const k = p.endpoint + '|' + p.model;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });

  // Build one fetch promise per provider
  const msgs = buildMessages(user, history);
  const makeReq = (slot) => {
    const body = slot.isOpenAI
      ? { model: slot.model, max_tokens: maxTokens,
          messages: [...(system ? [{ role:'system', content:system }] : []), ...msgs],
          ...slot.extra }
      : { model: slot.model, max_tokens: maxTokens,
          ...(system ? { system } : {}),
          messages: msgs };

    // __proxy__ slots: key lives in Vercel env vars, not the browser — omit Authorization header
    // __nokey__ slots: public free endpoints — no auth header at all
    const headers = slot.isOpenAI
      ? { 'Content-Type':'application/json',
          ...(slot.key !== '__proxy__' && slot.key !== '__nokey__' ? { 'Authorization': `Bearer ${slot.key}` } : {}),
          ...slot.extra }
      : { 'Content-Type':'application/json', 'x-api-key': slot.key, ...slot.extra };

    return fetch(slot.endpoint, { method:'POST', headers, body: JSON.stringify(body) })
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || 'API error');
        const txt = slot.isOpenAI ? data?.choices?.[0]?.message?.content : data?.content?.[0]?.text;
        if (!txt) throw new Error('empty response');
        // Update slotIdx & lastWinner label supaya tampilan "model aktif" akurat
        const idx = PROVIDERS.findIndex(p => p.endpoint === slot.endpoint && p.model === slot.model);
        if (idx !== -1) slotIdx = (idx + 1) % PROVIDERS.length;
        const winnerLabel = formatModelLabel(slot.provider, slot.model);
        _lastWinnerLabel = winnerLabel;
        console.log(`[Chat/race] Winner: ${slot.provider}/${slot.model}`);
        return (typeof txt === "string" ? txt : JSON.stringify(txt)).trim();
      })
      .catch(e => {
        console.warn(`[Chat/race] ${slot.provider}/${slot.model} failed:`, e?.message);
        return Promise.reject(e);
      });
  };

  // Promise.any = ambil yang pertama resolve (bukan reject)
  try {
    return await Promise.any(uniq.map(makeReq));
  } catch {
    return 'Semua provider tidak tersedia saat ini, coba beberapa saat lagi.';
  }
};


// lastWinnerModel: diupdate oleh askAIRace setiap kali ada provider yang menang
let _lastWinnerLabel = '';
export const setLastWinnerLabel = (label) => { _lastWinnerLabel = label; };

// Format nama model jadi label pendek yang ramah ditampilkan di UI
export const formatModelLabel = (provider, model) => {
  // Ambil bagian akhir model path: "meta-llama/llama-3.3-70b-instruct:free" -> "llama-3.3-70b-instruct"
  const m = model.split('/').pop()?.replace(':free','').replace('@cf/','') || model;
  const modelMap = {
    // Anthropic Claude
    'claude-haiku-4-5-20251001': 'Haiku 4.5',
    'claude-sonnet-4-6':         'Sonnet 4.6',
    'claude-opus-4-6':           'Opus 4.6',
    // OpenAI
    'gpt-4o-mini':     'GPT-4o mini',
    'gpt-4o':          'GPT-4o',
    'gpt-3.5-turbo':   'GPT-3.5',
    // Gemini
    'gemini-2.0-flash':      'Flash 2.0',
    'gemini-2.0-flash-lite': 'Flash Lite',
    // Groq
    'llama-3.3-70b-versatile': 'Llama 3.3 70B',
    'gemma2-9b-it':            'Gemma2 9B',
    'llama-3.1-8b-instant':    'Llama 3.1 8B',
    // DeepSeek
    'deepseek-chat':     'DeepSeek V3',
    'deepseek-reasoner': 'DeepSeek R1',
    // Grok
    'grok-3':      'Grok 3',
    'grok-3-mini': 'Grok 3 Mini',
    // OpenRouter / HuggingFace
    'deepseek-chat':                     'DeepSeek V3',
    'llama-3.3-70b-instruct':            'Llama 3.3 70B',
    'Llama-3.3-70B-Instruct':            'Llama 3.3 70B',
    'meta-llama-3.3-70b-instruct':       'Llama 3.3 70B',
    'Meta-Llama-3.3-70B-Instruct':       'Llama 3.3 70B',
    'llama-3.3-70b-instruct-fp8-fast':   'Llama 3.3 70B',
    'qwen3-4b':                          'Qwen3 4B',
    'Qwen2.5-72B-Instruct':              'Qwen2.5 72B',
    'qwen2.5-72b-instruct':              'Qwen2.5 72B',
    'mistral-7b-instruct':               'Mistral 7B',
    'Phi-4':                             'Phi-4',
  };
  const shortModel = modelMap[m] || m;
  return `${provider} · ${shortModel}`;
};
export const activeModel = () => {
  if (!getProviders().length) return 'no-key';
  if (_lastWinnerLabel) return _lastWinnerLabel;
  const s = getProviders()[slotIdx % getProviders().length];
  return formatModelLabel(s.provider, s.model);
};
export const hasKey = () => getProviders().length > 0;

// ═══════════════════════════════════════════════════════
// Cache list Drive agar tidak re-fetch setiap login
export const _driveCache = { token: null, songs: null, ts: 0 };
export const DRIVE_CACHE_TTL = 5 * 60 * 1000; // 5 menit
// Cache in-memory (sesi ini) + Cache API (persisten antar refresh)
export const _blobCache = new Map();
window._snBlobCacheRef = _blobCache; // expose agar handleClearCache bisa clear in-memory cache
export const DRIVE_CACHE_NAME = 'sn-drive-v1';
const DRIVE_SIZE_KEY   = 'sn_drive_sizes'; // localStorage key untuk menyimpan ukuran file penuh
export const YT_CACHE_NAME    = 'sn-yt-v1';      // cache audio YouTube yang di-love
export const FAV_CACHE_NAME   = 'sn-fav-v1';     // cache audio favSongs (SC/Spotify preview) yang di-love

// Simpan audio blob YouTube ke cache
// ── Audio Compression via MediaRecorder + OfflineAudioContext ────────────────
// Mengompresi blob audio mentah (MP3/AAC/WebM) ke Opus 64kbps menggunakan
// Web Audio API + MediaRecorder. Hemat 3-8x ruang dibanding MP3 128kbps asli.
//
// Cara kerja:
//   1. decodeAudioData  → AudioBuffer (PCM mentah)
//   2. OfflineAudioContext.startRendering → AudioBuffer bersih (copy)
//   3. AudioBufferSourceNode → MediaStreamDestination → MediaRecorder (Opus)
//   4. Kumpulkan chunk → Blob WebM/Opus
//
// Guard: jika browser tidak support Opus MediaRecorder atau blob sudah kecil,
// fungsi langsung return blob asli tanpa error.

// Cache nama versi kompresi — terpisah dari v1 agar rollback mudah
export const OPUS_CACHE_SUFFIX = ':opus'; // ditambah ke cacheKey sebagai tanda sudah dikompres

// Target bitrate Opus (bits/detik). 64 kbps → kualitas baik untuk musik streaming.
// Bisa diturunkan ke 48 kbps untuk hemat lebih banyak, tapi artefak lebih terasa.
const OPUS_BITRATE = 64_000;

// Ukuran minimum blob (bytes) yang layak dikompres — blob < 50 KB tidak perlu
const COMPRESS_MIN_SIZE = 50_000;

// Deteksi apakah browser ini mendukung encode Opus via MediaRecorder
function _supportsOpusMediaRecorder() {
  if (typeof MediaRecorder === 'undefined') return false;
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  return types.some(t => MediaRecorder.isTypeSupported(t));
}

// Pilih mime type terbaik yang didukung
function _bestOpusMime() {
  const candidates = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm'];
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || 'audio/webm';
}

/**
 * Kompres blob audio ke Opus menggunakan pipeline Web Audio + MediaRecorder.
 * Return blob terkompresi, atau blob asli jika kompresi tidak tersedia / tidak menghemat.
 * @param {Blob} blob - Blob audio asli (MP3/AAC/WebM/dll)
 * @param {AbortSignal} [signal] - Opsional abort signal
 */
export async function compressAudioBlob(blob, signal) {
  // Guard: ukuran terlalu kecil atau browser tidak support
  if (!blob || blob.size < COMPRESS_MIN_SIZE) return blob;
  if (!_supportsOpusMediaRecorder()) return blob;

  try {
    const arrayBuf = await blob.arrayBuffer();
    if (signal?.aborted) return blob;

    // Decode audio ke PCM
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return blob;
    const tmpCtx = new AC();
    let audioBuf;
    try {
      audioBuf = await tmpCtx.decodeAudioData(arrayBuf);
    } catch {
      await tmpCtx.close();
      return blob; // format tidak dikenali browser
    }
    await tmpCtx.close();
    if (signal?.aborted) return blob;

    const { numberOfChannels, sampleRate, length } = audioBuf;

    // Render ulang via OfflineAudioContext agar PCM clean (beberapa decode ada noise)
    const offline = new OfflineAudioContext(numberOfChannels, length, sampleRate);
    const src = offline.createBufferSource();
    src.buffer = audioBuf;
    src.connect(offline.destination);
    src.start(0);
    const rendered = await offline.startRendering();
    if (signal?.aborted) return blob;

    // Encode via MediaRecorder: hubungkan rendered buffer ke MediaStreamDestination
    const encCtx = new AC({ sampleRate });
    const dest = encCtx.createMediaStreamDestination();
    const playback = encCtx.createBufferSource();
    playback.buffer = rendered;
    playback.connect(dest);

    const mime = _bestOpusMime();
    const recorder = new MediaRecorder(dest.stream, {
      mimeType: mime,
      audioBitsPerSecond: OPUS_BITRATE,
    });

    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };

    const compressed = await new Promise((resolve, reject) => {
      recorder.onstop = () => {
        encCtx.close();
        const b = new Blob(chunks, { type: mime });
        resolve(b);
      };
      recorder.onerror = (e) => { encCtx.close(); reject(e.error || new Error('MediaRecorder error')); };

      recorder.start();
      playback.start(0);
      // Stop recorder setelah durasi audio selesai + sedikit buffer
      setTimeout(() => {
        try { if (recorder.state !== 'inactive') recorder.stop(); } catch {}
      }, (rendered.duration * 1000) + 500);
    });

    if (signal?.aborted) return blob;

    // Hanya pakai hasil kompresi jika benar-benar lebih kecil (toleransi 5%)
    if (compressed.size > 0 && compressed.size < blob.size * 0.95) {
      return compressed;
    }
    return blob; // kompresi tidak menghemat (mungkin sudah Opus/format kecil)
  } catch {
    return blob; // fallback aman — blob asli tetap dipakai
  }
}

/**
 * Kompres semua entri di satu cache secara berurutan.
 * Dipanggil dari tombol "Kompres Cache" di Settings.
 * @param {string} cacheName - nama CacheStorage (e.g. 'sn-yt-v1')
 * @param {string} prefix - prefix URL path (e.g. '/yt/')
 * @param {function} onProgress - callback(processed, total, savedBytes)
 * @param {AbortSignal} signal
 */
export async function recompressCacheEntries(cacheName, prefix, onProgress, signal) {
  const cache = await caches.open(cacheName);
  const keys  = await cache.keys();
  let savedBytes = 0;
  for (let i = 0; i < keys.length; i++) {
    if (signal?.aborted) break;
    const req = keys[i];
    // Skip entri yang sudah dikompres (ditandai header custom)
    const existing = await cache.match(req);
    if (!existing) continue;
    const alreadyCompressed = existing.headers.get('x-sn-opus') === '1';
    if (alreadyCompressed) { onProgress?.(i + 1, keys.length, savedBytes); continue; }

    const origBlob = await existing.blob();
    const compressed = await compressAudioBlob(origBlob, signal);
    if (signal?.aborted) break;

    if (compressed !== origBlob && compressed.size < origBlob.size) {
      savedBytes += origBlob.size - compressed.size;
      await cache.put(req, new Response(compressed, {
        headers: {
          'Content-Type': compressed.type,
          'x-sn-opus': '1',
          'x-sn-orig-size': String(origBlob.size),
        },
      }));
    }
    onProgress?.(i + 1, keys.length, savedBytes);
  }
  return savedBytes;
}

async function ytCachePut(videoId, blob) {
  // Kompres ke Opus sebelum simpan — hemat 3-8x ruang, transparan ke pemanggil
  const toStore = await compressAudioBlob(blob).catch(() => blob);
  try {
    const cache = await caches.open(YT_CACHE_NAME);
    await cache.put(`/yt/${videoId}`, new Response(toStore, {
      headers: {
        'Content-Type': toStore.type || 'audio/mpeg',
        ...(toStore !== blob ? { 'x-sn-opus': '1', 'x-sn-orig-size': String(blob.size) } : {}),
      },
    }));
  } catch { /* private browsing / storage penuh */ }
}

// Ambil audio blob YouTube dari cache
export async function ytCacheGet(videoId) {
  try {
    const cache = await caches.open(YT_CACHE_NAME);
    const res = await cache.match(`/yt/${videoId}`);
    if (res) return await res.blob();
  } catch {}
  return null;
}

// ── Cache untuk favSongs (audio preview SC/Spotify dll)
async function favCachePut(songId, blob) {
  const toStore = await compressAudioBlob(blob).catch(() => blob);
  try {
    const cache = await caches.open(FAV_CACHE_NAME);
    await cache.put(`/fav/${songId}`, new Response(toStore, {
      headers: {
        'Content-Type': toStore.type || 'audio/mpeg',
        ...(toStore !== blob ? { 'x-sn-opus': '1', 'x-sn-orig-size': String(blob.size) } : {}),
      },
    }));
  } catch { /* private browsing / storage penuh */ }
}

export async function favCacheGet(songId) {
  try {
    const cache = await caches.open(FAV_CACHE_NAME);
    const res = await cache.match(`/fav/${songId}`);
    if (res) return await res.blob();
  } catch {}
  return null;
}

export async function favCacheDelete(songId) {
  try {
    const cache = await caches.open(FAV_CACHE_NAME);
    await cache.delete(`/fav/${songId}`);
  } catch {}
}

// Download audio favSong (preview URL) → simpan ke cache
// Download audio favSong (preview URL) → simpan ke cache
// Fallback: previewUrl langsung → URL alternatif (CDN Spotify/Deezer) → throw
export async function downloadFavAudio(songId, previewUrl, onProgress, signal) {
  if (!previewUrl) throw new Error('No previewUrl');
  // Cek cache dulu
  const existing = await favCacheGet(songId);
  if (existing && existing.size > 1000) { onProgress && onProgress(100); return; }

  // Kumpulkan URL kandidat yang akan dicoba berurutan
  const candidates = [previewUrl];

  // Beberapa preview Spotify/Deezer punya mirror CDN — coba variasi URL
  // p.scdn.co / audio-ak-spotify-com (Spotify CDN alternatif)
  if (previewUrl.includes('p.scdn.co') || previewUrl.includes('audio-ak')) {
    const mirror = previewUrl
      .replace('p.scdn.co', 'audio-ak-spotify-com.akamaized.net')
      .replace('audio-ak-spotify-com.akamaized.net', 'p.scdn.co');
    if (mirror !== previewUrl) candidates.push(mirror);
  }
  // e-cdns.dzcdn.net (Deezer CDN)
  if (previewUrl.includes('dzcdn.net')) {
    const mirror = previewUrl.replace('e-cdns.dzcdn.net', 'cdns.dzcdn.net');
    if (mirror !== previewUrl) candidates.push(mirror);
  }

  let lastErr = null;
  for (const url of candidates) {
    try {
      const blob = await _fetchAudioBlob(url, onProgress, signal, 'audio/mpeg');
      if (!blob || blob.size < 500) throw new Error('empty blob');
      await favCachePut(songId, blob);
      onProgress && onProgress(100);
      return;
    } catch(e) {
      lastErr = e;
      if (signal?.aborted) throw e; // batalkan jika user abort
    }
  }
  throw lastErr || new Error('Semua URL preview gagal diunduh');
}

// ── Helper: download blob dari URL dengan tracking progress ──────────────────
// ── Baca stream response ke Blob dengan tracking progress ────────────────────
async function _readStreamToBlob(res, onProgress, mimeType) {
  const total = parseInt(res.headers.get('content-length') || '0', 10);
  const reader = res.body.getReader();
  const chunks = []; let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (total > 0 && onProgress) onProgress(Math.round((loaded / total) * 90)); // 90% — sisanya untuk cache write
  }
  return new Blob(chunks, { type: mimeType });
}

// ── Fetch audio blob — coba langsung dulu, fallback ke server proxy ──────────
// Server proxy (/api/audio-proxy) mengatasi masalah CORS pada URL dari
// Piped/Invidious/Cobalt/Jamendo/dll yang URL-nya tidak punya CORS header.
async function _fetchAudioBlob(url, onProgress, signal, mimeType = 'audio/mpeg') {
  // ── Attempt 1: fetch langsung (tanpa proxy) ─────────────────────────────
  try {
    const res = await fetch(url, { signal, mode: 'cors' });
    if (res.ok) {
      const blob = await _readStreamToBlob(res, onProgress, mimeType);
      if (blob.size > 500) return blob;
    }
  } catch (directErr) {
    // CORS error atau network error — lanjut ke proxy
    if (signal?.aborted) throw directErr;
  }

  // ── Attempt 2: via server-side proxy (/api/audio-proxy) ────────────────
  // Proxy hanya untuk URL https:// (tidak proxy blob: atau data:)
  if (!url.startsWith('https://')) throw new Error(`Audio fetch gagal: URL tidak bisa di-proxy (bukan https)`);

  const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(url)}`;
  const proxyRes = await fetch(proxyUrl, { signal, mode: 'cors' });
  if (!proxyRes.ok) {
    const errBody = await proxyRes.json().catch(() => ({}));
    throw new Error(`Audio proxy ${proxyRes.status}: ${errBody?.error || proxyRes.statusText}`);
  }
  const blob = await _readStreamToBlob(proxyRes, onProgress, mimeType);
  if (!blob || blob.size < 500) throw new Error('Audio yang diunduh kosong atau rusak');
  return blob;
}

// ── Method 1: Piped (/streams/{videoId}) ─────────────────────────────────────
async function _ytAudioUrlViaPiped(videoId, signal) {
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(buildPipedUrl(base, `/streams/${videoId}`), { signal });
      if (!res.ok) continue;
      const data = await res.json();
      const streams = (data.audioStreams || []).filter(s => s.url && (s.mimeType||'').includes('audio'));
      if (!streams.length) continue;
      streams.sort((a, b) => (b.bitrate||0) - (a.bitrate||0));
      return { url: streams[0].url, mime: streams[0].mimeType || 'audio/mpeg' };
    } catch { continue; }
  }
  return null;
}

// ── Method 2: Invidious (/api/v1/videos/{videoId} → adaptiveFormats) ─────────
async function _ytAudioUrlViaInvidious(videoId, signal) {
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      const url = buildInvidiousUrl(base, `/api/v1/videos/${videoId}`, { fields: 'adaptiveFormats,formatStreams' });
      const res = await fetch(url, { signal });
      if (!res.ok) continue;
      const data = await res.json();
      // adaptiveFormats: audio-only streams
      const adaptive = (data.adaptiveFormats || []).filter(f => f.url && (f.type||'').includes('audio'));
      if (adaptive.length) {
        adaptive.sort((a, b) => (b.bitrate||0) - (a.bitrate||0));
        return { url: adaptive[0].url, mime: adaptive[0].type?.split(';')[0] || 'audio/mpeg' };
      }
      // formatStreams: muxed streams — ambil sebagai last resort
      const muxed = (data.formatStreams || []).filter(f => f.url);
      if (muxed.length) {
        return { url: muxed[muxed.length - 1].url, mime: 'audio/mpeg' };
      }
    } catch { continue; }
  }
  return null;
}

// ── Method 3: Cobalt via /api/cobalt server proxy ────────────────────────────
// Cobalt v10+ sekarang menggunakan Turnstile bot protection di public instances.
// Solusi: proxy lewat server kita (/api/cobalt) → server-to-server tidak kena challenge.
// alwaysProxy:true memastikan cobalt selalu kembalikan tunnel URL (CORS-safe).
async function _ytAudioUrlViaCobalt(videoId, signal) {
  try {
    const origin = (typeof window !== 'undefined' && window.location?.origin) || '';
    const res = await fetch(`${origin}/api/cobalt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        downloadMode: 'audio',
        audioFormat: 'mp3',
        alwaysProxy: true,
      }),
      signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 'error' || data.status === 'rate-limit') return null;
    const url = data.url || data.tunnel || (Array.isArray(data.picker) ? data.picker[0]?.url : null);
    if (!url) return null;
    return { url, mime: 'audio/mpeg' };
  } catch { return null; }
}

// ── Download audio YouTube → simpan ke cache (tanpa backend, Vercel-only)
// Method 1: /api/yt-audio — server-side proxy Piped/Invidious via Vercel
// Method 2: /api/cobalt  — Cobalt proxy via Vercel (fallback)
export async function downloadYtAudio(videoId, onProgress, signal) {
  // Cek cache dulu
  const existing = await ytCacheGet(videoId);
  if (existing && existing.size > 10000) { onProgress && onProgress(100); return; }

  // ── Method 1: /api/yt-audio (Piped/Invidious proxy via Vercel Serverless) ─
  // Server Vercel fetch audio stream dari YT CDN menggunakan kredensial Piped,
  // lalu stream ke browser. Andal untuk video yang tidak diblokir per-IP.
  try {
    const proxyUrl = `/api/yt-audio?videoId=${videoId}`;
    const res = await fetch(proxyUrl, { signal, mode: 'cors' });
    if (res.ok) {
      const blob = await _readStreamToBlob(res, onProgress, 'audio/mpeg');
      if (blob && blob.size > 10000) {
        await ytCachePut(videoId, blob);
        onProgress && onProgress(100);
        return;
      }
    }
  } catch (e) {
    if (signal?.aborted) throw e;
  }

  // ── Method 2: Cobalt (fallback — infrastruktur sendiri, tidak tergantung Piped) ─
  try {
    const cobaltInfo = await _ytAudioUrlViaCobalt(videoId, signal);
    if (cobaltInfo?.url) {
      const blob = await _fetchAudioBlob(cobaltInfo.url, onProgress, signal, cobaltInfo.mime);
      if (blob && blob.size > 10000) {
        await ytCachePut(videoId, blob);
        onProgress && onProgress(100);
        return;
      }
    }
  } catch (e) {
    if (signal?.aborted) throw e;
  }

  throw new Error('Download audio YouTube gagal: /api/yt-audio dan Cobalt tidak tersedia');
}

// ── Unduh file audio ke perangkat (bukan cache browser) — memicu dialog Save As
export async function downloadToDevice(url, filename, headers = {}) {
  const hasCustomHeaders = Object.keys(headers).length > 0;

  // ── Fungsi helper: buat blob URL lalu picu anchor download ───────────────
  const triggerBlobDownload = (blob) => {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  if (!hasCustomHeaders) {
    // ── Attempt 1: fetch langsung dengan CORS ────────────────────────────
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 500) { triggerBlobDownload(blob); return; }
      }
    } catch { /* CORS atau network error — coba proxy */ }

    // ── Attempt 2: server-side proxy (mengatasi CORS) ────────────────────
    if (url.startsWith('https://')) {
      try {
        const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 500) { triggerBlobDownload(blob); return; }
        }
      } catch { /* proxy gagal — fallback ke anchor */ }
    }

    // ── Attempt 3: anchor[download] langsung — hanya berhasil jika same-origin
    //   atau server kirim Content-Disposition: attachment.
    //   Jika cross-origin tanpa header tsb, browser akan REDIRECT/buka tab,
    //   tapi ini adalah last resort terbaik yang tersisa.
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    return;
  }

  // ── Ada custom headers (mis. Drive API): harus lewat fetch ───────────────
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  triggerBlobDownload(blob);
}

// ── Unduh blob yang sudah ada di memori ke perangkat (tanpa fetch ulang)
export function downloadBlobToDevice(blob, filename) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}

// ── Dapatkan URL audio YouTube dari Piped (tanpa simpan ke cache)
// Dapatkan URL audio YT tanpa simpan ke cache — fallback Piped → Invidious → Cobalt
async function getYtAudioUrl(videoId) {
  const methods = [
    () => _ytAudioUrlViaPiped(videoId, null),
    () => _ytAudioUrlViaInvidious(videoId, null),
    () => _ytAudioUrlViaCobalt(videoId, null),
  ];
  for (const method of methods) {
    try {
      const info = await method();
      if (info?.url) return info.url;
    } catch { continue; }
  }
  throw new Error('Semua sumber audio YouTube tidak tersedia');
}

// Tandai file sudah ter-download penuh (simpan size ke localStorage)
export function markFullyCached(driveId, size) {
  try {
    const map = JSON.parse(localStorage.getItem(DRIVE_SIZE_KEY) || '{}');
    map[driveId] = size;
    localStorage.setItem(DRIVE_SIZE_KEY, JSON.stringify(map));
  } catch {}
}

// Cek apakah blob di cache adalah file penuh (bukan parsial)
// Mengembalikan { blob, isFull } — isFull true jika ukuran cocok dengan yang tersimpan
export function checkCachedBlob(driveId, blob) {
  try {
    const map = JSON.parse(localStorage.getItem(DRIVE_SIZE_KEY) || '{}');
    const expectedSize = map[driveId];
    if (!expectedSize) return { blob, isFull: false }; // belum pernah selesai download
    return { blob, isFull: blob.size >= expectedSize * 0.98 }; // toleransi 2%
  } catch {}
  return { blob, isFull: false };
}

// Cari folder "Starry Night Music" (hanya untuk upload — TIDAK membuat otomatis)
async function driveGetFolderId(token) {
  const q = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${DRIVE_FOLDER}' and trashed=false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Folder search error ${res.status}`);
  const data = await res.json();
  return (data.files && data.files.length > 0) ? data.files[0].id : null;
}

// Buat folder "Starry Night Music" jika belum ada (dipanggil saat upload saja)
async function driveEnsureFolder(token) {
  const existing = await driveGetFolderId(token);
  if (existing) return existing;
  const create = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: DRIVE_FOLDER, mimeType: 'application/vnd.google-apps.folder' }),
  });
  if (!create.ok) throw new Error('Gagal membuat folder Drive');
  const folder = await create.json();
  return folder.id;
}

// Ekstensi audio yang valid (untuk filter octet-stream / MIME tidak dikenal)
export const AUDIO_EXTS = ['.mp3','.m4a','.aac','.ogg','.oga','.wav','.flac','.opus','.wma','.aiff','.aif','.webm','.3gp','.3gpp'];
export function isAudioExt(name) {
  const lower = (name||'').toLowerCase();
  return AUDIO_EXTS.some(e => lower.endsWith(e));
}

// MIME type tambahan yang Google Drive kadang assign ke file audio
export const AUDIO_MIME_EXTRAS = new Set([
  'application/octet-stream',
  'application/mpeg',
  'application/mp3',
  'application/x-mp3',
  'application/x-mpeg',
  'application/ogg',
  'application/x-ogg',
  'video/mp4',      // M4A sering mis-MIME sebagai video/mp4
  'video/webm',     // opus/webm audio mis-MIME
]);

// Ambil file audio HANYA dari folder "Starry Night Music" di Google Drive
export async function driveListSongs(token, forceRefresh = false) {
  const now = Date.now();
  // Cache hanya berdasarkan TTL — token berubah saat refresh tapi daftar lagu sama
  if (!forceRefresh && _driveCache.songs && (now - _driveCache.ts) < DRIVE_CACHE_TTL) {
    return _driveCache.songs;
  }

  const fields = 'nextPageToken,files(id,name,mimeType,appProperties,size)';

  // Cari folder "Starry Night Music" dulu
  const folderId = await driveGetFolderId(token);
  if (!folderId) {
    // Folder belum ada — kembalikan array kosong
    _driveCache.token = token;
    _driveCache.songs = [];
    _driveCache.ts    = now;
    return [];
  }

  // Query dibatasi ke folder Starry Night Music saja
  const RAW_Q =
    `'${folderId}' in parents and trashed=false and (` +
      "mimeType contains 'audio/' or " +
      "mimeType = 'video/mp4' or " +
      "mimeType = 'video/webm' or " +
      "mimeType = 'application/octet-stream' or " +
      "mimeType = 'application/mpeg' or " +
      "mimeType = 'application/ogg'" +
    ")";

  const makeUrl = (pt) =>
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(RAW_Q)}` +
    `&fields=${fields}&pageSize=1000&orderBy=name${pt ? '&pageToken=' + pt : ''}`;

  const headers = { Authorization: `Bearer ${token}` };

  let resp;
  try { resp = await fetch(makeUrl(''), { headers }); }
  catch(e) { throw new Error('Koneksi gagal: ' + e.message); }
  if (resp.status === 401 || resp.status === 403) throw new Error(`${resp.status} token expired`);
  if (!resp.ok) throw new Error(`Drive list error ${resp.status}`);

  const firstData = await resp.json();
  let allFiles = [...(firstData.files || [])];

  // Pagination
  let nextToken = firstData.nextPageToken;
  while (nextToken) {
    const page = await fetch(makeUrl(nextToken), { headers });
    if (!page.ok) break;
    const pd = await page.json();
    allFiles = allFiles.concat(pd.files || []);
    nextToken = pd.nextPageToken;
  }

  // Filter: audio/* selalu lolos; MIME lain lolos hanya jika nama file punya ekstensi audio
  const audioFiles = allFiles.filter(f => {
    const mime = f.mimeType || '';
    if (mime.startsWith('audio/')) return true;
    // MIME alternatif (video/mp4, application/mpeg, dll.) — wajib punya ekstensi audio
    if (AUDIO_MIME_EXTRAS.has(mime)) return isAudioExt(f.name);
    return false;
  });

  const songs = audioFiles.map(f => {
    const ap = f.appProperties || {};
    const ci = randItem(SONG_COLORS);
    return {
      id:      `drive_${f.id}`,
      driveId: f.id,
      title:   ap.title  || f.name.replace(/\.[^/.]+$/, ''),
      artist:  ap.artist || 'Google Drive',
      album:   ap.album  || 'Drive',
      cover:   ap.cover  || randItem(COVERS),
      color:   ap.color  || ci.color,
      bg:      ap.bg     || ci.bg,
      mood:    'personal, custom',
      isDrive: true,
      src:     null,
      mimeType: f.mimeType,
    };
  });

  _driveCache.token  = token;
  _driveCache.songs  = songs;
  _driveCache.ts     = now;
  return songs;
}
// Simpan blob ke Cache API (IndexedDB-like, persisten)
async function cachePut(cacheKey, blob) {
  const toStore = await compressAudioBlob(blob).catch(() => blob);
  try {
    const cache = await caches.open(DRIVE_CACHE_NAME);
    await cache.put(`/drive/${cacheKey}`, new Response(toStore, {
      headers: {
        'Content-Type': toStore.type || blob.type,
        ...(toStore !== blob ? { 'x-sn-opus': '1', 'x-sn-orig-size': String(blob.size) } : {}),
      },
    }));
  } catch { /* private browsing atau storage penuh */ }
}

// Ambil blob dari Cache API jika ada
export async function cacheGet(cacheKey) {
  try {
    const cache = await caches.open(DRIVE_CACHE_NAME);
    const res = await cache.match(`/drive/${cacheKey}`);
    if (res) return await res.blob();
  } catch {}
  return null;
}

// Tebak mime type dari Content-Type header
export function guessMime(contentType) {
  if (!contentType) return 'audio/mpeg';
  if (contentType.includes('ogg')) return 'audio/ogg';
  if (contentType.includes('wav')) return 'audio/wav';
  if (contentType.includes('mp4') || contentType.includes('m4a') || contentType.includes('aac')) return 'audio/mp4';
  if (contentType.includes('flac')) return 'audio/flac';
  if (contentType.includes('webm')) return 'audio/webm';
  return 'audio/mpeg';
}

// Streaming via MediaSource API — audio mulai diputar segera tanpa tunggu download selesai.
// Fallback ke blob biasa jika MediaSource tidak support mime atau response body tidak tersedia.
export async function driveStreamBlob(driveId, token) {
  // Cache key: driveId saja (token bisa expired, tapi file-nya sama)
  const cacheKey = driveId;
  const memKey = driveId;

  // 1. Cek in-memory cache (paling cepat)
  if (_blobCache.has(memKey)) return _blobCache.get(memKey);

  // 2. Cek Cache API (persisten antar refresh) — langsung bisa diputar tanpa download ulang
  const cachedBlob = await cacheGet(cacheKey);
  if (cachedBlob) {
    const url = URL.createObjectURL(cachedBlob);
    _blobCache.set(memKey, url);
    return url;
  }

  // 3. Fetch dari Google Drive
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&acknowledgeAbuse=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 401 || res.status === 403) throw new Error(`${res.status}`);
  if (!res.ok) throw new Error(`Drive ${res.status}`);

  const contentType = res.headers.get('Content-Type') || '';
  const mime = guessMime(contentType);

  const cleanup = () => {
    for (const [k, v] of _blobCache) {
      if (k.startsWith(driveId + ':') && k !== memKey) { URL.revokeObjectURL(v); _blobCache.delete(k); }
    }
  };

  // 4. Gunakan MediaSource streaming — audio langsung bisa diputar tanpa tunggu download selesai
  if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(mime) && res.body) {
    const ms  = new MediaSource();
    const url = URL.createObjectURL(ms);
    cleanup();
    _blobCache.set(memKey, url);

    ms.addEventListener('sourceopen', async () => {
      try {
        const sb = ms.addSourceBuffer(mime);
        const reader = res.body.getReader();
        const chunks = [];
        const waitUpdate = () => new Promise(r => sb.addEventListener('updateend', r, { once: true }));

        // FIX BUG 1+2: evict bagian buffer yang sudah dilewati untuk mencegah QuotaExceededError.
        // Browser membatasi total SourceBuffer ~12-150MB. Tanpa eviction, appendBuffer()
        // melempar QuotaExceededError saat file besar → pump crash → audio stuck.
        // Solusi: hapus data 0 s/d (currentTime - 30s) setiap kali buffer tumbuh besar.
        const getAudioEl = () => {
          // Cari audio element yang sedang pakai URL MediaSource ini
          const allAudio = document.querySelectorAll('audio');
          for (const el of allAudio) { if (el.src === url) return el; }
          return null;
        };
        const evictOldBuffer = async () => {
          if (sb.updating || ms.readyState !== 'open') return;
          const audio = getAudioEl();
          if (!audio || sb.buffered.length === 0) return;
          const currentTime = audio.currentTime;
          const evictTo = currentTime - 30; // jaga 30 detik ke belakang
          if (evictTo > 0 && sb.buffered.start(0) < evictTo) {
            try {
              sb.remove(0, evictTo);
              await waitUpdate();
            } catch(_) { /* ignore */ }
          }
        };

        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            if (ms.readyState === 'open' && !sb.updating) ms.endOfStream();
            else if (ms.readyState === 'open') { await waitUpdate(); if (ms.readyState === 'open') ms.endOfStream(); }
            const fullBlob = new Blob(chunks, { type: mime });
            markFullyCached(driveId, fullBlob.size);
            cachePut(cacheKey, fullBlob);
            return;
          }
          chunks.push(value);
          if (sb.updating) await waitUpdate();
          if (ms.readyState !== 'open') return;

          // FIX BUG 1: coba appendBuffer, tangkap QuotaExceededError dengan eviction
          try {
            sb.appendBuffer(value);
            await waitUpdate();
          } catch(qe) {
            if (qe.name === 'QuotaExceededError') {
              // Evict dulu, lalu coba append ulang
              await evictOldBuffer();
              if (ms.readyState === 'open' && !sb.updating) {
                try { sb.appendBuffer(value); await waitUpdate(); } catch(_) { return; }
              }
            } else { throw qe; }
          }

          // Evict preventif setiap beberapa chunk agar tidak sampai QuotaExceeded
          if (chunks.length % 20 === 0) await evictOldBuffer();

          if (ms.readyState === 'open') await pump();
        };
        await pump();
      } catch(e) { if (e?.name !== 'AbortError') console.warn('[DriveBlob] stream error:', e?.message); }
    }, { once: true });
    return url;
  }

  // 5. Fallback: download seluruh blob (format tidak didukung MediaSource)
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  cleanup();
  _blobCache.set(memKey, url);
  markFullyCached(driveId, blob.size);
  cachePut(cacheKey, blob); // simpan ke Cache API
  return url;
}

// ── Mode Lite: stream Drive tanpa download penuh & tanpa simpan ke cache.
// Hanya buffer ~30 detik ke depan, lanjut fetch saat buffer menipis.
// Hemat data + hemat storage. AbortController dikirim agar bisa dibatalkan saat skip.
export const _liteAbortMap = new Map(); // driveId → AbortController
export async function driveStreamLite(driveId, token, audioElRef) {
  const memKey = `${driveId}:lite`;

  // 1. In-memory URL dari sesi ini (MediaSource URL yang sudah dibuat)
  if (_blobCache.has(memKey)) return _blobCache.get(memKey);

  // Lite: tidak cek Cache API — selalu stream adaptif, tidak pakai blob full dari cache Pro
  for (const [id, ctrl] of _liteAbortMap) { if (id !== driveId) { ctrl.abort(); _liteAbortMap.delete(id); } }
  const abortCtrl = new AbortController();
  _liteAbortMap.set(driveId, abortCtrl);

  // 4. Fetch stream dari Drive
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&acknowledgeAbuse=true`,
    { headers: { Authorization: `Bearer ${token}` }, signal: abortCtrl.signal }
  );
  if (res.status === 401 || res.status === 403) throw new Error(`${res.status}`);
  if (!res.ok) throw new Error(`Drive ${res.status}`);

  const contentType = res.headers.get('Content-Type') || '';
  const mime = guessMime(contentType);

  // Bersihkan URL lama untuk driveId ini
  for (const [k, v] of _blobCache) {
    if (k.startsWith(driveId + ':') && k !== memKey) { URL.revokeObjectURL(v); _blobCache.delete(k); }
  }

  // 5. MediaSource adaptive buffering — hanya buffer AHEAD_SEC detik ke depan
  if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(mime) && res.body) {
    const AHEAD_SEC  = 30; // detik buffer ke depan
    const PAUSE_SEC  = 20; // lanjut fetch kalau buffer < ini
    const ms  = new MediaSource();
    const url = URL.createObjectURL(ms);
    _blobCache.set(memKey, url);

    ms.addEventListener('sourceopen', async () => {
      try {
        const sb     = res.status !== -1 ? ms.addSourceBuffer(mime) : null;
        if (!sb) return;
        const reader = res.body.getReader();
        const waitUpdate = () => new Promise(r => sb.addEventListener('updateend', r, { once: true }));
        let paused = false;

        const getAudio = () => audioElRef && audioElRef.current;

        const pump = async () => {
          if (abortCtrl.signal.aborted) { reader.cancel(); if (ms.readyState === 'open') ms.endOfStream(); return; }

          // Adaptive: pause baca jika sudah buffer cukup ke depan
          const audio = getAudio();
          if (audio && sb.buffered.length > 0) {
            const bufferedEnd = sb.buffered.end(sb.buffered.length - 1);
            const ahead = bufferedEnd - audio.currentTime;
            if (ahead > AHEAD_SEC && !paused) {
              paused = true;
              const resume = () => {
                if (abortCtrl.signal.aborted) return;
                const a2 = getAudio();
                // FIX DRIVE STUCK: resume kondisi lebih longgar.
                // Sebelumnya: currentTime >= bufferedEnd - PAUSE_SEC (PAUSE_SEC=20).
                // Masalah: jika buffer kecil atau audio belum lama diputar, kondisi ini
                // tidak pernah terpenuhi → fetch tidak resume → audio stuck menunggu buffer.
                // Fix: gunakan AHEAD_SEC/2 (15s) sebagai threshold resume, bukan PAUSE_SEC (20s).
                // Juga tambah fallback: jika buffer tinggal < 8s ke depan, SELALU resume.
                const ahead2 = a2 ? (bufferedEnd - a2.currentTime) : 0;
                if (!a2 || ahead2 < AHEAD_SEC / 2 || ahead2 < 8) {
                  paused = false;
                  pump();
                } else {
                  setTimeout(resume, 1000); // cek lebih sering (1s bukan 1.5s)
                }
              };
              setTimeout(resume, 1000);
              return;
            }
          }

          const { done, value } = await reader.read();
          if (done) {
            if (ms.readyState === 'open') ms.endOfStream();
            // Lite: TIDAK simpan ke Cache API — hemat storage
            return;
          }
          if (sb.updating) await waitUpdate();
          if (ms.readyState !== 'open') return;

          // FIX BUG 1 (Lite): tangkap QuotaExceededError dengan eviction
          try {
            sb.appendBuffer(value);
            await waitUpdate();
          } catch(qe) {
            if (qe.name === 'QuotaExceededError') {
              // Evict buffer lama dulu
              const audio2 = getAudio();
              if (audio2 && sb.buffered.length > 0 && ms.readyState === 'open' && !sb.updating) {
                const evictTo = audio2.currentTime - 15;
                if (evictTo > 0 && sb.buffered.start(0) < evictTo) {
                  try { sb.remove(0, evictTo); await waitUpdate(); } catch(_) {}
                }
              }
              if (ms.readyState === 'open' && !sb.updating) {
                try { sb.appendBuffer(value); await waitUpdate(); } catch(_) { return; }
              }
            } else { throw qe; }
          }

          await pump();
        };
        await pump();
      } catch(e) {
        if (e.name !== 'AbortError') { /* stream closed / tab navigated */ }
      }
    }, { once: true });
    return url;
  }

  // 6. Fallback blob (MediaSource tidak tersedia) — Lite: tidak simpan ke cache
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  _blobCache.set(memKey, url);
  // Lite: tidak cachePut — hemat storage
  return url;
}

// Download full blob — Pro mode: stream langsung bisa diputar, progress nyata, simpan cache saat selesai
// onProgress(pct 0-100) dipanggil selama download, onComplete() dipanggil saat blob penuh tersimpan
// forceDownload: skip cache check (dipakai saat melanjutkan cache parsial)
export async function driveDownloadBlob(driveId, token, onProgress, onComplete, forceDownload = false) {
  const cacheKey = driveId;
  const memKey = driveId;

  if (!forceDownload && _blobCache.has(memKey)) {
    onProgress && onProgress(100); onComplete && onComplete();
    return _blobCache.get(memKey);
  }

  if (!forceDownload) {
    const cachedBlob = await cacheGet(cacheKey);
    if (cachedBlob) {
      const { isFull } = checkCachedBlob(driveId, cachedBlob);
      if (isFull) {
        const url = URL.createObjectURL(cachedBlob);
        _blobCache.set(memKey, url);
        onProgress && onProgress(100); onComplete && onComplete();
        return url;
      }
      // Parsial — lanjut download ulang dari awal (tidak ada range request di Drive API publik)
    }
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&acknowledgeAbuse=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 401 || res.status === 403) throw new Error(`${res.status}`);
  if (!res.ok) throw new Error(`Drive ${res.status}`);

  const contentType = res.headers.get('Content-Type') || '';
  const mime = guessMime(contentType);
  const total = parseInt(res.headers.get('Content-Length') || '0', 10);

  // Jangan revoke URL lain untuk driveId ini — bisa saja masih aktif diputar (dari driveStreamBlob)
  // Hanya bersihkan setelah download selesai & blob baru siap

  // Gunakan MediaSource agar audio langsung bisa diputar sambil download berlangsung
  if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(mime) && res.body) {
    const ms  = new MediaSource();
    const url = URL.createObjectURL(ms);
    _blobCache.set(memKey, url);

    ms.addEventListener('sourceopen', async () => {
      try {
        const sb = ms.addSourceBuffer(mime);
        const reader = res.body.getReader();
        const chunks = [];
        let loaded = 0;
        const waitUpdate = () => new Promise(r => sb.addEventListener('updateend', r, { once: true }));
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            if (ms.readyState === 'open') ms.endOfStream();
            const fullBlob = new Blob(chunks, { type: mime });
            markFullyCached(driveId, fullBlob.size);
            await cachePut(cacheKey, fullBlob);
            onProgress && onProgress(100);
            onComplete && onComplete();
            return;
          }
          chunks.push(value);
          loaded += value.byteLength;
          if (total > 0) onProgress && onProgress(Math.min(99, Math.round(loaded / total * 100)));
          if (sb.updating) await waitUpdate();
          if (ms.readyState === 'open') { sb.appendBuffer(value); await waitUpdate(); }
          await pump();
        };
        await pump();
      } catch(e) { if (e.name !== 'AbortError') console.warn('driveDownloadBlob stream error', e); }
    }, { once: true });
    return url;
  }

  // Fallback: baca stream manual jika MediaSource tidak tersedia
  if (res.body) {
    const reader = res.body.getReader();
    const chunks = []; let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); loaded += value.byteLength;
      if (total > 0) onProgress && onProgress(Math.min(99, Math.round(loaded / total * 100)));
    }
    const blob = new Blob(chunks, { type: mime });
    const url  = URL.createObjectURL(blob);
    _blobCache.set(memKey, url);
    markFullyCached(driveId, blob.size);
    await cachePut(cacheKey, blob);
    onProgress && onProgress(100); onComplete && onComplete();
    return url;
  }

  // Last resort
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  _blobCache.set(memKey, url);
  markFullyCached(driveId, blob.size);
  await cachePut(cacheKey, blob);
  onProgress && onProgress(100); onComplete && onComplete();
  return url;
}

// Pre-fetch lagu berikutnya di background agar instant saat diklik
export async function drivePrefetch(driveId, token) {
  if (!driveId || !token || _blobCache.has(driveId)) return;
  try { await driveStreamBlob(driveId, token); } catch { /* silent fail */ }
}
// ── Playlist Cloud Sync ─────────────────────────────────────────────────────
// Simpan/load sn_playlists.json di folder "Starry Night Music" di Google Drive.

const PLAYLIST_FILENAME = 'sn_playlists.json';

async function driveSearchPlaylistFile(token, folderId) {
  const q = encodeURIComponent(`name='${PLAYLIST_FILENAME}' and '${folderId}' in parents and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&pageSize=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Drive search error ${res.status}`);
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

/** Simpan array playlists ke Drive. Buat file baru jika belum ada, update jika sudah ada. */
export async function driveSavePlaylists(token, playlists) {
  const folderId = await driveEnsureFolder(token);
  const existing = await driveSearchPlaylistFile(token, folderId);
  const content = JSON.stringify({ version: 1, savedAt: new Date().toISOString(), playlists });
  const blob = new Blob([content], { type: 'application/json' });
  const form = new FormData();

  if (existing) {
    // Update file yang ada (PATCH)
    form.append('metadata', new Blob([JSON.stringify({})], { type: 'application/json' }));
    form.append('file', blob);
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart`,
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: form }
    );
    if (!res.ok) throw new Error(`Playlist save failed ${res.status}`);
    return await res.json();
  } else {
    // Buat file baru (POST)
    form.append('metadata', new Blob([JSON.stringify({
      name: PLAYLIST_FILENAME,
      parents: [folderId],
      mimeType: 'application/json',
    })], { type: 'application/json' }));
    form.append('file', blob);
    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }
    );
    if (!res.ok) throw new Error(`Playlist create failed ${res.status}`);
    return await res.json();
  }
}

/** Load playlists dari Drive. Return null jika file tidak ditemukan. */
export async function driveLoadPlaylists(token) {
  // Cari di folder Starry Night Music dulu
  let fileId = null;
  try {
    const folderId = await driveGetFolderId(token);
    if (folderId) {
      const file = await driveSearchPlaylistFile(token, folderId);
      if (file) fileId = file.id;
    }
  } catch {}

  // Fallback: cari di seluruh Drive yang accessible
  if (!fileId) {
    try {
      const q = encodeURIComponent(`name='${PLAYLIST_FILENAME}' and trashed=false`);
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.files && data.files.length > 0) fileId = data.files[0].id;
      }
    } catch {}
  }

  if (!fileId) return null; // Belum pernah sync

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Playlist load failed ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.playlists) ? data.playlists : null;
}

// ── Simpan/load sn_songs.json di folder "Starry Night Music" di Google Drive.
// Menyimpan favSongs (lagu di-like dari SC/Spotify/Radio) dan ytSongs (lagu YouTube yang disimpan).
// Field `src` dan blob URL di-strip sebelum disimpan — hanya metadata yang perlu persist.

const SONGS_FILENAME = 'sn_songs.json';

async function driveSearchSongsFile(token, folderId) {
  const q = encodeURIComponent(`name='${SONGS_FILENAME}' and '${folderId}' in parents and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&pageSize=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Drive search songs error ${res.status}`);
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

/** Simpan favSongs + ytSongs ke Drive. Strip field `src` (blob URL tidak persist antar sesi). */
export async function driveSaveSongs(token, { favSongs = [], ytSongs = [] }) {
  const folderId = await driveEnsureFolder(token);
  const existing = await driveSearchSongsFile(token, folderId);

  // Strip src (blob URL) agar tidak tersimpan ke cloud — akan dibuat ulang saat streaming
  const strip = (s) => { const { src: _src, ...rest } = s; return rest; };
  const content = JSON.stringify({
    version: 1,
    savedAt: new Date().toISOString(),
    favSongs: favSongs.map(strip),
    ytSongs:  ytSongs.map(strip),
  });
  const blob = new Blob([content], { type: 'application/json' });
  const form = new FormData();

  if (existing) {
    form.append('metadata', new Blob([JSON.stringify({})], { type: 'application/json' }));
    form.append('file', blob);
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart`,
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: form }
    );
    if (!res.ok) throw new Error(`Songs save failed ${res.status}`);
    return await res.json();
  } else {
    form.append('metadata', new Blob([JSON.stringify({
      name: SONGS_FILENAME,
      parents: [folderId],
      mimeType: 'application/json',
    })], { type: 'application/json' }));
    form.append('file', blob);
    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }
    );
    if (!res.ok) throw new Error(`Songs create failed ${res.status}`);
    return await res.json();
  }
}

/** Load favSongs + ytSongs dari Drive. Return null jika file belum ada. */
export async function driveLoadSongs(token) {
  let fileId = null;
  try {
    const folderId = await driveGetFolderId(token);
    if (folderId) {
      const file = await driveSearchSongsFile(token, folderId);
      if (file) fileId = file.id;
    }
  } catch {}

  if (!fileId) {
    try {
      const q = encodeURIComponent(`name='${SONGS_FILENAME}' and trashed=false`);
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.files && data.files.length > 0) fileId = data.files[0].id;
      }
    } catch {}
  }

  if (!fileId) return null;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Songs load failed ${res.status}`);
  const data = await res.json();
  return {
    favSongs: Array.isArray(data.favSongs) ? data.favSongs : [],
    ytSongs:  Array.isArray(data.ytSongs)  ? data.ytSongs  : [],
  };
}

export async function driveUploadSong(file, meta, token) {
  const folderId=await driveEnsureFolder(token), ci=randItem(SONG_COLORS), cover=randItem(COVERS);
  const metadata={ name:file.name, parents:[folderId], appProperties:{ title:meta.title||file.name.replace(/\.[^/.]+$/,''), artist:meta.artist||'Unknown', album:meta.album||'My Songs', cover, color:ci.color, bg:ci.bg } };
  const form=new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)],{type:'application/json'}));
  form.append('file', file);
  const res=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,appProperties',{ method:'POST', headers:{ Authorization:`Bearer ${token}` }, body:form });
  if (!res.ok) { const e=await res.json(); throw new Error(e.error?.message||'Upload failed'); }
  const fd=await res.json();
  return { id:`drive_${fd.id}`, driveId:fd.id, title:metadata.appProperties.title, artist:metadata.appProperties.artist, album:metadata.appProperties.album, cover, color:ci.color, bg:ci.bg, mood:'personal, custom', isDrive:true, src:URL.createObjectURL(file) };
}

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
export const fmt = t => { if (!t||isNaN(t)) return '0:00'; return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`; };
export const fmtSec = s => { const m=Math.floor(s/60), sec=s%60; return `${m}:${String(sec).padStart(2,'0')}`; };



// ══════════════════════════════════════════════
//  DEVICE DETECTION
// ══════════════════════════════════════════════
export function isPhoneDevice() {
  const ua = navigator.userAgent;
  const isMobileUA = /android|iphone|ipod|blackberry|windows phone/i.test(ua);
  const isTabletUA = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
  const smallScreen = Math.min(window.screen.width, window.screen.height) < 500;
  return (isMobileUA && !isTabletUA) || smallScreen;
}

export const btn = { background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 8, display: 'flex', borderRadius: 8 };
