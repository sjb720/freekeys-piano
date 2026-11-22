import { describe, expect, it } from 'vitest';
import { handsByMajority, resolveHand } from './handOverride';
import { noteName, pitchClassName } from './noteName';

describe('resolveHand', () => {
  const note = { pitch: 62, autoHand: 'left' as const, track: 1 };

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

  it('assigns by track, keeping the detected hand for unlisted tracks', () => {
    expect(resolveHand(note, { kind: 'tracks', hands: { 1: 'right' } })).toBe('right');
    expect(resolveHand(note, { kind: 'tracks', hands: { 2: 'right' } })).toBe('left');
  });

  it('survives a JSON round trip with string keys', () => {
    const stored = JSON.parse(JSON.stringify({ kind: 'tracks', hands: { 1: 'right' } }));
    expect(resolveHand(note, stored)).toBe('right');
  });
});

describe('handsByMajority', () => {
  it('starts each track on the hand most of its notes were detected in', () => {
    const notes = [
      { track: 0, autoHand: 'right' as const },
      { track: 1, autoHand: 'left' as const },
      { track: 1, autoHand: 'left' as const },
      { track: 1, autoHand: 'right' as const },
    ];
    expect(handsByMajority(notes)).toEqual({ 0: 'right', 1: 'left' });
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
