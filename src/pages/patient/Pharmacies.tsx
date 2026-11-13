import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDirectory } from '../../services/directory';
import { backend } from '../../services/backend';
import { MEDICINES } from '../../data/catalog';
import { distanceKm } from '../../data/generator';
import { formatMoney } from '../../data/countries';
import { Empty, MiniMap, Modal, Stars, TopBar, km, toast } from '../../components/ui';
import type { Medicine, Pharmacy, StockItem } from '../../types';

const medById = Object.fromEntries(MEDICINES.map((m) => [m.id, m]));

export default function Pharmacies() {
  const { user } = useAuth();
  const { dir, center } = useDirectory(user);
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<'medicine' | 'list'>(params.get('med') ? 'medicine' : 'medicine');
  const [q, setQ] = useState('');
  const medId = params.get('med') ?? '';
  const med = medById[medId] as Medicine | undefined;
  const [sort, setSort] = useState<'price' | 'distance'>('price');
  const [reserve, setReserve] = useState<{ p: Pharmacy; s: StockItem } | null>(null);

  const meds = useMemo(() => {
    const s = q.trim().toLowerCase();
    return MEDICINES.filter((m) => !s || `${m.name} ${m.generic} ${m.category}`.toLowerCase().includes(s));
  }, [q]);

  const offers = useMemo(() => {
    if (!med) return [];
    return dir.pharmacies
      .map((p) => ({ p, s: p.stock.find((x) => x.medicineId === med.id), dist: distanceKm(center, p.location) }))
      .filter((o): o is { p: Pharmacy; s: StockItem; dist: number } => !!o.s)
      .sort((a, b) => (a.s.qty === 0 ? 1 : 0) - (b.s.qty === 0 ? 1 : 0) || (sort === 'price' ? a.s.price - b.s.price : a.dist - b.dist));
  }, [med, dir, center, sort]);
  const inStock = offers.filter((o) => o.s.qty > 0);
  const cheapest = inStock.length ? Math.min(...inStock.map((o) => o.s.price)) : 0;
  const priciest = inStock.length ? Math.max(...inStock.map((o) => o.s.price)) : 0;

  const pickMed = (id: string) => { setParams(id ? { med: id } : {}, { replace: false }); window.scrollTo(0, 0); };

  return (
    <>
      <TopBar title={med ? med.name : 'Pharmacies'} back={!!med} />
      <div className="page">
        {!med && (
          <div className="row" style={{ gap: 8 }}>
            <button className={`chip grow ${tab === 'medicine' ? 'on' : ''}`} onClick={() => setTab('medicine')}>💊 Find a medicine</button>
            <button className={`chip grow ${tab === 'list' ? 'on' : ''}`} onClick={() => setTab('list')}>🏪 All pharmacies</button>
          </div>
        )}

        {med ? (
          <>
            <div className="card stack sm">
              <div className="row top">
                <div className="tile-ico">💊</div>
                <div className="grow">
                  <h2>{med.name} <span className="muted" style={{ fontWeight: 500, fontSize: 15 }}>{med.strength}</span></h2>
                  <div className="small muted">{med.generic} · {med.form} · {med.category}</div>
                </div>
                {med.rx ? <span className="chip warn">℞ Prescription</span> : <span className="chip ok">Over the counter</span>}
              </div>
              {inStock.length > 0 && (
                <div className="row wrap small" style={{ gap: 16 }}>
                  <span>In stock at <b>{inStock.length}</b> of {dir.pharmacies.length} pharmacies</span>
                  <span>Price range <b>{formatMoney(cheapest, user?.country)} – {formatMoney(priciest, user?.country)}</b></span>
                </div>
              )}
            </div>
            <div className="row between">
              <div className="row" style={{ gap: 8 }}>
                <button className={`chip ${sort === 'price' ? 'on' : ''}`} onClick={() => setSort('price')}>Cheapest</button>
                <button className={`chip ${sort === 'distance' ? 'on' : ''}`} onClick={() => setSort('distance')}>Nearest</button>
              </div>
            </div>
            <MiniMap center={center} pins={inStock.map((o) => ({ at: o.p.location, icon: o.s.price === cheapest ? '💚' : '💊', label: `${o.p.name} – ${formatMoney(o.s.price, user?.country)}` }))} height={200} />
            {offers.length === 0 ? <Empty icon="😕" title="Not available nearby">No pharmacy near you lists this medicine.</Empty> : (
              <div className="stack">
                {offers.map(({ p, s, dist }) => (
                  <div key={p.id} className="card row" style={{ opacity: s.qty === 0 ? 0.55 : 1 }}>
                    <Link to={`/app/pharmacies/${p.id}`} className="grow" style={{ color: 'inherit' }}>
                      <div className="bold">{p.name}</div>
                      <div className="tiny muted">{dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`} · {p.hours}{p.delivery ? ' · Delivery' : ''}</div>
                      <div className="tiny" style={{ color: s.qty === 0 ? 'var(--danger)' : s.qty < 10 ? 'var(--warn)' : 'var(--ok)' }}>
                        {s.qty === 0 ? 'Out of stock' : s.qty < 10 ? `Only ${s.qty} left` : 'In stock'}
                      </div>
                    </Link>
                    <div className="stack sm" style={{ alignItems: 'flex-end' }}>
                      <div className="bold" style={{ fontSize: 17 }}>{formatMoney(s.price, user?.country)}</div>
                      {s.price === cheapest && s.qty > 0 && <span className="chip ok">Best price</span>}
                      <button className="btn sm" disabled={s.qty === 0} onClick={() => setReserve({ p, s })}>Reserve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : tab === 'medicine' ? (
          <>
            <div className="search"><input className="input" autoFocus placeholder="Search medicine, e.g. Panadol, insulin, antibiotics…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <div className="grid">
              {meds.map((m) => {
                const prices = dir.pharmacies.flatMap((p) => p.stock.filter((s) => s.medicineId === m.id && s.qty > 0).map((s) => s.price));
                return (
                  <button key={m.id} className="card link row" style={{ textAlign: 'left' }} onClick={() => pickMed(m.id)}>
                    <div className="grow">
                      <div className="bold">{m.name} <span className="small muted">{m.strength}</span></div>
                      <div className="tiny muted">{m.generic} · {m.form}</div>
                      <div className="tiny">{prices.length ? `${prices.length} pharmacies` : 'Unavailable'}{m.rx ? ' · ℞' : ''}</div>
                    </div>
                    {prices.length > 0 && <div style={{ textAlign: 'right' }}><div className="tiny muted">from</div><div className="bold">{formatMoney(Math.min(...prices), user?.country)}</div></div>}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <MiniMap center={center} pins={dir.pharmacies.map((p) => ({ at: p.location, icon: '💊', label: p.name }))} />
            <div className="grid">
              {[...dir.pharmacies].sort((a, b) => distanceKm(center, a.location) - distanceKm(center, b.location)).map((p) => (
                <Link key={p.id} to={`/app/pharmacies/${p.id}`} className="card link stack sm">
                  <div className="row between"><div className="bold">{p.name}</div><Stars value={p.rating} /></div>
                  <div className="tiny muted">{p.address}</div>
                  <div className="row wrap" style={{ gap: 6 }}>
                    <span className="chip">📍 {km(center, p.location)}</span>
                    <span className={`chip ${p.open24h ? 'ok' : ''}`}>{p.hours}</span>
                    {p.delivery && <span className="chip info">🛵 Delivery</span>}
                    <span className="chip">{p.stock.filter((s) => s.qty > 0).length} products</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <ReserveModal target={reserve} onClose={() => setReserve(null)} />
    </>
  );
}

function ReserveModal({ target, onClose }: { target: { p: Pharmacy; s: StockItem } | null; onClose: () => void }) {
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  if (!target) return null;
  const m = medById[target.s.medicineId];
  const submit = async () => {
    await backend.createReservation({
      patientId: user!.id, patientName: user!.fullName, pharmacyId: target.p.id, pharmacyName: target.p.name,
      medicineId: m.id, medicineName: `${m.name} ${m.strength}`, qty, total: Math.round(target.s.price * qty * 100) / 100, status: 'reserved',
    });
    toast(`Reserved ${qty} × ${m.name} at ${target.p.name}`);
    setQty(1); onClose();
  };
  return (
    <Modal open onClose={onClose} title="Reserve for pickup">
      <div className="card flat stack sm">
        <div className="bold">{m.name} {m.strength}</div>
        <div className="small muted">{target.p.name} · {target.p.address}</div>
      </div>
      {m.rx && <div className="notice">℞ Prescription required — bring it when you collect, or your doctor can send it electronically.</div>}
      <div className="row between">
        <span>Quantity</span>
        <div className="row" style={{ gap: 8 }}>
          <button className="icon-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <b style={{ minWidth: 24, textAlign: 'center' }}>{qty}</b>
          <button className="icon-btn" onClick={() => setQty(Math.min(target.s.qty, qty + 1))}>+</button>
        </div>
      </div>
      <div className="row between"><span className="muted">Total (pay at pickup)</span><b>{formatMoney(target.s.price * qty, user?.country)}</b></div>
      <button className="btn block" onClick={submit}>Reserve</button>
    </Modal>
  );
}

export function PharmacyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { dir, center } = useDirectory(user);
  const [q, setQ] = useState('');
  const [reserve, setReserve] = useState<{ p: Pharmacy; s: StockItem } | null>(null);
  const p = dir.pharmacies.find((x) => x.id === id);
  if (!p) return <><TopBar back title="Pharmacy" /><div className="page"><Empty icon="🤷" title="Pharmacy not found" /></div></>;
  const items = p.stock.map((s) => ({ s, m: medById[s.medicineId] as Medicine }))
    .filter(({ m }) => !q || `${m.name} ${m.generic} ${m.category}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.m.category.localeCompare(b.m.category) || a.m.name.localeCompare(b.m.name));
  return (
    <>
      <TopBar back title={p.name} />
      <div className="page">
        <div className="card stack">
          <div className="row top">
            <div className="tile-ico">💊</div>
            <div className="grow"><h2>{p.name}</h2><div className="small muted">{p.address}</div><Stars value={p.rating} /></div>
          </div>
          <div className="row wrap" style={{ gap: 6 }}>
            <span className="chip">📍 {km(center, p.location)}</span>
            <span className={`chip ${p.open24h ? 'ok' : ''}`}>🕒 {p.hours}</span>
            {p.delivery && <span className="chip info">🛵 Home delivery</span>}
            <span className="chip">📞 {p.phone}</span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <a className="btn grow" href={`tel:${p.phone.replace(/\s/g, '')}`}>Call</a>
            <a className="btn ghost grow" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${p.location.lat},${p.location.lng}`}>Directions</a>
          </div>
        </div>
        <div className="section-title"><h2>Medicines & prices</h2><span className="small muted">{p.stock.filter((s) => s.qty > 0).length} in stock</span></div>
        <div className="search"><input className="input" placeholder="Search this pharmacy…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="card table-wrap" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Medicine</th><th>Category</th><th>Stock</th><th style={{ textAlign: 'right' }}>Price</th><th /></tr></thead>
            <tbody>
              {items.map(({ s, m }) => (
                <tr key={m.id}>
                  <td><div className="bold">{m.name} {m.rx && <span className="chip warn" style={{ padding: '0 6px' }}>℞</span>}</div><div className="tiny muted">{m.generic} · {m.strength} {m.form}</div></td>
                  <td className="small muted">{m.category}</td>
                  <td>{s.qty === 0 ? <span className="chip danger">Out</span> : s.qty < 10 ? <span className="chip warn">Low</span> : <span className="chip ok">Yes</span>}</td>
                  <td className="bold" style={{ textAlign: 'right' }}>{formatMoney(s.price, user?.country)}</td>
                  <td><button className="btn sm soft" disabled={s.qty === 0} onClick={() => setReserve({ p, s })}>Reserve</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ReserveModal target={reserve} onClose={() => setReserve(null)} />
    </>
  );
}
