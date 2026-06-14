
export default class PlaylistEngine {
  constructor(audioManager){
    this.audioManager = audioManager;
    this.queue = [];
    this.index = -1;
  }
  load(queue=[]){ this.queue = queue; this.index = queue.length ? 0 : -1; }
  current(){ return this.queue[this.index] || null; }
  play(item){
    const target = item || this.current();
    if(!target) return;
    const url = target.streamUrl || target.url;
    this.audioManager.setSource(url, target.type || 'track', target.id);
    this.audioManager.audio.play?.().catch(()=>{});
  }
  next(){
    if(this.index < this.queue.length-1){ this.index++; this.play(); }
  }
  prev(){
    if(this.index > 0){ this.index--; this.play(); }
  }
}
