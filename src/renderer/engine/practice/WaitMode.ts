import { lowerBound } from '@shared/song';
import type { Step } from './steps';

export type Judgement = 'correct' | 'wrong' | 'ignored';

export const EARLY_WINDOW = 0.3;

export class WaitMode {
  private index = 0;
  private hit = new Set<number>();

  constructor(private readonly steps: readonly Step[]) {}

  reset(position: number): void {
    this.index = lowerBound(this.steps, position - 1e-6);
    this.hit.clear();
  }

  gate(): number | null {
    return this.steps[this.index]?.start ?? null;
  }

  current(): Step | undefined {
    return this.steps[this.index];
  }

  onNoteOn(pitch: number, position: number, rate: number): Judgement {
    const step = this.steps[this.index];
    if (!step || position < step.start - EARLY_WINDOW * rate) return 'wrong';
    if (!step.pitches.has(pitch)) return 'wrong';
    if (this.hit.has(pitch)) return 'ignored';

    this.hit.add(pitch);
    if (this.hit.size === step.pitches.size) {
      this.index++;
      this.hit.clear();
    }
    return 'correct';
  }
}
