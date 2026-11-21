import { COLOR_TOKENS, colorVarName, type Theme } from './schema';

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  for (const token of COLOR_TOKENS)
    root.style.setProperty(colorVarName(token), theme.colors[token]);
  root.style.colorScheme = theme.scheme;
  root.dataset['theme'] = theme.id;
}
