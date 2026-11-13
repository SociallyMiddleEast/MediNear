import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../components/ThemePicker';

const FEATURES = [
  ['🩺', 'Find doctors near you', 'Browse by specialty, compare credentials, book in seconds.'],
  ['💊', 'Check medicine prices', 'See which pharmacy has your medicine in stock — and for how much.'],
  ['🏥', 'Hospitals & ER wait times', 'Live bed availability and emergency waiting times.'],
  ['🧪', 'Blood tests & labs', 'Book tests, home collection and track results in one place.'],
];

export default function Welcome() {
  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="row between"><div className="brand" style={{ fontSize: 24 }}><div className="logo">✚</div>MediNear</div><ThemeToggle /></div>
        <div className="hero stack">
          <h1 style={{ fontSize: 30 }}>Healthcare around you,<br />in one place.</h1>
          <p className="muted">Doctors, pharmacies, hospitals and labs near your location — with your insurance and records ready.</p>
        </div>
        <div className="stack">
          {FEATURES.map(([icon, t, d]) => (
            <div className="row" key={t}>
              <div className="tile-ico">{icon}</div>
              <div><div className="bold">{t}</div><div className="small muted">{d}</div></div>
            </div>
          ))}
        </div>
        <div className="stack sm">
          <Link className="btn block" to="/signup">Create an account</Link>
          <Link className="btn ghost block" to="/signin">I already have an account</Link>
        </div>
        <div className="card flat row">
          <div className="tile-ico">👩‍⚕️</div>
          <div className="grow">
            <div className="bold">Are you a healthcare provider?</div>
            <div className="small muted">Doctors, pharmacies, hospitals and labs have their own portal.</div>
          </div>
          <Link className="btn soft sm" to="/signup?provider=1">Join</Link>
        </div>
      </div>
    </div>
  );
}
