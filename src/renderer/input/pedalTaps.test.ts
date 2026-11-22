import { describe, expect, it } from 'vitest';
import { PedalTaps, type PedalTap } from './pedalTaps';

const record = () => {
  const taps: PedalTap[] = [];
  return { taps, pedal: new PedalTaps((tap) => taps.push(tap)) };
};

describe('PedalTaps', () => {
  it('fires single on each press and double on a quick second press', () => {
    const { taps, pedal } = record();
    pedal.update(true, 0);
    pedal.update(false, 100);
    pedal.update(true, 300);
    pedal.update(false, 350);
    expect(taps).toEqual(['single', 'double']);
  });

  it('treats slow presses as separate singles', () => {
    const { taps, pedal } = record();
    pedal.update(true, 0);
    pedal.update(false, 100);
    pedal.update(true, 1000);
    expect(taps).toEqual(['single', 'single']);
  });

  it('ignores repeated down values from a half-pedal and starts fresh after a double', () => {
    const { taps, pedal } = record();
    pedal.update(true, 0);
    pedal.update(true, 20);
    pedal.update(false, 50);
    pedal.update(true, 150);
    pedal.update(false, 200);
    pedal.update(true, 300);
    expect(taps).toEqual(['single', 'double', 'single']);
  });
});
