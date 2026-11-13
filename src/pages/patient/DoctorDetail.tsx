import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDirectory } from '../../services/directory';
import { backend } from '../../services/backend';
import { distanceKm, mulberry32 } from '../../data/generator';
import { emergencyNumber, formatMoney } from '../../data/countries';
import { copyFor } from '../../data/specialtyContent';
import { SPECIALTIES } from '../../data/catalog';
import { Empty, TopBar, fmtDate, initials, km, toast } from '../../components/ui';
import type { Appointment } from '../../types';

const SLOT_TIMES = ['09:00', '10:30', '12:00', '14:30', '16:00', '17:30'];
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function DoctorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { dir, center } = useDirectory(user);
  const nav = useNavigate();
  const d = dir.doctors.find((x) => x.id === id);

  const days = useMemo(() => {
    const out: Date[] = [];
    const now = new Date();
    const x = new Date(); x.setHours(0, 0, 0, 0);
    // After the last slot of the day, start from tomorrow.
    if (now.getHours() * 60 + now.getMinutes() >= 17 * 60 + 30) x.setDate(x.getDate() + 1);
    while (out.length < 6) { if (x.getDay() !== 0) out.push(new Date(x)); x.setDate(x.getDate() + 1); }
    return out;
  }, []);
  const [where, setWhere] = useState(0); // clinic index, or -1 for video
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');
  const [booked, setBooked] = useState<Appointment[]>([]);
  const [sending, setSending] = useState(false);
  useEffect(() => { if (d) backend.listAppointments({ doctorId: d.id }).then(setBooked); }, [d]);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!d) return <><TopBar back title="Doctor" /><div className="page"><Empty icon="🤷" title="Doctor not found" /></div></>;

  const copy = copyFor(d.specialty);
  const icon = SPECIALTIES.find((s) => s.name === d.specialty)?.icon ?? '🩺';
  const shortName = d.name.replace(/^Dr\.?\s+/, '');
  const lastName = shortName.split(' ').slice(-1)[0];
  const selectedDay = days[day];
  const taken = (t: string) => {
    const r = mulberry32(selectedDay.getDate() * 97 + d.photoHue + Number(t.replace(':', '')));
    const [h, m] = t.split(':').map(Number);
    const dt = new Date(selectedDay); dt.setHours(h, m);
    return r() < 0.3 || dt < new Date() || booked.some((b) => b.status !== 'cancelled' && new Date(b.date).getTime() === dt.getTime());
  };
  const myPlans = user?.insurances ?? [];
  const accepted = new Set(d.acceptsInsurance.map((a) => a.toLowerCase()));
  const coveredBy = myPlans.filter((p) => accepted.has(p.provider.toLowerCase()));
  const md = d.education.find((e) => e.degree.includes('(MD)')) ?? d.education[0];
  const lastTraining = d.education[d.education.length - 1];
  const trainedIn = md.city === lastTraining.city ? `Trained in ${md.city},` : `Trained in ${md.city} and ${lastTraining.city},`;
  const clinicShort = (name: string) => name.replace(new RegExp(`^${lastName}\\s+`), '').replace(/ Clinic$/, '') || name;
  const affiliations = [...dir.hospitals].sort((a, b) => distanceKm(d.location, a.location) - distanceKm(d.location, b.location)).slice(0, 2 + (d.photoHue % 3));
  const whereLabel = where === -1 ? 'Video visit' : clinicShort(d.clinics[where].name);
  const towns = [...new Set(d.clinics.map((c) => c.address.split(', ').pop()))];

  const send = async () => {
    if (!slot) { toast('Pick a preferred time'); return; }
    setSending(true);
    const [h, m] = slot.split(':').map(Number);
    const dt = new Date(selectedDay); dt.setHours(h, m, 0, 0);
    await backend.createAppointment({
      patientId: user!.id, patientName: user!.fullName, doctorId: d.id, doctorName: d.name, specialty: d.specialty,
      clinic: where === -1 ? 'Video consultation' : d.clinics[where].name, date: dt.toISOString(),
      reason: reason.trim() || 'Consultation', status: 'upcoming',
    });
    toast(`Request sent — ${fmtDate(dt.toISOString())} at ${slot}`);
    nav('/app/visits');
  };

  return (
    <div className="dp">
      {/* ---------- doctor header ---------- */}
      <div className="dp-top">
        <div className="dp-bar card">
          <button className="icon-btn" aria-label="Back" onClick={() => nav(-1)}>←</button>
          <div className="dp-mark" aria-hidden>{icon}</div>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="bold ellipsis">{d.name}</div>
            <div className="tiny muted ellipsis">{d.specialty}{d.subSpecialties[0] ? ` · ${d.subSpecialties[0]}` : ''}</div>
          </div>
          <nav className="dp-links" aria-label="Sections">
            <button onClick={() => go('dp-services')}>Services</button>
            <button onClick={() => go('dp-about')}>About</button>
            <button onClick={() => go('dp-visit')}>Your visit</button>
            <button onClick={() => go('dp-clinics')}>Clinics</button>
          </nav>
          <button className="dp-dark-btn" onClick={() => go('dp-book')}>📅 <span>Book a visit</span></button>
        </div>
      </div>

      <div className="dp-page">
        {/* ---------- hero + booking ---------- */}
        <section className="dp-hero-row">
          <div className="dp-hero">
            <div className="dp-circle" aria-hidden><div className="dp-circle-in">{icon}</div></div>
            <span className="dp-pill"><i className="dp-dot" />{towns.length > 1 ? `Clinics in ${towns.join(' & ')}` : `Clinic in ${towns[0]}`}{d.telehealth ? ' · Video visits' : ''}</span>
            <h1 className="dp-h1">{copy.headline}<br /><em>{copy.tagline}</em></h1>
            <p className="dp-lead">{copy.intro} Consultations in {d.languages.join(', ').replace(/, ([^,]*)$/, ' and $1')}.</p>
            <div className="row wrap" style={{ gap: 10 }}>
              <button className="dp-btn" onClick={() => go('dp-book')}>Book an appointment</button>
              <button className="dp-btn ghost" onClick={() => go('dp-services')}>Explore services</button>
            </div>
          </div>

          <div className="dp-book card" id="dp-book">
            <div className="row between"><h2>Request a visit</h2><span className="small muted">{selectedDay.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</span></div>
            <div className="dp-label">Where</div>
            <div className="dp-seg">
              {d.clinics.map((c, i) => <button key={c.name} className={where === i ? 'on' : ''} onClick={() => setWhere(i)} title={c.name}>{clinicShort(c.name)}</button>)}
              {d.telehealth && <button className={where === -1 ? 'on' : ''} onClick={() => setWhere(-1)}>Video</button>}
            </div>
            <div className="dp-label">Day</div>
            <div className="dp-days">
              {days.map((x, i) => (
                <button key={i} className={day === i ? 'on' : ''} onClick={() => { setDay(i); setSlot(''); }}>
                  <span>{x.toLocaleDateString('en', { weekday: 'short' })}</span><b>{x.getDate()}</b>
                </button>
              ))}
            </div>
            <div className="dp-label">Preferred time</div>
            <div className="dp-times">
              {SLOT_TIMES.map((t) => <button key={t} className={slot === t ? 'on' : ''} disabled={taken(t)} onClick={() => setSlot(t)}>{t}</button>)}
            </div>
            <textarea className="input" rows={2} placeholder="Reason for visit (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="dp-summary">
              <div className="tiny muted">Your request · booking as {user?.fullName}</div>
              <div className="bold">{whereLabel} · {fmtDate(selectedDay.toISOString())}{slot ? ` · ${slot}` : ''}</div>
              <div className="tiny muted">
                {formatMoney(d.fee, user?.country)} consultation{coveredBy.length ? ` · billed to ${coveredBy[0].provider}` : myPlans.length ? ' · your insurance isn’t listed (self-pay)' : ''}
              </div>
              <button className="dp-btn sm" onClick={send} disabled={sending}>{sending ? 'Sending…' : 'Send request'}</button>
            </div>
          </div>
        </section>

        {/* ---------- meet your doctor ---------- */}
        <section className="dp-about-row" id="dp-about">
          <div className="dp-portrait card">
            <div className="dp-portrait-art" style={{ ['--h' as string]: d.photoHue }}><span>{initials(d.name)}</span></div>
            <div className="dp-portrait-cap">
              <div className="bold">{d.name}, MD</div>
              <div className="tiny muted">{d.title}</div>
            </div>
          </div>
          <div className="card dp-about">
            <div className="dp-eyebrow">Meet your doctor</div>
            <h2 className="dp-h2">{trainedIn} <em>practising close to home.</em></h2>
            <p className="muted">{d.bio} {d.philosophy}</p>
            <div className="row wrap" style={{ gap: 8 }}>
              {d.education.slice(1).map((e) => <span key={e.degree} className="dp-chip">{e.degree.split(',')[0]} · {e.school}</span>)}
              <span className="dp-chip">{d.languages.join(' · ')}</span>
            </div>
          </div>
          <div className="dp-stats">
            <div className="dp-stat blue"><span>⭐</span><b>{d.practisingSince}</b><small>in practice since</small></div>
            <div className="dp-stat card"><span>👥</span><b>{(d.patientsTreated / 1000).toFixed(0)}k+</b><small>patients treated</small></div>
            <div className="dp-stat card"><span>★</span><b>{d.rating.toFixed(1)}</b><small>{d.reviewCount} patient reviews</small></div>
            {d.telehealth
              ? <div className="dp-stat card"><span>📹</span><b className="sm">Video visits</b><small>Follow-ups from home</small></div>
              : <div className="dp-stat card"><span>📚</span><b>{d.publications}</b><small>publications</small></div>}
          </div>
        </section>

        {/* ---------- services ---------- */}
        <section className="card dp-section" id="dp-services">
          <div className="dp-section-head">
            <h2 className="dp-h2">How I can <em>help</em></h2>
            <p className="small muted">Not sure what you need? Start with a consultation and we’ll decide together whether any tests or procedures are needed.</p>
          </div>
          <div className="dp-services">
            {copy.services.map((s) => (
              <div key={s.title} className="dp-service">
                <div className="dp-service-ico">{s.icon}</div>
                <div><div className="bold">{s.title}</div><div className="small muted">{s.text}</div></div>
              </div>
            ))}
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="tiny muted">Special interests:</span>
            {d.subSpecialties.map((s) => <span key={s} className="dp-chip">{s}</span>)}
          </div>
        </section>

        {/* ---------- your visit ---------- */}
        <section className="dp-steps" id="dp-visit">
          <div className="dp-step soft">
            <div className="dp-eyebrow">Your visit</div>
            <h2 className="dp-h2">Three simple steps, <em>zero stress.</em></h2>
          </div>
          <div className="dp-step card"><div className="dp-num">01</div><h3>Request a time</h3><p className="small muted">Use the form above. The clinic confirms your appointment in the app.</p></div>
          <div className="dp-step card"><div className="dp-num">02</div><h3>Talk it through</h3><p className="small muted">A careful consultation and examination. Bring previous reports, lab results and your list of medicines.</p></div>
          <div className="dp-step ink"><div className="dp-num">03</div><h3>Leave with a plan</h3><p className="small">Clear next steps — tests, prescriptions sent to your pharmacy, and an easy way to follow up.</p></div>
        </section>

        {/* ---------- affiliations, credentials, insurance ---------- */}
        <section className="card dp-section">
          <div className="dp-section-head">
            <h2 className="dp-h2">Hospital <em>affiliations</em></h2>
            <p className="small muted">Procedures and admissions take place at:</p>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            {affiliations.map((h) => <button key={h.id} className="dp-chip dot" onClick={() => nav(`/app/hospitals/${h.id}`)}>{h.name}</button>)}
          </div>
          <div className="dp-cols">
            <div className="stack sm">
              <div className="dp-label">Certifications & awards</div>
              {d.certifications.map((c) => <div key={c} className="small">✓ {c}</div>)}
              {d.awards.map((a) => <div key={a} className="small">🏆 {a}</div>)}
            </div>
            <div className="stack sm">
              <div className="dp-label">Insurance accepted</div>
              <div className="row wrap" style={{ gap: 6 }}>
                {d.acceptsInsurance.map((a) => (
                  <span key={a} className={`chip ${coveredBy.some((p) => p.provider.toLowerCase() === a.toLowerCase()) ? 'ok' : ''}`}>{a}</span>
                ))}
                <span className="chip">Self-pay · {formatMoney(d.fee, user?.country)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- reviews ---------- */}
        <section className="card dp-section">
          <div className="dp-section-head">
            <h2 className="dp-h2">What patients <em>say</em></h2>
            <p className="small muted"><span className="stars">★</span> <b>{d.rating.toFixed(1)}</b> from {d.reviewCount} verified reviews</p>
          </div>
          <div className="dp-reviews">
            {d.reviews.map((r, i) => (
              <figure key={i} className="dp-review">
                <div className="stars">{'★'.repeat(r.rating)}<span style={{ opacity: 0.25 }}>{'★'.repeat(5 - r.rating)}</span></div>
                <blockquote>“{r.text}”</blockquote>
                <figcaption className="tiny muted">{r.author} · {fmtDate(r.date, { month: 'long', year: 'numeric' })}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ---------- clinics ---------- */}
        <section className="dp-clinics" id="dp-clinics">
          {d.clinics.map((c) => (
            <div key={c.name} className="card dp-clinic">
              <div className="dp-map" aria-hidden><i className="dp-pin" /></div>
              <div className="stack sm" style={{ padding: '14px 16px 16px' }}>
                <div className="row between"><h3>{clinicShort(c.name)} clinic</h3><span className="tiny muted">{km(center, c.location)} away</span></div>
                <div className="small muted">{c.name} · {c.address}</div>
                <div className="tiny muted">Open {c.days}</div>
                <a className="small bold" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${c.location.lat},${c.location.lng}`}>Open in Maps →</a>
              </div>
            </div>
          ))}
        </section>

        {/* ---------- CTA ---------- */}
        <section className="dp-cta">
          <h2 className="dp-h2">Let’s talk about <em>your health.</em></h2>
          <div className="dp-cta-row">
            <span>📍 {d.clinics[0].address}</span>
            {d.telehealth && <span>📹 Video consultations available</span>}
          </div>
          <button className="dp-btn light block" onClick={() => go('dp-book')}>Book an appointment</button>
        </section>
        <p className="tiny muted dp-foot">
          In an emergency, call {emergencyNumber(user?.country)} or go to the nearest emergency department.
        </p>
      </div>
    </div>
  );
}
