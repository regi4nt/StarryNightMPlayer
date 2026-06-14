
export default class RadioEngine {
  constructor(audioManager){
    this.audioManager = audioManager;
    this.collectionKey='radio_collection_v2';
  }
  playStation(station){
    const url = station.streamUrl || station.url;
    this.audioManager.setSource(url,'radio',station.id);
    return this.audioManager.audio.play?.().catch(()=>{});
  }
  saveStation(station){
    const list=this.getCollection();
    const exists=list.find(x=>x.id===station.id);
    if(!exists){
      list.push({
        id:station.id,name:station.name,streamUrl:station.streamUrl||station.url,
        favicon:station.favicon,country:station.country,codec:station.codec,
        bitrate:station.bitrate,source:station.source||'radio'
      });
      localStorage.setItem(this.collectionKey,JSON.stringify(list));
    }
  }
  getCollection(){
    try{return JSON.parse(localStorage.getItem(this.collectionKey)||'[]')}catch{return []}
  }
}
