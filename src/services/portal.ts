// Mock operational data for the provider portals (patients, schedules, trends).
// Real bookings / orders made by patients in the app are merged on top of this.

import { LAB_TESTS, MEDICINES, MED_BASE_PRICE, HOSPITAL_DEPTS } from '../data/catalog';
import { namesFor } from '../data/locale';
import { insurersFor } from '../data/countries';

// Country of the signed-in provider, so patient names look local.
let COUNTRY = 'US';
export const setPortalCountry = (c?: string) => { if (c) COUNTRY = c; };
const N = () => namesFor(COUNTRY);
import { mulberry32 } from '../data/generator';
import type { LabOrder, LabOrderStatus } from '../types';
import { generateResults } from '../components/LabOrderCard';

const seedOf = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 17);
type Rng = () => number;
const pick = <T,>(r: Rng, a: T[]) => a[Math.floor(r() * a.length)];
const int = (r: Rng, a: number, b: number) => Math.floor(a + r() * (b - a + 1));

const CONDITIONS = ['Hypertension', 'Type 2 diabetes', 'Asthma', 'High cholesterol', 'Atrial fibrillation', 'Migraine', 'Hypothyroidism', 'Anxiety', 'Back pain', 'Anemia', 'Heart failure', 'Routine check-up', 'Post-op follow-up', 'Arrhythmia'];
const MONTHS = Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - 11 + i); return d.toLocaleDateString('en', { month: 'short' }); });

export interface PortalPatient {
  id: string; name: string; age: number; gender: 'F' | 'M'; condition: string; insurer: string;
  lastVisit: string; nextVisit?: string; risk: 'low' | 'medium' | 'high'; visits: number;
  vitals: { bp: string; hr: number; weight: number; glucose: number };
  bpTrend: number[]; meds: string[]; notes: string;
}

export function mockPatients(providerId: string, n = 36): PortalPatient[] {
  const r = mulberry32(seedOf(providerId));
  return Array.from({ length: n }, (_, i) => {
    const gender: 'F' | 'M' = r() < 0.5 ? 'F' : 'M';
    const last = new Date(Date.now() - int(r, 1, 160) * 864e5);
    const next = r() < 0.55 ? new Date(Date.now() + int(r, 1, 40) * 864e5) : undefined;
    const sys = int(r, 108, 162);
    const risk = sys > 145 ? 'high' : sys > 130 ? 'medium' : 'low';
    return {
      id: `${providerId}-p${i}`,
      name: `${pick(r, gender === 'F' ? N().f : N().m)} ${pick(r, N().l)}`,
      age: int(r, 4, 88), gender, condition: pick(r, CONDITIONS), insurer: r() < 0.12 ? 'Self-pay' : pick(r, insurersFor(COUNTRY).slice(0, 6)),
      lastVisit: last.toISOString(), nextVisit: next?.toISOString(), risk, visits: int(r, 1, 24),
      vitals: { bp: `${sys}/${int(r, 68, 98)}`, hr: int(r, 58, 96), weight: int(r, 48, 112), glucose: int(r, 78, 180) },
      bpTrend: Array.from({ length: 6 }, () => sys + int(r, -14, 10)),
      meds: Array.from({ length: int(r, 0, 3) }, () => { const m = pick(r, MEDICINES); return `${m.name} ${m.strength}`; }),
      notes: pick(r, ['Stable, continue current plan.', 'Review lab results at next visit.', 'Adjusted dosage, monitor BP weekly.', 'Referred for imaging.', 'Lifestyle counselling given.', 'Patient reports improvement.']),
    };
  });
}

export function mockDaySchedule(providerId: string, day: Date) {
  const r = mulberry32(seedOf(providerId) + day.getFullYear() * 400 + day.getMonth() * 32 + day.getDate());
  if (day.getDay() === 0) return [];
  const patients = mockPatients(providerId);
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  return times.filter(() => r() < 0.5).map((t) => {
    const p = pick(r, patients);
    const [h, m] = t.split(':').map(Number);
    const d = new Date(day); d.setHours(h, m, 0, 0);
    return { id: `${p.id}-${t}`, time: d.toISOString(), patient: p.name, patientId: p.id, reason: p.condition, type: r() < 0.25 ? 'Video' : 'In clinic', isNew: r() < 0.2 };
  });
}

export function monthlySeries(providerId: string, base: number, growth = 0.035, noise = 0.32) {
  const r = mulberry32(seedOf(providerId + base));
  return MONTHS.map((label, i) => ({ label, value: Math.round(base * (1 + growth * i) * (1 - noise / 2 + r() * noise)) }));
}

export function conditionMix(providerId: string) {
  const ps = mockPatients(providerId);
  const counts: Record<string, number> = {};
  ps.forEach((p) => { counts[p.condition] = (counts[p.condition] ?? 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
}

export function topSellers(providerId: string) {
  const r = mulberry32(seedOf(providerId) + 99);
  return MEDICINES.map((m, i) => ({ m, units: int(r, 10, 420), revenue: 0, price: MED_BASE_PRICE[i] }))
    .map((x) => ({ ...x, revenue: x.units * x.price }))
    .sort((a, b) => b.revenue - a.revenue).slice(0, 8);
}

export interface Admission {
  id: string; patient: string; age: number; ward: string; bed: string; admitted: string; doctor: string;
  status: 'Stable' | 'Critical' | 'Observation' | 'Discharge today'; diagnosis: string;
}
export function mockAdmissions(providerId: string, depts: string[]): Admission[] {
  const r = mulberry32(seedOf(providerId) + 5);
  const statuses: Admission['status'][] = ['Stable', 'Stable', 'Stable', 'Observation', 'Critical', 'Discharge today'];
  return Array.from({ length: 28 }, (_, i) => {
    const ward = pick(r, depts.length ? depts : HOSPITAL_DEPTS);
    return {
      id: `adm-${i}`, patient: `${pick(r, [...N().f, ...N().m])} ${pick(r, N().l)}`, age: int(r, 1, 92), ward,
      bed: `${ward.slice(0, 2).toUpperCase()}-${int(r, 101, 340)}`, admitted: new Date(Date.now() - int(r, 0, 12) * 864e5 - int(r, 0, 23) * 36e5).toISOString(),
      doctor: `Dr. ${pick(r, N().l)}`, status: pick(r, statuses), diagnosis: pick(r, CONDITIONS),
    };
  });
}

/** Demo lab orders for a lab or a doctor's patients, at mixed pipeline stages. */
export function mockLabOrders(providerId: string, labName: string, n = 14): LabOrder[] {
  const r = mulberry32(seedOf(providerId) + 7);
  const stages: LabOrderStatus[] = ['ordered', 'collected', 'processing', 'ready', 'ready'];
  return Array.from({ length: n }, (_, i) => {
    const tests = Array.from({ length: int(r, 1, 3) }, () => pick(r, LAB_TESTS)).filter((t, j, a) => a.indexOf(t) === j);
    const status = pick(r, stages);
    const o: LabOrder = {
      id: `${providerId}-lo${i}`, patientId: `mock-${i}`, patientName: `${pick(r, [...N().f, ...N().m])} ${pick(r, N().l)}`,
      labId: providerId, labName, tests: tests.map((t) => t.name), status,
      createdAt: new Date(Date.now() - int(r, 0, 6) * 864e5).toISOString(),
      scheduledFor: new Date(Date.now() - int(r, -2, 5) * 864e5).toISOString(),
      homeCollection: r() < 0.3, total: tests.length * int(r, 12, 40),
    };
    if (status === 'ready') o.results = generateResults(o);
    return o;
  });
}
