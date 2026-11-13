import type { LabOrder, LabOrderStatus, LabResultRow } from '../types';
import { LAB_TESTS, RESULT_MARKERS } from '../data/catalog';
import { mulberry32 } from '../data/generator';
import { formatMoney } from '../data/countries';
import { fmtDate, fmtTime } from './ui';

export const LAB_STAGES: { key: LabOrderStatus; label: string }[] = [
  { key: 'ordered', label: 'Booked' },
  { key: 'collected', label: 'Sample taken' },
  { key: 'processing', label: 'Analysing' },
  { key: 'ready', label: 'Results ready' },
];
export const stageIndex = (s: LabOrderStatus) => LAB_STAGES.findIndex((x) => x.key === s);

/** Produces plausible results (mostly normal, some flagged) for a finished order. */
export function generateResults(order: LabOrder): LabResultRow[] {
  const r = mulberry32([...order.id].reduce((h, c) => h * 31 + c.charCodeAt(0), 1) | 0);
  const rows: LabResultRow[] = [];
  for (const name of order.tests) {
    const t = LAB_TESTS.find((x) => x.name === name);
    for (const [marker, unit, low, high] of RESULT_MARKERS[t?.id ?? ''] ?? []) {
      if (rows.some((x) => x.marker === marker)) continue;
      const span = (high - low) || high || 1;
      const roll = r();
      const v = roll < 0.12 ? low - span * 0.15 * r() : roll > 0.85 ? high + span * 0.25 * r() : low + span * (0.15 + 0.7 * r());
      rows.push({ marker, unit, low, high, value: Math.round(Math.max(0, v) * (v < 10 ? 100 : 10)) / (v < 10 ? 100 : 10) });
    }
  }
  return rows;
}

export function flagOf(row: LabResultRow): 'low' | 'high' | 'ok' {
  if (row.value < row.low) return 'low';
  if (row.value > row.high) return 'high';
  return 'ok';
}

export function LabProgress({ status }: { status: LabOrderStatus }) {
  const idx = stageIndex(status);
  return (
    <div className="stack sm">
      <div className="progress">
        {LAB_STAGES.map((s, i) => (
          <div key={s.key} style={{ display: 'contents' }}>
            <div className={`dot ${i <= idx ? 'on' : ''}`}>{i < idx || status === 'ready' ? '✓' : i + 1}</div>
            {i < LAB_STAGES.length - 1 && <div className={`bar ${i < idx ? 'on' : ''}`} />}
          </div>
        ))}
      </div>
      <div className="row between tiny muted">{LAB_STAGES.map((s) => <span key={s.key}>{s.label}</span>)}</div>
    </div>
  );
}

export function ResultsTable({ rows }: { rows: LabResultRow[] }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Marker</th><th>Result</th><th>Reference</th><th /></tr></thead>
        <tbody>
          {rows.map((row) => {
            const f = flagOf(row);
            return (
              <tr key={row.marker}>
                <td className="small bold">{row.marker}</td>
                <td className="small" style={{ fontWeight: 700, color: f === 'ok' ? 'inherit' : 'var(--danger)' }}>{row.value} <span className="tiny muted">{row.unit}</span></td>
                <td className="tiny muted">{row.low} – {row.high}</td>
                <td>{f === 'ok' ? <span className="chip ok">Normal</span> : <span className="chip danger">{f === 'high' ? '▲ High' : '▼ Low'}</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LabOrderCard({ order, country, showPatient }: { order: LabOrder; country?: string; showPatient?: boolean }) {
  const flagged = order.results?.filter((r) => flagOf(r) !== 'ok').length ?? 0;
  return (
    <div className="card stack">
      <div className="row between top">
        <div>
          <div className="bold">{showPatient ? order.patientName : order.labName}</div>
          <div className="tiny muted">{fmtDate(order.scheduledFor)} · {fmtTime(order.scheduledFor)}{order.homeCollection ? ' · 🏠 Home collection' : ''}</div>
        </div>
        <span className="bold small">{formatMoney(order.total, country)}</span>
      </div>
      <div className="row wrap" style={{ gap: 6 }}>{order.tests.map((t) => <span key={t} className="chip">{t}</span>)}</div>
      <LabProgress status={order.status} />
      {order.status === 'ready' && order.results && (
        <details open={flagged > 0}>
          <summary className="small bold" style={{ cursor: 'pointer' }}>
            View results {flagged ? <span className="chip danger">{flagged} out of range</span> : <span className="chip ok">All normal</span>}
          </summary>
          <ResultsTable rows={order.results} />
        </details>
      )}
    </div>
  );
}
