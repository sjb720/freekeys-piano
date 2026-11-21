import { SETTINGS } from '@shared/settings';
import type { Theme } from './schema';
import dark from './presets/dark.json';
import light from './presets/light.json';

export const THEMES: readonly Theme[] = [dark as Theme, light as Theme];
export const DEFAULT_THEME_ID = SETTINGS.theme.default;

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}
