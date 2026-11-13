import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDirectory } from '../../services/directory';
import { backend } from '../../services/backend';
import { LAB_TESTS } from '../../data/catalog';
import { distanceKm } from '../../data/generator';
import { formatMoney } from '../../data/countries';
import { Empty, MiniMap, Stars, TopBar, km, toast } from '../../components/ui';

export default function Labs() {
  const { user } = useAuth();
  const { dir, center } = useDirectory(user);
  const [test, setTest] = useState('');
  const [home, setHome] = useState(false);
  const list = useMemo(() => dir.labs
    .filter((l) => (!home || l.homeCollection) && (!test || l.tests.some((t) => t.id === test)))
    .map((l) => ({ l, dist: distanceKm(center, l.location), price: l.tests.find((t) => t.id === test)?.price }))
    .sort((a, b) => (test ? (a.price ?? 0) - (b.price ?? 0) : a.dist - b.dist)), [dir, center, test, home]);
  return (
    <>
      <TopBar title="Labs & blood tests" />
      <div className="page">
        <select className="select input" value={test} onChange={(e) => setTest(e.target.value)} aria-label="Test">
          <option value="">Any test — show all labs</option>
          {LAB_TESTS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="row" style={{ gap: 8 }}>
          <button className={`chip ${home ? 'on' : ''}`} onClick={() => setHome(!home)}>🏠 Home sample collection</button>
        </div>
        <MiniMap center={center} pins={list.map(({ l }) => ({ at: l.location, icon: '🧪', label: l.name }))} height={180} />
        {list.length === 0 ? <Empty icon="🧪" title="No labs match" /> : (
          <div className="grid">
            {list.map(({ l, dist, price }) => (
              <Link key={l.id} to={`/app/labs/${l.id}${test ? `?test=${test}` : ''}`} className="card link stack sm">
                <div className="row between top"><div className="bold">{l.name}</div><Stars value={l.rating} /></div>
                <div className="tiny muted">{l.accreditation} · {l.hours}</div>
                <div className="row wrap" style={{ gap: 6 }}>
                  <span className="chip">📍 {dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}</span>
                  {l.homeCollection && <span className="chip info">🏠 Home visit</span>}
                  <span className="chip">{l.tests.length} tests</span>
                  {price !== undefined && <span className="chip ok">{formatMoney(price, user?.country)}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function LabDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { dir, center } = useDirectory(user);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const pre = params.get('test');
  const [sel, setSel] = useState<string[]>(pre ? [pre] : []);
  const [homeVisit, setHomeVisit] = useState(false);
  const [date, setDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); });
  const [time, setTime] = useState('08:00');
  const l = dir.labs.find((x) => x.id === id);
  if (!l) return <><TopBar back title="Lab" /><div className="page"><Empty icon="🤷" title="Lab not found" /></div></>;

  const chosen = l.tests.filter((t) => sel.includes(t.id));
  const total = chosen.reduce((s, t) => s + t.price, 0) + (homeVisit ? 10 : 0);
  const fasting = chosen.some((t) => t.fasting);
  const cats = [...new Set(l.tests.map((t) => t.category))];

  const book = async () => {
    await backend.createLabOrder({
      patientId: user!.id, patientName: user!.fullName, labId: l.id, labName: l.name, tests: chosen.map((t) => t.name),
      status: 'ordered', scheduledFor: new Date(`${date}T${time}`).toISOString(), homeCollection: homeVisit, total,
    });
    toast('Lab tests booked — track them in My care');
    nav('/app/visits?tab=labs');
  };

  return (
    <>
      <TopBar back title={l.name} />
      <div className="page">
        <div className="card stack sm">
          <h2>{l.name}</h2>
          <div className="small muted">{l.address}</div>
          <div className="row wrap" style={{ gap: 6 }}>
            <Stars value={l.rating} /><span className="chip">📍 {km(center, l.location)}</span><span className="chip">🕒 {l.hours}</span>
            <span className="chip primary">{l.accreditation}</span>{l.homeCollection && <span className="chip info">🏠 Home collection</span>}
          </div>
        </div>
        <h2>Choose tests</h2>
        {cats.map((c) => (
          <div key={c} className="card stack sm">
            <div className="tiny bold muted">{c.toUpperCase()}</div>
            {l.tests.filter((t) => t.category === c).map((t) => (
              <label key={t.id} className="row" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={sel.includes(t.id)} onChange={(e) => setSel(e.target.checked ? [...sel, t.id] : sel.filter((x) => x !== t.id))} />
                <div className="grow">
                  <div className="small bold">{t.name}</div>
                  <div className="tiny muted">Results in ~{t.turnaroundHrs} h{t.fasting ? ' · Fasting required' : ''}</div>
                </div>
                <b className="small">{formatMoney(t.price, user?.country)}</b>
              </label>
            ))}
          </div>
        ))}
        {chosen.length > 0 && (
          <div className="card stack" style={{ position: 'sticky', bottom: 84, borderColor: 'var(--primary)' }}>
            <div className="row" style={{ gap: 8 }}>
              <input className="input" type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
              <select className="select input" value={time} onChange={(e) => setTime(e.target.value)}>
                {['07:00', '07:30', '08:00', '08:30', '09:00', '10:00', '11:00', '12:00', '14:00', '16:00'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            {l.homeCollection && (
              <label className="row small"><input type="checkbox" checked={homeVisit} onChange={(e) => setHomeVisit(e.target.checked)} /> Collect sample at my home (+{formatMoney(10, user?.country)})</label>
            )}
            {fasting && <div className="notice">🍽️ Fast for 8–12 hours before your appointment (water is fine).</div>}
            <div className="row between"><span>{chosen.length} test{chosen.length > 1 ? 's' : ''}</span><b style={{ fontSize: 18 }}>{formatMoney(total, user?.country)}</b></div>
            <button className="btn block" onClick={book}>Book tests</button>
          </div>
        )}
      </div>
    </>
  );
}
