// ---------------------------------------------------------------------------
// Backend abstraction.
//
// Every screen talks to `backend` only — never to localStorage directly. Today
// it is a LOCAL DEMO backend (data lives in this browser only). To go live,
// implement the same interface with Supabase (see supabase/schema.sql and
// README) and swap the export at the bottom of this file. No UI changes needed,
// and the same code then runs inside the iOS / Android apps via Capacitor.
// ---------------------------------------------------------------------------

import type { Appointment, LabOrder, Reservation, User } from '../types';

export interface SignUpInput extends Omit<User, 'id' | 'createdAt'> {
  password: string;
}

export interface Backend {
  signUp(input: SignUpInput): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  currentUser(): Promise<User | null>;
  updateUser(id: string, patch: Partial<User>): Promise<User>;
  listUsers(role?: User['role']): Promise<User[]>;

  listAppointments(filter: { patientId?: string; doctorId?: string }): Promise<Appointment[]>;
  createAppointment(a: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment>;
  updateAppointment(id: string, patch: Partial<Appointment>): Promise<void>;

  listLabOrders(filter: { patientId?: string; labId?: string }): Promise<LabOrder[]>;
  createLabOrder(o: Omit<LabOrder, 'id' | 'createdAt'>): Promise<LabOrder>;
  updateLabOrder(id: string, patch: Partial<LabOrder>): Promise<void>;

  listReservations(filter: { patientId?: string; pharmacyId?: string }): Promise<Reservation[]>;
  createReservation(r: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation>;
  updateReservation(id: string, patch: Partial<Reservation>): Promise<void>;

  // Pharmacy owners can change price / quantity of their stock.
  getStockOverrides(): Promise<StockOverrides>;
  setStock(pharmacyId: string, medicineId: string, price: number, qty: number): Promise<void>;
}

export type StockOverrides = Record<string, Record<string, { price: number; qty: number }>>;

// ---------------------------- local demo backend ----------------------------

const KEY = 'medinear:v1:';
const read = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(KEY + k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (k: string, v: unknown) => { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch { /* storage full/blocked */ } };
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

async function hash(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  if (crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return btoa(`${salt}:${password}`); // non-secure context fallback (demo only)
}

interface StoredUser extends User { salt: string; passwordHash: string; }

const delay = <T,>(v: T) => new Promise<T>((res) => setTimeout(() => res(v), 120));
const strip = ({ salt: _s, passwordHash: _p, ...u }: StoredUser): User => {
  // Migrate accounts created before multiple insurance plans were supported.
  if (!u.insurances && u.insuranceProvider && u.insuranceProvider !== 'Uninsured / self-pay')
    u.insurances = [{ provider: u.insuranceProvider, memberId: u.insuranceId ?? '', type: 'Primary' }];
  delete u.insuranceProvider; delete u.insuranceId;
  return u;
};

function listOf<T extends { id: string }>(name: string) {
  return {
    all: () => read<T[]>(name, []),
    add: (item: T) => { const all = read<T[]>(name, []); all.unshift(item); write(name, all); return item; },
    patch: (id: string, p: Partial<T>) => write(name, read<T[]>(name, []).map((x) => (x.id === id ? { ...x, ...p } : x))),
  };
}
const appts = listOf<Appointment>('appointments');
const labOrders = listOf<LabOrder>('labOrders');
const reservations = listOf<Reservation>('reservations');

const localBackend: Backend = {
  async signUp(input) {
    const users = read<StoredUser[]>('users', []);
    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.email === email)) throw new Error('An account with this email already exists.');
    const salt = uid();
    const { password, ...rest } = input;
    const user: StoredUser = { ...rest, email, id: uid(), createdAt: new Date().toISOString(), salt, passwordHash: await hash(password, salt) };
    if (user.role !== 'patient' && !user.providerId) user.providerId = `${user.role}-${user.id.slice(0, 8)}`;
    users.push(user);
    write('users', users);
    write('session', user.id);
    return delay(strip(user));
  },
  async signIn(email, password) {
    const u = read<StoredUser[]>('users', []).find((x) => x.email === email.trim().toLowerCase());
    if (!u || (await hash(password, u.salt)) !== u.passwordHash) throw new Error('Incorrect email or password.');
    write('session', u.id);
    return delay(strip(u));
  },
  async signOut() { write('session', null); },
  async currentUser() {
    const id = read<string | null>('session', null);
    const u = read<StoredUser[]>('users', []).find((x) => x.id === id);
    return u ? strip(u) : null;
  },
  async updateUser(id, patch) {
    const users = read<StoredUser[]>('users', []);
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) throw new Error('User not found');
    users[i] = { ...users[i], ...patch, id, role: users[i].role };
    if (patch.insurances) { delete users[i].insuranceProvider; delete users[i].insuranceId; }
    write('users', users);
    return delay(strip(users[i]));
  },
  async listUsers(role) { return read<StoredUser[]>('users', []).filter((u) => !role || u.role === role).map(strip); },

  async listAppointments(f) {
    return appts.all().filter((a) => (!f.patientId || a.patientId === f.patientId) && (!f.doctorId || a.doctorId === f.doctorId));
  },
  async createAppointment(a) { return delay(appts.add({ ...a, id: uid(), createdAt: new Date().toISOString() })); },
  async updateAppointment(id, p) { appts.patch(id, p); },

  async listLabOrders(f) {
    return labOrders.all().filter((o) => (!f.patientId || o.patientId === f.patientId) && (!f.labId || o.labId === f.labId));
  },
  async createLabOrder(o) { return delay(labOrders.add({ ...o, id: uid(), createdAt: new Date().toISOString() })); },
  async updateLabOrder(id, p) { labOrders.patch(id, p); },

  async listReservations(f) {
    return reservations.all().filter((r) => (!f.patientId || r.patientId === f.patientId) && (!f.pharmacyId || r.pharmacyId === f.pharmacyId));
  },
  async createReservation(r) { return delay(reservations.add({ ...r, id: uid(), createdAt: new Date().toISOString() })); },
  async updateReservation(id, p) { reservations.patch(id, p); },

  async getStockOverrides() { return read<StockOverrides>('stock', {}); },
  async setStock(pharmacyId, medicineId, price, qty) {
    const all = read<StockOverrides>('stock', {});
    all[pharmacyId] = { ...(all[pharmacyId] ?? {}), [medicineId]: { price, qty } };
    write('stock', all);
  },
};

// Seed demo accounts once so every portal can be tried with one click.
export const DEMO_PASSWORD = 'demo1234';
export const DEMO_ACCOUNTS: { role: User['role']; email: string; label: string }[] = [
  { role: 'patient', email: 'patient@demo.medinear', label: 'Patient' },
  { role: 'doctor', email: 'doctor@demo.medinear', label: 'Doctor' },
  { role: 'pharmacy', email: 'pharmacy@demo.medinear', label: 'Pharmacy' },
  { role: 'hospital', email: 'hospital@demo.medinear', label: 'Hospital' },
  { role: 'lab', email: 'lab@demo.medinear', label: 'Lab' },
];

export async function ensureDemoAccounts(country: string) {
  if (read<boolean>('demoSeeded', false)) return;
  const base = { country, createdAt: new Date().toISOString(), locationSource: 'timezone' as const };
  const profiles: Record<User['role'], Partial<User>> = {
    patient: { fullName: 'Alex Morgan', dateOfBirth: '1991-04-18', gender: 'Prefer not to say', bloodType: 'O+', insurances: [{ provider: 'AXA Global Healthcare', memberId: 'AXA-5583-2201', type: 'Primary' }, { provider: 'Bupa Global', memberId: 'BG-771-0934', type: 'Secondary / top-up', policyHolder: 'Employer: Northwind Ltd' }], documents: [{ type: 'Passport', number: 'P00000000' }] },
    doctor: { fullName: 'Dr. Layla Haddad', providerId: 'doc-demo', licenseNumber: 'MD-20431', organisation: 'Haddad Heart & Vascular Clinic' },
    pharmacy: { fullName: 'Sami Nader', providerId: 'pha-demo', licenseNumber: 'PH-7781', organisation: 'MediNear Partner Pharmacy' },
    hospital: { fullName: 'Hospital Admin', providerId: 'hos-demo', licenseNumber: 'HOS-1102', organisation: 'Cedars University Medical Center' },
    lab: { fullName: 'Lab Manager', providerId: 'lab-demo', licenseNumber: 'LAB-3390', organisation: 'Precision Diagnostics Lab' },
  };
  const users = read<StoredUser[]>('users', []);
  for (const d of DEMO_ACCOUNTS) {
    if (users.some((u) => u.email === d.email)) continue;
    const salt = uid();
    users.push({ ...base, ...profiles[d.role], id: `demo-${d.role}`, role: d.role, email: d.email, salt, passwordHash: await hash(DEMO_PASSWORD, salt) } as StoredUser);
  }
  write('users', users);
  write('demoSeeded', true);
}

export function resetDemoData() {
  Object.keys(localStorage).filter((k) => k.startsWith(KEY)).forEach((k) => localStorage.removeItem(k));
}

export const backend: Backend = localBackend;
