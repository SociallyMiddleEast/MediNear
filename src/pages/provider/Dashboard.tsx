import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDirectory } from '../../services/directory';
import { backend } from '../../services/backend';
import { setPortalCountry, conditionMix, mockAdmissions, mockDaySchedule, mockLabOrders, mockPatients, monthlySeries, topSellers } from '../../services/portal';
import { BarChart, Meter, Stars, TopBar, fmtTime } from '../../components/ui';
import { stageIndex } from '../../components/LabOrderCard';
import { formatMoney } from '../../data/countries';
import { MEDICINES } from '../../data/catalog';
import type { Appointment, LabOrder, Reservation } from '../../types';

export function useProvider() {
  const { user } = useAuth();
  const { dir } = useDirectory(user);
  const pid = user?.providerId ?? user?.id ?? 'x';
  setPortalCountry(user?.country);
  return {
    user: user!, pid, dir,
    doctor: dir.doctors.find((d) => d.id === pid),
    pharmacy: dir.pharmacies.find((p) => p.id === pid),
    hospital: dir.hospitals.find((h) => h.id === pid),
    lab: dir.labs.find((l) => l.id === pid),
  };
}

export function Kpi({ label, value, delta, icon }: { label: string; value: ReactNode; delta?: number; icon: string }) {
  return (
    <div className="card stack sm">
      <div className="row between"><span className="small muted">{label}</span><span>{icon}</span></div>
      <div className="stat"><span className="v">{value}</span></div>
      {delta !== undefined && <span className={delta >= 0 ? 'trend-up' : 'trend-down'}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs last month</span>}
    </div>
  );
}
const pct = (s: { value: number }[]) => Math.round(((s[s.length - 1].value - s[s.length - 2].value) / Math.max(1, s[s.length - 2].value)) * 100);

export default function Dashboard() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <>
      <TopBar title={user?.organisation ?? 'Dashboard'} right={<span className="chip primary">{user?.role}</span>} />
      <div className="page">
        <div>
          <div className="small muted">{greet},</div>
          <h1>{user?.fullName}</h1>
          <div className="small muted">{new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        {user?.role === 'doctor' && <DoctorDash />}
        {user?.role === 'pharmacy' && <PharmacyDash />}
        {user?.role === 'hospital' && <HospitalDash />}
        {user?.role === 'lab' && <LabDash />}
      </div>
    </>
  );
}

function DoctorDash() {
  const { pid, doctor, user } = useProvider();
  const [booked, setBooked] = useState<Appointment[]>([]);
  useEffect(() => { backend.listAppointments({ doctorId: pid }).then(setBooked); }, [pid]);
  const today = new Date();
  const todays = [
    ...mockDaySchedule(pid, today).map((s) => ({ ...s, online: false })),
    ...booked.filter((b) => b.status === 'upcoming' && new Date(b.date).toDateString() === today.toDateString())
      .map((b) => ({ id: b.id, time: b.date, patient: b.patientName, patientId: b.patientId, reason: b.reason, type: b.clinic === 'Video consultation' ? 'Video' : 'In clinic', isNew: true, online: true })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  const visits = monthlySeries(pid, 180);
  const newPts = monthlySeries(pid, 34, 0.04, 0.4);
  const patients = mockPatients(pid);
  const mix = conditionMix(pid);
  const highRisk = patients.filter((p) => p.risk === 'high');
  const upcomingOnline = booked.filter((b) => b.status === 'upcoming' && b.date >= new Date().toISOString());

  return (
    <>
      <div className="grid sm">
        <Kpi icon="📅" label="Today" value={todays.length} />
        <Kpi icon="👥" label="Visits this month" value={visits[11].value} delta={pct(visits)} />
        <Kpi icon="✨" label="New patients" value={newPts[11].value} delta={pct(newPts)} />
        <Kpi icon="⭐" label="Rating" value={doctor?.rating ?? '—'} />
      </div>
      {upcomingOnline.length > 0 && (
        <Link to="/portal/schedule" className="notice row" style={{ color: 'var(--info)' }}>
          <span>📲</span><span className="grow"><b>{upcomingOnline.length} booking{upcomingOnline.length > 1 ? 's' : ''}</b> made through the MediNear app — next: {upcomingOnline[0].patientName}</span><span>→</span>
        </Link>
      )}
      <div className="grid two">
        <div className="card stack">
          <div className="row between"><h3>Today’s schedule</h3><Link to="/portal/schedule" className="small">Week view</Link></div>
          {todays.length === 0 && <div className="small muted">No appointments today.</div>}
          {todays.slice(0, 7).map((s) => (
            <div key={s.id} className="row">
              <b className="small" style={{ width: 70, whiteSpace: 'nowrap' }}>{fmtTime(s.time)}</b>
              <div className="grow"><div className="small bold">{s.patient} {s.online && <span className="chip info">App</span>}{!s.online && s.isNew && <span className="chip warn">New</span>}</div><div className="tiny muted">{s.reason}</div></div>
              <span className="chip">{s.type === 'Video' ? '📹' : '🏥'}</span>
            </div>
          ))}
        </div>
        <div className="card stack">
          <h3>Patient visits · 12 months</h3>
          <BarChart data={visits} />
        </div>
        <div className="card stack">
          <h3>Top conditions</h3>
          {mix.map(([c, n]) => (
            <div key={c} className="stack sm">
              <div className="row between small"><span>{c}</span><b>{n}</b></div>
              <Meter value={(n / mix[0][1]) * 100} />
            </div>
          ))}
        </div>
        <div className="card stack">
          <div className="row between"><h3>⚠️ Needs attention</h3><Link to="/portal/patients" className="small">All patients</Link></div>
          {highRisk.slice(0, 5).map((p) => (
            <div key={p.id} className="row">
              <div className="grow"><div className="small bold">{p.name}, {p.age}</div><div className="tiny muted">{p.condition} · BP {p.vitals.bp}</div></div>
              <span className="chip danger">High risk</span>
            </div>
          ))}
          <div className="tiny muted">Revenue this month ≈ {formatMoney(visits[11].value * (doctor?.fee ?? 60), user.country)}</div>
        </div>
      </div>
    </>
  );
}

function PharmacyDash() {
  const { pid, pharmacy, user } = useProvider();
  const [res, setRes] = useState<Reservation[]>([]);
  useEffect(() => { backend.listReservations({ pharmacyId: pid }).then(setRes); }, [pid]);
  const sales = monthlySeries(pid, 5200, 0.025);
  const rx = monthlySeries(pid, 640, 0.02);
  const sellers = topSellers(pid);
  const low = (pharmacy?.stock ?? []).filter((s) => s.qty < 10);
  const name = (id: string) => MEDICINES.find((m) => m.id === id)?.name ?? id;
  return (
    <>
      <div className="grid sm">
        <Kpi icon="💵" label="Sales this month" value={formatMoney(sales[11].value, user.country)} delta={pct(sales)} />
        <Kpi icon="℞" label="Prescriptions filled" value={rx[11].value} delta={pct(rx)} />
        <Kpi icon="🧾" label="Open reservations" value={res.filter((r) => r.status !== 'collected').length} />
        <Kpi icon="📦" label="Low / out of stock" value={low.length} />
      </div>
      <div className="grid two">
        <div className="card stack"><h3>Monthly sales</h3><BarChart data={sales} format={(v) => formatMoney(v, user.country)} /></div>
        <div className="card stack">
          <h3>Best sellers</h3>
          {sellers.slice(0, 6).map((s) => (
            <div key={s.m.id} className="stack sm">
              <div className="row between small"><span>{s.m.name} <span className="muted">{s.m.strength}</span></span><b>{s.units} units</b></div>
              <Meter value={(s.revenue / sellers[0].revenue) * 100} />
            </div>
          ))}
        </div>
        <div className="card stack">
          <div className="row between"><h3>📦 Restock alerts</h3><Link to="/portal/inventory" className="small">Inventory</Link></div>
          {low.length === 0 && <div className="small muted">All products well stocked.</div>}
          {low.slice(0, 6).map((s) => (
            <div key={s.medicineId} className="row between small"><span>{name(s.medicineId)}</span><span className={`chip ${s.qty === 0 ? 'danger' : 'warn'}`}>{s.qty === 0 ? 'Out of stock' : `${s.qty} left`}</span></div>
          ))}
        </div>
        <div className="card stack">
          <div className="row between"><h3>🧾 Latest app reservations</h3><Link to="/portal/orders" className="small">All</Link></div>
          {res.length === 0 && <div className="small muted">No reservations yet. Patients can reserve medicines from your listing.</div>}
          {res.slice(0, 5).map((r) => <div key={r.id} className="row between small"><span>{r.patientName} · {r.qty}× {r.medicineName}</span><span className="chip">{r.status}</span></div>)}
        </div>
      </div>
    </>
  );
}

function HospitalDash() {
  const { pid, hospital } = useProvider();
  const adm = mockAdmissions(pid, hospital?.departments ?? []);
  const er = monthlySeries(pid, 2100, 0.015);
  const admissions = monthlySeries(pid, 610, 0.02);
  const byWard = Object.entries(adm.reduce<Record<string, number>>((a, x) => ({ ...a, [x.ward]: (a[x.ward] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const occ = hospital ? Math.round((1 - hospital.bedsAvailable / hospital.beds) * 100) : 0;
  return (
    <>
      <div className="grid sm">
        <Kpi icon="🛏️" label="Bed occupancy" value={`${occ}%`} />
        <Kpi icon="🚑" label="ER wait now" value={hospital ? `${hospital.erWaitMins} min` : '—'} />
        <Kpi icon="📥" label="Admissions (month)" value={admissions[11].value} delta={pct(admissions)} />
        <Kpi icon="🚨" label="Critical patients" value={adm.filter((a) => a.status === 'Critical').length} />
      </div>
      <div className="grid two">
        <div className="card stack"><h3>ER visits · 12 months</h3><BarChart data={er} /></div>
        <div className="card stack">
          <h3>Current inpatients by ward</h3>
          {byWard.map(([w, n]) => <div key={w} className="stack sm"><div className="row between small"><span>{w}</span><b>{n}</b></div><Meter value={(n / byWard[0][1]) * 100} /></div>)}
        </div>
        <div className="card stack">
          <div className="row between"><h3>Critical & observation</h3><Link to="/portal/patients" className="small">All admissions</Link></div>
          {adm.filter((a) => a.status === 'Critical' || a.status === 'Observation').slice(0, 6).map((a) => (
            <div key={a.id} className="row"><div className="grow"><div className="small bold">{a.patient}, {a.age}</div><div className="tiny muted">{a.ward} · {a.bed} · {a.diagnosis}</div></div><span className={`chip ${a.status === 'Critical' ? 'danger' : 'warn'}`}>{a.status}</span></div>
          ))}
        </div>
        <div className="card stack">
          <h3>Capacity</h3>
          <div className="row between small"><span>Beds available</span><b>{hospital?.bedsAvailable} / {hospital?.beds}</b></div>
          <Meter value={occ} color={occ > 90 ? 'var(--danger)' : undefined} />
          <div className="row between small"><span>Discharges planned today</span><b>{adm.filter((a) => a.status === 'Discharge today').length}</b></div>
          <div className="row between small"><span>Patient satisfaction</span><Stars value={hospital?.rating ?? 4.5} /></div>
        </div>
      </div>
    </>
  );
}

function LabDash() {
  const { pid, lab, user } = useProvider();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  useEffect(() => { backend.listLabOrders({ labId: pid }).then((o) => setOrders([...o, ...mockLabOrders(pid, lab?.name ?? 'Lab')])); }, [pid, lab?.name]);
  const vol = monthlySeries(pid, 1450, 0.03);
  const rev = monthlySeries(pid + 'r', 26000, 0.03);
  const stageCount = [0, 0, 0, 0];
  orders.forEach((o) => stageCount[stageIndex(o.status)]++);
  return (
    <>
      <div className="grid sm">
        <Kpi icon="🧪" label="Tests this month" value={vol[11].value} delta={pct(vol)} />
        <Kpi icon="💵" label="Revenue" value={formatMoney(rev[11].value, user.country)} delta={pct(rev)} />
        <Kpi icon="⏳" label="In pipeline" value={orders.filter((o) => o.status !== 'ready').length} />
        <Kpi icon="📲" label="App bookings" value={orders.filter((o) => !o.id.startsWith(pid)).length} />
      </div>
      <div className="grid two">
        <div className="card stack">
          <div className="row between"><h3>Sample pipeline</h3><Link to="/portal/orders" className="small">Manage</Link></div>
          {['Booked', 'Sample taken', 'Analysing', 'Results ready'].map((l, i) => (
            <div key={l} className="stack sm"><div className="row between small"><span>{l}</span><b>{stageCount[i]}</b></div><Meter value={(stageCount[i] / Math.max(1, ...stageCount)) * 100} /></div>
          ))}
        </div>
        <div className="card stack"><h3>Test volume · 12 months</h3><BarChart data={vol} /></div>
      </div>
    </>
  );
}
