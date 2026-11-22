import { describe, expect, it } from 'vitest';
import { labelFor, noteLetter } from './labels';
import { noteLabelSize } from './NoteHighway';

describe('labelFor', () => {
  it('labels keys by mode', () => {
    expect(labelFor(60, false, 'off')).toBeNull();
    expect(labelFor(60, false, 'c')).toBe('C4');
    expect(labelFor(62, false, 'c')).toBeNull();
    expect(labelFor(62, false, 'white')).toBe('D');
    expect(labelFor(61, true, 'white')).toBeNull();
    expect(labelFor(61, true, 'all')).toBe('C#');
  });
});

describe('noteLetter', () => {
  it('drops the octave', () => {
    expect(noteLetter(60)).toBe('C');
    expect(noteLetter(69)).toBe('A');
    expect(noteLetter(61)).toBe('C#');
  });
});

describe('noteLabelSize', () => {
  it('fits the label to the note or skips it', () => {
    expect(noteLabelSize('D', 30, 40)).toBe(14);
    expect(noteLabelSize('C4', 20, 40)).toBeCloseTo(12.99, 2);
    expect(noteLabelSize('C#', 8, 40)).toBeNull();
    expect(noteLabelSize('D', 30, 10)).toBeNull();
  });
});
