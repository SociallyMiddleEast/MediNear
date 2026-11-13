import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDirectory } from '../../services/directory';
import { backend } from '../../services/backend';
import { SPECIALTIES } from '../../data/catalog';
import { countryName, flag } from '../../data/countries';
import { distanceKm } from '../../data/generator';
import { Avatar, Stars, fmtDate, fmtTime, km } from '../../components/ui';
import type { Appointment } from '../../types';

export default function Home() {
  const { user } = useAuth();
  const { dir, center } = useDirectory(user);
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [next, setNext] = useState<Appointment | null>(null);

  useEffect(() => {
    backend.listAppointments({ patientId: user!.id }).then((a) =>
      setNext(a.filter((x) => x.status === 'upcoming' && new Date(x.date) > new Date()).sort((x, y) => x.date.localeCompare(y.date))[0] ?? null));
  }, [user]);

  const byDist = <T extends { location: { lat: number; lng: number } }>(arr: T[]) => [...arr].sort((a, b) => distanceKm(center, a.location) - distanceKm(center, b.location));
  const topDocs = [...dir.doctors].sort((a, b) => b.rating - a.rating || distanceKm(center, a.location) - distanceKm(center, b.location)).slice(0, 8);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      <div className="row between">
        <div>
          <div className="small muted">{greet},</div>
          <h1>{user!.fullName.split(' ')[0]} 👋</h1>
        </div>
        <Link to="/app/profile" className="chip primary" title="Your location">📍 {flag(user!.country)} {user!.city || countryName(user!.country)}</Link>
      </div>

      <form className="search" onSubmit={(e) => { e.preventDefault(); nav(`/app/doctors?q=${encodeURIComponent(q)}`); }}>
        <input className="input" placeholder="Search doctors, specialties or clinics…" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

      <div className="grid sm">
        {[
          ['/app/doctors', '🩺', 'Doctors', `${dir.doctors.length} nearby`],
          ['/app/pharmacies', '💊', 'Pharmacies', `${dir.pharmacies.filter((p) => p.open24h).length} open 24h`],
          ['/app/hospitals', '🏥', 'Hospitals', `${dir.hospitals.filter((h) => h.emergency).length} with ER`],
          ['/app/labs', '🧪', 'Labs & tests', `${dir.labs.filter((l) => l.homeCollection).length} home visits`],
        ].map(([to, icon, label, sub]) => (
          <Link key={to} to={to} className="card link stack sm">
            <div className="tile-ico">{icon}</div>
            <div className="bold">{label}</div>
            <div className="tiny muted">{sub}</div>
          </Link>
        ))}
      </div>

      {next && (
        <Link to="/app/visits" className="hero row" style={{ color: '#fff' }}>
          <div className="grow">
            <div className="tiny muted">NEXT APPOINTMENT</div>
            <div className="bold" style={{ fontSize: 17 }}>{next.doctorName}</div>
            <div className="small muted">{next.specialty} · {next.clinic}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="bold">{fmtDate(next.date)}</div>
            <div className="small muted">{fmtTime(next.date)}</div>
          </div>
        </Link>
      )}

      <div className="section-title"><h2>Browse by specialty</h2><Link to="/app/doctors" className="small">See all</Link></div>
      <div className="chips">
        {SPECIALTIES.map((s) => (
          <Link key={s.name} to={`/app/doctors?specialty=${encodeURIComponent(s.name)}`} className="card link" style={{ minWidth: 120, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 26 }}>{s.icon}</div>
            <div className="small bold">{s.name}</div>
          </Link>
        ))}
      </div>

      <div className="section-title"><h2>Top-rated near you</h2><Link to="/app/doctors" className="small">See all</Link></div>
      <div className="chips">
        {topDocs.map((d) => (
          <Link key={d.id} to={`/app/doctors/${d.id}`} className="card link stack sm" style={{ minWidth: 200 }}>
            <Avatar name={d.name} hue={d.photoHue} />
            <div className="bold ellipsis">{d.name}</div>
            <div className="small muted">{d.specialty}</div>
            <div className="row between"><Stars value={d.rating} /><span className="tiny muted">{km(center, d.location)}</span></div>
          </Link>
        ))}
      </div>

      <div className="grid two">
        <div className="card stack">
          <div className="row between"><h3>🚑 Emergency rooms</h3><Link to="/app/hospitals" className="small">All</Link></div>
          {byDist(dir.hospitals.filter((h) => h.emergency)).slice(0, 3).map((h) => (
            <Link to={`/app/hospitals/${h.id}`} key={h.id} className="row" style={{ color: 'inherit' }}>
              <div className="grow"><div className="bold small ellipsis">{h.name}</div><div className="tiny muted">{km(center, h.location)} · {h.bedsAvailable} beds free</div></div>
              <span className={`chip ${h.erWaitMins < 30 ? 'ok' : h.erWaitMins < 60 ? 'warn' : 'danger'}`}>{h.erWaitMins} min wait</span>
            </Link>
          ))}
        </div>
        <div className="card stack">
          <div className="row between"><h3>💊 Closest pharmacies</h3><Link to="/app/pharmacies" className="small">All</Link></div>
          {byDist(dir.pharmacies).slice(0, 3).map((p) => (
            <Link to={`/app/pharmacies/${p.id}`} key={p.id} className="row" style={{ color: 'inherit' }}>
              <div className="grow"><div className="bold small ellipsis">{p.name}</div><div className="tiny muted">{km(center, p.location)} · {p.hours}</div></div>
              {p.delivery && <span className="chip info">Delivery</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
