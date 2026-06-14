
export default class StreamWatchdog {
  start(audio,onStall){
    this.lastTime = audio.currentTime || 0;
    this.stallCount = 0;
    this.timer=setInterval(()=>{
      const stuck = !audio.paused &&
        audio.readyState < 3 &&
        (audio.currentTime || 0) === this.lastTime;

      this.lastTime = audio.currentTime || 0;

      if(stuck){
        this.stallCount++;
        if(this.stallCount >= 3){
          this.stallCount = 0;
          onStall?.();
        }
      } else {
        this.stallCount = 0;
      }
    },5000);
  }
  stop(){
    clearInterval(this.timer);
  }
}
