import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../services/backend';

const ICON: Record<string, string> = { patient: '🙂', doctor: '🩺', pharmacy: '💊', hospital: '🏥', lab: '🧪' };

export default function SignIn() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const go = async (e: string, p: string) => {
    setBusy(true); setError('');
    try {
      const u = await signIn(e, p);
      nav(u.role === 'patient' ? '/app' : '/portal', { replace: true });
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };
  const submit = (e: FormEvent) => { e.preventDefault(); go(email, password); };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <Link to="/" className="brand"><div className="logo">✚</div>MediNear</Link>
        <div>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to your patient or provider account.</p>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <div className="row" style={{ gap: 8 }}>
            <input id="pw" className="input" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label="Show password">{show ? '🙈' : '👁️'}</button>
          </div>
        </div>
        <button className="btn block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="small muted" style={{ textAlign: 'center' }}>New here? <Link to="/signup">Create an account</Link></p>

        <div className="card flat stack sm">
          <div className="bold small">Try a demo account</div>
          <p className="tiny muted">Each opens a different side of the app. Data stays in this browser.</p>
          <div className="row wrap" style={{ gap: 8 }}>
            {DEMO_ACCOUNTS.map((d) => (
              <button type="button" key={d.role} className="chip" style={{ border: '1px solid var(--border)', padding: '8px 12px' }} disabled={busy} onClick={() => go(d.email, DEMO_PASSWORD)}>
                {ICON[d.role]} {d.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
