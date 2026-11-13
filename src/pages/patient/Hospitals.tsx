import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDirectory } from '../../services/directory';
import { distanceKm } from '../../data/generator';
import { emergencyNumber } from '../../data/countries';
import { Empty, Meter, MiniMap, Stars, TopBar, km } from '../../components/ui';

const waitChip = (m: number) => (m < 30 ? 'ok' : m < 60 ? 'warn' : 'danger');

export default function Hospitals() {
  const { user } = useAuth();
  const { dir, center } = useDirectory(user);
  const [er, setEr] = useState(false);
  const [dept, setDept] = useState('');
  const depts = [...new Set(dir.hospitals.flatMap((h) => h.departments))].sort();
  const list = dir.hospitals
    .filter((h) => (!er || h.emergency) && (!dept || h.departments.includes(dept)))
    .sort((a, b) => distanceKm(center, a.location) - distanceKm(center, b.location));
  return (
    <>
      <TopBar title="Hospitals" />
      <div className="page">
        <a href={`tel:${emergencyNumber(user?.country)}`} className="card row" style={{ background: 'var(--danger-soft)', borderColor: 'transparent', color: 'var(--danger)' }}>
          <div style={{ fontSize: 26 }}>🚨</div>
          <div className="grow"><div className="bold">Medical emergency?</div><div className="small">Call {emergencyNumber(user?.country)} now — the ambulance number for your country.</div></div>
          <span className="btn sm danger" style={{ background: 'var(--danger)', color: '#fff' }}>Call {emergencyNumber(user?.country)}</span>
        </a>
        <MiniMap center={center} pins={list.map((h) => ({ at: h.location, icon: '🏥', label: h.name }))} />
        <div className="chips">
          <button className={`chip ${er ? 'on' : ''}`} onClick={() => setEr(!er)}>🚑 Has ER</button>
          <button className={`chip ${!dept ? 'on' : ''}`} onClick={() => setDept('')}>All departments</button>
          {depts.map((d) => <button key={d} className={`chip ${dept === d ? 'on' : ''}`} onClick={() => setDept(d)}>{d}</button>)}
        </div>
        {list.length === 0 ? <Empty icon="🏥" title="No hospitals match" /> : (
          <div className="grid">
            {list.map((h) => (
              <Link key={h.id} to={`/app/hospitals/${h.id}`} className="card link stack sm">
                <div className="row between top"><div className="bold">{h.name}</div><Stars value={h.rating} /></div>
                <div className="tiny muted">{h.type} · {h.accreditation} · 📍 {km(center, h.location)}</div>
                <div className="row wrap" style={{ gap: 6 }}>
                  {h.emergency ? <span className={`chip ${waitChip(h.erWaitMins)}`}>ER wait ~{h.erWaitMins} min</span> : <span className="chip">No ER</span>}
                  <span className="chip">🛏️ {h.bedsAvailable}/{h.beds} beds free</span>
                </div>
                <Meter value={(1 - h.bedsAvailable / h.beds) * 100} color={h.bedsAvailable / h.beds < 0.05 ? 'var(--danger)' : undefined} />
                <div className="tiny muted">{Math.round((1 - h.bedsAvailable / h.beds) * 100)}% occupancy</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function HospitalDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { dir, center } = useDirectory(user);
  const h = dir.hospitals.find((x) => x.id === id);
  if (!h) return <><TopBar back title="Hospital" /><div className="page"><Empty icon="🤷" title="Hospital not found" /></div></>;
  const docs = dir.doctors.filter((d) => h.departments.some((dep) => d.specialty.startsWith(dep.slice(0, 5)))).slice(0, 6);
  return (
    <>
      <TopBar back title={h.name} />
      <div className="page">
        <div className="hero stack">
          <h2>{h.name}</h2>
          <div className="small muted">{h.type} hospital · Founded {h.founded} · {h.accreditation}</div>
          <div className="row wrap" style={{ gap: 18, marginTop: 6 }}>
            <div className="stat"><span className="v">{h.emergency ? `${h.erWaitMins}′` : '—'}</span><span className="l muted">ER wait</span></div>
            <div className="stat"><span className="v">{h.bedsAvailable}</span><span className="l muted">Beds free</span></div>
            <div className="stat"><span className="v">{h.beds}</span><span className="l muted">Total beds</span></div>
            <div className="stat"><span className="v">{km(center, h.location)}</span><span className="l muted">Away</span></div>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <a className="btn grow" href={`tel:${h.phone.replace(/\s/g, '')}`}>📞 Call</a>
          <a className="btn ghost grow" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${h.location.lat},${h.location.lng}`}>🧭 Directions</a>
        </div>
        <div className="grid two">
          <div className="card stack">
            <h3>Departments</h3>
            <div className="row wrap" style={{ gap: 6 }}>{h.departments.map((d) => <span key={d} className="chip primary">{d}</span>)}</div>
          </div>
          <div className="card stack">
            <h3>Address</h3>
            <div className="small">{h.address}</div>
            <MiniMap center={center} pins={[{ at: h.location, icon: '🏥' }]} height={140} />
          </div>
        </div>
        {docs.length > 0 && (
          <>
            <h2>Specialists affiliated nearby</h2>
            <div className="grid">
              {docs.map((d) => (
                <Link key={d.id} to={`/app/doctors/${d.id}`} className="card link row">
                  <div className="grow"><div className="bold small">{d.name}</div><div className="tiny muted">{d.specialty}</div></div>
                  <Stars value={d.rating} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
