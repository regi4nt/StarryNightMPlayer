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
//  STREAMING PLATFORMS — search & redirect ke platform
// ═══════════════════════════════════════════════════════
const STREAMING_PLATFORMS = [
  {
    id: 'ytmusic',
    name: 'YouTube Music',
    icon: '🔴',
    embedType: 'youtube',   // in-app embed via YouTube iframe
    description: 'Cari & putar langsung dalam app via YouTube',
    color: '#FF0000',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/240px-Youtube_Music_icon.svg.png',
    searchUrl: (q) => `https://music.youtube.com/search?q=${encodeURIComponent(q)}`,
    openUrl: 'https://music.youtube.com',
    hint: 'Cari judul lagu, artis, album…',
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    icon: '🟠',
    embedType: 'soundcloud', // in-app embed via SoundCloud widget
    description: 'Cari & putar track SoundCloud dalam app',
    color: '#ff5500',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Antu_soundcloud.svg/240px-Antu_soundcloud.svg.png',
    searchUrl: (q) => `https://soundcloud.com/search?q=${encodeURIComponent(q)}`,
    openUrl: 'https://soundcloud.com',
    hint: 'Cari track, artis, genre…',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🟢',
    embedType: 'redirect',   // open in browser (API key needed for embed)
    description: 'Buka pencarian di Spotify (perlu app/browser)',
    color: '#1DB954',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/168px-Spotify_logo_without_text.svg.png',
    searchUrl: (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`,
    openUrl: 'https://open.spotify.com',
    hint: 'Cari lagu, artis, album…',
  },
  {
    id: 'applemusic',
    name: 'Apple Music',
    icon: '🎵',
    embedType: 'redirect',   // open in browser
    description: 'Buka pencarian di Apple Music',
    color: '#fc3c44',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/240px-Apple_Music_icon.svg.png',
    searchUrl: (q) => `https://music.apple.com/search?term=${encodeURIComponent(q)}`,
    openUrl: 'https://music.apple.com',
    hint: 'Cari lagu, artis, album…',
  },
];

// ── Tetap ada MUSIC_SOURCES kosong agar kode lain tidak error
const MUSIC_SOURCES = [];

// ── Placeholder supaya SONGS tetap ada
const _PLACEHOLDER_SONGS = [
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
const SONGS = [
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

// Helper: semua lagu dari semua sumber yang sudah di-load
// ═══════════════════════════════════════════════════════
//  GOOGLE DRIVE
// ═══════════════════════════════════════════════════════
const GOOGLE_CLIENT_ID = '1028346781018-vbeafem60jrt8ctu1k1q07pfk41ejlnn.apps.googleusercontent.com';
const GOOGLE_SCOPES    = 'https://www.googleapis.com/auth/drive.readonly profile email';
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
//  AI — Multi-provider: OpenRouter, Gemini, Groq
// ═══════════════════════════════════════════════════════

// ── Provider definitions
const PROVIDERS = [
  // OpenRouter — beberapa key & model gratis sebagai slot
  ...([
    import.meta.env.VITE_OPENROUTER_KEY_1,
    import.meta.env.VITE_OPENROUTER_KEY_2,
    import.meta.env.VITE_OPENROUTER_KEY_3,
  ].filter(k => k && k.length > 10).flatMap(k => [
    { provider:'OpenRouter', key:k, model:'deepseek/deepseek-chat-v3-0324:free',      endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true,  extra:{ 'HTTP-Referer':window.location.origin,'X-Title':'Starry Night' } },
    { provider:'OpenRouter', key:k, model:'meta-llama/llama-4-maverick:free',          endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true,  extra:{ 'HTTP-Referer':window.location.origin,'X-Title':'Starry Night' } },
    { provider:'OpenRouter', key:k, model:'qwen/qwen3-235b-a22b:free',                endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true,  extra:{ 'HTTP-Referer':window.location.origin,'X-Title':'Starry Night' } },
    { provider:'OpenRouter', key:k, model:'google/gemma-3-12b-it:free',               endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true,  extra:{ 'HTTP-Referer':window.location.origin,'X-Title':'Starry Night' } },
    { provider:'OpenRouter', key:k, model:'meta-llama/llama-3.3-70b-instruct:free',   endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true,  extra:{ 'HTTP-Referer':window.location.origin,'X-Title':'Starry Night' } },
  ])),
  // Google Gemini — format OpenAI-compatible via AI Studio
  ...([
    import.meta.env.VITE_GEMINI_KEY_1,
    import.meta.env.VITE_GEMINI_KEY_2,
  ].filter(k => k && k.length > 10).flatMap(k => [
    { provider:'Gemini', key:k, model:'gemini-2.0-flash', endpoint:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', isOpenAI:true, extra:{} },
    { provider:'Gemini', key:k, model:'gemini-1.5-flash', endpoint:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', isOpenAI:true, extra:{} },
  ])),
  // Groq — sangat cepat, format OpenAI-compatible
  ...([
    import.meta.env.VITE_GROQ_KEY_1,
    import.meta.env.VITE_GROQ_KEY_2,
  ].filter(k => k && k.length > 10).flatMap(k => [
    { provider:'Groq', key:k, model:'llama-3.3-70b-versatile', endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
    { provider:'Groq', key:k, model:'gemma2-9b-it',            endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
    { provider:'Groq', key:k, model:'llama3-8b-8192',          endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
  ])),
];

let slotIdx = 0;

async function askAI(user, system='', tries=0) {
  if (!PROVIDERS.length) return '⚠️ Belum ada API key. Isi di Vercel Environment Variables.';
  if (tries >= PROVIDERS.length) { slotIdx = 0; return 'Semua provider sibuk, coba lagi nanti.'; }
  const slot = PROVIDERS[slotIdx % PROVIDERS.length];
  try {
    const res = await fetch(slot.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${slot.key}`,
        ...slot.extra,
      },
      body: JSON.stringify({
        model: slot.model,
        max_tokens: 500,
        messages: [
          ...(system ? [{ role:'system', content:system }] : []),
          { role:'user', content:user },
        ],
      }),
    });
    const data = await res.json();
    if (res.status === 429 || res.status === 503 || res.status === 401 || data.error) {
      slotIdx = (slotIdx + 1) % PROVIDERS.length;
      return askAI(user, system, tries + 1);
    }
    const txt = data.choices?.[0]?.message?.content;
    if (!txt) { slotIdx = (slotIdx + 1) % PROVIDERS.length; return askAI(user, system, tries + 1); }
    return txt.trim();
  } catch {
    slotIdx = (slotIdx + 1) % PROVIDERS.length;
    return askAI(user, system, tries + 1);
  }
}

const activeModel = () => {
  if (!PROVIDERS.length) return 'no-key';
  const s = PROVIDERS[slotIdx % PROVIDERS.length];
  return `${s.provider}·${s.model.split('/').pop()?.replace(':free','') || s.model}`;
};
const hasKey = () => PROVIDERS.length > 0;

// ═══════════════════════════════════════════════════════
//  GOOGLE DRIVE HELPERS
// ═══════════════════════════════════════════════════════
// Cache list Drive agar tidak re-fetch setiap login
const _driveCache = { token: null, songs: null, ts: 0 };
const DRIVE_CACHE_TTL = 5 * 60 * 1000; // 5 menit

// Cari atau buat folder "Starry Night Music" di Drive
async function driveGetFolderId(token) {
  const q = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${DRIVE_FOLDER}' and trashed=false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Folder search error ${res.status}`);
  const data = await res.json();
  if (data.files && data.files.length > 0) return data.files[0].id;
  // Folder belum ada — buat baru
  const create = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: DRIVE_FOLDER, mimeType: 'application/vnd.google-apps.folder' }),
  });
  if (!create.ok) throw new Error('Gagal membuat folder Drive');
  const folder = await create.json();
  return folder.id;
}

// Ambil semua file audio di folder "Starry Night Music" dengan pagination + cache
async function driveListSongs(token, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _driveCache.token === token && _driveCache.songs
      && (now - _driveCache.ts) < DRIVE_CACHE_TTL) {
    return _driveCache.songs;
  }
  // Cari folder dulu
  let folderId;
  try { folderId = await driveGetFolderId(token); }
  catch(e) { throw new Error('Gagal cari folder: ' + e.message); }

  const fields = 'nextPageToken,files(id,name,mimeType,appProperties,size)';
  const makeUrl = (pt) => {
    const q = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'audio/' and trashed=false`);
    return `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=1000&orderBy=name${pt?'&pageToken='+pt:''}`;
  };
  const headers = { Authorization: `Bearer ${token}` };
  const first = await fetch(makeUrl(''), { headers });
  if (!first.ok) throw new Error(`Drive list error ${first.status}`);
  const firstData = await first.json();
  let allFiles = [...(firstData.files || [])];
  if (firstData.nextPageToken) {
    let tokens = [firstData.nextPageToken];
    while (tokens.length) {
      const pages = await Promise.all(
        tokens.map(pt => fetch(makeUrl(pt), { headers }).then(r => r.json()))
      );
      tokens = [];
      pages.forEach(p => {
        allFiles = allFiles.concat(p.files || []);
        if (p.nextPageToken) tokens.push(p.nextPageToken);
      });
    }
  }
  const songs = allFiles.map(f => {
    const ap  = f.appProperties || {};
    const ci  = randItem(SONG_COLORS);
    return {
      id:     `drive_${f.id}`,
      driveId: f.id,
      title:  ap.title  || f.name.replace(/\.[^/.]+$/, ''),
      artist: ap.artist || 'Unknown',
      album:  ap.album  || 'Google Drive',
      cover:  ap.cover  || randItem(COVERS),
      color:  ap.color  || ci.color,
      bg:     ap.bg     || ci.bg,
      mood:   'personal, custom',
      isDrive: true,
      src: null,
    };
  });
  _driveCache.token   = token;
  _driveCache.songs   = songs;
  _driveCache.ts      = now;
  _driveCache.folderId = folderId;
  return songs;
}
// Stream langsung pakai URL (tidak perlu download blob dulu — jauh lebih cepat)
// Cache blob URLs agar tidak download ulang lagu yang sama
const _blobCache = new Map();

async function driveStreamBlob(driveId, token) {
  if (_blobCache.has(driveId)) return _blobCache.get(driveId);
  // Fetch dengan streaming — tidak tunggu seluruh file
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&acknowledgeAbuse=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Drive ${res.status}`);
  // Buat blob dari stream agar audio bisa langsung mulai
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  _blobCache.set(driveId, url);
  return url;
}

// Pre-fetch lagu berikutnya di background agar instant saat diklik
async function drivePrefetch(driveId, token) {
  if (!driveId || _blobCache.has(driveId)) return;
  try { await driveStreamBlob(driveId, token); } catch { /* silent fail */ }
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
function PlaylistModal({ onClose, onSave, allSongs, existing, isLite }) {
  const isEdit = !!existing;
  const [name, setName] = useState(existing?.name || '');
  const [selected, setSelected] = useState(new Set(existing?.songIds || []));

  const toggle = id => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', ...(isLite ? {} : { backdropFilter:'blur(8px)' }), display:'flex', alignItems:'flex-end', animation:'fadeUp 0.25s ease' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
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
function OrbitalRing({ size, pct, color, progress, duration, isPlaying, cover, title, onSeek, isLite }) {
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
      <div style={{ position:'absolute', top:cy-artR, left:cx-artR, width:artR*2, height:artR*2, borderRadius:'50%', overflow:'hidden', border:'3px solid rgba(255,255,255,0.13)', boxShadow:`0 0 40px -8px ${color}90`, animation:(!isLite && isPlaying)?'spin20 20s linear infinite':'none', zIndex:2 }}>
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
function SettingsPanel({ onClose, color, eqEnabled, setEqEnabled, eqPreset, setEqPreset, eqGains, setEqGains, crossfade, setCrossfade, sleepTimer, startSleepTimer, cancelSleepTimer, globalCover, setGlobalCover, isLite, dataSaver, toggleDataSaver, pwaPrompt, pwaInstalled, installPwa }) {
  const coverRef = useRef(null);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', ...(isLite ? {} : { backdropFilter:'blur(8px)' }), display:'flex', alignItems:'flex-end', animation:'fadeUp 0.25s ease' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
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

        {/* ── HEMAT DATA */}
        <div style={{ marginTop:28 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>🌿</span>
              <div>
                <div style={{ fontWeight:800, fontSize:14 }}>Hemat Data</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Nonaktifkan cover, AI, dan buffer audio</div>
              </div>
            </div>
            <div onClick={toggleDataSaver} style={{ width:44, height:24, borderRadius:999, background:dataSaver?'#10b981':'rgba(255,255,255,0.1)', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:3, left:dataSaver?22:3, width:18, height:18, borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
            </div>
          </div>
          {dataSaver && (
            <div style={{ borderRadius:12, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', padding:'10px 14px', display:'flex', flexDirection:'column', gap:5 }}>
              {[
                ['🚫 Cover art', 'Gambar album tidak dimuat dari internet'],
                ['🚫 Buffer audio', 'Audio hanya dimuat saat diputar (preload: none)'],
                ['🚫 Prefetch Drive', 'Lagu Drive tidak di-cache sebelum diputar'],
                ['🚫 AI & Insight', 'Starry AI, Vibe Search, dan Insight dinonaktifkan'],
              ].map(([icon, desc])=>(
                <div key={icon} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:11 }}>{icon}</span>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>{desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── INSTALL APP (PWA) */}
        <div style={{ marginTop:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:16 }}>📲</span>
            <div>
              <div style={{ fontWeight:800, fontSize:14 }}>Install Sebagai App</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Desktop & Mobile — tanpa toko aplikasi</div>
            </div>
          </div>
          {pwaInstalled ? (
            <div style={{ padding:'10px 14px', borderRadius:12, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:20 }}>✅</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#a5b4fc' }}>Sudah terinstall!</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>Buka dari layar utama atau app launcher</div>
              </div>
            </div>
          ) : pwaPrompt ? (
            <button onClick={installPwa} style={{ width:'100%', padding:'12px 0', borderRadius:14, border:'none', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:13, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>📲</span>Install Sekarang
            </button>
          ) : (
            <div style={{ padding:'10px 14px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>Cara install manual:</div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[
                  ['📱 Chrome Android', 'Menu ⋮ → Tambahkan ke Layar Utama'],
                  ['🍎 Safari iOS', 'Tap 🔗 → Tambahkan ke Layar Utama'],
                  ['🖥️ Chrome Desktop', 'Klik ikon ⬇️ di address bar'],
                  ['🖥️ Edge Desktop', 'Klik ikon ... → Apps → Install'],
                ].map(([platform, step]) => (
                  <div key={platform} style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>
                    <span style={{ color:'rgba(255,255,255,0.65)' }}>{platform}:</span> {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── FOTO COVER GLOBAL */}
        <div style={{ marginTop:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <Music size={16} style={{ color }}/>
            <span style={{ fontWeight:800, fontSize:14 }}>Foto Cover Semua Lagu</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Preview */}
            <div style={{ width:64, height:64, borderRadius:14, overflow:'hidden', background:'rgba(255,255,255,0.06)', border:`1px solid ${globalCover?color:'rgba(255,255,255,0.12)'}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {globalCover
                ? <img src={globalCover} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="cover"/>
                : <Music size={22} style={{ color:'rgba(255,255,255,0.2)' }}/>}
            </div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
              <input ref={coverRef} type="file" accept="image/*" style={{ display:'none' }}
                onChange={e => {
                  const f = e.target.files[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = ev => {
                    const dataUrl = ev.target.result;
                    setGlobalCover(dataUrl);
                    localStorage.setItem('sn_global_cover', dataUrl);
                  };
                  reader.readAsDataURL(f);
                }}
              />
              <button onClick={() => coverRef.current?.click()}
                style={{ padding:'9px 14px', borderRadius:12, border:`1px solid ${color}50`, background:`${color}15`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                {globalCover ? 'Ganti Foto' : 'Pilih Foto'}
              </button>
              {globalCover && (
                <button onClick={() => { setGlobalCover(''); localStorage.removeItem('sn_global_cover'); }}
                  style={{ padding:'9px 14px', borderRadius:12, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#fca5a5', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  Hapus Foto
                </button>
              )}
            </div>
          </div>
          {globalCover && (
            <div style={{ marginTop:8, fontSize:11, color:'rgba(255,255,255,0.3)', textAlign:'center' }}>
              Foto ini diterapkan ke semua lagu · Tersimpan di browser
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
function UploadModal({ onClose, onUpload, uploading, uploadProgress, color, isLite }) {
  const [file,setFile]=useState(null), [title,setTitle]=useState(''), [artist,setArtist]=useState(''), [album,setAlbum]=useState(''), [dragging,setDragging]=useState(false);
  const fileRef=useRef(null);
  const handleFile=f=>{ if(!f||!f.type.startsWith('audio/')) return alert('Pilih file audio'); setFile(f); if(!title) setTitle(f.name.replace(/\.[^/.]+$/,'')); };
  const inp = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 12px', fontSize:13, color:'white', outline:'none', marginTop:6 };
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', ...(isLite ? {} : { backdropFilter:'blur(8px)' }), display:'flex', alignItems:'flex-end', animation:'fadeUp 0.25s ease' }} onClick={e=>e.target===e.currentTarget&&!uploading&&onClose()}>
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
  // ── Mode: Pro (full) vs Lite (lightweight)
  const [isLite, setIsLite] = useState(() => localStorage.getItem('sn_mode') === 'lite');
  const toggleMode = () => setIsLite(v => { const n=!v; localStorage.setItem('sn_mode', n?'lite':'pro'); return n; });

  // ── Hemat Data: blokir cover image, preload audio, prefetch Drive, & AI calls
  const [dataSaver, setDataSaver] = useState(() => localStorage.getItem('sn_datasaver') === '1');
  const toggleDataSaver = () => setDataSaver(v => {
    const n = !v; localStorage.setItem('sn_datasaver', n ? '1' : '0'); return n;
  });

  // ── Built-in songs dihapus; semua musik dicari di platform eksternal
  const builtinSongs = [];

  // ── Embed player state
  const [embedTrack, setEmbedTrack]         = useState(null);
  const [embedMinimized, setEmbedMinimized] = useState(false);

  // ── YouTube search state (keyed by platform id)
  const [ytQuery,   setYtQuery]   = useState({});
  const [ytResults, setYtResults] = useState({});
  const [ytLoading, setYtLoading] = useState({});
  const [ytError,   setYtError]   = useState({});

  // ── SoundCloud widget state
  const [scQuery,  setScQuery]  = useState({});
  const [scWidget, setScWidget] = useState({}); // { [platformId]: activeQuery }

  // ── Redirect platforms search
  const [platformSearch, setPlatformSearch] = useState({});

  // Public Piped API instances (YouTube search, no key needed)
  const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.projectsegfault.net',
    'https://piped-api.garudalinux.org',
    'https://api.piped.yt',
  ];

  const openPlatformSearch = (platform, query) => {
    const q = (query || platformSearch[platform.id] || '').trim();
    if (!q) { window.open(platform.openUrl, '_blank'); return; }
    window.open(platform.searchUrl(q), '_blank');
  };

  const searchYouTube = async (platformId, query) => {
    if (!query.trim()) return;
    setYtLoading(p => ({...p, [platformId]: true}));
    setYtError(p => ({...p, [platformId]: null}));
    setYtResults(p => ({...p, [platformId]: []}));
    let success = false;
    for (const base of PIPED_INSTANCES) {
      try {
        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), 6000);
        const res  = await fetch(`${base}/search?q=${encodeURIComponent(query)}&filter=music_songs`, { signal: ctrl.signal });
        clearTimeout(tid);
        if (!res.ok) continue;
        const data  = await res.json();
        const items = (data.items || []).filter(i => i.url && i.url.includes('watch')).slice(0, 10);
        setYtResults(p => ({...p, [platformId]: items}));
        success = true;
        break;
      } catch { /* try next */ }
    }
    if (!success) setYtError(p => ({...p, [platformId]: 'Gagal memuat. Periksa koneksi & coba lagi.'}));
    setYtLoading(p => ({...p, [platformId]: false}));
  };

  const playYouTube = (item) => {
    const match   = (item.url || '').match(/[?&]v=([^&]+)/);
    const videoId = match ? match[1] : item.url?.replace('/watch?v=','');
    if (!videoId) return;
    const secs = item.duration || 0;
    const dur  = secs > 0 ? `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}` : '';
    setEmbedTrack({ type:'youtube', videoId, title:item.title, artist:item.uploaderName||'YouTube', thumbnail:item.thumbnail, duration:dur });
    setEmbedMinimized(false);
  };

  const playSoundCloud = (platformId, query) => {
    if (!query.trim()) return;
    setScWidget(p => ({...p, [platformId]: query}));
    setEmbedTrack({ type:'soundcloud', query, title:`SoundCloud: "${query}"`, artist:'SoundCloud', thumbnail:null });
    setEmbedMinimized(false);
  };

  const closeEmbed = () => setEmbedTrack(null);

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

  // ── Google Drive — restore session from localStorage if token still valid
  const [googleUser, setGoogleUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('sn_google_user') || 'null'); } catch { return null; }
  });
  const [accessToken, setAccessToken]   = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sn_google_token') || 'null');
      if (saved && saved.expiry > Date.now()) return saved.token;
      localStorage.removeItem('sn_google_token');
      return null;
    } catch { return null; }
  });
  const [customSongs, setCustomSongs]   = useState([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [showUpload, setShowUpload]     = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProg] = useState(0);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [driveError, setDriveError]     = useState('');

  // ── Custom cover global (satu foto untuk semua lagu)
  const [globalCover, setGlobalCover]   = useState(() => localStorage.getItem('sn_global_cover') || '');
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const coverInputRef = useRef(null);

  // Helper: ambil cover aktif (globalCover override semua)
  const getCover = useCallback((song) => dataSaver ? (globalCover || '') : (globalCover || song?.cover || ''), [globalCover, dataSaver]);

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
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

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

  const allSongs = [...builtinSongs, ...customSongs];

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

  // ── PWA Install prompt
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  useEffect(() => {
    const handler = e => { e.preventDefault(); setPwaPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setPwaInstalled(true); setPwaPrompt(null); });
    // Cek apakah sudah diinstall (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) setPwaInstalled(true);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const installPwa = async () => {
    if (!pwaPrompt) return;
    pwaPrompt.prompt();
    const { outcome } = await pwaPrompt.userChoice;
    if (outcome === 'accepted') { setPwaInstalled(true); setPwaPrompt(null); }
  };

  // ── Auto-restore Drive songs if we have a saved valid token
  useEffect(() => {
    const savedToken = (() => { try { const s=JSON.parse(localStorage.getItem('sn_google_token')||'null'); return s&&s.expiry>Date.now()?s.token:null; } catch{return null;} })();
    if (savedToken && !customSongs.length) {
      setLoadingDrive(true);
      driveListSongs(savedToken).then(songs => { setCustomSongs(songs); setLoadingDrive(false); }).catch(()=>setLoadingDrive(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Responsive ring + desktop detection
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const desktop = vw >= 768;
      setIsDesktop(desktop);
      if (desktop) {
        const available = Math.min(vh - 340, 300);
        setRingSize(Math.max(200, Math.min(270, available)));
      } else {
        const overhead = 347;
        const available = Math.min(vh - overhead, vw - 48);
        setRingSize(Math.max(185, Math.min(310, available)));
      }
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // ── Audio init
  useEffect(() => {
    const prev = audioRef.current;
    const wasPlaying = prev && !prev.paused;
    if (prev) { prev.pause(); prev.src = ''; }
    const a = new Audio(track.src);
    a.volume = muted ? 0 : volume;
    a.preload = dataSaver ? 'none' : 'auto'; // hemat data: jangan buffer sebelum diputar
    audioRef.current = a;
    if (wasPlaying) {
      a.play().catch(e => { console.warn('autoplay blocked:', e); setPlaying(false); });
    }
    return () => { a.pause(); a.src = ''; };
  }, [track.src]);

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

  // ── Track history + prefetch lagu berikutnya
  useEffect(() => {
    setHistory(prev => { const f=prev.filter(s=>s.id!==track.id); return [track,...f].slice(0,15); });
    setLyrics(''); setInsight('');
    // Prefetch lagu berikutnya di background
    const allSongs = [...builtinSongs, ...customSongs];
    const idx = allSongs.findIndex(s => s.id === track.id);
    const next = allSongs[(idx + 1) % allSongs.length];
    if (next?.isDrive && next?.driveId && tokenRef.current) {
      if (!dataSaver) drivePrefetch(next.driveId, tokenRef.current); // hemat data: skip prefetch
    }
  }, [track.id, customSongs]);

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
    const songs = [...builtinSongs, ...customSongs];
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
    const songs = [...builtinSongs, ...customSongs];
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
    if (dataSaver) { setInsight('🌿 Hemat Data aktif — fitur AI dinonaktifkan.'); return; }
    setIL(true);
    const r = await askAI(`Buat 1 kalimat puitis untuk "${track.title}" vibe ${track.mood}. Sebutkan bintang/alam semesta.`, 'Maks 20 kata. Kalimat puitis saja, tanpa tanda petik.');
    setInsight(r); setIL(false);
  };
  const sendChat = async () => {
    if (!input.trim()) return;
    if (dataSaver) {
      const msg=input; setInput('');
      setMessages(p=>[...p,{from:'user',text:msg},{from:'ai',text:'🌿 Mode Hemat Data aktif — AI chat dinonaktifkan untuk menghemat kuota internet.'}]);
      return;
    }
    const msg=input; setInput(''); setMessages(p=>[...p,{from:'user',text:msg}]); setCL(true);
    const r = await askAI(msg, `Kamu Starry AI, asisten musik ramah. Jawab singkat maks 80 kata. Diputar: "${track.title}" oleh ${track.artist}.`);
    setMessages(p=>[...p,{from:'ai',text:r}]); setCL(false);
  };
  const searchVibe = async () => {
    if (!vibeInput.trim()||vibeLoading) return;
    if (dataSaver) { setVibeInput('🌿 Hemat Data aktif — Vibe Search dinonaktifkan'); return; }
    setVL(true);
    // Vibe Search sekarang merekomendasikan platform streaming
    const customList = customSongs.slice(0,8).map((s,i)=>`${i+1}=${s.title}(${s.artist})`).join(' ');
    if (customList) {
      const r = await askAI(`Vibe: ${vibeInput}`, `Pilih lagu dari list. Balas HANYA satu angka. ${customList}`);
      const idx = parseInt(r.trim()) - 1;
      const found = customSongs[idx];
      if (found) { play(found); setVibeInput(`✨ Cocok: ${found.title}`); setVL(false); return; }
    }
    // Jika tidak ada lagu lokal, rekomendasikan pencarian ke platform
    const r = await askAI(`Pengguna ingin musik dengan vibe: "${vibeInput}". Rekomendasikan 1 judul lagu + artis yang cocok. Format: JUDUL - ARTIS`, `Jawab singkat, hanya judul dan artis.`);
    setVibeInput(`✨ Coba cari: ${r.trim()}`);
    setVL(false);
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
        // Simpan token ke localStorage (berlaku ~58 menit)
        localStorage.setItem('sn_google_token', JSON.stringify({ token: tok, expiry: Date.now() + 3500 * 1000 }));
        try {
          const u=await (await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{ headers:{ Authorization:`Bearer ${tok}` } })).json();
          setGoogleUser(u); localStorage.setItem('sn_google_user', JSON.stringify(u)); setDriveError(''); setLoadingDrive(true);
          setCustomSongs(await driveListSongs(tok, true)); setLoadingDrive(false);
        } catch(e) { setDriveError('Gagal memuat Drive: '+e.message); setLoadingDrive(false); }
      }
    });
    client.requestAccessToken();
  }, []);
  const handleGoogleLogout = useCallback(() => {
    if (accessToken&&window.google) window.google.accounts.oauth2.revoke(accessToken,()=>{});
    setGoogleUser(null); setAccessToken(null); tokenRef.current=null; setCustomSongs([]); setDriveError('');
    localStorage.removeItem('sn_google_token'); localStorage.removeItem('sn_google_user');
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
  const filteredCustom = filteredSongs.filter(s => s.isDrive);

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

      {/* BG — Pro only */}
      {!isLite && <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, background:`radial-gradient(ellipse at 60% 10%,${track.color}20 0%,transparent 60%)`, transition:'background 2s ease' }}/>}
      {!isLite && <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}><div className="stars"/></div>}

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
          {/* Mode toggle */}
          <button onClick={toggleMode} title={isLite ? 'Switch to Pro Mode' : 'Switch to Lite Mode'}
            style={{ display:'flex', alignItems:'center', gap:3, padding:'4px 8px', borderRadius:999, border:`1px solid ${isLite ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.15)'}`, background: isLite ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', cursor:'pointer', color: isLite ? '#a5b4fc' : 'rgba(255,255,255,0.5)', fontSize:9, fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase' }}>
            {isLite ? <Zap size={9}/> : <Sparkles size={9}/>}
            {isLite ? 'Lite' : 'Pro'}
          </button>
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
          {/* PWA Install button */}
          {!pwaInstalled && pwaPrompt && (
            <button onClick={installPwa} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 9px', borderRadius:999, border:'1px solid rgba(99,102,241,0.5)', background:'rgba(99,102,241,0.15)', color:'#a5b4fc', fontSize:9, fontWeight:700, cursor:'pointer', letterSpacing:'0.03em' }}>
              <span style={{ fontSize:11 }}>📲</span>Install App
            </button>
          )}
          {pwaInstalled && (
            <div style={{ display:'flex', alignItems:'center', gap:3, padding:'4px 8px', borderRadius:999, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)' }}>
              <span style={{ fontSize:10 }}>✅</span>
              <span style={{ fontSize:9, fontWeight:700, color:'#a5b4fc' }}>Installed</span>
            </div>
          )}
          {/* Hemat Data badge */}
          {dataSaver && (
            <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 8px', borderRadius:999, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.35)' }}>
              <span style={{ fontSize:11 }}>🌿</span>
              <span style={{ fontSize:9, fontWeight:700, color:'#6ee7b7' }}>Hemat</span>
            </div>
          )}
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

      {/* ══ CONTENT — flex row wrapper for desktop sidebar layout */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'row', position:'relative', zIndex:5 }}>

      {/* Desktop left sidebar nav */}
      {isDesktop && (
        <div style={{ width:196, flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.18)', display:'flex', flexDirection:'column', padding:'10px 8px 16px', gap:3 }}>
          {tabs.map(t=>{
            const active=tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', background:active?`${track.color}20`:'transparent', color:active?track.color:'rgba(255,255,255,0.4)', transition:'all 0.15s', textAlign:'left', width:'100%', fontSize:13, fontWeight:active?700:500 }}>
                {t.icon}<span>{t.label}</span>
              </button>
            );
          })}
          <div style={{ flex:1 }}/>
          <button onClick={()=>setShowSettings(true)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', background:'transparent', color:'rgba(255,255,255,0.3)', width:'100%', fontSize:13 }}>
            <Settings size={17}/><span>Pengaturan</span>
          </button>
        </div>
      )}

      <main style={{ flex:1, overflow:'hidden', position:'relative' }}>

        {/* ─── PLAYER TAB */}
        {tab==='player'&&(
          <div className="scrollbar-hide" style={{ height:'100%', overflowY:'auto' }}>
          <div style={{ minHeight:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'clamp(4px,1.5vh,12px) 20px clamp(4px,1vh,8px)', animation:'fadeUp 0.4s ease' }}>
            {loadingTrack&&(
              <div style={{ position:'fixed', inset:0, zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(7,7,26,0.85)', ...(isLite ? {} : { backdropFilter:'blur(6px)' }), gap:12 }}>
                <Loader2 size={30} style={{ color:track.color, animation:'spin 1s linear infinite' }}/>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>Memuat dari Google Drive…</div>
              </div>
            )}

            {/* Ring */}
            <OrbitalRing size={ringSize} pct={pct} color={track.color} progress={progress} duration={duration} isPlaying={playing} cover={getCover(track)} title={track.title} onSeek={seekByPct} isLite={isLite}/>

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
              <button onClick={()=>setPlaying(p=>!p)} style={{ width:'clamp(48px,13vw,56px)', height:'clamp(48px,13vw,56px)', borderRadius:'50%', border:'none', background:'white', color:'#07071a', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: isLite ? `0 2px 8px rgba(0,0,0,0.4)` : `0 0 22px ${track.color}90,0 4px 20px rgba(0,0,0,0.4)`, transition:'transform 0.1s,box-shadow 0.3s', flexShrink:0 }}>
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

              {/* ── STREAMING PLATFORMS */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:10 }}>
                  🎵 Platform Streaming
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {STREAMING_PLATFORMS.map(platform => {
                    const isYT = platform.embedType === 'youtube';
                    const isSC = platform.embedType === 'soundcloud';
                    const isRedirect = platform.embedType === 'redirect';
                    const ytQ = ytQuery[platform.id] || '';
                    const scQ = scQuery[platform.id] || '';
                    const results = ytResults[platform.id] || [];
                    const loading = ytLoading[platform.id];
                    const error   = ytError[platform.id];
                    const activeWidget = scWidget[platform.id];
                    return (
                      <div key={platform.id} style={{ borderRadius:16, background:`${platform.color}0e`, border:`1px solid ${platform.color}30`, overflow:'hidden' }}>
                        {/* ── Platform header */}
                        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px 8px' }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:`${platform.color}20`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                            <img src={platform.logo} alt={platform.name} style={{ width:22, height:22, objectFit:'contain' }} onError={e=>{e.target.style.display='none';}}/>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontWeight:700, fontSize:13, color:'white' }}>{platform.name}</span>
                              {(isYT||isSC) && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:`${platform.color}25`, color:platform.color }}>IN-APP ▶</span>}
                              {isRedirect && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.35)' }}>REDIRECT</span>}
                            </div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{platform.description}</div>
                          </div>
                          <button onClick={()=>window.open(platform.openUrl,'_blank')} style={{ padding:'4px 8px', borderRadius:999, border:`1px solid ${platform.color}40`, background:'transparent', color:platform.color, fontSize:10, fontWeight:700, cursor:'pointer', flexShrink:0 }}>↗</button>
                        </div>

                        {/* ── YouTube: search bar + results list */}
                        {isYT && (
                          <div style={{ padding:'0 10px 10px' }}>
                            <div style={{ display:'flex', gap:6 }}>
                              <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.3)', borderRadius:999, padding:'6px 12px', border:`1px solid ${platform.color}25` }}>
                                <Search size={11} style={{ color:platform.color, flexShrink:0 }}/>
                                <input type="text" placeholder={platform.hint} value={ytQ}
                                  onChange={e => setYtQuery(p=>({...p,[platform.id]:e.target.value}))}
                                  onKeyDown={e => { if(e.key==='Enter') searchYouTube(platform.id, ytQ); }}
                                  style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:12, minWidth:0 }}/>
                                {ytQ && <button onClick={()=>setYtQuery(p=>({...p,[platform.id]:''}))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14, lineHeight:1, padding:0 }}>×</button>}
                              </div>
                              <button onClick={() => searchYouTube(platform.id, ytQ)} disabled={loading||!ytQ.trim()}
                                style={{ padding:'6px 12px', borderRadius:999, border:'none', background: ytQ.trim()?platform.color:'rgba(255,255,255,0.1)', color:'white', fontSize:11, fontWeight:700, cursor: ytQ.trim()?'pointer':'default', flexShrink:0, display:'flex', alignItems:'center', gap:4, opacity: loading?0.7:1 }}>
                                {loading ? <Loader2 size={11} style={{ animation:'spin 1s linear infinite' }}/> : <Search size={11}/>}
                                {loading ? 'Mencari…' : 'Cari'}
                              </button>
                            </div>
                            {error && <div style={{ marginTop:8, fontSize:11, color:'#fca5a5', padding:'6px 10px', borderRadius:8, background:'rgba(239,68,68,0.1)' }}>{error}</div>}
                            {results.length > 0 && (
                              <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:3 }}>
                                {results.map((item, i) => {
                                  const match = (item.url||'').match(/[?&]v=([^&]+)/);
                                  const vid = match ? match[1] : (item.url||'').replace('/watch?v=','');
                                  const isActive = embedTrack?.type==='youtube' && embedTrack?.videoId===vid;
                                  const secs = item.duration||0;
                                  const dur = secs>0 ? `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}` : '';
                                  return (
                                    <button key={i} onClick={() => playYouTube(item)}
                                      style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', borderRadius:10, background: isActive?`${platform.color}25`:'rgba(255,255,255,0.04)', border:`1px solid ${isActive?platform.color+'50':'transparent'}`, cursor:'pointer', width:'100%', textAlign:'left', transition:'all 0.15s' }}>
                                      <div style={{ width:48, height:34, borderRadius:6, overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.06)', position:'relative' }}>
                                        {item.thumbnail ? <img src={item.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Music size={12} style={{ color:'rgba(255,255,255,0.3)', margin:'auto', display:'block', marginTop:10 }}/>}
                                        {isActive && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:14, height:14, borderRadius:999, background:'white', display:'flex', alignItems:'center', justifyContent:'center' }}><Play size={7} style={{ color:'#111', marginLeft:1 }}/></div></div>}
                                      </div>
                                      <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:12, fontWeight:600, color: isActive?'white':'rgba(255,255,255,0.85)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
                                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{item.uploaderName}{dur&&` · ${dur}`}</div>
                                      </div>
                                      <div style={{ width:28, height:28, borderRadius:999, background: isActive?platform.color:`${platform.color}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                                        <Play size={10} style={{ color: isActive?'white':platform.color, marginLeft:1 }}/>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── SoundCloud: search bar + embedded widget */}
                        {isSC && (
                          <div style={{ padding:'0 10px 10px' }}>
                            <div style={{ display:'flex', gap:6 }}>
                              <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.3)', borderRadius:999, padding:'6px 12px', border:`1px solid ${platform.color}25` }}>
                                <Search size={11} style={{ color:platform.color, flexShrink:0 }}/>
                                <input type="text" placeholder={platform.hint} value={scQ}
                                  onChange={e => setScQuery(p=>({...p,[platform.id]:e.target.value}))}
                                  onKeyDown={e => { if(e.key==='Enter') playSoundCloud(platform.id, scQ); }}
                                  style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:12, minWidth:0 }}/>
                                {scQ && <button onClick={()=>setScQuery(p=>({...p,[platform.id]:''}))} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14, lineHeight:1, padding:0 }}>×</button>}
                              </div>
                              <button onClick={() => playSoundCloud(platform.id, scQ)} disabled={!scQ.trim()}
                                style={{ padding:'6px 12px', borderRadius:999, border:'none', background: scQ.trim()?platform.color:'rgba(255,255,255,0.1)', color:'white', fontSize:11, fontWeight:700, cursor: scQ.trim()?'pointer':'default', flexShrink:0, display:'flex', alignItems:'center', gap:4 }}>
                                <Play size={11}/> Putar
                              </button>
                            </div>
                            {activeWidget && (
                              <div style={{ marginTop:8, borderRadius:10, overflow:'hidden', border:`1px solid ${platform.color}30` }}>
                                <iframe key={activeWidget}
                                  src={`https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fsearch%2Fsounds%3Fq%3D${encodeURIComponent(activeWidget)}&color=%23ff5500&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`}
                                  width="100%" height="166" frameBorder="0" allow="autoplay" scrolling="no"
                                  style={{ display:'block', background:'#1a1a2e' }}/>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── Redirect platforms */}
                        {isRedirect && (
                          <div style={{ padding:'0 10px 10px' }}>
                            <div style={{ display:'flex', gap:6 }}>
                              <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.3)', borderRadius:999, padding:'6px 12px', border:`1px solid ${platform.color}25` }}>
                                <Search size={11} style={{ color:platform.color, flexShrink:0 }}/>
                                <input type="text" placeholder={platform.hint}
                                  value={platformSearch[platform.id] || ''}
                                  onChange={e => setPlatformSearch(p=>({...p,[platform.id]:e.target.value}))}
                                  onKeyDown={e => { if(e.key==='Enter') openPlatformSearch(platform); }}
                                  style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:12, minWidth:0 }}/>
                              </div>
                              <button onClick={() => openPlatformSearch(platform)}
                                style={{ padding:'6px 12px', borderRadius:999, border:'none', background:`${platform.color}cc`, color:'white', fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', gap:4 }}>
                                Buka ↗
                              </button>
                            </div>
                            <div style={{ marginTop:6, fontSize:10, color:'rgba(255,255,255,0.22)', paddingLeft:2 }}>
                              ⓘ Dibuka di browser — {platform.name} memerlukan login.
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* Drive songs */}
              {(googleUser||customSongs.length>0)&&(
                <>
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.15em', marginTop:10, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
                    <Cloud size={11}/>Lagu Saya ({filteredCustom.length})
                    {loadingDrive&&<Loader2 size={11} style={{ animation:'spin 1s linear infinite', color:track.color }}/>}
                    {!loadingDrive&&googleUser&&(
                      <button onClick={async()=>{ setLoadingDrive(true); try{ setCustomSongs(await driveListSongs(tokenRef.current,true)); }catch(e){ setDriveError('Gagal refresh: '+e.message); } setLoadingDrive(false); }}
                        title="Refresh daftar lagu dari Drive"
                        style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:3, fontSize:10, padding:'2px 6px', borderRadius:6 }}>
                        ↺ Refresh
                      </button>
                    )}
                  </div>
                  {loadingDrive&&filteredCustom.length===0&&<div style={{ textAlign:'center', padding:16, color:'rgba(255,255,255,0.3)', fontSize:12 }}>Memuat dari Drive… (musik yang sudah ada di folder juga akan muncul)</div>}
                  {!loadingDrive&&filteredCustom.length===0&&googleUser&&<div style={{ padding:'16px', textAlign:'center', background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px dashed rgba(255,255,255,0.1)' }}><Cloud size={22} style={{ color:'rgba(255,255,255,0.12)', margin:'0 auto 8px', display:'block' }}/><div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Belum ada lagu audio di Google Drive</div><div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:4 }}>Coba tekan ↺ Refresh di atas</div></div>}
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
                <img src={getCover(track)} style={{ width:40, height:40, borderRadius:10, objectFit:'cover' }}/>
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
                <img src={getCover(track)} style={{ width:30, height:30, borderRadius:7, objectFit:'cover' }}/>
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
      </div>{/* end flex row wrapper */}

      {/* ══ TAB BAR — Mobile only */}
      {!isDesktop && (
        <nav style={{ position:'relative', zIndex:10, flexShrink:0, display:'flex', alignItems:'center', background:'rgba(7,7,26,0.95)', ...(isLite ? {} : { backdropFilter:'blur(20px)' }), borderTop:'1px solid rgba(255,255,255,0.08)', padding:'6px 8px 10px', paddingBottom:'max(10px,env(safe-area-inset-bottom))' }}>
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
      )}

      {/* ══ MODALS */}
      {showPlModal&&<PlaylistModal
        allSongs={allSongs}
        existing={editingPl}
        onClose={()=>{ setShowPlModal(false); setEditingPl(null); }}
        onSave={editingPl ? updatePlaylist : createPlaylist}
        isLite={isLite}
      />}
      {showSettings&&<SettingsPanel onClose={()=>setShowSettings(false)} color={track.color} eqEnabled={eqEnabled} setEqEnabled={setEqEnabled} eqPreset={eqPreset} setEqPreset={setEqPreset} eqGains={eqGains} setEqGains={setEqGains} crossfade={crossfade} setCrossfade={setCrossfade} sleepTimer={sleepTimer} startSleepTimer={startSleepTimer} cancelSleepTimer={cancelSleepTimer} globalCover={globalCover} setGlobalCover={setGlobalCover} isLite={isLite} dataSaver={dataSaver} toggleDataSaver={toggleDataSaver} pwaPrompt={pwaPrompt} pwaInstalled={pwaInstalled} installPwa={installPwa}/>}
      {showUpload&&<UploadModal onClose={()=>!uploading&&setShowUpload(false)} onUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress} color={track.color} isLite={isLite}/>}

      {/* ══ YOUTUBE EMBED FLOATING PANEL ══ */}
      {embedTrack && embedTrack.type === 'youtube' && (
        <div style={{
          position:'fixed', left:0, right:0, bottom:0, zIndex:500,
          background:'rgba(7,7,26,0.97)', backdropFilter:'blur(20px)',
          borderTop:'1px solid rgba(255,0,0,0.3)',
          boxShadow:'0 -8px 32px rgba(0,0,0,0.6)',
          animation:'fadeUp 0.3s ease',
        }}>
          {/* Mini bar (always visible) */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom: embedMinimized?'none':'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width:36, height:36, borderRadius:8, overflow:'hidden', flexShrink:0, background:'#111' }}>
              {embedTrack.thumbnail
                ? <img src={embedTrack.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <div style={{ width:'100%', height:'100%', background:'rgba(255,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}><Play size={14} style={{ color:'#ff4444' }}/></div>
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{embedTrack.title}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', marginTop:1 }}>{embedTrack.artist}{embedTrack.duration&&` · ${embedTrack.duration}`} · YouTube</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <button onClick={()=>setEmbedMinimized(v=>!v)}
                style={{ width:28, height:28, borderRadius:999, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>
                {embedMinimized ? '▲' : '▼'}
              </button>
              <button onClick={closeEmbed}
                style={{ width:28, height:28, borderRadius:999, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={12}/>
              </button>
            </div>
          </div>
          {/* YouTube iframe */}
          {!embedMinimized && (
            <div style={{ position:'relative', width:'100%', paddingBottom:'56.25%', height:0, background:'#000' }}>
              <iframe
                key={embedTrack.videoId}
                src={`https://www.youtube.com/embed/${embedTrack.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={embedTrack.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
              />
            </div>
          )}
        </div>
      )}

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
        ${isLite ? '.lite-no-anim *{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.1s!important}' : ''}
      `}</style>
    </div>
  );
}

const btn = { background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:8, display:'flex', transition:'color 0.2s', borderRadius:8 };
