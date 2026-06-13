import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { btn } from '../constants.js';

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
          {[['Song Title *',title,setTitle,'Song title...'],['Artist',artist,setArtist,'Artist name...'],['Album',album,setAlbum,'Album name...']].map(([label,val,set,ph])=>(
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
// ── Device type detection — phone vs tablet/desktop
// Phone: mobile UA (not iPad/tablet) AND small physical screen (min dimension < 500px)
// Tablet/Desktop: everything else gets desktop UI
function isPhoneDevice() {
  const ua = navigator.userAgent;
  const isMobileUA = /android|iphone|ipod|blackberry|windows phone/i.test(ua);
  const isTabletUA = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
  const smallScreen = Math.min(window.screen.width, window.screen.height) < 500;
  // Phone = mobile UA but NOT tablet UA; OR very small physical screen
  return (isMobileUA && !isTabletUA) || smallScreen;
}

export { UploadModal };
