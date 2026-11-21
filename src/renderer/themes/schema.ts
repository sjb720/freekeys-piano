export const COLOR_TOKENS = [
  'bg',
  'surface',
  'surfaceRaised',
  'border',
  'text',
  'textMuted',
  'accent',
  'accentHover',
  'accentActive',
  'textOnAccent',
  'danger',
  'textOnDanger',
  'success',
  'warning',
  'focusRing',
  'overlay',
  'handLeft',
  'handRight',
  'keyWhite',
  'keyBlack',
  'keyPressed',
  'keyCorrect',
  'keyWrong',
  'highwayBg',
  'highwayGrid',
  'hitLine',
] as const;

export type ColorToken = (typeof COLOR_TOKENS)[number];

export type Theme = {
  id: string;
  name: string;
  scheme: 'light' | 'dark';
  colors: Record<ColorToken, string>;
};

const kebab = (token: string) => token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export const colorVarName = (token: ColorToken) => `--color-${kebab(token)}`;
export const colorVar = (token: ColorToken) => `var(${colorVarName(token)})`;
