import { Router } from './router';
import { useThemeSync } from './themes';

export function App() {
  useThemeSync();
  return <Router />;
}
