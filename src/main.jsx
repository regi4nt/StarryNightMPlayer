import { createRoot } from 'react-dom/client';
import React from 'react';
import './index.css';
import App from './App.jsx';

// ── Top-level Error Boundary ──────────────────────────────────
// Mencegah seluruh halaman putih ketika ada komponen yang crash.
// Tampilkan pesan ramah + tombol reload alih-alih blank screen.
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Catat ke console agar mudah di-debug
    console.error('[RootErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0e0e14',
          color: 'rgba(255,255,255,0.75)',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          gap: '1rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40 }}>😔</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>
            Terjadi kesalahan yang tidak terduga
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 420 }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '10px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Muat Ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
