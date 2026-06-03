// ── useMemoizedValues.js — kumpulan useMemo untuk nilai turunan yang mahal
// Mencegah kalkulasi ulang array besar setiap render
import { useMemo } from 'react';

/**
 * allSongs — gabungan builtinSongs + customSongs + ytSongs + favSongs
 * Di-recompute HANYA jika salah satu sumber berubah.
 */
export function useAllSongs({ builtinSongs, customSongs, ytSongs, favSongs }) {
  return useMemo(
    () => [...builtinSongs, ...customSongs, ...ytSongs, ...favSongs],
    [builtinSongs, customSongs, ytSongs, favSongs]
  );
}

/**
 * allSongIds — Set id dari semua lagu, untuk O(1) lookup "apakah sudah ada?"
 */
export function useAllSongIds({ customSongs, favSongs, ytSongs }) {
  return useMemo(
    () => new Set([
      ...customSongs.map(s => s.id),
      ...favSongs.map(s => s.id),
      ...ytSongs.map(s => s.id),
    ]),
    [customSongs, favSongs, ytSongs]
  );
}

/**
 * displayedSongs — lagu yang ditampilkan di tab Library/Playlist setelah filter aktif
 */
export function useDisplayedSongs({ allSongs, activePl, playlists, customSongs, favSongs, history, searchQuery }) {
  return useMemo(() => {
    let songs;
    if (!activePl) {
      songs = allSongs;
    } else if (activePl === 'my_songs') {
      songs = [...customSongs, ...favSongs.filter(s => !customSongs.find(c => c.id === s.id))];
    } else if (activePl === 'recently_played') {
      songs = history.slice(0, 50).map(id => allSongs.find(s => s.id === id)).filter(Boolean);
    } else {
      const pl = playlists.find(p => p.id === activePl);
      if (pl) {
        const favIds = new Set(favSongs.map(s => s.id));
        songs = (pl.songIds || [])
          .map(id => allSongs.find(s => s.id === id))
          .filter(Boolean)
          .map(s => ({ ...s, inFav: favIds.has(s.id) }));
      } else {
        songs = allSongs;
      }
    }

    if (!searchQuery) return songs;
    const q = searchQuery.toLowerCase();
    return songs.filter(s =>
      (s.title || '').toLowerCase().includes(q) ||
      (s.artist || '').toLowerCase().includes(q) ||
      (s.album || '').toLowerCase().includes(q)
    );
  }, [allSongs, activePl, playlists, customSongs, favSongs, history, searchQuery]);
}

/**
 * filteredPlaylists — playlists tanpa playlist favorit internal
 */
export function useFilteredPlaylists({ playlists, plGlobalSearch }) {
  return useMemo(() => {
    const nonFav = playlists.filter(pl => pl.id !== 'pl_fav');
    if (!plGlobalSearch) return nonFav;
    const q = plGlobalSearch.toLowerCase();
    return nonFav.filter(pl => pl.name.toLowerCase().includes(q));
  }, [playlists, plGlobalSearch]);
}

/**
 * cachedSet — convert cachedDriveIds/cachedYtIds/cachedFavIds dari array ke Set
 * agar pengecekan .has(id) O(1) di SongRow
 */
export function useCachedIdSets({ cachedDriveIds, cachedYtIds, cachedFavIds }) {
  const driveSet = useMemo(() => new Set(cachedDriveIds), [cachedDriveIds]);
  const ytSet    = useMemo(() => new Set(cachedYtIds),    [cachedYtIds]);
  const favSet   = useMemo(() => new Set(cachedFavIds),   [cachedFavIds]);
  return { driveSet, ytSet, favSet };
}

/**
 * wsAudioItems — item web search yang punya audioUrl (untuk player audio inline)
 */
export function useWsAudioItems(wsResults) {
  return useMemo(
    () => wsResults.filter(it => it.audioUrl && ['jamendo', 'ccmixter', 'audius'].includes(it.source)),
    [wsResults]
  );
}

/**
 * sortedWsResults — web search results sorted: audio first, then by source
 */
export function useSortedWsResults(wsResults) {
  return useMemo(() => {
    if (!wsResults.length) return wsResults;
    return [...wsResults].sort((a, b) => {
      const aHasAudio = a.audioUrl ? 1 : 0;
      const bHasAudio = b.audioUrl ? 1 : 0;
      return bHasAudio - aHasAudio;
    });
  }, [wsResults]);
}

/**
 * rbMergedResults — gabungan multi-source + rbResults untuk tampilan radio
 */
export function useRbMergedResults({ multiResults, rbResults, rbSource }) {
  return useMemo(() => {
    if (rbSource !== 'all' || !multiResults.length) return rbResults;
    const multiIds = new Set(multiResults.map(s => s.id));
    const rbOnly = rbResults
      .map(s => ({ ...s, sourceLabel: 'RadioBrowser' }))
      .filter(s => !multiIds.has(`soma_${s.stationuuid}`) && !multiIds.has(s.stationuuid));
    return [...multiResults, ...rbOnly];
  }, [multiResults, rbResults, rbSource]);
}
