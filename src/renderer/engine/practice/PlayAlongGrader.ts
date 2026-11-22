import { lowerBound, type Note } from '@shared/song';

export const HIT_WINDOW = 0.15;

export type GradeResult = { judgement: 'correct' | 'wrong'; noteId?: number; error?: number };

export class PlayAlongGrader {
  private matched = new Set<number>();
  private missCursor = 0;

  constructor(private readonly notes: readonly Note[]) {}

  reset(position: number): void {
    this.missCursor = lowerBound(this.notes, position);
    for (let i = this.missCursor; i < this.notes.length; i++)
      this.matched.delete(this.notes[i]!.id);
  }

  onNoteOn(pitch: number, position: number, rate: number): GradeResult {
    const window = HIT_WINDOW * rate;
    let best: Note | undefined;
    for (let i = lowerBound(this.notes, position - window); i < this.notes.length; i++) {
      const note = this.notes[i]!;
      if (note.start > position + window) break;
      if (note.pitch !== pitch || this.matched.has(note.id)) continue;
      if (!best || Math.abs(note.start - position) < Math.abs(best.start - position)) best = note;
    }
    if (!best) return { judgement: 'wrong' };
    this.matched.add(best.id);
    return { judgement: 'correct', noteId: best.id, error: (position - best.start) / rate };
  }

  collectMisses(position: number, rate: number): number {
    const window = HIT_WINDOW * rate;
    let misses = 0;
    while (this.missCursor < this.notes.length) {
      const note = this.notes[this.missCursor]!;
      if (note.start + window >= position) break;
      if (!this.matched.has(note.id)) misses++;
      this.missCursor++;
    }
    return misses;
  }
}
