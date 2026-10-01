/** Tiny WebAudio synth: engine hum, coin/fuel chimes, crash thud. */
export class Sfx {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private master: GainNode | null = null;
  muted = false;

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.5, this.ctx.currentTime, 0.02);
  }

  /** Continuous engine hum; call every frame while playing. */
  engine(on: boolean, speedFactor: number) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    if (on && !this.engineOsc) {
      this.engineOsc = ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineGain = ctx.createGain();
      this.engineGain.gain.value = 0;
      this.engineOsc.connect(this.engineGain).connect(this.master);
      this.engineOsc.start();
    }
    if (this.engineOsc && this.engineGain) {
      const t = ctx.currentTime;
      this.engineOsc.frequency.setTargetAtTime(50 + speedFactor * 90, t, 0.05);
      this.engineGain.gain.setTargetAtTime(on ? 0.09 : 0, t, 0.08);
    }
  }

  private blip(freq: number, dur: number, type: OscillatorType, vol = 0.2, when = 0) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  coin() { this.blip(880, 0.09, 'square', 0.12); this.blip(1320, 0.12, 'square', 0.12, 0.07); }
  fuel() { this.blip(330, 0.14, 'triangle', 0.25); this.blip(495, 0.2, 'triangle', 0.25, 0.12); }
  flip() { this.blip(660, 0.1, 'square', 0.14); this.blip(990, 0.14, 'square', 0.14, 0.08); }
  crash() { this.blip(90, 0.4, 'sawtooth', 0.4); this.blip(55, 0.5, 'triangle', 0.35, 0.05); }
  click() { this.blip(520, 0.06, 'square', 0.12); }
}
