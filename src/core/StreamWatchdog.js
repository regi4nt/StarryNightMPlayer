
export default class StreamWatchdog {
  start(audio,onStall){
    this.timer=setInterval(()=>{
      if(!audio.paused && audio.readyState < 3){
        onStall?.();
      }
    },5000);
  }
  stop(){
    clearInterval(this.timer);
  }
}
