import { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { mockLabOrders } from '../../services/portal';
import { formatMoney } from '../../data/countries';
import { Empty, TopBar, toast } from '../../components/ui';
import { LAB_STAGES, LabOrderCard, generateResults, stageIndex } from '../../components/LabOrderCard';
import { useProvider } from './Dashboard';
import type { LabOrder } from '../../types';

export function LabOrders() {
  const { pid, lab, user } = useProvider();
  const [real, setReal] = useState<LabOrder[]>([]);
  const [demo, setDemo] = useState<LabOrder[]>(() => mockLabOrders(pid, lab?.name ?? 'Lab'));
  const [stage, setStage] = useState<string>('');
  const [tick, setTick] = useState(0);
  useEffect(() => { backend.listLabOrders({ labId: pid }).then(setReal); }, [pid, tick]);

  const advance = async (o: LabOrder) => {
    const next = LAB_STAGES[Math.min(3, stageIndex(o.status) + 1)].key;
    const patch: Partial<LabOrder> = { status: next, ...(next === 'ready' ? { results: generateResults(o) } : {}) };
    if (real.some((x) => x.id === o.id)) { await backend.updateLabOrder(o.id, patch); setTick(tick + 1); }
    else setDemo(demo.map((x) => (x.id === o.id ? { ...x, ...patch } : x)));
    toast(next === 'ready' ? `Results published to ${o.patientName}` : `Moved to “${LAB_STAGES.find((s) => s.key === next)!.label}”`);
  };

  const all = [...real.map((o) => ({ o, app: true })), ...demo.map((o) => ({ o, app: false }))].filter(({ o }) => !stage || o.status === stage);
  return (
    <>
      <TopBar title="Test orders" />
      <div className="page">
        <div className="chips">
          <button className={`chip ${!stage ? 'on' : ''}`} onClick={() => setStage('')}>All</button>
          {LAB_STAGES.map((s) => <button key={s.key} className={`chip ${stage === s.key ? 'on' : ''}`} onClick={() => setStage(s.key)}>{s.label}</button>)}
        </div>
        {all.length === 0 ? <Empty icon="🧪" title="No orders at this stage" /> : all.map(({ o, app }) => (
          <div key={o.id} className="stack sm">
            <LabOrderCard order={o} country={user.country} showPatient />
            <div className="row between" style={{ paddingLeft: 4 }}>
              <span className="tiny muted">{app ? '📲 Booked in the MediNear app' : 'Walk-in / referral'}</span>
              {o.status !== 'ready' && <button className="btn sm" onClick={() => advance(o)}>→ {LAB_STAGES[stageIndex(o.status) + 1].label}</button>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function LabCatalog() {
  const { lab, user } = useProvider();
  if (!lab) return <><TopBar title="Test catalog" /><div className="page"><Empty icon="📋" title="Listing not found" /></div></>;
  return (
    <>
      <TopBar title="Test catalog" />
      <div className="page">
        <div className="card table-wrap" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Test</th><th>Turnaround</th><th>Fasting</th><th style={{ textAlign: 'right' }}>Price</th></tr></thead>
            <tbody>
              {lab.tests.map((t) => (
                <tr key={t.id}>
                  <td><div className="bold small">{t.name}</div><div className="tiny muted">{t.category}</div></td>
                  <td className="small">{t.turnaroundHrs} h</td>
                  <td>{t.fasting ? <span className="chip warn">Yes</span> : <span className="chip">No</span>}</td>
                  <td className="bold small" style={{ textAlign: 'right' }}>{formatMoney(t.price, user.country)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
