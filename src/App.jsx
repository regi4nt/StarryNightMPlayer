import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  ListMusic, Compass, Heart, Volume2, VolumeX,
  Sparkles, X, Send, Zap, Headphones, Bot,
  Upload, LogIn, LogOut, Plus, Cloud, Music,
  CheckCircle, Loader2, User, Shuffle, Repeat,
  Repeat1, Settings, Moon, FileText, Clock,
  ChevronRight, SlidersHorizontal, History,
  Search, Mic2, Trash2, ListPlus, FolderOpen,
  PenLine, ChevronLeft, Radio, Maximize2, Minimize2,
  Download, Share2, Wand2, Copy, Check, Star
} from 'lucide-react';

// ── Split modules ────────────────────────────────────────
import { T } from './translations.js';
import {
  openNewTab, STREAMING_PLATFORMS, MUSIC_SOURCES, SONGS, builtinSongs,
  GOOGLE_CLIENT_ID, GOOGLE_SCOPES, DRIVE_FOLDER, SONG_COLORS, COVERS,
  randItem, SLEEP_OPTIONS, PIPED_INSTANCES, INVIDIOUS_INSTANCES,
  buildInvidiousUrl, buildPipedUrl, getProviders, radioUrl,
  setRuntimeKeys, setLastWinnerLabel,
  getSpId, getSpSecret, getScId,
  getUserAiKey, getUserDsKey, getUserGrokKey, getUserHfKey, getUserCfKey, getUserGhKey, getUserSnKey,
  getYtKey, isYtApiEnabled,
  SP_CLIENT_ID, SP_CLIENT_SECRET, SC_CLIENT_ID,
  askAI, askAIRace, activeModel, hasKey,
  AUDIO_EXTS, isAudioExt, AUDIO_MIME_EXTRAS, guessMime,
  fmt, fmtSec, isPhoneDevice,
  markFullyCached, checkCachedBlob,
  _driveCache, _blobCache, DRIVE_CACHE_NAME, DRIVE_CACHE_TTL, YT_CACHE_NAME,
  btn, driveListSongs, drivePrefetch,
  searchSpotify, searchSoundCloud,
  downloadYtAudio, downloadToDevice,
  cacheGet, driveStreamBlob, driveStreamLite, driveDownloadBlob, driveUploadSong,
} from './constants.js';

// ── Lazy-loaded components ────────────────────────────────
import { PlatformLogo } from './components/PlatformLogo.jsx'; // eager — used in stream tab
const PlaylistFormView    = lazy(() => import('./components/PlaylistViews.jsx').then(m => ({ default: m.PlaylistFormView })));
const PlaylistModal       = lazy(() => import('./components/PlaylistViews.jsx').then(m => ({ default: m.PlaylistModal })));
const PlaylistErrorBoundary = React.lazy(() => import('./components/PlaylistViews.jsx').then(m => ({ default: m.PlaylistErrorBoundary })));
// AppLogo & OrbitalRing are critical player UI — eager import
import { AppLogo, OrbitalRing } from './components/Player.jsx';
import { SongRow } from './components/SongRow.jsx'; // eager — used immediately in lists
const SettingsPanel  = lazy(() => import('./components/SettingsPanel.jsx').then(m => ({ default: m.SettingsPanel })));
const UploadModal    = lazy(() => import('./components/UploadModal.jsx').then(m => ({ default: m.UploadModal })));

// ── Suspense fallback ─────────────────────────────────────
const Spinner = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:24, color:'rgba(255,255,255,0.3)' }}>
    <Loader2 size={20} style={{ animation:'spin 1s linear infinite' }} />
  </div>
);
const wrap = (node) => <Suspense fallback={<Spinner />}>{node}</Suspense>;

export default function App() {
  // ── Mode: Lite (ringan + hemat data) vs Pro (penuh)
  // Lite otomatis mengaktifkan semua penghematan: cover, buffer, prefetch, AI, animasi
  const [isLite, setIsLite] = useState(() =>
    localStorage.getItem('sn_mode') === 'lite' || localStorage.getItem('sn_datasaver') === '1'
  );
  const toggleMode = () => setIsLite(v => {
    const n = !v;
    localStorage.setItem('sn_mode', n ? 'lite' : 'pro');
    localStorage.removeItem('sn_datasaver'); // bersihkan key lama
    return n;
  });
  const dataSaver = isLite; // alias untuk backward compat semua referensi lama
  const toggleDataSaver = toggleMode; // backward compat

  // ── Language: 'id' (Indonesia) | 'en' (English)
  const [lang, setLang] = useState(() => localStorage.getItem('sn_lang') || 'id');
  const toggleLang = () => setLang(v => { const n = v === 'id' ? 'en' : 'id'; localStorage.setItem('sn_lang', n); return n; });
  const t = T[lang] || T.id;

  const [customDns, setCustomDns] = useState(() => localStorage.getItem('sn_custom_dns') || '');
  // ── User API keys (localStorage persisted)
  const [userSpId,     setUserSpId]     = useState(() => localStorage.getItem('sn_sp_id')    ||'');
  const [userSpSecret, setUserSpSecret] = useState(() => localStorage.getItem('sn_sp_secret')||'');
  const [userScId,     setUserScId]     = useState(() => localStorage.getItem('sn_sc_id')    ||'');
  const [userAiKey,    setUserAiKey]    = useState(() => localStorage.getItem('sn_ai_key')   ||'');
  const [userYtKey,    setUserYtKey]    = useState(() => localStorage.getItem('sn_yt_key')   ||'');
  const [userCfKey,    setUserCfKey]    = useState(() => localStorage.getItem('sn_cf_key')   ||'');
  const [userSnKey,    setUserSnKey]    = useState(() => localStorage.getItem('sn_sn_key')   ||'');
  useEffect(() => { setRuntimeKeys(userSpId, userSpSecret, userScId, userAiKey, '', '', userYtKey, '', userCfKey, '', userSnKey); }, [userSpId, userSpSecret, userScId, userAiKey, userYtKey, userCfKey, userSnKey]);

  // ── Built-in songs dihapus; semua musik dicari di platform eksternal
  // builtinSongs is defined at module level as empty array

  // ── Embed player state
  const [embedTrack, setEmbedTrack]         = useState(null);
  const [embedMinimized, setEmbedMinimized] = useState(false);
  const ytIframeRef   = useRef(null);
  const [ytProgress, setYtProgress]   = useState(0);
  const [ytDuration, setYtDuration]   = useState(0);
  const ytQueueRef    = useRef([]);   // current list of YT results
  const ytQueueIdxRef = useRef(-1);  // index of current video in queue
  const [ytSongs, setYtSongs]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('sn_yt_songs') || '[]'); } catch { return []; }
  }); // YT tracks saved to playlist/liked
  const [favSongs, setFavSongs]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('sn_fav_songs') || '[]'); } catch { return []; }
  }); // SC / Spotify / Radio liked tracks

  // ── Unified search state
  const [unifiedQuery, setUnifiedQuery] = useState('');
  const [unifiedPlatform, setUnifiedPlatform] = useState('ytmusic'); // 'ytmusic' | 'soundcloud' | 'spotify'

  // ── YouTube search state (keyed by platform id)
  const [ytQuery,   setYtQuery]   = useState({});
  const [ytResults, setYtResults] = useState({});
  const [ytLoading, setYtLoading] = useState({});
  const [ytError,   setYtError]   = useState({});
  const [ytTrending, setYtTrending] = useState([]); // live trending chips
  const [ytTrendingLoading, setYtTrendingLoading] = useState(false);

  // ── SoundCloud in-app search state (keyed by platform id)
  const [scQuery,   setScQuery]   = useState({});
  const [scResults, setScResults] = useState({});
  const [scLoading, setScLoading] = useState({});
  const [scError,   setScError]   = useState({});
  const [scWidget,  setScWidget]  = useState({}); // { [platformId]: activeWidgetUrl }
  const scHasKey = !!(userScId || SC_CLIENT_ID);

  // ── Redirect platforms search
  const [platformSearch, setPlatformSearch] = useState({});
  const [platformIframe, setPlatformIframe] = useState({}); // keyed by platform.id → URL string
  const [radioStation, setRadioStation] = useState(null); // currently playing radio station
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioCountry, setRadioCountry] = useState(null); // selected country id
  const [radioGenre, setRadioGenre] = useState(null);     // selected genre id
  const radioAudioRef = useRef(null);
  const [stationStatus, setStationStatus] = useState({}); // stationId → 'testing'|'ok'|'fail'
  const testedGenresRef = useRef(new Set());
  // Radio Browser API state
  const [rbMode, setRbMode] = useState('browse'); // 'browse' | 'search' | 'somafm' | 'garden' | 'nts'
  const [rbQuery, setRbQuery] = useState('');
  const [rbResults, setRbResults] = useState([]);
  const [rbLoading, setRbLoading] = useState(false);
  const [rbError, setRbError] = useState(null);
  const [rbTopTags, setRbTopTags] = useState([]);
  const [rbSelectedTag, setRbSelectedTag] = useState(null);
  const rbServerRef = useRef(null);
  // Browse (Koleksi) — Radio Browser fetched stations
  const [rbBrowseStations, setRbBrowseStations] = useState([]);
  const [rbBrowseLoading, setRbBrowseLoading] = useState(false);
  const [rbBrowseError, setRbBrowseError] = useState(null);
  const rbBrowseRef = useRef([]); // for next/prev navigation
  const rbBrowseKeyRef = useRef(''); // tracks last fetched country+genre
  // Multi-source radio state
  const [rbSource, setRbSource] = useState('radiobrowser'); // 'radiobrowser'|'somafm'|'garden'|'nts'|'all'
  const [somaChannels, setSomaChannels] = useState([]);
  const [gardenPlaces, setGardenPlaces] = useState([]);
  const [gardenStations, setGardenStations] = useState([]);
  const [gardenCountry, setGardenCountry] = useState(null);
  const [gardenBrowseStations, setGardenBrowseStations] = useState([]); // flat list for browse panel
  const [gardenBrowseLoading, setGardenBrowseLoading] = useState(false);
  const [gardenBrowseError, setGardenBrowseError] = useState(null);
  const gardenBrowseKeyRef = useRef(''); // tracks last fetched country
  const [ntsShows, setNtsShows] = useState([]);
  const [multiResults, setMultiResults] = useState([]); // merged results from all sources
  const [multiLoading, setMultiLoading] = useState(false);

  // ── Spotify in-app search state
  const [spQuery,    setSpQuery]    = useState('');
  const [spResults,  setSpResults]  = useState([]);
  const [spLoading,  setSpLoading]  = useState(false);
  const [spError,    setSpError]    = useState(null);
  const [spTrack,    setSpTrack]    = useState(null); // selected for preview/open
  const [spPlaying,  setSpPlaying]  = useState(false);
  const [spEmbedUrl, setSpEmbedUrl] = useState(null); // Spotify embed iframe URL
  const spPreviewRef  = useRef(null); // Audio element for 30s preview
  const spPlayingRef  = useRef(false); // track spPlaying dalam closure sleep timer
  const spHasKey = !!((userSpId && userSpSecret) || (SP_CLIENT_ID && SP_CLIENT_SECRET));

  // ── Web Search state
  const [wsQuery,   setWsQuery]   = useState('');
  const [wsResults, setWsResults] = useState([]);
  const [wsLoading, setWsLoading] = useState(false);
  const [wsError,   setWsError]   = useState(null);
  const [wsEmbedUrl, setWsEmbedUrl] = useState(null); // active embed URL
  const [spWsEmbedId, setSpWsEmbedId] = useState(null); // Spotify track ID for embed in web search
  const wsQueueRef  = useRef([]);   // current ws native audio queue
  const wsQueueIdxRef = useRef(-1);

  const doWebSearch = async (q) => {
    if (!q.trim()) return;
    setWsLoading(true); setWsError(null); setWsResults([]); setWsEmbedUrl(null); setSpWsEmbedId(null);
    try {
      // ── Deteksi URL langsung SoundCloud → embed
      if (q.includes('soundcloud.com/')) {
        setWsResults([{ type:'sc_redirect', source:'soundcloud_redirect', query: q, directUrl: q }]);
        setWsLoading(false); return;
      }
      // ── Deteksi URL langsung Spotify → buka di Spotify web (bukan search)
      const spUrlMatch2 = q.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/);
      if (spUrlMatch2) {
        window.open(`https://open.spotify.com/${spUrlMatch2[1]}/${spUrlMatch2[2]}`, '_blank', 'noopener,noreferrer');
        setWsLoading(false); return;
      }
      // ── Tolak URL YT
      if (q.match(/youtube\.com|youtu\.be/)) {
        setWsError('Gunakan tab YouTube untuk link YouTube.');
        setWsLoading(false); return;
      }
      const vimeoM       = q.match(/vimeo\.com\/(\d+)/);
      const dailymotionM = q.match(/dailymotion\.com\/video\/([a-z0-9]+)/i);
      const archiveM     = q.match(/archive\.org(?:\/(?:details|embed|download))?\/?([^/?#]+)/);
      const bandcampM    = q.match(/([a-z0-9-]+)\.bandcamp\.com\/(track|album)\/([a-z0-9-]+)/i);
      const audiomackM   = q.match(/audiomack\.com\/(song|album|playlist)\/([^/?#]+)\/([^/?#]+)/i);
      const mixcloudM    = q.match(/mixcloud\.com\/([^/?#]+\/[^/?#]+)/i);
      const odyseeM      = q.match(/odysee\.com\/@([^/]+)\/(([^:]+):([a-f0-9]+))/i);
      const rumbleM      = q.match(/rumble\.com\/embed\/([a-z0-9]+)|rumble\.com\/([a-z0-9-]+-[a-z0-9]+)\.html/i);
      const peertubeMInst = q.match(/https?:\/\/([^/]+)\/videos\/watch\/([a-f0-9-]{36})/i);
      const fmaM         = q.match(/freemusicarchive\.org\/music\/([^/?#]+)/i);
      const newgroundsM  = q.match(/newgrounds\.com\/audio\/listen\/(\d+)/i);
      const ccmixtM      = q.match(/ccmixter\.org\/files\/(\S+)\/(\d+)/i);

      if (vimeoM) {
        const vid = vimeoM[1];
        // fetch oEmbed for title
        let title = 'Vimeo Video', thumb = `https://vumbnail.com/${vid}.jpg`;
        try {
          const oe = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(q)}&width=400`, { signal: AbortSignal.timeout(4000) });
          if (oe.ok) { const d = await oe.json(); title = d.title || title; thumb = d.thumbnail_url || thumb; }
        } catch {}
        setWsResults([{ type:'vimeo', embedUrl:`https://player.vimeo.com/video/${vid}?autoplay=0`, title, artist:'Vimeo', thumbnail:thumb, source:'vimeo' }]);
        setWsLoading(false); return;
      }
      if (dailymotionM) {
        const dmId = dailymotionM[1];
        let title = 'Dailymotion Video', thumb = `https://www.dailymotion.com/thumbnail/video/${dmId}`;
        try {
          const oe = await fetch(`https://www.dailymotion.com/services/oembed?url=${encodeURIComponent(q)}&format=json`, { signal: AbortSignal.timeout(4000) });
          if (oe.ok) { const d = await oe.json(); title = d.title || title; thumb = d.thumbnail_url || thumb; }
        } catch {}
        setWsResults([{ type:'dailymotion', embedUrl:`https://www.dailymotion.com/embed/video/${dmId}?autoplay=0`, title, artist:'Dailymotion', thumbnail:thumb, source:'dailymotion' }]);
        setWsLoading(false); return;
      }
      if (archiveM) {
        const identifier = archiveM[1];
        setWsResults([{ type:'archive', embedUrl:`https://archive.org/embed/${identifier}`, title:identifier, artist:'archive.org', thumbnail:`https://archive.org/services/img/${identifier}`, source:'archive', identifier }]);
        setWsLoading(false); return;
      }
      if (audiomackM) {
        // Audiomack oEmbed → get embed_url
        let embedUrl = null, title = audiomackM[3].replace(/-/g,' '), thumb = null;
        try {
          const oe = await fetch(`https://audiomack.com/oembed?url=${encodeURIComponent(q)}&format=json`, { signal: AbortSignal.timeout(4000) });
          if (oe.ok) { const d = await oe.json(); title = d.title || title; thumb = d.thumbnail_url || null;
            const src = d.html?.match(/src="([^"]+)"/)?.[1]; if (src) embedUrl = src; }
        } catch {}
        if (!embedUrl) embedUrl = `https://audiomack.com/embed/${audiomackM[1]}/${audiomackM[2]}/${audiomackM[3]}`;
        setWsResults([{ type:'audiomack', embedUrl, title, artist: audiomackM[2], thumbnail:thumb, source:'audiomack' }]);
        setWsLoading(false); return;
      }
      if (mixcloudM) {
        const key = mixcloudM[1];
        let title = key.replace(/\//g,' – '), thumb = null;
        try {
          const oe = await fetch(`https://www.mixcloud.com/oembed/?url=${encodeURIComponent(q)}&format=json`, { signal: AbortSignal.timeout(4000) });
          if (oe.ok) { const d = await oe.json(); title = d.title || title; thumb = d.thumbnail_url || null; }
        } catch {}
        setWsResults([{ type:'mixcloud', embedUrl:`https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent('/'+key+'/')}&hide_cover=1&light=1`, title, artist:'Mixcloud', thumbnail:thumb, source:'mixcloud' }]);
        setWsLoading(false); return;
      }
      if (odyseeM) {
        const slug = odyseeM[2];
        setWsResults([{ type:'odysee', embedUrl:`https://odysee.com/$/embed/${slug}?autoplay=0`, title:odyseeM[3].replace(/-/g,' '), artist:`@${odyseeM[1]}`, thumbnail:null, source:'odysee' }]);
        setWsLoading(false); return;
      }
      if (rumbleM) {
        const rId = rumbleM[1] || rumbleM[2];
        setWsResults([{ type:'rumble', embedUrl:`https://rumble.com/embed/${rId}/`, title:'Rumble Video', artist:'Rumble', thumbnail:null, source:'rumble' }]);
        setWsLoading(false); return;
      }
      if (peertubeMInst) {
        const [, instance, uuid] = peertubeMInst;
        setWsResults([{ type:'peertube', embedUrl:`https://${instance}/videos/embed/${uuid}?autoplay=0`, title:'PeerTube Video', artist:instance, thumbnail:`https://${instance}/lazy-static/previews/${uuid}.jpg`, source:'peertube' }]);
        setWsLoading(false); return;
      }
      if (fmaM) {
        setWsResults([{ type:'fma', embedUrl:null, externalUrl:q, title:fmaM[1].replace(/\//g,' – '), artist:'Free Music Archive', thumbnail:null, source:'fma' }]);
        setWsLoading(false); return;
      }
      if (newgroundsM) {
        const ngId = newgroundsM[1];
        setWsResults([{ type:'newgrounds', embedUrl:`https://www.newgrounds.com/audio/listen/${ngId}`, title:`NG Audio #${ngId}`, artist:'Newgrounds', thumbnail:null, source:'newgrounds', externalUrl:q }]);
        setWsLoading(false); return;
      }
      if (ccmixtM) {
        setWsResults([{ type:'ccmixter', embedUrl:null, externalUrl:q, title:`ccMixter #${ccmixtM[2]}`, artist:ccmixtM[1], thumbnail:null, source:'ccmixter' }]);
        setWsLoading(false); return;
      }
      if (bandcampM) {
        setWsResults([{ type:'bandcamp', embedUrl:null, externalUrl:q, title:bandcampM[3].replace(/-/g,' '), artist:bandcampM[1], thumbnail:null, source:'bandcamp' }]);
        setWsLoading(false); return;
      }

      // ── Keyword search: 5 sumber paralel
      const archivePromise = (async () => {
        try {
          const r = await fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}+AND+mediatype:(audio)&fl[]=identifier,title,creator&sort[]=downloads+desc&rows=5&output=json`, { signal: AbortSignal.timeout(6000) });
          if (!r.ok) return [];
          const d = await r.json();
          return (d.response?.docs || []).slice(0, 4).map(doc => ({
            type:'archive', embedUrl:`https://archive.org/embed/${doc.identifier}`,
            title:doc.title||doc.identifier, artist:doc.creator||'archive.org',
            thumbnail:`https://archive.org/services/img/${doc.identifier}`,
            source:'archive', identifier:doc.identifier,
          }));
        } catch { return []; }
      })();
      const jamendoPromise = (async () => {
        try {
          const r = await fetch(`/api/jamendo?search=${encodeURIComponent(q)}&limit=5`, { signal: AbortSignal.timeout(6000) });
          if (!r.ok) return [];
          const d = await r.json();
          return (d.results || []).map(t => ({
            type:'jamendo', audioUrl:t.audio, title:t.name, artist:t.artist_name,
            thumbnail:t.image, source:'jamendo', duration:t.duration, id:t.id,
          }));
        } catch { return []; }
      })();
      const fmaPromise = (async () => {
        // FMA API sudah mati (404) — skip, return kosong
        return [];
      })();
      const ccmixtPromise = (async () => {
        try {
          const r = await fetch(`/api/ccmixter?title=${encodeURIComponent(q)}&limit=5`, { signal: AbortSignal.timeout(6000) });
          if (!r.ok) return [];
          const d = await r.json();
          return (d || []).slice(0, 4).map(t => ({
            type:'ccmixter', audioUrl:t.files?.[0]?.download_url||null,
            title:t.upload_name, artist:t.user_real_name||t.user_name,
            thumbnail:t.upload_extra?.cover_url||null,
            source:'ccmixter', id:t.upload_id, externalUrl:t.file_page_url,
          }));
        } catch { return []; }
      })();
      // ── SoundCloud: user key → Audius (pihak ketiga, publik, audio bisa diputar) → iframe embed
      const scPublicPromise = !scHasKey ? (async () => {
        // Tier 1: Audius — API publik tanpa key, lagu indie/electronic/hip-hop, audio stream langsung
        try {
          // Ambil host Audius aktif dulu
          let audiusHost = 'https://discoveryprovider.audius.co';
          try {
            const hRes = await fetch('https://api.audius.co', { signal: AbortSignal.timeout(3000) });
            if (hRes.ok) {
              const hData = await hRes.json();
              audiusHost = (hData.data?.[0] || audiusHost).replace(/\/$/, '');
            }
          } catch {}
          const r = await fetch(
            `${audiusHost}/v1/tracks/search?query=${encodeURIComponent(q)}&limit=5&app_name=StarryNightPlayer`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (!r.ok) throw new Error('audius failed');
          const d = await r.json();
          const tracks = (d.data || []).filter(t => t.downloadable || t.access?.streaming);
          if (tracks.length === 0) throw new Error('no audius results');
          return tracks.slice(0, 5).map(t => ({
            type:'sc_track',
            id: `audius_${t.id}`,
            title: t.title,
            artist: t.user?.name || t.user?.handle || 'Audius',
            duration: t.duration || 0,
            thumbnail: t.artwork?.['150x150'] || t.artwork?.['480x480'] || null,
            permalinkUrl: `https://audius.co${t.permalink || ''}`,
            streamUrl: `${audiusHost}/v1/tracks/${t.id}/stream?app_name=StarryNightPlayer`,
            audioUrl: `${audiusHost}/v1/tracks/${t.id}/stream?app_name=StarryNightPlayer`,
            source:'audius',
          }));
        } catch {}
        // Tier 2: iframe embed fallback
        return [{ type:'sc_embed_fallback', query: q, source:'soundcloud' }];
      })() : Promise.resolve([]);

      // ── Spotify: user key → Deezer (pihak ketiga, publik, preview 30s) → iframe embed
      const spPublicPromise = !spHasKey ? (async () => {
        // Tier 1: Deezer via proxy — preview 30 detik mp3
        try {
          const r = await fetch(
            `/api/deezer?q=${encodeURIComponent(q)}&limit=5`,
            { signal: AbortSignal.timeout(6000) }
          );
          if (!r.ok) throw new Error('deezer failed');
          const d = await r.json();
          const tracks = (d.data || []).filter(t => t.preview);
          if (tracks.length === 0) throw new Error('no deezer results');
          return tracks.slice(0, 5).map(t => ({
            type:'sp_track',
            id: `deezer_${t.id}`,
            title: t.title,
            artist: t.artist?.name || 'Deezer',
            duration: (t.duration || 0) * 1000, // Deezer return detik, kode SP pakai ms
            cover: t.album?.cover_medium || t.album?.cover || null,
            previewUrl: t.preview || null,
            spotifyUrl: t.link || `https://www.deezer.com/track/${t.id}`,
            source:'deezer',
          }));
        } catch {}
        // Tier 2: iframe embed fallback
        return [{ type:'sp_embed_fallback', query: q, source:'spotify' }];
      })() : Promise.resolve([]);

      // ── SoundCloud: API search jika ada key
      const scPromise = scHasKey ? (async () => {
        try { const items = await searchSoundCloud(q, 5); return (items||[]).map(t=>({...t,source:'soundcloud',type:'soundcloud'})); } catch { return []; }
      })() : Promise.resolve([]);
      // ── Spotify: API search jika ada key
      const spPromise = spHasKey ? (async () => {
        try { const items = await searchSpotify(q, 5); return (items||[]).map(t=>({...t,source:'spotify',type:'spotify_track'})); } catch { return []; }
      })() : Promise.resolve([]);

      const [archRes, jamRes, fmaRes, ccRes, scWsRes, spWsRes, scPubRes, spPubRes] = await Promise.all([archivePromise, jamendoPromise, fmaPromise, ccmixtPromise, scPromise, spPromise, scPublicPromise, spPublicPromise]);
      // interleave sources agar tidak monoton
      const merged = [];
      // SoundCloud: tampilkan hasil API jika ada key, atau hasil public search (mirip YT), atau embed fallback
      if (scHasKey && scWsRes.length > 0) merged.push({ type:'sc_section', source:'soundcloud_section', _items: scWsRes });
      else if (!scHasKey && scPubRes.length > 0 && scPubRes[0].type !== 'sc_embed_fallback') merged.push({ type:'sc_section', source:'soundcloud_section', _items: scPubRes });
      else merged.push({ type:'sc_embed', source:'soundcloud_embed', query: q });
      // Spotify: tampilkan hasil API jika ada key, atau hasil public search (mirip YT), atau embed fallback
      if (spHasKey && spWsRes.length > 0) merged.push({ type:'sp_section', source:'spotify_section', _items: spWsRes });
      else if (!spHasKey && spPubRes.length > 0 && spPubRes[0].type !== 'sp_embed_fallback') merged.push({ type:'sp_section', source:'spotify_section', _items: spPubRes });
      else merged.push({ type:'sp_embed', source:'spotify_embed', query: q });
      const maxLen = Math.max(archRes.length, jamRes.length, fmaRes.length, ccRes.length);
      for (let i = 0; i < maxLen; i++) {
        if (jamRes[i])  merged.push(jamRes[i]);
        if (fmaRes[i])  merged.push(fmaRes[i]);
        if (archRes[i]) merged.push(archRes[i]);
        if (ccRes[i])   merged.push(ccRes[i]);
      }
      const hasRealResults = archRes.length+jamRes.length+fmaRes.length+ccRes.length+scWsRes.length+spWsRes.length+scPubRes.filter(x=>x.type!=='sc_embed_fallback').length+spPubRes.filter(x=>x.type!=='sp_embed_fallback').length > 0;
      // Selalu set results — SC & Spotify selalu ditampilkan
      setWsResults(merged);
      if (!hasRealResults && merged.every(m=>m.type==='sc_embed'||m.type==='sp_embed')) {
        setWsError('No results from other sources. SoundCloud & Spotify shown as embeds.');
      }
    } catch(e) { setWsError('Pencarian gagal: ' + (e.message||'error')); }
    setWsLoading(false);
  };

  const doSpotifySearch = async (q) => {
    if (!q.trim()) return;
    setSpLoading(true); setSpError(null); setSpResults([]);
    const items = await searchSpotify(q);
    if (items && items.length > 0) setSpResults(items);
    else setSpError(t?.noResults||'No results found.');
    setSpLoading(false);
  };

  const playSpotifyPreview = (track) => {
    if (!track.previewUrl) {
      // Tidak ada preview: redirect ke Spotify web
      if (track.spotifyUrl) {
        window.open(track.spotifyUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    // Toggle pause jika lagu yang sama
    if (spTrack?.id === track.id && spPlaying) {
      if (spPreviewRef.current) spPreviewRef.current.pause();
      setSpPlaying(false); return;
    }

    // Fungsi yang benar-benar mulai audio baru + koneksi ke EQ chain
    const startNew = () => {
      if (spPreviewRef.current) { spPreviewRef.current.pause(); spPreviewRef.current = null; }

      const audio = new Audio(track.previewUrl);
      // crossOrigin diperlukan agar Web Audio API bisa mengakses stream cross-origin
      audio.crossOrigin = 'anonymous';
      audio.volume = 0.8;
      audio.play().then(() => { setSpPlaying(true); setSpTrack(track); setTab('player'); }).catch(() => {});
      audio.onended = () => setSpPlaying(false);
      spPreviewRef.current = audio;
      setSpTrack(track);
    };

    // Check permissions
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      startNew();
    } else {
      startNew();
    }
  };

  const searchViaYouTubeAPI = async (query) => {
    if (!isYtApiEnabled()) return null;
    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 7000);
      const userKey = getYtKey();
      let res;
      if (userKey) {
        const params = new URLSearchParams({
          key: userKey, part: 'snippet', q: query, type: 'video',
          videoCategoryId: '10', maxResults: '10',
          fields: 'items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails/medium)',
        });
        res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { signal: ctrl.signal });
      } else {
        const params = new URLSearchParams({ action: 'search', q: query, maxResults: '10' });
        res = await fetch(`/api/youtube?${params}`, { signal: ctrl.signal });
      }
      clearTimeout(tid);
      if (!res.ok) return null;
      const data = await res.json();
      const items = (data.items || []).filter(i => i.id?.videoId);
      if (items.length === 0) return null;
      return items.map(i => ({
        videoId: i.id.videoId,
        title: i.snippet.title,
        uploaderName: i.snippet.channelTitle,
        duration: 0, // Search API tidak return durasi; diambil saat play
        thumbnail: i.snippet.thumbnails?.medium?.url ||
                   `https://i.ytimg.com/vi/${i.id.videoId}/mqdefault.jpg`,
        url: `/watch?v=${i.id.videoId}`,
      }));
    } catch { return null; }
  };

  const searchViaPiped = async (query) => {
    for (const base of PIPED_INSTANCES) {
      try {
        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), 5000);
        const res  = await fetch(buildPipedUrl(base, '/search', { q: query, filter: 'music_songs' }), { signal: ctrl.signal });
        clearTimeout(tid);
        if (!res.ok) continue;
        const data = await res.json();
        const items = (data.items || []).filter(i => i.url && i.url.includes('watch')).slice(0, 10).map(i => ({
          ...i,
          videoId: i.url ? (i.url.match(/[?&v=]([^&]{11})/)?.[1] || i.url.replace('/watch?v=','')) : i.videoId,
          thumbnail: i.thumbnail || (i.url ? `https://i.ytimg.com/vi/${i.url.replace('/watch?v=','')}/mqdefault.jpg` : ''),
          uploaderName: i.uploaderName || i.uploader || i.channel || 'YouTube',
          duration: i.duration || i.lengthSeconds || 0,
        }));
        if (items.length > 0) return items;
      } catch { /* try next */ }
    }
    return null;
  };

  // Try Invidious API instances
  const searchViaInvidious = async (query) => {
    for (const base of INVIDIOUS_INSTANCES) {
      try {
        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), 5000);
        const res  = await fetch(buildInvidiousUrl(base, '/api/v1/search', { q: query, type: 'video', fields: 'videoId,title,author,lengthSeconds,videoThumbnails' }), { signal: ctrl.signal });
        clearTimeout(tid);
        if (!res.ok) continue;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) continue;
        // Normalize to Piped format
        return data.slice(0, 10).map(v => ({
          url: `/watch?v=${v.videoId}`,
          title: v.title,
          uploaderName: v.author,
          duration: v.lengthSeconds || 0,
          thumbnail: v.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
          videoId: v.videoId,
        }));
      } catch { /* try next */ }
    }
    return null;
  };

  // Fallback: AI-powered search recommendation
  const searchViaAI = async (query) => {
    if (!hasKey()) return null;
    try {
      const r = await askAIRace(
        `Berikan 5 video YouTube untuk musik "${query}". Format JSON array: [{"videoId":"xxx","title":"...","uploaderName":"...","duration":240}]. Hanya JSON, tanpa penjelasan.`,
        'You are a music assistant. Provide valid YouTube videoIds for popular songs. Ensure valid JSON format.'
      );
      const clean = r.replace(/```json|```/g, '').trim();
      const items = JSON.parse(clean);
      if (Array.isArray(items) && items.length > 0) {
        return items.map(v => ({
          url: `/watch?v=${v.videoId}`,
          title: v.title,
          uploaderName: v.uploaderName || 'YouTube',
          duration: v.duration || 0,
          thumbnail: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
          videoId: v.videoId,
        }));
      }
    } catch { /* silent fail */ }
    return null;
  };

  // ── Core playback (moved here to avoid TDZ in useCallback closures below)
  const [track, setTrack]       = useState(SONGS[0]);
  const [playing, setPlaying]   = useState(false);
  const playingRef = useRef(false); // sync ref agar useEffect [track.src] bisa baca playing terbaru
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume]     = useState(0.75);
  const [muted, setMuted]       = useState(false);
  const [liked, setLiked]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('sn_liked') || '{}'); } catch { return {}; }
  });
  const [tab, setTab]           = useState(() => localStorage.getItem('sn_tab') || 'player');

  // Fetch live trending music from Invidious/Piped → shown as suggestion chips
  const fetchYtTrending = useCallback(async () => {
    if (ytTrendingLoading || ytTrending.length > 0) return; // only fetch once per session
    setYtTrendingLoading(true);
    try {
      // ── Prioritas 1: YouTube Data API v3 (paling akurat, regionCode=ID)
      if (isYtApiEnabled()) {
        try {
          const ctrl = new AbortController();
          setTimeout(() => ctrl.abort(), 7000);
          const userKey = getYtKey();
          let res;
          if (userKey) {
            const params = new URLSearchParams({
              key: userKey, part: 'snippet,contentDetails', chart: 'mostPopular',
              videoCategoryId: '10', regionCode: 'ID', maxResults: '5',
              fields: 'items(id,snippet/title,snippet/channelTitle,snippet/thumbnails/medium,contentDetails/duration)',
            });
            res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`, { signal: ctrl.signal });
          } else {
            const params = new URLSearchParams({ action: 'trending', regionCode: 'ID', maxResults: '5', videoCategoryId: '10' });
            res = await fetch(`/api/youtube?${params}`, { signal: ctrl.signal });
          }
          if (res.ok) {
            const data = await res.json();
            const chips = (data.items || []).slice(0, 5).map(v => {
              let label = v.snippet?.title || '';
              if (label.length > 22) label = label.slice(0, 20) + '…';
              return { label, query: v.snippet?.title || label };
            });
            if (chips.length > 0) {
              setYtTrending(chips);
              setYtTrendingLoading(false);
              return;
            }
          }
        } catch { /* fallback ke Invidious */ }
      }

      // ── Prioritas 2: Invidious trending (music category = 10)
      for (const base of INVIDIOUS_INSTANCES) {
        try {
          const ctrl = new AbortController();
          const tid  = setTimeout(() => ctrl.abort(), 5000);
          const res  = await fetch(buildInvidiousUrl(base, '/api/v1/trending', { type: 'Music', fields: 'title,videoId' }), { signal: ctrl.signal });
          clearTimeout(tid);
          if (!res.ok) continue;
          const data = await res.json();
          if (!Array.isArray(data) || data.length === 0) continue;
          // Extract clean titles without artist prefix for chip labels
          const chips = data.slice(0, 5).map(v => {
            // Shorten title to ≤22 chars for chip display
            let label = v.title || '';
            if (label.length > 22) label = label.slice(0, 20) + '…';
            return { label, query: v.title };
          });
          setYtTrending(chips);
          setYtTrendingLoading(false);
          return;
        } catch { /* try next */ }
      }
      // Fallback: try Piped trending
      for (const base of PIPED_INSTANCES) {
        try {
          const ctrl = new AbortController();
          const tid  = setTimeout(() => ctrl.abort(), 5000);
          const res  = await fetch(buildPipedUrl(base, '/trending', { region: 'ID' }), { signal: ctrl.signal });
          clearTimeout(tid);
          if (!res.ok) continue;
          const data = await res.json();
          if (!Array.isArray(data) || data.length === 0) continue;
          const chips = data.slice(0, 5).map(v => {
            let label = v.title || '';
            if (label.length > 22) label = label.slice(0, 20) + '…';
            return { label, query: v.title };
          });
          setYtTrending(chips);
          setYtTrendingLoading(false);
          return;
        } catch { /* try next */ }
      }
    } catch { /* silent */ }
    // Hard fallback — popular Indonesian/global chips
    setYtTrending([
      { label:'Top hits 2025', query:'top hits 2025' },
      { label:'Lo-fi hip hop', query:'lo-fi hip hop' },
      { label:'Pop Indonesia', query:'pop Indonesia terbaru' },
      { label:'K-pop playlist', query:'kpop playlist 2025' },
      { label:'Indie acoustic', query:'indie acoustic' },
      { label:'OPM hits', query:'OPM hits 2025' },
      { label:'Chill vibes', query:'chill vibes music' },
      { label:'R&B 2025', query:'RnB 2025' },
    ].slice(0, 5));
    setYtTrendingLoading(false);
  }, [ytTrendingLoading, ytTrending.length]); // eslint-disable-line

  const searchYouTube = async (platformId, query) => {
    if (!query.trim()) return;

    // Deteksi URL YouTube → langsung play
    const ytUrlMatch = query.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytUrlMatch) {
      const videoId = ytUrlMatch[1];
      playYouTube({ videoId, title: query, uploaderName: 'YouTube', duration: 0, thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` }, [], 0);
      return;
    }

    setYtLoading(p => ({...p, [platformId]: true}));
    setYtError(p => ({...p, [platformId]: null}));
    setYtResults(p => ({...p, [platformId]: []}));

    // Coba YouTube Data API v3 dulu (jika key tersedia — hasil paling akurat)
    let items = await searchViaYouTubeAPI(query);

    // Fallback: Piped
    if (!items) items = await searchViaPiped(query);

    // Fallback: Invidious
    if (!items) items = await searchViaInvidious(query);

    // Fallback to AI recommendation
    if (!items) items = await searchViaAI(query);

    if (items && items.length > 0) {
      setYtResults(p => ({...p, [platformId]: items}));
    } else {
      setYtError(p => ({...p, [platformId]: t?.searchFailed||'Search failed.'}));
    }
    setYtLoading(p => ({...p, [platformId]: false}));
  };

  const playYouTube = (item, queue, queueIdx) => {
    // Support Piped format (url), Invidious format (videoId), or direct videoId
    let videoId = item.videoId || null;
    if (!videoId) {
      const match = (item.url || '').match(/[?&]v=([^&]+)/);
      videoId = match ? match[1] : (item.url || '').replace('/watch?v=', '');
    }
    if (!videoId || videoId.length < 5) return;
    const secs  = item.duration || item.lengthSeconds || 0;
    const dur   = secs > 0 ? `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}` : '';
    const thumb = item.thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
    const ytTrack = { type:'youtube', videoId, title:item.title, artist:item.uploaderName||item.author||'YouTube', thumbnail:thumb, duration:dur, durationSecs:secs };
    const doSwitch = () => {
      stopAllMedia('embed');
      setEmbedTrack(ytTrack);
      setYtProgress(0); setYtDuration(secs||0);
      if (queue) { ytQueueRef.current = queue; ytQueueIdxRef.current = queueIdx ?? queue.findIndex(v=>(v.videoId||v.url?.includes(videoId))===videoId); }
      setEmbedMinimized(false);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      setRadioStation(null);
      setRadioPlaying(false);
      setPlaying(true);
      setTab('player');
    };
    doSwitch();
  };


  // ── Tutup semua media aktif sebelum switch ke sumber baru
  // mode: 'radio' | 'embed' | 'local'
  const stopAllMedia = (incomingMode) => {
    // Tutup YouTube embed
    if (incomingMode !== 'embed') {
      if (embedTrack?.type === 'youtube' && ytIframeRef.current) {
        try { ytIframeRef.current.contentWindow.postMessage(JSON.stringify({ event:'command', func:'pauseVideo', args:'' }), '*'); } catch(_) {}
      }
      setEmbedTrack(null);
      setYtProgress(0); setYtDuration(0);
      ytQueueRef.current=[]; ytQueueIdxRef.current=-1;
    }
    // Tutup SoundCloud widget
    if (incomingMode !== 'embed') {
      setScWidget({});
    }
    // Stop audio jika sedang radio dan incoming bukan radio
    if (incomingMode !== 'radio' && track?.isRadio) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (radioReconnectRef.current) { clearTimeout(radioReconnectRef.current); radioReconnectRef.current = null; }
      radioReconnectCount.current = 0;
      setStreamBuffering(false);
      setRadioPlaying(false);
    }
    // Stop audio jika incoming adalah radio/embed (bukan lokal)
    // Khusus embed-to-embed (YT next/prev): jangan setPlaying(false) — biarkan playYouTube yang set
    if (incomingMode !== 'local' && incomingMode !== 'embed' && !track?.isRadio) {
      setPlaying(false);
    }
  };

  // ── Play web-search native audio (Jamendo/FMA/ccMixter)
  const playWsTrack = useCallback((item, queue, queueIdx) => {
    const srcColors = { jamendo:'#f0c020', fma:'#5cb85c', ccmixter:'#e74c3c', audius:'#cc0000', deezer:'#a238ff' };
    const srcBgs    = { jamendo:'rgba(240,192,32,0.15)', fma:'rgba(92,184,92,0.15)', ccmixter:'rgba(231,76,60,0.15)', audius:'rgba(204,0,0,0.15)', deezer:'rgba(162,56,255,0.15)' };
    const nativeTrack = {
      id: `ws_${item.source}_${item.id||item.audioUrl}`,
      title: item.title,
      artist: item.artist || item.source,
      album: item.source === 'jamendo' ? 'Jamendo' : item.source === 'fma' ? 'Free Music Archive' : item.source === 'audius' ? 'Audius' : item.source === 'deezer' ? 'Deezer Preview' : 'ccMixter',
      cover: item.thumbnail || '',
      src: item.audioUrl,
      color: srcColors[item.source] || '#6366f1',
      bg: srcBgs[item.source] || 'rgba(99,102,241,0.15)',
      mood: '',
      _wsSource: item.source,
    };
    if (queue) {
      wsQueueRef.current   = queue;
      wsQueueIdxRef.current = queueIdx ?? 0;
    }
    stopAllMedia('local');
    setEmbedTrack(null);
    setCustomSongs(prev => { const ex = prev.find(s=>s.id===nativeTrack.id); return ex ? prev : [nativeTrack, ...prev]; });
    setTrack(nativeTrack);
    setProgress(0); setDuration(0);
    setPlaying(true);
    setTab('player');
  }, []); // eslint-disable-line

  const wsNext = useCallback(() => {
    const q = wsQueueRef.current; if (!q.length) return;
    const nextIdx = wsQueueIdxRef.current + 1;
    if (nextIdx < q.length) { wsQueueIdxRef.current = nextIdx; playWsTrack(q[nextIdx], q, nextIdx); }
  }, [playWsTrack]);

  const wsPrev = useCallback(() => {
    const q = wsQueueRef.current; if (!q.length) return;
    const prevIdx = wsQueueIdxRef.current - 1;
    if (prevIdx >= 0) { wsQueueIdxRef.current = prevIdx; playWsTrack(q[prevIdx], q, prevIdx); }
  }, [playWsTrack]);

  const playSoundCloud = (platformId, query) => {
    if (!query.trim()) return;
    const q = query.trim();
    if (q.includes('soundcloud.com/')) {
      setScWidget(p => ({...p, [platformId]: q}));
    } else {
      window.open(`https://soundcloud.com/search?q=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer');
    }
  };


  const closeEmbed = () => { setEmbedTrack(null); setPlaying(false); setYtProgress(0); setYtDuration(0); ytQueueRef.current=[]; ytQueueIdxRef.current=-1; };

  // ── YouTube seek via postMessage
  const seekYt = useCallback((pct) => {
    if (!ytIframeRef.current || !ytDuration) return;
    const t = pct * ytDuration;
    setYtProgress(t);
    ytIframeRef.current.contentWindow.postMessage(JSON.stringify({ event:'command', func:'seekTo', args:[t, true] }), '*');
  }, [ytDuration]);

  // ── YouTube queue navigation
  const ytNext = useCallback(() => {
    const q = ytQueueRef.current;
    if (repeatRef.current === 'one') {
      // Ulangi video yang sama: seekTo 0 lalu play
      try {
        ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'seekTo', args:[0, true] }), '*');
        setTimeout(() => {
          try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'playVideo', args:'' }), '*'); } catch(_) {}
        }, 150);
      } catch(_) {}
      return;
    }
    // Single video (queue kosong atau 1 item) — repeat all → restart; shuffle → restart
    if (!q.length || q.length === 1) {
      if (repeatRef.current === 'all' || shuffleRef.current) {
        // Harus seekTo(0) langsung ke iframe, bukan via seekYt(pct) yang butuh ytDuration
        try {
          ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'seekTo', args:[0, true] }), '*');
          setTimeout(() => {
            try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'playVideo', args:'' }), '*'); } catch(_) {}
          }, 150);
        } catch(_) {}
      } else {
        setPlaying(false);
      }
      return;
    }
    if (shuffleRef.current) {
      // Acak: pilih lagu lain secara random dari queue
      const others = q.filter((_, i) => i !== ytQueueIdxRef.current);
      const pool = others.length ? others : q;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      const idx = q.indexOf(picked);
      ytQueueIdxRef.current = idx;
      playYouTube(q[idx], q, idx);
      return;
    }
    const nextIdx = ytQueueIdxRef.current + 1;
    if (nextIdx >= q.length) {
      if (repeatRef.current === 'all') {
        ytQueueIdxRef.current = 0;
        playYouTube(q[0], q, 0);
        return;
      }
      setPlaying(false);
      return;
    }
    ytQueueIdxRef.current = nextIdx;
    playYouTube(q[nextIdx], q, nextIdx);
  }, [seekYt]); // eslint-disable-line

  const ytPrev = useCallback(() => {
    const q = ytQueueRef.current; if (!q.length) return;
    if (ytProgress > 3) { seekYt(0); return; }
    const idx = (ytQueueIdxRef.current - 1 + q.length) % q.length;
    ytQueueIdxRef.current = idx;
    playYouTube(q[idx], q, idx);
  }, [seekYt, ytProgress]); // eslint-disable-line

  const ytShuffle = useCallback(() => {
    const q = ytQueueRef.current; if (!q.length) return;
    const idx = Math.floor(Math.random()*q.length);
    ytQueueIdxRef.current = idx;
    playYouTube(q[idx], q, idx);
  }, []); // eslint-disable-line

  const wsShuffle = useCallback(() => {
    const q = wsQueueRef.current; if (!q.length) return;
    const idx = Math.floor(Math.random()*q.length);
    wsQueueIdxRef.current = idx;
    playWsTrack(q[idx], q, idx);
  }, [playWsTrack]);

  // ── Helper: update ❤️ Favorit playlist on like/unlike
  const updateFavPlaylist = useCallback((id, isLiked) => {
    setPlaylists(p => p.map(pl => {
      if (pl.id !== 'pl_fav') return pl;
      if (isLiked) return pl.songIds.includes(id) ? pl : { ...pl, songIds: [...pl.songIds, id] };
      return { ...pl, songIds: pl.songIds.filter(s => s !== id) };
    }));
  }, []);

  // ── Toggle like for SC / Spotify / Radio tracks (adds to favSongs + pl_fav)
  const toggleFav = useCallback((id, songObj = null) => {
    setLiked(l => {
      const nowLiked = !l[id];
      updateFavPlaylist(id, nowLiked);
      if (songObj) {
        if (nowLiked) setFavSongs(p => p.find(s => s.id === id) ? p : [...p, songObj]);
        else setFavSongs(p => p.filter(s => s.id !== id));
      } else {
        // Regular track already in allSongs — just update pl_fav
      }
      return { ...l, [id]: nowLiked };
    });
  }, [updateFavPlaylist]); // eslint-disable-line

  // ── YouTube audio cache state
  const [cachedYtIds, setCachedYtIds]       = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sn_cached_yt_ids') || '[]')); }
    catch { return new Set(); }
  });
  const [ytDownloadingIds, setYtDownloadingIds] = useState(new Set()); // sedang didownload
  const [ytDownloadProg, setYtDownloadProg]     = useState({}); // videoId → 0-100
  // videoId yang di-love waktu Lite (belum di-download); akan didownload saat beralih ke Pro
  const [likedYtPending, setLikedYtPending] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sn_liked_yt_pending') || '[]')); }
    catch { return new Set(); }
  });

  // ── Helper: download audio YT ke cache (dipanggil di Pro saat love, atau saat Lite→Pro)
  const triggerYtDownload = useCallback((videoId) => {
    // Skip jika sudah di-cache atau sedang didownload
    if (cachedYtIds.has(videoId) || ytDownloadingIds.has(videoId)) return;
    setYtDownloadingIds(prev => new Set([...prev, videoId]));
    setYtDownloadProg(prev => ({ ...prev, [videoId]: 0 }));
    const ctrl = new AbortController();
    downloadYtAudio(
      videoId,
      (pct) => setYtDownloadProg(prev => ({ ...prev, [videoId]: pct })),
      ctrl.signal
    ).then(() => {
      setCachedYtIds(prev => new Set([...prev, videoId]));
      setYtDownloadingIds(prev => { const n = new Set(prev); n.delete(videoId); return n; });
      setYtDownloadProg(prev => { const n = { ...prev }; delete n[videoId]; return n; });
      // Hapus dari pending jika ada
      setLikedYtPending(prev => { const n = new Set(prev); n.delete(videoId); return n; });
    }).catch(() => {
      setYtDownloadingIds(prev => { const n = new Set(prev); n.delete(videoId); return n; });
      setYtDownloadProg(prev => { const n = { ...prev }; delete n[videoId]; return n; });
    });
  }, [cachedYtIds, ytDownloadingIds]); // eslint-disable-line

  // ── Like a YouTube track → save to ytSongs + liked state
  const likeYtTrack = useCallback(() => {
    if (!embedTrack || embedTrack.type !== 'youtube') return;
    const id = `yt_${embedTrack.videoId}`;
    const videoId = embedTrack.videoId;
    const nowLiked = !liked[id]; // eslint-disable-line
    setLiked(l => ({ ...l, [id]: !l[id] }));
    updateFavPlaylist(id, nowLiked);
    setYtSongs(prev => {
      if (prev.find(s => s.id === id)) return prev;
      return [...prev, {
        id, type:'youtube', videoId,
        title:embedTrack.title, artist:embedTrack.artist,
        album:'YouTube', cover:embedTrack.thumbnail||'',
        src:'', color:'#ff4444', bg:'rgba(255,68,68,0.15)', mood:'youtube',
        thumbnail:embedTrack.thumbnail, duration:embedTrack.durationSecs||0,
      }];
    });

    // ── Cache audio: Pro → langsung download; Lite → simpan ke pending
    if (nowLiked) {
      if (!isLite) {
        // Pro: langsung download audio ke cache
        triggerYtDownload(videoId);
      } else {
        // Lite: tandai sebagai pending, download nanti saat beralih ke Pro
        setLikedYtPending(prev => new Set([...prev, videoId]));
      }
    } else {
      // Un-love: hapus dari pending (tidak hapus cache yang sudah ada)
      setLikedYtPending(prev => { const n = new Set(prev); n.delete(videoId); return n; });
    }
  }, [embedTrack, liked, updateFavPlaylist, isLite, triggerYtDownload]); // eslint-disable-line

  // ── Saat Lite → Pro: download semua pending YT liked yang belum ter-cache
  useEffect(() => {
    if (isLite) return; // hanya aktif saat Pro
    const pending = [...likedYtPending].filter(vid => !cachedYtIds.has(vid));
    if (pending.length === 0) return;
    // Download semua yang pending satu per satu (sequential agar tidak overload)
    let cancelled = false;
    (async () => {
      for (const videoId of pending) {
        if (cancelled) break;
        triggerYtDownload(videoId);
        // Jeda 1 detik antar download agar tidak throttle
        await new Promise(r => setTimeout(r, 1000));
      }
    })();
    return () => { cancelled = true; };
  }, [isLite]); // eslint-disable-line react-hooks/exhaustive-deps


  // ── Jam live (update setiap detik)
  const [nowTime, setNowTime] = useState(() => new Date());

  // ── New playback features
  const [shuffle, setShuffle] = useState(() => localStorage.getItem('sn_shuffle') === 'true');
  const [repeat, setRepeat]   = useState(() => localStorage.getItem('sn_repeat') || 'off');
  const [history, setHistory]   = useState([]);

  // ── Sleep timer
  const [sleepTimer, setSleepTimer]   = useState(null);
  const sleepIntervalRef              = useRef(null);

  // ── Lyrics
  const [lyrics, setLyrics]           = useState('');
  const [lyricsLoading, setLL]        = useState(false);
  const [lyricsTranslation, setLyricsTranslation] = useState('');
  const [lyricsTranslating, setLyricsTranslating] = useState(false);
  const [lyricsGenerated, setLyricsGenerated] = useState(false);
  const [lyricsNeedGenerate, setLyricsNeedGenerate] = useState(false);
  const [lyricsGenerating, setLyricsGenerating] = useState(false);
  const [lyricsRomanized, setLyricsRomanized] = useState('');
  const [lyricsRomanizing, setLyricsRomanizing] = useState(false);
  // Cache in-memory lirik: key = "title|artist", value = { text, generated }
  const lyricsCacheRef = useRef(new Map());

  // ── Settings panel
  const [showSettings, setShowSettings] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const fullscreenRef = useRef(false);
  useEffect(() => {
    fullscreenRef.current = fullscreen;
    window.dispatchEvent(new Event('resize')); // re-trigger layout calc
  }, [fullscreen]);

  // ── Queue / search
  const [searchQuery, setSearchQuery]   = useState('');

  // ── AI
  const [aiSubView, setAiSubView] = useState('chat'); // 'chat' | 'lyrics' | 'foryou'
  const aiSwipeTouchRef = useRef({ x: 0, y: 0 }); // for swipe navigation between sub-tabs
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  // ── Personalisasi state
  const [personaStep, setPersonaStep] = useState(() => {
    try { return localStorage.getItem('sn_persona_done') === '1' ? 'result' : 'onboard'; } catch { return 'onboard'; }
  });
  const [personaPrefs, setPersonaPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sn_persona_prefs') || 'null') || { categories: [], moods: [], timeOfDay: '', lang: '' }; } catch { return { categories: [], moods: [], timeOfDay: '', lang: '' }; }
  });
  const [personaRecs, setPersonaRecs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sn_persona_recs') || 'null') || null; } catch { return null; }
  });
  const [personaLoading, setPL] = useState(false);
  const [popularRecs, setPopularRecs] = useState(null);
  const [popularLoading, setPopularLoading] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // ── AI
  const [insight, setInsight]   = useState('');
  const [insightLoading, setIL] = useState(false);
  const [messages, setMessages] = useState(() => {
    const _lang = (() => { try { return localStorage.getItem('sn_lang') || 'id'; } catch { return 'id'; } })();
    const greetings = _lang === 'en' ? [
      'Hey! 👋 What are you up to? Want to chat or find the perfect song for the vibe?',
      'Hi~ I\'m Starry ✨ Tell me anything — music, your day, or just hang out 😊',
      'Welcome! 🌙 Happy, sad, or just need some company? I\'m here',
      'Heyy! Request a song, vent, or ask anything — I\'m all ears 🎶',
      'Hey! How can I help? Music chat, song recommendations, or just a convo — all good 🌟',
      'Hi! I\'m Starry — your music buddy and chat companion 💫 Where do we start?',
      'Heyy, what\'s the mood today? I can find the perfect song or we can just talk 😄',
      'Good evening~ ✨ (or morning, or afternoon!) What\'s on your mind?',
      'Hey! Bored? Happy? Sad? Whatever it is, I\'m here for it 🎵',
      'Hi! Don\'t be shy — ask about music, request recommendations, or just chat 🌠',
    ] : [
      'Halo! 👋 Lagi ngapain nih? Mau ngobrol santai atau cari lagu yang pas buat suasana sekarang?',
      'Hai~ aku Starry ✨ Bisa cerita apa aja ke aku — soal musik, hari ini, atau sekadar pengen ngobrol 😊',
      'Selamat datang! 🌙 Lagi seneng, galau, atau cuma pengen teman menemani? Aku di sini kok',
      'Heyy! Mau request lagu, curhat, atau tanya apa pun — aku siap dengerin 🎶',
      'Halo! Ada yang bisa aku bantu? Mau ngobrolin musik, nyari lagu sesuai mood, atau sekadar ngobrol juga bisa 🌟',
      'Hai! Aku Starry — teman dengerin musik sekaligus teman ngobrol kamu 💫 Mau mulai dari mana?',
      'Heyy, lagi mood apa nih? Aku bisa cariin lagu yang pas, atau kita ngobrol dulu juga gapapa 😄',
      'Selamat malam~ ✨ (atau pagi, atau siang!) Mau cerita apa hari ini?',
      'Halo! Bosen? Seneng? Galau? Apapun itu, aku siap temenin 🎵',
      'Hai! Jangan sungkan ya — mau nanya soal lagu, minta rekomendasi, atau pengen ngobrol santai aja, semua boleh 🌠',
    ];
    return [{ from:'ai', text: greetings[Math.floor(Math.random() * greetings.length)] }];
  });
  const [input, setInput]       = useState('');
  const [chatLoading, setCL]    = useState(false);
  const [activeModelLabel, setActiveModelLabel] = useState('');
  const [vibeInput, setVibeInput] = useState('');
  const [vibeLoading, setVL]    = useState(false);
  const [chatMode, setChatMode]   = useState('chat'); // 'chat' | 'mood'

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
  const [isOnline, setIsOnline]         = useState(() => navigator.onLine);
  const [cachedDriveIds, setCachedDriveIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sn_cached_drive_ids') || '[]')); }
    catch { return new Set(); }
  });
  const [showUpload, setShowUpload]     = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [uploadProgress, setUploadProg] = useState(0);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [streamBuffering, setStreamBuffering] = useState(false); // buffering indicator untuk radio/stream
  const [driveDownProg, setDriveDownProg] = useState(0);   // 0-100, only in Pro mode
  const [drivePhase, setDrivePhase]       = useState('idle'); // 'idle' | 'check' | 'download'
  const [driveError, setDriveError]     = useState('');

  const [globalCover, setGlobalCover]   = useState(() => localStorage.getItem('sn_global_cover') || '');
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const coverInputRef = useRef(null);

  // Helper: ambil cover aktif (globalCover override semua)
  const getCover = useCallback((song) => isLite ? (globalCover || '') : (globalCover || song?.cover || ''), [globalCover, isLite]);

  // ── Playlists
  const [playlists, setPlaylists]         = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sn_playlists') || 'null');
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return [
      { id:'pl_fav', name:'❤️ Favorit', songIds:[], locked:true },
      { id:'pl_chill', name:'🌙 Chill Night', songIds:[], locked:false },
    ];
  });
  const [activePl, setActivePl]           = useState(null); // null = all songs, else playlist id
  const [showPlModal, setShowPlModal]     = useState(false);
  const [editingPl, setEditingPl]         = useState(null);
  const [plView, setPlView]               = useState('list'); // 'list' | 'detail' | 'form'
  const [mySongsEditMode, setMySongsEditMode] = useState(false);

  // ── Responsive
  const [ringSize, setRingSize] = useState(260);
  const [isDesktop, setIsDesktop] = useState(() => !isPhoneDevice());
  // layoutMode: 'mobile-portrait' | 'mobile-landscape' | 'desktop-portrait' | 'desktop-landscape'
  // Phone → mobile layout; Tablet/Desktop/Laptop → desktop layout
  const [layoutMode, setLayoutMode] = useState(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const isLandscape = vw > vh;
    const isPhone = isPhoneDevice();
    if (!isPhone && isLandscape) return 'desktop-landscape';
    if (!isPhone && !isLandscape) return 'desktop-portrait';
    if (isPhone && isLandscape) return 'mobile-landscape';
    return 'mobile-portrait';
  });
  const [layoutVars, setLayoutVars] = useState({
    playerPad: '6px 16px 8px', trackTitleSize: '15px', artistSize: '10px',
    controlsGap: '10px', actionPad: '6px 0', volumeMt: '6px',
    controlsMt: '8px', infoMt: '6px',
  });

  // ── Refs
  const audioRef            = useRef(null);
  const hlsRef              = useRef(null);   // HLS.js instance untuk stream .m3u8
  const radioReconnectRef   = useRef(null);   // setTimeout handle untuk auto-reconnect
  const radioReconnectCount = useRef(0);       // berapa kali sudah reconnect
  const chatEndRef    = useRef(null);
  const ytMusicSectionRef = useRef(null);
  const tokenRef      = useRef(null);
  const isLiteRef     = useRef(isLite);
  const shuffleRef    = useRef(shuffle);
  const repeatRef     = useRef(repeat);
  const goNextRef     = useRef(null); // avoids stale closure in onEnd
  const ytNextRef     = useRef(null); // avoids stale closure in YT onStateChange
  const wsNextRef     = useRef(null); // avoids stale closure in ws queue auto-advance

  // ── Keep refs in sync
  useEffect(() => { shuffleRef.current  = shuffle;   }, [shuffle]);
  useEffect(() => { repeatRef.current   = repeat;    }, [repeat]);
  useEffect(() => { tokenRef.current    = accessToken; }, [accessToken]);
  useEffect(() => { isLiteRef.current   = isLite;    }, [isLite]);
  useEffect(() => { spPlayingRef.current = spPlaying; }, [spPlaying]);

  // ── Jam live — sinkron ke batas detik agar tidak drift
  useEffect(() => {
    let id;
    const schedule = () => {
      setNowTime(new Date());
      const msUntilNext = 1000 - (new Date().getMilliseconds());
      id = setTimeout(schedule, msUntilNext);
    };
    const msUntilFirst = 1000 - (new Date().getMilliseconds());
    id = setTimeout(schedule, msUntilFirst);
    return () => clearTimeout(id);
  }, []);

  // ── Persist preferences to localStorage
  useEffect(() => { localStorage.setItem('sn_tab', tab); if (tab !== 'player') setFullscreen(false); }, [tab]);
  useEffect(() => { localStorage.setItem('sn_shuffle', shuffle); }, [shuffle]);
  useEffect(() => { localStorage.setItem('sn_repeat', repeat); }, [repeat]);
  useEffect(() => { try { localStorage.setItem('sn_liked', JSON.stringify(liked)); } catch {} }, [liked]);
  useEffect(() => { try { localStorage.setItem('sn_playlists', JSON.stringify(playlists)); } catch {} }, [playlists]);
  useEffect(() => { try { localStorage.setItem('sn_fav_songs', JSON.stringify(favSongs)); } catch {} }, [favSongs]);
  useEffect(() => { try { localStorage.setItem('sn_yt_songs', JSON.stringify(ytSongs)); } catch {} }, [ytSongs]);

  // ── Silent token refresh — dipindah ke sini agar tersedia sebelum useEffect lain
  const silentRefreshToken = useCallback(() => new Promise((resolve, reject) => {
    if (!window.google || !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('GANTI_DENGAN')) {
      return reject(new Error('Google API tidak tersedia'));
    }
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID, scope: GOOGLE_SCOPES,
        prompt: '',        // no user interaction required
        callback: resp => {
          if (resp.error) return reject(new Error(resp.error));
          const tok = resp.access_token;
          setAccessToken(tok); tokenRef.current = tok;
          localStorage.setItem('sn_google_token', JSON.stringify({ token: tok, expiry: Date.now() + 3500 * 1000 }));
          resolve(tok);
        }
      });
      client.requestAccessToken({ prompt: '' });
    } catch(e) { reject(e); }
  }), []);

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

  // ── Online / Offline detection
  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  // ── Restore Drive song metadata from localStorage when offline (no token needed)
  useEffect(() => {
    if (isOnline) return; // Hanya saat offline
    try {
      const saved = JSON.parse(localStorage.getItem('sn_drive_meta') || '[]');
      if (saved.length > 0 && customSongs.length === 0) {
        // Tandai semua sebagai perlu re-fetch src (akan cek cache saat diputar)
        setCustomSongs(saved.map(s => ({ ...s, src: null })));
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // ── Simpan Drive song metadata ke localStorage setiap kali berubah (untuk offline recovery)
  useEffect(() => {
    if (customSongs.length === 0) return;
    try {
      // Simpan hanya metadata (bukan src blob URL yang tidak persisten)
      const meta = customSongs.map(({ src: _src, ...rest }) => rest);
      localStorage.setItem('sn_drive_meta', JSON.stringify(meta));
    } catch {}
  }, [customSongs]);

  // ── Sync cachedDriveIds ke localStorage
  useEffect(() => {
    try { localStorage.setItem('sn_cached_drive_ids', JSON.stringify([...cachedDriveIds])); } catch {}
  }, [cachedDriveIds]);

  // ── Sync cachedYtIds ke localStorage
  useEffect(() => {
    try { localStorage.setItem('sn_cached_yt_ids', JSON.stringify([...cachedYtIds])); } catch {}
  }, [cachedYtIds]);

  // ── Sync likedYtPending ke localStorage
  useEffect(() => {
    try { localStorage.setItem('sn_liked_yt_pending', JSON.stringify([...likedYtPending])); } catch {}
  }, [likedYtPending]);

  // ── Auto-restore Drive songs if we have a saved valid token
  const loadDriveSongs = useCallback(async (tok, force = false) => {
    if (!tok) return;
    setLoadingDrive(true);
    setDriveError('');
    try {
      const songs = await driveListSongs(tok, force);
      setCustomSongs(songs);
      // Beri info jika Drive tidak memiliki file audio sama sekali
      if (songs.length === 0) {
        setDriveError(
          'No audio files found in Google Drive. ' +
          'Make sure .mp3 .m4a .wav .flac .ogg files exist, then tap ↻ to refresh.',
        );
      } else {
        setDriveError('');
      }
    } catch (e) {
      // 401/403 → token expired → silent refresh sekali
      if (e.message.includes('401') || e.message.includes('403') || e.message.includes('token expired')) {
        try {
          const newTok = await silentRefreshToken();
          const songs  = await driveListSongs(newTok, true);
          setCustomSongs(songs);
          setDriveError(songs.length === 0
            ? (t?.noAudioFound||'No audio files found in Drive. Make sure you have .mp3 .m4a .wav .flac .ogg files.')
            : '');
        } catch {
          setDriveError('Google session expired. Tap Login to continue.');
        }
      } else {
        // Network / other error — tampilkan pesan singkat
        setDriveError('Failed to load Drive: ' + e.message);
        console.warn('Drive list error:', e.message);
      }
    } finally {
      setLoadingDrive(false);
    }
  }, [silentRefreshToken]);

  useEffect(() => {
    // Baca raw saved (termasuk yang sudah expired) untuk keperluan silent refresh
    const rawSaved = (() => { try { return JSON.parse(localStorage.getItem('sn_google_token')||'null'); } catch { return null; } })();
    const savedToken = rawSaved && rawSaved.expiry > Date.now() ? rawSaved.token : null;

    if (savedToken) {
      // Token masih valid — langsung muat lagu (force=true karena in-memory cache kosong setelah reload)
      loadDriveSongs(savedToken, true);
    } else if (googleUser) {
      // Token expired (atau tidak ada) tapi user pernah login → coba silent refresh otomatis
      // Menangani kasus: token expired saat tab ditutup, lalu dibuka lagi
      silentRefreshToken()
        .then(tok => loadDriveSongs(tok, true))
        .catch(() => {
          // Silent refresh gagal (misal: session Google habis) → tampilkan pesan login
          setDriveError('Google session expired. Tap Login to continue.');
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-fetch Drive songs when tab becomes visible again (catches expired tokens)
  // Juga toggle class page-hidden untuk pause semua animasi saat tab tidak aktif (hemat baterai)
  useEffect(() => {
    const onVisible = () => {
      document.documentElement.classList.toggle('page-hidden', document.visibilityState === 'hidden');
      if (document.visibilityState !== 'visible') return;
      const tok = tokenRef.current;
      if (!tok) return;
      const saved = (() => {
        try { return JSON.parse(localStorage.getItem('sn_google_token')||'null'); } catch { return null; }
      })();
      // Token hampir/sudah expired (<2 menit) → silent refresh dulu
      if (saved && saved.expiry - Date.now() < 2 * 60 * 1000) {
        silentRefreshToken()
          .then(newTok => loadDriveSongs(newTok, true))
          .catch(() => setDriveError('Google session expired. Tap Login to continue.'));
      } else {
        // Selalu reload ulang saat halaman aktif kembali (tangkap perubahan file di Drive)
        loadDriveSongs(tok, true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Unified responsive layout calc (portrait + landscape + desktop)
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isFs = document.fullscreenElement != null || fullscreenRef.current;
      // Determine layout mode — phone gets mobile UI, tablet/desktop/laptop gets desktop UI
      const isLandscape = vw > vh;
      const isPhone = isPhoneDevice();
      let mode = 'mobile-portrait';
      if (!isPhone && isLandscape) mode = 'desktop-landscape';
      else if (!isPhone && !isLandscape) mode = 'desktop-portrait';
      else if (isPhone && isLandscape) mode = 'mobile-landscape';
      setLayoutMode(mode);
      setIsDesktop(mode === 'desktop-landscape' || mode === 'desktop-portrait');

      if (isFs) {
        if (!isPhone && isLandscape) {
          // Desktop landscape fullscreen: keep column layout, expand ring (no sidebar)
          const mainW = vw;
          const mainH = vh;
          const reservedH = 260;
          const byH = mainH - reservedH;
          const byW = mainW - 80;
          const ring = Math.max(200, Math.min(400, Math.min(byH, byW)));
          setRingSize(ring);
          const vpad = Math.max(10, Math.round((mainH - ring - reservedH) / 2));
          setLayoutVars({
            playerPad: `${vpad}px 32px`,
            trackTitleSize: `clamp(18px,${Math.round(mainW * 0.03)}px,30px)`,
            artistSize: '13px', controlsGap: '16px', actionPad: '10px 0',
            volumeMt: `${Math.max(10, Math.min(22, Math.round(vpad * 0.6)))}px`,
            controlsMt: `${Math.max(12, Math.min(26, Math.round(vpad * 0.8)))}px`,
            infoMt: `${Math.max(10, Math.min(22, Math.round(vpad * 0.6)))}px`,
          });
        } else if (isPhone && isLandscape) {
          // Mobile landscape fullscreen: no header/sidenav, ring can fill proper column width
          const ringColW = Math.round(vw * 0.45);
          const size = Math.min(vh - 16, ringColW - 16);
          setRingSize(Math.max(140, Math.min(380, size)));
        } else {
          // Portrait fullscreen: centered, leave room for controls below
          const size = Math.min(vw - 48, vh - 240);
          setRingSize(Math.max(180, Math.min(480, size)));
        }
        return;
      }

      if (mode === 'desktop-landscape') {
        // Desktop Landscape — wide sidebar + centered ring
        const sidebarW = 196;
        const mainW = vw - sidebarW;
        const mainH = vh - 50;
        const reservedH = 270;
        const byH = mainH - reservedH;
        const byW = mainW - 80;
        const ring = Math.max(180, Math.min(320, Math.min(byH, byW)));
        setRingSize(ring);
        const vpad = Math.max(8, Math.round((mainH - ring - reservedH) / 2));
        setLayoutVars({
          playerPad: `${vpad}px 24px`,
          trackTitleSize: `clamp(16px,${Math.round(mainW * 0.04)}px,28px)`,
          artistSize: '12px', controlsGap: '14px', actionPad: '9px 0',
          volumeMt: `${Math.max(8, Math.min(16, Math.round(vpad * 0.6)))}px`,
          controlsMt: `${Math.max(10, Math.min(20, Math.round(vpad * 0.8)))}px`,
          infoMt: `${Math.max(8, Math.min(16, Math.round(vpad * 0.6)))}px`,
        });
      } else if (mode === 'desktop-portrait') {
        // Desktop Portrait — narrower sidebar, taller player
        const sidebarW = 160;
        const mainW = vw - sidebarW;
        const mainH = vh - 50;
        const reservedH = 260;
        const byH = mainH - reservedH;
        const byW = mainW - 60;
        const ring = Math.max(160, Math.min(300, Math.min(byH, byW)));
        setRingSize(ring);
        const vpad = Math.max(6, Math.round((mainH - ring - reservedH) / 2));
        setLayoutVars({
          playerPad: `${vpad}px 20px`,
          trackTitleSize: `clamp(14px,${Math.round(mainW * 0.04)}px,24px)`,
          artistSize: '11px', controlsGap: '12px', actionPad: '8px 0',
          volumeMt: `${Math.max(6, Math.min(14, Math.round(vpad * 0.6)))}px`,
          controlsMt: `${Math.max(8, Math.min(18, Math.round(vpad * 0.8)))}px`,
          infoMt: `${Math.max(6, Math.min(14, Math.round(vpad * 0.6)))}px`,
        });
      } else if (mode === 'mobile-landscape') {
        // Mobile Landscape — slim side icon nav (52px) + two-column player
        const sideNavW = 52;
        const mainW = vw - sideNavW;
        const mainH = vh - 40; // minus slim header
        // Left col = ~45% of mainW; ring fills height minus padding
        const ringColW = Math.round(mainW * 0.45);
        const ring = Math.max(120, Math.min(mainH - 16, ringColW - 16));
        setRingSize(ring);
        // Compact but readable margins
        setLayoutVars({
          playerPad: '4px 10px 4px',
          trackTitleSize: `clamp(13px,${Math.round((mainW - ringColW) * 0.065)}px,17px)`,
          artistSize: '10px',
          controlsGap: '10px',
          actionPad: '4px 0',
          volumeMt: '3px',
          controlsMt: '4px',
          infoMt: '3px',
        });
      } else {
        // Portrait: full-width stacked
        // Measured fixed slots: header~46, clock~24, badge~18, info~40,
        //   controls~52, volume~30, actions~44, bottomNav~68, gaps~16
        const fixed = 46 + 24 + 18 + 40 + 52 + 30 + 44 + 68 + 16;
        const byH = vh - fixed;
        const byW = vw - 32;
        const ring = Math.max(160, Math.min(280, Math.min(byH, byW)));
        setRingSize(ring);
        // Distribute remaining space tightly
        const spare = Math.max(0, vh - fixed - ring);
        const u = Math.round(spare / 12);
        const clampPx = (min, max) => `${Math.max(min, Math.min(max, u))}px`;
        const vpadTop = Math.max(4, Math.min(10, u));
        const vpadBot = Math.max(2, Math.min(6, Math.floor(u * 0.5)));
        setLayoutVars({
          playerPad: `${vpadTop}px 16px ${vpadBot}px`,
          trackTitleSize: vw >= 390 ? '17px' : '15px',
          artistSize: '11px',
          controlsGap: vw >= 390 ? '14px' : '10px',
          actionPad: `${clampPx(5, 9)} 0`,
          volumeMt: clampPx(4, 10),
          controlsMt: clampPx(5, 12),
          infoMt: clampPx(4, 10),
        });
      }
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Audio init
  useEffect(() => {
    const prev = audioRef.current;
    // Jika elemen audio yang sama sudah punya src ini, langsung return
    if (prev && prev.src && (prev.src === track.src || prev.src.endsWith(encodeURI(track.src)) || prev.src.endsWith(track.src))) {
      return;
    }
    const wasPlaying = playingRef.current || (prev && !prev.paused);
    if (prev) { prev.pause(); prev.src = ''; }
    // Hancurkan HLS instance lama
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    // Bersihkan reconnect timer lama
    if (radioReconnectRef.current) { clearTimeout(radioReconnectRef.current); radioReconnectRef.current = null; }
    radioReconnectCount.current = 0;
    setStreamBuffering(false);
    // Guard: jangan buat Audio jika src kosong (placeholder track)
    if (!track.src) {
      audioRef.current = null;
      setPlaying(false);
      return;
    }
    const a = new Audio();
    a.volume = muted ? 0 : volume;
    // Lite: preload none (hemat bandwidth). Pro: metadata (baca durasi tanpa full buffer)
    a.preload = isLite ? 'none' : 'metadata';
    if (!track.isRadio) {
      a.crossOrigin = 'anonymous';
    }
    audioRef.current = a;
    const isHlsSrc = track.src.includes('.m3u8') || track.src.includes('/hls/') || track.src.includes('chunklist');
    if (track.isRadio && isHlsSrc) {
      // HLS.js untuk stream .m3u8 (Chrome & Firefox tidak support native HLS)
      setStreamBuffering(true);
      attachHls(a, track.src, () => {
        setStreamBuffering(false);
        if (wasPlaying) {
          a.play().catch(e => { console.warn('autoplay blocked:', e); setPlaying(false); });
        }
      });
    } else {
      a.src = track.src; // set src SETELAH crossOrigin agar berlaku sejak request pertama
      if (wasPlaying) {
        a.play().catch(e => { console.warn('autoplay blocked:', e); setPlaying(false); });
      }
    }
    return () => {
      a.pause(); a.src = '';
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [track.src]); // eslint-disable-line react-hooks/exhaustive-deps
  // ── Audio events
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    // Lite: throttle ke 2 detik sekali — hemat CPU render loop
    // Pro: throttle ke 1 detik — CSS transition 0.35s mengisi gap, tetap terlihat smooth
    let lastTimeSaved = 0;
    const onTime = () => {
      const now = a.currentTime;
      const threshold = isLiteRef.current ? 2 : 1;
      if (Math.abs(now - lastTimeSaved) < threshold) return;
      lastTimeSaved = now;
      setProgress(now);
    };
    const trySetDur = () => {
      if (isFinite(a.duration) && a.duration > 0) { setDuration(a.duration); return true; }
      return false;
    };
    const onMeta  = () => trySetDur();
    const onDurChange = () => trySetDur();
    const onEnd   = () => {
      if (repeatRef.current === 'one') { a.currentTime = 0; a.play().catch(()=>{}); return; }
      if (repeatRef.current === 'all' || shuffleRef.current) {
        // Repeat all atau shuffle → lanjut ke lagu berikutnya
        if (goNextRef.current) goNextRef.current();
      } else {
        // repeat=off → hanya lanjut jika shuffle aktif, otherwise berhenti
        setPlaying(false);
      }
    };
    // Error / stall — pastikan loading state tidak terjebak selamanya
    const onError = () => {
      const err = a.error;
      // Auto-reconnect untuk stream radio
      if (track.isRadio) {
        console.warn('[Radio] Stream error, scheduling reconnect. code:', err?.code);
        scheduleRadioReconnect(track);
        return;
      }
      // MediaSource / network error saat streaming Drive — coba reload
      if (track.isDrive && track.driveId && err && (err.code === 2 || err.code === 4)) {
        // MEDIA_ERR_NETWORK (2) atau MEDIA_ERR_SRC_NOT_SUPPORTED (4)
        // Bisa terjadi saat MediaSource stream putus atau token expired di tengah jalan
        const tok = tokenRef.current;
        if (tok) {
          const savedPos = a.currentTime;
          console.warn('[Drive] Audio error, retrying from', savedPos, 'err:', err.code);
          // Hapus cache in-memory agar re-fetch
          for (const [k, v] of _blobCache) {
            if (k.startsWith(track.driveId + ':')) { URL.revokeObjectURL(v); _blobCache.delete(k); }
          }
          // Re-trigger play dari posisi yang sama via token refresh
          silentRefreshToken().catch(() => tok).then(newTok => {
            const fn = isLite ? driveStreamLite : driveStreamBlob;
            return fn(track.driveId, newTok, audioRef);
          }).then(url => {
            if (!url || !audioRef.current) return;
            const newA = audioRef.current;
            newA.src = url;
            newA.currentTime = savedPos;
            newA.play().catch(() => setPlaying(false));
          }).catch(() => { setPlaying(false); setLoadingTrack(false); });
          return;
        }
      }
      setPlaying(false); setLoadingTrack(false);
    };
    const onStall = () => {
      if (track.isRadio) {
        // Untuk radio: jangan a.load() (akan reset stream dari awal)
        // Cukup schedule reconnect jika benar-benar macet
        if (a.readyState < 2 && !a.paused) {
          scheduleRadioReconnect(track);
        }
        return;
      }
      // Stall bisa terjadi saat buffer habis di Lite mode — coba resume
      if (a.readyState < 3 && !a.paused) {
        a.load();
        const pos = a.currentTime;
        a.addEventListener('canplay', () => { a.currentTime = pos; a.play().catch(()=>{}); }, { once: true });
      }
    };
    // Buffering indicator untuk stream radio
    const onWaiting = () => { if (track.isRadio) setStreamBuffering(true); };
    const onPlaying = () => { if (track.isRadio) { setStreamBuffering(false); radioReconnectCount.current = 0; if (radioReconnectRef.current) { clearTimeout(radioReconnectRef.current); radioReconnectRef.current = null; } } };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('durationchange', onDurChange);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onError);
    a.addEventListener('stalled', onStall);
    a.addEventListener('waiting', onWaiting);
    a.addEventListener('playing', onPlaying);
    // Immediate check — metadata may already be loaded (blob URL / fast network)
    trySetDur();
    // Polling fallback: VBR MP3 may report Infinity initially, then settle later
    let pollCount = 0;
    const durPoll = setInterval(() => {
      if (trySetDur() || ++pollCount > 20) clearInterval(durPoll);
    }, 500);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('durationchange', onDurChange);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('error', onError);
      a.removeEventListener('stalled', onStall);
      a.removeEventListener('waiting', onWaiting);
      a.removeEventListener('playing', onPlaying);
      clearInterval(durPoll);
    };
  }, [track]); // only re-attach when track changes (not customSongs)

  // ── Sync playingRef
  useEffect(() => { playingRef.current = playing; }, [playing]);

  // ── Play/pause
  useEffect(() => {
    // Control YouTube iframe when embedTrack is active
    if (embedTrack?.type === 'youtube' && ytIframeRef.current) {
      const cmd = playing ? 'playVideo' : 'pauseVideo';
      // Tunda sedikit agar iframe sempat mount dulu sebelum postMessage
      const t = setTimeout(() => {
        try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:cmd, args:'' }), '*'); } catch(_){}
      }, 100);
      return () => clearTimeout(t);
    }
    const a = audioRef.current; if (!a) return;
    if (playing) {
      a.play().catch(e => { console.warn('play error:', e); setPlaying(false); });
    } else { a.pause(); }
  }, [playing, embedTrack]);

  // ── Proactive token expiry: auto silent-refresh 5 min before expiry
  useEffect(() => {
    if (!accessToken) return;
    let saved;
    try { saved = JSON.parse(localStorage.getItem('sn_google_token') || 'null'); } catch { return; }
    if (!saved?.expiry) return;
    const msUntilRefresh = saved.expiry - Date.now() - 5 * 60 * 1000; // 5 min early
    if (msUntilRefresh <= 0) {
      silentRefreshToken().catch(() => {}); // already expired, try now
      return;
    }
    const timer = setTimeout(() => { silentRefreshToken().catch(() => {}); }, msUntilRefresh);
    return () => clearTimeout(timer);
  }, [accessToken, silentRefreshToken]);

  // ── Fetch YT trending when stream tab opens (once per session, refreshable)
  useEffect(() => { if (tab === 'stream') fetchYtTrending(); }, [tab]); // eslint-disable-line

  // ── Volume/mute
  useEffect(() => { if (audioRef.current) audioRef.current.volume = muted?0:volume; }, [volume, muted]);

  // ── YouTube time sync: listen to postMessage events from iframe
  useEffect(() => {
    if (!embedTrack || embedTrack.type !== 'youtube') return;
    const handler = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.event === 'infoDelivery' && data.info) {
          if (data.info.currentTime != null) setYtProgress(data.info.currentTime);
          if (data.info.duration != null && data.info.duration > 0) setYtDuration(data.info.duration);
        }
        // Video ended → auto next (ytNext handles semua kasus: repeat-one, repeat-all, shuffle)
        if (data?.event === 'onStateChange' && data.info === 0) {
          setTimeout(() => { if (ytNextRef.current) ytNextRef.current(); }, 300);
        }
      } catch(_) {}
    };
    window.addEventListener('message', handler);
    // Poll current time: 1000ms (Pro) / 3000ms (Lite — hemat CPU)
    const pollMs = isLiteRef.current ? 3000 : 1000;
    const poll = setInterval(() => {
      try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'listening' }), '*'); } catch(_) {}
    }, pollMs);
    return () => { window.removeEventListener('message', handler); clearInterval(poll); };
  }, [embedTrack, seekYt]);

  // ── Chat scroll
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  // ── Track history + prefetch lagu berikutnya
  useEffect(() => {
    setHistory(prev => { const f=prev.filter(s=>s.id!==track.id); return [track,...f].slice(0,15); });
    setLyrics(''); setInsight(''); setLyricsRomanized(''); setLyricsRomanizing(false); setLyricsNeedGenerate(false); setLyricsGenerated(false);
    // Prefetch lagu berikutnya di background
    const allSongs = [...builtinSongs, ...customSongs];
    const idx = allSongs.findIndex(s => s.id === track.id);
    const next = allSongs[(idx + 1) % allSongs.length];
    if (next?.isDrive && next?.driveId && tokenRef.current) {
      if (!isLite) drivePrefetch(next.driveId, tokenRef.current); // Lite: skip prefetch hemat bandwidth
    }
  }, [track.id, customSongs]);

  // ── Auto-fetch lirik saat lagu ganti dan tab lirik sedang terbuka
  const getLyricsRef = useRef(null);
  useEffect(() => { getLyricsRef.current = getLyrics; });
  useEffect(() => {
    if (aiSubView === 'lyrics' && !lyricsLoading) {
      getLyricsRef.current?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id, embedTrack?.videoId, aiSubView]);


  // ── For You: shared helper — call one provider and return parsed JSON or null
  const callProviderJSON = async (prov, prompt, maxTok) => {
    try {
      const body = prov.isOpenAI
        ? { model:prov.model, max_tokens:maxTok, messages:[{role:'user',content:prompt}], ...prov.extra }
        : { model:prov.model, max_tokens:maxTok, messages:[{role:'user',content:[{type:'text',text:prompt}]}] };
      const resp = await fetch(prov.endpoint, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${prov.key}`, ...(prov.extra||{}) },
        body:JSON.stringify(body)
      });
      if (!resp.ok) { console.warn(`[ForYou] ${prov.provider}/${prov.model} HTTP ${resp.status}`); return null; }
      const data = await resp.json();
      const text = prov.isOpenAI ? data?.choices?.[0]?.message?.content : data?.content?.[0]?.text;
      if (!text) { console.warn(`[ForYou] ${prov.provider}/${prov.model} no text`, JSON.stringify(data).slice(0,200)); return null; }
      let clean = text.replace(/```json|```/g,'').trim();
      try { return JSON.parse(clean); }
      catch { const m = clean.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; }
    } catch(e) { console.warn(`[ForYou] ${prov.provider}/${prov.model} error:`, e?.message); return null; }
  };

  // ── For You: split sections across available providers in parallel, then merge
  const fetchForYouSplit = async (prefs, activeSections, basePromptCtx) => {
    const providers = getProviders();
    if (!providers.length) return null;

    // Deduplicate providers by endpoint+model so we don't double-call same model
    const seen = new Set();
    const uniqProviders = providers.filter(p => {
      const k = p.endpoint + '|' + p.model;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });

    // Section definitions — each has its own focused prompt
    const sectionDefs = [
      {
        key: 'music', active: prefs.categories.some(c=>c.startsWith('music_')),
        prompt: (ctx) => `${ctx}\n\nTugas kamu: rekomendasikan MUSIK saja. Berikan MINIMAL 5 lagu nyata.\nResponse HANYA JSON: {"music":[{"title":"..","artist":"..","subcategory":"..","reason":"max 8 kata"}]}`,
        maxTok: 800
      },
      {
        key: 'edukasi', active: prefs.categories.some(c=>c.startsWith('edu_')),
        prompt: (ctx) => `${ctx}\n\nTugas kamu: rekomendasikan konten EDUKASI (podcast/audiobook/news) saja. MINIMAL 5 item nyata.\nResponse HANYA JSON: {"edukasi":[{"name":"..","platform":"..","subcategory":"..","reason":"max 8 kata"}]}`,
        maxTok: 700
      },
      {
        key: 'fiksi', active: prefs.categories.some(c=>c.startsWith('fiksi_')),
        prompt: (ctx) => `${ctx}\n\nTugas kamu: rekomendasikan konten FIKSI AUDIO (sandiwara/komedi/puisi) saja. MINIMAL 5 item nyata.\nResponse HANYA JSON: {"fiksi":[{"name":"..","genre":"..","subcategory":"..","reason":"max 8 kata"}]}`,
        maxTok: 700
      },
      {
        key: 'wellness', active: prefs.categories.some(c=>c.startsWith('wellness_')),
        prompt: (ctx) => `${ctx}\n\nTugas kamu: rekomendasikan konten WELLNESS AUDIO (ASMR/binaural/meditasi/ambient/noise) saja. MINIMAL 5 item nyata.\nResponse HANYA JSON: {"wellness":[{"name":"..","type":"..","reason":"max 8 kata"}]}`,
        maxTok: 700
      },
      {
        key: 'siaran', active: prefs.categories.some(c=>c.startsWith('siaran_')),
        prompt: (ctx) => `${ctx}\n\nTugas kamu: rekomendasikan SIARAN LANGSUNG (radio/live/olahraga) saja. MINIMAL 5 item nyata.\nResponse HANYA JSON: {"siaran":[{"name":"..","genre":"..","subcategory":"..","reason":"max 8 kata"}]}`,
        maxTok: 700
      },
      {
        key: 'meta', active: true, // greeting + tip always needed
        prompt: (ctx) => `${ctx}\n\nTugas kamu: buat sapaan hangat dan tips mendengarkan.\nResponse HANYA JSON: {"greeting":"sapa user hangat (max 2 kalimat)","tip":"tips spesifik sesuai preferensi (max 1 kalimat)"}`,
        maxTok: 300
      },
    ].filter(s => s.active);

    const ctx = `Kamu adalah kurator audio personal. Preferensi user:\n- Kategori: ${prefs.categories.join(', ') || 'mix'}\n- Mood: ${prefs.moods.join(', ') || 'semua'}\n- Waktu: ${prefs.timeOfDay || 'kapan saja'}\n- Bahasa: ${prefs.lang || 'mix'}`;

    // Try each section against providers with fallback: first pick = round-robin,
    // but if it fails, retry remaining providers in order until one succeeds.
    const trySection = async (sec, startIdx) => {
      for (let attempt = 0; attempt < uniqProviders.length; attempt++) {
        const prov = uniqProviders[(startIdx + attempt) % uniqProviders.length];
        console.log(`[ForYou/split] ${sec.key} → trying ${prov.provider}/${prov.model}${attempt > 0 ? ` (retry ${attempt})` : ''}`);
        const result = await callProviderJSON(prov, sec.prompt(ctx), sec.maxTok);
        if (result) return result;
      }
      console.warn(`[ForYou/split] Section "${sec.key}" failed on all ${uniqProviders.length} provider(s)`);
      return null;
    };

    // Fire all sections in parallel, each with its own fallback chain
    const results = await Promise.all(
      sectionDefs.map((sec, i) => trySection(sec, i % uniqProviders.length))
    );

    // Merge all section results into one object
    const merged = {};
    results.forEach((r, i) => {
      if (r) Object.assign(merged, r);
    });

    // Must have at least greeting or one section to be valid
    if (!merged.greeting && !merged.music && !merged.edukasi && !merged.fiksi && !merged.wellness && !merged.siaran) return null;
    if (!merged.greeting) merged.greeting = 'Hei! Ini rekomendasi audio untukmu ✨';
    if (!merged.tip) merged.tip = 'Coba dengarkan dengan headphone untuk pengalaman terbaik.';
    return merged;
  };

  // ── For You: auto-refresh setiap kali tab dibuka (result view)
  // forceRefresh=true: abaikan cache (dari tombol Refresh Feed)
  // forceRefresh=false (default): hanya generate jika belum ada / sudah >6 jam
  const FOR_YOU_TTL_MS = 6 * 60 * 60 * 1000; // 6 jam
  const refreshForYou = useCallback(async (forceRefresh = false) => {
    if (!hasKey()) return;
    // Guard: jangan re-generate otomatis jika data sudah ada & masih fresh
    if (!forceRefresh) {
      if (personaLoading) return;
      const cachedRecs = (() => { try { return JSON.parse(localStorage.getItem('sn_persona_recs') || 'null'); } catch { return null; } })();
      const lastTs = parseInt(localStorage.getItem('sn_persona_recs_ts') || '0', 10);
      const isStale = Date.now() - lastTs > FOR_YOU_TTL_MS;
      if (cachedRecs && !isStale) return; // masih fresh, skip
    }
    setPL(true);
    try {
      const savedPrefs = (() => { try { return JSON.parse(localStorage.getItem('sn_persona_prefs')||'{}'); } catch { return personaPrefs; } })();
      const prefs = {
        categories: savedPrefs.categories || personaPrefs.categories || [],
        moods: savedPrefs.moods || personaPrefs.moods || [],
        timeOfDay: savedPrefs.timeOfDay || personaPrefs.timeOfDay || '',
        lang: savedPrefs.lang || personaPrefs.lang || 'mix',
      };
      const result = await fetchForYouSplit(prefs, null, null);
      if (result) {
        setPersonaRecs(result);
        localStorage.setItem('sn_persona_recs', JSON.stringify(result));
        localStorage.setItem('sn_persona_done', '1');
        localStorage.setItem('sn_persona_recs_ts', String(Date.now()));
      }
    } catch(e) { console.error('[ForYou/refresh] outer error:', e?.message); } finally { setPL(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaPrefs]);

  const refreshForYouRef = useRef(null);
  useEffect(() => { refreshForYouRef.current = refreshForYou; });

  useEffect(() => {
    if (aiSubView === 'foryou' && personaStep === 'result') {
      // forceRefresh=false: hanya generate jika belum ada / sudah >6 jam
      refreshForYouRef.current?.(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSubView]);

  // ── For You: fetch AI popular recs once per session
  const fetchPopularRecs = useCallback(async () => {
    if (popularLoading || popularRecs) return;
    if (!hasKey()) return;
    setPopularLoading(true);
    try {
      const prompt = `Kamu adalah kurator musik & audio global. Berikan daftar konten POPULER & TRENDING saat ini (bukan personalisasi) dalam format JSON. Isi dengan judul/artis/stasiun nyata yang benar-benar populer secara global maupun di Indonesia saat ini.

Response HANYA JSON ini (tanpa markdown, tanpa teks lain):
{"trending_music":[{"title":"Judul Lagu 1","artist":"Artis 1","reason":"alasan singkat max 8 kata"},{"title":"Judul Lagu 2","artist":"Artis 2","reason":"alasan singkat max 8 kata"},{"title":"Judul Lagu 3","artist":"Artis 3","reason":"alasan singkat max 8 kata"},{"title":"Judul Lagu 4","artist":"Artis 4","reason":"alasan singkat max 8 kata"},{"title":"Judul Lagu 5","artist":"Artis 5","reason":"alasan singkat max 8 kata"}],"trending_radio":[{"name":"Nama Stasiun 1","genre":"genre","reason":"alasan singkat max 8 kata"},{"name":"Nama Stasiun 2","genre":"genre","reason":"alasan singkat max 8 kata"},{"name":"Nama Stasiun 3","genre":"genre","reason":"alasan singkat max 8 kata"},{"name":"Nama Stasiun 4","genre":"genre","reason":"alasan singkat max 8 kata"},{"name":"Nama Stasiun 5","genre":"genre","reason":"alasan singkat max 8 kata"}],"trending_indo":[{"title":"Lagu Indo 1","artist":"Artis Indonesia 1","reason":"alasan singkat max 8 kata"},{"title":"Lagu Indo 2","artist":"Artis Indonesia 2","reason":"alasan singkat max 8 kata"},{"title":"Lagu Indo 3","artist":"Artis Indonesia 3","reason":"alasan singkat max 8 kata"},{"title":"Lagu Indo 4","artist":"Artis Indonesia 4","reason":"alasan singkat max 8 kata"},{"title":"Lagu Indo 5","artist":"Artis Indonesia 5","reason":"alasan singkat max 8 kata"}]}`;
      const providers = getProviders();
      let result = null;
      for (const prov of providers) {
        try {
          const body = prov.isOpenAI
            ? { model: prov.model, max_tokens: 2000, messages: [{ role: 'user', content: prompt }], ...prov.extra }
            : { model: prov.model, max_tokens: 1200, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }] };
          const resp = await fetch(prov.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${prov.key}`, ...(prov.extra || {}) }, body: JSON.stringify(body) });
          const data = await resp.json();
          const text = prov.isOpenAI ? data?.choices?.[0]?.message?.content : data?.content?.[0]?.text;
          if (text) {
            const clean = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(clean);
            result = parsed;
            break;
          }
        } catch {}
      }
      if (result) setPopularRecs(result);
    } catch {}
    finally { setPopularLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popularLoading, popularRecs]);

  const fetchPopularRecsRef = useRef(null);
  useEffect(() => { fetchPopularRecsRef.current = fetchPopularRecs; });

  useEffect(() => {
    if (aiSubView === 'foryou') {
      fetchYtTrending();
      fetchPopularRecsRef.current?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSubView]);

  // ── Sleep timer cleanup
  useEffect(() => () => { if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current); }, []);

  // ── Auto-switch ke Player saat SC embed / Spotify embed mulai play
  useEffect(() => {
    const handleEmbedPlay = (ev) => {
      try {
        // SoundCloud Widget API events
        if (typeof ev.data === 'string') {
          const d = JSON.parse(ev.data);
          // SC Widget API: { soundcloud: { method: 'play' | 'play_progress' } }
          if (d && d.soundcloud && (d.soundcloud.method === 'play' || d.soundcloud.method === 'play_progress')) {
            setTab('player');
            return;
          }
        }
      } catch {}
    };
    window.addEventListener('message', handleEmbedPlay);
    return () => window.removeEventListener('message', handleEmbedPlay);
  }, []); // eslint-disable-line

  // ── SLEEP TIMER
  const startSleepTimer = useCallback((minutes) => {
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    const endTime = Date.now() + minutes * 60_000;
    setSleepTimer({ minutes, remaining: minutes*60 });
    sleepIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setSleepTimer(p => ({ ...p, remaining }));
      if (remaining <= 0) {
        clearInterval(sleepIntervalRef.current);
        setSleepTimer(null);
        // ── Hentikan semua sumber audio: lokal/Drive + YouTube + Spotify + SoundCloud
        setPlaying(false);
        // YouTube embed
        if (ytIframeRef.current) {
          try { ytIframeRef.current.contentWindow.postMessage(JSON.stringify({ event:'command', func:'pauseVideo', args:'' }), '*'); } catch(_) {}
        }
        setEmbedTrack(null);
        // Spotify preview
        if (spPreviewRef.current) { spPreviewRef.current.pause(); spPreviewRef.current = null; }
        setSpPlaying(false);
        // SoundCloud embed — tutup widget agar iframe berhenti autoplay
        setScWidget({});
      }
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const cancelSleepTimer = useCallback(() => { if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current); setSleepTimer(null); }, []);

  // ── Test radio stations: hanya tampilkan yang bisa diputar
  const testStationsInGenre = useCallback(async (genre) => {
    const key = genre.id;
    if (testedGenresRef.current.has(key)) return;
    testedGenresRef.current.add(key);
    // Mark all as testing
    setStationStatus(prev => {
      const next = { ...prev };
      genre.stations.forEach(s => { if (!(s.id in next)) next[s.id] = 'testing'; });
      return next;
    });
    // Test satu per satu menggunakan fetch no-cors (tanpa CORS error)
    // Jika server merespons → ok; timeout/network error → fail
    const testOne = (station) => new Promise(resolve => {
      const ctrl = new AbortController();
      const tid = setTimeout(() => { ctrl.abort(); resolve({ id: station.id, ok: false }); }, 7000);
      fetch(radioUrl(station.url), { method: 'GET', mode: 'no-cors', signal: ctrl.signal })
        .then(() => { clearTimeout(tid); resolve({ id: station.id, ok: true }); })
        .catch(e => {
          clearTimeout(tid);
          // AbortError = timeout, TypeError = network fail
          resolve({ id: station.id, ok: false });
        });
    });
    // Batch 4 concurrent tests
    const batchSize = 4;
    for (let i = 0; i < genre.stations.length; i += batchSize) {
      const batch = genre.stations.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(testOne));
      setStationStatus(prev => {
        const next = { ...prev };
        results.forEach(({ id, ok }) => { next[id] = ok ? 'ok' : 'fail'; });
        return next;
      });
    }
  }, []);

  // ══════════════════════════════════════════
  //  MULTI-SOURCE RADIO — Free streaming APIs
  // ══════════════════════════════════════════

  // ── 1. Radio Browser (30k+ stasiun, global)
  const getRbServer = async () => {
    if (rbServerRef.current) return rbServerRef.current;
    try {
      const ips = await fetch('https://all.api.radio-browser.info/json/servers').then(r=>r.json());
      const server = 'https://' + ips[Math.floor(Math.random()*ips.length)].name;
      rbServerRef.current = server;
      return server;
    } catch {
      rbServerRef.current = 'https://de1.api.radio-browser.info';
      return rbServerRef.current;
    }
  };

  const rbSearch = async (query, tag) => {
    setRbLoading(true); setRbError(null); setRbResults([]);
    try {
      const base = await getRbServer();
      let url;
      if (tag) {
        url = `${base}/json/stations/bytag/${encodeURIComponent(tag)}?limit=40&hidebroken=true&order=votes&reverse=true`;
      } else if (query && query.trim()) {
        url = `${base}/json/stations/search?name=${encodeURIComponent(query.trim())}&limit=40&hidebroken=true&order=votes&reverse=true`;
      } else {
        url = `${base}/json/stations/topvote/40?hidebroken=true`;
      }
      const data = await fetch(url).then(r=>r.json());
      const filtered = data.filter(s => s.url_resolved || s.url);
      setRbResults(filtered);
      // Trigger health check untuk hasil pencarian
      const rbSearchKey = `rbsearch__${query||''}__${tag||''}`;
      testStationsInGenre({ id: rbSearchKey, stations: filtered.map(s => ({ id: s.stationuuid, url: s.url_resolved || s.url })) });
    } catch(e) {
      setRbError('Gagal menghubungi Radio Browser. Coba lagi.');
    } finally {
      setRbLoading(false);
    }
  };

  // ── Radio Browser Koleksi: fetch stations by country + genre tag
  const RB_COUNTRY_CODE = { us:'US', uk:'GB', fr:'FR', de:'DE', id:'ID', jp:'JP', br:'BR', in:'IN', mx:'MX', kr:'KR' };
  const RB_GENRE_TAG = {
    pop:'pop', rock:'rock', country:'country', jazz:'jazz', news:'news', dance:'dance',
    classical:'classical', rnb:'rnb', schlager:'schlager', dangdut:'dangdut', religi:'islamic',
    jpop:'j-pop', anime:'anime', lofi:'lofi', samba:'samba', axe:'forro', mpb:'mpb', funk:'funk',
    bollywood:'bollywood', 'classical-in':'classical', punjabi:'punjabi', 'rnb-in':'electronic',
    'pop-mx':'pop', ranchera:'ranchera', norteno:'norteno', 'electronic-mx':'electronic',
    'news-mx':'news', kpop:'k-pop', krnb:'rnb', 'k-indie':'indie', 'kr-lofi':'lofi',
    'news-kr':'news', 'news-in':'news',
  };
  const GENRE_KEYWORDS = {
    pop:        ['pop', 'top 40', 'chart', 'hits', 'electropop'],
    rock:       ['rock', 'alternative', 'indie', 'metal', 'punk', 'grunge'],
    jazz:       ['jazz', 'blues', 'soul', 'bossa', 'swing'],
    classical:  ['classical', 'orchestra', 'opera', 'baroque', 'chamber'],
    electronic: ['electronic', 'edm', 'techno', 'house', 'trance', 'dance', 'idm', 'chill', 'downtempo', 'drone'],
    ambient:    ['ambient', 'chillout', 'space music', 'atmospheric', 'new age'],
    lounge:     ['lounge', 'smooth', 'easy listening', 'cafe', 'bossa nova', 'chill lounge'],
    hiphop:     ['hip-hop', 'hip hop', 'rap', 'r&b', 'rnb', 'trap'],
    reggae:     ['reggae', 'dub', 'ska', 'dancehall'],
    folk:       ['folk', 'country', 'americana', 'bluegrass', 'singer-songwriter'],
    news:       ['news', 'talk', 'info', 'noticias', 'nachrichten', 'berita', 'informasi'],
    world:      ['world', 'latin', 'afrobeat', 'bossa', 'samba', 'flamenco', 'asian', 'bollywood'],
    dangdut:    ['dangdut', 'koplo', 'campursari', 'tarling', 'orkes melayu'],
    islamic:    ['islamic', 'islam', 'religi', 'quran', 'nasyid', 'muslim', 'religious', 'islami'],
  };

  const matchGenreKeywords = (label, keywords) => {
    const low = (label||'').toLowerCase();
    return keywords.some(k => low.includes(k));
  };

  const getGenreBucket = (genreName) => {
    const low = (genreName||'').toLowerCase();
    for (const [bucket, keys] of Object.entries(GENRE_KEYWORDS)) {
      if (keys.some(k => low.includes(k))) return bucket;
    }
    return null;
  };

  const fetchBrowseStations = async (countryId, genreId) => {
    const key = `${countryId}__${genreId}`;
    if (rbBrowseKeyRef.current === key) return;
    rbBrowseKeyRef.current = key;
    const cc = RB_COUNTRY_CODE[countryId] || '';
    const tag = RB_GENRE_TAG[genreId] || genreId;
    setRbBrowseLoading(true); setRbBrowseError(null); setRbBrowseStations([]);
    try {
      const base = await getRbServer();
      // Primary: search by country + tag
      const url = `${base}/json/stations/search?countrycode=${cc}&tag=${encodeURIComponent(tag)}&limit=30&hidebroken=true&order=votes&reverse=true`;
      let data = await fetch(url).then(r => r.json());
      // Fallback: if <5 results, relax to tag-only search
      if (data.length < 5) {
        const url2 = `${base}/json/stations/search?countrycode=${cc}&tag=${encodeURIComponent(tag)}&limit=30&hidebroken=false&order=votes&reverse=true`;
        data = await fetch(url2).then(r => r.json());
      }
      const stations = data.filter(s => s.url_resolved || s.url).slice(0, 20).map(s => ({
        id: s.stationuuid,
        stationuuid: s.stationuuid,
        name: s.name,
        city: [s.state, s.city].filter(Boolean).join(', ') || s.country || 'Online',
        url: s.url_resolved || s.url,
        favicon: s.favicon && s.favicon.startsWith('http') ? s.favicon : null,
        tags: s.tags,
        votes: s.votes,
      }));
      setRbBrowseStations(stations);
      // Gabungkan kurasi + Radio Browser untuk navigasi next/prev dan tampilan queue
      const rbPlatform = STREAMING_PLATFORMS.find(p => p.embedType === 'radio');
      const rbCountryData = rbPlatform?.countries?.find(c => c.id === countryId);
      const rbGenreData = rbCountryData?.genres?.find(g => g.id === genreId);
      const rbCurated = rbGenreData?.stations || [];
      // Pertahankan Garden yang sudah dimuat, gabungkan kurasi + RB + Garden
      const existingGarden = rbBrowseRef.current.filter(s => s.id?.startsWith('garden_'));
      rbBrowseRef.current = [...rbCurated, ...stations, ...existingGarden];
      // Trigger health-check otomatis setelah stasiun dimuat
      testStationsInGenre({ id: key, stations });
    } catch(e) {
      setRbBrowseError('Failed to load from Radio Browser. Check your internet connection.');
      // Fallback ke stasiun kurasi saja jika Radio Browser gagal
      const rbPlatformFb = STREAMING_PLATFORMS.find(p => p.embedType === 'radio');
      const rbCountryFb = rbPlatformFb?.countries?.find(c => c.id === countryId);
      const rbGenreFb = rbCountryFb?.genres?.find(g => g.id === genreId);
      rbBrowseRef.current = rbGenreFb?.stations || [];
    } finally {
      setRbBrowseLoading(false);
    }
  };

  // ── Preload SomaFM & Garden when radio tab first opens
  useEffect(() => {
    if (tab === 'stream') { loadSomaFM(); loadGardenPlaces(); }
  }, [tab]); // eslint-disable-line

  const rbLoadTags = async () => {
    if (rbTopTags.length > 0) return;
    try {
      const base = await getRbServer();
      const data = await fetch(`${base}/json/tags?limit=10&order=stationcount&reverse=true&hidebroken=true`).then(r=>r.json());
      setRbTopTags(data.map(t=>t.name).filter(n=>n && n.length > 1 && n.length < 20));
    } catch {}
  };

  // ── 2. SomaFM (curated, high quality, gratis)
  const loadSomaFM = async () => {
    if (somaChannels.length > 0) return;
    try {
      const data = await fetch('https://somafm.com/channels.json').then(r=>r.json());
      setSomaChannels(data.channels || []);
    } catch {
      // fallback: hardcode some popular SomaFM channels
      setSomaChannels([
        { id:'groovesalad', title:'Groove Salad', description:'A nicely chilled plate of ambient/downtempo beats and grooves.', listeners:3000, genre:'Ambient', image:'https://somafm.com/img3/groovesalad-400.jpg', plls:[{url:'https://ice1.somafm.com/groovesalad-128-mp3'}] },
        { id:'dronezone', title:'Drone Zone', description:'Served best chilled, safe with most medications. Experimental.', listeners:1200, genre:'Ambient', image:'https://somafm.com/img3/dronezone-400.jpg', plls:[{url:'https://ice1.somafm.com/dronezone-128-mp3'}] },
        { id:'lush', title:'Lush', description:'Sensuous and mellow female vocals, Dj mixes, Chillout.', listeners:1500, genre:'Chillout', image:'https://somafm.com/img3/lush-400.jpg', plls:[{url:'https://ice1.somafm.com/lush-128-mp3'}] },
        { id:'defcon', title:'DEF CON Radio', description:'Music for Hacking. The DEF CON Audio Tracks.', listeners:800, genre:'Electronic', image:'https://somafm.com/img3/defcon-400.jpg', plls:[{url:'https://ice1.somafm.com/defcon-128-mp3'}] },
        { id:'spacestation', title:'Space Station Soma', description:'Tune in, turn on, space out.', listeners:900, genre:'Ambient', image:'https://somafm.com/img3/spacestation-400.jpg', plls:[{url:'https://ice1.somafm.com/spacestation-128-mp3'}] },
        { id:'secretagent', title:'Secret Agent', description:'The soundtrack for your stylish, mysterious, dangerous life.', listeners:1100, genre:'Lounge', image:'https://somafm.com/img3/secretagent-400.jpg', plls:[{url:'https://ice1.somafm.com/secretagent-128-mp3'}] },
        { id:'illstreet', title:'Ill Street Blues', description:'Grittier, Trashier, a little more Arty. Hip-Hop/Soul.', listeners:700, genre:'Hip-Hop', image:'https://somafm.com/img3/illstreet-400.jpg', plls:[{url:'https://ice1.somafm.com/illstreet-128-mp3'}] },
        { id:'folkfwd', title:'Folk Forward', description:'Indie Folk, Roots, Americana and Singer-Songwriter.', listeners:500, genre:'Folk', image:'https://somafm.com/img3/folkfwd-400.jpg', plls:[{url:'https://ice1.somafm.com/folkfwd-128-mp3'}] },
        { id:'jazz', title:'SF in SF', description:'San Francisco bands & Singers in the city.', listeners:400, genre:'Jazz', image:'https://somafm.com/img3/sf10-400.jpg', plls:[{url:'https://ice1.somafm.com/sf1033-128-mp3'}] },
        { id:'poptron', title:'PopTron', description:'Electropop and indie electronic pop.', listeners:600, genre:'Pop', image:'https://somafm.com/img3/poptron-400.jpg', plls:[{url:'https://ice1.somafm.com/poptron-128-mp3'}] },
        { id:'metal', title:'Metal Detector', description:'From black to doom, prog to sludge, indie to classic.', listeners:800, genre:'Metal', image:'https://somafm.com/img3/metal-400.jpg', plls:[{url:'https://ice1.somafm.com/metal-128-mp3'}] },
        { id:'sonicuniverse', title:'Sonic Universe', description:'Transcending the boundaries of jazz.', listeners:700, genre:'Jazz', image:'https://somafm.com/img3/sonicuniverse-400.jpg', plls:[{url:'https://ice1.somafm.com/sonicuniverse-128-mp3'}] },
        { id:'reggae', title:'Reggae Expat', description:'Classic Reggae, Dancehall, Dub.', listeners:500, genre:'Reggae', image:'https://somafm.com/img3/reggae-400.jpg', plls:[{url:'https://ice1.somafm.com/reggae-128-mp3'}] },
        { id:'cliqhop', title:'Cliqhop idm', description:'Blips, blops, and other electronic wonders.', listeners:900, genre:'IDM', image:'https://somafm.com/img3/cliqhop-400.jpg', plls:[{url:'https://ice1.somafm.com/cliqhop-128-mp3'}] },
        { id:'deepspaceone', title:'Deep Space One', description:'Deep ambient electronic, experimental and space music.', listeners:600, genre:'Ambient', image:'https://somafm.com/img3/deepspaceone-400.jpg', plls:[{url:'https://ice1.somafm.com/deepspaceone-128-mp3'}] },
      ]);
    }
  };

  // ── 3. radio.garden (stasiun lokal dari seluruh dunia berdasarkan geografi)
  const GARDEN_COUNTRY_MAP = { us:'United States', uk:'United Kingdom', fr:'France', de:'Germany', id:'Indonesia', jp:'Japan', br:'Brazil', in:'India', mx:'Mexico', kr:'South Korea' };

  const loadGardenPlaces = async () => {
    if (gardenPlaces.length > 0) return;
    try {
      const data = await fetch('/api/radio-garden/content/places').then(r=>r.json());
      setGardenPlaces((data?.data?.list || []).slice(0, 500));
    } catch {
      setGardenPlaces([]);
    }
  };

  const loadGardenStations = async (placeId) => {
    setGardenStations([]);
    try {
      const data = await fetch(`/api/radio-garden/content/page/${placeId}/channels`).then(r=>r.json());
      const channels = data?.data?.content?.[0]?.items || [];
      setGardenStations(channels);
    } catch {}
  };

  const getGardenStreamUrl = (channelId) => {
    return `https://radio.garden/api/ara/content/listen/${channelId}/channel.mp3`;
  };

  // Fetch semua stasiun dari semua kota di negara tertentu — untuk browse panel
  // genreId optional: jika diberikan, filter stasiun berdasarkan kata kunci genre
  const fetchGardenByCountry = async (countryId, genreId) => {
    const key = genreId ? `${countryId}__${genreId}` : countryId;
    if (gardenBrowseKeyRef.current === key) return;
    gardenBrowseKeyRef.current = key;
    setGardenBrowseLoading(true); setGardenBrowseError(null); setGardenBrowseStations([]);
    const countryName = GARDEN_COUNTRY_MAP[countryId] || '';
    // Build genre keyword list for filtering station names
    const genreBucket = genreId ? getGenreBucket(genreId) : null;
    const genreKeywords = genreBucket ? GENRE_KEYWORDS[genreBucket]
      : (genreId ? [genreId.toLowerCase()] : null);
    try {
      // 1. Get places list (cached in state)
      let places = gardenPlaces;
      if (places.length === 0) {
        const data = await fetch('/api/radio-garden/content/places').then(r=>r.json());
        places = (data?.data?.list || []).slice(0, 500);
        setGardenPlaces(places);
      }
      // 2. Filter to matching country — fetch more cities when genre filtering
      const countryPlaces = places.filter(p => p.country === countryName).slice(0, genreKeywords ? 15 : 8);
      if (countryPlaces.length === 0) { setGardenBrowseStations([]); setGardenBrowseLoading(false); return; }
      // 3. Fetch channels from each place (parallel)
      const results = await Promise.allSettled(
        countryPlaces.map(p => {
          const placeId = p.id || (p.url||'').split('/').pop();
          return fetch(`/api/radio-garden/content/page/${placeId}/channels`)
            .then(r=>r.json())
            .then(data => {
              const items = data?.data?.content?.[0]?.items || [];
              return items.slice(0, 8).map(ch => {
                const chId = ch.page?.url?.split('/').pop() || ch.href?.split('/').pop() || '';
                return {
                  id: `garden_${chId}`,
                  name: ch.page?.title || ch.title || 'Station',
                  city: p.title || '',
                  country: countryName,
                  genre: ch.page?.subtitle || '',
                  url: getGardenStreamUrl(chId),
                  chId,
                };
              });
            });
        })
      );
      let stations = results.flatMap(r => r.status === 'fulfilled' ? r.value : []).filter(s => s.chId);
      // 4. Filter by genre keywords if genre is selected
      if (genreKeywords && genreKeywords.length > 0) {
        const filtered = stations.filter(s =>
          matchGenreKeywords(s.name, genreKeywords) ||
          matchGenreKeywords(s.genre, genreKeywords)
        );
        // Fall back to all stations if genre filter yields nothing
        stations = filtered.length > 0 ? filtered : stations;
      }
      setGardenBrowseStations(stations);
      // Append Garden ke antrean navigasi, pertahankan kurasi + RB yang sudah ada
      const existingNonGarden = rbBrowseRef.current.filter(s => !s.id?.startsWith('garden_'));
      rbBrowseRef.current = [...existingNonGarden, ...stations];
    } catch(e) {
      setGardenBrowseError('Failed to load from Radio Garden.');
    } finally {
      setGardenBrowseLoading(false);
    }
  };

  // ── 4. NTS Radio (100+ channels, indie/underground, gratis)
  const NTS_STREAMS = [
    { id:'nts1', name:'NTS 1', desc:'Eclectic music, conversation and culture from around the world.', url:'https://stream-relay-geo.ntslive.net/stream', genre:'Eclectic', color:'#ff4500' },
    { id:'nts2', name:'NTS 2', desc:'A second continuous stream of music and culture.', url:'https://stream-relay-geo.ntslive.net/stream2', genre:'Eclectic', color:'#ff6500' },
  ];

  // ── 5. Icecast Directory (dir.xiph.org) — via CORS proxy approach
  // Uses public Icecast streams known to work
  const ICECAST_CURATED = [
    { id:'ice_bassdrive', name:'Bassdrive', desc:'Drum & Bass 24/7', url:'https://bassdrive.com/bassdrive.m3u', genre:'Drum & Bass', country:'US', color:'#8b5cf6' },
    { id:'ice_difm_chill', name:'SomaFM Thistle Radio', desc:'Celtic/folk/world music 24/7', url:'https://ice1.somafm.com/thistle-128-mp3', genre:'Chillout', country:'US', color:'#06b6d4' },
    { id:'ice_difm_trance', name:'SomaFM Space Station', desc:'Electronic/ambient space music 24/7', url:'https://ice1.somafm.com/spacestation-128-mp3', genre:'Trance', country:'US', color:'#8b5cf6' },
    { id:'ice_difm_house', name:'SomaFM Sonic Universe', desc:'Jazz fusion, funk & world music 24/7', url:'https://ice1.somafm.com/sonicuniverse-128-mp3', genre:'House', country:'US', color:'#f59e0b' },
    { id:'ice_difm_techno', name:'SomaFM Deep Space One', desc:'Deep ambient electronic 24/7', url:'https://ice1.somafm.com/deepspaceone-128-mp3', genre:'Techno', country:'US', color:'#ef4444' },
    { id:'ice_difm_dnb', name:'SomaFM Drone Zone', desc:'Atmospheric ambient drone music 24/7', url:'https://ice1.somafm.com/dronezone-128-mp3', genre:'D&B', country:'US', color:'#7c3aed' },
    { id:'ice_soma_groove', name:'SomaFM Groove Salad', desc:'Ambient/downtempo beats', url:'https://ice1.somafm.com/groovesalad-128-mp3', genre:'Ambient', country:'US', color:'#10b981' },
    { id:'ice_soma_secret', name:'SomaFM Secret Agent', desc:'Lounge/spy soundtrack', url:'https://ice1.somafm.com/secretagent-128-mp3', genre:'Lounge', country:'US', color:'#3b82f6' },
    { id:'ice_laut_jazz', name:'Jazz Radio', desc:'Jazz 24/7 from Germany', url:'https://stream.laut.fm/jazz', genre:'Jazz', country:'DE', color:'#7c3aed' },
    { id:'ice_laut_rock', name:'Classic Rock Radio', desc:'Classic Rock from Germany', url:'https://stream.laut.fm/classic-rock', genre:'Rock', country:'DE', color:'#ef4444' },
    { id:'ice_laut_metal', name:'Metal Radio', desc:'Heavy Metal 24/7', url:'https://stream.laut.fm/metal', genre:'Metal', country:'DE', color:'#1f2937' },
    { id:'ice_laut_pop', name:'Pop Radio', desc:'Pop hits from Germany', url:'https://stream.laut.fm/pop', genre:'Pop', country:'DE', color:'#f59e0b' },
    { id:'ice_laut_ambient', name:'Ambient Radio', desc:'Ambient music 24/7', url:'https://stream.laut.fm/ambient', genre:'Ambient', country:'DE', color:'#6366f1' },
    { id:'ice_laut_reggae', name:'Reggae Radio', desc:'Reggae & Dub 24/7', url:'https://stream.laut.fm/reggae', genre:'Reggae', country:'DE', color:'#16a34a' },
    { id:'ice_laut_classical', name:'Classical Radio', desc:'Classical music 24/7', url:'https://stream.laut.fm/classical', genre:'Classical', country:'DE', color:'#a16207' },
    { id:'ice_laut_hiphop', name:'Hip-Hop Radio', desc:'Hip-Hop & Rap 24/7', url:'https://stream.laut.fm/hiphop', genre:'Hip-Hop', country:'DE', color:'#dc2626' },
  ];

  // ── Radio Paradise (curated, high-fidelity, no ads, listener-funded)
  const RADIO_PARADISE_CHANNELS = [
    { id:'rp_main', name:'Radio Paradise Main Mix', desc:'Eclectic mix of Rock, World, Classical & more — hand-curated, no ads', url:'https://stream.radioparadise.com/aac-128', genre:'Eclectic', country:'US', color:'#8b5cf6', image:'https://www.radioparadise.com/graphics/rp_320x320.png' },
    { id:'rp_mellow', name:'Radio Paradise Mellow Mix', desc:'Chill, ambient, acoustic — relaxed and soothing', url:'https://stream.radioparadise.com/mellow-128', genre:'Ambient', country:'US', color:'#06b6d4', image:'https://www.radioparadise.com/graphics/rp_320x320.png' },
    { id:'rp_rock', name:'Radio Paradise Rock Mix', desc:'Deep cuts and classic rock, hand-picked', url:'https://stream.radioparadise.com/rock-128', genre:'Rock', country:'US', color:'#ef4444', image:'https://www.radioparadise.com/graphics/rp_320x320.png' },
    { id:'rp_global', name:'Radio Paradise Global Mix', desc:'World music, jazz, folk, and global rhythms', url:'https://stream.radioparadise.com/global-128', genre:'World', country:'US', color:'#f59e0b', image:'https://www.radioparadise.com/graphics/rp_320x320.png' },
  ];

  // ── FM Stream / laut.fm extended (Germany-based, 800+ curated internet stations)
  const FMSTREAM_CURATED = [
    { id:'fm_country', name:'Country Radio (laut.fm)', desc:'Country & Americana 24/7', url:'https://stream.laut.fm/country', genre:'Country', country:'DE', color:'#a16207', sourceLabel:'FM Stream' },
    { id:'fm_rnb', name:'R&B Radio (laut.fm)', desc:'R&B & Soul 24/7', url:'https://stream.laut.fm/rnb', genre:'R&B', country:'DE', color:'#f59e0b', sourceLabel:'FM Stream' },
    { id:'fm_electro', name:'Electronic Radio (laut.fm)', desc:'Electronic & Dance 24/7', url:'https://stream.laut.fm/electronic', genre:'Electronic', country:'DE', color:'#6366f1', sourceLabel:'FM Stream' },
    { id:'fm_80s', name:'80s Radio (laut.fm)', desc:'Best of 80s Pop & Rock', url:'https://stream.laut.fm/80s', genre:'80s', country:'DE', color:'#e11d48', sourceLabel:'FM Stream' },
    { id:'fm_90s', name:'90s Radio (laut.fm)', desc:'Best of 90s hits', url:'https://stream.laut.fm/90s', genre:'90s', country:'DE', color:'#7c3aed', sourceLabel:'FM Stream' },
    { id:'fm_lounge', name:'Lounge Radio (laut.fm)', desc:'Chillout & Lounge 24/7', url:'https://stream.laut.fm/lounge', genre:'Lounge', country:'DE', color:'#0891b2', sourceLabel:'FM Stream' },
    { id:'fm_salsa', name:'Salsa Radio (laut.fm)', desc:'Latin Salsa & Tropical 24/7', url:'https://stream.laut.fm/salsa', genre:'World', country:'DE', color:'#dc2626', sourceLabel:'FM Stream' },
    { id:'fm_gospel', name:'Gospel Radio (laut.fm)', desc:'Gospel & Christian 24/7', url:'https://stream.laut.fm/gospel', genre:'Gospel', country:'DE', color:'#d97706', sourceLabel:'FM Stream' },
    { id:'fm_punk', name:'Punk Radio (laut.fm)', desc:'Punk & Hardcore 24/7', url:'https://stream.laut.fm/punk', genre:'Rock', country:'DE', color:'#1f2937', sourceLabel:'FM Stream' },
    { id:'fm_smooth', name:'Smooth Jazz (laut.fm)', desc:'Smooth Jazz 24/7', url:'https://stream.laut.fm/smoothjazz', genre:'Jazz', country:'DE', color:'#5b21b6', sourceLabel:'FM Stream' },
    { id:'fm_piano', name:'Piano Radio (laut.fm)', desc:'Solo piano & instrumental', url:'https://stream.laut.fm/piano', genre:'Classical', country:'DE', color:'#a16207', sourceLabel:'FM Stream' },
    { id:'fm_hits', name:'Top Hits Radio (laut.fm)', desc:'Current Top Hits 24/7', url:'https://stream.laut.fm/tophits', genre:'Pop', country:'DE', color:'#3b82f6', sourceLabel:'FM Stream' },
  ];

  // ── Shoutcast curated popular stations (global, community-based)
  const SHOUTCAST_CURATED = [
    { id:'sc_kexp', name:'KEXP 90.3 FM Seattle', desc:'Indie, alternative, world music — listener-funded', url:'https://kexp-mp3-128.streamguys1.com/kexp128.mp3', genre:'Indie', country:'US', color:'#10b981', sourceLabel:'Shoutcast' },
    { id:'sc_di_trance', name:'SomaFM Space Station', desc:'Electronic/ambient space music 24/7', url:'https://ice1.somafm.com/spacestation-128-mp3', genre:'Trance', country:'US', color:'#8b5cf6', sourceLabel:'Shoutcast' },
    { id:'sc_di_house', name:'SomaFM Sonic Universe', desc:'Jazz fusion & world music 24/7', url:'https://ice1.somafm.com/sonicuniverse-128-mp3', genre:'House', country:'US', color:'#f59e0b', sourceLabel:'Shoutcast' },
    { id:'sc_di_chillout', name:'SomaFM Thistle Radio', desc:'Celtic/folk/world music 24/7', url:'https://ice1.somafm.com/thistle-128-mp3', genre:'Chillout', country:'US', color:'#06b6d4', sourceLabel:'Shoutcast' },
    { id:'sc_di_drumandbass', name:'SomaFM Drone Zone', desc:'Atmospheric ambient drone 24/7', url:'https://ice1.somafm.com/dronezone-128-mp3', genre:'Drum & Bass', country:'US', color:'#7c3aed', sourceLabel:'Shoutcast' },
    { id:'sc_di_deephouse', name:'SomaFM Deep Space One', desc:'Deep ambient electronic 24/7', url:'https://ice1.somafm.com/deepspaceone-128-mp3', genre:'House', country:'US', color:'#f97316', sourceLabel:'Shoutcast' },
    { id:'sc_di_electro', name:'SomaFM Beat Blender', desc:'Electronic beat-driven music 24/7', url:'https://ice1.somafm.com/beatblender-128-mp3', genre:'Electronic', country:'US', color:'#ef4444', sourceLabel:'Shoutcast' },
    { id:'sc_di_ambient', name:'SomaFM Dark Zone', desc:'Dark ambient electronic 24/7', url:'https://ice1.somafm.com/darkzone-128-mp3', genre:'Ambient', country:'US', color:'#3b82f6', sourceLabel:'Shoutcast' },
    { id:'sc_di_dubstep', name:'SomaFM Dubstep Beyond', desc:'Dubstep & bass music 24/7', url:'https://ice3.somafm.com/dubstep-128-mp3', genre:'Electronic', country:'US', color:'#6366f1', sourceLabel:'Shoutcast' },
    { id:'sc_di_classical', name:'SomaFM Classical', desc:'Classical music 24/7', url:'https://ice1.somafm.com/classical-128-mp3', genre:'Classical', country:'US', color:'#a16207', sourceLabel:'Shoutcast' },
    { id:'sc_di_jazzandblues', name:'SomaFM Lush', desc:'Smooth jazz & vocal lounge 24/7', url:'https://ice1.somafm.com/lush-128-mp3', genre:'Jazz', country:'US', color:'#5b21b6', sourceLabel:'Shoutcast' },
    { id:'sc_di_reggae', name:'SomaFM Reggae Rec', desc:'Reggae & dancehall 24/7', url:'https://ice1.somafm.com/reggae-128-mp3', genre:'Reggae', country:'US', color:'#16a34a', sourceLabel:'Shoutcast' },
    { id:'sc_di_metal', name:'SomaFM Metal Detector', desc:'Heavy metal 24/7', url:'https://ice1.somafm.com/metal-128-mp3', genre:'Metal', country:'US', color:'#dc2626', sourceLabel:'Shoutcast' },
    { id:'sc_di_hiphop', name:'SomaFM Hip-Hop Spectrum', desc:'Hip-Hop & R&B 24/7', url:'https://ice1.somafm.com/hiphop-128-mp3', genre:'Hip-Hop', country:'US', color:'#d97706', sourceLabel:'Shoutcast' },
    { id:'sc_di_latinhouse', name:'SomaFM Salsa Station', desc:'Latin salsa & tropical 24/7', url:'https://ice1.somafm.com/salsa-128-mp3', genre:'World', country:'US', color:'#10b981', sourceLabel:'Shoutcast' },
    { id:'sc_wfmu', name:'WFMU Free Music Archive', desc:'Freeform radio from Jersey City NJ', url:'https://stream.wfmu.org/freeform/high/128kbps.mp3', genre:'Eclectic', country:'US', color:'#4b5563', sourceLabel:'Shoutcast' },
    { id:'sc_bbc_6music', name:'BBC Radio 6 Music', desc:'Alternative & indie from BBC', url:'https://stream.live.vc.bbcmedia.co.uk/bbc_6music', genre:'Indie', country:'GB', color:'#e11d48', sourceLabel:'Shoutcast' },
    { id:'sc_fip_fr', name:'FIP Radio France', desc:'Eclectic mix of world music & jazz', url:'https://icecast.radiofrance.fr/fip-midfi.mp3', genre:'World', country:'FR', color:'#3b82f6', sourceLabel:'Shoutcast' },
  ];

  // ── Peta keyword genre → bucket
  const getExtraStationsForGenre = (genreName) => {
    const bucket = getGenreBucket(genreName);
    if (!bucket) return { soma: [], icecast: [], nts: [], radioParadise: [], fmStream: [], shoutcast: [] };
    const keywords = GENRE_KEYWORDS[bucket];

    const soma = somaChannels
      .filter(ch => matchGenreKeywords(ch.genre, keywords))
      .slice(0, 6)
      .map(ch => ({
        id: `soma_extra_${ch.id}`,
        name: ch.title,
        city: 'San Francisco',
        url: ch.plls?.[0]?.url || `https://ice1.somafm.com/${ch.id}-128-mp3`,
        desc: ch.description,
        image: ch.image,
        sourceLabel: 'SomaFM',
        color: '#10b981',
        stationuuid: `soma_extra_${ch.id}`,
      }));

    const icecast = ICECAST_CURATED
      .filter(s => matchGenreKeywords(s.genre, keywords))
      .slice(0, 4)
      .map(s => ({ ...s, sourceLabel: 'Icecast', stationuuid: s.id }));

    const ntsRelevant = ['electronic', 'world', 'hiphop', 'folk', 'pop', 'rock'];
    const nts = ntsRelevant.includes(bucket)
      ? NTS_STREAMS.map(s => ({ ...s, sourceLabel: 'NTS', stationuuid: s.id }))
      : [];

    const radioParadise = RADIO_PARADISE_CHANNELS
      .filter(s => matchGenreKeywords(s.genre, keywords) || matchGenreKeywords(s.desc, keywords))
      .slice(0, 2)
      .map(s => ({ ...s, sourceLabel: 'Radio Paradise', stationuuid: s.id, favicon: s.image }));

    const fmStream = FMSTREAM_CURATED
      .filter(s => matchGenreKeywords(s.genre, keywords) || matchGenreKeywords(s.name, keywords))
      .slice(0, 3)
      .map(s => ({ ...s, stationuuid: s.id }));

    const shoutcast = SHOUTCAST_CURATED
      .filter(s => matchGenreKeywords(s.genre, keywords) || matchGenreKeywords(s.name, keywords))
      .slice(0, 4)
      .map(s => ({ ...s, stationuuid: s.id }));

    return { soma, icecast, nts, radioParadise, fmStream, shoutcast };
  };

  // ── HLS.js dynamic loader — hanya load sekali via CDN
  const _hlsLibRef = useRef(null);
  const loadHlsLib = useCallback(() => {
    if (_hlsLibRef.current) return Promise.resolve(_hlsLibRef.current);
    return new Promise((resolve, reject) => {
      if (window.Hls) { _hlsLibRef.current = window.Hls; resolve(window.Hls); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.11/dist/hls.min.js';
      script.onload = () => { _hlsLibRef.current = window.Hls; resolve(window.Hls); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  // ── Pasang HLS.js ke elemen audio untuk URL .m3u8
  const attachHls = useCallback((audioEl, src, onReady) => {
    // Hancurkan instance lama
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    loadHlsLib().then(Hls => {
      if (!Hls.isSupported()) {
        // Fallback: browser native HLS (Safari / Edge)
        audioEl.src = src;
        onReady && onReady();
        return;
      }
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDurationCount: 3,
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(audioEl);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { onReady && onReady(); });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad(); // coba lanjut dari jaringan
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy(); hlsRef.current = null;
          }
        }
      });
    }).catch(() => {
      // Jika CDN gagal, fallback langsung
      audioEl.src = src;
      onReady && onReady();
    });
  }, [loadHlsLib]);

  // ── Auto-reconnect untuk stream radio yang putus
  const scheduleRadioReconnect = useCallback((trackObj) => {
    if (radioReconnectRef.current) clearTimeout(radioReconnectRef.current);
    const attempt = radioReconnectCount.current;
    if (attempt >= 6) {
      // Sudah 6x gagal — beri tahu user dan berhenti
      radioReconnectCount.current = 0;
      setPlaying(false);
      setStreamBuffering(false);
      return;
    }
    // Exponential back-off: 2s, 4s, 8s, 16s, 30s, 30s
    const delay = Math.min(2000 * Math.pow(2, attempt), 30000);
    console.warn(`[Radio] Reconnect attempt ${attempt + 1} in ${delay}ms`);
    setStreamBuffering(true);
    radioReconnectRef.current = setTimeout(() => {
      radioReconnectCount.current += 1;
      const a = audioRef.current;
      if (!a || !trackObj.isRadio) return;
      const src = trackObj.src;
      if (src.includes('.m3u8')) {
        attachHls(a, src, () => { a.play().catch(() => {}); });
      } else {
        a.src = '';
        setTimeout(() => {
          a.src = src;
          a.load();
          a.play().catch(() => {});
        }, 100);
      }
    }, delay);
  }, [attachHls]);

  // ── Universal play function for any external radio station
  const playRbStation = (station) => {
    const streamUrl = radioUrl(station.url_resolved || station.url);
    stopAllMedia('radio');
    const stationColor = station.color || '#f59e0b';
    const radioTrackObj = {
      id: `rb_${station.stationuuid || station.id}`,
      title: station.name,
      artist: ([station.country, station.state, station.city].filter(Boolean).join(', ') || 'Online') + ' · Live Radio',
      album: 'Live Radio',
      cover: (station.favicon && station.favicon.startsWith('http')) ? station.favicon
           : (station.image || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop'),
      src: streamUrl,
      color: stationColor,
      bg: `${stationColor}22`,
      mood: 'live, radio',
      isRadio: true,
      sourceLabel: station.sourceLabel || 'Radio',
    };
    if (track.id === radioTrackObj.id) {
      setPlaying(p => !p);
    } else {
      play(radioTrackObj);
      setRadioStation({ id: station.stationuuid || station.id, name: station.name, city: [station.country, station.city].filter(Boolean).join(', ') || 'Online', color: stationColor, url: streamUrl });
      setRadioPlaying(true);
    }
    if (station.stationuuid) {
      getRbServer().then(base => fetch(`${base}/json/url/${station.stationuuid}`).catch(()=>{}));
    }
  };

  // ── All-source search (searches RadioBrowser + filters SomaFM + Icecast + NTS by genre)
  const multiSearch = async (query, genreTag) => {
    setMultiLoading(true); setMultiResults([]);
    const q = query.trim().toLowerCase();
    const isTopMode = !q && !genreTag;
    // Build genre keyword list from tag or query
    const tagLow = (genreTag||'').toLowerCase();
    const bucket = tagLow ? getGenreBucket(tagLow) : (q ? getGenreBucket(q) : null);
    const genreKeywords = bucket ? GENRE_KEYWORDS[bucket] : (tagLow ? [tagLow] : null);
    const matchesGenre = (label) => {
      if (!genreKeywords) return true; // no genre filter
      return matchGenreKeywords(label, genreKeywords);
    };
    const results = [];

    // ── Top Mode: include fixed top picks from all sources (not filtered by genre)
    if (isTopMode) {
      // Top picks from Radio Paradise (always HQ)
      RADIO_PARADISE_CHANNELS.slice(0, 4).forEach(s => results.push({ ...s, sourceLabel: 'Radio Paradise', stationuuid: s.id, favicon: s.image }));
      // Top picks from NTS Radio
      NTS_STREAMS.slice(0, 2).forEach(s => results.push({ ...s, sourceLabel: 'NTS Radio', country: 'UK', stationuuid: s.id }));
      // Top picks from Shoutcast / DI.FM
      SHOUTCAST_CURATED.slice(0, 5).forEach(s => results.push({ ...s, stationuuid: s.id }));
      // Top picks from FM Stream
      FMSTREAM_CURATED.slice(0, 4).forEach(s => results.push({ ...s, stationuuid: s.id }));
      // Top picks from Icecast curated
      ICECAST_CURATED.slice(0, 4).forEach(s => results.push({ ...s, sourceLabel: 'Icecast', stationuuid: s.id }));
    }

    // Ensure SomaFM data is loaded before filtering
    let somaData = somaChannels;
    if (somaData.length === 0) {
      try {
        const data = await fetch('https://somafm.com/channels.json').then(r => r.json());
        somaData = data.channels || [];
        setSomaChannels(somaData);
      } catch {
        somaData = [
          { id:'groovesalad', title:'Groove Salad', description:'A nicely chilled plate of ambient/downtempo beats and grooves.', listeners:3000, genre:'Ambient', image:'https://somafm.com/img3/groovesalad-400.jpg', plls:[{url:'https://ice1.somafm.com/groovesalad-128-mp3'}] },
          { id:'dronezone', title:'Drone Zone', description:'Served best chilled, safe with most medications. Experimental.', listeners:1200, genre:'Ambient', image:'https://somafm.com/img3/dronezone-400.jpg', plls:[{url:'https://ice1.somafm.com/dronezone-128-mp3'}] },
          { id:'secretagent', title:'Secret Agent', description:'The soundtrack for your stylish, mysterious life.', listeners:1100, genre:'Lounge', image:'https://somafm.com/img3/secretagent-400.jpg', plls:[{url:'https://ice1.somafm.com/secretagent-128-mp3'}] },
          { id:'lush', title:'Lush', description:'Sensuous and mellow female vocals, Dj mixes, Chillout.', listeners:1500, genre:'Chillout', image:'https://somafm.com/img3/lush-400.jpg', plls:[{url:'https://ice1.somafm.com/lush-128-mp3'}] },
          { id:'poptron', title:'PopTron', description:'Electropop and indie electronic pop.', listeners:600, genre:'Pop', image:'https://somafm.com/img3/poptron-400.jpg', plls:[{url:'https://ice1.somafm.com/poptron-128-mp3'}] },
          { id:'metal', title:'Metal Detector', description:'From black to doom, prog to sludge, indie to classic.', listeners:800, genre:'Metal', image:'https://somafm.com/img3/metal-400.jpg', plls:[{url:'https://ice1.somafm.com/metal-128-mp3'}] },
          { id:'sonicuniverse', title:'Sonic Universe', description:'Transcending the boundaries of jazz.', listeners:700, genre:'Jazz', image:'https://somafm.com/img3/sonicuniverse-400.jpg', plls:[{url:'https://ice1.somafm.com/sonicuniverse-128-mp3'}] },
          { id:'reggae', title:'Reggae Expat', description:'Classic Reggae, Dancehall, Dub.', listeners:500, genre:'Reggae', image:'https://somafm.com/img3/reggae-400.jpg', plls:[{url:'https://ice1.somafm.com/reggae-128-mp3'}] },
          { id:'cliqhop', title:'Cliqhop idm', description:'Blips, blops, and other electronic wonders.', listeners:900, genre:'IDM', image:'https://somafm.com/img3/cliqhop-400.jpg', plls:[{url:'https://ice1.somafm.com/cliqhop-128-mp3'}] },
          { id:'folkfwd', title:'Folk Forward', description:'Indie Folk, Roots, Americana and Singer-Songwriter.', listeners:500, genre:'Folk', image:'https://somafm.com/img3/folkfwd-400.jpg', plls:[{url:'https://ice1.somafm.com/folkfwd-128-mp3'}] },
        ];
        setSomaChannels(somaData);
      }
    }

    // SomaFM filter — by genre tag AND/OR text query (in Top mode: take top by listeners)
    const somaPool = isTopMode
      ? [...somaData].sort((a,b) => (b.listeners||0)-(a.listeners||0)).slice(0, 8)
      : somaData;
    const somaMatched = somaPool.filter(ch => {
      const genreOk = matchesGenre(ch.genre) || matchesGenre(ch.title) || matchesGenre(ch.description);
      const textOk = !q || ch.title?.toLowerCase().includes(q) || ch.genre?.toLowerCase().includes(q) || ch.description?.toLowerCase().includes(q);
      return genreKeywords ? genreOk : textOk;
    }).slice(0, 8).map(ch => ({
      id: `soma_${ch.id}`, name: ch.title, url: ch.plls?.[0]?.url || `https://ice1.somafm.com/${ch.id}-128-mp3`,
      country: 'US', tags: ch.genre, favicon: ch.image, sourceLabel: 'SomaFM', color: '#10b981',
      description: ch.description,
    }));
    results.push(...somaMatched);
    // In Top mode, curated sources already added above — skip re-adding to avoid duplicates
    if (!isTopMode) {
    // Icecast curated filter — by genre tag AND/OR text query
    const iceMatched = ICECAST_CURATED.filter(s => {
      const genreOk = matchesGenre(s.genre) || matchesGenre(s.name);
      const textOk = !q || s.name.toLowerCase().includes(q) || s.genre?.toLowerCase().includes(q);
      return genreKeywords ? genreOk : textOk;
    }).slice(0, 6).map(s => ({ ...s, sourceLabel: 'Icecast', stationuuid: null }));
    results.push(...iceMatched);
    // NTS — include when genre is relevant or no genre filter
    const ntsGenreBuckets = ['electronic', 'world', 'hiphop', 'folk', 'pop', 'rock'];
    const ntsOk = !genreKeywords || (bucket && ntsGenreBuckets.includes(bucket));
    if (ntsOk) {
      const ntsMatched = NTS_STREAMS.filter(s =>
        !q || s.name.toLowerCase().includes(q) || s.genre?.toLowerCase().includes(q) || s.desc?.toLowerCase().includes(q)
      ).map(s => ({ ...s, sourceLabel: 'NTS Radio', country: 'UK', stationuuid: null }));
      results.push(...ntsMatched);
    }
    // Radio Paradise — 4 curated high-fidelity channels, always relevant
    const rpMatched = RADIO_PARADISE_CHANNELS.filter(s => {
      const genreOk = !genreKeywords || matchGenreKeywords(s.genre, genreKeywords) || matchGenreKeywords(s.desc, genreKeywords);
      const textOk = !q || s.name.toLowerCase().includes(q) || s.genre?.toLowerCase().includes(q) || s.desc?.toLowerCase().includes(q);
      return genreKeywords ? genreOk : textOk;
    }).map(s => ({ ...s, sourceLabel: 'Radio Paradise', stationuuid: s.id, favicon: s.image }));
    results.push(...rpMatched);
    // FM Stream (laut.fm extended) — filter by genre & query
    const fmMatched = FMSTREAM_CURATED.filter(s => {
      const genreOk = !genreKeywords || matchGenreKeywords(s.genre, genreKeywords) || matchGenreKeywords(s.name, genreKeywords);
      const textOk = !q || s.name.toLowerCase().includes(q) || s.genre?.toLowerCase().includes(q) || s.desc?.toLowerCase().includes(q);
      return genreKeywords ? genreOk : textOk;
    }).slice(0, 6).map(s => ({ ...s, stationuuid: s.id }));
    results.push(...fmMatched);
    // Shoutcast (DI.FM + others) — filter by genre & query
    const scMatched = SHOUTCAST_CURATED.filter(s => {
      const genreOk = !genreKeywords || matchGenreKeywords(s.genre, genreKeywords) || matchGenreKeywords(s.name, genreKeywords);
      const textOk = !q || s.name.toLowerCase().includes(q) || s.genre?.toLowerCase().includes(q) || s.desc?.toLowerCase().includes(q);
      return genreKeywords ? genreOk : textOk;
    }).slice(0, 8).map(s => ({ ...s, stationuuid: s.id }));
    results.push(...scMatched);
    } // end !isTopMode
    // RadioBrowser — search by tag if genre selected, else by text
    try {
      const base = await getRbServer();
      let url;
      if (genreTag) {
        url = `${base}/json/stations/bytag/${encodeURIComponent(genreTag)}?limit=30&hidebroken=true&order=votes&reverse=true`;
      } else if (q) {
        url = `${base}/json/stations/search?name=${encodeURIComponent(q)}&limit=30&hidebroken=true&order=votes&reverse=true`;
      } else {
        url = `${base}/json/stations/topvote/30?hidebroken=true`;
      }
      const rb = await fetch(url).then(r=>r.json());
      rb.filter(s => s.url_resolved || s.url).slice(0,30).forEach(s => results.push({ ...s, sourceLabel: 'RadioBrowser', color: '#f59e0b' }));
    } catch {}
    // Radio Garden — cari berdasarkan places + keyword stasiun
    try {
      let gardenPlacesLocal = gardenPlaces;
      if (gardenPlacesLocal.length === 0) {
        const data = await fetch('/api/radio-garden/content/places').then(r=>r.json());
        gardenPlacesLocal = (data?.data?.list || []).slice(0, 500);
        setGardenPlaces(gardenPlacesLocal);
      }
      // Pilih kota yang relevan
      let targetPlaces;
      if (q) {
        targetPlaces = gardenPlacesLocal.filter(p =>
          p.title?.toLowerCase().includes(q) || p.country?.toLowerCase().includes(q)
        ).slice(0, 6);
        if (targetPlaces.length === 0) targetPlaces = gardenPlacesLocal.slice(0, 5);
      } else {
        targetPlaces = gardenPlacesLocal.slice(0, 6);
      }
      const gardenResults = await Promise.allSettled(
        targetPlaces.map(p => {
          const placeId = p.id || (p.url||'').split('/').pop();
          return fetch(`/api/radio-garden/content/page/${placeId}/channels`)
            .then(r=>r.json())
            .then(data => {
              const items = data?.data?.content?.[0]?.items || [];
              return items.slice(0, 6).map(ch => {
                const chId = ch.page?.url?.split('/').pop() || ch.href?.split('/').pop() || '';
                const name = ch.page?.title || ch.title || 'Station';
                return {
                  id: `garden_search_${chId}`,
                  name,
                  city: p.title || '',
                  country: p.country || '',
                  genre: ch.page?.subtitle || '',
                  url: getGardenStreamUrl(chId),
                  sourceLabel: 'Radio Garden',
                  color: '#22d3ee',
                  stationuuid: `garden_search_${chId}`,
                  chId,
                };
              });
            });
        })
      );
      let gardenStns = gardenResults.flatMap(r => r.status === 'fulfilled' ? r.value : []).filter(s => s.chId);
      // Filter by genre keywords
      if (genreKeywords && genreKeywords.length > 0) {
        const gFiltered = gardenStns.filter(s =>
          matchGenreKeywords(s.name, genreKeywords) || matchGenreKeywords(s.genre, genreKeywords)
        );
        if (gFiltered.length > 0) gardenStns = gFiltered;
      }
      // Filter by text query
      if (q) {
        gardenStns = gardenStns.filter(s =>
          s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q)
        );
      }
      results.push(...gardenStns.slice(0, 10));
    } catch {}
    setMultiResults(results);
    setMultiLoading(false);
    // Trigger health check untuk semua hasil multi-search
    const msKey = `multisearch__${q}__${genreTag||''}`;
    testStationsInGenre({ id: msKey, stations: results.map(s => ({ id: s.id || s.stationuuid, url: s.url })) });
  };

  // ── PLAY
  const play = useCallback(async (t) => {
    // ── Handle fav tracks from SC / Spotify / Radio
    if (t.type === 'soundcloud') {
      stopAllMedia('embed');
      setScWidget(p => ({ ...p, soundcloud: t.permalink || t.src }));
      setTab('stream'); return;
    }
    if (t.type === 'spotify') {
      if (t.previewUrl) {
        stopAllMedia('local');
        setEmbedTrack(null);
        const spNativeTrack = {
          id: `ws_spotify_${t.id}`,
          title: t.title || t.name,
          artist: t.artist || t.artists?.map(a=>a.name).join(', ') || 'Spotify',
          album: 'Spotify Preview',
          cover: t.cover || t.album?.images?.[0]?.url || '',
          src: t.previewUrl,
          color: '#1DB954',
          bg: 'rgba(29,185,84,0.15)',
          mood: '',
          _wsSource: 'spotify',
        };
        setCustomSongs(prev => { const ex = prev.find(s=>s.id===spNativeTrack.id); return ex ? prev : [spNativeTrack, ...prev]; });
        setTrack(spNativeTrack);
        setProgress(0); setDuration(0);
        setPlaying(true);
        setTab('player');
        return;
      }
      if (t.spotifyUrl) window.open(t.spotifyUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (t.isRadio) {
      const radioTrackObj = { id: t.id, title: t.title, artist: t.artist, album: 'Live Radio', cover: t.cover, src: t.src, color: t.color||'#f59e0b', bg: t.bg||'rgba(245,158,11,0.15)', mood: 'live, radio', isRadio: true };
      stopAllMedia('radio');
      setRadioStation({ id: t.id.replace('radio_',''), name: t.title, url: t.src, color: t.color||'#f59e0b' });
      setRadioPlaying(true); setTrack(radioTrackObj); setPlaying(true); setTab('player'); return;
    }
    let td = { ...t };
    stopAllMedia('local');
    if (t.isDrive && t.driveId && (!t.src || !t.src.startsWith('blob:'))) {
      setLoadingTrack(true);
      setDriveDownProg(0);

      // Baca isLite dari ref agar tidak stale di closure
      const liteModeNow = isLiteRef.current;

      // ── Cek cache — hanya di Pro mode. Lite langsung stream adaptif (tidak pakai blob full)
      if (!liteModeNow) {
        try {
          const cachedBlob = await cacheGet(t.driveId);
          if (cachedBlob) {
            const { isFull } = checkCachedBlob(t.driveId, cachedBlob);
            const url = URL.createObjectURL(cachedBlob);
            _blobCache.set(t.driveId + ':cached', url);
            setCustomSongs(prev => prev.map(s => s.id === t.id ? { ...s, src: url } : s));
            td = { ...t, src: url };
            setDriveError('');
            setLoadingTrack(false);
            setDriveDownProg(0);
            setDrivePhase('idle');

            // Switch ke track dan mulai putar
            setTrack(td); setProgress(0); setDuration(0); setPlaying(true);
            setTab('player');

            if (isFull) return; // Cache penuh — selesai

            // Cache parsial — lanjutkan download di background
            const tok2 = tokenRef.current;
            if (tok2 && navigator.onLine) {
              setDrivePhase('download');
              setDriveDownProg(0);
              driveDownloadBlob(
                t.driveId, tok2,
                (pct) => setDriveDownProg(pct),
                () => {
                  setCachedDriveIds(prev => new Set([...prev, t.driveId]));
                  setDrivePhase('idle');
                  setTimeout(() => setDriveDownProg(0), 1200);
                },
                true
              ).catch(() => { setDrivePhase('idle'); setDriveDownProg(0); });
            }
            return;
          }
        } catch {}
      }

      // ── Tidak ada cache di Pro mode — cek cache untuk Lite mode saat offline
      if (!navigator.onLine) {
        // Lite mode belum cek cache — coba ambil dari Cache API dulu
        if (liteModeNow) {
          try {
            const cachedBlob = await cacheGet(t.driveId);
            if (cachedBlob) {
              const url = URL.createObjectURL(cachedBlob);
              _blobCache.set(t.driveId + ':cached', url);
              setCustomSongs(prev => prev.map(s => s.id === t.id ? { ...s, src: url } : s));
              setDriveError('');
              setLoadingTrack(false);
              setDriveDownProg(0);
              setDrivePhase('idle');
              setTrack({ ...t, src: url }); setProgress(0); setDuration(0); setPlaying(true);
              setTab('player');
              return;
            }
          } catch {}
        }
        // Benar-benar tidak ada cache
        setDriveError(lang==='id'
          ? 'Lagu ini belum diunduh. Sambungkan internet dan putar sekali untuk menyimpan offline.'
          : 'This song has not been downloaded. Connect to the internet and play it once to save offline.');
        setLoadingTrack(false); setDriveDownProg(0); setDrivePhase('idle'); return;
      }

      let tok = tokenRef.current;
      if (!tok) {
        setDriveError(t?.loginRequired||'Sign in with Google first');
        setLoadingTrack(false); setDriveDownProg(0); setDrivePhase('idle'); return;
      }

      const tryLoad = async (useTok) => {
        if (!liteModeNow) {
          // ── Pro FASE 1: stream via MediaSource, audio langsung bisa diputar
          setDrivePhase('check');
          const streamUrl = await driveStreamBlob(t.driveId, useTok);

          const tdStream = { ...t, src: streamUrl };
          setCustomSongs(prev => prev.map(s => s.id === t.id ? { ...s, src: streamUrl } : s));
          setDriveError('');
          setLoadingTrack(false);
          setDrivePhase('idle');
          setTrack(tdStream); setProgress(0); setDuration(0); setPlaying(true);
          setTab('player');

          // ── Pro FASE 2: download full blob di background
          setTimeout(() => {
            setDrivePhase('download');
            setDriveDownProg(0);
            driveDownloadBlob(
              t.driveId, useTok,
              (pct) => setDriveDownProg(pct),
              () => {
                setCachedDriveIds(prev => new Set([...prev, t.driveId]));
                setDriveDownProg(100);
                setDrivePhase('idle');
                setTimeout(() => setDriveDownProg(0), 1200);
              }
            ).catch(() => {
              setDrivePhase('idle');
              setDriveDownProg(0);
            });
          }, 500);

          return null; // track sudah di-set, caller tidak perlu doSwitch
        } else {
          // ── Lite: cek cache Pro dulu (hemat data kalau sudah pernah diunduh di Pro)
          setDrivePhase('check');
          try {
            const cachedBlob = await cacheGet(t.driveId);
            if (cachedBlob) {
              const { isFull } = checkCachedBlob(t.driveId, cachedBlob);
              if (isFull) {
                const url = URL.createObjectURL(cachedBlob);
                _blobCache.set(t.driveId + ':cached', url);
                setCustomSongs(prev => prev.map(s => s.id === t.id ? { ...s, src: url } : s));
                setDriveError('');
                setLoadingTrack(false);
                setDrivePhase('idle');
                setTrack({ ...t, src: url }); setProgress(0); setDuration(0); setPlaying(true);
                setTab('player');
                return null; // cache hit — track sudah di-set
              }
              // Cache parsial — lanjut stream adaptif
            }
          } catch {}
          setDrivePhase('idle');
          const url = await driveStreamLite(t.driveId, useTok, audioRef);
          return url;
        }
      };

      try {
        let url;
        try {
          url = await tryLoad(tok);
        } catch(e) {
          if (e.message.includes('401') || e.message.includes('403')) {
            try {
              tok = await silentRefreshToken();
              url = await tryLoad(tok);
            } catch {
              setDriveError('Google session expired. Tap Login to continue.');
              setLoadingTrack(false); setDriveDownProg(0); setDrivePhase('idle'); return;
            }
          } else { throw e; }
        }
        // null = track sudah di-set di dalam tryLoad (Pro stream atau Lite cache hit)
        if (url === null) return;
        // Lite stream URL baru — set track dan mulai putar
        setCustomSongs(prev => prev.map(s => s.id === t.id ? { ...s, src: url } : s));
        td = { ...t, src: url };
        setDriveError('');
        setLoadingTrack(false);
        setDrivePhase('idle');
        setTrack(td); setProgress(0); setDuration(0); setPlaying(true);
        setTab('player');
        return;
      } catch(e) {
        setDriveError('Gagal memutar: ' + e.message);
        setLoadingTrack(false); setDriveDownProg(0); setDrivePhase('idle'); return;
      }
    }

    // ── Non-Drive track: toggle play/pause jika sudah aktif, atau switch track
    if (track.id === td.id) { setPlaying(p=>!p); return; }
    if (audioRef.current) { audioRef.current.pause(); }
    setTrack(td); setProgress(0); setDuration(0); setPlaying(true);
    setTab('player');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  // ── NEXT / PREV
  const activePlRef = useRef(null); // kept in sync below

  const goNext = useCallback(() => {
    // ── WS queue: advance within web-search audio queue
    if (track._wsSource && wsQueueRef.current.length > 0) {
      const nextIdx = wsQueueIdxRef.current + 1;
      if (nextIdx < wsQueueRef.current.length) {
        wsQueueIdxRef.current = nextIdx;
        playWsTrack(wsQueueRef.current[nextIdx], wsQueueRef.current, nextIdx);
      } else if (repeatRef.current === 'all') {
        wsQueueIdxRef.current = 0;
        playWsTrack(wsQueueRef.current[0], wsQueueRef.current, 0);
      }
      return;
    }
    // ── Gunakan lagu dalam playlist aktif jika ada, fallback ke seluruh koleksi
    const songs = activePlRef.current && activePlRef.current.length > 0
      ? activePlRef.current
      : [...builtinSongs, ...customSongs, ...ytSongs];
    if (repeatRef.current==='one') { if(audioRef.current){audioRef.current.currentTime=0;audioRef.current.play().catch(()=>{});} return; }
    if (shuffleRef.current) {
      const others = songs.filter(s=>s.id!==track.id);
      if (others.length) play(others[Math.floor(Math.random()*others.length)]);
    } else {
      const i = songs.findIndex(s=>s.id===track.id);
      const next = songs[(i+1)%songs.length];
      if (next) play(next);
    }
  }, [track, play, playWsTrack, customSongs, ytSongs]);

  // Keep goNextRef always pointing to latest goNext
  useEffect(() => { goNextRef.current = goNext; }, [goNext]);
  useEffect(() => { ytNextRef.current = ytNext; }, [ytNext]);
  useEffect(() => { wsNextRef.current = goNext; }, [goNext]); // ws uses goNext which handles ws queue

  const goPrev = useCallback(() => {
    // ── WS queue: go back within web-search audio queue
    if (track._wsSource && wsQueueRef.current.length > 0) {
      if (progress > 3) { if(audioRef.current){audioRef.current.currentTime=0;setProgress(0);} return; }
      const prevIdx = wsQueueIdxRef.current - 1;
      if (prevIdx >= 0) {
        wsQueueIdxRef.current = prevIdx;
        playWsTrack(wsQueueRef.current[prevIdx], wsQueueRef.current, prevIdx);
      }
      return;
    }
    if (progress > 3) { if(audioRef.current){audioRef.current.currentTime=0;setProgress(0);} return; }
    // ── Gunakan lagu dalam playlist aktif jika ada, fallback ke seluruh koleksi
    const songs = activePlRef.current && activePlRef.current.length > 0
      ? activePlRef.current
      : [...builtinSongs, ...customSongs, ...ytSongs];
    const i = songs.findIndex(s=>s.id===track.id);
    play(songs[(i-1+songs.length)%songs.length]);
  }, [track, play, playWsTrack, customSongs, ytSongs, progress]);

  // ── SEEK
  const seekByPct = useCallback((p) => {
    const a = audioRef.current; if (!a) return;
    const dur = (isFinite(a.duration) && a.duration > 0) ? a.duration : duration;
    if (!dur) return;
    a.currentTime = p * dur;
    setProgress(p * dur);
    if (dur > 0 && dur !== duration) setDuration(dur);
  }, [duration]);

  // ── RADIO NEXT / PREV (navigate within same genre)
  const goNextRadio = useCallback(() => {
    if (!radioStation) return;
    // Use Radio Browser fetched stations if available
    const stations = rbBrowseRef.current && rbBrowseRef.current.length > 0
      ? rbBrowseRef.current
      : (() => {
          const platform = STREAMING_PLATFORMS.find(p => p.embedType === 'radio');
          if (!platform) return [];
          const country = platform.countries.find(c => c.id === radioStation.countryId);
          if (!country) return [];
          const genre = country.genres.find(g => g.id === radioStation.genreId);
          return genre ? genre.stations : [];
        })();
    const idx = stations.findIndex(s => s.id === radioStation.id);
    const nextStation = stations[(idx + 1) % stations.length];
    if (!nextStation) return;
    const radioTrackObj = {
      id: `radio_${nextStation.id}`,
      title: nextStation.name,
      artist: nextStation.city + ' · Live Radio',
      album: 'Live Radio',
      cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
      src: nextStation.url,
      color: radioStation.color || '#f59e0b',
      bg: `rgba(245,158,11,0.15)`,
      mood: 'live, radio',
      isRadio: true,
    };
    play(radioTrackObj);
    setRadioStation({ ...nextStation, color: radioStation.color || '#f59e0b', countryId: radioStation.countryId, genreId: radioStation.genreId });
    setRadioPlaying(true);
  }, [radioStation, play]);

  const goPrevRadio = useCallback(() => {
    if (!radioStation) return;
    // Use Radio Browser fetched stations if available
    const stations = rbBrowseRef.current && rbBrowseRef.current.length > 0
      ? rbBrowseRef.current
      : (() => {
          const platform = STREAMING_PLATFORMS.find(p => p.embedType === 'radio');
          if (!platform) return [];
          const country = platform.countries.find(c => c.id === radioStation.countryId);
          if (!country) return [];
          const genre = country.genres.find(g => g.id === radioStation.genreId);
          return genre ? genre.stations : [];
        })();
    const idx = stations.findIndex(s => s.id === radioStation.id);
    const prevStation = stations[(idx - 1 + stations.length) % stations.length];
    if (!prevStation) return;
    const radioTrackObj = {
      id: `radio_${prevStation.id}`,
      title: prevStation.name,
      artist: prevStation.city + ' · Live Radio',
      album: 'Live Radio',
      cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
      src: prevStation.url,
      color: radioStation.color || '#f59e0b',
      bg: `rgba(245,158,11,0.15)`,
      mood: 'live, radio',
      isRadio: true,
    };
    play(radioTrackObj);
    setRadioStation({ ...prevStation, color: radioStation.color || '#f59e0b', countryId: radioStation.countryId, genreId: radioStation.genreId });
    setRadioPlaying(true);
  }, [radioStation, play]);

  // ── REPEAT cycle
  // Di stream (embedTrack YouTube): off → all → one → off
  // Di player biasa (Drive/lokal): off → all → one → off
  // Keduanya: mengaktifkan repeat → matikan shuffle, dan sebaliknya
  const cycleRepeat = () => {
    if (embedTrack?.type === 'youtube') {
      setRepeat(r => {
        const next = r === 'off' ? 'all' : r === 'all' ? 'one' : 'off';
        if (next !== 'off') setShuffle(false);
        return next;
      });
    } else {
      setRepeat(r => {
        const next = r==='off'?'all':r==='all'?'one':'off';
        if (next !== 'off') setShuffle(false); // matikan shuffle saat repeat aktif
        return next;
      });
    }
  };

  // ── LYRICS
  const getLyrics = async () => {
    setLL(true);
    setLyrics(''); setLyricsNeedGenerate(false); setLyricsGenerated(false);
    setLyricsRomanized('');
    setLyricsRomanizing(false);

    // Resolve active track info
    const activeTitle  = embedTrack ? (embedTrack.title  || track.title)  : track.title;
    const activeArtist = embedTrack ? (embedTrack.artist || track.artist) : track.artist;
    const activeMood   = track.mood || '';

    // Helper: clean string for API queries
    const clean = (s) => s.replace(/\(.*?\)|\[.*?\]|feat\..*|ft\..*|official.*|lyric.*|video.*/gi,'').trim();
    const cleanTitle  = clean(activeTitle);
    const cleanArtist = clean(activeArtist);

    // Helper: strip LRC timestamps
    const stripLRC = (s) => s.replace(/^\[\d+:\d+\.\d+\]\s*/gm, '').trim();

    // ── Cache: cek apakah lirik sudah pernah di-fetch/generate sebelumnya
    const cacheKey = `${cleanTitle.toLowerCase()}|${cleanArtist.toLowerCase()}`;
    const cached = lyricsCacheRef.current.get(cacheKey);
    if (cached) {
      setLyrics(cached.text);
      setLyricsGenerated(cached.generated);
      if (cached.modelLabel) setActiveModelLabel(cached.modelLabel);
      setLL(false);
      return;
    }

    // ── Helper: fetch dengan timeout (default 7 detik per sumber)
    const fetchWithTimeout = (url, options = {}, ms = 7000) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ms);
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
    };

    // ── Source 1: lrclib.net
    const fetchLrclib = async () => {
      const q = encodeURIComponent(`${cleanTitle} ${cleanArtist}`);
      const resp = await fetchWithTimeout(`https://lrclib.net/api/search?q=${q}`);
      if (!resp.ok) return null;
      const results = await resp.json();
      if (!Array.isArray(results) || results.length === 0) return null;
      const best = results.find(r =>
        r.plainLyrics && r.plainLyrics.trim().length > 20 &&
        (r.trackName?.toLowerCase().includes(cleanTitle.toLowerCase().slice(0,8)) ||
         cleanTitle.toLowerCase().includes((r.trackName||'').toLowerCase().slice(0,8)))
      ) || results.find(r => r.plainLyrics && r.plainLyrics.trim().length > 20);
      if (best?.plainLyrics && best.plainLyrics.trim().length > 20) return best.plainLyrics.trim();
      if (best?.syncedLyrics) { const p = stripLRC(best.syncedLyrics); if (p.length > 20) return p; }
      return null;
    };

    // ── Source 2: lyrics.ovh
    const fetchOvh = async () => {
      const artist = encodeURIComponent(cleanArtist);
      const title  = encodeURIComponent(cleanTitle);
      const resp = await fetchWithTimeout(`https://api.lyrics.ovh/v1/${artist}/${title}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      return (data.lyrics && data.lyrics.trim().length > 20) ? data.lyrics.trim() : null;
    };

    // ── Source 3: textyl.co — synced lyrics, no-auth
    const fetchTextyl = async () => {
      const q = encodeURIComponent(`${cleanTitle} ${cleanArtist}`);
      const resp = await fetchWithTimeout(`/api/textyl/lyrics?q=${q}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      const text = data.map(l => l.lyrics || '').filter(Boolean).join('\n');
      return text.trim().length > 20 ? text.trim() : null;
    };

    // ── Source 4: ChartLyrics (via Vercel proxy, HTTP→HTTPS)
    const fetchChartLyrics = async () => {
      const artist = encodeURIComponent(cleanArtist);
      const song   = encodeURIComponent(cleanTitle);
      // Step 1: search for lyric ID
      const searchResp = await fetchWithTimeout(`/api/chartlyrics/SearchLyricDirect?artist=${artist}&song=${song}`);
      if (!searchResp.ok) return null;
      const xml = await searchResp.text();
      // Parse Lyric from XML
      const lyricMatch = xml.match(/<Lyric>([\s\S]*?)<\/Lyric>/);
      if (!lyricMatch || lyricMatch[1].trim().length < 20) return null;
      return lyricMatch[1].trim();
    };

    // ── Source 5: AI recall — coba ingat lirik asli dulu
    const fetchAIRecall = async () => {
      if (isLite) return null;
      const moodCtx = activeMood ? `Mood/genre: ${activeMood}.` : '';
      const r = await askAIRace(
        `You are a lyrics database expert.\n\nTitle: "${activeTitle}"\nArtist: ${activeArtist}\n${moodCtx}\n\nRULES:\n1. Output the REAL lyrics if you are confident you know them.\n2. If unsure, reply with exactly: NOT_FOUND\n3. Do NOT invent lyrics. Only real verified lyrics.\n4. Use ORIGINAL language, Latin alphabet only (romanize Korean/Japanese/Chinese/Arabic).\n5. Format: [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro].\n6. Output ONLY lyrics or NOT_FOUND.`,
        'You are a music lyrics expert. Output real verified lyrics in Latin alphabet, or reply NOT_FOUND. Never invent.'
      );
      if (!r || r.trim().toUpperCase().startsWith('NOT_FOUND') || r.trim().length < 10) return null;
      return { text: r.trim(), generated: false };
    };

    // ── Source 6: AI generate — tebak/tulis lirik kalau semua sumber gagal
    const fetchAIGenerate = async () => {
      if (isLite) return null;
      const moodCtx = activeMood ? `Genre/mood: ${activeMood}.` : '';
      const r = await askAIRace(
        `Tulis lirik lagu yang mungkin sesuai untuk:\nJudul: "${activeTitle}"\nArtis: ${activeArtist}\n${moodCtx}\n\nBuat lirik yang masuk akal sesuai judul, artis, dan gaya musiknya. Gunakan bahasa asli lagu (Indonesia untuk artis Indonesia, Inggris untuk artis internasional, dst). Tulis dalam aksara Latin.\nFormat: [Verse 1], [Chorus], [Verse 2], [Bridge], [Outro] sesuai kebutuhan.\nOutput HANYA liriknya saja, tanpa penjelasan, tanpa disclaimer.`,
        'Kamu adalah penulis lirik kreatif. Tulis lirik yang sesuai dengan judul dan gaya artis. Output hanya lirik saja.'
      );
      if (!r || r.trim().length < 20) return null;
      return { text: r.trim(), generated: true };
    };

    // ── Run all database sources + AI recall in parallel; AI generate only as last resort
    try {
      const [lrclib, ovh, textyl, chartlyrics, aiRecall] = await Promise.all([
        fetchLrclib().catch(() => null),
        fetchOvh().catch(() => null),
        fetchTextyl().catch(() => null),
        fetchChartLyrics().catch(() => null),
        fetchAIRecall().catch(() => null),
      ]);

      // Prefer database sources (akurat): lrclib > ovh > textyl > chartlyrics > AI recall
      const dbResult = lrclib       ? { text: lrclib,       generated: false }
                     : ovh          ? { text: ovh,          generated: false }
                     : textyl       ? { text: textyl,       generated: false }
                     : chartlyrics  ? { text: chartlyrics,  generated: false }
                     : aiRecall;

      if (dbResult) {
        setLyrics(dbResult.text);
        setLyricsGenerated(dbResult.generated);
        setActiveModelLabel(activeModel());
        // Simpan ke cache agar tidak re-fetch saat lagu sama diminta lagi
        lyricsCacheRef.current.set(cacheKey, { text: dbResult.text, generated: dbResult.generated, modelLabel: activeModel() });
      } else if (isLite) {
        setLyrics(t?.liteLyricsDisabled||'⚡ Lyrics not found in public database.\n\nLite Mode active — AI lyrics generation is disabled to save data.\n\nEnable Pro Mode to generate lyrics with AI.');
      } else {
        // Lirik tidak ditemukan di database — tampilkan tombol generate manual
        setLyricsNeedGenerate(true);
      }
    } catch(_) {
      setLyrics(t?.lyricsNotFoundResult || 'Lyrics not found');
    }

    setLL(false);
  };

  // ── Generate lirik AI secara manual (dipanggil saat user klik tombol)
  const generateLyricsManual = async () => {
    setLyricsGenerating(true);
    setLyricsNeedGenerate(false);

    const activeTitle  = embedTrack ? (embedTrack.title  || track.title)  : track.title;
    const activeArtist = embedTrack ? (embedTrack.artist || track.artist) : track.artist;
    const activeMood   = track.mood || '';
    const cacheKey = `${activeTitle.toLowerCase()}|${activeArtist.toLowerCase()}`;

    try {
      const moodCtx = activeMood ? `Genre/mood: ${activeMood}.` : '';
      const r = await askAIRace(
        `Tulis lirik lagu yang mungkin sesuai untuk:\nJudul: "${activeTitle}"\nArtis: ${activeArtist}\n${moodCtx}\n\nBuat lirik yang masuk akal sesuai judul, artis, dan gaya musiknya. Gunakan bahasa asli lagu (Indonesia untuk artis Indonesia, Inggris untuk artis internasional, dst). Tulis dalam aksara Latin.\nFormat: [Verse 1], [Chorus], [Verse 2], [Bridge], [Outro] sesuai kebutuhan.\nOutput HANYA liriknya saja, tanpa penjelasan, tanpa disclaimer.`,
        'Kamu adalah penulis lirik kreatif. Tulis lirik yang sesuai dengan judul dan gaya artis. Output hanya lirik saja.'
      );
      if (r && r.trim().length >= 20) {
        setLyrics(r.trim());
        setLyricsGenerated(true);
        setActiveModelLabel(activeModel());
        lyricsCacheRef.current.set(cacheKey, { text: r.trim(), generated: true, modelLabel: activeModel() });
      } else {
        setLyrics(t?.lyricsNotFoundResult || 'Lyrics not found');
      }
    } catch(_) {
      setLyrics(t?.lyricsNotFoundResult || 'Lyrics not found');
    }

    setLyricsGenerating(false);
  };

  // ── Auto-romanisation: detect non-Latin characters in lyrics
  const hasNonLatin = (text) => {
    // Matches CJK (Chinese/Japanese/Korean), Arabic, Thai, Devanagari, Hangul, Hiragana, Katakana, Cyrillic, etc.
    return /[\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u0E00-\u0E7F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/.test(text);
  };

  const romanizeLyrics = async (lyricsText) => {
    if (!lyricsText || !hasNonLatin(lyricsText)) return;
    if (isLite) return;
    setLyricsRomanizing(true);
    setLyricsRomanized('');
    const r = await askAIRace(
      `Romanize the following song lyrics into Latin alphabet. Keep ALL section tags like [Verse 1], [Chorus], etc. exactly as-is. For each non-Latin line, write the romanized pronunciation (romanji for Japanese, pinyin for Chinese, romanized for Korean/Arabic/etc). Keep blank lines. Output ONLY the romanized lyrics, no explanations.\n\nLyrics:\n${lyricsText}`,
      'You are a professional romanization expert. Romanize lyrics to Latin script. Keep structure/tags. Output only romanized lyrics.'
    ).catch(() => null);
    if (r && r.trim().length > 10) {
      setLyricsRomanized(r.trim());
    }
    setLyricsRomanizing(false);
  };



  // ── Translate lyrics to Bahasa Indonesia
  const translateLyrics = async () => {
    if (!lyrics || lyricsTranslating) return;
    setLyricsTranslating(true);
    setLyricsTranslation('');
    const r = await askAIRace(
      `Terjemahkan lirik lagu berikut ke Bahasa Indonesia yang natural dan puitis. Pertahankan format section tag seperti [Verse 1], [Chorus], dll. Terjemahkan HANYA teks liriknya, bukan tag. Jika sudah dalam Bahasa Indonesia, kembalikan teks aslinya.\n\nLirik:\n${lyrics}`,
      'Kamu adalah penerjemah lirik profesional. Terjemahkan ke Bahasa Indonesia yang natural dan puitis. Pertahankan semua section tag. Output HANYA terjemahan lirik tanpa penjelasan.'
    );
    setLyricsTranslation(r);
    setActiveModelLabel(activeModel());
    setLyricsTranslating(false);
  };

  // ── AI
  const getInsight = async () => {
    if (isLite) { setInsight(t?.liteInsightDisabled||'⚡ Lite Mode active — AI features disabled.'); return; }
    setIL(true);
    const activeTitle  = embedTrack ? (embedTrack.title  || track.title)  : track.title;
    const activeArtist = embedTrack ? (embedTrack.artist || track.artist) : track.artist;
    const r = await askAIRace(
      `Song: "${activeTitle}" by ${activeArtist}. Vibe/mood: ${track.mood || 'unknown'}.\n\n${lang === 'en' ? 'Write 1 short poetic sentence capturing the essence of this song. Use metaphors about stars, the universe, or nature. Max 20 words. English only.' : 'Buat 1 kalimat puitis singkat yang menangkap esensi lagu ini. Gunakan metafora tentang bintang, alam semesta, atau alam. Maksimal 20 kata. Bahasa Indonesia.'}`,
      `${lang === 'en' ? 'You are a poet. Reply with ONLY the poetic sentence, no quotes, no explanation.' : 'Kamu penyair. Balas HANYA kalimat puitis saja, tanpa tanda petik, tanpa penjelasan.'}`
    );
    setInsight(r);
    setActiveModelLabel(activeModel());
    setIL(false);
  };
  const sendChat = async () => {
    if (!input.trim()) return;
    if (dataSaver) {
      const msg=input; setInput('');
      setMessages(p=>[...p,{from:'user',text:msg},{from:'ai',text:t?.liteAiDisabled||'⚡ Lite Mode active — AI chat is disabled. Tap the Lite ⚡ button in the header to switch to Pro Mode.'}]);
      return;
    }
    const msg=input; setInput(''); setMessages(p=>[...p,{from:'user',text:msg}]); setCL(true);
    const r = await askAIRace(
      msg,
      `${t?.aiSystemPrompt||'You are Starry AI — a warm, fun, and versatile chat companion. Your personality: relaxed, friendly, a bit playful, but can be serious when needed. Use casual English. Answer briefly and naturally (max 100 words), not like a stiff chatbot. You can talk about anything: music, daily life, feelings, recommendations, trivia, jokes, motivation, or just hang out. Context: the user is listening to'} "${embedTrack ? (embedTrack.title || track.title) : track.title}" by ${embedTrack ? (embedTrack.artist || track.artist) : track.artist}${track.mood ? ' (mood: ' + track.mood + ')' : ''}.`
    );
    setMessages(p=>[...p,{from:'ai',text:r}]);
    setActiveModelLabel(activeModel());
    setCL(false);
  };
  const searchVibe = async () => {
    if (!vibeInput.trim()||vibeLoading) return;
    if (isLite) { setVibeInput(t?.liteVibeDisabled||'⚡ Lite Mode active — Vibe Search disabled'); return; }
    setVL(true);

    // First try to match from Drive songs
    if (customSongs.length > 0) {
      const customList = customSongs.slice(0,15).map((s,i)=>`${i+1}. "${s.title}" - ${s.artist} (mood: ${s.mood||'unknown'})`).join('\n');
      const r = await askAIRace(
        `User wants music with vibe/mood: "${vibeInput}"\n\nAvailable songs:\n${customList}\n\nChoose the song number that PALING cocok dengan vibe tersebut. Balas HANYA satu angka saja.`,
        'You are an AI music curator. Pick the most fitting song. Reply with the number only.'
      );
      const idx = parseInt(r.trim()) - 1;
      const found = customSongs[idx];
      if (found && idx >= 0 && idx < customSongs.length) {
        play(found);
        setVibeInput(`✨ Cocok untuk "${vibeInput}": ${found.title} - ${found.artist}`);
        setActiveModelLabel(activeModel());
        setVL(false);
        return;
      }
    }

    // Recommend a song → auto-search YouTube
    const r = await askAIRace(
      `User wants music with this vibe/mood: "${vibeInput}"\n\nGive ONLY 1 song recommendation in format:\nTITLE - ARTIS\n\nTidak ada teks lain, tidak ada penjelasan.`,
      'You are an AI music curator. Reply ONLY in format: TITLE - ARTIST. One line only.'
    );
    const line = r.trim().replace(/^["'✨*]+|["'*]+$/g, '');
    setVibeInput(`✨ ${line}`);
    setActiveModelLabel(activeModel());
    // Auto-search di YouTube
    const ytPlatformId = 'ytmusic';
    setYtQuery(p => ({...p, [ytPlatformId]: line}));
    setTab('stream');
    setTimeout(() => {
      searchYouTube(ytPlatformId, line);
    }, 120);
    setVL(false);
  };

  // ── Playlists
  const createPlaylist = useCallback(({ name, songIds }) => {
    const id = 'pl_' + Date.now();
    setPlaylists(p => [...p, { id, name, songIds, locked:false }]);
    setShowPlModal(false);
    setEditingPl(null);
    setPlView('list');
  }, []);

  const updatePlaylist = useCallback(({ name, songIds }) => {
    // Jika yang diedit adalah ❤️ Favorit, sinkronkan liked state untuk lagu yang dihapus
    if (editingPl?.id === 'pl_fav') {
      const removedIds = (editingPl.songIds || []).filter(id => !songIds.includes(id));
      if (removedIds.length > 0) {
        setLiked(l => { const n = { ...l }; removedIds.forEach(id => { n[id] = false; }); return n; });
        setFavSongs(p => p.filter(s => songIds.includes(s.id)));
      }
    }
    setPlaylists(p => p.map(pl => pl.id===editingPl.id ? { ...pl, name, songIds } : pl));
    setShowPlModal(false);
    setEditingPl(null);
    setPlView('list');
  }, [editingPl]);

  const deletePlaylist = useCallback((id) => {
    if (!window.confirm(t?.deletePlaylistConfirm||'Delete this playlist?')) return;
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
    if (plId === 'pl_fav') {
      setLiked(l => ({ ...l, [songId]: false }));
      setFavSongs(p => p.filter(s => s.id !== songId));
    }
  }, []);

  // ── Google
  const handleGoogleLogin = useCallback(() => {
    if (!window.google) return setDriveError('Google API belum siap, coba lagi.');
    if (GOOGLE_CLIENT_ID.includes('GANTI_DENGAN')) return setDriveError('⚙️ Isi GOOGLE_CLIENT_ID di App.jsx terlebih dahulu!');
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID, scope: GOOGLE_SCOPES,
      callback: async resp => {
        if (resp.error) return setDriveError('Login failed: '+resp.error);
        const tok=resp.access_token; setAccessToken(tok); tokenRef.current=tok;
        localStorage.setItem('sn_google_token', JSON.stringify({ token: tok, expiry: Date.now() + 3500 * 1000 }));
        try {
          const u=await (await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{ headers:{ Authorization:`Bearer ${tok}` } })).json();
          setGoogleUser(u); localStorage.setItem('sn_google_user', JSON.stringify(u));
        } catch(e) { setDriveError('Gagal ambil info user: '+e.message); }
        // Gunakan loadDriveSongs agar error handling konsisten
        await loadDriveSongs(tok, true);
      }
    });
    client.requestAccessToken();
  }, [loadDriveSongs]);
  const handleGoogleLogout = useCallback(() => {
    if (accessToken&&window.google) window.google.accounts.oauth2.revoke(accessToken,()=>{});
    setGoogleUser(null); setAccessToken(null); tokenRef.current=null; setCustomSongs([]); setDriveError('');
    localStorage.removeItem('sn_google_token'); localStorage.removeItem('sn_google_user');
  }, [accessToken]);
  const handleUpload = useCallback(async (file, meta) => {
    if (!accessToken) return alert(t?.loginRequiredAlert||'Please sign in with Google first!');
    setUploading(true); setUploadProg(10);
    const uploadTimer=setInterval(()=>setUploadProg(p=>p<85?p+5:p),400);
    try {
      const s=await driveUploadSong(file,meta,accessToken); clearInterval(uploadTimer); setUploadProg(100);
      setCustomSongs(p=>[...p,s]);
      setTimeout(()=>{ setShowUpload(false); setUploading(false); setUploadProg(0); },700);
    } catch(e) { clearInterval(uploadTimer); alert((t?.uploadBtn||'Upload')+ ' failed: '+e.message); setUploading(false); setUploadProg(0); }
  }, [accessToken]);

  const pct = duration>0?progress/duration:0;

  // ── All songs (combined from all sources)
  const allSongs = [...builtinSongs, ...customSongs, ...ytSongs, ...favSongs];

  // ── Search filter
  const q = searchQuery.toLowerCase();
  const filteredSongs = allSongs.filter(s => !q || (s.title||'').toLowerCase().includes(q) || (s.artist||'').toLowerCase().includes(q) || (s.album||'').toLowerCase().includes(q));
  const filteredCustom = filteredSongs.filter(s => s.isDrive);

  // ── Active playlist songs
  const activePlSongs = activePl
    ? (() => { const pl = playlists.find(p=>p.id===activePl); return pl ? allSongs.filter(s=>pl.songIds.includes(s.id)) : allSongs; })()
    : allSongs;

  // ── Sync activePlRef agar goNext/goPrev selalu pakai konteks playlist aktif
  useEffect(() => { activePlRef.current = activePlSongs; }, [activePlSongs]);


  // ── Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;

      // ── Space: play/pause (only when not typing)
      if (e.code === 'Space' && !isTyping) {
        e.preventDefault();
        if (track.src || embedTrack) setPlaying(p => !p);
        return;
      }

      // ── Arrow keys (only when not typing)
      if (!isTyping) {
        if (e.code === 'ArrowRight') {
          e.preventDefault();
          if (e.shiftKey) {
            // Shift+→ : next track
            if (embedTrack?.type === 'youtube') ytNext(); else if (track.isRadio) goNextRadio(); else goNext();
          } else {
            // →  : seek forward 5s
            if (embedTrack?.type === 'youtube') {
              setYtProgress(p => Math.min(p + 5, ytDuration));
            } else if (audioRef.current && duration > 0) {
              audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 5, duration);
            }
          }
          return;
        }
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          if (e.shiftKey) {
            // Shift+← : previous track
            if (embedTrack?.type === 'youtube') ytPrev(); else if (track.isRadio) goPrevRadio(); else goPrev();
          } else {
            // ← : seek back 5s
            if (embedTrack?.type === 'youtube') {
              setYtProgress(p => Math.max(p - 5, 0));
            } else if (audioRef.current) {
              audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 5, 0);
            }
          }
          return;
        }
        if (e.code === 'ArrowUp') {
          e.preventDefault();
          setVolume(v => { const nv = Math.min(v + 0.1, 1); setMuted(false); return +nv.toFixed(2); });
          return;
        }
        if (e.code === 'ArrowDown') {
          e.preventDefault();
          setVolume(v => { const nv = Math.max(v - 0.1, 0); return +nv.toFixed(2); });
          return;
        }

        // ── M : mute toggle
        if (e.code === 'KeyM') {
          setMuted(m => !m);
          return;
        }
        // ── S : shuffle toggle
        if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey) {
          setShuffle(s => !s);
          return;
        }
        // ── R : cycle repeat
        if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
          cycleRepeat();
          return;
        }
        // ── Q : toggle queue panel (only on player tab)
        if (e.code === 'KeyQ' && !e.ctrlKey && !e.metaKey) {
          if (tab === 'player') setShowQueue(q => !q);
          return;
        }
        // ── Escape : close overlays
        if (e.code === 'Escape') {
          if (showQueue) { setShowQueue(false); return; }
          if (showSettings) { setShowSettings(false); return; }
        }

        // ── Number keys 1-4 : switch tabs
        if (e.code === 'Digit1') { setTab('player'); return; }
        if (e.code === 'Digit2') { setTab('stream'); return; }
        if (e.code === 'Digit3') { setTab('playlist'); return; }
        if (e.code === 'Digit4') { setTab('ai'); return; }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [track, embedTrack, playing, volume, muted, shuffle, repeat, tab, showQueue, showSettings, duration, ytDuration, goNext, goPrev, ytNext, ytPrev, cycleRepeat, goNextRadio, goPrevRadio]);

  // tabs = only non-player tabs (Stream, Playlist, AI)
  // Player is accessed via the mini now-playing bar above the tab bar
  const tabs = [
    { id:'stream',   icon:<Radio size={17}/>,       label:'Stream' },
    { id:'playlist', icon:<FolderOpen size={17}/>, label:'Playlist' },
    { id:'ai',       icon:<Bot size={17}/>,        label:'Other' },
  ];

  return (
    <div className={`${isLite ? 'lite-mode' : 'pro-mode'} layout-${layoutMode}`} style={{ position:'fixed', inset:0, overflow:'hidden', background:'#07071a', color:'#f1f5f9', fontFamily:"'Segoe UI',system-ui,sans-serif", display:'flex', flexDirection:'column', userSelect:'none', WebkitTapHighlightColor:'transparent' }}>

      {/* BG — Pro only */}
      {!isLite && <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, background:`radial-gradient(ellipse at 60% 10%,${track.color}20 0%,transparent 60%)` }}/>}
      {!isLite && <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}><div className="stars"/><div className="starsB"/><div className="starsC"/></div>}

      {/* ══ HEADER */}
      {!fullscreen && <header style={{ position: 'sticky', top: 0, zIndex:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding: layoutMode === 'mobile-landscape' ? '5px 14px' : '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: isLite ? 'rgba(7,7,26,0.98)' : 'rgba(7,7,26,0.85)', ...(isLite ? {} : { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }) }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div onClick={() => window.location.reload()} title="Reload halaman" style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer' }}>
            <AppLogo size={layoutMode === 'mobile-landscape' ? 24 : 30}/>
            <div>
              <div style={{ fontWeight:900, fontSize: layoutMode === 'mobile-landscape' ? 11 : 13, lineHeight:1, letterSpacing:'-0.03em', background:'linear-gradient(90deg,#60a5fa,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Starry Night</div>
              <div style={{ fontSize: layoutMode === 'mobile-landscape' ? 8 : 9.5, fontWeight:700, color:'rgba(255,255,255,0.35)', marginTop:0.5, letterSpacing:'0.06em', textTransform:'uppercase' }}>MPlayer</div>
            </div>
          </div>
          {/* Clock in header for mobile-landscape */}
          {layoutMode === 'mobile-landscape' && (
            <div style={{ marginLeft:8, userSelect:'none', fontSize:0 }}>‌</div>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {/* Mode toggle */}
          <button onClick={toggleMode} title={isLite ? (t ? t.liteTitle : 'Mode Lite aktif (hemat data) — ketuk untuk Pro') : (t ? t.proTitle : 'Mode Pro — ketuk untuk Lite (hemat data)')}
            style={{ display:'flex', alignItems:'center', gap:3, padding:'4px 8px', borderRadius:999, border:`1px solid ${isLite ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)'}`, background: isLite ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', cursor:'pointer', color: isLite ? '#6ee7b7' : 'rgba(255,255,255,0.5)', fontSize:9, fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase' }}>
            {isLite ? <Zap size={9}/> : <Sparkles size={9}/>}
            {isLite ? 'Lite ⚡' : 'Pro'}
          </button>
          {/* Sleep timer badge */}
          {sleepTimer&&(
            <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 8px', borderRadius:999, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)' }}>
              <Moon size={11} style={{ color:'#fbbf24' }}/>
              <span style={{ fontSize:10, fontWeight:700, color:'#fbbf24', fontFamily:'monospace' }}>{fmtSec(sleepTimer.remaining)}</span>
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
      </header>}

      {/* ── Offline banner */}
      {!isOnline && (
        <div style={{ position:'relative', zIndex:11, flexShrink:0, padding:'6px 16px', background:'rgba(234,179,8,0.12)', borderBottom:'1px solid rgba(234,179,8,0.25)', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>📡</span>
          <span style={{ fontSize:11, color:'#fde68a', flex:1, fontWeight:600 }}>
            {t?.offlineBanner||'Offline — Downloaded songs can still be played'}
          </span>
          {cachedDriveIds.size > 0 && (
            <span style={{ fontSize:10, color:'rgba(253,230,138,0.6)', whiteSpace:'nowrap' }}>
              {cachedDriveIds.size} {t?.songsCount||'songs'} tersimpan
            </span>
          )}
        </div>
      )}

      {driveError&&<div style={{ position:'relative', zIndex:10, flexShrink:0, padding:'6px 16px', background:'rgba(239,68,68,0.15)', borderBottom:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:11, color:'#fca5a5', flex:1 }}>{driveError}</span>
        {/* Tombol Refresh — muncul jika ada token aktif (lagu tidak ditemukan / error jaringan) */}
        {tokenRef.current && !driveError.includes('Sesi') && !driveError.includes('Login') && (
          <button onClick={()=>{ setDriveError(''); loadDriveSongs(tokenRef.current, true); }}
            style={{ padding:'3px 8px', borderRadius:999, border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.2)', color:'#fca5a5', fontSize:10, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>{t?.refreshBtn||'↺ Refresh'}</button>
        )}
        {/* Tombol Login Ulang — muncul jika sesi expired */}
        {(driveError.includes('Sesi') || driveError.includes('401') || driveError.includes('Login')) && (
          <button onClick={()=>{ setDriveError(''); handleGoogleLogin(); }} style={{ padding:'3px 8px', borderRadius:999, border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.2)', color:'#fca5a5', fontSize:10, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>{t?.reloginBtn||'Re-login'}</button>
        )}
        <button onClick={()=>setDriveError('')} style={{ ...btn, padding:2, color:'#fca5a5' }}><X size={13}/></button>
      </div>}

      {/* ══ CONTENT — flex row wrapper for desktop sidebar layout */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'row', position:'relative', zIndex:5 }}>

      {/* Mobile Landscape — vertical icon nav on left */}
      {layoutMode === 'mobile-landscape' && !fullscreen && (
        <div style={{ width:52, flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.25)', display:'flex', flexDirection:'column', alignItems:'center', padding:'6px 0 10px', gap:2 }}>
          <button onClick={()=>setTab('player')} style={{ width:42, height:42, borderRadius:12, border:'none', cursor:'pointer', background:tab==='player'?`${track.color}25`:'transparent', color:tab==='player'?track.color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:1, position:'relative' }}>
            <Compass size={18}/>
            {tab==='player'&&<div style={{ position:'absolute', right:4, top:'50%', transform:'translateY(-50%)', width:3, height:16, borderRadius:999, background:track.color }}/>}
          </button>
          <div style={{ width:24, height:1, background:'rgba(255,255,255,0.07)', margin:'3px 0' }}/>
          {/* Mini album art */}
          {tab !== 'player' && (
            <div onClick={()=>setTab('player')} style={{ width:38, height:38, borderRadius:10, overflow:'hidden', cursor:'pointer', marginBottom:4, border:`2px solid ${track.color}40`, flexShrink:0 }}>
              {isLite ? <div style={{ width:'100%', height:'100%', background:track.bg, display:'flex', alignItems:'center', justifyContent:'center' }}><Music size={14} color={track.color}/></div> : <img src={getCover(track)} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
            </div>
          )}
          {tabs.map(t=>{
            const active=tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ width:42, height:42, borderRadius:12, border:'none', cursor:'pointer', background:active?`${track.color}25`:'transparent', color:active?track.color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                {t.icon}
                {active&&<div style={{ position:'absolute', right:4, top:'50%', transform:'translateY(-50%)', width:3, height:16, borderRadius:999, background:track.color }}/>}
              </button>
            );
          })}
          <div style={{ flex:1 }}/>
          {playing && (
            <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:14, marginBottom:4 }}>
              {[8,4,6].map((h,i)=>(<div key={i} style={{ width:2.5, height:h, background:track.color, borderRadius:1, animation:`bounce 1.4s ease-in-out ${i*0.25}s infinite` }}/>))}
            </div>
          )}
          <button onClick={()=>setShowSettings(v=>!v)} style={{ width:42, height:42, borderRadius:12, border:'none', cursor:'pointer', background: showSettings ? 'rgba(255,255,255,0.08)' : 'transparent', color:sleepTimer?track.color:(showSettings?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.25)'), display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Settings size={16}/>
          </button>
        </div>
      )}

      {/* Desktop left sidebar nav */}
      {(layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait') && !fullscreen && (
        <div style={{ width: layoutMode === 'desktop-portrait' ? 160 : 196, flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.18)', display:'flex', flexDirection:'column', padding: layoutMode === 'desktop-portrait' ? '8px 6px 12px' : '10px 8px 16px', gap:3 }}>
          {/* Player nav item — always at top */}
          <button onClick={()=>setTab('player')} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', background:tab==='player'?`${track.color}20`:'transparent', color:tab==='player'?track.color:'rgba(255,255,255,0.4)', textAlign:'left', width:'100%', fontSize:13, fontWeight:tab==='player'?700:500 }}>
            <Compass size={17}/><span>Player</span>
          </button>
          <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'4px 6px' }}/>
          {/* Mini now-playing card — desktop sidebar */}
          {tab !== 'player' && (
            <div onClick={()=>setTab('player')} style={{ margin:'0 0 8px', padding:'9px 10px', borderRadius:12, background:embedTrack?'rgba(255,68,68,0.1)':track.isRadio?`${track.color}14`:`${track.color}12`, border:`1px solid ${embedTrack?'rgba(255,68,68,0.3)':track.color+'30'}`, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              {embedTrack
                ? <div style={{ width:30, height:30, borderRadius:7, background:'rgba(255,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:12 }}>▶</div>
                : track.isRadio
                  ? <div style={{ width:30, height:30, borderRadius:7, background:`${track.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative' }}>
                      <Radio size={13} color={track.color}/>
                      {playing && <div style={{ position:'absolute', top:2, right:2, width:4, height:4, borderRadius:'50%', background:track.color, animation:'pulse 1.2s infinite' }}/>}
                    </div>
                  : isLite
                    ? <div style={{ width:30, height:30, borderRadius:7, background:track.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Music size={13} color={track.color}/></div>
                    : <img src={getCover(track)} style={{ width:30, height:30, borderRadius:7, objectFit:'cover', flexShrink:0 }}/>
              }
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'rgba(255,255,255,0.9)' }}>{embedTrack ? embedTrack.title : track.title}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.38)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{embedTrack ? (embedTrack.type==='youtube'?'▶ YouTube':embedTrack.type==='soundcloud'?'🔊 SoundCloud':'🎵 '+embedTrack.artist) : track.isRadio ? '● LIVE' : track.artist}</div>
              </div>
              {playing && <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:11, flexShrink:0 }}>{[9,5,7].map((h,i)=>(<div key={i} style={{ width:2.5, height:h, background:embedTrack?.type==='youtube'?'#ff4444':embedTrack?.type==='soundcloud'?'#ff5500':track.color, borderRadius:1, animation:`bounce 1.4s ease-in-out ${i*0.25}s infinite` }}/>))}</div>}
            </div>
          )}
          {tabs.map(t=>{
            const active=tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', background:active?`${track.color}20`:'transparent', color:active?track.color:'rgba(255,255,255,0.4)', textAlign:'left', width:'100%', fontSize:13, fontWeight:active?700:500 }}>
                {t.icon}<span>{t.label}</span>
              </button>
            );
          })}
          <div style={{ flex:1 }}/>
          <button onClick={()=>setShowSettings(v=>!v)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', background: showSettings?'rgba(255,255,255,0.07)':'transparent', color: showSettings?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.3)', width:'100%', fontSize:13 }}>
            <Settings size={17}/><span>{t ? t.pengaturan : 'Pengaturan'}</span>
          </button>
        </div>
      )}

      <main style={{ flex:1, overflow:'hidden', position:'relative' }}>



        {/* ── SETTINGS PANEL — menutup semua tab di desktop & landscape, hanya player di portrait */}
        {showSettings && (isDesktop || layoutMode === 'mobile-landscape' || tab === 'player') && (
          <Suspense fallback={<Spinner/>}><SettingsPanel key="settings-panel" onClose={()=>setShowSettings(false)} color={track?.color||"#6366f1"} sleepTimer={sleepTimer||null} startSleepTimer={startSleepTimer} cancelSleepTimer={cancelSleepTimer} globalCover={globalCover||""} setGlobalCover={setGlobalCover} isLite={!!isLite} toggleMode={toggleMode} pwaPrompt={pwaPrompt||null} pwaInstalled={!!pwaInstalled} installPwa={installPwa} customDns={customDns||""} setCustomDns={setCustomDns} lang={lang} toggleLang={toggleLang} t={t} userSpId={userSpId} setUserSpId={setUserSpId} userSpSecret={userSpSecret} setUserSpSecret={setUserSpSecret} userScId={userScId} setUserScId={setUserScId} userAiKey={userAiKey} setUserAiKey={setUserAiKey} userYtKey={userYtKey} setUserYtKey={setUserYtKey} userCfKey={userCfKey} setUserCfKey={setUserCfKey} userSnKey={userSnKey} setUserSnKey={setUserSnKey}/></Suspense>
        )}

        {/* ─── PLAYER TAB */}
        {tab==='player'&&(
          <div className="scrollbar-hide" style={{ height:'100%', overflowY: (fullscreen || layoutMode === 'mobile-landscape') ? 'hidden' : 'auto', position:'relative' }}>

          {/* ── QUEUE PANEL — inline dalam player, bukan full layar */}
          {showQueue && (
            <div style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'stretch' }} onClick={e=>e.target===e.currentTarget&&setShowQueue(false)}>
            <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'#0d0d24', border:'none', borderRadius:0 }}>
              {/* Queue header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px 12px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:track.isRadio&&!embedTrack?`${radioStation?.color||'#f59e0b'}22`:embedTrack?.type==='youtube'?'rgba(255,68,68,0.2)':`${track.color}22`, border:`1px solid ${track.isRadio&&!embedTrack?`${radioStation?.color||'#f59e0b'}40`:embedTrack?.type==='youtube'?'rgba(255,68,68,0.4)':track.color+'40'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ListMusic size={15} style={{ color:track.isRadio&&!embedTrack?(radioStation?.color||'#f59e0b'):embedTrack?.type==='youtube'?'#ff6b6b':track.color }}/>
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:14 }}>{t?.queue||'Queue'}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>
                      {track.isRadio && !embedTrack
                        ? `${rbBrowseRef.current.length || 0} station${rbBrowseRef.current.length === 1 ? '' : 's'}`
                        : embedTrack?.type==='youtube' ? `${ytQueueRef.current.length} ${t?.songsCount||'songs'}` : track._wsSource && wsQueueRef.current.length > 0 ? `${wsQueueRef.current.length} ${t?.songsCount||'songs'}` : `${[...builtinSongs,...customSongs,...ytSongs].length} ${t?.songsCount||'songs'}`
                      }
                    </div>
                  </div>
                </div>
                <button onClick={()=>setShowQueue(false)} style={{ width:30, height:30, borderRadius:999, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700 }}>×</button>
              </div>
              {/* Queue list */}
              <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
                {track.isRadio && !embedTrack ? (()=>{
                  const radioStations = rbBrowseRef.current || [];
                  const radioPlatform = STREAMING_PLATFORMS.find(p => p.embedType === 'radio');
                  const radioCountryData = radioPlatform?.countries?.find(c => c.id === radioStation?.countryId);
                  const radioGenreData = radioCountryData?.genres?.find(g => g.id === radioStation?.genreId);
                  return radioStations.length === 0 ? (
                    <div style={{ padding:'48px 20px', textAlign:'center' }}>
                      <ListMusic size={40} style={{ color:'rgba(255,255,255,0.08)', margin:'0 auto 14px', display:'block' }}/>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.25)', fontWeight:600 }}>{t?.queueNoStation||'No stations'}</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ padding:'8px 18px 4px', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                        {radioGenreData?.icon} {radioGenreData?.name} · {radioCountryData?.flag} {radioCountryData?.name}
                      </div>
                      {radioStations.map((station, i) => {
                        const isCur = radioStation?.id === station.id;
                        const stationColor = radioGenreData?.color || radioStation?.color || '#f59e0b';
                        // Tentukan apakah ini stasiun kurasi atau dari Radio Browser
                        const isCurated = radioGenreData?.stations?.some(s => s.id === station.id);
                        return (
                          <div key={station.id} onClick={() => {
                            const radioTrackObj = {
                              id: `radio_${station.id}`,
                              title: station.name,
                              artist: station.city + ' · Live Radio',
                              album: 'Live Radio',
                              cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
                              src: radioUrl(station.url),
                              color: stationColor,
                              bg: `rgba(245,158,11,0.15)`,
                              mood: 'live, radio',
                              isRadio: true,
                            };
                            if (track.id === radioTrackObj.id) { setPlaying(p => !p); } else {
                              // Antrean tetap terjaga saat pilih dari queue panel
                              if (rbBrowseRef.current.length === 0) rbBrowseRef.current = radioStations;
                              play(radioTrackObj);
                              setRadioStation({ ...station, color: stationColor, countryId: radioStation?.countryId, genreId: radioStation?.genreId });
                              setRadioPlaying(true);
                            }
                            setShowQueue(false);
                          }} style={{ display:'flex', alignItems:'center', gap:11, padding:'9px 18px', background:isCur?`${stationColor}12`:'transparent', cursor:'pointer' }}>
                            <div style={{ width:20, textAlign:'center', flexShrink:0 }}>
                              {isCur
                                ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12, justifyContent:'center' }}>{[9,5,7].map((h,j)=>(<div key={j} style={{ width:2.5, height:h, background:stationColor, borderRadius:1, animation:`bounce 1.4s ease-in-out ${j*0.25}s infinite` }}/>))}</div>
                                : <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:600 }}>{i+1}</span>
                              }
                            </div>
                            <div style={{ width:38, height:38, borderRadius:8, background:isCur?`${stationColor}25`:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>
                              📻
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:isCur?700:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:isCur?stationColor:'rgba(255,255,255,0.88)' }}>{station.name}</div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
                                <span>{station.city} · ● LIVE</span>
                                {isCurated
                                  ? <span style={{ color:'#f59e0b', fontWeight:700, fontSize:8 }}>⭐ Kurasi</span>
                                  : <span style={{ color:'#4ade80', fontWeight:700, fontSize:8 }}>📡 RB</span>
                                }
                                {stationStatus[station.id] === 'testing' && <span style={{ color:'#fbbf24', display:'inline-flex', alignItems:'center', gap:2 }}><span style={{ width:5, height:5, borderRadius:'50%', border:'1.5px solid #fbbf24', borderTopColor:'transparent', display:'inline-block', animation:'spin 0.8s linear infinite' }}/><span style={{ fontSize:7 }}>cek…</span></span>}
                                {stationStatus[station.id] === 'ok' && <span style={{ color:'#4ade80', fontWeight:700, fontSize:8 }}>✓</span>}
                                {stationStatus[station.id] === 'fail' && <span style={{ color:'#f87171', fontWeight:700, fontSize:8 }}>✕ offline</span>}
                              </div>
                            </div>
                            {/* Heart — like from queue sidebar */}
                            {(() => {
                              const radioId = `radio_${station.id}`;
                              const isLiked = !!liked[radioId];
                              const radioSongObj = { id:radioId, title:station.name, artist:station.city+' · Live Radio', album:'Live Radio', cover:'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop', src:station.url, color:stationColor, bg:`rgba(245,158,11,0.15)`, mood:'live, radio', isRadio:true };
                              return <button onClick={e=>{e.stopPropagation();toggleFav(radioId,radioSongObj);}} title={isLiked?(t?.removeFromFav||'Remove from Favorites'):(t?.saveFav||'Save to Favorites')} style={{ background:'none', border:'none', cursor:'pointer', flexShrink:0, padding:'2px 4px', color:isLiked?'#f472b6':'rgba(255,255,255,0.15)' }}><Heart size={11} fill={isLiked?'#f472b6':'none'}/></button>;
                            })()}
                            {isCur && <div style={{ width:6, height:6, borderRadius:'50%', background:stationColor, flexShrink:0, animation:'pulse 2s infinite' }}/>}
                          </div>
                        );
                      })}
                    </>
                  );
                })() : track._wsSource && wsQueueRef.current.length > 0 ? (
                  wsQueueRef.current.map((item,i) => {
                    const wsId = `ws_${item.source}_${item.id||item.audioUrl}`;
                    const isCur = track.id === wsId;
                    const srcColors3 = { jamendo:'#f0c020', fma:'#5cb85c', ccmixter:'#e74c3c' };
                    const sc3 = srcColors3[item.source] || '#6366f1';
                    return (
                      <div key={i} onClick={()=>{ playWsTrack(item, wsQueueRef.current, i); setShowQueue(false); }}
                        style={{ display:'flex', alignItems:'center', gap:11, padding:'9px 18px', background:isCur?`${sc3}12`:'transparent', cursor:'pointer' }}>
                        <div style={{ width:20, textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:600, flexShrink:0 }}>{isCur ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12, justifyContent:'center' }}>{[9,5,7].map((h2,j)=>(<div key={j} style={{ width:2.5, height:h2, background:sc3, borderRadius:1, animation:`bounce 1.4s ease-in-out ${j*0.25}s infinite` }}/>))}</div> : i+1}</div>
                        {item.thumbnail
                          ? <img src={item.thumbnail} style={{ width:38, height:38, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>
                          : <div style={{ width:38, height:38, borderRadius:8, background:`${sc3}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ color:sc3, fontSize:14 }}>♪</span></div>}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:isCur?700:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:isCur?sc3:'rgba(255,255,255,0.88)' }}>{item.title}</div>
                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{item.artist}</div>
                        </div>
                      </div>
                    );
                  })
                ) : embedTrack?.type==='youtube' ? (
                  ytQueueRef.current.length > 0 ? (
                    ytQueueRef.current.map((item,i)=>{
                      const isCur = i === ytQueueIdxRef.current;
                      return (
                        <div key={i} onClick={()=>{playYouTube(item, ytQueueRef.current, i); setShowQueue(false);}}
                          style={{ display:'flex', alignItems:'center', gap:11, padding:'9px 18px', background:isCur?'rgba(255,68,68,0.1)':'transparent', cursor:'pointer' }}>
                          <div style={{ width:20, textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:600, flexShrink:0 }}>{isCur ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12, justifyContent:'center' }}>{[9,5,7].map((h,j)=>(<div key={j} style={{ width:2.5, height:h, background:'#ff4444', borderRadius:1, animation:`bounce 1.4s ease-in-out ${j*0.25}s infinite` }}/>))}</div> : i+1}</div>
                          {item.thumbnail
                            ? <img src={item.thumbnail} style={{ width:38, height:38, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>
                            : <div style={{ width:38, height:38, borderRadius:8, background:'rgba(255,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>▶</div>}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:isCur?700:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:isCur?'#ff6b6b':'rgba(255,255,255,0.88)' }}>{item.title||item.url}</div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{item.artist||'YouTube'}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding:'48px 20px', textAlign:'center' }}>
                      <ListMusic size={40} style={{ color:'rgba(255,255,255,0.08)', margin:'0 auto 14px', display:'block' }}/>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.25)', fontWeight:600 }}>{t?.queueYtEmpty||'YouTube queue is empty'}</div>
                    </div>
                  )
                ) : (()=>{
                    const q2 = [...builtinSongs, ...customSongs, ...ytSongs];
                    const curIdx = q2.findIndex(s=>s.id===track.id);
                    const upcoming = curIdx >= 0 ? q2.slice(curIdx) : q2;
                    return upcoming.length === 0 ? (
                      <div style={{ padding:'48px 20px', textAlign:'center' }}>
                        <ListMusic size={40} style={{ color:'rgba(255,255,255,0.08)', margin:'0 auto 14px', display:'block' }}/>
                        <div style={{ fontSize:13, color:'rgba(255,255,255,0.25)', fontWeight:600 }}>{t?.queueEmpty||'Queue is empty'}</div>
                      </div>
                    ) : upcoming.map((s,i)=>{
                      const isCur = i===0;
                      return (
                        <div key={s.id} onClick={()=>{ setTrack(s); setProgress(0); setDuration(0); setPlaying(true); setShowQueue(false); }}
                          style={{ display:'flex', alignItems:'center', gap:11, padding:'9px 18px', background:isCur?`${track.color}12`:'transparent', cursor:'pointer' }}>
                          <div style={{ width:20, textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:600, flexShrink:0 }}>{isCur ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12, justifyContent:'center' }}>{[9,5,7].map((h,j)=>(<div key={j} style={{ width:2.5, height:h, background:track.color, borderRadius:1, animation:`bounce 1.4s ease-in-out ${j*0.25}s infinite` }}/>))}</div> : curIdx+i+1}</div>
                          {isLite
                            ? <div style={{ width:38, height:38, borderRadius:8, background:s.bg||'rgba(255,255,255,0.08)', flexShrink:0 }}/>
                            : <img src={getCover(s)} loading="lazy" decoding="async" style={{ width:38, height:38, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:isCur?700:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:isCur?track.color:'rgba(255,255,255,0.88)' }}>{s.title}</div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{s.artist}</div>
                          </div>
                          {isCur && <div style={{ width:6, height:6, borderRadius:'50%', background:track.color, flexShrink:0, animation:'pulse 2s infinite' }}/>}
                        </div>
                      );
                    });
                  })()
                }
              </div>
            </div>
            </div>
          )}

          {/* ── SHARE PANEL — inline dalam player, sama seperti queue panel */}
          {showShareMenu && (
            <div style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'stretch' }} onClick={e=>e.target===e.currentTarget&&setShowShareMenu(false)}>
            <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'#0d0d24', border:'none', borderRadius:0 }}>
              {/* Share header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px 12px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:`${track.color}22`, border:`1px solid ${track.color}40`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Share2 size={15} style={{ color: track.color }}/>
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:14 }}>Bagikan</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>
                      {embedTrack?.title || track.title}
                    </div>
                  </div>
                </div>
                <button onClick={()=>setShowShareMenu(false)} style={{ width:30, height:30, borderRadius:999, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700 }}>×</button>
              </div>
              {/* Share list */}
              <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
                {(() => {
                  const url = embedTrack?.type==='youtube' ? `https://youtu.be/${embedTrack.videoId}` :
                    embedTrack?.type==='soundcloud' ? (embedTrack.src||'') :
                    track.isRadio ? (radioStation?.url||track.src||window.location.href) :
                    (track.src || window.location.href);
                  const shareItems = [
                    { icon:'📋', label: shareCopied ? '✓ Tersalin!' : 'Salin Link', color:'#6366f1', action: async () => {
                      try { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(()=>setShareCopied(false), 2500); } catch {}
                    }},
                    { icon:'💬', label:'WhatsApp', color:'#25D366', action: () => window.open(`https://wa.me/?text=${encodeURIComponent((embedTrack?.title||track.title)+' — '+url)}`, '_blank', 'noopener') },
                    { icon:'✈️', label:'Telegram', color:'#2AABEE', action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(embedTrack?.title||track.title)}`, '_blank', 'noopener') },
                    { icon:'𝕏', label:'Twitter / X', color:'#e7e9ea', action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Dengerin ini bareng: '+(embedTrack?.title||track.title))}&url=${encodeURIComponent(url)}`, '_blank', 'noopener') },
                    { icon:'📧', label:'Email', color:'#f59e0b', action: () => window.open(`mailto:?subject=${encodeURIComponent('Song/Stream: '+(embedTrack?.title||track.title))}&body=${encodeURIComponent(url)}`, '_blank', 'noopener') },
                    { icon:'📱', label:'Share via App', color:'#a78bfa', action: async () => {
                      if (navigator.share) { try { await navigator.share({ title: embedTrack?.title||track.title, url }); } catch {} }
                      else { try { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(()=>setShareCopied(false), 2500); } catch {} }
                    }},
                  ];
                  return (
                    <>
                      {/* URL display — paling atas */}
                      <div style={{ margin:'8px 18px 8px', padding:'9px 13px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', fontSize:10, color:'rgba(255,255,255,0.28)', fontFamily:'monospace', wordBreak:'break-all', lineHeight:1.5 }}>
                        {url}
                      </div>
                      <div style={{ padding:'8px 18px 4px', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                        🔗 Pilih platform
                      </div>
                      {shareItems.map((item, i) => (
                        <div key={i} onClick={item.action}
                          style={{ display:'flex', alignItems:'center', gap:11, padding:'9px 18px', background:'transparent', cursor:'pointer', transition:'background 0.12s' }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <div style={{ width:38, height:38, borderRadius:10, background:`${item.color}18`, border:`1px solid ${item.color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{item.icon}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.88)' }}>{item.label}</div>
                          </div>
                          <div style={{ width:6, height:6, borderRadius:'50%', background:`${item.color}60`, flexShrink:0 }}/>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
            </div>
          )}




          {/* ═══ MOBILE LANDSCAPE — dedicated two-column layout ═══ */}
          {layoutMode === 'mobile-landscape' && (() => {
            // Fullscreen: header hilang → pakai hampir full height. Non-fullscreen: kurangi header ~40px
            const lsRing = Math.min(ringSize, window.innerHeight - (fullscreen ? 16 : 80));
            const lsColW = lsRing + 16;
            return (
            <div style={{ display:'flex', flexDirection:'row', height:'100%', width:'100%', overflow:'hidden', boxSizing:'border-box' }}>

              {/* ── LEFT col: clock pojok kiri atas + orbital centered ── */}
              <div style={{ width:lsColW, flexShrink:0, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                {/* Clock — pojok kiri atas absolut */}
                <div style={{ position:'absolute', top:8, left:8, userSelect:'none', pointerEvents:'none', zIndex:2 }}>
                  <div style={{ fontFamily:'monospace', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1 }}>
                    <span style={{ fontSize:18, background:`linear-gradient(120deg,#ffffff 60%,${track.color})`, WebkitBackgroundClip:'text', backgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                      {nowTime.toLocaleTimeString('id-ID',{ hour:'2-digit', minute:'2-digit', hour12:false })}
                    </span>
                    <span style={{ fontSize:18, color:track.color }}>{'.' + String(nowTime.getSeconds()).padStart(2,'0')}</span>
                  </div>
                  <div style={{ fontSize:8, color:'rgba(255,255,255,0.35)', fontWeight:600, marginTop:2, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                    {nowTime.toLocaleDateString('id-ID',{ weekday:'short', day:'numeric', month:'short' })}
                  </div>
                </div>
                {/* Orbital ring centered in column */}
                <OrbitalRing size={lsRing}
                  pct={embedTrack?.type==='youtube'?(ytDuration>0?ytProgress/ytDuration:0):track.isRadio?0:pct}
                  color={embedTrack?.type==='youtube'?'#ff4444':track.color}
                  progress={embedTrack?.type==='youtube'?ytProgress:progress}
                  duration={embedTrack?.type==='youtube'?ytDuration:track.isRadio?0:duration}
                  isPlaying={playing}
                  cover={globalCover||((!globalCover&&embedTrack?.type==='youtube')?embedTrack.thumbnail:null)||getCover(track)}
                  title={embedTrack?.type==='youtube'?embedTrack.title:track.title}
                  onSeek={embedTrack?.type==='youtube'?seekYt:track.isRadio?null:seekByPct}
                  isLite={isLite} isRadio={!embedTrack&&track.isRadio}
                  downloadProg={driveDownProg} drivePhase={drivePhase}
                  ytDownloading={embedTrack?.type==='youtube'&&ytDownloadingIds.has(embedTrack.videoId)}
                  ytDlProg={embedTrack?.type==='youtube'?(ytDownloadProg[embedTrack.videoId]||0):0}/>
              </div>

              {/* ── RIGHT col: title, controls, volume, actions ── */}
              <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'center', padding:'8px 12px 8px 8px', gap:6, overflow:'hidden' }}>
                {/* Badge */}
                {embedTrack?.type==='youtube' && <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, background:'rgba(255,0,0,0.12)', border:'1px solid rgba(255,0,0,0.25)' }}><span style={{ fontSize:9, fontWeight:800, color:'#ff6b6b', textTransform:'uppercase', letterSpacing:'0.1em' }}>▶ YouTube</span></div>}
                {embedTrack?.type==='soundcloud' && <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, background:'rgba(255,85,0,0.12)', border:'1px solid rgba(255,85,0,0.3)' }}><span style={{ fontSize:9, fontWeight:800, color:'#ff5500', textTransform:'uppercase', letterSpacing:'0.1em' }}>🔊 SoundCloud</span></div>}
                {!embedTrack && track.isRadio && <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.35)' }}>{streamBuffering ? <Loader2 size={9} style={{ animation:'spin 0.8s linear infinite', color:'#fbbf24' }}/> : <div style={{ width:5,height:5,borderRadius:'50%',background:'#f59e0b',animation:playing?'pulse 1.2s infinite':'none' }}/>}<span style={{ fontSize:9, fontWeight:800, color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.1em' }}>{streamBuffering ? 'BUFFERING…' : '● LIVE RADIO'}</span></div>}

                {/* Title */}
                <div style={{ width:'100%', minWidth:0 }}>
                  <h2 style={{ margin:0, fontWeight:900, fontSize:'clamp(13px,3.5vw,18px)', letterSpacing:'-0.03em', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {embedTrack?.type==='youtube'?embedTrack.title:embedTrack?.type==='soundcloud'?embedTrack.title:track.title}
                  </h2>
                  <p style={{ margin:'3px 0 0', fontSize:10, color:'rgba(255,255,255,0.45)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {embedTrack?.type==='youtube'?embedTrack.artist:embedTrack?.type==='soundcloud'?embedTrack.artist:`${track.artist} — ${track.album}`}
                  </p>
                </div>

                {/* Playback controls */}
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {!track.isRadio && (
                    <button onClick={()=>setShuffle(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', color:shuffle?track.color:'rgba(255,255,255,0.3)', padding:4, position:'relative' }}>
                      <Shuffle size={17}/>
                      {shuffle && <div style={{ position:'absolute', bottom:1, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:track.color }}/>}
                    </button>
                  )}
                  <button onClick={()=>track.isRadio?goPrevRadio():embedTrack?.type==='youtube'?ytPrev():goPrev()} style={{ background:'none', border:'none', cursor:'pointer', color:'white', padding:4 }}><SkipBack size={22} fill="currentColor"/></button>
                  <button
                    onClick={()=>{ if(!track.src&&!embedTrack) return; if(embedTrack?.type==='soundcloud') return; setPlaying(p=>!p); }}
                    disabled={!track.src&&!embedTrack}
                    style={{ width:52, height:52, borderRadius:'50%', border:'none', background:'white', color:'#07071a', cursor:(!track.src&&!embedTrack)?'default':'pointer', opacity:(!track.src&&!embedTrack)?0.4:1, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:isLite?'0 2px 10px rgba(0,0,0,0.4)':`0 0 22px ${embedTrack?.type==='youtube'?'#ff444490':track.color+'90'},0 4px 16px rgba(0,0,0,0.4)` }}>
                    {playing?<Pause size={21} fill="currentColor"/>:<Play size={21} fill="currentColor" style={{ marginLeft:3 }}/>}
                  </button>
                  <button onClick={()=>track.isRadio?goNextRadio():embedTrack?.type==='youtube'?ytNext():goNext()} style={{ background:'none', border:'none', cursor:'pointer', color:'white', padding:4 }}><SkipForward size={22} fill="currentColor"/></button>
                  {!track.isRadio && (
                    <button onClick={cycleRepeat} style={{ background:'none', border:'none', cursor:'pointer', color:repeat!=='off'?track.color:'rgba(255,255,255,0.3)', padding:4, position:'relative' }}>
                      {repeat==='one'?<Repeat1 size={17}/>:<Repeat size={17}/>}
                      {repeat!=='off' && <div style={{ position:'absolute', bottom:1, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:track.color }}/>}
                    </button>
                  )}
                </div>

                {/* Volume */}
                <div style={{ display:'flex', alignItems:'center', gap:10, width:'100%' }}>
                  <button onClick={()=>setMuted(m=>!m)} style={{ background:'none', border:'none', cursor:'pointer', color:muted?'#ef4444':'rgba(255,255,255,0.38)', padding:0, flexShrink:0 }}>{muted?<VolumeX size={15}/>:<Volume2 size={15}/>}</button>
                  <input type="range" min="0" max="1" step="0.01" value={muted?0:volume} onChange={e=>{setVolume(+e.target.value);setMuted(false)}} style={{ flex:1, accentColor:embedTrack?.type==='youtube'?'#ff4444':track.color, height:3, cursor:'pointer' }}/>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontWeight:700, minWidth:30, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{muted?'0':Math.round(volume*100)}%</span>
                </div>

                {/* Action icons */}
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  {embedTrack?.type==='youtube'
                    ? <button onClick={likeYtTrack} style={{ background:'none', border:'none', cursor:'pointer', color:liked[`yt_${embedTrack.videoId}`]?'#f472b6':'rgba(255,255,255,0.35)', padding:'4px 7px' }}><Heart size={16} fill={liked[`yt_${embedTrack.videoId}`]?'#f472b6':'none'}/></button>
                    : <button onClick={()=>toggleFav(track.id, track.isRadio?track:null)} style={{ background:'none', border:'none', cursor:'pointer', color:liked[track.id]?'#f472b6':'rgba(255,255,255,0.35)', padding:'4px 7px' }}><Heart size={16} fill={liked[track.id]?'#f472b6':'none'}/></button>
                  }
                  <button onClick={()=>{ setShowShareMenu(v=>!v); setShowQueue(false); }} style={{ background:'none', border:'none', cursor:'pointer', color:showShareMenu?track.color:'rgba(255,255,255,0.35)', padding:'4px 7px' }}><Share2 size={16}/></button>
                  <button onClick={()=>{ setShowQueue(q=>!q); setShowShareMenu(false); }} style={{ background:'none', border:'none', cursor:'pointer', color:showQueue?track.color:'rgba(255,255,255,0.35)', padding:'4px 7px' }}><ListMusic size={16}/></button>
                  <button onClick={()=>setShowSettings(v=>!v)} style={{ background:showSettings?'rgba(255,255,255,0.08)':'none', borderRadius:8, border:'none', cursor:'pointer', color:sleepTimer?track.color:(showSettings?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.35)'), padding:'4px 7px' }}><Settings size={16}/></button>
                  <button onClick={()=>setFullscreen(f=>!f)} style={{ background:'none', border:'none', cursor:'pointer', color:fullscreen?track.color:'rgba(255,255,255,0.35)', padding:'4px 7px' }}>{fullscreen?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
                  {embedTrack && <button onClick={()=>{ closeEmbed(); setShowSettings(false); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#fca5a5', padding:'4px 7px' }}><X size={16}/></button>}
                  {!embedTrack && track.isRadio && radioStation && <button onClick={()=>{ if(audioRef.current){audioRef.current.pause();audioRef.current.src='';} if(hlsRef.current){hlsRef.current.destroy();hlsRef.current=null;} if(radioReconnectRef.current){clearTimeout(radioReconnectRef.current);radioReconnectRef.current=null;} radioReconnectCount.current=0; setStreamBuffering(false); setPlaying(false); setRadioStation(null); setRadioPlaying(false); setTrack(SONGS[0]); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#fbbf24', padding:'4px 7px' }}><X size={16}/></button>}
                </div>
              </div>

            </div>
            );
          })()}

          {/* ═══ PORTRAIT + DESKTOP layout ═══ */}
          {layoutMode !== 'mobile-landscape' && (
          <div style={{
            minHeight: fullscreen ? '100%' : undefined,
            height: fullscreen ? '100%' : undefined,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: fullscreen ? 'space-evenly' : 'flex-start',
            padding: fullscreen ? '8px 24px 10px' : layoutVars.playerPad,
            position: 'relative',
            boxSizing: 'border-box',
            overflow: 'hidden',
            gap: 0,
          }}>

            {/* ── JAM — pojok kiri atas area player (desktop only) */}
            {(layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait') && (
              <div style={{ position:'absolute', top:'clamp(10px,2.5vh,20px)', left:16, userSelect:'none', pointerEvents:'none' }}>
                <div style={{ display:'inline-block', fontSize:24, fontWeight:900, fontFamily:'monospace', letterSpacing:'-0.04em', lineHeight:1, background:`linear-gradient(120deg,#ffffff 60%,${track.color})`, WebkitBackgroundClip:'text', backgroundClip:'text', WebkitTextFillColor:'transparent', color:'transparent' }}>
                  {nowTime.toLocaleTimeString('id-ID',{ hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })}
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:600, marginTop:4, letterSpacing:'0.04em', textTransform:'uppercase' }}>
                  {nowTime.toLocaleDateString('id-ID',{ weekday:'long', day:'numeric', month:'long' })}
                </div>
              </div>
            )}


            {/* floating action button moved to root level */}

            {/* ── Mobile: jam kiri atas + ring tengah | Desktop: ring tengah saja */}
            {layoutMode === 'mobile-portrait' ? (
              <div style={{ position:'relative', width:'100%', flexShrink:0, display:'flex', justifyContent:'center', alignItems:'center' }}>
                {/* Jam mobile — pojok kiri, tidak overlap ring — hide on landscape (clock is in header) */}
                {layoutMode === 'mobile-portrait' && (
                <div style={{ position:'absolute', left:0, top:6, userSelect:'none' }}>
                  <div style={{ display:'inline-block', fontSize:17, fontWeight:900, fontFamily:'monospace', letterSpacing:'-0.04em', lineHeight:1, background:`linear-gradient(120deg,#ffffff 60%,${track.color})`, WebkitBackgroundClip:'text', backgroundClip:'text', WebkitTextFillColor:'transparent', color:'transparent' }}>
                    {nowTime.toLocaleTimeString('id-ID',{ hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })}
                  </div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:600, marginTop:3, letterSpacing:'0.04em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
                    {nowTime.toLocaleDateString('id-ID',{ weekday:'short', day:'numeric', month:'short' })}
                  </div>
                </div>
                )}

                <OrbitalRing size={ringSize} pct={embedTrack?.type==='youtube'?(ytDuration>0?ytProgress/ytDuration:0):track.isRadio?0:pct} color={embedTrack?.type==='youtube'?'#ff4444':track.color} progress={embedTrack?.type==='youtube'?ytProgress:progress} duration={embedTrack?.type==='youtube'?ytDuration:track.isRadio?0:duration} isPlaying={playing} cover={globalCover||((!globalCover&&embedTrack?.type==='youtube')?embedTrack.thumbnail:null)||getCover(track)} title={embedTrack?.type==='youtube'?embedTrack.title:track.title} onSeek={embedTrack?.type==='youtube'?seekYt:track.isRadio?null:seekByPct} isLite={isLite} isRadio={!embedTrack&&track.isRadio} downloadProg={driveDownProg} drivePhase={drivePhase} ytDownloading={embedTrack?.type==='youtube'&&ytDownloadingIds.has(embedTrack.videoId)} ytDlProg={embedTrack?.type==='youtube'?(ytDownloadProg[embedTrack.videoId]||0):0}/>
              </div>
            ) : (
              <OrbitalRing size={ringSize} pct={embedTrack?.type==='youtube'?(ytDuration>0?ytProgress/ytDuration:0):track.isRadio?0:pct} color={embedTrack?.type==='youtube'?'#ff4444':track.color} progress={embedTrack?.type==='youtube'?ytProgress:progress} duration={embedTrack?.type==='youtube'?ytDuration:track.isRadio?0:duration} isPlaying={playing} cover={globalCover||((!globalCover&&embedTrack?.type==='youtube')?embedTrack.thumbnail:null)||getCover(track)} title={embedTrack?.type==='youtube'?embedTrack.title:track.title} onSeek={embedTrack?.type==='youtube'?seekYt:track.isRadio?null:seekByPct} isLite={isLite} isRadio={!embedTrack&&track.isRadio} downloadProg={driveDownProg} drivePhase={drivePhase} ytDownloading={embedTrack?.type==='youtube'&&ytDownloadingIds.has(embedTrack.videoId)} ytDlProg={embedTrack?.type==='youtube'?(ytDownloadProg[embedTrack.videoId]||0):0}/>
            )}

            {/* Track info */}
            <div style={{
              textAlign: 'center',
              marginTop: (fullscreen && (layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait')) ? layoutVars.infoMt : fullscreen ? 0 : layoutMode === 'mobile-landscape' ? 0 : layoutVars.infoMt,
              width: '100%',
              maxWidth: fullscreen ? 520 : layoutMode === 'mobile-landscape' ? undefined : 340,
              padding: layoutMode === 'mobile-landscape' ? '0 6px' : '0 2px',
              minWidth: 0,
              overflow: 'hidden',
              ...(layoutMode === 'mobile-landscape' ? {
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                justifyContent: 'center', flex: 1, minWidth: 0,
                textAlign: 'left',
                height: '100%',
                maxHeight: '100%',
                overflowY: 'hidden',
              } : {}),
            }}>
              {embedTrack?.type==='youtube' ? (
                <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, marginBottom:3, background:'rgba(255,0,0,0.12)', border:'1px solid rgba(255,0,0,0.25)' }}>
                  <span style={{ fontSize:9, fontWeight:800, color:'#ff6b6b', textTransform:'uppercase', letterSpacing:'0.1em' }}>▶ YouTube</span>
                </div>
              ) : embedTrack?.type==='soundcloud' ? (
                <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, marginBottom:3, background:'rgba(255,85,0,0.12)', border:'1px solid rgba(255,85,0,0.3)' }}>
                  <span style={{ fontSize:9, fontWeight:800, color:'#ff5500', textTransform:'uppercase', letterSpacing:'0.1em' }}>🔊 SoundCloud</span>
                </div>
              ) : track.isRadio ? (
                <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, marginBottom:3, background:`rgba(245,158,11,0.15)`, border:'1px solid rgba(245,158,11,0.35)' }}>
                  {streamBuffering ? <Loader2 size={9} style={{ animation:'spin 0.8s linear infinite', color:'#fbbf24' }}/> : <div style={{ width:5, height:5, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 6px #f59e0b', animation: playing ? 'pulse 1.2s infinite' : 'none' }}/>}
                  <span style={{ fontSize:9, fontWeight:800, color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.1em' }}>{streamBuffering ? 'BUFFERING…' : '● LIVE RADIO'}</span>
                </div>
              ) : track.isDrive ? (
                <div style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'2px 7px', borderRadius:999, marginBottom:3, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}><Cloud size={9} style={{ color:track.color }}/><span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Drive</span></div>
              ) : null}
              <h2 style={{ margin:0, fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, fontSize: fullscreen ? 'clamp(18px,4.8vw,28px)' : layoutVars.trackTitleSize, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>{embedTrack?.type==='youtube'?embedTrack.title:embedTrack?.type==='soundcloud'?embedTrack.title:track.title}</h2>
              <p style={{ margin:'2px 0 0', fontSize: fullscreen ? 'clamp(11px,2.8vw,14px)' : layoutVars.artistSize, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>
                {embedTrack?.type==='youtube' ? embedTrack.artist : embedTrack?.type==='soundcloud' ? embedTrack.artist : `${track.artist} — ${track.album}`}
              </p>
            </div>

            {/* ── Spotify Preview in Player */}
            {spTrack && spPlaying && !embedTrack && (
              <div style={{ width:'100%', maxWidth: fullscreen ? 480 : 340, marginTop:8, display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:12, background:'rgba(29,185,84,0.1)', border:'1px solid rgba(29,185,84,0.3)' }}>
                {spTrack.cover
                  ? <img src={spTrack.cover} style={{ width:34, height:34, borderRadius:6, objectFit:'cover', flexShrink:0 }}/>
                  : <span style={{ fontSize:20, flexShrink:0 }}>🎵</span>}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#1DB954', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{spTrack.title}</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>30s Preview · {spTrack.artist}</div>
                </div>
                <button onClick={() => { setSpPlaying(false); if(spPreviewRef.current){spPreviewRef.current.pause();spPreviewRef.current=null;} }}
                  style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', padding:'4px', flexShrink:0 }}>
                  <span style={{ fontSize:14 }}>⏸</span>
                </button>
                {spTrack.spotifyUrl && (
                  <button onClick={() => window.open(spTrack.spotifyUrl, '_blank', 'noopener,noreferrer')}
                    style={{ padding:'4px 9px', borderRadius:999, border:'none', background:'#1DB954', color:'black', fontSize:10, fontWeight:800, cursor:'pointer', flexShrink:0 }}>↗ SP</button>
                )}
              </div>
            )}

            {/* Main controls: Shuffle | Prev | Play | Next | Repeat */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:layoutVars.controlsGap, marginTop: (fullscreen && (layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait')) ? layoutVars.controlsMt : fullscreen ? 0 : layoutVars.controlsMt, width:'100%', maxWidth: fullscreen ? '100%' : layoutMode === 'mobile-landscape' ? undefined : 340 }}>
              {!track.isRadio && <button onClick={()=>{ if(embedTrack?.type==='youtube'){ setShuffle(s=>{ const next=!s; if(next){ setRepeat('off'); ytShuffle(); } return next; }); } else if(track._wsSource && wsQueueRef.current.length > 0){ setShuffle(s=>{ const next=!s; if(next){ setRepeat('off'); wsShuffle(); } return next; }); } else { setShuffle(s=>{ const next=!s; if(next) setRepeat("off"); return next; }); } }} style={{ ...btn, color:shuffle?(embedTrack?.type==='youtube'?'#ff4444':track.color):'rgba(255,255,255,0.3)', position:'relative', padding:'clamp(5px,1.2vw,8px)' }}>
                <Shuffle size={18}/>
                {shuffle&&<div style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:embedTrack?.type==='youtube'?'#ff4444':track.color }}/>}
              </button>}
              <button onClick={()=>track.isRadio?goPrevRadio():embedTrack?.type==='youtube'?ytPrev():goPrev()} style={{ ...btn, padding:'clamp(5px,1.2vw,8px)' }}><SkipBack size={22} fill="currentColor"/></button>
              <button onClick={()=>{ if(!track.src&&!embedTrack) return; if(embedTrack?.type==='soundcloud') return; setPlaying(p=>!p); }} disabled={!track.src&&!embedTrack} style={{ width: fullscreen ? 'clamp(60px,16vw,72px)' : 'clamp(48px,13vw,56px)', height: fullscreen ? 'clamp(60px,16vw,72px)' : 'clamp(48px,13vw,56px)', borderRadius:'50%', border:'none', background:'white', color:'#07071a', cursor:(!track.src&&!embedTrack)?'default':'pointer', opacity:(!track.src&&!embedTrack)?0.4:1, display:'flex', alignItems:'center', justifyContent:'center', boxShadow: isLite ? `0 2px 8px rgba(0,0,0,0.4)` : `0 0 22px ${embedTrack?.type==='youtube'?'#ff444490':track.color+'90'},0 4px 20px rgba(0,0,0,0.4)`, flexShrink:0 }}>
                {playing?<Pause size={21} fill="currentColor"/>:<Play size={21} fill="currentColor" style={{ marginLeft:3 }}/>}
              </button>
              <button onClick={()=>track.isRadio?goNextRadio():embedTrack?.type==='youtube'?ytNext():goNext()} style={{ ...btn, padding:'clamp(5px,1.2vw,8px)' }}><SkipForward size={22} fill="currentColor"/></button>
              {!track.isRadio && <button onClick={cycleRepeat} style={{ ...btn, color:repeat!=='off'?(embedTrack?.type==='youtube'?'#ff4444':track.color):'rgba(255,255,255,0.3)', position:'relative', padding:'clamp(5px,1.2vw,8px)' }}>
                {repeat==='one'?<Repeat1 size={18}/>:<Repeat size={18}/>}
                {repeat!=='off'&&<div style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:embedTrack?.type==='youtube'?'#ff4444':track.color }}/>}
              </button>}
            </div>

            {/* ── Volume row */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop: (fullscreen && (layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait')) ? layoutVars.volumeMt : fullscreen ? 0 : layoutVars.volumeMt, width:'100%', maxWidth: fullscreen ? '100%' : layoutMode === 'mobile-landscape' ? '100%' : 340, padding:'4px 2px' }}>
              <button onClick={()=>setMuted(m=>!m)} style={{ ...btn, color:muted?'#ef4444':'rgba(255,255,255,0.38)', padding:4, flexShrink:0 }}>{muted?<VolumeX size={16}/>:<Volume2 size={16}/>}</button>
              <input type="range" min="0" max="1" step="0.01" value={muted?0:volume} onChange={e=>{setVolume(+e.target.value);setMuted(false)}} style={{ flex:1, accentColor:embedTrack?.type==='youtube'?'#ff4444':track.color, height:3, cursor:'pointer' }}/>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontWeight:700, minWidth:28, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{muted?'0':Math.round(volume*100)}%</span>
            </div>

            {/* ── Action buttons row */}
            <div style={{ display:'flex', alignItems:'center', flexWrap: layoutMode === 'mobile-portrait' ? 'wrap' : 'nowrap', gap:4, marginTop: (fullscreen && (layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait')) ? layoutVars.volumeMt : fullscreen ? 0 : layoutVars.volumeMt, width:'100%', maxWidth: (fullscreen || layoutMode === 'mobile-landscape') ? '100%' : 340, justifyContent:'center' }}>
              {/* Like */}
              {embedTrack?.type==='youtube'
                ? (() => {
                    const vid = embedTrack.videoId;
                    const isLikedYt = !!liked[`yt_${vid}`];
                    const isDownloadingYt = ytDownloadingIds.has(vid);
                    const isCachedYt = cachedYtIds.has(vid);
                    const dlProg = ytDownloadProg[vid] || 0;
                    return (
                      <button onClick={likeYtTrack} title={t?.like||"Like"} style={{ ...btn, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:isLikedYt?'#f472b6':'rgba(255,255,255,0.35)', position:'relative', gap:2 }}>
                        <Heart size={16} fill={isLikedYt?'#f472b6':'none'}/>
                        {isDownloadingYt && (
                          <span style={{ fontSize:8, fontWeight:800, color:'#60a5fa', letterSpacing:'0.03em' }}>{dlProg > 0 ? `${dlProg}%` : '…'}</span>
                        )}
                        {!isDownloadingYt && isCachedYt && isLikedYt && (
                          <span style={{ fontSize:8, fontWeight:800, color:'#4ade80' }}>✓</span>
                        )}
                        {!isDownloadingYt && !isCachedYt && isLikedYt && isLite && (
                          <span style={{ fontSize:8, fontWeight:800, color:'rgba(255,255,255,0.3)' }}>⚡</span>
                        )}
                      </button>
                    );
                  })()
                : (() => {
                    const favId = track.id;
                    const isLiked = !!liked[favId];
                    const songObj = (!track.isRadio && !track.isDrive && !builtinSongs.find(s=>s.id===track.id)) ? null : null; // already in allSongs
                    const radioObj = track.isRadio ? track : null;
                    return (
                      <button onClick={() => toggleFav(favId, radioObj)} title={isLiked ? (t?.removeFromFav||'Remove from Favorites') : (t?.addToFav||'Add to Favorites')} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:isLiked?'#f472b6':'rgba(255,255,255,0.35)' }}>
                        <Heart size={16} fill={isLiked?'#f472b6':'none'}/>
                      </button>
                    );
                  })()
              }
              {/* Share Stream */}
              <button onClick={()=>{ setShowShareMenu(v=>!v); setShowQueue(false); }} title="Share Stream" style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:showShareMenu?(embedTrack?.type==='youtube'?'#ff6b6b':track.color):'rgba(255,255,255,0.35)' }}>
                <Share2 size={16}/>
              </button>
              {/* Queue */}
              <button onClick={()=>{ setShowQueue(q=>!q); setShowShareMenu(false); }} title={t?.queue||"Queue"} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:showQueue?(embedTrack?.type==='youtube'?'#ff6b6b':track.color):'rgba(255,255,255,0.35)' }}>
                <ListMusic size={16}/>
              </button>
              {/* Settings */}
              <button onClick={()=>setShowSettings(v=>!v)} title={t?.settings||"Settings"} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background: showSettings?'rgba(255,255,255,0.08)':'none', border:'none', color:sleepTimer?(embedTrack?.type==='youtube'?'#ff6b6b':track.color):(showSettings?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.35)') }}><Settings size={16}/></button>
              {/* Fullscreen */}
              <button onClick={()=>setFullscreen(f=>!f)} title={fullscreen?(t?.exitFullscreenBtn||'Exit Fullscreen'):(t?.fullscreenBtn||'Fullscreen')} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:fullscreen?(embedTrack?.type==='youtube'?'#ff6b6b':track.color):'rgba(255,255,255,0.35)' }}>
                {fullscreen?<Minimize2 size={16}/>:<Maximize2 size={16}/>}
              </button>
              {/* Tutup embed — hanya muncul saat ada stream aktif */}
              {embedTrack && (
                <button onClick={()=>{ closeEmbed(); setShowSettings(false); }} title={t?.closeStreamBtn||"Close Stream"} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:'#fca5a5' }}>
                  <X size={16}/>
                </button>
              )}
              {/* Tutup radio — hanya muncul saat radio sedang aktif */}
              {!embedTrack && track.isRadio && radioStation && (
                <button onClick={()=>{ if(audioRef.current){audioRef.current.pause();audioRef.current.src='';} if(hlsRef.current){hlsRef.current.destroy();hlsRef.current=null;} if(radioReconnectRef.current){clearTimeout(radioReconnectRef.current);radioReconnectRef.current=null;} radioReconnectCount.current=0; setStreamBuffering(false); setPlaying(false); setRadioStation(null); setRadioPlaying(false); setTrack(SONGS[0]); setShowSettings(false); }} title={t?.closeRadioBtn||"Exit Radio"} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:'#fbbf24' }}>
                  <X size={16}/>
                </button>
              )}
            </div>

          </div>
          )} {/* end portrait+desktop layout */}
          </div>
        )}
        {tab==='stream'&&(
          <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:'14px 16px 0' }}>

            {/* Header */}
            <div style={{ marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                <div style={{ fontWeight:800, fontSize:15 }}>{t?.streamingPlatforms||'Streaming Platforms'}</div>
                {sleepTimer && <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:999, background:'rgba(251,191,36,0.15)', color:'#fbbf24', letterSpacing:'0.04em' }}>💤 {fmtSec(sleepTimer.remaining)}</span>}
              </div>

              {/* ── Unified search bar */}
              {(() => {
                const searchPlatforms = STREAMING_PLATFORMS.filter(p => ['ytmusic','websearch'].includes(p.id));
                const activePlat = searchPlatforms.find(p => p.id === unifiedPlatform) || searchPlatforms[0];
                const handleUnifiedSearch = () => {
                  if (!unifiedQuery.trim()) return;
                  if (unifiedPlatform === 'ytmusic') {
                    setYtQuery(p => ({...p, ytmusic: unifiedQuery}));
                    searchYouTube('ytmusic', unifiedQuery);
                  } else if (unifiedPlatform === 'websearch') {
                    setWsQuery(unifiedQuery);
                    doWebSearch(unifiedQuery);
                  }
                };
                return (
                  <div style={{ marginBottom:8 }}>
                    {/* Platform filter tabs */}
                    <div style={{ display:'flex', gap:5, marginBottom:7 }}>
                      {searchPlatforms.map(p => {
                        const isActive = unifiedPlatform === p.id;
                        return (
                          <button key={p.id} onClick={() => { setUnifiedPlatform(p.id); setUnifiedQuery(p.id==='ytmusic' ? (ytQuery['ytmusic']||'') : p.id==='websearch' ? wsQuery : ''); }}
                            style={{ flex:1, padding:'6px 0', borderRadius:10, border:`1.5px solid ${isActive ? p.color : p.color+'30'}`, background: isActive ? `${p.color}22` : 'rgba(255,255,255,0.03)', color: isActive ? p.color : 'rgba(255,255,255,0.4)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5, transition:'all 0.15s' }}>
                            <PlatformLogo id={p.id} size={13}/>
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                    {/* Search input */}
                    <div style={{ display:'flex', gap:6 }}>
                      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.35)', borderRadius:999, padding:'7px 13px', border:`1.5px solid ${activePlat.color}35` }}>
                        <Search size={12} style={{ color:activePlat.color, flexShrink:0 }}/>
                        <input type="text" placeholder={activePlat.hint}
                          value={unifiedQuery}
                          onChange={e => setUnifiedQuery(e.target.value)}
                          onKeyDown={e => { if(e.key==='Enter') handleUnifiedSearch(); }}
                          style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:12, minWidth:0 }}/>
                        {unifiedQuery && <button onClick={()=>setUnifiedQuery('')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:0, display:'flex', lineHeight:1 }}>×</button>}
                      </div>
                      <button onClick={handleUnifiedSearch}
                        style={{ padding:'7px 14px', borderRadius:999, border:'none', background:`${activePlat.color}cc`, color:'white', fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', gap:4 }}>
                        <Search size={11}/> {t?.searchBtn||'Search'}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* List */}
            <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:5, paddingBottom:'max(80px, calc(72px + env(safe-area-inset-bottom)))' }}>

              {/* ── STREAMING PLATFORMS */}
              <div style={{ marginBottom:10 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {STREAMING_PLATFORMS.map(platform => {
                    const isYT = platform.embedType === 'youtube';
                    const isRedirect = platform.embedType === 'redirect';
                    const isRadio = platform.embedType === 'radio';
                    const isWebSearch = platform.embedType === 'websearch';
                    const ytQ = ytQuery[platform.id] || '';
                    const results = ytResults[platform.id] || [];
                    const loading = ytLoading[platform.id];
                    const error   = ytError[platform.id];
                    return (
                      <div key={platform.id} ref={platform.id === 'ytmusic' ? ytMusicSectionRef : null}
                        style={{ borderRadius:16, background:`${platform.color}0e`, border:`1px solid ${platform.color}30`, overflow:'hidden', display: (isYT||isWebSearch) && unifiedPlatform !== platform.id ? 'none' : 'block' }}>
                        {/* ── Platform header */}
                        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px 8px' }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:`${platform.color}20`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                            <PlatformLogo id={platform.id} size={22}/>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontWeight:700, fontSize:13, color:'white' }}>{platform.name}</span>
                              {(isYT||isWebSearch) && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:`${platform.color}25`, color:platform.color }}>{isWebSearch ? 'IN-APP ▶' : 'IN-APP ▶'}</span>}
                              {isRadio && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:`${platform.color}25`, color:platform.color }}>● LIVE</span>}
                              {isRedirect && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.35)' }}>REDIRECT ↗</span>}
                            </div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{platform.description}</div>
                          </div>

                        </div>

                        {/* ── YouTube: results only (search bar moved to unified) */}
                        {isYT && (
                          <div style={{ padding:'0 10px 10px' }}>
                            {error && <div style={{ fontSize:11, color:'#fca5a5', marginTop:6, padding:'6px 10px', borderRadius:8, background:'rgba(239,68,68,0.1)' }}>{error}</div>}
                            {/* Loading skeleton */}
                            {loading && (
                              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                                {[1,2,3,4].map(i => (
                                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,68,68,0.12)', flexShrink:0, animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.12}s` }}/>
                                    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
                                      <div style={{ height:10, borderRadius:6, background:'rgba(255,255,255,0.08)', width:`${72-i*6}%`, animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.12}s` }}/>
                                      <div style={{ height:8, borderRadius:6, background:'rgba(255,255,255,0.05)', width:'40%', animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.18}s` }}/>
                                    </div>
                                  </div>
                                ))}
                                <div style={{ textAlign:'center', paddingTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                  <Loader2 size={12} style={{ color:'rgba(255,68,68,0.6)', animation:'spin 0.8s linear infinite' }}/>
                                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{t?.searchingYt||'Searching YouTube…'}</span>
                                </div>
                              </div>
                            )}
                            {/* Results — with thumbnail & playing indicator */}
                            {!loading && results.length > 0 && (
                              <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:4 }}>
                                {results.map((v, vi) => {
                                  const secs = v.duration || v.lengthSeconds || 0;
                                  const dur  = secs > 0 ? `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}` : '';
                                  const ch   = v.uploaderName || v.author || v.channel || 'YouTube';
                                  const thumb = v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`;
                                  const isCurrentYt = embedTrack?.type === 'youtube' && embedTrack.videoId === v.videoId;
                                  return (
                                    <div key={v.videoId || vi}
                                      style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background: isCurrentYt ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.04)', border: isCurrentYt ? '1px solid rgba(255,68,68,0.35)' : '1px solid rgba(255,255,255,0.08)' }}
                                      onMouseEnter={e=>{ if(!isCurrentYt) e.currentTarget.style.background='rgba(255,0,0,0.08)'; }}
                                      onMouseLeave={e=>{ if(!isCurrentYt) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}>
                                      <div onClick={() => { if(isCurrentYt) setPlaying(p=>!p); else playYouTube(v, results, vi); }}
                                        style={{ width:38, height:38, borderRadius:8, background:`${platform.color}20`, flexShrink:0, cursor:'pointer', overflow:'hidden', position:'relative' }}>
                                        {!isLite && <img src={thumb} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }}/>}
                                        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background: isCurrentYt ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.3)', borderRadius:8 }}>
                                          {isCurrentYt && playing
                                            ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12 }}>{[8,5,7].map((h,i)=>(<div key={i} style={{ width:2.5, height:h, background:'#ff4444', borderRadius:1, animation:`bounce 1.4s ease-in-out ${i*0.25}s infinite` }}/>))}</div>
                                            : <Play size={13} style={{ color: isCurrentYt ? '#ff6b6b' : platform.color, marginLeft:2 }}/>}
                                        </div>
                                      </div>
                                      <div onClick={() => playYouTube(v, results, vi)} style={{ flex:1, minWidth:0, cursor:'pointer' }}>
                                        <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: isCurrentYt ? '#ff6b6b' : 'rgba(255,255,255,0.9)' }}>{v.title}</div>
                                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{ch}{dur ? ` · ${dur}` : ''}</div>
                                      </div>
                                      <button onClick={e => { e.stopPropagation(); openNewTab(`https://www.youtube.com/watch?v=${v.videoId}`); }}
                                        title="Buka di YouTube"
                                        style={{ background:'none', border:`1px solid ${platform.color}40`, borderRadius:6, color:platform.color, fontSize:10, fontWeight:700, padding:'3px 7px', cursor:'pointer', flexShrink:0, lineHeight:1.2 }}>↗</button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}



                        {/* ── Redirect platforms */}
                        {isRedirect && (() => {
                          const q = platformSearch[platform.id] || '';
                          const iframeUrl = platformIframe[platform.id] || null;
                          return (
                            <div style={{ padding:'0 10px 12px' }}>
                              {/* Search bar */}
                              <div style={{ display:'flex', gap:6 }}>
                                <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.3)', borderRadius:999, padding:'6px 12px', border:`1px solid ${platform.color}30` }}>
                                  <Search size={11} style={{ color:platform.color, flexShrink:0 }}/>
                                  <input type="text" placeholder={platform.hint}
                                    value={q}
                                    onChange={e => setPlatformSearch(p=>({...p,[platform.id]:e.target.value}))}
                                    onKeyDown={e => {
                                      if(e.key==='Enter') {
                                        const sq = q.trim();
                                        const url = sq ? platform.searchUrl(sq) : platform.openUrl;
                                        setPlatformIframe(p=>({...p,[platform.id]:url}));
                                      }
                                    }}
                                    style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:12, minWidth:0 }}/>
                                  {q && (
                                    <button onClick={() => { setPlatformSearch(p=>({...p,[platform.id]:''})); setPlatformIframe(p=>({...p,[platform.id]:null})); }}
                                      style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:0, display:'flex' }}>
                                      <X size={13}/>
                                    </button>
                                  )}
                                </div>
                                <button onClick={() => {
                                    const sq = q.trim();
                                    const url = sq ? platform.searchUrl(sq) : platform.openUrl;
                                    setPlatformIframe(p=>({...p,[platform.id]:url}));
                                  }}
                                  style={{ padding:'6px 14px', borderRadius:999, border:'none', background:`${platform.color}cc`, color:'white', fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                                  {t?.searchBtn||'Search'}
                                </button>
                              </div>
                              {/* Redirect langsung — tidak embed karena platform sering blokir iframe */}
                              <div style={{ marginTop:8, padding:'10px 12px', borderRadius:10, background:`${platform.color}0a`, border:`1px solid ${platform.color}20`, display:'flex', flexDirection:'column', gap:8 }}>
                                <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', lineHeight:1.5 }}>
                                  Platform ini tidak dapat di-embed. Klik Buka untuk mencari langsung di situs {platform.name}.
                                </div>
                                <button
                                  onClick={() => {
                                    const sq = q.trim();
                                    const url = sq ? platform.searchUrl(sq) : platform.openUrl;
                                    openNewTab(url);
                                  }}
                                  style={{ padding:'8px 14px', borderRadius:999, border:'none', background:`${platform.color}cc`, color:'white', fontSize:12, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                  <span>↗</span> Buka {platform.name}
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                        {isWebSearch && (() => {
                          // Audio-only sources that can play natively in player
                          const wsAudioItems = wsResults.filter(it => it.audioUrl && ['jamendo','ccmixter','audius'].includes(it.source));
                          const srcColors2 = { jamendo:'#f0c020', fma:'#5cb85c', ccmixter:'#e74c3c', audius:'#cc0000', deezer:'#a238ff' };
                          return (
                            <div style={{ padding:'0 10px 12px' }}>
                              {/* Tips */}
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:8, lineHeight:1.5 }}>
                                💡 <b style={{color:'rgba(255,255,255,0.5)'}}>Jamendo · Audius · ccMixter</b> play in-app (queue). <b style={{color:'rgba(255,255,255,0.5)'}}>Deezer</b> 30s preview. Paste URL: <b style={{color:'rgba(255,255,255,0.5)'}}>Vimeo · Audiomack · Mixcloud · Odysee · Dailymotion · Bandcamp</b>
                              </div>
                              {/* Loading skeleton */}
                              {wsLoading && (
                                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                  {[1,2,3,4].map(i => (
                                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                      <div style={{ width:32, height:32, borderRadius:8, background:'rgba(99,102,241,0.15)', flexShrink:0, animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.12}s` }}/>
                                      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
                                        <div style={{ height:10, borderRadius:6, background:'rgba(255,255,255,0.08)', width:`${72-i*6}%`, animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.12}s` }}/>
                                        <div style={{ height:8, borderRadius:6, background:'rgba(255,255,255,0.05)', width:'40%', animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.18}s` }}/>
                                      </div>
                                    </div>
                                  ))}
                                  <div style={{ textAlign:'center', paddingTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                    <Loader2 size={12} style={{ color:'rgba(99,102,241,0.6)', animation:'spin 0.8s linear infinite' }}/>
                                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>Searching…</span>
                                  </div>
                                </div>
                              )}
                              {/* Error */}
                              {wsError && !wsLoading && (
                                <div style={{ fontSize:11, color:'#fca5a5', padding:'8px 10px', borderRadius:8, background:'rgba(239,68,68,0.1)', marginBottom:8 }}>{wsError}</div>
                              )}
                              {/* Results */}
                              {!wsLoading && wsResults.length > 0 && (
                                <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:4 }}>
                                  {wsResults.map((item, idx) => {
                                    // ── Spotify direct embed
                                    if (item.type === 'sp_embed_direct') return (
                                      <div key={idx} style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(29,185,84,0.3)', marginBottom:6 }}>
                                        <iframe key={`sp-ws-direct-${item.embedUrl}`} src={`${item.embedUrl}?utm_source=generator&theme=0`} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{ display:'block' }}/>
                                      </div>
                                    );
                                    // ── SoundCloud redirect URL langsung → embed widget
                                    if (item.type === 'sc_redirect') return (
                                      <div key={idx} style={{ marginBottom:6 }}>
                                        {item.directUrl && (
                                          <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,85,0,0.3)' }}>
                                            <iframe key={`sc-ws-direct-${item.directUrl}`}
                                              src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(item.directUrl)}&color=%23ff5500&auto_play=false&buying=false&liking=false&download=false&sharing=false&show_artwork=true&show_comments=false&show_playcount=false&show_user=true&hide_related=true&visual=true`}
                                              width="100%" height="166" frameBorder="0" allow="autoplay" style={{ display:'block' }}/>
                                          </div>
                                        )}
                                      </div>
                                    );
                                    // ── SoundCloud embed (pihak ketiga, tanpa API key) — iframe widget search
                                    if (item.type === 'sc_embed') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          <PlatformLogo id="soundcloud" size={11}/>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#ff5500' }}>SoundCloud</span>
                                          <span style={{ fontSize:9, color:'rgba(255,85,0,0.5)', marginLeft:2 }}>· Embed</span>
                                        </div>
                                        <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,85,0,0.3)', background:'rgba(255,85,0,0.04)' }}>
                                          <iframe
                                            key={`sc-ws-embed-${item.query}`}
                                            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent('https://soundcloud.com/search?q='+encodeURIComponent(item.query))}&color=%23ff5500&auto_play=false&buying=false&liking=false&download=false&sharing=false&show_artwork=true&show_comments=false&show_playcount=false&show_user=true&hide_related=true&visual=false`}
                                            width="100%" height="120" frameBorder="0" allow="autoplay" style={{ display:'block' }}
                                          />
                                          <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', padding:'4px 8px', background:'rgba(0,0,0,0.3)', gap:6 }}>
                                            <button onClick={()=>window.open(`https://soundcloud.com/search?q=${encodeURIComponent(item.query)}`, '_blank', 'noopener,noreferrer')}
                                              style={{ fontSize:10, color:'#ff5500', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Buka di SoundCloud ↗</button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                    // ── Spotify embed (pihak ketiga, tanpa API key) — iframe search + tombol buka
                                    if (item.type === 'sp_embed') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          <PlatformLogo id="spotify" size={11}/>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#1DB954' }}>Spotify</span>
                                          <span style={{ fontSize:9, color:'rgba(29,185,84,0.5)', marginLeft:2 }}>· Embed</span>
                                        </div>
                                        <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(29,185,84,0.3)', background:'rgba(29,185,84,0.04)' }}>
                                          <iframe
                                            key={`sp-ws-search-embed-${item.query}`}
                                            src={`https://open.spotify.com/embed/search/${encodeURIComponent(item.query)}?utm_source=generator&theme=0`}
                                            width="100%" height="152" frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            loading="lazy" style={{ display:'block' }}
                                          />
                                          <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', padding:'4px 8px', background:'rgba(0,0,0,0.3)', gap:6 }}>
                                            <button onClick={()=>window.open(`https://open.spotify.com/search/${encodeURIComponent(item.query)}`, '_blank', 'noopener,noreferrer')}
                                              style={{ fontSize:10, color:'#1DB954', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Buka di Spotify ↗</button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                    // ── Spotify redirect card (legacy — jika masih ada di results lama)
                                    if (item.type === 'sp_redirect') return (
                                      <div key={idx}
                                        onClick={() => openNewTab(`https://open.spotify.com/search/${encodeURIComponent(item.query)}`)}
                                        style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(29,185,84,0.08)', border:'1px solid rgba(29,185,84,0.25)', marginBottom:6, cursor:'pointer' }}
                                        onMouseEnter={e=>e.currentTarget.style.background='rgba(29,185,84,0.15)'}
                                        onMouseLeave={e=>e.currentTarget.style.background='rgba(29,185,84,0.08)'}>
                                        <PlatformLogo id="spotify" size={20}/>
                                        <div style={{ flex:1, minWidth:0 }}>
                                          <div style={{ fontSize:11, fontWeight:700, color:'#1DB954' }}>Spotify</div>
                                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)' }}>Tidak bisa di-embed — klik untuk buka langsung</div>
                                        </div>
                                        <span style={{ padding:'5px 12px', borderRadius:999, background:'#1DB954', color:'black', fontSize:11, fontWeight:800, flexShrink:0 }}>Buka ↗</span>
                                      </div>
                                    );
                                    // ── SoundCloud section (API key atau public search — mirip YT)
                                    if (item.type === 'sc_section') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          {item._items[0]?.source === 'audius'
                                            ? <><span style={{ fontSize:10, fontWeight:700, color:'#cc0000' }}>🎵 Audius</span><span style={{ fontSize:9, color:'rgba(204,0,0,0.5)', marginLeft:2 }}>· Free &amp; Open</span></>
                                            : <><PlatformLogo id="soundcloud" size={11}/><span style={{ fontSize:10, fontWeight:700, color:'#ff5500' }}>SoundCloud</span></>}
                                        </div>
                                        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                          {item._items.map((t2, ti) => {
                                            const durSec = t2.duration||0;
                                            const mins = Math.floor(durSec/60), secs2 = String(durSec%60).padStart(2,'0');
                                            const dur2 = durSec > 0 ? `${mins}:${secs2}` : '';
                                            const isAudius = t2.source === 'audius';
                                            const accentColor = isAudius ? '#cc0000' : '#ff5500';
                                            const scUrl = t2.permalinkUrl||t2.streamUrl||'';
                                            const isCurrentTrack = isAudius && track.id === `ws_audius_${t2.id}` && !embedTrack;
                                            const isActiveEmbed = !isAudius && scWidget['soundcloud'] === scUrl && scUrl.includes('soundcloud.com/');
                                            const isActive = isCurrentTrack || isActiveEmbed;
                                            return (
                                              <div key={t2.id||ti} style={{ display:'flex', flexDirection:'column' }}>
                                                <div
                                                  style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius: isActiveEmbed ? '10px 10px 0 0' : 10, background: isActive ? `${accentColor}20` : 'rgba(255,255,255,0.04)', border: isActive ? `1px solid ${accentColor}55` : '1px solid rgba(255,255,255,0.08)', borderBottom: isActiveEmbed ? 'none' : undefined, cursor:'pointer' }}
                                                  onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background=`${accentColor}10`; }}
                                                  onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                                                  onClick={() => {
                                                    if (isAudius && t2.audioUrl) {
                                                      if (isCurrentTrack) { setPlaying(p=>!p); }
                                                      else { playWsTrack(t2, item._items.filter(x=>x.audioUrl), item._items.filter(x=>x.audioUrl).indexOf(t2)); }
                                                    } else if (scUrl.includes('soundcloud.com/')) {
                                                      setScWidget(p => ({ ...p, soundcloud: p.soundcloud === scUrl ? null : scUrl }));
                                                    } else {
                                                      window.open(`https://soundcloud.com/search?q=${encodeURIComponent(t2.title||'')}`, '_blank', 'noopener,noreferrer');
                                                    }
                                                  }}>
                                                  {/* Thumbnail */}
                                                  <div style={{ width:38, height:38, borderRadius:8, background:`${accentColor}30`, flexShrink:0, overflow:'hidden', position:'relative' }}>
                                                    {t2.thumbnail && !isLite && <img src={t2.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }}/>}
                                                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background: isActive ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.3)', borderRadius:8 }}>
                                                      {isCurrentTrack && playing
                                                        ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12 }}>{[8,5,7].map((h2,i2)=>(<div key={i2} style={{ width:2.5, height:h2, background:accentColor, borderRadius:1, animation:`bounce 1.4s ease-in-out ${i2*0.25}s infinite` }}/>))}</div>
                                                        : isActiveEmbed ? <span style={{ fontSize:11, color:accentColor }}>▼</span>
                                                        : <Play size={13} style={{ color:accentColor, marginLeft:2 }}/>}
                                                    </div>
                                                  </div>
                                                  {/* Info */}
                                                  <div style={{ flex:1, minWidth:0 }}>
                                                    <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: isActive ? accentColor : 'rgba(255,255,255,0.9)' }}>{t2.title}</div>
                                                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{t2.artist}{dur2 ? ` · ${dur2}` : ''}</div>
                                                  </div>
                                                  {/* Open button */}
                                                  <button onClick={e => { e.stopPropagation(); window.open(scUrl||`https://soundcloud.com/search?q=${encodeURIComponent(t2.title||'')}`, '_blank', 'noopener,noreferrer'); }}
                                                    title={isAudius ? 'Buka di Audius' : 'Buka di SoundCloud'}
                                                    style={{ background:'none', border:`1px solid ${accentColor}55`, borderRadius:6, color:accentColor, fontSize:10, fontWeight:700, padding:'3px 7px', cursor:'pointer', flexShrink:0, lineHeight:1.2 }}>↗</button>
                                                </div>
                                                {/* Embed iframe saat diklik */}
                                                {isActiveEmbed && (
                                                  <div style={{ borderRadius:'0 0 10px 10px', overflow:'hidden', border:'1px solid rgba(255,85,0,0.4)', borderTop:'none' }}>
                                                    <iframe
                                                      key={`sc-ws-${scUrl}`}
                                                      src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(scUrl)}&color=%23ff5500&auto_play=false&buying=false&liking=false&download=false&sharing=false&show_artwork=true&show_comments=false&show_playcount=false&show_user=true&hide_related=true&visual=true`}
                                                      width="100%" height="130" frameBorder="0" allow="autoplay" style={{ display:'block' }}/>
                                                    <div style={{ display:'flex', justifyContent:'flex-end', padding:'4px 8px', background:'rgba(0,0,0,0.4)', gap:6 }}>
                                                      <button onClick={()=>setScWidget(p=>({...p,soundcloud:null}))} style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer' }}>✕ Close</button>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                    // ── Spotify section (API key atau public search — mirip YT)
                                    if (item.type === 'sp_section') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          {item._items[0]?.source === 'deezer'
                                            ? <><span style={{ fontSize:10, fontWeight:700, color:'#a238ff' }}>🎵 Deezer</span><span style={{ fontSize:9, color:'rgba(162,56,255,0.5)', marginLeft:2 }}>· Preview 30s</span></>
                                            : <><PlatformLogo id="spotify" size={11}/><span style={{ fontSize:10, fontWeight:700, color:'#1DB954' }}>Spotify</span></>}
                                        </div>
                                        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                          {item._items.map(t3 => {
                                            const durMs = t3.duration||0;
                                            const isDurMs = durMs > 9999; // durasi dalam ms vs detik
                                            const totalSec = isDurMs ? Math.floor(durMs/1000) : durMs;
                                            const mins3 = Math.floor(totalSec/60), secs3 = String(totalSec%60).padStart(2,'0');
                                            const dur3 = totalSec > 0 ? `${mins3}:${secs3}` : '';
                                            const hasPreview = !!t3.previewUrl;
                                            const isEmbedActive = spWsEmbedId === t3.id;
                                            const isDeezer = t3.source === 'deezer';
                                            const isPreviewActive = isDeezer
                                              ? (track.id === `ws_deezer_${t3.id}` && !embedTrack)
                                              : (spTrack?.id === t3.id);
                                            const coverUrl = t3.cover || t3.thumbnail || null;
                                            const spColor = isDeezer ? '#a238ff' : '#1DB954';
                                            return (
                                              <div key={t3.id||t3.title} style={{ display:'flex', flexDirection:'column' }}>
                                                <div
                                                  style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius: (!isDeezer&&isEmbedActive) ? '10px 10px 0 0' : 10, background: isEmbedActive ? `${spColor}20` : isPreviewActive ? `${spColor}18` : 'rgba(255,255,255,0.04)', border: isEmbedActive ? `1px solid ${spColor}80` : isPreviewActive ? `1px solid ${spColor}60` : '1px solid rgba(255,255,255,0.08)', borderBottom: (!isDeezer&&isEmbedActive) ? 'none' : undefined, cursor:'pointer' }}
                                                  onMouseEnter={e=>{ if(!isEmbedActive&&!isPreviewActive) e.currentTarget.style.background=`${spColor}12`; }}
                                                  onMouseLeave={e=>{ if(!isEmbedActive&&!isPreviewActive) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                                                  onClick={() => {
                                                    if (isDeezer) {
                                                      if (t3.previewUrl) { playWsTrack({ ...t3, audioUrl: t3.previewUrl, source:'deezer' }, item._items.filter(x=>x.previewUrl).map(x=>({...x,audioUrl:x.previewUrl,source:'deezer'})), item._items.filter(x=>x.previewUrl).findIndex(x=>x.id===t3.id)); }
                                                      else window.open(t3.spotifyUrl,'_blank','noopener,noreferrer');
                                                    } else {
                                                      setSpWsEmbedId(prev => prev === t3.id ? null : t3.id);
                                                    }
                                                  }}>
                                                  {/* Thumbnail 38x38 mirip YT */}
                                                  <div style={{ width:38, height:38, borderRadius:8, background:`${spColor}30`, flexShrink:0, overflow:'hidden', position:'relative' }}>
                                                    {coverUrl && !isLite && <img src={coverUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }}/>}
                                                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background: isEmbedActive||isPreviewActive ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)', borderRadius:8 }}>
                                                      {isPreviewActive && playing
                                                        ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12 }}>{[8,5,7].map((h2,i2)=>(<div key={i2} style={{ width:2.5, height:h2, background:spColor, borderRadius:1, animation:`bounce 1.4s ease-in-out ${i2*0.25}s infinite` }}/>))}</div>
                                                        : isEmbedActive ? <span style={{ fontSize:11, color:spColor }}>▼</span>
                                                        : <Play size={13} style={{ color:spColor, marginLeft:2 }}/>}
                                                    </div>
                                                  </div>
                                                  {/* Info */}
                                                  <div style={{ flex:1, minWidth:0 }}>
                                                    <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: isEmbedActive||isPreviewActive ? spColor : 'rgba(255,255,255,0.9)' }}>{t3.title}</div>
                                                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t3.artist}{dur3 ? ` · ${dur3}` : ''}</div>
                                                  </div>
                                                  {/* Preview 30s badge */}
                                                  {hasPreview && (
                                                    <span onClick={e=>{ e.stopPropagation(); isDeezer ? playWsTrack({ ...t3, audioUrl: t3.previewUrl, source:'deezer' }, item._items.filter(x=>x.previewUrl).map(x=>({...x,audioUrl:x.previewUrl,source:'deezer'})), item._items.filter(x=>x.previewUrl).findIndex(x=>x.id===t3.id)) : playSpotifyPreview(t3); }} style={{ fontSize:9, color:spColor, background:`${spColor}28`, padding:'2px 5px', borderRadius:4, fontWeight:700, flexShrink:0, cursor:'pointer' }} title="Preview 30 detik">▶ 30s</span>
                                                  )}
                                                  {/* Open button mirip YT ↗ */}
                                                  {t3.spotifyUrl && <button onClick={e => { e.stopPropagation(); window.open(t3.spotifyUrl, '_blank', 'noopener,noreferrer'); }}
                                                    title={isDeezer ? 'Buka di Deezer' : 'Buka di Spotify'}
                                                    style={{ background:'none', border:`1px solid ${spColor}55`, borderRadius:6, color:spColor, fontSize:10, fontWeight:700, padding:'3px 7px', cursor:'pointer', flexShrink:0, lineHeight:1.2 }}>↗</button>}
                                                </div>
                                                {/* Spotify embed iframe — hanya untuk Spotify (bukan Deezer) */}
                                                {!isDeezer && isEmbedActive && (
                                                  <div style={{ borderRadius:'0 0 10px 10px', overflow:'hidden', border:`1px solid ${spColor}80`, borderTop:'none' }}>
                                                    <iframe
                                                      key={`sp-ws-embed-${t3.id}`}
                                                      src={`https://open.spotify.com/embed/track/${t3.id}?utm_source=generator&theme=0`}
                                                      width="100%" height="152" frameBorder="0"
                                                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                      loading="lazy" style={{ display:'block' }}
                                                    />
                                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 8px', background:'rgba(0,0,0,0.4)', gap:6 }}>
                                                      <span style={{ fontSize:10, color:'#1DB954', fontWeight:700 }}>🎵 Spotify</span>
                                                      <div style={{ display:'flex', gap:6 }}>
                                                        {t3.spotifyUrl && <button onClick={()=>window.open(t3.spotifyUrl,'_blank','noopener,noreferrer')} style={{ fontSize:10, color:'rgba(255,255,255,0.5)', background:'none', border:'none', cursor:'pointer' }}>Buka ↗</button>}
                                                        <button onClick={()=>setSpWsEmbedId(null)} style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer' }}>✕ Close</button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                    // ── Native audio items (Jamendo, FMA, ccMixter) — in-app player, queue
                                    if (item.audioUrl && ['jamendo','ccmixter','audius'].includes(item.source)) {
                                      const srcC = srcColors2[item.source] || '#6366f1';
                                      const dur2 = item.duration ? `${Math.floor(item.duration/60)}:${String(item.duration%60).padStart(2,'0')}` : '';
                                      const srcLabels = { jamendo:'Jamendo', fma:'FMA', ccmixter:'ccMixter', audius:'Audius' };
                                      const currentId = `ws_${item.source}_${item.id||item.audioUrl}`;
                                      const isCurrentTrack = track.id === currentId && !embedTrack;
                                      const isPlaying2 = isCurrentTrack && playing;
                                      return (
                                        <div key={idx}
                                          style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background: isCurrentTrack ? `${srcC}18` : 'rgba(255,255,255,0.04)', border: isCurrentTrack ? `1px solid ${srcC}40` : '1px solid rgba(255,255,255,0.08)' }}
                                          onMouseEnter={e=>{ if(!isCurrentTrack) e.currentTarget.style.background=`${srcC}10`; }}
                                          onMouseLeave={e=>{ if(!isCurrentTrack) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}>
                                          {/* Play button */}
                                          <div onClick={() => { if(isCurrentTrack) { setPlaying(p=>!p); } else { playWsTrack(item, wsAudioItems, wsAudioItems.indexOf(item)); } }}
                                            style={{ width:32, height:32, borderRadius:8, background:`${srcC}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }}>
                                            {isPlaying2
                                              ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12 }}>{[8,5,7].map((h2,i2)=>(<div key={i2} style={{ width:2.5, height:h2, background:srcC, borderRadius:1, animation:`bounce 1.4s ease-in-out ${i2*0.25}s infinite` }}/>))}</div>
                                              : <Play size={13} style={{ color:srcC, marginLeft:2 }}/>}
                                          </div>
                                          {/* Info */}
                                          <div onClick={() => playWsTrack(item, wsAudioItems, wsAudioItems.indexOf(item))} style={{ flex:1, minWidth:0, cursor:'pointer' }}>
                                            <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: isCurrentTrack ? srcC : 'rgba(255,255,255,0.9)' }}>{item.title}</div>
                                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{item.artist}{dur2 ? ` · ${dur2}` : ''}</div>
                                          </div>
                                          {/* Badge */}
                                          <span style={{ fontSize:9, fontWeight:800, color:srcC, background:`${srcC}18`, padding:'2px 5px', borderRadius:4, flexShrink:0 }}>{srcLabels[item.source]}</span>
                                          {/* Add to queue */}
                                          <button onClick={e => { e.stopPropagation(); setCustomSongs(prev => { const nid = `ws_${item.source}_${item.id||item.audioUrl}`; const ex = prev.find(s=>s.id===nid); if(ex) return prev; const srcColors3={jamendo:'#f0c020',fma:'#5cb85c',ccmixter:'#e74c3c',audius:'#cc0000'}; return [{ id:nid, title:item.title, artist:item.artist||item.source, album:srcLabels[item.source], cover:item.thumbnail||'', src:item.audioUrl, color:srcColors3[item.source]||'#6366f1', bg:`rgba(99,102,241,0.15)`, mood:'', _wsSource:item.source }, ...prev]; }); }}
                                            title="Add to queue"
                                            style={{ background:'none', border:`1px solid ${srcC}40`, borderRadius:6, color:srcC, fontSize:10, fontWeight:700, padding:'3px 7px', cursor:'pointer', flexShrink:0, lineHeight:1.2 }}>+</button>
                                        </div>
                                      );
                                    }
                                    // ── Embeddable sources (Vimeo, archive, audiomack, mixcloud, odysee, rumble, peertube, dailymotion)
                                    const BADGES = {
                                      vimeo:      { label:'Vimeo',    color:'#1ab7ea' },
                                      dailymotion:{ label:'DM',       color:'#0066DC' },
                                      archive:    { label:'Archive',  color:'#8b5cf6' },
                                      audiomack:  { label:'Audiomack',color:'#ffcc00' },
                                      mixcloud:   { label:'Mixcloud', color:'#52aad8' },
                                      odysee:     { label:'Odysee',   color:'#ef5b5b' },
                                      rumble:     { label:'Rumble',   color:'#85c742' },
                                      peertube:   { label:'PeerTube', color:'#f2690d' },
                                      bandcamp:   { label:'BC',       color:'#1da0c3' },
                                      fma:        { label:'FMA',      color:'#5cb85c' },
                                      ccmixter:   { label:'ccMixter', color:'#e74c3c' },
                                      newgrounds: { label:'NG',       color:'#ff6600' },
                                    };
                                    const srcBadge = BADGES[item.source] || { label:'Web', color:'#6366f1' };
                                    const isEmbeddable = ['archive','vimeo','dailymotion','audiomack','mixcloud','odysee','rumble','peertube'].includes(item.source);
                                    const isExternal = ['bandcamp','fma','ccmixter','newgrounds'].includes(item.source) && !item.audioUrl;
                                    return (
                                      <div key={idx}
                                        onClick={() => {
                                          if (isExternal) { openNewTab(item.externalUrl); }
                                          else if (item.embedUrl) { setWsEmbedUrl(prev => prev === item.embedUrl ? null : item.embedUrl); }
                                        }}
                                        style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 6px', borderRadius:8, cursor:'pointer', transition:'background 0.1s' }}
                                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                      >
                                        <div style={{ width:44, height:44, borderRadius:7, background:'rgba(255,255,255,0.07)', flexShrink:0, overflow:'hidden', position:'relative' }}>
                                          {item.thumbnail && <img src={item.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'}/>}
                                          <div style={{ position:'absolute', bottom:2, right:2, background: srcBadge.color, color:'white', fontSize:7, fontWeight:800, padding:'1px 3px', borderRadius:3 }}>{srcBadge.label}</div>
                                        </div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                          <div style={{ fontSize:12, fontWeight:600, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
                                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.artist}{item.duration ? ` · ${Math.floor(item.duration/60)}:${String(item.duration%60).padStart(2,'0')}` : ''}</div>
                                        </div>
                                        <div style={{ width:28, height:28, borderRadius:'50%', background:`${platform.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                          <span style={{ fontSize:10, color:platform.color }}>{isExternal ? '↗' : wsEmbedUrl === item.embedUrl ? '▼' : '▶'}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {/* Inline embed player */}
                              {wsEmbedUrl && (
                                <div style={{ marginTop:8, borderRadius:10, overflow:'hidden', border:`1px solid ${platform.color}30` }}>
                                  <iframe
                                    key={`ws-embed-${wsEmbedUrl}`}
                                    src={wsEmbedUrl}
                                    width="100%" height="200" frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen"
                                    style={{ display:'block' }}
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                                    onError={() => { openNewTab(wsEmbedUrl); setWsEmbedUrl(null); }}
                                  />
                                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 10px', background:'rgba(0,0,0,0.35)', gap:8 }}>
                                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', flex:1 }}>🌐 Web Embed</span>
                                    <button onClick={() => setWsEmbedUrl(null)}
                                      style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer' }}>✕</button>
                                  </div>
                                </div>
                              )}
                              {/* Empty state */}
                              {!wsLoading && !wsError && wsResults.length === 0 && !wsEmbedUrl && (
                                <div style={{ marginTop:6, fontSize:10, color:'rgba(255,255,255,0.2)', lineHeight:1.6 }}>
                                  No results yet — search a song/artist name, or paste a URL from Vimeo, Audiomack, Mixcloud, Odysee, Rumble, PeerTube, Dailymotion, Bandcamp… ↑
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {isRadio && (() => {
                          const countries = platform.countries || [];
                          const selCountry = countries.find(c => c.id === radioCountry) || null;
                          const selGenre = selCountry ? (selCountry.genres.find(g => g.id === radioGenre) || null) : null;
                          const playStation = (station, genreColor) => {
                            const stationColor = genreColor || '#f59e0b';
                            const radioTrackObj = {
                              id: `radio_${station.id}`,
                              title: station.name,
                              artist: station.city + ' · Live Radio',
                              album: 'Live Radio',
                              cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
                              src: radioUrl(station.url),
                              color: stationColor,
                              bg: `rgba(245,158,11,0.15)`,
                              mood: 'live, radio',
                              isRadio: true,
                            };
                            if (track.id === radioTrackObj.id) {
                              setPlaying(p => !p);
                              setRadioPlaying(p => !p);
                            } else {
                              // Stop any YouTube embed
                              if (embedTrack?.type === 'youtube') { closeEmbed(); }
                              play(radioTrackObj);
                              setRadioStation({ ...station, color: stationColor, countryId: selCountry.id, genreId: selGenre.id });
                              setRadioPlaying(true);
                            }
                          };
                          return (
                            <div style={{ padding:'0 10px 12px' }}>
                              {/* Mode Toggle: Koleksi vs Cari */}
                              <div style={{ display:'flex', gap:3, marginBottom:10, background:'rgba(255,255,255,0.04)', borderRadius:10, padding:3 }}>
                                <button onClick={() => { setRbMode('browse'); loadSomaFM(); loadGardenPlaces(); }}
                                  style={{ flex:1, padding:'6px 0', borderRadius:8, border:'none', background: rbMode==='browse' ? 'rgba(245,158,11,0.25)' : 'transparent', color: rbMode==='browse' ? '#f59e0b' : 'rgba(255,255,255,0.35)', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                                  📻 Koleksi
                                </button>
                                <button onClick={() => { setRbMode('search'); rbLoadTags(); loadSomaFM(); loadGardenPlaces(); if (rbResults.length===0 && !rbLoading) rbSearch('', null); if (multiResults.length===0 && !multiLoading) multiSearch('', null); }}
                                  style={{ flex:1, padding:'6px 0', borderRadius:8, border:'none', background: rbMode==='search' ? 'rgba(245,158,11,0.25)' : 'transparent', color: rbMode==='search' ? '#f59e0b' : 'rgba(255,255,255,0.35)', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                                  🔍 Cari Radio
                                </button>
                              </div>


                              {/* ── UNIFIED CARI RADIO PANEL */}
                              {rbMode === 'search' && (
                                <div>
                                  {/* Now playing bar — synced with main player */}
                                  {radioStation && (
                                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:10, background:`${radioStation.color}18`, border:`1px solid ${radioStation.color}40`, marginBottom:10 }}>
                                      <div style={{ width:8, height:8, borderRadius:'50%', background: (playing && track.isRadio && track.id === `radio_${radioStation.id}`) ? radioStation.color : 'rgba(255,255,255,0.2)', boxShadow: (playing && track.isRadio && track.id === `radio_${radioStation.id}`) ? `0 0 8px ${radioStation.color}` : 'none', flexShrink:0 }}/>
                                      <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:11, fontWeight:700, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{radioStation.name}</div>
                                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>{radioStation.city} · ● LIVE</div>
                                      </div>
                                      <button onClick={() => setTab('player')}
                                        style={{ padding:'3px 8px', borderRadius:999, border:`1px solid ${radioStation.color}50`, background:`${radioStation.color}20`, color:radioStation.color, fontSize:10, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                                        Player ↗
                                      </button>
                                      <button onClick={() => {
                                        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
                                        if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
                                        if (radioReconnectRef.current) { clearTimeout(radioReconnectRef.current); radioReconnectRef.current = null; }
                                        radioReconnectCount.current = 0; setStreamBuffering(false);
                                        setPlaying(false); setRadioStation(null); setRadioPlaying(false);
                                        setTrack(SONGS[0]);
                                      }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14, flexShrink:0, padding:0 }}>✕</button>
                                    </div>
                                  )}
                                  {/* Search bar */}
                                  <div style={{ display:'flex', gap:5, marginBottom:8 }}>
                                    <input
                                      type="text"
                                      value={rbQuery}
                                      onChange={e => setRbQuery(e.target.value)}
                                      onKeyDown={e => { if(e.key==='Enter'){ multiSearch(rbQuery, null); setRbSelectedTag(null); rbSearch(rbQuery, null); }}}
                                      placeholder="Search station, genre, city, country…"
                                      style={{ flex:1, padding:'8px 12px', borderRadius:10, border:'1px solid rgba(245,158,11,0.35)', background:'rgba(0,0,0,0.3)', color:'white', fontSize:11, outline:'none' }}
                                    />
                                    <button onClick={() => { multiSearch(rbQuery, null); rbSearch(rbQuery, null); }}
                                      style={{ padding:'8px 14px', borderRadius:10, border:'none', background:'rgba(245,158,11,0.25)', color:'#f59e0b', fontSize:13, fontWeight:800, cursor:'pointer' }}>
                                      🔍
                                    </button>
                                  </div>
                                  {/* Source tag info */}
                                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.22)', marginBottom:8, display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                                    <span>Sumber:</span>
                                    <span style={{ color:'#f59e0b', fontWeight:700 }}>● RadioBrowser</span>
                                    <span style={{ color:'#10b981', fontWeight:700 }}>● SomaFM</span>
                                    <span style={{ color:'#6366f1', fontWeight:700 }}>● Icecast</span>
                                    <span style={{ color:'#ff4500', fontWeight:700 }}>● NTS</span>
                                    <span style={{ color:'#8b5cf6', fontWeight:700 }}>● Radio Paradise</span>
                                    <span style={{ color:'#06b6d4', fontWeight:700 }}>● FM Stream</span>
                                    <span style={{ color:'#e11d48', fontWeight:700 }}>● Shoutcast</span>
                                    <span style={{ color:'#22d3ee', fontWeight:700 }}>● Radio Garden</span>
                                  </div>
                                  {/* Genre pills — fixed list dengan ikon, mapping ke GENRE_KEYWORDS */}
                                  {(() => {
                                    const GENRE_PILLS = [
                                      { label:'🔥 Top Semua',  tag: null,          color:'#f59e0b' },
                                      { label:'🎵 Pop',        tag: 'pop',         color:'#3b82f6' },
                                      { label:'🎸 Rock',       tag: 'rock',        color:'#ef4444' },
                                      { label:'🎷 Jazz',       tag: 'jazz',        color:'#7c3aed' },
                                      { label:'🎹 Classical',  tag: 'classical',   color:'#a78bfa' },
                                      { label:'⚡ Electronic', tag: 'electronic',  color:'#06b6d4' },
                                      { label:'🎤 Hip-Hop',    tag: 'hip-hop',     color:'#f59e0b' },
                                      { label:'🌿 Reggae',     tag: 'reggae',      color:'#10b981' },
                                      { label:'🌍 World',      tag: 'world',       color:'#f97316' },
                                      { label:'🏡 Ambient',    tag: 'ambient',     color:'#8b5cf6' },
                                    ];
                                    return (
                                      <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                                        {GENRE_PILLS.map((p, i) => {
                                          const isActive = p.tag === null ? rbSelectedTag === null : rbSelectedTag === p.tag;
                                          const activeColor = p.color || '#f59e0b';
                                          return (
                                            <button key={i} onClick={() => {
                                              setRbSelectedTag(p.tag); setRbQuery('');
                                              rbSearch('', p.tag);
                                              multiSearch('', p.tag);
                                            }}
                                              style={{ padding:'4px 10px', borderRadius:999, border:`1px solid ${isActive ? activeColor : 'rgba(255,255,255,0.1)'}`, background:isActive ? `${activeColor}22` : 'rgba(255,255,255,0.04)', color:isActive ? activeColor : 'rgba(255,255,255,0.45)', fontSize:10, cursor:'pointer', fontWeight: isActive ? 700 : 500, transition:'all 0.15s' }}>
                                              {p.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    );
                                  })()}
                                  {/* Loading */}
                                  {(rbLoading || multiLoading) && (
                                    <div style={{ textAlign:'center', padding:'20px 0', color:'rgba(255,255,255,0.35)', fontSize:11 }}>
                                      <div style={{ fontSize:20, marginBottom:6 }}>📡</div>
                                      Searching all sources…
                                    </div>
                                  )}
                                  {/* Error */}
                                  {rbError && (
                                    <div style={{ padding:'10px 12px', borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5', fontSize:10, marginBottom:8 }}>
                                      {rbError}
                                      <button onClick={() => { rbSearch(rbQuery, rbSelectedTag); }} style={{ display:'block', marginTop:6, padding:'3px 10px', borderRadius:999, border:'1px solid rgba(239,68,68,0.3)', background:'transparent', color:'#fca5a5', fontSize:10, cursor:'pointer' }}>↺ Coba Lagi</button>
                                    </div>
                                  )}
                                  {/* Combined Results — multiResults first, then rbResults */}
                                  {!rbLoading && !multiLoading && (multiResults.length > 0 || rbResults.length > 0) && (() => {
                                    // Merge: multiResults first (SomaFM, Icecast, NTS), then RadioBrowser results, deduped
                                    const multiIds = new Set(multiResults.map(s => s.id));
                                    const rbExtra = rbResults.filter(s => !multiIds.has(`soma_${s.stationuuid}`) && !multiIds.has(s.stationuuid));
                                    const allResults = [
                                      ...multiResults,
                                      ...rbExtra.map(s => ({ ...s, sourceLabel: 'RadioBrowser' })),
                                    ];
                                    return (
                                      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.22)', marginBottom:3 }}>
                                          {allResults.length} station(s) found
                                        </div>
                                        {allResults.map((station, idx) => {
                                          const stId = `rb_${station.stationuuid || station.id}`;
                                          const isActive = track.isRadio && track.id === stId;
                                          const srcColor = station.sourceLabel === 'SomaFM' ? '#10b981'
                                            : station.sourceLabel === 'NTS Radio' ? '#ff4500'
                                            : station.sourceLabel === 'Icecast' ? '#6366f1'
                                            : station.sourceLabel === 'Radio Paradise' ? '#8b5cf6'
                                            : station.sourceLabel === 'FM Stream' ? '#06b6d4'
                                            : station.sourceLabel === 'Shoutcast' ? '#e11d48'
                                            : station.sourceLabel === 'Radio Garden' ? '#22d3ee'
                                            : '#f59e0b';
                                          const sStatus = stationStatus[station.id || station.stationuuid];
                                          return (
                                            <div key={`${station.id}_${idx}`} onClick={() => playRbStation(station)}
                                              style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 9px', borderRadius:10, background: isActive ? `${srcColor}15` : 'rgba(255,255,255,0.04)', border:`1px solid ${isActive ? srcColor+'55' : sStatus==='fail' ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.07)'}`, cursor:'pointer' }}>
                                              <div style={{ width:32, height:32, borderRadius:7, overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>
                                                {(station.favicon||station.image) && (station.favicon||station.image).startsWith('http')
                                                  ? <img src={station.favicon||station.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none';}} />
                                                  : '📻'}
                                              </div>
                                              <div style={{ flex:1, minWidth:0 }}>
                                                <div style={{ fontSize:11, fontWeight:700, color: isActive ? srcColor : sStatus==='fail' ? 'rgba(255,255,255,0.4)' : 'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{station.name || station.title}</div>
                                                <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', display:'flex', gap:5, overflow:'hidden', alignItems:'center' }}>
                                                  <span style={{ color:srcColor, fontWeight:700, flexShrink:0 }}>● {station.sourceLabel}</span>
                                                  {station.country && <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{station.country}{station.tags ? ' · '+String(station.tags).split(',')[0] : ''}</span>}
                                                  {/* Status indicator */}
                                                  {sStatus === 'testing' && (
                                                    <span title="Checking connection…" style={{ display:'inline-flex', alignItems:'center', gap:2, color:'#fbbf24', flexShrink:0 }}>
                                                      <span style={{ width:5, height:5, borderRadius:'50%', border:'1.5px solid #fbbf24', borderTopColor:'transparent', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
                                                      <span style={{ fontSize:7 }}>cek…</span>
                                                    </span>
                                                  )}
                                                  {sStatus === 'ok' && <span title="Station active" style={{ color:'#4ade80', fontWeight:800, fontSize:8, flexShrink:0 }}>✓ aktif</span>}
                                                  {sStatus === 'fail' && <span title="Tidak dapat dijangkau" style={{ color:'#f87171', fontWeight:800, fontSize:8, flexShrink:0 }}>✕ offline</span>}
                                                </div>
                                              </div>
                                              <div style={{ width:26, height:26, borderRadius:'50%', background: isActive && playing ? srcColor : sStatus==='fail' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color: sStatus==='fail' ? '#f87171' : 'white', flexShrink:0 }}>
                                                {isActive && playing ? '⏸' : sStatus==='fail' ? '!' : '▶'}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  })()}
                                  {!rbLoading && !multiLoading && rbResults.length === 0 && multiResults.length === 0 && !rbError && (
                                    <div style={{ textAlign:'center', padding:'24px 10px', color:'rgba(255,255,255,0.22)', fontSize:11 }}>
                                      <div style={{ fontSize:24, marginBottom:8 }}>🔍</div>
                                      Type a station name, genre, or city<br/>then press Enter — or pick a genre pill above
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* ── KOLEKSI PANEL — SomaFM + Garden + Country */}
                              {rbMode === 'browse' && (
                              <div>
                              {/* Now playing bar — synced with main player */}
                              {radioStation && (
                                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:10, background:`${radioStation.color}18`, border:`1px solid ${radioStation.color}40`, marginBottom:10 }}>
                                  <div style={{ width:8, height:8, borderRadius:'50%', background: (playing && track.isRadio && track.id === `radio_${radioStation.id}`) ? radioStation.color : 'rgba(255,255,255,0.2)', boxShadow: (playing && track.isRadio && track.id === `radio_${radioStation.id}`) ? `0 0 8px ${radioStation.color}` : 'none', flexShrink:0 }}/>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontSize:11, fontWeight:700, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{radioStation.name}</div>
                                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>{radioStation.city} · ● LIVE</div>
                                  </div>
                                  <button onClick={() => setTab('player')}
                                    style={{ padding:'3px 8px', borderRadius:999, border:`1px solid ${radioStation.color}50`, background:`${radioStation.color}20`, color:radioStation.color, fontSize:10, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                                    Player ↗
                                  </button>
                                  <button onClick={() => {
                                    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
                                    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
                                    if (radioReconnectRef.current) { clearTimeout(radioReconnectRef.current); radioReconnectRef.current = null; }
                                    radioReconnectCount.current = 0; setStreamBuffering(false);
                                    setPlaying(false); setRadioStation(null); setRadioPlaying(false);
                                    setTrack(SONGS[0]);
                                  }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14, flexShrink:0, padding:0 }}>✕</button>
                                </div>
                              )}
                              {/* Breadcrumb nav */}
                              {(selCountry || selGenre) && (
                                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:8, flexWrap:'wrap' }}>
                                  <button onClick={() => { setRadioCountry(null); setRadioGenre(null); rbBrowseKeyRef.current=''; setRbBrowseStations([]); rbBrowseRef.current=[]; gardenBrowseKeyRef.current=''; setGardenBrowseStations([]); }}
                                    style={{ background:'none', border:'none', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontSize:10, padding:'2px 4px', borderRadius:4 }}>
                                    📻 Radio
                                  </button>
                                  {selCountry && (<>
                                    <span style={{ color:'rgba(255,255,255,0.2)', fontSize:10 }}>›</span>
                                    <button onClick={() => { setRadioGenre(null); rbBrowseKeyRef.current=''; setRbBrowseStations([]); rbBrowseRef.current=[]; gardenBrowseKeyRef.current=''; setGardenBrowseStations([]); }}
                                      style={{ background:'none', border:'none', color: selGenre ? 'rgba(255,255,255,0.45)' : selCountry.color, cursor:'pointer', fontSize:10, padding:'2px 4px', borderRadius:4, fontWeight: selGenre ? 400 : 700 }}>
                                      {selCountry.flag} {selCountry.name}
                                    </button>
                                  </>)}
                                  {selGenre && (<>
                                    <span style={{ color:'rgba(255,255,255,0.2)', fontSize:10 }}>›</span>
                                    <span style={{ color: selGenre.color, fontSize:10, fontWeight:700, padding:'2px 4px' }}>
                                      {selGenre.icon} {selGenre.name}
                                    </span>
                                  </>)}
                                </div>
                              )}




                              {/* Divider + Country Collection title */}
                              {!selCountry && (
                                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
                                  <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
                                  <span style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>📻 10 Negara · Koleksi</span>
                                  <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
                                </div>
                              )}

                              {/* LEVEL 1: Country list */}
                              {!selCountry && (
                                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                  {countries.map(country => (
                                    <div key={country.id} onClick={() => { setRadioCountry(country.id); setRadioGenre(null); }}
                                      style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:11, background:`${country.color}12`, border:`1px solid ${country.color}30`, cursor:'pointer' }}>
                                      <span style={{ fontSize:20, lineHeight:1, flexShrink:0 }}>{country.flag}</span>
                                      <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:12, fontWeight:700, color:'white' }}>{country.name}</div>
                                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>{country.genres.length} genre · Radio Browser + Garden</div>
                                      </div>
                                      <div style={{ display:'flex', gap:3, flexShrink:0 }}>
                                        {country.genres.slice(0,3).map(g=>(
                                          <span key={g.id} style={{ fontSize:11 }}>{g.icon}</span>
                                        ))}
                                      </div>
                                      <span style={{ color:'rgba(255,255,255,0.2)', fontSize:14 }}>›</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* LEVEL 2: Genre list */}
                              {selCountry && !selGenre && (
                                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                  {selCountry.genres.map(genre => (
                                    <div key={genre.id} onClick={() => { setRadioGenre(genre.id); gardenBrowseKeyRef.current=''; setGardenBrowseStations([]); }}
                                      style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:11, background:`${genre.color}12`, border:`1px solid ${genre.color}30`, cursor:'pointer' }}>
                                      <div style={{ width:34, height:34, borderRadius:9, background:`${genre.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                                        {genre.icon}
                                      </div>
                                      <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:12, fontWeight:700, color:'white' }}>{genre.name}</div>
                                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>📡 dari Radio Browser</div>
                                      </div>
                                      <span style={{ color:'rgba(255,255,255,0.2)', fontSize:14 }}>›</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* LEVEL 3: Station list — dari Radio Browser */}
                              {selCountry && selGenre && (() => {
                                // Trigger fetch dari Radio Browser jika belum / ganti genre
                                const key = `${selCountry.id}__${selGenre.id}`;
                                if (rbBrowseKeyRef.current !== key) {
                                  fetchBrowseStations(selCountry.id, selGenre.id);
                                }
                                return (
                                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                    {/* Loading indicator */}
                                    {rbBrowseLoading && (
                                      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:10, background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.18)' }}>
                                        <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid #f59e0b', borderTopColor:'transparent', animation:'spin 0.8s linear infinite', flexShrink:0 }}/>
                                        <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>Loading stations from Radio Browser…</span>
                                      </div>
                                    )}
                                    {/* Error state */}
                                    {rbBrowseError && !rbBrowseLoading && (
                                      <div style={{ textAlign:'center', padding:'16px 10px', borderRadius:10, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)' }}>
                                        <div style={{ fontSize:18, marginBottom:5 }}>📡</div>
                                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginBottom:8 }}>{rbBrowseError}</div>
                                        <button onClick={() => { rbBrowseKeyRef.current=''; fetchBrowseStations(selCountry.id, selGenre.id); }}
                                          style={{ padding:'4px 14px', borderRadius:999, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.12)', color:'#fca5a5', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                                          ↺ Coba Lagi
                                        </button>
                                      </div>
                                    )}
                                    {/* ── Stasiun Kurasi (hardcoded per negara/genre) */}
                                    {selGenre.stations && selGenre.stations.length > 0 && (() => {
                                      // Trigger health check untuk stasiun kurasi
                                      const curatedKey = `curated__${selCountry.id}__${selGenre.id}`;
                                      if (!testedGenresRef.current.has(curatedKey)) {
                                        testStationsInGenre({ id: curatedKey, stations: selGenre.stations });
                                      }
                                      return (
                                        <div style={{ marginBottom:6 }}>
                                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, paddingLeft:2 }}>
                                            <span style={{ fontSize:9, fontWeight:800, color: selGenre.color || '#f59e0b', textTransform:'uppercase', letterSpacing:'0.07em' }}>⭐ Curated Picks</span>
                                            <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.06)' }}/>
                                          </div>
                                          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                                            {selGenre.stations.map((station, idx) => {
                                              const isActive = radioStation?.id === station.id || (track.isRadio && track.id === `radio_${station.id}`);
                                              const stationColor = selGenre.color || '#f59e0b';
                                              const sStatus = stationStatus[station.id];
                                              return (
                                                <div key={station.id}
                                                  onClick={() => {
                                                    const radioTrackObj = {
                                                      id: `radio_${station.id}`,
                                                      title: station.name,
                                                      artist: station.city + ' · Live Radio',
                                                      album: 'Live Radio',
                                                      cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
                                                      src: radioUrl(station.url),
                                                      color: stationColor,
                                                      bg: `rgba(245,158,11,0.15)`,
                                                      mood: 'live, radio',
                                                      isRadio: true,
                                                    };
                                                    if (track.id === radioTrackObj.id) {
                                                      setPlaying(p=>!p); setRadioPlaying(p=>!p);
                                                    } else {
                                                      if (embedTrack?.type === 'youtube') { closeEmbed(); }
                                                      // Perbarui antrean navigasi: kurasi + RB + Garden gabungan
                                                      rbBrowseRef.current = [...(selGenre.stations || []), ...rbBrowseStations, ...gardenBrowseStations];
                                                      play(radioTrackObj);
                                                      setRadioStation({ ...station, color: stationColor, countryId: selCountry.id, genreId: selGenre.id });
                                                      setRadioPlaying(true);
                                                    }
                                                  }}
                                                  style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background: isActive ? `${stationColor}20` : 'rgba(255,255,255,0.04)', border:`1px solid ${isActive ? stationColor+'55' : sStatus==='fail' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.07)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                                                  {/* Nomor / favicon placeholder */}
                                                  <div style={{ width:32, height:32, borderRadius:8, background:`${stationColor}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                    <span style={{ fontSize:12 }}>{selGenre.icon}</span>
                                                  </div>
                                                  <div style={{ flex:1, minWidth:0 }}>
                                                    <div style={{ fontSize:12, fontWeight:700, color: isActive ? stationColor : sStatus==='fail' ? 'rgba(255,255,255,0.4)' : 'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{station.name}</div>
                                                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:4 }}>
                                                      <span>{station.city}</span>
                                                      <span style={{ color: stationColor, fontWeight:700 }}>● Kurasi</span>
                                                      {sStatus === 'testing' && (
                                                        <span style={{ display:'inline-flex', alignItems:'center', gap:2, color:'#fbbf24' }}>
                                                          <span style={{ width:5, height:5, borderRadius:'50%', border:'1.5px solid #fbbf24', borderTopColor:'transparent', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
                                                          <span style={{ fontSize:7 }}>cek…</span>
                                                        </span>
                                                      )}
                                                      {sStatus === 'ok' && <span style={{ color:'#4ade80', fontWeight:800, fontSize:7 }}>✓ aktif</span>}
                                                      {sStatus === 'fail' && <span style={{ color:'#f87171', fontWeight:800, fontSize:7 }}>✕ offline</span>}
                                                    </div>
                                                  </div>
                                                  <div style={{ width:26, height:26, borderRadius:'50%', background: isActive && (playing && track.isRadio) ? stationColor : sStatus==='fail' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color: sStatus==='fail' ? '#f87171' : 'white', flexShrink:0 }}>
                                                    {isActive && (playing && track.isRadio) ? '⏸' : sStatus==='fail' ? '!' : '▶'}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                          {/* Divider sebelum Radio Browser results */}
                                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, marginBottom:4 }}>
                                            <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.06)' }}/>
                                            <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.22)', textTransform:'uppercase', letterSpacing:'0.07em' }}>📡 Radio Browser</span>
                                            <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.06)' }}/>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                    {/* Station list */}
                                    {!rbBrowseLoading && rbBrowseStations.map((station, idx) => {
                                      const isActive = radioStation?.id === station.id;
                                      const stationColor = selGenre.color || '#f59e0b';
                                      return (
                                        <div key={station.id}
                                          onClick={() => {
                                            const radioTrackObj = {
                                              id: `radio_${station.id}`,
                                              title: station.name,
                                              artist: station.city + ' · Live Radio',
                                              album: 'Live Radio',
                                              cover: station.favicon || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
                                              src: radioUrl(station.url),
                                              color: stationColor,
                                              bg: `rgba(245,158,11,0.15)`,
                                              mood: 'live, radio',
                                              isRadio: true,
                                            };
                                            if (track.id === radioTrackObj.id) {
                                              setPlaying(p=>!p); setRadioPlaying(p=>!p);
                                            } else {
                                              if (embedTrack?.type === 'youtube') { closeEmbed(); }
                                              // Perbarui antrean navigasi: kurasi + RB + Garden gabungan
                                              rbBrowseRef.current = [...(selGenre?.stations || []), ...rbBrowseStations, ...gardenBrowseStations];
                                              play(radioTrackObj);
                                              setRadioStation({ ...station, color: stationColor, countryId: selCountry.id, genreId: selGenre.id });
                                              setRadioPlaying(true);
                                            }
                                            // click to count in Radio Browser
                                            if (station.stationuuid) {
                                              getRbServer().then(base=>fetch(`${base}/json/url/${station.stationuuid}`).catch(()=>{}));
                                            }
                                          }}
                                          style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background: isActive ? `${stationColor}20` : 'rgba(255,255,255,0.04)', border:`1px solid ${isActive ? stationColor+'55' : 'rgba(255,255,255,0.07)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                                          {/* Favicon or number */}
                                          <div style={{ width:32, height:32, borderRadius:8, background:`${stationColor}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                                            {station.favicon
                                              ? <img src={station.favicon} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none';}}/>
                                              : <span style={{ fontSize:9, fontWeight:800, color: isActive ? stationColor : 'rgba(255,255,255,0.3)' }}>#{idx+1}</span>
                                            }
                                          </div>
                                          <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ fontSize:12, fontWeight:700, color: isActive ? stationColor : 'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{station.name}</div>
                                            <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:4 }}>
                                              <span>{station.city}</span>
                                              <span style={{ color:'#4ade80', fontWeight:700 }}>● RB</span>
                                              {station.votes > 0 && <span>· {station.votes} votes</span>}
                                              {/* Health check indicator */}
                                              {stationStatus[station.id] === 'testing' && (
                                                <span title="Checking connection…" style={{ display:'inline-flex', alignItems:'center', gap:2, color:'#fbbf24' }}>
                                                  <span style={{ width:6, height:6, borderRadius:'50%', border:'1.5px solid #fbbf24', borderTopColor:'transparent', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
                                                  <span style={{ fontSize:8 }}>cek…</span>
                                                </span>
                                              )}
                                              {stationStatus[station.id] === 'ok' && (
                                                <span title="Station active & playable" style={{ color:'#4ade80', fontWeight:700, fontSize:8 }}>✓ aktif</span>
                                              )}
                                              {stationStatus[station.id] === 'fail' && (
                                                <span title="Station unreachable" style={{ color:'#f87171', fontWeight:700, fontSize:8 }}>✕ offline</span>
                                              )}
                                            </div>
                                          </div>
                                          <div style={{ width:26, height:26, borderRadius:'50%', background: isActive && (playing && track.isRadio) ? stationColor : stationStatus[station.id]==='fail' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color: stationStatus[station.id]==='fail' ? '#f87171' : 'white', flexShrink:0 }}>
                                            {isActive && (playing && track.isRadio) ? '⏸' : stationStatus[station.id]==='fail' ? '!' : '▶'}
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {/* Empty after fetch */}
                                    {!rbBrowseLoading && !rbBrowseError && rbBrowseStations.length === 0 && (
                                      <div style={{ textAlign:'center', padding:'20px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                                        <div style={{ fontSize:20, marginBottom:6 }}>📻</div>
                                        <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.35)' }}>No stations found</div>
                                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:4 }}>Radio Browser unavailable. tidak punya stasiun untuk genre ini di negara ini</div>
                                      </div>
                                    )}
                                    {/* Footer info */}
                                    {!rbBrowseLoading && rbBrowseStations.length > 0 && (
                                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.18)', paddingLeft:2, marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
                                        <span>📡 {rbBrowseStations.length} station(s) · source: Radio Browser</span>
                                        <button onClick={() => { rbBrowseKeyRef.current=''; fetchBrowseStations(selCountry.id, selGenre.id); }}
                                          style={{ background:'none', border:'none', color:'rgba(255,255,255,0.25)', cursor:'pointer', fontSize:9, padding:'0 4px' }}>↺ refresh</button>
                                      </div>
                                    )}

                                    {/* ── RADIO GARDEN SECTION */}
                                    {(() => {
                                      // Trigger fetch saat masuk genre, gunakan key country+genre
                                      const gardenKey = selGenre ? `${selCountry.id}__${selGenre.id}` : selCountry.id;
                                      if (gardenBrowseKeyRef.current !== gardenKey) {
                                        fetchGardenByCountry(selCountry.id, selGenre?.id);
                                      }
                                      return (
                                        <>
                                          {/* Divider */}
                                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, marginBottom:6 }}>
                                            <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.06)' }}/>
                                            <span style={{ fontSize:9, fontWeight:700, color:'#22d3ee', textTransform:'uppercase', letterSpacing:'0.07em' }}>🌍 Radio Garden</span>
                                            <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.06)' }}/>
                                          </div>
                                          {/* Loading */}
                                          {gardenBrowseLoading && (
                                            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:10, background:'rgba(34,211,238,0.06)', border:'1px solid rgba(34,211,238,0.15)' }}>
                                              <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid #22d3ee', borderTopColor:'transparent', animation:'spin 0.8s linear infinite', flexShrink:0 }}/>
                                              <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>Loading stations from Radio Garden…</span>
                                            </div>
                                          )}
                                          {/* Error */}
                                          {gardenBrowseError && !gardenBrowseLoading && (
                                            <div style={{ textAlign:'center', padding:'12px 10px', borderRadius:10, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)' }}>
                                              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>{gardenBrowseError}</div>
                                              <button onClick={() => { gardenBrowseKeyRef.current=''; fetchGardenByCountry(selCountry.id, selGenre?.id); }}
                                                style={{ padding:'4px 14px', borderRadius:999, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.12)', color:'#fca5a5', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                                                ↺ Coba Lagi
                                              </button>
                                            </div>
                                          )}
                                          {/* Station list */}
                                          {!gardenBrowseLoading && gardenBrowseStations.map((station, idx) => {
                                            const isActive = track.isRadio && track.id === station.id;
                                            const stationColor = '#22d3ee';
                                            const sStatus = stationStatus[station.id];
                                            return (
                                              <div key={station.id}
                                                onClick={() => {
                                                  const radioTrackObj = {
                                                    id: station.id,
                                                    title: station.name,
                                                    artist: station.city + ' · Radio Garden',
                                                    album: 'Live Radio',
                                                    cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
                                                    src: radioUrl(station.url),
                                                    color: stationColor,
                                                    bg: 'rgba(34,211,238,0.12)',
                                                    mood: 'live, radio',
                                                    isRadio: true,
                                                  };
                                                  if (track.id === station.id) {
                                                    setPlaying(p=>!p); setRadioPlaying(p=>!p);
                                                  } else {
                                                    if (embedTrack?.type === 'youtube') { closeEmbed(); }
                                                    // Perbarui antrean navigasi: kurasi + RB + Garden gabungan
                                                    rbBrowseRef.current = [...(selGenre?.stations || []), ...rbBrowseStations, ...gardenBrowseStations];
                                                    play(radioTrackObj);
                                                    setRadioStation({ id: station.id, name: station.name, city: station.city, color: stationColor, countryId: selCountry.id, genreId: selGenre.id });
                                                    setRadioPlaying(true);
                                                  }
                                                }}
                                                style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background: isActive ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.04)', border:`1px solid ${isActive ? 'rgba(34,211,238,0.45)' : sStatus==='fail' ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.07)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                                                <div style={{ width:32, height:32, borderRadius:8, background:'rgba(34,211,238,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                  <span style={{ fontSize:9, fontWeight:800, color: isActive ? '#22d3ee' : 'rgba(255,255,255,0.3)' }}>#{idx+1}</span>
                                                </div>
                                                <div style={{ flex:1, minWidth:0 }}>
                                                  <div style={{ fontSize:12, fontWeight:700, color: isActive ? '#22d3ee' : sStatus==='fail' ? 'rgba(255,255,255,0.4)' : 'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{station.name}</div>
                                                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:4 }}>
                                                    <span>{station.city}</span>
                                                    {station.genre && <span style={{ color:'rgba(255,255,255,0.25)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:80 }}>{station.genre}</span>}
                                                    <span style={{ color:'#22d3ee', fontWeight:700 }}>● Garden</span>
                                                    {sStatus === 'testing' && (
                                                      <span style={{ display:'inline-flex', alignItems:'center', gap:2, color:'#fbbf24' }}>
                                                        <span style={{ width:5, height:5, borderRadius:'50%', border:'1.5px solid #fbbf24', borderTopColor:'transparent', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
                                                        <span style={{ fontSize:7 }}>cek…</span>
                                                      </span>
                                                    )}
                                                    {sStatus === 'ok' && <span style={{ color:'#4ade80', fontWeight:700, fontSize:8 }}>✓ aktif</span>}
                                                    {sStatus === 'fail' && <span style={{ color:'#f87171', fontWeight:700, fontSize:8 }}>✕ offline</span>}
                                                  </div>
                                                </div>
                                                <div style={{ width:26, height:26, borderRadius:'50%', background: isActive && (playing && track.isRadio) ? '#22d3ee' : sStatus==='fail' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color: isActive && playing ? '#000' : sStatus==='fail' ? '#f87171' : 'white', flexShrink:0 }}>
                                                  {isActive && (playing && track.isRadio) ? '⏸' : sStatus==='fail' ? '!' : '▶'}
                                                </div>
                                              </div>
                                            );
                                          })}
                                          {/* Empty */}
                                          {!gardenBrowseLoading && !gardenBrowseError && gardenBrowseStations.length === 0 && (
                                            <div style={{ textAlign:'center', padding:'14px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                                              <div style={{ fontSize:18, marginBottom:4 }}>🌍</div>
                                              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>No Radio Garden untuk genre ini di negara ini</div>
                                            </div>
                                          )}
                                          {/* Footer */}
                                          {!gardenBrowseLoading && gardenBrowseStations.length > 0 && (
                                            <div style={{ fontSize:9, color:'rgba(255,255,255,0.18)', paddingLeft:2, marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
                                              <span>🌍 {gardenBrowseStations.length} station(s) · source: Radio Garden</span>
                                              <button onClick={() => { gardenBrowseKeyRef.current=''; fetchGardenByCountry(selCountry.id, selGenre?.id); }}
                                                style={{ background:'none', border:'none', color:'rgba(255,255,255,0.25)', cursor:'pointer', fontSize:9, padding:'0 4px' }}>↺ refresh</button>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                );
                              })()}

                              <div style={{ marginTop:8, fontSize:9, color:'rgba(255,255,255,0.18)', paddingLeft:2 }}>
                                {!selCountry ? 'Select a country to view genres & stations' : !selGenre ? 'Select a genre to view stations' : 'Select a station to play'}
                              </div>
                            </div>
                            )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─── PLAYLIST TAB */}
        {tab==='playlist'&&(
          <div style={{ height:'100%', display:'flex', flexDirection:'column', position:'relative' }}>

            {/* ── Playlist list view */}
            {plView==='list'&&(
              <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:'14px 16px 0' }}>
                {/* Header — same style as Stream tab */}
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                    <div style={{ fontWeight:800, fontSize:15 }}>{t?.musicCollection||'Music Collection'}</div>
                    <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:999, background:'rgba(99,102,241,0.18)', color:'#a78bfa', letterSpacing:'0.04em' }}>{allSongs.length} {t?.songsCount||'lagu'}</span>
                  </div>
                  {/* Quick action bar */}
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>{ setEditingPl(null); setPlView('form'); }}
                      style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', borderRadius:10, border:'1.5px solid rgba(99,102,241,0.4)', background:'rgba(99,102,241,0.12)', color:'#a78bfa', fontSize:11, fontWeight:700, cursor:'pointer' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.22)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.12)'; }}>
                      <ListPlus size={13}/>{t?.createPlaylistBtn||'Playlist Baru'}
                    </button>
                    {!googleUser && (
                      <button onClick={handleGoogleLogin}
                        style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', borderRadius:10, border:'1.5px solid rgba(14,165,233,0.3)', background:'rgba(14,165,233,0.08)', color:'#38bdf8', fontSize:11, fontWeight:700, cursor:'pointer' }}
                        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(14,165,233,0.16)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background='rgba(14,165,233,0.08)'; }}>
                        <LogIn size={13}/>{t?.loginForSongs||'Google Drive'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, paddingBottom:16 }}>

                  {/* ── KOLEKSI section — same look as Stream platform cards */}
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:7 }}>{t?.musicCollection||'Koleksi'}</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>

                      {/* All Songs card */}
                      <div style={{ borderRadius:14, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.22)', overflow:'hidden' }}>
                        <div onClick={()=>{ setActivePl('all_songs'); setPlView('detail'); }}
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px 8px', cursor:'pointer' }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.12)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <div style={{ width:38, height:38, borderRadius:10, background:'rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <ListMusic size={20} style={{color:'#a78bfa'}}/>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontWeight:700, fontSize:13, color:'white' }}>{t?.allSongs||'All Songs'}</span>
                              <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:'rgba(99,102,241,0.25)', color:'#a78bfa' }}>LOCAL</span>
                            </div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{allSongs.length} {t?.songsAvailable||'lagu tersedia'}</div>
                          </div>
                          <ChevronRight size={15} style={{color:'rgba(255,255,255,0.25)'}}/>
                        </div>
                        <div style={{ display:'flex', borderTop:'1px solid rgba(99,102,241,0.12)' }}>
                          <button onClick={()=>{ activePlRef.current=allSongs; if(allSongs[0]) play(allSongs[0]); setTab('player'); }}
                            style={{ flex:1, padding:'7px 0', background:'none', border:'none', color:'#a78bfa', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                            <Play size={11} fill="currentColor"/>Play All
                          </button>
                        </div>
                      </div>

                      {/* My Songs / Drive card */}
                      {(googleUser||customSongs.length>0)&&(
                        <div style={{ borderRadius:14, background:'rgba(14,165,233,0.06)', border:'1px solid rgba(14,165,233,0.2)', overflow:'hidden' }}>
                          <div onClick={()=>{ setActivePl('my_songs'); setPlView('detail'); }}
                            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px 8px', cursor:'pointer' }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(14,165,233,0.1)'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            <div style={{ width:38, height:38, borderRadius:10, background:'rgba(14,165,233,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Cloud size={20} style={{color:'#38bdf8'}}/>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <span style={{ fontWeight:700, fontSize:13, color:'white' }}>{t?.mySongs||'My Songs'}</span>
                                <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:'rgba(14,165,233,0.2)', color:'#38bdf8' }}>DRIVE</span>
                              </div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>
                                {loadingDrive ? t?.loadingDriveShort||'Loading…' : `${customSongs.length} ${t?.songsFromDrive||'dari Google Drive'}`}
                              </div>
                            </div>
                            {loadingDrive
                              ? <Loader2 size={14} style={{ color:'#38bdf8', animation:'spin 1s linear infinite', flexShrink:0 }}/>
                              : <ChevronRight size={15} style={{color:'rgba(255,255,255,0.25)', flexShrink:0}}/>
                            }
                          </div>
                          <div style={{ display:'flex', borderTop:'1px solid rgba(14,165,233,0.1)' }}>
                            {customSongs.length>0&&<button onClick={()=>{ activePlRef.current=customSongs; play(customSongs[0]); setTab('player'); }}
                              style={{ flex:1, padding:'7px 0', background:'none', border:'none', color:'#38bdf8', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                              <Play size={11} fill="currentColor"/>Play
                            </button>}
                            {googleUser&&<button onClick={()=>loadDriveSongs(tokenRef.current, true)}
                              style={{ flex:1, padding:'7px 0', background:'none', border:'none', borderLeft: customSongs.length>0?'1px solid rgba(14,165,233,0.1)':'none', color:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                              ↺ Refresh
                            </button>}
                          </div>
                        </div>
                      )}

                      {/* Recently Played card */}
                      {history.length>1&&(
                        <div style={{ borderRadius:14, background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.18)', overflow:'hidden' }}>
                          <div onClick={()=>{ setActivePl('recently_played'); setPlView('detail'); }}
                            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px 8px', cursor:'pointer' }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(245,158,11,0.1)'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            <div style={{ width:38, height:38, borderRadius:10, background:'rgba(245,158,11,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <History size={20} style={{color:'#fbbf24'}}/>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <span style={{ fontWeight:700, fontSize:13, color:'white' }}>{t?.recentlyPlayed||'Recently Played'}</span>
                                <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:'rgba(245,158,11,0.2)', color:'#fbbf24' }}>● HISTORY</span>
                              </div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{Math.max(0,history.length-1)} {t?.lastSongs||'lagu terakhir dimainkan'}</div>
                            </div>
                            <ChevronRight size={15} style={{color:'rgba(255,255,255,0.25)'}}/>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* ── YOUR PLAYLISTS section */}
                  <div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.15em' }}>{t?.myPlaylists||'Your Playlists'}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)' }}>{playlists.length}</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {playlists.map(pl => {
                        const songs = allSongs.filter(s=>pl.songIds.includes(s.id));
                        const isActivePl = activePl===pl.id;
                        const covers = songs.slice(0,4).map(s=>s.cover).filter(Boolean);
                        return (
                          <div key={pl.id} style={{ borderRadius:14, background: isActivePl?'rgba(99,102,241,0.12)':'rgba(255,255,255,0.03)', border:`1px solid ${isActivePl?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.08)'}`, overflow:'hidden' }}>
                            <div onClick={()=>{ setActivePl(pl.id); setPlView('detail'); }}
                              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px 8px', cursor:'pointer' }}
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                              <div style={{ width:38, height:38, borderRadius:10, overflow:'hidden', flexShrink:0, display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(99,102,241,0.15)' }}>
                                {covers.length>0 ? covers.slice(0,4).map((c,idx)=>(
                                  <img key={idx} src={c} style={{ width:'100%', height:'100%', objectFit:'cover', display: covers.length===1&&idx>0?'none':covers.length===2&&idx>1?'none':covers.length===3&&idx===3?'none':'block' }}/>
                                )) : <Music size={16} style={{color:'#a78bfa',margin:'auto',gridColumn:'span 2'}}/>}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'white' }}>{pl.name}</div>
                                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{songs.length} {t?.songsCount||'lagu'}</div>
                              </div>
                              <ChevronRight size={15} style={{color:'rgba(255,255,255,0.25)'}}/>
                            </div>
                            <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                              {songs.length>0&&(
                                <button onClick={()=>{ setActivePl(pl.id); activePlRef.current=songs; play(songs[0]); setTab('player'); }}
                                  style={{ flex:1, padding:'7px 0', background:'none', border:'none', color: isActivePl?'#a78bfa':'rgba(255,255,255,0.45)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                                  <Play size={11} fill="currentColor"/>{t?.playBtn||'Play'}
                                </button>
                              )}
                              <button onClick={()=>{ setEditingPl(pl); setPlView('form'); }}
                                style={{ flex:1, padding:'7px 0', background:'none', border:'none', borderLeft:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                                <PenLine size={11}/>{t?.editBtn||'Edit'}
                              </button>

                            </div>
                          </div>
                        );
                      })}
                      {playlists.length===0&&(
                        <div style={{ textAlign:'center', padding:'32px 20px', borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.1)' }}>
                          <FolderOpen size={40} style={{color:'rgba(255,255,255,0.1)',display:'block',margin:'0 auto 10px'}}/>
                          <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.3)' }}>{t?.noPlaylistYet||'No playlists yet'}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.18)', marginTop:4 }}>{t?.createFirstPlaylist||'Tap "Playlist Baru" untuk mulai'}</div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}


            {/* ── Playlist FORM view — overlay seperti queue/share */}
            {plView==='form'&&(
              <div style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'stretch' }}>
                <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'#0d0d24' }}>
                  <Suspense fallback={<Spinner/>}><PlaylistFormView
                    editingPl={editingPl}
                    allSongs={allSongs}
                    lang={lang}
                    isLite={isLite}
                    t={t}
                    setPlaylists={setPlaylists}
                    setEditingPl={setEditingPl}
                    setPlView={setPlView}
                    deletePlaylist={deletePlaylist}
                  /></Suspense>
                </div>
              </div>
            )}

            {/* ── Playlist detail view */}
            {plView==='detail'&&activePl&&(
              <Suspense fallback={<Spinner/>}><PlaylistErrorBoundary onBack={()=>{ setActivePl(null); setPlView('list'); }}>
                {(()=>{
              // ── Special: Lagu Saya (Drive)
              if (activePl === 'my_songs') {
                const songs = filteredCustom;
                return (
                  <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(7,7,26,0.97)', ...(isLite ? {} : { backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }) }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <button onClick={()=>{ setActivePl(null); setPlView('list'); }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4, display:'flex' }}>
                          <ChevronLeft size={20}/>
                        </button>
                        <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,rgba(14,165,233,0.35),rgba(99,102,241,0.35))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Cloud size={18} style={{color:'#38bdf8'}}/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:800, fontSize:15 }}>{t?.mySongs||'My Songs'}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{customSongs.length} {t?.songsFromDrive||'songs from Google Drive'}</div>
                        </div>
                        <button
                          onClick={()=>setMySongsEditMode(v=>!v)}
                          style={{ background: mySongsEditMode ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)', border: mySongsEditMode ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.12)', cursor:'pointer', color: mySongsEditMode ? '#f87171' : 'rgba(255,255,255,0.55)', fontSize:12, padding:'5px 10px', borderRadius:8, fontWeight:700, display:'flex', alignItems:'center', gap:5, transition:'all 0.2s' }}
                        >
                          <PenLine size={12}/> {mySongsEditMode ? (lang==='id'?'Selesai':'Done') : (t?.editBtn||'Edit')}
                        </button>
                        {googleUser&&(
                          <button onClick={()=>loadDriveSongs(tokenRef.current, true)}
                            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', color:'rgba(255,255,255,0.55)', fontSize:12, padding:'5px 10px', borderRadius:8, fontWeight:700 }}>
                            ↺ Refresh
                          </button>
                        )}
                      </div>
                      {googleUser && (
                        <button onClick={()=>setShowUpload(true)} style={{ marginTop:10, width:'100%', padding:'8px 0', borderRadius:10, background:'rgba(14,165,233,0.12)', border:'1px solid rgba(14,165,233,0.25)', color:'#38bdf8', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                          <Plus size={14}/> {t?.uploadToDrive||'Upload to Google Drive'}
                        </button>
                      )}
                    </div>
                    <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'10px 16px 16px', display:'flex', flexDirection:'column', gap:5 }}>
                      {loadingDrive&&<div style={{ textAlign:'center', padding:'32px 0' }}><Loader2 size={28} style={{ color:'#38bdf8', animation:'spin 1s linear infinite', margin:'0 auto', display:'block' }}/><div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:8 }}>{t?.loadingDriveShort||'Loading from Drive…'}</div></div>}
                      {!loadingDrive&&songs.length===0&&(
                        <div style={{ textAlign:'center', padding:'32px 20px' }}>
                          <Cloud size={44} style={{color:'rgba(255,255,255,0.1)',display:'block',margin:'0 auto 14px'}}/>
                          {googleUser ? (
                            <>
                              <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>No songs file audio ditemukan</div>
                              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', lineHeight:1.7, marginBottom:16 }}>
                                Drive kamu tidak memiliki file audio yang terdeteksi.<br/>
                                Pastikan file berekstensi <span style={{color:'#38bdf8'}}>.mp3 .m4a .flac .wav .ogg</span><br/>
                                di folder mana pun di Google Drive kamu.
                              </div>
                              <button onClick={()=>loadDriveSongs(tokenRef.current, true)}
                                style={{ padding:'8px 18px', borderRadius:999, border:'1px solid rgba(56,189,248,0.35)', background:'rgba(14,165,233,0.12)', color:'#38bdf8', fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
                                ↺ Coba Refresh
                              </button>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:4 }}>
                                {t?.orUploadHint||'Or tap "Upload Song to Drive" above to add songs'}
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>{t?.loginForSongs||'Sign in with Google to see songs'}</div>
                          )}
                        </div>
                      )}
                      {songs.map((s,i)=><SongRow key={s.id} s={s} i={i} track={track} playing={playing} liked={liked} setLiked={setLiked} toggleFav={toggleFav} play={play} isDrive isCached={cachedDriveIds.has(s.driveId)} onRemove={mySongsEditMode ? id=>{
                          setCustomSongs(p=>p.filter(x=>x.id!==id));
                          setPlaylists(p=>p.map(pl=>({ ...pl, songIds: pl.songIds.filter(sid=>sid!==id) })));
                          setLiked(l=>{ const n={...l}; delete n[id]; return n; });
                          setFavSongs(p=>p.filter(s=>s.id!==id));
                          if(activePlRef.current) activePlRef.current=activePlRef.current.filter(s=>s.id!==id);
                        } : null} playlists={playlists} addToPlaylist={addToPlaylist} isLite={isLite} t={t}
                        onDownload={async(s)=>{ if(s.driveId&&tokenRef.current){ await downloadToDevice(`https://www.googleapis.com/drive/v3/files/${s.driveId}?alt=media&acknowledgeAbuse=true`,`${s.title} - ${s.artist}.mp3`,{Authorization:`Bearer ${tokenRef.current}`}); } else if(s.src){ const raw=s.src.split('?')[0]; const ext=raw.includes('.')?raw.split('.').pop():'mp3'; await downloadToDevice(s.src,`${s.title} - ${s.artist}.${ext}`); } }}
                      />)}
                    </div>
                  </div>
                );
              }

              // ── Special: Baru Dimainkan
              if (activePl === 'recently_played') {
                const songs = history.slice(1);
                return (
                  <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(7,7,26,0.97)', ...(isLite ? {} : { backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }) }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <button onClick={()=>{ setActivePl(null); setPlView('list'); }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4, display:'flex' }}>
                          <ChevronLeft size={20}/>
                        </button>
                        <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,rgba(245,158,11,0.35),rgba(239,68,68,0.25))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <History size={18} style={{color:'#fbbf24'}}/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:800, fontSize:15 }}>{t?.recentlyPlayed||'Recently Played'}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{songs.length} {t?.lastSongs||'recent songs'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'10px 16px 16px', display:'flex', flexDirection:'column', gap:5 }}>
                      {songs.length===0&&(
                        <div style={{ textAlign:'center', padding:'40px 20px' }}>
                          <History size={44} style={{color:'rgba(255,255,255,0.1)',display:'block',margin:'0 auto 12px'}}/>
                          <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>{t?.noHistory||'No playback history yet'}</div>
                        </div>
                      )}
                      {songs.map((s,i)=>(
                        <div key={`rp-${s.id}-${i}`} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:12, background:track.id===s.id?s.bg:'rgba(255,255,255,0.02)', border:`1px solid ${track.id===s.id?s.color+'50':'rgba(255,255,255,0.06)'}` }}>
                          <div style={{ width:26, height:26, borderRadius:6, background:'rgba(245,158,11,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <span style={{ fontSize:10, fontWeight:700, color:'#fbbf24' }}>{i+1}</span>
                          </div>
                          {isLite
                            ? <div style={{ width:36, height:36, borderRadius:8, background:s.bg||'rgba(255,255,255,0.07)', flexShrink:0 }}/>
                            : <img src={s.cover} loading="lazy" decoding="async" style={{ width:36, height:36, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:track.id===s.id?s.color:'rgba(255,255,255,0.85)' }}>{s.title}</div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.artist}</div>
                          </div>
                          <div style={{ width:7, height:7, borderRadius:'50%', background:s.color, boxShadow:`0 0 5px ${s.color}`, flexShrink:0 }}/>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // ── Special: Semua Lagu
              if (activePl === 'all_songs') {
                const songs = filteredSongs;
                return (
                  <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(7,7,26,0.97)', ...(isLite ? {} : { backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }) }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <button onClick={()=>{ setActivePl(null); setPlView('list'); }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4, display:'flex' }}>
                          <ChevronLeft size={20}/>
                        </button>
                        <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(168,85,247,0.35))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <ListMusic size={18} style={{color:'#a78bfa'}}/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:800, fontSize:15 }}>{t?.allSongs||'All Songs'}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{songs.length} {t?.songsCount||'songs'}</div>
                        </div>
                        {songs.length>0&&(
                          <button onClick={()=>{ activePlRef.current=songs; play(songs[0]); setTab('player'); }}
                            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, border:'none', background:'#a78bfa', color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                            <Play size={13} fill="currentColor"/>{t?.playAllBtn||'Play All'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'10px 16px 16px', display:'flex', flexDirection:'column', gap:5 }}>
                      {songs.map((s,i)=><SongRow key={s.id} s={s} i={i} track={track} playing={playing} liked={liked} setLiked={setLiked} toggleFav={toggleFav} play={play} isDrive={s.isDrive} playlists={playlists} addToPlaylist={addToPlaylist} isLite={isLite} t={t}
                      onDownload={async(s)=>{ if(s.isDrive&&s.driveId&&tokenRef.current){ await downloadToDevice(`https://www.googleapis.com/drive/v3/files/${s.driveId}?alt=media&acknowledgeAbuse=true`,`${s.title} - ${s.artist}.mp3`,{Authorization:`Bearer ${tokenRef.current}`}); } else if(s.src){ const raw=s.src.split('?')[0]; const ext=raw.includes('.')?raw.split('.').pop():'mp3'; await downloadToDevice(s.src,`${s.title} - ${s.artist}.${ext}`); } }}
                    />)}
                    </div>
                  </div>
                );
              }

              const pl = playlists.find(p=>p.id===activePl);
              if (!pl) return null;
              const songs = allSongs.filter(s=>pl.songIds.includes(s.id));
              return (
                <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                  {/* Header */}
                  <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(7,7,26,0.97)', ...(isLite ? {} : { backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }) }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <button onClick={()=>setPlView('list')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4, display:'flex' }}>
                        <ChevronLeft size={20}/>
                      </button>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:800, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pl.name}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{songs.length} {t?.songsCount||'songs'}</div>
                      </div>
                      <button onClick={()=>{ setEditingPl(pl); setPlView('form'); }}
                        style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:700, padding:'5px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                        <PenLine size={12}/>{t?.editBtn||'Edit'}
                      </button>
                      {songs.length>0&&(
                        <button onClick={()=>{ activePlRef.current=songs; play(songs[0]); setTab('player'); }}
                          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, border:'none', background:track.color, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                          <Play size={13} fill="currentColor"/>{t?.playAllBtn||'Play All'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Songs */}
                  <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'10px 16px 16px', display:'flex', flexDirection:'column', gap:5 }}>
                    {songs.length===0&&(
                      <div style={{ textAlign:'center', padding:'40px 20px' }}>
                        <Music size={44} style={{color:'rgba(255,255,255,0.1)',display:'block',margin:'0 auto 12px'}}/>
                        <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>{lang==='id'?'Playlist ini masih kosong':'This playlist is empty'}</div>
                        <button onClick={()=>{ setEditingPl(pl); setPlView('form'); }} style={{ marginTop:12, padding:'8px 16px', borderRadius:10, border:'none', background:'rgba(99,102,241,0.2)', color:'#a78bfa', fontSize:12, fontWeight:700, cursor:'pointer' }}>{t?.addSong||'Add Song'}</button>
                      </div>
                    )}
                    {songs.map((s,i)=>{
                      const isActive = track.id===s.id;
                      return (
                        <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:12, cursor:'pointer', background:isActive?s.bg:'rgba(255,255,255,0.02)', border:`1px solid ${isActive?s.color+'50':'rgba(255,255,255,0.06)'}` }}>
                          <div onClick={()=>play(s)} style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                              {isLite
                              ? <div style={{ width:36, height:36, borderRadius:8, background:s.bg||'rgba(255,255,255,0.07)', flexShrink:0 }}/>
                              : <img src={s.cover} loading="lazy" decoding="async" style={{ width:36, height:36, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>}
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:isActive?'white':'rgba(255,255,255,0.85)' }}>{s.title}</div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.artist} · {s.album}</div>
                            </div>
                          </div>
                          {isActive&&playing&&(
                            <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:14, marginRight:4 }}>
                              {[12,6,10].map((h,j)=><div key={j} style={{ width:2.5, height:h, background:s.color, borderRadius:1, animation:`bounce 1.4s ease-in-out ${j*0.25}s infinite` }}/>)}
                            </div>
                          )}
                          {/* ── Unduh ke perangkat (custom playlist, tidak tampil untuk radio) */}
                          {!s.isRadio&&<button title="Unduh ke perangkat"
                            onClick={async e=>{ e.stopPropagation();
                              const btn2=e.currentTarget; btn2.disabled=true;
                              const origColor=btn2.style.color; btn2.style.color='#a78bfa';
                              try {
                                if(s.isDrive&&s.driveId&&tokenRef.current){
                                  await downloadToDevice(`https://www.googleapis.com/drive/v3/files/${s.driveId}?alt=media&acknowledgeAbuse=true`,`${s.title} - ${s.artist}.mp3`,{Authorization:`Bearer ${tokenRef.current}`});
                                } else if(s.src){
                                  const raw=s.src.split('?')[0]; const ext=raw.includes('.')?raw.split('.').pop():'mp3';
                                  await downloadToDevice(s.src,`${s.title} - ${s.artist}.${ext}`);
                                }
                                btn2.style.color='#4ade80'; setTimeout(()=>{ btn2.style.color=origColor; btn2.disabled=false; },3000);
                              } catch { btn2.style.color='#f87171'; setTimeout(()=>{ btn2.style.color=origColor; btn2.disabled=false; },3000); }
                            }}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.2)', padding:'4px 6px', display:'flex', borderRadius:6, flexShrink:0, transition:'color 0.2s' }}>
                            <Download size={14}/>
                          </button>}

                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
              </PlaylistErrorBoundary></Suspense>
            )}
          </div>
        )}

        {/* ─── AI TAB */}
        {tab==='ai'&&(
          <div style={{ height:'100%', display:'flex', flexDirection:'column' }}
            onTouchStart={(e) => {
              aiSwipeTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - aiSwipeTouchRef.current.x;
              const dy = e.changedTouches[0].clientY - aiSwipeTouchRef.current.y;
              if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 48) {
                const subTabs = ['chat', 'foryou', 'lyrics'];
                const idx = subTabs.indexOf(aiSubView);
                if (dx < 0 && idx < subTabs.length - 1) setAiSubView(subTabs[idx + 1]);
                if (dx > 0 && idx > 0) setAiSubView(subTabs[idx - 1]);
              }
            }}
          >

            {/* ── AI Header: title + status + now playing */}
            <div style={{ padding:'14px 16px 0', flexShrink:0, background:'transparent' }}>
              {/* Row 1: icon + title + status */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 16px #6366f160' }}><Bot size={18} style={{ color:'white' }}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:14 }}>Starry AI</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:hasKey()?'#22c55e':'#ef4444', animation:hasKey()?'pulse 2s infinite':'none', flexShrink:0 }}/>
                    <span style={{ fontSize:10, color:hasKey()?'#86efac':'#fca5a5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{hasKey() ? (activeModelLabel || activeModel()) : t?.aiOffline||'Offline — add API key'}</span>
                  </div>
                </div>
              </div>



              {/* Sub-nav tabs — centered */}
              <div style={{ display:'flex', justifyContent:'center', gap:0, marginBottom:0, borderBottom:'1px solid rgba(255,255,255,0.06)', overflowX:'auto' }} className="scrollbar-hide">
                {[
                  { id:'chat', label:'💬 Chat' },
                  { id:'foryou', label:'🎯 For You' },
                  { id:'lyrics', label:`🎵 ${t?.lyricsTab||'Lyrics'}` },
                ].map(({id, label})=>(
                  <button key={id} onClick={()=>setAiSubView(id)}
                    style={{ padding:'9px 22px', borderRadius:0, border:'none', background:'none', color:aiSubView===id?'white':'rgba(255,255,255,0.4)', fontSize:13, fontWeight:aiSubView===id?800:600, cursor:'pointer', borderBottom:aiSubView===id?`2px solid ${track.color}`:'2px solid transparent', marginBottom:-1, flexShrink:0, whiteSpace:'nowrap' }}>
                    {label}
                  </button>
                ))}
              </div>
              {/* Swipe dot indicator */}
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:5, padding:'6px 0 2px' }}>
                {['chat','foryou','lyrics'].map(id=>(
                  <div key={id} style={{ width: aiSubView===id ? 16 : 5, height:5, borderRadius:999, background: aiSubView===id ? track.color : 'rgba(255,255,255,0.18)', transition:'width 0.25s ease, background 0.25s ease' }}/>
                ))}
              </div>
            </div>

            {/* Chat + Vibe result area OR Lyrics OR For You */}
            {aiSubView==='foryou' ? (
              /* ── FOR YOU / DISCOVER FEED VIEW */
              <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'0 0 24px' }}>
                {isLite ? (
                  /* ── LITE MODE GATE */
                  <div style={{ textAlign:'center', paddingTop:48, padding:'48px 20px 24px' }}>
                    {/* Gradient backdrop */}
                    <div style={{ position:'relative', display:'inline-flex', width:72, height:72, borderRadius:24, background:'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))', border:'1px solid rgba(99,102,241,0.3)', alignItems:'center', justifyContent:'center', fontSize:32, marginBottom:20, boxShadow:isLite?'none':'0 8px 32px rgba(99,102,241,0.2)' }}>🎯</div>
                    <div style={{ fontSize:17, fontWeight:800, color:'white', marginBottom:8, letterSpacing:'-0.02em' }}>For You tidak tersedia</div>
                    <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.4)', lineHeight:1.8, marginBottom:28, whiteSpace:'pre-line' }}>{'Mode Lite aktif — fitur For You\ndinonaktifkan untuk hemat data.\n\nAktifkan Mode Pro untuk\npersonalisasi rekomendasimu.'}</div>
                    <button onClick={toggleMode} style={{ padding:'11px 24px', borderRadius:999, border:'none', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:isLite?'none':'0 4px 20px rgba(99,102,241,0.4)' }}>
                      ✨ Switch ke Pro Mode
                    </button>
                  </div>
                ) : personaStep==='onboard' ? (
                  /* ── ONBOARDING FORM — Social setup style */
                  <div style={{ padding:'0 16px 24px' }}>
                    {/* Hero header — full-width banner */}
                    <div style={{ margin:'0 -16px 24px', padding:'28px 20px 24px', background:`linear-gradient(160deg, ${track.color}28 0%, rgba(168,85,247,0.12) 60%, transparent 100%)`, borderBottom:'1px solid rgba(255,255,255,0.06)', position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', top:-20, right:-20, width:120, height:120, borderRadius:'50%', background:`${track.color}10`, filter:'blur(30px)' }}/>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                        <div style={{ width:40, height:40, borderRadius:14, background:`linear-gradient(135deg,${track.color},#a855f7)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, boxShadow:isLite?'none':`0 4px 16px ${track.color}50` }}>👋</div>
                        <div>
                          <div style={{ fontSize:16, fontWeight:800, color:'white', letterSpacing:'-0.02em' }}>Setup Feed Kamu</div>
                          <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.45)', marginTop:2 }}>Starry AI kurasi konten yang pas buatmu</div>
                        </div>
                      </div>
                      {/* Progress dots */}
                      <div style={{ display:'flex', gap:5, marginTop:4 }}>
                        {['Konten','Mood','Bahasa'].map((s,i)=>(
                          <div key={i} style={{ height:3, borderRadius:99, background: i===0?'white':'rgba(255,255,255,0.2)', flex: i===0?2:1, transition:isLite?'none':'all 0.3s' }}/>
                        ))}
                      </div>
                    </div>

                    {/* Q1 — Konten favorit */}
                    <div style={{ marginBottom:24 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                        <div style={{ width:5, height:18, borderRadius:99, background:`linear-gradient(to bottom,${track.color},#a855f7)` }}/>
                        <div style={{ fontSize:13, fontWeight:800, color:'white' }}>Konten favoritmu?</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginLeft:'auto' }}>Pilih bebas</div>
                      </div>
                      {/* Category grid — 2 columns */}
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        {[
                          { id:'music_mainstream', icon:'🎵', label:'Musik Pop / Rock', color:'#6366f1' },
                          { id:'music_lofi',        icon:'☕', label:'Lo-Fi & Chill', color:'#8b5cf6' },
                          { id:'music_indopop',     icon:'🇮🇩', label:'Indo Pop / Dangdut', color:'#ef4444' },
                          { id:'music_instrumental',icon:'🎻', label:'Instrumental', color:'#ec4899' },
                          { id:'music_edm',         icon:'⚡', label:'EDM / Electronic', color:'#06b6d4' },
                          { id:'edu_podcast',       icon:'🎙️', label:'Podcast & Siniar', color:'#10b981' },
                          { id:'edu_audiobook',     icon:'📖', label:'Audiobook', color:'#f59e0b' },
                          { id:'edu_news',          icon:'📰', label:'Berita Audio', color:'#3b82f6' },
                          { id:'fiksi_drama',       icon:'🎭', label:'Drama Audio', color:'#f97316' },
                          { id:'fiksi_komedi',      icon:'😂', label:'Komedi & Stand-Up', color:'#eab308' },
                          { id:'wellness_ambient',  icon:'🌿', label:'Suara Alam', color:'#22c55e' },
                          { id:'wellness_asmr',     icon:'🤫', label:'ASMR', color:'#14b8a6' },
                          { id:'wellness_binaural', icon:'🧠', label:'Binaural & Fokus', color:'#a78bfa' },
                          { id:'siaran_radio',      icon:'📻', label:'Radio Live', color:'#f59e0b' },
                          { id:'siaran_olahraga',   icon:'⚽', label:'Olahraga Live', color:'#ef4444' },
                        ].map(c => {
                          const selected = personaPrefs.categories.includes(c.id);
                          return (
                            <button key={c.id} onClick={()=>setPersonaPrefs(p=>({ ...p, categories: selected ? p.categories.filter(x=>x!==c.id) : [...p.categories, c.id] }))}
                              style={{ padding:'10px 12px', borderRadius:14, border:`1.5px solid ${selected?c.color+'70':'rgba(255,255,255,0.08)'}`, background:selected?`${c.color}18`:'rgba(255,255,255,0.03)', color:selected?'white':'rgba(255,255,255,0.5)', fontSize:12, fontWeight:selected?700:500, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:isLite?'none':'all 0.15s', textAlign:'left', position:'relative', overflow:'hidden' }}>
                              {selected && <div style={{ position:'absolute', top:0, right:0, width:0, height:0, borderStyle:'solid', borderWidth:'0 18px 18px 0', borderColor:`transparent ${c.color} transparent transparent` }}/>}
                              <span style={{ fontSize:15, flexShrink:0 }}>{c.icon}</span>
                              <span style={{ lineHeight:1.3, fontSize:11.5 }}>{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Q2 — Mood */}
                    <div style={{ marginBottom:24 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                        <div style={{ width:5, height:18, borderRadius:99, background:'linear-gradient(to bottom,#f97316,#eab308)' }}/>
                        <div style={{ fontSize:13, fontWeight:800, color:'white' }}>Dengerin buat apa?</div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                        {[
                          { id:'relax',     icon:'😌', label:'Santai', color:'#6366f1' },
                          { id:'focus',     icon:'🎯', label:'Fokus', color:'#3b82f6' },
                          { id:'energetic', icon:'🔥', label:'Semangat', color:'#ef4444' },
                          { id:'sleep',     icon:'😴', label:'Tidur', color:'#8b5cf6' },
                          { id:'sad',       icon:'🌧️', label:'Me time', color:'#64748b' },
                          { id:'party',     icon:'🎉', label:'Hepi', color:'#f59e0b' },
                        ].map(m => {
                          const selected = personaPrefs.moods.includes(m.id);
                          return (
                            <button key={m.id} onClick={()=>setPersonaPrefs(p=>({ ...p, moods: selected ? p.moods.filter(x=>x!==m.id) : [...p.moods, m.id] }))}
                              style={{ padding:'12px 8px', borderRadius:14, border:`1.5px solid ${selected?m.color+'70':'rgba(255,255,255,0.08)'}`, background:selected?`${m.color}18`:'rgba(255,255,255,0.03)', color:selected?'white':'rgba(255,255,255,0.45)', fontSize:12, fontWeight:selected?800:500, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:5, transition:isLite?'none':'all 0.15s' }}>
                              <span style={{ fontSize:20 }}>{m.icon}</span>
                              <span style={{ fontSize:11 }}>{m.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Q3 — Bahasa */}
                    <div style={{ marginBottom:28 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                        <div style={{ width:5, height:18, borderRadius:99, background:'linear-gradient(to bottom,#22c55e,#06b6d4)' }}/>
                        <div style={{ fontSize:13, fontWeight:800, color:'white' }}>Bahasa konten?</div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                        {[
                          { id:'id',  icon:'🇮🇩', label:'Indonesia', sub:'Lokal' },
                          { id:'en',  icon:'🌍', label:'Interna-sional', sub:'Global' },
                          { id:'mix', icon:'🎲', label:'Campur', sub:'Keduanya' },
                        ].map(l => (
                          <button key={l.id} onClick={()=>setPersonaPrefs(p=>({ ...p, lang: l.id }))}
                            style={{ padding:'12px 6px', borderRadius:14, border:`1.5px solid ${personaPrefs.lang===l.id?track.color+'70':'rgba(255,255,255,0.08)'}`, background:personaPrefs.lang===l.id?`${track.color}18`:'rgba(255,255,255,0.03)', color:personaPrefs.lang===l.id?'white':'rgba(255,255,255,0.45)', fontSize:11, fontWeight:personaPrefs.lang===l.id?800:500, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, transition:isLite?'none':'all 0.15s' }}>
                            <span style={{ fontSize:22 }}>{l.icon}</span>
                            <span style={{ fontWeight:700, fontSize:11.5 }}>{l.label}</span>
                            <span style={{ fontSize:9.5, opacity:0.55 }}>{l.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Count selected */}
                    {(personaPrefs.categories.length > 0 || personaPrefs.moods.length > 0) && (
                      <div style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:12 }}>
                        {personaPrefs.categories.length} konten · {personaPrefs.moods.length} mood dipilih
                      </div>
                    )}
                    <button
                      disabled={personaLoading || (personaPrefs.categories.length===0 && personaPrefs.moods.length===0)}
                      onClick={async () => {
                        if (!hasKey()) { alert(t?.aiOffline||'Tambahkan API key di Settings untuk menggunakan fitur ini.'); return; }
                        setPL(true);
                        try {
                          const result = await fetchForYouSplit(personaPrefs, null, null);
                          if (result) {
                            setPersonaRecs(result);
                            localStorage.setItem('sn_persona_recs', JSON.stringify(result));
                            localStorage.setItem('sn_persona_prefs', JSON.stringify(personaPrefs));
                            localStorage.setItem('sn_persona_done', '1');
                            localStorage.setItem('sn_persona_recs_ts', String(Date.now()));
                            setPersonaStep('result');
                          } else {
                            alert('Failed to load recommendations. Please try again.');
                          }
                        } catch (e) {
                          alert('Error: ' + e.message);
                        } finally { setPL(false); }
                      }}
                      style={{ width:'100%', padding:'16px', borderRadius:18, border:'none', background: personaPrefs.categories.length>0||personaPrefs.moods.length>0 ? `linear-gradient(135deg,${track.color},#a855f7)` : 'rgba(255,255,255,0.08)', color:'white', fontSize:14, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:personaLoading?0.7:1, letterSpacing:'-0.01em', boxShadow: (!isLite && (personaPrefs.categories.length>0||personaPrefs.moods.length>0))?`0 6px 28px ${track.color}40`:'none', transition:isLite?'none':'all 0.2s' }}>
                      {personaLoading ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Menganalisis preferensimu…</> : <><Wand2 size={16}/> Buat Feed Personalku ✨</>}
                    </button>
                  </div>
                ) : (
                  /* ── RESULT VIEW — Social Discover Feed */
                  <div>
                    {personaRecs && (
                      <>
                        {/* ── Sticky top header with greeting */}
                        <div style={{ margin:'0 0 0', padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                          {/* Greeting pill */}
                          {personaRecs.greeting && (
                            <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
                              <div style={{ width:34, height:34, borderRadius:12, flexShrink:0, background:`linear-gradient(135deg,${track.color},#a855f7)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, boxShadow:isLite?'none':`0 4px 14px ${track.color}50` }}>🌟</div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Starry AI</div>
                                <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.8)', lineHeight:1.6, fontWeight:500 }}>{personaRecs.greeting}</div>
                                {personaRecs.tip && (
                                  <div style={{ marginTop:8, display:'flex', alignItems:'flex-start', gap:7, padding:'8px 10px', borderRadius:10, background:'rgba(234,179,8,0.08)', border:'1px solid rgba(234,179,8,0.18)' }}>
                                    <span style={{ fontSize:13, flexShrink:0, lineHeight:1 }}>💡</span>
                                    <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>{personaRecs.tip}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Action bar */}
                          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <button onClick={()=>refreshForYouRef.current?.(true)} disabled={personaLoading}
                              style={{ flex:1, padding:'9px 14px', borderRadius:12, border:`1px solid ${track.color}40`, background:`${track.color}15`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, opacity:personaLoading?0.6:1 }}>
                              {personaLoading ? <><Loader2 size={12} style={{ animation:'spin 1s linear infinite' }}/> Updating…</> : <><Sparkles size={12}/> Refresh Feed</>}
                            </button>
                            <button onClick={()=>{ setPersonaStep('onboard'); localStorage.removeItem('sn_persona_done'); }}
                              style={{ padding:'9px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                              <SlidersHorizontal size={12}/> Edit
                            </button>
                          </div>
                        </div>

                        {/* ── DISCOVER FEED: Category sections as story rows + card stacks */}
                        <div style={{ padding:'8px 0' }}>
                        {[
                          personaRecs.music?.length > 0 && {
                            label:'Musik', emoji:'🎵', accent: track.color,
                            gradient: `linear-gradient(135deg, ${track.color}30, ${track.color}08)`,
                            items: personaRecs.music.map(m=>({
                              icon:'🎵', title: m.title, sub: m.artist,
                              tag: m.subcategory, reason: m.reason,
                              onPlay: ()=>{
                                const q=`${m.title} ${m.artist}`;
                                setUnifiedPlatform('ytmusic'); setUnifiedQuery(q);
                                setYtQuery(p=>({...p,ytmusic:q})); setTab('stream');
                                setTimeout(()=>{ searchYouTube('ytmusic',q); ytMusicSectionRef.current?.scrollIntoView({behavior:'smooth',block:'start'}); },300);
                              }, btnLabel:'▶ Play',
                            }))
                          },
                          personaRecs.edukasi?.length > 0 && {
                            label:'Edukasi', emoji:'📚', accent:'#22c55e',
                            gradient:'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.04))',
                            items: personaRecs.edukasi.map(e=>({
                              icon: e.subcategory?.includes('news')?'📰':e.subcategory?.includes('audio')||e.subcategory?.includes('book')?'📖':'🎙️',
                              title: e.name, sub: e.platform, tag: e.subcategory, reason: e.reason,
                              onPlay: ()=>{
                                const q=`${e.name} ${e.subcategory?.includes('podcast')?'podcast':e.subcategory?.includes('book')?'audiobook':e.subcategory?.includes('news')?'berita audio':''}`.trim();
                                setUnifiedPlatform('ytmusic'); setUnifiedQuery(q);
                                setYtQuery(p=>({...p,ytmusic:q})); setTab('stream');
                                setTimeout(()=>{ searchYouTube('ytmusic',q); ytMusicSectionRef.current?.scrollIntoView({behavior:'smooth',block:'start'}); },300);
                              }, btnLabel:'Cari',
                            }))
                          },
                          personaRecs.fiksi?.length > 0 && {
                            label:'Fiksi', emoji:'🎭', accent:'#f97316',
                            gradient:'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.04))',
                            items: personaRecs.fiksi.map(f=>({
                              icon: f.subcategory==='komedi'?'😂':f.subcategory==='puisi'?'📜':'🎭',
                              title: f.name, sub: f.genre, tag: f.subcategory, reason: f.reason,
                              onPlay: ()=>{
                                const q=`${f.name} audio ${f.subcategory||''}`.trim();
                                setUnifiedPlatform('ytmusic'); setUnifiedQuery(q);
                                setYtQuery(p=>({...p,ytmusic:q})); setTab('stream');
                                setTimeout(()=>{ searchYouTube('ytmusic',q); ytMusicSectionRef.current?.scrollIntoView({behavior:'smooth',block:'start'}); },300);
                              }, btnLabel:'Cari',
                            }))
                          },
                          personaRecs.wellness?.length > 0 && {
                            label:'Wellness', emoji:'🧘', accent:'#14b8a6',
                            gradient:'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(20,184,166,0.04))',
                            items: personaRecs.wellness.map(w=>({
                              icon: w.type?.toLowerCase().includes('asmr')?'🤫':w.type?.toLowerCase().includes('binaural')?'🧠':w.type?.toLowerCase().includes('noise')?'🌊':w.type?.toLowerCase().includes('ambient')||w.type?.toLowerCase().includes('alam')?'🌿':'🧘',
                              title: w.name, sub: w.type, reason: w.reason,
                              onPlay: ()=>{
                                const q=`${w.name} ${w.type||''}`.trim();
                                setUnifiedPlatform('ytmusic'); setUnifiedQuery(q);
                                setYtQuery(p=>({...p,ytmusic:q})); setTab('stream');
                                setTimeout(()=>{ searchYouTube('ytmusic',q); ytMusicSectionRef.current?.scrollIntoView({behavior:'smooth',block:'start'}); },300);
                              }, btnLabel:'Cari',
                            }))
                          },
                          personaRecs.siaran?.length > 0 && {
                            label:'Siaran Live', emoji:'📻', accent:'#f59e0b',
                            gradient:'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.04))',
                            items: personaRecs.siaran.map(s=>({
                              icon: s.subcategory==='olahraga'?'⚽':s.subcategory==='live'?'🎙️':'📻',
                              title: s.name, sub: s.genre, tag: s.subcategory, reason: s.reason,
                              onPlay: ()=>{
                                const q = s.subcategory==='olahraga' ? `${s.name} live stream` : s.name;
                                setUnifiedPlatform('radio'); setTab('stream');
                                setTimeout(()=>{ setRbMode('search'); setRbQuery(q); rbSearch(q, null); }, 300);
                              }, btnLabel: s.subcategory==='olahraga'?'▶ Live':'📻 Radio',
                            }))
                          },
                        ].filter(Boolean).map((section, si) => (
                          <div key={si} style={{ marginBottom:4 }}>
                            {/* Section header — like Instagram story highlights row */}
                            <div style={{ padding:'12px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ width:30, height:30, borderRadius:10, background:section.gradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, border:`1px solid ${section.accent}30` }}>
                                  {section.emoji}
                                </div>
                                <div>
                                  <div style={{ fontSize:13, fontWeight:800, color:'white', letterSpacing:'-0.01em' }}>{section.label}</div>
                                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{section.items.length} rekomendasi untukmu</div>
                                </div>
                              </div>
                              <div style={{ fontSize:10, fontWeight:700, color:section.accent, background:`${section.accent}15`, padding:'4px 10px', borderRadius:99, border:`1px solid ${section.accent}30` }}>Untukmu</div>
                            </div>

                            {/* Horizontal story-strip cards */}
                            <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', paddingLeft:16, paddingRight:16, paddingBottom:8 }}>
                              {section.items.map((item, ii)=>(
                                <div key={ii}
                                  onClick={item.onPlay}
                                  style={{ flexShrink:0, width:'clamp(140px,40vw,168px)', background:'rgba(255,255,255,0.04)', border:`1px solid ${section.accent}20`, borderRadius:20, overflow:'hidden', cursor:'pointer', transition:isLite?'none':'transform 0.15s, background 0.15s' }}
                                  onMouseEnter={e=>{ e.currentTarget.style.background=`${section.accent}10`; if(!isLite) e.currentTarget.style.transform='scale(1.02)'; }}
                                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; if(!isLite) e.currentTarget.style.transform='scale(1)'; }}
                                >
                                  {/* Card top — gradient banner */}
                                  <div style={{ height:52, background:section.gradient, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px', position:'relative' }}>
                                    <div style={{ fontSize:24 }}>{item.icon}</div>
                                    {item.tag && (
                                      <div style={{ fontSize:9, fontWeight:700, color:section.accent, background:`${section.accent}20`, padding:'2px 7px', borderRadius:99, border:`1px solid ${section.accent}35`, textTransform:'capitalize', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.tag}</div>
                                    )}
                                  </div>
                                  {/* Card body */}
                                  <div style={{ padding:'10px 12px 12px' }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:'white', lineHeight:1.35, marginBottom:3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{item.title}</div>
                                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:6 }}>{item.sub}</div>
                                    {item.reason && (
                                      <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.3)', lineHeight:1.45, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', marginBottom:8 }}>{item.reason}</div>
                                    )}
                                    <button style={{ width:'100%', padding:'7px 0', borderRadius:10, border:'none', background:`${section.accent}22`, color:section.accent, fontSize:11, fontWeight:700, cursor:'pointer', letterSpacing:'0.01em' }}>
                                      {item.btnLabel}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Divider */}
                            <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'4px 0 0' }}/>
                          </div>
                        ))}
                        </div>


                      </>
                    )}

                  {/* Popular section shown always (below persona result) */}
                        {/* ── DISCOVER: POPULER SEKARANG ── */}
                        <div style={{ marginTop: personaStep==='result' ? 0 : 8 }}>
                          {/* Section banner header */}
                          <div style={{ padding:'14px 16px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop: personaStep==='result'?'none':'1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:30, height:30, borderRadius:10, background:'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(245,158,11,0.2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🔥</div>
                              <div>
                                <div style={{ fontSize:13, fontWeight:800, color:'white', letterSpacing:'-0.01em' }}>Populer Sekarang</div>
                                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Trending di seluruh platform</div>
                              </div>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.4)' }}>
                              <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', animation:isLite?'none':'pulse 1.5s ease-in-out infinite' }}/>
                              LIVE
                            </div>
                          </div>

                          {/* YT Trending — pill chips horizontal scroll */}
                          {ytTrending.length > 0 && (
                            <div style={{ marginBottom:16, paddingBottom:4 }}>
                              <div style={{ padding:'0 16px 8px', fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', display:'flex', alignItems:'center', gap:6 }}>
                                <span style={{ color:'#ef4444' }}>▶</span> Trending YouTube
                              </div>
                              <div className="scrollbar-hide" style={{ display:'flex', gap:8, overflowX:'auto', paddingLeft:16, paddingRight:16, paddingBottom:4 }}>
                                {ytTrending.map((chip, i) => (
                                  <button key={i}
                                    onClick={() => {
                                      setUnifiedPlatform('ytmusic'); setUnifiedQuery(chip.query);
                                      setYtQuery(p => ({ ...p, ytmusic: chip.query })); setTab('stream');
                                      setTimeout(() => { searchYouTube('ytmusic', chip.query); ytMusicSectionRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }); }, 300);
                                    }}
                                    style={{ flexShrink:0, padding:'8px 16px', borderRadius:999, border:'1px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.08)', color:'rgba(255,255,255,0.8)', fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5 }}>
                                    <span style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:700 }}>#{i+1}</span>
                                    {chip.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {ytTrendingLoading && (
                            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 16px 16px', color:'rgba(255,255,255,0.3)', fontSize:12 }}>
                              <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> Loading trending…
                            </div>
                          )}

                          {/* AI Populer sections */}
                          {popularLoading && (
                            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 16px 16px', color:'rgba(255,255,255,0.3)', fontSize:12 }}>
                              <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> Starry AI sedang kurasi konten populer…
                            </div>
                          )}
                          {popularRecs && (
                            <>
                              {/* Musik Trending Global */}
                              {popularRecs.trending_music?.length > 0 && (
                                <div style={{ marginBottom:16 }}>
                                  <div style={{ padding:'0 16px 8px', fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', display:'flex', alignItems:'center', gap:5 }}>
                                    🌍 Musik Trending Global
                                  </div>
                                  <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', paddingLeft:16, paddingRight:16, paddingBottom:4 }}>
                                    {popularRecs.trending_music.map((m, i) => (
                                      <div key={i}
                                        onClick={() => {
                                          const q = `${m.title} ${m.artist}`;
                                          setUnifiedPlatform('ytmusic'); setUnifiedQuery(q);
                                          setYtQuery(p => ({ ...p, ytmusic: q })); setTab('stream');
                                          setTimeout(() => { searchYouTube('ytmusic', q); ytMusicSectionRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }); }, 300);
                                        }}
                                        style={{ flexShrink:0, width:'clamp(140px,40vw,165px)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:20, overflow:'hidden', cursor:'pointer', transition:isLite?'none':'transform 0.15s, background 0.15s' }}
                                        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.1)'; if(!isLite) e.currentTarget.style.transform='scale(1.02)'; }}
                                        onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; if(!isLite) e.currentTarget.style.transform='scale(1)'; }}>
                                        <div style={{ height:48, background:'linear-gradient(135deg,rgba(239,68,68,0.25),rgba(239,68,68,0.06))', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px' }}>
                                          <span style={{ fontSize:22 }}>🎵</span>
                                          <span style={{ fontSize:9, fontWeight:700, color:'#f87171', background:'rgba(239,68,68,0.2)', padding:'2px 7px', borderRadius:99 }}>#{i+1}</span>
                                        </div>
                                        <div style={{ padding:'10px 12px 12px' }}>
                                          <div style={{ fontSize:12, fontWeight:700, color:'white', lineHeight:1.35, marginBottom:3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{m.title}</div>
                                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:8 }}>{m.artist}</div>
                                          {m.reason && <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.28)', lineHeight:1.4, marginBottom:8, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{m.reason}</div>}
                                          <button style={{ width:'100%', padding:'6px 0', borderRadius:10, border:'none', background:'rgba(239,68,68,0.18)', color:'#f87171', fontSize:11, fontWeight:700, cursor:'pointer' }}>▶ Play</button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Radio Populer */}
                              {popularRecs.trending_radio?.length > 0 && (
                                <div style={{ marginBottom:16 }}>
                                  <div style={{ padding:'0 16px 8px', fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                                    📻 Radio Populer
                                  </div>
                                  <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', paddingLeft:16, paddingRight:16, paddingBottom:4 }}>
                                    {popularRecs.trending_radio.map((r, i) => (
                                      <div key={i}
                                        onClick={() => {
                                          setUnifiedPlatform('radio'); setTab('stream');
                                          setTimeout(() => { setRbMode('search'); setRbQuery(r.name); rbSearch(r.name, null); }, 300);
                                        }}
                                        style={{ flexShrink:0, width:'clamp(140px,40vw,165px)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(245,158,11,0.18)', borderRadius:20, overflow:'hidden', cursor:'pointer', transition:isLite?'none':'transform 0.15s, background 0.15s' }}
                                        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(245,158,11,0.1)'; if(!isLite) e.currentTarget.style.transform='scale(1.02)'; }}
                                        onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; if(!isLite) e.currentTarget.style.transform='scale(1)'; }}>
                                        <div style={{ height:48, background:'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(245,158,11,0.06))', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px' }}>
                                          <span style={{ fontSize:22 }}>📻</span>
                                          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, fontWeight:700, color:'#fbbf24' }}>
                                            <div style={{ width:5, height:5, borderRadius:'50%', background:'#fbbf24' }}/>LIVE
                                          </div>
                                        </div>
                                        <div style={{ padding:'10px 12px 12px' }}>
                                          <div style={{ fontSize:12, fontWeight:700, color:'white', lineHeight:1.35, marginBottom:3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{r.name}</div>
                                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:8 }}>{r.genre}</div>
                                          {r.reason && <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.28)', lineHeight:1.4, marginBottom:8, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{r.reason}</div>}
                                          <button style={{ width:'100%', padding:'6px 0', borderRadius:10, border:'none', background:'rgba(245,158,11,0.18)', color:'#fbbf24', fontSize:11, fontWeight:700, cursor:'pointer' }}>📻 Dengarkan</button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Indo Trending */}
                              {popularRecs.trending_indo?.length > 0 && (
                                <div style={{ marginBottom:16 }}>
                                  <div style={{ padding:'0 16px 8px', fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                                    🇮🇩 Trending Indonesia
                                  </div>
                                  <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', paddingLeft:16, paddingRight:16, paddingBottom:4 }}>
                                    {popularRecs.trending_indo.map((m, i) => (
                                      <div key={i}
                                        onClick={() => {
                                          const q = `${m.title} ${m.artist}`;
                                          setUnifiedPlatform('ytmusic'); setUnifiedQuery(q);
                                          setYtQuery(p => ({ ...p, ytmusic: q })); setTab('stream');
                                          setTimeout(() => { searchYouTube('ytmusic', q); ytMusicSectionRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }); }, 300);
                                        }}
                                        style={{ flexShrink:0, width:'clamp(140px,40vw,165px)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(220,38,38,0.18)', borderRadius:20, overflow:'hidden', cursor:'pointer', transition:isLite?'none':'transform 0.15s, background 0.15s' }}
                                        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(220,38,38,0.1)'; if(!isLite) e.currentTarget.style.transform='scale(1.02)'; }}
                                        onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; if(!isLite) e.currentTarget.style.transform='scale(1)'; }}>
                                        <div style={{ height:48, background:'linear-gradient(135deg,rgba(220,38,38,0.25),rgba(220,38,38,0.06))', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px' }}>
                                          <span style={{ fontSize:22 }}>🇮🇩</span>
                                          <span style={{ fontSize:9, fontWeight:700, color:'#fca5a5', background:'rgba(220,38,38,0.2)', padding:'2px 7px', borderRadius:99 }}>#{i+1}</span>
                                        </div>
                                        <div style={{ padding:'10px 12px 12px' }}>
                                          <div style={{ fontSize:12, fontWeight:700, color:'white', lineHeight:1.35, marginBottom:3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{m.title}</div>
                                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:8 }}>{m.artist}</div>
                                          {m.reason && <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.28)', lineHeight:1.4, marginBottom:8, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{m.reason}</div>}
                                          <button style={{ width:'100%', padding:'6px 0', borderRadius:10, border:'none', background:'rgba(220,38,38,0.18)', color:'#fca5a5', fontSize:11, fontWeight:700, cursor:'pointer' }}>▶ Play</button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                  </div>
                )}
              </div>
            ) : aiSubView==='lyrics' ? (
              /* ── LYRICS VIEW inside AI tab */
              <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'16px 20px 24px' }}>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginBottom:14 }}>
                  {lyrics && !lyrics.startsWith('⚡') && hasNonLatin(lyrics) && !isLite && (
                    <button onClick={lyricsRomanized ? ()=>setLyricsRomanized('') : ()=>romanizeLyrics(lyrics)} disabled={lyricsRomanizing} style={{ padding:'7px 14px', borderRadius:999, border:`1px solid ${track.color}50`, background:`${track.color}18`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', opacity:lyricsRomanizing?0.6:1, display:'flex', alignItems:'center', gap:6 }}>
                      {lyricsRomanizing ? <><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>Romanisasi…</> : lyricsRomanized ? <>🔤 Sembunyikan</> : <>🔤 Romanisasi</>}
                    </button>
                  )}
                  {lyrics && !lyrics.startsWith('⚡') && (
                    <button onClick={lyricsTranslation ? ()=>setLyricsTranslation('') : translateLyrics} disabled={lyricsTranslating} style={{ padding:'7px 14px', borderRadius:999, border:`1px solid ${track.color}50`, background:`${track.color}18`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', opacity:lyricsTranslating?0.6:1, display:'flex', alignItems:'center', gap:6 }}>
                      {lyricsTranslating ? <><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>Menerjemahkan…</> : lyricsTranslation ? <>🌐 Sembunyikan</> : <>🌐 Terjemahkan</>}
                    </button>
                  )}
                  <button onClick={getLyrics} disabled={lyricsLoading||lyricsGenerating} style={{ padding:'7px 14px', borderRadius:999, border:'none', background:track.color, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', opacity:(lyricsLoading||lyricsGenerating)?0.6:1, display:'flex', alignItems:'center', gap:6 }}>
                    {lyricsLoading?<><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>{t?.lyricsSearchBtn||'Search...'}</>:<><Sparkles size={13}/>{lyrics?(t?.lyricsRefresh||'Refresh'):(t?.lyricsShow||'Show Lyrics')}</>}
                  </button>
                </div>
                {!lyrics&&!lyricsLoading&&!lyricsNeedGenerate&&!lyricsGenerating&&(
                  <div style={{ textAlign:'center', paddingTop:36 }}>
                    <Mic2 size={48} style={{ color:'rgba(255,255,255,0.1)', margin:'0 auto 16px', display:'block' }}/>
                    <div style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.3)', marginBottom:8 }}>{t?.lyricsNotFound||'Lyrics not available'}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>{isLite ? (t?.lyricsHintLite||'Tap "Show Lyrics" to search from public database') : (t?.lyricsHintPro||'Tap "Show Lyrics" to generate lyrics with AI')}</div>
                  </div>
                )}
                {lyricsNeedGenerate&&!lyricsGenerating&&(
                  <div style={{ textAlign:'center', paddingTop:36 }}>
                    <Mic2 size={48} style={{ color:'rgba(255,255,255,0.1)', margin:'0 auto 16px', display:'block' }}/>
                    <div style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.3)', marginBottom:8 }}>Lirik tidak ditemukan di database</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', marginBottom:20 }}>Lirik asli tidak tersedia. Kamu bisa minta AI untuk membuat lirik yang mungkin sesuai.</div>
                    <button onClick={generateLyricsManual} style={{ padding:'9px 20px', borderRadius:999, border:`1px solid ${track.color}60`, background:`${track.color}20`, color:track.color, fontSize:13, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:7 }}>
                      <Sparkles size={14}/> Generate Lirik dengan AI
                    </button>
                  </div>
                )}
                {(lyricsLoading||lyricsGenerating)&&(
                  <div style={{ textAlign:'center', paddingTop:36 }}>
                    <Loader2 size={40} style={{ color:track.color, margin:'0 auto 14px', display:'block', animation:'spin 1s linear infinite' }}/>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>{isLite ? (t?.lyricsSearchingLite||'Searching for lyrics…') : (t?.lyricsSearchingPro||'Starry AI is writing lyrics…')}</div>
                  </div>
                )}
                {lyrics&&!lyricsLoading&&(
                  lyrics.startsWith('⚡') ? (
                    /* Lite mode info card */
                    <div style={{ textAlign:'center', paddingTop:24 }}>
                      <div style={{ fontSize:32, marginBottom:12 }}>⚡</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>{t?.lyricsLiteDisabledTitle||'Lyrics not found'}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', lineHeight:1.7, marginBottom:20, whiteSpace:'pre-line' }}>{t?.lyricsLiteDisabledMsg||'Lite Mode active — AI lyrics generation disabled.'}</div>
                      <button onClick={toggleMode} style={{ padding:'8px 18px', borderRadius:999, border:'1px solid rgba(99,102,241,0.4)', background:'rgba(99,102,241,0.12)', color:'#a5b4fc', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        {t?.switchToProBtn||'✨ Switch to Pro Mode'}
                      </button>
                    </div>
                  ) : (
                    <>
                    <div style={{ lineHeight:1.9 }}>
                      {lyrics.split('\n').map((line, i) => {
                        const isTag = line.startsWith('[') && line.endsWith(']');
                        return (
                          <div key={i} style={{ fontSize:isTag?11:15, fontWeight:isTag?800:400, color:isTag?track.color:'rgba(255,255,255,0.9)', marginTop:isTag&&i>0?18:0, marginBottom:isTag?6:0, textTransform:isTag?'uppercase':'none', letterSpacing:isTag?'0.12em':0 }}>
                            {line || <br/>}
                          </div>
                        );
                      })}
                    </div>
                    {lyricsTranslation && (
                      <div style={{ marginTop:28, paddingTop:20, borderTop:`1px solid rgba(255,255,255,0.07)` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
                          <div style={{ fontSize:10, fontWeight:800, color:track.color, textTransform:'uppercase', letterSpacing:'0.12em' }}>🌐 Terjemahan Bahasa Indonesia</div>
                        </div>
                        <div style={{ lineHeight:1.9 }}>
                          {lyricsTranslation.split('\n').map((line, i) => {
                            const isTag = line.startsWith('[') && line.endsWith(']');
                            return (
                              <div key={i} style={{ fontSize:isTag?11:14, fontWeight:isTag?800:400, color:isTag?track.color:'rgba(255,255,255,0.7)', marginTop:isTag&&i>0?18:0, marginBottom:isTag?6:0, textTransform:isTag?'uppercase':'none', letterSpacing:isTag?'0.12em':0, fontStyle:isTag?'normal':'italic' }}>
                                {line || <br/>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {lyricsTranslating && (
                      <div style={{ marginTop:28, paddingTop:20, borderTop:`1px solid rgba(255,255,255,0.07)`, textAlign:'center' }}>
                        <Loader2 size={22} style={{ color:track.color, animation:'spin 1s linear infinite', marginBottom:8, display:'block', margin:'0 auto 8px' }}/>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>Menerjemahkan lirik…</div>
                      </div>
                    )}
                    {/* ── Auto-romanisation panel */}
                    {lyricsRomanizing && (
                      <div style={{ marginTop:28, paddingTop:20, borderTop:`1px solid rgba(255,255,255,0.07)`, textAlign:'center' }}>
                        <Loader2 size={22} style={{ color:track.color, animation:'spin 1s linear infinite', marginBottom:8, display:'block', margin:'0 auto 8px' }}/>
                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>🔤 Starry AI sedang romanisasi lirik…</div>
                      </div>
                    )}
                    {lyricsRomanized && !lyricsRomanizing && (
                      <div style={{ marginTop:28, paddingTop:20, borderTop:`1px solid rgba(255,255,255,0.07)` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
                          <div style={{ fontSize:10, fontWeight:800, color:track.color, textTransform:'uppercase', letterSpacing:'0.12em' }}>🔤 Romanisasi (Latin)</div>
                          <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontWeight:600 }}>· auto-detect non-Latin · AI</div>
                        </div>
                        <div style={{ lineHeight:1.9 }}>
                          {lyricsRomanized.split('\n').map((line, i) => {
                            const isTag = line.startsWith('[') && line.endsWith(']');
                            return (
                              <div key={i} style={{ fontSize:isTag?11:14, fontWeight:isTag?800:400, color:isTag?track.color:'rgba(255,255,255,0.65)', marginTop:isTag&&i>0?18:0, marginBottom:isTag?6:0, textTransform:isTag?'uppercase':'none', letterSpacing:isTag?'0.12em':0, fontStyle:isTag?'normal':'italic' }}>
                                {line || <br/>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    </>
                  )
                )}
              </div>
            ) : (
              /* ── CHAT VIEW */
              <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'10px 16px', display:'flex', flexDirection:'column', gap:9 }}>
                {/* Vibe result card */}
                {vibeInput && vibeInput.startsWith('✨') && (
                  <div style={{ padding:'11px 13px', borderRadius:14, background:`${track.color}12`, border:`1px solid ${track.color}35` }}>
                    <div style={{ fontSize:9, fontWeight:800, color:track.color, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.12em' }}>🔮 Suasana Hati</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.85)', lineHeight:1.75, whiteSpace:'pre-line' }}>{vibeInput.replace(/^✨\s?/,'')}</div>
                    <button onClick={()=>setVibeInput('')} style={{ marginTop:7, fontSize:10, color:track.color, background:'none', border:'none', cursor:'pointer', fontWeight:700, padding:0 }}>{t?.resetBtn||'× Reset'}</button>
                  </div>
                )}
                {messages.map((m,i)=>{
                  // Deteksi rekomendasi lagu dari pesan AI: format "JUDUL - ARTIS" atau "JUDUL" by "ARTIS"
                  let songRec = null;
                  if (m.from==='ai') {
                    const patterns = [
                      /[""]([^""]+)[""]\s*[-–]\s*([^\n,.(]+)/,
                      /[""]([^""]+)[""]\s+by\s+([^\n,.(]+)/i,
                      /^([^-\n]+)\s+-\s+([^\n]+)$/m,
                    ];
                    for (const pat of patterns) {
                      const match = m.text.match(pat);
                      if (match) {
                        songRec = { title: match[1].trim(), artist: match[2].trim() };
                        break;
                      }
                    }
                  }
                  return (
                  <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start' }}>
                    {m.from==='ai'&&<div style={{ width:22, height:22, borderRadius:7, flexShrink:0, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', marginRight:6, marginTop:2 }}><Bot size={11} style={{ color:'white' }}/></div>}
                    <div style={{ maxWidth:'78%' }}>
                      <div style={{ padding:'9px 13px', fontSize:13, lineHeight:1.55, borderRadius:m.from==='user'?'16px 16px 4px 16px':'4px 16px 16px 16px', background:m.from==='user'?track.color:'rgba(255,255,255,0.07)', border:m.from==='user'?'none':'1px solid rgba(255,255,255,0.1)', color:'white' }}>{m.text}</div>
                      {songRec && (
                        <button
                          onClick={async ()=>{
                            // 1. Cari di library dulu
                            const allS = [...builtinSongs, ...customSongs, ...ytSongs];
                            const found = allS.find(s =>
                              s.title.toLowerCase().includes(songRec.title.toLowerCase()) ||
                              songRec.title.toLowerCase().includes(s.title.toLowerCase())
                            );
                            if (found) {
                              play(found);
                              setTab('player');
                              return;
                            }
                            // 2. Pindah ke Stream tab, isi query YouTube, langsung search
                            const ytPlatformId = 'ytmusic';
                            const query = `${songRec.title} ${songRec.artist}`;
                            setYtQuery(p=>({...p,[ytPlatformId]:query}));
                            setTab('stream');
                            setTimeout(()=>{
                              searchYouTube(ytPlatformId, query);
                              setTimeout(()=>{
                                ytMusicSectionRef.current?.scrollIntoView({ behavior:'smooth', block:'start' });
                              }, 300);
                            }, 120);
                          }}
                          style={{ marginTop:6, display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:999, border:`1px solid ${track.color}50`, background:`${track.color}18`, color:track.color, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                          <Search size={11}/> {t?.searchYouTube||'Search on YouTube'}: {songRec.title}
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
                {chatLoading&&<div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:22, height:22, borderRadius:7, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}><Bot size={11} style={{ color:'white' }}/></div><div style={{ padding:'9px 13px', borderRadius:'4px 16px 16px 16px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', gap:5 }}>{[0,0.15,0.3].map((d,i)=>(<div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#818cf8', animation:`bounce 1.4s ease-in-out ${d}s infinite` }}/>))}</div></div>}
                <div ref={chatEndRef}/>
              </div>
            )}



            {/* Input area — only in chat view */}
            {aiSubView==='chat'&&(
            <div style={{ padding:'8px 16px 14px', flexShrink:0, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', gap:8 }}>
                <input
                  value={vibeInput && !vibeInput.startsWith('✨') ? vibeInput : input}
                  onChange={e=>{ const v=e.target.value; if(vibeInput&&!vibeInput.startsWith('✨')) setVibeInput(v); else setInput(v); }}
                  onKeyDown={e=>{ if(e.key==='Enter'){ if(vibeInput&&!vibeInput.startsWith('✨')){ if(!vibeLoading) searchVibe(); } else sendChat(); } }}
                  placeholder={vibeInput&&!vibeInput.startsWith('✨') ? (t?.vibeMoodPlaceholder||'"chill", "energetic morning", "sad but beautiful"…') : (t?.vibeInputPlaceholder||'Ask AI or type a mood…')}
                  style={{ flex:1, background:'rgba(255,255,255,0.07)', border:`1px solid rgba(255,255,255,0.12)`, borderRadius:12, padding:'9px 13px', fontSize:13, color:'white', outline:'none' }}/>
                {/* Mood send */}
                {vibeInput&&!vibeInput.startsWith('✨') ? (
                  <button onClick={()=>{ if(!vibeLoading) searchVibe(); }} disabled={vibeLoading||!vibeInput.trim()}
                    style={{ width:40, height:40, borderRadius:12, border:'none', background:vibeInput.trim()?track.color:'rgba(255,255,255,0.1)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:vibeLoading?0.5:1, flexShrink:0 }}>
                    {vibeLoading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <span style={{fontSize:15}}>🔮</span>}
                  </button>
                ) : (
                  <button onClick={sendChat} disabled={chatLoading||!input.trim()}
                    style={{ width:40, height:40, borderRadius:12, border:'none', background:input.trim()?track.color:'rgba(255,255,255,0.1)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:chatLoading?0.5:1, flexShrink:0 }}>
                    {chatLoading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <Send size={15}/>}
                  </button>
                )}
              </div>
            </div>
            )}
          </div>
        )}
      </main>
      </div>{/* end flex row wrapper */}

      {/* ══ BOTTOM NAV — Mobile Portrait only */}
      {layoutMode === 'mobile-portrait' && !fullscreen && (
        <div style={{ position:'relative', zIndex:10, flexShrink:0, display:'flex', flexDirection:'column', background:'rgba(7,7,26,0.97)', ...(isLite ? {} : { backdropFilter:'blur(20px)' }), borderTop:'1px solid rgba(255,255,255,0.08)' }}>

          {/* Mini Now-Playing Bar — visible when NOT on player tab */}
          {tab !== 'player' && (
            <div onClick={()=>setTab('player')} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 14px 6px', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.06)', background: embedTrack ? 'rgba(255,68,68,0.07)' : `${track.color}0a` }}>
              {/* Cover / icon */}
              {embedTrack
                ? <div style={{ width:36, height:36, borderRadius:9, background:'rgba(255,68,68,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>▶</div>
                : track.isRadio
                  ? <div style={{ width:36, height:36, borderRadius:9, background:`${track.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative' }}>
                      <Radio size={15} color={track.color}/>
                      {playing && <div style={{ position:'absolute', top:3, right:3, width:5, height:5, borderRadius:'50%', background:track.color, animation:'pulse 1.2s infinite' }}/>}
                    </div>
                  : isLite
                    ? <div style={{ width:36, height:36, borderRadius:9, background:track.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Music size={15} color={track.color}/></div>
                    : <img src={getCover(track)} style={{ width:36, height:36, borderRadius:9, objectFit:'cover', flexShrink:0 }}/>
              }
              {/* Track info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'rgba(255,255,255,0.95)' }}>
                  {embedTrack ? embedTrack.title : track.title}
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {embedTrack ? (embedTrack.type==='youtube' ? '▶ YouTube' : '☁️ SoundCloud') : track.isRadio ? `📻 ${track.artist}` : `${track.artist} — ${t?.miniPlayerHint||'Tap for player'}`}
                </div>
              </div>
              {/* Playback indicator */}
              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                {playing
                  ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:14 }}>{[10,5,8].map((h,i)=>(<div key={i} style={{ width:3, height:h, background:embedTrack?.type==='youtube'?'#ff4444':embedTrack?.type==='soundcloud'?'#ff5500':track.color, borderRadius:1, animation:`bounce 1.4s ease-in-out ${i*0.25}s infinite` }}/>))}</div>
                  : <div style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,0.2)' }}/>
                }
              </div>
            </div>
          )}

          {/* Tab bar — Stream, Playlist, AI */}
          <nav style={{ display:'flex', alignItems:'center', padding:'4px 8px', paddingBottom:'max(6px,env(safe-area-inset-bottom))' }}>
            {/* Player shortcut button — leftmost, compact */}
            <button onClick={()=>setTab('player')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'6px 10px', background:'none', border:'none', cursor:'pointer', color:tab==='player'?track.color:'rgba(255,255,255,0.35)', flexShrink:0 }}>
              <div style={{ padding:'3px 10px', borderRadius:999, background:tab==='player'?`${track.color}22`:'transparent' }}><Compass size={18}/></div>
              <span style={{ fontSize:9, fontWeight:tab==='player'?700:500, letterSpacing:'0.02em' }}>Player</span>
            </button>
            {/* Divider */}
            <div style={{ width:1, height:24, background:'rgba(255,255,255,0.08)', margin:'0 2px', flexShrink:0 }}/>
            {/* Stream, Playlist, AI */}
            {tabs.map(t=>{
              const active=tab===t.id;
              return (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'6px 0', background:'none', border:'none', cursor:'pointer', color:active?track.color:'rgba(255,255,255,0.35)' }}>
                  <div style={{ padding:'3px 12px', borderRadius:999, background:active?`${track.color}22`:'transparent' }}>{t.icon}</div>
                  <span style={{ fontSize:9, fontWeight:active?700:500, letterSpacing:'0.02em' }}>{t.label}</span>
                </button>
              );
            })}

          </nav>
        </div>
      )}

      {/* ══ MODALS */}
      {showPlModal&&<Suspense fallback={null}><PlaylistModal
        allSongs={allSongs}
        existing={editingPl}
        onClose={()=>{ setShowPlModal(false); setEditingPl(null); }}
        onSave={editingPl ? updatePlaylist : createPlaylist}
        isLite={isLite}
        t={t}
      /></Suspense>}

      {showUpload&&<Suspense fallback={null}><UploadModal onClose={()=>!uploading&&setShowUpload(false)} onUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress} color={track.color} isLite={isLite} t={t}/></Suspense>}

      {/* ══ YOUTUBE HIDDEN AUDIO IFRAME — persistent, single instance ══ */}
      {embedTrack && embedTrack.type === 'youtube' && (
        <iframe
          ref={ytIframeRef}
          key={embedTrack.videoId}
          src={`https://www.youtube.com/embed/${embedTrack.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
          title={embedTrack.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{ display:'none', width:1, height:1, border:'none', position:'fixed', bottom:-9999, left:-9999 }}
        />
      )}

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        @keyframes spin20{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes shareSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}

        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.9)}}
        @keyframes pulse-ring{0%{transform:scale(0.6);opacity:0.8}100%{transform:scale(1.3);opacity:0}}
        @keyframes twinkle{0%,100%{opacity:0.9}50%{opacity:0.35}}
        @keyframes twinkleB{0%,100%{opacity:0.55}50%{opacity:1}}
        @keyframes twinkleC{0%,100%{opacity:0.7}40%{opacity:0.2}80%{opacity:0.9}}
        .stars,.starsB,.starsC{position:absolute;inset:0;will-change:opacity}
        .stars{background-image:radial-gradient(1px 1px at 8% 12%,rgba(255,255,255,0.7),transparent),radial-gradient(1.5px 1.5px at 31% 45%,rgba(255,255,255,0.5),transparent),radial-gradient(1px 1px at 62% 23%,rgba(255,255,255,0.6),transparent),radial-gradient(2px 2px at 78% 67%,rgba(255,255,255,0.35),transparent),radial-gradient(1px 1px at 14% 71%,rgba(255,255,255,0.5),transparent),radial-gradient(1px 1px at 88% 18%,rgba(255,255,255,0.45),transparent),radial-gradient(1.5px 1.5px at 47% 89%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 55% 55%,rgba(255,255,255,0.3),transparent);animation:twinkle 4s ease-in-out infinite}
        .starsB{background-image:radial-gradient(1px 1px at 23% 6%,rgba(255,255,255,0.5),transparent),radial-gradient(1.5px 1.5px at 70% 38%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 5% 52%,rgba(255,255,255,0.55),transparent),radial-gradient(2px 2px at 91% 81%,rgba(255,255,255,0.3),transparent),radial-gradient(1px 1px at 38% 77%,rgba(255,255,255,0.45),transparent),radial-gradient(1px 1px at 66% 9%,rgba(255,255,255,0.35),transparent),radial-gradient(1.5px 1.5px at 18% 93%,rgba(255,255,255,0.3),transparent);animation:twinkleB 5.5s ease-in-out 1.8s infinite}
        .starsC{background-image:radial-gradient(1px 1px at 42% 31%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 83% 54%,rgba(255,255,255,0.5),transparent),radial-gradient(1.5px 1.5px at 11% 28%,rgba(255,255,255,0.35),transparent),radial-gradient(1px 1px at 75% 92%,rgba(255,255,255,0.3),transparent),radial-gradient(2px 2px at 29% 63%,rgba(255,255,255,0.25),transparent),radial-gradient(1px 1px at 58% 4%,rgba(255,255,255,0.5),transparent);animation:twinkleC 7s ease-in-out 3.2s infinite}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        input::placeholder{color:rgba(148,163,184,0.35)}
        input[type=range]{cursor:pointer;height:4px;border-radius:999px}

        /* ══ LAYOUT MODE — Mobile Portrait ══ */
        .layout-mobile-portrait header {
          background: rgba(7,7,26,0.95);
          backdrop-filter: blur(12px);
        }

        /* ══ LAYOUT MODE — Mobile Landscape ══ */
        .layout-mobile-landscape header {
          background: linear-gradient(90deg, rgba(7,7,26,0.98) 0%, rgba(15,10,40,0.95) 100%);
          backdrop-filter: blur(16px);
          border-bottom-color: rgba(255,255,255,0.05);
        }
        /* In mobile-landscape: player inner layout is row, ring left, controls right */
        .layout-mobile-landscape main {
          overflow-y: auto;
        }

        /* ══ LAYOUT MODE — Desktop Portrait ══ */
        .layout-desktop-portrait header {
          background: rgba(5,5,20,0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        /* Desktop portrait sidebar gets a subtle gradient separator */
        .layout-desktop-portrait [data-sidebar] {
          background: linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.12) 100%);
        }

        /* ══ LAYOUT MODE — Desktop Landscape ══ */
        .layout-desktop-landscape header {
          background: rgba(4,4,18,0.88);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(99,102,241,0.12);
          box-shadow: 0 1px 0 rgba(99,102,241,0.06);
        }

        /* ══ LITE MODE: matikan semua animasi, transisi, dan efek boros GPU ══ */
          .lite-mode *{
            animation:none!important;
            transition:none!important;
            backdrop-filter:none!important;
            -webkit-backdrop-filter:none!important;
            will-change:auto!important;
            text-shadow:none!important;
          }
          .lite-mode .progress-arc{transition:stroke-dashoffset 0.35s linear!important}
          .lite-mode input[type=range]::-webkit-slider-thumb{box-shadow:none!important}
          .lite-mode input[type=range]::-moz-range-thumb{box-shadow:none!important}
          .lite-mode input[type=range]::-ms-thumb{box-shadow:none!important}
          /* Matikan backdrop-filter dari layout-mode header rules */
          .lite-mode header{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:rgba(7,7,26,0.98)!important}
          /* Matikan box-shadow glow dekoratif di tombol */
          .lite-mode button{box-shadow:none!important}
          /* Matikan filter drop-shadow di SVG orbital ring */
          .lite-mode svg *{filter:none!important}
          /* Hemat GPU: matikan image-rendering interpolasi mahal */
          .lite-mode img{image-rendering:auto;filter:none!important}
          /* content-visibility: auto — browser skip render row di luar viewport (berlaku di semua mode) */
          [data-songrow]{content-visibility:auto;contain-intrinsic-size:0 62px}
          /* Kurangi paint area: hilangkan gradients dekoratif */
          .lite-mode [data-gradient]{background:rgba(255,255,255,0.04)!important}
          /* Pause semua animasi saat tab tidak aktif (hemat baterai background tab) */
          .page-hidden *{animation-play-state:paused!important}

          /* ══ PRO MODE: kurangi animasi dekoratif yang tidak perlu ══ */
          /* Bintang twinkle — boros GPU */
          .pro-mode .stars{animation:none}
          .pro-mode .starsB{animation:none}
          .pro-mode .starsC{animation:none}
          /* pulse di dot & indikator — ganti ke versi pelan */
          @keyframes pulse-subtle{0%,100%{opacity:1}50%{opacity:0.7}}
          .pro-mode [style*="pulse 1s"]{animation:pulse-subtle 2.5s ease-in-out infinite!important}
          .pro-mode [style*="pulse 1.2s"]{animation:pulse-subtle 2.5s ease-in-out infinite!important}
          .pro-mode [style*="pulse 1.4s"]{animation:pulse-subtle 3s ease-in-out infinite!important}
          .pro-mode [style*="pulse 2s"]{animation:pulse-subtle 3.5s ease-in-out infinite!important}
          /* bounce bar equalizer — versi pelan */
          @keyframes bounce-subtle{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
          .pro-mode [style*="bounce 0.8s"]{animation:bounce-subtle 1.6s ease-in-out var(--d,0s) infinite!important}
          /* transition — cap di 0.15s */
          .pro-mode [style*="transition:all 0.3s"]{transition:all 0.15s!important}
          .pro-mode [style*="transition: all 0.3s"]{transition:all 0.15s!important}
      `}</style>
    </div>
  );
}


