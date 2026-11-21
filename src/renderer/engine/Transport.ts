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
    if (!this.state.playing) return this.anchorPosition;
    const elapsed = (this.clock.now() - this.anchorTime) * this.state.rate;
    return Math.min(this.anchorPosition + elapsed, this.state.duration);
  }

  toClockTime(songTime: number): number {
    return this.anchorTime + (songTime - this.anchorPosition) / this.state.rate;
  }

  play(): void {
    if (this.state.playing) return;
    if (this.anchorPosition >= this.state.duration) this.anchorPosition = this.state.start;
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
