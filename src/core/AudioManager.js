
class AudioManager {
  static instance;
  static getInstance() {
    if (!AudioManager.instance) AudioManager.instance = new AudioManager();
    return AudioManager.instance;
  }
  constructor() {
    this.audio = new Audio();
    this.listeners = new Map();
    this.mode = null;
    this.sourceId = null;
    this.lastSourceUrl = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 30000;
    this.lastTime = 0;
    this.lastProgressAt = Date.now();

    this.audio.preload = 'none';
    this.audio.crossOrigin = 'anonymous';

    const recover = () => this.scheduleReconnect();
    ['error','stalled','waiting','suspend','abort'].forEach(e => this.audio.addEventListener(e,recover));
    this.audio.addEventListener('timeupdate', () => {
      if (this.audio.currentTime !== this.lastTime) {
        this.lastTime = this.audio.currentTime;
        this.lastProgressAt = Date.now();
        this.reconnectAttempts = 0;
      }
    });

    this.watchdog = setInterval(() => {
      if (!this.lastSourceUrl || this.audio.paused) return;
      if (Date.now() - this.lastProgressAt > 20000) this.scheduleReconnect();
    }, 5000);
  }

  resolveUrl(url) {
    if (!url) return url;
    if (/^https:\/\//i.test(url)) return url;
    if (/^http:\/\//i.test(url)) return `/api/radio-proxy?url=${encodeURIComponent(url)}`;
    return url;
  }

  setSource(url, mode, sourceId) {
    const resolved = this.resolveUrl(url);
    if (this.audio.src === resolved && this.mode === mode && this.sourceId === sourceId) return;
    this.lastSourceUrl = url;
    this.audio.pause();
    this.audio.src = resolved;
    this.audio.load();
    this.mode = mode;
    this.sourceId = sourceId;
    this.reconnectAttempts = 0;
    this.lastProgressAt = Date.now();
  }

  scheduleReconnect() {
    if (!this.lastSourceUrl) return;
    clearTimeout(this.reconnectTimer);
    const delay = Math.min(3000 * (this.reconnectAttempts + 1), this.maxReconnectDelay);
    this.reconnectTimer = setTimeout(() => {
      const wasPlaying = !this.audio.paused;
      const resolved = this.resolveUrl(this.lastSourceUrl);
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      setTimeout(() => {
        this.audio.src = resolved;
        this.audio.load();
        if (wasPlaying) this.audio.play().catch(()=>{});
      }, 500);
      this.reconnectAttempts++;
    }, delay);
  }

  attach(event, handler) { this.detach(event); this.audio.addEventListener(event, handler); this.listeners.set(event, handler); }
  detach(event) { const old=this.listeners.get(event); if(!old) return; this.audio.removeEventListener(event, old); this.listeners.delete(event); }
  removeAllListeners() { for (const [e,h] of this.listeners.entries()) this.audio.removeEventListener(e,h); this.listeners.clear(); }
}
export default AudioManager;
