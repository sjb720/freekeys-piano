import { describe, expect, it } from 'vitest';
import { separateHands, type HandNote } from './separateHands';

const n = (pitch: number, start: number, duration = 0.2): HandNote => ({ pitch, start, duration });
const sorted = (notes: HandNote[]) => [...notes].sort((a, b) => a.start - b.start);

describe('separateHands', () => {
  it('splits a two-hand chord between the hands', () => {
    expect(separateHands([n(48, 0), n(55, 0), n(64, 0), n(67, 0), n(72, 0)])).toEqual([
      'left',
      'left',
      'right',
      'right',
      'right',
    ]);
  });

  it('keeps a left-hand arpeggio left even above middle C', () => {
    const notes = sorted([
      n(79, 0, 2),
      ...[48, 52, 55, 60, 64, 60, 55, 52].map((p, i) => n(p, i * 0.25)),
      n(84, 2, 2),
    ]);
    const hands = separateHands(notes);
    const e4 = notes.findIndex((x) => x.pitch === 64);
    expect(hands[e4]).toBe('left');
    expect(hands[notes.findIndex((x) => x.pitch === 79)]).toBe('right');
  });

  it('keeps a right-hand melody right when it dips below middle C', () => {
    const notes = sorted([
      n(36, 0, 4),
      ...[67, 64, 62, 60, 59, 57, 59, 60].map((p, i) => n(p, i * 0.5, 0.45)),
    ]);
    const hands = separateHands(notes);
    expect(hands[notes.findIndex((x) => x.pitch === 57)]).toBe('right');
    expect(hands[notes.findIndex((x) => x.pitch === 36)]).toBe('left');
  });

  it('never gives one hand more than five notes', () => {
    const chord = [36, 40, 43, 48, 52, 55, 60, 64].map((p) => n(p, 0));
    const hands = separateHands(chord);
    expect(hands.filter((h) => h === 'left').length).toBeLessThanOrEqual(5);
    expect(hands.filter((h) => h === 'right').length).toBeLessThanOrEqual(5);
  });
});
