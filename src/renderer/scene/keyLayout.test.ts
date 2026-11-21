import { describe, expect, it } from 'vitest';
import { fitKeyRange, isBlackKey, layoutKeys } from './keyLayout';

describe('isBlackKey', () => {
  it('classifies an octave', () => {
    const blacks = Array.from({ length: 12 }, (_, i) => 60 + i).filter(isBlackKey);
    expect(blacks).toEqual([61, 63, 66, 68, 70]);
  });
});

describe('fitKeyRange', () => {
  it('pads and snaps to whole octaves', () => {
    expect(fitKeyRange(60, 72)).toEqual({ low: 48, high: 83 });
  });

  it('clamps to the 88-key range', () => {
    expect(fitKeyRange(21, 108)).toEqual({ low: 21, high: 108 });
  });
});

describe('layoutKeys', () => {
  const layout = layoutKeys({ low: 60, high: 71 }, 700);

  it('splits width evenly across white keys', () => {
    expect(layout.whiteWidth).toBe(100);
    expect(layout.byPitch[64]).toMatchObject({ x: 200, width: 100, black: false });
  });

  it('centers black keys on the boundary', () => {
    expect(layout.byPitch[61]).toMatchObject({ x: 70, width: 60, black: true });
  });

  it('orders white keys before black keys for drawing', () => {
    const firstBlack = layout.keys.findIndex((k) => k.black);
    expect(layout.keys.slice(firstBlack).every((k) => k.black)).toBe(true);
    expect(layout.keys).toHaveLength(12);
  });
});
