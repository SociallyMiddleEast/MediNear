import type { InsurancePlan } from '../types';
import { INSURANCE_TYPES, countryName, insurersFor } from '../data/countries';

export interface PlanDraft extends InsurancePlan { other?: string }

export const emptyPlan = (i: number): PlanDraft => ({ provider: '', memberId: '', type: i === 0 ? 'Primary' : 'Secondary / top-up' });

/** Returns an error message, or '' when every plan is complete. */
export function validatePlans(plans: PlanDraft[]): string {
  for (const [i, p] of plans.entries()) {
    const n = plans.length > 1 ? ` (plan ${i + 1})` : '';
    if (!p.provider) return `Select your insurer${n}.`;
    if (p.provider === 'Other' && !p.other?.trim()) return `Enter the insurer’s name${n}.`;
    if (p.memberId.trim().length < 3) return `Enter the member / policy number${n}.`;
  }
  return '';
}

export const finalizePlans = (plans: PlanDraft[]): InsurancePlan[] =>
  plans.map(({ other, ...p }) => ({
    ...p,
    provider: p.provider === 'Other' ? (other ?? '').trim() : p.provider,
    memberId: p.memberId.trim(),
    policyHolder: p.policyHolder?.trim() || undefined,
    validUntil: p.validUntil || undefined,
  }));

export function InsuranceFields({ plans, onChange, country }: { plans: PlanDraft[]; onChange: (p: PlanDraft[]) => void; country: string }) {
  const options = insurersFor(country);
  const set = (i: number, patch: Partial<PlanDraft>) => onChange(plans.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  return (
    <div className="stack">
      {plans.map((p, i) => {
        const known = !p.provider || options.includes(p.provider);
        return (
          <div key={i} className="stack sm" style={{ paddingBottom: 12, borderBottom: i < plans.length - 1 ? '1px solid var(--border)' : 0 }}>
            <div className="row between">
              <span className="chip primary">Plan {i + 1}</span>
              {plans.length > 1 && (
                <button type="button" className="icon-btn" aria-label={`Remove plan ${i + 1}`} onClick={() => onChange(plans.filter((_, j) => j !== i))}>🗑️</button>
              )}
            </div>
            <label className="field">
              <span className="small bold muted">Insurer</span>
              <select className="select input" value={known ? p.provider : 'Other'} onChange={(e) => set(i, { provider: e.target.value })}>
                <option value="">Select…</option>
                <optgroup label={`In ${countryName(country)}`}>
                  {options.slice(0, options.length - 13).map((o) => <option key={o}>{o}</option>)}
                </optgroup>
                <optgroup label="International">
                  {options.slice(options.length - 13, -1).map((o) => <option key={o}>{o}</option>)}
                </optgroup>
                <option value="Other">Other (type it)</option>
              </select>
            </label>
            {(p.provider === 'Other' || !known) && (
              <input className="input" placeholder="Insurer name" value={known ? p.other ?? '' : p.provider} onChange={(e) => set(i, { provider: 'Other', other: e.target.value })} />
            )}
            <div className="row" style={{ gap: 8 }}>
              <label className="field grow">
                <span className="small bold muted">Member / policy number</span>
                <input className="input" value={p.memberId} onChange={(e) => set(i, { memberId: e.target.value })} />
              </label>
              <label className="field" style={{ flex: '0 0 42%' }}>
                <span className="small bold muted">Type</span>
                <select className="select input" value={p.type} onChange={(e) => set(i, { type: e.target.value })}>
                  {INSURANCE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <label className="field grow">
                <span className="small bold muted">Policy holder (optional)</span>
                <input className="input" placeholder="Me, parent, spouse, employer…" value={p.policyHolder ?? ''} onChange={(e) => set(i, { policyHolder: e.target.value })} />
              </label>
              <label className="field" style={{ flex: '0 0 42%' }}>
                <span className="small bold muted">Valid until</span>
                <input className="input" type="date" value={p.validUntil ?? ''} onChange={(e) => set(i, { validUntil: e.target.value })} />
              </label>
            </div>
          </div>
        );
      })}
      <button type="button" className="btn soft sm" onClick={() => onChange([...plans, emptyPlan(plans.length)])}>+ Add another insurance</button>
    </div>
  );
}
