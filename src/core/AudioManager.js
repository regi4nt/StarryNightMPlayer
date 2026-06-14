
class AudioManager {
  static instance;

  static getInstance() {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  constructor() {
    this.audio = new Audio();
    this.listeners = new Map();
    this.mode = null;
    this.sourceId = null;
  }

  setSource(url, mode, sourceId) {
    if (this.audio.src === url && this.mode === mode && this.sourceId === sourceId) return;
    this.audio.pause();
    this.audio.src = url;
    this.audio.load();
    this.mode = mode;
    this.sourceId = sourceId;
  }

  attach(event, handler) {
    this.detach(event);
    this.audio.addEventListener(event, handler);
    this.listeners.set(event, handler);
  }

  detach(event) {
    const old = this.listeners.get(event);
    if (!old) return;
    this.audio.removeEventListener(event, old);
    this.listeners.delete(event);
  }

  removeAllListeners() {
    for (const [event, handler] of this.listeners.entries()) {
      this.audio.removeEventListener(event, handler);
    }
    this.listeners.clear();
  }
}

export default AudioManager;
