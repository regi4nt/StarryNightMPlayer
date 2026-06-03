// ── reducers.js — useReducer untuk mengganti gugus useState yang sering berubah bersamaan
// Mengurangi jumlah re-render dengan menggabungkan update state yang terkait

// ─────────────────────────────────────────────
// 1. SEARCH REDUCER — YouTube, SoundCloud, Web Search, Spotify
// ─────────────────────────────────────────────
export const searchInitialState = {
  // YouTube
  ytQuery: {},
  ytResults: {},
  ytLoading: {},
  ytError: {},
  ytTrending: [],
  ytTrendingLoading: false,
  ytSearchMode: 'video',
  // SoundCloud
  scQuery: {},
  scResults: {},
  scLoading: {},
  scError: {},
  scWidget: {},
  // Web Search
  wsQuery: '',
  wsResults: [],
  wsLoading: false,
  wsError: null,
  wsEmbedUrl: null,
  spWsEmbedId: null,
  // Spotify
  spQuery: '',
  spResults: [],
  spLoading: false,
  spError: null,
  spTrack: null,
  spPlaying: false,
  spEmbedUrl: null,
  // Platform
  platformSearch: {},
  platformIframe: {},
  // Unified
  unifiedQuery: '',
  unifiedPlatform: 'ytmusic',
};

export function searchReducer(state, action) {
  switch (action.type) {
    // YouTube
    case 'YT_SET_QUERY':   return { ...state, ytQuery:   { ...state.ytQuery,   [action.id]: action.value } };
    case 'YT_SET_RESULTS': return { ...state, ytResults: { ...state.ytResults, [action.id]: action.value } };
    case 'YT_SET_LOADING': return { ...state, ytLoading: { ...state.ytLoading, [action.id]: action.value } };
    case 'YT_SET_ERROR':   return { ...state, ytError:   { ...state.ytError,   [action.id]: action.value } };
    case 'YT_SET_TRENDING':         return { ...state, ytTrending: action.value };
    case 'YT_SET_TRENDING_LOADING': return { ...state, ytTrendingLoading: action.value };
    case 'YT_SET_SEARCH_MODE':      return { ...state, ytSearchMode: action.value };
    case 'YT_SEARCH_START': return {
      ...state,
      ytLoading: { ...state.ytLoading, [action.id]: true },
      ytError:   { ...state.ytError,   [action.id]: null },
      ytResults: { ...state.ytResults, [action.id]: [] },
    };
    case 'YT_SEARCH_DONE': return {
      ...state,
      ytLoading: { ...state.ytLoading, [action.id]: false },
      ytResults: { ...state.ytResults, [action.id]: action.results },
    };
    case 'YT_SEARCH_ERROR': return {
      ...state,
      ytLoading: { ...state.ytLoading, [action.id]: false },
      ytError:   { ...state.ytError,   [action.id]: action.error },
    };

    // SoundCloud
    case 'SC_SET_QUERY':   return { ...state, scQuery:   { ...state.scQuery,   [action.id]: action.value } };
    case 'SC_SET_RESULTS': return { ...state, scResults: { ...state.scResults, [action.id]: action.value } };
    case 'SC_SET_LOADING': return { ...state, scLoading: { ...state.scLoading, [action.id]: action.value } };
    case 'SC_SET_ERROR':   return { ...state, scError:   { ...state.scError,   [action.id]: action.value } };
    case 'SC_SET_WIDGET':  return { ...state, scWidget:  { ...state.scWidget,  [action.id]: action.value } };

    // Web Search
    case 'WS_SEARCH_START': return { ...state, wsLoading: true, wsError: null, wsResults: [], wsEmbedUrl: null, spWsEmbedId: null };
    case 'WS_SEARCH_DONE':  return { ...state, wsLoading: false, wsResults: action.results };
    case 'WS_SEARCH_ERROR': return { ...state, wsLoading: false, wsError: action.error };
    case 'WS_SET_QUERY':    return { ...state, wsQuery: action.value };
    case 'WS_SET_RESULTS':  return { ...state, wsResults: action.value };
    case 'WS_SET_EMBED_URL':     return { ...state, wsEmbedUrl: action.value };
    case 'WS_SET_SP_EMBED_ID':   return { ...state, spWsEmbedId: action.value };

    // Spotify
    case 'SP_SEARCH_START': return { ...state, spLoading: true, spError: null };
    case 'SP_SEARCH_DONE':  return { ...state, spLoading: false, spResults: action.results };
    case 'SP_SEARCH_ERROR': return { ...state, spLoading: false, spError: action.error };
    case 'SP_SET_QUERY':    return { ...state, spQuery: action.value };
    case 'SP_SET_TRACK':    return { ...state, spTrack: action.value };
    case 'SP_SET_PLAYING':  return { ...state, spPlaying: action.value };
    case 'SP_SET_EMBED_URL':return { ...state, spEmbedUrl: action.value };

    // Platform
    case 'PLATFORM_SET_SEARCH':  return { ...state, platformSearch: { ...state.platformSearch, [action.id]: action.value } };
    case 'PLATFORM_SET_IFRAME':  return { ...state, platformIframe: { ...state.platformIframe, [action.id]: action.value } };

    // Unified
    case 'UNIFIED_SET_QUERY':    return { ...state, unifiedQuery: action.value };
    case 'UNIFIED_SET_PLATFORM': return { ...state, unifiedPlatform: action.value };

    default: return state;
  }
}

// ─────────────────────────────────────────────
// 2. RADIO REDUCER — Radio Browser, SomaFM, Garden, NTS
// ─────────────────────────────────────────────
export const radioInitialState = {
  radioStation: null,
  radioPlaying: false,
  radioCountry: null,
  radioGenre: null,
  stationStatus: {},
  // Radio Browser
  rbMode: 'browse',
  rbQuery: '',
  rbResults: [],
  rbLoading: false,
  rbError: null,
  rbTopTags: [],
  rbSelectedTag: null,
  rbBrowseStations: [],
  rbBrowseLoading: false,
  rbBrowseError: null,
  rbSource: 'radiobrowser',
  rbAiResults: [],
  rbAiLoading: false,
  // Multi-source
  somaChannels: [],
  gardenPlaces: [],
  gardenStations: [],
  gardenCountry: null,
  gardenBrowseStations: [],
  gardenBrowseLoading: false,
  gardenBrowseError: null,
  ntsShows: [],
  multiResults: [],
  multiLoading: false,
};

export function radioReducer(state, action) {
  switch (action.type) {
    case 'RADIO_SET_STATION':  return { ...state, radioStation: action.value, radioPlaying: action.playing ?? state.radioPlaying };
    case 'RADIO_SET_PLAYING':  return { ...state, radioPlaying: action.value };
    case 'RADIO_SET_COUNTRY':  return { ...state, radioCountry: action.value };
    case 'RADIO_SET_GENRE':    return { ...state, radioGenre: action.value };
    case 'RADIO_SET_STATION_STATUS': return { ...state, stationStatus: { ...state.stationStatus, [action.id]: action.status } };
    // Radio Browser
    case 'RB_SET_MODE':    return { ...state, rbMode: action.value };
    case 'RB_SET_QUERY':   return { ...state, rbQuery: action.value };
    case 'RB_SET_SOURCE':  return { ...state, rbSource: action.value };
    case 'RB_SET_TAG':     return { ...state, rbSelectedTag: action.value };
    case 'RB_SEARCH_START': return { ...state, rbLoading: true, rbError: null, rbResults: [] };
    case 'RB_SEARCH_DONE':  return { ...state, rbLoading: false, rbResults: action.results };
    case 'RB_SEARCH_ERROR': return { ...state, rbLoading: false, rbError: action.error };
    case 'RB_SET_TOP_TAGS': return { ...state, rbTopTags: action.value };
    case 'RB_BROWSE_START': return { ...state, rbBrowseLoading: true, rbBrowseError: null };
    case 'RB_BROWSE_DONE':  return { ...state, rbBrowseLoading: false, rbBrowseStations: action.stations };
    case 'RB_BROWSE_ERROR': return { ...state, rbBrowseLoading: false, rbBrowseError: action.error };
    case 'RB_AI_START': return { ...state, rbAiLoading: true, rbAiResults: [] };
    case 'RB_AI_DONE':  return { ...state, rbAiLoading: false, rbAiResults: action.results };
    // Multi-source
    case 'SOMA_SET_CHANNELS':       return { ...state, somaChannels: action.value };
    case 'GARDEN_SET_PLACES':       return { ...state, gardenPlaces: action.value };
    case 'GARDEN_SET_STATIONS':     return { ...state, gardenStations: action.value };
    case 'GARDEN_SET_COUNTRY':      return { ...state, gardenCountry: action.value };
    case 'GARDEN_BROWSE_START':     return { ...state, gardenBrowseLoading: true, gardenBrowseError: null };
    case 'GARDEN_BROWSE_DONE':      return { ...state, gardenBrowseLoading: false, gardenBrowseStations: action.stations };
    case 'GARDEN_BROWSE_ERROR':     return { ...state, gardenBrowseLoading: false, gardenBrowseError: action.error };
    case 'NTS_SET_SHOWS':           return { ...state, ntsShows: action.value };
    case 'MULTI_SEARCH_START':      return { ...state, multiLoading: true, multiResults: [] };
    case 'MULTI_SEARCH_DONE':       return { ...state, multiLoading: false, multiResults: action.results };
    default: return state;
  }
}

// ─────────────────────────────────────────────
// 3. PLAYER REDUCER — Track, Playing, Progress, Volume, Queue
// ─────────────────────────────────────────────
export const playerInitialState = {
  playing: false,
  progress: 0,
  duration: 0,
  muted: false,
  shuffle: false,
  repeatMode: 0, // 0=off, 1=all, 2=one
  loadingTrack: false,
  streamBuffering: false,
  driveDownProg: 0,
  drivePhase: 'idle',
  driveError: '',
  // Embed (YouTube/SoundCloud iframes)
  embedTrack: null,
  embedMinimized: false,
  ytProgress: 0,
  ytDuration: 0,
};

export function playerReducer(state, action) {
  switch (action.type) {
    case 'PLAYER_SET_PLAYING':       return { ...state, playing: action.value };
    case 'PLAYER_SET_PROGRESS':      return { ...state, progress: action.value };
    case 'PLAYER_SET_DURATION':      return { ...state, duration: action.value };
    case 'PLAYER_SET_MUTED':         return { ...state, muted: action.value };
    case 'PLAYER_SET_SHUFFLE':       return { ...state, shuffle: action.value };
    case 'PLAYER_SET_REPEAT':        return { ...state, repeatMode: action.value };
    case 'PLAYER_SET_LOADING':       return { ...state, loadingTrack: action.value };
    case 'PLAYER_SET_BUFFERING':     return { ...state, streamBuffering: action.value };
    case 'PLAYER_DRIVE_PROGRESS':    return { ...state, driveDownProg: action.value, drivePhase: action.phase ?? state.drivePhase };
    case 'PLAYER_DRIVE_ERROR':       return { ...state, driveError: action.value };
    case 'PLAYER_DRIVE_PHASE':       return { ...state, drivePhase: action.value };
    case 'PLAYER_EMBED_SET':         return { ...state, embedTrack: action.track, embedMinimized: false };
    case 'PLAYER_EMBED_MINIMIZE':    return { ...state, embedMinimized: action.value };
    case 'PLAYER_YT_PROGRESS':       return { ...state, ytProgress: action.progress, ytDuration: action.duration ?? state.ytDuration };
    case 'PLAYER_PLAY_STOP': return { ...state, playing: false, progress: 0, loadingTrack: false, streamBuffering: false };
    default: return state;
  }
}

// ─────────────────────────────────────────────
// 4. UI REDUCER — modals, tabs, settings visibility
// ─────────────────────────────────────────────
export const uiInitialState = {
  tab: 'player',
  showSettings: false,
  fullscreen: false,
  showUpload: false,
  showQueue: false,
  showShareMenu: false,
  shareCopied: false,
  showCoverPicker: false,
  showPlModal: false,
  showAddToModal: false,
  showMicMenu: false,
  aiSubView: 'chat',
  otherInnerTab: 'pref',
  searchQuery: '',
  plView: 'list',
  mySongsEditMode: false,
  allSongsEditMode: false,
  plSongsEditMode: false,
};

export function uiReducer(state, action) {
  switch (action.type) {
    case 'UI_SET_TAB':          return { ...state, tab: action.value };
    case 'UI_SET_SETTINGS':     return { ...state, showSettings: action.value };
    case 'UI_SET_FULLSCREEN':   return { ...state, fullscreen: action.value };
    case 'UI_SET_UPLOAD':       return { ...state, showUpload: action.value };
    case 'UI_SET_QUEUE':        return { ...state, showQueue: action.value };
    case 'UI_SET_SHARE_MENU':   return { ...state, showShareMenu: action.value };
    case 'UI_SET_SHARE_COPIED': return { ...state, shareCopied: action.value };
    case 'UI_SET_COVER_PICKER': return { ...state, showCoverPicker: action.value };
    case 'UI_SET_PL_MODAL':     return { ...state, showPlModal: action.value };
    case 'UI_SET_ADD_TO_MODAL': return { ...state, showAddToModal: action.value };
    case 'UI_SET_MIC_MENU':     return { ...state, showMicMenu: action.value };
    case 'UI_SET_AI_SUB_VIEW':  return { ...state, aiSubView: action.value };
    case 'UI_SET_OTHER_TAB':    return { ...state, otherInnerTab: action.value };
    case 'UI_SET_SEARCH_QUERY': return { ...state, searchQuery: action.value };
    case 'UI_SET_PL_VIEW':      return { ...state, plView: action.value };
    case 'UI_SET_MY_SONGS_EDIT':  return { ...state, mySongsEditMode: action.value };
    case 'UI_SET_ALL_SONGS_EDIT': return { ...state, allSongsEditMode: action.value };
    case 'UI_SET_PL_SONGS_EDIT':  return { ...state, plSongsEditMode: action.value };
    // Close all modals at once (navigation, back button, etc)
    case 'UI_CLOSE_ALL_MODALS': return {
      ...state,
      showSettings: false, showUpload: false, showQueue: false,
      showShareMenu: false, showCoverPicker: false, showPlModal: false,
      showAddToModal: false, showMicMenu: false,
    };
    default: return state;
  }
}

// ─────────────────────────────────────────────
// 5. LYRICS REDUCER — lyrics, translation, romanization
// ─────────────────────────────────────────────
export const lyricsInitialState = {
  lyrics: '',
  lyricsLoading: false,
  lyricsTranslation: '',
  lyricsTranslating: false,
  lyricsGenerated: false,
  lyricsNeedGenerate: false,
  lyricsGenerating: false,
  lyricsRomanized: '',
  lyricsRomanizing: false,
  romanizedLrcLines: [],
  lrcLines: [],
  captionTick: 0,
};

export function lyricsReducer(state, action) {
  switch (action.type) {
    case 'LYRICS_SET':             return { ...state, lyrics: action.value, lyricsLoading: false, lyricsGenerated: false };
    case 'LYRICS_LOADING':         return { ...state, lyricsLoading: action.value };
    case 'LYRICS_RESET':           return { ...lyricsInitialState };
    case 'LYRICS_NEED_GENERATE':   return { ...state, lyricsNeedGenerate: action.value };
    case 'LYRICS_GENERATING':      return { ...state, lyricsGenerating: action.value };
    case 'LYRICS_GENERATED':       return { ...state, lyrics: action.value, lyricsGenerated: true, lyricsGenerating: false, lyricsNeedGenerate: false };
    case 'LYRICS_TRANSLATION_SET': return { ...state, lyricsTranslation: action.value, lyricsTranslating: false };
    case 'LYRICS_TRANSLATING':     return { ...state, lyricsTranslating: action.value };
    case 'LYRICS_ROMANIZED_SET':   return { ...state, lyricsRomanized: action.value, lyricsRomanizing: false };
    case 'LYRICS_ROMANIZING':      return { ...state, lyricsRomanizing: action.value };
    case 'LYRICS_SET_LRC_LINES':   return { ...state, lrcLines: action.value };
    case 'LYRICS_SET_ROMANIZED_LRC': return { ...state, romanizedLrcLines: action.value };
    case 'LYRICS_CAPTION_TICK':    return { ...state, captionTick: state.captionTick + 1 };
    default: return state;
  }
}
