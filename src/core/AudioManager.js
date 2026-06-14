
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
  }
  setSource(url, mode, sourceId) {
    const sameSource = this.audio.src === url && this.mode === mode && this.sourceId === sourceId;
    if (sameSource) return false;
    this.audio.pause();
    this.audio.src = url;
    if (mode !== 'radio') this.audio.load();
    this.mode = mode;
    this.sourceId = sourceId;
    return true;
  }
  async playRadio() {
    const a = this.audio;
    if (a.readyState >= 1) return a.play();
    return new Promise((resolve,reject)=>{
      const start = async ()=>{
        cleanup();
        try { await a.play(); resolve(); } catch(e){ reject(e); }
      };
      const cleanup=()=>{
        a.removeEventListener('loadedmetadata', start);
        a.removeEventListener('canplay', start);
      };
      a.addEventListener('loadedmetadata', start, {once:true});
      a.addEventListener('canplay', start, {once:true});
    });
  }
  attach(event, handler){ this.detach(event); this.audio.addEventListener(event, handler); this.listeners.set(event, handler); }
  detach(event){ const old=this.listeners.get(event); if(!old) return; this.audio.removeEventListener(event, old); this.listeners.delete(event); }
  removeAllListeners(){ for (const [e,h] of this.listeners.entries()) this.audio.removeEventListener(e,h); this.listeners.clear(); }
}
export default AudioManager;
