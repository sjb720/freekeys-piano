import { describe, expect, it } from 'vitest';
import { resolveHand } from './handOverride';
import { noteName, pitchClassName } from './noteName';

describe('resolveHand', () => {
  const note = { pitch: 62, autoHand: 'left' as const };

  it('keeps the detected hand for auto', () => {
    expect(resolveHand(note, { kind: 'auto' })).toBe('left');
  });

  it('splits at a pitch, inclusive on the right', () => {
    expect(resolveHand(note, { kind: 'split', pitch: 62 })).toBe('right');
    expect(resolveHand(note, { kind: 'split', pitch: 63 })).toBe('left');
  });

  it('swaps the detected hand', () => {
    expect(resolveHand(note, { kind: 'swap' })).toBe('right');
  });
});

describe('noteName', () => {
  it('names pitches with octave numbers', () => {
    expect(noteName(60)).toBe('C4');
    expect(noteName(61)).toBe('C#4');
    expect(noteName(21)).toBe('A0');
    expect(noteName(108)).toBe('C8');
    expect(pitchClassName(70)).toBe('A#');
  });
});
