import { useEffect, useMemo } from 'react';
import { useSetting } from '@renderer/state/settingsStore';
import { applyTheme } from './apply';
import { getTheme } from './registry';
import type { Theme } from './schema';

export function useActiveTheme(): Theme {
  const id = useSetting('theme');
  return useMemo(() => getTheme(id), [id]);
}

export function useThemeSync(): void {
  const theme = useActiveTheme();
  useEffect(() => applyTheme(theme), [theme]);
}
