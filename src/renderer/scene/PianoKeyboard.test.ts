import { describe, expect, it } from 'vitest';
import { labelFor } from './PianoKeyboard';

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
