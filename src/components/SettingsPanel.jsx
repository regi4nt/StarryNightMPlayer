import React, { useState, useRef, useEffect } from 'react';
import { Moon, Music, SlidersHorizontal, Zap, Bot, History, Radio, RotateCcw, Lock } from 'lucide-react';
import { SLEEP_OPTIONS, fmtSec } from '../constants.js';

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
              <div style={{ fontWeight:800, fontSize:15, color:'#fca5a5', marginBottom:6 }}>Settings failed to load</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:20 }}>
                {String(this.state.error?.message || 'Unknown error')}
              </div>
              <button onClick={()=>{ this.setState({hasError:false,error:null}); this.props.onClose(); }}
                style={{ padding:'10px 24px', borderRadius:12, border:'none', background:'rgba(239,68,68,0.25)', color:'#fca5a5', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                Close
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
          <div style={{ fontWeight:800, fontSize:15, color:'#fca5a5', marginBottom:8 }}>Failed to load playlist</div>
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

// ── CacheManager: sub-komponen terpisah agar hooks tidak dipanggil di dalam IIFE
function CacheManager({ lang, t }) {
  const [cacheInfo, setCacheInfo] = React.useState(null);
  const [clearing, setClearing] = React.useState(false);
  const [cleared, setCleared] = React.useState(false);
  const [clearDone, setClearDone] = React.useState(false);

  React.useEffect(() => {
    async function loadCacheInfo() {
      try {
        let driveCount = 0, ytCount = 0, totalBytes = 0;
        if ('caches' in window) {
          try {
            const driveCache = await caches.open('sn-drive-v1');
            const driveKeys = await driveCache.keys();
            driveCount = driveKeys.length;
            // Gunakan Content-Length header (cepat di mobile, tidak perlu download blob penuh)
            for (const req of driveKeys) {
              const res = await driveCache.match(req);
              if (res) {
                const cl = res.headers.get('content-length');
                if (cl) totalBytes += parseInt(cl, 10);
                else { try { const b = await res.blob(); totalBytes += b.size; } catch(e) {} }
              }
            }
          } catch(e) {}
          try {
            const ytCache = await caches.open('sn-yt-v1');
            const ytKeys = await ytCache.keys();
            ytCount = ytKeys.length;
            for (const req of ytKeys) {
              const res = await ytCache.match(req);
              if (res) {
                const cl = res.headers.get('content-length');
                if (cl) totalBytes += parseInt(cl, 10);
                else { try { const b = await res.blob(); totalBytes += b.size; } catch(e) {} }
              }
            }
          } catch(e) {}
        }
        // Hitung localStorage keys sn_ (YT & Drive cached IDs)
        let lsCount = 0;
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('sn_')) lsCount++;
          }
        } catch(e) {}
        // Hitung jumlah cookie aktif
        const cookieCount = document.cookie ? document.cookie.split(';').filter(c => c.trim()).length : 0;
        setCacheInfo({ driveCount, ytCount, totalMB: (totalBytes / 1024 / 1024).toFixed(1), cookieCount, lsCount });
      } catch(e) {
        setCacheInfo({ driveCount: 0, ytCount: 0, totalMB: '0.0', cookieCount: 0, lsCount: 0 });
      }
    }
    loadCacheInfo();
  }, [cleared]);

  const handleClearCache = async () => {
    setClearing(true);
    try {
      // 1. Hapus Cache API (audio drive & YouTube)
      if ('caches' in window) {
        try { await caches.delete('sn-drive-v1'); } catch(e) {}
        try { await caches.delete('sn-yt-v1'); } catch(e) {}
      }
      // 2. Hapus in-memory blob cache
      try {
        if (window._snBlobCacheRef) {
          for (const v of window._snBlobCacheRef.values()) URL.revokeObjectURL(v);
          window._snBlobCacheRef.clear();
        }
      } catch(e) {}
      // 3. Hapus localStorage keys milik StarryNight (prefix sn_)
      try {
        const snKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('sn_')) snKeys.push(k);
        }
        snKeys.forEach(k => { try { localStorage.removeItem(k); } catch(e) {} });
      } catch(e) {}
      // 4. Hapus semua cookie untuk domain ini
      try {
        const cookies = document.cookie.split(';');
        const hostname = window.location.hostname;
        const domainParts = hostname.split('.');
        // Coba hapus dengan berbagai kombinasi domain (termasuk subdomain)
        const domains = [
          hostname,
          ...domainParts.slice(1).map((_, i) => '.' + domainParts.slice(i + 1).join('.')).filter(d => d.length > 1),
          ''
        ];
        const paths = ['/', '/api', ''];
        for (const cookie of cookies) {
          const name = cookie.split('=')[0].trim();
          if (!name) continue;
          for (const domain of domains) {
            for (const path of paths) {
              const domainAttr = domain ? `;domain=${domain}` : '';
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}${domainAttr}`;
            }
          }
        }
        // Coba juga via cookieStore API (Chrome 87+) untuk cookie HttpOnly sekalipun dapat dihapus
        if (window.cookieStore) {
          try {
            const all = await window.cookieStore.getAll();
            await Promise.allSettled(all.map(c => window.cookieStore.delete({ name: c.name, path: c.path || '/' })));
          } catch(e) {}
        }
      } catch(e) {}
      setCleared(c => !c);
      setClearDone(true);
      setTimeout(() => setClearDone(false), 2500);
    } catch(e) {}
    setClearing(false);
  };

  const hasCache = cacheInfo && (cacheInfo.driveCount > 0 || cacheInfo.ytCount > 0 || cacheInfo.cookieCount > 0 || cacheInfo.lsCount > 0);

  return (
    <div style={{ padding:'16px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <span style={{ fontSize:16 }}>🗑️</span>
        <div>
          <div style={{ fontWeight:800, fontSize:14 }}>{t?.clearCache||'Clear Cache & Cookies'}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>
            {lang==='id' ? t?.clearCacheDesc||'Free up storage from saved audio & cookies' : 'Free up storage from saved audio & cookies'}
          </div>
        </div>
      </div>
      {cacheInfo === null ? (
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', padding:'8px 0' }}>
          {t?.calculatingCache||'Calculating cache...'}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ padding:'10px 14px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {cacheInfo.driveCount > 0 && (
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>
                  🎵 Drive: <span style={{ color:'rgba(255,255,255,0.75)', fontWeight:600 }}>{cacheInfo.driveCount} {t?.cacheCountSongs||'songs'}</span>
                </div>
              )}
              {cacheInfo.ytCount > 0 && (
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>
                  ▶️ YouTube: <span style={{ color:'rgba(255,255,255,0.75)', fontWeight:600 }}>{cacheInfo.ytCount} {t?.cacheCountSongs||'songs'}</span>
                </div>
              )}
              {cacheInfo.cookieCount > 0 && (
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>
                  🍪 Cookie: <span style={{ color:'rgba(255,255,255,0.75)', fontWeight:600 }}>{cacheInfo.cookieCount} {t?.cacheCountItems||'items'}</span>
                </div>
              )}
              {cacheInfo.lsCount > 0 && (
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>
                  💾 Storage: <span style={{ color:'rgba(255,255,255,0.75)', fontWeight:600 }}>{cacheInfo.lsCount} {t?.cacheCountEntries||'entries'}</span>
                </div>
              )}
              {!hasCache && (
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>
                  {t?.noCacheStored||'No cache or cookies stored'}
                </div>
              )}
            </div>
            {hasCache && (
              <div style={{ fontSize:13, fontWeight:700, color:'#a5b4fc' }}>{cacheInfo.totalMB} MB</div>
            )}
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearing || !hasCache}
            style={{
              width:'100%', padding:'11px 0', borderRadius:12, border:'none',
              background: clearDone
                ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                : hasCache
                  ? (clearing ? 'rgba(239,68,68,0.4)' : 'linear-gradient(135deg,#ef4444,#dc2626)')
                  : 'rgba(255,255,255,0.06)',
              color: hasCache ? 'white' : 'rgba(255,255,255,0.25)',
              fontSize:13, fontWeight:800, cursor: hasCache ? 'pointer' : 'default',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'all 0.3s'
            }}
          >
            <span style={{ fontSize:14 }}>{clearing ? '⏳' : clearDone ? '✅' : '🗑️'}</span>
            {clearing
              ? (t?.clearingCache||'Clearing...')
              : clearDone
                ? (t?.cacheCleared||'Cache & Cookies Cleared!')
                : (t?.clearAllCache||'Clear All Cache & Cookies')}
          </button>
        </div>
      )}
    </div>
  );
}

function SettingsPanelInner({ onClose, color, sleepTimer, startSleepTimer, cancelSleepTimer, globalCover, setGlobalCover, isLite, toggleMode, pwaPrompt, pwaInstalled, installPwa, customDns, setCustomDns, lang, toggleLang, t, userSpId, setUserSpId, userSpSecret, setUserSpSecret, userScId, setUserScId, userAiKey, setUserAiKey, userYtKey, setUserYtKey, userCfKey, setUserCfKey, userSnKey, setUserSnKey, setTab, setFullscreen }) {
  const coverRef = useRef(null);
  const [apiKeyTab, setApiKeyTab] = React.useState('spotify');
  // Local state untuk DNS input agar tidak terganggu re-render parent
  const [localDns, setLocalDns] = React.useState(customDns);
  // Sync dari parent hanya saat customDns berubah via preset (bukan saat user ketik)
  const prevDnsRef = React.useRef(customDns);
  React.useEffect(() => {
    if (customDns !== prevDnsRef.current) {
      setLocalDns(customDns);
      prevDnsRef.current = customDns;
    }
  }, [customDns]);
  return (
    <div style={{ position:'absolute', inset:0, zIndex:150, background:'rgba(0,0,0,0.6)', ...(isLite?{}:{backdropFilter:'blur(4px)'}), display:'flex', alignItems:'stretch' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="scrollbar-hide" style={{ width:'100%', height:'100%', overflowY:'auto', overflowX:'hidden', background:'#0d0d24', border:'none', borderRadius:0, padding:'0 0 env(safe-area-inset-bottom, 24px)' }}>
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

                  const MAX_BYTES = 1_048_576; // 1 MB

                  const saveDataUrl = (dataUrl) => {
                    setGlobalCover(dataUrl);
                    try {
                      localStorage.setItem('sn_global_cover', dataUrl);
                    } catch (err) {
                      console.warn('[SettingsPanel] Gagal simpan cover ke localStorage:', err);
                    }
                  };

                  // Jika sudah <= 1 MB, langsung pakai tanpa kompresi
                  if (f.size <= MAX_BYTES) {
                    const reader = new FileReader();
                    reader.onload = ev => saveDataUrl(ev.target.result);
                    reader.readAsDataURL(f);
                    return;
                  }

                  // Gambar > 1 MB: compress via Canvas
                  const img = new Image();
                  const objectUrl = URL.createObjectURL(f);
                  img.onload = () => {
                    URL.revokeObjectURL(objectUrl);
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    // Turunkan dimensi ke max 1200px proporsional
                    const MAX_DIM = 1200;
                    if (width > MAX_DIM || height > MAX_DIM) {
                      const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
                      width = Math.round(width * ratio);
                      height = Math.round(height * ratio);
                    }

                    let quality = 0.85;
                    let dataUrl = '';

                    // Loop: turunkan kualitas lalu dimensi sampai raw bytes <= 1 MB
                    for (let attempt = 0; attempt < 8; attempt++) {
                      canvas.width = width;
                      canvas.height = height;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(img, 0, 0, width, height);
                      dataUrl = canvas.toDataURL('image/jpeg', quality);
                      const b64 = dataUrl.split(',')[1] || '';
                      const rawBytes = b64.length * 0.75;
                      if (rawBytes <= MAX_BYTES) break;
                      if (quality > 0.4) {
                        quality -= 0.1;
                      } else {
                        width = Math.round(width * 0.8);
                        height = Math.round(height * 0.8);
                        quality = 0.7;
                      }
                    }

                    saveDataUrl(dataUrl);
                  };
                  img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    alert('Gagal membaca gambar. Silakan coba file lain.');
                  };
                  img.src = objectUrl;
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

        {/* ── ROTATE DEVICE */}
        <div style={{ padding:'16px 18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:16 }}>📱</span>
            <div>
              <div style={{ fontWeight:800, fontSize:14 }}>Rotasi Layar</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Paksa orientasi layar landscape atau portrait</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button
              onClick={async () => {
                // Coba Screen Orientation API (butuh fullscreen/PWA)
                try {
                  if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen().catch(()=>{});
                  if (screen.orientation?.lock) {
                    await screen.orientation.lock('landscape');
                    return;
                  }
                } catch(_) {}
                // Fallback: CSS transform untuk rotate visual
                const app = document.getElementById('root') || document.body;
                const isPortrait = window.innerHeight > window.innerWidth;
                if (isPortrait) {
                  app.style.transform = 'rotate(90deg)';
                  app.style.transformOrigin = 'center center';
                  app.style.width = window.innerHeight + 'px';
                  app.style.height = window.innerWidth + 'px';
                  app.style.position = 'fixed';
                  app.style.top = ((window.innerHeight - window.innerWidth) / 2) + 'px';
                  app.style.left = -((window.innerHeight - window.innerWidth) / 2) + 'px';
                }
              }}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px 0', borderRadius:12, border:`1px solid ${color}50`, background:`${color}15`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}
            >
              <RotateCcw size={13} style={{ transform:'rotate(90deg)' }}/> Landscape
            </button>
            <button
              onClick={async () => {
                try {
                  if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen().catch(()=>{});
                  if (screen.orientation?.lock) {
                    await screen.orientation.lock('portrait');
                    return;
                  }
                } catch(_) {}
                // Fallback: reset CSS transform
                const app = document.getElementById('root') || document.body;
                app.style.transform = '';
                app.style.transformOrigin = '';
                app.style.width = '';
                app.style.height = '';
                app.style.position = '';
                app.style.top = '';
                app.style.left = '';
              }}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px 0', borderRadius:12, border:`1px solid ${color}50`, background:`${color}15`, color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}
            >
              <RotateCcw size={13}/> Portrait
            </button>
            <button
              onClick={() => {
                // Unlock orientation API
                try {
                  if (screen.orientation?.unlock) screen.orientation.unlock();
                  if (document.exitFullscreen) document.exitFullscreen().catch(()=>{});
                } catch(_) {}
                // Reset CSS transform fallback
                const app = document.getElementById('root') || document.body;
                app.style.transform = '';
                app.style.transformOrigin = '';
                app.style.width = '';
                app.style.height = '';
                app.style.position = '';
                app.style.top = '';
                app.style.left = '';
              }}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px 0', borderRadius:12, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:700, cursor:'pointer' }}
            >
              <RotateCcw size={13}/> Bebas
            </button>
          </div>
        </div>

        {/* ── KUNCI LAYAR / PRESENTATION MODE */}
        <div style={{ padding:'16px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <span style={{ fontSize:16 }}>🔒</span>
            <div>
              <div style={{ fontWeight:800, fontSize:14 }}>{lang==='en' ? 'Screen Lock' : 'Kunci Layar'}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>
                {lang==='en' ? 'Disable touch — prevent accidental taps on player' : 'Nonaktifkan sentuhan — cegah tap tidak sengaja saat memutar'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              // 1. Tutup settings
              if (onClose) onClose();
              // 2. Pindah ke tab player
              if (setTab) setTab('player');
              // 3. Aktifkan fullscreen
              if (setFullscreen) setFullscreen(true);
              // 4. Request fullscreen API browser
              setTimeout(() => {
                try {
                  if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                } catch(_) {}
              }, 150);
              // 5. Overlay kunci layar — pasang transparan interceptor di atas UI
              setTimeout(() => {
                const existingLock = document.getElementById('sn-screen-lock');
                if (existingLock) return; // sudah aktif
                const overlay = document.createElement('div');
                overlay.id = 'sn-screen-lock';
                overlay.style.cssText = [
                  'position:fixed', 'inset:0', 'z-index:99999',
                  'background:transparent',
                  'touch-action:none', 'user-select:none',
                  '-webkit-user-select:none',
                  'display:flex', 'align-items:flex-end', 'justify-content:center',
                  'padding-bottom:32px',
                  'pointer-events:all',
                ].join(';');

                // Badge kecil di pojok bawah tengah
                const badge = document.createElement('div');
                badge.style.cssText = [
                  'display:flex', 'align-items:center', 'gap:6px',
                  'padding:7px 14px', 'border-radius:999px',
                  'background:rgba(0,0,0,0.55)',
                  'border:1px solid rgba(255,255,255,0.12)',
                  'backdrop-filter:blur(12px)',
                  '-webkit-backdrop-filter:blur(12px)',
                  'color:rgba(255,255,255,0.6)', 'font-size:11px',
                  'font-weight:700', 'font-family:inherit',
                  'cursor:default', 'pointer-events:none',
                  'letter-spacing:0.03em',
                ].join(';');
                badge.innerHTML = '🔒 ' + (lang === 'en' ? 'Screen locked · Hold 3s to unlock' : 'Layar terkunci · Tahan 3 dtk untuk buka');
                overlay.appendChild(badge);

                // Tahan 3 detik untuk buka kunci
                let holdTimer = null;
                let holdStart = null;
                const startHold = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  holdStart = Date.now();
                  badge.style.background = 'rgba(99,102,241,0.5)';
                  badge.style.borderColor = 'rgba(99,102,241,0.6)';
                  badge.style.color = 'white';
                  badge.innerHTML = '🔓 ' + (lang === 'en' ? 'Hold to unlock…' : 'Tahan untuk buka…');
                  holdTimer = setTimeout(() => {
                    // Buka kunci
                    overlay.remove();
                    try { if (document.exitFullscreen) document.exitFullscreen().catch(()=>{}); } catch(_) {}
                  }, 3000);
                };
                const cancelHold = (e) => {
                  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
                  badge.style.background = 'rgba(0,0,0,0.55)';
                  badge.style.borderColor = 'rgba(255,255,255,0.12)';
                  badge.style.color = 'rgba(255,255,255,0.6)';
                  badge.innerHTML = '🔒 ' + (lang === 'en' ? 'Screen locked · Hold 3s to unlock' : 'Layar terkunci · Tahan 3 dtk untuk buka');
                };
                overlay.addEventListener('touchstart', startHold, { passive:false });
                overlay.addEventListener('touchend', cancelHold, { passive:false });
                overlay.addEventListener('mousedown', startHold);
                overlay.addEventListener('mouseup', cancelHold);
                overlay.addEventListener('mouseleave', cancelHold);
                // Blokir semua event lain
                ['click','touchmove','contextmenu','wheel'].forEach(ev =>
                  overlay.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }, { passive:false })
                );
                document.body.appendChild(overlay);
              }, 300);
            }}
            style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              padding:'11px 0', borderRadius:12,
              border:`1px solid rgba(99,102,241,0.35)`,
              background:'rgba(99,102,241,0.1)',
              color:'rgba(200,200,255,0.85)', fontSize:13, fontWeight:700, cursor:'pointer',
              transition:'all 0.2s',
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.22)'; e.currentTarget.style.color='white'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.1)'; e.currentTarget.style.color='rgba(200,200,255,0.85)'; }}
          >
            <Lock size={14}/> {lang==='en' ? 'Lock Screen & Go to Player' : 'Kunci Layar & Buka Player'}
          </button>
        </div>
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
              <button key={opt.label} onClick={() => { setCustomDns(opt.value); try { localStorage.setItem('sn_custom_dns', opt.value); } catch(e) { console.warn('[SettingsPanel] localStorage error:', e); } }}
                style={{ padding:'6px 12px', borderRadius:999, border:'none', fontSize:11, fontWeight:700, cursor:'pointer',
                  background: customDns === opt.value ? color : 'rgba(255,255,255,0.08)',
                  color: customDns === opt.value ? 'white' : 'rgba(255,255,255,0.55)' }}
                title={opt.desc}>{opt.label}</button>
            ))}
          </div>
          {/* DNS aktif — read-only, otomatis dari preset */}
          <div style={{ padding:'9px 12px', borderRadius:12, border:`1px solid rgba(255,255,255,0.10)`, background:'rgba(255,255,255,0.04)', color: customDns ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)', fontSize:12, fontFamily:'monospace', userSelect:'text' }}>
            {customDns || '— (Default ISP)'}
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
              { id:'ai', label:'AI Key', icon:<svg width={11} height={11} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#6366f1"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5"/><circle cx="12" cy="12" r="1.5" fill="white"/><line x1="12" y1="4" x2="12" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="17" x2="12" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="4" y1="12" x2="7" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="17" y1="12" x2="20" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>, activeColor:'#818cf8', activeBg:'rgba(99,102,241,0.15)', dot: !!(userAiKey || userCfKey || userSnKey) },

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
                  onBlur={v => { try { localStorage.setItem('sn_sp_id', v); } catch(e) { console.warn('[SettingsPanel] localStorage error:', e); } }}
                  placeholder="Client ID"
                  accentColor="#1DB954"
                />
              </div>
              <MaskedKeyInput
                value={userSpSecret}
                onChange={v => setUserSpSecret(v)}
                onBlur={v => { try { localStorage.setItem('sn_sp_secret', v); } catch(e) { console.warn('[SettingsPanel] localStorage error:', e); } }}
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
                onBlur={v => { try { localStorage.setItem('sn_sc_id', v); } catch(e) { console.warn('[SettingsPanel] localStorage error:', e); } }}
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
                onBlur={v => { try { localStorage.setItem('sn_yt_key', v); } catch(e) { console.warn('[SettingsPanel] localStorage error:', e); } }}
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
                    const label = k.startsWith('sk-ant-') ? 'Anthropic' : k.startsWith('sk-or-') ? 'OpenRouter' : k.startsWith('gsk_') ? 'Groq' : k.startsWith('AIza') ? 'Gemini' : k.startsWith('xai-') ? 'xAI Grok' : k.startsWith('hf_') ? 'HuggingFace' : k.startsWith('ghp_') || k.startsWith('github_pat_') ? 'GitHub' : k.startsWith('sk-') ? 'OpenAI / DeepSeek' : 'Aktif';
                    return <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:999, background:'rgba(99,102,241,0.2)', color:'#818cf8' }}>{'✓'} {label}</span>;
                  })()}
                </div>
                <MaskedKeyInput
                  value={userAiKey}
                  onChange={v => setUserAiKey(v)}
                  onBlur={v => { try { localStorage.setItem('sn_ai_key', v); } catch(e) { console.warn('[SettingsPanel] localStorage error:', e); } }}
                  placeholder="sk- / sk-or- / sk-ant- / gsk_ / AIza / xai- / hf_ / ghp_"
                  accentColor="#818cf8"
                />
                <div style={{ marginTop:6, fontSize:9, color:'rgba(255,255,255,0.25)', lineHeight:1.9 }}>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>sk-</span> {'→'} OpenAI / DeepSeek &nbsp;{'·'}&nbsp;
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>sk-or-</span> {'→'} OpenRouter<br/>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>sk-ant-</span> {'→'} Anthropic &nbsp;{'·'}&nbsp;
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>gsk_</span> {'→'} Groq<br/>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>AIza</span> {'→'} Gemini &nbsp;{'·'}&nbsp;
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>xai-</span> {'→'} xAI Grok &nbsp;{'·'}&nbsp;
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>hf_</span> {'→'} HuggingFace &nbsp;{'·'}&nbsp;
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>ghp_</span> {'→'} GitHub Models
                </div>
                {userAiKey && (
                  <button onClick={() => { setUserAiKey(''); localStorage.removeItem('sn_ai_key'); }}
                    style={{ marginTop:6, padding:'3px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:10, cursor:'pointer' }}>
                    Hapus
                  </button>
                )}
              </div>

              {/* Cloudflare Workers AI */}
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#F6821F"/><path d="M18.5 13.5c-.3-2.1-2.1-3.7-4.3-3.7-.3 0-.6 0-.9.1C12.8 8.7 11.5 8 10 8c-2.2 0-4 1.8-4 4 0 .1 0 .3.1.4C4.8 12.8 4 13.8 4 15c0 1.4 1.1 2.5 2.5 2.5h11.5c1.1 0 2-.9 2-2 0-.9-.6-1.7-1.5-2z" fill="white"/></svg>
                  <span style={{ fontWeight:700, fontSize:11, color:'rgba(255,255,255,0.85)' }}>Cloudflare Workers AI Key</span>
                  {userCfKey && <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:999, background:'rgba(246,130,31,0.2)', color:'#F6821F' }}>✓ Aktif</span>}
                </div>
                <MaskedKeyInput
                  value={userCfKey}
                  onChange={v => setUserCfKey(v)}
                  onBlur={v => { try { localStorage.setItem('sn_cf_key', v); } catch(e) { console.warn('[SettingsPanel] localStorage error:', e); } }}
                  placeholder="accountId:apiKey"
                  accentColor="#F6821F"
                />
                <div style={{ marginTop:4, fontSize:9, color:'rgba(255,255,255,0.25)', lineHeight:1.8 }}>
                  Format: <span style={{ color:'rgba(255,255,255,0.4)' }}>accountId:apiKey</span> &nbsp;·&nbsp; Llama, Qwen via Workers AI
                </div>
                {userCfKey && (
                  <button onClick={() => { setUserCfKey(''); localStorage.removeItem('sn_cf_key'); }}
                    style={{ marginTop:6, padding:'3px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#fca5a5', fontSize:10, cursor:'pointer' }}>
                    Hapus
                  </button>
                )}
              </div>

              {/* SambaNova */}
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#EE3124"/><text x="4" y="17" fontSize="12" fontWeight="bold" fill="white">S</text></svg>
                  <span style={{ fontWeight:700, fontSize:11, color:'rgba(255,255,255,0.85)' }}>SambaNova API Key</span>
                  {userSnKey && <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:999, background:'rgba(238,49,36,0.2)', color:'#ff6b5b' }}>✓ Aktif</span>}
                </div>
                <MaskedKeyInput
                  value={userSnKey}
                  onChange={v => setUserSnKey(v)}
                  onBlur={v => { try { localStorage.setItem('sn_sn_key', v); } catch(e) { console.warn('[SettingsPanel] localStorage error:', e); } }}
                  placeholder="SambaNova API key..."
                  accentColor="#ff6b5b"
                />
                <div style={{ marginTop:4, fontSize:9, color:'rgba(255,255,255,0.25)', lineHeight:1.8 }}>
                  SambaNova Cloud &nbsp;·&nbsp; Llama 3.3, Qwen 2.5, DeepSeek-R1
                </div>
                {userSnKey && (
                  <button onClick={() => { setUserSnKey(''); localStorage.removeItem('sn_sn_key'); }}
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
                <div style={{ fontSize:13, fontWeight:700, color:'#a5b4fc' }}>{t?.pwaInstalled||'Already installed!'}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{t?.pwaInstalledDesc||'Open from your home screen or app launcher'}</div>
              </div>
            </div>
          ) : (
            <div style={{ padding:'10px 14px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>{t?.pwaManualTitle||'Manual install steps:'}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[
                  [t?.pwaShortcutRadio?.startsWith('🎙️') ? '📱 Chrome Android' : '📱 Chrome Android', t?.pwaStepAndroid||'Menu ⋮ → Add to Home Screen'],
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
          {/* Shortcuts info */}
          <div style={{ marginTop:12, padding:'10px 14px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>🔗 Pintasan layar utama (setelah install):</div>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {[
                ['🎙️ Radio', 'Buka tab Radio langsung'],
                ['🎵 Koleksi', 'Buka koleksi & playlist'],
                ['🔍 Cari', 'Buka pencarian musik'],
              ].map(([name, desc]) => (
                <div key={name} style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.55)', minWidth:60 }}>{name}</span>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HAPUS CACHE */}
        <CacheManager lang={lang} t={t} />

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  UPLOAD MODAL
// ═══════════════════════════════════════════════════════

export { SettingsPanel };
