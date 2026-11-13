import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { backend } from '../../services/backend';
import { Empty, TopBar, fmtDate, fmtTime, toast } from '../../components/ui';
import { LabOrderCard } from '../../components/LabOrderCard';
import { formatMoney } from '../../data/countries';
import type { Appointment, LabOrder, Reservation } from '../../types';

export default function Visits() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'visits';
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [labs, setLabs] = useState<LabOrder[]>([]);
  const [meds, setMeds] = useState<Reservation[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    backend.listAppointments({ patientId: user!.id }).then((a) => setAppts(a.sort((x, y) => x.date.localeCompare(y.date))));
    backend.listLabOrders({ patientId: user!.id }).then(setLabs);
    backend.listReservations({ patientId: user!.id }).then(setMeds);
  }, [user, tick]);

  const now = new Date().toISOString();
  const upcoming = appts.filter((a) => a.status === 'upcoming' && a.date >= now);
  const past = appts.filter((a) => !(a.status === 'upcoming' && a.date >= now)).reverse();
  const cancel = async (a: Appointment) => { await backend.updateAppointment(a.id, { status: 'cancelled' }); toast('Appointment cancelled'); setTick(tick + 1); };

  const Tab = ({ id, label, n }: { id: string; label: string; n: number }) => (
    <button className={`chip grow ${tab === id ? 'on' : ''}`} onClick={() => setParams({ tab: id }, { replace: true })}>{label}{n ? ` (${n})` : ''}</button>
  );

  return (
    <>
      <TopBar title="My care" />
      <div className="page">
        <div className="row" style={{ gap: 8 }}>
          <Tab id="visits" label="📅 Visits" n={upcoming.length} />
          <Tab id="labs" label="🧪 Lab tests" n={labs.length} />
          <Tab id="meds" label="💊 Medicines" n={meds.length} />
        </div>

        {tab === 'visits' && (
          <>
            {upcoming.length === 0 && past.length === 0 && (
              <Empty icon="📅" title="No appointments yet"><Link to="/app/doctors" className="btn sm" style={{ marginTop: 12 }}>Find a doctor</Link></Empty>
            )}
            {upcoming.length > 0 && <h3>Upcoming</h3>}
            {upcoming.map((a) => (
              <div key={a.id} className="card row top">
                <div className="tile-ico" style={{ flexDirection: 'column', fontSize: 12, lineHeight: 1.1, width: 56, height: 56 }}>
                  <b style={{ fontSize: 18 }}>{new Date(a.date).getDate()}</b>{new Date(a.date).toLocaleDateString('en', { month: 'short' })}
                </div>
                <div className="grow">
                  <Link to={`/app/doctors/${a.doctorId}`} className="bold" style={{ color: 'inherit' }}>{a.doctorName}</Link>
                  <div className="small muted">{a.specialty} · {a.clinic}</div>
                  <div className="small">{fmtDate(a.date)} at {fmtTime(a.date)} · {a.reason}</div>
                </div>
                <button className="btn sm danger" onClick={() => cancel(a)}>Cancel</button>
              </div>
            ))}
            {past.length > 0 && <h3 style={{ marginTop: 8 }}>Past & cancelled</h3>}
            {past.map((a) => (
              <div key={a.id} className="card flat row" style={{ opacity: 0.7 }}>
                <div className="grow"><div className="bold small">{a.doctorName}</div><div className="tiny muted">{fmtDate(a.date)} · {a.specialty}</div></div>
                <span className={`chip ${a.status === 'cancelled' ? 'danger' : ''}`}>{a.status === 'cancelled' ? 'Cancelled' : 'Completed'}</span>
              </div>
            ))}
          </>
        )}

        {tab === 'labs' && (labs.length === 0
          ? <Empty icon="🧪" title="No lab tests booked"><Link to="/app/labs" className="btn sm" style={{ marginTop: 12 }}>Book a blood test</Link></Empty>
          : labs.map((o) => <LabOrderCard key={o.id} order={o} country={user?.country} />))}

        {tab === 'meds' && (meds.length === 0
          ? <Empty icon="💊" title="No reservations"><Link to="/app/pharmacies" className="btn sm" style={{ marginTop: 12 }}>Find a medicine</Link></Empty>
          : meds.map((r) => (
            <div key={r.id} className="card row">
              <div className="tile-ico">💊</div>
              <div className="grow">
                <div className="bold">{r.qty} × {r.medicineName}</div>
                <div className="tiny muted">{r.pharmacyName} · {fmtDate(r.createdAt)}</div>
              </div>
              <div className="stack sm" style={{ alignItems: 'flex-end' }}>
                <b className="small">{formatMoney(r.total, user?.country)}</b>
                <span className={`chip ${r.status === 'ready' ? 'ok' : r.status === 'collected' ? '' : 'warn'}`}>{r.status === 'reserved' ? 'Preparing' : r.status === 'ready' ? 'Ready for pickup' : 'Collected'}</span>
              </div>
            </div>
          )))}
      </div>
    </>
  );
}
