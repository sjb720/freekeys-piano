import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyTheme, DEFAULT_THEME_ID, getTheme } from './themes';
import './themes/base.css';

applyTheme(getTheme(DEFAULT_THEME_ID));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
