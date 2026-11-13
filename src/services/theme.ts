// Light (blue & white) / dark (teal) theme. "system" follows the device.
// The choice is stored per device; index.html applies it before first paint.
import { useEffect, useState } from 'react';

export type ThemeChoice = 'system' | 'light' | 'dark';
const KEY = 'medinear:theme';

export const getTheme = (): ThemeChoice => {
  try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'system'; } catch { return 'system'; }
};

const isDark = (t: ThemeChoice) => t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);

export function applyTheme(t: ThemeChoice) {
  const root = document.documentElement;
  if (t === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
  // Browser / phone status-bar colour (also used by Capacitor's status bar later).
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark(t) ? '#0b1514' : '#1d4ed8');
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeChoice>(getTheme);
  // Keep every toggle / picker on screen in sync.
  useEffect(() => {
    const sync = () => setThemeState(getTheme());
    window.addEventListener('medinear-theme', sync);
    return () => window.removeEventListener('medinear-theme', sync);
  }, []);
  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const on = () => applyTheme('system');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [theme]);
  const setTheme = (t: ThemeChoice) => {
    try { if (t === 'system') localStorage.removeItem(KEY); else localStorage.setItem(KEY, t); } catch { /* blocked storage */ }
    setThemeState(t);
    applyTheme(t);
    window.dispatchEvent(new Event('medinear-theme'));
  };
  return { theme, setTheme, dark: isDark(theme) };
}
