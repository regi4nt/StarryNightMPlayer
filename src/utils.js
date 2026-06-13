// ── utils.js — small standalone utilities used by lazy-loaded components
//
// PENTING: File ini TIDAK boleh mengimport dari constants.js atau modul src lainnya.
// Tujuannya memutus circular chunk dependency:
//   index chunk → (lazy) SettingsPanel/SongRow/UploadModal chunk → index chunk (via constants)
// Dengan memindahkan utility kecil ke sini, lazy chunks mengimport dari utils chunk
// (bukan dari index chunk), sehingga tidak ada circular reference antar chunk.

// ── Sleep timer options ────────────────────────────────────────────────────
export const SLEEP_OPTIONS = [
  { label:'5 menit',  min:5  },
  { label:'10 menit', min:10 },
  { label:'15 menit', min:15 },
  { label:'30 menit', min:30 },
  { label:'45 menit', min:45 },
  { label:'1 jam',    min:60 },
];

// ── Format seconds to mm:ss ────────────────────────────────────────────────
export const fmtSec = s => {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

// ── Format time in seconds to m:ss ────────────────────────────────────────
export const fmt = t => {
  if (!t || isNaN(t)) return '0:00';
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
};

// ── Base button style ──────────────────────────────────────────────────────
export const btn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.5)',
  padding: 8,
  display: 'flex',
  borderRadius: 8,
};

// ── Download a URL to the user's device ───────────────────────────────────
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
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 500) { triggerBlobDownload(blob); return; }
      }
    } catch { /* CORS atau network error — coba proxy */ }

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

    const a = document.createElement('a');
    a.href = url; a.download = filename; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    return;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  triggerBlobDownload(blob);
}
