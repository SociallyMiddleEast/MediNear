import { useEffect, useMemo, useState } from 'react';
import { backend } from '../../services/backend';
import { mockDaySchedule, mockLabOrders, mockPatients, type PortalPatient } from '../../services/portal';
import { Avatar, Empty, Modal, TopBar, fmtDate, fmtTime, toast } from '../../components/ui';
import { LabOrderCard, flagOf } from '../../components/LabOrderCard';
import { useProvider } from './Dashboard';
import type { Appointment, LabOrder } from '../../types';

export function DoctorSchedule() {
  const { pid } = useProvider();
  const [booked, setBooked] = useState<Appointment[]>([]);
  const [tick, setTick] = useState(0);
  const [offset, setOffset] = useState(0);
  useEffect(() => { backend.listAppointments({ doctorId: pid }).then(setBooked); }, [pid, tick]);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + offset * 7 + i); return d; });
  const [sel, setSel] = useState(0);
  const day = days[sel];
  const items = [
    ...mockDaySchedule(pid, day).map((s) => ({ ...s, appt: undefined as Appointment | undefined })),
    ...booked.filter((b) => new Date(b.date).toDateString() === day.toDateString()).map((b) => ({
      id: b.id, time: b.date, patient: b.patientName, patientId: b.patientId, reason: b.reason, type: b.clinic === 'Video consultation' ? 'Video' : 'In clinic', isNew: true, appt: b,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  const setStatus = async (a: Appointment, status: Appointment['status']) => { await backend.updateAppointment(a.id, { status }); setTick(tick + 1); toast(status === 'completed' ? 'Marked as completed' : 'Appointment cancelled'); };

  return (
    <>
      <TopBar title="Schedule" />
      <div className="page">
        <div className="row between">
          <button className="btn ghost sm" onClick={() => { setOffset(offset - 1); setSel(0); }}>← Prev</button>
          <b>{fmtDate(days[0].toISOString(), { day: 'numeric', month: 'short' })} – {fmtDate(days[6].toISOString(), { day: 'numeric', month: 'short' })}</b>
          <button className="btn ghost sm" onClick={() => { setOffset(offset + 1); setSel(0); }}>Next →</button>
        </div>
        <div className="chips">
          {days.map((d, i) => {
            const n = mockDaySchedule(pid, d).length + booked.filter((b) => new Date(b.date).toDateString() === d.toDateString()).length;
            return (
              <button key={i} className={`slot ${sel === i ? 'on' : ''}`} style={{ minWidth: 70, textAlign: 'center' }} onClick={() => setSel(i)}>
                <div className="tiny">{d.toLocaleDateString('en', { weekday: 'short' })}</div><div>{d.getDate()}</div><div className="tiny" style={{ opacity: 0.8 }}>{n} appt</div>
              </button>
            );
          })}
        </div>
        {items.length === 0 ? <Empty icon="🌴" title="No appointments">{day.getDay() === 0 ? 'Clinic closed on Sundays.' : 'Free day.'}</Empty> : (
          <div className="stack">
            {items.map((s) => (
              <div key={s.id} className="card row" style={{ borderLeft: s.appt ? '4px solid var(--info)' : undefined, opacity: s.appt?.status === 'cancelled' ? 0.5 : 1 }}>
                <b style={{ width: 56 }}>{fmtTime(s.time)}</b>
                <div className="grow">
                  <div className="bold">{s.patient} {s.appt && <span className="chip info">Booked in app</span>}</div>
                  <div className="small muted">{s.reason} · {s.type === 'Video' ? '📹 Video' : '🏥 In clinic'}</div>
                </div>
                {s.appt && s.appt.status === 'upcoming' && (
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn sm soft" onClick={() => setStatus(s.appt!, 'completed')}>Done</button>
                    <button className="btn sm danger" onClick={() => setStatus(s.appt!, 'cancelled')}>Cancel</button>
                  </div>
                )}
                {s.appt && s.appt.status !== 'upcoming' && <span className="chip">{s.appt.status}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function DoctorPatients() {
  const { pid } = useProvider();
  const [q, setQ] = useState('');
  const [risk, setRisk] = useState('');
  const [open, setOpen] = useState<PortalPatient | null>(null);
  const [booked, setBooked] = useState<Appointment[]>([]);
  useEffect(() => { backend.listAppointments({ doctorId: pid }).then(setBooked); }, [pid]);
  const appPatients = useMemo(() => {
    const seen = new Map<string, Appointment>();
    booked.forEach((b) => { if (!seen.has(b.patientId)) seen.set(b.patientId, b); });
    return [...seen.values()];
  }, [booked]);
  const list = mockPatients(pid).filter((p) => (!q || `${p.name} ${p.condition}`.toLowerCase().includes(q.toLowerCase())) && (!risk || p.risk === risk));

  return (
    <>
      <TopBar title="Patients" />
      <div className="page">
        {appPatients.length > 0 && (
          <div className="card stack">
            <h3>📲 Patients from the MediNear app</h3>
            {appPatients.map((b) => (
              <div key={b.patientId} className="row"><Avatar name={b.patientName} size="sm" hue={210} /><div className="grow"><div className="small bold">{b.patientName}</div><div className="tiny muted">{b.reason} · {fmtDate(b.date)}</div></div><span className="chip info">{b.status}</span></div>
            ))}
          </div>
        )}
        <div className="search"><input className="input" placeholder="Search by name or condition…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="chips">
          {['', 'high', 'medium', 'low'].map((r) => <button key={r} className={`chip ${risk === r ? 'on' : ''}`} onClick={() => setRisk(r)}>{r ? `${r[0].toUpperCase()}${r.slice(1)} risk` : 'All'}</button>)}
        </div>
        <div className="card table-wrap" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Patient</th><th>Condition</th><th>BP</th><th>Last visit</th><th>Risk</th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} onClick={() => setOpen(p)} style={{ cursor: 'pointer' }}>
                  <td><div className="bold small">{p.name}</div><div className="tiny muted">{p.age} y · {p.gender} · {p.insurer}</div></td>
                  <td className="small">{p.condition}</td>
                  <td className="small">{p.vitals.bp}</td>
                  <td className="small muted">{fmtDate(p.lastVisit, { day: 'numeric', month: 'short' })}</td>
                  <td><span className={`chip ${p.risk === 'high' ? 'danger' : p.risk === 'medium' ? 'warn' : 'ok'}`}>{p.risk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''}>
        {open && (
          <>
            <div className="row wrap" style={{ gap: 6 }}>
              <span className="chip">{open.age} years · {open.gender}</span><span className="chip primary">{open.condition}</span><span className="chip">{open.insurer}</span><span className="chip">{open.visits} visits</span>
            </div>
            <div className="grid sm" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="stat"><span className="v" style={{ fontSize: 18 }}>{open.vitals.bp}</span><span className="l">BP</span></div>
              <div className="stat"><span className="v" style={{ fontSize: 18 }}>{open.vitals.hr}</span><span className="l">Heart rate</span></div>
              <div className="stat"><span className="v" style={{ fontSize: 18 }}>{open.vitals.weight}kg</span><span className="l">Weight</span></div>
              <div className="stat"><span className="v" style={{ fontSize: 18 }}>{open.vitals.glucose}</span><span className="l">Glucose</span></div>
            </div>
            <div className="stack sm">
              <div className="small bold">Systolic BP · last 6 visits</div>
              <Sparkline values={open.bpTrend} warn={140} />
            </div>
            <div className="small"><b>Medications: </b>{open.meds.length ? open.meds.join(', ') : 'None'}</div>
            <div className="small"><b>Notes: </b>{open.notes}</div>
            <div className="small muted">Last visit {fmtDate(open.lastVisit)}{open.nextVisit ? ` · Next ${fmtDate(open.nextVisit)}` : ''}</div>
          </>
        )}
      </Modal>
    </>
  );
}

function Sparkline({ values, warn }: { values: number[]; warn: number }) {
  const w = 300, h = 70, min = Math.min(...values, warn) - 5, max = Math.max(...values, warn) + 5;
  const x = (i: number) => (i / (values.length - 1)) * (w - 20) + 10;
  const y = (v: number) => h - 8 - ((v - min) / (max - min)) * (h - 16);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label={`Values ${values.join(', ')}`}>
      <line x1="0" x2={w} y1={y(warn)} y2={y(warn)} stroke="var(--danger)" strokeDasharray="4 4" strokeWidth="1" opacity=".6" />
      <polyline fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
      {values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4" fill={v > warn ? 'var(--danger)' : 'var(--primary)'} />)}
    </svg>
  );
}

export function DoctorLabs() {
  const { pid, user } = useProvider();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged'>('all');
  useEffect(() => {
    (async () => {
      // Real orders from patients who booked with this doctor + demo orders.
      const appts = await backend.listAppointments({ doctorId: pid });
      const ids = new Set(appts.map((a) => a.patientId));
      const real = (await backend.listLabOrders({})).filter((o) => ids.has(o.patientId));
      setOrders([...real, ...mockLabOrders(pid, 'Partner labs', 12).map((o) => ({ ...o, labName: ['Precision Diagnostics Lab', 'BioLab Diagnostics', 'Medilab'][o.total % 3] }))]);
    })();
  }, [pid]);
  const list = orders.filter((o) => filter === 'all' || (filter === 'pending' ? o.status !== 'ready' : o.results?.some((r) => flagOf(r) !== 'ok')));
  return (
    <>
      <TopBar title="Lab results" />
      <div className="page">
        <div className="chips">
          <button className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>All ({orders.length})</button>
          <button className={`chip ${filter === 'pending' ? 'on' : ''}`} onClick={() => setFilter('pending')}>⏳ In progress</button>
          <button className={`chip ${filter === 'flagged' ? 'on' : ''}`} onClick={() => setFilter('flagged')}>⚠️ Out of range</button>
        </div>
        {list.length === 0 ? <Empty icon="🧪" title="Nothing here" /> : list.map((o) => (
          <div key={o.id} className="stack sm">
            <LabOrderCard order={o} country={user.country} showPatient />
            <div className="tiny muted" style={{ paddingLeft: 4 }}>Lab: {o.labName}</div>
          </div>
        ))}
      </div>
    </>
  );
}
