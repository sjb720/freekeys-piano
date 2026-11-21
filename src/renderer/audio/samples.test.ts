import { describe, expect, it } from 'vitest';
import { nearestSample, playbackRateFor, SAMPLE_PITCHES } from './samples';

describe('samples', () => {
  it('covers A0 to C8 in minor thirds', () => {
    expect(SAMPLE_PITCHES[0]).toBe(21);
    expect(SAMPLE_PITCHES.at(-1)).toBe(108);
    expect(SAMPLE_PITCHES).toHaveLength(30);
  });

  it('picks the nearest sample', () => {
    expect(nearestSample(60)).toBe(60);
    expect(nearestSample(61)).toBe(60);
    expect(nearestSample(62)).toBe(63);
    expect(nearestSample(0)).toBe(21);
    expect(nearestSample(127)).toBe(108);
  });

  it('computes pitch-shift rate', () => {
    expect(playbackRateFor(72, 60)).toBeCloseTo(2);
    expect(playbackRateFor(60, 60)).toBe(1);
  });
});
