import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { GeoPoint, IdentityDoc, Role } from '../../types';
import { COUNTRIES, ID_TYPES, countryName, flag, insurersFor } from '../../data/countries';
import { SPECIALTIES } from '../../data/catalog';
import { centerOf, detectLocation, type DetectedLocation } from '../../services/location';
import { ageFrom } from '../../components/ui';

const ROLES: { role: Role; icon: string; title: string; desc: string }[] = [
  { role: 'patient', icon: '🙂', title: 'Patient', desc: 'Find care, book visits, order tests' },
  { role: 'doctor', icon: '🩺', title: 'Doctor', desc: 'Manage patients, schedule & results' },
  { role: 'pharmacy', icon: '💊', title: 'Pharmacy', desc: 'Publish stock & prices, take reservations' },
  { role: 'hospital', icon: '🏥', title: 'Hospital', desc: 'Admissions, beds, departments' },
  { role: 'lab', icon: '🧪', title: 'Laboratory', desc: 'Test orders, sample tracking, results' },
];
const BLOOD = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', "Don't know"];
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function SignUp() {
  const [params] = useSearchParams();
  const { signUp } = useAuth();
  const nav = useNavigate();
  const providerMode = params.get('provider') === '1';

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>(providerMode ? 'doctor' : 'patient');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  // location
  const [loc, setLoc] = useState<DetectedLocation | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  // personal
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  // insurance + ids
  const [insurer, setInsurer] = useState('');
  const [insurerOther, setInsurerOther] = useState('');
  const [insuranceId, setInsuranceId] = useState('');
  const [docs, setDocs] = useState<IdentityDoc[]>([{ type: 'Passport', number: '' }]);
  // provider
  const [organisation, setOrganisation] = useState('');
  const [license, setLicense] = useState('');
  const [specialty, setSpecialty] = useState('General Practice');
  const [agree, setAgree] = useState(false);

  const isPatient = role === 'patient';
  const steps = isPatient
    ? ['Account type', 'Account', 'Location', 'About you', 'Insurance & ID', 'Review']
    : ['Account type', 'Account', 'Location', 'Practice', 'Review'];
  const current = steps[step];

  const runDetect = async () => {
    setDetecting(true);
    const r = await detectLocation();
    setLoc(r);
    if (r.country) setCountry(r.country);
    if (r.city) setCity(r.city);
    setDetecting(false);
  };
  useEffect(() => { if (current === 'Location' && !loc && !detecting) runDetect(); /* eslint-disable-next-line */ }, [current]);

  const age = ageFrom(dob);

  const validate = (): string => {
    switch (current) {
      case 'Account':
        if (fullName.trim().length < 2) return 'Please enter your full name.';
        if (!emailOk(email)) return 'Please enter a valid email address.';
        if (password.length < 8) return 'Password must be at least 8 characters.';
        if (password !== password2) return 'Passwords do not match.';
        return '';
      case 'Location':
        return country ? '' : 'Please confirm the country you are in.';
      case 'About you':
        if (!dob) return 'Please enter your date of birth.';
        if (age === undefined || age < 0 || age > 120) return 'Please enter a valid date of birth.';
        return '';
      case 'Insurance & ID': {
        if (!insurer) return 'Select your insurance (or “Uninsured / self-pay”).';
        if (insurer === 'Other' && !insurerOther.trim()) return 'Enter the name of your insurer.';
        if (insurer !== 'Uninsured / self-pay' && insuranceId.trim().length < 3) return 'Enter your insurance member ID.';
        const filled = docs.filter((d) => d.number.trim());
        if (!filled.length) return 'Add at least one identity document (passport, ID card…).';
        if (filled.some((d) => d.number.trim().length < 4)) return 'Document numbers look too short.';
        return '';
      }
      case 'Practice':
        if (organisation.trim().length < 2) return `Enter the name of your ${role === 'doctor' ? 'clinic' : role}.`;
        if (license.trim().length < 3) return 'Enter your license / registration number.';
        return '';
      case 'Review':
        return agree ? '' : 'Please accept the terms and privacy policy.';
      default:
        return '';
    }
  };

  const next = async () => {
    const v = validate();
    setError(v);
    if (v) return;
    if (step < steps.length - 1) { setStep(step + 1); window.scrollTo(0, 0); return; }
    setBusy(true);
    try {
      const point: GeoPoint | undefined = loc?.point && loc.country === country ? loc.point : centerOf(country);
      const u = await signUp({
        role, fullName: fullName.trim(), email, phone: phone.trim() || undefined, password,
        country, city: city.trim() || undefined, location: point,
        locationSource: loc?.source === 'gps' && loc.country === country ? 'gps' : loc?.country === country ? 'timezone' : 'manual',
        ...(isPatient
          ? {
              dateOfBirth: dob, gender: gender || undefined, bloodType: bloodType || undefined,
              insuranceProvider: insurer === 'Other' ? insurerOther.trim() : insurer,
              insuranceId: insuranceId.trim() || undefined,
              documents: docs.filter((d) => d.number.trim()).map((d) => ({ ...d, number: d.number.trim() })),
            }
          : { organisation: organisation.trim(), licenseNumber: license.trim(), specialty: role === 'doctor' ? specialty : undefined }),
      });
      nav(u.role === 'patient' ? '/app' : '/portal', { replace: true });
    } catch (e) { setError((e as Error).message); setBusy(false); }
  };

  const setDoc = (i: number, patch: Partial<IdentityDoc>) => setDocs(docs.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="row between">
          <Link to="/" className="brand"><div className="logo">✚</div>MediNear</Link>
          <span className="small muted">Step {step + 1} of {steps.length}</span>
        </div>
        <div className="steps">{steps.map((s, i) => <span key={s} className={i <= step ? 'on' : ''} />)}</div>
        <h1>{current === 'Account type' ? 'Create your account' : current}</h1>
        {error && <div className="error" role="alert">{error}</div>}

        {current === 'Account type' && (
          <div className="stack">
            <p className="muted">How will you use MediNear?</p>
            {ROLES.filter((r) => !providerMode || r.role !== 'patient').map((r) => (
              <button key={r.role} type="button" className={`role-card ${role === r.role ? 'on' : ''}`} onClick={() => setRole(r.role)}>
                <div className="tile-ico">{r.icon}</div>
                <div className="grow"><div className="bold">{r.title}</div><div className="small muted">{r.desc}</div></div>
                <span>{role === r.role ? '✅' : ''}</span>
              </button>
            ))}
          </div>
        )}

        {current === 'Account' && (
          <div className="stack">
            <Field label={isPatient ? 'Full name (as on your ID)' : 'Your full name'}>
              <input className="input" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Email"><input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Mobile number (optional)"><input className="input" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+961 …" /></Field>
            <Field label="Password (min. 8 characters)"><input className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
            <Field label="Confirm password"><input className="input" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} /></Field>
          </div>
        )}

        {current === 'Location' && (
          <div className="stack">
            <p className="muted">We use your location to show {isPatient ? 'doctors, pharmacies, hospitals and labs near you' : 'your practice to nearby patients'} and to apply the right insurers and currency.</p>
            <div className="card flat stack sm">
              {detecting ? (
                <div className="row"><div className="tile-ico">📡</div><div>Detecting your location…<div className="small muted">Allow location access when your browser asks.</div></div></div>
              ) : loc ? (
                <div className="row top">
                  <div className="tile-ico">{loc.source === 'gps' ? '📍' : '🕒'}</div>
                  <div className="grow">
                    <div className="bold">{loc.country ? `${flag(loc.country)} ${countryName(loc.country)}` : 'Country not detected'}{loc.city ? ` · ${loc.city}` : ''}</div>
                    <div className="small muted">
                      {loc.source === 'gps' ? `Detected by GPS${loc.accuracyM ? ` (±${loc.accuracyM} m)` : ''}` : `Estimated from your device time zone. ${loc.error ?? ''}`}
                    </div>
                  </div>
                </div>
              ) : null}
              <button type="button" className="btn ghost sm" onClick={runDetect} disabled={detecting}>↻ Detect again</button>
            </div>
            <Field label="Country you are in">
              <select className="select input" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">Select country…</option>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{flag(c.code)} {c.name}</option>)}
              </select>
            </Field>
            {loc?.country && country && loc.country !== country && (
              <div className="notice">You picked a different country than the one detected. Results will be centred on {countryName(country)}.</div>
            )}
            <Field label="City / area (optional)"><input className="input" value={city} onChange={(e) => setCity(e.target.value)} /></Field>
          </div>
        )}

        {current === 'About you' && (
          <div className="stack">
            <Field label="Date of birth">
              <input className="input" type="date" value={dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDob(e.target.value)} />
            </Field>
            {age !== undefined && age >= 0 && (
              <div className={age < 18 ? 'notice' : 'chip primary'} style={{ alignSelf: age < 18 ? 'stretch' : 'flex-start' }}>
                Age: {age}{age < 18 ? ' — a parent or guardian must manage this account.' : ''}
              </div>
            )}
            <Field label="Gender">
              <div className="chips">
                {['Female', 'Male', 'Other', 'Prefer not to say'].map((g) => (
                  <button type="button" key={g} className={`chip ${gender === g ? 'on' : ''}`} onClick={() => setGender(g)}>{g}</button>
                ))}
              </div>
            </Field>
            <Field label="Blood type (optional)">
              <div className="chips" style={{ flexWrap: 'wrap' }}>
                {BLOOD.map((b) => <button type="button" key={b} className={`chip ${bloodType === b ? 'on' : ''}`} onClick={() => setBloodType(b)}>{b}</button>)}
              </div>
            </Field>
          </div>
        )}

        {current === 'Insurance & ID' && (
          <div className="stack">
            <div className="card flat stack">
              <h3>🛡️ Health insurance</h3>
              <Field label={`Insurer in ${countryName(country)}`}>
                <select className="select input" value={insurer} onChange={(e) => setInsurer(e.target.value)}>
                  <option value="">Select…</option>
                  {insurersFor(country).map((i) => <option key={i}>{i}</option>)}
                </select>
              </Field>
              {insurer === 'Other' && <Field label="Insurer name"><input className="input" value={insurerOther} onChange={(e) => setInsurerOther(e.target.value)} /></Field>}
              {insurer && insurer !== 'Uninsured / self-pay' && (
                <Field label="Insurance member ID"><input className="input" value={insuranceId} onChange={(e) => setInsuranceId(e.target.value)} placeholder="e.g. AXA-1234-5678" /></Field>
              )}
            </div>
            <div className="card flat stack">
              <div className="row between"><h3>🪪 Identity documents</h3><span className="tiny muted">Passport, national ID…</span></div>
              {docs.map((d, i) => (
                <div key={i} className="stack sm" style={{ paddingBottom: 10, borderBottom: i < docs.length - 1 ? '1px solid var(--border)' : 0 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <select className="select input" value={d.type} onChange={(e) => setDoc(i, { type: e.target.value })}>
                      {ID_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    {docs.length > 1 && <button type="button" className="icon-btn" aria-label="Remove document" onClick={() => setDocs(docs.filter((_, j) => j !== i))}>🗑️</button>}
                  </div>
                  <input className="input" placeholder="Document number" value={d.number} onChange={(e) => setDoc(i, { number: e.target.value })} />
                  <select className="select input" value={d.issuingCountry ?? country} onChange={(e) => setDoc(i, { issuingCountry: e.target.value })}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>Issued by {c.name}</option>)}
                  </select>
                </div>
              ))}
              <button type="button" className="btn soft sm" onClick={() => setDocs([...docs, { type: 'National ID card', number: '', issuingCountry: country }])}>+ Add another document</button>
            </div>
            <p className="tiny muted">🔒 Your ID and insurance details are only shared with providers you book with. In production they are encrypted at rest.</p>
          </div>
        )}

        {current === 'Practice' && (
          <div className="stack">
            <Field label={role === 'doctor' ? 'Clinic / practice name' : `${role[0].toUpperCase() + role.slice(1)} name`}>
              <input className="input" value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
            </Field>
            {role === 'doctor' && (
              <Field label="Specialty">
                <select className="select input" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  {SPECIALTIES.map((s) => <option key={s.name}>{s.name}</option>)}
                </select>
              </Field>
            )}
            <Field label={role === 'doctor' ? 'Medical license number' : 'License / registration number'}>
              <input className="input" value={license} onChange={(e) => setLicense(e.target.value)} />
            </Field>
            <div className="notice">Provider accounts are verified against the national registry before going public. (Simulated in this demo.)</div>
          </div>
        )}

        {current === 'Review' && (
          <div className="stack">
            <div className="card flat stack sm small">
              <Row k="Account type" v={ROLES.find((r) => r.role === role)?.title} />
              <Row k="Name" v={fullName} />
              <Row k="Email" v={email} />
              <Row k="Location" v={`${flag(country)} ${countryName(country)}${city ? `, ${city}` : ''}`} />
              {isPatient ? (
                <>
                  <Row k="Age" v={age !== undefined ? String(age) : '—'} />
                  <Row k="Insurance" v={`${insurer === 'Other' ? insurerOther : insurer}${insuranceId ? ` · ${insuranceId}` : ''}`} />
                  {docs.filter((d) => d.number).map((d, i) => <Row key={i} k={d.type} v={`•••• ${d.number.slice(-4)}`} />)}
                </>
              ) : (
                <>
                  <Row k="Organisation" v={organisation} />
                  {role === 'doctor' && <Row k="Specialty" v={specialty} />}
                  <Row k="License" v={license} />
                </>
              )}
            </div>
            <label className="row small" style={{ alignItems: 'flex-start' }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 4 }} />
              <span>I agree to the Terms of Service and Privacy Policy and consent to MediNear processing my health data to provide the service.</span>
            </label>
          </div>
        )}

        <div className="row" style={{ gap: 10 }}>
          {step > 0 && <button type="button" className="btn ghost" onClick={() => { setError(''); setStep(step - 1); }}>Back</button>}
          <button type="button" className="btn grow" onClick={next} disabled={busy || detecting}>
            {busy ? 'Creating account…' : step === steps.length - 1 ? 'Create account' : 'Continue'}
          </button>
        </div>
        <p className="small muted" style={{ textAlign: 'center' }}>Already have an account? <Link to="/signin">Sign in</Link></p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}
function Row({ k, v }: { k: string; v?: string }) {
  return <div className="row between"><span className="muted">{k}</span><span className="bold" style={{ textAlign: 'right' }}>{v || '—'}</span></div>;
}
