import { describe, expect, it } from 'vitest';
import { loopFrom, loopStartAt } from './loop';

const song = { measures: [0, 2, 4, 6], duration: 8 };

describe('loop helpers', () => {
  it('snaps the start to the containing measure', () => {
    expect(loopStartAt(song, 3.5)).toBe(2);
    expect(loopStartAt(song, -1)).toBe(0);
  });

  it('extends the end to the end of the containing measure', () => {
    expect(loopFrom(song, 2, 4.5)).toEqual({ start: 2, end: 6 });
    expect(loopFrom(song, 6, 7)).toEqual({ start: 6, end: 8 });
  });

  it('covers at least the start measure when the end is before the start', () => {
    expect(loopFrom(song, 4, 1)).toEqual({ start: 4, end: 6 });
  });
});
