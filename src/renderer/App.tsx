import { useMidiInputSync } from './input';
import { Router } from './router';
import { useThemeSync } from './themes';

export function App() {
  useThemeSync();
  useMidiInputSync();
  return <Router />;
}
