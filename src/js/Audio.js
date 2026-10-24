export class Audio {
  constructor(){this.enabled=false;}
  toggle(){this.enabled=!this.enabled;if(this.enabled){try{this.context??=new (window.AudioContext||window.webkitAudioContext)();this.context.resume();}catch{this.enabled=false;}}return this.enabled;}
  play(frequency=440,duration=.12){if(!this.enabled||!this.context)return;const o=this.context.createOscillator(),g=this.context.createGain(),now=this.context.currentTime;o.type='square';o.frequency.setValueAtTime(frequency,now);g.gain.setValueAtTime(.035,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(this.context.destination);o.start();o.stop(now+duration);}
}
