import { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { MEDICINES } from '../../data/catalog';
import { formatMoney, currencyFor } from '../../data/countries';
import { Empty, Modal, TopBar, fmtDate, toast } from '../../components/ui';
import { useProvider } from './Dashboard';
import type { Medicine, Reservation } from '../../types';

export function PharmacyInventory() {
  const { pharmacy, user } = useProvider();
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<{ m: Medicine; price: string; qty: string } | null>(null);
  const [, force] = useState(0);
  if (!pharmacy) return <><TopBar title="Inventory" /><div className="page"><Empty icon="🏪" title="Listing not found" /></div></>;
  const [cur, mult] = currencyFor(user.country);
  const stockOf = (id: string) => pharmacy.stock.find((s) => s.medicineId === id);
  const list = MEDICINES.filter((m) => !q || `${m.name} ${m.generic} ${m.category}`.toLowerCase().includes(q.toLowerCase()));

  const save = async () => {
    if (!edit) return;
    const price = Number(edit.price) / mult, qty = Math.max(0, Math.round(Number(edit.qty)));
    if (!(price > 0)) { toast('Enter a valid price'); return; }
    await backend.setStock(pharmacy.id, edit.m.id, Math.round(price * 100) / 100, qty);
    const s = stockOf(edit.m.id);
    if (s) { s.price = price; s.qty = qty; } else pharmacy.stock.push({ medicineId: edit.m.id, price, qty });
    setEdit(null); force((x) => x + 1);
    toast('Saved — patients now see the new price & stock');
  };

  return (
    <>
      <TopBar title="Inventory & prices" />
      <div className="page">
        <div className="notice">Prices and stock you set here are shown live to patients searching for medicines near you.</div>
        <div className="search"><input className="input" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="card table-wrap" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Product</th><th>Stock</th><th style={{ textAlign: 'right' }}>Price</th><th /></tr></thead>
            <tbody>
              {list.map((m) => {
                const s = stockOf(m.id);
                return (
                  <tr key={m.id}>
                    <td><div className="bold small">{m.name} {m.strength}</div><div className="tiny muted">{m.generic} · {m.category}{m.rx ? ' · ℞' : ''}</div></td>
                    <td>{!s ? <span className="chip">Not listed</span> : s.qty === 0 ? <span className="chip danger">0</span> : s.qty < 10 ? <span className="chip warn">{s.qty}</span> : <span className="chip ok">{s.qty}</span>}</td>
                    <td className="bold small" style={{ textAlign: 'right' }}>{s ? formatMoney(s.price, user.country) : '—'}</td>
                    <td><button className="btn sm soft" onClick={() => setEdit({ m, price: s ? (s.price * mult).toFixed(2) : '', qty: String(s?.qty ?? 0) })}>{s ? 'Edit' : 'Add'}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit ? `${edit.m.name} ${edit.m.strength}` : ''}>
        {edit && (
          <>
            <div className="field"><label>Price ({cur})</label><input className="input" type="number" min="0" step="0.01" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} /></div>
            <div className="field"><label>Quantity in stock</label><input className="input" type="number" min="0" value={edit.qty} onChange={(e) => setEdit({ ...edit, qty: e.target.value })} /></div>
            <button className="btn block" onClick={save}>Save</button>
          </>
        )}
      </Modal>
    </>
  );
}

export function PharmacyOrders() {
  const { pid, user } = useProvider();
  const [list, setList] = useState<Reservation[]>([]);
  const [tick, setTick] = useState(0);
  useEffect(() => { backend.listReservations({ pharmacyId: pid }).then(setList); }, [pid, tick]);
  const set = async (r: Reservation, status: Reservation['status']) => { await backend.updateReservation(r.id, { status }); setTick(tick + 1); toast(status === 'ready' ? 'Patient notified: ready for pickup' : 'Marked as collected'); };
  return (
    <>
      <TopBar title="Reservations" />
      <div className="page">
        {list.length === 0 ? <Empty icon="🧾" title="No reservations yet">When patients reserve a medicine at your pharmacy in the app, it appears here.</Empty> : list.map((r) => (
          <div key={r.id} className="card row">
            <div className="grow">
              <div className="bold">{r.qty} × {r.medicineName}</div>
              <div className="small muted">{r.patientName} · {fmtDate(r.createdAt)} · {formatMoney(r.total, user.country)}</div>
            </div>
            {r.status === 'reserved' && <button className="btn sm" onClick={() => set(r, 'ready')}>Mark ready</button>}
            {r.status === 'ready' && <button className="btn sm soft" onClick={() => set(r, 'collected')}>Collected</button>}
            {r.status === 'collected' && <span className="chip ok">Collected</span>}
          </div>
        ))}
      </div>
    </>
  );
}
