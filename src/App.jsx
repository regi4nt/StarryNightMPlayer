import React, { useState, useEffect, useRef, useCallback, useReducer, useMemo, lazy, Suspense } from 'react';
// ── Optimasi: reducers & memoized values
import {
  searchReducer, searchInitialState,
  radioReducer, radioInitialState,
  playerReducer, playerInitialState,
  uiReducer, uiInitialState,
  lyricsReducer, lyricsInitialState,
} from './reducers.js';
import {
  useAllSongs, useAllSongIds, useDisplayedSongs,
  useFilteredPlaylists, useCachedIdSets,
  useWsAudioItems, useSortedWsResults, useRbMergedResults,
} from './useMemoizedValues.js';
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
  Download, Share2, Wand2, Copy, Check, Star, Eye
} from 'lucide-react';

// ── Split modules ────────────────────────────────────────
import { T } from './translations.js';
import {
  openNewTab, STREAMING_PLATFORMS, MUSIC_SOURCES, SONGS, builtinSongs,
  getStreamingPlatforms, getStreamingPlatformsSync,
  GOOGLE_CLIENT_ID, GOOGLE_SCOPES, DRIVE_FOLDER, SONG_COLORS, COVERS,
  randItem, SLEEP_OPTIONS, PIPED_INSTANCES, INVIDIOUS_INSTANCES,
  buildInvidiousUrl, buildPipedUrl, getProviders, radioUrl,
  setRuntimeKeys, setLastWinnerLabel,
  getSpId, getSpSecret, getScId,
  getUserAiKey, getUserDsKey, getUserGrokKey, getUserHfKey, getUserCfKey, getUserGhKey, getUserSnKey,
  getYtKey, isYtApiEnabled, setServerYtKeyStatus,
  SP_CLIENT_ID, SP_CLIENT_SECRET, SC_CLIENT_ID,
  askAI, askAIRace, activeModel, hasKey,
  AUDIO_EXTS, isAudioExt, AUDIO_MIME_EXTRAS, guessMime,
  fmt, fmtSec, isPhoneDevice,
  markFullyCached, checkCachedBlob,
  _driveCache, _blobCache, DRIVE_CACHE_NAME, DRIVE_CACHE_TTL, YT_CACHE_NAME, FAV_CACHE_NAME,
  btn, driveListSongs, drivePrefetch,
  searchSpotify, searchSoundCloud,
  downloadYtAudio, downloadToDevice, downloadFavAudio, favCacheGet, favCacheDelete,
  ytCacheGet, downloadBlobToDevice,
  cacheGet, driveStreamBlob, driveStreamLite, driveDownloadBlob, driveUploadSong,
  driveSavePlaylists, driveLoadPlaylists,
} from './constants.js';

// ── Lazy-loaded components ────────────────────────────────
import { PlatformLogo } from './components/PlatformLogo.jsx'; // eager — used in stream tab
// Stale-chunk guard: if a dynamic import fails (e.g. after a new deployment invalidates
// old content-hashed filenames), reload the page so the browser fetches fresh assets.
const reloadOnStalChunk = (err) => {
  const msg = err?.message || '';
  const isStaleChunk =
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module');
  if (isStaleChunk) {
    window.location.reload();
    return new Promise(() => {});
  }
  // Error lain (runtime error di dalam komponen) — lempar ulang agar
  // ditangani normal oleh error boundary, bukan reload paksa
  throw err;
};

const PlaylistFormView    = lazy(() => import('./components/PlaylistViews.jsx').then(m => ({ default: m.PlaylistFormView })).catch(reloadOnStalChunk));
const PlaylistModal       = lazy(() => import('./components/PlaylistViews.jsx').then(m => ({ default: m.PlaylistModal })).catch(reloadOnStalChunk));
// Error Boundaries MUST be eagerly imported — React.lazy() can't wrap them because
// the boundary must be synchronously available when a child throws during render.
import { PlaylistErrorBoundary } from './components/PlaylistViews.jsx';
// AppLogo & OrbitalRing are critical player UI — eager import
import { AppLogo, OrbitalRing } from './components/Player.jsx';
// SongRow hanya muncul di tab Library/Playlist (bukan initial render) — lazy aman
const SongRow        = lazy(() => import('./components/SongRow.jsx').then(m => ({ default: m.SongRow })).catch(reloadOnStalChunk));
const SettingsPanel  = lazy(() => import('./components/SettingsPanel.jsx').then(m => ({ default: m.SettingsPanel })).catch(reloadOnStalChunk));
const UploadModal    = lazy(() => import('./components/UploadModal.jsx').then(m => ({ default: m.UploadModal })).catch(reloadOnStalChunk));

// ── Suspense fallback ─────────────────────────────────────
const Spinner = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:24, color:'rgba(255,255,255,0.3)' }}>
    <Loader2 size={20} style={{ animation:'spin 1s linear infinite' }} />
  </div>
);
const wrap = (node) => <Suspense fallback={<Spinner />}>{node}</Suspense>;

// ── Layout constants — single source of truth, used in both calc() and JSX render
const SIDEBAR_W_LANDSCAPE = 196;  // desktop-landscape sidebar width
const SIDEBAR_W_PORTRAIT  = 160;  // desktop-portrait sidebar width
const HEADER_H_NORMAL     = 46;   // header height (all modes except mobile-landscape)
const HEADER_H_LANDSCAPE  = 34;   // header height for mobile-landscape (slimmer padding)

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
  const customDnsRef = useRef(customDns);
  useEffect(() => { customDnsRef.current = customDns; }, [customDns]);
  // ── User API keys (localStorage persisted)
  const [userSpId,     setUserSpId]     = useState(() => localStorage.getItem('sn_sp_id')    ||'');
  const [userSpSecret, setUserSpSecret] = useState(() => localStorage.getItem('sn_sp_secret')||'');
  const [userScId,     setUserScId]     = useState(() => localStorage.getItem('sn_sc_id')    ||'');
  const [userAiKey,    setUserAiKey]    = useState(() => localStorage.getItem('sn_ai_key')   ||'');
  const [userYtKey,    setUserYtKey]    = useState(() => localStorage.getItem('sn_yt_key')   ||'');
  const [userCfKey,    setUserCfKey]    = useState(() => localStorage.getItem('sn_cf_key')   ||'');
  const [userSnKey,    setUserSnKey]    = useState(() => localStorage.getItem('sn_sn_key')   ||'');
  // FIX Bug #4: tambahkan state userDsKey & userGrokKey agar key dari Settings
  // benar-benar diteruskan ke setRuntimeKeys (sebelumnya slot ini selalu '' / diabaikan).
  const [userDsKey,    setUserDsKey]    = useState(() => { try { return localStorage.getItem('sn_ds_key')   ||''; } catch { return ''; } });
  const [userGrokKey,  setUserGrokKey]  = useState(() => { try { return localStorage.getItem('sn_grok_key') ||''; } catch { return ''; } });
  useEffect(() => { setRuntimeKeys(userSpId, userSpSecret, userScId, userAiKey, userDsKey, userGrokKey, userYtKey, '', userCfKey, '', userSnKey); }, [userSpId, userSpSecret, userScId, userAiKey, userDsKey, userGrokKey, userYtKey, userCfKey, userSnKey]);

  // ── Startup: cek apakah server punya YOUTUBE_API_KEY (via /api/yt-status)
  // Ini memungkinkan isYtApiEnabled() = true meskipun user tidak input key sendiri
  useEffect(() => {
    fetch('/api/yt-status')
      .then(r => r.json())
      .then(d => { if (d.hasKey) setServerYtKeyStatus(true); })
      .catch(() => {}); // gagal = tetap pakai fallback Invidious/Piped
  }, []);

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
  const ytShufflePlayedRef = useRef(null); // Set of played indices in current shuffle session
  const ytProgressRef   = useRef(0);   // mirror of ytProgress for use in intervals
  const ytDurationRef   = useRef(0);   // mirror of ytDuration for use in intervals
  const playYouTubeRef  = useRef(null); // always-fresh ref to playYouTube
  const ytDlTriggerRef  = useRef(null); // forward-ref ke triggerYtDownload (di-set setelah didefinisikan)
  const ytEndedFiredRef = useRef(false); // prevent double-fire of ytNext on video end
  const ytRepeatSeekingRef = useRef(false); // true selama seekTo(0) untuk repeat-one (blokir ended palsu)
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
  // ── YouTube search mode: 'video' | 'channel' | 'playlist' | 'genre'
  const [ytSearchMode, setYtSearchMode] = useState('video');
  // Genre list untuk YT search mode 'genre'
  const YT_GENRES = [
    { id: 'pop',       label: '🎵 Pop',        query: 'pop music hits' },
    { id: 'rock',      label: '🎸 Rock',       query: 'rock music hits' },
    { id: 'hiphop',    label: '🎤 Hip-Hop',    query: 'hip hop rap music' },
    { id: 'rnb',       label: '🎶 R&B',        query: 'rnb soul music' },
    { id: 'jazz',      label: '🎷 Jazz',       query: 'jazz music' },
    { id: 'classical', label: '🎻 Classical',  query: 'classical music orchestral' },
    { id: 'electronic',label: '🎛 Electronic', query: 'electronic dance music edm' },
    { id: 'indie',     label: '🌿 Indie',      query: 'indie alternative music' },
    { id: 'kpop',      label: '🇰🇷 K-Pop',    query: 'kpop korean music' },
    { id: 'lofi',      label: '🌙 Lo-fi',      query: 'lofi hip hop chill beats' },
    { id: 'metal',     label: '🤘 Metal',      query: 'metal rock heavy music' },
    { id: 'acoustic',  label: '🪕 Acoustic',   query: 'acoustic guitar music' },
    { id: 'latin',     label: '🌴 Latin',      query: 'latin music reggaeton' },
    { id: 'country',   label: '🤠 Country',    query: 'country music' },
    { id: 'gospel',    label: '✝️ Gospel',     query: 'gospel worship music' },
    { id: 'dangdut',   label: '🇮🇩 Dangdut',  query: 'dangdut indonesia terbaru' },
  ];

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
  const [rbAiResults, setRbAiResults]   = useState([]); // AI-suggested stations fallback
  const [rbAiLoading, setRbAiLoading]   = useState(false);

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
  const wsQueueRef    = useRef([]);   // current ws native audio queue
  const wsQueueIdxRef = useRef(-1);
  const wsAbortRef    = useRef(null); // abort controller untuk doWebSearch aktif
  // FIX Bug #6: cobaltLoading sebelumnya adalah state object { url: 'loading'|'error'|null }
  // yang tidak pernah menghapus key — hanya set ke null. Dalam sesi panjang dengan banyak
  // hasil pencarian, object ini mengakumulasi ribuan key URL dan memperlambat setiap render.
  //
  // Diganti dengan dua Set (ref) + satu counter state untuk memicu re-render minimal:
  //   cobaltLoadingSet  — Set of URLs yang sedang loading
  //   cobaltErrorSet    — Set of URLs yang error sementara
  // Set tidak masuk ke closure React sehingga tidak memicu re-render saat berubah;
  // setCobaltTick() dipanggil setelah mutasi untuk memicu satu re-render.
  const cobaltLoadingSet = useRef(new Set());
  const cobaltErrorSet   = useRef(new Set());
  const [, setCobaltTick] = useState(0);
  const cobaltTick = useCallback(() => setCobaltTick(n => n + 1), []);
  // Helper: baca status per URL (menggantikan cobaltLoading[url])
  const cobaltStatus = useCallback((url) =>
    cobaltLoadingSet.current.has(url) ? 'loading'
    : cobaltErrorSet.current.has(url) ? 'error'
    : null
  , []);
  const audiusHostRef = useRef(null); // cache Audius host agar tidak di-fetch ulang

  const doWebSearch = async (q) => {
    if (!q.trim()) return;

    // ── Batalkan pencarian sebelumnya jika masih jalan
    if (wsAbortRef.current) { wsAbortRef.current.abort(); }
    const ctrl = new AbortController();
    wsAbortRef.current = ctrl;
    const sig = ctrl.signal;

    setWsLoading(true); setWsError(null); setWsResults([]); setWsEmbedUrl(null); setSpWsEmbedId(null);

    // Helper: fetch dengan timeout + abort signal (compat semua browser)
    const ft = (url, ms = 5000, opts = {}) => {
      const tCtrl = new AbortController();
      const tid = setTimeout(() => tCtrl.abort(), ms);
      // Batalkan timeout timer jika global abort duluan
      sig.addEventListener('abort', () => { clearTimeout(tid); tCtrl.abort(); }, { once: true });
      return fetch(url, { ...opts, signal: tCtrl.signal }).finally(() => clearTimeout(tid));
    };

    // Helper: deduplikasi hasil berdasarkan title+artist (case-insensitive)
    const dedup = (arr) => {
      const seen = new Set();
      return arr.filter(item => {
        if (!item.title) return true;
        const key = `${item.title}|${item.artist||''}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
    };

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
      const archiveM     = q.match(/archive\.org(?:\/(?:details|embed|download))?\/([^/?#]+)/);
      const audiomackM   = q.match(/audiomack\.com\/(song|album|playlist)\/([^/?#]+)\/([^/?#]+)/i);
      const mixcloudM    = q.match(/mixcloud\.com\/([^/?#]+\/[^/?#]+)/i);
      const odyseeM      = q.match(/odysee\.com\/@([^/]+)\/(([^:]+):([a-f0-9]+))/i);
      const rumbleM      = q.match(/rumble\.com\/embed\/([a-z0-9]+)|rumble\.com\/([a-z0-9-]+-[a-z0-9]+)\.html/i);
      const peertubeMInst = q.match(/https?:\/\/([^/]+)\/videos\/watch\/([a-f0-9-]{36})/i);
      const newgroundsM  = q.match(/newgrounds\.com\/audio\/listen\/(\d+)/i);
      const fmaM         = q.match(/freemusicarchive\.org\/(?:music|listen)\/([^?#]+)/i);

      // ── Social media video URL detection
      const facebookM    = q.match(/(?:facebook\.com|fb\.watch)\/(?:watch\/?\?v=(\d+)|(?:reel|video)\/(\d+)|.*\/videos\/(?:\d+\/)?(\d+))/i);
      const instagramM   = q.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
      const tiktokM      = q.match(/(?:tiktok\.com\/@[^/]+\/video\/(\d+)|vm\.tiktok\.com\/([A-Za-z0-9]+))/i);
      const twitterM     = q.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/i);
      const threadsM     = q.match(/threads\.net\/@([^/]+)\/post\/([A-Za-z0-9_-]+)/i);

      if (facebookM) {
        const fbVideoId = facebookM[1] || facebookM[2] || facebookM[3];
        const embedUrl = fbVideoId
          ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(q)}&width=500&show_text=false`
          : null;
        setWsResults([{
          type: 'facebook', source: 'facebook',
          embedUrl: embedUrl || null,
          externalUrl: q,
          title: 'Facebook Video',
          artist: 'Facebook',
          thumbnail: null,
        }]);
        setWsLoading(false); return;
      }
      if (instagramM) {
        const shortcode = instagramM[1];
        setWsResults([{
          type: 'instagram', source: 'instagram',
          embedUrl: `https://www.instagram.com/p/${shortcode}/embed/`,
          externalUrl: q,
          title: 'Instagram Post',
          artist: 'Instagram',
          thumbnail: null,
        }]);
        setWsLoading(false); return;
      }
      if (tiktokM) {
        const videoId = tiktokM[1];
        setWsResults([{
          type: 'tiktok', source: 'tiktok',
          embedUrl: videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : null,
          externalUrl: q,
          title: 'TikTok Video',
          artist: 'TikTok',
          thumbnail: null,
        }]);
        setWsLoading(false); return;
      }
      if (twitterM) {
        const [, tweetUser, tweetId] = twitterM;
        setWsResults([{
          type: 'twitter', source: 'twitter',
          embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
          externalUrl: q,
          title: `Tweet oleh @${tweetUser}`,
          artist: 'Twitter / X',
          thumbnail: null,
        }]);
        setWsLoading(false); return;
      }
      if (threadsM) {
        const [, threadsUser, threadsPostId] = threadsM;
        setWsResults([{
          type: 'threads', source: 'threads',
          embedUrl: `https://www.threads.net/@${threadsUser}/post/${threadsPostId}/embed`,
          externalUrl: q,
          title: `Threads oleh @${threadsUser}`,
          artist: 'Threads',
          thumbnail: null,
        }]);
        setWsLoading(false); return;
      }

      // ── Bilibili — BV/AV ID
      const bilibiliM = q.match(/bilibili\.com\/video\/(BV[A-Za-z0-9]+|av(\d+))/i);
      if (bilibiliM) {
        const bvid = bilibiliM[1]; // e.g. BV1xx411c7mD
        const avid = bilibiliM[2]; // e.g. 12345 (jika av format)
        const embedSrc = bvid.startsWith('BV')
          ? `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0`
          : `https://player.bilibili.com/player.html?aid=${avid}&page=1&high_quality=1&danmaku=0`;
        setWsResults([{
          type: 'bilibili', source: 'bilibili',
          embedUrl: embedSrc,
          externalUrl: q,
          title: `Bilibili: ${bvid}`,
          artist: 'Bilibili',
          thumbnail: null,
        }]);
        setWsLoading(false); return;
      }

      // ── Vidio.com (platform streaming Indonesia)
      // Format URL: https://www.vidio.com/watch/<video_id>-<slug>
      //             https://www.vidio.com/watch/<video_id>
      const vidioM = q.match(/vidio\.com\/watch\/(\d+)/i);
      if (vidioM || q.includes('vidio.com')) {
        const vidioId = vidioM ? vidioM[1] : null;
        setWsResults([{
          type: 'vidio', source: 'vidio',
          embedUrl: vidioId ? `https://www.vidio.com/embed/${vidioId}` : null,
          externalUrl: q,
          title: vidioId ? `Vidio Video #${vidioId}` : 'Vidio Video',
          artist: 'Vidio',
          thumbnail: null,
        }]);
        setWsLoading(false); return;
      }

      if (vimeoM) {
        const vid = vimeoM[1];
        let title = 'Vimeo Video', thumb = `https://vumbnail.com/${vid}.jpg`;
        try { const oe = await ft(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(q)}&width=400`, 4000); if (oe.ok) { const d = await oe.json(); title = d.title||title; thumb = d.thumbnail_url||thumb; } } catch {}
        setWsResults([{ type:'vimeo', embedUrl:`https://player.vimeo.com/video/${vid}?autoplay=0`, title, artist:'Vimeo', thumbnail:thumb, source:'vimeo' }]);
        setWsLoading(false); return;
      }
      if (dailymotionM) {
        const dmId = dailymotionM[1];
        let title = 'Dailymotion Video', thumb = `https://www.dailymotion.com/thumbnail/video/${dmId}`;
        try { const oe = await ft(`https://www.dailymotion.com/services/oembed?url=${encodeURIComponent(q)}&format=json`, 4000); if (oe.ok) { const d = await oe.json(); title = d.title||title; thumb = d.thumbnail_url||thumb; } } catch {}
        setWsResults([{ type:'dailymotion', embedUrl:`https://www.dailymotion.com/embed/video/${dmId}?autoplay=0`, title, artist:'Dailymotion', thumbnail:thumb, source:'dailymotion' }]);
        setWsLoading(false); return;
      }
      if (archiveM) {
        const identifier = archiveM[1];
        setWsResults([{ type:'archive', embedUrl:`https://archive.org/embed/${identifier}`, title:identifier, artist:'archive.org', thumbnail:`https://archive.org/services/img/${identifier}`, source:'archive', identifier }]);
        setWsLoading(false); return;
      }
      if (audiomackM) {
        let embedUrl = null, title = audiomackM[3].replace(/-/g,' '), thumb = null;
        try { const oe = await ft(`https://audiomack.com/oembed?url=${encodeURIComponent(q)}&format=json`, 4000); if (oe.ok) { const d = await oe.json(); title = d.title||title; thumb = d.thumbnail_url||null; const src = d.html?.match(/src="([^"]+)"/)?.[1]; if (src) embedUrl = src; } } catch {}
        if (!embedUrl) embedUrl = `https://audiomack.com/embed/${audiomackM[1]}/${audiomackM[2]}/${audiomackM[3]}`;
        setWsResults([{ type:'audiomack', embedUrl, title, artist:audiomackM[2], thumbnail:thumb, source:'audiomack' }]);
        setWsLoading(false); return;
      }
      if (mixcloudM) {
        const key = mixcloudM[1];
        let title = key.replace(/\//g,' – '), thumb = null;
        try { const oe = await ft(`https://www.mixcloud.com/oembed/?url=${encodeURIComponent(q)}&format=json`, 4000); if (oe.ok) { const d = await oe.json(); title = d.title||title; thumb = d.thumbnail_url||null; } } catch {}
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

      // ── Keyword search: semua sumber paralel dengan abort & dedup ────────────

      // Archive.org — sort by downloads, batasi 4 hasil, timeout 5 detik
      const archivePromise = (async () => {
        try {
          const r = await ft(
            `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}+AND+mediatype:(audio)&fl[]=identifier,title,creator&sort[]=downloads+desc&rows=4&output=json`,
            5000
          );
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

      // Jamendo — timeout 5 detik
      const jamendoPromise = (async () => {
        try {
          const r = await ft(`/api/jamendo?search=${encodeURIComponent(q)}&limit=5`, 5000);
          if (!r.ok) return [];
          const d = await r.json();
          return (d.results || []).map(t => ({
            type:'jamendo', audioUrl:t.audio, title:t.name, artist:t.artist_name,
            thumbnail:t.image, source:'jamendo', duration:t.duration, id:t.id,
          }));
        } catch { return []; }
      })();

      // ccMixter — timeout 5 detik
      const ccmixtPromise = (async () => {
        try {
          const r = await ft(`/api/ccmixter?title=${encodeURIComponent(q)}&limit=5`, 5000);
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

      // Audius — cache host agar tidak fetch ulang setiap pencarian
      const scPublicPromise = !scHasKey ? (async () => {
        try {
          if (!audiusHostRef.current) {
            try {
              const hRes = await ft('https://api.audius.co', 2500);
              if (hRes.ok) { const hData = await hRes.json(); audiusHostRef.current = (hData.data?.[0] || 'https://discoveryprovider.audius.co').replace(/\/$/, ''); }
            } catch {}
            if (!audiusHostRef.current) audiusHostRef.current = 'https://discoveryprovider.audius.co';
          }
          const audiusHost = audiusHostRef.current;
          const r = await ft(`${audiusHost}/v1/tracks/search?query=${encodeURIComponent(q)}&limit=5&app_name=StarryNightPlayer`, 5000);
          if (!r.ok) throw new Error('audius failed');
          const d = await r.json();
          const tracks = (d.data || []).filter(t => t.id); // semua track valid
          if (tracks.length === 0) throw new Error('no audius results');
          return tracks.slice(0, 5).map(t => ({
            type:'sc_track', id:`audius_${t.id}`, title:t.title,
            artist:t.user?.name||t.user?.handle||'Audius', duration:t.duration||0,
            thumbnail:t.artwork?.['150x150']||t.artwork?.['480x480']||null,
            permalinkUrl:`https://audius.co${t.permalink||''}`,
            streamUrl:`${audiusHost}/v1/tracks/${t.id}/stream?app_name=StarryNightPlayer`,
            audioUrl:`${audiusHost}/v1/tracks/${t.id}/stream?app_name=StarryNightPlayer`,
            source:'audius',
          }));
        } catch {}
        return []; // Audius tidak ada hasil, biarkan merged logic pakai sc_embed
      })() : Promise.resolve([]);

      // Deezer — timeout 5 detik
      const spPublicPromise = !spHasKey ? (async () => {
        try {
          const r = await ft(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=5&output=json`, 5000);
          if (!r.ok) throw new Error('deezer failed');
          const d = await r.json();
          const tracks = (d.data || []).filter(t => t.preview);
          if (tracks.length === 0) throw new Error('no deezer results');
          return tracks.slice(0, 5).map(t => ({
            type:'sp_track', id:`deezer_${t.id}`, title:t.title,
            artist:t.artist?.name||'Deezer', duration:(t.duration||0)*1000,
            cover:t.album?.cover_medium||t.album?.cover||null,
            previewUrl:t.preview||null,
            spotifyUrl:t.link||`https://www.deezer.com/track/${t.id}`,
            source:'deezer',
          }));
        } catch {}
        return []; // Deezer tidak ada hasil, biarkan merged logic pakai sp_embed
      })() : Promise.resolve([]);

      // SoundCloud & Spotify API (jika ada key)
      const scPromise = scHasKey ? (async () => {
        try { const items = await searchSoundCloud(q, 5); return (items||[]).map(t=>({...t,source:'soundcloud',type:'soundcloud'})); } catch { return []; }
      })() : Promise.resolve([]);
      const spPromise = spHasKey ? (async () => {
        try { const items = await searchSpotify(q, 5); return (items||[]).map(t=>({...t,source:'spotify',type:'spotify_track'})); } catch { return []; }
      })() : Promise.resolve([]);

      // Jalankan semua paralel — tidak ada yang saling menunggu
      const [archRes, jamRes, ccRes, scWsRes, spWsRes, scPubRes, spPubRes] = await Promise.all([
        archivePromise, jamendoPromise, ccmixtPromise,
        scPromise, spPromise, scPublicPromise, spPublicPromise,
      ]);

      if (sig.aborted) { setWsLoading(false); return; } // pencarian dibatalkan karena ada query baru

      // ── Susun hasil: sumber lain dulu, SC & SP paling bawah ──
      const merged = [];

      // Interleave sumber lain terlebih dahulu
      const maxLen = Math.max(archRes.length, jamRes.length, ccRes.length);
      for (let i = 0; i < maxLen; i++) {
        if (jamRes[i])  merged.push(jamRes[i]);
        if (archRes[i]) merged.push(archRes[i]);
        if (ccRes[i])   merged.push(ccRes[i]);
      }

      // SC & SP ditaruh paling bawah
      if (scHasKey && scWsRes.length > 0) merged.push({ type:'sc_section', source:'soundcloud_section', _items: scWsRes });
      else if (!scHasKey && scPubRes.length > 0) merged.push({ type:'sc_section', source:'soundcloud_section', _items: scPubRes });
      else merged.push({ type:'sc_embed', source:'soundcloud_embed', query: q });

      if (spHasKey && spWsRes.length > 0) merged.push({ type:'sp_section', source:'spotify_section', _items: spWsRes });
      else if (!spHasKey && spPubRes.length > 0) merged.push({ type:'sp_section', source:'spotify_section', _items: spPubRes });
      else merged.push({ type:'sp_embed', source:'spotify_embed', query: q });

      // Dedup merged (kecuali section/embed items yang sudah berbeda struktur)
      const dedupedMerged = merged.map(item => {
        if (item._items) return { ...item, _items: dedup(item._items) };
        return item;
      });

      const hasRealResults = archRes.length+jamRes.length+ccRes.length+scWsRes.length+spWsRes.length
        +scPubRes.length
        +spPubRes.length > 0;

      setWsResults(dedupedMerged);
      if (!hasRealResults && dedupedMerged.every(m=>m.type==='sc_embed'||m.type==='sp_embed')) {
        setWsError('No results from other sources. SoundCloud & Spotify shown as embeds.');
      }
    } catch(e) {
      if (sig.aborted) { setWsLoading(false); return; } // jangan set error jika memang sengaja di-abort
      setWsError('Pencarian gagal: ' + (e.message||'error'));
    }
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

  // ── YT Search cache (sessionStorage, TTL 5 menit)
  const YT_SEARCH_CACHE_TTL = 5 * 60 * 1000;
  // Kunci dinormalisasi (lowercase+trim) agar "Coldplay" dan "coldplay" share cache
  const ytCacheKey = (q) => 'sn_yts_' + q.trim().toLowerCase();
  const ytSearchCacheGet = (query) => {
    try {
      const raw = sessionStorage.getItem(ytCacheKey(query));
      if (!raw) return null;
      const { ts, items } = JSON.parse(raw);
      if (Date.now() - ts > YT_SEARCH_CACHE_TTL) { sessionStorage.removeItem(ytCacheKey(query)); return null; }
      return items;
    } catch { return null; }
  };
  // ── Verifikasi batch apakah videoId benar-benar bisa diputar via oEmbed
  // oEmbed YouTube: gratis, tanpa API key, return error jika video tidak bisa embed
  // Dijalankan background setelah hasil tampil — update UI jika ada yang gagal
  // FIX Bug 3: checks are now truly parallel via Promise.allSettled
  // FIX Bug 4: originalQuery param captures query at call-time, prevents stale cache key
  const verifyYtPlayableBatch = async (items, platformId, originalQuery) => {
    if (!items || items.length === 0) return;
    // Ambil yang belum diverifikasi (isPlayable masih undefined)
    const unverified = items.filter(v => v.isPlayable === undefined && v.videoId);
    if (unverified.length === 0) return;
    // FIX Bug 6: BATCH dikurangi dari 15 → 10 agar tidak flood oEmbed dan kena rate-limit
    // Rate-limit → semua timeout → semua dianggap OK → filter tidak efektif
    const BATCH = 10;
    const badIds = new Set();
    const checks = unverified.slice(0, BATCH).map(async (v) => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.videoId}&format=json`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (!res.ok) badIds.add(v.videoId); // 401/404 = tidak bisa embed
      } catch { /* timeout = asumsikan OK */ }
    });
    await Promise.allSettled(checks);
    if (badIds.size === 0) return;
    // Update state: hapus video yang tidak bisa diputar
    setYtResults(prev => {
      const cur = prev[platformId] || [];
      const filtered = cur.filter(v => !badIds.has(v.videoId));
      if (filtered.length === cur.length) return prev; // tidak ada perubahan
      const updated = { ...prev, [platformId]: filtered };
      // FIX Bug 4: gunakan originalQuery (captured saat dipanggil), bukan ytQuery[platformId] yang bisa stale
      ytSearchCacheSet(originalQuery || '', filtered);
      return updated;
    });
    // FIX Bug 3: sync ytQueueRef jika queue aktif mengandung video yang baru dihapus
    // Queue diambil snapshot saat user klik, sehingga tidak otomatis ikut state update.
    // Hapus badIds dari queue agar ytNext tidak skip ke video unplayable.
    if (badIds.size > 0 && ytQueueRef.current.length > 0) {
      const curQueue = ytQueueRef.current;
      const hasStale = curQueue.some(v => badIds.has(v.videoId));
      if (hasStale) {
        const cleanQueue = curQueue.filter(v => !badIds.has(v.videoId));
        // Hitung ulang index: cari posisi video yang sedang diputar di queue baru
        const currentVideoId = cleanQueue[ytQueueIdxRef.current]?.videoId
          ?? curQueue[ytQueueIdxRef.current]?.videoId;
        const newIdx = currentVideoId
          ? cleanQueue.findIndex(v => v.videoId === currentVideoId)
          : -1;
        ytQueueRef.current = cleanQueue;
        if (newIdx >= 0) ytQueueIdxRef.current = newIdx;
      }
    }
  };

  const ytSearchCacheSet = (query, items) => {
    try { sessionStorage.setItem(ytCacheKey(query), JSON.stringify({ ts: Date.now(), items })); } catch {}
  };

  // Fetch dengan timeout helper
  const fetchWithTimeout = (url, ms = 3000, opts = {}) => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(tid));
  };

  const searchViaYouTubeAPI = async (query, searchMode = 'video') => {
    const userKey = getYtKey();
    console.log('[YT] searchViaYouTubeAPI called, key:', userKey ? userKey.slice(0,8)+'…' : 'EMPTY', 'isEnabled:', isYtApiEnabled(), 'mode:', searchMode);
    if (!isYtApiEnabled()) return null;
    try {
      let res;

      // ── MODE: channel / profile ──────────────────────────────────────────
      if (searchMode === 'channel') {
        const params = userKey
          ? new URLSearchParams({ key: userKey, part: 'snippet', q: query, type: 'channel', maxResults: '10', fields: 'items(id/channelId,snippet/title,snippet/description,snippet/thumbnails/medium,snippet/customUrl)' })
          : new URLSearchParams({ action: 'search', q: query, type: 'channel', maxResults: '10' });
        const url = userKey
          ? `https://www.googleapis.com/youtube/v3/search?${params}`
          : `/api/youtube?${params}`;
        res = await fetchWithTimeout(url, 8000);
        if (res.status === 403 || res.status === 401) { const err = await res.json().catch(()=>({})); throw Object.assign(new Error('yt_api_auth'), { status: res.status, detail: err }); }
        if (!res.ok) return null;
        const data = await res.json();
        const ch = (data.items || []).filter(i => i.id?.channelId);
        if (ch.length === 0) return null;
        return ch.map(i => ({
          resultType: 'channel',
          channelId: i.id.channelId,
          title: i.snippet.title,
          uploaderName: i.snippet.title,
          description: i.snippet.description || '',
          customUrl: i.snippet.customUrl || '',
          thumbnail: i.snippet.thumbnails?.medium?.url || `https://yt3.googleusercontent.com/channel/${i.id.channelId}`,
          channelUrl: `https://www.youtube.com/channel/${i.id.channelId}`,
        }));
      }

      // ── MODE: playlist / album ───────────────────────────────────────────
      if (searchMode === 'playlist') {
        const params = userKey
          ? new URLSearchParams({ key: userKey, part: 'snippet', q: query, type: 'playlist', maxResults: '10', fields: 'items(id/playlistId,snippet/title,snippet/channelTitle,snippet/thumbnails/medium,snippet/description)' })
          : new URLSearchParams({ action: 'search', q: query, type: 'playlist', maxResults: '10' });
        const url = userKey
          ? `https://www.googleapis.com/youtube/v3/search?${params}`
          : `/api/youtube?${params}`;
        res = await fetchWithTimeout(url, 8000);
        if (res.status === 403 || res.status === 401) { const err = await res.json().catch(()=>({})); throw Object.assign(new Error('yt_api_auth'), { status: res.status, detail: err }); }
        if (!res.ok) return null;
        const data = await res.json();
        const pl = (data.items || []).filter(i => i.id?.playlistId);
        if (pl.length === 0) return null;
        return pl.map(i => ({
          resultType: 'playlist',
          playlistId: i.id.playlistId,
          title: i.snippet.title,
          uploaderName: i.snippet.channelTitle,
          description: i.snippet.description || '',
          thumbnail: i.snippet.thumbnails?.medium?.url || '',
          playlistUrl: `https://www.youtube.com/playlist?list=${i.id.playlistId}`,
        }));
      }

      // ── MODE: video (default) ────────────────────────────────────────────
      if (userKey) {
        // Direct ke Google — param minimal agar latency rendah
        const params = new URLSearchParams({
          key: userKey, part: 'snippet', q: query, type: 'video',
          videoCategoryId: '10', maxResults: '10',
          safeSearch: 'none',
          videoEmbeddable: 'true',
          videoSyndicated: 'true',
          fields: 'items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails/medium,snippet/liveBroadcastContent)',
        });
        res = await fetchWithTimeout(`https://www.googleapis.com/youtube/v3/search?${params}`, 6000);
      } else {
        const params = new URLSearchParams({
          action: 'search', q: query, maxResults: '10',
          videoDuration: 'any',
        });
        res = await fetchWithTimeout(`/api/youtube?${params}`, 8000);
      }
      // 403 = quota habis atau key invalid — throw agar caller bisa bedakan dari empty result
      if (res.status === 403 || res.status === 401) {
        const err = await res.json().catch(() => ({}));
        throw Object.assign(new Error('yt_api_auth'), { status: res.status, detail: err });
      }
      if (!res.ok) return null;
      const data = await res.json();
      // Filter: hanya video reguler (bukan live/upcoming) yang embeddable
      const items = (data.items || []).filter(i =>
        i.id?.videoId &&
        (!i.snippet?.liveBroadcastContent || i.snippet.liveBroadcastContent === 'none')
      );
      if (items.length === 0) return null;
      return items.map(i => ({
        videoId: i.id.videoId,
        title: i.snippet.title,
        uploaderName: i.snippet.channelTitle,
        duration: 0,
        isPlayable: true,
        thumbnail: i.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${i.id.videoId}/mqdefault.jpg`,
        url: `/watch?v=${i.id.videoId}`,
      }));
    } catch (e) {
      if (e.message === 'yt_api_auth') throw e;
      return null;
    }
  };

  const searchViaPiped = async (query, searchMode = 'video') => {
    // Mode channel/playlist: Piped supports channel/playlist search via filter param
    if (searchMode === 'channel') {
      const tryChannel = async (base) => {
        try {
          const res = await fetchWithTimeout(buildPipedUrl(base, '/search', { q: query, filter: 'channels' }), 5000);
          if (!res.ok) return null;
          const data = await res.json();
          const items = (data.items || []).filter(i => i.type === 'channel' && i.url);
          if (items.length === 0) throw new Error('empty');
          return items.slice(0, 10).map(i => {
            const chId = (i.url || '').replace('/channel/', '');
            return {
              resultType: 'channel',
              channelId: chId,
              title: i.name || i.title || '',
              uploaderName: i.name || i.title || '',
              description: i.description || '',
              thumbnail: i.thumbnail || i.avatar || '',
              channelUrl: `https://www.youtube.com/channel/${chId}`,
              subscriberCount: i.subscriberCount || 0,
            };
          });
        } catch { return null; }
      };
      try { return await Promise.any(PIPED_INSTANCES.map(tryChannel)); } catch { return null; }
    }
    if (searchMode === 'playlist') {
      const tryPlaylist = async (base) => {
        try {
          const res = await fetchWithTimeout(buildPipedUrl(base, '/search', { q: query, filter: 'playlists' }), 5000);
          if (!res.ok) return null;
          const data = await res.json();
          const items = (data.items || []).filter(i => i.type === 'playlist' && i.url);
          if (items.length === 0) throw new Error('empty');
          return items.slice(0, 10).map(i => {
            const plId = (i.url || '').replace('/playlist?list=', '');
            return {
              resultType: 'playlist',
              playlistId: plId,
              title: i.name || i.title || '',
              uploaderName: i.uploaderName || i.uploader || '',
              thumbnail: i.thumbnail || '',
              videoCount: i.videos || 0,
              playlistUrl: `https://www.youtube.com/playlist?list=${plId}`,
            };
          });
        } catch { return null; }
      };
      try { return await Promise.any(PIPED_INSTANCES.map(tryPlaylist)); } catch { return null; }
    }

    // FIX Search: tambahkan music context agar Piped tidak return video random yang
    // kebetulan mengandung kata query. Piped tidak punya videoCategoryId seperti YT API,
    // jadi hint "official audio" / "music" di query adalah satu-satunya cara mengarahkan.
    // Hanya ditambahkan jika query pendek (<35 char) dan belum ada kata musik di dalamnya.
    const musicKeywords = /official|audio|music|mv|live|lyric|cover|remix|video/i;
    const musicQuery = (query.length < 35 && !musicKeywords.test(query))
      ? `${query} official audio`
      : query;

    // Helper ekstrak videoId 11 karakter dari URL Piped
    const extractVideoId = (url = '') => {
      const m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
      const plain = url.replace('/watch?v=', '').split('&')[0].split('?')[0];
      return plain.length === 11 ? plain : null;
    };
    // Helper: apakah video ini kemungkinan bisa diputar (bukan Shorts, bukan live, bukan premiere)
    const isLikelyPlayable = (item, dur) => {
      // ── Shorts: URL /shorts/, flag isShort, atau durasi <62 s ───────────
      if (item.url && item.url.toLowerCase().includes('/shorts/')) return false;
      if (item.isShort === true) return false;
      const titleLower = (item.title || '').toLowerCase();
      if (titleLower.includes('#shorts') || titleLower.includes('#short')) return false;
      // Judul sangat pendek (<3 karakter) = data rusak/kosong
      if (item.title && item.title.trim().length < 3) return false;

      // ── Live / upcoming / premiere ───────────────────────────────────────
      if (item.isLive || item.live || item.liveNow) return false;
      if (item.isUpcoming || item.premiereTimestamp) return false;

      // ── Durasi: skip jika eksplisit <62 s; durasi=0 masih lolos (tidak tersedia) ─
      if (dur > 0 && dur < 62) return false;

      // ── Piped: uploaderUrl kosong = channel tidak valid ──────────────────
      if (item.uploaderUrl !== undefined && !item.uploaderUrl) return false;

      return true;
    };

    const mapItems = (items) => items
      .filter(i => i.url && i.url.includes('watch'))
      .map(i => {
        const vid = extractVideoId(i.url);
        const dur = i.duration || i.lengthSeconds || 0;
        if (!vid) return null;
        if (!isLikelyPlayable(i, dur)) return null;
        return {
          ...i, videoId: vid,
          thumbnail: i.thumbnail || `https://i.ytimg.com/vi/${vid}/mqdefault.jpg`,
          uploaderName: i.uploaderName || i.uploader || i.channel || 'YouTube',
          duration: dur,
          // isPlayable sengaja tidak di-set agar verifyYtPlayableBatch bisa verifikasi embed
        };
      })
      .filter(Boolean)
      .slice(0, 15);

    const tryInstance = async (base) => {
      try {
        // Coba music_songs dulu (lebih relevan untuk musik)
        const res = await fetchWithTimeout(
          buildPipedUrl(base, '/search', { q: musicQuery, filter: 'music_songs' }),
          4000
        );
        if (!res.ok) return null;
        const data = await res.json();
        let items = mapItems(data.items || []);
        // Fallback: jika music_songs tidak menghasilkan apa-apa, coba filter=videos
        if (items.length === 0) {
          const res2 = await fetchWithTimeout(
            buildPipedUrl(base, '/search', { q: musicQuery, filter: 'videos' }),
            3500
          );
          if (res2.ok) {
            const data2 = await res2.json();
            items = mapItems(data2.items || []);
          }
        }
        return items.length > 0 ? items : null;
      } catch { return null; }
    };
    try {
      const results = await Promise.any(PIPED_INSTANCES.map(tryInstance));
      return results || null;
    } catch { return null; }
  };

  const searchViaInvidious = async (query, searchMode = 'video') => {
    // Mode channel
    if (searchMode === 'channel') {
      const tryChannel = async (base) => {
        try {
          const res = await fetchWithTimeout(buildInvidiousUrl(base, '/api/v1/search', { q: query, type: 'channel', fields: 'authorId,author,authorThumbnails,subCount,description' }), 5000);
          if (!res.ok) return null;
          const data = await res.json();
          if (!Array.isArray(data) || data.length === 0) return null;
          return data.slice(0, 10).map(i => ({
            resultType: 'channel',
            channelId: i.authorId,
            title: i.author,
            uploaderName: i.author,
            description: i.description || '',
            thumbnail: (i.authorThumbnails || []).find(t => t.width >= 80)?.url || `https://yt3.googleusercontent.com/channel/${i.authorId}`,
            channelUrl: `https://www.youtube.com/channel/${i.authorId}`,
            subscriberCount: i.subCount || 0,
          }));
        } catch { return null; }
      };
      try { return await Promise.any(INVIDIOUS_INSTANCES.map(tryChannel)); } catch { return null; }
    }
    // Mode playlist
    if (searchMode === 'playlist') {
      const tryPlaylist = async (base) => {
        try {
          const res = await fetchWithTimeout(buildInvidiousUrl(base, '/api/v1/search', { q: query, type: 'playlist', fields: 'playlistId,title,author,videoCount,playlistThumbnail' }), 5000);
          if (!res.ok) return null;
          const data = await res.json();
          if (!Array.isArray(data) || data.length === 0) return null;
          return data.slice(0, 10).map(i => ({
            resultType: 'playlist',
            playlistId: i.playlistId,
            title: i.title,
            uploaderName: i.author,
            thumbnail: i.playlistThumbnail || '',
            videoCount: i.videoCount || 0,
            playlistUrl: `https://www.youtube.com/playlist?list=${i.playlistId}`,
          }));
        } catch { return null; }
      };
      try { return await Promise.any(INVIDIOUS_INSTANCES.map(tryPlaylist)); } catch { return null; }
    }

    // FIX Search: sama seperti Piped, Invidious tidak punya category filter.
    // Tambahkan hint musik ke query pendek agar hasil lebih relevan.
    const musicKeywords = /official|audio|music|mv|live|lyric|cover|remix|video/i;
    const musicQuery = (query.length < 35 && !musicKeywords.test(query))
      ? `${query} official audio`
      : query;

    const tryInstance = async (base) => {
      try {
        const res = await fetchWithTimeout(
          // sort_by=relevance: prioritas relevansi (cocok untuk semua lagu, klasik & baru)
          buildInvidiousUrl(base, '/api/v1/search', { q: musicQuery, type: 'video', sort_by: 'relevance', features: 'embeddable', fields: 'videoId,title,author,lengthSeconds,videoThumbnails' }),
          4500
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return null;
        return data
          .filter(v => {
            // ── videoId valid ────────────────────────────────────────────────
            if (!v.videoId || !/^[A-Za-z0-9_-]{11}$/.test(v.videoId)) return false;
            // ── Live / upcoming / premiere ───────────────────────────────────
            if (v.liveNow || v.isUpcoming || v.premiereTimestamp) return false;
            // ── Shorts: durasi <62 s, atau title #shorts ─────────────────────
            const dur = v.lengthSeconds || 0;
            if (dur > 0 && dur < 62) return false;
            const tl = (v.title || '').toLowerCase();
            if (tl.includes('#shorts') || tl.includes('#short')) return false;
            // ── Judul terlalu pendek = data rusak ────────────────────────────
            if (v.title && v.title.trim().length < 3) return false;
            // ── viewCount = 0 → kemungkinan video premiere/tersembunyi ───────
            if (v.viewCount !== undefined && v.viewCount === 0) return false;
            return true;
          })
          .slice(0, 15)
          .map(v => {
            // Cari thumbnail kualitas medium/mqdefault — Invidious urutkan dari resolusi terkecil
            const thumbs = v.videoThumbnails || [];
            const preferred = thumbs.find(t => t.quality === 'medium' || t.quality === 'mqdefault')
              || thumbs[thumbs.length - 1]; // fallback: thumbnail terbesar yang ada
            const rawThumb = preferred?.url || '';
            const thumb = rawThumb.startsWith('http')
              ? rawThumb
              : `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`;
            return {
              url: `/watch?v=${v.videoId}`,
              title: v.title,
              uploaderName: v.author,
              duration: v.lengthSeconds || 0,
              thumbnail: thumb,
              videoId: v.videoId,
              // isPlayable sengaja tidak di-set agar verifyYtPlayableBatch bisa verifikasi embed
            };
          });
      } catch { return null; }
    };
    try {
      const results = await Promise.any(INVIDIOUS_INSTANCES.map(tryInstance));
      return results || null;
    } catch { return null; }
  };

  // Fallback: AI-powered search recommendation
  // Bisa pakai user key ATAU server /api/ai (tidak perlu key user)
  const searchViaAI = async (query) => {
    // FIX Search: AI TIDAK lagi diminta menghasilkan videoId langsung — LLM sering halusin
    // videoId yang tidak ada atau sudah dihapus sehingga hasil jadi ngawur.
    // Sekarang AI diminta menyarankan query pencarian yang lebih baik, lalu hasil
    // digunakan untuk re-search via Invidious (source nyata, bukan imajinasi LLM).
    //
    // FIX v2 — keyword ngawur: prompt sebelumnya terlalu bebas sehingga AI bisa mengubah
    // total intent query (mis. translate ke English, ganti artis, ganti judul).
    // Sekarang:
    //  1. Query asli WAJIB masuk sebagai elemen pertama array.
    //  2. AI hanya boleh menambah/memperjelas (append kata kunci), TIDAK boleh mengganti.
    //  3. Prompt bilingual (EN+ID) agar AI tidak salah paham query berbahasa Indonesia.
    //  4. Fallback: jika AI gagal parse, gunakan query asli langsung agar tetap ada hasil.
    const prompt = `You are a YouTube music search assistant. The user searched for: "${query}"

Return a JSON array of EXACTLY 3 search query strings to find this music on YouTube.
STRICT RULES:
1. Element [0] MUST be the user's original query unchanged: "${query}"
2. Elements [1] and [2] may refine the query by APPENDING words only (e.g. add "official audio", "official video", "lyrics", artist name if obvious, or song title if recognizable). Do NOT replace, translate, or rewrite the original query.
3. Keep the same language as the original query (if Indonesian, stay Indonesian; if English, stay English).
4. Never suggest a completely different song or artist.

Return ONLY valid JSON, no explanation:
["${query}", "refined query 2", "refined query 3"]`;
    const systemPrompt = 'You are a YouTube music search assistant. Return ONLY a JSON array of exactly 3 strings. No markdown, no explanation, no extra text.';

    const extractQueries = (text) => {
      try {
        const clean = text.replace(/```json|```/g, '').trim();
        // Kadang AI membungkus dalam objek — coba ambil array pertama yang ditemukan
        const jsonMatch = clean.match(/\[[\s\S]*?\]/);
        const arr = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
        if (Array.isArray(arr) && arr.length > 0) {
          const filtered = arr.filter(q => typeof q === 'string' && q.trim().length > 0);
          if (filtered.length === 0) return [query]; // fallback ke query asli
          // Pastikan query asli selalu ada di posisi pertama
          const withOriginal = filtered[0].trim().toLowerCase() === query.trim().toLowerCase()
            ? filtered
            : [query, ...filtered.filter(q => q.trim().toLowerCase() !== query.trim().toLowerCase())];
          return withOriginal.slice(0, 3);
        }
      } catch {}
      // Jika AI gagal total, gunakan query asli agar search tetap berjalan
      return [query];
    };

    const searchWithQueries = async (queries) => {
      // Coba setiap suggested query via Invidious sampai ada yang return hasil
      for (const q of queries) {
        const musicKeywords = /official|audio|music|mv|live|lyric|cover|remix|video/i;
        const mq = (q.length < 35 && !musicKeywords.test(q)) ? `${q} official audio` : q;
        try {
          const results = await Promise.any(
            INVIDIOUS_INSTANCES.map(async (base) => {
              const res = await fetchWithTimeout(
                buildInvidiousUrl(base, '/api/v1/search', { q: mq, type: 'video', sort_by: 'relevance', features: 'embeddable', fields: 'videoId,title,author,lengthSeconds,videoThumbnails' }),
                4000
              );
              if (!res.ok) throw new Error('not ok');
              const data = await res.json();
              if (!Array.isArray(data) || data.length === 0) throw new Error('empty');
              const valid = data.filter(v => {
                if (!v.videoId || !/^[A-Za-z0-9_-]{11}$/.test(v.videoId)) return false;
                if (v.liveNow || v.isUpcoming || v.premiereTimestamp) return false;
                const dur = v.lengthSeconds || 0;
                if (dur > 0 && dur < 62) return false;
                const tl = (v.title || '').toLowerCase();
                if (tl.includes('#shorts') || tl.includes('#short')) return false;
                if (v.title && v.title.trim().length < 3) return false;
                if (v.viewCount !== undefined && v.viewCount === 0) return false;
                return true;
              });
              if (valid.length === 0) throw new Error('no valid');
              return valid.slice(0, 8).map(v => {
                const thumbs = v.videoThumbnails || [];
                const preferred = thumbs.find(t => t.quality === 'medium' || t.quality === 'mqdefault') || thumbs[thumbs.length - 1];
                const rawThumb = preferred?.url || '';
                const thumb = rawThumb.startsWith('http') ? rawThumb : `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`;
                return {
                  url: `/watch?v=${v.videoId}`, title: v.title, uploaderName: v.author,
                  duration: v.lengthSeconds || 0, thumbnail: thumb, videoId: v.videoId,
                  // isPlayable sengaja tidak di-set agar verifyYtPlayableBatch bisa verifikasi embed
                };
              });
            })
          );
          if (results && results.length > 0) return results;
        } catch {}
      }
      return null;
    };

    try {
      // Coba user key dulu jika ada
      if (hasKey()) {
        const r = await askAIRace(prompt, systemPrompt);
        const queries = extractQueries(r);
        if (queries) {
          const items = await searchWithQueries(queries);
          if (items && items.length > 0) return items;
        }
      }
      // Fallback: server AI proxy (tidak butuh key user)
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, system: systemPrompt }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      // Anthropic returns data.content as array of blocks; others return data.text/result/content as string
      const text = typeof data.content === 'string' ? data.content
        : Array.isArray(data.content) ? data.content.filter(b => b.type === 'text').map(b => b.text).join('') 
        : data.text || data.result || '';
      const queries = extractQueries(text);
      if (queries) {
        const items = await searchWithQueries(queries);
        if (items && items.length > 0) return items;
      }
    } catch { /* silent fail */ }
    return null;
  };

  // ── Core playback (moved here to avoid TDZ in useCallback closures below)
  const [track, setTrack]       = useState(SONGS[0]);
  const trackRef = useRef(SONGS[0]); // selalu sinkron dengan track terbaru untuk closure
  const [playing, setPlaying]   = useState(false);
  const playingRef = useRef(false); // sync ref agar useEffect [track.src] bisa baca playing terbaru
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume]     = useState(() => { try { const v = parseFloat(localStorage.getItem('sn_volume')); return isFinite(v) ? Math.min(Math.max(v, 0), 1) : 0.75; } catch { return 0.75; } });
  const [muted, setMuted]       = useState(() => { try { return localStorage.getItem('sn_muted') === '1'; } catch { return false; } });
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

  // ── Client-side relevance re-ranking untuk hasil YT search ──────────────────
  // Backend (Piped/Invidious) mengembalikan hasil berdasarkan algoritma mereka sendiri
  // yang tidak selalu relevan untuk pencarian musik spesifik. Scoring ini memprioritaskan
  // hasil yang judulnya paling cocok dengan query user.
  const rankYtResults = (items, query) => {
    if (!items || items.length === 0) return items;
    const q = query.trim().toLowerCase();
    // Tokenisasi query: pisah kata-kata penting (min 2 karakter)
    const qTokens = q.split(/\s+/).filter(t => t.length >= 2);
    if (qTokens.length === 0) return items;

    const score = (item) => {
      const title  = (item.title || '').toLowerCase();
      const artist = (item.uploaderName || item.author || '').toLowerCase();
      let s = 0;

      // ── Exact match judul (tertinggi) ────────────────────────────────────
      if (title === q) s += 100;
      // ── Judul starts with query ──────────────────────────────────────────
      else if (title.startsWith(q)) s += 70;
      // ── Judul contains query persis ─────────────────────────────────────
      else if (title.includes(q)) s += 50;

      // ── Setiap token query ditemukan di judul ────────────────────────────
      const titleTokens = title.split(/\s+/);
      for (const t of qTokens) {
        if (title.includes(t)) s += 10;
        // Bonus jika token ada di awal judul
        if (titleTokens[0] === t || titleTokens[1] === t) s += 5;
      }

      // ── Semua token query ada di judul ──────────────────────────────────
      if (qTokens.every(t => title.includes(t))) s += 20;

      // ── Token query ditemukan di nama artist/channel ─────────────────────
      for (const t of qTokens) {
        if (artist.includes(t)) s += 6;
      }

      // ── Bonus: audio/lyric/official (video musik yang relevan) ──────────
      if (/official audio|official video|lyric|lyrics|mv\b/i.test(title)) s += 8;
      // ── Penalti: cover, parody, reaction, review, karaoke ───────────────
      if (/\bcover\b|\bparody\b|\breaction\b|\breview\b|\bkaraoke\b|\btutorial\b/i.test(title)) s -= 15;
      // ── Penalti ringan: durasi sangat panjang (>20 menit, bisa podcast/mix) ─
      const dur = item.duration || item.lengthSeconds || 0;
      if (dur > 1200) s -= 10;

      return s;
    };

    // Stable sort + filter relevansi:
    // Hanya tampilkan item yang memiliki skor positif (minimal 1 token query cocok di judul/artis)
    const scored = [...items]
      .map((item, idx) => ({ item, score: score(item), idx }))
      .filter(x => x.score > 0)             // buang hasil yang sama sekali tidak relevan
      .sort((a, b) => b.score - a.score || a.idx - b.idx);

    // Jika semua hasil terbuang (query terlalu spesifik / typo), kembalikan semua (fallback urutan asli)
    return scored.length > 0 ? scored.map(x => x.item) : items;
  };

  const searchYouTube = async (platformId, query, searchMode) => {
    if (!query.trim()) return;
    const mode = searchMode || ytSearchMode || 'video';

    // Deteksi URL YouTube → langsung play (hanya untuk mode video)
    if (mode === 'video') {
      const ytUrlMatch = query.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      if (ytUrlMatch) {
        const videoId = ytUrlMatch[1];
        playYouTube({ videoId, title: query, uploaderName: 'YouTube', duration: 0, thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` }, [], 0);
        return;
      }
    }

    setYtLoading(p => ({...p, [platformId]: true}));
    setYtError(p => ({...p, [platformId]: null}));
    setYtResults(p => ({...p, [platformId]: []}));

    // ── Cache hit: tampilkan instan
    const cached = ytSearchCacheGet(query + '_' + mode);
    if (cached) {
      setYtResults(p => ({...p, [platformId]: cached}));
      setYtLoading(p => ({...p, [platformId]: false}));
      return;
    }

    // ── Helper deduplikasi (pakai di fallback path)
    const mergeItems = (existing, incoming) => {
      if (!incoming || incoming.length === 0) return existing;
      const seen = new Set(existing.map(x => x.videoId));
      const deduped = incoming.filter(x => x.videoId && !seen.has(x.videoId));
      return [...existing, ...deduped].slice(0, 20);
    };

    const ytApiEnabled = isYtApiEnabled();
    console.log('[YT] searchYouTube: key=', getYtKey() ? getYtKey().slice(0,8)+'…' : 'EMPTY', 'enabled:', ytApiEnabled, 'mode:', mode);

    // ── PATH A: YT API tersedia — jalankan DULUAN sebagai satu-satunya sumber utama
    // Piped/Invidious TIDAK dijalankan paralel agar tidak mencemari urutan hasil
    if (ytApiEnabled) {
      let ytItems = null;
      try {
        ytItems = await searchViaYouTubeAPI(query, mode);
      } catch (err) {
        // 403/401 = quota habis atau key invalid — langsung fallback, tidak perlu tunggu timeout
        if (err?.status === 403 || err?.status === 401) {
          console.warn('[YT] Quota/auth error — skip ke fallback:', err.detail?.error?.message || err.message);
        }
        // error lain (network timeout dsb.) juga jatuh ke fallback
      }
      if (ytItems && ytItems.length > 0) {
        const ranked = mode === 'video' ? rankYtResults(ytItems, query) : ytItems;
        setYtResults(p => ({...p, [platformId]: ranked}));
        setYtLoading(p => ({...p, [platformId]: false}));
        ytSearchCacheSet(query + '_' + mode, ranked);
        return; // ← selesai, tidak perlu fallback
      }
      console.warn('[YT] YT API tidak menghasilkan data — fallback ke Piped/Invidious');
    }

    // ── PATH B: Fallback — tidak ada key ATAU YT API gagal
    // Jalankan Piped & Invidious paralel — ambil yang pertama berhasil,
    // lalu merge dengan yang kedua jika selesai dalam 1500ms setelahnya
    let allItems = [];

    const pipedPromise = searchViaPiped(query, mode).catch(() => null);
    const invidiousPromise = searchViaInvidious(query, mode).catch(() => null);

    // Tunggu yang pertama selesai dengan hasil valid
    const raceResult = await Promise.any([
      pipedPromise.then(items => { if (!items || items.length === 0) throw new Error('empty'); return { src:'piped', items }; }),
      invidiousPromise.then(items => { if (!items || items.length === 0) throw new Error('empty'); return { src:'invidious', items }; }),
    ]).catch(() => null);

    if (raceResult && raceResult.items && raceResult.items.length > 0) {
      allItems = mode === 'video' ? rankYtResults(raceResult.items, query) : raceResult.items;
      // Tampil langsung — jangan tunggu source kedua
      setYtResults(p => ({...p, [platformId]: allItems}));
      setYtLoading(p => ({...p, [platformId]: false}));
      ytSearchCacheSet(query + '_' + mode, allItems);

      // Merge dari source lain jika selesai cepat (max 1500ms tambahan) — hanya untuk mode video
      if (mode === 'video') {
        const otherPromise = raceResult.src === 'piped' ? invidiousPromise : pipedPromise;
        const timeout1500 = new Promise(r => setTimeout(() => r(null), 1500));
        const otherResult = await Promise.race([otherPromise, timeout1500]);
        let finalItems = allItems;
        if (otherResult && otherResult.length > 0) {
          const seen = new Set(allItems.map(x => x.videoId));
          const extra = otherResult.filter(x => x.videoId && !seen.has(x.videoId));
          if (extra.length > 0) {
            // Re-rank setelah merge: gabungan dua source, sort ulang berdasarkan relevansi
            finalItems = rankYtResults([...allItems, ...extra], query).slice(0, 20);
            setYtResults(p => ({...p, [platformId]: finalItems}));
            ytSearchCacheSet(query + '_' + mode, finalItems);
          }
        }
        // Verifikasi playability background — hapus video yang tidak bisa diputar
        // FIX Bug 4: pass query agar cache key tidak stale jika user cepat search lagi
        verifyYtPlayableBatch(finalItems, platformId, query);
      }
      return;
    }

    // Semua sumber gagal — coba AI sebagai last resort (hanya untuk mode video)
    if (mode === 'video') {
      const aiItems = await searchViaAI(query).catch(() => null);
      if (aiItems && aiItems.length > 0) {
        allItems = rankYtResults(aiItems, query);
        setYtResults(p => ({...p, [platformId]: allItems}));
        // FIX Bug 1: AI fallback juga perlu verifikasi embed — LLM bisa halusin videoId
        verifyYtPlayableBatch(allItems, platformId, query);
      } else {
        setYtError(p => ({...p, [platformId]: t?.searchFailed||'Search failed. Coba lagi atau masukkan YouTube API key di Settings.'}));
      }
    } else {
      setYtError(p => ({...p, [platformId]: `Hasil tidak ditemukan untuk "${query}". Coba kata kunci lain.`}));
    }
    setYtLoading(p => ({...p, [platformId]: false}));

    if (allItems.length > 0) ytSearchCacheSet(query + '_' + mode, allItems);
  };

  const playYouTube = async (item, queue, queueIdx) => {
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

    // ── Update queue refs (untuk next/prev) sebelum switch ──
    if (queue) {
      const queueChanged = queue !== ytQueueRef.current;
      ytQueueRef.current = queue;
      ytQueueIdxRef.current = queueIdx ?? queue.findIndex(v => (v.videoId || v.url?.includes(videoId)) === videoId);
      if (queueChanged) ytShufflePlayedRef.current = null;
    }

    // ── Cache-first: cek cache audio dulu (hanya di Pro mode) ──
    if (!isLite) {
      try {
        const cachedBlob = await ytCacheGet(videoId);
        if (cachedBlob && cachedBlob.size > 10000) {
          // Cache hit → putar via native audio player (hemat data, bisa seek penuh)
          const blobUrl = URL.createObjectURL(cachedBlob);
          const nativeTrack = {
            id: `yt_${videoId}`,
            type: 'youtube',
            videoId,
            title: item.title,
            artist: item.uploaderName || item.author || 'YouTube',
            album: 'YouTube',
            cover: thumb,
            src: blobUrl,
            color: '#ff4444',
            bg: 'rgba(255,68,68,0.15)',
            mood: 'youtube',
            thumbnail: thumb,
            duration: secs,
            durationSecs: secs,
            _ytCached: true, // marker: sedang diputar dari cache
          };
          stopAllMedia('local');
          setEmbedTrack(null);
          setCustomSongs(prev => { const ex = prev.find(s => s.id === nativeTrack.id); return ex ? prev.map(s => s.id === nativeTrack.id ? { ...s, src: blobUrl } : s) : [nativeTrack, ...prev]; });
          setTrack(nativeTrack);
          setProgress(0); setDuration(secs || 0);
          setPlaying(true);
          setTab('player');
          return;
        }
      } catch (_) { /* cache miss atau error → lanjut ke iframe */ }
    }

    // ── Tidak ada cache / Lite mode → putar via iframe seperti biasa ──
    const doSwitch = () => {
      stopAllMedia('embed');
      setEmbedTrack(ytTrack);
      setYtProgress(0); setYtDuration(secs||0); ytProgressRef.current = 0; ytDurationRef.current = secs||0; ytEndedFiredRef.current = false;
      setEmbedMinimized(false);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (radioReconnectRef.current) { clearTimeout(radioReconnectRef.current); radioReconnectRef.current = null; }
      radioReconnectCount.current = 0;
      setStreamBuffering(false);
      setRadioStation(null);
      setRadioPlaying(false);
      setPlaying(true);
      setTab('player');
    };
    doSwitch();

    // ── Background download: simpan audio ke cache setelah iframe mulai putar ──
    // (hanya Pro mode & belum ada cache; tidak blokir playback)
    if (!isLite) {
      setTimeout(() => {
        if (ytDlTriggerRef.current) ytDlTriggerRef.current(videoId);
      }, 1500);
    }
  };
  // Keep ref always pointing to latest playYouTube (avoids stale closure in ytNext/ytPrev)
  playYouTubeRef.current = playYouTube;


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
    // Stop Spotify preview — selalu hentikan saat beralih ke sumber lain
    if (spPreviewRef.current) { spPreviewRef.current.pause(); spPreviewRef.current = null; }
    setSpPlaying(false);
    // Stop radio jika incoming bukan radio — tanpa syarat trackRef.isRadio karena
    // radioAudioRef/HLS bisa aktif bahkan ketika track sudah beralih ke sumber lain
    if (incomingMode !== 'radio') {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (radioReconnectRef.current) { clearTimeout(radioReconnectRef.current); radioReconnectRef.current = null; }
      radioReconnectCount.current = 0;
      setStreamBuffering(false);
      setRadioPlaying(false);
      setRadioStation(null); // wajib: bersihkan state station agar tombol X radio tidak ghost
    }
    // Stop Drive jika incoming bukan local — tanpa syarat trackRef.isDrive (konsisten dengan fix radio)
    if (incomingMode !== 'local') {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      setPlaying(false);
      // Reset track ke default agar tombol X Drive tidak ghost saat embedTrack aktif
      if (trackRef.current?.isDrive) setTrack(SONGS[0]);
    }
    // Stop audio jika incoming adalah radio/embed (bukan lokal)
    // Khusus embed-to-embed (YT next/prev): jangan setPlaying(false) — biarkan playYouTube yang set
    if (incomingMode !== 'local' && incomingMode !== 'embed' && !trackRef.current?.isRadio) {
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

  // ── Extract audio via cobalt.tools API then send to native player ──────────
  const extractViaCobalt = useCallback(async (sourceUrl, itemMeta) => {
    const key = sourceUrl;
    cobaltLoadingSet.current.add(key);
    cobaltErrorSet.current.delete(key);
    cobaltTick();
    try {
      const _COBALT_INSTANCES = [
        'https://api.cobalt.tools/',
        'https://cobalt.api.timelessnesses.me/',
        'https://cobalt.esmBot.net/',
      ];
      const _cobaltBody = { url: sourceUrl, downloadMode: 'audio', audioFormat: 'mp3' };
      let audioUrl = null;
      let lastCobaltErr = null;
      for (const _inst of _COBALT_INSTANCES) {
        try {
          const res = await fetch(_inst, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(_cobaltBody),
          });
          if (!res.ok) { lastCobaltErr = new Error(`cobalt HTTP ${res.status}`); continue; }
          const data = await res.json();
          if (data.status === 'error') { lastCobaltErr = new Error(data.error?.code || 'cobalt error'); continue; }
          audioUrl = data.url || (Array.isArray(data.picker) ? data.picker[0]?.url : null);
          if (audioUrl) break;
        } catch (e) { lastCobaltErr = e; continue; }
      }
      if (!audioUrl) throw lastCobaltErr || new Error('cobalt: all instances failed');

      // FIX Bug #6: hapus key dari Set (benar-benar tidak ada memori sisa)
      cobaltLoadingSet.current.delete(key);
      cobaltTick();
      const nativeTrack = {
        id: `cobalt_${encodeURIComponent(sourceUrl).slice(0,40)}`,
        title: itemMeta?.title || 'Audio',
        artist: itemMeta?.artist || itemMeta?.source || 'cobalt.tools',
        album: itemMeta?.source || 'Web',
        cover: itemMeta?.thumbnail || '',
        src: audioUrl,
        color: '#6366f1',
        bg: 'rgba(99,102,241,0.15)',
        mood: '',
        _wsSource: 'cobalt',
      };
      stopAllMedia('local');
      setEmbedTrack(null);
      setCustomSongs(prev => { const ex = prev.find(s => s.id === nativeTrack.id); return ex ? prev : [nativeTrack, ...prev]; });
      setTrack(nativeTrack);
      setProgress(0); setDuration(0);
      setPlaying(true);
      setTab('player');
    } catch (err) {
      console.error('[cobalt] extract failed:', err);
      cobaltLoadingSet.current.delete(key);
      cobaltErrorSet.current.add(key);
      cobaltTick();
      // Hapus error state setelah 3 detik (key benar-benar dibuang dari Set)
      setTimeout(() => { cobaltErrorSet.current.delete(key); cobaltTick(); }, 3000);
    }
  }, [stopAllMedia, cobaltTick]); // eslint-disable-line

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
  const ytNext = useCallback(({ auto = false } = {}) => {
    const q = ytQueueRef.current;
    if (repeatRef.current === 'one') {
      // Ulangi video yang sama: seekTo 0 lalu play
      // Set flag seeking agar onStateChange(0) yang terpicu seekTo tidak dianggap ended baru
      ytRepeatSeekingRef.current = true;
      // Reset ytEndedFiredRef setelah flag seeking aktif, agar putaran berikutnya bisa terdeteksi
      ytEndedFiredRef.current = false;
      setPlaying(true);
      try {
        ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'seekTo', args:[0, true] }), '*');
        setTimeout(() => {
          try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'playVideo', args:'' }), '*'); } catch(_) {}
          // Pastikan flag seeking selalu direset meski playVideo tidak terpanggil
          ytRepeatSeekingRef.current = false;
        }, 300);
      } catch(_) { ytRepeatSeekingRef.current = false; }
      return;
    }
    // Single video (queue kosong atau 1 item) — repeat all → restart; shuffle → restart
    if (!q.length || q.length === 1) {
      if (repeatRef.current === 'all' || shuffleRef.current) {
        // Set flag seeking agar ended palsu dari seekTo tidak trigger ytNext lagi
        ytRepeatSeekingRef.current = true;
        ytEndedFiredRef.current = false;
        setPlaying(true);
        try {
          ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'seekTo', args:[0, true] }), '*');
          setTimeout(() => {
            try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'playVideo', args:'' }), '*'); } catch(_) {}
            ytRepeatSeekingRef.current = false;
          }, 300);
        } catch(_) { ytRepeatSeekingRef.current = false; }
      } else {
        setPlaying(false);
      }
      return;
    }
    if (shuffleRef.current) {
      // Acak: pilih video yang belum diputar di sesi shuffle ini
      // Tracking via Set of played indices — reset saat semua sudah diputar (loop baru)
      if (!ytShufflePlayedRef.current) ytShufflePlayedRef.current = new Set();
      ytShufflePlayedRef.current.add(ytQueueIdxRef.current);
      // Cari index yang belum diputar
      const unplayed = q.map((_, i) => i).filter(i => !ytShufflePlayedRef.current.has(i));
      if (unplayed.length === 0) {
        // Semua sudah diputar — reset dan mulai loop baru
        ytShufflePlayedRef.current = new Set([ytQueueIdxRef.current]);
        const fresh = q.map((_, i) => i).filter(i => i !== ytQueueIdxRef.current);
        if (!fresh.length) { setPlaying(false); return; }
        const idx = fresh[Math.floor(Math.random() * fresh.length)];
        ytQueueIdxRef.current = idx;
        playYouTubeRef.current(q[idx], q, idx);
      } else {
        const idx = unplayed[Math.floor(Math.random() * unplayed.length)];
        ytQueueIdxRef.current = idx;
        playYouTubeRef.current(q[idx], q, idx);
      }
      return;
    }
    const nextIdx = ytQueueIdxRef.current + 1;
    if (nextIdx >= q.length) {
      if (repeatRef.current === 'all') {
        ytQueueIdxRef.current = 0;
        playYouTubeRef.current(q[0], q, 0);
        return;
      }
      // Di ujung queue, repeat=off: stop (auto) atau wrap ke awal (manual)
      setPlaying(false);
      return;
    }
    // auto=true + repeat=off + shuffle=off → tidak lanjut ke video berikutnya
    if (auto && repeatRef.current === 'off' && !shuffleRef.current) {
      setPlaying(false);
      return;
    }
    ytQueueIdxRef.current = nextIdx;
    playYouTubeRef.current(q[nextIdx], q, nextIdx);
  }, [seekYt]); // eslint-disable-line

  const ytPrev = useCallback(() => {
    const q = ytQueueRef.current; if (!q.length) return;
    if (ytProgress > 3) { seekYt(0); return; }
    const idx = (ytQueueIdxRef.current - 1 + q.length) % q.length;
    ytQueueIdxRef.current = idx;
    playYouTubeRef.current(q[idx], q, idx);
  }, [seekYt, ytProgress]); // eslint-disable-line

  const ytShuffle = useCallback(() => {
    const q = ytQueueRef.current; if (!q.length) return;
    const idx = Math.floor(Math.random()*q.length);
    ytQueueIdxRef.current = idx;
    playYouTubeRef.current(q[idx], q, idx);
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

  // ── Cache state untuk favSongs (SC/Spotify preview) — harus sebelum toggleFav
  const [cachedFavIds, setCachedFavIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sn_cached_fav_ids') || '[]')); }
    catch { return new Set(); }
  });
  const [favDownloadingIds, setFavDownloadingIds] = useState(new Set());
  const [favDownloadProg, setFavDownloadProg]     = useState({}); // songId → 0-100

  // ── Helper: download audio favSong (preview) ke cache — harus sebelum toggleFav
  const triggerFavDownload = useCallback((songId, previewUrl) => {
    if (!previewUrl) return;
    if (cachedFavIds.has(songId) || favDownloadingIds.has(songId)) return;
    setFavDownloadingIds(prev => new Set([...prev, songId]));
    setFavDownloadProg(prev => ({ ...prev, [songId]: 0 }));
    const ctrl = new AbortController();
    downloadFavAudio(
      songId, previewUrl,
      (pct) => setFavDownloadProg(prev => ({ ...prev, [songId]: pct })),
      ctrl.signal
    ).then(() => {
      setCachedFavIds(prev => new Set([...prev, songId]));
      setFavDownloadingIds(prev => { const n = new Set(prev); n.delete(songId); return n; });
      setFavDownloadProg(prev => { const n = { ...prev }; delete n[songId]; return n; });
    }).catch(() => {
      setFavDownloadingIds(prev => { const n = new Set(prev); n.delete(songId); return n; });
      setFavDownloadProg(prev => { const n = { ...prev }; delete n[songId]; return n; });
    });
  }, [cachedFavIds, favDownloadingIds]); // eslint-disable-line

  // ── Toggle like for SC / Spotify / Radio tracks (adds to favSongs + pl_fav)
  const toggleFav = useCallback((id, songObj = null) => {
    setLiked(l => {
      const nowLiked = !l[id];
      updateFavPlaylist(id, nowLiked);
      if (songObj) {
        if (nowLiked) {
          setFavSongs(p => p.find(s => s.id === id) ? p : [...p, songObj]);
          if (songObj.previewUrl) {
            triggerFavDownload(id, songObj.previewUrl);
          }
        } else {
          setFavSongs(p => p.filter(s => s.id !== id));
          favCacheDelete(id);
          setCachedFavIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        }
      }
      return { ...l, [id]: nowLiked };
    });
  }, [updateFavPlaylist, triggerFavDownload]); // eslint-disable-line

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

  // FIX Bug #6: refs untuk likedYtPending, cachedYtIds, triggerYtDownload agar
  // useEffect di bawah bisa membaca nilai terbaru tanpa stale closure, sekaligus
  // tidak perlu re-run effect setiap kali nilai berubah (yang akan membatalkan
  // download yang sedang berjalan).
  const likedYtPendingRef  = useRef(likedYtPending);
  const cachedYtIdsRef     = useRef(cachedYtIds);
  const triggerYtDownloadRef = useRef(triggerYtDownload);
  ytDlTriggerRef.current = triggerYtDownload; // sync agar playYouTube selalu punya versi terbaru
  useEffect(() => { likedYtPendingRef.current    = likedYtPending;    }, [likedYtPending]);
  useEffect(() => { cachedYtIdsRef.current       = cachedYtIds;       }, [cachedYtIds]);
  useEffect(() => { triggerYtDownloadRef.current = triggerYtDownload; }, [triggerYtDownload]);

  // ── Saat Lite → Pro: download semua pending YT liked yang belum ter-cache
  useEffect(() => {
    if (isLite) return; // hanya aktif saat Pro
    // Baca nilai terkini via ref (FIX Bug #6: tidak stale meski deps hanya [isLite])
    const pending = [...likedYtPendingRef.current].filter(vid => !cachedYtIdsRef.current.has(vid));
    if (pending.length === 0) return;
    // Download semua yang pending satu per satu (sequential agar tidak overload)
    let cancelled = false;
    (async () => {
      for (const videoId of pending) {
        if (cancelled) break;
        triggerYtDownloadRef.current(videoId);
        // Jeda 1 detik antar download agar tidak throttle
        await new Promise(r => setTimeout(r, 1000));
      }
    })();
    return () => { cancelled = true; };
  }, [isLite]); // intentionally [isLite] only — triggered once on Lite→Pro transition


  // ── Helper: validasi blob dari cache — pastikan tidak kosong/corrupt
  const isBlobValid = (blob, minSize = 1000) =>
    blob instanceof Blob && blob.size >= minSize;

  // ── Helper: buka URL di tab baru sebagai last-resort download ────────────
  const openUrlFallback = (url) => {
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ── Helper: ekstensi aman dari URL ───────────────────────────────────────
  const safeExtFromUrl = (url, fallback = 'mp3') => {
    const raw = (url || '').split('?')[0];
    const ext = raw.includes('.') ? raw.split('.').pop().toLowerCase() : '';
    return ['mp3','ogg','opus','flac','wav','aac','m4a','webm'].includes(ext) ? ext : fallback;
  };

  // ── Helper: cobalt fallback — ambil audio URL untuk URL apapun ───────────
  const cobaltAudioUrl = async (pageUrl) => {
    const COBALT_INSTANCES_APP = [
      'https://api.cobalt.tools/',
      'https://cobalt.api.timelessnesses.me/',
      'https://cobalt.esmBot.net/',
    ];
    const body = { url: pageUrl, downloadMode: 'audio', audioFormat: 'mp3' };
    let lastErr = null;
    for (const instance of COBALT_INSTANCES_APP) {
      try {
        const res = await fetch(instance, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) { lastErr = new Error(`cobalt ${res.status}`); continue; }
        const data = await res.json();
        if (data.status === 'error') { lastErr = new Error(data.error?.code || 'cobalt error'); continue; }
        const url = data.url || (Array.isArray(data.picker) ? data.picker[0]?.url : null);
        if (url) return url;
        lastErr = new Error('cobalt: no url');
      } catch (e) { lastErr = e; continue; }
    }
    throw lastErr || new Error('cobalt: all instances failed');
  };

  // ── unduh lagu ke perangkat — pakai cache offline, fallback berlapis ─────
  const downloadWithCache = useCallback(async (s) => {
    const name = `${s.title} - ${s.artist}`;

    // ═══════════════════════════════════════════════════════
    // Google Drive
    // Fallback: cache → Drive API → buka di browser
    // ═══════════════════════════════════════════════════════
    if (s.isDrive && s.driveId) {
      // 1. Cache lokal
      try {
        const cached = await cacheGet(s.driveId);
        if (isBlobValid(cached, 10000)) { downloadBlobToDevice(cached, `${name}.mp3`); return; }
      } catch {}
      // 2. Drive API (butuh token)
      if (tokenRef.current) {
        try {
          await downloadToDevice(
            `https://www.googleapis.com/drive/v3/files/${s.driveId}?alt=media&acknowledgeAbuse=true`,
            `${name}.mp3`,
            { Authorization: `Bearer ${tokenRef.current}` }
          );
          return;
        } catch {}
      }
      // 3. Buka di tab baru
      openUrlFallback(`https://drive.google.com/file/d/${s.driveId}/view`);
      return;
    }

    // ═══════════════════════════════════════════════════════
    // YouTube
    // Fallback: cache → Piped → Invidious → Cobalt fetch → Cobalt anchor → YT
    // ═══════════════════════════════════════════════════════
    if (s.type === 'youtube' && s.videoId) {
      // 1. Cache lokal
      try {
        const cached = await ytCacheGet(s.videoId);
        if (isBlobValid(cached, 10000)) { downloadBlobToDevice(cached, `${name}.mp3`); return; }
      } catch {}
      // 2-4. downloadYtAudio: Piped → Invidious → Cobalt, simpan ke cache lalu unduh
      try {
        await downloadYtAudio(s.videoId, null, null);
        const blob = await ytCacheGet(s.videoId);
        if (isBlobValid(blob, 10000)) { downloadBlobToDevice(blob, `${name}.mp3`); return; }
      } catch {}
      // 5. Cobalt: minta URL langsung lalu picu anchor download
      //    (jika blob fetch kena CORS, anchor[download] tetap bisa mengunduh dari cobalt URL)
      try {
        const cobaltUrl = await cobaltAudioUrl(`https://www.youtube.com/watch?v=${s.videoId}`);
        if (cobaltUrl) {
          await downloadToDevice(cobaltUrl, `${name}.mp3`);
          return;
        }
      } catch {}
      // 6. Last resort: buka YouTube di browser (redirect)
      openUrlFallback(`https://www.youtube.com/watch?v=${s.videoId}`);
      return;
    }

    // ═══════════════════════════════════════════════════════
    // Audius
    // Fallback: src langsung → cobalt → buka di browser
    // ═══════════════════════════════════════════════════════
    if (s._wsSource === 'audius' && s.src) {
      // 1. Fetch langsung (Audius punya CORS header)
      try { await downloadToDevice(s.src, `${name}.mp3`); return; } catch {}
      // 2. Cobalt (extract via page URL jika tersedia)
      if (s.externalUrl) {
        try {
          const url = await cobaltAudioUrl(s.externalUrl);
          await downloadToDevice(url, `${name}.mp3`);
          return;
        } catch {}
      }
      // 3. Buka di tab baru
      openUrlFallback(s.src);
      return;
    }

    // ═══════════════════════════════════════════════════════
    // Jamendo
    // Fallback: src → URL /download/{id} → cobalt → tab baru
    // ═══════════════════════════════════════════════════════
    if (s._wsSource === 'jamendo' && s.src) {
      const jamId = s.id?.replace(/^ws_jamendo_/, '');
      // 1. Direct stream URL
      try { await downloadToDevice(s.src, `${name}.mp3`); return; } catch {}
      // 2. Jamendo direct download URL (tidak perlu key)
      if (jamId) {
        try {
          await downloadToDevice(
            `https://storage.jamendo.com/?trackid=${jamId}&format=mp31&from=app-devsite`,
            `${name}.mp3`
          );
          return;
        } catch {}
      }
      // 3. Cobalt
      if (s.externalUrl) {
        try { const url = await cobaltAudioUrl(s.externalUrl); await downloadToDevice(url, `${name}.mp3`); return; } catch {}
      }
      // 4. Tab baru
      openUrlFallback(s.src);
      return;
    }

    // ═══════════════════════════════════════════════════════
    // FMA (Free Music Archive)
    // Fallback: src → direct .mp3 URL → cobalt → tab baru
    // ═══════════════════════════════════════════════════════
    if (s._wsSource === 'fma' && s.src) {
      // 1. Direct audio URL
      try { await downloadToDevice(s.src, `${name}.mp3`); return; } catch {}
      // 2. Cobalt via externalUrl
      if (s.externalUrl) {
        try { const url = await cobaltAudioUrl(s.externalUrl); await downloadToDevice(url, `${name}.mp3`); return; } catch {}
      }
      // 3. Tab baru
      openUrlFallback(s.externalUrl || s.src);
      return;
    }

    // ═══════════════════════════════════════════════════════
    // CCMixter
    // Fallback: src → externalUrl (download_url) → cobalt → tab baru
    // ═══════════════════════════════════════════════════════
    if (s._wsSource === 'ccmixter' && s.src) {
      const ext = safeExtFromUrl(s.src, 'mp3');
      // 1. Direct download URL (CCMixter src biasanya sudah download URL)
      try { await downloadToDevice(s.src, `${name}.${ext}`); return; } catch {}
      // 2. Cobalt
      if (s.externalUrl) {
        try { const url = await cobaltAudioUrl(s.externalUrl); await downloadToDevice(url, `${name}.mp3`); return; } catch {}
      }
      // 3. Tab baru
      openUrlFallback(s.src);
      return;
    }

    // ═══════════════════════════════════════════════════════
    // Cobalt-extracted (YouTube embed, SoundCloud, dll via cobalt.tools)
    // src berupa signed URL cobalt yang expire — perlu re-extract
    // Fallback: src (mungkin masih valid) → cobalt re-extract → tab baru
    // ═══════════════════════════════════════════════════════
    if (s._wsSource === 'cobalt') {
      // 1. Coba src langsung (mungkin masih dalam TTL)
      if (s.src) {
        try { await downloadToDevice(s.src, `${name}.mp3`); return; } catch {}
      }
      // 2. Re-extract via cobalt jika ada originalUrl atau externalUrl
      const reExtractUrl = s.originalUrl || s.externalUrl;
      if (reExtractUrl) {
        try {
          const url = await cobaltAudioUrl(reExtractUrl);
          await downloadToDevice(url, `${name}.mp3`);
          return;
        } catch {}
      }
      // 3. Tab baru
      if (s.src) openUrlFallback(s.src);
      else throw new Error('Cobalt: URL sumber tidak tersedia untuk diunduh ulang.');
      return;
    }

    // ═══════════════════════════════════════════════════════
    // Spotify / Deezer preview (30 detik)
    // Fallback: favCache → previewUrl langsung → cobalt → tab baru
    // ═══════════════════════════════════════════════════════
    if (s._wsSource === 'spotify' || s._wsSource === 'deezer' ||
        s.type === 'sp_track' || s.previewUrl) {
      const previewSrc = s.previewUrl || s.src;
      // 1. Cache lokal
      try {
        const cached = await favCacheGet(s.id);
        if (isBlobValid(cached, 1000)) {
          const ext = safeExtFromUrl(previewSrc, 'mp3');
          downloadBlobToDevice(cached, `${name}.${ext}`); return;
        }
      } catch {}
      // 2. Fetch preview URL langsung
      if (previewSrc) {
        try {
          const ext = safeExtFromUrl(previewSrc, 'mp3');
          await downloadToDevice(previewSrc, `${name}.${ext}`); return;
        } catch {}
      }
      // 3. Tab baru
      if (previewSrc) openUrlFallback(previewSrc);
      else throw new Error('Preview URL tidak tersedia.');
      return;
    }

    // ═══════════════════════════════════════════════════════
    // favSong generik (SC preview, lainnya) yang punya previewUrl/src
    // Fallback: favCache → src langsung → cobalt → tab baru
    // ═══════════════════════════════════════════════════════
    if (s.id && s.type !== 'youtube') {
      // 1. Cache lokal
      try {
        const cached = await favCacheGet(s.id);
        if (isBlobValid(cached, 1000)) {
          const ext = safeExtFromUrl(s.src, 'mp3');
          downloadBlobToDevice(cached, `${name}.${ext}`); return;
        }
      } catch {}
      // 2. Fetch src atau previewUrl langsung
      const directUrl = s.previewUrl || s.src;
      if (directUrl) {
        try {
          const ext = safeExtFromUrl(directUrl, 'mp3');
          await downloadToDevice(directUrl, `${name}.${ext}`); return;
        } catch {}
      }
      // 3. Cobalt (untuk SoundCloud dll yang punya permalink)
      if (s.permalink || s.externalUrl) {
        try {
          const url = await cobaltAudioUrl(s.permalink || s.externalUrl);
          await downloadToDevice(url, `${name}.mp3`); return;
        } catch {}
      }
      // 4. Tab baru
      if (directUrl) { openUrlFallback(directUrl); return; }
    }

    // ═══════════════════════════════════════════════════════
    // Fallback universal terakhir
    // ═══════════════════════════════════════════════════════
    if (s.src) {
      const ext = safeExtFromUrl(s.src, 'mp3');
      try { await downloadToDevice(s.src, `${name}.${ext}`); return; } catch {}
      openUrlFallback(s.src);
    } else {
      throw new Error('Tidak ada sumber audio yang bisa diunduh.');
    }
  }, []);  // tokenRef adalah ref — tidak perlu di deps

  // ── Jam live (update setiap detik)
  const [nowTime, setNowTime] = useState(() => new Date());

  // ── Lokasi user (kota, negara)
  const [userLocation, setUserLocation] = useState(() => {
    try { return localStorage.getItem('sn_user_location') || null; } catch { return null; }
  });
  const [userLocationCountry, setUserLocationCountry] = useState(() => {
    try { return localStorage.getItem('sn_user_location_country') || 'ID'; } catch { return 'ID'; }
  });
  const [userWeather, setUserWeather] = useState(() => {
    try {
      const cached = localStorage.getItem('sn_user_weather');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  }); // { temp, unit, emoji, desc, windkmh }

  // ── New playback features
  const [shuffle, setShuffle] = useState(() => localStorage.getItem('sn_shuffle') === 'true');
  const [repeat, setRepeat]   = useState(() => localStorage.getItem('sn_repeat') || 'off');
  const [history, setHistory]   = useState(() => { try { return JSON.parse(localStorage.getItem('sn_history') || '[]'); } catch { return []; } });

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
  const [romanizedLrcLines, setRomanizedLrcLines] = useState([]); // lrcLines dengan teks romanisasi, untuk live caption
  // ── Synced LRC lines: [{time: seconds, text: string}]
  const [lrcLines, setLrcLines]       = useState([]);
  const [captionTick, setCaptionTick]   = useState(0); // FIX Bug #9: ticker khusus live caption
  // Cache in-memory lirik: key = "title|artist", value = { text, generated }
  // FIX Bug #8: lyricsCacheRef dibatasi maksimum 100 entry (LRU sederhana).
  // Sebelumnya Map tumbuh tanpa batas — sesi panjang dengan ratusan lagu mengakumulasi
  // semua teks lirik dalam memori tanpa pernah dibuang.
  // Map insertion-ordered di JS: entry pertama = terlama; saat melebihi batas,
  // hapus entry paling awal (keys().next().value).
  const LYRICS_CACHE_MAX = 100;
  const lyricsCacheRef = useRef(new Map());
  const lyricsCacheSet = useCallback((key, value) => {
    const m = lyricsCacheRef.current;
    if (m.has(key)) m.delete(key); // pindah ke "terbaru" (re-insert di akhir)
    m.set(key, value);
    if (m.size > LYRICS_CACHE_MAX) {
      m.delete(m.keys().next().value); // hapus entry terlama
    }
  }, []);

  // ── Settings panel
  const [showSettings, setShowSettings] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [coverSpin, setCoverSpin] = useState(() => localStorage.getItem('sn_cover_spin') !== 'false');
  const [bgTheme, setBgTheme] = useState(() => localStorage.getItem('sn_bg_theme') || 'starry');
  const fullscreenRef = useRef(false);



  useEffect(() => {
    fullscreenRef.current = fullscreen;
    window.dispatchEvent(new Event('resize')); // re-trigger layout calc

    // ── Orientation lock saat fullscreen di PWA ──────────────────────────
    // Kunci ke orientasi TERAKHIR sebelum masuk fullscreen (bukan selalu portrait)
    const isPWA =
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches;

    if (isPWA && screen?.orientation) {
      if (fullscreen) {
        // Kunci ke orientasi SAAT INI (portrait atau landscape sesuai posisi device)
        // agar layar tidak berputar saat Screen Lock aktif
        const currentType = screen.orientation.type; // e.g. 'portrait-primary', 'landscape-primary'
        if (screen.orientation.lock) screen.orientation.lock(currentType).catch(() => {});
      } else {
        // Kunci kembali ke portrait saat keluar fullscreen
        if (screen.orientation.lock) screen.orientation.lock('portrait').catch(() => {});
      }
    }
    // ─────────────────────────────────────────────────────────────────────
  }, [fullscreen]);

  // ── Sync React fullscreen state dengan kondisi browser nyata
  // Saat browser keluar fullscreen (tombol Esc, gesture, interrupt sistem),
  // update state React agar UI tidak stuck dalam mode fullscreen
  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
      if (!isFs && fullscreenRef.current) {
        setFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resume audio/video saat halaman kembali visible (tab/app foreground)
  // Browser kadang suspend/interrupt audio saat tab di-background atau layar dikunci.
  // Saat visibility kembali, coba resume jika seharusnya sedang play.
  useEffect(() => {
    const onResume = () => {
      if (document.visibilityState !== 'visible') return;
      if (!playingRef.current) return;

      const et = embedTrackRef.current;

      // ── YouTube iframe: kirim playVideo karena browser sering auto-pause iframe
      if (et?.type === 'youtube' && ytIframeRef.current) {
        const sendPlay = () => {
          try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'playVideo', args:'' }), '*'); } catch(_) {}
        };
        // Retry beberapa kali — iframe mungkin butuh waktu setelah kembali foreground
        sendPlay();
        setTimeout(sendPlay, 500);
        setTimeout(sendPlay, 1500);
        setTimeout(sendPlay, 3000);
        return;
      }

      // ── Audio biasa (stream, Jamendo, SoundCloud proxy, dll)
      const a = audioRef.current;
      if (!a) return;
      if (a.paused && !a.ended) {
        a.play().catch(() => {});
      } else if (!a.paused && a.readyState < 3) {
        // Stalled karena background throttle — reload dari posisi saat ini
        const pos = a.currentTime;
        a.load();
        a.addEventListener('canplay', () => { a.currentTime = pos; a.play().catch(() => {}); }, { once: true });
      }
    };
    document.addEventListener('visibilitychange', onResume);
    return () => document.removeEventListener('visibilitychange', onResume);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── YouTube background heartbeat
  // Chrome/Android men-throttle iframe saat tab di-background.
  // Solusi: kirim postMessage 'listening' setiap 10 detik agar browser tahu ada
  // aktivitas media aktif — sama seperti audio <element> yang terus "streaming".
  useEffect(() => {
    const tick = () => {
      const et = embedTrackRef.current;
      if (!et || et.type !== 'youtube') return;
      if (!playingRef.current) return;
      if (!ytIframeRef.current) return;
      try {
        // 'listening' memberi tahu YT Player API bahwa kita aktif memantau event
        ytIframeRef.current.contentWindow.postMessage(JSON.stringify({ event:'listening' }), '*');
        // Jika tab di background dan YT ter-pause oleh browser, paksa play lagi
        if (document.visibilityState === 'hidden') {
          ytIframeRef.current.contentWindow.postMessage(JSON.stringify({ event:'command', func:'playVideo', args:'' }), '*');
        }
      } catch(_) {}
    };
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const [searchQuery, setSearchQuery]   = useState('');

  // ── AI
  const [aiSubView, setAiSubView] = useState('chat'); // 'chat' | 'lyrics' | 'foryou'

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
  // ── Other: Playlist Generator ──────────────────────────────────────────
  const [otherInnerTab, setOtherInnerTab] = useState('pref'); // 'pref' | 'popular'
  const [prefPlaylist, setPrefPlaylist] = useState(null);
  const [prefPlaylistLoading, setPrefPlaylistLoading] = useState(false);
  const [prefPlaylistQueueLoading, setPrefPlaylistQueueLoading] = useState(false);
  const [popularPlaylistQueueLoading, setPopularPlaylistQueueLoading] = useState(false);
  const [popularPlaylist, setPopularPlaylist] = useState(null);
  const [popularPlaylistLoading, setPopularPlaylistLoading] = useState(false);
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
  const [chatAutoPlay, setChatAutoPlay] = useState(null); // index message yg sedang auto-fetch & play
  const [activeModelLabel, setActiveModelLabel] = useState('');
  const [vibeInput, setVibeInput] = useState('');
  const [vibeMatch, setVibeMatch] = useState(null); // { song, source:'drive'|'yt', query } hasil vibe search
  const [vibeLoading, setVL]    = useState(false);
  const [chatMode, setChatMode]   = useState('chat'); // 'chat' | 'mood'

  // ── Shazam-like audio recognition ─────────────────────────────
  const [shazamListening, setShazamListening] = useState(false); // sedang merekam
  const [shazamLoading, setShazamLoading]     = useState(false); // mengirim ke API
  // ── Speech-to-Text (Web Speech API) ───────────────────────────
  const [sttListening, setSttListening] = useState(false);
  const sttRef = useRef(null);
  const shazamMediaRef = useRef(null); // MediaRecorder instance
  // ── Mic menu popup (pilih mode: Shazam vs STT) ─────────────────
  const [showMicMenu, setShowMicMenu] = useState(false);
  const micMenuRef = useRef(null);
  // FIX Bug Race: flag ref untuk mencegah double-start saat async getUserMedia/getDisplayMedia belum selesai
  // (setState belum ter-commit sehingga guard shazamListening||shazamLoading belum aktif)
  const shazamStartingRef = useRef(false);
  // FIX Bug #5: simpan stream secara terpisah dari MediaRecorder.
  // MediaRecorder.stream adalah properti spec yang belum diimplementasi di semua browser
  // (Safari hingga v17 tidak mengeksposnya). Dengan menyimpan referensi stream sendiri
  // kita bisa menghentikan semua track dengan aman di manapun tanpa bergantung pada
  // MediaRecorder.prototype.stream.
  const shazamStreamRef = useRef(null);

  // ── Google Drive — restore session from localStorage if token still valid
  const [googleUser, setGoogleUser]     = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('sn_google_user') || 'null');
      // Jangan restore profil kalau token sudah expired / tidak ada
      const saved = JSON.parse(localStorage.getItem('sn_google_token') || 'null');
      const tokenValid = saved && saved.expiry > Date.now();
      if (!tokenValid) {
        localStorage.removeItem('sn_google_user'); // bersihkan data user lama
        return null;
      }
      return user;
    } catch { return null; }
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
  const [streamingPlatformsLoaded, setStreamingPlatformsLoaded] = useState(() => {
    // Cek apakah sudah di-cache sebelumnya (mis. kalau App re-render)
    return !!getStreamingPlatformsSync().length;
  }); // trigger re-render setelah lazy load
  const [driveDownProg, setDriveDownProg] = useState(0);   // 0-100, only in Pro mode
  const [drivePhase, setDrivePhase]       = useState('idle'); // 'idle' | 'check' | 'download'
  const [driveError, setDriveError]     = useState('');

  const [globalCover, setGlobalCover]   = useState(() => localStorage.getItem('sn_global_cover') || '');
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const coverInputRef = useRef(null);

  // Helper: ambil cover aktif (globalCover override semua)
  const getCover = useCallback((song) => isLite ? (globalCover || '') : (globalCover || song?.cover || song?.thumbnail || ''), [globalCover, isLite]);

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
  // ── Playlist Cloud Sync state
  const [plSyncStatus, setPlSyncStatus]   = useState('idle'); // 'idle'|'syncing'|'synced'|'error'
  const [plSyncError, setPlSyncError]     = useState('');
  const [plSyncedAt, setPlSyncedAt]       = useState(null);   // timestamp terakhir sync berhasil
  const plSyncTimerRef                    = useRef(null);
  const playlistsRef                      = useRef([]); // always-fresh ref untuk menghindari stale closure di setTimeout
  const [activePl, setActivePl]           = useState(null); // null = all songs, else playlist id
  const [showPlModal, setShowPlModal]     = useState(false);
  const [plPrefillName, setPlPrefillName] = useState('');
  const [plPrefillIds, setPlPrefillIds]   = useState([]);
  const [pendingPlayQueueItems, setPendingPlayQueueItems] = useState(null); // lagu AI yang perlu di-play setelah save
  const [showAddToModal, setShowAddToModal] = useState(false); // modal "tambah ke playlist yang ada"
  const [addToSongIds, setAddToSongIds]   = useState([]);
  const [editingPl, setEditingPl]         = useState(null);
  const [plView, setPlView]               = useState('list'); // 'list' | 'detail' | 'form'
  const [plGlobalSearch, setPlGlobalSearch] = useState('');
  const [mySongsEditMode, setMySongsEditMode] = useState(false);
  const [allSongsEditMode, setAllSongsEditMode] = useState(false);
  const [plSongsEditMode, setPlSongsEditMode] = useState(false);

  // ── Responsive
  const [ringSize, setRingSize] = useState(260);
  const [ringCenter, setRingCenter] = useState({ x: 0, y: 0 }); // center of OrbitalRing in viewport coords
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
  const bottomNavRef  = useRef(null);  // ref to mobile portrait bottom nav for height measurement
  const bottomNavHRef = useRef(68);    // actual measured height of bottom nav (default 68px)

  // ── Keep refs in sync
  useEffect(() => { shuffleRef.current  = shuffle;   }, [shuffle]);
  useEffect(() => { repeatRef.current   = repeat;    }, [repeat]);
  useEffect(() => { tokenRef.current    = accessToken; }, [accessToken]);
  useEffect(() => { isLiteRef.current   = isLite;    }, [isLite]);

  // ── Measure actual bottom nav height so portrait ring calc is always accurate
  useEffect(() => {
    const el = bottomNavRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const h = entries[0]?.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight;
      if (h > 0 && h !== bottomNavHRef.current) {
        bottomNavHRef.current = h;
        // Re-trigger layout calc so ring size updates immediately
        window.dispatchEvent(new Event('resize'));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
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

  // ── Geolocation: ambil lokasi user sekali, simpan ke localStorage
  useEffect(() => {
    if (!navigator.geolocation) return;
    // Hapus cache lama yang mungkin menyimpan format lama (kecamatan/provinsi/negara)
    // Deteksi: jika ada koma → format lama → paksa re-fetch
    const cachedLoc = localStorage.getItem('sn_user_location') || '';
    if (cachedLoc.includes(',')) {
      localStorage.removeItem('sn_user_location');
      localStorage.removeItem('sn_location_ts');
    }
    const locTs = parseInt(localStorage.getItem('sn_location_ts') || '0', 10);
    const weatherTs = parseInt(localStorage.getItem('sn_weather_ts') || '0', 10);
    const locFresh = userLocation && !userLocation.includes(',') && Date.now() - locTs < 24 * 60 * 60 * 1000;
    const weatherFresh = userWeather && Date.now() - weatherTs < 30 * 60 * 1000; // 30 menit
    if (locFresh && weatherFresh) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      // ── Reverse geocode (skip jika lokasi masih fresh)
      let lat = latitude, lon = longitude;
      if (!locFresh) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: { 'Accept-Language': 'id,en', 'User-Agent': 'StarryNightMPlayer/1.0' }
          });
          const data = await res.json();
          const addr = data?.address || {};
          const country = addr.country_code?.toUpperCase() || 'ID';

          // Nominatim Indonesia mapping:
          //   addr.county       = Kabupaten/Kota  ← SELALU ini dulu
          //   addr.city         = kota besar saja (Surabaya, Jakarta, dll)
          //   addr.town/village = BISA kecamatan/desa — JANGAN dipakai
          //   addr.state        = Provinsi — fallback terakhir jika semua kosong
          const rawKab = addr.county || addr.city || addr.state_district || '';
          const kab = rawKab
            .replace(/^(kabupaten|kota|city of|regency of|kab\.)\s+/i, '')
            .trim();

          // Fallback ke provinsi
          const rawProv = addr.state || addr.province || '';
          const prov = rawProv
            .replace(/^(provinsi|province of|daerah istimewa|dki|daerah khusus ibukota)\s*/i, '')
            .trim();

          // Fallback ke negara
          const countryName = (addr.country || '').trim();

          // Fallback ke koordinat
          const coords = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;

          const displayLoc = kab || prov || countryName || coords;
          if (displayLoc) {
            setUserLocation(displayLoc);
            setUserLocationCountry(country);
            localStorage.setItem('sn_user_location', displayLoc);
            localStorage.setItem('sn_user_location_country', country);
            localStorage.setItem('sn_location_ts', String(Date.now()));
            localStorage.removeItem('sn_popular_recs_ts');
            setPopularRecs(null);
          }
        } catch {}
      }

      // ── Cuaca via Open-Meteo (gratis, no API key)
      if (!weatherFresh) {
        try {
          const wRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh&timezone=auto`
          );
          const wData = await wRes.json();
          const curr = wData?.current;
          if (curr) {
            const code = curr.weather_code ?? 0;
            const temp = Math.round(curr.temperature_2m ?? 0);
            const wind = Math.round(curr.wind_speed_10m ?? 0);
            // WMO weather code → emoji + deskripsi singkat
            const weatherMap = (c) => {
              if (c === 0) return { emoji: '☀️', desc: 'Cerah' };
              if (c <= 2)  return { emoji: '🌤️', desc: 'Sebagian berawan' };
              if (c === 3) return { emoji: '☁️', desc: 'Berawan' };
              if (c <= 49) return { emoji: '🌫️', desc: 'Berkabut' };
              if (c <= 59) return { emoji: '🌦️', desc: 'Gerimis' };
              if (c <= 69) return { emoji: '🌧️', desc: 'Hujan' };
              if (c <= 79) return { emoji: '❄️', desc: 'Salju' };
              if (c <= 84) return { emoji: '🌨️', desc: 'Hujan bersalju' };
              if (c <= 99) return { emoji: '⛈️', desc: 'Badai petir' };
              return { emoji: '🌡️', desc: 'Cuaca tak dikenal' };
            };
            const { emoji, desc } = weatherMap(code);
            const weather = { temp, unit: '°C', emoji, desc, windkmh: wind };
            setUserWeather(weather);
            localStorage.setItem('sn_user_weather', JSON.stringify(weather));
            localStorage.setItem('sn_weather_ts', String(Date.now()));
            // Hapus cache popular agar di-refetch dengan konteks cuaca baru
            localStorage.removeItem('sn_popular_recs_ts');
            setPopularRecs(null);
          }
        } catch {}
      }
    }, () => {}, { timeout: 8000 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { try { localStorage.setItem('sn_tab', tab); } catch {} if (tab !== 'player') setFullscreen(false); }, [tab]);
  useEffect(() => { try { localStorage.setItem('sn_shuffle', shuffle); } catch {} }, [shuffle]);
  useEffect(() => { try { localStorage.setItem('sn_repeat', repeat); } catch {} }, [repeat]);
  useEffect(() => { try { localStorage.setItem('sn_liked', JSON.stringify(liked)); } catch {} }, [liked]);
  useEffect(() => { try { localStorage.setItem('sn_playlists', JSON.stringify(playlists)); } catch {} playlistsRef.current = playlists; }, [playlists]);

  // ── Auto-sync playlists ke Google Drive (debounce 3 detik setelah perubahan)
  const syncPlaylistsToCloud = useCallback(async (token, pls, silent = false) => {
    if (!token) return;
    if (!silent) setPlSyncStatus('syncing');
    try {
      await driveSavePlaylists(token, pls);
      setPlSyncStatus('synced');
      setPlSyncedAt(Date.now());
      setPlSyncError('');
      setTimeout(() => setPlSyncStatus('idle'), 3000);
    } catch(e) {
      setPlSyncStatus('error');
      setPlSyncError(e.message || 'Sync gagal');
      setTimeout(() => setPlSyncStatus('idle'), 5000);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return; // hanya sync jika login
    if (plSyncTimerRef.current) clearTimeout(plSyncTimerRef.current);
    plSyncTimerRef.current = setTimeout(() => {
      // Gunakan ref agar selalu pakai nilai terbaru saat setTimeout fires (hindari stale closure)
      const tok = tokenRef.current;
      const pls = playlistsRef.current;
      if (tok && pls) syncPlaylistsToCloud(tok, pls, true);
    }, 3000);
    return () => { if (plSyncTimerRef.current) clearTimeout(plSyncTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlists, accessToken]);
  useEffect(() => { try { localStorage.setItem('sn_fav_songs', JSON.stringify(favSongs)); } catch {} }, [favSongs]);
  useEffect(() => { try { localStorage.setItem('sn_yt_songs', JSON.stringify(ytSongs)); } catch {} }, [ytSongs]);
  useEffect(() => { try { localStorage.setItem('sn_history', JSON.stringify(history)); } catch {} }, [history]);

  // ── Silent token refresh — dipindah ke sini agar tersedia sebelum useEffect lain
  //
  // Guard: simpan promise yang sedang berjalan di ref agar 7 call-site tidak
  // memunculkan OAuth popup berulang secara bersamaan. Semua caller yang datang
  // saat refresh sudah in-flight akan di-attach ke promise yang sama.
  const _refreshInFlight = useRef(null);

  const silentRefreshToken = useCallback(() => {
    // Kalau sudah ada refresh yang sedang berjalan, kembalikan promise yang sama
    if (_refreshInFlight.current) return _refreshInFlight.current;

    const promise = new Promise((resolve, reject) => {
      if (!window.google || !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('GANTI_DENGAN')) {
        return reject(new Error('Google API tidak tersedia'));
      }
      try {
        // Baca email user dari localStorage untuk login_hint
        // login_hint wajib agar GIS bisa silent refresh tanpa popup
        let hint = '';
        try {
          const savedUser = JSON.parse(localStorage.getItem('sn_google_user') || 'null');
          hint = savedUser?.email || '';
        } catch {}
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID, scope: GOOGLE_SCOPES,
          prompt: '',        // no user interaction required
          hint,              // login_hint: wajib untuk silent refresh agar tidak popup
          callback: resp => {
            if (resp.error) return reject(new Error(resp.error));
            const tok = resp.access_token;
            setAccessToken(tok); tokenRef.current = tok;
            // Simpan expiry 55 menit (3300 detik) — lebih konservatif dari token lifetime 60 menit
            // agar proactive refresh 5 menit sebelum expiry punya cukup waktu
            try {
              localStorage.setItem('sn_google_token', JSON.stringify({ token: tok, expiry: Date.now() + 3300 * 1000 }));
            } catch (e) {
              console.warn('[silentRefreshToken] Gagal simpan token ke localStorage:', e);
            }
            resolve(tok);
          }
        });
        client.requestAccessToken({ prompt: '' });
      } catch(e) { reject(e); }
    });

    // Pasang di ref, bersihkan saat selesai (baik resolve maupun reject)
    _refreshInFlight.current = promise;
    promise.finally(() => { _refreshInFlight.current = null; });
    return promise;
  }, []);

  // ── Load GIS
  useEffect(() => {
    if (!document.getElementById('gis-script')) {
      const s=document.createElement('script'); s.id='gis-script'; s.src='https://accounts.google.com/gsi/client'; s.async=true; document.head.appendChild(s);
    }
  }, []);

  // ── PWA Install prompt — capture beforeinstallprompt & wire up install flow
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [pwaInstalled, setPwaInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
  const [pwaBannerDismissed, setPwaBannerDismissed] = useState(
    () => localStorage.getItem('sn_pwa_dismissed') === '1'
  );
  const [pwaBannerVisible, setPwaBannerVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setPwaPrompt(e);
      setPwaBannerVisible(true);
    };
    const onAppInstalled = () => {
      setPwaInstalled(true);
      setPwaPrompt(null);
      setPwaBannerVisible(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const installPwa = useCallback(async () => {
    if (!pwaPrompt) return;
    pwaPrompt.prompt();
    const { outcome } = await pwaPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaInstalled(true);
      setPwaPrompt(null);
      setPwaBannerVisible(false);
    }
  }, [pwaPrompt]);

  const dismissPwaBanner = useCallback(() => {
    setPwaBannerDismissed(true);
    setPwaBannerVisible(false);
    localStorage.setItem('sn_pwa_dismissed', '1');
  }, []);

  useEffect(() => {
    // Handle shortcut URLs: ?tab=stream / ?tab=playlist / ?tab=ai
    // AND protocol_handlers intents:
    //   web+starry://<anything>      → ?intent=<encoded-url>   (general deep link)
    //   web+starryplay://<query>     → ?play=<encoded-query>   (langsung cari & putar)
    //   web+starryradio://<station>  → ?tab=stream&station=<id> (buka radio ke stasiun tertentu)
    const urlParams = new URLSearchParams(window.location.search);

    const tabParam     = urlParams.get('tab');
    const intentParam  = urlParams.get('intent');   // web+starry://
    const playParam    = urlParams.get('play');     // web+starryplay://
    const stationParam = urlParams.get('station');  // web+starryradio://

    const tabMap = { stream: 'stream', playlist: 'playlist', ai: 'ai', library: 'playlist', search: 'ai' };

    // ── ?tab= (shortcuts & web+starryradio) ──
    if (tabParam) {
      if (tabMap[tabParam]) setTimeout(() => setTab(tabMap[tabParam]), 500);
    }

    // ── web+starryradio://<stationId> → buka tab stream & pilih stasiun ──
    if (stationParam) {
      const decoded = decodeURIComponent(stationParam);
      setTimeout(() => {
        setTab('stream');
        const found = (window.__RADIO_STATIONS__ || []).find(
          s => s.id === decoded || s.name?.toLowerCase().includes(decoded.toLowerCase())
        );
        if (found) setRadioStation(found);
      }, 600);
    }

    // ── web+starryplay://<query> → set search query di tab AI/search ──
    if (playParam) {
      const query = decodeURIComponent(playParam);
      setTimeout(() => {
        setUnifiedQuery(query);
        setTab('ai');
      }, 500);
    }

    // ── web+starry://<intent> → general intent routing ──
    if (intentParam) {
      try {
        const decoded = decodeURIComponent(intentParam);
        // Format: "play:<query>" | "tab:<tabname>" | "radio:<stationId>"
        const [action, ...rest] = decoded.split(':');
        const value = rest.join(':').trim();
        setTimeout(() => {
          if (action === 'play' && value) { setUnifiedQuery(value); setTab('ai'); }
          else if (action === 'tab'  && tabMap[value]) setTab(tabMap[value]);
          else if (action === 'radio') setTab('stream');
        }, 500);
      } catch { /* URL malformed, abaikan */ }
    }

    // Bersihkan query string dari URL bar setelah diproses
    if (tabParam || intentParam || playParam || stationParam) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // ── Online / Offline detection
  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  // ── Tutup mic menu saat klik di luar ───────────────────────────
  useEffect(() => {
    if (!showMicMenu) return;
    const handler = (e) => {
      if (micMenuRef.current && !micMenuRef.current.contains(e.target)) {
        setShowMicMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showMicMenu]);

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

  // ── Validasi cachedDriveIds saat startup: hapus ID yang blobnya hilang atau tidak 100% penuh
  useEffect(() => {
    if (cachedDriveIds.size === 0) return;
    (async () => {
      const invalidIds = [];
      for (const driveId of cachedDriveIds) {
        try {
          const blob = await cacheGet(driveId);
          if (!blob) { invalidIds.push(driveId); continue; }
          const { isFull } = checkCachedBlob(driveId, blob);
          if (!isFull) invalidIds.push(driveId);
        } catch { invalidIds.push(driveId); }
      }
      if (invalidIds.length > 0) {
        setCachedDriveIds(prev => {
          const next = new Set(prev);
          invalidIds.forEach(id => next.delete(id));
          return next;
        });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // hanya sekali saat mount

  // ── Validasi cachedFavIds saat startup: hapus ID yang blobnya sudah hilang dari cache
  useEffect(() => {
    if (cachedFavIds.size === 0) return;
    (async () => {
      const invalidIds = [];
      for (const songId of cachedFavIds) {
        try {
          const blob = await favCacheGet(songId);
          if (!blob || blob.size < 1000) invalidIds.push(songId);
        } catch { invalidIds.push(songId); }
      }
      if (invalidIds.length > 0) {
        setCachedFavIds(prev => {
          const next = new Set(prev);
          invalidIds.forEach(id => next.delete(id));
          return next;
        });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // hanya sekali saat mount
  useEffect(() => {
    try { localStorage.setItem('sn_cached_yt_ids', JSON.stringify([...cachedYtIds])); } catch {}
  }, [cachedYtIds]);

  // ── Sync likedYtPending ke localStorage
  useEffect(() => {
    try { localStorage.setItem('sn_liked_yt_pending', JSON.stringify([...likedYtPending])); } catch {}
  }, [likedYtPending]);

  // ── Sync cachedFavIds ke localStorage
  useEffect(() => {
    try { localStorage.setItem('sn_cached_fav_ids', JSON.stringify([...cachedFavIds])); } catch {}
  }, [cachedFavIds]);

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
      // Token hampir/sudah expired (<10 menit, konsisten dengan proactive refresh) → silent refresh dulu
      // Jika refresh gagal tapi token masih ada, tetap gunakan token lama (silent fail — jangan tampilkan error)
      if (saved && saved.expiry - Date.now() < 10 * 60 * 1000) {
        silentRefreshToken()
          .then(newTok => loadDriveSongs(newTok, false))
          .catch(() => {
            // Refresh gagal — jika token masih belum expired, lanjutkan dengan token lama (silent)
            if (saved.expiry > Date.now()) {
              loadDriveSongs(tok, false);
            }
            // Jika benar-benar sudah expired, biarkan saja — jangan tampilkan error saat ini
            // Error akan muncul saat user benar-benar mencoba melakukan aksi (play/load)
          });
      }
      // Jika token masih segar: TIDAK paksa reload Drive, cukup biarkan data yang ada
      // (loadDriveSongs akan dipanggil lagi jika user membuka tab Drive atau menekan ↻)
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
          setRingCenter({ x: mainW / 2, y: mainH / 2 });
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
          setRingCenter({ x: ringColW / 2, y: vh / 2 });
        } else {
          // Portrait fullscreen: centered, leave room for controls below
          const size = Math.min(vw - 48, vh - 240);
          setRingSize(Math.max(180, Math.min(480, size)));
          // Ring is roughly centered in top ~60% of screen
          setRingCenter({ x: vw / 2, y: vh * 0.38 });
        }
        return;
      }

      if (mode === 'desktop-landscape') {
        // Desktop Landscape — wide sidebar + centered ring
        const sidebarW = SIDEBAR_W_LANDSCAPE;
        const mainW = vw - sidebarW;
        const mainH = vh - HEADER_H_NORMAL;
        const reservedH = 270;
        const byH = mainH - reservedH;
        const byW = mainW - 80;
        const ring = Math.max(180, Math.min(320, Math.min(byH, byW)));
        setRingSize(ring);
        // Ring is vertically centered in mainH area (justifyContent:'center' in player column)
        setRingCenter({ x: sidebarW + mainW / 2, y: HEADER_H_NORMAL + mainH / 2 });
        // Fixed small padding — vertical centering handled by justifyContent:'center' on container
        setLayoutVars({
          playerPad: '16px 24px',
          trackTitleSize: `clamp(16px,${Math.round(mainW * 0.04)}px,28px)`,
          artistSize: '12px', controlsGap: '14px', actionPad: '9px 0',
          volumeMt: '12px',
          controlsMt: '14px',
          infoMt: '12px',
        });
      } else if (mode === 'desktop-portrait') {
        // Desktop Portrait — narrower sidebar, taller player
        const sidebarW = SIDEBAR_W_PORTRAIT;
        const mainW = vw - sidebarW;
        const mainH = vh - HEADER_H_NORMAL;
        const reservedH = 260;
        const byH = mainH - reservedH;
        const byW = mainW - 60;
        const ring = Math.max(160, Math.min(300, Math.min(byH, byW)));
        setRingSize(ring);
        // Ring is vertically centered in mainH area
        setRingCenter({ x: sidebarW + mainW / 2, y: HEADER_H_NORMAL + mainH / 2 });
        // Fixed small padding — vertical centering handled by justifyContent:'center' on container
        setLayoutVars({
          playerPad: '12px 20px',
          trackTitleSize: `clamp(14px,${Math.round(mainW * 0.04)}px,24px)`,
          artistSize: '11px', controlsGap: '12px', actionPad: '8px 0',
          volumeMt: '10px',
          controlsMt: '12px',
          infoMt: '10px',
        });
      } else if (mode === 'mobile-landscape') {
        // Mobile Landscape — slim side icon nav (52px) + two-column player
        const sideNavW = 52;
        const mainW = vw - sideNavW;
        const mainH = vh - HEADER_H_LANDSCAPE;
        // Left col = ~42% of mainW; ring fits height with padding
        const ringColW = Math.round(mainW * 0.42);
        const ring = Math.max(110, Math.min(mainH - 12, ringColW - 20));
        setRingSize(ring);
        // Ring centered in left column
        setRingCenter({ x: sideNavW + ringColW / 2, y: HEADER_H_LANDSCAPE + mainH / 2 });
        setLayoutVars({
          playerPad: '4px 10px 4px',
          trackTitleSize: `clamp(12px,${Math.round((mainW - ringColW) * 0.06)}px,16px)`,
          artistSize: '10px',
          controlsGap: '10px',
          actionPad: '5px 0',
          volumeMt: '4px',
          controlsMt: '4px',
          infoMt: '4px',
        });
      } else {
        // Portrait: full-width stacked
        // Fixed slots (measured realistically):
        //   header=46, clockRow=38, badge=20, trackInfo=44, controls=60, volume=32, actions=50, bottomNav(measured), gaps=16
        const fixed = HEADER_H_NORMAL + 38 + 20 + 44 + 60 + 32 + 50 + bottomNavHRef.current + 16;
        const availH = vh - fixed;
        const availW = vw - 40;
        // Ring: fits available space, capped tightly so elements don't overflow
        const ring = Math.max(140, Math.min(availH, availW, 255));
        setRingSize(ring);
        // Ring top = header + playerPad + clockRow(38) + badge(20), centered horizontally
        const playerPadTop = Math.max(6, Math.min(14, Math.round(Math.max(0, vh - fixed - ring) / 10)));
        const ringTopY = HEADER_H_NORMAL + playerPadTop + 38 + ring / 2;
        setRingCenter({ x: vw / 2, y: ringTopY });
        // Remaining vertical space after ring — distribute as small uniform gaps
        const spare = Math.max(0, vh - fixed - ring);
        const gapUnit = Math.round(spare / 10); // ~10 flex gaps in space-evenly
        const clampPx = (min, max) => `${Math.max(min, Math.min(max, gapUnit))}px`;
        setLayoutVars({
          playerPad: `${Math.max(6, Math.min(14, gapUnit))}px 16px ${Math.max(4, Math.min(8, Math.floor(gapUnit * 0.5)))}px`,
          trackTitleSize: vw >= 390 ? '16px' : '14px',
          artistSize: '11px',
          controlsGap: vw >= 390 ? '14px' : '10px',
          actionPad: `${clampPx(6, 10)} 0`,
          volumeMt: clampPx(2, 6),
          controlsMt: clampPx(2, 6),
          infoMt: clampPx(2, 6),
        });
      }
    };
    calc();
    window.addEventListener('resize', calc);
    // Reset lock state jika orientasi berubah natural (user putar fisik tanpa tombol)
    const handleOrientationChange = () => { setOrientationLocked(false); };
    screen?.orientation?.addEventListener?.('change', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', calc);
      screen?.orientation?.removeEventListener?.('change', handleOrientationChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Audio init + events (DIGABUNG dalam satu useEffect agar tidak race condition)
  // Bug sebelumnya: dua useEffect terpisah ([track.src] dan [track]) bisa menyebabkan
  // event listener (timeupdate, loadedmetadata, durationchange) attach ke Audio lama
  // sebelum instance baru dibuat — akibatnya duration tidak terbaca dan seek tidak berfungsi.
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
    // Lite: preload none (hemat bandwidth). Radio: auto (mulai buffer segera untuk kurangi loading awal)
    a.preload = isLite ? 'none' : (track.isRadio ? 'auto' : 'metadata');
    // Mobile: izinkan playback di background / lock screen
    a.setAttribute('playsinline', '');
    a.setAttribute('webkit-playsinline', '');
    a.setAttribute('x-webkit-airplay', 'allow');
    if (!track.isRadio) {
      a.crossOrigin = 'anonymous';
    }
    audioRef.current = a;

    // ── Attach event listeners langsung setelah Audio dibuat (bukan di useEffect terpisah)
    // ── sehingga tidak ada jeda di mana React effects bisa membaca audioRef yang sudah stale
    let lastTimeSaved = 0;
    const onTime = () => {
      const now = a.currentTime;
      // threshold seragam 1 s di semua mode — penghematan CPU dari debounce 2 s
      // tidak sebanding dengan jerkiness progress bar yang ditimbulkan di Lite.
      if (Math.abs(now - lastTimeSaved) < 1) return;
      lastTimeSaved = now;
      setProgress(now);
    };
    const trySetDur = () => {
      if (isFinite(a.duration) && a.duration > 0) { setDuration(a.duration); return true; }
      return false;
    };
    const onMeta      = () => trySetDur();
    const onDurChange = () => trySetDur();
    const onEnd = () => {
      // Radio: 'ended' bukan berarti lagu selesai — stream diputus (misal: Vercel proxy timeout)
      // Reconnect otomatis agar playback tidak terputus
      if (track.isRadio) {
        console.warn('[Radio] Stream ended unexpectedly (proxy timeout?), reconnecting…');
        scheduleRadioReconnect(track);
        return;
      }
      if (repeatRef.current === 'one') {
        // Fix repeat-one: simpan src, reset via load(), set src ulang agar canplay selalu fire.
        // Tanpa re-assign src, beberapa browser (Chrome/Safari) tidak fire canplay setelah load().
        const savedSrc = a.src;
        a.load();
        a.src = savedSrc; // pastikan src tidak hilang setelah load()
        const doPlay = () => {
          a.currentTime = 0;
          a.play().catch(e => { console.warn('repeat-one play error:', e); setPlaying(false); });
        };
        if (a.readyState >= 3) {
          doPlay();
        } else {
          a.addEventListener('canplay', doPlay, { once: true });
        }
        return;
      }
      if (repeatRef.current === 'all' || shuffleRef.current) {
        if (goNextRef.current) goNextRef.current({ auto: true });
      } else {
        // Tidak ada repeat/shuffle — lagu berhenti dan posisi kembali ke awal
        // agar user bisa menekan play lagi dari awal tanpa seek manual
        setPlaying(false);
        setProgress(0);
        a.currentTime = 0;
      }
    };
    const onError = () => {
      const err = a.error;
      // src='' saat ganti lagu atau stop disengaja → error code 4 (MEDIA_ERR_SRC_NOT_SUPPORTED) tanpa src
      // Jangan proses sebagai error nyata
      if (!a.src || a.src === window.location.href) return;
      if (track.isRadio) {
        console.warn('[Radio] Stream error, scheduling reconnect. code:', err?.code);
        scheduleRadioReconnect(track);
        return;
      }
      if (track.isDrive && track.driveId && err && (err.code === 2 || err.code === 4)) {
        const tok = tokenRef.current;
        if (tok) {
          const savedPos = a.currentTime;
          console.warn('[Drive] Audio error, retrying from', savedPos, 'err:', err.code);
          // Bersihkan cache hanya untuk driveId ini (bukan berdasarkan token)
          for (const [k, v] of _blobCache) {
            if (k === track.driveId || k === `${track.driveId}:lite`) { URL.revokeObjectURL(v); _blobCache.delete(k); }
          }
          // Coba dengan token saat ini dulu, refresh hanya jika benar-benar 401/403
          const tryWithToken = (useTok) => {
            const fn = isLite ? driveStreamLite : driveStreamBlob;
            return fn(track.driveId, useTok, audioRef);
          };
          tryWithToken(tok)
            .catch(e => {
              if (e.message.includes('401') || e.message.includes('403')) {
                return silentRefreshToken().then(tryWithToken);
              }
              throw e;
            })
            .then(url => {
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
    let stallTimer = null;
    let waitingTimer = null; // debounce untuk 'waiting' agar tidak flicker di koneksi normal
    const onStall = () => {
      if (track.isRadio) {
        // Debounce: tunggu 2 detik sebelum reconnect (dipercepat dari 4s)
        // Alasan: Vercel proxy memotong stream tiap ~60 detik, reconnect harus cepat
        if (a.readyState < 2 && !a.paused) {
          if (!stallTimer) {
            stallTimer = setTimeout(() => {
              stallTimer = null;
              if (!a.paused && a.readyState < 2) scheduleRadioReconnect(track);
            }, 2000);
          }
        }
        return;
      }
      // FIX: Jangan reset audio saat tab/app di-background.
      // Browser sengaja menghentikan buffering saat background → stall adalah normal.
      // Memanggil a.load() di sini akan mereset posisi & membatalkan background playback.
      if (document.visibilityState === 'hidden') return;
      if (a.readyState < 3 && !a.paused) {
        a.load();
        const pos = a.currentTime;
        a.addEventListener('canplay', () => { a.currentTime = pos; a.play().catch(()=>{}); }, { once: true });
      }
    };
    const onWaiting  = () => {
      if (!track.isRadio) return;
      // Debounce 800ms: 'waiting' event sering muncul singkat saat normal buffering
      // Tanpa debounce, indikator BUFFERING… berkedip-kedip terus padahal stream sehat
      if (waitingTimer) clearTimeout(waitingTimer);
      waitingTimer = setTimeout(() => {
        waitingTimer = null;
        if (!a.paused) setStreamBuffering(true);
      }, 800);
    };
    const onPlaying2 = () => { if (track.isRadio) { setStreamBuffering(false); radioReconnectCount.current = 0; if (radioReconnectRef.current) { clearTimeout(radioReconnectRef.current); radioReconnectRef.current = null; } if (stallTimer) { clearTimeout(stallTimer); stallTimer = null; } if (waitingTimer) { clearTimeout(waitingTimer); waitingTimer = null; } } };
    a.addEventListener('timeupdate',     onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('durationchange', onDurChange);
    a.addEventListener('ended',          onEnd);
    a.addEventListener('error',          onError);
    a.addEventListener('stalled',        onStall);
    a.addEventListener('waiting',        onWaiting);
    a.addEventListener('playing',        onPlaying2);

    // Reset progress & duration untuk lagu baru
    setProgress(0);
    setDuration(0);

    const isHlsSrc = track.src.includes('.m3u8') || track.src.includes('/hls/') || track.src.includes('chunklist');
    if (track.isRadio && isHlsSrc) {
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

    // Immediate check — metadata may already be loaded (blob URL / fast network)
    trySetDur();
    // Polling fallback: VBR MP3 may report Infinity initially, then settle later
    let pollCount = 0;
    const durPoll = setInterval(() => {
      if (trySetDur() || ++pollCount > 20) clearInterval(durPoll);
    }, 500);

    return () => {
      a.removeEventListener('timeupdate',     onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('durationchange', onDurChange);
      a.removeEventListener('ended',          onEnd);
      a.removeEventListener('error',          onError);
      a.removeEventListener('stalled',        onStall);
      a.removeEventListener('waiting',        onWaiting);
      a.removeEventListener('playing',        onPlaying2);
      clearInterval(durPoll);
      if (stallTimer) clearTimeout(stallTimer);
      if (waitingTimer) clearTimeout(waitingTimer);
      a.pause(); a.src = '';
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [track.src]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync playingRef
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { trackRef.current = track; }, [track]);
  const embedTrackRef = useRef(embedTrack);
  useEffect(() => { embedTrackRef.current = embedTrack; }, [embedTrack]);

  // ── Media Session API — lock screen controls & background playback on mobile
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const activeTrack = embedTrack || track;
    const title  = activeTrack?.title  || 'Starry Night MPlayer';
    const artist = activeTrack?.artist || '';
    const album  = activeTrack?.album  || (track.isRadio ? 'Live Radio' : '');
    const cover  = globalCover || (embedTrack?.type === 'youtube' ? (embedTrack?.thumbnail || getCover(track)) : getCover(track)) || '/icon-512.png';
    navigator.mediaSession.metadata = new MediaMetadata({
      title, artist, album,
      artwork: [
        { src: cover, sizes: '512x512', type: 'image/png' },
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
    });
    navigator.mediaSession.setActionHandler('play',           () => { setPlaying(true);  });
    navigator.mediaSession.setActionHandler('pause',          () => { setPlaying(false); });
    navigator.mediaSession.setActionHandler('stop',           () => { setPlaying(false); });
    navigator.mediaSession.setActionHandler('previoustrack',  () => { if (track.isRadio) goPrevRadio(); else if (embedTrack?.type === 'youtube') ytPrev(); else goPrev(); });
    navigator.mediaSession.setActionHandler('nexttrack',      () => { if (track.isRadio) goNextRadio(); else if (embedTrack?.type === 'youtube') ytNext(); else goNext(); });
    if (!track.isRadio && !embedTrack) {
      navigator.mediaSession.setActionHandler('seekbackward', (d) => {
        const a = audioRef.current; if (!a) return;
        a.currentTime = Math.max(0, a.currentTime - (d?.seekOffset ?? 10));
      });
      navigator.mediaSession.setActionHandler('seekforward',  (d) => {
        const a = audioRef.current; if (!a) return;
        a.currentTime = Math.min(a.duration || 0, a.currentTime + (d?.seekOffset ?? 10));
      });
    } else {
      try { navigator.mediaSession.setActionHandler('seekbackward', null); } catch {}
      try { navigator.mediaSession.setActionHandler('seekforward',  null); } catch {}
    }
    return () => {
      try { navigator.mediaSession.setActionHandler('play',          null); } catch {}
      try { navigator.mediaSession.setActionHandler('pause',         null); } catch {}
      try { navigator.mediaSession.setActionHandler('stop',          null); } catch {}
      try { navigator.mediaSession.setActionHandler('previoustrack', null); } catch {}
      try { navigator.mediaSession.setActionHandler('nexttrack',     null); } catch {}
      try { navigator.mediaSession.setActionHandler('seekbackward',  null); } catch {}
      try { navigator.mediaSession.setActionHandler('seekforward',   null); } catch {}
    };
  }, [track, embedTrack, globalCover, playing]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync Media Session playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  }, [playing]);


  useEffect(() => {
    // Control YouTube iframe when embedTrack is active
    if (embedTrack?.type === 'youtube') {
      const cmd = playing ? 'playVideo' : 'pauseVideo';
      // Kirim command dengan retry — iframe mungkin belum siap saat baru mount
      const sendCmd = () => {
        try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:cmd, args:'' }), '*'); } catch(_){}
      };
      // Coba segera, lalu retry beberapa kali agar pasti terkirim
      const t1 = setTimeout(sendCmd, 250);
      const t2 = setTimeout(sendCmd, 800);
      const t3 = setTimeout(sendCmd, 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
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
    const msUntilRefresh = saved.expiry - Date.now() - 10 * 60 * 1000; // 10 min early
    if (msUntilRefresh <= 0) {
      silentRefreshToken().catch(() => {}); // already expired, try now
      return;
    }
    const timer = setTimeout(() => { silentRefreshToken().catch(() => {}); }, msUntilRefresh);
    return () => clearTimeout(timer);
  }, [accessToken, silentRefreshToken]);

  // ── Fetch YT trending when stream tab opens (once per session, refreshable)
  useEffect(() => { if (tab === 'stream') fetchYtTrending(); }, [tab]); // eslint-disable-line

  // ── Lazy-load STREAMING_PLATFORMS segera saat app mount (bukan nunggu tab stream)
  useEffect(() => {
    if (!streamingPlatformsLoaded) {
      getStreamingPlatforms().then(() => {
        setStreamingPlatformsLoaded(true);
      });
    }
  }, []); // eslint-disable-line

  // ── Volume/mute
  useEffect(() => {
    // Update HTML audio element
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
    // Update YouTube iframe via postMessage
    if (embedTrack?.type === 'youtube' && ytIframeRef.current) {
      const ytVol = muted ? 0 : Math.round(volume * 100);
      try {
        ytIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [ytVol] }), '*'
        );
        if (muted) {
          ytIframeRef.current.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'mute', args: '' }), '*'
          );
        } else {
          ytIframeRef.current.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'unMute', args: '' }), '*'
          );
        }
      } catch (_) {}
    }
  }, [volume, muted, embedTrack]);
  useEffect(() => { try { localStorage.setItem('sn_volume', volume); } catch {} }, [volume]);
  useEffect(() => { try { localStorage.setItem('sn_muted', muted ? '1' : '0'); } catch {} }, [muted]);

  // ── YouTube time sync: listen to postMessage events from iframe
  useEffect(() => {
    if (!embedTrack || embedTrack.type !== 'youtube') return;
    const sendCmd = (func, args = '') => {
      try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func, args }), '*'); } catch(_){}
    };
    const handler = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;
        // Iframe siap → paksa play jika memang harusnya playing
        if (data.event === 'onReady') {
          if (playingRef.current) sendCmd('playVideo');
        }
        if (data.event === 'infoDelivery' && data.info) {
          if (data.info.currentTime != null) { setYtProgress(data.info.currentTime); ytProgressRef.current = data.info.currentTime; }
          if (data.info.duration != null && data.info.duration > 0) { setYtDuration(data.info.duration); ytDurationRef.current = data.info.duration; }
          // playerState: 1=playing, 2=paused — sinkronkan state playing
          if (data.info.playerState === 1 && !playingRef.current) setPlaying(true);
          if (data.info.playerState === 2 && playingRef.current) setPlaying(false);
        }
        // State change handling — order matters: ended (0) must be exclusive
        if (data.event === 'onStateChange') {
          if (data.info === 0) {
            // Video ended → auto next; do NOT set playing=false here
            // (ytNext will handle play state itself)
            // Abaikan ended palsu saat sedang seekTo(0) untuk repeat-one
            if (ytRepeatSeekingRef.current) { ytRepeatSeekingRef.current = false; return; }
            if (!ytEndedFiredRef.current) { ytEndedFiredRef.current = true; setTimeout(() => { if (ytNextRef.current) ytNextRef.current({ auto: true }); }, 300); }
          } else if (data.info === 1) {
            if (!playingRef.current) setPlaying(true);
          } else if (data.info === 2) {
            // paused — only update if not in the middle of a repeat/seek operation
            if (playingRef.current) setPlaying(false);
          }
        }
        // FIX Bug 2: handle iframe error (video private / geo-block / embedding disabled)
        // YT error codes: 2=bad param, 5=HTML5 error, 100=not found, 101/150=embedding disabled
        if (data.event === 'onError') {
          console.warn('[YT] iframe error code:', data.info, '— skip ke lagu berikutnya');
          if (!ytEndedFiredRef.current) { ytEndedFiredRef.current = true; setTimeout(() => { if (ytNextRef.current) ytNextRef.current({ auto: true }); }, 500); }
        }
      } catch(_) {}
    };
    window.addEventListener('message', handler);
    // Poll current time via rAF — mulus 1 s di semua mode (Lite & Pro).
    // rAF otomatis berhenti saat tab di-background (tidak buang CPU/baterai),
    // menggantikan setInterval 3000ms Lite yang membuat progress bar loncat setiap 3 detik.
    let rafPollId;
    let lastPollTs = 0;
    const RAF_POLL_MS = 1000;
    const rafPoll = (ts) => {
      if (ts - lastPollTs >= RAF_POLL_MS) {
        lastPollTs = ts;
        try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'listening' }), '*'); } catch(_) {}
      }
      rafPollId = requestAnimationFrame(rafPoll);
    };
    rafPollId = requestAnimationFrame(rafPoll);
    // Fallback: deteksi video selesai via progress jika onStateChange tidak terpanggil
    // (terjadi di beberapa browser/device karena iframe off-screen atau policy browser)
    const endedFallback = setInterval(() => {
      if (!ytEndedFiredRef.current && ytDurationRef.current > 0 && ytProgressRef.current > 0) {
        const remaining = ytDurationRef.current - ytProgressRef.current;
        if (remaining <= 1.5 && playingRef.current) {
          ytEndedFiredRef.current = true;
          setTimeout(() => { if (ytNextRef.current) ytNextRef.current({ auto: true }); }, 400);
        }
      }
    }, 800);
    return () => { window.removeEventListener('message', handler); cancelAnimationFrame(rafPollId); clearInterval(endedFallback); };
  }, [embedTrack, seekYt]);

  // ── Chat scroll
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  // ── Track history + prefetch lagu berikutnya
  useEffect(() => {
    setHistory(prev => { const f=prev.filter(s=>s.id!==track.id); return [track,...f].slice(0,15); });
    setLyrics(''); setInsight(''); setLyricsRomanized(''); setLyricsRomanizing(false); setLyricsNeedGenerate(false); setLyricsGenerated(false); setLrcLines([]); setRomanizedLrcLines([]);
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

  // ── FIX Bug #10: Auto-romanisation — trigger romanizeLyrics otomatis saat lirik non-Latin berhasil dimuat
  // Sebelumnya hanya manual via tombol, padahal ada komentar "Auto-romanisation" di kode.
  useEffect(() => {
    if (!lyrics || isLite) return;
    if (lyrics.startsWith('⚡') || lyrics === ('' || 'Lyrics not found')) return;
    if (hasNonLatin(lyrics) && !lyricsRomanized && !lyricsRomanizing) {
      romanizeLyrics(lyrics);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lyrics]);

  // ── FIX Bug #9: Caption ticker — interval 250ms hanya aktif saat tab lyrics terbuka dan ada lrcLines
  // Tanpa ini, live caption tidak bergerak karena progress hanya update 1x/detik dan React
  // tidak re-render lyrics view lebih sering dari perubahan state.
  useEffect(() => {
    if (aiSubView !== 'lyrics' || lrcLines.length === 0) return;
    const id = setInterval(() => setCaptionTick(t => t + 1), 250);
    return () => clearInterval(id);
  }, [aiSubView, lrcLines.length]);

  // ── Wawasan Kosmik: manual — dipanggil via tombol ✨ di area chat ──
  const cosmicInsightRef = useRef(null);
  const [cosmicLoading, setCosmicLoading] = useState(false);
  useEffect(() => { cosmicInsightRef.current = { track, embedTrack, lang, isLite, askAIRace, activeModel, userLocation, userWeather }; });
  const generateCosmicInsight = async () => {
    const ctx = cosmicInsightRef.current;
    if (!ctx || cosmicLoading) return;
    if (ctx.isLite) { setMessages(p => [...p, { from: 'ai', text: '⚡ Lite Mode aktif — Wawasan Kosmik dinonaktifkan.', isCosmicInsight: true }]); return; }
    const activeTitle  = ctx.embedTrack ? (ctx.embedTrack.title  || ctx.track.title)  : ctx.track.title;
    const activeArtist = ctx.embedTrack ? (ctx.embedTrack.artist || ctx.track.artist) : ctx.track.artist;
    if (!activeTitle || activeTitle === 'Unknown') return;
    setCosmicLoading(true);
    try {
      const now = new Date();
      const hour = now.getHours();
      const timeOfDay = ctx.lang === 'en'
        ? (hour < 5 ? 'late night' : hour < 11 ? 'morning' : hour < 15 ? 'afternoon' : hour < 18 ? 'late afternoon' : hour < 21 ? 'evening' : 'night')
        : (hour < 5 ? 'dini hari' : hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : hour < 21 ? 'malam' : 'larut malam');
      const cosmicAmbient = [
        ctx.userLocation ? (ctx.lang === 'en' ? `Location: ${ctx.userLocation}.` : `Lokasi: ${ctx.userLocation}.`) : '',
        ctx.userWeather  ? (ctx.lang === 'en' ? `Weather: ${ctx.userWeather.emoji} ${ctx.userWeather.desc}, ${ctx.userWeather.temp}${ctx.userWeather.unit}.` : `Cuaca: ${ctx.userWeather.emoji} ${ctx.userWeather.desc}, ${ctx.userWeather.temp}${ctx.userWeather.unit}.`) : '',
        ctx.lang === 'en' ? `Time of day: ${timeOfDay}.` : `Waktu: ${timeOfDay}.`,
      ].filter(Boolean).join(' ');
      const r = await ctx.askAIRace(
        `Song: "${activeTitle}" by ${activeArtist}. Vibe/mood: ${ctx.track.mood || 'unknown'}. ${cosmicAmbient}\n\n${ctx.lang === 'en'
          ? 'Write 1 short poetic sentence capturing the essence of this song woven with the current time, place, or weather. Use metaphors about stars, the universe, or nature. Max 20 words. English only.'
          : 'Buat 1 kalimat puitis singkat yang menangkap esensi lagu ini, dipadukan dengan suasana waktu, tempat, atau cuaca saat ini. Gunakan metafora tentang bintang, alam semesta, atau alam. Maksimal 20 kata. Bahasa Indonesia.'}`,
        `${ctx.lang === 'en'
          ? 'You are a poet. Reply with ONLY the poetic sentence, no quotes, no explanation.'
          : 'Kamu penyair. Balas HANYA kalimat puitis saja, tanpa tanda petik, tanpa penjelasan.'}`
      );
      if (!r) return;
      setMessages(p => [...p, { from: 'ai', text: `✨ ${r}`, isCosmicInsight: true }]);
      setActiveModelLabel(ctx.activeModel());
    } finally {
      setCosmicLoading(false);
    }
  };


  // ── For You: shared helper — call one provider and return parsed JSON or null
  const callProviderJSON = async (prov, prompt, maxTok) => {
    try {
      const body = prov.isOpenAI
        ? { model:prov.model, max_tokens:maxTok, messages:[{role:'user',content:prompt}] }
        : { model:prov.model, max_tokens:maxTok, messages:[{role:'user',content:[{type:'text',text:prompt}]}] };
      const resp = await fetch(prov.endpoint, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${prov.key}` },
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

    const MOOD_LABELS = { relax:'Santai', focus:'Fokus', energetic:'Semangat', sleep:'Tidur', metime:'Me Time', party:'Hepi', pagi:'Pagi', siang:'Siang', malam:'Malam', sad:'Galau' };
    const moodLabels = (prefs.moods||[]).map(m => MOOD_LABELS[m]||m).join(', ') || 'semua';
    const ctx = `Kamu adalah kurator audio personal. Preferensi user:\n- Kategori: ${prefs.categories.join(', ') || 'mix'}\n- Mood: ${moodLabels}\n- Waktu: ${prefs.timeOfDay || 'kapan saja'}\n- Bahasa: ${prefs.lang || 'mix'}`;

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
      // BUG FIX 2: cek state dulu (lebih cepat), lalu fallback ke localStorage
      const lastTs = parseInt(localStorage.getItem('sn_persona_recs_ts') || '0', 10);
      const isStale = Date.now() - lastTs > FOR_YOU_TTL_MS;
      if (personaRecs && !isStale) return; // data di state masih segar
      const cachedRecs = (() => { try { return JSON.parse(localStorage.getItem('sn_persona_recs') || 'null'); } catch { return null; } })();
      if (cachedRecs && !isStale) return; // masih fresh di localStorage, skip
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
  const POPULAR_TTL_MS = 60 * 60 * 1000; // 1 jam
  // ── Generate playlist sesuai preferensi ──────────────────────────────────
  const generatePrefPlaylist = async () => {
    if (prefPlaylistLoading) return;
    setPrefPlaylistLoading(true);
    setPrefPlaylist(null);
    try {
      const prefs = (() => { try { return JSON.parse(localStorage.getItem('sn_persona_prefs') || '{}'); } catch { return personaPrefs; } })();
      const cats  = prefs.categories?.join(', ') || 'Pop, Electronic';
      const MOOD_LABELS_PL = { relax:'Santai', focus:'Fokus', energetic:'Semangat', sleep:'Tidur', metime:'Me Time', party:'Hepi', pagi:'Pagi', siang:'Siang', malam:'Malam', sad:'Galau' };
      const moods = (prefs.moods||[]).map(m => MOOD_LABELS_PL[m]||m).join(', ') || 'Chill, Upbeat';
      const lang  = prefs.lang || 'mix';
      const r = await askAIRace(
        `Buat playlist musik personal berdasarkan preferensi pengguna ini:
- Genre/kategori: ${cats}
- Mood favorit: ${moods}
- Bahasa: ${lang}

Buat 10 lagu yang cocok. Balas HANYA JSON valid tanpa markdown:
{"playlist":[{"title":"...","artist":"...","reason":"alasan singkat max 8 kata"}]}`,
        'Kamu adalah kurator musik personal. Buat playlist berdasarkan preferensi. Output hanya JSON valid.'
      );
      const clean = r.replace(/\`\`\`json|\`\`\`/g, '').trim();
      const data  = JSON.parse(clean);
      if (data.playlist?.length) setPrefPlaylist(data.playlist);
    } catch (e) {
      console.warn('[prefPlaylist]', e);
    }
    setPrefPlaylistLoading(false);
  };

  // ── Helper generik: bangun queue dari array {title, artist} lalu play ────
  const buildAndPlayQueue = async (songs, setLoading) => {
    if (!songs?.length || !setLoading) return;
    setLoading(true);
    try {
      const BATCH = 5;
      const results = [];
      for (let i = 0; i < songs.length; i += BATCH) {
        const batch = songs.slice(i, i + BATCH);
        const batchResults = await Promise.all(batch.map(async (m) => {
          const q = `${m.title} ${m.artist}`;
          const cached = ytSearchCacheGet(q + '_video');
          if (cached?.length) return cached[0];
          try {
            if (isYtApiEnabled()) {
              const items = await searchViaYouTubeAPI(q, 'video').catch(() => null);
              if (items?.length) { ytSearchCacheSet(q + '_video', items); return items[0]; }
            }
            const piped = await searchViaPiped(q, 'video').catch(() => null);
            if (piped?.length) { ytSearchCacheSet(q + '_video', piped); return piped[0]; }
            const inv = await searchViaInvidious(q, 'video').catch(() => null);
            if (inv?.length) { ytSearchCacheSet(q + '_video', inv); return inv[0]; }
          } catch(e) { console.warn('[buildQueue]', m.title, e?.message); }
          return null;
        }));
        results.push(...batchResults);
      }
      const queue = results.filter(Boolean);
      if (!queue.length) { alert('Tidak ada lagu yang bisa diputar. Coba lagi.'); return; }
      playYouTube(queue[0], queue, 0);
      setTab('player');
    } catch(e) {
      console.error('[buildAndPlayQueue] error:', e?.message);
    } finally {
      setLoading(false);
    }
  };

  const playPrefPlaylistQueue    = () => buildAndPlayQueue(prefPlaylist,    setPrefPlaylistQueueLoading);
  const playPopularPlaylistQueue = () => buildAndPlayQueue(popularPlaylist, setPopularPlaylistQueueLoading);

  // ── Generate playlist populer saat ini ───────────────────────────────────
  const generatePopularPlaylist = async () => {
    if (popularPlaylistLoading) return;
    setPopularPlaylistLoading(true);
    setPopularPlaylist(null);
    try {
      const r = await askAIRace(
        `Buat playlist 10 lagu yang sedang paling populer dan trending saat ini secara global maupun lokal Indonesia.
Sertakan mix genre: pop, hiphop, K-pop, EDM, dll.
Balas HANYA JSON valid tanpa markdown:
{"playlist":[{"title":"...","artist":"...","reason":"alasan singkat max 8 kata"}]}`,
        'Kamu adalah kurator musik trending. Buat playlist lagu-lagu terpopuler saat ini. Output hanya JSON valid.'
      );
      const clean = r.replace(/\`\`\`json|\`\`\`/g, '').trim();
      const data  = JSON.parse(clean);
      if (data.playlist?.length) setPopularPlaylist(data.playlist);
    } catch (e) {
      console.warn('[popularPlaylist]', e);
    }
    setPopularPlaylistLoading(false);
  };

  const fetchPopularRecs = useCallback(async () => {
    if (popularLoading) return;
    if (!hasKey()) return;
    // BUG FIX 4: cek TTL agar popularRecs refresh setiap 1 jam, bukan selamanya
    const lastPopTs = parseInt(localStorage.getItem('sn_popular_recs_ts') || '0', 10);
    const popIsStale = Date.now() - lastPopTs > POPULAR_TTL_MS;
    if (popularRecs && !popIsStale) return;
    setPopularLoading(true);
    try {
      const locCtx = userLocation ? `Lokasi user: ${userLocation} (kode negara: ${userLocationCountry}).` : 'Lokasi user: Indonesia (kode negara: ID).';
      const now = new Date();
      const hour = now.getHours();
      const timeOfDay = hour < 5 ? 'dini hari' : hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : hour < 21 ? 'malam' : 'malam larut';
      const weatherCtx = userWeather
        ? `Cuaca saat ini: ${userWeather.desc}, ${userWeather.temp}${userWeather.unit}, angin ${userWeather.windkmh} km/h. Waktu: ${timeOfDay}.`
        : `Waktu: ${timeOfDay}.`;
      const isIndonesia = !userLocationCountry || userLocationCountry === 'ID';
      const localLabel = isIndonesia ? 'Lagu lokal Indonesia' : `Lagu lokal ${userLocation || 'setempat'}`;
      const prompt = `Kamu adalah kurator musik & audio global. ${locCtx} ${weatherCtx} Berikan daftar konten POPULER & TRENDING saat ini yang relevan dengan lokasi dan suasana cuaca user dalam format JSON. WAJIB sesuaikan rekomendasi dengan mood cuaca secara spesifik:\n- Hujan/mendung/berkabut → lagu melankolis, lo-fi, ballad, akustik santai\n- Cerah/panas → lagu energik, upbeat, pop, dance, summer vibes\n- Badai/petir → lagu dramatis, rock, intense, cinematic\n- Berangin/berawan sebagian → lagu indie, mid-tempo, chill\n- Dingin/salju → lagu cozy, jazz, klasik, ambient\nWaktu ${timeOfDay} juga pengaruhi mood (pagi → semangat, siang → aktif, sore → santai, malam → intimate/chill).\nSertakan campuran lagu global populer dan lagu lokal sesuai lokasi user.

Response HANYA JSON ini (tanpa markdown, tanpa teks lain):
{"trending_music":[{"title":"Judul Lagu 1","artist":"Artis 1","reason":"alasan singkat max 8 kata"},{"title":"Judul Lagu 2","artist":"Artis 2","reason":"alasan singkat max 8 kata"},{"title":"Judul Lagu 3","artist":"Artis 3","reason":"alasan singkat max 8 kata"},{"title":"Judul Lagu 4","artist":"Artis 4","reason":"alasan singkat max 8 kata"},{"title":"Judul Lagu 5","artist":"Artis 5","reason":"alasan singkat max 8 kata"}],"trending_radio":[{"name":"Nama Stasiun 1","genre":"genre","reason":"alasan singkat max 8 kata"},{"name":"Nama Stasiun 2","genre":"genre","reason":"alasan singkat max 8 kata"},{"name":"Nama Stasiun 3","genre":"genre","reason":"alasan singkat max 8 kata"},{"name":"Nama Stasiun 4","genre":"genre","reason":"alasan singkat max 8 kata"},{"name":"Nama Stasiun 5","genre":"genre","reason":"alasan singkat max 8 kata"}],"trending_local":[{"title":"Judul Lokal 1","artist":"Artis Lokal 1","reason":"alasan singkat max 8 kata"},{"title":"Judul Lokal 2","artist":"Artis Lokal 2","reason":"alasan singkat max 8 kata"},{"title":"Judul Lokal 3","artist":"Artis Lokal 3","reason":"alasan singkat max 8 kata"},{"title":"Judul Lokal 4","artist":"Artis Lokal 4","reason":"alasan singkat max 8 kata"},{"title":"Judul Lokal 5","artist":"Artis Lokal 5","reason":"alasan singkat max 8 kata"}]}`;
      const providers = getProviders();
      let result = null;
      for (const prov of providers) {
        try {
          const body = prov.isOpenAI
            ? { model: prov.model, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }
            : { model: prov.model, max_tokens: 1200, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }] };
          const resp = await fetch(prov.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${prov.key}` }, body: JSON.stringify(body) });
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
      if (result) {
        setPopularRecs(result);
        localStorage.setItem('sn_popular_recs_ts', String(Date.now()));
      }
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

  // Re-fetch popular recs saat cuaca baru tersedia (invalidate cache agar mood cuaca ter-apply)
  useEffect(() => {
    if (!userWeather) return;
    localStorage.removeItem('sn_popular_recs_ts'); // force stale
    setPopularRecs(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userWeather?.desc, userWeather?.temp]);

  // ── Sleep timer cleanup
  useEffect(() => () => { if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current); }, []);

  // ── Web search abort cleanup on unmount (prevent state update on unmounted component)
  useEffect(() => () => { if (wsAbortRef.current) wsAbortRef.current.abort(); }, []);

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
        // ── Hentikan semua sumber audio: lokal/Drive + YouTube + Spotify + SoundCloud + Radio
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
        // Radio — batalkan reconnect timer agar radio tidak restart otomatis
        if (radioReconnectRef.current) { clearTimeout(radioReconnectRef.current); radioReconnectRef.current = null; }
        radioReconnectCount.current = 0;
        setRadioStation(null);
        setRadioPlaying(false);
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
      fetch(radioUrl(station.url, customDnsRef.current), { method: 'GET', mode: 'no-cors', signal: ctrl.signal })
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
    electronic: ['electronic', 'edm', 'techno', 'house', 'trance', 'dance', 'idm', 'downtempo', 'drone', 'beats'],
    ambient:    ['ambient', 'chillout', 'space music', 'atmospheric', 'new age'],
    lounge:     ['lounge', 'smooth', 'easy listening', 'cafe', 'bossa nova', 'chill lounge', 'chill'],
    hiphop:     ['hip-hop', 'hip hop', 'rap', 'r&b', 'rnb', 'trap'],
    reggae:     ['reggae', 'dub', 'ska', 'dancehall'],
    folk:       ['folk', 'country', 'americana', 'bluegrass', 'singer-songwriter'],
    news:       ['news', 'talk', 'info', 'noticias', 'nachrichten', 'berita', 'informasi'],
    world:      ['world', 'latin', 'afrobeat', 'bossa', 'samba', 'flamenco', 'asian', 'bollywood'],
    dangdut:    ['dangdut', 'koplo', 'campursari', 'tarling', 'orkes melayu'],
    lofi:       ['lofi', 'lo-fi', 'chillhop', 'lofi hip hop', 'lo fi'],
    islamic:    ['islamic', 'islam', 'religi', 'quran', 'nasyid', 'muslim', 'religious', 'islami'],
  };

  // Mood/suasana → genre tag mapping
  const MOOD_TO_GENRE = {
    // Mood santai / relaks
    santai:'ambient', relax:'ambient', relaxing:'ambient', relaxed:'ambient',
    tenang:'ambient', damai:'ambient', peaceful:'ambient', calm:'ambient', kalem:'ambient',
    tidur:'ambient', sleep:'ambient', sleepy:'ambient', bobo:'ambient',
    meditasi:'ambient', meditation:'ambient', focus:'ambient', fokus:'ambient', konsentrasi:'ambient',
    study:'ambient', belajar:'ambient', kerja:'ambient', working:'ambient',
    // Mood me time (relaks sendiri)
    metime:'lounge', 'me time':'lounge', sendiri:'lounge', solo:'lounge', alone:'lounge',
    // Mood semangat / energik
    semangat:'electronic', energik:'electronic', energy:'electronic', workout:'electronic',
    olahraga:'electronic', gym:'electronic', lari:'electronic', running:'electronic',
    party:'electronic', pesta:'electronic', dance:'electronic', dansa:'electronic', dugem:'electronic',
    hepi:'pop', happy:'pop', gembira:'pop',
    // Mood sedih / galau
    sedih:'jazz', galau:'jazz', mellow:'jazz', melankolis:'jazz', sad:'jazz', lonely:'jazz',
    sendu:'jazz', haru:'jazz', nostalgia:'jazz', nostalgic:'jazz',
    // Mood bahagia / ceria
    bahagia:'pop', ceria:'pop', senang:'pop', fun:'pop',
    pagi:'pop', morning:'pop', siang:'pop', afternoon:'pop',
    // Mood romantis
    romantis:'lounge', romantic:'lounge', love:'lounge', cinta:'lounge', date:'lounge',
    'makan malam':'lounge', dinner:'lounge', malam:'lounge', evening:'lounge', night:'lounge',
    // Mood kerja keras / produktif
    produktif:'folk', motivasi:'folk', motivation:'folk', inspirasi:'folk', creative:'folk',
    // Mood santai malam
    lofi:'electronic', 'lo-fi':'electronic', chillin:'lounge', chill:'lounge',
  };

  // Kota/negara → country code RadioBrowser + nama kota untuk Radio Garden
  const CITY_COUNTRY_MAP = [
    // Indonesia
    { keys:['jakarta','jkt','betawi'], rb:'ID', city:'jakarta' },
    { keys:['surabaya','sby'], rb:'ID', city:'surabaya' },
    { keys:['bandung','kota kembang'], rb:'ID', city:'bandung' },
    { keys:['medan'], rb:'ID', city:'medan' },
    { keys:['yogyakarta','jogja','jogjakarta'], rb:'ID', city:'yogyakarta' },
    { keys:['bali','denpasar'], rb:'ID', city:'bali' },
    { keys:['semarang'], rb:'ID', city:'semarang' },
    { keys:['makassar','ujung pandang'], rb:'ID', city:'makassar' },
    { keys:['indonesia','indo','nusantara'], rb:'ID', city:'' },
    // Amerika
    { keys:['new york','nyc','manhattan'], rb:'US', city:'new york' },
    { keys:['los angeles','la','hollywood'], rb:'US', city:'los angeles' },
    { keys:['chicago'], rb:'US', city:'chicago' },
    { keys:['miami'], rb:'US', city:'miami' },
    { keys:['london','uk','inggris'], rb:'GB', city:'london' },
    // Eropa
    { keys:['paris','prancis','france'], rb:'FR', city:'paris' },
    { keys:['berlin','jerman','germany'], rb:'DE', city:'berlin' },
    { keys:['amsterdam','belanda','netherlands'], rb:'NL', city:'amsterdam' },
    { keys:['tokyo','jepang','japan'], rb:'JP', city:'tokyo' },
    { keys:['seoul','korea','k-pop','kpop'], rb:'KR', city:'seoul' },
    { keys:['sydney','australia'], rb:'AU', city:'sydney' },
    { keys:['brazil','brasil','sao paulo'], rb:'BR', city:'sao paulo' },
    { keys:['india','mumbai','bollywood'], rb:'IN', city:'mumbai' },
    { keys:['mexico','meksiko'], rb:'MX', city:'mexico' },
  ];

  // Parse query: deteksi mood, kota, atau genre biasa
  const SOURCE_MAP = [
    { keys:['somafm','soma fm','soma'],              source:'SomaFM' },
    { keys:['nts','nts radio'],                      source:'NTS' },
    { keys:['radio paradise','radioparadise'],        source:'Radio Paradise' },
    { keys:['icecast'],                              source:'Icecast' },
    { keys:['shoutcast','di.fm','difm'],             source:'Shoutcast' },
    { keys:['fm stream','fmstream','lautfm','laut.fm'], source:'FM Stream' },
    { keys:['radio garden','radiogarden','garden'],  source:'Radio Garden' },
    { keys:['radiobrowser','radio browser'],         source:'RadioBrowser' },
  ];

  const parseRadioQuery = (rawQuery) => {
    const q = rawQuery.trim().toLowerCase();
    // Cek sumber dulu (prioritas tertinggi)
    for (const entry of SOURCE_MAP) {
      if (entry.keys.some(k => q.includes(k))) {
        // Ekstrak sisa query setelah nama sumber sebagai sub-query
        let subQuery = q;
        for (const k of entry.keys) subQuery = subQuery.replace(k, '').trim();
        return { type: 'source', source: entry.source, subQuery, originalQuery: q };
      }
    }
    // Cek mood
    for (const [mood, genre] of Object.entries(MOOD_TO_GENRE)) {
      if (q.includes(mood)) return { type: 'mood', genre, originalQuery: q };
    }
    // Cek kota
    for (const entry of CITY_COUNTRY_MAP) {
      if (entry.keys.some(k => q.includes(k))) {
        return { type: 'city', rb: entry.rb, city: entry.city, originalQuery: q };
      }
    }
    // Fallback: genre biasa atau nama stasiun
    return { type: 'text', originalQuery: q };
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
      // ── Health check: cek apakah setiap stasiun Garden bisa diakses
      if (stations.length > 0) {
        testStationsInGenre({
          id: `garden__${key}`,
          stations: stations.map(s => ({ id: s.id, url: s.url })),
        });
      }
    } catch(e) {
      setGardenBrowseError('Failed to load from Radio Garden.');
    } finally {
      setGardenBrowseLoading(false);
    }
  };

  // ── 4. NTS Radio (100+ channels, indie/underground, gratis)
  const NTS_STREAMS = [
    { id:'nts1', name:'NTS 1', desc:'Eclectic music, conversation and culture from around the world.', url:'https://stream-relay-geo.ntslive.net/stream',  genre:'Eclectic', color:'#ff4500' },
    { id:'nts2', name:'NTS 2', desc:'A second continuous stream of music and culture.',               url:'https://stream-relay-geo.ntslive.net/stream2', genre:'Eclectic', color:'#ff6500' },
    { id:'nts_lofi',  name:'NTS Lo-Fi',    desc:'Chilled lo-fi beats and downtempo sounds.',    url:'https://stream-relay-geo.ntslive.net/stream',  genre:'Lo-Fi',   color:'#22d3ee' },
    { id:'nts_hiphop',name:'NTS Hip-Hop',  desc:'Hip-hop, rap and r&b from around the world.',  url:'https://stream-relay-geo.ntslive.net/stream2', genre:'Hip-Hop', color:'#f59e0b' },
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
    { id:'ice_laut_world', name:'World Music Radio', desc:'Global world & folk music 24/7', url:'https://stream.laut.fm/world', genre:'World', country:'DE', color:'#f97316' },
    { id:'ice_laut_lofi', name:'Lo-Fi Beats Radio', desc:'Lo-Fi hip-hop & chill beats', url:'https://stream.laut.fm/lofi', genre:'Lo-Fi', country:'DE', color:'#8b5cf6' },
    { id:'ice_laut_folk', name:'Folk Radio', desc:'Folk & Americana 24/7', url:'https://stream.laut.fm/folk', genre:'Folk', country:'DE', color:'#a16207' },
    { id:'ice_laut_religi', name:'Islamic Radio', desc:'Murottal Al-Quran & nasyid 24/7', url:'https://stream.laut.fm/religious', genre:'Islamic', country:'ID', color:'#10b981' },
    { id:'ice_laut_dangdut', name:'Dangdut Radio', desc:'Dangdut & koplo Indonesia 24/7', url:'https://stream.laut.fm/dangdut', genre:'Dangdut', country:'ID', color:'#f97316' },
    { id:'ice_soma_poptron', name:'SomaFM PopTron', desc:'Electropop & indie pop 24/7', url:'https://ice1.somafm.com/poptron-128-mp3', genre:'Pop', country:'US', color:'#3b82f6' },
    { id:'ice_lofi_cafe',    name:'Lo-Fi Café',           desc:'Chilled lo-fi hip hop beats 24/7',              url:'https://ice6.somafm.com/lush-128-mp3',                       genre:'Lo-Fi',   country:'US', color:'#22d3ee' },
    { id:'ice_chillhop',     name:'Chillhop Radio',       desc:'Chillhop & lo-fi beats around the clock',       url:'https://streams.ilovemusic.de/iloveradio17.mp3',             genre:'Lo-Fi',   country:'DE', color:'#06b6d4' },
    { id:'ice_soma_cliqhop', name:'SomaFM Cliqhop IDM',   desc:'Blips, blops & lo-fi electronic wonders',       url:'https://ice1.somafm.com/cliqhop-128-mp3',                   genre:'Lo-Fi',   country:'US', color:'#22d3ee' },
    { id:'ice_hiphop_radio', name:'Hip-Hop Radio (Laut)',  desc:'Hip-hop & rap hits 24/7',                       url:'https://stream.laut.fm/hiphop',                             genre:'Hip-Hop', country:'DE', color:'#f59e0b' },
    { id:'ice_illstreet',    name:'SomaFM Ill Street Blues',desc:'Hip-hop, soul & gritty r&b',                  url:'https://ice1.somafm.com/illstreet-128-mp3',                 genre:'Hip-Hop', country:'US', color:'#f97316' },
    { id:'ice_rnb',          name:'R&B Radio (Laut)',      desc:'R&b, soul & smooth jams 24/7',                  url:'https://stream.laut.fm/rnb',                                genre:'Hip-Hop', country:'DE', color:'#ec4899' },
  ];

  // ── Radio Paradise (curated, high-fidelity, no ads, listener-funded)
  const RADIO_PARADISE_CHANNELS = [
    { id:'rp_main', name:'Radio Paradise Main Mix', desc:'Eclectic mix of Rock, World, Classical & more — hand-curated, no ads', url:'https://stream.radioparadise.com/aac-128', genre:'Eclectic', country:'US', color:'#8b5cf6', image:'https://www.radioparadise.com/graphics/rp_320x320.png' },
    { id:'rp_mellow', name:'Radio Paradise Mellow Mix', desc:'Chill, ambient, acoustic — relaxed and soothing', url:'https://stream.radioparadise.com/mellow-128', genre:'Ambient', country:'US', color:'#06b6d4', image:'https://www.radioparadise.com/graphics/rp_320x320.png' },
    { id:'rp_rock', name:'Radio Paradise Rock Mix', desc:'Deep cuts and classic rock, hand-picked', url:'https://stream.radioparadise.com/rock-128', genre:'Rock', country:'US', color:'#ef4444', image:'https://www.radioparadise.com/graphics/rp_320x320.png' },
    { id:'rp_global', name:'Radio Paradise Global Mix', desc:'World music, jazz, folk, and global rhythms', url:'https://stream.radioparadise.com/global-128', genre:'World', country:'US', color:'#f59e0b', image:'https://www.radioparadise.com/graphics/rp_320x320.png' },
    { id:'rp_eclectic2', name:'Radio Paradise Eclectic Plus', desc:'Pop, rock, world — handpicked no ads', url:'https://stream.radioparadise.com/mp3-128', genre:'Pop', country:'US', color:'#a78bfa', image:'https://www.radioparadise.com/graphics/rp_320x320.png' },
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
    { id:'fm_hiphop', name:'Hip-Hop Radio (laut.fm)', desc:'Hip-Hop & Rap 24/7', url:'https://stream.laut.fm/hiphop', genre:'Hip-Hop', country:'DE', color:'#dc2626', sourceLabel:'FM Stream' },
    { id:'fm_jazz', name:'Jazz Radio (laut.fm)', desc:'Jazz 24/7', url:'https://stream.laut.fm/jazz', genre:'Jazz', country:'DE', color:'#7c3aed', sourceLabel:'FM Stream' },
    { id:'fm_rock', name:'Rock Radio (laut.fm)', desc:'Rock 24/7', url:'https://stream.laut.fm/rock', genre:'Rock', country:'DE', color:'#ef4444', sourceLabel:'FM Stream' },
    { id:'fm_classical', name:'Classical Radio (laut.fm)', desc:'Classical music 24/7', url:'https://stream.laut.fm/classical', genre:'Classical', country:'DE', color:'#a16207', sourceLabel:'FM Stream' },
    { id:'fm_world', name:'World Music Radio (laut.fm)', desc:'Global world music 24/7', url:'https://stream.laut.fm/world', genre:'World', country:'DE', color:'#f97316', sourceLabel:'FM Stream' },
    { id:'fm_reggae', name:'Reggae Radio (laut.fm)', desc:'Reggae & Dub 24/7', url:'https://stream.laut.fm/reggae', genre:'Reggae', country:'DE', color:'#16a34a', sourceLabel:'FM Stream' },
    { id:'fm_ambient', name:'Ambient Radio (laut.fm)', desc:'Ambient & Chillout 24/7', url:'https://stream.laut.fm/ambient', genre:'Ambient', country:'DE', color:'#6366f1', sourceLabel:'FM Stream' },
    { id:'fm_lofi', name:'Lo-Fi Radio (laut.fm)', desc:'Lo-Fi hip-hop beats & chill', url:'https://stream.laut.fm/lofi', genre:'Lo-Fi', country:'DE', color:'#8b5cf6', sourceLabel:'FM Stream' },
    { id:'fm_religi', name:'Religi Radio Indonesia', desc:'Musik religi Islami & nasyid 24/7', url:'https://stream.laut.fm/religious', genre:'Islamic', country:'ID', color:'#10b981', sourceLabel:'FM Stream' },
    { id:'fm_dangdut', name:'Dangdut Radio (laut.fm)', desc:'Dangdut & koplo Indonesia 24/7', url:'https://stream.laut.fm/dangdut', genre:'Dangdut', country:'ID', color:'#f97316', sourceLabel:'FM Stream' },
    { id:'fm_lofi',       name:'Lo-Fi Radio (laut.fm)',    desc:'Lo-fi beats & chillhop 24/7',           url:'https://stream.laut.fm/lofi',        genre:'Lo-Fi',   country:'DE', color:'#22d3ee', sourceLabel:'FM Stream' },
    { id:'fm_chillhop',   name:'Chillhop FM (laut.fm)',    desc:'Chillhop & downtempo grooves',          url:'https://stream.laut.fm/chillhop',     genre:'Lo-Fi',   country:'DE', color:'#06b6d4', sourceLabel:'FM Stream' },
    { id:'fm_hiphop',     name:'Hip-Hop Radio (laut.fm)',  desc:'Hip-hop, rap & trap 24/7',              url:'https://stream.laut.fm/hiphop',       genre:'Hip-Hop', country:'DE', color:'#f59e0b', sourceLabel:'FM Stream' },
    { id:'fm_rnb',        name:'R&B Radio (laut.fm)',      desc:'R&b & soul hits around the clock',      url:'https://stream.laut.fm/rnb',          genre:'Hip-Hop', country:'DE', color:'#ec4899', sourceLabel:'FM Stream' },
    { id:'fm_rap',        name:'Rap Radio (laut.fm)',      desc:'Rap & urban beats 24/7',                url:'https://stream.laut.fm/rap',          genre:'Hip-Hop', country:'DE', color:'#f97316', sourceLabel:'FM Stream' },
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
    { id:'sc_lofi_girl', name:'Lofi Girl Radio', desc:'Lo-Fi hip-hop beats to relax/study to', url:'https://stream.laut.fm/lofi', genre:'Lo-Fi', country:'FR', color:'#8b5cf6', sourceLabel:'Shoutcast' },
    { id:'sc_jazz_24', name:'Jazz24', desc:'Commercial-free jazz 24/7 — listener-supported', url:'https://live.amperwave.net/direct/ppm-jazz24aac-ibc1', genre:'Jazz', country:'US', color:'#7c3aed', sourceLabel:'Shoutcast' },
    { id:'sc_soma_pop', name:'SomaFM PopTron', desc:'Electropop & indie electronic pop', url:'https://ice1.somafm.com/poptron-128-mp3', genre:'Pop', country:'US', color:'#3b82f6', sourceLabel:'Shoutcast' },
    { id:'sc_soma_folk', name:'SomaFM Folk Forward', desc:'Indie folk, roots, Americana', url:'https://ice1.somafm.com/folkfwd-128-mp3', genre:'Folk', country:'US', color:'#a16207', sourceLabel:'Shoutcast' },
    { id:'sc_soma_cliqhop', name:'SomaFM Cliqhop IDM', desc:'IDM & electronic blips 24/7', url:'https://ice1.somafm.com/cliqhop-128-mp3', genre:'Electronic', country:'US', color:'#06b6d4', sourceLabel:'Shoutcast' },
    { id:'sc_soma_indie', name:'SomaFM Indie Pop Rocks', desc:'Indie pop & alternative 24/7', url:'https://ice1.somafm.com/indiepop-128-mp3', genre:'Indie', country:'US', color:'#10b981', sourceLabel:'Shoutcast' },
    { id:'sc_soma_world', name:'SomaFM DEF CON Radio', desc:'Electronic & world beats', url:'https://ice1.somafm.com/defcon-128-mp3', genre:'World', country:'US', color:'#f59e0b', sourceLabel:'Shoutcast' },
    { id:'sc_religi_id', name:'Radio Rodja 756 AM', desc:'Radio Islam Indonesia — murottal & kajian', url:'https://stream.radiorodja.com/rodja', genre:'Islamic', country:'ID', color:'#10b981', sourceLabel:'Shoutcast' },
    { id:'sc_religi2_id', name:'Radio Nurul Iman', desc:'Siaran Islam 24/7 Indonesia', url:'https://stream.laut.fm/islamicmusic', genre:'Islamic', country:'ID', color:'#059669', sourceLabel:'Shoutcast' },
    { id:'sc_dangdut_id', name:'Dangdut Mania Radio', desc:'Dangdut & koplo hits Indonesia 24/7', url:'https://stream.laut.fm/dangdut', genre:'Dangdut', country:'ID', color:'#f97316', sourceLabel:'Shoutcast' },
    { id:'sc_lofi_hip',   name:'Lofi Hip Hop Radio',      desc:'24/7 lo-fi hip hop beats to relax/study', url:'https://streams.ilovemusic.de/iloveradio17.mp3',        genre:'Lo-Fi',   country:'DE', color:'#22d3ee', sourceLabel:'Shoutcast' },
    { id:'sc_chillhop2',  name:'Chillhop Music',          desc:'Chillhop & lo-fi grooves nonstop',        url:'https://stream.laut.fm/chillhop',                      genre:'Lo-Fi',   country:'DE', color:'#06b6d4', sourceLabel:'Shoutcast' },
    { id:'sc_lofi_beats', name:'Lo-Fi Beats 24/7',        desc:'Smooth lo-fi beats all day long',         url:'https://ice1.somafm.com/cliqhop-128-mp3',              genre:'Lo-Fi',   country:'US', color:'#a78bfa', sourceLabel:'Shoutcast' },
    { id:'sc_hiphop2',    name:'Hip-Hop Nation',          desc:'Hip-hop & rap hits worldwide',            url:'https://stream.laut.fm/hiphop',                        genre:'Hip-Hop', country:'US', color:'#f59e0b', sourceLabel:'Shoutcast' },
    { id:'sc_trap',       name:'Trap Nation Radio',       desc:'Trap, drill & urban beats 24/7',          url:'https://stream.laut.fm/rap',                           genre:'Hip-Hop', country:'US', color:'#ef4444', sourceLabel:'Shoutcast' },
    { id:'sc_rnb2',       name:'R&B Soul Station',        desc:'Classic & contemporary r&b soul',         url:'https://stream.laut.fm/rnb',                           genre:'Hip-Hop', country:'US', color:'#ec4899', sourceLabel:'Shoutcast' },
    { id:'sc_illstreet2', name:'SomaFM Ill Street Blues', desc:'Grittier hip-hop, soul & r&b',            url:'https://ice1.somafm.com/illstreet-128-mp3',            genre:'Hip-Hop', country:'US', color:'#f97316', sourceLabel:'Shoutcast' },
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
      ? NTS_STREAMS.map(s => ({ ...s, sourceLabel: 'NTS Radio', stationuuid: s.id }))
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
        lowLatencyMode: false,        // radio bukan low-latency HLS, mode ini justru ganggu buffer
        liveSyncDurationCount: 5,     // turun dari 7 → 5: kurangi latency awal tanpa korbankan stabilitas
        maxBufferLength: 60,          // turun dari 90 → 60: HLS tidak perlu buffer sebesar itu, hemat RAM
        maxMaxBufferLength: 120,
        backBufferLength: 10,         // simpan 10s buffer mundur untuk recovery cepat
        fragLoadingTimeOut: 15000,    // turun dari 20s → 15s: gagal lebih cepat, retry lebih cepat
        manifestLoadingTimeOut: 10000,
        levelLoadingTimeOut: 10000,
        fragLoadingMaxRetry: 8,       // naik dari 6 → 8: lebih persisten sebelum menyerah
        manifestLoadingMaxRetry: 5,
        levelLoadingMaxRetry: 5,
        fragLoadingRetryDelay: 500,   // turun dari 1000 → 500ms: retry lebih cepat setelah gagal
        progressive: true,            // mulai putar segera saat ada data, tidak perlu tunggu buffer penuh
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
    // Exponential back-off: 500ms, 1s, 2s, 4s, 10s, 20s
    // Attempt pertama sangat cepat (500ms) untuk handle Vercel proxy timeout
    const delay = attempt === 0 ? 500 : Math.min(500 * Math.pow(2, attempt), 20000);
    console.warn(`[Radio] Reconnect attempt ${attempt + 1} in ${delay}ms`);
    setStreamBuffering(true);
    radioReconnectRef.current = setTimeout(() => {
      radioReconnectCount.current += 1;
      const a = audioRef.current;
      if (!a || !trackObj.isRadio) return;
      // Jangan restart jika user sudah pause manual (playing state false)
      if (!playingRef.current) return;
      const src = trackObj.src;
      if (src.includes('.m3u8')) {
        attachHls(a, src, () => { a.play().catch(() => {}); });
      } else {
        a.src = '';
        setTimeout(() => {
          a.src = src + (src.includes('?') ? '&' : '?') + '_t=' + Date.now(); // cache-bust agar server kirim stream baru
          a.load();
          a.play().catch(() => {});
        }, 500);
      }
    }, delay);
  }, [attachHls]);

  // ── Universal play function for any external radio station
  const playRbStation = (station) => {
    const streamUrl = radioUrl(station.url_resolved || station.url, customDnsRef.current);
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
    setMultiLoading(true); setMultiResults([]); setRbAiResults([]); setRbAiLoading(false);
    const rawQ = query.trim();
    const q = rawQ.toLowerCase();
    const isTopMode = !q && !genreTag;

    // Smart query parsing: deteksi mood, kota, atau genre/nama biasa
    const parsed = !genreTag && q ? parseRadioQuery(rawQ) : { type: 'text', originalQuery: q };

    // Jika query adalah kota — langsung search RadioBrowser by country + Radio Garden by city
    if (parsed.type === 'city') {
      try {
        const base = await getRbServer();
        const cityResults = [];
        // RadioBrowser by country
        const rbUrl = `${base}/json/stations/bycountrycodeexact/${parsed.rb}?limit=40&hidebroken=true&order=votes&reverse=true`;
        const rbData = await fetch(rbUrl).then(r => r.json()).catch(() => []);
        rbData.filter(s => s.url_resolved || s.url).slice(0, 20).forEach(s =>
          cityResults.push({ ...s, sourceLabel: 'RadioBrowser', color: '#f59e0b' })
        );
        // Filter by city name jika ada
        if (parsed.city) {
          const cityFiltered = cityResults.filter(s =>
            (s.city||'').toLowerCase().includes(parsed.city) ||
            (s.state||'').toLowerCase().includes(parsed.city) ||
            (s.name||'').toLowerCase().includes(parsed.city)
          );
          if (cityFiltered.length >= 5) cityResults.splice(0, cityResults.length, ...cityFiltered);
        }
        // Radio Garden by city
        try {
          let gardenPlacesLocal = gardenPlaces;
          if (gardenPlacesLocal.length === 0) {
            const data = await fetch('/api/radio-garden/content/places').then(r=>r.json());
            gardenPlacesLocal = (data?.data?.list || []).slice(0, 500);
            setGardenPlaces(gardenPlacesLocal);
          }
          const matchPlaces = gardenPlacesLocal.filter(p =>
            (p.title||'').toLowerCase().includes(parsed.city || q) ||
            (p.country||'').toLowerCase().includes(q)
          ).slice(0, 5);
          const gardenRes = await Promise.allSettled(matchPlaces.map(p => {
            const placeId = p.id || (p.url||'').split('/').pop();
            return fetch(`/api/radio-garden/content/page/${placeId}/channels`).then(r=>r.json()).then(data => {
              const items = data?.data?.content?.[0]?.items || [];
              return items.slice(0, 6).map(ch => {
                const chId = ch.page?.url?.split('/').pop() || ch.href?.split('/').pop() || '';
                return { id:`garden_city_${chId}`, name:ch.page?.title||ch.title||'Station', city:p.title||'', country:p.country||'', genre:ch.page?.subtitle||'', url:getGardenStreamUrl(chId), sourceLabel:'Radio Garden', color:'#22d3ee', stationuuid:`garden_city_${chId}`, chId };
              });
            });
          }));
          gardenRes.flatMap(r => r.status==='fulfilled'?r.value:[]).filter(s=>s.chId).slice(0,10).forEach(s => cityResults.push(s));
        } catch {}
        setMultiResults(cityResults);
        setMultiLoading(false);
        if (cityResults.length === 0) setRbError(`Tidak ada stasiun ditemukan untuk "${rawQ}"`);
        const msKey = `city__${q}`;
        testStationsInGenre({ id: msKey, stations: cityResults.map(s => ({ id: s.id || s.stationuuid, url: s.url })) });
        return;
      } catch(e) {
        setRbError('Gagal mencari stasiun kota. Coba lagi.');
        setMultiLoading(false);
        return;
      }
    }

    // Jika query adalah sumber tertentu — filter hasil hanya dari sumber itu
    if (parsed.type === 'source') {
      const src = parsed.source;
      const sq = parsed.subQuery;
      try {
        const base = await getRbServer();
        let srcResults = [];

        if (src === 'SomaFM') {
          let somaData = somaChannels;
          if (somaData.length === 0) {
            try { const d = await fetch('https://somafm.com/channels.json').then(r=>r.json()); somaData = d.channels||[]; setSomaChannels(somaData); } catch {}
          }
          srcResults = somaData.filter(ch => !sq || ch.title?.toLowerCase().includes(sq) || ch.genre?.toLowerCase().includes(sq) || ch.description?.toLowerCase().includes(sq))
            .map(ch => ({ id:`soma_${ch.id}`, name:ch.title, url:ch.plls?.[0]?.url||`https://ice1.somafm.com/${ch.id}-128-mp3`, country:'US', tags:ch.genre, favicon:ch.image, sourceLabel:'SomaFM', color:'#10b981', description:ch.description }));
          // If SomaFM API returned nothing (CORS fail), augment via RadioBrowser
          if (srcResults.length < 5) {
            const rbAug = await fetch(`${base}/json/stations/search?name=somafm&limit=40&hidebroken=true&order=votes&reverse=true`).then(r=>r.json()).catch(()=>[]);
            rbAug.filter(s=>s.url_resolved||s.url).slice(0, 30).forEach(s => srcResults.push({ ...s, sourceLabel:'SomaFM', color:'#10b981' }));
          }
        } else if (src === 'NTS') {
          // Fetch langsung dari NTS Live API via Vercel proxy (/api/nts)
          try {
            const ntsData = await fetch(`/api/radio?source=nts&limit=200`).then(r=>r.json()).catch(()=>null);
            const shows = ntsData?.results || [];
            const mapped = shows
              .filter(show => !sq ||
                (show.name||'').toLowerCase().includes(sq) ||
                (show.description||'').toLowerCase().includes(sq) ||
                (show.genres||[]).some(g=>(g.value||g).toLowerCase().includes(sq))
              )
              .map(show => {
                const streamEp = show.episodes?.find(ep => ep.embeds?.audio?.url);
                const streamUrl = streamEp?.embeds?.audio?.url || null;
                const genres = (show.genres||[]).map(g=>g.value||g).join(', ');
                return {
                  id:          `nts_show_${show.slug||show.id}`,
                  name:        show.name,
                  url:         streamUrl,
                  genre:       genres,
                  description: show.description || '',
                  favicon:     show.media?.background_large?.url || show.media?.thumbnail?.url || '',
                  country:     'UK',
                  sourceLabel: 'NTS Radio',
                  color:       '#ff4500',
                  stationuuid: `nts_show_${show.slug||show.id}`,
                };
              })
              .filter(s => s.url);
            if (mapped.length > 0) srcResults = mapped;
          } catch {}
          // Fallback ke NTS_STREAMS hardcode jika API gagal
          if (srcResults.length === 0) {
            srcResults = NTS_STREAMS.filter(s => !sq || s.name.toLowerCase().includes(sq) || s.genre?.toLowerCase().includes(sq))
              .map(s => ({ ...s, sourceLabel:'NTS Radio', country:'UK', stationuuid:s.id }));
          }
        } else if (src === 'Radio Paradise') {
          // Radio Paradise hanya punya 4 channel resmi, tidak ada API publik lain
          srcResults = RADIO_PARADISE_CHANNELS.filter(s => !sq || s.name.toLowerCase().includes(sq) || s.genre?.toLowerCase().includes(sq))
            .map(s => ({ ...s, sourceLabel:'Radio Paradise', stationuuid:s.id, favicon:s.image }));
        } else if (src === 'Icecast') {
          // Fetch dari Icecast Yellow Pages (dir.xiph.org) via Vercel serverless proxy
          try {
            const iceUrl = sq ? `/api/radio?source=icecast&search=${encodeURIComponent(sq)}&limit=100` : '/api/radio?source=icecast&limit=100';
            const iceData = await fetch(iceUrl).then(r=>r.json()).catch(()=>null);
            const mapped = (iceData?.stations || []).filter(s => s.url);
            if (mapped.length > 0) srcResults = mapped;
          } catch {}
          // Fallback ke curated list jika proxy gagal
          if (srcResults.length === 0) {
            srcResults = ICECAST_CURATED.filter(s => !sq || s.name.toLowerCase().includes(sq) || s.genre?.toLowerCase().includes(sq))
              .map(s => ({ ...s, sourceLabel:'Icecast', stationuuid:s.id }));
          }
        } else if (src === 'Shoutcast') {
          // SHOUTcast tidak punya open API — gunakan laut.fm (800+ stasiun internet)
          try {
            const lautUrl = sq ? `/api/radio?source=lautfm&search=${encodeURIComponent(sq)}&per_page=80` : '/api/radio?source=lautfm&per_page=80';
            const lautData = await fetch(lautUrl).then(r=>r.json()).catch(()=>null);
            const mapped = (lautData?.stations || []).filter(s => s.url)
              .map(s => ({ ...s, sourceLabel:'Shoutcast', color:'#e11d48', stationuuid:s.id }));
            if (mapped.length > 0) srcResults = mapped;
          } catch {}
          if (srcResults.length === 0) {
            srcResults = SHOUTCAST_CURATED.filter(s => !sq || s.name.toLowerCase().includes(sq) || s.genre?.toLowerCase().includes(sq))
              .map(s => ({ ...s, stationuuid:s.id }));
          }
        } else if (src === 'FM Stream') {
          // Fetch dari laut.fm API (800+ stasiun)
          try {
            const lautUrl = sq ? `/api/radio?source=lautfm&genre=${encodeURIComponent(sq)}&per_page=80` : '/api/radio?source=lautfm&per_page=80';
            const lautData = await fetch(lautUrl).then(r=>r.json()).catch(()=>null);
            const mapped = (lautData?.stations || []).filter(s => s.url)
              .map(s => ({ ...s, sourceLabel:'FM Stream', color:'#06b6d4', stationuuid:s.id }));
            if (mapped.length > 0) srcResults = mapped;
          } catch {}
          if (srcResults.length === 0) {
            srcResults = FMSTREAM_CURATED.filter(s => !sq || s.name.toLowerCase().includes(sq) || s.genre?.toLowerCase().includes(sq))
              .map(s => ({ ...s, stationuuid:s.id }));
          }
        } else if (src === 'RadioBrowser') {
          const url = sq
            ? `${base}/json/stations/search?name=${encodeURIComponent(sq)}&limit=40&hidebroken=true&order=votes&reverse=true`
            : `${base}/json/stations/topvote/40?hidebroken=true`;
          const rbData = await fetch(url).then(r=>r.json()).catch(()=>[]);
          srcResults = rbData.filter(s=>s.url_resolved||s.url).map(s=>({ ...s, sourceLabel:'RadioBrowser', color:'#f59e0b' }));
        } else if (src === 'Radio Garden') {
          let gardenPlacesLocal = gardenPlaces;
          if (gardenPlacesLocal.length === 0) {
            const data = await fetch('/api/radio-garden/content/places').then(r=>r.json());
            gardenPlacesLocal = (data?.data?.list||[]).slice(0,500);
            setGardenPlaces(gardenPlacesLocal);
          }
          const targetPlaces = sq
            ? gardenPlacesLocal.filter(p=>(p.title||'').toLowerCase().includes(sq)||(p.country||'').toLowerCase().includes(sq)).slice(0,8)
            : gardenPlacesLocal.slice(0,8);
          const gardenRes = await Promise.allSettled(targetPlaces.map(p=>{
            const placeId = p.id||(p.url||'').split('/').pop();
            return fetch(`/api/radio-garden/content/page/${placeId}/channels`).then(r=>r.json()).then(data=>{
              const items = data?.data?.content?.[0]?.items||[];
              return items.slice(0,5).map(ch=>{
                const chId = ch.page?.url?.split('/').pop()||ch.href?.split('/').pop()||'';
                return { id:`garden_src_${chId}`, name:ch.page?.title||ch.title||'Station', city:p.title||'', country:p.country||'', genre:ch.page?.subtitle||'', url:getGardenStreamUrl(chId), sourceLabel:'Radio Garden', color:'#22d3ee', stationuuid:`garden_src_${chId}`, chId };
              });
            });
          }));
          srcResults = gardenRes.flatMap(r=>r.status==='fulfilled'?r.value:[]).filter(s=>s.chId);
          if (sq) srcResults = srcResults.filter(s=>s.name.toLowerCase().includes(sq)||s.city.toLowerCase().includes(sq)||s.genre.toLowerCase().includes(sq));
        }

        setMultiResults(srcResults);
        setMultiLoading(false);
        const msKey = `source__${src}__${sq}`;
        testStationsInGenre({ id:msKey, stations:srcResults.map(s=>({ id:s.id||s.stationuuid, url:s.url })) });
        return;
      } catch(e) {
        setRbError('Gagal mengambil dari sumber tersebut.');
        setMultiLoading(false);
        return;
      }
    }

    // Jika query adalah mood — override genreTag dengan genre yang sesuai
    const effectiveGenreTag = genreTag || (parsed.type === 'mood' ? parsed.genre : null);
    const textQuery = parsed.type === 'mood' ? '' : q; // mood: jangan cari by teks

    // Build genre keyword list from tag or query
    const tagLow = (effectiveGenreTag||'').toLowerCase();
    const bucket = tagLow ? getGenreBucket(tagLow) : (textQuery ? getGenreBucket(textQuery) : null);
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
      const textOk = !textQuery || ch.title?.toLowerCase().includes(textQuery) || ch.genre?.toLowerCase().includes(textQuery) || ch.description?.toLowerCase().includes(textQuery);
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
    const ntsGenreBuckets = ['electronic', 'world', 'hiphop', 'folk', 'pop', 'rock', 'ambient', 'lounge', 'jazz', 'lofi', 'reggae'];
    const ntsOk = !genreKeywords || (bucket && ntsGenreBuckets.includes(bucket));
    if (ntsOk) {
      const ntsMatched = NTS_STREAMS.filter(s =>
        !textQuery || s.name.toLowerCase().includes(textQuery) || s.genre?.toLowerCase().includes(textQuery) || s.desc?.toLowerCase().includes(textQuery)
      ).map(s => ({ ...s, sourceLabel: 'NTS Radio', country: 'UK', stationuuid: null }));
      results.push(...ntsMatched);
    }
    // Radio Paradise — 4 curated high-fidelity channels, always relevant
    const rpMatched = RADIO_PARADISE_CHANNELS.filter(s => {
      const genreOk = !genreKeywords || matchGenreKeywords(s.genre, genreKeywords) || matchGenreKeywords(s.desc, genreKeywords);
      const textOk = !textQuery || s.name.toLowerCase().includes(textQuery) || s.genre?.toLowerCase().includes(textQuery) || s.desc?.toLowerCase().includes(textQuery);
      return genreKeywords ? genreOk : textOk;
    }).map(s => ({ ...s, sourceLabel: 'Radio Paradise', stationuuid: s.id, favicon: s.image }));
    results.push(...rpMatched);
    // FM Stream (laut.fm extended) — filter by genre & query
    const fmMatched = FMSTREAM_CURATED.filter(s => {
      const genreOk = !genreKeywords || matchGenreKeywords(s.genre, genreKeywords) || matchGenreKeywords(s.name, genreKeywords);
      const textOk = !textQuery || s.name.toLowerCase().includes(textQuery) || s.genre?.toLowerCase().includes(textQuery) || s.desc?.toLowerCase().includes(textQuery);
      return genreKeywords ? genreOk : textOk;
    }).slice(0, 6).map(s => ({ ...s, stationuuid: s.id }));
    results.push(...fmMatched);
    // Shoutcast (DI.FM + others) — filter by genre & query
    const scMatched = SHOUTCAST_CURATED.filter(s => {
      const genreOk = !genreKeywords || matchGenreKeywords(s.genre, genreKeywords) || matchGenreKeywords(s.name, genreKeywords);
      const textOk = !textQuery || s.name.toLowerCase().includes(textQuery) || s.genre?.toLowerCase().includes(textQuery) || s.desc?.toLowerCase().includes(textQuery);
      return genreKeywords ? genreOk : textOk;
    }).slice(0, 8).map(s => ({ ...s, stationuuid: s.id }));
    results.push(...scMatched);
    } // end !isTopMode
    // RadioBrowser — search by tag if genre selected, else by text
    try {
      const base = await getRbServer();
      let url;
      if (effectiveGenreTag) {
        url = `${base}/json/stations/bytag/${encodeURIComponent(effectiveGenreTag)}?limit=30&hidebroken=true&order=votes&reverse=true`;
      } else if (textQuery) {
        url = `${base}/json/stations/search?name=${encodeURIComponent(textQuery)}&limit=30&hidebroken=true&order=votes&reverse=true`;
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
      if (textQuery) {
        targetPlaces = gardenPlacesLocal.filter(p =>
          p.title?.toLowerCase().includes(textQuery) || p.country?.toLowerCase().includes(textQuery)
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
      if (textQuery) {
        gardenStns = gardenStns.filter(s =>
          s.name.toLowerCase().includes(textQuery) || s.city.toLowerCase().includes(textQuery) ||
          s.country.toLowerCase().includes(textQuery) || s.genre.toLowerCase().includes(textQuery)
        );
      }
      results.push(...gardenStns.slice(0, 10));
    } catch {}
    setMultiResults(results);
    setMultiLoading(false);
    // Trigger health check untuk semua hasil multi-search
    const msKey = `multisearch__${textQuery}__${effectiveGenreTag||''}`;
    testStationsInGenre({ id: msKey, stations: results.map(s => ({ id: s.id || s.stationuuid, url: s.url })) });

    // ── AI Fallback: jika hasil terlalu sedikit dan ada query teks, minta AI sarankan stasiun
    // lalu cari nama-nama itu di RadioBrowser (source nyata, bukan imajinasi AI)
    if (textQuery && results.length < 8) {
      setRbAiLoading(true);
      setRbAiResults([]);
      try {
        const aiPrompt = `You are a radio station expert. The user is searching for: "${rawQ}".
Suggest 6 real internet radio stations that match this query. These stations must be real and well-known.
Return ONLY a valid JSON array of objects. No explanation, no markdown, no extra text.
Format exactly:
[
  {"name": "Station Name", "genre": "Genre", "country": "Country Code e.g. US"},
  ...
]`;
        const aiSystem = 'Return only a valid JSON array of radio station objects with keys: name, genre, country. No extra text.';
        const aiText = await askAIRace(aiPrompt, aiSystem);
        // Parse JSON dari respons AI
        const clean = aiText.replace(/```json|```/g, '').trim();
        let suggestions = [];
        try { suggestions = JSON.parse(clean); } catch {
          // Fallback: coba extract array string jika format berbeda
          const arrMatch = clean.match(/\[[\s\S]*\]/);
          if (arrMatch) try { suggestions = JSON.parse(arrMatch[0]); } catch {}
        }
        if (!Array.isArray(suggestions) || suggestions.length === 0) throw new Error('bad parse');

        // Normalize: support both string[] dan object[]
        const normalized = suggestions.slice(0, 6).map(s =>
          typeof s === 'string' ? { name: s, genre: '', country: '' } : s
        );

        // Cari setiap nama di RadioBrowser — fuzzy: coba nama penuh, lalu kata pertama
        const rbBase = await getRbServer();
        const aiStations = [];
        const seen = new Set(results.map(s => (s.name||'').toLowerCase()));
        for (const sug of normalized) {
          if (!sug.name || String(sug.name).trim().length < 2) continue;
          const nameTrim = String(sug.name).trim();
          let found = [];
          try {
            // Coba nama penuh dulu
            const url = `${rbBase}/json/stations/search?name=${encodeURIComponent(nameTrim)}&limit=3&hidebroken=true&order=votes&reverse=true`;
            found = await fetch(url, { signal: AbortSignal.timeout(4000) }).then(r => r.json()).catch(() => []);

            // Jika tidak ada hasil, coba kata pertama + kata kedua sebagai query
            if (!found || found.length === 0) {
              const shortName = nameTrim.split(' ').slice(0, 2).join(' ');
              if (shortName !== nameTrim && shortName.length >= 3) {
                const url2 = `${rbBase}/json/stations/search?name=${encodeURIComponent(shortName)}&limit=3&hidebroken=true&order=votes&reverse=true`;
                found = await fetch(url2, { signal: AbortSignal.timeout(3000) }).then(r => r.json()).catch(() => []);
              }
            }
          } catch {}

          if (found && found.length > 0) {
            // Ambil stasiun terbaik (sudah diurutkan by votes)
            for (const s of found.slice(0, 2)) {
              if (!s.url_resolved && !s.url) continue;
              const nameLow = (s.name||'').toLowerCase();
              if (seen.has(nameLow)) continue;
              seen.add(nameLow);
              aiStations.push({
                ...s,
                sourceLabel: 'AI · RadioBrowser',
                color: '#a78bfa',
                _aiGenre: sug.genre || '',
                _aiCountry: sug.country || '',
              });
            }
          } else {
            // Tidak ditemukan di RadioBrowser — tampilkan sebagai saran tanpa stream (info saja)
            const nameLow = nameTrim.toLowerCase();
            if (!seen.has(nameLow)) {
              seen.add(nameLow);
              aiStations.push({
                stationuuid: `ai_${nameLow.replace(/\s+/g,'_')}`,
                name: nameTrim,
                tags: sug.genre || '',
                country: sug.country || '',
                url: '',
                url_resolved: '',
                favicon: '',
                sourceLabel: 'AI · Saran',
                color: '#a78bfa',
                _notFound: true, // tidak ada di RadioBrowser
              });
            }
          }
        }
        if (aiStations.length > 0) {
          setRbAiResults(aiStations);
          // Health check hanya untuk stasiun yang punya URL
          const playable = aiStations.filter(s => s.url || s.url_resolved);
          if (playable.length > 0) {
            testStationsInGenre({ id: msKey + '__ai', stations: playable.map(s => ({ id: s.id || s.stationuuid, url: s.url })) });
          }
        }
      } catch { /* AI gagal = tidak apa-apa, hasil reguler sudah ada */ }
      setRbAiLoading(false);
    } else {
      setRbAiResults([]);
    }
  };

  // ── PLAY
  const play = useCallback(async (t) => {
    // ── Handle AI-generated songs: navigate to YT search instead of playing empty src
    if (t._aiGenerated) {
      const q = t._searchQuery || `${t.title} ${t.artist}`;
      stopAllMedia('embed');
      setUnifiedPlatform('ytmusic');
      setUnifiedQuery(q);
      setYtQuery(p => ({ ...p, ytmusic: q }));
      setTab('stream');
      setTimeout(() => {
        searchYouTube('ytmusic', q);
        ytMusicSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return;
    }
    // ── Handle liked YouTube tracks (type:'youtube', src:'') — play via embed iframe
    if (t.type === 'youtube' && t.videoId) {
      const ytItem = {
        videoId: t.videoId,
        title: t.title,
        artist: t.artist,
        uploaderName: t.artist,
        thumbnail: t.thumbnail || t.cover || `https://i.ytimg.com/vi/${t.videoId}/mqdefault.jpg`,
        duration: t.duration || t.durationSecs || 0,
        durationSecs: t.duration || t.durationSecs || 0,
      };
      // Gunakan playlist aktif jika ada dan mengandung lagu YT — jangan hardcode ke ytSongs
      // agar next/prev menghormati konteks playlist yang sedang dibuka user
      const plSongs = activePlRef.current && activePlRef.current.length > 0
        ? activePlRef.current
        : ytSongs;
      const ytQueue = plSongs
        .filter(s => s.type === 'youtube' && s.videoId)
        .map(s => ({
          videoId: s.videoId,
          title: s.title,
          artist: s.artist,
          uploaderName: s.artist,
          thumbnail: s.thumbnail || s.cover || `https://i.ytimg.com/vi/${s.videoId}/mqdefault.jpg`,
          duration: s.duration || s.durationSecs || 0,
          durationSecs: s.duration || s.durationSecs || 0,
        }));
      const queueIdx = ytQueue.findIndex(v => v.videoId === t.videoId);
      playYouTube(ytItem, ytQueue.length > 0 ? ytQueue : [ytItem], queueIdx >= 0 ? queueIdx : 0);
      setTab('player');
      return;
    }

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
        // Cek cache offline dulu
        let resolvedSrc = t.previewUrl;
        try {
          const cachedBlob = await favCacheGet(t.id);
          if (cachedBlob && cachedBlob.size > 1000) {
            resolvedSrc = URL.createObjectURL(cachedBlob);
          }
        } catch {}
        const spNativeTrack = {
          id: `ws_spotify_${t.id}`,
          title: t.title || t.name,
          artist: t.artist || t.artists?.map(a=>a.name).join(', ') || 'Spotify',
          album: 'Spotify Preview',
          cover: t.cover || t.album?.images?.[0]?.url || '',
          src: resolvedSrc,
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

    // ── Cek cache offline untuk favSongs yang punya previewUrl
    // (track yang di-love dari SC preview / Deezer / dll)
    if (t.previewUrl && t.src && !t.src.startsWith('blob:') && !t.isDrive) {
      try {
        const cachedBlob = await favCacheGet(t.id);
        if (cachedBlob && cachedBlob.size > 1000) {
          td = { ...t, src: URL.createObjectURL(cachedBlob) };
        }
      } catch {}
    }
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

  const goNext = useCallback(({ auto = false } = {}) => {
    // ── WS queue: advance within web-search audio queue
    if (track._wsSource && wsQueueRef.current.length > 0) {
      const nextIdx = wsQueueIdxRef.current + 1;
      if (nextIdx < wsQueueRef.current.length) {
        wsQueueIdxRef.current = nextIdx;
        playWsTrack(wsQueueRef.current[nextIdx], wsQueueRef.current, nextIdx);
      } else if (repeatRef.current === 'all') {
        wsQueueIdxRef.current = 0;
        playWsTrack(wsQueueRef.current[0], wsQueueRef.current, 0);
      } else if (!auto) {
        // Manual next saat di ujung queue tanpa repeat → wrap ke awal
        wsQueueIdxRef.current = 0;
        playWsTrack(wsQueueRef.current[0], wsQueueRef.current, 0);
      }
      return;
    }
    // ── Gunakan lagu dalam playlist aktif jika ada, fallback ke seluruh koleksi
    const songs = activePlRef.current && activePlRef.current.length > 0
      ? activePlRef.current
      : [...builtinSongs, ...customSongs, ...ytSongs];
    if (repeatRef.current==='one') {
      const a = audioRef.current; if (!a) return;
      const savedSrc = a.src;
      a.load();
      a.src = savedSrc; // re-assign agar canplay selalu fire
      const doPlay = () => { a.currentTime = 0; a.play().catch(()=>{}); };
      if (a.readyState >= 3) { doPlay(); } else { a.addEventListener('canplay', doPlay, { once: true }); }
      return;
    }
    if (shuffleRef.current) {
      const others = songs.filter(s=>s.id!==track.id);
      if (others.length) play(others[Math.floor(Math.random()*others.length)]);
    } else {
      // auto=true (lagu selesai otomatis) + repeat=off + shuffle=off → berhenti, tidak lanjut
      if (auto && repeatRef.current === 'off') return;
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
    // Selalu ambil duration langsung dari audio element — hindari stale closure
    // (terjadi saat shuffle ganti lagu: duration state belum update tapi seek sudah dipanggil)
    const dur = (isFinite(a.duration) && a.duration > 0)
      ? a.duration
      : (isFinite(duration) && duration > 0 ? duration : 0);
    if (!dur) return;
    const t = p * dur;
    a.currentTime = t;
    setProgress(t);
    if (dur !== duration) setDuration(dur);
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
  // Parse LRC format "[mm:ss.xx]" or "[mm:ss]" → [{time: seconds, text, idx}]
  const parseLRC = (lrcStr) => {
    const lines = [];
    let idx = 0;
    lrcStr.split('\n').forEach(line => {
      const m = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/);
      if (m) {
        const time = parseInt(m[1], 10) * 60 + parseFloat(m[2]);
        const text = m[3].trim();
        if (text) lines.push({ time, text, idx: idx++ });
      }
    });
    return lines.sort((a, b) => a.time - b.time);
  };

  const getLyrics = async () => {
    setLL(true);
    setLyrics(''); setLyricsNeedGenerate(false); setLyricsGenerated(false);
    setLyricsRomanized('');
    setLyricsRomanizing(false);
    setLrcLines([]);
    setRomanizedLrcLines([]);

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
      if (cached.lrcLines) setLrcLines(cached.lrcLines);
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
    // FIX Bug #10: untuk judul non-Latin (Korea, Jepang, Arab, dll) coba /api/get dulu
    // (exact artist+track match) sebelum /api/search — search sering gagal match karena
    // lrclib menyimpan judul dalam bentuk romanized ("Spring Day") sementara kita kirim
    // huruf asli (름날), dan matching includes() tidak bisa menemukan kecocokan.
    const parseBest = (best) => {
      if (!best) return null;
      if (best.syncedLyrics && best.syncedLyrics.trim().length > 20) {
        const parsed = parseLRC(best.syncedLyrics);
        const plain = stripLRC(best.syncedLyrics);
        const text = plain.length > 20 ? plain.trim() : (best.plainLyrics?.trim() || null);
        if (text) return { text, lrcLines: parsed };
      }
      if (best.plainLyrics && best.plainLyrics.trim().length > 20) return { text: best.plainLyrics.trim(), lrcLines: [] };
      return null;
    };
    const fetchLrclib = async () => {
      // Try 1: exact get (most reliable, works for non-latin titles stored as-is)
      if (cleanArtist) {
        try {
          const getResp = await fetchWithTimeout(
            `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`
          );
          if (getResp.ok) {
            const exact = await getResp.json();
            const r = parseBest(exact);
            if (r) return r;
          }
        } catch (_) { /* fall through */ }
      }
      // Try 2: search (broader, good for romanized titles)
      const q = encodeURIComponent(`${cleanTitle} ${cleanArtist}`);
      const resp = await fetchWithTimeout(`https://lrclib.net/api/search?q=${q}`);
      if (!resp.ok) return null;
      const results = await resp.json();
      if (!Array.isArray(results) || results.length === 0) return null;
      // FIX Bug #10: lenient matching — handle non-latin where includes() breaks
      // Try: exact match first, then partial, then any result with lyrics
      const titleLow = cleanTitle.toLowerCase();
      const best =
        results.find(r => (r.plainLyrics || r.syncedLyrics) && r.trackName?.toLowerCase() === titleLow) ||
        results.find(r =>
          (r.plainLyrics || r.syncedLyrics) &&
          (r.trackName?.toLowerCase().includes(titleLow.slice(0, 8)) ||
           titleLow.includes((r.trackName || '').toLowerCase().slice(0, 8)))
        ) ||
        results.find(r => r.syncedLyrics && r.syncedLyrics.trim().length > 20) ||
        results.find(r => r.plainLyrics && r.plainLyrics.trim().length > 20);
      return parseBest(best);
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
      const [lrclibResult, ovh, textyl, chartlyrics, aiRecall] = await Promise.all([
        fetchLrclib().catch(() => null),
        fetchOvh().catch(() => null),
        fetchTextyl().catch(() => null),
        fetchChartLyrics().catch(() => null),
        fetchAIRecall().catch(() => null),
      ]);

      // lrclib returns {text, lrcLines}; others return plain string
      const lrclib = lrclibResult?.text || null;
      const fetchedLrcLines = lrclibResult?.lrcLines || [];

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
        if (fetchedLrcLines.length > 0) setLrcLines(fetchedLrcLines);
        // Simpan ke cache agar tidak re-fetch saat lagu sama diminta lagi
        lyricsCacheSet(cacheKey, { text: dbResult.text, generated: dbResult.generated, modelLabel: activeModel(), lrcLines: fetchedLrcLines });
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
        lyricsCacheSet(cacheKey, { text: r.trim(), generated: true, modelLabel: activeModel() });
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
    setRomanizedLrcLines([]);
    const r = await askAIRace(
      `Romanize the following song lyrics into Latin alphabet. Keep ALL section tags like [Verse 1], [Chorus], etc. exactly as-is. For each non-Latin line, write the romanized pronunciation (romanji for Japanese, pinyin for Chinese, romanized for Korean/Arabic/etc). Keep blank lines. Output ONLY the romanized lyrics, no explanations.\n\nLyrics:\n${lyricsText}`,
      'You are a professional romanization expert. Romanize lyrics to Latin script. Keep structure/tags. Output only romanized lyrics.'
    ).catch(() => null);
    // FIX Bug #10: abaikan error string dari provider (tidak ada key, dll)
    if (r && r.trim().length > 10 && !r.startsWith('⚠️') && !r.startsWith('Semua provider')) {
      setLyricsRomanized(r.trim());

      // ── Build romanizedLrcLines: petakan baris romanisasi ke lrcLines supaya
      // live caption bisa menampilkan teks Latin (bukan non-Latin asli).
      // Strategi: filter baris non-kosong & non-section-tag dari hasil romanisasi,
      // lalu pasangkan satu-per-satu dengan lrcLines berdasarkan urutan.
      if (lrcLines.length > 0) {
        const romanizedContentLines = r.trim().split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && !(trimmed.startsWith('[') && trimmed.endsWith(']'));
        });
        const mapped = lrcLines.map((lrcLine, i) => ({
          ...lrcLine,
          text: romanizedContentLines[i] ?? lrcLine.text, // fallback ke asli jika index lewat
        }));
        setRomanizedLrcLines(mapped);
      }
    }
    setLyricsRomanizing(false);
  };



  // ── Translate lyrics to Bahasa Indonesia
  const translateLyrics = async () => {
    if (!lyrics || lyricsTranslating) return;
    // FIX Bug #7: guard isLite — sama seperti romanizeLyrics, terjemahan butuh AI
    if (isLite) return;
    setLyricsTranslating(true);
    setLyricsTranslation('');
    // FIX Bug #translate: Gunakan lyricsRomanized jika tersedia (sudah Latin),
    // karena menerjemahkan teks non-Latin (Korea/Jepang/Arab) langsung ke BI
    // lebih rentan error dibanding dari romanisasi Latin.
    // Jika belum diromanisasi tapi non-Latin, tetap kirim lyrics asli — AI tetap bisa menerjemahkan.
    const sourceText = lyricsRomanized && lyricsRomanized.trim().length > 10 ? lyricsRomanized : lyrics;
    const r = await askAIRace(
      `Terjemahkan lirik lagu berikut ke Bahasa Indonesia yang natural dan puitis. Pertahankan format section tag seperti [Verse 1], [Chorus], dll. Terjemahkan HANYA teks liriknya, bukan tag. Jika sudah dalam Bahasa Indonesia, kembalikan teks aslinya.\n\nLirik:\n${sourceText}`,
      'Kamu adalah penerjemah lirik profesional. Terjemahkan ke Bahasa Indonesia yang natural dan puitis. Pertahankan semua section tag. Output HANYA terjemahan lirik tanpa penjelasan.'
    ).catch(() => null);
    // FIX Bug #7: abaikan jika null / error string (tidak ada key, provider error)
    if (r && r.trim().length > 10 && !r.startsWith('⚠️') && !r.startsWith('Semua provider')) {
      setLyricsTranslation(r.trim());
      setActiveModelLabel(activeModel());
    }
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
    const historySnap = messages.filter(m => m.from === 'user' || m.from === 'ai');
    const msg=input; setInput(''); setMessages(p=>[...p,{from:'user',text:msg}]); setCL(true);
    // ── Bangun konteks jam, lokasi, cuaca untuk system prompt ─────────────
    const now = new Date();
    const hour = now.getHours();
    const timeOfDay = hour < 5 ? 'dini hari' : hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : hour < 21 ? 'malam' : 'larut malam';
    const timeStr = now.toLocaleTimeString(lang === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' });
    const locationCtx = userLocation ? `Location: ${userLocation}.` : '';
    const weatherCtx = userWeather ? `Weather: ${userWeather.emoji} ${userWeather.desc}, ${userWeather.temp}${userWeather.unit}.` : '';
    const timeCtx = lang === 'en'
      ? `Current time: ${timeStr} (${timeOfDay}).`
      : `Jam sekarang: ${timeStr} (${timeOfDay}).`;
    const ambientCtx = [timeCtx, locationCtx, weatherCtx].filter(Boolean).join(' ');

    const r = await askAIRace(
      msg,
      `You are Starry AI — a warm, fun, music-aware chat companion. Be relaxed, friendly, a bit playful. Reply briefly and naturally (max 120 words). Chat about anything: music, feelings, daily life, trivia, motivation, or just hang out. ${ambientCtx} Naturally weave in the time, place, or weather when it feels relevant — don't force it every reply. Context: the user is currently listening to "${embedTrack ? (embedTrack.title || track.title) : track.title}" by ${embedTrack ? (embedTrack.artist || track.artist) : track.artist}${track.mood ? ' (mood: ' + track.mood + ')' : ''}. MUSIC RECOMMENDATION RULES: If the user asks for a song or music recommendation, mention the song and artist naturally in your reply. At the very end of your response, on a new line, write EXACTLY one of these machine-readable tags (hidden from user): For a song: ##YT:TITLE|ARTIST## — For a radio/genre search: ##RADIO:KEYWORD## — Rules: use ## delimiters, pipe | between title and artist, no quotes, no extra words. Example endings: ##YT:Shape of You|Ed Sheeran## or ##RADIO:jazz lofi##. Only add a tag when recommending music. General chat = no tag.`,
      historySnap
    );

    // ── Parse hidden machine tags (stripped before display) ──────────────────
    const ytTagMatch    = r.match(/##YT:([^#]+)##/i);
    const radioTagMatch = r.match(/##RADIO:([^#]+)##/i);
    const cleanAiText   = r.replace(/##(YT|RADIO):[^#]+##/gi, '').trim();

    // Parse TITLE|ARTIST from YT tag
    const parseYtTag = (raw) => {
      if (!raw) return null;
      const s = raw.trim().replace(/^["'\u201c\u201d]+|["'\u201c\u201d]+$/g, '').trim();
      const pipeIdx = s.indexOf('|');
      if (pipeIdx !== -1) return { title: s.slice(0, pipeIdx).trim(), artist: s.slice(pipeIdx + 1).trim() };
      const dashIdx = s.lastIndexOf(' - ');
      if (dashIdx !== -1) return { title: s.slice(0, dashIdx).trim(), artist: s.slice(dashIdx + 3).trim() };
      return { title: s, artist: '' };
    };
    const parsedYt = ytTagMatch ? parseYtTag(ytTagMatch[1]) : null;

    // ── Simpan action ke message agar tombol bisa pakai data ini ────────────
    const aiAction = parsedYt
      ? { type: 'yt', title: parsedYt.title, artist: parsedYt.artist }
      : radioTagMatch
      ? { type: 'radio', query: radioTagMatch[1].trim() }
      : null;

    setMessages(p => [...p, { from: 'ai', text: cleanAiText, action: aiAction }]);
    setActiveModelLabel(activeModel());
    setCL(false);
  };
  // ── Shazam: rekam audio → kenali lagu ────────────────────────────────────
  const shazamCancelledRef = useRef(false); // flag untuk abort flow saat cancel
  const shazamSourceRef = useRef('mikrofon');    // 'mikrofon' | 'audio device'

  const startShazam = async () => {
    // FIX Bug Race: gunakan ref sebagai guard sinkron untuk mencegah double-start
    // selama jeda async antara guard state dan setShazamListening(true)
    if (shazamListening || shazamLoading || shazamStartingRef.current) return;
    shazamStartingRef.current = true;

    let stream;
    let sourceLabel = 'mikrofon'; // untuk pesan UI

    // Coba 1: tangkap audio sistem (tab/app lain) via getDisplayMedia
    // Didukung di Chrome/Edge desktop. Akan muncul dialog pilih tab/window/screen.
    // Firefox dan Safari belum mendukung audio track dari getDisplayMedia.
    // Mobile (phone) tidak mendukung getDisplayMedia — langsung skip ke mikrofon.
    const supportsDisplayAudio =
      typeof navigator.mediaDevices?.getDisplayMedia === 'function' && !isPhoneDevice();

    if (supportsDisplayAudio) {
      try {
        // Chrome/Edge mengharuskan video:true pada getDisplayMedia.
        // Video track langsung dihentikan setelah dapat — kita hanya butuh audio.
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            sampleRate: 44100,
          },
        });

        // Hentikan video track segera (tidak dibutuhkan, hemat resource)
        displayStream.getVideoTracks().forEach(t => t.stop());

        // getDisplayMedia sukses tapi belum tentu mengandung audio track
        // (user bisa saja memilih tab tanpa "Share tab audio" dicentang)
        const audioTracks = displayStream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream = displayStream;
          sourceLabel = 'audio device';
        } else {
          // Tidak ada audio track → hentikan stream kosong, lanjut ke fallback mikrofon
          displayStream.getTracks().forEach(t => t.stop());
        }
      } catch (err) {
        // User tekan Cancel di dialog → jangan lanjut sama sekali
        if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
          shazamStartingRef.current = false; // FIX Bug Race: reset flag agar tombol mic bisa dipakai lagi
          return;
        }
        // Error lain (NotSupportedError, dll) → lanjut ke fallback mikrofon
      }
    }

    // Coba 2: fallback ke mikrofon jika system audio tidak tersedia/gagal
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        sourceLabel = 'mikrofon';
      } catch {
        shazamStartingRef.current = false; // FIX Bug Race: reset flag
        setMessages(p => [...p, {
          from: 'ai',
          text: '🎙️ Tidak bisa mengakses mikrofon. Pastikan kamu mengizinkan akses mikrofon di browser ya!',
        }]);
        return;
      }
    }

    // FIX Bug #5: jika tidak ada format yang didukung isTypeSupported(), jangan paksa
    // mimeType yang tidak valid ke MediaRecorder — itu melempar NotSupportedError dan crash.
    // Biarkan browser memilih format default-nya sendiri dengan tidak menyertakan opsi mimeType.
    const mimeType = ['audio/webm', 'audio/ogg', 'audio/mp4'].find(m => MediaRecorder.isTypeSupported(m));

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream); // tanpa mimeType → biarkan browser pilih default

    // FIX Bug #6: gunakan mimeType AKTUAL dari recorder (bukan asumsi 'webm').
    // Saat mimeType=undefined, browser bisa memilih format apapun (Safari → mp4, dll).
    // Kalau ext tidak cocok dengan isi audio, server pengenal lagu pasti gagal.
    const actualMime = recorder.mimeType || mimeType || 'audio/webm';
    const ext = actualMime.includes('ogg') ? 'ogg'
      : actualMime.includes('mp4')  ? 'mp4'
      : 'webm';
    shazamMediaRef.current = recorder;
    shazamStreamRef.current = stream; // FIX Bug #5: simpan stream terpisah
    shazamCancelledRef.current = false; // reset flag cancel
    shazamSourceRef.current = sourceLabel;   // simpan sumber untuk UI
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    // FIX Bug 1: pasang onstop SEBELUM recorder.stop() dipanggil,
    // agar tidak ada race condition di browser yang fire onstop secara synchronous.
    const stoppedPromise = new Promise(resolve => { recorder.onstop = resolve; });

    setShazamListening(true);
    shazamStartingRef.current = false; // FIX Bug Race: guard state sudah aktif, reset ref
    setMessages(p => [...p, { from: 'user', text: sourceLabel === 'audio device' ? '🖥️ Mendengarkan audio device…' : '🎙️ Mendengarkan musik…' }]);

    recorder.start();

    // Rekam selama 8 detik
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Hentikan stream mikrofon — FIX Bug #5: gunakan shazamStreamRef (reliable lintas browser)
    if (shazamStreamRef.current) {
      shazamStreamRef.current.getTracks().forEach(t => t.stop());
      shazamStreamRef.current = null;
    }
    if (recorder.state !== 'inactive') recorder.stop();
    setShazamListening(false);

    // Cek apakah user sudah cancel selama 8 detik merekam (FIX Bug 3)
    if (shazamCancelledRef.current) return;

    setShazamLoading(true);

    // Tunggu recorder benar-benar selesai (promise sudah disiapkan sebelum stop)
    await stoppedPromise;

    // Cek cancel sekali lagi setelah onstop (FIX Bug 3)
    if (shazamCancelledRef.current) {
      setShazamLoading(false);
      shazamMediaRef.current = null;
      return;
    }

    const blob = new Blob(chunks, { type: actualMime });

    // Konversi ke base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Cek cancel sekali lagi sebelum kirim ke API (FIX Bug 3)
    if (shazamCancelledRef.current) {
      setShazamLoading(false);
      shazamMediaRef.current = null;
      return;
    }

    try {
      const resp = await fetch('/api/shazam', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ audio: base64, format: ext }),
      });
      const data = await resp.json();

      if (shazamCancelledRef.current) return; // cancel saat fetch berlangsung

      if (data.success) {
        const { title, artist, album, source, extra } = data;
        const genres   = extra?.genres || [];
        const genreStr = genres.length ? ` · Genre: ${genres.slice(0,2).join(', ')}` : '';
        const albumStr = album ? ` · Album: ${album}` : '';
        const srcStr   = source ? ` via ${source}` : '';

        setMessages(p => [...p, {
          from:   'ai',
          text:   `🎵 Ketemu! Ini lagunya:\n\n**${title}** — ${artist}${albumStr}${genreStr}\n\n_Dikenali${srcStr}_\n\nMau aku putarkan lagu ini? 🎶`,
          action: { type: 'yt', title, artist },
        }]);
      } else {
        // Tidak dikenali
        setMessages(p => [...p, {
          from: 'ai',
          text: '😕 Hmm, aku tidak bisa mengenali lagu ini. Pastikan musik cukup keras dan tidak terlalu berisik ya. Coba lagi?',
        }]);
      }
    } catch {
      if (!shazamCancelledRef.current) {
        setMessages(p => [...p, {
          from: 'ai',
          text: '⚠️ Koneksi ke server pengenal lagu gagal. Coba lagi nanti.',
        }]);
      }
    }

    setShazamLoading(false);
    shazamStartingRef.current = false; // FIX Bug Race: pastikan flag selalu bersih di akhir
    shazamMediaRef.current = null;
  };

  // Batalkan rekaman jika sedang berlangsung
  const cancelShazam = () => {
    shazamCancelledRef.current = true; // FIX Bug 3: tandai flow sebagai dibatalkan
    shazamStartingRef.current = false; // FIX Bug Race: reset starting flag
    if (shazamMediaRef.current) {
      try {
        // FIX Bug #5: gunakan shazamStreamRef, bukan recorder.stream yang tidak reliable
        if (shazamStreamRef.current) {
          shazamStreamRef.current.getTracks().forEach(t => t.stop());
          shazamStreamRef.current = null;
        }
        if (shazamMediaRef.current.state !== 'inactive') {
          shazamMediaRef.current.stop();
        }
      } catch {}
      shazamMediaRef.current = null;
    }
    // FIX Bug STT: jika STT kebetulan aktif, hentikan juga agar state tidak kotor
    if (sttRef.current) {
      try { sttRef.current.abort(); } catch {}
      sttRef.current = null;
      setSttListening(false);
    }
    setShazamListening(false);
    setShazamLoading(false);
  };

  // ── Speech-to-Text: bicara → teks langsung ke input chat ──────
  const startSTT = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Browser kamu tidak mendukung Speech Recognition. Coba Chrome atau Edge.'); return; }
    if (sttRef.current) { sttRef.current.abort(); sttRef.current = null; }
    const rec = new SR();
    rec.lang = 'id-ID';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    sttRef.current = rec;
    setSttListening(true);
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setInput(transcript);
    };
    rec.onerror = () => { setSttListening(false); sttRef.current = null; };
    rec.onend = () => { setSttListening(false); sttRef.current = null; };
    rec.start();
  };
  const stopSTT = () => {
    sttRef.current?.stop();
    sttRef.current = null;
    setSttListening(false);
  };

  const searchVibe = async () => {
    if (!vibeInput.trim()||vibeLoading) return;
    if (isLite) { setVibeInput(t?.liteVibeDisabled||'⚡ Lite Mode active — Vibe Search disabled'); return; }
    setVL(true);
    setVibeMatch(null);
    try {
      // Minta AI rekomendasikan 1 lagu terbaik — tidak terbatas Drive, bisa lagu global
      const driveCtx = customSongs.length > 0
        ? `\n\nUser juga punya lagu di Drive: ${customSongs.slice(0,10).map(s=>`"${s.title}" - ${s.artist}`).join(', ')}. Jika salah satunya sangat cocok, prioritaskan. Tapi jika tidak ada yang cocok, rekomendasikan lagu lain yang lebih baik.`
        : '';
      const currentCtx = track?.title ? `Sedang diputar: "${track.title}" oleh ${track.artist}. ` : '';
      const r = await askAIRace(
        `${currentCtx}User ingin musik dengan vibe/mood: "${vibeInput}"${driveCtx}\n\nRekomendasikan 1 lagu yang PALING cocok. Balas HANYA dalam format:\nTITLE - ARTIST\n\nSatu baris saja, tidak ada penjelasan.`,
        'You are an expert global music curator. Reply ONLY in format: TITLE - ARTIST. One line only.'
      );
      if (!r || r.startsWith('Semua provider') || r.startsWith('⚠️')) {
        setVibeInput(`✨ ${t?.vibeError || 'Gagal mencari lagu, coba lagi.'}`);
        return;
      }
      const line = r.trim().replace(/^["'✨*#\d.\s]+|["'*]+$/g, '').trim();
      if (!line || !line.includes('-')) {
        setVibeInput(`✨ ${t?.vibeError || 'Gagal mencari lagu, coba lagi.'}`);
        return;
      }

      // Cek apakah hasilnya cocok dengan lagu Drive
      const [recTitle, recArtist] = line.split('-').map(s => s.trim().toLowerCase());
      const driveMatch = customSongs.find(s =>
        s.title?.toLowerCase().includes(recTitle) || recTitle.includes(s.title?.toLowerCase())
      );

      setActiveModelLabel(activeModel());
      setVibeInput(`✨ ${line}`);

      if (driveMatch) {
        // Simpan referensi lagu Drive — user klik sendiri untuk memutar
        setVibeMatch({ song: driveMatch, source: 'drive', query: line });
      } else {
        // Simpan query untuk YouTube — user klik sendiri untuk search
        setVibeMatch({ source: 'yt', query: line });
      }
    } catch(e) {
      console.error('[searchVibe] error:', e?.message);
      setVibeInput(`✨ ${t?.vibeError || 'Gagal mencari lagu, coba lagi.'}`);
    } finally {
      setVL(false);
    }
  };

  // ── Playlists
  const createPlaylist = useCallback(({ name, songIds }) => {
    const id = 'pl_' + Date.now();
    setPlaylists(p => [...p, { id, name, songIds, locked:false }]);
    setShowPlModal(false);
    setEditingPl(null);
    setPlView('list');
    // Auto-play sebagai queue jika dibuat dari AI playlist
    if (pendingPlayQueueItems?.length) {
      const items = pendingPlayQueueItems;
      setPendingPlayQueueItems(null);
      buildAndPlayQueue(items, setPrefPlaylistQueueLoading);
    }
  }, [pendingPlayQueueItems]);

  const updatePlaylist = useCallback(({ name, songIds }) => {
    const removedIds = (editingPl?.songIds || []).filter(id => !songIds.includes(id));
    if (removedIds.length > 0) {
      // Sinkronkan liked & favSongs untuk lagu yang dihapus
      setLiked(l => { const n = { ...l }; removedIds.forEach(id => { delete n[id]; }); return n; });
      setFavSongs(p => p.filter(s => !removedIds.includes(s.id)));
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

  // ── Buka modal simpan playlist dari AI generator ─────────────────────────
  // Playlist AI tidak punya songId di library — lagu perlu ditambah ke library dulu via YT search
  // Untuk sekarang: buka PlaylistModal (buat baru) atau AddToModal (tambah ke existing)
  // dengan nama dan daftar query lagu sudah ter-isi sebagai metadata virtual
  const openSaveAIPlaylist = useCallback((playlistItems, suggestedName) => {
    // Simpan lagu AI sebagai ytSongs virtual dengan id deterministik
    const newSongIds = playlistItems.map(m => {
      const vid = 'ai_' + (m.title + '_' + m.artist).replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40);
      setYtSongs(prev => {
        if (prev.find(s => s.id === vid)) return prev;
        return [{
          id: vid, title: m.title, artist: m.artist, album: '',
          cover: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title)}&background=6366f1&color=fff&size=200`,
          src: null, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', mood: m.reason || '',
          _aiGenerated: true, _searchQuery: `${m.title} ${m.artist}`,
        }, ...prev];
      });
      return vid;
    });
    setPlPrefillName(suggestedName);
    setPlPrefillIds(newSongIds);
    setEditingPl(null);
    setPendingPlayQueueItems(playlistItems); // simpan untuk auto-play setelah save
    setShowPlModal(true);
  }, []);

  const openAddToExistingPlaylist = useCallback((playlistItems) => {
    const newSongIds = playlistItems.map(m => {
      const vid = 'ai_' + (m.title + '_' + m.artist).replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40);
      setYtSongs(prev => {
        if (prev.find(s => s.id === vid)) return prev;
        return [{
          id: vid, title: m.title, artist: m.artist, album: '',
          cover: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title)}&background=6366f1&color=fff&size=200`,
          src: null, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', mood: m.reason || '',
          _aiGenerated: true, _searchQuery: `${m.title} ${m.artist}`,
        }, ...prev];
      });
      return vid;
    });
    setAddToSongIds(newSongIds);
    setShowAddToModal(true);
  }, []);

  const addToPlaylist = useCallback((plId, songId) => {
    setPlaylists(p => p.map(pl => pl.id===plId && !pl.songIds.includes(songId)
      ? { ...pl, songIds:[...pl.songIds, songId] } : pl));
  }, []);

  const removeFromPlaylist = useCallback((plId, songId) => {
    // Hapus dari playlist ini; allSongs otomatis menyesuaikan berdasarkan keberadaan di playlist
    setLiked(l => { const n = { ...l }; delete n[songId]; return n; });
    setFavSongs(p => p.filter(s => s.id !== songId));
    setPlaylists(p => p.map(pl => ({ ...pl, songIds: pl.songIds.filter(id => id !== songId) })));
  }, []);

  // ── Google
  const handleGoogleLogin = useCallback(() => {
    if (!window.google) return setDriveError('Google API belum siap, coba lagi.');
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('GANTI_DENGAN')) return setDriveError('⚙️ Set GOOGLE_CLIENT_ID di environment variable terlebih dahulu!');
    // FIX: simpan state playing sebelum popup OAuth muncul.
    // Browser dapat meng-interrupt audio saat popup/focus hilang — kita resume setelah login selesai.
    const wasPlayingBeforeLogin = playingRef.current;
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID, scope: GOOGLE_SCOPES,
      callback: async resp => {
        if (resp.error) return setDriveError('Login failed: '+resp.error);
        const tok=resp.access_token; setAccessToken(tok); tokenRef.current=tok;
        localStorage.setItem('sn_google_token', JSON.stringify({ token: tok, expiry: Date.now() + 3300 * 1000 }));
        try {
          const u=await (await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{ headers:{ Authorization:`Bearer ${tok}` } })).json();
          setGoogleUser(u); localStorage.setItem('sn_google_user', JSON.stringify(u));
        } catch(e) { setDriveError('Gagal ambil info user: '+e.message); }
        // Load playlists dari cloud lalu merge dengan lokal
        try {
          const cloudPls = await driveLoadPlaylists(tok);
          if (cloudPls && Array.isArray(cloudPls)) {
            setPlaylists(local => {
              // Merge: gabungkan playlist lokal dan cloud, cloud menang untuk data non-locked
              const merged = [...local];
              for (const cp of cloudPls) {
                const idx = merged.findIndex(p => p.id === cp.id);
                if (idx >= 0) {
                  // Merge songIds: gabungkan tanpa duplikat
                  if (!merged[idx].locked) {
                    const combined = [...new Set([...merged[idx].songIds, ...cp.songIds])];
                    merged[idx] = { ...cp, songIds: combined };
                  }
                } else {
                  merged.push(cp);
                }
              }
              return merged;
            });
          }
        } catch {}
        // Gunakan loadDriveSongs agar error handling konsisten
        await loadDriveSongs(tok, true);
        // FIX: resume playback jika sedang diputar sebelum popup login muncul
        if (wasPlayingBeforeLogin && audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        }
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
  // Lagu tampil di "Semua Lagu" hanya jika ada di: customSongs, favSongs, ytSongs,
  // atau minimal satu playlist (pl_fav / custom playlist). builtinSongs hanya tampil
  // jika ada di salah satu playlist.
  const allSongs = (() => {
    const seen = new Set();
    // Kumpulkan semua songId yang ada di playlist manapun
    const inPlaylist = new Set(playlists.flatMap(pl => pl.songIds));
    // customSongs & favSongs & ytSongs selalu tampil (user punya lagu tsb)
    const userOwnedIds = new Set([
      ...customSongs.map(s => s.id),
      ...favSongs.map(s => s.id),
      ...ytSongs.map(s => s.id),
    ]);
    return [...builtinSongs, ...customSongs, ...ytSongs, ...favSongs].filter(s => {
      if (!s.id || seen.has(s.id)) return false;
      // Tampilkan jika: user punya lagu ini ATAU ada di playlist manapun
      if (!userOwnedIds.has(s.id) && !inPlaylist.has(s.id)) return false;
      seen.add(s.id); return true;
    });
  })();

  // ── Search filter
  const q = searchQuery.toLowerCase();
  const filteredSongs = allSongs.filter(s => !q || (s.title||'').toLowerCase().includes(q) || (s.artist||'').toLowerCase().includes(q) || (s.album||'').toLowerCase().includes(q));
  const filteredCustom = filteredSongs.filter(s => s.isDrive);

  // ── Active playlist songs
  const activePlSongs = activePl
    ? (() => {
        // Special built-in playlists
        if (activePl === 'all_songs')       return allSongs;
        if (activePl === 'my_songs')        return [...customSongs, ...favSongs.filter(s => !customSongs.find(c => c.id === s.id))];
        if (activePl === 'recently_played') return history.slice(0, 50).map(id => allSongs.find(s => s.id === id)).filter(Boolean);
        if (activePl === 'pl_fav') {
          // Favorit: pakai favSongs sebagai sumber kebenaran, fallback ke pl.songIds
          const favIds = new Set(favSongs.map(s => s.id));
          const pl = playlists.find(p => p.id === 'pl_fav');
          const plIds = pl ? pl.songIds : [];
          const allIds = [...new Set([...favIds, ...plIds])];
          return allSongs.filter(s => allIds.includes(s.id));
        }
        // Custom playlists
        const pl = playlists.find(p => p.id === activePl);
        return pl ? allSongs.filter(s => pl.songIds.includes(s.id)) : allSongs;
      })()
    : allSongs;

  // ── Sync activePlRef agar goNext/goPrev selalu pakai konteks playlist aktif
  useEffect(() => { activePlRef.current = activePlSongs; }, [activePlSongs]);

  // ── Reset edit modes when switching playlists
  useEffect(() => { setPlSongsEditMode(false); setAllSongsEditMode(false); }, [activePl]);


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
    <div className={`${isLite ? 'lite-mode' : 'pro-mode'} layout-${layoutMode}`} style={{ position:'fixed', inset:0, overflow:'hidden', background: isLite ? '#07071a' : ({starry:'#07071a',bedroom:'#07051a',journey:'#05100a',ocean:'#040e18',fantasy:'#06041a',futurecity:'#020810',nightgarden:'#020d06',nighthighway:'#03060e',solarsystem:'#010108'}[bgTheme]||'#07071a'), color:'#f1f5f9', fontFamily:"'Segoe UI',system-ui,sans-serif", display:'flex', flexDirection:'column', userSelect:'none', WebkitTapHighlightColor:'transparent' }}>

      {/* ══ PWA INSTALL BANNER — floating bottom, appears when installable ══ */}
      {!pwaInstalled && !pwaBannerDismissed && pwaBannerVisible && pwaPrompt && (
        <div style={{
          position:'fixed', bottom: layoutMode.startsWith('mobile') ? 80 : 24,
          left:'50%', transform:'translateX(-50%)',
          zIndex:9998, width: layoutMode.startsWith('mobile') ? 'calc(100% - 32px)' : 360,
          maxWidth:400,
          background:'linear-gradient(135deg,rgba(15,15,40,0.97),rgba(25,15,55,0.97))',
          border:'1px solid rgba(99,102,241,0.4)',
          borderRadius:18, padding:'14px 16px',
          boxShadow:'0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)',
          backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
          display:'flex', alignItems:'center', gap:12,
          animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(24px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          {/* Icon */}
          <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>🌟</div>
          {/* Text */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:800, color:'white', lineHeight:1.2 }}>Install Starry Night</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', marginTop:2 }}>Akses lebih cepat · Pintasan layar utama</div>
          </div>
          {/* Buttons */}
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            <button onClick={dismissPwaBanner} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.45)', fontSize:11, cursor:'pointer', fontWeight:600 }}>
              Nanti
            </button>
            <button onClick={installPwa} style={{ padding:'6px 14px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:11, cursor:'pointer', fontWeight:800, whiteSpace:'nowrap' }}>
              📲 Install
            </button>
          </div>
        </div>
      )}

      {/* BG — Pro only, theme-aware */}
      {!isLite && (() => {
        const th = bgTheme || 'starry';
        // Base solid background
        const baseBg = {
          starry:    '#07071a',
          bedroom:   '#07051a',
          journey:   '#05100a',
          ocean:     '#040e18',
          fantasy:   '#06041a',
          futurecity:   '#020810',
          nightgarden:  '#020d06',
          nighthighway: '#03060e',
          solarsystem:  '#010108',
        }[th] || '#07071a';

        // Overlay gradients per theme
        const overlays = {
          starry: [
            `radial-gradient(ellipse at 60% 10%,${track?.color||'#3b82f6'}20 0%,transparent 60%)`,
          ],
          bedroom: [
            // Cahaya lampu tidur kuning-oranye hangat dari kiri bawah (lebih kuat & natural)
            'radial-gradient(ellipse at 12% 92%, rgba(255,150,30,0.32) 0%, rgba(210,90,10,0.16) 30%, transparent 58%)',
            // Sinar bulan dingin dari kanan atas masuk lewat jendela (lebih nyata)
            'radial-gradient(ellipse at 88% 5%, rgba(160,185,255,0.22) 0%, rgba(120,150,230,0.10) 30%, transparent 52%)',
            // Ambient malam biru gelap keunguan di tengah
            'radial-gradient(ellipse at 50% 50%, rgba(18,12,48,0.28) 0%, transparent 65%)',
            // Cahaya bulan di lantai (dari jendela)
            'radial-gradient(ellipse at 80% 100%, rgba(140,165,255,0.10) 0%, transparent 40%)',
          ],
          journey: [
            // Green forest floor glow
            'radial-gradient(ellipse at 50% 100%, rgba(20,120,40,0.35) 0%, rgba(10,60,20,0.18) 40%, transparent 65%)',
            // Moonlight from top
            'radial-gradient(ellipse at 40% 0%, rgba(180,210,255,0.18) 0%, transparent 45%)',
            // Misty mountain teal
            'radial-gradient(ellipse at 80% 60%, rgba(20,80,60,0.15) 0%, transparent 50%)',
          ],
          ocean: [
            // Deep sea from bottom
            'radial-gradient(ellipse at 50% 100%, rgba(0,80,160,0.45) 0%, rgba(0,40,100,0.25) 40%, transparent 65%)',
            // Moonlit surface shimmer top
            'radial-gradient(ellipse at 50% 10%, rgba(160,220,255,0.20) 0%, transparent 50%)',
            // Bioluminescent teal mid
            'radial-gradient(ellipse at 25% 60%, rgba(0,200,180,0.10) 0%, transparent 45%)',
          ],
          fantasy: [
            // Aurora hijau-biru di atas
            'radial-gradient(ellipse at 35% 15%, rgba(60,200,160,0.20) 0%, rgba(40,160,120,0.08) 45%, transparent 65%)',
            // Aurora ungu di tengah atas
            'radial-gradient(ellipse at 65% 10%, rgba(140,60,255,0.18) 0%, rgba(100,40,200,0.08) 40%, transparent 60%)',
            // Cahaya bulan keemasan
            'radial-gradient(ellipse at 14% 8%, rgba(255,220,140,0.20) 0%, transparent 40%)',
            // Ground glow ungu misterius
            'radial-gradient(ellipse at 50% 100%, rgba(80,20,140,0.30) 0%, rgba(50,10,100,0.15) 40%, transparent 65%)',
          ],
          futurecity: [
            // Cyan-teal horizon glow — neon bawah kota (lebih kuat)
            'radial-gradient(ellipse at 50% 95%, rgba(0,230,210,0.32) 0%, rgba(0,160,190,0.16) 38%, transparent 62%)',
            // Blue neon pillar kiri
            'radial-gradient(ellipse at 8%  55%, rgba(0,130,255,0.24) 0%, transparent 48%)',
            // Purple haze kanan atas
            'radial-gradient(ellipse at 88% 8%,  rgba(170,0,255,0.18) 0%, transparent 42%)',
            // Pantulan neon di langit rendah
            'radial-gradient(ellipse at 30% 70%, rgba(0,180,255,0.10) 0%, transparent 35%)',
            'radial-gradient(ellipse at 70% 65%, rgba(140,0,255,0.10) 0%, transparent 35%)',
          ],
          nightgarden: [
            // Rich emerald sky glow from horizon
            'radial-gradient(ellipse at 50% 100%, rgba(10,110,55,0.65) 0%, rgba(5,60,28,0.32) 45%, transparent 72%)',
            // Moonlight from top-right
            'radial-gradient(ellipse at 78% 5%, rgba(170,210,190,0.18) 0%, rgba(120,175,155,0.08) 35%, transparent 55%)',
            // Warm firefly ambient mid-left
            'radial-gradient(ellipse at 22% 55%, rgba(90,210,115,0.08) 0%, transparent 42%)',
            // Deep forest atmosphere at sides
            'radial-gradient(ellipse at 0% 60%, rgba(4,45,18,0.35) 0%, transparent 45%)',
            'radial-gradient(ellipse at 100% 60%, rgba(4,45,18,0.35) 0%, transparent 45%)',
          ],
          nighthighway: [
            // Deep asphalt ground
            'radial-gradient(ellipse at 50% 100%, rgba(15,22,42,0.88) 0%, rgba(6,10,22,0.55) 40%, transparent 68%)',
            // City glow horizon — warmer & brighter
            'radial-gradient(ellipse at 50% 32%, rgba(255,150,0,0.13) 0%, rgba(200,80,0,0.06) 38%, transparent 62%)',
            // Left headlight cone — warmer
            'radial-gradient(ellipse at 36% 68%, rgba(255,245,190,0.14) 0%, transparent 42%)',
            // Right headlight cone — warmer
            'radial-gradient(ellipse at 64% 68%, rgba(255,245,190,0.14) 0%, transparent 42%)',
            // Neon cyan glow from city left
            'radial-gradient(ellipse at 5% 45%, rgba(0,200,255,0.07) 0%, transparent 40%)',
            // Neon purple glow from city right
            'radial-gradient(ellipse at 95% 45%, rgba(180,0,255,0.06) 0%, transparent 40%)',
          ],
          solarsystem: [
            // Deep space dark core — slightly warmer
            'radial-gradient(ellipse at 50% 50%, rgba(5,4,30,0.65) 0%, transparent 78%)',
            // Nebula blue-purple haze left — stronger
            'radial-gradient(ellipse at 8% 38%, rgba(65,28,195,0.24) 0%, rgba(40,15,130,0.10) 40%, transparent 58%)',
            // Nebula pink-red haze right — stronger
            'radial-gradient(ellipse at 92% 62%, rgba(195,28,85,0.20) 0%, rgba(130,15,50,0.08) 40%, transparent 55%)',
            // Sun warm glow top — bigger & richer
            'radial-gradient(ellipse at 13% 11%, rgba(255,190,50,0.30) 0%, rgba(255,140,0,0.12) 35%, transparent 55%)',
            // Cosmic dust teal
            'radial-gradient(ellipse at 70% 25%, rgba(0,200,180,0.08) 0%, transparent 45%)',
          ],
        }[th] || [`radial-gradient(ellipse at 60% 10%,${track?.color||'#3b82f6'}20 0%,transparent 60%)`];

        // Animated overlay elements per theme
        const ThemeOverlay = () => {
          if (th === 'starry') return <><div className="stars"/><div className="starsB"/><div className="starsC"/></>;
          if (th === 'bedroom') return (
            <>
              {/* Langit malam via jendela — bintang sangat redup */}
              <div className="starsB" style={{ opacity:0.20 }}/>
              {/* Bulan di dalam jendela — lebih besar & bercahaya */}
              {(() => {
                const ls = layoutMode.includes('landscape');
                return (
                  <div style={{ position:'absolute', top: ls ? '6%' : '9%', right: ls ? '6.5%' : '8.5%', width: ls ? 26 : 34, height: ls ? 26 : 34, borderRadius:'50%', background:'radial-gradient(circle, rgba(230,240,255,0.90) 30%, rgba(190,210,255,0.45) 60%, transparent 82%)', boxShadow:'0 0 18px rgba(190,210,255,0.40), 0 0 6px rgba(210,225,255,0.60)', zIndex:1 }}/>
                );
              })()}
              {/* Jendela frame */}
              <div className="bedroom-window"/>
              {/* Hujan di luar jendela */}
              <div className="window-rain"/>
              {/* Tirai kiri & kanan */}
              <div className="curtain-left"/>
              <div className="curtain-right"/>
              {/* Sinar bulan masuk lewat jendela */}
              <div className="moonbeam"/>

              {/* Kasur & headboard — lebih realistis */}
              {(() => {
                const ls = layoutMode.includes('landscape');
                const isDesk = layoutMode.includes('desktop');
                const sbW = isDesk ? (ls ? SIDEBAR_W_LANDSCAPE : SIDEBAR_W_PORTRAIT) : 0;
                const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
                const leftPost = Math.round(((sbW + 18) / vw) * 100);
                const lp   = `${leftPost}%`;
                const lpIn = `${leftPost + 1.8}%`;
                return (
                  <div style={{
                    position:'absolute', bottom:0, left:0, right:0, height: ls ? '34%' : '30%',
                    pointerEvents:'none',
                    background: [
                      `linear-gradient(to top, rgba(90,48,18,0.50) 0%, rgba(110,60,28,0.32) 30%, rgba(95,52,22,0.14) 60%, transparent 100%)`,
                    ].join(', '),
                    clipPath: `polygon(0% 100%, 0% 42%, ${lp} 34%, ${lpIn} 20%, 91% 20%, 92% 34%, 100% 42%, 100% 100%)`
                  }}/>
                );
              })()}
              {/* Lantai hangat */}
              <div className="bedroom-floor"/>
            </>
          );
          if (th === 'journey') return (
            <>
              <div className="stars" style={{ opacity:0.55 }}/><div className="starsB" style={{ opacity:0.40 }}/><div className="starsC" style={{ opacity:0.25 }}/>
              {/* Mountain back range */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height: layoutMode.includes('landscape') ? '45%' : '35%', background:'rgba(15,35,20,0.48)', clipPath:'polygon(0% 100%, 0% 65%, 8% 48%, 16% 62%, 24% 38%, 32% 58%, 38% 42%, 44% 55%, 50% 30%, 56% 50%, 63% 35%, 70% 55%, 76% 44%, 83% 58%, 90% 40%, 96% 60%, 100% 52%, 100% 100%)' }}/>
              {/* Mountain front range */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height: layoutMode.includes('landscape') ? '32%' : '25%', background:'rgba(5,18,10,0.72)', clipPath:'polygon(0% 100%, 0% 80%, 5% 58%, 12% 72%, 20% 50%, 28% 68%, 35% 52%, 42% 70%, 48% 42%, 55% 62%, 62% 45%, 68% 65%, 75% 50%, 82% 70%, 88% 55%, 94% 72%, 100% 60%, 100% 100%)' }}/>
              {/* Forest fog — lebih rendah di landscape */}
              <div style={{ position:'absolute', bottom: layoutMode.includes('landscape') ? '28%' : '20%', left:0, right:0, height:'10%', background:'linear-gradient(to top, rgba(60,120,70,0.20), transparent)', filter:'blur(4px)' }}/>
            </>
          );
          if (th === 'ocean') return (
            <>
              <div className="stars" style={{ opacity:0.60 }}/><div className="starsB" style={{ opacity:0.45 }}/><div className="starsC" style={{ opacity:0.20 }}/>
              <div className="wave-layer"/>
              {/* Horizon mist */}
              <div style={{ position:'absolute', bottom:'22%', left:0, right:0, height:'10%', background:'linear-gradient(to top, rgba(10,60,120,0.30) 0%, transparent 100%)', filter:'blur(6px)' }}/>
            </>
          );
          if (th === 'fantasy') return (
            <>
              {/* Bintang-bintang besar di langit dongeng */}
              <div className="fantasy-stars"/>
              <div className="starsB" style={{ opacity:0.55 }}/>
              {/* Aurora borealis ribbon */}
              <div className="aurora-layer"/>
              <div style={{ position:'absolute', top:'42%', left:'28%', width:3, height:3, borderRadius:'50%', background:'rgba(120,255,180,0.90)', boxShadow:'0 0 6px rgba(100,255,160,0.70)' }}/>
              {/* Kastil siluet */}
              <div className="castle-layer"/>
              {/* Sparkle / glitter melayang di langit dongeng */}
              <div className="sparkle-layer"/>
              {/* Kabut di kaki kastil */}
              <div className="castle-mist"/>
            </>
          );
          if (th === 'futurecity') return (
            <>
              {/* Minimal stars — langit polusi cahaya kota */}
              <div className="stars" style={{ opacity:0.18 }}/><div className="starsB" style={{ opacity:0.10 }}/>
              {/* City building silhouettes with neon */}
              <div className="city-layer"/>
              {/* Neon window blinks on buildings */}
              <div className="city-windows" style={{ height: layoutMode.includes('landscape') ? '58%' : '42%' }}/>
              {/* Ground — aspal gelap berkilap neon */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height: layoutMode.includes('landscape') ? '48%' : '35%', background:'linear-gradient(to top, rgba(0,10,22,0.88) 0%, rgba(0,20,40,0.55) 35%, transparent 100%)' }}/>
              {/* Pantulan neon di aspal — multi-warna lebih hidup */}
              <div style={{ position:'absolute', bottom:0, left:'10%', right:'10%', height:'20%', background:'linear-gradient(to top, rgba(0,210,190,0.12) 0%, rgba(0,150,255,0.07) 50%, transparent 100%)', filter:'blur(10px)' }}/>
              <div style={{ position:'absolute', bottom:0, left:'35%', right:'35%', height:'14%', background:'linear-gradient(to top, rgba(170,0,255,0.10) 0%, transparent 100%)', filter:'blur(8px)' }}/>
              {/* Scan line — disembunyikan di landscape via CSS */}
              <div className="scan-line"/>
              {/* Kendaraan terbang 1 — cyan. Wrapper: posisi + box-shadow STATIS (tidak beranimasi).
                  Inner: hanya transform/opacity via float-orb — compositor-only, no repaint */}
              <div style={{ position:'absolute', top: layoutMode.includes('landscape') ? '14%' : '20%', left:'6%', width:10, height:3, borderRadius:2, boxShadow:'0 0 10px 3px rgba(0,220,200,0.65), -8px 0 8px rgba(0,180,255,0.45)', pointerEvents:'none' }}>
                <div style={{ width:'100%', height:'100%', borderRadius:2, background:'rgba(0,220,200,0.95)' }}/>
              </div>
              {/* Kendaraan terbang 2 — ungu */}
              <div style={{ position:'absolute', top: layoutMode.includes('landscape') ? '8%' : '13%', right:'18%', width:7, height:2, borderRadius:2, boxShadow:'0 0 8px 2px rgba(160,0,255,0.60), 6px 0 6px rgba(200,100,255,0.35)', pointerEvents:'none' }}>
                <div style={{ width:'100%', height:'100%', borderRadius:2, background:'rgba(180,50,255,0.90)' }}/>
              </div>
              {/* Beacon — wrapper menahan filter blur sebagai pengganti box-shadow, inner hanya opacity */}
              <div style={{ position:'absolute', top: layoutMode.includes('landscape') ? '5%' : '9%', left:'46.5%', width:5, height:5, borderRadius:'50%', background:'rgba(255,60,60,0.95)', filter:'drop-shadow(0 0 4px rgba(255,40,40,0.60))' }}/>
            </>
          );
          if (th === 'nightgarden') {
            const ls = layoutMode.includes('landscape');
            // Pohon-pohon taman dengan variasi sway
            // Landscape: pohon lebih kecil & posisi lebih rendah
            const treeBot  = ls ? '12%' : '20%';
            const treeScale = ls ? 0.70 : 1.0;
            const trees = [
              { l:'4%',  s:50, delay:0,   sway:'sway-a' },
              { l:'13%', s:42, delay:1.2, sway:'sway-b' },
              { l:'22%', s:66, delay:2.5, sway:'sway-c' },
              { l:'33%', s:38, delay:0.6, sway:'sway-b' },
              { l:'56%', s:52, delay:0.8, sway:'sway-a' },
              { l:'67%', s:64, delay:3.0, sway:'sway-c' },
              { l:'77%', s:44, delay:1.8, sway:'sway-b' },
              { l:'87%', s:56, delay:4.0, sway:'sway-a' },
              { l:'94%', s:40, delay:2.2, sway:'sway-c' },
            ];
            // Kunang-kunang: landscape di area langit atas (top 10-35%), portrait area tengah (34-54%)
            const fireflies = ls ? [
              { top:'12%', left:'10%', delay:'0s',    dur:'7s',  fx:'18px',  fy:'-10px' },
              { top:'18%', left:'52%', delay:'1.5s',  dur:'9s',  fx:'-16px', fy:'-8px'  },
              { top:'25%', left:'32%', delay:'3s',    dur:'11s', fx:'12px',  fy:'-12px' },
              { top:'15%', left:'72%', delay:'5s',    dur:'8s',  fx:'-12px', fy:'-8px'  },
              { top:'22%', left:'20%', delay:'2s',    dur:'13s', fx:'16px',  fy:'-7px'  },
              { top:'10%', left:'62%', delay:'6s',    dur:'10s', fx:'-9px',  fy:'-10px' },
              { top:'30%', left:'42%', delay:'4s',    dur:'12s', fx:'14px',  fy:'-8px'  },
            ] : [
              { top:'46%', left:'10%', delay:'0s',    dur:'7s',  fx:'18px',  fy:'-14px' },
              { top:'36%', left:'52%', delay:'1.5s',  dur:'9s',  fx:'-16px', fy:'-9px'  },
              { top:'54%', left:'32%', delay:'3s',    dur:'11s', fx:'12px',  fy:'-18px' },
              { top:'40%', left:'72%', delay:'5s',    dur:'8s',  fx:'-12px', fy:'-11px' },
              { top:'50%', left:'20%', delay:'2s',    dur:'13s', fx:'20px',  fy:'-7px'  },
              { top:'44%', left:'62%', delay:'6s',    dur:'10s', fx:'-9px',  fy:'-16px' },
              { top:'34%', left:'42%', delay:'4s',    dur:'12s', fx:'14px',  fy:'-11px' },
              { top:'52%', left:'82%', delay:'7s',    dur:'9s',  fx:'-18px', fy:'-9px'  },
              { top:'38%', left:'88%', delay:'9s',    dur:'14s', fx:'10px',  fy:'-20px' },
              { top:'48%', left:'5%',  delay:'11s',   dur:'8s',  fx:'-14px', fy:'-7px'  },
              { top:'42%', left:'28%', delay:'2.5s',  dur:'16s', fx:'16px',  fy:'-13px' },
            ];
            // Partikel cahaya bulan — landscape di area atas
            const moonDust = ls ? [
              { top:'8%',  left:'68%', delay:'0s',  dur:'14s' },
              { top:'14%', left:'45%', delay:'4s',  dur:'11s' },
              { top:'5%',  left:'82%', delay:'8s',  dur:'18s' },
            ] : [
              { top:'20%', left:'68%', delay:'0s',  dur:'14s' },
              { top:'28%', left:'45%', delay:'4s',  dur:'11s' },
              { top:'15%', left:'82%', delay:'8s',  dur:'18s' },
              { top:'25%', left:'30%', delay:'12s', dur:'13s' },
            ];
            const lanternBot = ls ? '14%' : '22%';
            return (
              <>
                <div className="starsB" style={{ opacity:0.32 }}/><div className="starsC" style={{ opacity:0.18 }}/>
                <div className="garden-sky"/>
                {trees.map((t,i) => {
                  const sz = Math.round(t.s * treeScale);
                  return (
                    <div key={i} className={`garden-tree ${t.sway}`} style={{ left:t.l, bottom:treeBot, animationDelay:`${t.delay}s` }}>
                      <div className="crown" style={{ width:sz, height:sz }}/>
                      <div className="trunk" style={{ height: Math.round(sz*0.48) }}/>
                    </div>
                  );
                })}
                {[{ l:'8%', w:28, h:18 }, { l:'40%', w:22, h:14 }, { l:'62%', w:30, h:20 }, { l:'78%', w:24, h:16 }].map((b,i) => (
                  <div key={i} className="garden-bush" style={{ left:b.l, width:ls?Math.round(b.w*0.7):b.w, height:ls?Math.round(b.h*0.7):b.h }}/>
                ))}
                <div className="garden-grass2"/>
                <div className="garden-grass"/>
                <div className="garden-ground"/>
                {!ls && <div className="garden-path"/>}
                {!ls && <div className="garden-pond"/>}
                <div className="garden-mist2"/>
                <div className="garden-mist"/>
                {[{ l:'18%', delay:'0s' }, { l:'48%', delay:'2s' }, { l:'72%', delay:'4s' }].map((ln,i) => (
                  <div key={i} className="garden-lantern" style={{ left:ln.l, bottom:lanternBot, position:'absolute', animationDelay:ln.delay }}>
                    <div className="lantern-cap"/>
                    <div className="lantern-body"/>
                    <div className="lantern-pole"/>
                  </div>
                ))}
                {fireflies.map((f,i) => (
                  <div key={i} className="gfw" style={{
                    top:f.top, left:f.left,
                    '--fx':f.fx, '--fy':f.fy,
                    animationDelay:f.delay, animationDuration:f.dur,
                  }}/>
                ))}
                {moonDust.map((d,i) => (
                  <div key={i} className="garden-dust" style={{
                    top:d.top, left:d.left, '--fx':'4px', '--fy':'-6px',
                    animationDelay:d.delay, animationDuration:d.dur,
                  }}/>
                ))}
              </>
            );
          }
          if (th === 'nighthighway') {
            const ls = layoutMode.includes('landscape');
            const roadH = ls ? 50 : 42;
            // Mobil berada di jalur dalam area jalan (bottom:0, height=roadH%)
            // Jalur kiri  (headlight, datang dari kiri): bottom rendah = dekat pengemudi
            // Jalur kanan (taillight, pergi ke kanan):   bottom rendah = dekat pengemudi
            // Dua kendaraan per jalur = dua nilai bottom berbeda
            const carBot1 = `${roadH * 0.18}%`;  // lane dekat, ~7-9% dari bawah
            const carBot2 = `${roadH * 0.07}%`;  // lane sangat dekat, ~3-4% dari bawah
            // Posisi horizontal: jalur kiri di 28-36% dari kiri, jalur kanan di 52-62%
            const isDesk2 = layoutMode.includes('desktop');
            const sbW2 = isDesk2 ? (ls ? SIDEBAR_W_LANDSCAPE : SIDEBAR_W_PORTRAIT) : 0;
            const laneLeftX  = `calc(${sbW2}px + 28%)`;  // jalur kiri (headlight)
            const laneRightX = `calc(${sbW2}px + 52%)`; // jalur kanan (taillight)
            // Tetesan hujan
            const rainDrops = Array.from({ length: 18 }, (_, i) => ({
              left: `${(i * 5.5 + Math.sin(i*2.1)*3) % 100}%`,
              height: `${60 + (i % 5) * 20}px`,
              delay: `${(i * 0.28) % 2.5}s`,
              dur: `${0.7 + (i % 4) * 0.15}s`,
              opacity: 0.15 + (i % 3) * 0.08,
            }));
            return (
              <>
                <div className="stars" style={{ opacity:0.40 }}/><div className="starsB" style={{ opacity:0.22 }}/>

                {/* Awan tipis */}
                <div className="hw-cloud" style={{ top:'12%', left:'20%', width:120, height:28 }}/>
                <div className="hw-cloud" style={{ top:'18%', right:'15%', width:90, height:20 }}/>
                {/* Langit */}
                <div className="hw-sky"/>
                {/* Siluet gedung kota di cakrawala */}
                <div className="hw-city-bg"/>
                {/* Cahaya kota di cakrawala */}
                <div className="hw-horizon"/>
                {/* Lampu neon di gedung */}
                <div className="hw-neon-lights"/>
                {/* Jalan */}
                <div className="hw-road"/>
                {/* Penyambung jalan ke cakrawala — mengisi celah atas hw-road */}
                <div className="hw-road-cap"/>
                {/* Marka tengah bergerak */}
                <div className="hw-lane-center"/>
                {/* Garis tepi */}
                <div className="hw-lane-edge-l"/><div className="hw-lane-edge-r"/>
                {/* Pantulan lampu di aspal */}
                <div className="hw-reflect"/>
                {/* Tiang lampu — tepi kiri & kanan jalan, simulasi perspektif */}
                {(() => {
                  const isDesk = layoutMode.includes('desktop');
                  const sbW = isDesk ? (ls ? SIDEBAR_W_LANDSCAPE : SIDEBAR_W_PORTRAIT) : 0;
                  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
                  // Lebar area konten (tidak termasuk sidebar)
                  const contentW = vw - sbW;
                  // Posisi tiang: dihitung dari tepi kiri konten (setelah sidebar)
                  // Kedua tiang menggunakan left, agar translateX(-50%) konsisten
                  // Tiang kiri: left = sbW + frac% * contentW
                  // Tiang kanan: left = sbW + contentW - frac% * contentW (mirror dari kiri)
                  const poleL = (frac) => `calc(${sbW}px + ${frac * contentW / 100}px)`;
                  const poleR = (frac) => `calc(${sbW}px + ${contentW - frac * contentW / 100}px)`;
                  const poles = [
                    // Kiri: 3 tiang (dekat→jauh) — makin besar = makin ke tengah = makin jauh
                    { posVal: poleL(3),  armH: ls?110:100, opacity:1.0,  headS:16 },
                    { posVal: poleL(9),  armH: ls? 80: 75, opacity:0.60, headS:12, scale:0.85 },
                    { posVal: poleL(14), armH: ls? 55: 52, opacity:0.35, headS: 9, scale:0.70 },
                    // Kanan: mirror sempurna dari kiri terhadap tengah konten
                    { posVal: poleR(3),  armH: ls?110:100, opacity:1.0,  headS:16 },
                    { posVal: poleR(9),  armH: ls? 80: 75, opacity:0.60, headS:12, scale:0.85 },
                    { posVal: poleR(14), armH: ls? 55: 52, opacity:0.35, headS: 9, scale:0.70 },
                  ];
                  return poles.map((p,i) => (
                  <div key={i} className="hw-pole" style={{
                    left: p.posVal,
                    opacity: p.opacity,
                    transform: `translateX(-50%) ${p.scale ? `scale(${p.scale})` : ''}`,
                    transformOrigin: 'bottom center',
                  }}>
                    <div className="pole-head" style={{ width:p.headS, height: Math.round(p.headS*0.38) }}/>
                    <div className="pole-cone"/>
                    <div className="pole-arm" style={{ height: p.armH }}/>
                  </div>
                ));
                  })()}

                {/* Hujan halus */}
                <div className="hw-rain">
                  {rainDrops.map((d,i) => (
                    <div key={i} className="hw-rain-drop" style={{
                      left:d.left, height:d.height,
                      opacity:d.opacity,
                      animationDuration:d.dur,
                      animationDelay:d.delay,
                    }}/>
                  ))}
                </div>
              </>
            );
          }
          if (th === 'solarsystem') {
            const ls = layoutMode.includes('landscape');
            // Landscape: matahari lebih kecil & orbit lebih kecil agar muat di layar pendek
            const sunS  = ls ? 44 : 60;
            const sunX  = ls ? '10%' : '13%';
            const sunY  = ls ? '14%' : '11%';
            // Skala orbit & planet: portrait penuh, landscape dikecilkan ~65%
            const sc    = ls ? 0.62 : 1.0;
            // Orbit radii — dikalikan sc
            const rings = [55,95,145,205,275,355,445,545].map(r => Math.round(r*sc));
            // Planet positions dihitung % relatif terhadap posisi matahari + offset trigonometri
            // Portrait: top=calc(sunY% + r*sin(θ)px), left=calc(sunX% + r*cos(θ)px)
            // Landscape: sama tapi r lebih kecil
            const makePlanetPos = (ringIdx, angleDeg) => {
              const r   = rings[ringIdx];
              const rad = angleDeg * Math.PI / 180;
              const ox  = Math.round(r * Math.cos(rad));
              const oy  = Math.round(r * Math.sin(rad));
              return {
                top:  `calc(${sunY} + ${oy}px)`,
                left: `calc(${sunX} + ${ox}px)`,
              };
            };
            const planets = [
              { size:ls?8:11,  bg:'radial-gradient(circle at 38% 35%, #6ec0ff 0%, #2a68cc 40%, #0d2870 75%, #050f40 100%)',
                glow:'rgba(70,145,255,0.60)',  ...makePlanetPos(2, 35),  dur:'8s',  delay:'0s', shadow:'inset -2px -3px 5px rgba(0,0,0,0.40)' },
              { size:ls?7:9,   bg:'radial-gradient(circle at 36% 32%, #ffa060 0%, #d04818 45%, #7a2000 78%, #3a0800 100%)',
                glow:'rgba(255,130,50,0.55)',  ...makePlanetPos(3, 110), dur:'11s', delay:'1s', shadow:'inset -2px -2px 4px rgba(0,0,0,0.45)' },
              { size:ls?11:16, bg:'radial-gradient(circle at 40% 36%, #fff090 0%, #dca810 40%, #8a6000 70%, #4a3000 100%)',
                glow:'rgba(255,215,90,0.50)',  ...makePlanetPos(4, 15),  dur:'14s', delay:'3s', shadow:'inset -3px -4px 8px rgba(0,0,0,0.40)' },
              { size:ls?5:7,   bg:'radial-gradient(circle at 38% 35%, #55f0e0 0%, #0c9080 50%, #034840 80%, #011a18 100%)',
                glow:'rgba(50,230,210,0.50)',  ...makePlanetPos(5, 160), dur:'7s',  delay:'2s', shadow:'inset -2px -2px 3px rgba(0,0,0,0.40)' },
              { size:ls?10:14, bg:'radial-gradient(circle at 42% 38%, #ff9090 0%, #c03030 40%, #701010 70%, #380808 100%)',
                glow:'rgba(255,80,80,0.45)',   ...makePlanetPos(7, 40),  dur:'12s', delay:'5s', shadow:'inset -3px -4px 7px rgba(0,0,0,0.45)' },
            ];
            // Asteroid — semua pakai % aman
            const asteroids = [
              { w:4, h:3, top:'62%', left:'24%', delay:'0s', dur:'10s' },
              { w:3, h:2, top:'28%', left:'82%', delay:'3s', dur:'7s'  },
              { w:5, h:3, top:ls?'55%':'72%', left:'55%', delay:'6s', dur:'12s' },
            ];
            // Bintang jatuh — semua % aman
            const shootings = [
              { top:'12%', left:'60%', w:ls?40:60,  delay:'5s',  dur:'4s' },
              { top:'25%', left:'20%', w:ls?30:45,  delay:'14s', dur:'3s' },
              { top:'8%',  left:'75%', w:ls?55:80,  delay:'28s', dur:'5s' },
            ];
            const clusters = [
              { top:'55%', left:'8%',  w:80,  h:60 },
              { top:'15%', left:'50%', w:100, h:70 },
              { top:ls?'50%':'70%', left:'88%', w:60, h:50 },
            ];
            // Nebula — skala ukuran di landscape
            const nebS = ls ? 0.65 : 1.0;
            return (
              <>
                <div className="stars"/><div className="starsB"/><div className="starsC"/>
                {clusters.map((c,i) => (
                  <div key={i} className="ss-cluster" style={{ top:c.top, left:c.left, width:c.w, height:c.h, animationDelay:`${i*5}s` }}/>
                ))}
                <div className="ss-nebula" style={{ width:Math.round(340*nebS), height:Math.round(240*nebS), left:'-2%', top:'3%',  background:'radial-gradient(ellipse, rgba(80,25,200,0.22) 0%, rgba(50,10,140,0.08) 55%, transparent 75%)', animationDelay:'0s' }}/>
                <div className="ss-nebula" style={{ width:Math.round(280*nebS), height:Math.round(190*nebS), right:'-1%', top:'35%', background:'radial-gradient(ellipse, rgba(200,25,85,0.18) 0%, rgba(140,10,55,0.07) 55%, transparent 75%)', animationDelay:'7s' }}/>
                <div className="ss-nebula" style={{ width:Math.round(240*nebS), height:Math.round(160*nebS), left:'32%', bottom:'3%', background:'radial-gradient(ellipse, rgba(25,90,200,0.16) 0%, rgba(10,55,140,0.06) 55%, transparent 75%)', animationDelay:'3s' }}/>
                <div className="ss-nebula" style={{ width:Math.round(200*nebS), height:Math.round(140*nebS), right:'20%', top:'8%', background:'radial-gradient(ellipse, rgba(0,180,180,0.12) 0%, transparent 70%)', animationDelay:'11s' }}/>
                <div className="ss-sun" style={{ width:sunS, height:sunS, left:sunX, top:sunY, transform:'translate(-50%,-50%)' }}/>
                {rings.map((r,i) => {
                  const hasPlanet = [2,3,4,5,7].includes(i);
                  return (
                    <div key={i} className="ss-ring" style={{
                      width:r*2, height:r*2, left:sunX, top:sunY,
                      animationDelay:`${i*2.5}s`,
                      opacity: hasPlanet ? Math.max(0.22, 0.60 - i*0.04) : Math.max(0.06, 0.25 - i*0.03),
                      borderWidth: hasPlanet ? '1.5px' : '1px',
                    }}/>
                  );
                })}
                {planets.map((p,i) => (
                  <div key={i} className="ss-planet" style={{
                    width:p.size, height:p.size,
                    background:p.bg,
                    boxShadow:`0 0 10px 4px ${p.glow}, ${p.shadow}`,
                    top:p.top, left:p.left,
                  }}/>
                ))}
                {asteroids.map((a,i) => (
                  <div key={i} className="ss-asteroid" style={{
                    width:a.w, height:a.h, top:a.top, left:a.left,
                    animationDuration:a.dur, animationDelay:a.delay,
                  }}/>
                ))}
                {shootings.map((s,i) => (
                  <div key={i} className="ss-shooting" style={{
                    top:s.top, left:s.left, width:s.w,
                    animationDuration:s.dur, animationDelay:s.delay,
                  }}/>
                ))}
              </>
            );
          }
          return <><div className="stars"/><div className="starsB"/><div className="starsC"/></>;
        };

        return (
          <>
            {overlays.map((g, i) => (
              <div key={i} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, background:g }}/>
            ))}
            <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
              <ThemeOverlay/>
            </div>
          </>
        );
      })()}

      {/* ══ HEADER */}
      {!fullscreen && <header style={{ position: 'sticky', top: 0, zIndex:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', minHeight: layoutMode === 'mobile-landscape' ? HEADER_H_LANDSCAPE : HEADER_H_NORMAL, padding: layoutMode === 'mobile-landscape' ? '5px 14px' : '9px 14px', boxSizing:'border-box', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.18)' }}>
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
        <div style={{ width: layoutMode === 'desktop-portrait' ? SIDEBAR_W_PORTRAIT : SIDEBAR_W_LANDSCAPE, flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.18)', display:'flex', flexDirection:'column', padding: layoutMode === 'desktop-portrait' ? '8px 6px 12px' : '10px 8px 16px', gap:3 }}>
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
                    : (getCover(track)
                        ? <img src={getCover(track)} style={{ width:30, height:30, borderRadius:7, objectFit:'cover', flexShrink:0 }} onError={e=>{ e.target.onerror=null; e.target.src='/icon-512.png'; }}/>
                        : <div style={{ width:30, height:30, borderRadius:7, background:track.bg||`${track.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Music size={13} color={track.color}/></div>
                      )
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

      <main style={{ flex:1, overflow:'hidden', position:'relative', display:'flex', flexDirection:'column' }}>



        {/* ── SETTINGS PANEL — menutup semua tab di desktop & landscape, hanya player di portrait */}
        {showSettings && (isDesktop || layoutMode === 'mobile-landscape' || tab === 'player') && (
          <Suspense fallback={<Spinner/>}><SettingsPanel key="settings-panel" onClose={()=>setShowSettings(false)} color={track?.color||"#6366f1"} sleepTimer={sleepTimer||null} startSleepTimer={startSleepTimer} cancelSleepTimer={cancelSleepTimer} globalCover={globalCover||""} setGlobalCover={setGlobalCover} isLite={!!isLite} toggleMode={toggleMode} pwaPrompt={pwaPrompt||null} pwaInstalled={!!pwaInstalled} installPwa={installPwa} customDns={customDns||""} setCustomDns={setCustomDns} lang={lang} toggleLang={toggleLang} t={t} userSpId={userSpId} setUserSpId={setUserSpId} userSpSecret={userSpSecret} setUserSpSecret={setUserSpSecret} userScId={userScId} setUserScId={setUserScId} userAiKey={userAiKey} setUserAiKey={setUserAiKey} userYtKey={userYtKey} setUserYtKey={setUserYtKey} userCfKey={userCfKey} setUserCfKey={setUserCfKey} userSnKey={userSnKey} setUserSnKey={setUserSnKey} setTab={setTab} setFullscreen={setFullscreen} googleUser={googleUser||null} handleGoogleLogin={handleGoogleLogin} syncPlaylistsToCloud={syncPlaylistsToCloud} accessToken={accessToken||null} plSyncStatus={plSyncStatus} plSyncError={plSyncError||null} plSyncedAt={plSyncedAt||null} bgTheme={bgTheme} setBgTheme={(v)=>{ setBgTheme(v); localStorage.setItem('sn_bg_theme', v); }}/></Suspense>
        )}

        {/* ─── PLAYER TAB */}
        {tab==='player'&&(
          <div className="scrollbar-hide" style={{ flex:1, height:'100%', overflowY:'hidden', position:'relative' }}>

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
                              src: radioUrl(station.url, customDns),
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
            const lsRing = Math.min(ringSize, window.innerHeight - (fullscreen ? 8 : 60));
            const lsColW = lsRing + 20;
            const activeTitle = embedTrack ? (embedTrack.title || track.title) : track.title;
            const activeArtist = embedTrack ? (embedTrack.artist || track.artist) : `${track.artist} — ${track.album}`;
            return (
            <div style={{ display:'flex', flexDirection:'row', height:'100%', width:'100%', overflow:'hidden', boxSizing:'border-box' }}>

              {/* ── LEFT col: clock pojok kiri atas + orbital centered ── */}
              <div style={{ width:lsColW, flexShrink:0, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
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
                  {userLocation && (
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.45)', fontWeight:600, marginTop:2, letterSpacing:'0.04em', display:'flex', alignItems:'center', gap:3, flexWrap:'wrap' }}>
                      {userWeather && <span style={{ display:'flex', alignItems:'center', gap:2, color:'rgba(255,255,255,0.6)' }}>{userWeather.emoji} {userWeather.temp}{userWeather.unit}</span>}
                      <span style={{ display:'flex', alignItems:'center', gap:2 }}><span style={{ fontSize:8 }}>📍</span>{userLocation}</span>
                    </div>
                  )}
                </div>
                <OrbitalRing size={lsRing}
                  pct={embedTrack?.type==='youtube'?(ytDuration>0?ytProgress/ytDuration:0):track.isRadio?0:pct}
                  color={embedTrack?.type==='youtube'?'#ff4444':track.color}
                  progress={embedTrack?.type==='youtube'?ytProgress:progress}
                  duration={embedTrack?.type==='youtube'?ytDuration:track.isRadio?0:duration}
                  isPlaying={playing}
                  cover={globalCover||((!globalCover&&embedTrack?.type==='youtube')?embedTrack.thumbnail:null)||getCover(track)}
                  title={activeTitle}
                  onSeek={embedTrack?.type==='youtube'?seekYt:track.isRadio?null:seekByPct}
                  isLite={isLite} isRadio={!embedTrack&&track.isRadio}
                  downloadProg={driveDownProg} drivePhase={drivePhase}
                  ytDownloading={embedTrack?.type==='youtube'&&ytDownloadingIds.has(embedTrack.videoId)}
                  ytDlProg={embedTrack?.type==='youtube'?(ytDownloadProg[embedTrack.videoId]||0):0}
                  coverSpin={coverSpin}/>
              </div>

              {/* ── RIGHT col: title (atas) → controls (tengah) → volume → actions (bawah) ── */}
              <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', justifyContent:'space-evenly', padding:'6px 14px 6px 6px', gap:0, overflow:'hidden' }}>

                {/* ── Judul & badge — atas, centered ── */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:6, minWidth:0, width:'100%' }}>
                  {/* Badge */}
                  {embedTrack?.type==='youtube' && <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, background:'rgba(255,0,0,0.12)', border:'1px solid rgba(255,0,0,0.25)', marginBottom:4 }}><span style={{ fontSize:9, fontWeight:800, color:'#ff6b6b', textTransform:'uppercase', letterSpacing:'0.1em' }}>▶ YouTube</span></div>}
                  {embedTrack?.type==='soundcloud' && <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, background:'rgba(255,85,0,0.12)', border:'1px solid rgba(255,85,0,0.3)', marginBottom:4 }}><span style={{ fontSize:9, fontWeight:800, color:'#ff5500', textTransform:'uppercase', letterSpacing:'0.1em' }}>🔊 SoundCloud</span></div>}
                  {!embedTrack && track.isRadio && <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.35)', marginBottom:4 }}>{streamBuffering ? <Loader2 size={9} style={{ animation:'spin 0.8s linear infinite', color:'#fbbf24' }}/> : <div style={{ width:5,height:5,borderRadius:'50%',background:'#f59e0b',animation:playing?'pulse 1.2s infinite':'none' }}/>}<span style={{ fontSize:9, fontWeight:800, color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.1em' }}>{streamBuffering ? 'BUFFERING…' : '● LIVE RADIO'}</span></div>}
                  <h2 style={{ margin:0, fontWeight:900, fontSize:'clamp(13px,2.8vw,17px)', letterSpacing:'-0.03em', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'center', width:'100%' }}>
                    {activeTitle}
                  </h2>
                  <p style={{ margin:'2px 0 0', fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'center', width:'100%' }}>
                    {activeArtist}
                  </p>
                </div>

                {/* ── Kontrol media — centered ── */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:7 }}>
                  {!track.isRadio && (
                    <button onClick={()=>{ if(embedTrack?.type==='youtube'){ setShuffle(s=>{ const next=!s; if(next) setRepeat('off'); else ytShufflePlayedRef.current=null; return next; }); } else { setShuffle(s=>{ const next=!s; if(next) setRepeat('off'); return next; }); } }} style={{ background:'none', border:'none', cursor:'pointer', color:shuffle?track.color:'rgba(255,255,255,0.3)', padding:4, position:'relative', flexShrink:0 }}>
                      <Shuffle size={16}/>
                      {shuffle && <div style={{ position:'absolute', bottom:1, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:track.color }}/>}
                    </button>
                  )}
                  <button onClick={()=>track.isRadio?goPrevRadio():embedTrack?.type==='youtube'?ytPrev():goPrev()} style={{ background:'none', border:'none', cursor:'pointer', color:'white', padding:4, flexShrink:0 }}><SkipBack size={20} fill="currentColor"/></button>
                  <button
                    onClick={()=>{ if(!track.src&&!embedTrack) return; if(embedTrack?.type==='soundcloud') return; setPlaying(p=>!p); }}
                    disabled={!track.src&&!embedTrack}
                    style={{ width:46, height:46, borderRadius:'50%', border:'none', background:'white', color:'#07071a', cursor:(!track.src&&!embedTrack)?'default':'pointer', opacity:(!track.src&&!embedTrack)?0.4:1, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:isLite?'0 2px 10px rgba(0,0,0,0.4)':`0 0 18px ${embedTrack?.type==='youtube'?'#ff444490':track.color+'90'},0 4px 14px rgba(0,0,0,0.4)` }}>
                    {playing?<Pause size={19} fill="currentColor"/>:<Play size={19} fill="currentColor" style={{ marginLeft:2 }}/>}
                  </button>
                  <button onClick={()=>track.isRadio?goNextRadio():embedTrack?.type==='youtube'?ytNext():goNext()} style={{ background:'none', border:'none', cursor:'pointer', color:'white', padding:4, flexShrink:0 }}><SkipForward size={20} fill="currentColor"/></button>
                  {!track.isRadio && (
                    <button onClick={cycleRepeat} style={{ background:'none', border:'none', cursor:'pointer', color:repeat!=='off'?track.color:'rgba(255,255,255,0.3)', padding:4, position:'relative', flexShrink:0 }}>
                      {repeat==='one'?<Repeat1 size={16}/>:<Repeat size={16}/>}
                      {repeat!=='off' && <div style={{ position:'absolute', bottom:1, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:track.color }}/>}
                    </button>
                  )}
                </div>

                {/* ── Volume bar — capped width ── */}
                <div style={{ display:'flex', alignItems:'center', gap:8, width:'min(100%, 200px)', alignSelf:'center', marginBottom:7 }}>
                  <button onClick={()=>setMuted(m=>!m)} style={{ background:'none', border:'none', cursor:'pointer', color:muted?'#ef4444':'rgba(255,255,255,0.38)', padding:0, flexShrink:0 }}>{muted?<VolumeX size={14}/>:<Volume2 size={14}/>}</button>
                  <input type="range" min="0" max="1" step="0.01" value={muted?0:volume} onChange={e=>{setVolume(+e.target.value);setMuted(false)}} style={{ flex:1, accentColor:embedTrack?.type==='youtube'?'#ff4444':track.color, height:3, cursor:'pointer' }}/>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontWeight:700, minWidth:28, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{muted?'0':Math.round(volume*100)}%</span>
                </div>

                {/* ── Action icons — bawah, centered ── */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:2 }}>
                  {embedTrack?.type==='youtube'
                    ? <button onClick={likeYtTrack} style={{ background:'none', border:'none', cursor:'pointer', color:liked[`yt_${embedTrack.videoId}`]?'#f472b6':'rgba(255,255,255,0.35)', padding:'4px 7px' }}><Heart size={16} fill={liked[`yt_${embedTrack.videoId}`]?'#f472b6':'none'}/></button>
                    : <button onClick={()=>toggleFav(track.id, track.isRadio?track:null)} style={{ background:'none', border:'none', cursor:'pointer', color:liked[track.id]?'#f472b6':'rgba(255,255,255,0.35)', padding:'4px 7px' }}><Heart size={16} fill={liked[track.id]?'#f472b6':'none'}/></button>
                  }
                  <button onClick={()=>{ setShowShareMenu(v=>!v); setShowQueue(false); }} style={{ background:'none', border:'none', cursor:'pointer', color:showShareMenu?track.color:'rgba(255,255,255,0.35)', padding:'4px 7px' }}><Share2 size={16}/></button>
                  <button onClick={()=>{ setShowQueue(q=>!q); setShowShareMenu(false); }} style={{ background:'none', border:'none', cursor:'pointer', color:showQueue?track.color:'rgba(255,255,255,0.35)', padding:'4px 7px' }}><ListMusic size={16}/></button>
                  <button onClick={()=>setShowSettings(v=>!v)} style={{ background:showSettings?'rgba(255,255,255,0.08)':'none', borderRadius:8, border:'none', cursor:'pointer', color:sleepTimer?track.color:(showSettings?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.35)'), padding:'4px 7px' }}><Settings size={16}/></button>
                  <button onClick={()=>{
                    setFullscreen(f=>!f);
                  }} style={{ background:'none', border:'none', cursor:'pointer', color:fullscreen?track.color:'rgba(255,255,255,0.35)', padding:'4px 7px' }}>{fullscreen?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
                  {embedTrack && <button onClick={()=>{ closeEmbed(); setShowSettings(false); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#fca5a5', padding:'4px 7px' }}><X size={16}/></button>}
                  {!embedTrack && track.isRadio && radioStation && <button onClick={()=>{ if(audioRef.current){audioRef.current.pause();audioRef.current.src='';} if(hlsRef.current){hlsRef.current.destroy();hlsRef.current=null;} if(radioReconnectRef.current){clearTimeout(radioReconnectRef.current);radioReconnectRef.current=null;} radioReconnectCount.current=0; setStreamBuffering(false); setPlaying(false); setRadioStation(null); setRadioPlaying(false); setTrack(SONGS[0]); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#fbbf24', padding:'4px 7px' }}><X size={16}/></button>}
                  {!embedTrack && !track.isRadio && track.isDrive && <button onClick={()=>{ if(audioRef.current){audioRef.current.pause();audioRef.current.src='';} setPlaying(false); setTrack(SONGS[0]); }} title="Exit Drive" style={{ background:'none', border:'none', cursor:'pointer', color:'#93c5fd', padding:'4px 7px' }}><X size={16}/></button>}
                </div>

              </div>
            </div>
            );
          })()}

          {/* ═══ PORTRAIT + DESKTOP layout ═══ */}
          {layoutMode !== 'mobile-landscape' && (
          <div style={{
            minHeight: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: fullscreen ? 'space-evenly' : (layoutMode === 'mobile-portrait' ? 'flex-start' : (layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait') ? 'center' : 'flex-start'),
            padding: fullscreen ? '8px 24px 10px' : layoutVars.playerPad,
            position: 'relative',
            boxSizing: 'border-box',
            overflow: 'hidden',
            gap: layoutMode === 'mobile-portrait' && !fullscreen ? 'clamp(4px, 1.2vh, 10px)' : 0,
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
                {userLocation && (
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', fontWeight:600, marginTop:3, letterSpacing:'0.04em', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    {userWeather && <span style={{ display:'flex', alignItems:'center', gap:3, color:'rgba(255,255,255,0.45)' }}>{userWeather.emoji} {userWeather.temp}{userWeather.unit}</span>}
                    <span style={{ display:'flex', alignItems:'center', gap:3 }}><span>📍</span>{userLocation}</span>
                  </div>
                )}
              </div>
            )}


            {/* floating action button moved to root level */}

            {/* ── Mobile: jam + lokasi/cuaca di atas ring, lalu ring tengah | Desktop: ring tengah saja */}
            {layoutMode === 'mobile-portrait' ? (
              <div style={{ width:'100%', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
                {/* Baris atas: jam kiri, lokasi/cuaca kanan */}
                <div style={{ width:'100%', display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingBottom:4, userSelect:'none' }}>
                  {/* Jam — kiri */}
                  <div>
                    <div style={{ display:'inline-block', fontSize:17, fontWeight:900, fontFamily:'monospace', letterSpacing:'-0.04em', lineHeight:1, background:`linear-gradient(120deg,#ffffff 60%,${track.color})`, WebkitBackgroundClip:'text', backgroundClip:'text', WebkitTextFillColor:'transparent', color:'transparent' }}>
                      {nowTime.toLocaleTimeString('id-ID',{ hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })}
                    </div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:600, marginTop:2, letterSpacing:'0.04em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
                      {nowTime.toLocaleDateString('id-ID',{ weekday:'short', day:'numeric', month:'short' })}
                    </div>
                  </div>
                  {/* Lokasi + cuaca — kanan */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
                    {userWeather && (
                      <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.7)' }}>
                        {userWeather.emoji} {userWeather.temp}{userWeather.unit}
                      </span>
                    )}
                    {userLocation ? (
                      <span style={{ display:'flex', alignItems:'center', gap:2, fontSize:9.5, fontWeight:600, color:'rgba(255,255,255,0.5)', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        <span>📍</span><span>{userLocation}</span>
                      </span>
                    ) : (
                      <span style={{ fontSize:9, color:'rgba(255,255,255,0.2)', fontWeight:500 }}>📍 —</span>
                    )}
                  </div>
                </div>
                {/* Ring */}
                <div style={{ position:'relative', display:'flex', justifyContent:'center', alignItems:'center' }}>

                <OrbitalRing size={ringSize} pct={embedTrack?.type==='youtube'?(ytDuration>0?ytProgress/ytDuration:0):track.isRadio?0:pct} color={embedTrack?.type==='youtube'?'#ff4444':track.color} progress={embedTrack?.type==='youtube'?ytProgress:progress} duration={embedTrack?.type==='youtube'?ytDuration:track.isRadio?0:duration} isPlaying={playing} cover={globalCover||((!globalCover&&embedTrack?.type==='youtube')?embedTrack.thumbnail:null)||getCover(track)} title={embedTrack?.type==='youtube'?embedTrack.title:track.title} onSeek={embedTrack?.type==='youtube'?seekYt:track.isRadio?null:seekByPct} isLite={isLite} isRadio={!embedTrack&&track.isRadio} downloadProg={driveDownProg} drivePhase={drivePhase} ytDownloading={embedTrack?.type==='youtube'&&ytDownloadingIds.has(embedTrack.videoId)} ytDlProg={embedTrack?.type==='youtube'?(ytDownloadProg[embedTrack.videoId]||0):0} coverSpin={coverSpin}/>
                </div>
              </div>
            ) : (
              <OrbitalRing size={ringSize} pct={embedTrack?.type==='youtube'?(ytDuration>0?ytProgress/ytDuration:0):track.isRadio?0:pct} color={embedTrack?.type==='youtube'?'#ff4444':track.color} progress={embedTrack?.type==='youtube'?ytProgress:progress} duration={embedTrack?.type==='youtube'?ytDuration:track.isRadio?0:duration} isPlaying={playing} cover={globalCover||((!globalCover&&embedTrack?.type==='youtube')?embedTrack.thumbnail:null)||getCover(track)} title={embedTrack?.type==='youtube'?embedTrack.title:track.title} onSeek={embedTrack?.type==='youtube'?seekYt:track.isRadio?null:seekByPct} isLite={isLite} isRadio={!embedTrack&&track.isRadio} downloadProg={driveDownProg} drivePhase={drivePhase} ytDownloading={embedTrack?.type==='youtube'&&ytDownloadingIds.has(embedTrack.videoId)} ytDlProg={embedTrack?.type==='youtube'?(ytDownloadProg[embedTrack.videoId]||0):0} coverSpin={coverSpin}/>
            )}

            {/* Track info */}
            <div style={{
              textAlign: 'center',
              marginTop: (fullscreen && (layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait')) ? layoutVars.infoMt : fullscreen ? 0 : layoutMode === 'mobile-landscape' ? 0 : layoutMode === 'mobile-portrait' ? 0 : layoutVars.infoMt,
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
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:layoutVars.controlsGap, marginTop: layoutMode === 'mobile-portrait' && !fullscreen ? 0 : (fullscreen && (layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait')) ? layoutVars.controlsMt : fullscreen ? 0 : layoutVars.controlsMt, width:'100%', maxWidth: fullscreen ? '100%' : layoutMode === 'mobile-landscape' ? undefined : 340 }}>
              {!track.isRadio && <button onClick={()=>{ if(embedTrack?.type==='youtube'){ setShuffle(s=>{ const next=!s; if(next) setRepeat('off'); else ytShufflePlayedRef.current=null; return next; }); } else if(track._wsSource && wsQueueRef.current.length > 0){ setShuffle(s=>{ const next=!s; if(next){ setRepeat('off'); wsShuffle(); } return next; }); } else { setShuffle(s=>{ const next=!s; if(next) setRepeat("off"); return next; }); } }} style={{ ...btn, color:shuffle?(embedTrack?.type==='youtube'?'#ff4444':track.color):'rgba(255,255,255,0.3)', position:'relative', padding:'clamp(5px,1.2vw,8px)' }}>
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
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop: layoutMode === 'mobile-portrait' && !fullscreen ? 0 : (fullscreen && (layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait')) ? layoutVars.volumeMt : fullscreen ? 0 : layoutVars.volumeMt, width:'100%', maxWidth: fullscreen ? '100%' : layoutMode === 'mobile-landscape' ? '100%' : 340, padding:'4px 2px' }}>
              <button onClick={()=>setMuted(m=>!m)} style={{ ...btn, color:muted?'#ef4444':'rgba(255,255,255,0.38)', padding:4, flexShrink:0 }}>{muted?<VolumeX size={16}/>:<Volume2 size={16}/>}</button>
              <input type="range" min="0" max="1" step="0.01" value={muted?0:volume} onChange={e=>{setVolume(+e.target.value);setMuted(false)}} style={{ flex:1, accentColor:embedTrack?.type==='youtube'?'#ff4444':track.color, height:3, cursor:'pointer' }}/>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontWeight:700, minWidth:28, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{muted?'0':Math.round(volume*100)}%</span>
            </div>

            {/* ── Action buttons row */}
            <div style={{ display:'flex', alignItems:'center', flexWrap: layoutMode === 'mobile-portrait' ? 'wrap' : 'nowrap', gap:4, marginTop: layoutMode === 'mobile-portrait' && !fullscreen ? 0 : (fullscreen && (layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait')) ? layoutVars.volumeMt : fullscreen ? 0 : layoutVars.volumeMt, marginBottom: layoutMode === 'mobile-portrait' && !fullscreen ? 4 : 0, width:'100%', maxWidth: (fullscreen || layoutMode === 'mobile-landscape') ? '100%' : 340, justifyContent:'center' }}>
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
              <button onClick={()=>{
                setFullscreen(f=>!f);
              }} title={fullscreen?(t?.exitFullscreenBtn||'Exit Fullscreen'):(t?.fullscreenBtn||'Fullscreen')} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:fullscreen?(embedTrack?.type==='youtube'?'#ff6b6b':track.color):'rgba(255,255,255,0.35)' }}>
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
              {/* Tutup drive — hanya muncul saat lagu Drive sedang aktif */}
              {!embedTrack && !track.isRadio && track.isDrive && (
                <button onClick={()=>{ if(audioRef.current){audioRef.current.pause();audioRef.current.src='';} setPlaying(false); setTrack(SONGS[0]); setShowSettings(false); }} title={t?.closeDriveBtn||"Exit Drive"} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:'#93c5fd' }}>
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
                const _platforms = getStreamingPlatformsSync();
                const searchPlatforms = _platforms.filter(p => ['ytmusic','websearch'].includes(p.id));
                const activePlat = searchPlatforms.find(p => p.id === unifiedPlatform) || searchPlatforms[0] || { id:'ytmusic', color:'#ff0000', name:'YouTube Music', hint:'Cari lagu, artis…' };
                const handleUnifiedSearch = () => {
                  if (!unifiedQuery.trim()) return;
                  if (unifiedPlatform === 'ytmusic') {
                    setYtQuery(p => ({...p, ytmusic: unifiedQuery}));
                    searchYouTube('ytmusic', unifiedQuery, ytSearchMode);
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
                    {/* Search input — selalu tampil */}
                    <div style={{ display:'flex', gap:6 }}>
                      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.35)', borderRadius:999, padding:'7px 13px', border:`1.5px solid ${activePlat.color}35` }}>
                        <Search size={12} style={{ color:activePlat.color, flexShrink:0 }}/>
                        <input type="text" placeholder={activePlat.hint || 'Cari lagu, artis…'}
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
                  {getStreamingPlatformsSync().map(platform => {
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
                                {/* ── Tombol tutup hasil ── */}
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
                                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:600 }}>{results.length} hasil</span>
                                  <button onClick={() => { setYtResults(p=>({...p,[platform.id]:[]})); setYtQuery(p=>({...p,[platform.id]:''})); setUnifiedQuery(''); }}
                                    style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:999, color:'rgba(255,255,255,0.45)', fontSize:10, fontWeight:700, padding:'2px 9px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, lineHeight:1.4 }}>
                                    ✕ Tutup
                                  </button>
                                </div>
                                {/* ── Channel results ── */}
                                {results[0]?.resultType === 'channel' && results.map((v, vi) => (
                                  <a key={v.channelId || vi} href={v.channelUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', textDecoration:'none', cursor:'pointer' }}
                                    onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,68,68,0.08)'; e.currentTarget.style.borderColor='rgba(255,68,68,0.3)'; }}
                                    onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}>
                                    <div style={{ width:38, height:38, borderRadius:999, background:'rgba(255,68,68,0.15)', flexShrink:0, overflow:'hidden' }}>
                                      {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }}/>}
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.9)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.title}</div>
                                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1, display:'flex', alignItems:'center', gap:4 }}>
                                        <span>👤 Channel</span>
                                        {v.subscriberCount > 0 && <span>· {v.subscriberCount >= 1000000 ? (v.subscriberCount/1000000).toFixed(1)+'M' : v.subscriberCount >= 1000 ? (v.subscriberCount/1000).toFixed(0)+'K' : v.subscriberCount} subs</span>}
                                      </div>
                                    </div>
                                    <div style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:999, background:'rgba(255,68,68,0.15)', color:'#ff6b6b', flexShrink:0 }}>BUKA ↗</div>
                                  </a>
                                ))}
                                {/* ── Playlist results ── */}
                                {results[0]?.resultType === 'playlist' && results.map((v, vi) => (
                                  <a key={v.playlistId || vi} href={v.playlistUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', textDecoration:'none', cursor:'pointer' }}
                                    onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,68,68,0.08)'; e.currentTarget.style.borderColor='rgba(255,68,68,0.3)'; }}
                                    onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}>
                                    <div style={{ width:38, height:38, borderRadius:8, background:'rgba(255,68,68,0.15)', flexShrink:0, overflow:'hidden', position:'relative' }}>
                                      {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }}/>}
                                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.3)' }}>
                                        <span style={{ fontSize:14 }}>📂</span>
                                      </div>
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.9)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.title}</div>
                                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1, display:'flex', alignItems:'center', gap:4 }}>
                                        <span>{v.uploaderName || 'YouTube'}</span>
                                        {v.videoCount > 0 && <span>· {v.videoCount} video</span>}
                                      </div>
                                    </div>
                                    <div style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:999, background:'rgba(255,68,68,0.15)', color:'#ff6b6b', flexShrink:0 }}>BUKA ↗</div>
                                  </a>
                                ))}
                                {/* ── Video results (default) ── */}
                                {!results[0]?.resultType && results.map((v, vi) => {
                                  const secs = v.duration || v.lengthSeconds || 0;
                                  const dur  = secs > 0 ? `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}` : '';
                                  const ch   = v.uploaderName || v.author || v.channel || 'YouTube';
                                  const thumb = v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`;
                                  const isCurrentYt = embedTrack?.type === 'youtube' && embedTrack.videoId === v.videoId;
                                  // Deteksi Shorts / live yang lolos filter (durasi < 62s = Shorts)
                                  const isShort = secs > 0 && secs < 62;
                                  const isLiveVideo = v.isLive || v.liveNow || false;
                                  return (
                                    <div key={v.videoId || vi}
                                      style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background: isCurrentYt ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.04)', border: isCurrentYt ? '1px solid rgba(255,68,68,0.35)' : '1px solid rgba(255,255,255,0.08)' }}
                                      onMouseEnter={e=>{ if(!isCurrentYt) e.currentTarget.style.background='rgba(255,0,0,0.08)'; }}
                                      onMouseLeave={e=>{ if(!isCurrentYt) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}>
                                      <div onClick={() => { if(isCurrentYt) setPlaying(p=>!p); else playYouTube(v, results, vi); }}
                                        style={{ width:38, height:38, borderRadius:8, background:`${platform.color}20`, flexShrink:0, cursor:'pointer', overflow:'hidden', position:'relative' }}>
                                        {!isLite && <img src={thumb} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }}/>}
                                        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background: isCurrentYt ? 'rgba(0,0,0,0.45)' : isLite ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.18)', borderRadius:8 }}>
                                          {isCurrentYt && playing
                                            ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12 }}>{[8,5,7].map((h,i)=>(<div key={i} style={{ width:2.5, height:h, background:'#ff4444', borderRadius:1, animation:`bounce 1.4s ease-in-out ${i*0.25}s infinite` }}/>))}</div>
                                            : <Play size={13} style={{ color: isCurrentYt ? '#ff6b6b' : platform.color, marginLeft:2 }}/>}
                                        </div>
                                      </div>
                                      <div onClick={() => playYouTube(v, results, vi)} style={{ flex:1, minWidth:0, cursor:'pointer' }}>
                                        <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: isCurrentYt ? '#ff6b6b' : 'rgba(255,255,255,0.9)' }}>{v.title}</div>
                                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1, display:'flex', alignItems:'center', gap:4 }}>
                                          <span>{ch}{dur ? ` · ${dur}` : ''}</span>
                                          {isLiveVideo && <span style={{ fontSize:9, fontWeight:700, padding:'1px 4px', borderRadius:4, background:'rgba(255,50,50,0.25)', color:'#ff6b6b' }}>● LIVE</span>}
                                          {isShort && <span style={{ fontSize:9, fontWeight:700, padding:'1px 4px', borderRadius:4, background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)' }}>SHORT</span>}
                                        </div>
                                      </div>
                                      <button
                                        onClick={e => { e.stopPropagation(); e.preventDefault(); window.open(`https://www.youtube.com/watch?v=${v.videoId}`, '_blank', 'noopener,noreferrer'); }}
                                        title="Buka di YouTube"
                                        style={{ background:'none', border:`1px solid ${platform.color}40`, borderRadius:6, color:platform.color, fontSize:10, fontWeight:700, padding:'3px 7px', cursor:'pointer', flexShrink:0, lineHeight:1.2, display:'inline-flex', alignItems:'center' }}>↗</button>
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
                                💡 <b style={{color:'rgba(255,255,255,0.5)'}}>Jamendo · Audius · ccMixter</b> play in-app (queue). <b style={{color:'rgba(255,255,255,0.5)'}}>Deezer</b> 30s preview. Paste URL: <b style={{color:'rgba(255,255,255,0.5)'}}>Vimeo · Audiomack · Mixcloud · Odysee · Dailymotion · archive.org</b> · <b style={{color:'#1877f2'}}>Facebook</b> · <b style={{color:'#e1306c'}}>Instagram</b> · <b style={{color:'#69c9d0'}}>TikTok</b> · <b style={{color:'#1d9bf0'}}>Twitter/X</b> · <b style={{color:'rgba(255,255,255,0.8)'}}>Threads</b> · <b style={{color:'#fb7299'}}>Bilibili</b> · <b style={{color:'#00a8e8'}}>Vidio</b>
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
                                  {/* ── Tombol tutup hasil ── */}
                                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
                                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:600 }}>{wsResults.length} sumber</span>
                                    <button onClick={() => { setWsResults([]); setWsQuery(''); setUnifiedQuery(''); }}
                                      style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:999, color:'rgba(255,255,255,0.45)', fontSize:10, fontWeight:700, padding:'2px 9px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, lineHeight:1.4 }}>
                                      ✕ Tutup
                                    </button>
                                  </div>
                                  {[...wsResults].sort((a, b) => {
                                    // Embed-only cards (no native audio) selalu di bawah
                                    const EMBED_TYPES = new Set(['facebook','instagram','tiktok','twitter','threads','bilibili','vidio','vimeo','dailymotion','archive','audiomack','mixcloud','odysee','rumble','peertube','newgrounds','fma','sc_embed','sp_embed','sc_redirect']);
                                    const aEmbed = EMBED_TYPES.has(a.type) || EMBED_TYPES.has(a.source);
                                    const bEmbed = EMBED_TYPES.has(b.type) || EMBED_TYPES.has(b.source);
                                    if (aEmbed === bEmbed) return 0;
                                    return aEmbed ? 1 : -1;
                                  }).map((item, idx) => {
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
                                    // ── Facebook embed card
                                    if (item.type === 'facebook') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          <span style={{ fontSize:14 }}>🟦</span>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#1877f2' }}>Facebook</span>
                                          <span style={{ fontSize:9, color:'rgba(24,119,242,0.5)', marginLeft:2 }}>· Video Embed</span>
                                        </div>
                                        {item.embedUrl ? (
                                          <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(24,119,242,0.3)', background:'rgba(24,119,242,0.04)' }}>
                                            <iframe key={`fb-embed-${item.embedUrl}`} src={item.embedUrl}
                                              width="100%" height="280" frameBorder="0"
                                              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                              allowFullScreen style={{ display:'block' }}
                                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                                            />
                                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 8px', background:'rgba(0,0,0,0.3)', gap:6 }}>
                                              <button onClick={e=>{e.stopPropagation();extractViaCobalt(item.externalUrl,item);}}
                                                disabled={cobaltStatus(item.externalUrl)==='loading'}
                                                style={{ fontSize:10, color: cobaltStatus(item.externalUrl)==='error'?'#f87171':cobaltStatus(item.externalUrl)==='loading'?'rgba(255,255,255,0.4)':'#a78bfa', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:5, padding:'2px 8px', cursor:'pointer', fontWeight:700, flexShrink:0 }}>
                                                {cobaltStatus(item.externalUrl)==='loading'?'⏳…':cobaltStatus(item.externalUrl)==='error'?'✗ gagal':'→ Player'}
                                              </button>
                                              <button onClick={()=>window.open(item.externalUrl,'_blank','noopener,noreferrer')}
                                                style={{ fontSize:10, color:'#1877f2', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Buka di Facebook ↗</button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:10, background:'rgba(24,119,242,0.08)', border:'1px solid rgba(24,119,242,0.25)', cursor:'pointer' }}
                                            onClick={()=>window.open(item.externalUrl,'_blank','noopener,noreferrer')}>
                                            <span style={{ fontSize:20 }}>🟦</span>
                                            <div style={{ flex:1, minWidth:0 }}>
                                              <div style={{ fontSize:11, fontWeight:700, color:'#1877f2' }}>Facebook Video</div>
                                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)' }}>Klik untuk buka di Facebook</div>
                                            </div>
                                            <span style={{ padding:'5px 12px', borderRadius:999, background:'#1877f2', color:'white', fontSize:11, fontWeight:800, flexShrink:0 }}>Buka ↗</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                    // ── Instagram embed card
                                    if (item.type === 'instagram') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          <span style={{ fontSize:14 }}>📸</span>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#e1306c' }}>Instagram</span>
                                          <span style={{ fontSize:9, color:'rgba(225,48,108,0.5)', marginLeft:2 }}>· Post/Reel Embed</span>
                                        </div>
                                        <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(225,48,108,0.3)', background:'rgba(225,48,108,0.04)' }}>
                                          <iframe key={`ig-embed-${item.embedUrl}`} src={item.embedUrl}
                                            width="100%" height="480" frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                            allowFullScreen style={{ display:'block' }}
                                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                                          />
                                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 8px', background:'rgba(0,0,0,0.3)', gap:6 }}>
                                            <button onClick={e=>{e.stopPropagation();extractViaCobalt(item.externalUrl,item);}}
                                              disabled={cobaltStatus(item.externalUrl)==='loading'}
                                              style={{ fontSize:10, color: cobaltStatus(item.externalUrl)==='error'?'#f87171':cobaltStatus(item.externalUrl)==='loading'?'rgba(255,255,255,0.4)':'#a78bfa', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:5, padding:'2px 8px', cursor:'pointer', fontWeight:700, flexShrink:0 }}>
                                              {cobaltStatus(item.externalUrl)==='loading'?'⏳…':cobaltStatus(item.externalUrl)==='error'?'✗ gagal':'→ Player'}
                                            </button>
                                            <button onClick={()=>window.open(item.externalUrl,'_blank','noopener,noreferrer')}
                                              style={{ fontSize:10, color:'#e1306c', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Buka di Instagram ↗</button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                    // ── TikTok embed card
                                    if (item.type === 'tiktok') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          <span style={{ fontSize:14 }}>🎵</span>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#010101' , background:'white', borderRadius:4, padding:'0 4px' }}>TikTok</span>
                                          <span style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginLeft:2 }}>· Video Embed</span>
                                        </div>
                                        {item.embedUrl ? (
                                          <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.2)', background:'rgba(0,0,0,0.3)' }}>
                                            <iframe key={`tt-embed-${item.embedUrl}`} src={item.embedUrl}
                                              width="100%" height="560" frameBorder="0"
                                              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                              allowFullScreen style={{ display:'block' }}
                                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                                            />
                                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 8px', background:'rgba(0,0,0,0.3)', gap:6 }}>
                                              <button onClick={e=>{e.stopPropagation();extractViaCobalt(item.externalUrl,item);}}
                                                disabled={cobaltStatus(item.externalUrl)==='loading'}
                                                style={{ fontSize:10, color: cobaltStatus(item.externalUrl)==='error'?'#f87171':cobaltStatus(item.externalUrl)==='loading'?'rgba(255,255,255,0.4)':'#a78bfa', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:5, padding:'2px 8px', cursor:'pointer', fontWeight:700, flexShrink:0 }}>
                                                {cobaltStatus(item.externalUrl)==='loading'?'⏳…':cobaltStatus(item.externalUrl)==='error'?'✗ gagal':'→ Player'}
                                              </button>
                                              <button onClick={()=>window.open(item.externalUrl,'_blank','noopener,noreferrer')}
                                                style={{ fontSize:10, color:'#69c9d0', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Buka di TikTok ↗</button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:10, background:'rgba(105,201,208,0.08)', border:'1px solid rgba(105,201,208,0.25)', cursor:'pointer' }}
                                            onClick={()=>window.open(item.externalUrl,'_blank','noopener,noreferrer')}>
                                            <span style={{ fontSize:20 }}>🎵</span>
                                            <div style={{ flex:1, minWidth:0 }}>
                                              <div style={{ fontSize:11, fontWeight:700, color:'#69c9d0' }}>TikTok Video</div>
                                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)' }}>Klik untuk buka di TikTok</div>
                                            </div>
                                            <span style={{ padding:'5px 12px', borderRadius:999, background:'#69c9d0', color:'black', fontSize:11, fontWeight:800, flexShrink:0 }}>Buka ↗</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                    // ── Twitter/X embed card
                                    if (item.type === 'twitter') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          <span style={{ fontSize:14 }}>🐦</span>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#1d9bf0' }}>Twitter / X</span>
                                          <span style={{ fontSize:9, color:'rgba(29,155,240,0.5)', marginLeft:2 }}>· Tweet Embed</span>
                                        </div>
                                        <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(29,155,240,0.3)', background:'rgba(29,155,240,0.04)' }}>
                                          <iframe key={`tw-embed-${item.embedUrl}`} src={item.embedUrl}
                                            width="100%" height="320" frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                            allowFullScreen style={{ display:'block' }}
                                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                                          />
                                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 8px', background:'rgba(0,0,0,0.3)', gap:6 }}>
                                            <button onClick={e=>{e.stopPropagation();extractViaCobalt(item.externalUrl,item);}}
                                              disabled={cobaltStatus(item.externalUrl)==='loading'}
                                              style={{ fontSize:10, color: cobaltStatus(item.externalUrl)==='error'?'#f87171':cobaltStatus(item.externalUrl)==='loading'?'rgba(255,255,255,0.4)':'#a78bfa', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:5, padding:'2px 8px', cursor:'pointer', fontWeight:700, flexShrink:0 }}>
                                              {cobaltStatus(item.externalUrl)==='loading'?'⏳…':cobaltStatus(item.externalUrl)==='error'?'✗ gagal':'→ Player'}
                                            </button>
                                            <button onClick={()=>window.open(item.externalUrl,'_blank','noopener,noreferrer')}
                                              style={{ fontSize:10, color:'#1d9bf0', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Buka di Twitter/X ↗</button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                    // ── Threads embed card
                                    if (item.type === 'threads') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          <span style={{ fontSize:14 }}>🧵</span>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#ffffff' }}>Threads</span>
                                          <span style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginLeft:2 }}>· Post Embed</span>
                                        </div>
                                        <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.04)' }}>
                                          <iframe key={`threads-embed-${item.embedUrl}`} src={item.embedUrl}
                                            width="100%" height="380" frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                            allowFullScreen style={{ display:'block' }}
                                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                                          />
                                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 8px', background:'rgba(0,0,0,0.3)', gap:6 }}>
                                            <button onClick={e=>{e.stopPropagation();extractViaCobalt(item.externalUrl,item);}}
                                              disabled={cobaltStatus(item.externalUrl)==='loading'}
                                              style={{ fontSize:10, color: cobaltStatus(item.externalUrl)==='error'?'#f87171':cobaltStatus(item.externalUrl)==='loading'?'rgba(255,255,255,0.4)':'#a78bfa', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:5, padding:'2px 8px', cursor:'pointer', fontWeight:700, flexShrink:0 }}>
                                              {cobaltStatus(item.externalUrl)==='loading'?'⏳…':cobaltStatus(item.externalUrl)==='error'?'✗ gagal':'→ Player'}
                                            </button>
                                            <button onClick={()=>window.open(item.externalUrl,'_blank','noopener,noreferrer')}
                                              style={{ fontSize:10, color:'rgba(255,255,255,0.7)', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Buka di Threads ↗</button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                    // ── Bilibili embed card
                                    if (item.type === 'bilibili') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          <span style={{ fontSize:14 }}>📺</span>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#fb7299' }}>Bilibili</span>
                                          <span style={{ fontSize:9, color:'rgba(251,114,153,0.5)', marginLeft:2 }}>· Video Embed</span>
                                        </div>
                                        <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(251,114,153,0.3)', background:'rgba(251,114,153,0.04)' }}>
                                          <iframe key={`bili-embed-${item.embedUrl}`} src={item.embedUrl}
                                            width="100%" height="280" frameBorder="0"
                                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                            allowFullScreen scrolling="no" style={{ display:'block' }}
                                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                                          />
                                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 8px', background:'rgba(0,0,0,0.3)', gap:6 }}>
                                            <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>⚠️ Mungkin perlu login Bilibili</span>
                                            <div style={{ display:'flex', gap:5 }}>
                                              <button onClick={e=>{e.stopPropagation();extractViaCobalt(item.externalUrl,item);}}
                                                disabled={cobaltStatus(item.externalUrl)==='loading'}
                                                style={{ fontSize:10, color: cobaltStatus(item.externalUrl)==='error'?'#f87171':cobaltStatus(item.externalUrl)==='loading'?'rgba(255,255,255,0.4)':'#a78bfa', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:5, padding:'2px 8px', cursor:'pointer', fontWeight:700 }}>
                                                {cobaltStatus(item.externalUrl)==='loading'?'⏳…':cobaltStatus(item.externalUrl)==='error'?'✗ gagal':'→ Player'}
                                              </button>
                                              <button onClick={()=>window.open(item.externalUrl,'_blank','noopener,noreferrer')}
                                                style={{ fontSize:10, color:'#fb7299', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Buka di Bilibili ↗</button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                    // ── Vidio.com embed card
                                    if (item.type === 'vidio') return (
                                      <div key={idx} style={{ marginBottom:8 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, paddingLeft:2 }}>
                                          <span style={{ fontSize:14 }}>🎬</span>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#00a8e8' }}>Vidio</span>
                                          <span style={{ fontSize:9, color:'rgba(0,168,232,0.5)', marginLeft:2 }}>· Video Embed</span>
                                        </div>
                                        {item.embedUrl ? (
                                          <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(0,168,232,0.3)', background:'rgba(0,168,232,0.04)' }}>
                                            <iframe key={`vidio-embed-${item.embedUrl}`} src={item.embedUrl}
                                              width="100%" height="280" frameBorder="0"
                                              allow="autoplay; encrypted-media; picture-in-picture"
                                              allowFullScreen style={{ display:'block' }}
                                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                                            />
                                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 8px', background:'rgba(0,0,0,0.3)', gap:6 }}>
                                              <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>⚠️ Mungkin perlu login Vidio</span>
                                              <div style={{ display:'flex', gap:5 }}>
                                                <button onClick={e=>{e.stopPropagation();extractViaCobalt(item.externalUrl,item);}}
                                                  disabled={cobaltStatus(item.externalUrl)==='loading'}
                                                  style={{ fontSize:10, color: cobaltStatus(item.externalUrl)==='error'?'#f87171':cobaltStatus(item.externalUrl)==='loading'?'rgba(255,255,255,0.4)':'#a78bfa', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:5, padding:'2px 8px', cursor:'pointer', fontWeight:700 }}>
                                                  {cobaltStatus(item.externalUrl)==='loading'?'⏳…':cobaltStatus(item.externalUrl)==='error'?'✗ gagal':'→ Player'}
                                                </button>
                                                <button onClick={()=>window.open(item.externalUrl,'_blank','noopener,noreferrer')}
                                                  style={{ fontSize:10, color:'#00a8e8', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Buka di Vidio ↗</button>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:10, background:'rgba(0,168,232,0.08)', border:'1px solid rgba(0,168,232,0.25)', cursor:'pointer' }}
                                            onClick={()=>window.open(item.externalUrl,'_blank','noopener,noreferrer')}>
                                            <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#0077cc,#00a8e8)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                              <span style={{ fontSize:18 }}>🎬</span>
                                            </div>
                                            <div style={{ flex:1, minWidth:0 }}>
                                              <div style={{ fontSize:11, fontWeight:700, color:'#38bdf8' }}>{item.title}</div>
                                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:2 }}>Klik untuk buka di Vidio</div>
                                            </div>
                                            <span style={{ padding:'5px 12px', borderRadius:999, background:'#00a8e8', color:'white', fontSize:11, fontWeight:800, flexShrink:0 }}>Buka ↗</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                    const BADGES = {
                                      vimeo:      { label:'Vimeo',    color:'#1ab7ea' },
                                      dailymotion:{ label:'DM',       color:'#0066DC' },
                                      archive:    { label:'Archive',  color:'#8b5cf6' },
                                      audiomack:  { label:'Audiomack',color:'#ffcc00' },
                                      mixcloud:   { label:'Mixcloud', color:'#52aad8' },
                                      odysee:     { label:'Odysee',   color:'#ef5b5b' },
                                      rumble:     { label:'Rumble',   color:'#85c742' },
                                      peertube:   { label:'PeerTube', color:'#f2690d' },
                                      newgrounds: { label:'NG',       color:'#ff6600' },
                                    };
                                    const srcBadge = BADGES[item.source] || { label:'Web', color:'#6366f1' };
                                    const isEmbeddable = ['archive','vimeo','dailymotion','audiomack','mixcloud','odysee','rumble','peertube','newgrounds'].includes(item.source);
                                    const isExternal = false;
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
                                        <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                                          <button onClick={e=>{e.stopPropagation(); const url=item.externalUrl||item.embedUrl; if(url)extractViaCobalt(url,item);}}
                                            disabled={cobaltStatus(item.externalUrl||item.embedUrl)==='loading'}
                                            style={{ fontSize:9, color: cobaltStatus(item.externalUrl||item.embedUrl)==='error'?'#f87171':cobaltStatus(item.externalUrl||item.embedUrl)==='loading'?'rgba(255,255,255,0.4)':'#a78bfa', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:5, padding:'2px 6px', cursor:'pointer', fontWeight:700, lineHeight:1.4 }}>
                                            {cobaltStatus(item.externalUrl||item.embedUrl)==='loading'?'⏳':cobaltStatus(item.externalUrl||item.embedUrl)==='error'?'✗':'→ Player'}
                                          </button>
                                          <div style={{ width:28, height:28, borderRadius:'50%', background:`${platform.color}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                            <span style={{ fontSize:10, color:platform.color }}>{isExternal ? '↗' : wsEmbedUrl === item.embedUrl ? '▼' : '▶'}</span>
                                          </div>
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
                                  No results yet — search a song/artist name, or paste a URL from Vimeo, Audiomack, Mixcloud, Odysee, Rumble, PeerTube, Dailymotion, archive.org, Facebook, Instagram, TikTok, Twitter/X, Threads, Bilibili, Vidio… ↑
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
                              src: radioUrl(station.url, customDns),
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
                                  {/* Pills — satu baris scroll horizontal */}
                                  <div className="scrollbar-hide" style={{ display:'flex', gap:5, overflowX:'auto', marginBottom:10, paddingBottom:2 }}>
                                    {[
                                      { label:'🔥 Top',        act: () => { setRbSelectedTag(null); setRbQuery(''); rbSearch('',null); multiSearch('',null); }, isActive: rbSelectedTag===null&&!rbQuery, color:'#f59e0b' },
                                      { label:'⚡ Electronic', act: () => { setRbSelectedTag('electronic'); setRbQuery(''); rbSearch('','electronic'); multiSearch('','electronic'); }, isActive: rbSelectedTag==='electronic', color:'#06b6d4' },
                                      { label:'🎤 Hip-Hop',    act: () => { setRbSelectedTag('hip-hop'); setRbQuery(''); rbSearch('','hip-hop'); multiSearch('','hip-hop'); }, isActive: rbSelectedTag==='hip-hop', color:'#f59e0b' },
                                      { label:'🎧 Lounge',     act: () => { setRbSelectedTag('lounge'); setRbQuery(''); rbSearch('','lounge'); multiSearch('','lounge'); }, isActive: rbSelectedTag==='lounge', color:'#ec4899' },
                                      { label:'🏡 Ambient',    act: () => { setRbSelectedTag('ambient'); setRbQuery(''); rbSearch('','ambient'); multiSearch('','ambient'); }, isActive: rbSelectedTag==='ambient', color:'#8b5cf6' },
                                      { label:'🎷 Jazz',       act: () => { setRbSelectedTag('jazz'); setRbQuery(''); rbSearch('','jazz'); multiSearch('','jazz'); }, isActive: rbSelectedTag==='jazz', color:'#7c3aed' },
                                      { label:'🌍 World',      act: () => { setRbSelectedTag('world'); setRbQuery(''); rbSearch('','world'); multiSearch('','world'); }, isActive: rbSelectedTag==='world', color:'#f97316' },
                                      { label:'🎸 Rock',       act: () => { setRbSelectedTag('rock'); setRbQuery(''); rbSearch('','rock'); multiSearch('','rock'); }, isActive: rbSelectedTag==='rock', color:'#ef4444' },
                                      { label:'🎵 Pop',        act: () => { setRbSelectedTag('pop'); setRbQuery(''); rbSearch('','pop'); multiSearch('','pop'); }, isActive: rbSelectedTag==='pop', color:'#3b82f6' },
                                      { label:'🌊 Lo-Fi',      act: () => { setRbSelectedTag('lofi'); setRbQuery(''); rbSearch('','lofi'); multiSearch('','lofi'); }, isActive: rbSelectedTag==='lofi', color:'#22d3ee' },
                                      { label:'😌 Santai',     act: () => { setRbSelectedTag(null); setRbQuery('santai'); setRbResults([]); rbSearch('santai',null); multiSearch('santai',null); }, isActive: rbQuery==='santai', color:'#6366f1' },
                                      { label:'🎯 Fokus',      act: () => { setRbSelectedTag(null); setRbQuery('fokus'); setRbResults([]); rbSearch('fokus',null); multiSearch('fokus',null); }, isActive: rbQuery==='fokus', color:'#06b6d4' },
                                      { label:'💪 Semangat',   act: () => { setRbSelectedTag(null); setRbQuery('semangat'); setRbResults([]); rbSearch('semangat',null); multiSearch('semangat',null); }, isActive: rbQuery==='semangat', color:'#f59e0b' },
                                      { label:'😴 Tidur',      act: () => { setRbSelectedTag(null); setRbQuery('tidur'); setRbResults([]); rbSearch('tidur',null); multiSearch('tidur',null); }, isActive: rbQuery==='tidur', color:'#8b5cf6' },
                                      { label:'🌧️ Me Time',    act: () => { setRbSelectedTag(null); setRbQuery('metime'); setRbResults([]); rbSearch('metime',null); multiSearch('metime',null); }, isActive: rbQuery==='metime', color:'#64748b' },
                                      { label:'🎉 Hepi',       act: () => { setRbSelectedTag(null); setRbQuery('hepi'); setRbResults([]); rbSearch('hepi',null); multiSearch('hepi',null); }, isActive: rbQuery==='hepi', color:'#f59e0b' },
                                      { label:'🌅 Pagi',       act: () => { setRbSelectedTag(null); setRbQuery('pagi'); setRbResults([]); rbSearch('pagi',null); multiSearch('pagi',null); }, isActive: rbQuery==='pagi', color:'#f97316' },
                                      { label:'☀️ Siang',      act: () => { setRbSelectedTag(null); setRbQuery('siang'); setRbResults([]); rbSearch('siang',null); multiSearch('siang',null); }, isActive: rbQuery==='siang', color:'#eab308' },
                                      { label:'🌙 Malam',      act: () => { setRbSelectedTag(null); setRbQuery('malam'); setRbResults([]); rbSearch('malam',null); multiSearch('malam',null); }, isActive: rbQuery==='malam', color:'#a78bfa' },
                                      { label:'● SomaFM',         act: () => { setRbSelectedTag(null); setRbQuery('somafm'); multiSearch('somafm',null); }, isActive: rbQuery==='somafm', color:'#10b981' },
                                      { label:'● NTS',             act: () => { setRbSelectedTag(null); setRbQuery('nts'); multiSearch('nts',null); }, isActive: rbQuery==='nts', color:'#ff4500' },
                                      { label:'● Icecast',         act: () => { setRbSelectedTag(null); setRbQuery('icecast'); multiSearch('icecast',null); }, isActive: rbQuery==='icecast', color:'#6366f1' },
                                      { label:'● Radio Garden',    act: () => { setRbSelectedTag(null); setRbQuery('radio garden'); multiSearch('radio garden',null); }, isActive: rbQuery==='radio garden', color:'#22d3ee' },
                                      { label:'● Shoutcast',       act: () => { setRbSelectedTag(null); setRbQuery('shoutcast'); multiSearch('shoutcast',null); }, isActive: rbQuery==='shoutcast', color:'#e11d48' },
                                      { label:'● FM Stream',       act: () => { setRbSelectedTag(null); setRbQuery('fmstream'); multiSearch('fmstream',null); }, isActive: rbQuery==='fmstream', color:'#06b6d4' },
                                      { label:'● RadioBrowser',    act: () => { setRbSelectedTag(null); setRbQuery('radiobrowser'); multiSearch('radiobrowser',null); }, isActive: rbQuery==='radiobrowser', color:'#f59e0b' },
                                      { label:'● Radio Paradise',  act: () => { setRbSelectedTag(null); setRbQuery('radio paradise'); multiSearch('radio paradise',null); }, isActive: rbQuery==='radio paradise', color:'#8b5cf6' },
                                    ].map((p,i) => (
                                      <button key={i} onClick={p.act} style={{ flexShrink:0, padding:'4px 10px', borderRadius:999, border:`1px solid ${p.isActive ? p.color : 'rgba(255,255,255,0.1)'}`, background:p.isActive ? `${p.color}22` : 'rgba(255,255,255,0.04)', color:p.isActive ? p.color : 'rgba(255,255,255,0.4)', fontSize:10, cursor:'pointer', fontWeight:p.isActive?700:500, transition:'all 0.15s', whiteSpace:'nowrap' }}>
                                        {p.label}
                                      </button>
                                    ))}
                                  </div>
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
                                    // Tentukan apakah pill source-specific aktif
                                    const SOURCE_PILL_QUERIES = ['somafm','nts','icecast','radio garden','shoutcast','fmstream','radiobrowser','radio paradise'];
                                    const activeSourcePill = SOURCE_PILL_QUERIES.includes(rbQuery);
                                    // Map query ke sourceLabel yang sesuai
                                    const SOURCE_LABEL_MAP = {
                                      'somafm': 'SomaFM',
                                      'nts': 'NTS Radio',
                                      'icecast': 'Icecast',
                                      'radio garden': 'Radio Garden',
                                      'shoutcast': 'Shoutcast',
                                      'fmstream': 'FM Stream',
                                      'radiobrowser': 'RadioBrowser',
                                      'radio paradise': 'Radio Paradise',
                                    };
                                    const activeSourceLabel = activeSourcePill ? SOURCE_LABEL_MAP[rbQuery] : null;
                                    // Merge: multiResults first, then RadioBrowser (hanya jika bukan source-specific pill)
                                    const multiIds = new Set(multiResults.map(s => s.id));
                                    const rbExtra = activeSourceLabel === 'RadioBrowser'
                                      ? rbResults.map(s => ({ ...s, sourceLabel: 'RadioBrowser' }))
                                      : activeSourcePill
                                        ? [] // Jangan campur RadioBrowser jika pill source lain aktif
                                        : rbResults.filter(s => !multiIds.has(`soma_${s.stationuuid}`) && !multiIds.has(s.stationuuid)).map(s => ({ ...s, sourceLabel: 'RadioBrowser' }));
                                    // Filter multiResults jika source-specific pill aktif (bukan RadioBrowser)
                                    const filteredMulti = (activeSourceLabel && activeSourceLabel !== 'RadioBrowser')
                                      ? multiResults.filter(s => s.sourceLabel === activeSourceLabel)
                                      : multiResults;
                                    const allResults = [
                                      ...filteredMulti,
                                      ...rbExtra,
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
                                  {/* ── AI Fallback Results */}
                                  {(rbAiLoading || rbAiResults.length > 0) && (
                                    <div style={{ marginTop:10 }}>
                                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                                        <div style={{ fontSize:9, fontWeight:700, color:'#a78bfa', display:'flex', alignItems:'center', gap:4 }}>
                                          <span>✦</span><span>AI Suggestion</span>
                                        </div>
                                        {rbAiLoading && <div style={{ width:8, height:8, borderRadius:'50%', border:'1.5px solid #a78bfa', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}/>}
                                      </div>
                                      {rbAiLoading && (
                                        <div style={{ textAlign:'center', padding:'12px 0', color:'rgba(255,255,255,0.3)', fontSize:10 }}>
                                          Asking AI for station suggestions…
                                        </div>
                                      )}
                                      {!rbAiLoading && rbAiResults.map((station, idx) => {
                                        const stId = `rb_${station.stationuuid || station.id}`;
                                        const isActive = track.isRadio && track.id === stId;
                                        const srcColor = '#a78bfa';
                                        const sStatus = stationStatus[station.id || station.stationuuid];
                                        const isNotFound = !!station._notFound;
                                        return (
                                          <div key={`ai_${station.stationuuid}_${idx}`}
                                            onClick={() => !isNotFound && playRbStation(station)}
                                            style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 9px', borderRadius:10, marginBottom:4, background: isActive ? `${srcColor}15` : isNotFound ? 'rgba(255,255,255,0.03)' : 'rgba(167,139,250,0.05)', border:`1px solid ${isActive ? srcColor+'55' : sStatus==='fail' ? 'rgba(248,113,113,0.2)' : isNotFound ? 'rgba(167,139,250,0.1)' : 'rgba(167,139,250,0.2)'}`, cursor: isNotFound ? 'default' : 'pointer', opacity: isNotFound ? 0.55 : 1 }}>
                                            <div style={{ width:32, height:32, borderRadius:7, overflow:'hidden', flexShrink:0, background:'rgba(167,139,250,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>
                                              {(station.favicon||station.image) && (station.favicon||station.image).startsWith('http')
                                                ? <img src={station.favicon||station.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none';}} />
                                                : '📻'}
                                            </div>
                                            <div style={{ flex:1, minWidth:0 }}>
                                              <div style={{ fontSize:11, fontWeight:700, color: isActive ? srcColor : sStatus==='fail' ? 'rgba(255,255,255,0.4)' : 'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{station.name || station.title}</div>
                                              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', display:'flex', gap:5, alignItems:'center' }}>
                                                <span style={{ color: isNotFound ? 'rgba(167,139,250,0.5)' : srcColor, fontWeight:700 }}>
                                                  {isNotFound ? '✦ AI · Saran' : '✦ AI · RadioBrowser'}
                                                </span>
                                                {(station._aiGenre || station.tags) && <span>{(station._aiGenre || String(station.tags||'').split(',')[0])}</span>}
                                                {(station._aiCountry || station.country) && <span>{station._aiCountry || station.country}</span>}
                                                {sStatus === 'ok' && <span style={{ color:'#4ade80', fontWeight:800, fontSize:8 }}>✓ aktif</span>}
                                                {sStatus === 'fail' && <span style={{ color:'#f87171', fontWeight:800, fontSize:8 }}>✕ offline</span>}
                                                {isNotFound && <span style={{ color:'rgba(255,255,255,0.3)', fontSize:8 }}>· cari manual</span>}
                                              </div>
                                            </div>
                                            <div style={{ width:26, height:26, borderRadius:'50%', background: isNotFound ? 'rgba(255,255,255,0.05)' : isActive && playing ? srcColor : sStatus==='fail' ? 'rgba(248,113,113,0.15)' : 'rgba(167,139,250,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color: isNotFound ? 'rgba(255,255,255,0.2)' : sStatus==='fail' ? '#f87171' : 'white', flexShrink:0 }}>
                                              {isNotFound ? '?' : isActive && playing ? '⏸' : sStatus==='fail' ? '!' : '▶'}
                                            </div>
                                          </div>
                                        );
                                      })}
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
                                                      src: radioUrl(station.url, customDns),
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
                                              src: radioUrl(station.url, customDns),
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
                                                    src: radioUrl(station.url, customDns),
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
                                                    <span style={{ color:'#22d3ee', fontWeight:700 }}>● Radio Garden</span>
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
                  {/* ── Search + New Playlist satu baris */}
                  <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:10 }}>
                    <div style={{ flex:1, display:'flex', alignItems:'center', gap:7, background:'rgba(0,0,0,0.35)', borderRadius:10, padding:'7px 11px', border:'1px solid rgba(255,255,255,0.1)' }}>
                      <Search size={13} style={{ color:'rgba(255,255,255,0.3)', flexShrink:0 }}/>
                      <input
                        value={plGlobalSearch}
                        onChange={e=>setPlGlobalSearch(e.target.value)}
                        placeholder={lang==='id' ? 'Cari lagu atau playlist...' : 'Search songs or playlists...'}
                        style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'white', fontSize:12, minWidth:0 }}
                      />
                      {plGlobalSearch && (
                        <button onClick={()=>setPlGlobalSearch('')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)', cursor:'pointer', padding:0, lineHeight:1, fontSize:16 }}>×</button>
                      )}
                    </div>
                    <button onClick={()=>{ setEditingPl(null); setPlView('form'); }}
                      style={{ flexShrink:0, display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10, border:'1.5px solid rgba(99,102,241,0.4)', background:'rgba(99,102,241,0.12)', color:'#a78bfa', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.22)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.12)'; }}>
                      <ListPlus size={13}/>{t?.createPlaylistBtn||'Playlist Baru'}
                    </button>
                  </div>

                </div>

                <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, paddingBottom:16 }}>

                  {/* ── GLOBAL SEARCH RESULTS */}
                  {plGlobalSearch.trim() && (() => {
                    const q = plGlobalSearch.trim().toLowerCase();
                    const matchedSongs = allSongs.filter(s =>
                      s.title?.toLowerCase().includes(q) || s.artist?.toLowerCase().includes(q)
                    );
                    const matchedPl = playlists.filter(pl => pl.name.toLowerCase().includes(q));
                    const totalMatches = matchedSongs.length + matchedPl.length;
                    return (
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {/* Summary pill */}
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', paddingLeft:2 }}>
                          {totalMatches === 0
                            ? (lang==='id' ? 'Tidak ada hasil untuk ' : 'No results for ') + `"${plGlobalSearch}"`
                            : `${totalMatches} ${lang==='id' ? 'hasil untuk' : 'results for'} "${plGlobalSearch}"`}
                        </div>

                        {/* Matched Playlists */}
                        {matchedPl.length > 0 && (
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>
                              {lang==='id' ? 'Playlist' : 'Playlists'} ({matchedPl.length})
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                              {matchedPl.map(pl => {
                                const songs = allSongs.filter(s=>pl.songIds.includes(s.id));
                                const covers = songs.slice(0,4).map(s=>s.cover).filter(Boolean);
                                const isActivePl = activePl===pl.id;
                                return (
                                  <div key={pl.id} onClick={()=>{ setActivePl(pl.id); setPlView('detail'); setPlGlobalSearch(''); }}
                                    style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:13, cursor:'pointer', background: isActivePl?'rgba(99,102,241,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${isActivePl?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.09)'}` }}
                                    onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.1)'}
                                    onMouseLeave={e=>e.currentTarget.style.background=isActivePl?'rgba(99,102,241,0.12)':'rgba(255,255,255,0.04)'}>
                                    <div style={{ width:36, height:36, borderRadius:9, overflow:'hidden', flexShrink:0, display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(99,102,241,0.15)' }}>
                                      {covers.length>0 ? covers.slice(0,4).map((c,idx)=>(
                                        <img key={idx} src={c} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                                      )) : <Music size={15} style={{color:'#a78bfa',margin:'auto',gridColumn:'span 2'}}/>}
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'white' }}>{pl.name}</div>
                                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{songs.length} {t?.songsCount||'lagu'}</div>
                                    </div>
                                    <ChevronRight size={14} style={{color:'rgba(255,255,255,0.25)', flexShrink:0}}/>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Matched Songs */}
                        {matchedSongs.length > 0 && (
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>
                              {lang==='id' ? 'Lagu' : 'Songs'} ({matchedSongs.length})
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                              {matchedSongs.map(s => (
                                <div key={s.id} onClick={()=>{ activePlRef.current=allSongs; play(s); setTab('player'); }}
                                  style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:12, cursor:'pointer', background: track?.id===s.id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)', border:`1px solid ${track?.id===s.id?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.07)'}` }}
                                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                                  onMouseLeave={e=>e.currentTarget.style.background=track?.id===s.id?'rgba(99,102,241,0.12)':'rgba(255,255,255,0.03)'}>
                                  {isLite
                                    ? <div style={{ width:34, height:34, borderRadius:8, background:s.bg||'rgba(255,255,255,0.07)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}><Music size={13} color={s.color}/></div>
                                    : <img src={s.cover} loading="lazy" decoding="async" style={{ width:34, height:34, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>}
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontWeight:700, fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: track?.id===s.id ? '#a78bfa' : 'white' }}>{s.title}</div>
                                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{s.artist}</div>
                                  </div>
                                  <Play size={12} fill="currentColor" style={{ color:'rgba(255,255,255,0.2)', flexShrink:0 }}/>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No results */}
                        {totalMatches === 0 && (
                          <div style={{ textAlign:'center', padding:'32px 20px', borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.1)' }}>
                            <Search size={32} style={{color:'rgba(255,255,255,0.1)',display:'block',margin:'0 auto 10px'}}/>
                            <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.3)' }}>{lang==='id'?'Tidak ada hasil':'No results found'}</div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:4 }}>"{plGlobalSearch}"</div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ── KOLEKSI section — same look as Stream platform cards */}
                  {!plGlobalSearch.trim() && <>
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

                  </>}
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
                    onSave={editingPl ? updatePlaylist : createPlaylist}
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
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(0,0,0,0.18)' }}>
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
                          <Eye size={12}/> {mySongsEditMode ? (lang==='id'?'Selesai':'Done') : (t?.viewBtn||'View')}
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
                      <Suspense fallback={null}>
                      {songs.map((s,i)=><SongRow key={s.id} s={s} i={i} track={track} playing={playing} liked={liked} setLiked={setLiked} toggleFav={toggleFav} play={s2=>{ activePlRef.current=songs; play(s2); }} isDrive isCached={cachedDriveIds.has(s.driveId)} embedTrack={embedTrack} onRemove={mySongsEditMode ? async id=>{
                          const song = customSongs.find(x=>x.id===id);
                          if (song?.driveId && tokenRef.current) {
                            try {
                              await fetch(`https://www.googleapis.com/drive/v3/files/${song.driveId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokenRef.current}` } });
                            } catch(e) { console.error('Drive delete failed:', e); }
                          }
                          setCustomSongs(p=>p.filter(x=>x.id!==id));
                          setPlaylists(p=>p.map(pl=>({ ...pl, songIds: pl.songIds.filter(sid=>sid!==id) })));
                          setLiked(l=>{ const n={...l}; delete n[id]; return n; });
                          setFavSongs(p=>p.filter(s=>s.id!==id));
                          if(activePlRef.current) activePlRef.current=activePlRef.current.filter(s=>s.id!==id);
                        } : null} playlists={playlists} addToPlaylist={addToPlaylist} isLite={isLite} t={t} editMode={mySongsEditMode}
                        onDownload={downloadWithCache}
                      />)}
                      </Suspense>
                    </div>
                  </div>
                );
              }

              // ── Special: Baru Dimainkan
              if (activePl === 'recently_played') {
                const songs = history.slice(1);
                return (
                  <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(0,0,0,0.18)' }}>
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
                // Tampilkan semua lagu — bukan hanya yang ada di playlist lain
                const songs = filteredSongs;
                return (
                  <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(0,0,0,0.18)' }}>
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
                        <button
                          onClick={()=>setAllSongsEditMode(v=>!v)}
                          style={{ background: allSongsEditMode ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)', border: allSongsEditMode ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.12)', cursor:'pointer', color: allSongsEditMode ? '#f87171' : 'rgba(255,255,255,0.55)', fontSize:12, padding:'5px 10px', borderRadius:8, fontWeight:700, display:'flex', alignItems:'center', gap:5, transition:'all 0.2s' }}
                        >
                          <Eye size={12}/> {allSongsEditMode ? (lang==='id'?'Selesai':'Done') : (t?.viewBtn||'View')}
                        </button>
                        {songs.length>0&&(
                          <button onClick={()=>{ activePlRef.current=songs; play(songs[0]); setTab('player'); }}
                            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, border:'none', background:'#a78bfa', color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                            <Play size={13} fill="currentColor"/>{t?.playAllBtn||'Play All'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'10px 16px 16px', display:'flex', flexDirection:'column', gap:5 }}>
                      <Suspense fallback={null}>
                      {songs.map((s,i)=><SongRow key={s.id} s={s} i={i} track={track} playing={playing} liked={liked} setLiked={setLiked} toggleFav={toggleFav} play={s2=>{ activePlRef.current=songs; play(s2); }} isDrive={s.isDrive} isCached={s.driveId ? cachedDriveIds.has(s.driveId) : s.type==='youtube' ? cachedYtIds.has(s.videoId) : cachedFavIds.has(s.id)} isDownloading={s.type==='youtube' ? ytDownloadingIds.has(s.videoId) : favDownloadingIds.has(s.id)} dlProgress={s.type==='youtube' ? (ytDownloadProg[s.videoId]||0) : (favDownloadProg[s.id]||0)} playlists={playlists} addToPlaylist={addToPlaylist} isLite={isLite} t={t} embedTrack={embedTrack}
                      onRemove={allSongsEditMode ? id=>{ setLiked(l=>{const n={...l};delete n[id];return n;}); setFavSongs(p=>p.filter(s=>s.id!==id)); setCustomSongs(p=>p.filter(s=>s.id!==id)); setYtSongs(p=>p.filter(s=>s.id!==id)); setPlaylists(p=>p.map(pl=>({...pl,songIds:pl.songIds.filter(sid=>sid!==id)}))); } : null}
                      editMode={allSongsEditMode}
                      onDownload={downloadWithCache}
                    />)}
                      </Suspense>
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
                  <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(0,0,0,0.18)' }}>
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
                      <button
                        onClick={()=>setPlSongsEditMode(v=>!v)}
                        style={{ background: plSongsEditMode ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)', border: plSongsEditMode ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.12)', cursor:'pointer', color: plSongsEditMode ? '#f87171' : 'rgba(255,255,255,0.55)', fontSize:11, padding:'5px 10px', borderRadius:8, fontWeight:700, display:'flex', alignItems:'center', gap:4, flexShrink:0, transition:'all 0.2s' }}
                      >
                        <Eye size={12}/> {plSongsEditMode ? (lang==='id'?'Selesai':'Done') : (t?.viewBtn||'View')}
                      </button>
                      {songs.length>0&&(
                        <button onClick={()=>{ setActivePl(pl.id); activePlRef.current=songs; play(songs[0]); setTab('player'); }}
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
                    <Suspense fallback={null}>
                    {songs.map((s,i)=>(
                      <SongRow key={s.id} s={s} i={i}
                        track={track} playing={playing}
                        liked={liked} setLiked={setLiked} toggleFav={toggleFav}
                        play={s2=>{ setActivePl(pl.id); activePlRef.current=songs; play(s2); }}
                        isDrive={s.isDrive}
                        isCached={s.driveId ? cachedDriveIds.has(s.driveId) : s.type==='youtube' ? cachedYtIds.has(s.videoId) : cachedFavIds.has(s.id)}
                        isDownloading={s.type==='youtube' ? ytDownloadingIds.has(s.videoId) : favDownloadingIds.has(s.id)}
                        dlProgress={s.type==='youtube' ? (ytDownloadProg[s.videoId]||0) : (favDownloadProg[s.id]||0)}
                        playlists={playlists} addToPlaylist={addToPlaylist}
                        isLite={isLite} t={t} embedTrack={embedTrack}
                        editMode={plSongsEditMode}
                        onDownload={downloadWithCache}
                        onRemove={plSongsEditMode ? id=>{
                          setPlaylists(p=>p.map(pl2=>pl2.id===pl.id?{...pl2,songIds:pl2.songIds.filter(sid=>sid!==id)}:pl2));
                          if(pl.id==='pl_fav'){
                            setLiked(l=>{const n={...l};delete n[id];return n;});
                            setFavSongs(p=>p.filter(x=>x.id!==id));
                          }
                        } : null}
                      />
                    ))}
                    </Suspense>
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
          <div style={{ height:'100%', display:'flex', flexDirection:'column', position:'relative' }}
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
                  <button key={id} onClick={()=>{ setAiSubView(id); if(id==='lyrics' && aiSubView==='lyrics') getLyricsRef.current?.(); }}
                    style={{ padding:'9px 22px', borderRadius:0, border:'none', background:'none', color:aiSubView===id?'white':'rgba(255,255,255,0.4)', fontSize:13, fontWeight:aiSubView===id?800:600, cursor:'pointer', borderBottom:aiSubView===id?`2px solid ${track.color}`:'2px solid transparent', marginBottom:-1, flexShrink:0, whiteSpace:'nowrap' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>{/* end AI Header */}

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
                          { id:'relax',     icon:'😌', label:'Santai',   color:'#6366f1' },
                          { id:'focus',     icon:'🎯', label:'Fokus',    color:'#3b82f6' },
                          { id:'energetic', icon:'🔥', label:'Semangat', color:'#ef4444' },
                          { id:'sleep',     icon:'😴', label:'Tidur',    color:'#8b5cf6' },
                          { id:'metime',    icon:'🌧️', label:'Me time',  color:'#64748b' },
                          { id:'party',     icon:'🎉', label:'Hepi',     color:'#f59e0b' },

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
                    <div style={{ marginBottom:24 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                        <div style={{ width:5, height:18, borderRadius:99, background:'linear-gradient(to bottom,#22c55e,#06b6d4)' }}/>
                        <div style={{ fontSize:13, fontWeight:800, color:'white' }}>Bahasa konten?</div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                        {[
                          { id:'id',  icon:'🇮🇩', label:'Indonesia', sub:'Lokal' },
                          { id:'en',  icon:'🌍', label:'Internasional', sub:'Global' },
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

                    {/* Q4 — Waktu */}
                    <div style={{ marginBottom:28 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                        <div style={{ width:5, height:18, borderRadius:99, background:'linear-gradient(to bottom,#f59e0b,#ef4444)' }}/>
                        <div style={{ fontSize:13, fontWeight:800, color:'white' }}>Biasanya dengerin kapan?</div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                        {[
                          { id:'pagi',   icon:'🌅', label:'Pagi', sub:'06–12' },
                          { id:'siang',  icon:'☀️',  label:'Siang', sub:'12–17' },
                          { id:'malam',  icon:'🌙', label:'Malam', sub:'17–24' },
                          { id:'random', icon:'🎲', label:'Kapan saja', sub:'Mix' },
                        ].map(td => (
                          <button key={td.id} onClick={()=>setPersonaPrefs(p=>({ ...p, timeOfDay: personaPrefs.timeOfDay===td.id ? '' : td.id }))}
                            style={{ padding:'12px 6px', borderRadius:14, border:`1.5px solid ${personaPrefs.timeOfDay===td.id?'#f59e0b70':'rgba(255,255,255,0.08)'}`, background:personaPrefs.timeOfDay===td.id?'rgba(245,158,11,0.15)':'rgba(255,255,255,0.03)', color:personaPrefs.timeOfDay===td.id?'white':'rgba(255,255,255,0.45)', fontSize:11, fontWeight:personaPrefs.timeOfDay===td.id?800:500, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, transition:isLite?'none':'all 0.15s', gridColumn: td.id==='random'?'span 3':'span 1' }}>
                            <span style={{ fontSize:20 }}>{td.icon}</span>
                            <span style={{ fontWeight:700, fontSize:11.5 }}>{td.label}</span>
                            <span style={{ fontSize:9.5, opacity:0.55 }}>{td.sub}</span>
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
                        // BUG FIX 1: simpan prefs dulu sebelum fetch agar tidak hilang jika AI gagal
                        localStorage.setItem('sn_persona_prefs', JSON.stringify(personaPrefs));
                        try {
                          const result = await fetchForYouSplit(personaPrefs, null, null);
                          if (result) {
                            setPersonaRecs(result);
                            localStorage.setItem('sn_persona_recs', JSON.stringify(result));
                            localStorage.setItem('sn_persona_done', '1');
                            localStorage.setItem('sn_persona_recs_ts', String(Date.now()));
                            setPersonaStep('result');
                          } else {
                            alert('Gagal memuat rekomendasi. Coba lagi.');
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
                            <button onClick={()=>{ setPersonaStep('onboard'); setPersonaRecs(null); localStorage.removeItem('sn_persona_done'); localStorage.removeItem('sn_persona_recs'); localStorage.removeItem('sn_persona_recs_ts'); }}
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
                                    <button onClick={e=>{ e.stopPropagation(); item.onPlay(); }} style={{ width:'100%', padding:'7px 0', borderRadius:10, border:'none', background:`${section.accent}22`, color:section.accent, fontSize:11, fontWeight:700, cursor:'pointer', letterSpacing:'0.01em' }}>
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

                              {/* Local Trending */}
                              {(popularRecs.trending_local || popularRecs.trending_indo)?.length > 0 && (() => {
                                const localData = popularRecs.trending_local || popularRecs.trending_indo;
                                const localFlag = !userLocationCountry || userLocationCountry === 'ID' ? '🇮🇩' : '📍';
                                const localTitle = userLocation ? `Trending di ${userLocation}` : 'Trending Indonesia';
                                return (
                                <div style={{ marginBottom:16 }}>
                                  <div style={{ padding:'0 16px 8px', fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                                    {localFlag} {localTitle}
                                  </div>
                                  <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', paddingLeft:16, paddingRight:16, paddingBottom:4 }}>
                                    {localData.map((m, i) => (
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
                                          <span style={{ fontSize:22 }}>{localFlag}</span>
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
                                );
                              })()}
                            </>
                          )}
                        </div>

                        {/* ── OTHER: Pembuat Playlist ── */}
                        <div style={{ marginTop:0 }}>
                          <div style={{ padding:'14px 16px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:30, height:30, borderRadius:10, background:'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(168,85,247,0.2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>✨</div>
                              <div>
                                <div style={{ fontSize:13, fontWeight:800, color:'white', letterSpacing:'-0.01em' }}>Other</div>
                                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Buat playlist dengan AI</div>
                              </div>
                            </div>
                          </div>

                          {/* Inner tab: Preferensi | Populer */}
                          <div style={{ display:'flex', gap:0, margin:'0 16px 14px', background:'rgba(255,255,255,0.05)', borderRadius:12, padding:3 }}>
                            {[
                              { id:'pref',    label:'🎯 Sesuai Preferensi' },
                              { id:'popular', label:'🔥 Populer Sekarang'  },
                            ].map(({ id, label }) => (
                              <button key={id} onClick={() => setOtherInnerTab(id)}
                                style={{ flex:1, padding:'7px 0', borderRadius:10, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.18s',
                                  background: otherInnerTab === id ? track.color : 'transparent',
                                  color:      otherInnerTab === id ? 'white' : 'rgba(255,255,255,0.4)',
                                }}>
                                {label}
                              </button>
                            ))}
                          </div>

                          {/* ── Tab: Sesuai Preferensi ── */}
                          {otherInnerTab === 'pref' && (
                            <div style={{ padding:'0 16px 16px' }}>
                              {!prefPlaylist && !prefPlaylistLoading && (
                                <div style={{ textAlign:'center', paddingTop:16, paddingBottom:8 }}>
                                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:14, lineHeight:1.6 }}>
                                    AI akan membuat 10 lagu berdasarkan genre, mood,<br/>dan preferensi bahasa kamu.
                                  </div>
                                  <button onClick={generatePrefPlaylist}
                                    style={{ padding:'9px 22px', borderRadius:999, border:'none', background:`linear-gradient(135deg,${track.color},#a855f7)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:7 }}>
                                    <Sparkles size={13}/> Generate Playlist
                                  </button>
                                </div>
                              )}
                              {prefPlaylistLoading && (
                                <div style={{ textAlign:'center', padding:'20px 0', color:'rgba(255,255,255,0.4)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                                  <Loader2 size={14} style={{ animation:'spin 1s linear infinite', color:track.color }}/> Starry AI sedang menyusun playlist…
                                </div>
                              )}
                              {prefPlaylist && !prefPlaylistLoading && (
                                <>
                                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                                    <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                                      🎯 Playlist Personalmu ({prefPlaylist.length} lagu)
                                    </div>
                                    <button onClick={generatePrefPlaylist} style={{ background:'none', border:'none', color:track.color, fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                                      <Sparkles size={11}/> Refresh
                                    </button>
                                  </div>
                                  {/* Tombol Play All */}
                                  <button onClick={playPrefPlaylistQueue} disabled={prefPlaylistQueueLoading}
                                    style={{ width:'100%', marginBottom:12, padding:'11px 0', borderRadius:14, border:'none', background:`linear-gradient(135deg,${track.color},#a855f7)`, color:'white', fontSize:13, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:prefPlaylistQueueLoading?0.65:1, boxShadow:isLite?'none':`0 4px 18px ${track.color}40` }}>
                                    {prefPlaylistQueueLoading ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> Memuat Antrean…</> : <><Play size={14}/> Play All {prefPlaylist.length} Lagu</>}
                                  </button>
                                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                    {prefPlaylist.map((m, i) => (
                                      <div key={i}
                                        onClick={() => { const q = `${m.title} ${m.artist}`; setUnifiedPlatform('ytmusic'); setUnifiedQuery(q); setYtQuery(p=>({...p, ytmusic:q})); setTab('stream'); setTimeout(()=>{ searchYouTube('ytmusic', q); ytMusicSectionRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }); }, 300); }}
                                        style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:14, background:'rgba(255,255,255,0.04)', border:`1px solid ${track.color}18`, cursor:'pointer', transition:'background 0.15s' }}
                                        onMouseEnter={e=>e.currentTarget.style.background=`${track.color}14`}
                                        onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}>
                                        <div style={{ width:28, height:28, borderRadius:8, background:`${track.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:track.color, flexShrink:0 }}>
                                          {i+1}
                                        </div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                          <div style={{ fontSize:12, fontWeight:700, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
                                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.artist}</div>
                                          {m.reason && <div style={{ fontSize:9.5, color:`${track.color}90`, marginTop:2 }}>{m.reason}</div>}
                                        </div>
                                        <div style={{ fontSize:16, flexShrink:0 }}>▶</div>
                                      </div>
                                    ))}
                                  </div>
                                  {/* Tombol simpan */}
                                  <div style={{ display:'flex', gap:8, marginTop:14 }}>
                                    <button onClick={() => openSaveAIPlaylist(prefPlaylist, '🎯 Playlist Preferensiku')}
                                      style={{ flex:1, padding:'10px 0', borderRadius:12, border:'none', background:`linear-gradient(135deg,${track.color},#a855f7)`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                      <ListPlus size={14}/> Playlist Baru
                                    </button>
                                    <button onClick={() => openAddToExistingPlaylist(prefPlaylist)}
                                      style={{ flex:1, padding:'10px 0', borderRadius:12, border:`1px solid ${track.color}50`, background:`${track.color}15`, color:track.color, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                      <ListPlus size={14}/> Tambah ke Playlist
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          {/* ── Tab: Populer Sekarang ── */}
                          {otherInnerTab === 'popular' && (
                            <div style={{ padding:'0 16px 16px' }}>
                              {!popularPlaylist && !popularPlaylistLoading && (
                                <div style={{ textAlign:'center', paddingTop:16, paddingBottom:8 }}>
                                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:14, lineHeight:1.6 }}>
                                    AI akan membuat 10 lagu yang sedang trending<br/>secara global dan lokal Indonesia.
                                  </div>
                                  <button onClick={generatePopularPlaylist}
                                    style={{ padding:'9px 22px', borderRadius:999, border:'none', background:'linear-gradient(135deg,#ef4444,#f59e0b)', color:'white', fontSize:12, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:7 }}>
                                    🔥 Generate Playlist
                                  </button>
                                </div>
                              )}
                              {popularPlaylistLoading && (
                                <div style={{ textAlign:'center', padding:'20px 0', color:'rgba(255,255,255,0.4)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                                  <Loader2 size={14} style={{ animation:'spin 1s linear infinite', color:'#ef4444' }}/> Starry AI sedang kurasi playlist populer…
                                </div>
                              )}
                              {popularPlaylist && !popularPlaylistLoading && (
                                <>
                                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                                    <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                                      🔥 Trending Sekarang ({popularPlaylist.length} lagu)
                                    </div>
                                    <button onClick={generatePopularPlaylist} style={{ background:'none', border:'none', color:'#f59e0b', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                                      <Sparkles size={11}/> Refresh
                                    </button>
                                  </div>
                                  {/* Tombol Play All */}
                                  <button onClick={playPopularPlaylistQueue} disabled={popularPlaylistQueueLoading}
                                    style={{ width:'100%', marginBottom:12, padding:'11px 0', borderRadius:14, border:'none', background:'linear-gradient(135deg,#ef4444,#f59e0b)', color:'white', fontSize:13, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:popularPlaylistQueueLoading?0.65:1, boxShadow:isLite?'none':'0 4px 18px rgba(239,68,68,0.4)' }}>
                                    {popularPlaylistQueueLoading ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> Memuat Antrean…</> : <><Play size={14}/> Play All {popularPlaylist.length} Lagu</>}
                                  </button>
                                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                    {popularPlaylist.map((m, i) => (
                                      <div key={i}
                                        onClick={() => { const q = `${m.title} ${m.artist}`; setUnifiedPlatform('ytmusic'); setUnifiedQuery(q); setYtQuery(p=>({...p, ytmusic:q})); setTab('stream'); setTimeout(()=>{ searchYouTube('ytmusic', q); ytMusicSectionRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }); }, 300); }}
                                        style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(239,68,68,0.18)', cursor:'pointer', transition:'background 0.15s' }}
                                        onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                                        onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}>
                                        <div style={{ width:28, height:28, borderRadius:8, background:'rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#f87171', flexShrink:0 }}>
                                          {i+1}
                                        </div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                          <div style={{ fontSize:12, fontWeight:700, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
                                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.artist}</div>
                                          {m.reason && <div style={{ fontSize:9.5, color:'#fbbf2490', marginTop:2 }}>{m.reason}</div>}
                                        </div>
                                        <div style={{ fontSize:16, flexShrink:0 }}>▶</div>
                                      </div>
                                    ))}
                                  </div>
                                  {/* Tombol simpan */}
                                  <div style={{ display:'flex', gap:8, marginTop:14 }}>
                                    <button onClick={() => openSaveAIPlaylist(popularPlaylist, '🔥 Playlist Populer')}
                                      style={{ flex:1, padding:'10px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg,#ef4444,#f59e0b)', color:'white', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                      <ListPlus size={14}/> Playlist Baru
                                    </button>
                                    <button onClick={() => openAddToExistingPlaylist(popularPlaylist)}
                                      style={{ flex:1, padding:'10px 0', borderRadius:12, border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.1)', color:'#f87171', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                      <ListPlus size={14}/> Tambah ke Playlist
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                        </div>{/* end Other section */}

                  </div>
                )}
              </div>
            ) : aiSubView==='lyrics' ? (
              /* ── LYRICS VIEW inside AI tab */
              <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'16px 20px 24px' }}>
                {/* ── Live Caption Bar — only shown when synced LRC is available */}
                {/* captionTick forces re-render every 250ms so caption stays in sync (FIX Bug #9) */}
                {lrcLines.length > 0 && lyrics && !lyrics.startsWith('⚡') && (() => {
                  void captionTick; // eslint-disable-line no-unused-expressions
                  const now = embedTrack?.type === 'youtube' ? ytProgress : progress;
                  // Gunakan romanizedLrcLines jika tersedia (non-Latin → tampilkan Latin)
                  const activeLrc = romanizedLrcLines.length > 0 ? romanizedLrcLines : lrcLines;
                  // Find current line: last line whose time <= now (scan all, no break)
                  let activeIdx = -1;
                  for (let i = 0; i < activeLrc.length; i++) {
                    if (activeLrc[i].time <= now) activeIdx = i;
                  }
                  const currentLine = activeIdx >= 0 ? activeLrc[activeIdx].text : null;
                  const nextLine = activeIdx >= 0 && activeIdx + 1 < activeLrc.length ? activeLrc[activeIdx + 1].text : null;
                  if (!currentLine) return null;
                  return (
                    <div style={{ marginBottom: 14, borderRadius: 14, overflow: 'hidden', background: `linear-gradient(135deg, ${track.color}22, ${track.color}10)`, border: `1px solid ${track.color}40`, padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: track.color, animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }}/>
                        <div style={{ fontSize: 9, fontWeight: 800, color: track.color, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Live Caption</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.5, transition: 'all 0.3s ease' }}>{currentLine}</div>
                      {nextLine && (
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 5, lineHeight: 1.4 }}>{nextLine}</div>
                      )}
                    </div>
                  );
                })()}
                <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'flex-end', gap:6, marginBottom:14 }}>
                  {lyrics && (
                    <button onClick={()=>{ setLyrics(''); setLyricsTranslation(''); setLyricsRomanized(''); setRomanizedLrcLines([]); setLyricsNeedGenerate(false); }} title="Tutup Lirik" style={{ padding:'7px 10px', borderRadius:999, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:5, marginRight:'auto' }}>
                      <X size={13}/> Tutup
                    </button>
                  )}
                  {lyrics && !lyrics.startsWith('⚡') && hasNonLatin(lyrics) && !isLite && (
                    <button onClick={lyricsRomanized ? ()=>{ setLyricsRomanized(''); setRomanizedLrcLines([]); } : ()=>romanizeLyrics(lyrics)} disabled={lyricsRomanizing} style={{ padding:'6px 11px', borderRadius:999, border:`1px solid ${track.color}50`, background:`${track.color}18`, color:'white', fontSize:11, fontWeight:700, cursor:'pointer', opacity:lyricsRomanizing?0.6:1, display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                      {lyricsRomanizing ? <><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>Romanisasi…</> : lyricsRomanized ? <>🔤 Sembunyikan</> : <>🔤 Romanisasi</>}
                    </button>
                  )}
                  {lyrics && !lyrics.startsWith('⚡') && !isLite && (
                    <button onClick={lyricsTranslation ? ()=>setLyricsTranslation('') : translateLyrics} disabled={lyricsTranslating} style={{ padding:'6px 11px', borderRadius:999, border:`1px solid ${track.color}50`, background:`${track.color}18`, color:'white', fontSize:11, fontWeight:700, cursor:'pointer', opacity:lyricsTranslating?0.6:1, display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                      {lyricsTranslating ? <><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>Menerjemahkan…</> : lyricsTranslation ? <>🌐 Sembunyikan</> : <>🌐 Terjemahkan</>}
                    </button>
                  )}
                  <button onClick={getLyrics} disabled={lyricsLoading||lyricsGenerating} style={{ padding:'6px 11px', borderRadius:999, border:'none', background:track.color, color:'white', fontSize:11, fontWeight:700, cursor:'pointer', opacity:(lyricsLoading||lyricsGenerating)?0.6:1, display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
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
                      {(() => {
                        void captionTick; // eslint-disable-line no-unused-expressions — FIX Bug #9
                        const now = embedTrack?.type === 'youtube' ? ytProgress : progress;
                        let activeIdx = -1;
                        if (lrcLines.length > 0) {
                          for (let i = 0; i < lrcLines.length; i++) {
                            if (lrcLines[i].time <= now) activeIdx = i;
                          }
                        }
                        const activeLrcIdx = activeIdx >= 0 ? lrcLines[activeIdx].idx : -1;
                        // Build a map from lrc idx → line index in lyrics text for accurate highlighting
                        let lrcCounter = 0;
                        const lineToLrcIdx = [];
                        lyrics.split('\n').forEach((line) => {
                          const isTag = line.startsWith('[') && line.endsWith(']');
                          if (!isTag && line.trim() && lrcLines.length > 0 && lrcCounter < lrcLines.length) {
                            lineToLrcIdx.push(lrcLines[lrcCounter].idx);
                            lrcCounter++;
                          } else {
                            lineToLrcIdx.push(-1);
                          }
                        });
                        return lyrics.split('\n').map((line, i) => {
                          const isTag = line.startsWith('[') && line.endsWith(']');
                          const isActive = !isTag && lrcLines.length > 0 && activeLrcIdx >= 0 && lineToLrcIdx[i] === activeLrcIdx;
                          return (
                            <div key={i} style={{ fontSize:isTag?11:15, fontWeight:isTag?800:(isActive?700:400), color:isTag?track.color:isActive?'white':'rgba(255,255,255,0.9)', marginTop:isTag&&i>0?18:0, marginBottom:isTag?6:0, textTransform:isTag?'uppercase':'none', letterSpacing:isTag?'0.12em':0, background:isActive?`${track.color}22`:undefined, borderLeft:isActive?`3px solid ${track.color}`:'3px solid transparent', paddingLeft:isActive?9:9, borderRadius:isActive?6:0, transition:'all 0.3s ease' }}>
                              {line || <br/>}
                            </div>
                          );
                        });
                      })()}
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
                    <div style={{ fontSize:9, fontWeight:800, color:track.color, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.12em' }}>🔮 {t?.vibeMoodLabel||'Suasana Hati'}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.85)', lineHeight:1.75, whiteSpace:'pre-line' }}>{vibeInput.replace(/^✨\s?/,'')}</div>
                    {vibeMatch && (
                      <div style={{ marginTop:8, display:'flex', gap:6 }}>
                        {vibeMatch.source === 'drive' ? (
                          <button
                            onClick={() => { play(vibeMatch.song); setVibeInput(''); setVibeMatch(null); }}
                            style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:999, border:`1px solid ${track.color}60`, background:`${track.color}22`, color:track.color, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                            ▶ {t?.playFromDrive||'Putar dari Drive'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const ytPlatformId = 'ytmusic';
                              setYtQuery(p => ({...p, [ytPlatformId]: vibeMatch.query}));
                              setTab('stream');
                              setTimeout(() => { searchYouTube(ytPlatformId, vibeMatch.query); }, 120);
                            }}
                            style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:999, border:'1px solid rgba(255,100,100,0.5)', background:'rgba(255,100,100,0.12)', color:'#f87171', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                            🔍 {t?.searchOnYt||'Cari di YouTube'}
                          </button>
                        )}
                      </div>
                    )}
                    <button onClick={()=>{ setVibeInput(''); setVibeMatch(null); }} style={{ marginTop:7, fontSize:10, color:track.color, background:'none', border:'none', cursor:'pointer', fontWeight:700, padding:0 }}>{t?.resetBtn||'× Reset'}</button>
                  </div>
                )}
                {messages.map((m,i)=>{
                  const act = m.action;
                  return (
                  <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start' }}>
                    {m.from==='ai'&&<div style={{ width:22, height:22, borderRadius:7, flexShrink:0, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', marginRight:6, marginTop:2 }}><Bot size={11} style={{ color:'white' }}/></div>}
                    <div style={{ maxWidth:'78%' }}>
                      <div style={{
                        padding:'9px 13px', fontSize:13, lineHeight:1.55,
                        borderRadius:m.from==='user'?'16px 16px 4px 16px':'4px 16px 16px 16px',
                        background: m.isCosmicInsight
                          ? `linear-gradient(135deg,${track.color}22,rgba(168,85,247,0.15))`
                          : m.from==='user' ? track.color : 'rgba(255,255,255,0.07)',
                        border: m.isCosmicInsight
                          ? `1px solid ${track.color}55`
                          : m.from==='user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        color:'white',
                        fontStyle: m.isCosmicInsight ? 'italic' : 'normal',
                      }}>{m.text}</div>
                      {act?.type === 'yt' && (
                        <button
                          onClick={()=>{
                            const baseQ = act.artist ? `${act.title} ${act.artist}` : act.title;
                            const hasMusicKw = /official|audio|video|mv|lyric|cover|remix|live/i.test(baseQ);
                            const ytQ = (!hasMusicKw && baseQ.length < 50) ? `${baseQ} official audio` : baseQ;
                            const ytPlatformId = 'ytmusic';
                            setYtQuery(p=>({...p,[ytPlatformId]:ytQ}));
                            setUnifiedPlatform('ytmusic');
                            setUnifiedQuery(ytQ);
                            setTab('stream');
                            setTimeout(()=>{ searchYouTube(ytPlatformId, ytQ); }, 120);
                          }}
                          style={{ marginTop:6, display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:999, border:`1px solid ${track.color}50`, background:`${track.color}18`, color:track.color, fontSize:11, fontWeight:700, cursor:'pointer', maxWidth:'100%', overflow:'hidden' }}>
                          <Search size={11} style={{ flexShrink:0 }}/>
                          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {act.title}{act.artist ? ` — ${act.artist}` : ''}
                          </span>
                        </button>
                      )}
                      {act?.type === 'radio' && (
                        <button
                          onClick={()=>{
                            setUnifiedPlatform('radio');
                            setTab('stream');
                            setTimeout(()=>{ setRbMode('search'); setRbQuery(act.query); rbSearch(act.query, null); multiSearch(act.query, null); }, 300);
                          }}
                          style={{ marginTop:6, display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:999, border:'1px solid rgba(251,146,60,0.5)', background:'rgba(251,146,60,0.12)', color:'#fb923c', fontSize:11, fontWeight:700, cursor:'pointer', maxWidth:'100%', overflow:'hidden' }}>
                          <Radio size={11} style={{ flexShrink:0 }}/>
                          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {act.query}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
                {chatLoading&&<div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:22, height:22, borderRadius:7, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}><Bot size={11} style={{ color:'white' }}/></div><div style={{ padding:'9px 13px', borderRadius:'4px 16px 16px 16px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', gap:5 }}>{[0,0.15,0.3].map((d,i)=>(<div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#818cf8', animation:`bounce 1.4s ease-in-out ${d}s infinite` }}/>))}</div></div>}
                {messages.length > 1 && (
                  <div style={{ textAlign:'center', paddingTop:4, paddingBottom:2 }}>
                    <button
                      onClick={() => {
                        const _lang = (() => { try { return localStorage.getItem('sn_lang') || 'id'; } catch { return 'id'; } })();
                        const greetings = _lang === 'en' ? [
                          'Hey! 👋 What are you up to? Want to chat or find the perfect song for the vibe?',
                          `Hi~ I'm Starry ✨ Tell me anything — music, your day, or just hang out 😊`,
                          `Welcome! 🌙 Happy, sad, or just need some company? I'm here`,
                          `Heyy! Request a song, vent, or ask anything — I'm all ears 🎶`,
                          'Hey! How can I help? Music chat, song recommendations, or just a convo — all good 🌟',
                        ] : [
                          'Halo! 👋 Lagi ngapain nih? Mau ngobrol santai atau cari lagu yang pas buat suasana sekarang?',
                          'Hai~ aku Starry ✨ Bisa cerita apa aja ke aku — soal musik, hari ini, atau sekadar pengen ngobrol 😊',
                          'Selamat datang! 🌙 Lagi seneng, galau, atau cuma pengen teman menemani? Aku di sini kok',
                          'Heyy! Mau request lagu, curhat, atau tanya apa pun — aku siap dengerin 🎶',
                          'Halo! Ada yang bisa aku bantu? Mau ngobrolin musik, nyari lagu sesuai mood, atau sekadar ngobrol juga bisa 🌟',
                        ];
                        setMessages([{ from:'ai', text: greetings[Math.floor(Math.random() * greetings.length)] }]);
                        setInput('');
                        setVibeInput('');
                        setVibeMatch(null);
                        setCL(false);
                      }}
                      style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', fontSize:11, cursor:'pointer', padding:'2px 8px', borderRadius:6, transition:'color 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.55)'}
                      onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.2)'}
                    >{t?.newChatBtn || '↺ mulai percakapan baru'}</button>
                  </div>
                )}
                <div ref={chatEndRef}/>
              </div>
            )}



            {/* Input area — only in chat view */}
            {aiSubView==='chat'&&(
            <div style={{ padding:'8px 16px 14px', flexShrink:0, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              {/* ── Shazam listening indicator ── */}
              {(shazamListening || shazamLoading) && (
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, padding:'8px 12px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:`1px solid ${track.color}44` }}>
                  <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:18 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{
                        width:3, borderRadius:2,
                        background: shazamListening ? track.color : 'rgba(255,255,255,0.4)',
                        height: shazamListening ? undefined : 8,
                        minHeight: 4,
                        animation: shazamListening ? `shazamBar 0.9s ease-in-out ${i*0.15}s infinite alternate` : 'none',
                      }}/>
                    ))}
                  </div>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)', flex:1 }}>
                    {shazamListening ? (shazamSourceRef.current === 'audio device' ? '🖥️ Mendengarkan audio device… (8 detik)' : '🎙️ Mendengarkan musik… (8 detik)') : '🔍 Mengenali lagu…'}
                  </span>
                  {(shazamListening || shazamLoading) && (
                    <button onClick={cancelShazam} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:2, display:'flex', alignItems:'center' }}>
                      <X size={13}/>
                    </button>
                  )}
                  {shazamLoading && <Loader2 size={13} style={{ color:track.color, animation:'spin 1s linear infinite', flexShrink:0 }}/>}
                </div>
              )}
              {/* ── Vibe mode hint chips ── */}
              {vibeInput && !vibeInput.startsWith('✨') && (
                <div className="scrollbar-hide" style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:7, paddingBottom:1 }}>
                  {(lang==='en' ? [
                    { emoji:'😌', label:'chill & relaxed' },
                    { emoji:'🌧️', label:'rainy day sad' },
                    { emoji:'🔥', label:'hype & energetic' },
                    { emoji:'💔', label:'heartbroken' },
                    { emoji:'🌅', label:'morning motivation' },
                    { emoji:'🌙', label:'late night focus' },
                    { emoji:'🥰', label:'feeling in love' },
                    { emoji:'😤', label:'angry release' },
                  ] : [
                    { emoji:'😌', label:'santai & tenang' },
                    { emoji:'🌧️', label:'hujan & galau' },
                    { emoji:'🔥', label:'semangat banget' },
                    { emoji:'💔', label:'patah hati' },
                    { emoji:'🌅', label:'pagi motivasi' },
                    { emoji:'🌙', label:'malam fokus' },
                    { emoji:'🥰', label:'lagi jatuh cinta' },
                    { emoji:'😤', label:'butuh pelampiasan' },
                  ]).map(({ emoji, label }) => (
                    <button
                      key={label}
                      onClick={() => { setVibeInput(label); }}
                      style={{
                        flexShrink:0, display:'flex', alignItems:'center', gap:4,
                        padding:'4px 10px', borderRadius:999,
                        border:'1px solid rgba(168,85,247,0.25)',
                        background:'rgba(168,85,247,0.08)',
                        color:'rgba(255,255,255,0.6)',
                        fontSize:11, fontWeight:600, cursor:'pointer',
                        transition:'all 0.15s', whiteSpace:'nowrap',
                      }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(168,85,247,0.2)'; e.currentTarget.style.color='#d8b4fe'; e.currentTarget.style.borderColor='rgba(168,85,247,0.5)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(168,85,247,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor='rgba(168,85,247,0.25)'; }}
                    >
                      <span style={{ fontSize:12 }}>{emoji}</span> {label}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap:8 }}>
                <input
                  value={vibeInput && !vibeInput.startsWith('✨') ? vibeInput : input}
                  onChange={e=>{ const v=e.target.value; if(vibeInput&&!vibeInput.startsWith('✨')) setVibeInput(v); else setInput(v); }}
                  onKeyDown={e=>{ if(e.key==='Enter'){ if(vibeInput&&!vibeInput.startsWith('✨')){ if(!vibeLoading) searchVibe(); } else sendChat(); } }}
                  placeholder={vibeInput&&!vibeInput.startsWith('✨') ? (t?.vibeMoodPlaceholder||'"chill", "energetic morning", "sad but beautiful"…') : (t?.vibeInputPlaceholder||'Ask AI or type a mood…')}
                  style={{ flex:1, background:'rgba(255,255,255,0.07)', border:`1px solid rgba(255,255,255,0.12)`, borderRadius:12, padding:'9px 13px', fontSize:13, color:'white', outline:'none' }}/>
                {/* Mood send */}
                {vibeInput&&!vibeInput.startsWith('✨') ? (
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <button onClick={generateCosmicInsight} disabled={cosmicLoading || chatLoading}
                      title={lang === 'en' ? 'Cosmic Insight' : 'Wawasan Kosmik'}
                      style={{ width:40, height:40, borderRadius:12, border:'1px solid rgba(99,102,241,0.35)', background:'rgba(99,102,241,0.12)', color:'rgba(99,102,241,0.85)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, transition:'all 0.2s', opacity:cosmicLoading?0.5:1 }}
                      onMouseEnter={e=>{ if(!cosmicLoading){ e.currentTarget.style.background='rgba(99,102,241,0.25)'; e.currentTarget.style.color='#a5b4fc'; } }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.12)'; e.currentTarget.style.color='rgba(99,102,241,0.85)'; }}
                    >{cosmicLoading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : '✨'}</button>
                    <button onClick={()=>{ if(vibeLoading) return; if(!vibeInput.trim()) { setVibeInput(''); } else { searchVibe(); } }}
                      style={{ width:40, height:40, borderRadius:12, border:'none', background:vibeInput.trim()?track.color:'rgba(255,255,255,0.1)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:vibeLoading?0.5:1, flexShrink:0 }}>
                      {vibeLoading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <span style={{fontSize:15}}>🔮</span>}
                    </button>
                  </div>
                ) : (
                  <>
                    
                    {/* ── Mic button — klik untuk tampilkan menu 2 pilihan ── */}
                    {(!shazamListening && !shazamLoading || sttListening) && (
                      <div ref={micMenuRef} style={{ position:'relative', flexShrink:0 }}>
                        <button
                          onClick={() => {
                            if (sttListening) { stopSTT(); return; }
                            setShowMicMenu(v => !v);
                          }}
                          title={sttListening ? 'Hentikan rekaman' : 'Pilih mode mikrofon'}
                          style={{
                            width:40, height:40, borderRadius:12,
                            border: sttListening ? '1px solid #22c55e88' : `1px solid ${track.color}55`,
                            background: sttListening ? 'rgba(34,197,94,0.18)' : showMicMenu ? `${track.color}30` : `${track.color}18`,
                            color: sttListening ? '#22c55e' : track.color,
                            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                            transition:'all 0.2s',
                            animation: sttListening ? 'pulse 1s ease-in-out infinite' : 'none',
                          }}
                        >
                          {sttListening ? <span style={{fontSize:14}}>⏹</span> : <Mic2 size={16}/>}
                        </button>
                        {/* Popup menu 2 pilihan */}
                        {showMicMenu && (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              position:'absolute', bottom:'calc(100% + 8px)', right:0,
                              background:'rgba(18,18,28,0.97)', border:`1px solid ${track.color}44`,
                              borderRadius:14, overflow:'hidden', minWidth:195,
                              boxShadow:'0 8px 32px rgba(0,0,0,0.55)',
                              zIndex:200,
                            }}
                          >
                            <button
                              onClick={() => { setShowMicMenu(false); startShazam(); }}
                              style={{
                                width:'100%', padding:'11px 16px', background:'none', border:'none',
                                color:'white', cursor:'pointer', display:'flex', alignItems:'center',
                                gap:10, fontSize:13, textAlign:'left',
                                borderBottom:'1px solid rgba(255,255,255,0.07)',
                                transition:'background 0.15s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background=`${track.color}22`}
                              onMouseLeave={e => e.currentTarget.style.background='none'}
                            >
                              <Mic2 size={15} style={{ color:track.color, flexShrink:0 }}/>
                              <div>
                                <div style={{ fontWeight:600, fontSize:13 }}>Kenali Lagu</div>
                                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:1 }}>Shazam — dengarkan &amp; identifikasi</div>
                              </div>
                            </button>
                            <button
                              onClick={() => { setShowMicMenu(false); startSTT(); }}
                              style={{
                                width:'100%', padding:'11px 16px', background:'none', border:'none',
                                color:'white', cursor:'pointer', display:'flex', alignItems:'center',
                                gap:10, fontSize:13, textAlign:'left',
                                transition:'background 0.15s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background=`${track.color}22`}
                              onMouseLeave={e => e.currentTarget.style.background='none'}
                            >
                              <span style={{ fontSize:15, flexShrink:0 }}>🎤</span>
                              <div>
                                <div style={{ fontWeight:600, fontSize:13 }}>Bicara ke Teks</div>
                                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:1 }}>Ketik pesan dengan suara</div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {/* ── Chat send button — 🔮 jika kosong, Send jika ada teks ── */}
                    {input.trim() ? (
                      <button onClick={sendChat} disabled={chatLoading}
                        style={{ width:40, height:40, borderRadius:12, border:'none', background:track.color, color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:chatLoading?0.5:1, flexShrink:0 }}>
                        {chatLoading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <Send size={15}/>}
                      </button>
                    ) : (
                      <button onClick={() => setVibeInput(' ')} disabled={chatLoading}
                        title={t?.vibeSearchBtn || 'Vibe Search — cari lagu berdasarkan suasana hati'}
                        style={{ width:40, height:40, borderRadius:12, border:'1px solid rgba(168,85,247,0.35)', background:'rgba(168,85,247,0.12)', color:'rgba(168,85,247,0.85)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:17, transition:'all 0.2s' }}
                        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(168,85,247,0.25)'; e.currentTarget.style.color='#d8b4fe'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background='rgba(168,85,247,0.12)'; e.currentTarget.style.color='rgba(168,85,247,0.85)'; }}
                      >🔮</button>
                    )}
                  </>
                )}
              </div>
            </div>
            )}

          {/* ── Buat Playlist Modal — inline dalam AI panel, sama seperti queue/share */}
          {showPlModal&&<Suspense fallback={null}><PlaylistModal
            allSongs={allSongs}
            existing={editingPl}
            onClose={()=>{ setShowPlModal(false); setEditingPl(null); setPlPrefillName(''); setPlPrefillIds([]); setPendingPlayQueueItems(null); }}
            onSave={editingPl ? updatePlaylist : createPlaylist}
            isLite={isLite}
            t={t}
            prefillName={plPrefillName}
            prefillSongIds={plPrefillIds}
            panelMode={true}
          /></Suspense>}

          {/* ── Tambah ke Playlist Modal — full panel, seragam dengan Buat Playlist Baru */}
          {showAddToModal&&(
            <div style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'stretch' }} onClick={e=>e.target===e.currentTarget&&setShowAddToModal(false)}>
              <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'#0d0d24', border:'none', borderRadius:0 }}>
                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px 12px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(168,85,247,0.25))', border:'1px solid rgba(99,102,241,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <ListPlus size={14} style={{color:'#a78bfa'}}/>
                    </div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:14, color:'white' }}>Tambah ke Playlist</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{addToSongIds.length} lagu akan ditambahkan</div>
                    </div>
                  </div>
                  <button onClick={()=>setShowAddToModal(false)} style={{ width:30, height:30, borderRadius:999, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700 }}>×</button>
                </div>

                {/* Scrollable content */}
                <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'14px 18px 20px' }}>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Pilih Playlist</label>
                    {playlists.filter(pl=>pl.id!=='pl_fav').length === 0 ? (
                      <div style={{ textAlign:'center', padding:'32px 0', color:'rgba(255,255,255,0.35)', fontSize:13 }}>
                        Belum ada playlist. Buat playlist baru dulu.
                      </div>
                    ) : (
                      <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:3 }}>
                        {playlists.filter(pl=>pl.id!=='pl_fav').map(pl => (
                          <button key={pl.id} onClick={()=>{
                            addToSongIds.forEach(sid => addToPlaylist(pl.id, sid));
                            setShowAddToModal(false);
                          }}
                            style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', cursor:'pointer', textAlign:'left', color:'white' }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.15)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                            <div style={{ width:34, height:34, borderRadius:8, background:'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(168,85,247,0.2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🎵</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'rgba(255,255,255,0.8)' }}>{pl.name}</div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{pl.songIds.length} lagu</div>
                            </div>
                            <div style={{ fontSize:12, color:'rgba(99,102,241,0.8)', fontWeight:700, flexShrink:0 }}>+ Tambah</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display:'flex', gap:10, padding:'12px 18px 16px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
                  <button onClick={()=>setShowAddToModal(false)} style={{ flex:1, padding:'12px 0', borderRadius:14, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:700, cursor:'pointer' }}>Batal</button>
                </div>
              </div>
            </div>
          )}
          </div>
        )}
      </main>
      </div>{/* end flex row wrapper */}

      {/* ══ BOTTOM NAV — Mobile Portrait only */}
      {layoutMode === 'mobile-portrait' && !fullscreen && (
        <div ref={bottomNavRef} style={{ position:'relative', zIndex:10, flexShrink:0, display:'flex', flexDirection:'column', background:'rgba(0,0,0,0.18)', borderTop:'1px solid rgba(255,255,255,0.08)' }}>

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
                    : (getCover(track)
                        ? <img src={getCover(track)} style={{ width:36, height:36, borderRadius:9, objectFit:'cover', flexShrink:0 }} onError={e=>{ e.target.onerror=null; e.target.src='/icon-512.png'; }}/>
                        : <div style={{ width:36, height:36, borderRadius:9, background:track.bg||`${track.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Music size={15} color={track.color}/></div>
                      )
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

      {showUpload&&<Suspense fallback={null}><UploadModal onClose={()=>!uploading&&setShowUpload(false)} onUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress} color={track.color} isLite={isLite} t={t}/></Suspense>}

      {/* ══ YOUTUBE HIDDEN AUDIO IFRAME — persistent, single instance ══ */}
      {/* CATATAN: display:none memblokir autoplay di Chrome/mobile — gunakan position off-screen */}
      {embedTrack && embedTrack.type === 'youtube' && (
        <iframe
          ref={ytIframeRef}
          key={embedTrack.videoId}
          src={`https://www.youtube.com/embed/${embedTrack.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`}
          title={embedTrack.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; background-fetch"
          style={{ position:'fixed', top:'-9999px', left:'-9999px', width:320, height:180, pointerEvents:'none', border:'none', zIndex:-1 }}
        />
      )}

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        @keyframes spin20{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes shareSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}

        @keyframes shazamBar{from{height:4px}to{height:18px}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.9)}}
        @keyframes pulse-ring{0%{transform:scale(0.6);opacity:0.8}100%{transform:scale(1.3);opacity:0}}
        @keyframes twinkle{0%,100%{opacity:0.9}50%{opacity:0.35}}
        @keyframes twinkleB{0%,100%{opacity:0.55}50%{opacity:1}}
        @keyframes twinkleC{0%,100%{opacity:0.7}40%{opacity:0.2}80%{opacity:0.9}}
        .stars,.starsB,.starsC{position:absolute;inset:0;will-change:opacity}
        .stars{background-image:radial-gradient(1px 1px at 8% 12%,rgba(255,255,255,0.7),transparent),radial-gradient(1.5px 1.5px at 31% 45%,rgba(255,255,255,0.5),transparent),radial-gradient(1px 1px at 62% 23%,rgba(255,255,255,0.6),transparent),radial-gradient(2px 2px at 78% 67%,rgba(255,255,255,0.35),transparent),radial-gradient(1px 1px at 14% 71%,rgba(255,255,255,0.5),transparent),radial-gradient(1px 1px at 88% 18%,rgba(255,255,255,0.45),transparent),radial-gradient(1.5px 1.5px at 47% 89%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 55% 55%,rgba(255,255,255,0.3),transparent);animation:twinkle 4s ease-in-out infinite}
        .starsB{background-image:radial-gradient(1px 1px at 23% 6%,rgba(255,255,255,0.5),transparent),radial-gradient(1.5px 1.5px at 70% 38%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 5% 52%,rgba(255,255,255,0.55),transparent),radial-gradient(2px 2px at 91% 81%,rgba(255,255,255,0.3),transparent),radial-gradient(1px 1px at 38% 77%,rgba(255,255,255,0.45),transparent),radial-gradient(1px 1px at 66% 9%,rgba(255,255,255,0.35),transparent),radial-gradient(1.5px 1.5px at 18% 93%,rgba(255,255,255,0.3),transparent);animation:twinkleB 5.5s ease-in-out 1.8s infinite}
        .starsC{background-image:radial-gradient(1px 1px at 42% 31%,rgba(255,255,255,0.4),transparent),radial-gradient(1px 1px at 83% 54%,rgba(255,255,255,0.5),transparent),radial-gradient(1.5px 1.5px at 11% 28%,rgba(255,255,255,0.35),transparent),radial-gradient(1px 1px at 75% 92%,rgba(255,255,255,0.3),transparent),radial-gradient(2px 2px at 29% 63%,rgba(255,255,255,0.25),transparent),radial-gradient(1px 1px at 58% 4%,rgba(255,255,255,0.5),transparent);animation:twinkleC 7s ease-in-out 3.2s infinite}
        @keyframes pulse-lamp{0%,100%{opacity:0.55}50%{opacity:0.85}}
        @keyframes pulse-moon{0%,100%{opacity:0.65}50%{opacity:0.95}}
        @keyframes shimmer{0%,100%{opacity:0.20}50%{opacity:0.55}}
        @keyframes drift{0%{transform:translateX(-10px)}100%{transform:translateX(10px)}}
        @keyframes float-orb{0%,100%{transform:translateY(0);opacity:0.65}50%{transform:translateY(-14px);opacity:0.90}}
        @keyframes rain-fall{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes rain-drift{0%{transform:translate(0,0)}100%{transform:translate(40px,60px)}}
        @keyframes wave-move{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes scan-move{0%{top:-2px;opacity:0}5%{opacity:0.5}95%{opacity:0.2}100%{top:100%;opacity:0}}
        @keyframes city-flicker{0%,100%{opacity:1}48%{opacity:1}50%{opacity:0.6}52%{opacity:1}80%{opacity:1}82%{opacity:0.75}84%{opacity:1}}
        @keyframes sparkle-twinkle{0%,100%{opacity:0.25}50%{opacity:0.85}}
        .rain-layer{position:absolute;inset:0;background-image:repeating-linear-gradient(to bottom right,transparent 0px,transparent 6px,rgba(180,210,255,0.07) 6px,rgba(180,210,255,0.07) 7px);background-size:100px 100px;animation:rain-drift 4s linear infinite;will-change:transform;pointer-events:none;opacity:0.7}
        /* PRO: perlambat rain drift — tetap pakai transform (compositor-only, no repaint) */
        .pro-mode .rain-layer{animation-duration:8s}
        .wave-layer{position:absolute;bottom:0;left:0;right:0;height:22%;background:linear-gradient(180deg,transparent 0%,rgba(10,60,100,0.35) 100%);overflow:hidden}
        .city-layer{position:absolute;bottom:0;left:0;right:0;height:38%;background:linear-gradient(to top,rgba(0,15,25,0.85) 0%,transparent 100%);pointer-events:none}
        .scan-line{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,220,180,0.12),transparent);animation:scan-move 12s linear infinite;will-change:transform,opacity;pointer-events:none}
        /* PRO: scan-line lebih lambat — kurangi GPU overdraw */
        .pro-mode .scan-line{animation-duration:24s}
        .sparkle-layer{position:absolute;inset:0;background-image:radial-gradient(1.5px 1.5px at 15% 25%,rgba(255,180,255,0.7),transparent),radial-gradient(1px 1px at 55% 15%,rgba(180,255,255,0.6),transparent),radial-gradient(2px 2px at 80% 40%,rgba(255,200,100,0.5),transparent),radial-gradient(1px 1px at 30% 70%,rgba(200,100,255,0.7),transparent),radial-gradient(1.5px 1.5px at 70% 80%,rgba(255,100,200,0.5),transparent);animation:sparkle-twinkle 6s ease-in-out infinite}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        input::placeholder{color:rgba(148,163,184,0.35)}
        input[type=range]{cursor:pointer;height:4px;border-radius:999px}

        /* ══ LAYOUT MODE — Mobile Portrait ══ */
        .layout-mobile-portrait header {
          background: rgba(0,0,0,0.18);
          
        }

        /* ══ LAYOUT MODE — Mobile Landscape ══ */
        .layout-mobile-landscape header {
          background: rgba(0,0,0,0.18);
          
          border-bottom-color: rgba(255,255,255,0.05);
        }
        /* In mobile-landscape: player inner layout is row, ring left, controls right */
        .layout-mobile-landscape main {
          overflow-y: auto;
        }

        /* ══ LAYOUT MODE — Desktop Portrait ══ */
        .layout-desktop-portrait header {
          background: rgba(0,0,0,0.18);
          
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        /* Desktop portrait sidebar gets a subtle gradient separator */
        .layout-desktop-portrait [data-sidebar] {
          background: linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.12) 100%);
        }

        /* ══ LAYOUT MODE — Desktop Landscape ══ */
        .layout-desktop-landscape header {
          background: rgba(0,0,0,0.18);
          
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
          .lite-mode header{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:rgba(0,0,0,0.18)!important}
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

          /* ══ PAGE HIDDEN: pause SEMUA animasi saat tab background — berlaku di lite-mode DAN pro-mode ══
             Ditulis di luar blok mode agar spesifisitasnya cukup menang atas semua override di atas */
          .page-hidden *:not(iframe){animation-play-state:paused!important}
          /* Khusus pro-mode: pastikan selector lebih spesifik dari .pro-mode [style*=...] rules */
          .pro-mode.page-hidden *:not(iframe){animation-play-state:paused!important}

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


