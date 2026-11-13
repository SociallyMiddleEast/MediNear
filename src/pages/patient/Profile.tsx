import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resetDemoData } from '../../services/backend';
import { detectLocation } from '../../services/location';
import { COUNTRIES, countryName, flag, ID_TYPES } from '../../data/countries';
import { InsuranceFields, emptyPlan, finalizePlans, validatePlans, type PlanDraft } from '../../components/InsuranceFields';
import { ThemePicker } from '../../components/ThemePicker';
import { Avatar, Modal, TopBar, ageFrom, fmtDate, toast } from '../../components/ui';
import type { IdentityDoc } from '../../types';

export default function Profile() {
  const { user, signOut, update } = useAuth();
  const nav = useNavigate();
  const [reveal, setReveal] = useState(false);
  const [locating, setLocating] = useState(false);
  const [editIns, setEditIns] = useState(false);
  const [addDoc, setAddDoc] = useState(false);
  const [plans, setPlans] = useState<PlanDraft[]>([]);
  const [planErr, setPlanErr] = useState('');
  const [doc, setDoc] = useState<IdentityDoc>({ type: 'National ID card', number: '' });
  if (!user) return null;
  const isPatient = user.role === 'patient';
  const mask = (s: string) => (reveal ? s : `•••• ${s.slice(-4)}`);

  const relocate = async () => {
    setLocating(true);
    const r = await detectLocation();
    setLocating(false);
    if (!r.point) { toast('Could not detect location'); return; }
    await update({ location: r.point, country: r.country ?? user.country, city: r.city ?? user.city, locationSource: r.source });
    toast(r.source === 'gps' ? `Location updated${r.city ? ` — ${r.city}` : ''}` : 'GPS unavailable — using country estimate');
  };

  return (
    <>
      <TopBar title={isPatient ? 'Profile' : 'Account'} />
      <div className="page">
        <div className="card row">
          <Avatar name={user.fullName} hue={190} size="lg" />
          <div className="grow stack sm">
            <h2>{user.fullName}</h2>
            <div className="small muted">{user.email}{user.phone ? ` · ${user.phone}` : ''}</div>
            <div className="row wrap" style={{ gap: 6 }}>
              <span className="chip primary">{isPatient ? 'Patient' : `${user.role[0].toUpperCase()}${user.role.slice(1)} account`}</span>
              {isPatient && user.dateOfBirth && <span className="chip">{ageFrom(user.dateOfBirth)} years</span>}
              {user.bloodType && <span className="chip danger">🩸 {user.bloodType}</span>}
              <span className="chip">Member since {fmtDate(user.createdAt, { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="card stack">
          <div className="row between"><h3>📍 Location</h3><button className="btn sm soft" onClick={relocate} disabled={locating}>{locating ? 'Locating…' : 'Update with GPS'}</button></div>
          <div className="row">
            <span style={{ fontSize: 28 }}>{flag(user.country)}</span>
            <div className="grow">
              <div className="bold">{countryName(user.country)}{user.city ? ` · ${user.city}` : ''}</div>
              <div className="tiny muted">Source: {user.locationSource === 'gps' ? 'GPS' : user.locationSource === 'manual' ? 'Selected manually' : 'Time-zone estimate'}{user.location ? ` · ${user.location.lat.toFixed(3)}, ${user.location.lng.toFixed(3)}` : ''}</div>
            </div>
          </div>
          <select className="select input" value={user.country} onChange={(e) => update({ country: e.target.value, location: undefined, locationSource: 'manual' })} aria-label="Change country">
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{flag(c.code)} {c.name}</option>)}
          </select>
        </div>

        {isPatient ? (
          <>
            <div className="stack">
              <div className="row between">
                <h3>🛡️ My insurance{(user.insurances?.length ?? 0) > 1 ? ` (${user.insurances!.length} plans)` : ''}</h3>
                <button className="btn sm soft" onClick={() => { setPlans(user.insurances?.length ? user.insurances.map((p) => ({ ...p })) : [emptyPlan(0)]); setPlanErr(''); setEditIns(true); }}>
                  {user.insurances?.length ? 'Manage' : '+ Add insurance'}
                </button>
              </div>
              {!user.insurances?.length && <div className="card flat small muted">No insurance on file — you’re listed as self-pay.</div>}
              <div className="grid">
                {(user.insurances ?? []).map((p, i) => {
                  const expired = p.validUntil && p.validUntil < new Date().toISOString().slice(0, 10);
                  return (
                    <div key={i} className="hero stack" style={{ minHeight: 150, opacity: expired ? 0.6 : 1 }}>
                      <div className="row between"><span className="tiny muted">{p.type.toUpperCase()}</span>{expired && <span className="chip danger">Expired</span>}</div>
                      <h3 style={{ fontSize: 18 }}>{p.provider}</h3>
                      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 17, letterSpacing: 2 }}>{mask(p.memberId)}</div>
                      <div className="row between small"><span>{p.policyHolder || user.fullName}</span><span className="muted">{p.validUntil ? `Valid to ${fmtDate(p.validUntil, { month: 'short', year: 'numeric' })}` : ''}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card stack">
              <div className="row between">
                <h3>🪪 Identity documents</h3>
                <button className="chip" style={{ border: '1px solid var(--border)' }} onClick={() => setReveal(!reveal)}>{reveal ? '🙈 Hide' : '👁️ Show'}</button>
              </div>
              {(user.documents ?? []).map((d, i) => (
                <div key={i} className="row">
                  <div className="tile-ico" style={{ width: 40, height: 40, fontSize: 18 }}>{d.type === 'Passport' ? '🛂' : '🪪'}</div>
                  <div className="grow"><div className="bold small">{d.type}</div><div className="tiny muted">{d.issuingCountry ? `Issued by ${countryName(d.issuingCountry)}` : ''}</div></div>
                  <code className="small">{mask(d.number)}</code>
                  <button className="icon-btn" aria-label="Remove" onClick={() => update({ documents: user.documents!.filter((_, j) => j !== i) })}>🗑️</button>
                </div>
              ))}
              <button className="btn soft sm" onClick={() => setAddDoc(true)}>+ Add document</button>
            </div>
          </>
        ) : (
          <div className="card stack sm">
            <h3>🏢 Practice</h3>
            <div className="row between small"><span className="muted">Organisation</span><b>{user.organisation}</b></div>
            {user.specialty && <div className="row between small"><span className="muted">Specialty</span><b>{user.specialty}</b></div>}
            <div className="row between small"><span className="muted">License</span><b>{user.licenseNumber}</b></div>
            <div className="row between small"><span className="muted">Verification</span><span className="chip ok">✓ Verified (demo)</span></div>
          </div>
        )}

        <div className="card stack sm">
          <h3>🎨 Appearance</h3>
          <ThemePicker />
        </div>

        <div className="card stack sm">
          <h3>⚙️ App</h3>
          <div className="tiny muted">MediNear v0.1 · Demo mode — all data is stored only in this browser.</div>
          <button className="btn ghost" onClick={async () => { await signOut(); nav('/', { replace: true }); }}>Sign out</button>
          <button className="btn danger" onClick={() => { if (confirm('Erase all accounts, bookings and orders stored in this browser?')) { resetDemoData(); location.href = location.pathname; } }}>Reset demo data</button>
        </div>
      </div>

      <Modal open={editIns} onClose={() => setEditIns(false)} title="My insurance plans">
        {planErr && <div className="error">{planErr}</div>}
        <InsuranceFields plans={plans} onChange={setPlans} country={user.country} />
        <button className="btn block" onClick={async () => {
          const err = validatePlans(plans);
          if (err) { setPlanErr(err); return; }
          await update({ insurances: finalizePlans(plans) }); setEditIns(false); toast('Insurance updated');
        }}>Save {plans.length} plan{plans.length === 1 ? '' : 's'}</button>
        {plans.length > 0 && <button className="btn ghost block" onClick={async () => { await update({ insurances: [] }); setEditIns(false); toast('Set to self-pay'); }}>I no longer have insurance</button>}
      </Modal>
      <Modal open={addDoc} onClose={() => setAddDoc(false)} title="Add document">
        <select className="select input" value={doc.type} onChange={(e) => setDoc({ ...doc, type: e.target.value })}>{ID_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        <input className="input" placeholder="Document number" value={doc.number} onChange={(e) => setDoc({ ...doc, number: e.target.value })} />
        <select className="select input" value={doc.issuingCountry ?? user.country} onChange={(e) => setDoc({ ...doc, issuingCountry: e.target.value })}>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>Issued by {c.name}</option>)}
        </select>
        <button className="btn block" disabled={doc.number.trim().length < 4} onClick={async () => {
          await update({ documents: [...(user.documents ?? []), { ...doc, number: doc.number.trim(), issuingCountry: doc.issuingCountry ?? user.country }] });
          setDoc({ type: 'National ID card', number: '' }); setAddDoc(false); toast('Document added');
        }}>Add</button>
      </Modal>
    </>
  );
}
