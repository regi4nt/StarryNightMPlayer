
export default class StreamWatchdog {
  start(audio,onStall){
    this.lastProgress = Date.now();
    const progressHandler = ()=>{ this.lastProgress = Date.now(); };
    audio.addEventListener('progress', progressHandler);
    this.cleanup=()=>audio.removeEventListener('progress', progressHandler);
    this.timer=setInterval(()=>{
      const stalled = !audio.paused && audio.readyState < 3 && (Date.now()-this.lastProgress)>15000;
      if(stalled) onStall?.();
    },5000);
  }
  stop(){ clearInterval(this.timer); this.cleanup?.(); }
}
