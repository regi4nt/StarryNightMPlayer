import React from 'react';

function PlatformLogo({ id, size = 22 }) {
  if (id === 'ytmusic') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5" fill="#FF0000"/>
      <circle cx="12" cy="13" r="5" fill="white"/>
      <circle cx="12" cy="13" r="2" fill="#FF0000"/>
      <rect x="8" y="4" width="8" height="2.5" rx="1.25" fill="white"/>
    </svg>
  );
  if (id === 'soundcloud') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5" fill="#ff5500"/>
      <path d="M2.5 14.5c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2c-.18 0-.35.02-.52.06C3.64 11.42 4.72 10.5 6 10.5c.28 0 .55.05.8.13V8.57C6.54 8.52 6.27 8.5 6 8.5c-2.49 0-4.5 2.01-4.5 4.5 0 .52.09 1.01.25 1.5H2.5z" fill="white" opacity="0.5"/>
      <rect x="5.5" y="10" width="2" height="7" rx="1" fill="white"/>
      <rect x="8.5" y="8.5" width="2" height="8.5" rx="1" fill="white"/>
      <rect x="11.5" y="7" width="2" height="10" rx="1" fill="white"/>
      <rect x="14.5" y="8" width="2" height="9" rx="1" fill="white"/>
      <rect x="17.5" y="9.5" width="2" height="7.5" rx="1" fill="white"/>
    </svg>
  );
  if (id === 'spotify') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#1DB954"/>
      <path d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15C9.65 6.8 15.5 7 19.1 9.15c.45.25.6.85.35 1.3-.25.35-.85.5-1.55.45zM17.75 13.55c-.2.35-.65.45-1 .25-2.65-1.6-6.65-2.05-9.75-1.1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.55-1.1 7.95-.55 11 1.3.3.15.4.6.15.95zM16.6 16.1c-.15.3-.5.4-.8.25-2.3-1.4-5.2-1.7-8.6-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.75-.85 6.95-.5 9.5 1.1.35.15.4.5.2.8z" fill="white"/>
    </svg>
  );
  if (id === 'radio') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#f59e0b"/>
      <rect x="3" y="10" width="18" height="11" rx="2.5" fill="white" fillOpacity="0.9"/>
      <circle cx="9" cy="15.5" r="2.5" fill="#f59e0b"/>
      <circle cx="9" cy="15.5" r="1" fill="white"/>
      <rect x="13" y="13.5" width="5" height="1.2" rx="0.6" fill="#f59e0b" fillOpacity="0.7"/>
      <rect x="13" y="15.5" width="3.5" height="1.2" rx="0.6" fill="#f59e0b" fillOpacity="0.7"/>
      <line x1="7" y1="10" x2="13" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="13.5" cy="3.5" r="1.5" fill="white"/>
    </svg>
  );
  if (id === 'websearch') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#6366f1"/>
      <circle cx="12" cy="11" r="5.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <path d="M12 5.5C12 5.5 10 7.5 10 11C10 14.5 12 16.5 12 16.5" stroke="white" strokeWidth="1.2" fill="none"/>
      <path d="M12 5.5C12 5.5 14 7.5 14 11C14 14.5 12 16.5 12 16.5" stroke="white" strokeWidth="1.2" fill="none"/>
      <line x1="6.5" y1="9" x2="17.5" y2="9" stroke="white" strokeWidth="1.2"/>
      <line x1="6.5" y1="13" x2="17.5" y2="13" stroke="white" strokeWidth="1.2"/>
      <line x1="16.5" y1="15.5" x2="19.5" y2="18.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
  return <span style={{ fontSize: size * 0.75 }}>🎵</span>;
}

// ── Tetap ada MUSIC_SOURCES kosong agar kode lain tidak error

export { PlatformLogo };
