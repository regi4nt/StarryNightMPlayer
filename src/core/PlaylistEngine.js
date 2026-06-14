
export default class PlaylistEngine {
  constructor(audioManager){
    this.audioManager = audioManager;
    this.queue = [];
    this.index = 0;
  }
}
