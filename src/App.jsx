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
  PenLine, ChevronLeft, Radio, Maximize2, Minimize2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
//  TRANSLATIONS — id (Indonesia) & en (English)
// ═══════════════════════════════════════════════════════
const T = {
  id: {
    settings: 'Pengaturan',
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
    pengaturan: 'Pengaturan',
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
    vibeMoodTitle: '{t?.vibeMoodTitle||'🔮 Mood'}',
    resetBtn: '× Reset',
    searchYouTube: 'Cari di YouTube',
    searchBtn: 'Cari',
    changeCover: 'Ganti Foto',
    chooseCover: 'Pilih Foto',
    deleteCover: 'Hapus Foto',
    coverApplied: '{t?.coverApplied||'Photo applied to all songs · Saved in browser'}',
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
    hint: 'Cari judul lagu, artis, album…',
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    icon: '🟠',
    embedType: 'soundcloud',
    description: 'Cari & putar langsung via SoundCloud embed',
    color: '#ff5500',
    logo: null,
    searchUrl: (q) => `https://soundcloud.com/search?q=${encodeURIComponent(q)}`,
    openUrl: 'https://soundcloud.com',
    hint: 'Cari track, artis, genre…',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🟢',
    embedType: 'spotify',
    description: 'Cari & preview 30 detik via Spotify API',
    color: '#1DB954',
    logo: null,
    searchUrl: (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`,
    openUrl: 'https://open.spotify.com',
    hint: 'Cari judul lagu, artis, album…',
  },
  {
    id: 'radio',
    name: 'Radio',
    icon: '📻',
    embedType: 'radio',
    description: 'Radio populer dunia · 10 negara · genre lengkap',
    color: '#f59e0b',
    logo: null,
    openUrl: 'https://www.radio.net',
    hint: 'Pilih negara, genre, lalu stasiun…',
    countries: [
      {
        id: 'us', name: 'Amerika Serikat', flag: '🇺🇸', color: '#3b82f6',
        genres: [
          { id: 'pop', name: 'Pop / Top 40', icon: '🎵', color: '#f59e0b', stations: [
            { id: 'z100', name: 'Z100 New York', city: 'New York', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WHTZ_FM.mp3' },
            { id: 'kiis', name: 'KIIS FM', city: 'Los Angeles', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KIISFMAAC.aac' },
            { id: 'kiss108', name: 'KISS 108', city: 'Boston', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WXKS_FMAAC.aac' },
            { id: 'hot97', name: 'HOT 97', city: 'New York', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTAAC.aac' },
            { id: 'ryan-seacrest', name: 'On Air with Ryan Seacrest', city: 'National', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KHTS_FMAAC.aac' },
          ]},
          { id: 'rock', name: 'Rock / Alternative', icon: '🎸', color: '#ef4444', stations: [
            { id: 'kroq', name: 'KROQ', city: 'Los Angeles', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KROQFMAAC.aac' },
            { id: 'krock', name: 'K-ROCK', city: 'New York', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WXRKAAC.aac' },
            { id: 'alice', name: 'Alice 97.3', city: 'San Francisco', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KLLCFMAAC.aac' },
            { id: 'q101', name: 'Q101', city: 'Chicago', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WKQXAAC.aac' },
            { id: 'wrxp', name: '101.9 RXP', city: 'New York', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WRXPAAC.aac' },
          ]},
          { id: 'country', name: 'Country', icon: '🤠', color: '#92400e', stations: [
            { id: 'wsm', name: 'WSM 650 AM', city: 'Nashville', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WSMAMAAC.aac' },
            { id: 'kkbq', name: 'Big 100', city: 'Houston', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KKBQAAC.aac' },
            { id: 'kson', name: 'KSON', city: 'San Diego', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KSONFMAAC.aac' },
            { id: 'nash-fm', name: 'Nash FM 94.7', city: 'New York', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WNSH_FMAAC.aac' },
            { id: 'kix', name: 'KIX 101.5', city: 'Nashville', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WKDFAAC.aac' },
          ]},
          { id: 'jazz', name: 'Jazz / Blues', icon: '🎷', color: '#7c3aed', stations: [
            { id: 'jazz24', name: 'Jazz24', city: 'Seattle', url: 'https://live.wostreaming.net/direct/jazz24-jazz24128kaacp-ibc1' },
            { id: 'wbgo', name: 'WBGO Jazz 88.3', city: 'New York', url: 'https://wbgo.streamguys1.com/wbgo128' },
            { id: 'kkjz', name: 'KKJZ Jazz & Blues', city: 'Long Beach', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KKJZAAC.aac' },
            { id: 'kjazz', name: 'KJAZZ 88.1', city: 'Los Angeles', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KJLHAAC.aac' },
            { id: 'wpfw', name: 'WPFW Jazz', city: 'Washington DC', url: 'https://wpfw.streamguys1.com/wpfw128' },
          ]},
          { id: 'news', name: 'Berita / Talk', icon: '📰', color: '#64748b', stations: [
            { id: 'npr', name: 'NPR News', city: 'National', url: 'https://npr-ice.streamguys1.com/live.mp3' },
            { id: 'cnn-radio', name: 'CNN Radio', city: 'Atlanta', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CNN_RADIOAAC.aac' },
            { id: 'abc-radio', name: 'ABC News Radio', city: 'New York', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WABCAMAAC.aac' },
            { id: 'wtop', name: 'WTOP News 103.5', city: 'Washington DC', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WTOPAAC.aac' },
            { id: 'kcbs', name: 'KCBS News Radio 740', city: 'San Francisco', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KCBSAMAAC.aac' },
          ]},
        ],
      },
      {
        id: 'uk', name: 'Inggris', flag: '🇬🇧', color: '#e11d48',
        genres: [
          { id: 'pop', name: 'Pop / Hits', icon: '🎵', color: '#f59e0b', stations: [
            { id: 'bbc-r1', name: 'BBC Radio 1', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one' },
            { id: 'heart', name: 'Heart FM', city: 'London', url: 'https://media-ice.musicradio.com/HeartUKMP3' },
            { id: 'capital', name: 'Capital FM', city: 'London', url: 'https://media-ice.musicradio.com/CapitalUKMP3' },
            { id: 'kiss', name: 'KISS FM UK', city: 'London', url: 'https://stream.kissfmuk.com/128kmp3' },
            { id: 'absolute', name: 'Absolute Radio', city: 'London', url: 'https://media-ice.musicradio.com/AbsoluteRadioMP3' },
          ]},
          { id: 'rock', name: 'Rock / Classic Rock', icon: '🎸', color: '#ef4444', stations: [
            { id: 'kerrang', name: 'Kerrang! Radio', city: 'Birmingham', url: 'https://media-ice.musicradio.com/KerrangMP3' },
            { id: 'planet-rock', name: 'Planet Rock', city: 'London', url: 'https://media-ice.musicradio.com/PlanetRockMP3' },
            { id: 'classic-rock', name: 'Classic Rock Radio', city: 'London', url: 'https://media-ice.musicradio.com/Magic105MP3' },
            { id: 'radio-x', name: 'Radio X', city: 'London', url: 'https://media-ice.musicradio.com/RadioXUKMP3' },
            { id: 'absolute-rock', name: 'Absolute Radio Rock', city: 'London', url: 'https://media-ice.musicradio.com/AbsoluteRadioRockMP3' },
          ]},
          { id: 'classical', name: 'Klasik / Orkestra', icon: '🎻', color: '#8b5cf6', stations: [
            { id: 'bbc-r3', name: 'BBC Radio 3', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three' },
            { id: 'classic-fm', name: 'Classic FM', city: 'London', url: 'https://media-ice.musicradio.com/ClassicFMMP3' },
            { id: 'lyric', name: 'Lyric FM', city: 'Dublin', url: 'https://icecast.rte.ie/lyricfm.mp3' },
            { id: 'bbc-proms', name: 'BBC Radio 3 Proms', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three' },
            { id: 'hello-classical', name: 'Hello Classical', city: 'London', url: 'https://stream2.kqed.org/kqedclassical' },
          ]},
          { id: 'jazz', name: 'Jazz / Soul', icon: '🎷', color: '#7c3aed', stations: [
            { id: 'bbc-jazz', name: 'BBC Radio Jazz', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_two' },
            { id: 'jazz-fm', name: 'Jazz FM', city: 'London', url: 'https://streaming.radio.co/s2a648cde8/listen' },
            { id: 'smooth', name: 'Smooth Radio', city: 'London', url: 'https://media-ice.musicradio.com/SmoothUKMP3' },
            { id: 'soul-nation', name: 'Soul Nation Radio', city: 'London', url: 'https://media-ice.musicradio.com/SmoothUKMP3' },
            { id: 'uk-jazz', name: 'UK Jazz Radio', city: 'Birmingham', url: 'https://streaming.radio.co/s6bd53445e/listen' },
          ]},
          { id: 'news', name: 'Berita / Talk', icon: '📰', color: '#64748b', stations: [
            { id: 'bbc-world', name: 'BBC World Service', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
            { id: 'bbc-r4', name: 'BBC Radio 4', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm' },
            { id: 'lbc', name: 'LBC News', city: 'London', url: 'https://media-ice.musicradio.com/LBCMP3' },
            { id: 'talk-radio', name: 'Talk Radio UK', city: 'London', url: 'https://stream.talkradio.co.uk/talkradio' },
            { id: 'times-radio', name: 'Times Radio', city: 'London', url: 'https://timesradio.wireless.radio/stream' },
          ]},
        ],
      },
      {
        id: 'fr', name: 'Prancis', flag: '🇫🇷', color: '#3b82f6',
        genres: [
          { id: 'pop', name: 'Pop / Variété', icon: '🎵', color: '#f59e0b', stations: [
            { id: 'nrj', name: 'NRJ', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3' },
            { id: 'rtl2', name: 'RTL2 Pop-Rock', city: 'Paris', url: 'https://streaming.rtl2.fr/rtl2-live/mp3/128/' },
            { id: 'nostalgie', name: 'Nostalgie', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30700/mp3_128.mp3' },
            { id: 'fun-radio', name: 'Fun Radio', city: 'Paris', url: 'https://streaming.fun-radio.fr/fun-radio/mp3/128/' },
            { id: 'cherie', name: 'Chérie FM', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30201/mp3_128.mp3' },
          ]},
          { id: 'chanson', name: 'Chanson / Jazz Français', icon: '🥐', color: '#8b5cf6', stations: [
            { id: 'france-inter', name: 'France Inter', city: 'Paris', url: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3' },
            { id: 'france-musique', name: 'France Musique', city: 'Paris', url: 'https://icecast.radiofrance.fr/francemusique-midfi.mp3' },
            { id: 'rfi-jazz', name: 'RFI Musique Jazz', city: 'Paris', url: 'https://icecast.radiofrance.fr/rfijazz-midfi.mp3' },
            { id: 'tsfjazz', name: 'TSF Jazz', city: 'Paris', url: 'https://tsfjazz.ice.infomaniak.ch/tsfjazz-high' },
            { id: 'fip', name: 'FIP Radio', city: 'Paris', url: 'https://icecast.radiofrance.fr/fip-midfi.mp3' },
          ]},
          { id: 'electro', name: 'Electro / House', icon: '🎛️', color: '#06b6d4', stations: [
            { id: 'djam', name: 'DJAM Radio', city: 'Paris', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'maxxi', name: 'Maxxi Radio', city: 'Paris', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'm80', name: 'M80 Radio', city: 'Online', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'galaxie', name: 'Galaxie Radio', city: 'Paris', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'techno-fr', name: 'Techno France', city: 'Paris', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
          ]},
          { id: 'classical', name: 'Klasik / Opera', icon: '🎻', color: '#fbbf24', stations: [
            { id: 'france-musique2', name: 'France Musique Classique', city: 'Paris', url: 'https://icecast.radiofrance.fr/francemusique-midfi.mp3' },
            { id: 'radio-classique', name: 'Radio Classique', city: 'Paris', url: 'https://radioclassique.ice.infomaniak.ch/radioclassique-high' },
            { id: 'mezzo', name: 'Mezzo Radio', city: 'Paris', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'opera-fr', name: 'Opéra de Paris Radio', city: 'Paris', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
            { id: 'musique-baroque', name: 'Musique Baroque FM', city: 'Online', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
          ]},
          { id: 'news', name: 'Berita / Politique', icon: '📰', color: '#64748b', stations: [
            { id: 'france-info', name: 'Franceinfo', city: 'Paris', url: 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3' },
            { id: 'europe1', name: 'Europe 1', city: 'Paris', url: 'https://stream.europe1.fr/europe1.mp3' },
            { id: 'rfi', name: 'RFI Monde', city: 'Paris', url: 'https://icecast.radiofrance.fr/rfi-midfi.mp3' },
            { id: 'bfm-radio', name: 'BFM Business', city: 'Paris', url: 'https://rms.radiofrance.fr/franceinfo/mp3-128' },
            { id: 'rtl', name: 'RTL', city: 'Paris', url: 'https://streaming.rtl.fr/rtl-1-44-128.mp3' },
          ]},
        ],
      },
      {
        id: 'de', name: 'Jerman', flag: '🇩🇪', color: '#fbbf24',
        genres: [
          { id: 'pop', name: 'Pop / Charts', icon: '🎵', color: '#f59e0b', stations: [
            { id: '1live', name: '1LIVE', city: 'Cologne', url: 'https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3' },
            { id: 'antenne', name: 'Antenne Bayern', city: 'Munich', url: 'https://s1-webradio.antenne.de/antenne' },
            { id: 'energy', name: 'ENERGY Berlin', city: 'Berlin', url: 'https://stream.energy.de/energy_berlin' },
            { id: 'radio-nrj', name: 'NRJ Deutschland', city: 'Berlin', url: 'https://energystream.loverad.io/nrj' },
            { id: 'bigfm', name: 'BigFM', city: 'Stuttgart', url: 'https://streams.bigfm.de/bigfm-deutschland-128-mp3' },
          ]},
          { id: 'electronic', name: 'Techno / Electronic', icon: '🎛️', color: '#06b6d4', stations: [
            { id: 'flux-deep', name: 'FluxFM Deep', city: 'Berlin', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
            { id: 'dance-de', name: 'Radio Dance Germany', city: 'Berlin', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
            { id: 'sunshine-live', name: 'sunshine live', city: 'Mannheim', url: 'https://stream.sunshine-live.de/live/mp3-128' },
            { id: 'bigcity-beats', name: 'BigCityBeats Radio', city: 'Frankfurt', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'radio-eins', name: 'Radio Eins', city: 'Berlin', url: 'https://stream.rbb-online.de/radioeins/mp3/192kbps/radioeins.mp3' },
          ]},
          { id: 'classical', name: 'Klasik / Orkestra', icon: '🎻', color: '#8b5cf6', stations: [
            { id: 'klassik-radio', name: 'Klassik Radio', city: 'Hamburg', url: 'https://live.klassikradio.de/klassikradio' },
            { id: 'br-klassik', name: 'BR-Klassik', city: 'Munich', url: 'https://br-klassik-live.cast.addradio.de/br/klassik/live/mp3/128/stream.mp3' },
            { id: 'deutschlandradio', name: 'Deutschlandradio Kultur', city: 'Berlin', url: 'https://dkultur.icecast.de/dlf/dkultur/mp3/128/stream.mp3' },
            { id: 'wdr3', name: 'WDR 3', city: 'Cologne', url: 'https://wdr-wdr3-live.icecastssl.wdr.de/wdr/wdr3/live/mp3/128/stream.mp3' },
            { id: 'ndr-klassik', name: 'NDR Kultur', city: 'Hamburg', url: 'https://ndrkultur-live.icecastssl.ndr.de/ndr/ndrkultur/live/mp3/128/stream.mp3' },
          ]},
          { id: 'schlager', name: 'Schlager / Folk', icon: '🪗', color: '#dc2626', stations: [
            { id: 'schlager-radio', name: 'Schlagerradio', city: 'Online', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'hit-radio-ffh', name: 'Hit Radio FFH', city: 'Frankfurt', url: 'https://streams.ffh.de/radioffh/mp3/256' },
            { id: 'mdr-sputnik', name: 'MDR Schlager', city: 'Leipzig', url: 'https://mdr-s-stream.ard.de/mdr/schlager/stream.mp3' },
            { id: 'radio-de-volksmusk', name: 'Volksmusik Radio', city: 'Munich', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'radio-salü', name: 'Radio Salü', city: 'Saarbrücken', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
          ]},
          { id: 'news', name: 'Berita / Talk', icon: '📰', color: '#64748b', stations: [
            { id: 'dlf', name: 'Deutschlandfunk', city: 'Cologne', url: 'https://dradio-dlf-live.icecastssl.wdr.de/dradio/dlf/live/mp3/256/stream.mp3' },
            { id: 'ndr-info', name: 'NDR Info', city: 'Hamburg', url: 'https://ndrinfo.icecastssl.ndr.de/ndr/ndrinfo/live/mp3/128/stream.mp3' },
            { id: 'wdr5', name: 'WDR 5', city: 'Cologne', url: 'https://wdr-wdr5-live.icecastssl.wdr.de/wdr/wdr5/live/mp3/128/stream.mp3' },
            { id: 'rbb24', name: 'rbb24 Inforadio', city: 'Berlin', url: 'https://inforadio.icecast.de/inforadio' },
            { id: 'swr-aktuell', name: 'SWR Aktuell', city: 'Baden-Baden', url: 'https://swraktuell-live.icecastssl.swr.de/swr/swraktuell/live/mp3/128/stream.mp3' },
          ]},
        ],
      },
      {
        id: 'id', name: 'Indonesia', flag: '🇮🇩', color: '#ef4444',
        genres: [
          { id: 'pop', name: 'Pop / Hits', icon: '🎵', color: '#f59e0b', stations: [
            { id: 'prambors', name: 'Prambors FM', city: 'Jakarta', url: 'https://26053.live.streamtheworld.com/PRAMBORSFM_SC' },
            { id: 'gen', name: 'Gen FM', city: 'Jakarta', url: 'https://26263.live.streamtheworld.com/GENFM_SC' },
            { id: 'oz', name: 'OZ Radio', city: 'Bandung', url: 'https://cast1.torontocast.com:2260/stream' },
            { id: 'female', name: 'Female Radio', city: 'Jakarta', url: 'https://26053.live.streamtheworld.com/FEMALEFM_SC' },
            { id: 'hardrock', name: 'Hard Rock FM', city: 'Jakarta', url: 'https://26053.live.streamtheworld.com/HARDROCKFM_SC' },
          ]},
          { id: 'dangdut', name: 'Dangdut / Campursari', icon: '🥁', color: '#dc2626', stations: [
            { id: 'dangdut-ria', name: 'Dangdut Ria FM', city: 'Jakarta', url: 'https://stream.zeno.fm/vn6amhu6g18uv' },
            { id: 'ms-tri', name: 'MS Tri FM', city: 'Jakarta', url: 'https://stream.zeno.fm/uvtgfpqdp4zuv' },
            { id: 'cpb', name: 'CPB Dangdut', city: 'Surabaya', url: 'https://stream.zeno.fm/3fy68y08g18uv' },
            { id: 'top-dangdut', name: 'Top Dangdut Radio', city: 'Jakarta', url: 'https://stream.zeno.fm/md1ef6md7hquv' },
            { id: 'idangdut', name: 'iDangdut Radio', city: 'Online', url: 'https://stream.zeno.fm/q67trnd5e48uv' },
          ]},
          { id: 'rock', name: 'Rock / Metal', icon: '🎸', color: '#7c3aed', stations: [
            { id: 'trax', name: 'Trax FM', city: 'Jakarta', url: 'https://26053.live.streamtheworld.com/TRAXFM_SC' },
            { id: 'urban', name: 'Urban Radio', city: 'Jakarta', url: 'https://stream.zeno.fm/x6yd2e5dqhquv' },
            { id: 'hardrock-id', name: 'Hard Rock FM 87.6', city: 'Jakarta', url: 'https://26053.live.streamtheworld.com/HARDROCKFM_SC' },
            { id: 'rock-id', name: 'Rock Indonesia FM', city: 'Bandung', url: 'https://stream.zeno.fm/t0uvvpnydg0uv' },
            { id: 'metal-id', name: 'Metal Radio Indonesia', city: 'Online', url: 'https://stream.zeno.fm/b5rmq4yydg0uv' },
          ]},
          { id: 'islami', name: 'Islami / Religi', icon: '🕌', color: '#10b981', stations: [
            { id: 'rodja', name: 'Radio Rodja', city: 'Bogor', url: 'https://streaming.radiorodja.com/rodja128' },
            { id: 'al-ikhlas', name: 'Radio Al-Ikhlas', city: 'Jakarta', url: 'https://stream.zeno.fm/3ghfcm98g18uv' },
            { id: 'muara', name: 'Radio Muara', city: 'Bandung', url: 'https://stream.zeno.fm/5q7etx5dqhquv' },
            { id: 'suara-quran', name: 'Suara Al-Quran', city: 'Online', url: 'https://stream.zeno.fm/vk9vkyydg0uv' },
            { id: 'voice-quran', name: 'Voice of Quran', city: 'Online', url: 'https://backup.qurango.net/radio/ahmad_khader_altarabulsi' },
          ]},
          { id: 'news', name: 'Berita / Talkshow', icon: '📰', color: '#64748b', stations: [
            { id: 'elshinta', name: 'Elshinta News', city: 'Jakarta', url: 'https://26053.live.streamtheworld.com/ELSHINTAFM_SC' },
            { id: 'iradio', name: 'I-Radio', city: 'Jakarta', url: 'https://26053.live.streamtheworld.com/IRADIOFM_SC' },
            { id: 'smart-fm', name: 'Smart FM', city: 'Jakarta', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SMARTFM_SC' },
            { id: 'sonora', name: 'Radio Sonora', city: 'Jakarta', url: 'https://stream.zeno.fm/2rdawryd3q8uv' },
            { id: 'kantor-berita', name: 'RRI Pro 3', city: 'Jakarta', url: 'https://stream.zeno.fm/e8q6heydg0uv' },
          ]},
        ],
      },
      {
        id: 'jp', name: 'Jepang', flag: '🇯🇵', color: '#e11d48',
        genres: [
          { id: 'jpop', name: 'J-Pop / City Pop', icon: '🌸', color: '#f472b6', stations: [
            { id: 'nhk-r1', name: 'NHK World Radio Japan', city: 'Tokyo', url: 'https://nhkworld.nhk.or.jp/player/stream/nhkworld-radio-japan.m3u8' },
            { id: 'fm-yokohama', name: 'J-Pop Sakura', city: 'Online', url: 'https://streams.ilovemusic.de/iloveradio2.mp3' },
            { id: 'j-wave', name: 'J-WAVE 81.3', city: 'Tokyo', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'tokufm', name: 'ZIP-FM City Pop', city: 'Online', url: 'https://stream.zeno.fm/5g9u2kydg0uv' },
            { id: 'citypop-jp', name: 'City Pop Japan', city: 'Online', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
          ]},
          { id: 'anime', name: 'Anime / Game OST', icon: '🎮', color: '#8b5cf6', stations: [
            { id: 'anison', name: 'Anison Radio', city: 'Online', url: 'https://stream.anison.fm/anison.fm-320' },
            { id: 'denpa', name: 'Denpa Radio', city: 'Online', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'gamewave', name: 'GameWave Radio', city: 'Online', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'anime-fm', name: 'Anime FM', city: 'Online', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'radio-anime', name: 'Radio Anime Japan', city: 'Online', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
          ]},
          { id: 'lofi', name: 'Lofi / Chillhop', icon: '🌙', color: '#a78bfa', stations: [
            { id: 'lofi-jp', name: 'Lofi Japan', city: 'Online', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
            { id: 'chillhop', name: 'Chillhop Radio', city: 'Online', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
            { id: 'lofi-study', name: 'Lofi Study', city: 'Online', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'lofi-cafe', name: 'Lofi Café', city: 'Online', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
            { id: 'kotatsu', name: 'Kotatsu Radio', city: 'Online', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
          ]},
          { id: 'classical', name: 'Klasik / Orkestra', icon: '🎻', color: '#fbbf24', stations: [
            { id: 'nhk-fm', name: 'NHK World Radio Japan', city: 'Tokyo', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
            { id: 'classic-jp', name: 'Classic Japan Radio', city: 'Online', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'baroque', name: 'Baroque Radio', city: 'Online', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
            { id: 'orchestra-jp', name: 'Klassik Radio Japan', city: 'Online', url: 'https://live.klassikradio.de/klassikradio' },
            { id: 'piano-jp', name: 'Piano Classics Radio', city: 'Online', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
          ]},
          { id: 'enka', name: 'Enka / Traditional', icon: '🎌', color: '#dc2626', stations: [
            { id: 'enka-1', name: 'Enka Japan Radio', city: 'Tokyo', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'minyo', name: 'Minyo Folk Radio', city: 'Online', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'nihon-folk', name: 'Nihon Folk FM', city: 'Online', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'shamisen', name: 'Shamisen Station', city: 'Online', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'traditional-jp', name: 'Traditional Japan', city: 'Online', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
          ]},
        ],
      },
      {
        id: 'eg', name: 'Mesir / Arab', flag: '🇪🇬', color: '#10b981',
        genres: [
          { id: 'arabic-pop', name: 'Arabic Pop / Khaleeji', icon: '🎵', color: '#f59e0b', stations: [
            { id: 'nile-fm', name: 'Nile FM', city: 'Cairo', url: 'https://stream.zeno.fm/3vr7fsydg0uv' },
            { id: 'nogoum', name: 'Nogoum FM', city: 'Cairo', url: 'https://stream.zeno.fm/7k2hevydg0uv' },
            { id: 'mbc-fm-ar', name: 'MBC FM Arabia', city: 'Dubai', url: 'https://stream.zeno.fm/9yqfepydg0uv' },
            { id: 'rotana', name: 'Rotana Radio', city: 'Riyadh', url: 'https://stream.zeno.fm/qfzh4eydg0uv' },
            { id: 'virgin-ar', name: 'Virgin Radio Arabia', city: 'Dubai', url: 'https://stream.zeno.fm/3vr7fsydg0uv' },
          ]},
          { id: 'quran', name: 'Al-Quran / Tilawah', icon: '🕌', color: '#10b981', stations: [
            { id: 'quran-radio', name: 'Holy Quran Radio', city: 'Cairo', url: 'https://backup.qurango.net/radio/ahmed_alhuthify' },
            { id: 'quran-makkah', name: 'Makkah Live Quran', city: 'Makkah', url: 'https://Quranradio.com/en/' },
            { id: 'murattal', name: 'Murattal Radio', city: 'Madinah', url: 'https://backup.qurango.net/radio/ahmad_khader_altarabulsi' },
            { id: 'saudia-quran', name: 'Saudi Quran Radio', city: 'Riyadh', url: 'https://backup.qurango.net/radio/aziz_ali' },
            { id: 'quran-kareem', name: 'Quran Kareem FM', city: 'Cairo', url: 'https://backup.qurango.net/radio/abu_bakr_shatri' },
          ]},
          { id: 'shaabi', name: 'Shaabi / Sawt', icon: '🥁', color: '#dc2626', stations: [
            { id: 'shaabi-eg', name: 'Shaabi Egypt Radio', city: 'Cairo', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'tarab', name: 'Tarab Radio', city: 'Cairo', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'umm-kulthum', name: 'Umm Kulthum Radio', city: 'Cairo', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'abd-el-halim', name: 'Abd El Halim Radio', city: 'Cairo', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'egyptian-classics', name: 'Egyptian Classics FM', city: 'Online', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
          ]},
          { id: 'rai', name: 'Rai / Maghrebi', icon: '🎶', color: '#8b5cf6', stations: [
            { id: 'rai-radio', name: 'Rai Music Radio', city: 'Oran', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
            { id: 'radio-algerie', name: 'Radio Algérie', city: 'Algiers', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'rtm-maroc', name: 'RTM Radio Maroc', city: 'Rabat', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'medi1', name: 'Medi1 Radio', city: 'Tanger', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'maghreb', name: 'Radio Maghreb FM', city: 'Online', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
          ]},
          { id: 'news', name: 'Berita / Al-Akhbar', icon: '📰', color: '#64748b', stations: [
            { id: 'bbc-arabic', name: 'BBC Arabic Radio', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_arabic_news' },
            { id: 'al-jazeera', name: 'Al Jazeera Radio', city: 'Doha', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'monte-carlo', name: 'Monte Carlo Doualiya', city: 'Paris', url: 'https://stream.radiofrance.fr/rfi/rfi_midfi.m3u8' },
            { id: 'egypt-radio', name: 'Idaaet Masr', city: 'Cairo', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'swl-arabic', name: 'Radio Sawt Al Arab', city: 'Cairo', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
          ]},
        ],
      },
      {
        id: 'br', name: 'Brazil', flag: '🇧🇷', color: '#10b981',
        genres: [
          { id: 'samba', name: 'Samba / Pagode', icon: '💃', color: '#f59e0b', stations: [
            { id: 'mec-samba', name: 'MEC Rádio Samba', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/7k2hevydg0uv' },
            { id: 'samba-br', name: 'Rádio Samba', city: 'Online', url: 'https://stream.zeno.fm/9yqfepydg0uv' },
            { id: 'pagode-hits', name: 'Pagode Hits FM', city: 'São Paulo', url: 'https://stream.zeno.fm/qfzh4eydg0uv' },
            { id: 'samba-ao-vivo', name: 'Samba Ao Vivo', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/3vr7fsydg0uv' },
            { id: 'batucada', name: 'Batucada Brasil', city: 'Online', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
          ]},
          { id: 'mpb', name: 'MPB / Bossa Nova', icon: '🎸', color: '#8b5cf6', stations: [
            { id: 'bossa-nova', name: 'Bossa Nova Radio', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
            { id: 'mpb-fm', name: 'MPB FM Rio', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'cultura-fm', name: 'Cultura FM', city: 'São Paulo', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'radio-batuta', name: 'Rádio Batuta', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'jazz-bossa', name: 'Jazz & Bossa Nova', city: 'Online', url: 'https://wbgo.streamguys1.com/wbgo128' },
          ]},
          { id: 'forró', name: 'Forró / Baião', icon: '🪗', color: '#dc2626', stations: [
            { id: 'forro-br', name: 'Forró Brasil Radio', city: 'Fortaleza', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'luiz-bessa', name: 'Rádio Luiz Bessa', city: 'Nordeste', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'forrozao', name: 'Forrozão FM', city: 'Recife', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'nordeste-fm', name: 'Nordeste FM', city: 'Salvador', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
            { id: 'forro-pe', name: 'Forró Pernambucano', city: 'Recife', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
          ]},
          { id: 'axe', name: 'Axé / Funk Carioca', icon: '🎉', color: '#f97316', stations: [
            { id: 'axe-br', name: 'Axé Brasil FM', city: 'Salvador', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'banda-fm', name: 'Banda FM Salvador', city: 'Salvador', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'funk-carioca', name: 'Funk Carioca Radio', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'hit-fm-br', name: 'Hit FM Brasil', city: 'São Paulo', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'fm-odessey', name: 'Odisseia FM', city: 'Bahia', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
          ]},
          { id: 'gospel', name: 'Gospel / Cristão', icon: '⛪', color: '#06b6d4', stations: [
            { id: 'gospel-br', name: 'Gospel Brasil Radio', city: 'São Paulo', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'radio-transamerica', name: 'Rádio Trans Brasil', city: 'São Paulo', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
            { id: 'radio-verdade', name: 'Rádio Verdade FM', city: 'Belo Horizonte', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
            { id: 'cancao-nova', name: 'Canção Nova', city: 'Cachoeira Paulista', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'radio-recomeca', name: 'Rádio Recomeça', city: 'Online', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
          ]},
        ],
      },
      {
        id: 'in', name: 'India', flag: '🇮🇳', color: '#f97316',
        genres: [
          { id: 'bollywood', name: 'Bollywood / Hindi', icon: '🎬', color: '#f59e0b', stations: [
            { id: 'radio-mirchi', name: 'Radio Mirchi', city: 'Mumbai', url: 'https://stream.zeno.fm/5g9u2kydg0uv' },
            { id: 'big-fm', name: 'BIG FM 92.7', city: 'Mumbai', url: 'https://stream.zeno.fm/9yqfepydg0uv' },
            { id: 'radio-city', name: 'Radio City 91.1', city: 'Mumbai', url: 'https://stream.zeno.fm/qfzh4eydg0uv' },
            { id: 'my-fm', name: 'My FM', city: 'Jaipur', url: 'https://stream.zeno.fm/3vr7fsydg0uv' },
            { id: 'red-fm', name: 'Red FM 93.5', city: 'Mumbai', url: 'https://stream.zeno.fm/7k2hevydg0uv' },
          ]},
          { id: 'classical-in', name: 'Klasik India / Ragas', icon: '🎶', color: '#8b5cf6', stations: [
            { id: 'all-india', name: 'All India Radio Classical', city: 'New Delhi', url: 'https://stream.zeno.fm/xp5rfbyd2g0uv' },
            { id: 'hindustani', name: 'Hindustani Classical FM', city: 'Online', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'carnatic', name: 'Carnatic Radio', city: 'Chennai', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'tabla-radio', name: 'Tabla & Raga Radio', city: 'Online', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'raag-india', name: 'Raag India FM', city: 'Online', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
          ]},
          { id: 'devotional', name: 'Devotional / Bhajan', icon: '🕉️', color: '#dc2626', stations: [
            { id: 'divya-vani', name: 'Divya Vani', city: 'New Delhi', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'bhakti-fm', name: 'Bhakti FM', city: 'Online', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'spiritual-in', name: 'Spiritual Radio India', city: 'Online', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
            { id: 'vaishnava', name: 'Vaishnava Radio', city: 'Online', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
            { id: 'saregama', name: 'Saregama Bhajan', city: 'Online', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
          ]},
          { id: 'punjabi', name: 'Punjabi / Bhangra', icon: '🥁', color: '#10b981', stations: [
            { id: 'punjab-radio', name: 'Punjab Radio', city: 'Amritsar', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'bhangra-fm', name: 'Bhangra FM', city: 'Online', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'desi-radio', name: 'Desi Radio', city: 'Chandigarh', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'apna-punjab', name: 'Apna Punjab FM', city: 'Online', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
            { id: 'surbahar', name: 'Surbahar Radio', city: 'Ludhiana', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
          ]},
          { id: 'news', name: 'Berita / Talk', icon: '📰', color: '#64748b', stations: [
            { id: 'air-news', name: 'All India Radio News', city: 'New Delhi', url: 'https://stream.zeno.fm/9yqfepydg0uv' },
            { id: 'ndtv-radio', name: 'NDTV Radio', city: 'New Delhi', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'bbchindi', name: 'BBC Hindi Service', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_hindi_news' },
            { id: 'aaj-tak', name: 'Aaj Tak Radio', city: 'New Delhi', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'air-fm-gold', name: 'AIR FM Gold', city: 'New Delhi', url: 'https://stream.zeno.fm/3vr7fsydg0uv' },
          ]},
        ],
      },
      {
        id: 'mx', name: 'Meksiko', flag: '🇲🇽', color: '#10b981',
        genres: [
          { id: 'grupero', name: 'Grupero / Norteño', icon: '🤠', color: '#f59e0b', stations: [
            { id: 'exa-mx', name: 'EXA FM', city: 'México DF', url: 'https://stream.zeno.fm/3vr7fsydg0uv' },
            { id: 'ke-buena', name: 'Ke Buena 92.9', city: 'México DF', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/XEPH_FMAAC.aac' },
            { id: 'radio-1', name: 'Radio 1 México', city: 'Monterrey', url: 'https://stream.zeno.fm/7k2hevydg0uv' },
            { id: 'nortena-fm', name: 'Norteña FM', city: 'Tijuana', url: 'https://stream.zeno.fm/9yqfepydg0uv' },
            { id: 'grupero-mx', name: 'Grupero Radio MX', city: 'Guadalajara', url: 'https://stream.zeno.fm/qfzh4eydg0uv' },
          ]},
          { id: 'mariachi', name: 'Mariachi / Ranchera', icon: '🎺', color: '#dc2626', stations: [
            { id: 'mariachi-fm', name: 'Mariachi FM', city: 'Guadalajara', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'ranchera', name: 'Ranchera Radio', city: 'Monterrey', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'xew', name: 'XEW "El W Radio"', city: 'México DF', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'radio-formula', name: 'Radio Fórmula', city: 'México DF', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'rancho-grande', name: 'Rancho Grande FM', city: 'Online', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
          ]},
          { id: 'latin-pop', name: 'Latin Pop / Reggaetón', icon: '🎉', color: '#8b5cf6', stations: [
            { id: 'hits-fm', name: 'HitsLatinos FM', city: 'México DF', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
            { id: 'la-ke-buena', name: 'La Que Buena', city: 'México DF', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'los40', name: 'Los 40 México', city: 'México DF', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'mega-mx', name: 'MEGA FM', city: 'México DF', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'vibra', name: 'Vibra México', city: 'Guadalajara', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
          ]},
          { id: 'cumbia', name: 'Cumbia / Salsa', icon: '💃', color: '#06b6d4', stations: [
            { id: 'salsa-mx', name: 'Salsa Radio México', city: 'Online', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'cumbia-mx', name: 'Cumbia Poder FM', city: 'Monterrey', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'radio-tropical', name: 'Radio Tropical', city: 'Veracruz', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
            { id: 'caliente-fm', name: 'Caliente FM', city: 'Online', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
            { id: 'cumbia-1', name: 'CumbiaUno Radio', city: 'México DF', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
          ]},
          { id: 'news', name: 'Berita / Noticias', icon: '📰', color: '#64748b', stations: [
            { id: 'informacion', name: 'Radio Fórmula Noticias', city: 'México DF', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'noticias660', name: 'XEOY Noticias 660', city: 'México DF', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'mvs', name: 'MVS Radio 102.5', city: 'México DF', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'imagen', name: 'Imagen Radio', city: 'México DF', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'w-radio', name: 'W Radio México', city: 'México DF', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
          ]},
        ],
      },
      {
        id: 'kr', name: 'Korea Selatan', flag: '🇰🇷', color: '#06b6d4',
        genres: [
          { id: 'kpop', name: 'K-Pop', icon: '🌟', color: '#f472b6', stations: [
            { id: 'kbs-cool', name: 'KBS Cool FM', city: 'Seoul', url: 'https://stream.zeno.fm/3vr7fsydg0uv' },
            { id: 'mbc-fm', name: 'MBC FM4U', city: 'Seoul', url: 'https://stream.zeno.fm/7k2hevydg0uv' },
            { id: 'sbs-power', name: 'SBS Power FM', city: 'Seoul', url: 'https://stream.zeno.fm/9yqfepydg0uv' },
            { id: 'tbsfm', name: 'TBS eFM', city: 'Seoul', url: 'https://stream.zeno.fm/qfzh4eydg0uv' },
            { id: 'kpop-global', name: 'K-Pop Global Radio', city: 'Online', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
          ]},
          { id: 'krnb', name: 'K-R&B / Hip-Hop', icon: '🎤', color: '#8b5cf6', stations: [
            { id: 'khiphop', name: 'Korean Hip-Hop Radio', city: 'Online', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'krnb-station', name: 'K-R&B Station', city: 'Online', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'sbs-love', name: 'SBS Love FM', city: 'Seoul', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'urban-kr', name: 'Urban Korea Radio', city: 'Online', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
            { id: 'mnet-radio', name: 'Mnet Radio', city: 'Seoul', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
          ]},
          { id: 'trot', name: 'Trot / Pansori', icon: '🎌', color: '#dc2626', stations: [
            { id: 'trot-kr', name: 'Trot Korea FM', city: 'Seoul', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'kbs-1', name: 'KBS 1 Radio', city: 'Seoul', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'classic-trot', name: 'Classic Trot Radio', city: 'Online', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'mbc-standard', name: 'MBC Standard FM', city: 'Seoul', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'pansori-fm', name: 'Pansori FM', city: 'Online', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
          ]},
          { id: 'indie', name: 'Indie / Alternative', icon: '🎸', color: '#10b981', stations: [
            { id: 'indie-kr', name: 'Indie Seoul Radio', city: 'Seoul', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
            { id: 'soundholic', name: 'Soundholic Radio', city: 'Online', url: 'https://stream.zeno.fm/b2zfzuydg0uv' },
            { id: 'beatnation', name: 'Beat Nation Radio', city: 'Seoul', url: 'https://stream.zeno.fm/4c4g4lydg0uv' },
            { id: 'nflux', name: 'Nflux Radio', city: 'Online', url: 'https://stream.zeno.fm/yn65y59ph38uv' },
            { id: 'kr-lo-fi', name: 'Korean Lofi Radio', city: 'Online', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
          ]},
          { id: 'news', name: 'Berita / Informasi', icon: '📰', color: '#64748b', stations: [
            { id: 'kbs-world', name: 'KBS World Radio', city: 'Seoul', url: 'https://stream.zeno.fm/0r0xa792g18uv' },
            { id: 'arirang', name: 'Arirang Radio', city: 'Seoul', url: 'https://stream.zeno.fm/s5rdy9ydg0uv' },
            { id: 'ytn', name: 'YTN Radio', city: 'Seoul', url: 'https://stream.zeno.fm/jd09dbydg0uv' },
            { id: 'mbc-news', name: 'MBC News Radio', city: 'Seoul', url: 'https://stream.zeno.fm/f3wvkuydg0uv' },
            { id: 'sbs-news', name: 'SBS News Radio', city: 'Seoul', url: 'https://stream.zeno.fm/7t4tqfydg0uv' },
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

// Public Piped/Invidious API instances (YouTube search, no key needed)
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.tokhmi.xyz',
  'https://pipedapi.moomoo.me',
  'https://api.piped.yt',
  'https://piped-api.garudalinux.org',
  'https://api.piped.projectsegfault.net',
];
const INVIDIOUS_INSTANCES = [
  'https://invidious.snopyta.org',
  'https://invidious.kavin.rocks',
  'https://y.com.sb',
  'https://invidious.nerdvpn.de',
];

// ── Provider definitions
// PROVIDERS built lazily to avoid window.location access at module init time
function getProviders() {
  const origin = (typeof window !== 'undefined' && window.location?.origin) || '';
  return [
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
      (import.meta.env?.VITE_OPENROUTER_KEY_2 || ''),
      (import.meta.env?.VITE_OPENROUTER_KEY_3 || ''),
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
      (import.meta.env?.VITE_GEMINI_KEY_2 || ''),
    ].filter(k => k && k.length > 10).flatMap(k => [
      { provider:'Gemini', key:k, model:'gemini-2.0-flash', endpoint:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', isOpenAI:true, extra:{} },
      { provider:'Gemini', key:k, model:'gemini-1.5-flash', endpoint:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', isOpenAI:true, extra:{} },
    ])),
    // Groq
    ...([
      (import.meta.env?.VITE_GROQ_KEY_1 || ''),
      (import.meta.env?.VITE_GROQ_KEY_2 || ''),
    ].filter(k => k && k.length > 10).flatMap(k => [
      { provider:'Groq', key:k, model:'llama-3.3-70b-versatile', endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
      { provider:'Groq', key:k, model:'gemma2-9b-it',            endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
      { provider:'Groq', key:k, model:'llama3-8b-8192',          endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
    ])),
  ];
}

let slotIdx = 0;

// ═══════════════════════════════════════════════════════
//  SPOTIFY — Client Credentials token + search
// ═══════════════════════════════════════════════════════
const SP_CLIENT_ID     = (import.meta.env?.VITE_SPOTIFY_CLIENT_ID || '')     || '';
const SP_CLIENT_SECRET = (import.meta.env?.VITE_SPOTIFY_CLIENT_SECRET || '') || '';

let _spToken = null;
let _spTokenExp = 0;

async function getSpotifyToken() {
  if (_spToken && Date.now() < _spTokenExp) return _spToken;
  if (!SP_CLIENT_ID || !SP_CLIENT_SECRET) return null;
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${SP_CLIENT_ID}:${SP_CLIENT_SECRET}`),
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
  if (!SC_CLIENT_ID) return null;
  try {
    const res = await fetch(
      `https://api.soundcloud.com/tracks?q=${encodeURIComponent(query)}&limit=${limit}&client_id=${SC_CLIENT_ID}`,
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
//  GOOGLE DRIVE HELPERS
// ═══════════════════════════════════════════════════════
// Cache list Drive agar tidak re-fetch setiap login
const _driveCache = { token: null, songs: null, ts: 0 };
const DRIVE_CACHE_TTL = 5 * 60 * 1000; // 5 menit
// Cache in-memory (sesi ini) + Cache API (persisten antar refresh)
const _blobCache = new Map();
const DRIVE_CACHE_NAME = 'sn-drive-v1';

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
            // Simpan ke Cache API untuk refresh berikutnya
            cachePut(cacheKey, new Blob(chunks, { type: mime }));
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
  cachePut(cacheKey, blob); // simpan ke Cache API
  return url;
}

// ── Mode Lite: stream Drive tanpa download penuh & tanpa simpan ke cache.
// Hanya buffer ~30 detik ke depan, lanjut fetch saat buffer menipis.
// Hemat data + hemat storage. AbortController dikirim agar bisa dibatalkan saat skip.
const _liteAbortMap = new Map(); // driveId → AbortController
async function driveStreamLite(driveId, token, audioElRef) {
  const memKey = `${driveId}:${token.slice(-12)}:lite`;

  // 1. In-memory URL (dari sesi ini)
  if (_blobCache.has(memKey)) return _blobCache.get(memKey);

  // 2. Cek Cache API — kalau sudah pernah diputar sebelumnya, pakai cache (tidak perlu re-download)
  const cachedBlob = await cacheGet(driveId);
  if (cachedBlob) {
    const url = URL.createObjectURL(cachedBlob);
    _blobCache.set(memKey, url);
    return url;
  }

  // 3. Batalkan fetch lagu sebelumnya (jika masih berjalan)
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

// Download full blob (no MediaSource) — dipakai mode Pro agar durasi & progress bar bisa terbaca
async function driveDownloadBlob(driveId, token) {
  const cacheKey = driveId;
  const memKey   = `${driveId}:${token.slice(-12)}`;

  if (_blobCache.has(memKey)) return _blobCache.get(memKey);

  const cachedBlob = await cacheGet(cacheKey);
  if (cachedBlob) {
    const url = URL.createObjectURL(cachedBlob);
    _blobCache.set(memKey, url);
    return url;
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&acknowledgeAbuse=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 401 || res.status === 403) throw new Error(`${res.status}`);
  if (!res.ok) throw new Error(`Drive ${res.status}`);

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  for (const [k, v] of _blobCache) {
    if (k.startsWith(driveId + ':') && k !== memKey) { URL.revokeObjectURL(v); _blobCache.delete(k); }
  }
  _blobCache.set(memKey, url);
  cachePut(cacheKey, blob);
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
function OrbitalRing({ size, pct, color, progress, duration, isPlaying, cover, title, onSeek, isLite, isRadio }) {
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
      </div>
      {/* SVG ring — mouse drag + click */}
      <svg ref={svgRef} width={size} height={size}
        style={{ position:'absolute', inset:0, zIndex:3, overflow:'visible', cursor:(duration&&!isRadio)?'grab':'default', touchAction:'none' }}
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
          : <text x={durX} y={durY} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.28)" fontSize="10" fontWeight="600" fontFamily="monospace" style={{ pointerEvents:'none' }}>{fmt(duration)}</text>
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

function SongRow({ s, i, track, playing, liked, setLiked, toggleFav, play, isDrive, isCached, onRemove, playlists, addToPlaylist, isLite, t }) {
  const isActive = track.id === s.id;
  const handleHeart = (e) => {
    e.stopPropagation();
    if (toggleFav) toggleFav(s.id, null); // already in allSongs — just toggle pl_fav + liked
    else setLiked(l => ({ ...l, [s.id]: !l[s.id] }));
  };
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

// ── Komponen SettingsPanel dengan Error Boundary
function SettingsPanel(props) {
  return (
    <SettingsErrorBoundary onClose={props.onClose}>
      <SettingsPanelInner {...props}/>
    </SettingsErrorBoundary>
  );
}

// ─────────────────────────────────────────────────────────
function SettingsPanelInner({ onClose, color, eqEnabled, setEqEnabled, eqPreset, setEqPreset, eqGains, setEqGains, crossfade, setCrossfade, sleepTimer, startSleepTimer, cancelSleepTimer, globalCover, setGlobalCover, isLite, toggleMode, pwaPrompt, pwaInstalled, installPwa, customDns, setCustomDns, lang, toggleLang, t }) {
  const coverRef = useRef(null);
  // Defensive: eqGains harus selalu array 5 elemen
  const safeGains = Array.isArray(eqGains) && eqGains.length === 5 ? eqGains : [0,0,0,0,0];
  return (
    <div style={{ position:'absolute', inset:0, zIndex:150, background:'rgba(0,0,0,0.6)', ...(isLite?{}:{backdropFilter:'blur(4px)'}), display:'flex', alignItems:'stretch' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scrollbar-hide" style={{ width:'100%', height:'100%', overflowY:'auto', overflowX:'hidden', background:'#0d0d24', border:'none', borderRadius:0, padding:'0 0 32px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px 0', marginBottom:6 }}>
          <div style={{ fontWeight:900, fontSize:15, letterSpacing:'-0.02em' }}>{t ? t.settings : 'Pengaturan'}</div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:999, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>×</button>
        </div>

        {/* ── EQUALIZER */}
        <div style={{ padding:'16px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <SlidersHorizontal size={16} style={{ color }}/>
              <span style={{ fontWeight:800, fontSize:14 }}>Equalizer</span>
            </div>
            {/* Toggle */}
            <div onClick={()=>setEqEnabled(v=>!v)} style={{ width:44, height:24, borderRadius:999, background:eqEnabled?color:'rgba(255,255,255,0.1)', cursor:'pointer', position:'relative' }}>
              <div style={{ position:'absolute', top:3, left:eqEnabled?22:3, width:18, height:18, borderRadius:'50%', background:'white', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
            </div>
          </div>

          {/* Preset pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
            {Object.keys(EQ_PRESETS).map(p=>(
              <button key={p} onClick={()=>{ setEqPreset(p); setEqGains([...EQ_PRESETS[p]]); }} style={{ padding:'5px 12px', borderRadius:999, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', background:eqPreset===p?color:'rgba(255,255,255,0.08)', color:eqPreset===p?'white':'rgba(255,255,255,0.5)' }}>{p}</button>
            ))}
          </div>

          {/* 5-band sliders */}
          <div style={{ opacity:eqEnabled?1:0.35 }}>
            {EQ_FREQS.map((_, i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', width:36, textAlign:'right', fontFamily:'monospace' }}>{EQ_LABELS[i]}</span>
                <input type="range" min="-10" max="10" step="0.5" value={safeGains[i]} disabled={!eqEnabled}
                  onChange={e=>setEqGains(g=>(Array.isArray(g)?g:[0,0,0,0,0]).map((v,j)=>j===i?+e.target.value:v))}
                  style={{ flex:1, accentColor:color, height:4 }}/>
                <span style={{ fontSize:10, fontWeight:700, color:safeGains[i]>0?color:safeGains[i]<0?'#ef4444':'rgba(255,255,255,0.35)', width:28, textAlign:'left', fontFamily:'monospace' }}>{safeGains[i]>0?'+':''}{safeGains[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CROSSFADE */}
        <div style={{ padding:'16px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
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
  const [ytSongs, setYtSongs]         = useState([]); // YT tracks saved to playlist/liked
  const [favSongs, setFavSongs]       = useState([]); // SC / Spotify / Radio liked tracks

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
  const scHasKey = !!SC_CLIENT_ID;

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

  // ── Spotify in-app search state
  const [spQuery,    setSpQuery]    = useState('');
  const [spResults,  setSpResults]  = useState([]);
  const [spLoading,  setSpLoading]  = useState(false);
  const [spError,    setSpError]    = useState(null);
  const [spTrack,    setSpTrack]    = useState(null); // selected for preview/open
  const [spPlaying,  setSpPlaying]  = useState(false);
  const [spEmbedUrl, setSpEmbedUrl] = useState(null); // Spotify embed iframe URL
  const spPreviewRef  = useRef(null); // Audio element for 30s preview
  const spEqSrcRef    = useRef(null); // MediaElementSourceNode untuk EQ Spotify
  const spPlayingRef  = useRef(false); // track spPlaying dalam closure sleep timer
  const spHasKey = !!(SP_CLIENT_ID && SP_CLIENT_SECRET);

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
      // Tidak ada preview: cari via YouTube in-app
      const q = `${track.title} ${track.artist}`;
      setYtQuery(p=>({...p,'ytmusic':q}));
      setTimeout(()=>{ searchYouTube('ytmusic', q); }, 100);
      return;
    }

    // Toggle pause jika lagu yang sama
    if (spTrack?.id === track.id && spPlaying) {
      if (spPreviewRef.current) spPreviewRef.current.pause();
      setSpPlaying(false); return;
    }

    const cf = crossfadeRef.current;

    // Fungsi yang benar-benar mulai audio baru + koneksi ke EQ chain
    const startNew = () => {
      if (spPreviewRef.current) { spPreviewRef.current.pause(); spPreviewRef.current = null; }
      spEqSrcRef.current = null; // reset src node lama

      const audio = new Audio(track.previewUrl);
      // crossOrigin diperlukan agar Web Audio API bisa mengakses stream cross-origin
      audio.crossOrigin = 'anonymous';
      audio.volume = 0.8;

      // ── Hubungkan ke Web Audio chain (EQ) jika ctx sudah tersedia
      ensureAudioCtx();
      if (audioCtxRef.current && eqNodesRef.current.length) {
        try {
          const src = audioCtxRef.current.createMediaElementSource(audio);
          src.connect(eqNodesRef.current[0]); // masuk ke EQ → masterGain → destination
          spEqSrcRef.current = src;
        } catch (e) { console.warn('Spotify EQ connect:', e); }
      }

      // Crossfade fade-in via masterGain
      if (cf > 0 && masterGainRef.current && audioCtxRef.current) {
        const g = masterGainRef.current.gain;
        const t2 = audioCtxRef.current.currentTime;
        g.cancelScheduledValues(t2); g.setValueAtTime(0, t2); g.linearRampToValueAtTime(1, t2 + cf);
      }

      audio.play().then(() => { setSpPlaying(true); setSpTrack(track); }).catch(() => {});
      audio.onended = () => setSpPlaying(false);
      spPreviewRef.current = audio;
      setSpTrack(track);
    };

    // Crossfade fade-out dari preview yang sedang jalan, lalu mulai baru
    if (cf > 0 && spPlaying && spPreviewRef.current && masterGainRef.current && audioCtxRef.current) {
      const gain = masterGainRef.current.gain;
      const now  = audioCtxRef.current.currentTime;
      gain.cancelScheduledValues(now); gain.setValueAtTime(gain.value, now); gain.linearRampToValueAtTime(0, now + cf);
      setTimeout(startNew, cf * 1000);
    } else { startNew(); }
  };

  const doSoundCloudSearch = async (platformId, q) => {
    if (!q.trim()) return;
    setScLoading(p => ({...p, [platformId]: true}));
    setScError(p => ({...p, [platformId]: null}));
    setScResults(p => ({...p, [platformId]: []}));
    const items = await searchSoundCloud(q);
    if (items && items.length > 0) setScResults(p => ({...p, [platformId]: items}));
    else setScError(p => ({...p, [platformId]: t?.noResults||'No results found.'}));
    setScLoading(p => ({...p, [platformId]: false}));
  };

  const openPlatformSearch = (platform, query) => {
    const q = (query || platformSearch[platform.id] || '').trim();
    if (!q) { openNewTab(platform.openUrl); return; }
    openNewTab(platform.searchUrl(q));
  };

  // Try Piped API instances
  const searchViaPiped = async (query) => {
    for (const base of PIPED_INSTANCES) {
      try {
        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), 5000);
        const res  = await fetch(`${base}/search?q=${encodeURIComponent(query)}&filter=music_songs`, { signal: ctrl.signal });
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
        const res  = await fetch(`${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video&fields=videoId,title,author,lengthSeconds,videoThumbnails`, { signal: ctrl.signal });
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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume]     = useState(0.75);
  const [muted, setMuted]       = useState(false);
  const [liked, setLiked]       = useState({});
  const [tab, setTab]           = useState(() => localStorage.getItem('sn_tab') || 'player');

  // Fetch live trending music from Invidious/Piped → shown as suggestion chips
  const fetchYtTrending = useCallback(async () => {
    if (ytTrendingLoading || ytTrending.length > 0) return; // only fetch once per session
    setYtTrendingLoading(true);
    try {
      // Try Invidious trending (music category = 10)
      for (const base of INVIDIOUS_INSTANCES) {
        try {
          const ctrl = new AbortController();
          const tid  = setTimeout(() => ctrl.abort(), 5000);
          const res  = await fetch(`${base}/api/v1/trending?type=Music&fields=title,videoId`, { signal: ctrl.signal });
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
          const res  = await fetch(`${base}/trending?region=ID`, { signal: ctrl.signal });
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

    // Try Piped first
    let items = await searchViaPiped(query);

    // Fallback to Invidious
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

    const cf = crossfadeRef.current;
    const doSwitch = () => {
      setEmbedTrack(ytTrack);
      setYtProgress(0); setYtDuration(secs||0);
      if (queue) { ytQueueRef.current = queue; ytQueueIdxRef.current = queueIdx ?? queue.findIndex(v=>(v.videoId||v.url?.includes(videoId))===videoId); }
      setEmbedMinimized(false);
      if (audioRef.current) { audioRef.current.pause(); }
      setPlaying(true);
      setTab('player');
    };

    // ── Crossfade YouTube: fade volume out → switch → fade in baru
    if (cf > 0 && embedTrack?.type === 'youtube' && ytIframeRef.current) {
      const STEPS  = 12;
      const stepMs = (cf * 1000) / STEPS;
      let step = 0;
      const fadeOut = setInterval(() => {
        step++;
        const vol = Math.max(0, Math.round(100 * (1 - step / STEPS)));
        try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'setVolume', args:[vol] }), '*'); } catch(_) {}
        if (step >= STEPS) {
          clearInterval(fadeOut);
          doSwitch();
          setTimeout(() => {
            let si = 0;
            const fadeIn = setInterval(() => {
              si++;
              const vi = Math.min(100, Math.round(100 * (si / STEPS)));
              try { ytIframeRef.current?.contentWindow.postMessage(JSON.stringify({ event:'command', func:'setVolume', args:[vi] }), '*'); } catch(_) {}
              if (si >= STEPS) clearInterval(fadeIn);
            }, stepMs);
          }, 400);
        }
      }, stepMs);
    } else { doSwitch(); }
  };

  const playSoundCloud = (platformId, query) => {
    if (!query.trim()) return;
    setScWidget(p => ({...p, [platformId]: query.trim()}));
    setEmbedTrack({ type:'soundcloud', query: query.trim(), title:`SoundCloud: "${query.trim()}"`, artist:'SoundCloud', thumbnail:null });
    setEmbedMinimized(false);
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

  // ── Like a YouTube track → save to ytSongs + liked state
  const likeYtTrack = useCallback(() => {
    if (!embedTrack || embedTrack.type !== 'youtube') return;
    const id = `yt_${embedTrack.videoId}`;
    const nowLiked = !liked[id]; // eslint-disable-line
    setLiked(l => ({ ...l, [id]: !l[id] }));
    updateFavPlaylist(id, nowLiked);
    setYtSongs(prev => {
      if (prev.find(s => s.id === id)) return prev;
      return [...prev, {
        id, type:'youtube', videoId:embedTrack.videoId,
        title:embedTrack.title, artist:embedTrack.artist,
        album:'YouTube', cover:embedTrack.thumbnail||'',
        src:'', color:'#ff4444', bg:'rgba(255,68,68,0.15)', mood:'youtube',
        thumbnail:embedTrack.thumbnail, duration:embedTrack.durationSecs||0,
      }];
    });
  }, [embedTrack, liked, updateFavPlaylist]); // eslint-disable-line


  // ── Jam live (update setiap detik)
  const [nowTime, setNowTime] = useState(() => new Date());

  // ── New playback features
  const [shuffle, setShuffle] = useState(() => localStorage.getItem('sn_shuffle') === 'true');
  const [repeat, setRepeat]   = useState(() => localStorage.getItem('sn_repeat') || 'off');
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
  const [fullscreen, setFullscreen] = useState(false);
  const fullscreenRef = useRef(false);
  useEffect(() => {
    fullscreenRef.current = fullscreen;
    window.dispatchEvent(new Event('resize')); // re-trigger layout calc
  }, [fullscreen]);

  // ── Queue / search
  const [searchQuery, setSearchQuery]   = useState('');

  // ── AI
  const [aiSubView, setAiSubView] = useState('chat'); // 'chat' | 'lyrics'
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
  const [driveDownProg, setDriveDownProg] = useState(0); // 0-100, only in Pro mode
  const [driveError, setDriveError]     = useState('');

  // ── Custom cover global (satu foto untuk semua lagu)
  const [globalCover, setGlobalCover]   = useState(() => localStorage.getItem('sn_global_cover') || '');
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const coverInputRef = useRef(null);

  // Helper: ambil cover aktif (globalCover override semua)
  const getCover = useCallback((song) => isLite ? (globalCover || '') : (globalCover || song?.cover || ''), [globalCover, isLite]);

  // ── Playlists
  const [playlists, setPlaylists]         = useState([
    { id:'pl_fav', name:'❤️ Favorit', songIds:[], locked:false },
    { id:'pl_chill', name:'🌙 Chill Night', songIds:[], locked:false },
  ]);
  const [activePl, setActivePl]           = useState(null); // null = all songs, else playlist id
  const [showPlModal, setShowPlModal]     = useState(false);
  const [editingPl, setEditingPl]         = useState(null);
  const [plView, setPlView]               = useState('list'); // 'list' | 'detail'

  // ── Responsive
  const [ringSize, setRingSize] = useState(260);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= window.innerHeight && window.innerWidth >= 600);
  // layoutMode: 'mobile-portrait' | 'mobile-landscape' | 'desktop-portrait' | 'desktop-landscape'
  const [layoutMode, setLayoutMode] = useState(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const isLandscape = vw > vh;
    const isLargeScreen = Math.max(vw, vh) >= 900;
    if (isLargeScreen && isLandscape) return 'desktop-landscape';
    if (isLargeScreen && !isLandscape) return 'desktop-portrait';
    if (!isLargeScreen && isLandscape) return 'mobile-landscape';
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
  const audioCtxRef   = useRef(null);
  const eqNodesRef    = useRef([]);
  const masterGainRef = useRef(null);
  const cfGainRef     = useRef(null); // crossfade gain
  const crossfadeRef  = useRef(0);

  const allSongs = [...builtinSongs, ...customSongs, ...ytSongs, ...favSongs];

  // ── Keep refs in sync
  useEffect(() => { shuffleRef.current  = shuffle;   }, [shuffle]);
  useEffect(() => { repeatRef.current   = repeat;    }, [repeat]);
  useEffect(() => { tokenRef.current    = accessToken; }, [accessToken]);
  useEffect(() => { crossfadeRef.current = crossfade; }, [crossfade]);
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
      // Determine layout mode
      const isLandscape = vw > vh;
      const isLargeScreen = Math.max(vw, vh) >= 900;
      let mode = 'mobile-portrait';
      if (isLargeScreen && isLandscape) mode = 'desktop-landscape';
      else if (isLargeScreen && !isLandscape) mode = 'desktop-portrait';
      else if (!isLargeScreen && isLandscape) mode = 'mobile-landscape';
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
    const wasPlaying = prev && !prev.paused;
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
    a.src = track.src; // set src SETELAH preload agar browser hormati pengaturan preload
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
    const onTime  = () => setProgress(a.currentTime);
    const onMeta  = () => { if (a.duration && isFinite(a.duration)) setDuration(a.duration); };
    const onDurChange = () => { if (a.duration && isFinite(a.duration)) setDuration(a.duration); };
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
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('durationchange', onDurChange);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('error', onError);
      a.removeEventListener('stalled', onStall);
    };
  }, [track]); // only re-attach when track changes (not customSongs)

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
      ensureAudioCtx();
      if (audioCtxRef.current?.state==='suspended') audioCtxRef.current.resume();
      a.play().catch(e => { console.warn('play error:', e); setPlaying(false); });
    } else { a.pause(); }
  }, [playing, ensureAudioCtx, embedTrack]);

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
            // Restart lagu yang sama
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
        // Spotify preview
        if (spPreviewRef.current) { spPreviewRef.current.pause(); spPreviewRef.current = null; }
        setSpPlaying(false);
        // SoundCloud embed — tutup widget agar iframe berhenti autoplay
        setScWidget({});
        // Fade out masterGain dengan mulus sebelum berhenti (jika Web Audio aktif)
        if (masterGainRef.current && audioCtxRef.current) {
          const g = masterGainRef.current.gain;
          const now = audioCtxRef.current.currentTime;
          g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0, now + 1.5);
          setTimeout(() => { if (masterGainRef.current) masterGainRef.current.gain.value = 1; }, 2000);
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

  // ── PLAY (with crossfade support + Drive auto token refresh)
  const play = useCallback(async (t) => {
    // ── Handle fav tracks from SC / Spotify / Radio
    if (t.type === 'soundcloud') {
      setScWidget(p => ({ ...p, soundcloud: t.permalink || t.src }));
      setTab('stream'); return;
    }
    if (t.type === 'spotify') {
      if (t.spotifyUrl) {
        const embedUrl = t.spotifyUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
        setSpEmbedUrl(embedUrl);
      }
      setTab('stream'); return;
    }
    if (t.isRadio) {
      const radioTrackObj = { id: t.id, title: t.title, artist: t.artist, album: 'Live Radio', cover: t.cover, src: t.src, color: t.color||'#f59e0b', bg: t.bg||'rgba(245,158,11,0.15)', mood: 'live, radio', isRadio: true };
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      setRadioStation({ id: t.id.replace('radio_',''), name: t.title, url: t.src, color: t.color||'#f59e0b' });
      setRadioPlaying(true); setTrack(radioTrackObj); setPlaying(true); setTab('player'); return;
    }
    let td = { ...t };
    if (t.isDrive && !t.src) {
      setLoadingTrack(true);
      setDriveDownProg(0);

      // ── Cek cache dulu (bisa diputar offline tanpa token)
      try {
        const cachedBlob = await cacheGet(t.driveId);
        if (cachedBlob) {
          const url = URL.createObjectURL(cachedBlob);
          _blobCache.set(t.driveId + ':cached', url);
          setCustomSongs(prev => prev.map(s => s.id === t.id ? { ...s, src: url } : s));
          td = { ...t, src: url };
          setDriveError('');
          setLoadingTrack(false);
          setDriveDownProg(0);
          // Langsung lanjut ke playback (skip fetch)
          if (track.id === td.id) { setPlaying(p => !p); return; }
          const cf = crossfadeRef.current;
          const doSwitchCached = () => {
            if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = td.src; audioRef.current.load(); }
            setTrack(td); setProgress(0); setDuration(0); setPlaying(true);
            setTab('player');
          };
          if (cf > 0 && masterGainRef.current && audioCtxRef.current) {
            const ctx = audioCtxRef.current; const gain = masterGainRef.current.gain; const now = ctx.currentTime;
            gain.cancelScheduledValues(now); gain.setValueAtTime(gain.value, now); gain.linearRampToValueAtTime(0, now + cf);
            setTimeout(() => { doSwitchCached(); setTimeout(() => { if(masterGainRef.current&&audioCtxRef.current){const g=masterGainRef.current.gain;const t2=audioCtxRef.current.currentTime;g.cancelScheduledValues(t2);g.setValueAtTime(0,t2);g.linearRampToValueAtTime(1,t2+cf);} }, 50); }, cf * 1000);
          } else { doSwitchCached(); }
          return;
        }
      } catch {}

      // ── Tidak ada cache — perlu download dari Drive (harus online + token)
      if (!navigator.onLine) {
        setDriveError(t?.noPlayback||'This song has not been downloaded. Connect to the internet and play it once to save offline.');
        setLoadingTrack(false); setDriveDownProg(0); return;
      }

      // Pro mode: gunakan driveDownloadBlob (full blob) agar durasi & progress bar terbaca
      // Lite mode: tetap stream via MediaSource (hemat bandwidth, tapi no progress bar)
      const tryLoad = async (tok) => {
        if (!isLite) {
          // Simulasi progress saat download (75% selama download, lalu 100% setelah selesai)
          const progInterval = setInterval(() => {
            setDriveDownProg(p => p < 88 ? p + 4 : p);
          }, 250);
          try {
            const url = await driveDownloadBlob(t.driveId, tok);
            clearInterval(progInterval);
            setDriveDownProg(100);
            // Tandai sebagai cached
            setCachedDriveIds(prev => new Set([...prev, t.driveId]));
            return url;
          } catch(e) {
            clearInterval(progInterval);
            throw e;
          }
        } else {
          // Lite: stream tanpa download penuh & tanpa simpan cache — hemat data & storage
          const url = await driveStreamLite(t.driveId, tok, audioRef);
          // Tidak ditandai cached di Lite mode (file tidak disimpan ke Cache API)
          return url;
        }
      };
      // Safety timeout: 90 detik
      const safetyTimer = setTimeout(() => {
        setLoadingTrack(false);
        setDriveDownProg(0);
        setDriveError('Timeout: koneksi lambat. Coba lagi atau periksa koneksi internet.');
      }, 90000);
      try {
        let tok = tokenRef.current;
        if (!tok) throw new Error(t?.loginRequired||'Sign in with Google first');
        let url;
        try {
          url = await tryLoad(tok);
        } catch(e) {
          // 401/403 = expired token → silent refresh and retry once
          if (e.message.includes('401') || e.message.includes('403')) {
            try {
              tok = await silentRefreshToken();
              url = await tryLoad(tok);
            } catch(re) {
              setDriveError('Sesi Google berakhir. Ketuk tombol Login untuk lanjut.');
              clearTimeout(safetyTimer); setLoadingTrack(false); setDriveDownProg(0); return;
            }
          } else { throw e; }
        }
        setCustomSongs(prev => prev.map(s=>s.id===t.id?{...s,src:url}:s));
        td = { ...t, src: url };
        setDriveError('');
      } catch(e) {
        setDriveError('Gagal memutar: ' + e.message);
        clearTimeout(safetyTimer); setLoadingTrack(false); setDriveDownProg(0); return;
      }
      clearTimeout(safetyTimer);
      setTimeout(() => setDriveDownProg(0), 600);
      setLoadingTrack(false);
    }

    if (track.id === td.id) { setPlaying(p=>!p); return; }

    const cf = crossfadeRef.current;
    const doSwitch = () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src=td.src; audioRef.current.load(); }
      setTrack(td); setProgress(0); setDuration(0); setPlaying(true);
      setTab('player'); // otomatis pindah ke player saat lagu baru diputar
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
        setTimeout(() => {
          if (masterGainRef.current && audioCtxRef.current) {
            const g = masterGainRef.current.gain;
            const t2 = audioCtxRef.current.currentTime;
            g.cancelScheduledValues(t2); g.setValueAtTime(0, t2); g.linearRampToValueAtTime(1, t2 + cf);
          }
        }, 50);
      }, cf * 1000);
    } else { doSwitch(); }
  }, [track, silentRefreshToken]);

  // ── NEXT / PREV
  const goNext = useCallback(() => {
    const songs = [...builtinSongs, ...customSongs, ...ytSongs];
    if (repeatRef.current==='one') { if(audioRef.current){audioRef.current.currentTime=0;audioRef.current.play().catch(()=>{});} return; }
    if (shuffleRef.current) {
      const others = songs.filter(s=>s.id!==track.id);
      if (others.length) play(others[Math.floor(Math.random()*others.length)]);
    } else {
      const i = songs.findIndex(s=>s.id===track.id);
      const next = songs[(i+1)%songs.length];
      if (next) play(next);
    }
  }, [track, play, customSongs, ytSongs]);

  // Keep goNextRef always pointing to latest goNext
  useEffect(() => { goNextRef.current = goNext; }, [goNext]);
  useEffect(() => { ytNextRef.current = ytNext; }, [ytNext]);

  const goPrev = useCallback(() => {
    if (progress > 3) { if(audioRef.current){audioRef.current.currentTime=0;setProgress(0);} return; }
    const songs = [...builtinSongs, ...customSongs, ...ytSongs];
    const i = songs.findIndex(s=>s.id===track.id);
    play(songs[(i-1+songs.length)%songs.length]);
  }, [track, play, customSongs, ytSongs, progress]);

  // ── SEEK
  const seekByPct = useCallback((p) => { if(audioRef.current&&duration){audioRef.current.currentTime=p*duration;setProgress(p*duration);} }, [duration]);

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

    // Recommend a search query for streaming platforms
    const r = await askAI(
      `Pengguna ingin musik dengan vibe/suasana hati: "${vibeInput}"\n\nBerikan:\n1. Rekomendasi 1 lagu spesifik (format: "JUDUL - ARTIS")\n2. Kata kunci pencarian untuk YouTube (format: "YT: kata kunci")\n3. Kata kunci untuk SoundCloud (format: "SC: kata kunci")\n\nJawab singkat, 3 baris saja.`,
      'Kamu kurator musik AI yang paham vibes dan suasana hati. Berikan rekomendasi spesifik.'
    );
    setVibeInput(`✨ ${r.trim()}`);
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
    const t=setInterval(()=>setUploadProg(p=>p<85?p+5:p),400);
    try {
      const s=await driveUploadSong(file,meta,accessToken); clearInterval(t); setUploadProg(100);
      setCustomSongs(p=>[...p,s]);
      setTimeout(()=>{ setShowUpload(false); setUploading(false); setUploadProg(0); },700);
    } catch(e) { clearInterval(t); alert((t?.uploadBtn||'Upload')+ ' failed: '+e.message); setUploading(false); setUploadProg(0); }
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
    { id:'ai',       icon:<Bot size={17}/>,        label:'AI' },
  ];

  return (
    <div className={`${isLite ? 'lite-mode' : ''} layout-${layoutMode}`} style={{ position:'fixed', inset:0, overflow:'hidden', background:'#07071a', color:'#f1f5f9', fontFamily:"'Segoe UI',system-ui,sans-serif", display:'flex', flexDirection:'column', userSelect:'none', WebkitTapHighlightColor:'transparent' }}>

      {/* BG — Pro only */}
      {!isLite && <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, background:`radial-gradient(ellipse at 60% 10%,${track.color}20 0%,transparent 60%)` }}/>}
      {!isLite && <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}><div className="stars"/><div className="starsB"/><div className="starsC"/></div>}

      {/* ══ HEADER */}
      {!fullscreen && <header style={{ position:'relative', zIndex:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding: layoutMode === 'mobile-landscape' ? '5px 14px' : '9px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
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
          <button onClick={()=>setShowSettings(true)} style={{ width:42, height:42, borderRadius:12, border:'none', cursor:'pointer', background:'transparent', color:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
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
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.38)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{embedTrack ? (embedTrack.type==='youtube'?'YouTube':'SoundCloud') : track.isRadio ? '● LIVE' : track.artist}</div>
              </div>
              {playing && <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:11, flexShrink:0 }}>{[9,5,7].map((h,i)=>(<div key={i} style={{ width:2.5, height:h, background:embedTrack?'#ff4444':track.color, borderRadius:1, animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite` }}/>))}</div>}
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
          <button onClick={()=>setShowSettings(true)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', background:'transparent', color:'rgba(255,255,255,0.3)', width:'100%', fontSize:13 }}>
            <Settings size={17}/><span>{t ? t.pengaturan : 'Pengaturan'}</span>
          </button>
        </div>
      )}

      <main style={{ flex:1, overflow:'hidden', position:'relative' }}>

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
                        : embedTrack?.type==='youtube' ? `${ytQueueRef.current.length} ${t?.songsCount||'songs'}` : `${[...builtinSongs,...customSongs,...ytSongs].length} ${t?.songsCount||'songs'}`
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
                })() : embedTrack?.type==='youtube' ? (
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

          {/* ── SETTINGS PANEL — inline dalam player */}
          {showSettings&&<SettingsPanel key="settings-panel" onClose={()=>setShowSettings(false)} color={track?.color||"#6366f1"} eqEnabled={!!eqEnabled} setEqEnabled={setEqEnabled} eqPreset={eqPreset||"Normal"} setEqPreset={setEqPreset} eqGains={Array.isArray(eqGains)&&eqGains.length===5?eqGains:[0,0,0,0,0]} setEqGains={setEqGains} crossfade={typeof crossfade==="number"?crossfade:0} setCrossfade={setCrossfade} sleepTimer={sleepTimer||null} startSleepTimer={startSleepTimer} cancelSleepTimer={cancelSleepTimer} globalCover={globalCover||""} setGlobalCover={setGlobalCover} isLite={!!isLite} toggleMode={toggleMode} pwaPrompt={pwaPrompt||null} pwaInstalled={!!pwaInstalled} installPwa={installPwa} customDns={customDns||""} setCustomDns={setCustomDns} lang={lang} toggleLang={toggleLang} t={t}/>}

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

            {loadingTrack&&!embedTrack&&(
              <div style={{ position:'fixed', inset:0, zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(7,7,26,0.85)', ...(isLite ? {} : { backdropFilter:'blur(6px)' }), gap:12 }}>
                <Loader2 size={30} style={{ color:track.color, animation:'spin 1s linear infinite' }}/>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>{isLite ? t?.loadingDrive||'Loading from Google Drive…' : `${t?.downloadingTrack||'Downloading track…'} ${driveDownProg > 0 ? driveDownProg + '%' : ''}`}</div>
                {!isLite && driveDownProg > 0 && (
                  <div style={{ width:200, height:5, borderRadius:999, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:999, background:track.color, width:`${driveDownProg}%` }}/>
                  </div>
                )}
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
                <OrbitalRing size={ringSize} pct={embedTrack?.type==='youtube'?(ytDuration>0?ytProgress/ytDuration:0):track.isRadio?0:pct} color={embedTrack?.type==='youtube'?'#ff4444':track.color} progress={embedTrack?.type==='youtube'?ytProgress:progress} duration={embedTrack?.type==='youtube'?ytDuration:track.isRadio?0:duration} isPlaying={playing} cover={embedTrack?.type==='youtube'?(embedTrack.thumbnail||getCover(track)):getCover(track)} title={embedTrack?.type==='youtube'?embedTrack.title:track.title} onSeek={embedTrack?.type==='youtube'?seekYt:track.isRadio?null:seekByPct} isLite={isLite} isRadio={!embedTrack&&track.isRadio}/>
              </div>
            ) : (
              <OrbitalRing size={ringSize} pct={embedTrack?.type==='youtube'?(ytDuration>0?ytProgress/ytDuration:0):track.isRadio?0:pct} color={embedTrack?.type==='youtube'?'#ff4444':track.color} progress={embedTrack?.type==='youtube'?ytProgress:progress} duration={embedTrack?.type==='youtube'?ytDuration:track.isRadio?0:duration} isPlaying={playing} cover={embedTrack?.type==='youtube'?(embedTrack.thumbnail||getCover(track)):getCover(track)} title={embedTrack?.type==='youtube'?embedTrack.title:track.title} onSeek={embedTrack?.type==='youtube'?seekYt:track.isRadio?null:seekByPct} isLite={isLite} isRadio={!embedTrack&&track.isRadio}/>
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
              ) : track.isRadio ? (
                <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:999, marginBottom:3, background:`rgba(245,158,11,0.15)`, border:'1px solid rgba(245,158,11,0.35)' }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#f59e0b', boxShadow:'0 0 6px #f59e0b', animation: playing ? 'pulse 1.2s infinite' : 'none' }}/>
                  <span style={{ fontSize:9, fontWeight:800, color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.1em' }}>● LIVE RADIO</span>
                </div>
              ) : track.isDrive ? (
                <div style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'2px 7px', borderRadius:999, marginBottom:3, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)' }}><Cloud size={9} style={{ color:track.color }}/><span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Drive</span></div>
              ) : null}
              <h2 style={{ margin:0, fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, fontSize: fullscreen ? 'clamp(18px,4.8vw,28px)' : layoutVars.trackTitleSize, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{embedTrack?.type==='youtube'?embedTrack.title:track.title}</h2>
              <p style={{ margin:'2px 0 0', fontSize: fullscreen ? 'clamp(11px,2.8vw,14px)' : layoutVars.artistSize, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>
                {embedTrack?.type==='youtube' ? embedTrack.artist : `${track.artist} — ${track.album}`}
              </p>
            </div>

            {/* Main controls: Shuffle | Prev | Play | Next | Repeat */}
            <div style={{ display:'flex', alignItems:'center', gap:layoutVars.controlsGap, marginTop: fullscreen ? 0 : layoutVars.controlsMt }}>
              {!track.isRadio && <button onClick={()=>{ if(embedTrack?.type==='youtube'){ setShuffle(s=>{ const next=!s; if(next){ setRepeat('off'); ytShuffle(); } return next; }); } else { setShuffle(s=>{ const next=!s; if(next) setRepeat("off"); return next; }); } }} style={{ ...btn, color:shuffle?(embedTrack?.type==='youtube'?'#ff4444':track.color):'rgba(255,255,255,0.3)', position:'relative', padding:'clamp(5px,1.2vw,8px)' }}>
                <Shuffle size={18}/>
                {shuffle&&<div style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:3, height:3, borderRadius:'50%', background:embedTrack?.type==='youtube'?'#ff4444':track.color }}/>}
              </button>}
              <button onClick={()=>track.isRadio?goPrevRadio():embedTrack?.type==='youtube'?ytPrev():goPrev()} style={{ ...btn, padding:'clamp(5px,1.2vw,8px)' }}><SkipBack size={22} fill="currentColor"/></button>
              <button onClick={()=>{ if(!track.src&&!embedTrack) return; setPlaying(p=>!p); }} disabled={!track.src&&!embedTrack} style={{ width: fullscreen ? 'clamp(60px,16vw,72px)' : 'clamp(48px,13vw,56px)', height: fullscreen ? 'clamp(60px,16vw,72px)' : 'clamp(48px,13vw,56px)', borderRadius:'50%', border:'none', background:'white', color:'#07071a', cursor:(!track.src&&!embedTrack)?'default':'pointer', opacity:(!track.src&&!embedTrack)?0.4:1, display:'flex', alignItems:'center', justifyContent:'center', boxShadow: isLite ? `0 2px 8px rgba(0,0,0,0.4)` : `0 0 22px ${embedTrack?.type==='youtube'?'#ff444490':track.color+'90'},0 4px 20px rgba(0,0,0,0.4)`, flexShrink:0 }}>
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
                ? <button onClick={likeYtTrack} title={t?.like||"Like"} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:liked[`yt_${embedTrack.videoId}`]?'#f472b6':'rgba(255,255,255,0.35)' }}><Heart size={16} fill={liked[`yt_${embedTrack.videoId}`]?'#f472b6':'none'}/></button>
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
              {/* Queue */}
              <button onClick={()=>setShowQueue(q=>!q)} title={t?.queue||"Queue"} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:showQueue?(embedTrack?.type==='youtube'?'#ff6b6b':track.color):'rgba(255,255,255,0.35)' }}>
                <ListMusic size={16}/>
              </button>
              {/* Settings */}
              <button onClick={()=>setShowSettings(true)} title={t?.settings||"Settings"} style={{ ...btn, flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:layoutVars.actionPad, borderRadius:12, background:'none', border:'none', color:(eqEnabled||sleepTimer)?(embedTrack?.type==='youtube'?'#ff6b6b':track.color):'rgba(255,255,255,0.35)' }}><Settings size={16}/></button>
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

            {/* YouTube playlist picker — shown when YT track is liked */}
            {embedTrack?.type==='youtube' && liked[`yt_${embedTrack.videoId}`] && (
              <div style={{ width:'100%', maxWidth:340, marginTop:10, padding:'10px 14px', borderRadius:14, background:'rgba(255,68,68,0.07)', border:'1px solid rgba(255,68,68,0.18)' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#ff6b6b', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>{t?.addToPlaylistBtn||'Add to Playlist'}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {playlists.map(pl => {
                    const ytId = `yt_${embedTrack.videoId}`;
                    const inPl = pl.songIds.includes(ytId);
                    return (
                      <button key={pl.id} onClick={()=>inPl?removeFromPlaylist(pl.id,ytId):addToPlaylist(pl.id,ytId)}
                        style={{ padding:'4px 10px', borderRadius:999, border:`1px solid ${inPl?'#ff4444':'rgba(255,255,255,0.15)'}`, background:inPl?'rgba(255,68,68,0.2)':'rgba(255,255,255,0.05)', color:inPl?'#fca5a5':'rgba(255,255,255,0.6)', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                        {inPl?'✓ ':''}{pl.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}


          </div>
          </div>
        )}
        {tab==='stream'&&(
          <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:'14px 16px 0' }}>

            {/* Header */}
            <div style={{ marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                <div style={{ fontWeight:800, fontSize:15 }}>{t?.streamingPlatforms||'Streaming Platforms'}</div>
                {eqEnabled && <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:999, background:`${track.color}25`, color:track.color, letterSpacing:'0.04em' }}>EQ ON</span>}
                {crossfade > 0 && <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:999, background:'rgba(99,102,241,0.18)', color:'#a5b4fc', letterSpacing:'0.04em' }}>CF {crossfade}s</span>}
                {sleepTimer && <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:999, background:'rgba(251,191,36,0.15)', color:'#fbbf24', letterSpacing:'0.04em' }}>💤 {fmtSec(sleepTimer.remaining)}</span>}
              </div>

              {/* ── Unified search bar */}
              {(() => {
                const searchPlatforms = STREAMING_PLATFORMS.filter(p => ['ytmusic','soundcloud','spotify'].includes(p.id));
                const activePlat = searchPlatforms.find(p => p.id === unifiedPlatform) || searchPlatforms[0];
                const handleUnifiedSearch = () => {
                  if (!unifiedQuery.trim()) return;
                  if (unifiedPlatform === 'ytmusic') {
                    setYtQuery(p => ({...p, ytmusic: unifiedQuery}));
                    searchYouTube('ytmusic', unifiedQuery);
                  } else if (unifiedPlatform === 'soundcloud') {
                    const q = unifiedQuery.trim();
                    setScQuery(p => ({...p, soundcloud: q}));
                    if (q.includes('soundcloud.com/')) {
                      setScWidget(p => ({...p, soundcloud: q}));
                    } else if (scHasKey) {
                      doSoundCloudSearch('soundcloud', q);
                    } else {
                      setScWidget(p => ({...p, soundcloud: `https://soundcloud.com/search?q=${encodeURIComponent(q)}`}));
                    }
                  } else if (unifiedPlatform === 'spotify') {
                    setSpQuery(unifiedQuery);
                    doSpotifySearch(unifiedQuery);
                  }
                };
                return (
                  <div style={{ marginBottom:8 }}>
                    {/* Platform filter tabs */}
                    <div style={{ display:'flex', gap:5, marginBottom:7 }}>
                      {searchPlatforms.map(p => {
                        const isActive = unifiedPlatform === p.id;
                        return (
                          <button key={p.id} onClick={() => { setUnifiedPlatform(p.id); setUnifiedQuery(p.id==='ytmusic' ? (ytQuery['ytmusic']||'') : p.id==='soundcloud' ? (scQuery['soundcloud']||'') : p.id==='spotify' ? spQuery : ''); }}
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
                    const isSC = platform.embedType === 'soundcloud';
                    const isRedirect = platform.embedType === 'redirect';
                    const isSpotify = platform.embedType === 'spotify';
                    const isRadio = platform.embedType === 'radio';
                    const ytQ = ytQuery[platform.id] || '';
                    const scQ = scQuery[platform.id] || '';
                    const results = ytResults[platform.id] || [];
                    const loading = ytLoading[platform.id];
                    const error   = ytError[platform.id];
                    const activeWidget = scWidget[platform.id];
                    return (
                      <div key={platform.id} ref={platform.id === 'ytmusic' ? ytMusicSectionRef : null}
                        style={{ borderRadius:16, background:`${platform.color}0e`, border:`1px solid ${platform.color}30`, overflow:'hidden', display: (isYT||isSC||isSpotify) && unifiedPlatform !== platform.id ? 'none' : 'block' }}>
                        {/* ── Platform header */}
                        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px 8px' }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:`${platform.color}20`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                            <PlatformLogo id={platform.id} size={22}/>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontWeight:700, fontSize:13, color:'white' }}>{platform.name}</span>
                              {(isYT||isSC||isSpotify) && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:`${platform.color}25`, color:platform.color }}>IN-APP ▶</span>}
                              {isRadio && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:`${platform.color}25`, color:platform.color }}>● LIVE</span>}
                              {isRedirect && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:999, background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.35)' }}>REDIRECT ↗</span>}
                            </div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{platform.description}</div>
                          </div>
                          <button onClick={()=>openNewTab(platform.openUrl)} style={{ padding:'4px 8px', borderRadius:999, border:`1px solid ${platform.color}40`, background:'transparent', color:platform.color, fontSize:10, fontWeight:700, cursor:'pointer', flexShrink:0 }}>↗</button>
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
                            {/* Results — no thumbnail, cleaner list */}
                            {!loading && results.length > 0 && (
                              <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:4 }}>
                                {results.map((v, vi) => {
                                  const secs = v.duration || v.lengthSeconds || 0;
                                  const dur  = secs > 0 ? `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}` : '';
                                  const ch   = v.uploaderName || v.author || v.channel || 'YouTube';
                                  return (
                                    <div key={v.videoId || vi}
                                      style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
                                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,0,0,0.08)'}
                                      onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}>
                                      <div onClick={() => playYouTube(v, results, vi)} style={{ width:32, height:32, borderRadius:8, background:`${platform.color}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }}>
                                        <Play size={13} style={{ color:platform.color, marginLeft:2 }}/>
                                      </div>
                                      <div onClick={() => playYouTube(v, results, vi)} style={{ flex:1, minWidth:0, cursor:'pointer' }}>
                                        <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'rgba(255,255,255,0.9)' }}>{v.title}</div>
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

                        {/* ── SoundCloud: full in-app search + embed */}
                        {isSC && (
                          <div style={{ padding:'0 10px 10px' }}>
                            {/* Error */}
                            {scError[platform.id] && <div style={{ fontSize:11, color:'#fca5a5', marginTop:6, padding:'6px 10px', borderRadius:8, background:'rgba(239,68,68,0.1)' }}>{scError[platform.id]}</div>}

                            {/* Loading skeleton SoundCloud */}
                            {scLoading[platform.id] && (
                              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                                {[1,2,3].map(i => (
                                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,85,0,0.15)', flexShrink:0, animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.15}s` }}/>
                                    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
                                      <div style={{ height:10, borderRadius:6, background:'rgba(255,255,255,0.08)', width:`${70-i*8}%`, animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.15}s` }}/>
                                      <div style={{ height:8, borderRadius:6, background:'rgba(255,255,255,0.05)', width:'38%', animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.2}s` }}/>
                                    </div>
                                  </div>
                                ))}
                                <div style={{ textAlign:'center', paddingTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                  <Loader2 size={12} style={{ color:'rgba(255,85,0,0.7)', animation:'spin 0.8s linear infinite' }}/>
                                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{t?.searchingSc||'Searching SoundCloud…'}</span>
                                </div>
                              </div>
                            )}

                            {/* SoundCloud API results list */}
                            {!scLoading[platform.id] && (scResults[platform.id]||[]).length > 0 && (
                              <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:4 }}>
                                {(scResults[platform.id]).map((t, ti) => {
                                  const mins = Math.floor((t.duration||0)/60);
                                  const secs = String((t.duration||0)%60).padStart(2,'0');
                                  return (
                                    <div key={t.id||ti}
                                      style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer' }}
                                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,85,0,0.09)'}
                                      onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}>
                                      <div onClick={()=>setScWidget(p=>({...p,[platform.id]:t.permalinkUrl||t.streamUrl}))}
                                        style={{ width:32, height:32, borderRadius:8, background:`${platform.color}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                        <Play size={13} style={{ color:platform.color, marginLeft:2 }}/>
                                      </div>
                                      <div onClick={()=>setScWidget(p=>({...p,[platform.id]:t.permalinkUrl||t.streamUrl}))} style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'rgba(255,255,255,0.9)' }}>{t.title}</div>
                                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{t.artist}{t.duration ? ` · ${mins}:${secs}` : ''}</div>
                                      </div>

                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* SoundCloud embed widget — URL langsung atau hasil klik */}
                            {scWidget[platform.id] && (scWidget[platform.id].includes('soundcloud.com/')) && (
                              <div style={{ marginTop:8, borderRadius:10, overflow:'hidden', border:`1px solid ${platform.color}30` }}>
                                <iframe key={`sc-${scWidget[platform.id]}`}
                                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(scWidget[platform.id])}&color=%23ff5500&auto_play=true&buying=false&liking=false&download=false&sharing=false&show_artwork=true&show_comments=false&show_playcount=false&show_user=true&hide_related=true&visual=true`}
                                  width="100%" height="166" frameBorder="0" allow="autoplay"
                                  style={{ display:'block' }}/>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 10px', background:'rgba(0,0,0,0.35)' }}>
                                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>🔊 Putar embed SoundCloud</span>
                                  <button onClick={() => setScWidget(p=>({...p,[platform.id]:null}))}
                                    style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer' }}>{t?.closeBtn||'Close ✕'}</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── Spotify: search in-app + 30s preview + redirect */}
                        {isSpotify && (
                          <div style={{ padding:'0 10px 12px' }}>
                            {/* Error */}
                            {spError && <div style={{ fontSize:11, color:'#fca5a5', marginBottom:6, padding:'6px 10px', borderRadius:8, background:'rgba(239,68,68,0.1)' }}>{spError}</div>}

                            {/* Loading skeleton Spotify */}
                            {spLoading && (
                              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                                {[1,2,3,4].map(i => (
                                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 9px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ width:34, height:34, borderRadius:6, background:'rgba(29,185,84,0.15)', flexShrink:0, animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.12}s` }}/>
                                    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
                                      <div style={{ height:10, borderRadius:6, background:'rgba(255,255,255,0.08)', width:`${68-i*5}%`, animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.12}s` }}/>
                                      <div style={{ height:8, borderRadius:6, background:'rgba(255,255,255,0.05)', width:'35%', animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.18}s` }}/>
                                    </div>
                                    <div style={{ width:36, height:16, borderRadius:999, background:'rgba(29,185,84,0.12)', flexShrink:0, animation:'pulse 1.4s ease-in-out infinite', animationDelay:`${i*0.1}s` }}/>
                                  </div>
                                ))}
                                <div style={{ textAlign:'center', paddingTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                  <Loader2 size={12} style={{ color:'rgba(29,185,84,0.7)', animation:'spin 0.8s linear infinite' }}/>
                                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{t?.searchingSp||'Searching Spotify…'}</span>
                                </div>
                              </div>
                            )}

                            {/* Results list — search results */}
                            {!spLoading && spResults.length > 0 && (
                              <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:280, overflowY:'auto' }}>
                                {spResults.map(t => {
                                  const mins = Math.floor(t.duration/60000);
                                  const secs = String(Math.floor((t.duration%60000)/1000)).padStart(2,'0');
                                  const isActive = spTrack?.id === t.id;
                                  const hasPreview = !!t.previewUrl;
                                  return (
                                    <div key={t.id}
                                      style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 9px', borderRadius:10, background: isActive ? `${platform.color}18` : 'rgba(255,255,255,0.04)', border: isActive ? `1px solid ${platform.color}45` : '1px solid rgba(255,255,255,0.07)' }}
                                      onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='rgba(29,185,84,0.07)'; }}
                                      onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}>
                                      {/* Album art + play button */}
                                      <div style={{ position:'relative', flexShrink:0, cursor:'pointer' }} onClick={async () => {
                                        if (hasPreview) { playSpotifyPreview(t); return; }
                                        const q = `${t.title} ${t.artist} official audio`;
                                        setTab('player');
                                        try {
                                          let res = await searchViaPiped(q);
                                          if (!res || !res.length) res = await searchViaInvidious(q);
                                          if (res && res.length) playYouTube(res[0], res, 0);
                                        } catch { /* silent */ }
                                      }}>
                                        <img src={t.cover} alt={t.title} loading="lazy" decoding="async"
                                          style={{ width:36, height:36, borderRadius:6, objectFit:'cover', display:'block' }}
                                          onError={e => { e.target.style.display='none'; }}/>
                                        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', opacity: isActive ? 1 : 0 }}
                                          onMouseEnter={e=>e.currentTarget.style.opacity=1}
                                          onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.opacity=0; }}>
                                          {isActive && spPlaying
                                            ? <span style={{ fontSize:11, color:'white' }}>⏸</span>
                                            : hasPreview ? <Play size={12} style={{ color:'white', marginLeft:1 }}/> : <span style={{ fontSize:11 }}>↗</span>}
                                        </div>
                                      </div>
                                      {/* Title + artist */}
                                      <div onClick={async () => {
                                        if (hasPreview) { playSpotifyPreview(t); return; }
                                        const q = `${t.title} ${t.artist} official audio`;
                                        setTab('player');
                                        try {
                                          let res = await searchViaPiped(q);
                                          if (!res || !res.length) res = await searchViaInvidious(q);
                                          if (res && res.length) playYouTube(res[0], res, 0);
                                        } catch { /* silent */ }
                                      }} style={{ flex:1, minWidth:0, cursor:'pointer' }}>
                                        <div style={{ fontSize:12, fontWeight:600, color: isActive ? platform.color : 'rgba(255,255,255,0.88)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
                                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.38)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.artist}</div>
                                      </div>
                                      {/* Duration */}
                                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)', flexShrink:0 }}>{mins}:{secs}</div>
                                      {/* Preview badge */}
                                      {hasPreview
                                        ? <span style={{ fontSize:9, color:platform.color, background:`${platform.color}18`, padding:'2px 5px', borderRadius:4, flexShrink:0, fontWeight:700 }}>30s</span>
                                        : <span style={{ fontSize:9, color:'rgba(255,255,255,0.2)', flexShrink:0 }}>—</span>}
                                      {/* Cari via YouTube in-app */}
                                      <button onClick={e => { e.stopPropagation(); const q = `${t.title} ${t.artist}`; setYtQuery(p=>({...p,'ytmusic':q})); setTimeout(()=>{ searchYouTube('ytmusic', q); }, 100); }}
                                        title={t?.searchYtTitle||"Search on YouTube"}
                                        style={{ background:'none', border:`1px solid ${platform.color}40`, borderRadius:6, color:platform.color, fontSize:10, fontWeight:700, padding:'3px 7px', cursor:'pointer', flexShrink:0, lineHeight:1.2 }}>▶ YT</button>

                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Preview bar — shown when a track with preview is playing */}
                            {spTrack && spPlaying && (
                              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:10, background:`${platform.color}15`, border:`1px solid ${platform.color}35` }}>
                                <span style={{ fontSize:11 }}>🎵</span>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontSize:11, fontWeight:700, color:platform.color, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{spTrack.title}</div>
                                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)' }}>Preview 30 detik · {spTrack.artist}</div>
                                </div>
                                <button onClick={() => { setSpPlaying(false); if(spPreviewRef.current){spPreviewRef.current.pause();spPreviewRef.current=null;} }}
                                  style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', padding:0 }}>
                                  <X size={13}/>
                                </button>
                                <button onClick={() => { const rawUrl = spTrack.spotifyUrl; const embedUrl = rawUrl.replace('open.spotify.com/', 'open.spotify.com/embed/'); setSpEmbedUrl(embedUrl); }}
                                  style={{ padding:'4px 10px', borderRadius:999, border:'none', background:platform.color, color:'black', fontSize:10, fontWeight:800, cursor:'pointer', flexShrink:0 }}>
                                  Embed ▶
                                </button>
                              </div>
                            )}
                          {/* Spotify embed iframe — muncul saat ada spEmbedUrl */}
                          {spEmbedUrl && (
                            <div style={{ marginTop:10, borderRadius:10, overflow:'hidden', border:'1px solid rgba(29,185,84,0.3)' }}>
                              <iframe
                                key={`sp-embed-${spEmbedUrl}`}
                                src={`${spEmbedUrl}?utm_source=generator&theme=0`}
                                width="100%" height="152" frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                style={{ display:'block' }}
                              />
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 10px', background:'rgba(0,0,0,0.35)' }}>
                                <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>🟢 Spotify Embed</span>
                                <button onClick={() => setSpEmbedUrl(null)}
                                  style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer' }}>{t?.closeBtn||'Close ✕'}</button>
                              </div>
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
                              {/* In-app iframe embed */}
                              {iframeUrl && (
                                <div style={{ marginTop:8, borderRadius:10, overflow:'hidden', border:`1px solid ${platform.color}30` }}>
                                  <iframe
                                    key={`redirect-${platform.id}-${iframeUrl}`}
                                    src={iframeUrl}
                                    width="100%" height="340" frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media"
                                    style={{ display:'block', minHeight:340 }}
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                                  />
                                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 10px', background:'rgba(0,0,0,0.35)' }}>
                                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>🌐 {platform.name}</span>
                                    <button onClick={() => setPlatformIframe(p=>({...p,[platform.id]:null}))}
                                      style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer', flexShrink:0 }}>{t?.closeBtn||'Close ✕'}</button>
                                  </div>
                                </div>
                              )}
                              {!iframeUrl && (
                                <div style={{ marginTop:7, fontSize:10, color:'rgba(255,255,255,0.25)', paddingLeft:2 }}>
                                  Ketik nama lagu/artis lalu tekan Cari — hasilnya tampil di sini dalam app.
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
                              <div style={{ marginTop:8, fontSize:9, color:'rgba(255,255,255,0.18)', paddingLeft:2 }}>
                                {!selCountry ? 'Pilih negara untuk melihat genre & stasiun' : !selGenre ? 'Pilih genre untuk melihat stasiun' : 'Hanya stasiun yang dapat dijangkau yang ditampilkan'}
                              </div>
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
                            <button onClick={()=>{ setActivePl(pl.id); play(songs[0]); setTab('player'); }}
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
            {plView==='detail'&&activePl&&(()=>{
              // ── Special: Lagu Saya (Drive)
              if (activePl === 'my_songs') {
                const songs = filteredCustom;
                return (
                  <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
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
                      {songs.map((s,i)=><SongRow key={s.id} s={s} i={i} track={track} playing={playing} liked={liked} setLiked={setLiked} toggleFav={toggleFav} play={play} isDrive isCached={cachedDriveIds.has(s.driveId)} onRemove={id=>setCustomSongs(p=>p.filter(x=>x.id!==id))} playlists={playlists} addToPlaylist={addToPlaylist} isLite={isLite} t={t}/>)}
                    </div>
                  </div>
                );
              }

              // ── Special: Baru Dimainkan
              if (activePl === 'recently_played') {
                const songs = history.slice(1);
                return (
                  <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
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
                    <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
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
                          <button onClick={()=>{ play(songs[0]); setTab('player'); }}
                            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, border:'none', background:'#a78bfa', color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                            <Play size={13} fill="currentColor"/>{t?.playAllBtn||'Play All'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'10px 16px 16px', display:'flex', flexDirection:'column', gap:5 }}>
                      {songs.map((s,i)=><SongRow key={s.id} s={s} i={i} track={track} playing={playing} liked={liked} setLiked={setLiked} toggleFav={toggleFav} play={play} isDrive={s.isDrive} playlists={playlists} addToPlaylist={addToPlaylist} isLite={isLite} t={t}/>)}
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
                  <div style={{ padding:'12px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <button onClick={()=>setPlView('list')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4, display:'flex' }}>
                        <ChevronLeft size={20}/>
                      </button>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:800, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pl.name}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{songs.length} {t?.songsCount||'songs'}</div>
                      </div>
                      {songs.length>0&&(
                        <button onClick={()=>{ play(songs[0]); setTab('player'); }}
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

        {/* ─── AI TAB */}
        {tab==='ai'&&(
          <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>

            {/* ── AI Header: title + status + now playing */}
            <div style={{ padding:'14px 16px 0', flexShrink:0 }}>
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
              <div style={{ display:'flex', justifyContent:'center', gap:0, marginBottom:0, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { id:'chat', label:'💬 Chat' },
                  { id:'lyrics', label:`🎵 ${t?.lyricsTab||'Lyrics'}` },
                ].map(({id, label})=>(
                  <button key={id} onClick={()=>setAiSubView(id)}
                    style={{ padding:'9px 32px', borderRadius:0, border:'none', background:'none', color:aiSubView===id?'white':'rgba(255,255,255,0.4)', fontSize:13, fontWeight:aiSubView===id?800:600, cursor:'pointer', borderBottom:aiSubView===id?`2px solid ${track.color}`:'2px solid transparent', marginBottom:-1 }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat + Vibe result area OR Lyrics */}
            {aiSubView==='lyrics' ? (
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
              {/* Playback indicator + play/pause hint */}
              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                {playing
                  ? <div style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:14 }}>{[10,5,8].map((h,i)=>(<div key={i} style={{ width:3, height:h, background:embedTrack?'#ff4444':track.color, borderRadius:1, animation:`bounce 0.8s ease-in-out ${i*0.15}s infinite` }}/>))}</div>
                  : <div style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,0.2)' }}/>
                }
                <Compass size={14} style={{ color:'rgba(255,255,255,0.25)' }}/>
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

        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.9)}}
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


