import { lowerBound, type Timed } from '@shared/song';
import type { Clock } from './clock';
import type { Transport } from './Transport';

export const LOOKAHEAD = 0.12;

export class EventScheduler<T extends Timed> {
  private cursor: number;

  constructor(
    private readonly events: readonly T[],
    private readonly transport: Transport,
    private readonly clock: Clock,
    private readonly emit: (event: T, when: number, rate: number) => void,
  ) {
    this.cursor = transport.position();
  }

  reset(): void {
    this.cursor = this.transport.position();
  }

  update(): void {
    const { playing, rate } = this.transport.getState();
    if (!playing) return;

    const gate = this.transport.getGate();
    const until = Math.min(this.transport.position() + LOOKAHEAD * rate, gate ?? Infinity);
    const now = this.clock.now();

    for (let i = lowerBound(this.events, this.cursor); i < this.events.length; i++) {
      const event = this.events[i]!;
      if (event.start >= until) break;
      this.emit(event, Math.max(this.transport.toClockTime(event.start), now), rate);
    }
    this.cursor = Math.max(this.cursor, until);
  }
}
