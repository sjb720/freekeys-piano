import { lowerBound, type Note, type Song } from '@shared/song';
import type { Clock } from './clock';
import type { Transport } from './Transport';

export type NoteSink = {
  play(pitch: number, velocity: number, when: number, duration: number): void;
  stopAll(): void;
};

export const LOOKAHEAD = 0.12;

export class Scheduler {
  private cursor = 0;

  constructor(
    private readonly song: Song,
    private readonly transport: Transport,
    private readonly clock: Clock,
    private readonly sink: NoteSink,
    private readonly shouldPlay: (note: Note) => boolean = () => true,
  ) {
    this.cursor = transport.position();
  }

  reset(): void {
    this.sink.stopAll();
    this.cursor = this.transport.position();
  }

  update(): void {
    const { playing, rate } = this.transport.getState();
    if (!playing) return;

    const until = this.transport.position() + LOOKAHEAD * rate;
    const notes = this.song.notes;
    const now = this.clock.now();

    for (let i = lowerBound(notes, this.cursor); i < notes.length; i++) {
      const note = notes[i]!;
      if (note.start >= until) break;
      if (!this.shouldPlay(note)) continue;
      const when = Math.max(this.transport.toClockTime(note.start), now);
      this.sink.play(note.pitch, note.velocity, when, note.duration / rate);
    }
    this.cursor = Math.max(this.cursor, until);
  }
}
