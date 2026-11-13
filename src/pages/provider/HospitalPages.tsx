import { useState } from 'react';
import { mockAdmissions } from '../../services/portal';
import { mulberry32 } from '../../data/generator';
import { Meter, TopBar, fmtDate } from '../../components/ui';
import { useProvider } from './Dashboard';

const statusChip = (s: string) => (s === 'Critical' ? 'danger' : s === 'Observation' ? 'warn' : s === 'Discharge today' ? 'info' : 'ok');

export function HospitalAdmissions() {
  const { pid, hospital } = useProvider();
  const [ward, setWard] = useState('');
  const [q, setQ] = useState('');
  const all = mockAdmissions(pid, hospital?.departments ?? []);
  const wards = [...new Set(all.map((a) => a.ward))].sort();
  const list = all.filter((a) => (!ward || a.ward === ward) && (!q || `${a.patient} ${a.diagnosis} ${a.bed}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <TopBar title="Admissions" />
      <div className="page">
        <div className="search"><input className="input" placeholder="Patient, diagnosis or bed…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="chips">
          <button className={`chip ${!ward ? 'on' : ''}`} onClick={() => setWard('')}>All wards ({all.length})</button>
          {wards.map((w) => <button key={w} className={`chip ${ward === w ? 'on' : ''}`} onClick={() => setWard(w)}>{w}</button>)}
        </div>
        <div className="card table-wrap" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Patient</th><th>Ward / bed</th><th>Attending</th><th>Admitted</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td><div className="bold small">{a.patient}</div><div className="tiny muted">{a.age} y · {a.diagnosis}</div></td>
                  <td className="small">{a.ward}<div className="tiny muted">{a.bed}</div></td>
                  <td className="small">{a.doctor}</td>
                  <td className="small muted">{fmtDate(a.admitted, { day: 'numeric', month: 'short' })}</td>
                  <td><span className={`chip ${statusChip(a.status)}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function HospitalDepartments() {
  const { pid, hospital } = useProvider();
  const r = mulberry32(pid.length * 991);
  const depts = (hospital?.departments ?? []).map((d) => {
    const beds = 10 + Math.floor(r() * 50);
    return { d, beds, used: Math.floor(beds * (0.5 + r() * 0.5)), staff: 6 + Math.floor(r() * 40), head: `Dr. ${['Haddad', 'Khoury', 'Moreau', 'Nassar', 'Fischer', 'Saleh'][Math.floor(r() * 6)]}` };
  });
  return (
    <>
      <TopBar title="Departments" />
      <div className="page">
        <div className="grid">
          {depts.map((x) => {
            const pct = Math.round((x.used / x.beds) * 100);
            return (
              <div key={x.d} className="card stack sm">
                <div className="row between"><h3>{x.d}</h3><span className={`chip ${pct > 90 ? 'danger' : pct > 75 ? 'warn' : 'ok'}`}>{pct}% full</span></div>
                <Meter value={pct} color={pct > 90 ? 'var(--danger)' : undefined} />
                <div className="row between small"><span className="muted">Beds</span><b>{x.used} / {x.beds}</b></div>
                <div className="row between small"><span className="muted">Staff on duty</span><b>{x.staff}</b></div>
                <div className="row between small"><span className="muted">Head of department</span><b>{x.head}</b></div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
