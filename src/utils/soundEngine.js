export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type, isP1 = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'tap') {
        osc.type = 'sine';
        const baseFreq = isP1 ? 520 : 680;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq / 2, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'claim') {
        const freqs = isP1 ? [440, 554.37, 659.25, 880] : [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
          const subOsc = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          subOsc.type = 'triangle';
          subOsc.frequency.value = freq;
          subOsc.connect(subGain);
          subGain.connect(this.ctx.destination);

          const startTime = now + (idx * 0.05);
          subGain.gain.setValueAtTime(0.2, startTime);
          subGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
          subOsc.start(startTime);
          subOsc.stop(startTime + 0.22);
        });
      } else if (type === 'block') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'win') {
        const fanFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        fanFreqs.forEach((freq, idx) => {
          const subOsc = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.value = freq;
          subOsc.connect(subGain);
          subGain.connect(this.ctx.destination);

          const startTime = now + (idx * 0.08);
          const dur = idx === fanFreqs.length - 1 ? 0.6 : 0.2;
          subGain.gain.setValueAtTime(0.25, startTime);
          subGain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
          subOsc.start(startTime);
          subOsc.stop(startTime + dur);
        });
      }
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  }
}
