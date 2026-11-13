// Deterministic mock directory. Given a location it generates realistic-looking
// doctors, pharmacies, hospitals and labs *around that point*, so the app feels
// local wherever it is opened. Same location => same data on every reload.
//
// When a real backend (Supabase) is connected, src/services/directory.ts will
// query the database instead and this file is only used for demos/tests.

import type { Doctor, GeoPoint, Hospital, Lab, Pharmacy } from '../types';
import {
  AWARDS, CERTS, FIRST_F, FIRST_M, HOSPITAL_DEPTS, LAB_BASE_PRICE, LAB_TESTS, LANGS, LAST, MED_BASE_PRICE,
  MED_SCHOOLS, MEDICINES, RESIDENCY_SITES, REVIEW_TEXTS, SPECIALTIES, STREETS, SUBSPECIALTIES,
} from './catalog';

export function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const pick = <T,>(r: Rng, arr: T[]) => arr[Math.floor(r() * arr.length)];
const pickN = <T,>(r: Rng, arr: T[], n: number) => {
  const copy = [...arr]; const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(r() * copy.length), 1)[0]);
  return out;
};
const int = (r: Rng, min: number, max: number) => Math.floor(min + r() * (max - min + 1));
const round1 = (n: number) => Math.round(n * 10) / 10;

export function offset(p: GeoPoint, km: number, bearingDeg: number): GeoPoint {
  const b = (bearingDeg * Math.PI) / 180;
  return {
    lat: p.lat + (km / 111) * Math.cos(b),
    lng: p.lng + (km / (111 * Math.cos((p.lat * Math.PI) / 180))) * Math.sin(b),
  };
}
const near = (r: Rng, p: GeoPoint, maxKm = 8) => offset(p, 0.3 + r() * maxKm, r() * 360);

export function distanceKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const address = (r: Rng, city: string) => `${int(r, 1, 240)} ${pick(r, STREETS)}, ${city}`;
const THIS_YEAR = new Date().getFullYear();

export function makeDoctor(r: Rng, id: string, specialty: string, center: GeoPoint, city: string, insurers: string[], fixed?: Partial<Doctor>): Doctor {
  // Fixed values (demo / registered doctors) must also drive the generated text.
  const gR: 'F' | 'M' = r() < 0.5 ? 'F' : 'M';
  const gender = fixed?.gender ?? gR;
  const fR = pick(r, gender === 'F' ? FIRST_F : FIRST_M);
  const lR = pick(r, LAST);
  const parts = fixed?.name?.replace(/^Dr\.?\s+/i, '').trim().split(/\s+/) ?? [];
  const first = parts[0] ?? fR;
  const last = parts.length > 1 ? parts[parts.length - 1] : lR;
  const yR = int(r, 4, 32);
  const years = fixed?.yearsExperience ?? yR;
  const since = THIS_YEAR - years;
  const [school, schoolCity] = pick(r, MED_SCHOOLS);
  const [res, resCity] = pick(r, RESIDENCY_SITES);
  const [fel, felCity] = pick(r, RESIDENCY_SITES);
  const mdStart = since - 10;
  const education = [
    { degree: 'BSc, Biology', school, city: schoolCity, from: mdStart - 3, to: mdStart },
    { degree: 'Doctor of Medicine (MD)', school, city: schoolCity, from: mdStart, to: mdStart + 4 },
    { degree: `Residency, ${specialty === 'General Practice' ? 'Family Medicine' : 'Internal Medicine'}`, school: res, city: resCity, from: mdStart + 4, to: mdStart + 7 },
  ];
  if (specialty !== 'General Practice' && r() < 0.85)
    education.push({ degree: `Fellowship, ${specialty}`, school: fel, city: felCity, from: mdStart + 7, to: since });
  const subs = pickN(r, SUBSPECIALTIES[specialty] ?? [], int(r, 2, 3));
  const loc = near(r, center);
  const clinics = [
    { name: `${last} ${specialty} Clinic`, address: address(r, city), location: loc, days: 'Mon · Wed · Fri' },
    ...(r() < 0.6 ? [{ name: `${pick(r, ['City', 'Central', 'Mercy', 'Hope', 'St. Mary', 'Cedars'])} Medical Center`, address: address(r, city), location: near(r, center), days: 'Tue · Thu' }] : []),
  ];
  const rating = round1(3.8 + r() * 1.2);
  const reviews = pickN(r, REVIEW_TEXTS, 3).map((text) => ({
    author: `${pick(r, [...FIRST_F, ...FIRST_M])} ${pick(r, LAST)[0]}.`,
    rating: Math.min(5, Math.max(3, Math.round(rating + (r() - 0.5)))),
    date: new Date(Date.now() - int(r, 3, 300) * 864e5).toISOString(),
    text,
  }));
  const next = new Date(); next.setDate(next.getDate() + int(r, 0, 6));
  const doc: Doctor = {
    id, gender, specialty,
    name: `Dr. ${first} ${last}`,
    title: years > 20 ? `Senior Consultant, ${specialty}` : years > 10 ? `Consultant, ${specialty}` : `Specialist, ${specialty}`,
    subSpecialties: subs,
    photoHue: int(r, 0, 360),
    yearsExperience: years,
    practisingSince: since,
    education,
    certifications: pickN(r, CERTS, int(r, 2, 4)),
    awards: pickN(r, AWARDS, int(r, 0, 3)).map((a) => `${a} (${int(r, since, THIS_YEAR)})`),
    publications: int(r, 0, 60),
    languages: ['English', ...pickN(r, LANGS.slice(1), int(r, 1, 2))],
    clinics,
    location: loc,
    rating,
    reviewCount: int(r, 12, 480),
    reviews,
    fee: int(r, 30, 120),
    acceptsInsurance: pickN(r, insurers, int(r, 2, Math.min(5, insurers.length))),
    bio: `Dr. ${first} ${last} has spent ${years} years in ${specialty.toLowerCase()}, with a focus on ${subs.join(' and ').toLowerCase()}. After graduating from ${school}, Dr. ${last} trained at ${res} and has since treated over ${(int(r, 3, 40) * 1000).toLocaleString()} patients.`,
    philosophy: pick(r, [
      'Medicine works best as a partnership — I explain the why behind every decision.',
      'Prevention first. The best treatment is the one you never need.',
      'Every patient deserves time, honesty and a clear plan.',
      'I combine evidence-based medicine with a genuinely human approach.',
    ]),
    nextAvailable: next.toISOString(),
    telehealth: r() < 0.55,
    patientsTreated: int(r, 3, 40) * 1000,
  };
  return { ...doc, ...fixed };
}

const PHARMACY_NAMES = ['Cedar', 'Green Cross', 'Al Shifa', 'Wellness', 'Family', 'Central', 'Mazen', 'Life', 'Sunrise', 'Corner', 'Bloom', 'Medicare', 'Unity', 'Health Plus', 'Hikma Care', 'Riverside'];
export function makePharmacy(r: Rng, id: string, center: GeoPoint, city: string, fixedName?: string): Pharmacy {
  const factor = 0.85 + r() * 0.35; // each pharmacy is a bit cheaper/dearer
  const stock = MEDICINES.filter(() => r() < 0.72).map((m) => {
    const i = Number(m.id.split('-')[1]) - 1;
    return { medicineId: m.id, price: round1(MED_BASE_PRICE[i] * factor * (0.9 + r() * 0.2)), qty: r() < 0.12 ? 0 : int(r, 2, 120) };
  });
  const open24h = r() < 0.25;
  return {
    id, stock, open24h,
    name: fixedName ?? `${pick(r, PHARMACY_NAMES)} Pharmacy`,
    address: address(r, city),
    location: fixedName ? offset(center, 0.6, 40) : near(r, center, 6),
    hours: open24h ? 'Open 24 hours' : `${int(r, 7, 9)}:00 – ${int(r, 20, 23)}:00`,
    phone: `+${int(r, 1, 99)} ${int(r, 100, 999)} ${int(r, 1000, 9999)}`,
    rating: round1(3.7 + r() * 1.3),
    delivery: r() < 0.6,
  };
}

const HOSPITAL_PREFIX = ['St. George', 'Cedars', 'Mount Hope', 'Royal', 'Clemenceau', 'University', 'Mercy', 'Riverside', 'Saint Joseph', 'Rafik'];
export function makeHospital(r: Rng, id: string, center: GeoPoint, city: string, fixedName?: string): Hospital {
  const beds = int(r, 80, 650);
  return {
    id,
    name: fixedName ?? `${pick(r, HOSPITAL_PREFIX)} ${pick(r, ['Hospital', 'Medical Center', 'University Hospital', 'General Hospital'])}`,
    type: pick(r, ['Private', 'Public', 'University', 'Non-profit']),
    address: address(r, city),
    location: fixedName ? offset(center, 2.1, 200) : near(r, center, 12),
    beds,
    bedsAvailable: int(r, 2, Math.round(beds * 0.25)),
    erWaitMins: int(r, 5, 95),
    departments: pickN(r, HOSPITAL_DEPTS, int(r, 6, 12)),
    rating: round1(3.6 + r() * 1.4),
    phone: `+${int(r, 1, 99)} ${int(r, 100, 999)} ${int(r, 1000, 9999)}`,
    accreditation: pick(r, ['JCI accredited', 'ISO 9001', 'National accreditation', 'Accreditation Canada']),
    emergency: r() < 0.85,
    founded: int(r, 1890, 2015),
  };
}

const LAB_NAMES = ['Precision', 'BioLab', 'Medilab', 'Cedar Diagnostics', 'Genomix', 'Alpha Labs', 'Clear Results', 'Pulse Diagnostics', 'Vita Lab', 'Prime Path'];
export function makeLab(r: Rng, id: string, center: GeoPoint, city: string, fixedName?: string): Lab {
  const factor = 0.8 + r() * 0.45;
  return {
    id,
    name: fixedName ?? `${pick(r, LAB_NAMES)} ${pick(r, ['Laboratory', 'Diagnostics', 'Medical Lab'])}`,
    address: address(r, city),
    location: fixedName ? offset(center, 1.2, 310) : near(r, center, 8),
    hours: `${int(r, 6, 8)}:00 – ${int(r, 17, 21)}:00`,
    homeCollection: r() < 0.55,
    rating: round1(3.8 + r() * 1.2),
    accreditation: pick(r, ['CAP accredited', 'ISO 15189', 'National reference lab']),
    tests: LAB_TESTS.filter(() => r() < 0.85).map((t) => ({
      ...t, price: Math.round(LAB_BASE_PRICE[t.id] * factor), turnaroundHrs: Math.max(2, Math.round(t.turnaroundHrs * (0.7 + r() * 0.6))),
    })),
  };
}

export interface Directory {
  doctors: Doctor[];
  pharmacies: Pharmacy[];
  hospitals: Hospital[];
  labs: Lab[];
}

// IDs of the "featured" listings owned by the demo provider accounts, so that a
// booking made as a patient shows up in the matching provider portal.
export const DEMO_IDS = { doctor: 'doc-demo', pharmacy: 'pha-demo', hospital: 'hos-demo', lab: 'lab-demo' } as const;

const cache = new Map<string, Directory>();

export function generateDirectory(center: GeoPoint, city: string, insurers: string[]): Directory {
  const key = `${center.lat.toFixed(2)},${center.lng.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const r = mulberry32(Math.round((center.lat + 90) * 1000) * 100003 + Math.round((center.lng + 180) * 1000));
  const ins = insurers.filter((i) => i !== 'Other' && i !== 'Uninsured / self-pay');

  const doctors: Doctor[] = [
    makeDoctor(mulberry32(42), DEMO_IDS.doctor, 'Cardiology', center, city, ins, {
      name: 'Dr. Layla Haddad', gender: 'F', location: offset(center, 0.9, 75),
      title: 'Senior Consultant, Cardiology', rating: 4.9, reviewCount: 612, yearsExperience: 18, practisingSince: THIS_YEAR - 18, telehealth: true,
    }),
  ];
  doctors[0].clinics[0] = { ...doctors[0].clinics[0], name: 'Haddad Heart & Vascular Clinic', location: doctors[0].location };
  SPECIALTIES.forEach((s, si) => {
    const n = s.name === 'General Practice' ? 5 : int(r, 2, 4);
    for (let i = 0; i < n; i++) doctors.push(makeDoctor(r, `doc-${si}-${i}`, s.name, center, city, ins));
  });

  const pharmacies = [makePharmacy(mulberry32(7), DEMO_IDS.pharmacy, center, city, 'MediNear Partner Pharmacy')];
  for (let i = 0; i < 14; i++) pharmacies.push(makePharmacy(r, `pha-${i}`, center, city));

  const hospitals = [makeHospital(mulberry32(11), DEMO_IDS.hospital, center, city, 'Cedars University Medical Center')];
  for (let i = 0; i < 6; i++) hospitals.push(makeHospital(r, `hos-${i}`, center, city));

  const labs = [makeLab(mulberry32(13), DEMO_IDS.lab, center, city, 'Precision Diagnostics Lab')];
  for (let i = 0; i < 7; i++) labs.push(makeLab(r, `lab-${i}`, center, city));

  const dir = { doctors, pharmacies, hospitals, labs };
  cache.set(key, dir);
  return dir;
}
