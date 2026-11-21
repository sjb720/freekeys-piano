import { describe, expect, it } from 'vitest';
import { THEMES } from './registry';
import { COLOR_TOKENS, colorVarName } from './schema';

const COLOR = /^(#[0-9a-f]{6}([0-9a-f]{2})?|rgba?\([^)]+\))$/i;

describe('theme presets', () => {
  it.each(THEMES.map((t) => [t.id, t] as const))('%s defines exactly the token set', (_, theme) => {
    expect(Object.keys(theme.colors).sort()).toEqual([...COLOR_TOKENS].sort());
  });

  it.each(THEMES.map((t) => [t.id, t] as const))('%s uses valid color values', (_, theme) => {
    for (const value of Object.values(theme.colors)) expect(value).toMatch(COLOR);
  });

  it('has unique ids', () => {
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(THEMES.length);
  });
});

describe('colorVarName', () => {
  it('kebab-cases tokens', () => {
    expect(colorVarName('surfaceRaised')).toBe('--color-surface-raised');
  });
});
