import type { DifficultyFactor } from '@shared/analysis';
import type { SongSource } from '@shared/ipc';
import { bandOf, LEVEL_BANDS } from '@shared/library';
import type { Tone } from '@renderer/ui';

const BAND_TONE = { beginner: 'success', intermediate: 'warning', advanced: 'danger' } as const;

export const levelTone = (level: number): Tone => BAND_TONE[bandOf(level)];
export const levelLabel = (level: number) => LEVEL_BANDS[bandOf(level)].label;

export const factorText = (factor: DifficultyFactor) =>
  factor.hand ? `${factor.label} (${factor.hand} hand)` : factor.label;

export const SOURCE_LABEL: Record<SongSource, string> = {
  bundled: 'Included',
  library: 'Library',
  imported: 'Added',
  file: 'Opened file',
};
