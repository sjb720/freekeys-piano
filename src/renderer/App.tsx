import { useEffect } from 'react';
import { useMidiInputSync } from './input';
import { Router } from './router';
import { startLibrarySync } from './state/libraryStore';
import { initProfiles } from './state/profileStore';
import { useThemeSync } from './themes';

export function App() {
  useThemeSync();
  useMidiInputSync();
  useEffect(() => {
    startLibrarySync();
    void initProfiles();
  }, []);
  return <Router />;
}
