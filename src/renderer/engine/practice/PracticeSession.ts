import type { PracticeMode } from '@shared/settings';
import type { Note, Song } from '@shared/song';
import type { Transport } from '../Transport';
import { PlayAlongGrader } from './PlayAlongGrader';
import { buildSteps } from './steps';
import { WaitMode } from './WaitMode';

export type KeyFeedback = 'pressed' | 'correct' | 'wrong';

export type PracticeStats = {
  hits: number;
  misses: number;
  wrong: number;
  accuracy: number | null;
};

export const EMPTY_STATS: PracticeStats = { hits: 0, misses: 0, wrong: 0, accuracy: null };

export class PracticeSession {
  private readonly wait: WaitMode | null;
  private readonly grader: PlayAlongGrader | null;
  private readonly feedback = new Map<number, KeyFeedback>();
  private stats: PracticeStats = EMPTY_STATS;

  constructor(
    readonly mode: PracticeMode,
    song: Song,
    private readonly transport: Transport,
    readonly isActive: (note: Note) => boolean,
    private readonly onStats: (stats: PracticeStats) => void,
  ) {
    this.wait = mode === 'wait' ? new WaitMode(buildSteps(song.notes, isActive)) : null;
    this.grader = mode === 'playAlong' ? new PlayAlongGrader(song.notes.filter(isActive)) : null;
    this.reset();
  }

  reset(): void {
    const position = this.transport.position();
    this.wait?.reset(position);
    this.grader?.reset(position);
    this.transport.setGate(this.wait?.gate() ?? null);
  }

  update(): void {
    if (this.grader) {
      const { rate } = this.transport.getState();
      const misses = this.grader.collectMisses(this.transport.position(), rate);
      if (misses) this.record({ misses: this.stats.misses + misses });
    }
  }

  noteOn(pitch: number): void {
    const position = this.transport.position();
    const { rate } = this.transport.getState();

    if (this.wait) {
      const judgement = this.wait.onNoteOn(pitch, position, rate);
      if (judgement === 'ignored') return void this.feedback.set(pitch, 'correct');
      this.feedback.set(pitch, judgement);
      this.record(
        judgement === 'correct' ? { hits: this.stats.hits + 1 } : { wrong: this.stats.wrong + 1 },
      );
      this.transport.setGate(this.wait.gate());
    } else if (this.grader) {
      const { judgement } = this.grader.onNoteOn(pitch, position, rate);
      this.feedback.set(pitch, judgement);
      this.record(
        judgement === 'correct' ? { hits: this.stats.hits + 1 } : { wrong: this.stats.wrong + 1 },
      );
    } else {
      this.feedback.set(pitch, 'pressed');
    }
  }

  noteOff(pitch: number): void {
    this.feedback.delete(pitch);
  }

  keyFeedback(): ReadonlyMap<number, KeyFeedback> {
    return this.feedback;
  }

  waitingPitches(): ReadonlySet<number> | null {
    const step = this.wait?.current();
    return step && this.transport.position() >= step.start ? step.pitches : null;
  }

  dispose(): void {
    this.transport.setGate(null);
  }

  private record(patch: Partial<PracticeStats>): void {
    const next = { ...this.stats, ...patch };
    const total = next.hits + next.misses + next.wrong;
    this.stats = { ...next, accuracy: total ? next.hits / total : null };
    this.onStats(this.stats);
  }
}
