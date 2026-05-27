import React, { useRef, useEffect, useState } from 'react';
import { Loader2, Music, Radio } from 'lucide-react';
import { btn, fmt } from '../constants.js';

function AppLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#c084fc"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Dark background */}
      <circle cx="16" cy="16" r="15.5" fill="#07071e"/>
      {/* Outer border gradient */}
      <circle cx="16" cy="16" r="15.5" stroke="url(#lg1)" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Orbit ring - dashed like the player ring */}
      <circle cx="16" cy="16" r="10.5" stroke="url(#lg1)" strokeWidth="2.2" fill="none"
        strokeDasharray="46 20" strokeLinecap="round" transform="rotate(-60 16 16)"/>
      {/* Glowing dot on orbit (top-right position) */}
      <circle cx="23.4" cy="9.4" r="2.2" fill="white" filter="url(#glow)"/>
      {/* 4-pointed star / spark in center */}
      <path d="M16 9.5 L17.1 14.9 L22.5 16 L17.1 17.1 L16 22.5 L14.9 17.1 L9.5 16 L14.9 14.9 Z"
        fill="white" opacity="0.95" filter="url(#glow)"/>
      {/* Tiny accent stars */}
      <circle cx="7.5" cy="8.5" r="0.9" fill="white" opacity="0.55"/>
      <circle cx="24.5" cy="24" r="0.7" fill="white" opacity="0.45"/>
      <circle cx="9" cy="23.5" r="0.6" fill="#60a5fa" opacity="0.7"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
//  ORBITAL RING  — tap OR drag to seek
// ═══════════════════════════════════════════════════════
function OrbitalRing({ size, pct, color, progress, duration, isPlaying, cover, title, onSeek, isLite, isRadio, downloadProg, isDownloading, drivePhase, ytDownloading, ytDlProg, coverSpin }) {
  const cx=size/2, cy=size/2, artR=size/2-36, ringR=artR+18, circ=2*Math.PI*ringR;
  const deg=pct*360-90, rad=deg*Math.PI/180;
  const dotX=cx+Math.cos(rad)*ringR, dotY=cy+Math.sin(rad)*ringR;
  const lblR=ringR+22, lblX=cx+Math.cos(rad)*lblR, lblY=cy+Math.sin(rad)*lblR;
  // Duration label: inside SVG bounds (bottom of ring, pulled inward)
  const durY=cy+ringR+16;

  const svgRef  = useRef(null);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false); // mirrors dragging ref; triggers re-render for transition toggle

  const getPct = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - cx, y = clientY - rect.top - cy;
    let a = Math.atan2(x, -y); if (a < 0) a += 2 * Math.PI;
    return a / (2 * Math.PI);
  };
  const nearRing = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - cx, y = clientY - rect.top - cy;
    return Math.abs(Math.sqrt(x*x+y*y) - ringR) <= 38;
  };

  // Mouse events
  const onMouseDown = e => { if (!onSeek||isRadio||!nearRing(e.clientX,e.clientY)) return; dragging.current=true; setIsDragging(true); onSeek(getPct(e.clientX,e.clientY)); };
  const onMouseMove = e => { if (!dragging.current||!onSeek) return; onSeek(getPct(e.clientX,e.clientY)); };
  const onMouseUp   = () => { dragging.current=false; setIsDragging(false); };

  // Touch events — need non-passive to call preventDefault (stops page scroll during drag)
  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    const tStart = e => {
      const t=e.touches[0]; if (!onSeek||isRadio||!nearRing(t.clientX,t.clientY)) return;
      dragging.current=true; setIsDragging(true); onSeek(getPct(t.clientX,t.clientY)); e.preventDefault();
    };
    const tMove = e => {
      if (!dragging.current||!onSeek) return;
      const t=e.touches[0]; onSeek(getPct(t.clientX,t.clientY)); e.preventDefault();
    };
    const tEnd = () => { dragging.current=false; setIsDragging(false); };
    svg.addEventListener('touchstart', tStart, { passive:false });
    svg.addEventListener('touchmove',  tMove,  { passive:false });
    svg.addEventListener('touchend',   tEnd);
    return () => { svg.removeEventListener('touchstart',tStart); svg.removeEventListener('touchmove',tMove); svg.removeEventListener('touchend',tEnd); };
  }, [onSeek, duration, size]); // eslint-disable-line

  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      {/* Album art */}
      <div style={{ position:'absolute', top:cy-artR, left:cx-artR, width:artR*2, height:artR*2, borderRadius:'50%', overflow:'hidden', border:`3px solid ${(isRadio&&!cover)?color+'60':'rgba(255,255,255,0.13)'}`, boxShadow:isLite?'none':`0 0 40px -8px ${color}90`, animation:(!isLite && coverSpin && isPlaying && (!isRadio||!!cover))?'spin20 20s linear infinite':'none', zIndex:2 }}>
        {(isRadio && !cover)
          ? <div style={{ width:'100%', height:'100%', background:`linear-gradient(135deg,${color}30,${color}18)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, position:'relative' }}>
              <Radio size={artR*0.45} color={color}/>
              <div style={{ fontSize:artR*0.14, fontWeight:800, color:color, textTransform:'uppercase', letterSpacing:'0.12em' }}>LIVE</div>
              {isPlaying && !isLite && <div style={{ position:'absolute', width:'100%', height:'100%', borderRadius:'50%', boxShadow:`inset 0 0 ${artR*0.3}px ${color}40` }}/>}
            </div>
          : isLite
            ? <div style={{ width:'100%', height:'100%', background:color+'33', display:'flex', alignItems:'center', justifyContent:'center' }}><Music size={artR*0.6} color={color}/></div>
            : <img src={cover} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
        {/* ── Fase CHECK — scanning overlay, audio sudah diputar via stream */}
        {drivePhase === 'check' && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:artR*0.1, background:'rgba(7,7,26,0.75)', ...(isLite?{}:{backdropFilter:'blur(3px)'}) }}>
            {/* Pulse rings — hanya Lite yang pakai ikon statis; Pro tanpa pulse-ring */}
            <div style={{ position:'relative', width:artR*0.7, height:artR*0.7, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:artR*0.22, height:artR*0.22, borderRadius:'50%', background:`${color}33`, border:`2px solid ${color}88`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:artR*0.1, height:artR*0.1, borderRadius:'50%', background:color, boxShadow:isLite?'none':`0 0 8px ${color}` }}/>
              </div>
            </div>
            <div style={{ fontSize:artR*0.13, fontWeight:700, color:'rgba(255,255,255,0.8)', letterSpacing:'0.05em', textAlign:'center' }}>{isLite ? '✓ Cache' : 'Checking…'}</div>
          </div>
        )}
        {/* ── Fase DOWNLOAD — circular progress bar */}
        {drivePhase === 'download' && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:artR*0.1, background:'rgba(7,7,26,0.62)', ...(isLite ? {} : { backdropFilter:'blur(3px)' }) }}>
            <svg width={artR*0.85} height={artR*0.85} style={{ flexShrink:0 }}>
              {(() => {
                const r = artR*0.34, c = artR*0.425, circ2 = 2*Math.PI*r;
                const pct2 = (downloadProg||0)/100;
                return (<>
                  <circle cx={c} cy={c} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth="4" fill="none"/>
                  <circle cx={c} cy={c} r={r} stroke={color} strokeWidth="4" fill="none"
                    strokeDasharray={circ2} strokeDashoffset={circ2 - circ2*pct2}
                    strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`}
                    style={{ transition:'stroke-dashoffset 0.3s ease', filter:`drop-shadow(0 0 4px ${color})` }}/>
                  <text x={c} y={c+1} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={artR*0.18} fontWeight="800" fontFamily="monospace">
                    {downloadProg > 0 ? `${downloadProg}%` : '…'}
                  </text>
                </>);
              })()}
            </svg>
            <div style={{ fontSize:artR*0.13, fontWeight:700, color:'rgba(255,255,255,0.75)', letterSpacing:'0.04em', textAlign:'center', padding:'0 6px' }}>
              Downloading…
            </div>
          </div>
        )}
        {/* ── YT Audio Download — overlay kecil di pojok kanan bawah cover saat download audio love */}
        {ytDownloading && drivePhase === 'idle' && (
          <div style={{ position:'absolute', bottom:6, right:6, display:'flex', alignItems:'center', gap:4, background:'rgba(7,7,26,0.82)', borderRadius:999, padding:'3px 7px 3px 5px' }}>
            <svg width={artR*0.28} height={artR*0.28} style={{ flexShrink:0 }}>
              {(() => {
                const r2 = artR*0.1, c2 = artR*0.14, ci = 2*Math.PI*r2;
                const p2 = (ytDlProg||0)/100;
                return (<>
                  <circle cx={c2} cy={c2} r={r2} stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" fill="none"/>
                  <circle cx={c2} cy={c2} r={r2} stroke="#60a5fa" strokeWidth="2.5" fill="none"
                    strokeDasharray={ci} strokeDashoffset={ci - ci*p2}
                    strokeLinecap="round" transform={`rotate(-90 ${c2} ${c2})`}
                    style={{ transition:'stroke-dashoffset 0.3s ease' }}/>
                </>);
              })()}
            </svg>
            <span style={{ fontSize:Math.max(8, artR*0.12), fontWeight:800, color:'#93c5fd', letterSpacing:'0.02em' }}>
              {ytDlProg > 0 ? `${ytDlProg}%` : '…'}
            </span>
          </div>
        )}
      </div>
      <svg ref={svgRef} width={size} height={size}
        style={{ position:'absolute', inset:0, zIndex:3, overflow:'visible', cursor:(!isRadio&&onSeek)?'grab':'default', touchAction:'none' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        {/* Wide invisible hit area */}
        <circle cx={cx} cy={cy} r={ringR} stroke="transparent" strokeWidth="44" fill="none"/>
        {/* Track */}
        <circle cx={cx} cy={cy} r={ringR} stroke="rgba(255,255,255,0.09)" strokeWidth="3.5" fill="none"/>
        {/* Radio: spinning dashed ring. Normal: progress arc */}
        {isRadio ? (
          <g style={{ transformOrigin:`${cx}px ${cy}px`, animation: isPlaying ? 'spin 3s linear infinite' : 'none' }}>
            <circle cx={cx} cy={cy} r={ringR} stroke={color} strokeWidth="4.5" fill="none"
              strokeDasharray={`${circ*0.35} ${circ*0.65}`} strokeLinecap="round"
              style={{ filter:isLite?'none':`drop-shadow(0 0 6px ${color})` }}/>
          </g>
        ) : (
          <circle className="progress-arc" cx={cx} cy={cy} r={ringR} stroke={color} strokeWidth="4.5" fill="none"
            strokeDasharray={circ} strokeDashoffset={circ-circ*pct} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: isDragging?'none':'stroke-dashoffset 0.35s linear', filter:isLite?'none':`drop-shadow(0 0 6px ${color})` }}/>
        )}
        {/* 0:00 tick — hide for radio */}
        {!isRadio && <line x1={cx} y1={cy-ringR-7} x2={cx} y2={cy-ringR+7} stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" strokeLinecap="round"/>}
        {/* Dot glow — hide for radio */}
        {!isRadio && <circle cx={dotX} cy={dotY} r={14} fill={color} opacity="0.15"/>}
        {/* Draggable dot — hide for radio */}
        {!isRadio && <circle cx={dotX} cy={dotY} r={7} fill="white"
          style={{ filter:isLite?'none':'drop-shadow(0 0 8px rgba(255,255,255,1))', cursor:'grab' }}/>}
        {/* Current time — hide for radio */}
        {!isRadio && pct>0.01&&<text x={lblX} y={lblY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="monospace" style={{ filter:'drop-shadow(0 1px 5px rgba(0,0,0,1))', pointerEvents:'none' }}>{fmt(progress)}</text>}
        {/* Duration / LIVE label */}
        {isRadio
          ? <text x={cx} y={cy+ringR+20} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="10" fontWeight="800" fontFamily="monospace" style={{ pointerEvents:'none', letterSpacing:'0.12em' }}>● LIVE</text>
          : <text x={cx} y={durY} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.28)" fontSize="10" fontWeight="600" fontFamily="monospace" style={{ pointerEvents:'none' }}>{duration>0?fmt(duration):'--:--'}</text>
        }
        {/* Start label — hide for radio */}
        {!isRadio && <text x={cx} y={cy-ringR-20} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.18)" fontSize="10" fontWeight="600" fontFamily="monospace" style={{ pointerEvents:'none' }}>0:00</text>}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SONG ROW
// ═══════════════════════════════════════════════════════



export { AppLogo, OrbitalRing };
