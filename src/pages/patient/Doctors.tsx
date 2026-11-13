import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDirectory } from '../../services/directory';
import { SPECIALTIES } from '../../data/catalog';
import { distanceKm } from '../../data/generator';
import { formatMoney } from '../../data/countries';
import { Avatar, Empty, MiniMap, Stars, TopBar } from '../../components/ui';

type Sort = 'distance' | 'rating' | 'experience' | 'fee';

export default function Doctors() {
  const { user } = useAuth();
  const { dir, center } = useDirectory(user);
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const specialty = params.get('specialty') ?? '';
  const [q, setQ] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState<Sort>('distance');
  const [onlyInsurance, setOnlyInsurance] = useState(false);
  const [onlyTele, setOnlyTele] = useState(false);
  const [gender, setGender] = useState<'' | 'F' | 'M'>('');
  const [showMap, setShowMap] = useState(false);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const mine = (user?.insurances ?? []).map((p) => p.provider.toLowerCase());
    return dir.doctors
      .filter((d) => !specialty || d.specialty === specialty)
      .filter((d) => !s || [d.name, d.specialty, ...d.subSpecialties, ...d.clinics.map((c) => c.name), ...d.languages].join(' ').toLowerCase().includes(s))
      .filter((d) => !onlyInsurance || d.acceptsInsurance.some((a) => mine.includes(a.toLowerCase())))
      .filter((d) => !onlyTele || d.telehealth)
      .filter((d) => !gender || d.gender === gender)
      .map((d) => ({ d, dist: distanceKm(center, d.location) }))
      .sort((a, b) =>
        sort === 'distance' ? a.dist - b.dist : sort === 'rating' ? b.d.rating - a.d.rating : sort === 'experience' ? b.d.yearsExperience - a.d.yearsExperience : a.d.fee - b.d.fee);
  }, [dir, q, specialty, sort, onlyInsurance, onlyTele, gender, center, user]);

  const setSpec = (s: string) => { const p = new URLSearchParams(params); if (s) p.set('specialty', s); else p.delete('specialty'); setParams(p, { replace: true }); };

  return (
    <>
      <TopBar title={specialty || 'Find a doctor'} right={<button className="icon-btn" onClick={() => setShowMap(!showMap)} aria-label="Toggle map">{showMap ? '☰' : '🗺️'}</button>} />
      <div className="page">
        <div className="search"><input className="input" placeholder="Name, condition, clinic, language…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="chips">
          <button className={`chip ${!specialty ? 'on' : ''}`} onClick={() => setSpec('')}>All</button>
          {SPECIALTIES.map((s) => <button key={s.name} className={`chip ${specialty === s.name ? 'on' : ''}`} onClick={() => setSpec(s.name)}>{s.icon} {s.name}</button>)}
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <select className="select input" style={{ width: 'auto', padding: '7px 12px' }} value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort by">
            <option value="distance">Nearest</option><option value="rating">Top rated</option><option value="experience">Most experienced</option><option value="fee">Lowest fee</option>
          </select>
          {!!user?.insurances?.length && <button className={`chip ${onlyInsurance ? 'on' : ''}`} onClick={() => setOnlyInsurance(!onlyInsurance)}>🛡️ Takes {user.insurances.length > 1 ? 'one of my insurances' : user.insurances[0].provider}</button>}
          <button className={`chip ${onlyTele ? 'on' : ''}`} onClick={() => setOnlyTele(!onlyTele)}>📹 Video visits</button>
          <button className={`chip ${gender === 'F' ? 'on' : ''}`} onClick={() => setGender(gender === 'F' ? '' : 'F')}>Female doctor</button>
          <button className={`chip ${gender === 'M' ? 'on' : ''}`} onClick={() => setGender(gender === 'M' ? '' : 'M')}>Male doctor</button>
        </div>
        <div className="small muted">{list.length} doctor{list.length === 1 ? '' : 's'} found</div>

        {showMap && <MiniMap center={center} pins={list.slice(0, 40).map(({ d }) => ({ at: d.location, icon: '🩺', label: d.name, onClick: () => nav(`/app/doctors/${d.id}`) }))} height={280} />}

        {list.length === 0 ? <Empty icon="🔎" title="No doctors match">Try removing a filter or searching another specialty.</Empty> : (
          <div className="grid">
            {list.map(({ d, dist }) => (
              <Link key={d.id} to={`/app/doctors/${d.id}`} className="card link stack sm">
                <div className="row top">
                  <Avatar name={d.name} hue={d.photoHue} />
                  <div className="grow">
                    <div className="bold">{d.name}</div>
                    <div className="small muted">{d.title}</div>
                    <Stars value={d.rating} count={d.reviewCount} />
                  </div>
                </div>
                <div className="row wrap" style={{ gap: 6 }}>
                  <span className="chip primary">{d.yearsExperience} yrs exp.</span>
                  <span className="chip">📍 {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}</span>
                  {d.telehealth && <span className="chip info">📹 Video</span>}
                  {d.id === 'doc-demo' && <span className="chip warn">★ Featured</span>}
                </div>
                <div className="row between small">
                  <span className="muted">{d.subSpecialties[0]}</span>
                  <span className="bold">{formatMoney(d.fee, user?.country)}</span>
                </div>
                <div className="tiny" style={{ color: 'var(--ok)' }}>Next available: {new Date(d.nextAvailable).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
