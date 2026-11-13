import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GeoPoint } from '../types';
import { distanceKm } from '../data/generator';

export const initials = (name: string) =>
  name.replace(/^Dr\.?\s+/, '').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export function Avatar({ name, hue = 170, size }: { name: string; hue?: number; size?: 'sm' | 'lg' }) {
  return (
    <div className={`avatar ${size ?? ''}`} style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 60% 35%))` }}>
      {initials(name)}
    </div>
  );
}

export function Stars({ value, count }: { value: number; count?: number }) {
  return (
    <span className="small">
      <span className="stars">★</span> <b>{value.toFixed(1)}</b>
      {count !== undefined && <span className="muted"> ({count})</span>}
    </span>
  );
}

export const km = (a: GeoPoint, b: GeoPoint) => {
  const d = distanceKm(a, b);
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
};

export function TopBar({ title, back, right }: { title: ReactNode; back?: boolean; right?: ReactNode }) {
  const nav = useNavigate();
  return (
    <div className="topbar">
      {back && <button className="icon-btn" aria-label="Back" onClick={() => nav(-1)}>←</button>}
      <div className="title">{title}</div>
      {right}
    </div>
  );
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="big">{icon}</div>
      <h3 style={{ color: 'var(--text)', margin: '8px 0 4px' }}>{title}</h3>
      <div className="small">{children}</div>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal stack" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="row between">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

let toastSetter: ((m: string | null) => void) | null = null;
export const toast = (m: string) => toastSetter?.(m);
export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { toastSetter = setMsg; return () => { toastSetter = null; }; }, []);
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t); } }, [msg]);
  return msg ? <div className="toast" role="status">{msg}</div> : null;
}

/** Lightweight schematic map (no API key needed). Swap for Leaflet/Google Maps later. */
export function MiniMap({ center, pins, height = 220 }: { center: GeoPoint; pins: { at: GeoPoint; icon: string; label?: string; onClick?: () => void }[]; height?: number }) {
  const all = pins.map((p) => distanceKm(center, p.at));
  const radius = Math.max(1.5, ...all) * 1.15;
  const pos = (p: GeoPoint) => {
    const dx = (p.lng - center.lng) * 111 * Math.cos((center.lat * Math.PI) / 180);
    const dy = (p.lat - center.lat) * 111;
    return { left: `${50 + (dx / radius) * 46}%`, top: `${50 - (dy / radius) * 44}%` };
  };
  return (
    <div className="map" style={{ height }}>
      {pins.map((p, i) => (
        <button key={i} className="pin" style={{ ...pos(p.at), background: 'none', border: 0, padding: 0 }} title={p.label} onClick={p.onClick}>
          {p.icon}
        </button>
      ))}
      <div className="me" style={{ left: '50%', top: '50%' }} title="You" />
      <div className="tiny muted" style={{ position: 'absolute', right: 10, bottom: 8 }}>≈ {radius.toFixed(1)} km radius</div>
    </div>
  );
}

export function BarChart({ data, format = (v: number) => String(v) }: { data: { label: string; value: number }[]; format?: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="bar-chart" role="img" aria-label={data.map((d) => `${d.label}: ${format(d.value)}`).join(', ')}>
      {data.map((d, i) => (
        <div className="b" key={d.label} title={`${d.label}: ${format(d.value)}`}>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{i === data.length - 1 ? format(d.value) : ''}</span>
          <div className={`fill ${i === data.length - 1 ? 'hl' : ''}`} style={{ height: `${(d.value / max) * 100}%` }} />
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Meter({ value, color }: { value: number; color?: string }) {
  return <div className="meter"><div style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} /></div>;
}

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Date(iso).toLocaleDateString('en', opts);
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

export const ageFrom = (dob?: string) => {
  if (!dob) return undefined;
  const d = new Date(dob), n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
  return a;
};
