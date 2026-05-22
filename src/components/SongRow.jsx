import React, { useState, useRef } from 'react';
import { CheckCircle, Cloud, Download, ListPlus, Loader2, Music, Trash2, Heart } from 'lucide-react';

function SongRow({ s, i, track, playing, liked, setLiked, toggleFav, play, isDrive, isCached, onRemove, playlists, addToPlaylist, isLite, t, onDownload }) {
  const isActive = track.id === s.id;
  const [dlState, setDlState] = React.useState('idle'); // idle | loading | done | error
  const [showPlMenu, setShowPlMenu] = React.useState(false);
  const plMenuRef = React.useRef(null);
  const plBtnRef = React.useRef(null);
  const [plMenuPos, setPlMenuPos] = React.useState({ bottom: 0, right: 0 });

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!showPlMenu) return;
    const handler = (e) => {
      if (
        plMenuRef.current && !plMenuRef.current.contains(e.target) &&
        plBtnRef.current && !plBtnRef.current.contains(e.target)
      ) {
        setShowPlMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPlMenu]);

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
    <div data-songrow style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:14, cursor:'pointer', background:isActive?s.bg:'rgba(255,255,255,0.04)', border:`1px solid ${isActive?s.color+'50':'transparent'}` }} onClick={()=>play(s)}>
      <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:isActive?s.color:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:isActive?'white':'rgba(255,255,255,0.4)' }}>
        {isActive&&playing ? (isLite ? <Music size={12} color="white"/> : <div style={{ display:'flex', gap:1.5, alignItems:'flex-end' }}>{[12,6,10].map((h,j)=>(<div key={j} style={{ width:2.5, height:h, background:'white', borderRadius:1, animation:`bounce 1.4s ease-in-out ${j*0.25}s infinite` }}/>))}</div>) : isDrive?<Cloud size={12}/>:i+1}
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
      <div style={{ display:'flex', gap:2, position:'relative' }}>
        {/* ── Tombol Hapus — hanya tampil saat editMode aktif (dikontrol dari parent) */}
        {onRemove && (
          <button onClick={e=>{ e.stopPropagation(); onRemove(s.id); }}
            title={t?.deleteBtn||'Hapus'}
            style={{ background:'none', border:'none', cursor:'pointer', padding:6, color:'#f87171', display:'flex', alignItems:'center' }}
          >
            <Trash2 size={14}/>
          </button>
        )}
        {/* ── Tombol Tambah ke Playlist */}
        {playlists && playlists.length > 0 && addToPlaylist && (
          <div style={{ position:'relative' }}>
            <button
              ref={plBtnRef}
              onClick={e=>{ e.stopPropagation(); if(!showPlMenu && plBtnRef.current){ const r=plBtnRef.current.getBoundingClientRect(); setPlMenuPos({ bottom: window.innerHeight - r.top + 6, right: window.innerWidth - r.right }); } setShowPlMenu(v=>!v); }}
              title={t?.addToPlaylistBtn||'Tambah ke Playlist'}
              style={{ background:'none', border:'none', cursor:'pointer', flexShrink:0, padding:6, color: showPlMenu ? '#f472b6' : 'rgba(255,255,255,0.35)', transition:'color 0.2s' }}
            >
              <ListPlus size={14}/>
            </button>
            {showPlMenu && (
              <div
                ref={plMenuRef}
                onClick={e=>e.stopPropagation()}
                style={{
                  position:'fixed', right: plMenuPos.right, bottom: plMenuPos.bottom,
                  background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:12, padding:'6px 0', minWidth:160, zIndex:9999,
                  boxShadow:'0 8px 32px rgba(0,0,0,0.6)'
                }}
              >
                <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', padding:'4px 14px 6px', textTransform:'uppercase', letterSpacing:1 }}>
                  {t?.addToPlaylistHeader||'Tambah ke'}
                </div>
                {playlists.filter(pl=>!pl.locked).map(pl=>(
                  <button key={pl.id} onClick={()=>{ addToPlaylist(pl.id, s.id); setShowPlMenu(false); }}
                    style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 14px', background:'none', border:'none', color:'rgba(255,255,255,0.75)', fontSize:12, fontWeight:600, cursor:'pointer', borderRadius:0 }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                    onMouseLeave={e=>e.currentTarget.style.background='none'}
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ── Tombol unduh ke perangkat (tidak tampil untuk radio) */}
        {!s.isRadio&&<button onClick={handleDownload} title={dlState==='done'?'Berhasil diunduh!':dlState==='error'?'Gagal, coba lagi':'Unduh ke perangkat'}
          style={{ ...btn, color:dlColor, padding:6, transition:'color 0.2s' }}>
          {dlState==='loading'
            ? <Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }}/>
            : dlState==='done'
            ? <CheckCircle size={14}/>
            : <Download size={14}/>}
        </button>}
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

export { SongRow };
