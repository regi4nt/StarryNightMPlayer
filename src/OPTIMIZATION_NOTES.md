# Catatan Optimasi StarryNight MPlayer

## File Baru yang Ditambahkan

### `src/reducers.js`
Menggantikan **70+ useState** yang sering berubah bersamaan dengan 5 useReducer:

| Reducer | Mengelola | useState Digantikan |
|---------|-----------|-------------------|
| `searchReducer` | YT, SC, WebSearch, Spotify, Platform, Unified | ~28 state |
| `radioReducer` | RadioBrowser, SomaFM, Garden, NTS, MultiSearch | ~22 state |
| `playerReducer` | Playing, Progress, Duration, Embed, Drive | ~14 state |
| `uiReducer` | Modals, Tabs, EditModes, Views | ~15 state |
| `lyricsReducer` | Lyrics, Translation, Romanization, LRC | ~11 state |

**Cara pakai di App.jsx:**
```js
// Sebelum:
const [rbLoading, setRbLoading] = useState(false);
const [rbError, setRbError] = useState(null);
const [rbResults, setRbResults] = useState([]);
// → 3 re-render terpisah saat search

// Sesudah:
const [radio, dispatchRadio] = useReducer(radioReducer, radioInitialState);
dispatchRadio({ type: 'RB_SEARCH_DONE', results: data });
// → 1 re-render saja!
```

### `src/useMemoizedValues.js`
Menambahkan **useMemo** untuk nilai turunan yang mahal:

- `useAllSongs()` — gabungan builtinSongs + customSongs + ytSongs + favSongs
- `useAllSongIds()` — Set id untuk O(1) lookup
- `useDisplayedSongs()` — filter + sort songs berdasarkan playlist aktif & query
- `useFilteredPlaylists()` — filter playlists tanpa pl_fav
- `useCachedIdSets()` — convert array cachedIds ke Set
- `useWsAudioItems()` — filter wsResults yang punya audioUrl
- `useSortedWsResults()` — sort wsResults audio-first
- `useRbMergedResults()` — merge multi-source radio results

**Cara pakai di App.jsx:**
```js
// Sebelum (dieksekusi SETIAP render):
const wsAudioItems = wsResults.filter(it => it.audioUrl && ['jamendo','ccmixter','audius'].includes(it.source));
const sortedResults = [...wsResults].sort((a, b) => ...);

// Sesudah (hanya dieksekusi saat wsResults berubah):
const wsAudioItems = useWsAudioItems(wsResults);
const sortedResults = useSortedWsResults(wsResults);
```

### `src/streamingPlatforms.js`
Memisahkan **STREAMING_PLATFORMS** (60KB, 609 baris) dari constants.js.

**Cara pakai di App.jsx:**
```js
// Sebelum (dimuat saat startup):
import { STREAMING_PLATFORMS } from './constants.js';

// Sesudah (dimuat saat tab Streaming pertama dibuka):
import { getStreamingPlatforms, getStreamingPlatformsSync } from './constants.js';

// Di useEffect saat tab dibuka:
useEffect(() => {
  if (tab === 'stream') {
    getStreamingPlatforms(); // mulai load jika belum
  }
}, [tab]);

// Di JSX (gunakan sync accessor):
const platforms = getStreamingPlatformsSync();
```

## Dampak Performa yang Diharapkan

| Metrik | Sebelum | Sesudah |
|--------|---------|---------|
| Initial JS load | ~788KB App.jsx + 152KB constants | ~728KB App.jsx + 92KB constants |
| constants.js chunk | dimuat saat startup | dikurangi 60KB (streamingPlatforms lazy) |
| Re-render saat search | 3-5x per operasi | 1x per operasi (batched reducer) |
| Derived value recalc | setiap render | hanya saat dependency berubah |
| Array filter (345 calls) | tiap render | di-memo, hanya saat data berubah |

## Cara Integrasi ke App.jsx

Karena App.jsx sangat besar (11.716 baris), integrasi dilakukan bertahap:

### Tahap 1 — Import (sudah dilakukan)
```js
// Di baris 1 App.jsx — sudah ditambahkan:
import { useReducer, useMemo } from 'react';
import { searchReducer, ... } from './reducers.js';
import { useAllSongs, ... } from './useMemoizedValues.js';
```

### Tahap 2 — Ganti useState dengan useReducer (manual)
Contoh penggantian untuk search state:
```js
// HAPUS semua ini (~28 baris):
const [ytQuery, setYtQuery] = useState({});
const [ytResults, setYtResults] = useState({});
// ... dst

// GANTI DENGAN:
const [search, dispatchSearch] = useReducer(searchReducer, searchInitialState);
const { ytQuery, ytResults, ytLoading, ... } = search;
```

### Tahap 3 — Ganti setXxx dengan dispatch (manual)
```js
// SEBELUM:
setYtLoading(p => ({...p, [id]: true}));
setYtError(p => ({...p, [id]: null}));
setYtResults(p => ({...p, [id]: []}));

// SESUDAH (1 dispatch = 1 re-render):
dispatchSearch({ type: 'YT_SEARCH_START', id });
```

### Tahap 4 — Tambah useMemo hooks (manual)
```js
// Tambahkan setelah semua state declarations:
const allSongs = useAllSongs({ builtinSongs, customSongs, ytSongs, favSongs });
const wsAudioItems = useWsAudioItems(search.wsResults);
// ... dst

// Hapus inline filter/map yang redundan dari JSX
```
