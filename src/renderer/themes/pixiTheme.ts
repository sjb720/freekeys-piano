import { COLOR_TOKENS, type ColorToken, type Theme } from './schema';

export type PixiColor = { color: number; alpha: number };
export type PixiPalette = Record<ColorToken, PixiColor>;

export const TINT_NONE = 0xffffff;

const RGB_FN = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i;

export function parseColor(value: string): PixiColor {
  const v = value.trim();
  if (v.startsWith('#')) {
    let hex = v.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join('');
    const alpha = hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1;
    return { color: parseInt(hex.slice(0, 6), 16), alpha };
  }
  const m = v.match(RGB_FN);
  if (m) {
    const [r, g, b] = [m[1], m[2], m[3]].map((n) => Math.round(Number(n)));
    const a = m[4]?.endsWith('%') ? parseFloat(m[4]) / 100 : m[4] ? Number(m[4]) : 1;
    return { color: (r! << 16) | (g! << 8) | b!, alpha: a };
  }
  throw new Error(`Unsupported color "${value}"`);
}

export function toPixiPalette(theme: Theme): PixiPalette {
  return Object.fromEntries(
    COLOR_TOKENS.map((t) => [t, parseColor(theme.colors[t])]),
  ) as PixiPalette;
}
