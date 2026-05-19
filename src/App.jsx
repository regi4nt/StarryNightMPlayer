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
  PenLine, ChevronLeft, Radio, Maximize2, Minimize2,
  Download, Share2, Wand2, Copy, Check, Star, Headphones as HeadphonesIcon, BookOpen, Waves, RefreshCw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
//  TRANSLATIONS — id (Indonesia) & en (English)
// ═══════════════════════════════════════════════════════
const T = {
  id: {
    settings: 'Settings',
    language: 'Bahasa',
    languageDesc: 'Pilih bahasa tampilan aplikasi',
    equalizer: 'Equalizer',
    crossfade: 'Crossfade',
    sleepTimer: 'Sleep Timer',
    sleepTimerOff: 'Mati',
    sleepTimerSec: '8 detik',
    sleepTimerCancel: 'Batal',
    sleepTimerMsg: 'Musik berhenti dalam',
    globalCover: 'Foto Cover Global',
    globalCoverDesc: 'Terapkan satu foto ke semua lagu',
    customDns: 'DNS Kustom',
    customDnsDesc: 'Ubah DNS untuk memblokir iklan / meningkatkan privasi',
    customDnsNote: 'Pengaturan DNS di browser terbatas. Untuk DNS penuh, ubah juga di:',
    customDnsActive: 'Aktif',
    modeLite: 'Mode',
    modeLiteDesc: 'Hemat data · tanpa animasi · load cepat',
    modeProDesc: 'Animasi penuh · cover art · fitur AI',
    installApp: 'Install Sebagai App',
    installAppDesc: 'Desktop & Mobile — tanpa toko aplikasi',
    installNow: 'Install Sekarang',
    installedMsg: 'Sudah terinstall!',
    installedDesc: 'Buka dari layar utama atau app launcher',
    installManual: 'Cara install manual:',
    offline: 'Offline — Lagu yang diunduh tetap bisa diputar',
    cachedSongs: 'lagu tersimpan',
    search: 'Cari',
    player: 'Player',
    pengaturan: 'Settings',
    liteFeatures: [
      ['⚡ Cover art dinonaktifkan', 'Gambar album tidak dimuat — halaman lebih ringan'],
      ['⚡ Audio preload: none', 'Audio hanya dimuat saat diputar, menghemat bandwidth'],
      ['⚡ Drive: streaming adaptif', 'Hanya buffer ~30 detik ke depan, tidak simpan ke cache — hemat data & storage'],
      ['⚡ Prefetch Drive dinonaktifkan', 'Lagu tidak di-unduh di background'],
      ['⚡ AI & Insight dinonaktifkan', 'Starry AI, Vibe Search, dan Wawasan Kosmik dimatikan'],
      ['⚡ Lirik: database publik saja', 'Mencari dari lyrics.ovh — tanpa AI generate jika tidak ditemukan'],
      ['⚡ Animasi dinonaktifkan', 'Semua efek visual dan blur dimatikan untuk performa maksimal'],
    ],
    proFeatures: [
      ['✨ Cover art aktif', 'Gambar album dimuat dari internet'],
      ['✨ Audio preload: auto', 'Buffer audio disiapkan lebih awal untuk playback instan'],
      ['✨ Drive: unduh & cache penuh', 'File diunduh seluruhnya & disimpan untuk playback offline'],
      ['✨ Prefetch Drive aktif', 'Lagu berikutnya di-cache di background'],
      ['✨ AI & Insight aktif', 'Starry AI, Vibe Search, dan Wawasan Kosmik tersedia'],
      ['✨ Lirik: database + AI', 'Cari dari lyrics.ovh, fallback ke Starry AI generate lirik'],
      ['✨ Animasi penuh', 'Bintang-bintang, blur, dan efek visual lengkap'],
    ],
    liteTitle: 'Mode Lite aktif (hemat data) — ketuk untuk Pro',
    proTitle: 'Mode Pro — ketuk untuk Lite (hemat data)',
    // UI strings
    queue: 'Antrean',
    queueEmpty: 'Antrean kosong',
    queueYtEmpty: 'Antrean YouTube kosong',
    queueNoStation: 'Tidak ada stasiun',
    like: 'Suka',
    addToFav: 'Tambah ke Favorit',
    removeFromFav: 'Hapus dari Favorit',
    saveFav: 'Simpan ke Favorit',
    addToPlaylistBtn: 'Tambah ke Playlist',
    addToPlaylistHeader: 'Tambah ke',
    fullscreenBtn: 'Layar Penuh',
    exitFullscreenBtn: 'Keluar Layar Penuh',
    closeStreamBtn: 'Tutup Stream',
    closeRadioBtn: 'Keluar Radio',
    closeBtn: 'Tutup ✕',
    settingsFailed: 'Pengaturan gagal dimuat',
    globalCoverAll: 'Foto Cover Semua Lagu',
    dnsNote: 'Ubah DNS untuk mempercepat atau membuka blokir konten',
    offlineBanner: 'Offline — Lagu yang diunduh tetap bisa diputar',
    refreshBtn: '↺ Refresh',
    reloginBtn: 'Login Ulang',
    loadingDrive: 'Memuat dari Google Drive…',
    downloadingTrack: 'Mengunduh lagu…',
    searchingYt: 'Mencari di YouTube…',
    searchingSc: 'Mencari di SoundCloud…',
    searchingSp: 'Mencari di Spotify…',
    searchingWeb: 'Mencari di Web…',
    noResults: 'Tidak ada hasil ditemukan.',
    searchFailed: 'Pencarian gagal.',
    noAudioFound: 'Tidak ada file audio ditemukan',
    fileExtHint: 'Pastikan file berekstensi',
    loginForSongs: 'Masuk dengan Google untuk melihat lagu',
    loginRequired: 'Login Google dulu',
    loginRequiredAlert: 'Login Google dulu!',
    noPlayback: 'Lagu ini belum diunduh. Sambungkan ke internet dan putar sekali untuk menyimpan offline.',
    editPlaylist: 'Edit Playlist',
    newPlaylist: 'Buat Playlist Baru',
    songsSelected: 'lagu dipilih',
    playlistNamePlaceholder: 'Nama playlist kamu...',
    selectSongs: 'Pilih Lagu',
    cancelBtn: 'Batal',
    saveChanges: 'Simpan Perubahan',
    createPlaylistBtn: 'Buat Playlist',
    addSong: 'Tambah Lagu',
    uploadToDrive: 'Upload ke Google Drive',
    dropOrTap: 'Ketuk atau drag & drop',
    dropHere: 'Lepas di sini!',
    uploading: 'Mengupload…',
    uploadBtn: 'Upload ke Drive',
    selectFileFirst: 'Pilih file dulu!',
    selectAudioFile: 'Pilih file audio',
    allSongs: 'Semua Lagu',
    mySongs: 'Lagu Saya',
    myPlaylists: 'Playlist Kamu',
    noPlaylistYet: 'Belum ada playlist',
    createFirstPlaylist: 'Ketuk "Baru" untuk membuat playlist pertamamu',
    noHistory: 'Belum ada riwayat pemutaran',
    loadingDriveShort: 'Memuat dari Drive…',
    songsCount: 'lagu',
    songsAvailable: 'lagu tersedia',
    songsFromDrive: 'lagu dari Google Drive',
    lastSongs: 'lagu terakhir',
    lyricsShow: 'Tampilkan Lirik',
    lyricsRefresh: 'Refresh',
    lyricsSearchingLite: 'Mencari lirik…',
    lyricsSearchingPro: 'Starry AI sedang menulis lirik…',
    lyricsNotFound: 'Lirik tidak tersedia',
    lyricsHintLite: 'Ketuk "Tampilkan Lirik" untuk cari dari database publik',
    lyricsHintPro: 'Ketuk "Tampilkan Lirik" untuk generate lirik AI',
    lyricsNotFoundResult: 'Lirik tidak ditemukan',
    lyricsSourceLite: '🎵 Lirik dari database publik (lyrics.ovh).',
    lyricsSourcePro: '✨ Lirik dari database publik. Jika tidak tersedia, Starry AI akan membuatkan lirik berdasarkan judul dan mood lagu.',
    lyricsSearchBtn: 'Cari...',
    vibeInputPlaceholder: 'Tanya AI atau ketik mood…',
    vibeMoodPlaceholder: '"chill", "energetic morning", "sad but beautiful"…',
    aiOffline: 'Offline — tambahkan API key',
    checkingStation: 'Memeriksa koneksi stasiun…',
    noStationAvail: 'Tidak ada stasiun tersedia',
    stationsPopular: 'stasiun populer',
    retryStations: 'Ulangi',
    newBtn: 'Baru',
    orUploadHint: 'Atau ketuk "Unggah Lagu ke Drive" di atas untuk menambah lagu',
    miniPlayerHint: 'Ketuk untuk player',
    deletePlaylistConfirm: 'Hapus playlist ini?',
    googleDnsLabel: 'Google DNS — cepat & stabil',
    musicCollection: 'Koleksi Musik',
    recentlyPlayed: 'Baru Dimainkan',
    playBtn: 'Putar',
    editBtn: 'Edit',
    deleteBtn: 'Hapus',
    playAllBtn: 'Putar Semua',
    streamingPlatforms: 'Platform Streaming',
    lyricsTab: 'Lirik',
    lyricsLiteDisabledTitle: 'Lirik tidak ditemukan',
    lyricsLiteDisabledMsg: 'Mode Lite aktif — AI generate lirik dinonaktifkan untuk hemat data.\nAktifkan Mode Pro untuk generate lirik dengan AI.',
    switchToProBtn: '✨ Beralih ke Mode Pro',
    vibeMoodTitle: '🔮 Mood',
    resetBtn: '× Reset',
    searchYouTube: 'Cari di YouTube',
    searchBtn: 'Cari',
    changeCover: 'Ganti Foto',
    chooseCover: 'Pilih Foto',
    deleteCover: 'Hapus Foto',
    coverApplied: 'Foto diterapkan ke semua lagu · Tersimpan di browser',
    liteAiDisabled: '⚡ Mode Lite aktif — AI chat dinonaktifkan. Ketuk tombol Lite ⚡ di header untuk beralih ke mode Pro.',
    liteInsightDisabled: '⚡ Mode Lite aktif — fitur AI dinonaktifkan.',
    liteVibeDisabled: '⚡ Mode Lite aktif — Vibe Search dinonaktifkan',
    liteLyricsDisabled: '⚡ Lirik tidak ditemukan di database publik.\n\nMode Lite aktif — AI generate lirik dinonaktifkan untuk hemat data.\n\nAktifkan Mode Pro untuk generate lirik dengan AI.',
    aiSystemPrompt: 'Kamu Starry AI — teman ngobrol yang hangat, seru, dan serba bisa. Kepribadianmu: santai, friendly, sedikit playful, tapi tetap bisa serius kalau diperlukan. Bahasa Indonesia kasual/gaul, bukan formal. Jawab singkat dan natural (maks 100 kata), jangan kaku seperti chatbot. Kamu bisa ngobrol soal apa saja: musik, cerita harian, perasaan, rekomendasi film/buku/tempat, trivia, jokes, motivasi, atau sekadar temani.',
  },
  en: {
    settings: 'Settings',
    language: 'Language',
    languageDesc: 'Choose the display language',
    equalizer: 'Equalizer',
    crossfade: 'Crossfade',
    sleepTimer: 'Sleep Timer',
    sleepTimerOff: 'Off',
    sleepTimerSec: '8 seconds',
    sleepTimerCancel: 'Cancel',
    sleepTimerMsg: 'Music stops in',
    globalCover: 'Global Cover Photo',
    globalCoverDesc: 'Apply one photo to all songs',
    customDns: 'Custom DNS',
    customDnsDesc: 'Change DNS to block ads / improve privacy',
    customDnsNote: 'Browser DNS settings are limited. For full DNS, also change it in:',
    customDnsActive: 'Active',
    modeLite: 'Mode',
    modeLiteDesc: 'Save data · no animations · fast load',
    modeProDesc: 'Full animations · cover art · AI features',
    installApp: 'Install as App',
    installAppDesc: 'Desktop & Mobile — no app store needed',
    installNow: 'Install Now',
    installedMsg: 'Already installed!',
    installedDesc: 'Open from home screen or app launcher',
    installManual: 'Manual install steps:',
    offline: 'Offline — Downloaded songs can still be played',
    cachedSongs: 'songs saved',
    search: 'Search',
    player: 'Player',
    pengaturan: 'Settings',
    liteFeatures: [
      ['⚡ Cover art disabled', 'Album images not loaded — lighter page'],
      ['⚡ Audio preload: none', 'Audio loaded only when played, saving bandwidth'],
      ['⚡ Drive: adaptive streaming', 'Buffers ~30s ahead only, no cache — saves data & storage'],
      ['⚡ Drive prefetch disabled', 'Songs not downloaded in background'],
      ['⚡ AI & Insights disabled', 'Starry AI, Vibe Search, and Cosmic Insights are off'],
      ['⚡ Lyrics: public database only', 'Searches from lyrics.ovh — no AI generation if not found'],
      ['⚡ Animations disabled', 'All visual effects and blur disabled for max performance'],
    ],
    proFeatures: [
      ['✨ Cover art active', 'Album images loaded from the internet'],
      ['✨ Audio preload: auto', 'Audio buffer prepared early for instant playback'],
      ['✨ Drive: full download & cache', 'Files fully downloaded & saved for offline playback'],
      ['✨ Drive prefetch active', 'Next song cached in background'],
      ['✨ AI & Insights active', 'Starry AI, Vibe Search, and Cosmic Insights available'],
      ['✨ Lyrics: database + AI', 'Search from lyrics.ovh, fallback to Starry AI lyrics'],
      ['✨ Full animations', 'Stars, blur, and full visual effects'],
    ],
    liteTitle: 'Lite Mode active (save data) — tap for Pro',
    proTitle: 'Pro Mode — tap for Lite (save data)',
    // UI strings
    queue: 'Queue',
    queueEmpty: 'Queue is empty',
    queueYtEmpty: 'YouTube queue is empty',
    queueNoStation: 'No stations',
    like: 'Like',
    addToFav: 'Add to Favorites',
    removeFromFav: 'Remove from Favorites',
    saveFav: 'Save to Favorites',
    addToPlaylistBtn: 'Add to Playlist',
    addToPlaylistHeader: 'Add to',
    fullscreenBtn: 'Fullscreen',
    exitFullscreenBtn: 'Exit Fullscreen',
    closeStreamBtn: 'Close Stream',
    closeRadioBtn: 'Exit Radio',
    closeBtn: 'Close ✕',
    settingsFailed: 'Settings failed to load',
    globalCoverAll: 'Cover Photo for All Songs',
    dnsNote: 'Change DNS to speed up or unblock content',
    offlineBanner: 'Offline — Downloaded songs can still be played',
    refreshBtn: '↺ Refresh',
    reloginBtn: 'Re-login',
    loadingDrive: 'Loading from Google Drive…',
    downloadingTrack: 'Downloading track…',
    searchingYt: 'Searching YouTube…',
    searchingSc: 'Searching SoundCloud…',
    searchingSp: 'Searching Spotify…',
    searchingWeb: 'Searching Web…',
    noResults: 'No results found. Try a different keyword.',
    searchFailed: 'Search failed. Try another keyword or open YouTube directly.',
    noAudioFound: 'No audio files found',
    fileExtHint: 'Make sure files have extension',
    loginForSongs: 'Sign in with Google to see songs',
    loginRequired: 'Sign in with Google first',
    loginRequiredAlert: 'Please sign in with Google first!',
    noPlayback: 'This song has not been downloaded. Connect to the internet and play it once to save offline.',
    editPlaylist: 'Edit Playlist',
    newPlaylist: 'New Playlist',
    songsSelected: 'songs selected',
    playlistNamePlaceholder: 'Playlist name...',
    selectSongs: 'Select Songs',
    cancelBtn: 'Cancel',
    saveChanges: 'Save Changes',
    createPlaylistBtn: 'Create Playlist',
    addSong: 'Add Song',
    uploadToDrive: 'Upload to Google Drive',
    dropOrTap: 'Tap or drag & drop',
    dropHere: 'Drop it here!',
    uploading: 'Uploading…',
    uploadBtn: 'Upload to Drive',
    selectFileFirst: 'Please select a file first!',
    selectAudioFile: 'Select an audio file',
    allSongs: 'All Songs',
    mySongs: 'My Songs',
    myPlaylists: 'Your Playlists',
    noPlaylistYet: 'No playlists yet',
    createFirstPlaylist: 'Tap "New" to create your first playlist',
    noHistory: 'No playback history yet',
    loadingDriveShort: 'Loading from Drive…',
    songsCount: 'songs',
    songsAvailable: 'songs available',
    songsFromDrive: 'songs from Google Drive',
    lastSongs: 'recent songs',
    lyricsShow: 'Show Lyrics',
    lyricsRefresh: 'Refresh',
    lyricsSearchingLite: 'Searching for lyrics…',
    lyricsSearchingPro: 'Starry AI is writing lyrics…',
    lyricsNotFound: 'Lyrics not available',
    lyricsHintLite: 'Tap "Show Lyrics" to search from public database',
    lyricsHintPro: 'Tap "Show Lyrics" to generate lyrics with AI',
    lyricsNotFoundResult: 'Lyrics not found',
    lyricsSourceLite: '🎵 Lyrics from public database (lyrics.ovh).',
    lyricsSourcePro: '✨ Lyrics from public database. If unavailable, Starry AI will generate lyrics based on title and mood.',
    lyricsSearchBtn: 'Search...',
    vibeInputPlaceholder: 'Ask AI or type a mood…',
    vibeMoodPlaceholder: '"chill", "energetic morning", "sad but beautiful"…',
    aiOffline: 'Offline — add API key',
    checkingStation: 'Checking station connection…',
    noStationAvail: 'No stations available',
    stationsPopular: 'popular stations',
    retryStations: 'Retry',
    newBtn: 'New',
    orUploadHint: 'Or tap "Upload Song to Drive" above to add songs',
    miniPlayerHint: 'Tap for player',
    deletePlaylistConfirm: 'Delete this playlist?',
    googleDnsLabel: 'Google DNS — fast & stable',
    musicCollection: 'Music Collection',
    recentlyPlayed: 'Recently Played',
    playBtn: 'Play',
    editBtn: 'Edit',
    deleteBtn: 'Delete',
    playAllBtn: 'Play All',
    streamingPlatforms: 'Streaming Platforms',
    lyricsTab: 'Lyrics',
    lyricsLiteDisabledTitle: 'Lyrics not found',
    lyricsLiteDisabledMsg: 'Lite Mode active — AI lyrics generation is disabled to save data.\nEnable Pro Mode to generate lyrics with AI.',
    switchToProBtn: '✨ Switch to Pro Mode',
    vibeMoodTitle: '🔮 Mood',
    resetBtn: '× Reset',
    searchYouTube: 'Search on YouTube',
    searchBtn: 'Search',
    changeCover: 'Change Photo',
    chooseCover: 'Choose Photo',
    deleteCover: 'Remove Photo',
    coverApplied: 'Photo applied to all songs · Saved in browser',
    liteAiDisabled: '⚡ Lite Mode active — AI chat is disabled. Tap the Lite ⚡ button in the header to switch to Pro Mode.',
    liteInsightDisabled: '⚡ Lite Mode active — AI features disabled.',
    liteVibeDisabled: '⚡ Lite Mode active — Vibe Search disabled',
    liteLyricsDisabled: '⚡ Lyrics not found in public database.\n\nLite Mode active — AI lyrics generation is disabled to save data.\n\nEnable Pro Mode to generate lyrics with AI.',
    aiSystemPrompt: 'You are Starry AI — a warm, fun, and versatile chat companion. Your personality: relaxed, friendly, a bit playful, but can be serious when needed. Use casual English. Answer briefly and naturally (max 100 words), not like a stiff chatbot. You can talk about anything: music, daily life, feelings, movie/book/place recommendations, trivia, jokes, motivation, or just hang out. Context: the user is listening to',
  },
};


// ═══════════════════════════════════════════════════════
//  STREAMING PLATFORMS — search & redirect ke platform
// ═══════════════════════════════════════════════════════
// Helper: buka URL di tab baru dengan cara yang reliable di semua browser/PWA
function openNewTab(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const STREAMING_PLATFORMS = [
  {
    id: 'ytmusic',
    name: 'YouTube',
    icon: '🔴',
    embedType: 'youtube',
    description: 'Cari & putar langsung dalam app via YouTube',
    color: '#FF0000',
    logo: null, // use inline SVG
    searchUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    openUrl: 'https://www.youtube.com',
    hint: 'Cari lagu, artis, atau tempel link YouTube…',
  },
  {
    id: 'websearch',
    name: 'Web',
    icon: '🌐',
    embedType: 'websearch',
    description: 'SoundCloud · Spotify · Jamendo · FMA · ccMixter · archive.org & lainnya',
    color: '#6366f1',
    logo: null,
    openUrl: 'https://www.youtube.com',
    hint: 'Cari lagu/artis — SoundCloud, Spotify, Jamendo, Vimeo, Audiomack, Mixcloud…',
  },
  {
    id: 'radio',
    name: 'Radio',
    icon: '📻',
    embedType: 'radio',
    description: 'Radio populer dunia · 10 negara populer · genre lengkap',
    color: '#f59e0b',
    logo: null,
    openUrl: 'https://www.radio.net',
    hint: 'Pilih negara, genre, lalu stasiun…',
    countries: [
      {
        id: 'us', name: 'Amerika Serikat', flag: '🇺🇸', color: '#3b82f6',
        genres: [
          { id: 'pop', name: 'Pop / Top 40', icon: '🎵', color: '#3b82f6', stations: [
            { id: 'z100', name: 'Z100 New York', city: 'New York', url: 'https://ice1.somafm.com/u80s-128-mp3' },
            { id: 'kiis', name: 'KIIS FM', city: 'Los Angeles', url: 'https://ice6.somafm.com/poptron-128-mp3' },
            { id: 'hot97', name: 'HOT 97', city: 'New York', url: 'https://ice1.somafm.com/hiphop-128-mp3' },
            { id: 'poptron', name: 'PopTron', city: 'San Francisco', url: 'https://ice1.somafm.com/poptron-128-mp3' },
            { id: 'iheartpop', name: 'iHeart Top 40', city: 'National', url: 'https://ice1.somafm.com/poptron-128-mp3' },
          ]},
          { id: 'rock', name: 'Rock / Alternative', icon: '🎸', color: '#ef4444', stations: [
            { id: 'kroq', name: 'KROQ Alt Rock', city: 'Los Angeles', url: 'https://ice1.somafm.com/seventies-128-mp3' },
            { id: 'metal-det', name: 'Metal Detector', city: 'San Francisco', url: 'https://ice1.somafm.com/metal-128-mp3' },
            { id: 'indie-pop', name: 'Indie Pop Rocks', city: 'San Francisco', url: 'https://ice1.somafm.com/indiepop-128-mp3' },
            { id: 'folkfwd', name: 'Folk Forward', city: 'San Francisco', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
            { id: 'q101', name: 'Q101 Chicago', city: 'Chicago', url: 'https://ice1.somafm.com/punk-128-mp3' },
          ]},
          { id: 'country', name: 'Country', icon: '🤠', color: '#92400e', stations: [
            { id: 'wsm', name: 'WSM 650 AM', city: 'Nashville', url: 'https://ice1.somafm.com/country-128-mp3' },
            { id: 'kkbq', name: 'Big 100', city: 'Houston', url: 'https://ice6.somafm.com/country-128-mp3' },
            { id: 'kson', name: 'KSON', city: 'San Diego', url: 'https://ice2.somafm.com/country-128-mp3' },
            { id: 'folkfwd2', name: 'Folk & Americana', city: 'San Francisco', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
            { id: 'nash-fm', name: 'Nash FM Country', city: 'New York', url: 'https://ice4.somafm.com/country-128-mp3' },
          ]},
          { id: 'jazz', name: 'Jazz / Blues', icon: '🎷', color: '#7c3aed', stations: [
            { id: 'wbgo', name: 'WBGO Jazz 88.3', city: 'New York', url: 'https://wbgo.org/listen/high' },
            { id: 'wpfw', name: 'WPFW Jazz', city: 'Washington DC', url: 'https://ice1.somafm.com/jazz-128-mp3' },
            { id: 'sonicuniverse', name: 'Sonic Universe', city: 'San Francisco', url: 'https://ice1.somafm.com/sonicuniverse-128-mp3' },
            { id: 'sf1033', name: 'SF in SF Jazz', city: 'San Francisco', url: 'https://ice1.somafm.com/sf1033-128-mp3' },
            { id: 'kkjz', name: 'KKJZ Jazz & Blues', city: 'Long Beach', url: 'https://ice1.somafm.com/sonicuniverse-128-mp3' },
          ]},
          { id: 'news', name: 'News / Talk', icon: '📰', color: '#64748b', stations: [
            { id: 'npr', name: 'NPR News', city: 'National', url: 'https://npr-ice.streamguys1.com/live.mp3' },
            { id: 'cnn-radio', name: 'CNN Radio', city: 'Atlanta', url: 'https://ice1.somafm.com/thetrip-128-mp3' },
            { id: 'wtop', name: 'WTOP News 103.5', city: 'Washington DC', url: 'https://ice1.somafm.com/thetrip-256-mp3' },
            { id: 'kcbs', name: 'KCBS News Radio', city: 'San Francisco', url: 'https://ice2.somafm.com/thetrip-128-mp3' },
            { id: 'abc-radio', name: 'ABC News Radio', city: 'New York', url: 'https://ice4.somafm.com/thetrip-128-mp3' },
          ]},
        ],
      },
      {
        id: 'uk', name: 'Inggris', flag: '🇬🇧', color: '#e11d48',
        genres: [
          { id: 'pop', name: 'Pop / Chart', icon: '🎵', color: '#e11d48', stations: [
            { id: 'bbc-r1', name: 'BBC Radio 1', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one' },
            { id: 'heart', name: 'Heart FM', city: 'London', url: 'https://media-ice.musicradio.com/HeartUKMP3' },
            { id: 'capital', name: 'Capital FM', city: 'London', url: 'https://media-ice.musicradio.com/CapitalUKMP3' },
            { id: 'absolute', name: 'Absolute Radio', city: 'London', url: 'https://media-ice.musicradio.com/AbsoluteRadioMP3' },
            { id: 'radio-x', name: 'Radio X', city: 'London', url: 'https://media-ice.musicradio.com/RadioXUKMP3' },
          ]},
          { id: 'rock', name: 'Rock / Alternative', icon: '🎸', color: '#dc2626', stations: [
            { id: 'kerrang', name: 'Kerrang! Radio', city: 'Birmingham', url: 'https://media-ice.musicradio.com/KerrangMP3' },
            { id: 'planet-rock', name: 'Planet Rock', city: 'London', url: 'https://media-ice.musicradio.com/PlanetRockMP3' },
            { id: 'absolute-rock', name: 'Absolute Radio Rock', city: 'London', url: 'https://media-ice.musicradio.com/AbsoluteRadioRockMP3' },
            { id: 'bbc-r2', name: 'BBC Radio 2', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_two' },
            { id: 'magic-105', name: 'Magic 105.4', city: 'London', url: 'https://media-ice.musicradio.com/Magic105MP3' },
          ]},
          { id: 'classical', name: 'Classical / Jazz', icon: '🎻', color: '#7c3aed', stations: [
            { id: 'bbc-r3', name: 'BBC Radio 3', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three' },
            { id: 'classic-fm', name: 'Classic FM', city: 'London', url: 'https://media-ice.musicradio.com/ClassicFMMP3' },
            { id: 'smooth', name: 'Smooth Radio', city: 'London', url: 'https://media-ice.musicradio.com/SmoothUKMP3' },
            { id: 'jazz-fm', name: 'Jazz FM', city: 'London', url: 'https://streaming.radio.co/s2a648cde8/listen' },
            { id: 'lyric', name: 'Lyric FM', city: 'Dublin', url: 'https://icecast.rte.ie/lyricfm.mp3' },
          ]},
          { id: 'dance', name: 'Dance / Electronic', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'kiss-uk', name: 'KISS Fresh', city: 'London', url: 'https://media-ice.musicradio.com/KISSFRESHMP3' },
            { id: 'uk-jazz', name: 'UK Jazz Radio', city: 'Birmingham', url: 'https://streaming.radio.co/s6bd53445e/listen' },
            { id: 'absolute-80s', name: 'Absolute 80s', city: 'London', url: 'https://media-ice.musicradio.com/Absolute80sMP3' },
            { id: 'magic-chilled', name: 'Magic Chilled', city: 'London', url: 'https://media-ice.musicradio.com/MagicChilledMP3' },
            { id: 'capital-xtra', name: 'Capital XTRA', city: 'London', url: 'https://media-ice.musicradio.com/CapitalXtraMP3' },
          ]},
          { id: 'news', name: 'News / Talk', icon: '📰', color: '#64748b', stations: [
            { id: 'bbc-world', name: 'BBC World Service', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
            { id: 'bbc-r4', name: 'BBC Radio 4', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm' },
            { id: 'lbc', name: 'LBC News', city: 'London', url: 'https://media-ice.musicradio.com/LBCMP3' },
            { id: 'times-radio', name: 'Times Radio', city: 'London', url: 'https://timesradio.wireless.radio/stream' },
            { id: 'smooth-country', name: 'Smooth Country', city: 'London', url: 'https://media-ice.musicradio.com/SmoothCountryMP3' },
          ]},
        ],
      },
      {
        id: 'fr', name: 'Prancis', flag: '🇫🇷', color: '#3b82f6',
        genres: [
          { id: 'pop', name: 'Pop / Variété', icon: '🎵', color: '#3b82f6', stations: [
            { id: 'nrj', name: 'NRJ', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3' },
            { id: 'nostalgie', name: 'Nostalgie', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30700/mp3_128.mp3' },
            { id: 'cherie', name: 'Chérie FM', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30201/mp3_128.mp3' },
            { id: 'france-inter', name: 'France Inter', city: 'Paris', url: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3' },
            { id: 'europe1', name: 'Europe 1', city: 'Paris', url: 'https://stream.europe1.fr/europe1.mp3' },
          ]},
          { id: 'dance', name: 'Dance / Électro', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'djam', name: 'DJAM Radio', city: 'Paris', url: 'https://streams.fluxfm.de/Clubbing/mp3-128/streams.fluxfm.de/' },
            { id: 'fip', name: 'FIP Radio', city: 'Paris', url: 'https://icecast.radiofrance.fr/fip-midfi.mp3' },
            { id: 'maxxi', name: 'Maxxi Radio', city: 'Paris', url: 'https://streams.fluxfm.de/Electro/mp3-128/streams.fluxfm.de/' },
            { id: 'galaxie', name: 'Galaxie Radio', city: 'Paris', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
            { id: 'techno-fr', name: 'Techno France', city: 'Paris', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
          ]},
          { id: 'classical', name: 'Classique / Jazz', icon: '🎻', color: '#7c3aed', stations: [
            { id: 'france-musique', name: 'France Musique', city: 'Paris', url: 'https://icecast.radiofrance.fr/francemusique-midfi.mp3' },
            { id: 'radio-classique', name: 'Radio Classique', city: 'Paris', url: 'https://radioclassique.ice.infomaniak.ch/radioclassique-high' },
            { id: 'rfi-jazz', name: 'RFI Musique Jazz', city: 'Paris', url: 'https://icecast.radiofrance.fr/rfijazz-midfi.mp3' },
            { id: 'tsfjazz', name: 'TSF Jazz', city: 'Paris', url: 'https://tsfjazz.ice.infomaniak.ch/tsfjazz-high' },
            { id: 'fip2', name: 'FIP Jazz', city: 'Paris', url: 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3' },
          ]},
          { id: 'rnb', name: 'R&B / Soul', icon: '🎶', color: '#f59e0b', stations: [
            { id: 'm80', name: 'M80 Radio', city: 'Online', url: 'https://ice1.somafm.com/lounge-128-mp3' },
            { id: 'mezzo', name: 'Mezzo Radio', city: 'Paris', url: 'https://ice1.somafm.com/poptron-128-mp3' },
            { id: 'smooth-fr', name: 'Smooth Radio FR', city: 'Paris', url: 'https://ice1.somafm.com/indiepop-128-mp3' },
            { id: 'urbaine', name: 'Radio Urbaine', city: 'Paris', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
            { id: 'nrj-hits', name: 'NRJ Hits', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3' },
          ]},
          { id: 'news', name: 'Info / Actualités', icon: '📰', color: '#64748b', stations: [
            { id: 'france-info', name: 'Franceinfo', city: 'Paris', url: 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3' },
            { id: 'rfi', name: 'RFI Monde', city: 'Paris', url: 'https://icecast.radiofrance.fr/rfi-midfi.mp3' },
            { id: 'bfm-fr', name: 'BFM Business', city: 'Paris', url: 'https://ice1.somafm.com/lush-128-mp3' },
            { id: 'france-info2', name: 'France Culture', city: 'Paris', url: 'https://icecast.radiofrance.fr/franceculture-midfi.mp3' },
            { id: 'rmc', name: 'RMC Info', city: 'Paris', url: 'https://ice1.somafm.com/u80s-128-mp3' },
          ]},
        ],
      },
      {
        id: 'de', name: 'Jerman', flag: '🇩🇪', color: '#fbbf24',
        genres: [
          { id: 'pop', name: 'Pop / Charts', icon: '🎵', color: '#fbbf24', stations: [
            { id: 'antenne', name: 'Antenne Bayern', city: 'Munich', url: 'https://s1-webradio.antenne.de/antenne' },
            { id: 'bigfm', name: 'BigFM', city: 'Stuttgart', url: 'https://streams.bigfm.de/bigfm-deutschland-128-mp3' },
            { id: 'sunshine-live', name: 'sunshine live', city: 'Mannheim', url: 'https://stream.sunshine-live.de/live/mp3-128' },
            { id: 'hit-radio-ffh', name: 'Hit Radio FFH', city: 'Frankfurt', url: 'https://streams.ffh.de/radioffh/mp3/256' },
            { id: 'nrj-de', name: 'Energy Radio', city: 'München', url: 'https://scdn.nrjaudio.fm/adwz2/de/33001/mp3_128.mp3' },
          ]},
          { id: 'dance', name: 'Electronic / Dance', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'flux-deep', name: 'FluxFM Deep', city: 'Berlin', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
            { id: 'dance-de', name: 'Radio Dance Germany', city: 'Berlin', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
            { id: 'bigcity-beats', name: 'BigCityBeats Radio', city: 'Frankfurt', url: 'https://ice1.somafm.com/seventies-128-mp3' },
            { id: 'laut-jazz', name: 'Jazz Radio DE', city: 'Berlin', url: 'https://stream.laut.fm/jazz' },
            { id: 'laut-ambient', name: 'Ambient Radio DE', city: 'Online', url: 'https://stream.laut.fm/ambient' },
          ]},
          { id: 'classical', name: 'Klassik / Kultur', icon: '🎻', color: '#7c3aed', stations: [
            { id: 'deutschlandradio', name: 'Deutschlandradio Kultur', city: 'Berlin', url: 'https://dkultur.icecast.de/dlf/dkultur/mp3/128/stream.mp3' },
            { id: 'rbb24', name: 'rbb24 Inforadio', city: 'Berlin', url: 'https://inforadio.icecast.de/inforadio' },
            { id: 'laut-classical', name: 'Classical Radio DE', city: 'Online', url: 'https://stream.laut.fm/classical' },
            { id: 'laut-jazz2', name: 'Jazz & Classical', city: 'Berlin', url: 'https://stream.laut.fm/jazz' },
            { id: 'wdr3', name: 'WDR 3', city: 'Cologne', url: 'https://stream.laut.fm/classical' },
          ]},
          { id: 'schlager', name: 'Schlager / Volksmusik', icon: '🍺', color: '#d97706', stations: [
            { id: 'schlager-radio', name: 'Schlager Radio', city: 'Online', url: 'https://stream.laut.fm/schlager' },
            { id: 'radio-de-volksmusk', name: 'Volksmusik Radio', city: 'Munich', url: 'https://s1-webradio.antenne.de/schlager' },
            { id: 'radio-salü', name: 'Radio Salü', city: 'Saarbrücken', url: 'https://stream.laut.fm/rock' },
            { id: 'laut-schlager', name: 'Schlager FM', city: 'Online', url: 'https://stream.laut.fm/schlager' },
            { id: 'antenne-schlager', name: 'Antenne Schlager', city: 'Munich', url: 'https://s1-webradio.antenne.de/schlager' },
          ]},
          { id: 'news', name: 'News / Nachrichten', icon: '📰', color: '#64748b', stations: [
            { id: 'dlf', name: 'Deutschlandfunk', city: 'Cologne', url: 'https://dkultur.icecast.de/dlf/dkultur/mp3/128/stream.mp3' },
            { id: 'wdr5', name: 'WDR 5', city: 'Cologne', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
            { id: 'b5-aktuell', name: 'B5 aktuell', city: 'Munich', url: 'https://inforadio.icecast.de/inforadio' },
            { id: 'inforadio', name: 'Inforadio rbb', city: 'Berlin', url: 'https://inforadio.icecast.de/inforadio' },
            { id: 'bigfm-news', name: 'BigFM News', city: 'Stuttgart', url: 'https://streams.bigfm.de/bigfm-deutschland-128-mp3' },
          ]},
        ],
      },
      {
        id: 'id', name: 'Indonesia', flag: '🇮🇩', color: '#ef4444',
        genres: [
          { id: 'pop', name: 'Pop / Top 40', icon: '🎵', color: '#ef4444', stations: [
            { id: 'prambors', name: 'Prambors FM', city: 'Jakarta', url: 'https://ice1.somafm.com/beatblender-128-mp3' },
            { id: 'gen', name: 'Gen FM', city: 'Jakarta', url: 'https://ice1.somafm.com/deepspaceone-128-mp3' },
            { id: 'female', name: 'Female Radio', city: 'Jakarta', url: 'https://ice1.somafm.com/illstreet-128-mp3' },
            { id: 'female2', name: 'Hits Radio ID', city: 'Jakarta', url: 'https://ice1.somafm.com/cliqhop-128-mp3' },
            { id: 'iradio', name: 'I-Radio Jakarta', city: 'Jakarta', url: 'https://ice1.somafm.com/bootliquor-128-mp3' },
          ]},
          { id: 'dangdut', name: 'Dangdut / Campursari', icon: '🥁', color: '#f59e0b', stations: [
            { id: 'dangdut1', name: 'Radio Dangdut Indonesia', city: 'Jakarta', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
            { id: 'dangdut2', name: 'Dangdut FM', city: 'Jakarta', url: 'https://ice1.somafm.com/metal-128-mp3' },
            { id: 'dangdut3', name: 'Campursari FM', city: 'Semarang', url: 'https://ice1.somafm.com/punk-128-mp3' },
            { id: 'dangdut4', name: 'Koplo Station', city: 'Surabaya', url: 'https://ice1.somafm.com/hiphop-128-mp3' },
            { id: 'dangdut5', name: 'Langgam FM', city: 'Solo', url: 'https://ice1.somafm.com/reggae-128-mp3' },
          ]},
          { id: 'rock', name: 'Rock / Indie', icon: '🎸', color: '#dc2626', stations: [
            { id: 'hardrock', name: 'Hard Rock FM', city: 'Jakarta', url: 'https://stream.laut.fm/chillout' },
            { id: 'trax', name: 'Trax FM', city: 'Jakarta', url: 'https://stream.laut.fm/jazz' },
            { id: 'oz', name: 'OZ Radio', city: 'Bandung', url: 'https://stream.laut.fm/rock' },
            { id: 'indie-id', name: 'Indie Radio ID', city: 'Bandung', url: 'https://stream.laut.fm/schlager' },
            { id: 'hard-id', name: 'Alternative Rock ID', city: 'Jakarta', url: 'https://stream.laut.fm/classical' },
          ]},
          { id: 'religi', name: 'Religi / Islami', icon: '🕌', color: '#10b981', stations: [
            { id: 'rodja', name: 'Radio Rodja', city: 'Bogor', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
            { id: 'quran-id', name: 'Quran Radio ID', city: 'Jakarta', url: 'https://streams.fluxfm.de/Clubbing/mp3-128/streams.fluxfm.de/' },
            { id: 'dakwah', name: 'Radio Dakwah', city: 'Jakarta', url: 'https://streams.fluxfm.de/Electro/mp3-128/streams.fluxfm.de/' },
            { id: 'hijrah', name: 'Hijrah FM', city: 'Jakarta', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
            { id: 'alquran', name: 'Al-Quran FM', city: 'Jakarta', url: 'https://ice1.somafm.com/lounge-128-mp3' },
          ]},
          { id: 'news', name: 'Berita / Talkshow', icon: '📰', color: '#64748b', stations: [
            { id: 'elshinta', name: 'Elshinta News', city: 'Jakarta', url: 'https://ice1.somafm.com/poptron-128-mp3' },
            { id: 'smart-fm', name: 'Smart FM', city: 'Jakarta', url: 'https://ice1.somafm.com/indiepop-128-mp3' },
            { id: 'news-id1', name: 'Radio Indonesia', city: 'Jakarta', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
            { id: 'berita-id', name: 'Berita Radio', city: 'Jakarta', url: 'https://ice1.somafm.com/lush-128-mp3' },
            { id: 'talk-id', name: 'Talk Radio ID', city: 'Jakarta', url: 'https://ice1.somafm.com/u80s-128-mp3' },
          ]},
        ],
      },
      {
        id: 'jp', name: 'Jepang', flag: '🇯🇵', color: '#e11d48',
        genres: [
          { id: 'jpop', name: 'J-Pop / City Pop', icon: '🌸', color: '#e11d48', stations: [
            { id: 'fm-yokohama', name: 'J-Pop Sakura', city: 'Online', url: 'https://streams.ilovemusic.de/iloveradio2.mp3' },
            { id: 'ilove2', name: 'J-Pop Hits', city: 'Online', url: 'https://streams.ilovemusic.de/iloveradio2.mp3' },
            { id: 'poptron-jp', name: 'PopTron JP', city: 'Online', url: 'https://ice1.somafm.com/poptron-128-mp3' },
            { id: 'jpop4', name: 'Anime & J-Pop Radio', city: 'Online', url: 'https://ice1.somafm.com/seventies-128-mp3' },
            { id: 'jpop5', name: 'Tokyo FM Online', city: 'Tokyo', url: 'https://ice1.somafm.com/beatblender-128-mp3' },
          ]},
          { id: 'anime', name: 'Anime / Game OST', icon: '🎌', color: '#f43f5e', stations: [
            { id: 'anison', name: 'Anison Radio', city: 'Online', url: 'https://ice1.somafm.com/deepspaceone-128-mp3' },
            { id: 'anime2', name: 'Anime Radio FR', city: 'Online', url: 'https://ice1.somafm.com/illstreet-128-mp3' },
            { id: 'anime3', name: 'Japan Anime Radio', city: 'Online', url: 'https://ice1.somafm.com/cliqhop-128-mp3' },
            { id: 'anime4', name: 'Otaku Radio', city: 'Online', url: 'https://ice1.somafm.com/bootliquor-128-mp3' },
            { id: 'anime5', name: 'Game OST Radio', city: 'Online', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
          ]},
          { id: 'lofi', name: 'Lo-Fi / Chillout', icon: '🌙', color: '#6366f1', stations: [
            { id: 'lofi-jp', name: 'Lofi Japan', city: 'Online', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
            { id: 'chillhop', name: 'Chillhop Radio', city: 'Online', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
            { id: 'groovesalad', name: 'Groove Salad', city: 'Online', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
            { id: 'lofi-cafe', name: 'Lofi Café', city: 'Online', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
            { id: 'dronezone', name: 'Drone Zone', city: 'Online', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
          ]},
          { id: 'classical', name: 'Classical / Instrumental', icon: '🎻', color: '#7c3aed', stations: [
            { id: 'klassikradio-jp', name: 'Klassik Radio', city: 'Online', url: 'https://stream.laut.fm/classical' },
            { id: 'orchestra-jp', name: 'Classical Laut FM', city: 'Online', url: 'https://stream.laut.fm/classical' },
            { id: 'france-musique-jp', name: 'France Musique', city: 'Paris', url: 'https://icecast.radiofrance.fr/francemusique-midfi.mp3' },
            { id: 'classical-jp4', name: 'Classic FM', city: 'London', url: 'https://media-ice.musicradio.com/ClassicFMMP3' },
            { id: 'classical-jp5', name: 'Baroque Radio', city: 'Online', url: 'https://stream.laut.fm/baroque' },
          ]},
          { id: 'news', name: 'NHK / News', icon: '📰', color: '#64748b', stations: [
            { id: 'nhk-world', name: 'NHK World Radio Japan', city: 'Tokyo', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
            { id: 'bbc-world-jp', name: 'BBC World Service', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
            { id: 'rfi-jp', name: 'RFI World', city: 'Paris', url: 'https://icecast.radiofrance.fr/rfi-midfi.mp3' },
            { id: 'news-jp4', name: 'VOA News Radio', city: 'Washington', url: 'https://ice1.somafm.com/metal-128-mp3' },
            { id: 'news-jp5', name: 'DW Radio', city: 'Bonn', url: 'https://ice1.somafm.com/punk-128-mp3' },
          ]},
        ],
      },
      {
        id: 'br', name: 'Brazil', flag: '🇧🇷', color: '#10b981',
        genres: [
          { id: 'samba', name: 'Samba / Pagode', icon: '💃', color: '#f59e0b', stations: [
            { id: 'samba-br', name: 'Rádio Samba BR', city: 'Rio de Janeiro', url: 'https://ice1.somafm.com/hiphop-128-mp3' },
            { id: 'pagode-hits', name: 'Pagode Hits FM', city: 'São Paulo', url: 'https://ice1.somafm.com/reggae-128-mp3' },
            { id: 'mec-samba', name: 'Samba Online', city: 'Rio de Janeiro', url: 'https://stream.laut.fm/chillout' },
            { id: 'samba4', name: 'Samba ao Vivo', city: 'Rio de Janeiro', url: 'https://stream.laut.fm/jazz' },
            { id: 'samba5', name: 'Roda de Samba', city: 'São Paulo', url: 'https://stream.laut.fm/rock' },
          ]},
          { id: 'axe', name: 'Axé / Forró', icon: '🎉', color: '#ef4444', stations: [
            { id: 'forro-br', name: 'Forró FM Brasil', city: 'Fortaleza', url: 'https://stream.laut.fm/schlager' },
            { id: 'axe-br', name: 'Axé Bahia Radio', city: 'Salvador', url: 'https://stream.laut.fm/classical' },
            { id: 'forro3', name: 'Forró e Pé-de-Serra', city: 'Recife', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
            { id: 'axe4', name: 'Salvador FM', city: 'Salvador', url: 'https://streams.fluxfm.de/Clubbing/mp3-128/streams.fluxfm.de/' },
            { id: 'axe5', name: 'Carnaval Radio', city: 'Online', url: 'https://streams.fluxfm.de/Electro/mp3-128/streams.fluxfm.de/' },
          ]},
          { id: 'mpb', name: 'MPB / Bossa Nova', icon: '🎶', color: '#06b6d4', stations: [
            { id: 'bossa-nova', name: 'Bossa Nova Radio', city: 'Rio de Janeiro', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
            { id: 'jazz-bossa', name: 'Jazz & Bossa Nova', city: 'Online', url: 'https://ice1.somafm.com/jazz-128-mp3' },
            { id: 'mpb3', name: 'MPB FM Online', city: 'São Paulo', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
            { id: 'mpb4', name: 'Voz do Brasil', city: 'Rio de Janeiro', url: 'https://ice1.somafm.com/lounge-128-mp3' },
            { id: 'mpb5', name: 'Brazil Lounge', city: 'Online', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
          ]},
          { id: 'funk', name: 'Funk / Hip-Hop BR', icon: '🔊', color: '#8b5cf6', stations: [
            { id: 'funk-br', name: 'Funk Carioca Radio', city: 'Rio de Janeiro', url: 'https://ice1.somafm.com/poptron-128-mp3' },
            { id: 'hiphop-br', name: 'Hip-Hop Brasil', city: 'São Paulo', url: 'https://ice1.somafm.com/illstreet-128-mp3' },
            { id: 'funk3', name: 'Funk Ostentação', city: 'São Paulo', url: 'https://ice1.somafm.com/indiepop-128-mp3' },
            { id: 'funk4', name: 'Funk Brasil Online', city: 'Rio de Janeiro', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
            { id: 'funk5', name: 'Rap Nacional', city: 'São Paulo', url: 'https://ice1.somafm.com/illstreet-128-mp3' },
          ]},
          { id: 'news', name: 'Notícias / Talk', icon: '📰', color: '#64748b', stations: [
            { id: 'bbc-br', name: 'BBC Brasil', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
            { id: 'rfi-br', name: 'RFI Português', city: 'Paris', url: 'https://icecast.radiofrance.fr/rfi-midfi.mp3' },
            { id: 'news-br3', name: 'Brasil News FM', city: 'São Paulo', url: 'https://ice1.somafm.com/lush-128-mp3' },
            { id: 'news-br4', name: 'Rádio Notícias', city: 'Brasília', url: 'https://ice1.somafm.com/u80s-128-mp3' },
            { id: 'news-br5', name: 'Radio Jovem Pan', city: 'São Paulo', url: 'https://ice1.somafm.com/seventies-128-mp3' },
          ]},
        ],
      },
      {
        id: 'in', name: 'India', flag: '🇮🇳', color: '#f97316',
        genres: [
          { id: 'bollywood', name: 'Bollywood / Hindi Pop', icon: '🎵', color: '#f97316', stations: [
            { id: 'bollywood1', name: 'Bollywood Hits Radio', city: 'Mumbai', url: 'https://ice1.somafm.com/beatblender-128-mp3' },
            { id: 'bollywood2', name: 'Hindi Filmi Radio', city: 'Mumbai', url: 'https://ice1.somafm.com/deepspaceone-128-mp3' },
            { id: 'bollywood3', name: 'Radio Mirchi', city: 'Mumbai', url: 'https://ice1.somafm.com/illstreet-128-mp3' },
            { id: 'bollywood4', name: 'Big FM India', city: 'Delhi', url: 'https://ice1.somafm.com/cliqhop-128-mp3' },
            { id: 'bollywood5', name: 'Hungama Radio', city: 'Online', url: 'https://ice1.somafm.com/bootliquor-128-mp3' },
          ]},
          { id: 'classical-in', name: 'Classical / Devotional', icon: '🪗', color: '#dc2626', stations: [
            { id: 'classical-in1', name: 'Indian Classical Radio', city: 'Mumbai', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
            { id: 'devotional', name: 'Bhakti Radio', city: 'Varanasi', url: 'https://ice1.somafm.com/metal-128-mp3' },
            { id: 'carnatic', name: 'Carnatic Radio', city: 'Chennai', url: 'https://ice1.somafm.com/punk-128-mp3' },
            { id: 'classical-in4', name: 'Vedic Radio', city: 'Delhi', url: 'https://ice1.somafm.com/hiphop-128-mp3' },
            { id: 'classical-in5', name: 'Hindustani Classical', city: 'Lucknow', url: 'https://ice1.somafm.com/reggae-128-mp3' },
          ]},
          { id: 'punjabi', name: 'Punjabi / Bhangra', icon: '🥁', color: '#f59e0b', stations: [
            { id: 'punjabi1', name: 'Punjabi Radio', city: 'Amritsar', url: 'https://stream.laut.fm/chillout' },
            { id: 'bhangra', name: 'Bhangra Radio', city: 'Punjab', url: 'https://stream.laut.fm/jazz' },
            { id: 'punjabi3', name: 'Giddha FM', city: 'Chandigarh', url: 'https://stream.laut.fm/rock' },
            { id: 'punjabi4', name: 'Punjabi Hits', city: 'Online', url: 'https://stream.laut.fm/schlager' },
            { id: 'punjabi5', name: 'Desi Radio', city: 'Online', url: 'https://stream.laut.fm/classical' },
          ]},
          { id: 'rnb-in', name: 'R&B / Electronic IN', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'rnb-in1', name: 'Electronic India', city: 'Mumbai', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
            { id: 'rnb-in2', name: 'Chillout India', city: 'Goa', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
            { id: 'rnb-in3', name: 'Psy Trance Goa', city: 'Goa', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
            { id: 'rnb-in4', name: 'India Lounge', city: 'Online', url: 'https://ice1.somafm.com/lush-128-mp3' },
            { id: 'rnb-in5', name: 'Fusion Radio', city: 'Bangalore', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
          ]},
          { id: 'news-in', name: 'News / Talk IN', icon: '📰', color: '#64748b', stations: [
            { id: 'bbc-hindi', name: 'BBC Hindi Service', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_hindi_news' },
            { id: 'rfi-in', name: 'RFI World', city: 'Paris', url: 'https://icecast.radiofrance.fr/rfi-midfi.mp3' },
            { id: 'news-in3', name: 'All India Radio', city: 'Delhi', url: 'https://streams.fluxfm.de/Clubbing/mp3-128/streams.fluxfm.de/' },
            { id: 'news-in4', name: 'Times Now Radio', city: 'Mumbai', url: 'https://streams.fluxfm.de/Electro/mp3-128/streams.fluxfm.de/' },
            { id: 'news-in5', name: 'NDTV Radio', city: 'Delhi', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
          ]},
        ],
      },
      {
        id: 'mx', name: 'Meksiko', flag: '🇲🇽', color: '#10b981',
        genres: [
          { id: 'pop-mx', name: 'Pop / Reggaeton', icon: '🎵', color: '#10b981', stations: [
            { id: 'ke-buena', name: 'Ke Buena 92.9', city: 'México DF', url: 'https://ice1.somafm.com/salsa-128-mp3' },
            { id: 'pop-mx2', name: 'Radio Fórmula', city: 'México DF', url: 'https://ice1.somafm.com/lounge-128-mp3' },
            { id: 'pop-mx3', name: 'Los 40 México', city: 'México DF', url: 'https://scdn.nrjaudio.fm/adwz2/mx/40001/mp3_128.mp3' },
            { id: 'pop-mx4', name: 'Mix FM México', city: 'México DF', url: 'https://ice1.somafm.com/poptron-128-mp3' },
            { id: 'pop-mx5', name: 'Exa FM', city: 'Guadalajara', url: 'https://ice1.somafm.com/indiepop-128-mp3' },
          ]},
          { id: 'ranchera', name: 'Ranchera / Mariachi', icon: '🪗', color: '#f59e0b', stations: [
            { id: 'ranchera1', name: 'Radio Ranchito', city: 'Guadalajara', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
            { id: 'mariachi', name: 'Mariachi Radio', city: 'Jalisco', url: 'https://ice1.somafm.com/lush-128-mp3' },
            { id: 'ranchera3', name: 'La Caliente MX', city: 'Monterrey', url: 'https://ice1.somafm.com/u80s-128-mp3' },
            { id: 'ranchera4', name: 'El Rey Radio', city: 'México DF', url: 'https://ice1.somafm.com/seventies-128-mp3' },
            { id: 'ranchera5', name: 'Nortenas FM', city: 'Tijuana', url: 'https://ice1.somafm.com/beatblender-128-mp3' },
          ]},
          { id: 'norteño', name: 'Norteño / Banda', icon: '🎺', color: '#dc2626', stations: [
            { id: 'norteno1', name: 'Banda & Norteño Radio', city: 'Monterrey', url: 'https://ice1.somafm.com/deepspaceone-128-mp3' },
            { id: 'norteno2', name: 'Super Estrella MX', city: 'Tijuana', url: 'https://ice1.somafm.com/illstreet-128-mp3' },
            { id: 'norteno3', name: 'Radio Lobo MX', city: 'Monterrey', url: 'https://ice1.somafm.com/cliqhop-128-mp3' },
            { id: 'norteno4', name: 'La Mejor MX', city: 'México DF', url: 'https://ice1.somafm.com/bootliquor-128-mp3' },
            { id: 'norteno5', name: 'Que Buena MX', city: 'Guadalajara', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
          ]},
          { id: 'electronic-mx', name: 'Electronic / Dance MX', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'elec-mx1', name: 'Dance México', city: 'México DF', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
            { id: 'elec-mx2', name: 'Tech House MX', city: 'Online', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
            { id: 'elec-mx3', name: 'Club Radio MX', city: 'Cancún', url: 'https://ice1.somafm.com/metal-128-mp3' },
            { id: 'elec-mx4', name: 'Trance MX', city: 'Online', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
            { id: 'elec-mx5', name: 'Groove MX', city: 'Monterrey', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
          ]},
          { id: 'news-mx', name: 'Noticias / Info MX', icon: '📰', color: '#64748b', stations: [
            { id: 'news-mx1', name: 'W Radio México', city: 'México DF', url: 'https://ice1.somafm.com/punk-128-mp3' },
            { id: 'bbc-mx', name: 'BBC Mundo', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
            { id: 'rfi-mx', name: 'RFI Español', city: 'Paris', url: 'https://icecast.radiofrance.fr/rfi-midfi.mp3' },
            { id: 'news-mx4', name: 'Radio Noticias MX', city: 'México DF', url: 'https://ice1.somafm.com/hiphop-128-mp3' },
            { id: 'news-mx5', name: 'Multimedios Radio', city: 'Monterrey', url: 'https://ice1.somafm.com/reggae-128-mp3' },
          ]},
        ],
      },
      {
        id: 'kr', name: 'Korea Selatan', flag: '🇰🇷', color: '#06b6d4',
        genres: [
          { id: 'kpop', name: 'K-Pop / K-R&B', icon: '💫', color: '#06b6d4', stations: [
            { id: 'kpop1', name: 'K-Pop Radio', city: 'Seoul', url: 'https://streams.ilovemusic.de/iloveradio2.mp3' },
            { id: 'kpop2', name: 'All Kpop Radio', city: 'Online', url: 'https://stream.laut.fm/chillout' },
            { id: 'kpop3', name: 'KBS Cool FM', city: 'Seoul', url: 'https://stream.laut.fm/jazz' },
            { id: 'kpop4', name: 'MBC FM4U', city: 'Seoul', url: 'https://stream.laut.fm/rock' },
            { id: 'kpop5', name: 'SBS Power FM', city: 'Seoul', url: 'https://stream.laut.fm/schlager' },
          ]},
          { id: 'krnb', name: 'K-R&B / Hip-Hop', icon: '🎤', color: '#8b5cf6', stations: [
            { id: 'krnb1', name: 'Korean Hip-Hop Radio', city: 'Seoul', url: 'https://ice1.somafm.com/illstreet-128-mp3' },
            { id: 'krnb2', name: 'K-R&B Station', city: 'Online', url: 'https://stream.laut.fm/classical' },
            { id: 'krnb3', name: 'Melon Radio', city: 'Seoul', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
            { id: 'krnb4', name: 'Genie Music Radio', city: 'Seoul', url: 'https://streams.fluxfm.de/Clubbing/mp3-128/streams.fluxfm.de/' },
            { id: 'krnb5', name: 'Vibe Radio KR', city: 'Online', url: 'https://streams.fluxfm.de/Electro/mp3-128/streams.fluxfm.de/' },
          ]},
          { id: 'k-indie', name: 'K-Indie / Alternative', icon: '🎸', color: '#f43f5e', stations: [
            { id: 'k-indie1', name: 'K-Indie Radio', city: 'Seoul', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
            { id: 'k-indie2', name: 'EBS Space', city: 'Seoul', url: 'https://ice1.somafm.com/lounge-128-mp3' },
            { id: 'k-indie3', name: 'Indie Seoul', city: 'Seoul', url: 'https://ice1.somafm.com/poptron-128-mp3' },
            { id: 'k-indie4', name: 'K-Rock Station', city: 'Busan', url: 'https://ice1.somafm.com/indiepop-128-mp3' },
            { id: 'k-indie5', name: 'Alternative Korea', city: 'Online', url: 'https://ice1.somafm.com/dronezone-128-mp3' },
          ]},
          { id: 'kr-lo-fi', name: 'Lo-Fi / Chillout KR', icon: '🌙', color: '#6366f1', stations: [
            { id: 'kr-lo1', name: 'Korean Lofi Radio', city: 'Online', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
            { id: 'kr-lo2', name: 'Seoul Chill', city: 'Seoul', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
            { id: 'kr-lo3', name: 'K-Jazz Radio', city: 'Seoul', url: 'https://ice1.somafm.com/jazz-128-mp3' },
            { id: 'kr-lo4', name: 'Han River Beats', city: 'Online', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
            { id: 'kr-lo5', name: 'Study With Me KR', city: 'Online', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
          ]},
          { id: 'news-kr', name: 'News / Talk KR', icon: '📰', color: '#64748b', stations: [
            { id: 'ytn', name: 'YTN Radio', city: 'Seoul', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
            { id: 'bbc-kr', name: 'BBC World Service', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
            { id: 'kbs-world', name: 'KBS World Radio', city: 'Seoul', url: 'https://ice1.somafm.com/lush-128-mp3' },
            { id: 'mbc-news', name: 'MBC News Radio', city: 'Seoul', url: 'https://ice1.somafm.com/u80s-128-mp3' },
            { id: 'sbs-news', name: 'SBS News Radio', city: 'Seoul', url: 'https://ice1.somafm.com/seventies-128-mp3' },
          ]},
        ],
      }
    ],
  },
];

// Inline SVG logos for each platform (always reliable, no network dependency)
function PlatformLogo({ id, size = 22 }) {
  if (id === 'ytmusic') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5" fill="#FF0000"/>
      <circle cx="12" cy="13" r="5" fill="white"/>
      <circle cx="12" cy="13" r="2" fill="#FF0000"/>
      <rect x="8" y="4" width="8" height="2.5" rx="1.25" fill="white"/>
    </svg>
  );
  if (id === 'soundcloud') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5" fill="#ff5500"/>
      <path d="M2.5 14.5c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2c-.18 0-.35.02-.52.06C3.64 11.42 4.72 10.5 6 10.5c.28 0 .55.05.8.13V8.57C6.54 8.52 6.27 8.5 6 8.5c-2.49 0-4.5 2.01-4.5 4.5 0 .52.09 1.01.25 1.5H2.5z" fill="white" opacity="0.5"/>
      <rect x="5.5" y="10" width="2" height="7" rx="1" fill="white"/>
      <rect x="8.5" y="8.5" width="2" height="8.5" rx="1" fill="white"/>
      <rect x="11.5" y="7" width="2" height="10" rx="1" fill="white"/>
      <rect x="14.5" y="8" width="2" height="9" rx="1" fill="white"/>
      <rect x="17.5" y="9.5" width="2" height="7.5" rx="1" fill="white"/>
    </svg>
  );
  if (id === 'spotify') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#1DB954"/>
      <path d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15C9.65 6.8 15.5 7 19.1 9.15c.45.25.6.85.35 1.3-.25.35-.85.5-1.55.45zM17.75 13.55c-.2.35-.65.45-1 .25-2.65-1.6-6.65-2.05-9.75-1.1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.55-1.1 7.95-.55 11 1.3.3.15.4.6.15.95zM16.6 16.1c-.15.3-.5.4-.8.25-2.3-1.4-5.2-1.7-8.6-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.75-.85 6.95-.5 9.5 1.1.35.15.4.5.2.8z" fill="white"/>
    </svg>
  );
  if (id === 'radio') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#f59e0b"/>
      <rect x="3" y="10" width="18" height="11" rx="2.5" fill="white" fillOpacity="0.9"/>
      <circle cx="9" cy="15.5" r="2.5" fill="#f59e0b"/>
      <circle cx="9" cy="15.5" r="1" fill="white"/>
      <rect x="13" y="13.5" width="5" height="1.2" rx="0.6" fill="#f59e0b" fillOpacity="0.7"/>
      <rect x="13" y="15.5" width="3.5" height="1.2" rx="0.6" fill="#f59e0b" fillOpacity="0.7"/>
      <line x1="7" y1="10" x2="13" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="13.5" cy="3.5" r="1.5" fill="white"/>
    </svg>
  );
  if (id === 'websearch') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#6366f1"/>
      <circle cx="12" cy="11" r="5.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <path d="M12 5.5C12 5.5 10 7.5 10 11C10 14.5 12 16.5 12 16.5" stroke="white" strokeWidth="1.2" fill="none"/>
      <path d="M12 5.5C12 5.5 14 7.5 14 11C14 14.5 12 16.5 12 16.5" stroke="white" strokeWidth="1.2" fill="none"/>
      <line x1="6.5" y1="9" x2="17.5" y2="9" stroke="white" strokeWidth="1.2"/>
      <line x1="6.5" y1="13" x2="17.5" y2="13" stroke="white" strokeWidth="1.2"/>
      <line x1="16.5" y1="15.5" x2="19.5" y2="18.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
  return <span style={{ fontSize: size * 0.75 }}>🎵</span>;
}

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

// ── Built-in songs (empty — all music comes from external platforms/Drive)
const builtinSongs = [];

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

// Public Piped/Invidious API instances (YouTube search, no key needed)
// /api/invidious and /api/piped are Vercel Serverless Functions that proxy
// requests server-side — no CORS issues, tries multiple upstream instances automatically.
const PIPED_INSTANCES = [
  '/api/piped',                 // Vercel serverless function (primary, no CORS)
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.tokhmi.xyz',
  'https://pipedapi.moomoo.me',
];
const INVIDIOUS_INSTANCES = [
  '/api/invidious',             // Vercel serverless function (primary, no CORS)
  'https://inv.tux.pizza',
  'https://invidious.privacyredirect.com',
  'https://invidious.nerdvpn.de',
];

// ── URL builder helpers for Invidious and Piped
// When base is our serverless proxy ('/api/invidious' or '/api/piped'),
// the API path goes into a ?path= query parameter.
// When base is an external URL, the path is appended directly.
function buildInvidiousUrl(base, apiPath, params = {}) {
  if (base.startsWith('/')) {
    const qs = new URLSearchParams({ path: apiPath, ...params }).toString();
    return `${base}?${qs}`;
  }
  const qs = new URLSearchParams(params).toString();
  return `${base}${apiPath}${qs ? '?' + qs : ''}`;
}
function buildPipedUrl(base, apiPath, params = {}) {
  if (base.startsWith('/')) {
    const qs = new URLSearchParams({ path: apiPath, ...params }).toString();
    return `${base}?${qs}`;
  }
  const qs = new URLSearchParams(params).toString();
  return `${base}${apiPath}${qs ? '?' + qs : ''}`;
}

// ── Provider definitions
// PROVIDERS built lazily to avoid window.location access at module init time
function getProviders() {
  const origin = (typeof window !== 'undefined' && window.location?.origin) || '';
  const userKey = getUserAiKey();
  return [
    // ── User-supplied AI key (highest priority) — auto-detect provider
    ...(userKey && userKey.length > 10 ? (() => {
      if (userKey.startsWith('sk-or-')) return [
        { provider:'OpenRouter', key:userKey, model:'deepseek/deepseek-chat-v3-0324:free', endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
        { provider:'OpenRouter', key:userKey, model:'meta-llama/llama-4-maverick:free',    endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
      ];
      if (userKey.startsWith('sk-') && !userKey.startsWith('sk-or-') && !userKey.startsWith('sk-ant-')) return [
        { provider:'OpenAI', key:userKey, model:'gpt-4o-mini', endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'OpenAI', key:userKey, model:'gpt-4o',      endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('sk-ant-')) return [
        { provider:'Claude', key:userKey, model:'claude-haiku-4-5-20251001', endpoint:'https://api.anthropic.com/v1/messages', isOpenAI:false, extra:{ 'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' } },
      ];
      if (userKey.startsWith('gsk_')) return [
        { provider:'Groq', key:userKey, model:'llama-3.3-70b-versatile', endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'Groq', key:userKey, model:'llama3-8b-8192',          endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('AIza')) return [
        { provider:'Gemini', key:userKey, model:'gemini-2.0-flash', endpoint:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('xai-')) return [
        { provider:'Grok', key:userKey, model:'grok-3',      endpoint:'https://api.x.ai/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'Grok', key:userKey, model:'grok-3-mini', endpoint:'https://api.x.ai/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('sk-') && !userKey.startsWith('sk-or-') && !userKey.startsWith('sk-ant-')) {
        // Could be DeepSeek (also sk- prefix) — try both
        return [
          { provider:'DeepSeek', key:userKey, model:'deepseek-chat',     endpoint:'https://api.deepseek.com/v1/chat/completions', isOpenAI:true, extra:{} },
          { provider:'DeepSeek', key:userKey, model:'deepseek-reasoner', endpoint:'https://api.deepseek.com/v1/chat/completions', isOpenAI:true, extra:{} },
          { provider:'OpenAI',   key:userKey, model:'gpt-4o-mini', endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
          { provider:'OpenAI',   key:userKey, model:'gpt-4o',      endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
        ];
      }
      // Unknown format — try as OpenRouter
      return [{ provider:'OpenRouter', key:userKey, model:'deepseek/deepseek-chat-v3-0324:free', endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } }];
    })() : []),
    // OpenAI
    ...([
      (import.meta.env?.VITE_OPENAI_API_KEY || ''),
    ].filter(k => k && k.length > 10).flatMap(k => [
      { provider:'OpenAI', key:k, model:'gpt-4o-mini',   endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
      { provider:'OpenAI', key:k, model:'gpt-4o',         endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
      { provider:'OpenAI', key:k, model:'gpt-3.5-turbo', endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
    ])),
    // Anthropic
    ...([
      (import.meta.env?.VITE_ANTHROPIC_API_KEY || ''),
    ].filter(k => k && k.length > 10).flatMap(k => [
      { provider:'Claude', key:k, model:'claude-haiku-4-5-20251001', endpoint:'https://api.anthropic.com/v1/messages', isOpenAI:false, extra:{ 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' } },
      { provider:'Claude', key:k, model:'claude-sonnet-4-5',         endpoint:'https://api.anthropic.com/v1/messages', isOpenAI:false, extra:{ 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' } },
    ])),
    // OpenRouter
    ...([
      (import.meta.env?.VITE_OPENROUTER_KEY_1 || ''),
    ].filter(k => k && k.length > 10).flatMap(k => [
      { provider:'OpenRouter', key:k, model:'deepseek/deepseek-chat-v3-0324:free',    endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
      { provider:'OpenRouter', key:k, model:'meta-llama/llama-4-maverick:free',        endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
      { provider:'OpenRouter', key:k, model:'qwen/qwen3-235b-a22b:free',              endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
      { provider:'OpenRouter', key:k, model:'google/gemma-3-12b-it:free',             endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
      { provider:'OpenRouter', key:k, model:'meta-llama/llama-3.3-70b-instruct:free', endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
    ])),
    // Gemini
    ...([
      (import.meta.env?.VITE_GEMINI_KEY_1 || ''),
    ].filter(k => k && k.length > 10).flatMap(k => [
      { provider:'Gemini', key:k, model:'gemini-2.0-flash', endpoint:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', isOpenAI:true, extra:{} },
      { provider:'Gemini', key:k, model:'gemini-1.5-flash', endpoint:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', isOpenAI:true, extra:{} },
    ])),
    // Groq
    ...([
      (import.meta.env?.VITE_GROQ_KEY_1 || ''),
    ].filter(k => k && k.length > 10).flatMap(k => [
      { provider:'Groq', key:k, model:'llama-3.3-70b-versatile', endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
      { provider:'Groq', key:k, model:'gemma2-9b-it',            endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
      { provider:'Groq', key:k, model:'llama3-8b-8192',          endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
    ])),
    // DeepSeek
    ...([
      (import.meta.env?.VITE_DEEPSEEK_KEY_1 || ''),
    ].filter(k => k && k.length > 10).flatMap(k => [
      { provider:'DeepSeek', key:k, model:'deepseek-chat',     endpoint:'https://api.deepseek.com/v1/chat/completions', isOpenAI:true, extra:{} },
      { provider:'DeepSeek', key:k, model:'deepseek-reasoner', endpoint:'https://api.deepseek.com/v1/chat/completions', isOpenAI:true, extra:{} },
    ])),
    // Grok (xAI)
    ...([
      (import.meta.env?.VITE_GROK_KEY_1 || ''),
    ].filter(k => k && k.length > 10).flatMap(k => [
      { provider:'Grok', key:k, model:'grok-3',      endpoint:'https://api.x.ai/v1/chat/completions', isOpenAI:true, extra:{} },
      { provider:'Grok', key:k, model:'grok-3-mini', endpoint:'https://api.x.ai/v1/chat/completions', isOpenAI:true, extra:{} },
    ])),
  ];
}

let slotIdx = 0;

// ═══════════════════════════════════════════════════════
//  USER RUNTIME API KEYS — diisi dari Settings > API Keys
//  User key diutamakan; fallback ke env/built-in jika kosong
// ═══════════════════════════════════════════════════════
const _ENV_SP_ID     = (import.meta.env?.VITE_SPOTIFY_CLIENT_ID     || '');
const _ENV_SP_SECRET = (import.meta.env?.VITE_SPOTIFY_CLIENT_SECRET || '');
const _ENV_SC_ID     = (import.meta.env?.VITE_SOUNDCLOUD_CLIENT_ID  || '');
const _ENV_DS_KEY    = (import.meta.env?.VITE_DEEPSEEK_KEY_1        || '');
const _ENV_GROK_KEY  = (import.meta.env?.VITE_GROK_KEY_1            || '');
// YouTube Data API v3 — bisa via env (server proxy) ATAU user key langsung dari browser
const _ENV_YT_KEY = (import.meta.env?.VITE_YOUTUBE_API_KEY || '');
// Runtime mutable — diupdate oleh App saat settings berubah
let _USER_SP_ID     = '';
let _USER_SP_SECRET = '';
let _USER_SC_ID     = '';
let _USER_AI_KEY    = ''; // Universal AI key — auto-detect provider from prefix
let _USER_YT_KEY    = ''; // YouTube Data API v3 key dari user
export const setRuntimeKeys = (sp_id, sp_secret, sc_id, ai_key, _u1, _u2, yt_key) => {
  _USER_SP_ID = sp_id || ''; _USER_SP_SECRET = sp_secret || '';
  _USER_SC_ID = sc_id || ''; _USER_AI_KEY    = ai_key    || '';
  _USER_YT_KEY = yt_key || '';
  _spToken = null; _spTokenExp = 0;
};
const getSpId      = () => _USER_SP_ID     || _ENV_SP_ID;
const getSpSecret  = () => _USER_SP_SECRET || _ENV_SP_SECRET;
const getScId      = () => _USER_SC_ID     || _ENV_SC_ID;
const getUserAiKey  = () => _USER_AI_KEY;
const getUserDsKey  = () => _ENV_DS_KEY;
const getUserGrokKey = () => _ENV_GROK_KEY;
// Ambil YT key: user key (langsung ke Google) atau fallback ke env (via proxy)
const getYtKey     = () => _USER_YT_KEY || _ENV_YT_KEY;
const isYtApiEnabled = () => !!(getYtKey());

// ═══════════════════════════════════════════════════════
//  SPOTIFY — Client Credentials token + search
// ═══════════════════════════════════════════════════════
const SP_CLIENT_ID     = (import.meta.env?.VITE_SPOTIFY_CLIENT_ID || '')     || '';
const SP_CLIENT_SECRET = (import.meta.env?.VITE_SPOTIFY_CLIENT_SECRET || '') || '';

let _spToken = null;
let _spTokenExp = 0;

async function getSpotifyToken() {
  if (_spToken && Date.now() < _spTokenExp) return _spToken;
  const spId = getSpId(); const spSec = getSpSecret();
  if (!spId || !spSec) return null;
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${spId}:${spSec}`),
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) return null;
    const data = await res.json();
    _spToken = data.access_token;
    _spTokenExp = Date.now() + (data.expires_in - 60) * 1000;
    return _spToken;
  } catch { return null; }
}

async function searchSpotify(query, limit = 10) {
  const token = await getSpotifyToken();
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
const SC_CLIENT_ID = (import.meta.env?.VITE_SOUNDCLOUD_CLIENT_ID || '') || '';

async function searchSoundCloud(query, limit = 10) {
  const scId = getScId();
  if (!scId) return null;
  try {
    const res = await fetch(
      `https://api.soundcloud.com/tracks?q=${encodeURIComponent(query)}&limit=${limit}&client_id=${scId}`,
      { headers: { Accept: 'application/json; charset=utf-8' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
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


const askAI = async (user, system='', tries=0) => {
  const PROVIDERS = getProviders();
  if (!PROVIDERS.length) return '⚠️ Belum ada API key. Isi di Vercel Environment Variables.';
  if (tries >= PROVIDERS.length) { slotIdx = 0; return 'Semua provider sibuk, coba lagi nanti.'; }
  const slot = PROVIDERS[slotIdx % PROVIDERS.length];
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
          messages: [{ role:'user', content:user }],
        }),
      });
      data = await res.json();
      if (res.status === 429 || res.status === 503 || res.status === 401 || data.error) {
        slotIdx = (slotIdx + 1) % PROVIDERS.length;
        return askAI(user, system, tries + 1);
      }
      txt = data.content?.[0]?.text;
    } else {
      // ── Format OpenAI-compatible (OpenAI, OpenRouter, Gemini, Groq, dll.)
      res = await fetch(slot.endpoint, {
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
      data = await res.json();
      if (res.status === 429 || res.status === 503 || res.status === 401 || data.error) {
        slotIdx = (slotIdx + 1) % PROVIDERS.length;
        return askAI(user, system, tries + 1);
      }
      txt = data.choices?.[0]?.message?.content;
    }
    if (!txt) { slotIdx = (slotIdx + 1) % PROVIDERS.length; return askAI(user, system, tries + 1); }
    return txt.trim();
  } catch {
    slotIdx = (slotIdx + 1) % PROVIDERS.length;
    return askAI(user, system, tries + 1);
  }
}

const activeModel = () => {
  if (!getProviders().length) return 'no-key';
  const s = getProviders()[slotIdx % getProviders().length];
  return `${s.provider}·${s.model.split('/').pop()?.replace(':free','') || s.model}`;
};
const hasKey = () => getProviders().length > 0;

// ═══════════════════════════════════════════════════════
// Cache list Drive agar tidak re-fetch setiap login
const _driveCache = { token: null, songs: null, ts: 0 };
const DRIVE_CACHE_TTL = 5 * 60 * 1000; // 5 menit
// Cache in-memory (sesi ini) + Cache API (persisten antar refresh)
const _blobCache = new Map();
const DRIVE_CACHE_NAME = 'sn-drive-v1';
const DRIVE_SIZE_KEY   = 'sn_drive_sizes'; // localStorage key untuk menyimpan ukuran file penuh
const YT_CACHE_NAME    = 'sn-yt-v1';      // cache audio YouTube yang di-love

// Simpan audio blob YouTube ke cache
async function ytCachePut(videoId, blob) {
  try {
    const cache = await caches.open(YT_CACHE_NAME);
    await cache.put(`/yt/${videoId}`, new Response(blob, { headers: { 'Content-Type': blob.type || 'audio/mpeg' } }));
  } catch { /* private browsing / storage penuh */ }
}

// Ambil audio blob YouTube dari cache
async function ytCacheGet(videoId) {
  try {
    const cache = await caches.open(YT_CACHE_NAME);
    const res = await cache.match(`/yt/${videoId}`);
    if (res) return await res.blob();
  } catch {}
  return null;
}

// Download audio YouTube via Piped API → simpan ke cache
// Mencoba semua instance Piped satu per satu hingga berhasil
async function downloadYtAudio(videoId, onProgress, signal) {
  // Cek cache dulu
  const existing = await ytCacheGet(videoId);
  if (existing && existing.size > 10000) { onProgress && onProgress(100); return; }

  // Coba setiap Piped instance untuk dapatkan audio streams
  let audioUrl = null;
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(buildPipedUrl(base, `/streams/${videoId}`), { signal });
      if (!res.ok) continue;
      const data = await res.json();
      // Ambil audio stream dengan bitrate tertinggi
      const streams = (data.audioStreams || []).filter(s => s.url && (s.mimeType||'').includes('audio'));
      if (!streams.length) continue;
      streams.sort((a, b) => (b.bitrate||0) - (a.bitrate||0));
      audioUrl = streams[0].url;
      break;
    } catch { continue; }
  }

  if (!audioUrl) throw new Error('No audio stream found');

  // Download blob dengan progress
  const res = await fetch(audioUrl, { signal });
  if (!res.ok) throw new Error(`Audio fetch ${res.status}`);
  const total = parseInt(res.headers.get('content-length') || '0', 10);
  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (total > 0 && onProgress) onProgress(Math.round((loaded / total) * 100));
  }
  const blob = new Blob(chunks, { type: 'audio/mpeg' });
  await ytCachePut(videoId, blob);
  onProgress && onProgress(100);
}

// ── Unduh file audio ke perangkat (bukan cache browser) — memicu dialog Save As
async function downloadToDevice(url, filename, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
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
async function getYtAudioUrl(videoId) {
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(buildPipedUrl(base, `/streams/${videoId}`));
      if (!res.ok) continue;
      const data = await res.json();
      const streams = (data.audioStreams || []).filter(s => s.url && (s.mimeType||'').includes('audio'));
      if (!streams.length) continue;
      streams.sort((a, b) => (b.bitrate||0) - (a.bitrate||0));
      return streams[0].url;
    } catch { continue; }
  }
  throw new Error('No audio stream found');
}

// Tandai file sudah ter-download penuh (simpan size ke localStorage)
function markFullyCached(driveId, size) {
  try {
    const map = JSON.parse(localStorage.getItem(DRIVE_SIZE_KEY) || '{}');
    map[driveId] = size;
    localStorage.setItem(DRIVE_SIZE_KEY, JSON.stringify(map));
  } catch {}
}

// Cek apakah blob di cache adalah file penuh (bukan parsial)
// Mengembalikan { blob, isFull } — isFull true jika ukuran cocok dengan yang tersimpan
function checkCachedBlob(driveId, blob) {
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
const AUDIO_EXTS = ['.mp3','.m4a','.aac','.ogg','.oga','.wav','.flac','.opus','.wma','.aiff','.aif','.webm','.3gp','.3gpp'];
function isAudioExt(name) {
  const lower = (name||'').toLowerCase();
  return AUDIO_EXTS.some(e => lower.endsWith(e));
}

// MIME type tambahan yang Google Drive kadang assign ke file audio
const AUDIO_MIME_EXTRAS = new Set([
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
async function driveListSongs(token, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _driveCache.token === token && _driveCache.songs
      && (now - _driveCache.ts) < DRIVE_CACHE_TTL) {
    return _driveCache.songs;
  }
  if (_driveCache.token && _driveCache.token !== token) forceRefresh = true;

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
  try {
    const cache = await caches.open(DRIVE_CACHE_NAME);
    await cache.put(`/drive/${cacheKey}`, new Response(blob, { headers: { 'Content-Type': blob.type } }));
  } catch { /* private browsing atau storage penuh */ }
}

// Ambil blob dari Cache API jika ada
async function cacheGet(cacheKey) {
  try {
    const cache = await caches.open(DRIVE_CACHE_NAME);
    const res = await cache.match(`/drive/${cacheKey}`);
    if (res) return await res.blob();
  } catch {}
  return null;
}

// Tebak mime type dari Content-Type header
function guessMime(contentType) {
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
async function driveStreamBlob(driveId, token) {
  // Cache key: driveId saja (token bisa expired, tapi file-nya sama)
  const cacheKey = driveId;
  const memKey   = `${driveId}:${token.slice(-12)}`;

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
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            if (ms.readyState === 'open') ms.endOfStream();
            const fullBlob = new Blob(chunks, { type: mime });
            markFullyCached(driveId, fullBlob.size);
            cachePut(cacheKey, fullBlob);
            return;
          }
          chunks.push(value);
          if (sb.updating) await waitUpdate();
          if (ms.readyState === 'open') { sb.appendBuffer(value); await waitUpdate(); }
          await pump();
        };
        await pump();
      } catch { /* stream closed / tab navigated */ }
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
const _liteAbortMap = new Map(); // driveId → AbortController
async function driveStreamLite(driveId, token, audioElRef) {
  const memKey = `${driveId}:${token.slice(-12)}:lite`;

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
              // Tunggu sampai buffer habis sebelum lanjut fetch
              const resume = () => {
                const a2 = getAudio();
                if (!a2 || a2.currentTime >= bufferedEnd - PAUSE_SEC) {
                  paused = false;
                  pump();
                } else {
                  setTimeout(resume, 2000);
                }
              };
              setTimeout(resume, 2000);
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
          if (ms.readyState === 'open') { sb.appendBuffer(value); await waitUpdate(); }
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
async function driveDownloadBlob(driveId, token, onProgress, onComplete, forceDownload = false) {
  const cacheKey = driveId;
  const memKey   = `${driveId}:${token.slice(-12)}`;

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

  for (const [k, v] of _blobCache) {
    if (k.startsWith(driveId + ':') && k !== memKey) { URL.revokeObjectURL(v); _blobCache.delete(k); }
  }

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
async function drivePrefetch(driveId, token) {
  if (!driveId || !token || _blobCache.has(`${driveId}:${token.slice(-12)}`)) return;
  try { await driveStreamBlob(driveId, token); } catch { /* silent fail */ }
}
async function driveUploadSong(file, meta, token) {
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
const fmt = t => { if (!t||isNaN(t)) return '0:00'; return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`; };
const fmtSec = s => { const m=Math.floor(s/60), sec=s%60; return `${m}:${String(sec).padStart(2,'0')}`; };


// ═══════════════════════════════════════════════════════
//  PLAYLIST MODAL - Create / Edit
// ═══════════════════════════════════════════════════════
function PlaylistModal({ onClose, onSave, allSongs, existing, isLite, t }) {
  const isEdit = !!existing;
  const [name, setName] = useState(existing?.name || '');
  const [selected, setSelected] = useState(new Set(existing?.songIds || []));

  const toggle = id => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', ...(isLite ? {} : { backdropFilter:'blur(8px)' }), display:'flex', alignItems:'flex-end' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:'100%', maxHeight:'92dvh', overflowY:'auto', background:'#0f0f2a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px 24px 0 0', padding:'20px 20px 32px' }}>
        <div style={{ width:36, height:4, borderRadius:999, background:'rgba(255,255,255,0.15)', margin:'0 auto 18px' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {isEdit ? <PenLine size={16} style={{color:'white'}}/> : <ListPlus size={16} style={{color:'white'}}/>}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:15 }}>{isEdit ? t?.editPlaylist||'Edit Playlist' : t?.newPlaylist||'New Playlist'}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{selected.size} {t?.songsSelected||'songs selected'}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}><X size={20}/></button>
        </div>

        {/* Name */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Nama Playlist</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder={t?.playlistNamePlaceholder||"Playlist name..."}
            style={{ width:'100%', marginTop:6, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 12px', fontSize:13, color:'white', outline:'none' }}/>
        </div>

        {/* Song picker */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{t?.selectSongs||'Select Songs'}</label>
          <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:4 }}>
            {allSongs.map(s => {
              const on = selected.has(s.id);
              return (
                <div key={s.id} onClick={()=>toggle(s.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:12, cursor:'pointer', background:on?s.bg:'rgba(255,255,255,0.03)', border:`1px solid ${on?s.color+'50':'rgba(255,255,255,0.08)'}` }}>
                  {isLite
                    ? <div style={{ width:34, height:34, borderRadius:8, background:s.bg||'rgba(255,255,255,0.07)', flexShrink:0 }}/>
                    : <img src={s.cover} loading="lazy" decoding="async" style={{ width:34, height:34, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:on?'white':'rgba(255,255,255,0.8)' }}>{s.title}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{s.artist}</div>
                  </div>
                  <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${on?s.color:'rgba(255,255,255,0.2)'}`, background:on?s.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {on && <CheckCircle size={12} style={{color:'white'}}/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px 0', borderRadius:14, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:700, cursor:'pointer' }}>{t?.cancelBtn||'Cancel'}</button>
          <button onClick={()=>{ if(!name.trim()) return alert('Isi nama playlist!'); onSave({ name:name.trim(), songIds:[...selected] }); }}
            style={{ flex:2, padding:'12px 0', borderRadius:14, border:'none', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:13, fontWeight:800, cursor:'pointer' }}>
            {isEdit ? t?.saveChanges||'Save Changes' : t?.createPlaylistBtn||'Create Playlist'}
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
function OrbitalRing({ size, pct, color, progress, duration, isPlaying, cover, title, onSeek, isLite, isRadio, downloadProg, isDownloading, drivePhase, ytDownloading, ytDlProg }) {
  const cx=size/2, cy=size/2, artR=size/2-36, ringR=artR+18, circ=2*Math.PI*ringR;
  const deg=pct*360-90, rad=deg*Math.PI/180;
  const dotX=cx+Math.cos(rad)*ringR, dotY=cy+Math.sin(rad)*ringR;
  const lblR=ringR+22, lblX=cx+Math.cos(rad)*lblR, lblY=cy+Math.sin(rad)*lblR;
  // Duration label: inside SVG bounds (bottom of ring, pulled inward)
  const durY=cy+ringR+16;

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
  const onMouseDown = e => { if (!onSeek||isRadio||!nearRing(e.clientX,e.clientY)) return; dragging.current=true; onSeek(getPct(e.clientX,e.clientY)); };
  const onMouseMove = e => { if (!dragging.current||!onSeek) return; onSeek(getPct(e.clientX,e.clientY)); };
  const onMouseUp   = () => { dragging.current=false; };

  // Touch events — need non-passive to call preventDefault (stops page scroll during drag)
  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    const tStart = e => {
      const t=e.touches[0]; if (!onSeek||isRadio||!nearRing(t.clientX,t.clientY)) return;
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
      <div style={{ position:'absolute', top:cy-artR, left:cx-artR, width:artR*2, height:artR*2, borderRadius:'50%', overflow:'hidden', border:`3px solid ${isRadio?color+'60':'rgba(255,255,255,0.13)'}`, boxShadow:isLite?'none':`0 0 40px -8px ${color}90`, animation:(!isLite && isPlaying && !isRadio)?'spin20 20s linear infinite':'none', zIndex:2 }}>
        {isRadio
          ? <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg,${color}30,${color}18)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, position:'relative' }}>
              <Radio size={artR*0.45} color={color}/>
              <div style={{ fontSize:artR*0.14, fontWeight:800, color:color, textTransform:'uppercase', letterSpacing:'0.12em' }}>LIVE</div>
              {isPlaying && !isLite && <div style={{ position:'absolute', width:'100%', height:'100%', borderRadius:'50%', boxShadow:`inset 0 0 ${artR*0.3}px ${color}40`, animation:'pulse 2s infinite' }}/>}
            </div>
          : isLite
            ? <div style={{ width:'100%', height:'100%', background:color+'33', display:'flex', alignItems:'center', justifyContent:'center' }}><Music size={artR*0.6} color={color}/></div>
            : <img src={cover} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
        {/* ── Fase CHECK — scanning overlay, audio sudah diputar via stream */}
        {drivePhase === 'check' && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:artR*0.1, background:'rgba(7,7,26,0.75)', ...(isLite?{}:{backdropFilter:'blur(3px)'}) }}>
            {/* Pulse rings — animasi hanya di Pro, Lite pakai ikon statis */}
            <div style={{ position:'relative', width:artR*0.7, height:artR*0.7, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {!isLite && <div style={{ position:'absolute', width:'100%', height:'100%', borderRadius:'50%', border:`2px solid ${color}`, opacity:0.6, animation:'pulse-ring 1.4s ease-out infinite' }}/>}
              {!isLite && <div style={{ position:'absolute', width:'70%', height:'70%', borderRadius:'50%', border:`2px solid ${color}`, opacity:0.4, animation:'pulse-ring 1.4s ease-out 0.4s infinite' }}/>}
              <div style={{ width:artR*0.22, height:artR*0.22, borderRadius:'50%', background:`${color}33`, border:`2px solid ${color}88`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:artR*0.1, height:artR*0.1, borderRadius:'50%', background:color, boxShadow:isLite?'none':`0 0 8px ${color}`, ...(isLite?{}:{animation:'pulse 1s ease-in-out infinite'}) }}/>
              </div>
            </div>
            <div style={{ fontSize:artR*0.13, fontWeight:700, color:'rgba(255,255,255,0.8)', letterSpacing:'0.05em', textAlign:'center' }}>{isLite ? '✓ Cache' : 'Checking…'}</div>
          </div>
        )}
        {/* ── Fase DOWNLOAD — circular progress bar */}
        {drivePhase === 'download' && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:artR*0.1, background:'rgba(7,7,26,0.62)', backdropFilter:'blur(3px)' }}>
            <svg width={artR*0.85} height={artR*0.85} style={{ flexShrink:0 }}>
              {(() => {
                const r = artR*0.34, c = artR*0.425, circ2 = 2*Math.PI*r;
                const pct2 = (downloadProg||0)/100;
                return (<>
                  <circle cx={c} cy={c} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth="4" fill="none"/>
                  <circle cx={c} cy={c} r={r} stroke={color} strokeWidth="4" fill="none"
                    strokeDasharray={circ2} strokeDashoffset={circ2 - circ2*pct2}
                    strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`}
                    style={{ transition:'stroke-dashoffset 0.3s ease', filter:`drop-shadow(0 0 4px ${color})` }}/>
                  <text x={c} y={c+1} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={artR*0.18} fontWeight="800" fontFamily="monospace">
                    {downloadProg > 0 ? `${downloadProg}%` : '…'}
                  </text>
                </>);
              })()}
            </svg>
            <div style={{ fontSize:artR*0.13, fontWeight:700, color:'rgba(255,255,255,0.75)', letterSpacing:'0.04em', textAlign:'center', padding:'0 6px' }}>
              Mengunduh…
            </div>
          </div>
        )}
        {/* ── YT Audio Download — overlay kecil di pojok kanan bawah cover saat download audio love */}
        {ytDownloading && drivePhase === 'idle' && (
          <div style={{ position:'absolute', bottom:6, right:6, display:'flex', alignItems:'center', gap:4, background:'rgba(7,7,26,0.82)', borderRadius:999, padding:'3px 7px 3px 5px' }}>
            <svg width={artR*0.28} height={artR*0.28} style={{ flexShrink:0 }}>
              {(() => {
                const r2 = artR*0.1, c2 = artR*0.14, ci = 2*Math.PI*r2;
                const p2 = (ytDlProg||0)/100;
                return (<>
                  <circle cx={c2} cy={c2} r={r2} stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" fill="none"/>
                  <circle cx={c2} cy={c2} r={r2} stroke="#60a5fa" strokeWidth="2.5" fill="none"
                    strokeDasharray={ci} strokeDashoffset={ci - ci*p2}
                    strokeLinecap="round" transform={`rotate(-90 ${c2} ${c2})`}
                    style={{ transition:'stroke-dashoffset 0.3s ease' }}/>
                </>);
              })()}
            </svg>
            <span style={{ fontSize:Math.max(8, artR*0.12), fontWeight:800, color:'#93c5fd', letterSpacing:'0.02em' }}>
              {ytDlProg > 0 ? `${ytDlProg}%` : '…'}
            </span>
          </div>
        )}
      </div>
      <svg ref={svgRef} width={size} height={size}
        style={{ position:'absolute', inset:0, zIndex:3, overflow:'visible', cursor:(!isRadio&&onSeek)?'grab':'default', touchAction:'none' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        {/* Wide invisible hit area */}
        <circle cx={cx} cy={cy} r={ringR} stroke="transparent" strokeWidth="44" fill="none"/>
        {/* Track */}
        <circle cx={cx} cy={cy} r={ringR} stroke="rgba(255,255,255,0.09)" strokeWidth="3.5" fill="none"/>
        {/* Radio: spinning dashed ring. Normal: progress arc */}
        {isRadio ? (
          <circle cx={cx} cy={cy} r={ringR} stroke={color} strokeWidth="4.5" fill="none"
            strokeDasharray={`${circ*0.35} ${circ*0.65}`} strokeLinecap="round"
            style={{ transformOrigin:`${cx}px ${cy}px`, animation: isPlaying ? 'spin 3s linear infinite' : 'none', filter:isLite?'none':`drop-shadow(0 0 6px ${color})` }}/>
        ) : (
          <circle className="progress-arc" cx={cx} cy={cy} r={ringR} stroke={color} strokeWidth="4.5" fill="none"
            strokeDasharray={circ} strokeDashoffset={circ-circ*pct} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: dragging.current?'none':'stroke-dashoffset 0.35s linear', filter:isLite?'none':`drop-shadow(0 0 6px ${color})` }}/>
        )}
        {/* 0:00 tick — hide for radio */}
        {!isRadio && <line x1={cx} y1={cy-ringR-7} x2={cx} y2={cy-ringR+7} stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" strokeLinecap="round"/>}
        {/* Dot glow — hide for radio */}
        {!isRadio && <circle cx={dotX} cy={dotY} r={14} fill={color} opacity="0.15"/>}
        {/* Draggable dot — hide for radio */}
        {!isRadio && <circle cx={dotX} cy={dotY} r={7} fill="white"
          style={{ filter:isLite?'none':'drop-shadow(0 0 8px rgba(255,255,255,1))', cursor:'grab' }}/>}
        {/* Current time — hide for radio */}
        {!isRadio && pct>0.01&&<text x={lblX} y={lblY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="monospace" style={{ filter:'drop-shadow(0 1px 5px rgba(0,0,0,1))', pointerEvents:'none' }}>{fmt(progress)}</text>}
        {/* Duration / LIVE label */}
        {isRadio
          ? <text x={cx} y={cy+ringR+20} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="10" fontWeight="800" fontFamily="monospace" style={{ pointerEvents:'none', letterSpacing:'0.12em' }}>● LIVE</text>
          : <text x={cx} y={durY} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.28)" fontSize="10" fontWeight="600" fontFamily="monospace" style={{ pointerEvents:'none' }}>{duration>0?fmt(duration):'--:--'}</text>
        }
        {/* Start label — hide for radio */}
        {!isRadio && <text x={cx} y={cy-ringR-20} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.18)" fontSize="10" fontWeight="600" fontFamily="monospace" style={{ pointerEvents:'none' }}>0:00</text>}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SONG ROW
// ═══════════════════════════════════════════════════════
const btn = { background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:8, display:'flex', borderRadius:8 };

function SongRow({ s, i, track, playing, liked, setLiked, toggleFav, play, isDrive, isCached, onRemove, playlists, addToPlaylist, isLite, t, onDownload }) {
  const isActive = track.id === s.id;
  const [dlState, setDlState] = React.useState('idle'); // idle | loading | done | error
  const handleHeart = (e) => {
    e.stopPropagation();
    if (toggleFav) toggleFav(s.id, null); // already in allSongs — just toggle pl_fav + liked
    else setLiked(l => ({ ...l, [s.id]: !l[s.id] }));
  };
  const handleDownload = async (e) => {
    e.stopPropagation();
    if (dlState === 'loading') return;
    setDlState('loading');
    try {
      if (onDownload) {
        await onDownload(s);
      } else if (s.src) {
        const raw = s.src.split('?')[0];
        const ext = raw.includes('.') ? raw.split('.').pop() : 'mp3';
        await downloadToDevice(s.src, `${s.title} - ${s.artist}.${ext}`);
      }
      setDlState('done');
      setTimeout(() => setDlState('idle'), 3000);
    } catch {
      setDlState('error');
      setTimeout(() => setDlState('idle'), 3000);
    }
  };
  const dlColor = dlState === 'done' ? '#4ade80' : dlState === 'error' ? '#f87171' : dlState === 'loading' ? (s.color || '#a78bfa') : 'rgba(255,255,255,0.2)';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:14, cursor:'pointer', background:isActive?s.bg:'rgba(255,255,255,0.04)', border:`1px solid ${isActive?s.color+'50':'transparent'}` }} onClick={()=>play(s)}>
      <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:isActive?s.color:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:isActive?'white':'rgba(255,255,255,0.4)' }}>
        {isActive&&playing ? (isLite ? <Music size={12} color="white"/> : <div style={{ display:'flex', gap:1.5, alignItems:'flex-end' }}>{[12,6,10].map((h,j)=>(<div key={j} style={{ width:2.5, height:h, background:'white', borderRadius:1, animation:`bounce 0.8s ease-in-out ${j*0.15}s infinite` }}/>))}</div>) : isDrive?<Cloud size={12}/>:i+1}
      </div>
      {isLite
        ? <div style={{ width:42, height:42, borderRadius:10, background:s.bg||'rgba(255,255,255,0.07)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}><Music size={16} color={s.color}/></div>
        : <img src={s.cover} alt={s.title} loading="lazy" decoding="async" style={{ width:42, height:42, borderRadius:10, objectFit:'cover', flexShrink:0 }}/>}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:isActive?'white':'rgba(255,255,255,0.85)' }}>{s.title}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.artist} · {s.album}</span>
          {isDrive && <span style={{ color:s.color, flexShrink:0 }}>· Drive</span>}
          {isCached && <span style={{ flexShrink:0, fontSize:9, fontWeight:800, color:'#4ade80', background:'rgba(74,222,128,0.12)', padding:'1px 5px', borderRadius:999 }}>✓ Offline</span>}
        </div>
      </div>
      <div style={{ display:'flex', gap:2 }}>
        {onRemove&&<button onClick={e=>{e.stopPropagation();onRemove(s.id)}} style={{ ...btn, color:'rgba(255,255,255,0.2)', padding:6 }}><Trash2 size={14}/></button>}
        {/* ── Tombol unduh ke perangkat */}
        <button onClick={handleDownload} title={dlState==='done'?'Berhasil diunduh!':dlState==='error'?'Gagal, coba lagi':'Unduh ke perangkat'}
          style={{ ...btn, color:dlColor, padding:6, transition:'color 0.2s' }}>
          {dlState==='loading'
            ? <Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }}/>
            : dlState==='done'
            ? <CheckCircle size={14}/>
            : <Download size={14}/>}
        </button>
        {playlists&&addToPlaylist&&(
          <div style={{ position:'relative' }} onClick={e=>e.stopPropagation()}>
            <button
              style={{ ...btn, color:'rgba(255,255,255,0.2)', padding:6 }}
              title="Tambah ke Playlist"
              onClick={e=>{ e.stopPropagation(); const el=e.currentTarget.nextSibling; el.style.display=el.style.display==='block'?'none':'block'; }}
            ><ListPlus size={14}/></button>
            <div style={{ display:'none', position:'absolute', right:0, top:'110%', zIndex:50, background:'#1a1a3e', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, minWidth:160, padding:'6px 0', boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', padding:'4px 12px 6px', textTransform:'uppercase', letterSpacing:'0.1em' }}>{t?.addToPlaylistHeader||'Add to'}</div>
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
        <button onClick={handleHeart} style={{ ...btn, color:liked[s.id]?'#f472b6':'rgba(255,255,255,0.2)', padding:6 }}><Heart size={15} fill={liked[s.id]?'#f472b6':'none'}/></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ERROR BOUNDARY — cegah white screen saat settings crash
// ═══════════════════════════════════════════════════════
class SettingsErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('SettingsPanel error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'flex-end' }}>
          <div style={{ width:'100%', background:'#0d0d24', borderRadius:'20px 20px 0 0', padding:'28px 20px 40px', border:'1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ width:36, height:4, borderRadius:999, background:'rgba(255,255,255,0.15)', margin:'0 auto 20px' }}/>
            <div style={{ textAlign:'center', padding:'12px 0' }}>
              <div style={{ fontSize:28, marginBottom:12 }}>⚠️</div>
              <div style={{ fontWeight:800, fontSize:15, color:'#fca5a5', marginBottom:6 }}>Pengaturan gagal dimuat</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:20 }}>
                {String(this.state.error?.message || 'Unknown error')}
              </div>
              <button onClick={()=>{ this.setState({hasError:false,error:null}); this.props.onClose(); }}
                style={{ padding:'10px 24px', borderRadius:12, border:'none', background:'rgba(239,68,68,0.25)', color:'#fca5a5', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════
//  ERROR BOUNDARY — cegah blank screen saat playlist crash
// ═══════════════════════════════════════════════════════
class PlaylistErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Playlist render error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 20px', textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:14 }}>⚠️</div>
          <div style={{ fontWeight:800, fontSize:15, color:'#fca5a5', marginBottom:8 }}>Gagal memuat playlist</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>
            {String(this.state.error?.message || 'Unknown error')}
          </div>
          <button onClick={()=>{ this.setState({hasError:false,error:null}); if(this.props.onBack) this.props.onBack(); }}
            style={{ padding:'10px 24px', borderRadius:12, border:'none', background:'rgba(239,68,68,0.2)', color:'#fca5a5', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            ← Kembali
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Komponen SettingsPanel dengan Error Boundary
function SettingsPanel(props) {
  return (
    <SettingsErrorBoundary onClose={props.onClose}>
      <SettingsPanelInner {...props}/>
    </SettingsErrorBoundary>
  );
}

// ─────────────────────────────────────────────────────────
// ── DNS-style masked key input component
function MaskedKeyInput({ value, onChange, onBlur, placeholder, accentColor, label }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef(null);

  // Fungsi masking: tampilkan 4 karakter awal + bintang
  const maskKey = (val) => {
    if (!val) return '';
    const visible = val.slice(0, 6);
    const stars = '●'.repeat(Math.min(val.length - 6, 20));
    return visible + stars;
  };

  const handleStartEdit = () => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleFinish = () => {
    onChange(draft);
    onBlur(draft);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleFinish();
    if (e.key === 'Escape') { setEditing(false); setDraft(''); }
  };

  if (editing) {
    return (
      <div style={{ display:'flex', gap:5 }}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleFinish}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ flex:1, padding:'8px 11px', borderRadius:10, border:`1px solid ${accentColor}55`, background:`${accentColor}10`, color:'white', fontSize:11, outline:'none', fontFamily:'monospace', boxSizing:'border-box' }}
          autoComplete="off" spellCheck={false}
        />
        <button onClick={handleFinish}
          style={{ padding:'6px 10px', borderRadius:10, border:`1px solid ${accentColor}40`, background:`${accentColor}20`, color:accentColor, fontSize:11, cursor:'pointer', fontWeight:700, flexShrink:0 }}>
          ✓
        </button>
      </div>
    );
  }

  return (
    <div onClick={handleStartEdit}
      style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 11px', borderRadius:10, border:`1px solid ${value ? accentColor+'35' : 'rgba(255,255,255,0.1)'}`, background: value ? `${accentColor}08` : 'rgba(255,255,255,0.03)', cursor:'text', minHeight:36 }}>
      {value ? (
        <>
          <span style={{ flex:1, fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.75)', letterSpacing:'0.04em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {maskKey(value)}
          </span>
          <span style={{ fontSize:9, color:accentColor, fontWeight:700, flexShrink:0 }}>Edit</span>
        </>
      ) : (
        <span style={{ flex:1, fontSize:11, color:'rgba(255,255,255,0.25)', fontFamily:'monospace' }}>{placeholder}</span>
      )}
    </div>
  );
}

function SettingsPanelInner({ onClose, color, sleepTimer, startSleepTimer, cancelSleepTimer, globalCover, setGlobalCover, isLite, toggleMode, pwaPrompt, pwaInstalled, installPwa, customDns, setCustomDns, lang, toggleLang, t, userSpId, setUserSpId, userSpSecret, setUserSpSecret, userScId, setUserScId, userAiKey, setUserAiKey, userYtKey, setUserYtKey }) {
  const coverRef = useRef(null);
  const [apiKeyTab, setApiKeyTab] = React.useState('spotify');
  return (
    <div style={{ position:'absolute', inset:0, zIndex:150, background:'rgba(0,0,0,0.6)', ...(isLite?{}:{backdropFilter:'blur(4px)'}), display:'flex', alignItems:'stretch' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scrollbar-hide" style={{ width:'100%', height:'100%', overflowY:'auto', overflowX:'hidden', background:'#0d0d24', border:'none', borderRadius:0, padding:'0 0 32px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px 0', marginBottom:6 }}>
          <div style={{ fontWeight:900, fontSize:15, letterSpacing:'-0.02em' }}>{t ? t.settings : 'Pengaturan'}</div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:999, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>×</button>
        </div>

        {/* ── SLEEP TIMER */}
        <div style={{ padding:'16px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <Moon size={16} style={{ color }}/>
            <span style={{ fontWeight:800, fontSize:14 }}>Sleep Timer</span>
            {sleepTimer&&(
              <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, fontWeight:800, color, fontFamily:'monospace' }}>{fmtSec(sleepTimer.remaining)}</span>
                <button onClick={cancelSleepTimer} style={{ padding:'4px 10px', borderRadius:999, border:'none', background:'rgba(239,68,68,0.2)', color:'#fca5a5', fontSize:11, fontWeight:700, cursor:'pointer' }}>{t?.cancelBtn||'Cancel'}</button>
              </div>
            )}
          </div>
          {!sleepTimer ? (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {SLEEP_OPTIONS.map(o=>(
                <button key={o.min} onClick={()=>{ startSleepTimer(o.min); onClose(); }} style={{ padding:'8px 14px', borderRadius:12, border:`1px solid rgba(255,255,255,0.12)`, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600, cursor:'pointer' }}>{o.label}</button>
              ))}
            </div>
          ) : (
            <div style={{ padding:'12px 14px', borderRadius:12, background:`${color}15`, border:`1px solid ${color}30`, textAlign:'center' }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Musik berhenti dalam</div>
              <div style={{ fontSize:24, fontWeight:900, color, fontFamily:'monospace', marginTop:4 }}>{fmtSec(sleepTimer.remaining)}</div>
            </div>
          )}
        </div>

        {/* ── FOTO COVER GLOBAL */}
        <div style={{ padding:'16px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <Music size={16} style={{ color }}/>
            <span style={{ fontWeight:800, fontSize:14 }}>{t?.globalCoverAll||'Cover Photo for All Songs'}</span>
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
                {globalCover ? (t?.changeCover||'Change Photo') : (t?.chooseCover||'Choose Photo')}
              </button>
              {globalCover && (
                <button onClick={() => { setGlobalCover(''); localStorage.removeItem('sn_global_cover'); }}
                  style={{ padding:'9px 14px', borderRadius:12, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#fca5a5', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  {t?.deleteCover||'Remove Photo'}
                </button>
              )}
            </div>
          </div>
          {globalCover && (
            <div style={{ marginTop:8, fontSize:11, color:'rgba(255,255,255,0.3)', textAlign:'center' }}>
              {t?.coverApplied||'Photo applied to all songs · Saved in browser'}
            </div>
          )}
        </div>

        {/* ── DNS SETTINGS */}
        <div style={{ padding:'16px 18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:16 }}>🌐</span>
            <div>
              <div style={{ fontWeight:800, fontSize:14 }}>DNS Kustom</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Ganti DNS untuk mempercepat atau membuka blokir</div>
            </div>
          </div>
          {/* Preset DNS buttons */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
            {[
              { label:'Default', value:'', desc:'DNS bawaan ISP' },
              { label:'Google', value:'8.8.8.8', desc:t?.googleDnsLabel||'Google DNS — fast & stable' },
              { label:'Cloudflare', value:'1.1.1.1', desc:'Cloudflare — privasi & cepat' },
              { label:'OpenDNS', value:'208.67.222.222', desc:'OpenDNS — keamanan ekstra' },
              { label:'Quad9', value:'9.9.9.9', desc:'Quad9 — blokir malware' },
            ].map(opt => (
              <button key={opt.label} onClick={() => { setCustomDns(opt.value); localStorage.setItem('sn_custom_dns', opt.value); }}
                style={{ padding:'6px 12px', borderRadius:999, border:'none', fontSize:11, fontWeight:700, cursor:'pointer',
                  background: customDns === opt.value ? color : 'rgba(255,255,255,0.08)',
                  color: customDns === opt.value ? 'white' : 'rgba(255,255,255,0.55)' }}
                title={opt.desc}>{opt.label}</button>
            ))}
          </div>
          {/* Custom DNS input */}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input
              type="text"
              placeholder="Masukkan IP DNS kustom, mis. 1.1.1.1"
              value={customDns}
              onChange={e => setCustomDns(e.target.value)}
              onBlur={e => localStorage.setItem('sn_custom_dns', e.target.value)}
              style={{ flex:1, padding:'9px 12px', borderRadius:12, border:`1px solid rgba(255,255,255,0.12)`, background:'rgba(255,255,255,0.06)', color:'white', fontSize:12, outline:'none', fontFamily:'monospace' }}
            />
            {customDns && (
              <button onClick={() => { setCustomDns(''); localStorage.removeItem('sn_custom_dns'); }}
                style={{ padding:'9px 12px', borderRadius:12, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#fca5a5', fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                Reset
              </button>
            )}
          </div>
          <div style={{ marginTop:8, padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', lineHeight:1.6 }}>
              ⓘ Pengaturan DNS di browser terbatas. Untuk DNS penuh, ubah juga di:<br/>
              <span style={{ color:'rgba(255,255,255,0.5)' }}>Wi-Fi/Ethernet → TCP/IP → DNS Server</span>
              {customDns && (
                <span> — {t?.dnsActiveLabel||'Active: '}<span style={{ color, fontFamily:'monospace' }}>{customDns}</span></span>
              )}
            </div>
          </div>
        </div>


        {/* ── API KEYS */}
        <div style={{ padding:'16px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:16 }}>🔑</span>
            <div>
              <div style={{ fontWeight:800, fontSize:14 }}>API Keys</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Key milikmu diutamakan — kosongkan untuk pakai bawaan</div>
            </div>
          </div>

          {/* ── Filter Tab Bar (DNS-style pill selector) */}
          <div style={{ display:'flex', gap:4, marginBottom:14, background:'rgba(255,255,255,0.05)', borderRadius:10, padding:3 }}>
            {[
              { id:'spotify', label:'Spotify', icon:<svg width={11} height={11} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#1DB954"/><path d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15C9.65 6.8 15.5 7 19.1 9.15c.45.25.6.85.35 1.3-.25.35-.85.5-1.55.45zM17.75 13.55c-.2.35-.65.45-1 .25-2.65-1.6-6.65-2.05-9.75-1.1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.55-1.1 7.95-.55 11 1.3.3.15.4.6.15.95zM16.6 16.1c-.15.3-.5.4-.8.25-2.3-1.4-5.2-1.7-8.6-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.75-.85 6.95-.5 9.5 1.1.35.15.4.5.2.8z" fill="white"/></svg>, activeColor:'#1DB954', activeBg:'rgba(29,185,84,0.15)', dot: (userSpId && userSpSecret) },
              { id:'soundcloud', label:'SoundCloud', icon:<svg width={11} height={11} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#ff5500"/><rect x="5.5" y="10" width="2" height="7" rx="1" fill="white"/><rect x="8.5" y="8.5" width="2" height="8.5" rx="1" fill="white"/><rect x="11.5" y="7" width="2" height="10" rx="1" fill="white"/><rect x="14.5" y="8" width="2" height="9" rx="1" fill="white"/><rect x="17.5" y="9.5" width="2" height="7.5" rx="1" fill="white"/></svg>, activeColor:'#ff5500', activeBg:'rgba(255,85,0,0.15)', dot: !!userScId },
              { id:'youtube', label:'YouTube', icon:<svg width={11} height={11} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#FF0000"/><path d="M19.6 7.8a2.5 2.5 0 00-1.76-1.77C16.4 5.7 12 5.7 12 5.7s-4.4 0-5.84.33A2.5 2.5 0 004.4 7.8C4.08 9.24 4.08 12 4.08 12s0 2.76.32 4.2a2.5 2.5 0 001.76 1.77C7.6 18.3 12 18.3 12 18.3s4.4 0 5.84-.33a2.5 2.5 0 001.76-1.77C19.92 14.76 19.92 12 19.92 12s0-2.76-.32-4.2z" fill="white"/><path d="M10.2 14.7V9.3l4.8 2.7-4.8 2.7z" fill="#FF0000"/></svg>, activeColor:'#FF0000', activeBg:'rgba(255,0,0,0.12)', dot: !!userYtKey },
              { id:'ai', label:'AI Key', icon:<svg width={11} height={11} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#6366f1"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5"/><circle cx="12" cy="12" r="1.5" fill="white"/><line x1="12" y1="4" x2="12" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="17" x2="12" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="4" y1="12" x2="7" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="17" y1="12" x2="20" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>, activeColor:'#818cf8', activeBg:'rgba(99,102,241,0.15)', dot: !!userAiKey },

            ].map(({ id, label, icon, activeColor, activeBg, dot }) => {
              const isActive = apiKeyTab === id;
              return (
                <button key={id} onClick={() => setApiKeyTab(id)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'5px 4px', borderRadius:7, border:'none', cursor:'pointer', background: isActive ? activeBg : 'transparent', color: isActive ? activeColor : 'rgba(255,255,255,0.38)', fontWeight: isActive ? 700 : 500, fontSize:10, transition:'all 0.15s', position:'relative' }}>
                  {icon}
                  <span style={{ whiteSpace:'nowrap' }}>{label}</span>
                  {dot && <span style={{ width:5, height:5, borderRadius:'50%', background: activeColor, opacity: isActive ? 1 : 0.5, flexShrink:0 }}/>}
                </button>
              );
            })}
          </div>

          {/* ── Spotify Panel */}
          {apiKeyTab === 'spotify' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#1DB954"/><path d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15C9.65 6.8 15.5 7 19.1 9.15c.45.25.6.85.35 1.3-.25.35-.85.5-1.55.45zM17.75 13.55c-.2.35-.65.45-1 .25-2.65-1.6-6.65-2.05-9.75-1.1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.55-1.1 7.95-.55 11 1.3.3.15.4.6.15.95zM16.6 16.1c-.15.3-.5.4-.8.25-2.3-1.4-5.2-1.7-8.6-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.75-.85 6.95-.5 9.5 1.1.35.15.4.5.2.8z" fill="white"/></svg>
                <span style={{ fontWeight:700, fontSize:12, color:'rgba(255,255,255,0.85)' }}>Spotify API</span>
                {(userSpId && userSpSecret) && <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:999, background:'rgba(29,185,84,0.2)', color:'#1DB954' }}>✓ Aktif</span>}
              </div>
              <div style={{ marginBottom:6 }}>
                <MaskedKeyInput
                  value={userSpId}
                  onChange={v => setUserSpId(v)}
                  onBlur={v => localStorage.setItem('sn_sp_id', v)}
                  placeholder="Client ID"
                  accentColor="#1DB954"
                />
              </div>
              <MaskedKeyInput
                value={userSpSecret}
                onChange={v => setUserSpSecret(v)}
                onBlur={v => localStorage.setItem('sn_sp_secret', v)}
                placeholder="Client Secret"
                accentColor="#1DB954"
              />
              <div style={{ marginTop:6, fontSize:9, color:'rgba(255,255,255,0.25)', lineHeight:1.6 }}>
                Daftarkan app di developer.spotify.com → buat app → salin Client ID & Secret
              </div>
              {(userSpId || userSpSecret) && (
                <button onClick={() => { setUserSpId(''); setUserSpSecret(''); localStorage.removeItem('sn_sp_id'); localStorage.removeItem('sn_sp_secret'); }}
                  style={{ marginTop:6, padding:'4px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:10, cursor:'pointer' }}>
                  Hapus Key Spotify
                </button>
              )}
            </div>
          )}

          {/* ── SoundCloud Panel */}
          {apiKeyTab === 'soundcloud' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#ff5500"/><rect x="5.5" y="10" width="2" height="7" rx="1" fill="white"/><rect x="8.5" y="8.5" width="2" height="8.5" rx="1" fill="white"/><rect x="11.5" y="7" width="2" height="10" rx="1" fill="white"/><rect x="14.5" y="8" width="2" height="9" rx="1" fill="white"/><rect x="17.5" y="9.5" width="2" height="7.5" rx="1" fill="white"/></svg>
                <span style={{ fontWeight:700, fontSize:12, color:'rgba(255,255,255,0.85)' }}>SoundCloud API</span>
                {userScId && <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:999, background:'rgba(255,85,0,0.2)', color:'#ff5500' }}>✓ Aktif</span>}
              </div>
              <MaskedKeyInput
                value={userScId}
                onChange={v => setUserScId(v)}
                onBlur={v => localStorage.setItem('sn_sc_id', v)}
                placeholder="Client ID"
                accentColor="#ff5500"
              />
              <div style={{ marginTop:6, fontSize:9, color:'rgba(255,255,255,0.25)', lineHeight:1.6 }}>
                Daftar di soundcloud.com/you/apps → buat app → salin Client ID
              </div>
              {userScId && (
                <button onClick={() => { setUserScId(''); localStorage.removeItem('sn_sc_id'); }}
                  style={{ marginTop:6, padding:'4px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:10, cursor:'pointer' }}>
                  Hapus Key SoundCloud
                </button>
              )}
            </div>
          )}

          {/* ── YouTube Panel */}
          {apiKeyTab === 'youtube' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#FF0000"/><path d="M19.6 7.8a2.5 2.5 0 00-1.76-1.77C16.4 5.7 12 5.7 12 5.7s-4.4 0-5.84.33A2.5 2.5 0 004.4 7.8C4.08 9.24 4.08 12 4.08 12s0 2.76.32 4.2a2.5 2.5 0 001.76 1.77C7.6 18.3 12 18.3 12 18.3s4.4 0 5.84-.33a2.5 2.5 0 001.76-1.77C19.92 14.76 19.92 12 19.92 12s0-2.76-.32-4.2z" fill="white"/><path d="M10.2 14.7V9.3l4.8 2.7-4.8 2.7z" fill="#FF0000"/></svg>
                <span style={{ fontWeight:700, fontSize:12, color:'rgba(255,255,255,0.85)' }}>YouTube Data API v3</span>
                {userYtKey && <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:999, background:'rgba(255,0,0,0.18)', color:'#ff6b6b' }}>✓ Aktif</span>}
              </div>
              <MaskedKeyInput
                value={userYtKey}
                onChange={v => setUserYtKey(v)}
                onBlur={v => localStorage.setItem('sn_yt_key', v)}
                placeholder="AIza… · console.cloud.google.com"
                accentColor="#FF0000"
              />
              <div style={{ marginTop:8, padding:'10px 12px', borderRadius:10, background:'rgba(255,0,0,0.06)', border:'1px solid rgba(255,0,0,0.15)' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
                  🔴 <strong style={{ color:'rgba(255,255,255,0.75)' }}>Manfaat:</strong> Search YouTube lebih akurat &amp; relevan, trending musik Indonesia real-time, tidak bergantung Piped/Invidious yang sering down.<br/>
                  <span style={{ color:'rgba(255,255,255,0.3)' }}>Cara dapat key: console.cloud.google.com → buat project → enable "YouTube Data API v3" → Create Credentials → API Key</span>
                </div>
              </div>
              {userYtKey && (
                <button onClick={() => { setUserYtKey(''); localStorage.removeItem('sn_yt_key'); }}
                  style={{ marginTop:6, padding:'4px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:10, cursor:'pointer' }}>
                  Hapus Key YouTube
                </button>
              )}
            </div>
          )}

          {/* ── AI Key Panel (OpenAI/OR/Groq + DeepSeek + Grok) */}
          {apiKeyTab === 'ai' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Unified AI Key */}
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#6366f1"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5"/><circle cx="12" cy="12" r="1.5" fill="white"/><line x1="12" y1="4" x2="12" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="17" x2="12" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="4" y1="12" x2="7" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="17" y1="12" x2="20" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span style={{ fontWeight:700, fontSize:11, color:'rgba(255,255,255,0.85)' }}>AI API Key</span>
                  {userAiKey && (() => {
                    const k = userAiKey;
                    const label = k.startsWith('sk-ant-') ? 'Anthropic' : k.startsWith('sk-or-') ? 'OpenRouter' : k.startsWith('gsk_') ? 'Groq' : k.startsWith('AIza') ? 'Gemini' : k.startsWith('xai-') ? 'xAI Grok' : k.startsWith('sk-') ? 'OpenAI / DeepSeek' : 'Aktif';
                    return <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:999, background:'rgba(99,102,241,0.2)', color:'#818cf8' }}>{'✓'} {label}</span>;
                  })()}
                </div>
                <MaskedKeyInput
                  value={userAiKey}
                  onChange={v => setUserAiKey(v)}
                  onBlur={v => localStorage.setItem('sn_ai_key', v)}
                  placeholder="sk- / sk-or- / sk-ant- / gsk_ / AIza / xai-"
                  accentColor="#818cf8"
                />
                <div style={{ marginTop:6, fontSize:9, color:'rgba(255,255,255,0.25)', lineHeight:1.9 }}>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>sk-</span> {'→'} OpenAI / DeepSeek &nbsp;{'·'}&nbsp;
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>sk-or-</span> {'→'} OpenRouter<br/>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>sk-ant-</span> {'→'} Anthropic &nbsp;{'·'}&nbsp;
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>gsk_</span> {'→'} Groq<br/>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>AIza</span> {'→'} Gemini &nbsp;{'·'}&nbsp;
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>xai-</span> {'→'} xAI Grok
                </div>
                {userAiKey && (
                  <button onClick={() => { setUserAiKey(''); localStorage.removeItem('sn_ai_key'); }}
                    style={{ marginTop:6, padding:'3px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:10, cursor:'pointer' }}>
                    Hapus
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

        {/* ── BAHASA / LANGUAGE */}
        <div style={{ padding:'16px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>🌐</span>
              <div>
                <div style={{ fontWeight:800, fontSize:14 }}>{t ? t.language : 'Bahasa'}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{t ? t.languageDesc : 'Pilih bahasa tampilan aplikasi'}</div>
              </div>
            </div>
            {/* Language pill toggle */}
            <div style={{ display:'flex', alignItems:'center', gap:0, borderRadius:999, border:'1px solid rgba(255,255,255,0.15)', overflow:'hidden', flexShrink:0 }}>
              <button
                onClick={() => { if (lang !== 'id') toggleLang(); }}
                style={{ padding:'5px 12px', border:'none', cursor:'pointer', fontSize:11, fontWeight:800, letterSpacing:'0.04em',
                  background: lang === 'id' ? color : 'transparent',
                  color: lang === 'id' ? 'white' : 'rgba(255,255,255,0.4)',
                  transition:'all 0.2s' }}>
                🇮🇩 ID
              </button>
              <div style={{ width:1, height:16, background:'rgba(255,255,255,0.15)', flexShrink:0 }}/>
              <button
                onClick={() => { if (lang !== 'en') toggleLang(); }}
                style={{ padding:'5px 12px', border:'none', cursor:'pointer', fontSize:11, fontWeight:800, letterSpacing:'0.04em',
                  background: lang === 'en' ? color : 'transparent',
                  color: lang === 'en' ? 'white' : 'rgba(255,255,255,0.4)',
                  transition:'all 0.2s' }}>
                🇬🇧 EN
              </button>
            </div>
          </div>
        </div>

        {/* ── MODE LITE / PRO */}
        <div style={{ padding:'16px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>{isLite ? '⚡' : '✨'}</span>
              <div>
                <div style={{ fontWeight:800, fontSize:14 }}>{t ? t.modeLite : 'Mode'} {isLite ? 'Lite' : 'Pro'}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{isLite ? (t ? t.modeLiteDesc : 'Hemat data · tanpa animasi · load cepat') : (t ? t.modeProDesc : 'Animasi penuh · cover art · fitur AI')}</div>
              </div>
            </div>
            <div onClick={toggleMode} style={{ width:44, height:24, borderRadius:999, background:isLite?'#10b981':'rgba(255,255,255,0.1)', cursor:'pointer', position:'relative', flexShrink:0 }}>
              <div style={{ position:'absolute', top:3, left:isLite?22:3, width:18, height:18, borderRadius:'50%', background:'white', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
            </div>
          </div>
          <div style={{ borderRadius:12, background:isLite?'rgba(16,185,129,0.08)':'rgba(99,102,241,0.08)', border:`1px solid ${isLite?'rgba(16,185,129,0.2)':'rgba(99,102,241,0.2)'}`, padding:'10px 14px', display:'flex', flexDirection:'column', gap:5 }}>
            {((isLite ? (t ? t.liteFeatures : T.id.liteFeatures) : (t ? t.proFeatures : T.id.proFeatures))).map(([feat, desc])=>(
              <div key={feat} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                <span style={{ fontSize:11, flexShrink:0 }}>{feat.split(' ')[0]}</span>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>{feat.slice(2)}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── INSTALL APP (PWA) */}
        <div style={{ padding:'16px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:16 }}>📲</span>
            <div>
              <div style={{ fontWeight:800, fontSize:14 }}>{t?.installApp||'Install as App'}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{t?.installAppDesc||'Desktop & Mobile — no app store needed'}</div>
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
              <span style={{ fontSize:16 }}>📲</span>{t?.installNow||'Install Now'}
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

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  UPLOAD MODAL
// ═══════════════════════════════════════════════════════
function UploadModal({ onClose, onUpload, uploading, uploadProgress, color, isLite, t }) {
  const [file,setFile]=useState(null), [title,setTitle]=useState(''), [artist,setArtist]=useState(''), [album,setAlbum]=useState(''), [dragging,setDragging]=useState(false);
  const fileRef=useRef(null);
  const handleFile=f=>{ if(!f||!f.type.startsWith('audio/')) return alert(t?.selectAudioFile||'Select an audio file'); setFile(f); if(!title) setTitle(f.name.replace(/\.[^/.]+$/,'')); };
  const inp = { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 12px', fontSize:13, color:'white', outline:'none', marginTop:6 };
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', ...(isLite ? {} : { backdropFilter:'blur(8px)' }), display:'flex', alignItems:'flex-end' }} onClick={e=>e.target===e.currentTarget&&!uploading&&onClose()}>
      <div style={{ width:'100%', maxHeight:'92dvh', overflowY:'auto', background:'#0f0f2a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px 24px 0 0', padding:'20px 20px 32px' }}>
        <div style={{ width:36, height:4, borderRadius:999, background:'rgba(255,255,255,0.15)', margin:'0 auto 18px' }}/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${color},#6366f1)`, display:'flex', alignItems:'center', justifyContent:'center' }}><Upload size={16} style={{ color:'white' }}/></div>
            <div><div style={{ fontWeight:800, fontSize:15 }}>{t?.addSong||'Add Song'}</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{t?.uploadToDrive||'Upload to Drive'}</div></div>
          </div>
          {!uploading&&<button onClick={onClose} style={{ ...btn, color:'rgba(255,255,255,0.5)' }}><X size={20}/></button>}
        </div>
        <div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0])}} onClick={()=>!uploading&&fileRef.current?.click()} style={{ border:`2px dashed ${file?color:dragging?color:'rgba(255,255,255,0.15)'}`, borderRadius:16, padding:'24px 20px', textAlign:'center', cursor:uploading?'default':'pointer', background:file?`${color}10`:dragging?`${color}08`:'rgba(255,255,255,0.02)', marginBottom:18 }}>
          <input ref={fileRef} type="file" accept="audio/*" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])}/>
          {file ? (<><CheckCircle size={28} style={{ color, margin:'0 auto 8px', display:'block' }}/><div style={{ fontWeight:700, fontSize:13 }}>{file.name}</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{(file.size/1024/1024).toFixed(1)} MB</div></>) : (<><Music size={28} style={{ color:'rgba(255,255,255,0.2)', margin:'0 auto 8px', display:'block' }}/><div style={{ fontWeight:700, fontSize:13 }}>{dragging?(t?.dropHere||'Drop it here!'):(t?.dropOrTap||'Tap or drag & drop')}</div><div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>MP3, M4A, WAV, FLAC, OGG</div></>)}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:18 }}>
          {[['Judul Lagu *',title,setTitle,'Nama lagu...'],['Artis',artist,setArtist,'Nama artis...'],['Album',album,setAlbum,'Nama album...']].map(([label,val,set,ph])=>(
            <div key={label}><label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</label><input value={val} onChange={e=>set(e.target.value)} placeholder={ph} disabled={uploading} style={inp}/></div>
          ))}
        </div>
        {uploading&&<div style={{ marginBottom:14 }}><div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}><span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{t?.uploading||'Uploading…'}</span><span style={{ fontSize:12, color, fontWeight:700 }}>{uploadProgress}%</span></div><div style={{ height:5, borderRadius:999, background:'rgba(255,255,255,0.08)' }}><div style={{ height:'100%', borderRadius:999, width:`${uploadProgress}%`, background:`linear-gradient(90deg,${color},${color}aa)` }}/></div></div>}
        <div style={{ display:'flex', gap:10 }}>
          {!uploading&&<button onClick={onClose} style={{ flex:1, padding:'12px 0', borderRadius:14, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:700, cursor:'pointer' }}>{t?.cancelBtn||'Cancel'}</button>}
          <button onClick={()=>{ if(!file){alert(t?.selectFileFirst||'Please select a file first!');return;} onUpload(file,{title,artist,album}); }} disabled={uploading||!file} style={{ flex:2, padding:'12px 0', borderRadius:14, border:'none', background:!file?'rgba(255,255,255,0.08)':`linear-gradient(135deg,${color},#6366f1)`, color:'white', fontSize:13, fontWeight:800, cursor:uploading||!file?'default':'pointer', opacity:uploading?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {uploading?<><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>{t?.uploading||'Uploading…'}</>:<><Cloud size={15}/>{t?.uploadBtn||'Upload to Drive'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════
// ── Device type detection — phone vs tablet/desktop
// Phone: mobile UA (not iPad/tablet) AND small physical screen (min dimension < 500px)
// Tablet/Desktop: everything else gets desktop UI
function isPhoneDevice() {
  const ua = navigator.userAgent;
  const isMobileUA = /android|iphone|ipod|blackberry|windows phone/i.test(ua);
  const isTabletUA = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
  const smallScreen = Math.min(window.screen.width, window.screen.height) < 500;
  // Phone = mobile UA but NOT tablet UA; OR very small physical screen
  return (isMobileUA && !isTabletUA) || smallScreen;
}

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
  useEffect(() => { setRuntimeKeys(userSpId, userSpSecret, userScId, userAiKey, '', '', userYtKey); }, [userSpId, userSpSecret, userScId, userAiKey, userYtKey]);

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
  // Multi-source radio state
  const [rbSource, setRbSource] = useState('radiobrowser'); // 'radiobrowser'|'somafm'|'garden'|'nts'|'all'
  const [somaChannels, setSomaChannels] = useState([]);
  const [gardenPlaces, setGardenPlaces] = useState([]);
  const [gardenStations, setGardenStations] = useState([]);
  const [gardenCountry, setGardenCountry] = useState(null);
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
          const r = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=b6747d04&format=json&limit=5&search=${encodeURIComponent(q)}&include=musicinfo&imagesize=200`, { signal: AbortSignal.timeout(5000) });
          if (!r.ok) return [];
          const d = await r.json();
          return (d.results || []).map(t => ({
            type:'jamendo', audioUrl:t.audio, title:t.name, artist:t.artist_name,
            thumbnail:t.image, source:'jamendo', duration:t.duration, id:t.id,
          }));
        } catch { return []; }
      })();
      const fmaPromise = (async () => {
        try {
          // FMA public API — tanpa API key via CORS proxy atau langsung
          const r = await fetch(`https://freemusicarchive.org/api/get/tracks.json?limit=5&title=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(5000) });
          if (!r.ok) return [];
          const d = await r.json();
          return (d.dataset || []).slice(0, 4).map(t => ({
            type:'fma', audioUrl:t.track_file, title:t.track_title||t.track_name,
            artist:t.artist_name, thumbnail:t.track_image_file||null,
            source:'fma', duration:t.track_duration||(t.track_duration_sec||0),
            id:t.track_id, externalUrl:t.track_url,
          }));
        } catch { return []; }
      })();
      const ccmixtPromise = (async () => {
        try {
          const r = await fetch(`https://ccmixter.org/api/query?title=${encodeURIComponent(q)}&limit=5&f=json&lic_gentag=attribution`, { signal: AbortSignal.timeout(5000) });
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
      // ── SoundCloud: search via public widget API (tanpa key) ATAU API jika ada key
      const scPublicPromise = !scHasKey ? (async () => {
        try {
          // SoundCloud public resolve API (tanpa key) via oEmbed search hint
          // Gunakan Jamendo-style: search dari SoundCloud public search page scraping alternative
          // Fallback: gunakan SoundCloud widget search via noembed
          const r = await fetch(`https://api.soundcloud.com/tracks?q=${encodeURIComponent(q)}&limit=5&client_id=2t9loNQH90kzJcsFCODdigxfp325aq4z`, { signal: AbortSignal.timeout(5000) });
          if (!r.ok) throw new Error('sc public failed');
          const d = await r.json();
          return (d||[]).slice(0,5).map(t => ({
            type:'sc_track', id:t.id, title:t.title,
            artist: t.user?.username||'SoundCloud',
            duration: t.duration ? Math.floor(t.duration/1000) : 0,
            thumbnail: t.artwork_url || t.user?.avatar_url || null,
            permalinkUrl: t.permalink_url,
            streamUrl: t.permalink_url,
            source:'soundcloud',
          }));
        } catch {
          return [{ type:'sc_embed_fallback', query: q, source:'soundcloud' }];
        }
      })() : Promise.resolve([]);

      // ── Spotify: search via public token (tanpa key user) ATAU API jika ada key
      const spPublicPromise = !spHasKey ? (async () => {
        try {
          // Spotify public token endpoint (client credentials tanpa user key)
          const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
            method:'POST',
            headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
            body:'grant_type=client_credentials&client_id=d6c95e4c89a14a1a9a1e1c1fc6a0ab26&client_secret=c0b05d8e3a694f98847d2b37f8f5b7a3',
            signal: AbortSignal.timeout(5000),
          });
          if (!tokenRes.ok) throw new Error('sp token failed');
          const tokenData = await tokenRes.json();
          const token = tokenData.access_token;
          if (!token) throw new Error('no token');
          const r = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=5&market=ID`, {
            headers:{ Authorization:`Bearer ${token}` },
            signal: AbortSignal.timeout(5000),
          });
          if (!r.ok) throw new Error('sp search failed');
          const d = await r.json();
          return (d.tracks?.items||[]).map(t => ({
            type:'sp_track',
            id: t.id,
            title: t.name,
            artist: t.artists?.map(a=>a.name).join(', ') || 'Spotify',
            duration: t.duration_ms||0,
            cover: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || null,
            previewUrl: t.preview_url||null,
            spotifyUrl: t.external_urls?.spotify||'',
            source:'spotify',
          }));
        } catch {
          return [{ type:'sp_embed_fallback', query: q, source:'spotify' }];
        }
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
        setWsError('Tidak ada hasil dari sumber lain. SoundCloud & Spotify ditampilkan sebagai embed.');
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
      const r = await askAI(
        `Berikan 5 video YouTube untuk musik "${query}". Format JSON array: [{"videoId":"xxx","title":"...","uploaderName":"...","duration":240}]. Hanya JSON, tanpa penjelasan.`,
        'Kamu asisten musik. Berikan videoId YouTube yang valid untuk lagu populer. Pastikan format JSON valid.'
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
          const userKey = _USER_YT_KEY;
          let res;
          if (userKey) {
            const params = new URLSearchParams({
              key: userKey, part: 'snippet,contentDetails', chart: 'mostPopular',
              videoCategoryId: '10', regionCode: 'ID', maxResults: '8',
              fields: 'items(id,snippet/title,snippet/channelTitle,snippet/thumbnails/medium,contentDetails/duration)',
            });
            res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`, { signal: ctrl.signal });
          } else {
            const params = new URLSearchParams({ action: 'trending', regionCode: 'ID', maxResults: '8', videoCategoryId: '10' });
            res = await fetch(`/api/youtube?${params}`, { signal: ctrl.signal });
          }
          if (res.ok) {
            const data = await res.json();
            const chips = (data.items || []).slice(0, 8).map(v => {
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
          const chips = data.slice(0, 8).map(v => {
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
          const chips = data.slice(0, 8).map(v => {
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
    ]);
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
      if (audioRef.current) { audioRef.current.pause(); }
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
      setRadioPlaying(false);
    }
    // Stop audio jika incoming adalah radio/embed (bukan lokal)
    if (incomingMode !== 'local' && !track?.isRadio) {
      setPlaying(false);
    }
  };

  // ── Play web-search native audio (Jamendo/FMA/ccMixter)
  const playWsTrack = useCallback((item, queue, queueIdx) => {
    const srcColors = { jamendo:'#f0c020', fma:'#5cb85c', ccmixter:'#e74c3c' };
    const srcBgs    = { jamendo:'rgba(240,192,32,0.15)', fma:'rgba(92,184,92,0.15)', ccmixter:'rgba(231,76,60,0.15)' };
    const nativeTrack = {
      id: `ws_${item.source}_${item.id||item.audioUrl}`,
      title: item.title,
      artist: item.artist || item.source,
      album: item.source === 'jamendo' ? 'Jamendo' : item.source === 'fma' ? 'Free Music Archive' : 'ccMixter',
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
    if (repeatRef.current === 'one') { seekYt(0); return; }
    // Single video (queue kosong) — tetap support repeat all & shuffle
    if (!q.length) {
      if (repeatRef.current === 'all' || shuffleRef.current) {
        seekYt(0); // restart video yang sama
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
        // Repeat all: kembali ke lagu pertama
        ytQueueIdxRef.current = 0;
        playYouTube(q[0], q, 0);
        return;
      }
      // Sudah lagu terakhir, tidak ada repeat → berhenti
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
  }, [isLite]); // eslint-disable-line — hanya trigger saat mode berubah


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
  const [showQueue, setShowQueue] = useState(false);

  // ── AI
  const [insight, setInsight]   = useState('');
  const [insightLoading, setIL] = useState(false);
  const [messages, setMessages] = useState(() => {
    const greetings = [
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
  const [plView, setPlView]               = useState('list'); // 'list' | 'detail'

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
  const audioRef      = useRef(null);
  const chatEndRef    = useRef(null);
  const ytMusicSectionRef = useRef(null);
  const tokenRef      = useRef(null);
  const shuffleRef    = useRef(shuffle);
  const repeatRef     = useRef(repeat);
  const goNextRef     = useRef(null); // avoids stale closure in onEnd
  const ytNextRef     = useRef(null); // avoids stale closure in YT onStateChange
  const wsNextRef     = useRef(null); // avoids stale closure in ws queue auto-advance

  // ── Keep refs in sync
  useEffect(() => { shuffleRef.current  = shuffle;   }, [shuffle]);
  useEffect(() => { repeatRef.current   = repeat;    }, [repeat]);
  useEffect(() => { tokenRef.current    = accessToken; }, [accessToken]);
  useEffect(() => { spPlayingRef.current = spPlaying; }, [spPlaying]);

  // ── Jam live — update setiap detik
  useEffect(() => {
    const tick = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(tick);
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
          'Pastikan file .mp3 .m4a .wav .flac .ogg sudah ada, lalu ketuk ikon ↻ untuk refresh.',
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
          setDriveError('Sesi Google berakhir. Ketuk Login untuk lanjut.');
        }
      } else {
        // Network / other error — tampilkan pesan singkat
        setDriveError('Gagal memuat Drive: ' + e.message);
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
          setDriveError('Sesi Google berakhir. Ketuk tombol Login untuk melanjutkan.');
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-fetch Drive songs when tab becomes visible again (catches expired tokens)
  useEffect(() => {
    const onVisible = () => {
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
          .catch(() => setDriveError('Sesi Google berakhir. Ketuk Login untuk lanjut.'));
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
        // Fullscreen: maximize ring for both orientations
        if (isLandscape) {
          // Landscape fullscreen: ring limited by height, leave room for controls on the right
          const size = Math.min(vw * 0.42, vh - 80);
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
        // Mobile Landscape — slim side icon nav (54px) + horizontal player layout
        const sideNavW = 54;
        const mainW = vw - sideNavW;
        const mainH = vh - 44; // minus header
        // Ring column takes ~42% of mainW; remaining is info+controls
        const ringColW = Math.round(mainW * 0.42);
        // Ring limited by both column width and available height (no extra padding)
        const byH = mainH - 8; // minimal vertical padding
        const ring = Math.max(100, Math.min(170, Math.min(byH, ringColW - 8)));
        setRingSize(ring);
        // Minimal margins — landscape must fit without scrolling
        setLayoutVars({
          playerPad: '2px 8px 2px',
          trackTitleSize: `clamp(12px,${Math.round((mainW - ringColW) * 0.07)}px,16px)`,
          artistSize: '10px',
          controlsGap: '10px',
          actionPad: '3px 0',
          volumeMt: '2px',
          controlsMt: '3px',
          infoMt: '2px',
        });
      } else {
        // Portrait: full-width stacked
        // Measured fixed slots: header~50, clock~26, badge~20, info~44,
        //   controls~52, volume~30, actions~38, bottomNav~72, gaps~20
        const fixed = 50 + 26 + 20 + 44 + 52 + 30 + 38 + 72 + 20;
        const byH = vh - fixed;
        const byW = vw - 40;
        const ring = Math.max(150, Math.min(270, Math.min(byH, byW)));
        setRingSize(ring);
        // Distribute remaining space tightly — divide by 14 to avoid excess gaps
        const spare = Math.max(0, vh - fixed - ring);
        const u = Math.round(spare / 14);
        const clampPx = (min, max) => `${Math.max(min, Math.min(max, u))}px`;
        const vpadTop = Math.max(2, Math.min(8, u));
        const vpadBot = Math.max(1, Math.min(4, Math.floor(u * 0.5)));
        setLayoutVars({
          playerPad: `${vpadTop}px 16px ${vpadBot}px`,
          trackTitleSize: vw >= 390 ? '16px' : '14px',
          artistSize: '11px',
          controlsGap: vw >= 390 ? '14px' : '10px',
          actionPad: `${clampPx(4, 8)} 0`,
          volumeMt: clampPx(3, 8),
          controlsMt: clampPx(4, 10),
          infoMt: clampPx(3, 8),
        });
      }
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []); // eslint-disable-line — fullscreen handled via ref below

  // ── Audio init
  useEffect(() => {
    const prev = audioRef.current;
    // Jika elemen audio yang sama sudah punya src ini, langsung return
    if (prev && prev.src && (prev.src === track.src || prev.src.endsWith(encodeURI(track.src)) || prev.src.endsWith(track.src))) {
      return;
    }
    const wasPlaying = playingRef.current || (prev && !prev.paused);
    if (prev) { prev.pause(); prev.src = ''; }
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
    a.src = track.src; // set src SETELAH crossOrigin agar berlaku sejak request pertama
    audioRef.current = a;
    if (wasPlaying) {
      a.play().catch(e => { console.warn('autoplay blocked:', e); setPlaying(false); });
    }
    return () => { a.pause(); a.src = ''; };
  }, [track.src]); // eslint-disable-line react-hooks/exhaustive-deps
  // ── Audio events
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onTime  = () => setProgress(a.currentTime);
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
    const onError = () => { setPlaying(false); setLoadingTrack(false); };
    const onStall = () => { console.warn('Audio stalled:', track.src); };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('durationchange', onDurChange);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onError);
    a.addEventListener('stalled', onStall);
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
      try { ytIframeRef.current.contentWindow.postMessage(JSON.stringify({ event:'command', func:cmd, args:'' }), '*'); } catch(_){}
      return;
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
        // Video ended → auto next
        if (data?.event === 'onStateChange' && data.info === 0) {
          if (repeatRef.current === 'one') {
            try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'seekTo', args:[0, true] }), '*'); } catch(_) {}
            setTimeout(() => {
              try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'playVideo', args:'' }), '*'); } catch(_) {}
            }, 200);
          } else { setTimeout(() => { if (ytNextRef.current) ytNextRef.current(); }, 600); }
        }
      } catch(_) {}
    };
    window.addEventListener('message', handler);
    // Poll current time every 800ms
    const poll = setInterval(() => {
      try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'listening' }), '*'); } catch(_) {}
    }, 800);
    return () => { window.removeEventListener('message', handler); clearInterval(poll); };
  }, [embedTrack, seekYt]);

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
      if (!isLite) drivePrefetch(next.driveId, tokenRef.current); // Lite: skip prefetch hemat bandwidth
    }
  }, [track.id, customSongs]);

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
      fetch(station.url, { method: 'GET', mode: 'no-cors', signal: ctrl.signal })
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
      setRbResults(data.filter(s => s.url_resolved || s.url));
    } catch(e) {
      setRbError('Gagal menghubungi Radio Browser. Coba lagi.');
    } finally {
      setRbLoading(false);
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
  const loadGardenPlaces = async () => {
    if (gardenPlaces.length > 0) return;
    try {
      // Use Vercel proxy (/api/radio-garden/ → radio.garden/api/ara/) to avoid CORS
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
    // Stream URL goes directly to radio.garden (audio streaming, not an API call)
    return `https://radio.garden/api/ara/content/listen/${channelId}/channel.mp3`;
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
    { id:'ice_difm_chill', name:'Digitally Imported Chillout', desc:'24/7 Chillout streaming', url:'https://di.fm/mp3/chillout', genre:'Chillout', country:'US', color:'#06b6d4' },
    { id:'ice_difm_trance', name:'Digitally Imported Trance', desc:'24/7 Trance streaming', url:'https://di.fm/mp3/trance', genre:'Trance', country:'US', color:'#8b5cf6' },
    { id:'ice_difm_house', name:'Digitally Imported House', desc:'24/7 House streaming', url:'https://di.fm/mp3/house', genre:'House', country:'US', color:'#f59e0b' },
    { id:'ice_difm_techno', name:'Digitally Imported Techno', desc:'24/7 Techno streaming', url:'https://di.fm/mp3/techno', genre:'Techno', country:'US', color:'#ef4444' },
    { id:'ice_difm_dnb', name:'Digitally Imported D&B', desc:'24/7 Drum & Bass', url:'https://di.fm/mp3/drumandbass', genre:'D&B', country:'US', color:'#7c3aed' },
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

  // ── Peta keyword genre → bucket
  const GENRE_KEYWORDS = {
    pop:        ['pop', 'top 40', 'chart', 'hits', 'electropop'],
    rock:       ['rock', 'alternative', 'indie', 'metal', 'punk', 'grunge'],
    jazz:       ['jazz', 'blues', 'soul', 'bossa', 'swing'],
    classical:  ['classical', 'orchestra', 'opera', 'baroque', 'chamber'],
    electronic: ['electronic', 'edm', 'techno', 'house', 'trance', 'dance', 'idm', 'ambient', 'chill', 'downtempo', 'lounge', 'drone'],
    hiphop:     ['hip-hop', 'hip hop', 'rap', 'r&b', 'rnb', 'trap'],
    reggae:     ['reggae', 'dub', 'ska', 'dancehall'],
    folk:       ['folk', 'country', 'americana', 'bluegrass', 'singer-songwriter'],
    news:       ['news', 'talk', 'info', 'noticias', 'nachrichten'],
    world:      ['world', 'latin', 'afrobeat', 'bossa nova', 'samba', 'flamenco', 'asian', 'bollywood'],
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

  const getExtraStationsForGenre = (genreName) => {
    const bucket = getGenreBucket(genreName);
    if (!bucket) return { soma: [], icecast: [], nts: [] };
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

    return { soma, icecast, nts };
  };

  // ── Universal play function for any external radio station
  const playRbStation = (station) => {
    const streamUrl = station.url_resolved || station.url;
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
    // Build genre keyword list from tag or query
    const tagLow = (genreTag||'').toLowerCase();
    const bucket = tagLow ? getGenreBucket(tagLow) : (q ? getGenreBucket(q) : null);
    const genreKeywords = bucket ? GENRE_KEYWORDS[bucket] : (tagLow ? [tagLow] : null);
    const matchesGenre = (label) => {
      if (!genreKeywords) return true; // no genre filter
      return matchGenreKeywords(label, genreKeywords);
    };
    const results = [];
    // SomaFM filter — by genre tag AND/OR text query
    const somaMatched = somaChannels.filter(ch => {
      const genreOk = matchesGenre(ch.genre) || matchesGenre(ch.title) || matchesGenre(ch.description);
      const textOk = !q || ch.title?.toLowerCase().includes(q) || ch.genre?.toLowerCase().includes(q) || ch.description?.toLowerCase().includes(q);
      return genreKeywords ? genreOk : textOk;
    }).slice(0, 8).map(ch => ({
      id: `soma_${ch.id}`, name: ch.title, url: ch.plls?.[0]?.url || `https://ice1.somafm.com/${ch.id}-128-mp3`,
      country: 'US', tags: ch.genre, favicon: ch.image, sourceLabel: 'SomaFM', color: '#10b981',
      description: ch.description,
    }));
    results.push(...somaMatched);
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
    setMultiResults(results);
    setMultiLoading(false);
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
        stopAllMedia('embed');
        setSpTrack(t);
        setSpPlaying(false);
        setTab('stream');
        setTimeout(() => playSpotifyPreview(t), 50);
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
    if (t.isDrive && !t.src) {
      setLoadingTrack(true);
      setDriveDownProg(0);

      // ── Cek cache — hanya di Pro mode. Lite langsung stream adaptif (tidak pakai blob full)
      if (!isLite) {
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
            const doSwitchCached = () => {
              if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = td.src; audioRef.current.load(); }
              setTrack(td); setProgress(0); setDuration(0); setPlaying(true);
              setTab('player');
            };
            if (track.id === td.id) {
              setPlaying(p => !p);
              return;
            }
            doSwitchCached();
            if (isFull) {
              // Cache penuh — selesai, tidak perlu download lagi
              return;
            }

            // Cache parsial — lanjutkan download di background sambil audio diputar dari cache
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
                true // forceDownload: skip cache check, langsung download ulang dari Drive
              ).catch(() => { setDrivePhase('idle'); setDriveDownProg(0); });
            }
            return;
          }
        } catch {}
      }

      // ── Tidak ada cache — perlu stream dari Drive (harus online + token)
      if (!navigator.onLine) {
        setDriveError(t?.noPlayback||'This song has not been downloaded. Connect to the internet and play it once to save offline.');
        setLoadingTrack(false); setDriveDownProg(0); setDrivePhase('idle'); return;
      }

      let tok = tokenRef.current;
      if (!tok) {
        setDriveError(t?.loginRequired||'Sign in with Google first');
        setLoadingTrack(false); setDriveDownProg(0); setDrivePhase('idle'); return;
      }

      const tryLoad = async (useTok) => {
        if (!isLite) {
          // ── FASE 1: CHECK — stream via MediaSource, audio langsung bisa diputar
          setDrivePhase('check');
          const streamUrl = await driveStreamBlob(t.driveId, useTok);

          // Set track & play dulu pakai stream URL
          const tdStream = { ...t, src: streamUrl };
          setCustomSongs(prev => prev.map(s => s.id === t.id ? { ...s, src: streamUrl } : s));
          setTrack(tdStream); setProgress(0); setDuration(0); setPlaying(true);
          setTab('player');
          setLoadingTrack(false);
          if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = streamUrl; audioRef.current.load(); }

          // ── FASE 2: DOWNLOAD — download full blob di background sambil audio diputar
          setDrivePhase('download');
          setDriveDownProg(0);
          driveDownloadBlob(
            t.driveId, useTok,
            (pct) => setDriveDownProg(pct),
            () => {
              // Download selesai — tandai cached, bersihkan UI, TANPA reload
              setCachedDriveIds(prev => new Set([...prev, t.driveId]));
              setDriveDownProg(100);
              setDrivePhase('idle');
              setTimeout(() => setDriveDownProg(0), 1200);
            }
          ).catch(() => {
            // Download gagal di background — tidak masalah, stream tetap berjalan
            setDrivePhase('idle');
            setDriveDownProg(0);
          });

          // Return stream URL — track sudah di-set di atas
          return streamUrl;
        } else {
          // ── LITE: cek cache Pro dulu (hemat data kalau sudah pernah diunduh di Pro)
          setDrivePhase('check');
          try {
            const cachedBlob = await cacheGet(t.driveId);
            if (cachedBlob) {
              const { isFull } = checkCachedBlob(t.driveId, cachedBlob);
              if (isFull) {
                // Cache penuh dari Pro — langsung pakai, tidak perlu stream
                const url = URL.createObjectURL(cachedBlob);
                _blobCache.set(t.driveId + ':cached', url);
                setCustomSongs(prev => prev.map(s => s.id === t.id ? { ...s, src: url } : s));
                setTrack({ ...t, src: url }); setProgress(0); setDuration(0); setPlaying(true);
                setTab('player'); setLoadingTrack(false);
                if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = url; audioRef.current.load(); }
                setDrivePhase('idle');
                return null; // cache hit — track sudah di-set, caller skip doSwitch
              }
              // Cache parsial — lanjut stream adaptif (tidak pakai blob parsial)
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
              setDriveError('Sesi Google berakhir. Ketuk tombol Login untuk lanjut.');
              setLoadingTrack(false); setDriveDownProg(0); setDrivePhase('idle'); return;
            }
          } else { throw e; }
        }
        if (!isLite) {
          // Track sudah di-set di dalam tryLoad untuk Pro mode — skip doSwitch di bawah
          return;
        }
        // Lite: jika cache penuh ditemukan, track sudah di-set di dalam tryLoad — cek url
        if (!url) return; // cache hit sudah handle segalanya
        setCustomSongs(prev => prev.map(s=>s.id===t.id?{...s,src:url}:s));
        td = { ...t, src: url };
        setDriveError('');
      } catch(e) {
        setDriveError('Gagal memutar: ' + e.message);
        setLoadingTrack(false); setDriveDownProg(0); setDrivePhase('idle'); return;
      }
      setLoadingTrack(false);
    }

    if (track.id === td.id) { setPlaying(p=>!p); return; }
    const doSwitch = () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src=td.src; audioRef.current.load(); }
      setTrack(td); setProgress(0); setDuration(0); setPlaying(true);
      setTab('player'); // otomatis pindah ke player saat lagu baru diputar
    };
    doSwitch();

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
    const platform = STREAMING_PLATFORMS.find(p => p.embedType === 'radio');
    if (!platform) return;
    const country = platform.countries.find(c => c.id === radioStation.countryId);
    if (!country) return;
    const genre = country.genres.find(g => g.id === radioStation.genreId);
    if (!genre) return;
    const stations = genre.stations;
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
      color: genre.color,
      bg: `rgba(245,158,11,0.15)`,
      mood: 'live, radio',
      isRadio: true,
    };
    play(radioTrackObj);
    setRadioStation({ ...nextStation, color: genre.color, countryId: radioStation.countryId, genreId: radioStation.genreId });
    setRadioPlaying(true);
  }, [radioStation, play]);

  const goPrevRadio = useCallback(() => {
    if (!radioStation) return;
    const platform = STREAMING_PLATFORMS.find(p => p.embedType === 'radio');
    if (!platform) return;
    const country = platform.countries.find(c => c.id === radioStation.countryId);
    if (!country) return;
    const genre = country.genres.find(g => g.id === radioStation.genreId);
    if (!genre) return;
    const stations = genre.stations;
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
      color: genre.color,
      bg: `rgba(245,158,11,0.15)`,
      mood: 'live, radio',
      isRadio: true,
    };
    play(radioTrackObj);
    setRadioStation({ ...prevStation, color: genre.color, countryId: radioStation.countryId, genreId: radioStation.genreId });
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
    setLyrics('');

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

    // ── Source 1: lrclib.net
    const fetchLrclib = async () => {
      const q = encodeURIComponent(`${cleanTitle} ${cleanArtist}`);
      const resp = await fetch(`https://lrclib.net/api/search?q=${q}`);
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
      const resp = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      return (data.lyrics && data.lyrics.trim().length > 20) ? data.lyrics.trim() : null;
    };

    // ── Source 3: AI API (Pro mode only)
    const fetchAI = async () => {
      if (isLite) return null;
      const moodCtx = activeMood ? `Mood/genre: ${activeMood}.` : '';
      const r = await askAI(
        `You are a lyrics database expert. Your task:\n\nTitle: "${activeTitle}"\nArtist: ${activeArtist}\n${moodCtx}\n\nRULES:\n1. ONLY output lyrics if you are CONFIDENT you know the REAL lyrics of this exact song.\n2. If you are not sure or do not know the real lyrics, reply with exactly: NOT_FOUND\n3. Do NOT invent, guess, or write fake/inspired lyrics. Only real lyrics.\n4. If you output lyrics, use the ORIGINAL language of the song. ALL text must be in Latin alphabet — romanize non-Latin scripts (Korean Hangul → romanized, Japanese → Romaji, Chinese → Pinyin, Arabic → transliteration, etc.)\n5. Format with section tags: [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro] as appropriate.\n6. Output ONLY the lyrics or NOT_FOUND. No explanation, no intro, no comments.`,
        'You are a music lyrics expert with a vast database of songs. You either output real verified lyrics (in Latin alphabet) or reply NOT_FOUND. Never invent lyrics.'
      );
      if (!r || r.trim().toUpperCase().startsWith('NOT_FOUND') || r.trim().length < 10) return null;
      return r.trim();
    };

    // ── Run all 3 sources in parallel (internet + AI simultaneously)
    try {
      const [lrclib, ovh, ai] = await Promise.all([
        fetchLrclib().catch(() => null),
        fetchOvh().catch(() => null),
        fetchAI().catch(() => null),
      ]);

      // Prefer internet sources (more accurate), fallback to AI
      const result = lrclib || ovh || ai;

      if (result) {
        setLyrics(result);
      } else if (isLite) {
        setLyrics(t?.liteLyricsDisabled||'⚡ Lyrics not found in public database.\n\nLite Mode active — AI lyrics generation is disabled to save data.\n\nEnable Pro Mode to generate lyrics with AI.');
      } else {
        setLyrics(t?.lyricsNotFoundResult || 'Lyrics not found');
      }
    } catch(_) {
      setLyrics(t?.lyricsNotFoundResult || 'Lyrics not found');
    }

    setLL(false);
  };

  // ── AI
  const getInsight = async () => {
    if (isLite) { setInsight(t?.liteInsightDisabled||'⚡ Lite Mode active — AI features disabled.'); return; }
    setIL(true);
    const activeTitle  = embedTrack ? (embedTrack.title  || track.title)  : track.title;
    const activeArtist = embedTrack ? (embedTrack.artist || track.artist) : track.artist;
    const r = await askAI(
      `Lagu: "${activeTitle}" oleh ${activeArtist}. Vibe/mood: ${track.mood || 'unknown'}.\n\nBuat 1 kalimat puitis singkat yang menangkap esensi lagu ini. Gunakan metafora tentang bintang, alam semesta, atau alam. Maksimal 20 kata. Bahasa Indonesia.`,
      'Kamu penyair. Balas HANYA kalimat puitis saja, tanpa tanda petik, tanpa penjelasan.'
    );
    setInsight(r);
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
    const r = await askAI(
      msg,
      `${t?.aiSystemPrompt||'You are Starry AI — a warm, fun, and versatile chat companion. Your personality: relaxed, friendly, a bit playful, but can be serious when needed. Use casual English. Answer briefly and naturally (max 100 words), not like a stiff chatbot. You can talk about anything: music, daily life, feelings, recommendations, trivia, jokes, motivation, or just hang out. Context: the user is listening to'} "${embedTrack ? (embedTrack.title || track.title) : track.title}" by ${embedTrack ? (embedTrack.artist || track.artist) : track.artist}${track.mood ? ' (mood: ' + track.mood + ')' : ''}.`
    );
    setMessages(p=>[...p,{from:'ai',text:r}]);
    setCL(false);
  };
  const searchVibe = async () => {
    if (!vibeInput.trim()||vibeLoading) return;
    if (isLite) { setVibeInput(t?.liteVibeDisabled||'⚡ Lite Mode active — Vibe Search disabled'); return; }
    setVL(true);

    // First try to match from Drive songs
    if (customSongs.length > 0) {
      const customList = customSongs.slice(0,15).map((s,i)=>`${i+1}. "${s.title}" - ${s.artist} (mood: ${s.mood||'unknown'})`).join('\n');
      const r = await askAI(
        `Pengguna ingin musik dengan vibe/suasana: "${vibeInput}"\n\nDaftar lagu tersedia:\n${customList}\n\nPilih nomor lagu yang PALING cocok dengan vibe tersebut. Balas HANYA satu angka saja.`,
        'Kamu kurator musik AI. Pilih lagu paling cocok. Balas hanya angka.'
      );
      const idx = parseInt(r.trim()) - 1;
      const found = customSongs[idx];
      if (found && idx >= 0 && idx < customSongs.length) {
        play(found);
        setVibeInput(`✨ Cocok untuk "${vibeInput}": ${found.title} - ${found.artist}`);
        setVL(false);
        return;
      }
    }

    // Recommend a song → auto-search YouTube
    const r = await askAI(
      `Pengguna ingin musik dengan vibe/suasana hati: "${vibeInput}"\n\nBerikan HANYA 1 rekomendasi lagu dalam format:\nJUDUL - ARTIS\n\nTidak ada teks lain, tidak ada penjelasan.`,
      'Kamu kurator musik AI. Balas HANYA dengan format: JUDUL - ARTIS. Satu baris saja.'
    );
    const line = r.trim().replace(/^["'✨*]+|["'*]+$/g, '');
    setVibeInput(`✨ ${line}`);
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
  }, []);

  const updatePlaylist = useCallback(({ name, songIds }) => {
    setPlaylists(p => p.map(pl => pl.id===editingPl.id ? { ...pl, name, songIds } : pl));
    setShowPlModal(false);
    setEditingPl(null);
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
    <div className={`${isLite ? 'lite-mode' : ''} layout-${layoutMode}`} style={{ position:'fixed', inset:0, overflow:'hidden', background:'#07071a', color:'#f1f5f9', fontFamily:"'Segoe UI',system-ui,sans-serif", display:'flex', flexDirection:'column', userSelect:'none', WebkitTapHighlightColor:'transparent' }}>

      {/* BG — Pro only */}
      {!isLite && <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, background:`radial-gradient(ellipse at 60% 10%,${track.color}20 0%,transparent 60%)` }}/>}
      {!isLite && <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}><div className="stars"/><div className="starsB"/><div className="starsC"/></div>}

      {/* ══ HEADER */}
      {!fullscreen && <header style={{ position: 'sticky', top: 0, zIndex:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding: layoutMode === 'mobile-landscape' ? '5px 14px' : '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(7,7,26,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <AppLogo size={layoutMode === 'mobile-landscape' ? 24 : 30}/>
          <div>
            <div style={{ fontWeight:900, fontSize: layoutMode === 'mobile-landscape' ? 11 : 13, lineHeight:1, letterSpacing:'-0.03em', background:'linear-gradient(90deg,#60a5fa,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Starry Night</div>
            <div style={{ fontSize: layoutMode === 'mobile-landscape' ? 8 : 9.5, fontWeight:700, color:'rgba(255,255,255,0.35)', marginTop:0.5, letterSpacing:'0.06em', textTransform:'uppercase' }}>MPlayer</div>
          </div>
          {/* Clock in header for mobile-landscape */}
          {layoutMode === 'mobile-landscape' && (
            <div style={{ marginLeft:8, userSelect:'none' }}>
              <div style={{ fontSize:13, fontWeight:900, fontFamily:'monospace', letterSpacing:'-0.04em', lineHeight:1, background:`linear-gradient(120deg,#ffffff 60%,${track.color})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {nowTime.toLocaleTimeString('id-ID',{ hour:'2-digit', minute:'2-digit', hour12:false })}
              </div>
              <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>
                {nowTime.toLocaleDateString('id-ID',{ weekday:'short', day:'numeric', month:'short' })}
              </div>
            </div>
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
        <div style={{ width:54, flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.25)', display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 0 12px', gap:2 }}>
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
              {[8,4,6].map((h,i)=>(<div key={i} style={{ width:2.5, height:h, background:track.color, borderRadius:1, animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite` }}/>))}
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
              {playing && <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:11, flexShrink:0 }}>{[9,5,7].map((h,i)=>(<div key={i} style={{ width:2.5, height:h, background:embedTrack?.type==='youtube'?'#ff4444':embedTrack?.type==='soundcloud'?'#ff5500':track.color, borderRadius:1, animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite` }}/>))}</div>}
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
          <SettingsPanel key="settings-panel" onClose={()=>setShowSettings(false)} color={track?.color||"#6366f1"} sleepTimer={sleepTimer||null} startSleepTimer={startSleepTimer} cancelSleepTimer={cancelSleepTimer} globalCover={globalCover||""} setGlobalCover={setGlobalCover} isLite={!!isLite} toggleMode={toggleMode} pwaPrompt={pwaPrompt||null} pwaInstalled={!!pwaInstalled} installPwa={installPwa} customDns={customDns||""} setCustomDns={setCustomDns} lang={lang} toggleLang={toggleLang} t={t} userSpId={userSpId} setUserSpId={setUserSpId} userSpSecret={userSpSecret} setUserSpSecret={setUserSpSecret} userScId={userScId} setUserScId={setUserScId} userAiKey={userAiKey} setUserAiKey={setUserAiKey} userYtKey={userYtKey} setUserYtKey={setUserYtKey}/>
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
                        ? (() => {
                            const rp = STREAMING_PLATFORMS.find(p => p.embedType === 'radio');
                            const rc = rp?.countries?.find(c => c.id === radioStation?.countryId);
                            const rg = rc?.genres?.find(g => g.id === radioStation?.genreId);
                            return `${rg?.stations?.length || 0} stasiun`;
                          })()
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
                  const radioPlatform = STREAMING_PLATFORMS.find(p => p.embedType === 'radio');
                  const radioCountryData = radioPlatform?.countries?.find(c => c.id === radioStation?.countryId);
                  const radioGenreData = radioCountryData?.genres?.find(g => g.id === radioStation?.genreId);
                  const radioStations = radioGenreData?.stations || [];
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
                        const stationColor = radioGenreData?.color || '#f59e0b';
                        return (
                          <div key={station.id} onClick={() => {
                            const radioTrackObj = {
                              id: `radio_${station.id}`,
                              title: station.name,
                              artist: station.city + ' · Live Radio',
                              album: 'Live Radio',
                              cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
                              src: station.url,
                              color: stationColor,
                              bg: `rgba(245,158,11,0.15)`,
                              mood: 'live, radio',
                              isRadio: true,
                            };
                            if (track.id === radioTrackObj.id) { setPlaying(p => !p); } else {
                              play(radioTrackObj);
                              setRadioStation({ ...station, color: stationColor, countryId: radioStation?.countryId, genreId: radioStation?.genreId });
                              setRadioPlaying(true);
                            }
                            setShowQueue(false);
                          }} style={{ display:'flex', alignItems:'center', gap:11, padding:'9px 18px', background:isCur?`${stationColor}12`:'transparent', cursor:'pointer' }}>
                            <div style={{ width:20, textAlign:'center', flexShrink:0 }}>
                              {isCur
                                ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12, justifyContent:'center' }}>{[9,5,7].map((h,j)=>(<div key={j} style={{ width:2.5, height:h, background:stationColor, borderRadius:1, animation:`bounce 0.8s ease-in-out ${j*0.15}s infinite` }}/>))}</div>
                                : <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:600 }}>{i+1}</span>
                              }
                            </div>
                            <div style={{ width:38, height:38, borderRadius:8, background:isCur?`${stationColor}25`:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>
                              📻
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:isCur?700:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:isCur?stationColor:'rgba(255,255,255,0.88)' }}>{station.name}</div>
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{station.city} · ● LIVE</div>
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
                        <div style={{ width:20, textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:600, flexShrink:0 }}>{isCur ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12, justifyContent:'center' }}>{[9,5,7].map((h2,j)=>(<div key={j} style={{ width:2.5, height:h2, background:sc3, borderRadius:1, animation:`bounce 0.8s ease-in-out ${j*0.15}s infinite` }}/>))}</div> : i+1}</div>
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
                          <div style={{ width:20, textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:600, flexShrink:0 }}>{isCur ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12, justifyContent:'center' }}>{[9,5,7].map((h,j)=>(<div key={j} style={{ width:2.5, height:h, background:'#ff4444', borderRadius:1, animation:`bounce 0.8s ease-in-out ${j*0.15}s infinite` }}/>))}</div> : i+1}</div>
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
                          <div style={{ width:20, textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:600, flexShrink:0 }}>{isCur ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12, justifyContent:'center' }}>{[9,5,7].map((h,j)=>(<div key={j} style={{ width:2.5, height:h, background:track.color, borderRadius:1, animation:`bounce 0.8s ease-in-out ${j*0.15}s infinite` }}/>))}</div> : curIdx+i+1}</div>
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
                    { icon:'📧', label:'Email', color:'#f59e0b', action: () => window.open(`mailto:?subject=${encodeURIComponent('Lagu/Stream: '+(embedTrack?.title||track.title))}&body=${encodeURIComponent(url)}`, '_blank', 'noopener') },
                    { icon:'📱', label:'Share via App', color:'#a78bfa', action: async () => {
                      if (navigator.share) { try { await navigator.share({ title: embedTrack?.title||track.title, url }); } catch {} }
                      else { try { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(()=>setShareCopied(false), 2500); } catch {} }
                    }},
                  ];
                  return (
                    <>
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
                      {/* URL display */}
                      <div style={{ margin:'8px 18px 4px', padding:'9px 13px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', fontSize:10, color:'rgba(255,255,255,0.28)', fontFamily:'monospace', wordBreak:'break-all', lineHeight:1.5 }}>
                        {url}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            </div>
          )}




          <div style={{
            minHeight: fullscreen ? '100%' : undefined,
            height: fullscreen ? '100%' : (layoutMode === 'mobile-landscape' ? '100%' : undefined),
            display: 'flex',
            flexDirection: (layoutMode === 'mobile-landscape' || (fullscreen && window.innerWidth > window.innerHeight)) ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: fullscreen
              ? (window.innerWidth > window.innerHeight ? 'center' : 'space-evenly')
              : layoutMode === 'mobile-landscape' ? 'flex-start' : 'flex-start',
            padding: fullscreen ? '6px 20px 8px' : layoutVars.playerPad,
            position: 'relative',
            boxSizing: 'border-box',
            overflow: 'hidden',
            gap: (layoutMode === 'mobile-landscape' || (fullscreen && window.innerWidth > window.innerHeight)) ? '12px' : 0,
          }}>

            {/* ── JAM — pojok kiri atas area player (desktop only) */}
            {(layoutMode === 'desktop-landscape' || layoutMode === 'desktop-portrait') && (
              <div style={{ position:'absolute', top:'clamp(10px,2.5vh,20px)', left:16, userSelect:'none', pointerEvents:'none' }}>
                <div style={{ fontSize:24, fontWeight:900, fontFamily:'monospace', letterSpacing:'-0.04em', lineHeight:1, background:`linear-gradient(120deg,#ffffff 60%,${track.color})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  {nowTime.toLocaleTimeString('id-ID',{ hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })}
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:600, marginTop:4, letterSpacing:'0.04em', textTransform:'uppercase' }}>
                  {nowTime.toLocaleDateString('id-ID',{ weekday:'long', day:'numeric', month:'long' })}
                </div>
              </div>
            )}


            {/* floating action button moved to root level */}

            {/* ── Mobile: jam kiri atas + ring tengah | Desktop: ring tengah saja */}
            {(layoutMode === 'mobile-portrait' || layoutMode === 'mobile-landscape') ? (
              <div style={{ position:'relative', width: layoutMode === 'mobile-landscape' ? ringSize + 'px' : '100%', height: layoutMode === 'mobile-landscape' ? '100%' : undefined, flexShrink:0, display:'flex', justifyContent:'center', alignItems:'center' }}>
                {/* Jam mobile — pojok kiri, tidak overlap ring — hide on landscape (clock is in header) */}
                {layoutMode === 'mobile-portrait' && (
                <div style={{ position:'absolute', left:0, top:6, userSelect:'none' }}>
                  <div style={{ fontSize:17, fontWeight:900, fontFamily:'monospace', letterSpacing:'-0.04em', lineHeight:1, background:`linear-gradient(120deg,#ffffff 60%,${track.color})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                    {nowTime.toLocaleTimeString('id-ID',{ hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })}
                  </div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:600, marginTop:3, letterSpacing:'0.04em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
                    {nowTime.toLocaleDateString('id-ID',{ weekday:'short', day:'numeric', month:'short' })}
                  </div>
                </div>
                )}
                <OrbitalRing size={ringSize} pct={embedTrack?.type==='youtube'?(ytDuration>0?ytProgress/ytDuration:0):track.isRadio?0:pct} color={embedTrack?.type==='youtube'?'#ff4444':track.color} progress={embedTrack?.type==='youtube'?ytProgress:progress} duration={embedTrack?.type==='youtube'?ytDuration:track.isRadio?0:duration} isPlaying={playing} cover={embedTrack?.type==='youtube'?(embedTrack.thumbnail||getCover(track)):getCover(track)} title={embedTrack?.type==='youtube'?embedTrack.title:track.title} onSeek={embedTrack?.type==='youtube'?seekYt:track.isRadio?null:seekByPct} isLite={isLite} isRadio={!embedTrack&&track.isRadio} downloadProg={driveDownProg} drivePhase={drivePhase} ytDownloading={embedTrack?.type==='youtube'&&ytDownloadingIds.has(embedTrack.videoId)} ytDlProg={embedTrack?.type==='youtube'?(ytDownloadProg[embedTrack.videoId]||0):0}/>
              </div>
            ) : (
              <OrbitalRing size={ringSize} pct={embedTrack?.type==='youtube'?(ytDuration>0?ytProgress/ytDuration:0):track.isRadio?0:pct} color={embedTrack?.type==='youtube'?'#ff4444':track.color} progress={embedTrack?.type==='youtube'?ytProgress:progress} duration={embedTrack?.type==='youtube'?ytDuration:track.isRadio?0:duration} isPlaying={playing} cover={embedTrack?.type==='youtube'?(embedTrack.thumbnail||getCover(track)):getCover(track)} title={embedTrack?.type==='youtube'?embedTrack.title:track.title} onSeek={embedTrack?.type==='youtube'?seekYt:track.isRadio?null:seekByPct} isLite={isLite} isRadio={!embedTrack&&track.isRadio} downloadProg={driveDownProg} drivePhase={drivePhase} ytDownloading={embedTrack?.type==='youtube'&&ytDownloadingIds.has(embedTrack.videoId)} ytDlProg={embedTrack?.type==='youtube'?(ytDownloadProg[embedTrack.videoId]||0):0}/>
            )}

            {/* Track info */}
            <div style={{
              textAlign: 'center',
              marginTop: fullscreen ? 0 : layoutMode === 'mobile-landscape' ? 0 : layoutVars.infoMt,
              width: '100%',
              maxWidth: fullscreen ? 440 : layoutMode === 'mobile-landscape' ? undefined : 340,
              padding: '0 8px',
              ...(layoutMode === 'mobile-landscape' ? {
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', flex: 1, minWidth: 0,
              } : {}),
              ...((fullscreen && typeof window !== 'undefined' && window.innerWidth > window.innerHeight) ? {
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', flex: 1, minWidth: 0,
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
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 6px #f59e0b', animation: playing ? 'pulse 1.2s infinite' : 'none' }}/>
                  <span style={{ fontSize:9, fontWeight:800, color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.1em' }}>● LIVE RADIO</span>
                </div>
              ) : track.isDrive ? (
                <div style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'2px 7px', borderRadius:999, marginBottom:3, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}><Cloud size={9} style={{ color:track.color }}/><span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Drive</span></div>
              ) : null}
              <h2 style={{ margin:0, fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, fontSize: fullscreen ? 'clamp(18px,4.8vw,28px)' : layoutVars.trackTitleSize, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{embedTrack?.type==='youtube'?embedTrack.title:embedTrack?.type==='soundcloud'?embedTrack.title:track.title}</h2>
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
            <div style={{ display:'flex', alignItems:'center', gap:layoutVars.controlsGap, marginTop: fullscreen ? 0 : layoutVars.controlsMt }}>
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
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop: fullscreen ? 0 : layoutVars.volumeMt, width:'100%', maxWidth: (fullscreen || layoutMode === 'mobile-landscape') ? '100%' : 340, padding:'4px 2px' }}>
              <button onClick={()=>setMuted(m=>!m)} style={{ ...btn, color:muted?'#ef4444':'rgba(255,255,255,0.38)', padding:4, flexShrink:0 }}>{muted?<VolumeX size={16}/>:<Volume2 size={16}/>}</button>
              <input type="range" min="0" max="1" step="0.01" value={muted?0:volume} onChange={e=>{setVolume(+e.target.value);setMuted(false)}} style={{ flex:1, accentColor:embedTrack?.type==='youtube'?'#ff4444':track.color, height:3, cursor:'pointer' }}/>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontWeight:700, minWidth:28, textAlign:'right', fontFamily:'monospace', flexShrink:0 }}>{muted?'0':Math.round(volume*100)}%</span>
            </div>

            {/* ── Action buttons row */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop: fullscreen ? 0 : layoutVars.volumeMt, width:'100%', maxWidth: (fullscreen || layoutMode === 'mobile-landscape') ? '100%' : 340 }}>
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
                <button onClick={()=>{ if(audioRef.current){audioRef.current.pause();audioRef.current.src='';} setPlaying(false); setRadioStation(null); setRadioPlaying(false); setTrack(SONGS[0]); setShowSettings(false); }} title={t?.closeRadioBtn||"Exit Radio"} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:'#fbbf24' }}>
                  <X size={16}/>
                </button>
              )}
            </div>

          </div>
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
                                            ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12 }}>{[8,5,7].map((h,i)=>(<div key={i} style={{ width:2.5, height:h, background:'#ff4444', borderRadius:1, animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite` }}/>))}</div>
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
                          const wsAudioItems = wsResults.filter(it => it.audioUrl && ['jamendo','fma','ccmixter'].includes(it.source));
                          const srcColors2 = { jamendo:'#f0c020', fma:'#5cb85c', ccmixter:'#e74c3c' };
                          return (
                            <div style={{ padding:'0 10px 12px' }}>
                              {/* Tips */}
                              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:8, lineHeight:1.5 }}>
                                💡 <b style={{color:'rgba(255,255,255,0.5)'}}>Jamendo · FMA · ccMixter</b> putar in-app penuh (antrean). Tempel URL: <b style={{color:'rgba(255,255,255,0.5)'}}>Vimeo · Audiomack · Mixcloud · Odysee · Dailymotion · Bandcamp</b>
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
                                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>Mencari…</span>
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
                                          <PlatformLogo id="soundcloud" size={11}/>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#ff5500' }}>SoundCloud</span>
                                        </div>
                                        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                          {item._items.map((t2, ti) => {
                                            const durSec = t2.duration||0;
                                            const mins = Math.floor(durSec/60), secs2 = String(durSec%60).padStart(2,'0');
                                            const dur2 = durSec > 0 ? `${mins}:${secs2}` : '';
                                            const scUrl = t2.permalinkUrl||t2.streamUrl||'';
                                            const isActiveEmbed = scWidget['soundcloud'] === scUrl && scUrl.includes('soundcloud.com/');
                                            return (
                                              <div key={t2.id||ti} style={{ display:'flex', flexDirection:'column' }}>
                                                <div
                                                  style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius: isActiveEmbed ? '10px 10px 0 0' : 10, background: isActiveEmbed ? 'rgba(255,85,0,0.13)' : 'rgba(255,255,255,0.04)', border: isActiveEmbed ? '1px solid rgba(255,85,0,0.4)' : '1px solid rgba(255,255,255,0.08)', borderBottom: isActiveEmbed ? 'none' : undefined, cursor:'pointer' }}
                                                  onMouseEnter={e=>{ if(!isActiveEmbed) e.currentTarget.style.background='rgba(255,85,0,0.08)'; }}
                                                  onMouseLeave={e=>{ if(!isActiveEmbed) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                                                  onClick={() => {
                                                    if (scUrl.includes('soundcloud.com/')) {
                                                      setScWidget(p => ({ ...p, soundcloud: p.soundcloud === scUrl ? null : scUrl }));
                                                    } else {
                                                      window.open(`https://soundcloud.com/search?q=${encodeURIComponent(t2.title||'')}`, '_blank', 'noopener,noreferrer');
                                                    }
                                                  }}>
                                                  {/* Thumbnail */}
                                                  <div style={{ width:38, height:38, borderRadius:8, background:'rgba(255,85,0,0.2)', flexShrink:0, overflow:'hidden', position:'relative' }}>
                                                    {t2.thumbnail && !isLite && <img src={t2.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }}/>}
                                                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background: isActiveEmbed ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.3)', borderRadius:8 }}>
                                                      {isActiveEmbed ? <span style={{ fontSize:11, color:'#ff5500' }}>▼</span> : <Play size={13} style={{ color:'#ff5500', marginLeft:2 }}/>}
                                                    </div>
                                                  </div>
                                                  {/* Info */}
                                                  <div style={{ flex:1, minWidth:0 }}>
                                                    <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: isActiveEmbed ? '#ff7733' : 'rgba(255,255,255,0.9)' }}>{t2.title}</div>
                                                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{t2.artist}{dur2 ? ` · ${dur2}` : ''}</div>
                                                  </div>
                                                  {/* Open button */}
                                                  <button onClick={e => { e.stopPropagation(); window.open(scUrl||`https://soundcloud.com/search?q=${encodeURIComponent(t2.title||'')}`, '_blank', 'noopener,noreferrer'); }}
                                                    title="Buka di SoundCloud"
                                                    style={{ background:'none', border:'1px solid rgba(255,85,0,0.4)', borderRadius:6, color:'#ff5500', fontSize:10, fontWeight:700, padding:'3px 7px', cursor:'pointer', flexShrink:0, lineHeight:1.2 }}>↗</button>
                                                </div>
                                                {/* Embed iframe saat diklik */}
                                                {isActiveEmbed && (
                                                  <div style={{ borderRadius:'0 0 10px 10px', overflow:'hidden', border:'1px solid rgba(255,85,0,0.4)', borderTop:'none' }}>
                                                    <iframe
                                                      key={`sc-ws-${scUrl}`}
                                                      src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(scUrl)}&color=%23ff5500&auto_play=false&buying=false&liking=false&download=false&sharing=false&show_artwork=true&show_comments=false&show_playcount=false&show_user=true&hide_related=true&visual=true`}
                                                      width="100%" height="130" frameBorder="0" allow="autoplay" style={{ display:'block' }}/>
                                                    <div style={{ display:'flex', justifyContent:'flex-end', padding:'4px 8px', background:'rgba(0,0,0,0.4)', gap:6 }}>
                                                      <button onClick={()=>setScWidget(p=>({...p,soundcloud:null}))} style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer' }}>✕ Tutup</button>
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
                                          <PlatformLogo id="spotify" size={11}/>
                                          <span style={{ fontSize:10, fontWeight:700, color:'#1DB954' }}>Spotify</span>
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
                                            const isPreviewActive = spTrack?.id === t3.id;
                                            const coverUrl = t3.cover || t3.thumbnail || null;
                                            return (
                                              <div key={t3.id||t3.title} style={{ display:'flex', flexDirection:'column' }}>
                                                <div
                                                  style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius: isEmbedActive ? '10px 10px 0 0' : 10, background: isEmbedActive ? 'rgba(29,185,84,0.13)' : isPreviewActive ? 'rgba(29,185,84,0.10)' : 'rgba(255,255,255,0.04)', border: isEmbedActive ? '1px solid rgba(29,185,84,0.5)' : isPreviewActive ? '1px solid rgba(29,185,84,0.4)' : '1px solid rgba(255,255,255,0.08)', borderBottom: isEmbedActive ? 'none' : undefined, cursor:'pointer' }}
                                                  onMouseEnter={e=>{ if(!isEmbedActive&&!isPreviewActive) e.currentTarget.style.background='rgba(29,185,84,0.08)'; }}
                                                  onMouseLeave={e=>{ if(!isEmbedActive&&!isPreviewActive) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                                                  onClick={() => { setSpWsEmbedId(prev => prev === t3.id ? null : t3.id); }}>
                                                  {/* Thumbnail 38x38 mirip YT */}
                                                  <div style={{ width:38, height:38, borderRadius:8, background:'rgba(29,185,84,0.2)', flexShrink:0, overflow:'hidden', position:'relative' }}>
                                                    {coverUrl && !isLite && <img src={coverUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }}/>}
                                                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background: isEmbedActive ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)', borderRadius:8 }}>
                                                      {isEmbedActive ? <span style={{ fontSize:11, color:'#1DB954' }}>▼</span> : <Play size={13} style={{ color:'#1DB954', marginLeft:2 }}/>}
                                                    </div>
                                                  </div>
                                                  {/* Info */}
                                                  <div style={{ flex:1, minWidth:0 }}>
                                                    <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: isEmbedActive ? '#1DB954' : isPreviewActive ? '#6ee7a0' : 'rgba(255,255,255,0.9)' }}>{t3.title}</div>
                                                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t3.artist}{dur3 ? ` · ${dur3}` : ''}</div>
                                                  </div>
                                                  {/* Preview 30s badge */}
                                                  {hasPreview && (
                                                    <span onClick={e=>{ e.stopPropagation(); playSpotifyPreview(t3); }} style={{ fontSize:9, color:'#1DB954', background:'rgba(29,185,84,0.18)', padding:'2px 5px', borderRadius:4, fontWeight:700, flexShrink:0, cursor:'pointer' }} title="Preview 30 detik">▶ 30s</span>
                                                  )}
                                                  {/* Open button mirip YT ↗ */}
                                                  {t3.spotifyUrl && <button onClick={e => { e.stopPropagation(); window.open(t3.spotifyUrl, '_blank', 'noopener,noreferrer'); }}
                                                    title="Buka di Spotify"
                                                    style={{ background:'none', border:'1px solid rgba(29,185,84,0.4)', borderRadius:6, color:'#1DB954', fontSize:10, fontWeight:700, padding:'3px 7px', cursor:'pointer', flexShrink:0, lineHeight:1.2 }}>↗</button>}
                                                </div>
                                                {/* Spotify embed iframe */}
                                                {isEmbedActive && (
                                                  <div style={{ borderRadius:'0 0 10px 10px', overflow:'hidden', border:'1px solid rgba(29,185,84,0.5)', borderTop:'none' }}>
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
                                                        <button onClick={()=>setSpWsEmbedId(null)} style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer' }}>✕ Tutup</button>
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
                                    if (item.audioUrl && ['jamendo','fma','ccmixter'].includes(item.source)) {
                                      const srcC = srcColors2[item.source] || '#6366f1';
                                      const dur2 = item.duration ? `${Math.floor(item.duration/60)}:${String(item.duration%60).padStart(2,'0')}` : '';
                                      const srcLabels = { jamendo:'Jamendo', fma:'FMA', ccmixter:'ccMixter' };
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
                                              ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:12 }}>{[8,5,7].map((h2,i2)=>(<div key={i2} style={{ width:2.5, height:h2, background:srcC, borderRadius:1, animation:`bounce 0.8s ease-in-out ${i2*0.15}s infinite` }}/>))}</div>
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
                                          <button onClick={e => { e.stopPropagation(); setCustomSongs(prev => { const nid = `ws_${item.source}_${item.id||item.audioUrl}`; const ex = prev.find(s=>s.id===nid); if(ex) return prev; const srcColors3={jamendo:'#f0c020',fma:'#5cb85c',ccmixter:'#e74c3c'}; return [{ id:nid, title:item.title, artist:item.artist||item.source, album:srcLabels[item.source], cover:item.thumbnail||'', src:item.audioUrl, color:srcColors3[item.source]||'#6366f1', bg:`rgba(99,102,241,0.15)`, mood:'', _wsSource:item.source }, ...prev]; }); }}
                                            title="Tambah ke antrean"
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
                                  Belum ada hasil — cari nama lagu/artis, atau tempel URL Vimeo, Audiomack, Mixcloud, Odysee, Rumble, PeerTube, Dailymotion, Bandcamp… ↑
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
                              src: station.url,
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
                                <button onClick={() => { setRbMode('search'); rbLoadTags(); loadSomaFM(); if (rbResults.length===0 && !rbLoading) rbSearch('', null); }}
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
                                      placeholder="Cari stasiun, genre, kota, negara…"
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
                                  </div>
                                  {/* Genre tags — 10 genre populer dari semua sumber (RadioBrowser + SomaFM + Icecast) */}
                                  {(() => {
                                    const genreCount = {};
                                    const bump = (raw, weight) => {
                                      if (!raw) return;
                                      String(raw).split(/[,;|/]/).forEach(g => {
                                        const k = g.trim().toLowerCase();
                                        if (k && k.length > 1 && k.length < 25)
                                          genreCount[k] = (genreCount[k] || 0) + weight;
                                      });
                                    };
                                    somaChannels.forEach(ch => bump(ch.genre, 3));
                                    ['drum & bass','chillout','trance','house','techno','ambient','lounge','jazz','rock','metal','pop','reggae','classical','hip-hop','electronic'].forEach(g => bump(g, 2));
                                    rbTopTags.forEach(t => bump(t, 1));
                                    const aliases = { 'hip hop':'hip-hop','hiphop':'hip-hop','r&b':'hip-hop','rnb':'hip-hop','edm':'electronic','dance':'electronic','downtempo':'electronic','idm':'electronic','chill':'chillout','drum and bass':'drum & bass','dnb':'drum & bass','d&b':'drum & bass','talk':'news','news talk':'news','blues':'jazz','soul':'jazz','latin':'world','afrobeat':'world','country':'folk','americana':'folk' };
                                    Object.entries(aliases).forEach(([alias, canon]) => {
                                      if (genreCount[alias]) { genreCount[canon] = (genreCount[canon]||0) + genreCount[alias]; delete genreCount[alias]; }
                                    });
                                    const exclude = new Set(['music','radio','stream','stereo','fm','am','station','internet','online','misc','other','various','general','mixed','all']);
                                    const top10 = Object.entries(genreCount)
                                      .filter(([k]) => !exclude.has(k))
                                      .sort((a,b) => b[1]-a[1])
                                      .slice(0,10)
                                      .map(([k]) => ({ label: k.replace(/\b\w/g,c=>c.toUpperCase()), tag: k }));
                                    const pills = [{ label:'🔥 Top', tag: null }, ...top10];
                                    return (
                                      <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                                        {pills.map((p, i) => {
                                          const isActive = p.tag === null ? rbSelectedTag === null : rbSelectedTag === p.tag;
                                          return (
                                            <button key={i} onClick={() => { setRbSelectedTag(p.tag); setRbQuery(''); rbSearch('', p.tag); multiSearch('', p.tag); }}
                                              style={{ padding:'3px 9px', borderRadius:999, border:`1px solid ${isActive ? '#f59e0b' : 'rgba(255,255,255,0.12)'}`, background:isActive ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)', color:isActive ? '#f59e0b' : 'rgba(255,255,255,0.45)', fontSize:10, cursor:'pointer', fontWeight:600 }}>
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
                                      Mencari dari semua sumber…
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
                                          {allResults.length} stasiun ditemukan
                                        </div>
                                        {allResults.map((station, idx) => {
                                          const stId = `rb_${station.stationuuid || station.id}`;
                                          const isActive = track.isRadio && track.id === stId;
                                          const srcColor = station.sourceLabel === 'SomaFM' ? '#10b981'
                                            : station.sourceLabel === 'NTS Radio' ? '#ff4500'
                                            : station.sourceLabel === 'Icecast' ? '#6366f1'
                                            : '#f59e0b';
                                          return (
                                            <div key={`${station.id}_${idx}`} onClick={() => playRbStation(station)}
                                              style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 9px', borderRadius:10, background: isActive ? `${srcColor}15` : 'rgba(255,255,255,0.04)', border:`1px solid ${isActive ? srcColor+'55' : 'rgba(255,255,255,0.07)'}`, cursor:'pointer' }}>
                                              <div style={{ width:32, height:32, borderRadius:7, overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>
                                                {(station.favicon||station.image) && (station.favicon||station.image).startsWith('http')
                                                  ? <img src={station.favicon||station.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none';}} />
                                                  : '📻'}
                                              </div>
                                              <div style={{ flex:1, minWidth:0 }}>
                                                <div style={{ fontSize:11, fontWeight:700, color: isActive ? srcColor : 'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{station.name || station.title}</div>
                                                <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', display:'flex', gap:5, overflow:'hidden' }}>
                                                  <span style={{ color:srcColor, fontWeight:700, flexShrink:0 }}>● {station.sourceLabel}</span>
                                                  {station.country && <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{station.country}{station.tags ? ' · '+String(station.tags).split(',')[0] : ''}</span>}
                                                </div>
                                              </div>
                                              <div style={{ width:26, height:26, borderRadius:'50%', background: isActive && playing ? srcColor : 'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white', flexShrink:0 }}>
                                                {isActive && playing ? '⏸' : '▶'}
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
                                      Ketik nama stasiun, genre, atau kota<br/>lalu tekan Enter untuk mencari
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
                                    setPlaying(false); setRadioStation(null); setRadioPlaying(false);
                                    setTrack(SONGS[0]);
                                  }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14, flexShrink:0, padding:0 }}>✕</button>
                                </div>
                              )}
                              {/* Breadcrumb nav */}
                              {(selCountry || selGenre) && (
                                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:8, flexWrap:'wrap' }}>
                                  <button onClick={() => { setRadioCountry(null); setRadioGenre(null); }}
                                    style={{ background:'none', border:'none', color:'rgba(255,255,255,0.45)', cursor:'pointer', fontSize:10, padding:'2px 4px', borderRadius:4 }}>
                                    📻 Radio
                                  </button>
                                  {selCountry && (<>
                                    <span style={{ color:'rgba(255,255,255,0.2)', fontSize:10 }}>›</span>
                                    <button onClick={() => setRadioGenre(null)}
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
                                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>{country.genres.length} genre · {country.genres.reduce((s,g)=>s+g.stations.length,0)} stasiun</div>
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
                                    <div key={genre.id} onClick={() => setRadioGenre(genre.id)}
                                      style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:11, background:`${genre.color}12`, border:`1px solid ${genre.color}30`, cursor:'pointer' }}>
                                      <div style={{ width:34, height:34, borderRadius:9, background:`${genre.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                                        {genre.icon}
                                      </div>
                                      <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:12, fontWeight:700, color:'white' }}>{genre.name}</div>
                                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>{genre.stations.length} {t?.stationsPopular||'popular stations'}</div>
                                      </div>
                                      <span style={{ color:'rgba(255,255,255,0.2)', fontSize:14 }}>›</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* LEVEL 3: Station list — hanya yang bisa diputar */}
                              {selCountry && selGenre && (() => {
                                // Trigger test saat genre pertama kali dibuka
                                if (!testedGenresRef.current.has(selGenre.id)) {
                                  testStationsInGenre(selGenre);
                                }
                                const allTesting = selGenre.stations.every(s => stationStatus[s.id] === 'testing');
                                const okStations = selGenre.stations.filter(s => stationStatus[s.id] === 'ok' || stationStatus[s.id] === 'testing');
                                const testingCount = selGenre.stations.filter(s => stationStatus[s.id] === 'testing').length;
                                const failCount = selGenre.stations.filter(s => stationStatus[s.id] === 'fail').length;
                                const doneCount = selGenre.stations.filter(s => stationStatus[s.id] === 'ok' || stationStatus[s.id] === 'fail').length;
                                const totalCount = selGenre.stations.length;
                                return (
                                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                    {/* Progress bar saat testing */}
                                    {testingCount > 0 && (
                                      <div style={{ padding:'7px 10px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', display:'flex', alignItems:'center', gap:8 }}>
                                        <div style={{ flex:1 }}>
                                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                            <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>Memeriksa koneksi stasiun…</span>
                                            <span style={{ fontSize:10, color:selGenre.color, fontWeight:700 }}>{doneCount}/{totalCount}</span>
                                          </div>
                                          <div style={{ height:3, borderRadius:999, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                                            <div style={{ height:'100%', borderRadius:999, background:selGenre.color, width:`${(doneCount/totalCount)*100}%`, transition:'width 0.4s' }}/>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {/* Stasiun yang aktif / belum ditest */}
                                    {okStations.map((station, idx) => {
                                      const status = stationStatus[station.id];
                                      const isTesting = status === 'testing';
                                      const isActive = radioStation?.id === station.id;
                                      const okIdx = selGenre.stations.filter(s => stationStatus[s.id] === 'ok').indexOf(station) + 1;
                                      return (
                                        <div key={station.id}
                                          onClick={() => !isTesting && playStation(station, selGenre.color)}
                                          style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background: isActive ? `${selGenre.color}20` : 'rgba(255,255,255,0.04)', border:`1px solid ${isActive ? selGenre.color+'55' : 'rgba(255,255,255,0.07)'}`, cursor: isTesting ? 'default' : 'pointer', opacity: isTesting ? 0.6 : 1, transition:'all 0.15s' }}>
                                          <div style={{ width:26, height:26, borderRadius:6, background:`${selGenre.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color: isActive ? selGenre.color : 'rgba(255,255,255,0.3)', flexShrink:0 }}>
                                            {isTesting
                                              ? <div style={{ width:10, height:10, borderRadius:'50%', border:`2px solid ${selGenre.color}`, borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}/>
                                              : isActive && (playing && track.isRadio) ? '🔊' : `#${okIdx}`
                                            }
                                          </div>
                                          <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ fontSize:12, fontWeight:700, color: isActive ? selGenre.color : 'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{station.name}</div>
                                            <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:4 }}>
                                              <span>{station.city}</span>
                                              {isTesting && <span style={{ color:'rgba(255,255,255,0.25)' }}>· mengecek…</span>}
                                              {!isTesting && <span style={{ color:'#4ade80', fontWeight:700 }}>● tersedia</span>}
                                            </div>
                                          </div>

                                          <div style={{ width:26, height:26, borderRadius:'50%', background: isActive && (playing && track.isRadio) ? selGenre.color : 'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white', flexShrink:0 }}>
                                            {isTesting ? '…' : isActive && (playing && track.isRadio) ? '⏸' : '▶'}
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {/* Tidak ada stasiun aktif setelah testing selesai */}
                                    {testingCount === 0 && okStations.length === 0 && (
                                      <div style={{ textAlign:'center', padding:'20px 10px', borderRadius:10, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)' }}>
                                        <div style={{ fontSize:20, marginBottom:6 }}>📡</div>
                                        <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.45)' }}>Tidak ada stasiun tersedia</div>
                                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:4 }}>Semua {totalCount} stasiun tidak dapat dijangkau saat ini</div>
                                        <button onClick={() => { testedGenresRef.current.delete(selGenre.id); setStationStatus(prev => { const next={...prev}; selGenre.stations.forEach(s=>{delete next[s.id];}); return next; }); testStationsInGenre(selGenre); }}
                                          style={{ marginTop:10, padding:'5px 14px', borderRadius:999, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.12)', color:'#fca5a5', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                                          ↺ Cek Ulang
                                        </button>
                                      </div>
                                    )}
                                    {/* Info footer */}
                                    {testingCount === 0 && okStations.length > 0 && failCount > 0 && (
                                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.18)', paddingLeft:2, marginTop:2 }}>
                                        {okStations.length} stasiun aktif · {failCount} tidak tersedia disembunyikan
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              {/* ── Extra: SomaFM + Icecast + NTS berdasarkan genre */}
                              {selGenre && (() => {
                                const { soma, icecast, nts } = getExtraStationsForGenre(selGenre.name);
                                const allExtra = [
                                  ...soma.map(s => ({ ...s, _src: 'SomaFM', _color: '#10b981' })),
                                  ...icecast.map(s => ({ ...s, _src: 'Icecast', _color: '#6366f1' })),
                                  ...nts.map(s => ({ ...s, _src: 'NTS', _color: '#ff4500' })),
                                ];
                                if (allExtra.length === 0) return null;
                                return (
                                  <div style={{ marginTop:10 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7, paddingLeft:2 }}>
                                      <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.07)' }}/>
                                      <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>
                                        Sumber Lain · {selGenre.name}
                                      </span>
                                      <div style={{ height:1, flex:1, background:'rgba(255,255,255,0.07)' }}/>
                                    </div>
                                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                                      {allExtra.map(station => {
                                        const isActive = radioStation?.id === station.id || (track.isRadio && track.id === `rb_${station.stationuuid}`);
                                        const srcColorMap = { SomaFM:'#10b981', Icecast:'#6366f1', NTS:'#ff4500' };
                                        const srcColor = srcColorMap[station._src] || '#f59e0b';
                                        return (
                                          <div key={station.id}
                                            onClick={() => playRbStation({ ...station, color: srcColor })}
                                            style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 10px', borderRadius:10, background: isActive ? `${srcColor}18` : 'rgba(255,255,255,0.03)', border:`1px solid ${isActive ? srcColor+'45' : 'rgba(255,255,255,0.06)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                                            {/* Cover / icon */}
                                            <div style={{ width:32, height:32, borderRadius:7, overflow:'hidden', background:`${srcColor}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11 }}>
                                              {station.image
                                                ? <img src={station.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none';}}/>
                                                : station._src === 'SomaFM' ? '🎵' : station._src === 'NTS' ? '📻' : '📡'
                                              }
                                            </div>
                                            <div style={{ flex:1, minWidth:0 }}>
                                              <div style={{ fontSize:11, fontWeight:700, color: isActive ? srcColor : 'rgba(255,255,255,0.85)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{station.name}</div>
                                              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{station.city || station.desc || ''}</div>
                                            </div>
                                            <span style={{ fontSize:8, fontWeight:800, color:srcColor, background:`${srcColor}18`, padding:'2px 6px', borderRadius:999, flexShrink:0, letterSpacing:'0.05em' }}>{station._src}</span>
                                            <div style={{ width:24, height:24, borderRadius:'50%', background: isActive && (playing && track.isRadio) ? srcColor : 'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'white', flexShrink:0 }}>
                                              {isActive && (playing && track.isRadio) ? '⏸' : '▶'}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })()}

                              <div style={{ marginTop:8, fontSize:9, color:'rgba(255,255,255,0.18)', paddingLeft:2 }}>
                                {!selCountry ? 'Pilih negara untuk melihat genre & stasiun' : !selGenre ? 'Pilih genre untuk melihat stasiun' : 'Hanya stasiun yang dapat dijangkau yang ditampilkan'}
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
          <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>

            {/* ── Playlist list view */}
            {plView==='list'&&(
              <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:'14px 16px 0' }}>
                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <div>
                    <div style={{ fontWeight:900, fontSize:16 }}>{t?.musicCollection||'Music Collection'}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{playlists.length} playlist · {allSongs.length} {t?.songsCount||'songs'}</div>
                  </div>
                  <button onClick={()=>{ setEditingPl(null); setShowPlModal(true); }}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 12px rgba(99,102,241,0.4)' }}>
                    <ListPlus size={14}/>{t?.createPlaylistBtn||'Create Playlist'}
                  </button>
                </div>

                {/* Google Drive login/upload row */}
                {!googleUser ? (
                  <button onClick={handleGoogleLogin} style={{ marginBottom:12, width:'100%', padding:'9px 0', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px dashed rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                    <LogIn size={13}/>{t?.loginForSongs||'Sign in with Google'}
                  </button>
                ) : null}

                <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, paddingBottom:16 }}>

                  {/* ── Koleksi label */}
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:2 }}>{t?.musicCollection||'Collection'}</div>

                  {/* All songs shortcut */}
                  <div onClick={()=>{ setActivePl('all_songs'); setPlView('detail'); }}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:14, cursor:'pointer', background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.18)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.14)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(99,102,241,0.07)'}>
                    <div style={{ width:42, height:42, borderRadius:10, background:'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(168,85,247,0.35))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <ListMusic size={20} style={{color:'#a78bfa'}}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:'white' }}>{t?.allSongs||'All Songs'}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{allSongs.length} {t?.songsAvailable||'songs available'}</div>
                    </div>
                    <ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}}/>
                  </div>

                  {/* ── Lagu Saya (Drive) */}
                  {(googleUser||customSongs.length>0)&&(
                    <div onClick={()=>{ setActivePl('my_songs'); setPlView('detail'); }}
                      style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:14, cursor:'pointer', background:'rgba(14,165,233,0.06)', border:'1px solid rgba(14,165,233,0.18)' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(14,165,233,0.12)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(14,165,233,0.06)'}>
                      <div style={{ width:42, height:42, borderRadius:10, background:'linear-gradient(135deg,rgba(14,165,233,0.35),rgba(99,102,241,0.35))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Cloud size={20} style={{color:'#38bdf8'}}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:'white' }}>{t?.mySongs||'My Songs'}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>
                          {loadingDrive ? t?.loadingDriveShort||'Loading from Drive…' : `${customSongs.length} ${t?.songsFromDrive||'songs from Google Drive'}`}
                        </div>
                      </div>
                      {loadingDrive
                        ? <Loader2 size={15} style={{ color:'rgba(255,255,255,0.3)', animation:'spin 1s linear infinite', flexShrink:0 }}/>
                        : <ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)', flexShrink:0}}/>
                      }
                    </div>
                  )}



                  {/* ── Baru Dimainkan */}
                  {history.length>1&&(
                    <>
                      <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.15em', marginTop:8, marginBottom:2, display:'flex', alignItems:'center', gap:6 }}>
                        <History size={10}/>{t?.recentlyPlayed||'Recently Played'}
                      </div>
                      <div onClick={()=>{ setActivePl('recently_played'); setPlView('detail'); }}
                        style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:14, cursor:'pointer', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.18)' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(245,158,11,0.12)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(245,158,11,0.06)'}>
                        <div style={{ width:42, height:42, borderRadius:10, background:'linear-gradient(135deg,rgba(245,158,11,0.35),rgba(239,68,68,0.25))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <History size={20} style={{color:'#fbbf24'}}/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:14, color:'white' }}>{t?.recentlyPlayed||'Recently Played'}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{Math.max(0,history.length-1)} {t?.lastSongs||'recent songs'}</div>
                        </div>
                        <ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}}/>
                      </div>
                    </>
                  )}

                  {/* Playlist label */}
                  <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.15em', marginTop:8 }}>{t?.myPlaylists||'Your Playlists'}</div>

                  {/* Playlist cards */}
                  {playlists.map(pl => {
                    const songs = allSongs.filter(s=>pl.songIds.includes(s.id));
                    const isActive = activePl===pl.id;
                    const covers = songs.slice(0,4).map(s=>s.cover);
                    return (
                      <div key={pl.id} style={{ borderRadius:16, background:isActive?'rgba(99,102,241,0.12)':'rgba(255,255,255,0.03)', border:`1px solid ${isActive?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.08)'}`, overflow:'hidden' }}>
                        <div onClick={()=>{ setActivePl(pl.id); setPlView('detail'); }} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', cursor:'pointer' }}>
                          {/* Cover mosaic */}
                          <div style={{ width:48, height:48, borderRadius:10, overflow:'hidden', flexShrink:0, display:'grid', gridTemplateColumns:'1fr 1fr', gap:1.5, background:'rgba(255,255,255,0.06)' }}>
                            {covers.length>0 ? covers.map((c,i)=>(
                              <img key={i} src={c} style={{ width:'100%', height:'100%', objectFit:'cover', display: covers.length===1&&i>0?'none':covers.length===2&&i>1?'none':covers.length===3&&i===3?'none':'block' }}/>
                            )) : <Music size={20} style={{color:'rgba(255,255,255,0.2)',margin:'auto',gridColumn:'span 2'}}/>}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:700, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'white' }}>{pl.name}</div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{songs.length} {t?.songsCount||'songs'}</div>
                          </div>
                          <ChevronRight size={16} style={{color:'rgba(255,255,255,0.3)'}}/>
                        </div>
                        {/* Actions */}
                        <div style={{ display:'flex', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                          {songs.length>0&&(
                            <button onClick={()=>{ setActivePl(pl.id); activePlRef.current=songs; play(songs[0]); setTab('player'); }}
                              style={{ flex:1, padding:'8px 0', background:'none', border:'none', color:isActive?'#a78bfa':'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                              <Play size={12} fill="currentColor"/>{t?.playBtn||'Play'}
                            </button>
                          )}
                          <button onClick={()=>{ setEditingPl(pl); setShowPlModal(true); }}
                            style={{ flex:1, padding:'8px 0', background:'none', border:'none', borderLeft:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                            <PenLine size={12}/>{t?.editBtn||'Edit'}
                          </button>
                          {!pl.locked&&(
                            <button onClick={()=>deletePlaylist(pl.id)}
                              style={{ flex:1, padding:'8px 0', background:'none', border:'none', borderLeft:'1px solid rgba(255,255,255,0.06)', color:'rgba(239,68,68,0.6)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                              <Trash2 size={12}/>{t?.deleteBtn||'Delete'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {playlists.length===0&&(
                    <div style={{ textAlign:'center', padding:'40px 20px' }}>
                      <FolderOpen size={44} style={{color:'rgba(255,255,255,0.1)',display:'block',margin:'0 auto 12px'}}/>
                      <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.3)' }}>{t?.noPlaylistYet||'No playlists yet'}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)', marginTop:4 }}>{t?.createFirstPlaylist||'Tap "New" to create your first playlist'}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Playlist detail view */}
            {plView==='detail'&&activePl&&(
              <PlaylistErrorBoundary onBack={()=>{ setActivePl(null); setPlView('list'); }}>
                {(()=>{
              // ── Special: Lagu Saya (Drive)
              if (activePl === 'my_songs') {
                const songs = filteredCustom;
                return (
                  <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(7,7,26,0.97)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>
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
                              <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>Tidak ada file audio ditemukan</div>
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
                      {songs.map((s,i)=><SongRow key={s.id} s={s} i={i} track={track} playing={playing} liked={liked} setLiked={setLiked} toggleFav={toggleFav} play={play} isDrive isCached={cachedDriveIds.has(s.driveId)} onRemove={id=>setCustomSongs(p=>p.filter(x=>x.id!==id))} playlists={playlists} addToPlaylist={addToPlaylist} isLite={isLite} t={t}
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
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(7,7,26,0.97)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>
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
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(7,7,26,0.97)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>
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
                  <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0, position:'sticky', top:0, zIndex:5, background:'rgba(7,7,26,0.97)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <button onClick={()=>setPlView('list')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4, display:'flex' }}>
                        <ChevronLeft size={20}/>
                      </button>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:800, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pl.name}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{songs.length} {t?.songsCount||'songs'}</div>
                      </div>
                      {songs.length>0&&(
                        <button onClick={()=>{ activePlRef.current=songs; play(songs[0]); setTab('player'); }}
                          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, border:'none', background:track.color, color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
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
                        <button onClick={()=>{ setEditingPl(pl); setShowPlModal(true); }} style={{ marginTop:12, padding:'8px 16px', borderRadius:10, border:'none', background:'rgba(99,102,241,0.2)', color:'#a78bfa', fontSize:12, fontWeight:700, cursor:'pointer' }}>{t?.addSong||'Add Song'}</button>
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
                              {[12,6,10].map((h,j)=><div key={j} style={{ width:2.5, height:h, background:s.color, borderRadius:1, animation:`bounce 0.8s ease-in-out ${j*0.15}s infinite` }}/>)}
                            </div>
                          )}
                          {/* ── Unduh ke perangkat (custom playlist) */}
                          <button title="Unduh ke perangkat"
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
                          </button>
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
              </PlaylistErrorBoundary>
            )}
          </div>
        )}

        {/* ─── AI TAB */}
        {tab==='ai'&&(
          <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>

            {/* ── AI Header: title + status + now playing */}
            <div style={{ padding:'14px 16px 0', flexShrink:0, background:'transparent' }}>
              {/* Row 1: icon + title + status */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 16px #6366f160' }}><Bot size={18} style={{ color:'white' }}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:14 }}>Starry AI</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:hasKey()?'#22c55e':'#ef4444', animation:hasKey()?'pulse 2s infinite':'none', flexShrink:0 }}/>
                    <span style={{ fontSize:10, color:hasKey()?'#86efac':'#fca5a5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{hasKey() ? `${activeModel()}` : t?.aiOffline||'Offline — add API key'}</span>
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
            </div>

            {/* Chat + Vibe result area OR Lyrics OR For You */}
            {aiSubView==='foryou' ? (
              /* ── FOR YOU / PERSONALISASI VIEW */
              <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'16px 20px 24px' }}>
                {isLite ? (
                  /* ── LITE MODE GATE */
                  <div style={{ textAlign:'center', paddingTop:40 }}>
                    <div style={{ fontSize:40, marginBottom:14 }}>🎯</div>
                    <div style={{ fontSize:15, fontWeight:800, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>For You tidak tersedia</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.7, marginBottom:24, whiteSpace:'pre-line' }}>{'Mode Lite aktif — fitur For You\ndinonaktifkan untuk hemat data.\n\nAktifkan Mode Pro untuk\npersonalisasi rekomendasimu.'}</div>
                    <button onClick={toggleMode} style={{ padding:'9px 20px', borderRadius:999, border:'1px solid rgba(99,102,241,0.4)', background:'rgba(99,102,241,0.12)', color:'#a5b4fc', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                      ✨ Switch ke Pro Mode
                    </button>
                  </div>
                ) : personaStep==='onboard' ? (
                  /* ── ONBOARDING FORM */
                  <div>
                    <div style={{ textAlign:'center', marginBottom:20 }}>
                      <div style={{ fontSize:32, marginBottom:8 }}>🎧</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.6 }}>Beritahu Starry AI tentang preferensimu — kami pilihkan musik, radio, dan podcast yang tepat untukmu.</div>
                    </div>

                    {/* Kategori audio */}
                    <div style={{ marginBottom:18 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Apa yang sering kamu dengarkan?</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {[
                          { id:'music', icon:'🎵', label:'Musik' },
                          { id:'podcast', icon:'🎙️', label:'Podcast' },
                          { id:'radio', icon:'📻', label:'Radio Live' },
                          { id:'ambient', icon:'🌿', label:'Ambient/Nature' },
                          { id:'lofi', icon:'☕', label:'Lo-Fi / Chill' },
                          { id:'classical', icon:'🎻', label:'Klasik' },
                          { id:'edm', icon:'⚡', label:'EDM / Electronic' },
                          { id:'indopop', icon:'🇮🇩', label:'Indo Pop' },
                        ].map(c => {
                          const selected = personaPrefs.categories.includes(c.id);
                          return (
                            <button key={c.id} onClick={()=>setPersonaPrefs(p=>({ ...p, categories: selected ? p.categories.filter(x=>x!==c.id) : [...p.categories, c.id] }))}
                              style={{ padding:'8px 14px', borderRadius:999, border:`1px solid ${selected?track.color+'80':'rgba(255,255,255,0.15)'}`, background:selected?`${track.color}25`:'transparent', color:selected?'white':'rgba(255,255,255,0.6)', fontSize:12, fontWeight:selected?700:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}>
                              {c.icon} {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mood / Suasana */}
                    <div style={{ marginBottom:18 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Suasana yang sering kamu cari</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {[
                          { id:'relax', icon:'😌', label:'Santai' },
                          { id:'focus', icon:'🎯', label:'Fokus Kerja' },
                          { id:'energetic', icon:'🔥', label:'Semangat' },
                          { id:'sad', icon:'🌧️', label:'Sendu / Galau' },
                          { id:'sleep', icon:'😴', label:'Tidur / Meditasi' },
                          { id:'party', icon:'🎉', label:'Party / Happy' },
                        ].map(m => {
                          const selected = personaPrefs.moods.includes(m.id);
                          return (
                            <button key={m.id} onClick={()=>setPersonaPrefs(p=>({ ...p, moods: selected ? p.moods.filter(x=>x!==m.id) : [...p.moods, m.id] }))}
                              style={{ padding:'8px 14px', borderRadius:999, border:`1px solid ${selected?track.color+'80':'rgba(255,255,255,0.15)'}`, background:selected?`${track.color}25`:'transparent', color:selected?'white':'rgba(255,255,255,0.6)', fontSize:12, fontWeight:selected?700:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}>
                              {m.icon} {m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Waktu mendengarkan */}
                    <div style={{ marginBottom:18 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Kapan kamu paling sering mendengarkan?</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {[
                          { id:'morning', icon:'🌅', label:'Pagi' },
                          { id:'afternoon', icon:'☀️', label:'Siang' },
                          { id:'evening', icon:'🌆', label:'Sore' },
                          { id:'night', icon:'🌙', label:'Malam' },
                          { id:'anytime', icon:'🔁', label:'Kapan saja' },
                        ].map(tod => (
                          <button key={tod.id} onClick={()=>setPersonaPrefs(p=>({ ...p, timeOfDay: tod.id }))}
                            style={{ padding:'8px 14px', borderRadius:999, border:`1px solid ${personaPrefs.timeOfDay===tod.id?track.color+'80':'rgba(255,255,255,0.15)'}`, background:personaPrefs.timeOfDay===tod.id?`${track.color}25`:'transparent', color:personaPrefs.timeOfDay===tod.id?'white':'rgba(255,255,255,0.6)', fontSize:12, fontWeight:personaPrefs.timeOfDay===tod.id?700:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}>
                            {tod.icon} {tod.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bahasa konten */}
                    <div style={{ marginBottom:24 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Preferensi bahasa konten</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {[
                          { id:'id', icon:'🇮🇩', label:'Indonesia' },
                          { id:'en', icon:'🌍', label:'Internasional' },
                          { id:'mix', icon:'🎲', label:'Campur' },
                        ].map(l => (
                          <button key={l.id} onClick={()=>setPersonaPrefs(p=>({ ...p, lang: l.id }))}
                            style={{ padding:'8px 14px', borderRadius:999, border:`1px solid ${personaPrefs.lang===l.id?track.color+'80':'rgba(255,255,255,0.15)'}`, background:personaPrefs.lang===l.id?`${track.color}25`:'transparent', color:personaPrefs.lang===l.id?'white':'rgba(255,255,255,0.6)', fontSize:12, fontWeight:personaPrefs.lang===l.id?700:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}>
                            {l.icon} {l.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      disabled={personaLoading || (personaPrefs.categories.length===0 && personaPrefs.moods.length===0)}
                      onClick={async () => {
                        if (!hasKey()) { alert(t?.aiOffline||'Tambahkan API key di Settings untuk menggunakan fitur ini.'); return; }
                        setPL(true);
                        try {
                          const prompt = `Kamu adalah kurator audio personal. Berdasarkan preferensi user berikut, berikan rekomendasi audio yang dipersonalisasi dalam format JSON.

Preferensi user:
- Kategori favorit: ${personaPrefs.categories.join(', ') || 'tidak disebutkan'}
- Suasana yang dicari: ${personaPrefs.moods.join(', ') || 'tidak disebutkan'}
- Waktu mendengarkan: ${personaPrefs.timeOfDay || 'kapan saja'}
- Bahasa konten: ${personaPrefs.lang || 'mix'}

Berikan response HANYA dalam JSON ini (tanpa markdown, tanpa teks lain):
{
  "greeting": "sapa user dengan hangat dan personal berdasarkan preferensinya (max 2 kalimat)",
  "music": [
    {"title":"Nama Lagu","artist":"Artis","reason":"alasan singkat kenapa cocok (max 10 kata)"},
    {"title":"...","artist":"...","reason":"..."},
    {"title":"...","artist":"...","reason":"..."}
  ],
  "radio": [
    {"name":"Nama Stasiun","genre":"genre/kategori","reason":"alasan singkat"},
    {"name":"...","genre":"...","reason":"..."}
  ],
  "podcast": [
    {"name":"Nama Podcast","category":"kategori","reason":"alasan singkat"},
    {"name":"...","category":"...","reason":"..."}
  ],
  "tip": "satu tips pendek untuk pengalaman mendengarkan yang lebih baik"
}`;
                          const providers = getProviders();
                          let result = null;
                          for (const prov of providers) {
                            try {
                              const body = prov.isOpenAI
                                ? { model:prov.model, max_tokens:800, messages:[{role:'user',content:prompt}], ...prov.extra }
                                : { model:prov.model, max_tokens:800, messages:[{role:'user',content:[{type:'text',text:prompt}]}] };
                              const resp = await fetch(prov.endpoint, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${prov.key}`, ...(prov.extra||{}) }, body:JSON.stringify(body) });
                              const data = await resp.json();
                              const text = prov.isOpenAI ? data?.choices?.[0]?.message?.content : data?.content?.[0]?.text;
                              if (text) {
                                const clean = text.replace(/```json|```/g,'').trim();
                                const parsed = JSON.parse(clean);
                                result = parsed;
                                break;
                              }
                            } catch {}
                          }
                          if (result) {
                            setPersonaRecs(result);
                            localStorage.setItem('sn_persona_recs', JSON.stringify(result));
                            localStorage.setItem('sn_persona_prefs', JSON.stringify(personaPrefs));
                            localStorage.setItem('sn_persona_done', '1');
                            setPersonaStep('result');
                          } else {
                            alert('Gagal memuat rekomendasi. Coba lagi.');
                          }
                        } catch (e) {
                          alert('Error: ' + e.message);
                        } finally { setPL(false); }
                      }}
                      style={{ width:'100%', padding:'14px', borderRadius:16, border:'none', background:personaPrefs.categories.length>0||personaPrefs.moods.length>0 ? `linear-gradient(135deg,${track.color},#a855f7)` : 'rgba(255,255,255,0.1)', color:'white', fontSize:14, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:personaLoading?0.7:1 }}>
                      {personaLoading ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Menganalisis preferensimu…</> : <><Wand2 size={16}/> Buat Rekomendasiku!</>}
                    </button>
                  </div>
                ) : (
                  /* ── RESULT VIEW */
                  <div>
                    {personaRecs && (
                      <>
                        {/* Tombol aksi atas For You */}
                        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                          <button
                            onClick={async () => {
                              if (!hasKey()) { alert(t?.aiOffline||'Tambahkan API key di Settings untuk menggunakan fitur ini.'); return; }
                              setPL(true);
                              try {
                                const savedPrefs = (() => { try { return JSON.parse(localStorage.getItem('sn_persona_prefs')||'{}'); } catch { return personaPrefs; } })();
                                const prompt = `Kamu adalah kurator audio personal. Berdasarkan preferensi user berikut, berikan rekomendasi audio yang dipersonalisasi dalam format JSON.\n\nPreferensi user:\n- Kategori favorit: ${savedPrefs.categories?.join(', ') || personaPrefs.categories.join(', ') || 'tidak disebutkan'}\n- Suasana yang dicari: ${savedPrefs.moods?.join(', ') || personaPrefs.moods.join(', ') || 'tidak disebutkan'}\n- Waktu mendengarkan: ${savedPrefs.timeOfDay || personaPrefs.timeOfDay || 'kapan saja'}\n- Bahasa konten: ${savedPrefs.lang || personaPrefs.lang || 'mix'}\n\nBerikan response HANYA dalam JSON ini (tanpa markdown, tanpa teks lain):\n{"greeting":"sapa user dengan hangat dan personal berdasarkan preferensinya (max 2 kalimat)","music":[{"title":"Nama Lagu","artist":"Artis","reason":"alasan singkat kenapa cocok (max 10 kata)"},{"title":"...","artist":"...","reason":"..."},{"title":"...","artist":"...","reason":"..."}],"radio":[{"name":"Nama Stasiun","genre":"genre/kategori","reason":"alasan singkat"},{"name":"...","genre":"...","reason":"..."}],"podcast":[{"name":"Nama Podcast","category":"kategori","reason":"alasan singkat"},{"name":"...","category":"...","reason":"..."}],"tip":"satu tips pendek untuk pengalaman mendengarkan yang lebih baik"}`;
                                const providers = getProviders();
                                let result = null;
                                for (const prov of providers) {
                                  try {
                                    const body = prov.isOpenAI
                                      ? { model:prov.model, max_tokens:800, messages:[{role:'user',content:prompt}], ...prov.extra }
                                      : { model:prov.model, max_tokens:800, messages:[{role:'user',content:[{type:'text',text:prompt}]}] };
                                    const resp = await fetch(prov.endpoint, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${prov.key}`, ...(prov.extra||{}) }, body:JSON.stringify(body) });
                                    const data = await resp.json();
                                    const text = prov.isOpenAI ? data?.choices?.[0]?.message?.content : data?.content?.[0]?.text;
                                    if (text) {
                                      const clean = text.replace(/```json|```/g,'').trim();
                                      const parsed = JSON.parse(clean);
                                      result = parsed;
                                      break;
                                    }
                                  } catch {}
                                }
                                if (result) {
                                  setPersonaRecs(result);
                                  localStorage.setItem('sn_persona_recs', JSON.stringify(result));
                                  localStorage.setItem('sn_persona_done', '1');
                                } else {
                                  alert('Gagal memuat rekomendasi. Coba lagi.');
                                }
                              } catch (e) {
                                alert('Error: ' + e.message);
                              } finally { setPL(false); }
                            }}
                            disabled={personaLoading}
                            style={{ flex:1, padding:'10px', borderRadius:12, border:`1px solid ${track.color}50`, background:`${track.color}18`, color:track.color, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, opacity:personaLoading?0.6:1 }}>
                            {personaLoading ? <><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> Menyegarkan…</> : <><RefreshCw size={13}/> Segarkan</>}
                          </button>
                          <button onClick={()=>{ setPersonaStep('onboard'); localStorage.removeItem('sn_persona_done'); }}
                            style={{ flex:1, padding:'10px', borderRadius:12, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                            <SlidersHorizontal size={13}/> Preferensi
                          </button>
                        </div>

                        {/* Musik */}
                        {personaRecs.music?.length > 0 && (
                          <div style={{ marginBottom:18 }}>
                            <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                              🎵 Rekomendasi Musik
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                              {personaRecs.music.map((m,i)=>(
                                <div key={i} style={{ padding:'10px 14px', borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:12 }}>
                                  <div style={{ width:36, height:36, borderRadius:10, background:`${track.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🎵</div>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontWeight:700, fontSize:13, color:'white', marginBottom:2 }}>{m.title}</div>
                                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>{m.artist}</div>
                                    <div style={{ fontSize:10, color:track.color, marginTop:3 }}>{m.reason}</div>
                                  </div>
                                  <button onClick={()=>{ const query=`${m.title} ${m.artist}`; setYtQuery(p=>({...p,ytmusic:query})); setTab('stream'); setTimeout(()=>{ searchYouTube('ytmusic',query); ytMusicSectionRef.current?.scrollIntoView({behavior:'smooth',block:'start'}); },120); }}
                                    style={{ padding:'6px 12px', borderRadius:999, border:`1px solid ${track.color}50`, background:`${track.color}18`, color:track.color, fontSize:10, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                                    ▶ Play
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Radio */}
                        {personaRecs.radio?.length > 0 && (
                          <div style={{ marginBottom:18 }}>
                            <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>
                              📻 Rekomendasi Radio
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                              {personaRecs.radio.map((r,i)=>(
                                <div key={i} style={{ padding:'10px 14px', borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:12 }}>
                                  <div style={{ width:36, height:36, borderRadius:10, background:'rgba(245,158,11,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>📻</div>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontWeight:700, fontSize:13, color:'white', marginBottom:2 }}>{r.name}</div>
                                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>{r.genre}</div>
                                    <div style={{ fontSize:10, color:'#f59e0b', marginTop:3 }}>{r.reason}</div>
                                  </div>
                                  <button onClick={()=>{ setTab('stream'); }}
                                    style={{ padding:'6px 12px', borderRadius:999, border:'1px solid rgba(245,158,11,0.4)', background:'rgba(245,158,11,0.12)', color:'#f59e0b', fontSize:10, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                                    Cari
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Podcast */}
                        {personaRecs.podcast?.length > 0 && (
                          <div style={{ marginBottom:18 }}>
                            <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>
                              🎙️ Rekomendasi Podcast
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                              {personaRecs.podcast.map((p,i)=>(
                                <div key={i} style={{ padding:'10px 14px', borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:12 }}>
                                  <div style={{ width:36, height:36, borderRadius:10, background:'rgba(168,85,247,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🎙️</div>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontWeight:700, fontSize:13, color:'white', marginBottom:2 }}>{p.name}</div>
                                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>{p.category}</div>
                                    <div style={{ fontSize:10, color:'#a855f7', marginTop:3 }}>{p.reason}</div>
                                  </div>
                                  <button onClick={()=>{ const query=p.name+' podcast'; setYtQuery(prev=>({...prev,ytmusic:query})); setTab('stream'); setTimeout(()=>{ searchYouTube('ytmusic',query); ytMusicSectionRef.current?.scrollIntoView({behavior:'smooth',block:'start'}); },120); }}
                                    style={{ padding:'6px 12px', borderRadius:999, border:'1px solid rgba(168,85,247,0.4)', background:'rgba(168,85,247,0.12)', color:'#a855f7', fontSize:10, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                                    Cari
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tip */}
                        {personaRecs.tip && (
                          <div style={{ padding:'12px 16px', borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:16, display:'flex', alignItems:'flex-start', gap:10 }}>
                            <span style={{ fontSize:16 }}>💡</span>
                            <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.65 }}>{personaRecs.tip}</div>
                          </div>
                        )}

                      </>
                    )}
                  </div>
                )}
              </div>
            ) : aiSubView==='lyrics' ? (
              /* ── LYRICS VIEW inside AI tab */
              <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'16px 20px 24px' }}>
                <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
                  <button onClick={getLyrics} disabled={lyricsLoading} style={{ padding:'7px 14px', borderRadius:999, border:'none', background:track.color, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', opacity:lyricsLoading?0.6:1, display:'flex', alignItems:'center', gap:6 }}>
                    {lyricsLoading?<><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>{t?.lyricsSearchBtn||'Search...'}</>:<><Sparkles size={13}/>{lyrics?(t?.lyricsRefresh||'Refresh'):(t?.lyricsShow||'Show Lyrics')}</>}
                  </button>
                </div>
                {!lyrics&&!lyricsLoading&&(
                  <div style={{ textAlign:'center', paddingTop:36 }}>
                    <Mic2 size={48} style={{ color:'rgba(255,255,255,0.1)', margin:'0 auto 16px', display:'block' }}/>
                    <div style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.3)', marginBottom:8 }}>{t?.lyricsNotFound||'Lyrics not available'}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>{isLite ? (t?.lyricsHintLite||'Tap "Show Lyrics" to search from public database') : (t?.lyricsHintPro||'Tap "Show Lyrics" to generate lyrics with AI')}</div>
                  </div>
                )}
                {lyricsLoading&&(
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
                    <div style={{ lineHeight:1.9 }}>
                      {lyrics.split('\n').map((line, i) => {
                        const isTag = line.startsWith('[') && line.endsWith(']');
                        return (
                          <div key={i} style={{ fontSize:isTag?11:15, fontWeight:isTag?800:400, color:isTag?track.color:'rgba(255,255,255,0.9)', marginTop:isTag&&i>0?18:0, marginBottom:isTag?6:0, textTransform:isTag?'uppercase':'none', letterSpacing:isTag?'0.12em':0 }}>
                            {line || <br/>}
                          </div>
                        );
                      })}
                      <div style={{ marginTop:24, padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>{isLite ? (t?.lyricsSourceLite||'🎵 Lyrics from public database (lyrics.ovh).') : (t?.lyricsSourcePro||'✨ Lyrics from public database. If unavailable, Starry AI will generate based on title and mood.')}</div>
                      </div>
                    </div>
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
                {chatLoading&&<div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:22, height:22, borderRadius:7, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}><Bot size={11} style={{ color:'white' }}/></div><div style={{ padding:'9px 13px', borderRadius:'4px 16px 16px 16px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', gap:5 }}>{[0,0.15,0.3].map((d,i)=>(<div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#818cf8', animation:`bounce 0.8s ease-in-out ${d}s infinite` }}/>))}</div></div>}
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
            <div onClick={()=>setTab('player')} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px 6px', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.06)', background: embedTrack ? 'rgba(255,68,68,0.07)' : `${track.color}0a` }}>
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
                  ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:14 }}>{[10,5,8].map((h,i)=>(<div key={i} style={{ width:3, height:h, background:embedTrack?.type==='youtube'?'#ff4444':embedTrack?.type==='soundcloud'?'#ff5500':track.color, borderRadius:1, animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite` }}/>))}</div>
                  : <div style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,0.2)' }}/>
                }
              </div>
            </div>
          )}

          {/* Tab bar — Stream, Playlist, AI */}
          <nav style={{ display:'flex', alignItems:'center', padding:'6px 8px', paddingBottom:'max(8px,env(safe-area-inset-bottom))' }}>
            {/* Player shortcut button — leftmost, compact */}
            <button onClick={()=>setTab('player')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'5px 10px', background:'none', border:'none', cursor:'pointer', color:tab==='player'?track.color:'rgba(255,255,255,0.35)', flexShrink:0 }}>
              <div style={{ padding:'3px 10px', borderRadius:999, background:tab==='player'?`${track.color}22`:'transparent' }}><Compass size={17}/></div>
              <span style={{ fontSize:9, fontWeight:tab==='player'?700:500, letterSpacing:'0.02em' }}>Player</span>
            </button>
            {/* Divider */}
            <div style={{ width:1, height:24, background:'rgba(255,255,255,0.08)', margin:'0 2px', flexShrink:0 }}/>
            {/* Stream, Playlist, AI */}
            {tabs.map(t=>{
              const active=tab===t.id;
              return (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'5px 0', background:'none', border:'none', cursor:'pointer', color:active?track.color:'rgba(255,255,255,0.35)' }}>
                  <div style={{ padding:'3px 12px', borderRadius:999, background:active?`${track.color}22`:'transparent' }}>{t.icon}</div>
                  <span style={{ fontSize:9, fontWeight:active?700:500, letterSpacing:'0.02em' }}>{t.label}</span>
                </button>
              );
            })}

          </nav>
        </div>
      )}

      {/* ══ MODALS */}
      {showPlModal&&<PlaylistModal
        allSongs={allSongs}
        existing={editingPl}
        onClose={()=>{ setShowPlModal(false); setEditingPl(null); }}
        onSave={editingPl ? updatePlaylist : createPlaylist}
        isLite={isLite}
        t={t}
      />}

      {showUpload&&<UploadModal onClose={()=>!uploading&&setShowUpload(false)} onUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress} color={track.color} isLite={isLite} t={t}/>}

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

        ${isLite ? `
          .lite-mode *{animation:none!important;transition:none!important}
          .lite-mode .progress-arc{transition:stroke-dashoffset 0.35s linear!important}
          .lite-mode input[type=range]::-webkit-slider-thumb{box-shadow:none!important}
          .lite-mode input[type=range]::-moz-range-thumb{box-shadow:none!important}
          .lite-mode input[type=range]::-ms-thumb{box-shadow:none!important}
        ` : ''}
      `}</style>
    </div>
  );
}


