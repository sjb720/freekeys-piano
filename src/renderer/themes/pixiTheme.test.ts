import { describe, expect, it } from 'vitest';
import { parseColor, toPixiPalette } from './pixiTheme';
import { THEMES } from './registry';

describe('parseColor', () => {
  it('parses hex forms', () => {
    expect(parseColor('#ff8800')).toEqual({ color: 0xff8800, alpha: 1 });
    expect(parseColor('#f80')).toEqual({ color: 0xff8800, alpha: 1 });
    expect(parseColor('#ff880080').alpha).toBeCloseTo(0.5, 2);
  });

  it('parses rgb and rgba', () => {
    expect(parseColor('rgb(255, 136, 0)')).toEqual({ color: 0xff8800, alpha: 1 });
    expect(parseColor('rgba(5, 6, 10, 0.6)')).toEqual({ color: 0x05060a, alpha: 0.6 });
  });

  it('rejects unknown formats', () => {
    expect(() => parseColor('tomato')).toThrow();
  });
});

describe('toPixiPalette', () => {
  it('converts every preset', () => {
    for (const theme of THEMES) expect(() => toPixiPalette(theme)).not.toThrow();
  });
});
