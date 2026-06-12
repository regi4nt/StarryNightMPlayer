import React, { useState, useRef, useCallback } from 'react';
import { CheckCircle, ChevronLeft, ListPlus, Music, PenLine, Radio, Search, Trash2, X } from 'lucide-react';
// Helper: thumbnail with fallback for YT, Radio, Web sources
function ThumbImg({ src, size, radius, isRadio, color, iconSize }) {
  const [err, setErr] = React.useState(false);
  React.useEffect(() => { setErr(false); }, [src]);
  if (err) return (
    <div style={{ width:size, height:size, borderRadius:radius, background:isRadio?`${color}20`:'rgba(255,255,255,0.07)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
      {isRadio ? <Radio size={iconSize} color={color}/> : <Music size={iconSize} color={color}/>}
    </div>
  );
  return <img src={src} loading="lazy" decoding="async" style={{ width:size, height:size, borderRadius:radius, objectFit:'cover', flexShrink:0, display:'block' }} onError={()=>setErr(true)}/>;
}



function PlaylistFormView({ editingPl, allSongs, lang, isLite, t, setPlaylists, setEditingPl, setPlView, deletePlaylist, onSave }) {
  const isEdit = !!editingPl;
  const [formName, setFormName] = useState(editingPl?.name || '');
  const [formSelected, setFormSelected] = useState(() => new Set(editingPl?.songIds || []));
  const [searchQ, setSearchQ] = useState('');

  const toggleSong = id => setFormSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = allSongs.filter(s => {
    if (isEdit && formSelected.has(s.id)) return false; // already shown in top section
    if (!searchQ.trim()) return true;
    return s.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQ.toLowerCase());
  });
  const handleSave = () => {
    if (!formName.trim()) { alert(lang === 'id' ? 'Isi nama playlist!' : 'Enter playlist name!'); return; }
    // Gunakan onSave callback jika tersedia (agar liked state sinkron saat hapus dari ❤️ Favorit)
    if (onSave) {
      onSave({ name: formName.trim(), songIds: [...formSelected] });
      setPlView('list');
      return;
    }
    if (isEdit) {
      setPlaylists(p => p.map(pl => pl.id === editingPl.id ? { ...pl, name: formName.trim(), songIds: [...formSelected] } : pl));
      setEditingPl(null);
    } else {
      const id = 'pl_' + Date.now();
      setPlaylists(p => [...p, { id, name: formName.trim(), songIds: [...formSelected], locked: false }]);
    }
    setPlView('list');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px 12px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <button onClick={() => { setEditingPl(null); setPlView('list'); }}
            style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4, display:'flex' }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {isEdit ? <PenLine size={15} style={{ color: 'white' }} /> : <ListPlus size={15} style={{ color: 'white' }} />}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:14 }}>{isEdit ? t?.editPlaylist || 'Edit Playlist' : t?.newPlaylist || 'Playlist Baru'}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{formSelected.size} {t?.songsSelected || 'lagu dipilih'}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
          {isEdit && !editingPl?.locked && deletePlaylist && (
            <button onClick={()=>{ deletePlaylist(editingPl.id); setPlView('list'); }}
              style={{ padding:'7px 12px', borderRadius:10, border:'1px solid rgba(239,68,68,0.35)', background:'rgba(239,68,68,0.1)', color:'#f87171', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
              <Trash2 size={13}/> {t?.deleteBtn||'Hapus'}
            </button>
          )}
          <button onClick={handleSave}
            style={{ padding:'7px 16px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:12, fontWeight:800, cursor:'pointer' }}>
            {isEdit ? t?.saveChanges || 'Simpan' : t?.createPlaylistBtn || 'Buat'}
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Nama playlist */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Nama Playlist</div>
          <input
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder={t?.playlistNamePlaceholder || 'Nama playlist kamu...'}
            autoFocus
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '10px 13px', fontSize: 13, color: 'white', outline: 'none', WebkitAppearance: 'none' }}
            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.7)'}
            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
          />
        </div>

        {/* Song picker */}
        <div>
          {/* ── Lagu yang sudah ada di playlist ini (hanya saat edit) */}
          {isEdit && formSelected.size > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                {lang === 'id' ? 'Lagu Dalam Playlist' : 'Songs In Playlist'} ({formSelected.size})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {allSongs.filter(s => formSelected.has(s.id)).map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                    {isLite
                      ? <div style={{ width: 32, height: 32, borderRadius: 7, background: s.isRadio ? `${s.color}20` : (s.bg || 'rgba(255,255,255,0.07)'), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {s.isRadio ? <Radio size={13} color={s.color}/> : <Music size={13} color={s.color}/>}
                        </div>
                      : (s.cover || s.thumbnail || s.favicon)
                        ? <ThumbImg src={s.cover || s.thumbnail || s.favicon} size={32} radius={7} isRadio={s.isRadio} color={s.color} iconSize={13}/>
                        : <div style={{ width: 32, height: 32, borderRadius: 7, background: s.isRadio ? `${s.color}20` : (s.bg || 'rgba(255,255,255,0.07)'), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {s.isRadio ? <Radio size={13} color={s.color}/> : <Music size={13} color={s.color}/>}
                          </div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'white' }}>{s.title}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{s.artist}</div>
                    </div>
                    <button onClick={() => toggleSong(s.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', padding: '4px 6px', display: 'flex', borderRadius: 6, flexShrink: 0 }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '12px 0' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t?.selectSongs || 'Tambah Lagu'}</div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{allSongs.filter(s => !formSelected.has(s.id)).length} tersedia</span>
          </div>
          {/* Search songs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(0,0,0,0.3)', borderRadius: 999, padding: '6px 12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
            <Search size={12} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder={lang === 'id' ? 'Cari lagu...' : 'Search songs...'}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 12, minWidth: 0 }}
            />
            {searchQ && <button onClick={() => setSearchQ('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>}
          </div>
          {/* Song list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>Tidak ada lagu ditemukan</div>
            )}
            {filtered.map(s => {
              const on = formSelected.has(s.id);
              return (
                <div key={s.id} onClick={() => toggleSong(s.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 12, cursor: 'pointer', background: on ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${on ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.1s' }}>
                  {isLite
                    ? <div style={{ width: 34, height: 34, borderRadius: 8, background: s.isRadio ? `${s.color}20` : (s.bg || 'rgba(255,255,255,0.07)'), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {s.isRadio ? <Radio size={14} color={s.color}/> : <Music size={14} color={s.color}/>}
                      </div>
                    : (s.cover || s.thumbnail || s.favicon)
                      ? <ThumbImg src={s.cover || s.thumbnail || s.favicon} size={34} radius={8} isRadio={s.isRadio} color={s.color} iconSize={14}/>
                      : <div style={{ width: 34, height: 34, borderRadius: 8, background: s.isRadio ? `${s.color}20` : (s.bg || 'rgba(255,255,255,0.07)'), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {s.isRadio ? <Radio size={14} color={s.color}/> : <Music size={14} color={s.color}/>}
                        </div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: on ? 'white' : 'rgba(255,255,255,0.8)' }}>{s.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{s.artist}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${on ? '#a78bfa' : 'rgba(255,255,255,0.2)'}`, background: on ? '#a78bfa' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.1s' }}>
                    {on && <CheckCircle size={11} style={{ color: 'white' }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  PLAYLIST MODAL - Create / Edit
// ═══════════════════════════════════════════════════════
function PlaylistModal({ onClose, onSave, allSongs, existing, isLite, t, prefillName, prefillSongIds, panelMode }) {
  const isEdit = !!existing;
  const [name, setName] = useState(existing?.name || prefillName || '');
  const [selected, setSelected] = useState(new Set(existing?.songIds || prefillSongIds || []));

  const toggle = id => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  // panelMode = true → full panel seperti Antrean/Bagikan (position absolute, inset 0, full height)
  if (panelMode) {
    return (
      <div style={{ position:'absolute', inset:0, zIndex:200, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'stretch' }} onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'#0d0d24', border:'none', borderRadius:0 }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px 12px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(168,85,247,0.25))', border:'1px solid rgba(99,102,241,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {isEdit ? <PenLine size={14} style={{color:'#a78bfa'}}/> : <ListPlus size={14} style={{color:'#a78bfa'}}/>}
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:14 }}>{isEdit ? t?.editPlaylist||'Edit Playlist' : t?.newPlaylist||'Buat Playlist Baru'}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{selected.size} {t?.songsSelected||'lagu dipilih'}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:999, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700 }}>×</button>
          </div>

          {/* Scrollable content */}
          <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'14px 18px 20px' }}>
            {/* Name */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Playlist Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder={t?.playlistNamePlaceholder||"Nama playlist kamu..."}
                style={{ width:'100%', marginTop:6, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 12px', fontSize:13, color:'white', outline:'none', boxSizing:'border-box' }}/>
            </div>

            {/* Song picker */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{t?.selectSongs||'Pilih Lagu'}</label>
              <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:3 }}>
                {allSongs.map(s => {
                  const on = selected.has(s.id);
                  return (
                    <div key={s.id} onClick={()=>toggle(s.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:12, cursor:'pointer', background:on?s.bg:'rgba(255,255,255,0.03)', border:`1px solid ${on?s.color+'50':'rgba(255,255,255,0.08)'}` }}>
                      {isLite
                        ? <div style={{ width:34, height:34, borderRadius:8, background:s.isRadio?`${s.color}20`:(s.bg||'rgba(255,255,255,0.07)'), flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {s.isRadio ? <Radio size={14} color={s.color}/> : <Music size={14} color={s.color}/>}
                          </div>
                        : (s.cover || s.thumbnail || s.favicon)
                          ? <ThumbImg src={s.cover || s.thumbnail || s.favicon} size={34} radius={8} isRadio={s.isRadio} color={s.color} iconSize={14}/>
                          : <div style={{ width:34, height:34, borderRadius:8, background:s.isRadio?`${s.color}20`:(s.bg||'rgba(255,255,255,0.07)'), flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                              {s.isRadio ? <Radio size={14} color={s.color}/> : <Music size={14} color={s.color}/>}
                            </div>}
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
          </div>

          {/* Footer buttons */}
          <div style={{ display:'flex', gap:10, padding:'12px 18px 16px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
            <button onClick={onClose} style={{ flex:1, padding:'12px 0', borderRadius:14, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:700, cursor:'pointer' }}>{t?.cancelBtn||'Batal'}</button>
            <button onClick={()=>{ if(!name.trim()) return alert('Isi nama playlist!'); onSave({ name:name.trim(), songIds:[...selected] }); }}
              style={{ flex:2, padding:'12px 0', borderRadius:14, border:'none', background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:13, fontWeight:800, cursor:'pointer' }}>
              {isEdit ? t?.saveChanges||'Simpan' : t?.createPlaylistBtn||'Buat Playlist'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default mode: bottom sheet (fixed, dari bawah)
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
          <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{t?.selectSongs ? 'Playlist Name' : 'Playlist Name'}</label>
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
                    ? <div style={{ width:34, height:34, borderRadius:8, background:s.isRadio?`${s.color}20`:(s.bg||'rgba(255,255,255,0.07)'), flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {s.isRadio ? <Radio size={14} color={s.color}/> : <Music size={14} color={s.color}/>}
                      </div>
                    : (s.cover || s.thumbnail || s.favicon)
                      ? <ThumbImg src={s.cover || s.thumbnail || s.favicon} size={34} radius={8} isRadio={s.isRadio} color={s.color} iconSize={14}/>
                      : <div style={{ width:34, height:34, borderRadius:8, background:s.isRadio?`${s.color}20`:(s.bg||'rgba(255,255,255,0.07)'), flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {s.isRadio ? <Radio size={14} color={s.color}/> : <Music size={14} color={s.color}/>}
                        </div>}
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

// ── Komponen SettingsPanel dengan Error Boundary

export { PlaylistFormView, PlaylistModal };
