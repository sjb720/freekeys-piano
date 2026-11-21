const CLICK = 0.03;
const FREQ = { accent: 1760, beat: 1320 };

export class Metronome {
  constructor(
    private readonly ctx: AudioContext,
    private readonly output: AudioNode,
  ) {}

  click(when: number, accent: boolean): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = accent ? FREQ.accent : FREQ.beat;
    gain.gain.setValueAtTime(accent ? 0.5 : 0.3, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + CLICK);
    osc.connect(gain).connect(this.output);
    osc.start(when);
    osc.stop(when + CLICK + 0.01);
    osc.onended = () => gain.disconnect();
  }
}
