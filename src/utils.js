// ═══════════════════════════════════════════════════════
//  utils.js — Shared lightweight utilities
//
//  WHY THIS FILE EXISTS:
//  constants.js is inlined into the main index chunk by Rollup.
//  Lazy-loaded components (SongRow, SettingsPanel, UploadModal, Player)
//  also need a few small exports from constants. If they import directly
//  from constants.js they end up importing from the main index chunk,
//  creating a circular chunk reference:
//
//    index chunk  →  lazy-loads SongRow
//    SongRow      →  static import from index chunk   ← circular!
//
//  When the lazy chunk executes its static import, the index chunk's
//  `const` bindings may not yet be initialized → TDZ ReferenceError.
//
//  Solution: put the shared small utilities here in their own file.
//  Rollup places this in its own small chunk with NO imports from index.
//  Both the main chunk and lazy chunks can safely import from it.
//
//  constants.js re-exports everything from here so App.jsx imports
//  stay unchanged.
// ═══════════════════════════════════════════════════════

// ── Time formatting ──────────────────────────────────────────────────────────
export const fmt = t => {
  if (!t || isNaN(t)) return '0:00';
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
};

export const fmtSec = s => {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

// ── Sleep timer options ──────────────────────────────────────────────────────
export const SLEEP_OPTIONS = [
  { label:'5 menit',  min:5  },
  { label:'10 menit', min:10 },
  { label:'15 menit', min:15 },
  { label:'30 menit', min:30 },
  { label:'45 menit', min:45 },
  { label:'1 jam',    min:60 },
];

// ── Common button base style ─────────────────────────────────────────────────
export const btn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'rgba(255,255,255,0.5)', padding: 8, display: 'flex', borderRadius: 8,
};

// ── Phone device detection ───────────────────────────────────────────────────
export function isPhoneDevice() {
  const ua = navigator.userAgent;
  const isMobileUA = /android|iphone|ipod|blackberry|windows phone/i.test(ua);
  const isTabletUA = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
  const smallScreen = Math.min(window.screen.width, window.screen.height) < 500;
  return (isMobileUA && !isTabletUA) || smallScreen;
}

// ── Download helpers ─────────────────────────────────────────────────────────
export async function downloadToDevice(url, filename, headers = {}) {
  const hasCustomHeaders = Object.keys(headers).length > 0;

  const triggerBlobDownload = (blob) => {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  if (!hasCustomHeaders) {
    // Attempt 1: direct fetch with CORS
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 500) { triggerBlobDownload(blob); return; }
      }
    } catch { /* CORS or network error — try proxy */ }

    // Attempt 2: server-side proxy (overcomes CORS)
    if (url.startsWith('https://')) {
      try {
        const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 500) { triggerBlobDownload(blob); return; }
        }
      } catch { /* proxy failed — fall back to anchor */ }
    }

    // Attempt 3: anchor[download] directly — only works same-origin or
    // when server sends Content-Disposition: attachment.
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    return;
  }

  // Has custom headers (e.g. Drive API): must go through fetch
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  triggerBlobDownload(blob);
}

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
