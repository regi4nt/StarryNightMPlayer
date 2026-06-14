
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

    const url = target.streamUrl || target.url || target.src;

    const isRadio =
      target.isRadio === true ||
      target.type === 'radio' ||
      String(target.id || '').startsWith('radio_') ||
      String(target.id || '').startsWith('rb_');

    this.audioManager.setSource(
      url,
      isRadio ? 'radio' : (target.type || 'track'),
      target.id
    );

    this.audioManager.audio.play?.().catch(()=>{});
  }
  next(){
    if(this.index < this.queue.length-1){ this.index++; this.play(); }
  }
  prev(){
    if(this.index > 0){ this.index--; this.play(); }
  }
}
