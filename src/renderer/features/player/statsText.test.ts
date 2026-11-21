import { describe, expect, it } from 'vitest';
import { EMPTY_STATS } from '@renderer/engine/practice';
import { statsText } from './statsText';

describe('statsText', () => {
  it('hides stats in watch mode', () => {
    expect(statsText('watch', EMPTY_STATS)).toBeNull();
  });

  it('formats wait and play-along stats', () => {
    const stats = { hits: 9, misses: 2, wrong: 1, accuracy: 0.75 };
    expect(statsText('wait', stats)).toBe('Accuracy 75% · 9 correct · 1 wrong');
    expect(statsText('playAlong', stats)).toBe('Accuracy 75% · 9 correct · 1 wrong · 2 missed');
  });
});
