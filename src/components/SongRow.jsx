import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Cloud, Download, Loader2, Music, Radio, Trash2, Heart } from 'lucide-react';
import { btn, downloadToDevice } from '../constants.js';


// Thumbnail dengan fallback state yang benar
function SongThumb({ src, bg, isRadio, isYtSong, title, color }) {
  const [err, setErr] = React.useState(false);
  React.useEffect(() => { setErr(false); }, [src]);
  const badge = isYtSong
    ? <div style={{ position:'absolute', bottom:2, right:2, fontSize:7, fontWeight:800, background:'rgba(255,0,0,0.85)', color:'white', padding:'1px 3px', borderRadius:3, lineHeight:1.2, zIndex:2 }}>YT</div>
    : isRadio
    ? <div style={{ position:'absolute', bottom:2, right:2, fontSize:7, fontWeight:800, background:'rgba(245,158,11,0.85)', color:'white', padding:'1px 3px', borderRadius:3, lineHeight:1.2, zIndex:2 }}>FM</div>
    : null;
  return (
    <div style={{ width:42, height:42, borderRadius:10, background:bg, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
      {err ? (
        <>
          {isRadio ? <Radio size={16} color={color}/> : <Music size={16} color={isYtSong ? '#ff4444' : color}/>}
          {badge}
        </>
      ) : (
        <>
          <img src={src} alt={title} loading="lazy" decoding="async" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} onError={()=>setErr(true)}/>
          {badge}
        </>
      )}
    </div>
  );
}

function SongRow({ s, i, track, playing, liked, setLiked, toggleFav, play, setPlaying, isDrive, isCached, onRemove, playlists, addToPlaylist, isLite, t, onDownload, editMode, embedTrack, isDownloading, dlProgress }) {
  const isYtSong = s.type === 'youtube';
  const isActive = isYtSong
    ? (embedTrack?.type === 'youtube' && embedTrack?.videoId === s.videoId)
    : track.id === s.id;
  const [dlState, setDlState] = React.useState('idle'); // idle | loading | done | error

  const [dlError, setDlError] = React.useState('');
  const handleDownload = async (e) => {
    e.stopPropagation();
    if (dlState === 'loading') return;
    setDlState('loading');
    setDlError('');
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
    } catch(err) {
      setDlError(err?.message || 'Gagal');
      setDlState('error');
      setTimeout(() => { setDlState('idle'); setDlError(''); }, 4000);
    }
  };
  const dlColor = dlState === 'done' ? '#4ade80' : dlState === 'error' ? '#f87171' : dlState === 'loading' ? (s.color || '#a78bfa') : 'rgba(255,255,255,0.2)';
  return (
    <div data-songrow style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:14, cursor:'pointer', background:isActive?s.bg:'rgba(255,255,255,0.04)', border:`1px solid ${isActive?s.color+'50':'transparent'}` }} onClick={()=>{
        // FIX PLAY/PAUSE PLAYLIST: jika track ini sudah aktif, toggle play/pause
        // Sebelumnya onClick selalu memanggil play(s) yang me-restart track dari awal
        if (isActive) {
          if (typeof setPlaying === 'function') setPlaying(p => !p);
        } else {
          play(s);
        }
      }}>
      <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:isActive?s.color:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:isActive?'white':'rgba(255,255,255,0.4)' }}>
        {isActive&&playing ? (isLite ? <Music size={12} color="white"/> : <div style={{ display:'flex', gap:1.5, alignItems:'flex-end' }}>{[12,6,10].map((h,j)=>(<div key={j} style={{ width:2.5, height:h, background:'white', borderRadius:1, animation:`bounce 1.4s ease-in-out ${j*0.25}s infinite` }}/>))}</div>) : isDrive?<Cloud size={12}/>:i+1}
      </div>
      {(() => {
        const thumbSrc = s.thumbnail || s.cover || s.favicon;
        const bg = s.isRadio ? `${s.color}20` : isYtSong ? 'rgba(255,68,68,0.15)' : (s.bg||'rgba(255,255,255,0.07)');
        const FallbackIcon = () => s.isRadio
          ? <Radio size={16} color={s.color}/>
          : <Music size={16} color={isYtSong ? '#ff4444' : s.color}/>;
        // Badge label sumber — hanya di mode Pro, muncul di semua state cover
        const srcBadge = !isLite && (isYtSong
          ? <div style={{ position:'absolute', bottom:2, right:2, fontSize:7, fontWeight:800, background:'rgba(255,0,0,0.85)', color:'white', padding:'1px 3px', borderRadius:3, lineHeight:1.2, zIndex:2 }}>YT</div>
          : s.isRadio
          ? <div style={{ position:'absolute', bottom:2, right:2, fontSize:7, fontWeight:800, background:'rgba(245,158,11,0.85)', color:'white', padding:'1px 3px', borderRadius:3, lineHeight:1.2, zIndex:2 }}>FM</div>
          : s.isDrive || s.driveId
          ? <div style={{ position:'absolute', bottom:2, right:2, fontSize:7, fontWeight:800, background:'rgba(14,165,233,0.85)', color:'white', padding:'1px 3px', borderRadius:3, lineHeight:1.2, zIndex:2 }}>GD</div>
          : s._wsSource
          ? <div style={{ position:'absolute', bottom:2, right:2, fontSize:7, fontWeight:800, background:'rgba(124,58,237,0.85)', color:'white', padding:'1px 3px', borderRadius:3, lineHeight:1.2, zIndex:2 }}>WEB</div>
          : null);
        if (isLite) return (
          <div style={{ width:42, height:42, borderRadius:10, background:bg, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <FallbackIcon/>
          </div>
        );
        if (thumbSrc) return (
          <SongThumb src={thumbSrc} bg={bg} isRadio={s.isRadio} isYtSong={isYtSong} title={s.title} color={s.color}/>
        );
        // Mode Pro tanpa cover: tampilkan ikon fallback + badge sumber
        return (
          <div style={{ width:42, height:42, borderRadius:10, background:bg, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
            <FallbackIcon/>
            {srcBadge}
          </div>
        );
      })()}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:isActive?'white':'rgba(255,255,255,0.85)' }}>{s.title}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.artist}{isYtSong ? ' · YouTube' : ` · ${s.album}`}</span>
          {isDrive && !isYtSong && <span style={{ color:s.color, flexShrink:0 }}>· Drive</span>}
          {isCached && <span style={{ flexShrink:0, fontSize:9, fontWeight:800, color:'#4ade80', background:'rgba(74,222,128,0.12)', padding:'1px 5px', borderRadius:999 }}>✓ Offline</span>}
          {isDownloading && !isCached && <span style={{ flexShrink:0, fontSize:9, fontWeight:800, color:'#60a5fa', background:'rgba(96,165,250,0.12)', padding:'1px 5px', borderRadius:999 }}>↓ {dlProgress > 0 ? `${dlProgress}%` : '…'}</span>}
          {isYtSong && isActive && playing && <span style={{ flexShrink:0, fontSize:9, fontWeight:800, color:'#ff4444', background:'rgba(255,68,68,0.12)', padding:'1px 5px', borderRadius:999 }}>▶ Playing</span>}
        </div>
      </div>
      <div style={{ display:'flex', gap:2, position:'relative' }}>
        {/* ── Tombol unduh ke perangkat (tidak tampil untuk radio) */}
        {!s.isRadio&&editMode&&<button onClick={handleDownload} title={dlState==='done'?'Berhasil diunduh!':dlState==='error'?(dlError||'Gagal, coba lagi'):'Unduh ke perangkat'}
          style={{ ...btn, color:dlColor, padding:6, transition:'color 0.2s', position:'relative' }}>
          {dlState==='loading'
            ? <Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }}/>
            : dlState==='done'
            ? <CheckCircle size={14}/>
            : <Download size={14}/>}
          {dlState==='error' && dlError && (
            <span style={{ position:'absolute', bottom:'calc(100% + 4px)', right:0, background:'rgba(20,5,5,0.96)', color:'#fca5a5', fontSize:9, fontWeight:700, padding:'3px 7px', borderRadius:6, whiteSpace:'nowrap', border:'1px solid rgba(248,113,113,0.3)', pointerEvents:'none', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', zIndex:10 }}>
              {dlError}
            </span>
          )}
        </button>}

        {/* ── Tombol Hapus — hanya tampil saat editMode aktif (dikontrol dari parent) */}
        {onRemove && (
          <button onClick={e=>{ e.stopPropagation(); onRemove(s.id); }}
            title={t?.deleteBtn||'Hapus'}
            style={{ background:'none', border:'none', cursor:'pointer', padding:6, color:'#f87171', display:'flex', alignItems:'center' }}
          >
            <Trash2 size={14}/>
          </button>
        )}
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
