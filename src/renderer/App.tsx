import { useEffect } from 'react';
import { useMidiInputSync } from './input';
import { Router } from './router';
import { startLibrarySync } from './state/libraryStore';
import { useThemeSync } from './themes';

export function App() {
  useThemeSync();
  useMidiInputSync();
  useEffect(startLibrarySync, []);
  return <Router />;
}
