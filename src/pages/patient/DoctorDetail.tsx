import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDirectory } from '../../services/directory';
import { backend } from '../../services/backend';
import { mulberry32 } from '../../data/generator';
import { formatMoney } from '../../data/countries';
import { Avatar, Empty, MiniMap, Modal, Stars, TopBar, fmtDate, km, toast } from '../../components/ui';
import type { Appointment } from '../../types';

const SLOT_TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

export default function DoctorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { dir, center } = useDirectory(user);
  const nav = useNavigate();
  const d = dir.doctors.find((x) => x.id === id);

  const days = useMemo(() => Array.from({ length: 10 }, (_, i) => { const x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + i); return x; }).filter((x) => x.getDay() !== 0), []);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState('');
  const [mode, setMode] = useState<'clinic' | 'video'>('clinic');
  const [clinicIdx, setClinicIdx] = useState(0);
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const [booked, setBooked] = useState<Appointment[]>([]);

  useEffect(() => { if (d) backend.listAppointments({ doctorId: d.id }).then(setBooked); }, [d, open]);

  if (!d) return <><TopBar back title="Doctor" /><div className="page"><Empty icon="🤷" title="Doctor not found" /></div></>;

  const selectedDay = days[day];
  const taken = (t: string) => {
    const r = mulberry32(selectedDay.getDate() * 97 + d.photoHue + t.charCodeAt(1) * 13 + Number(t.slice(3)));
    const [h, m] = t.split(':').map(Number);
    const dt = new Date(selectedDay); dt.setHours(h, m);
    return r() < 0.35 || dt < new Date() || booked.some((b) => b.status !== 'cancelled' && new Date(b.date).getTime() === dt.getTime());
  };
  const ins = user?.insuranceProvider;
  const covered = !!ins && d.acceptsInsurance.some((a) => a.toLowerCase() === ins.toLowerCase());

  const book = async () => {
    const [h, m] = slot.split(':').map(Number);
    const dt = new Date(selectedDay); dt.setHours(h, m, 0, 0);
    await backend.createAppointment({
      patientId: user!.id, patientName: user!.fullName, doctorId: d.id, doctorName: d.name, specialty: d.specialty,
      clinic: mode === 'video' ? 'Video consultation' : d.clinics[clinicIdx].name, date: dt.toISOString(),
      reason: reason.trim() || 'Consultation', status: 'upcoming',
    });
    setOpen(false); setSlot(''); setReason('');
    toast(`Booked with ${d.name} on ${fmtDate(dt.toISOString())} at ${slot}`);
    nav('/app/visits');
  };

  return (
    <>
      <TopBar back title={d.name} right={<button className="icon-btn" aria-label="Share" onClick={() => { navigator.clipboard?.writeText(location.href); toast('Link copied'); }}>↗</button>} />
      <div className="page">
        <div className="card stack">
          <div className="row top">
            <Avatar name={d.name} hue={d.photoHue} size="lg" />
            <div className="grow stack sm">
              <h2>{d.name}</h2>
              <div className="muted small">{d.title}</div>
              <Stars value={d.rating} count={d.reviewCount} />
              <div className="row wrap" style={{ gap: 6 }}>
                {d.subSpecialties.map((s) => <span key={s} className="chip primary">{s}</span>)}
              </div>
            </div>
          </div>
          <div className="grid sm" style={{ gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center' }}>
            <div className="stat"><span className="v">{d.yearsExperience}</span><span className="l">Years exp.</span></div>
            <div className="stat"><span className="v">{(d.patientsTreated / 1000).toFixed(0)}k+</span><span className="l">Patients</span></div>
            <div className="stat"><span className="v">{d.publications}</span><span className="l">Publications</span></div>
            <div className="stat"><span className="v">{d.rating}</span><span className="l">Rating</span></div>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="chip">🗓️ Practising since {d.practisingSince}</span>
            <span className="chip">💵 {formatMoney(d.fee, user?.country)} / visit</span>
            {d.telehealth && <span className="chip info">📹 Video visits</span>}
            {ins && <span className={`chip ${covered ? 'ok' : 'warn'}`}>{covered ? `✓ Accepts ${ins}` : `${ins} not listed`}</span>}
          </div>
          <button className="btn block" onClick={() => setOpen(true)}>Book appointment</button>
        </div>

        <div className="grid two">
          <div className="card stack">
            <h3>About</h3>
            <p>{d.bio}</p>
            <blockquote style={{ margin: 0, padding: '10px 14px', borderLeft: '3px solid var(--primary)', background: 'var(--surface-2)', borderRadius: 8 }} className="small">“{d.philosophy}”</blockquote>
            <div className="small"><span className="muted">Languages: </span>{d.languages.join(', ')}</div>
          </div>

          <div className="card stack">
            <h3>🎓 Education & training</h3>
            <div className="timeline">
              {[...d.education].reverse().map((e) => (
                <div className="item" key={e.degree}>
                  <div className="bold small">{e.degree}</div>
                  <div className="small">{e.school}, {e.city}</div>
                  <div className="tiny muted">{e.from} – {e.to}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card stack">
            <h3>🏅 Certifications & awards</h3>
            {d.certifications.map((c) => <div key={c} className="row small"><span>✅</span>{c}</div>)}
            {d.awards.map((a) => <div key={a} className="row small"><span>🏆</span>{a}</div>)}
            {!d.awards.length && <div className="tiny muted">No awards listed.</div>}
          </div>

          <div className="card stack">
            <h3>📍 Clinics &amp; locations</h3>
            <MiniMap center={center} pins={d.clinics.map((c) => ({ at: c.location, icon: '🏥', label: c.name }))} height={160} />
            {d.clinics.map((c) => (
              <div key={c.name} className="row top">
                <div className="grow"><div className="bold small">{c.name}</div><div className="tiny muted">{c.address}</div></div>
                <div style={{ textAlign: 'right' }}><div className="tiny bold">{km(center, c.location)}</div><div className="tiny muted">{c.days}</div></div>
              </div>
            ))}
            <a className="btn ghost sm" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${d.clinics[0].location.lat},${d.clinics[0].location.lng}`}>Get directions</a>
          </div>

          <div className="card stack">
            <h3>🛡️ Insurance accepted</h3>
            <div className="row wrap" style={{ gap: 6 }}>
              {d.acceptsInsurance.map((a) => <span key={a} className={`chip ${a === ins ? 'ok' : ''}`}>{a}</span>)}
              <span className="chip">Self-pay</span>
            </div>
          </div>

          <div className="card stack">
            <div className="row between"><h3>💬 Patient reviews</h3><Stars value={d.rating} count={d.reviewCount} /></div>
            {d.reviews.map((r, i) => (
              <div key={i} className="stack sm" style={{ borderTop: i ? '1px solid var(--border)' : 0, paddingTop: i ? 10 : 0 }}>
                <div className="row between small"><b>{r.author}</b><span className="stars">{'★'.repeat(r.rating)}<span style={{ opacity: 0.25 }}>{'★'.repeat(5 - r.rating)}</span></span></div>
                <div className="small">{r.text}</div>
                <div className="tiny muted">{fmtDate(r.date, { month: 'long', year: 'numeric' })}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Book a visit">
        <div className="row" style={{ gap: 8 }}>
          <button className={`chip grow ${mode === 'clinic' ? 'on' : ''}`} onClick={() => setMode('clinic')}>🏥 In clinic</button>
          <button className={`chip grow ${mode === 'video' ? 'on' : ''}`} disabled={!d.telehealth} onClick={() => setMode('video')}>📹 Video{!d.telehealth ? ' (n/a)' : ''}</button>
        </div>
        {mode === 'clinic' && d.clinics.length > 1 && (
          <select className="select input" value={clinicIdx} onChange={(e) => setClinicIdx(Number(e.target.value))}>
            {d.clinics.map((c, i) => <option key={c.name} value={i}>{c.name} ({c.days})</option>)}
          </select>
        )}
        <div className="chips">
          {days.map((x, i) => (
            <button key={i} className={`slot ${day === i ? 'on' : ''}`} onClick={() => { setDay(i); setSlot(''); }} style={{ minWidth: 64, textAlign: 'center' }}>
              <div className="tiny" style={{ opacity: 0.8 }}>{x.toLocaleDateString('en', { weekday: 'short' })}</div>
              <div>{x.getDate()}</div>
            </button>
          ))}
        </div>
        <div className="grid sm" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(74px, 1fr))' }}>
          {SLOT_TIMES.map((t) => <button key={t} className={`slot ${slot === t ? 'on' : ''}`} disabled={taken(t)} onClick={() => setSlot(t)}>{t}</button>)}
        </div>
        <textarea className="input" rows={2} placeholder="Reason for visit (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="row between small">
          <span className="muted">Consultation fee</span>
          <b>{formatMoney(d.fee, user?.country)}{covered ? ' · billed to insurance' : ''}</b>
        </div>
        <button className="btn block" disabled={!slot} onClick={book}>{slot ? `Confirm ${fmtDate(selectedDay.toISOString())} at ${slot}` : 'Pick a time'}</button>
      </Modal>
    </>
  );
}
