import { useTheme, type ThemeChoice } from '../services/theme';

const OPTIONS: { v: ThemeChoice; label: string }[] = [
  { v: 'light', label: '☀️ Light' },
  { v: 'dark', label: '🌙 Dark' },
  { v: 'system', label: '📱 Auto' },
];

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="row" style={{ gap: 8 }} role="radiogroup" aria-label="Theme">
      {OPTIONS.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={theme === o.v} className={`chip grow ${theme === o.v ? 'on' : ''}`} onClick={() => setTheme(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Compact one-tap toggle for headers (light ↔ dark). */
export function ThemeToggle() {
  const { dark, setTheme } = useTheme();
  return (
    <button type="button" className="icon-btn" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'} onClick={() => setTheme(dark ? 'light' : 'dark')}>
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
