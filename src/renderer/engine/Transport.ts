import type { Clock } from './clock';

export type TransportEvent = 'play' | 'pause' | 'seek' | 'rate' | 'end';

export type TransportState = {
  playing: boolean;
  rate: number;
  start: number;
  duration: number;
};

export const MIN_RATE = 0.25;
export const MAX_RATE = 1.5;

export class Transport {
  private anchorPosition: number;
  private anchorTime = 0;
  private gate: number | null = null;
  private state: TransportState;
  private listeners = new Set<(event: TransportEvent) => void>();

  constructor(
    private readonly clock: Clock,
    options: { duration: number; start?: number },
  ) {
    const start = options.start ?? 0;
    this.anchorPosition = start;
    this.state = { playing: false, rate: 1, start, duration: options.duration };
  }

  getState = (): TransportState => this.state;

  subscribe = (listener: (event: TransportEvent) => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  position(): number {
    const raw = this.state.playing
      ? this.anchorPosition + (this.clock.now() - this.anchorTime) * this.state.rate
      : this.anchorPosition;
    const clamped = Math.min(raw, this.state.duration);
    return this.gate === null ? clamped : Math.min(clamped, this.gate);
  }

  getGate(): number | null {
    return this.gate;
  }

  setGate(time: number | null): void {
    if (time === this.gate) return;
    this.reanchor();
    this.gate = time;
  }

  toClockTime(songTime: number): number {
    return this.anchorTime + (songTime - this.anchorPosition) / this.state.rate;
  }

  play(): void {
    if (this.state.playing) return;
    // Replaying from the end is a seek; schedulers and practice must rewind with it.
    if (this.anchorPosition >= this.state.duration) this.seek(this.state.start);
    this.anchorTime = this.clock.now();
    this.update({ playing: true }, 'play');
  }

  pause(): void {
    if (!this.state.playing) return;
    this.reanchor();
    this.update({ playing: false }, 'pause');
  }

  toggle(): void {
    if (this.state.playing) this.pause();
    else this.play();
  }

  seek(time: number): void {
    // A gate belongs to the old position; listeners set a new one on 'seek'.
    this.gate = null;
    this.anchorPosition = Math.min(Math.max(time, this.state.start), this.state.duration);
    this.anchorTime = this.clock.now();
    this.emit('seek');
  }

  setRate(rate: number): void {
    this.reanchor();
    this.update({ rate: Math.min(Math.max(rate, MIN_RATE), MAX_RATE) }, 'rate');
  }

  tick(): void {
    if (this.state.playing && this.position() >= this.state.duration) {
      this.reanchor();
      this.update({ playing: false }, 'end');
    }
  }

  private reanchor(): void {
    this.anchorPosition = this.position();
    this.anchorTime = this.clock.now();
  }

  private update(patch: Partial<TransportState>, event: TransportEvent): void {
    this.state = { ...this.state, ...patch };
    this.emit(event);
  }

  private emit(event: TransportEvent): void {
    for (const listener of this.listeners) listener(event);
  }
}
