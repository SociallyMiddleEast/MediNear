import { useEffect, useState } from 'react';
import type { GeoPoint, User } from '../types';
import { insurersFor } from '../data/countries';
import { generateDirectory, makeDoctor, makeHospital, makeLab, makePharmacy, mulberry32, type Directory } from '../data/generator';
import { backend } from './backend';
import { centerOf } from './location';

const FALLBACK: GeoPoint = { lat: 33.8938, lng: 35.5018 };

export function userCenter(user: User | null): GeoPoint {
  return user?.location ?? (user?.country ? centerOf(user.country) : undefined) ?? FALLBACK;
}

const seedOf = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

// Providers who registered themselves are added to the directory so patients
// can find them. (With Supabase this becomes a plain query on the providers table.)
async function withRegisteredProviders(dir: Directory, center: GeoPoint, city: string, insurers: string[]): Promise<Directory> {
  const users = (await backend.listUsers()).filter((u) => u.role !== 'patient' && u.providerId && !u.id.startsWith('demo-'));
  const overrides = await backend.getStockOverrides();
  const out: Directory = { doctors: [...dir.doctors], pharmacies: [...dir.pharmacies], hospitals: [...dir.hospitals], labs: [...dir.labs] };
  for (const u of users) {
    const r = mulberry32(seedOf(u.id));
    const loc = u.location ?? center;
    if (u.role === 'doctor') {
      const d = makeDoctor(r, u.providerId!, u.specialty || 'General Practice', loc, city, insurers, { name: u.fullName.startsWith('Dr') ? u.fullName : `Dr. ${u.fullName}`, location: loc });
      out.doctors.unshift(d);
    } else if (u.role === 'pharmacy') out.pharmacies.unshift({ ...makePharmacy(r, u.providerId!, loc, city, u.organisation || u.fullName), location: loc });
    else if (u.role === 'hospital') out.hospitals.unshift({ ...makeHospital(r, u.providerId!, loc, city, u.organisation || u.fullName), location: loc });
    else if (u.role === 'lab') out.labs.unshift({ ...makeLab(r, u.providerId!, loc, city, u.organisation || u.fullName), location: loc });
  }
  // Apply live price / stock edits made by pharmacy owners in their portal.
  out.pharmacies = out.pharmacies.map((p) => {
    const o = overrides[p.id];
    if (!o) return p;
    const stock = p.stock.map((s) => (o[s.medicineId] ? { ...s, ...o[s.medicineId] } : s));
    for (const [medicineId, v] of Object.entries(o)) if (!stock.some((s) => s.medicineId === medicineId)) stock.push({ medicineId, ...v });
    return { ...p, stock };
  });
  return out;
}

export function useDirectory(user: User | null) {
  const center = userCenter(user);
  const [dir, setDir] = useState<Directory>(() => generateDirectory(center, user?.city ?? 'City Center', insurersFor(user?.country), user?.country));
  useEffect(() => {
    const ins = insurersFor(user?.country);
    const base = generateDirectory(center, user?.city ?? 'City Center', ins, user?.country);
    withRegisteredProviders(base, center, user?.city ?? 'City Center', ins).then(setDir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, user?.country]);
  return { dir, center };
}
