export type Role = 'patient' | 'doctor' | 'pharmacy' | 'hospital' | 'lab';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface IdentityDoc {
  type: string; // Passport, National ID, Driver's licence, Residence permit, Other
  number: string;
  issuingCountry?: string;
}

export interface InsurancePlan {
  provider: string;   // e.g. "AXA Middle East", "NSSF (CNSS)", "Cigna Global"
  memberId: string;
  type: string;       // Primary, Secondary / top-up, Employer plan, Travel…
  policyHolder?: string; // when covered through a parent / spouse / employer
  validUntil?: string;   // YYYY-MM-DD
}

export interface User {
  id: string;
  role: Role;
  email: string;
  fullName: string;
  phone?: string;
  createdAt: string;
  country: string; // ISO-2
  city?: string;
  location?: GeoPoint;
  locationSource?: 'gps' | 'timezone' | 'manual';
  // patient-only
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  insurances?: InsurancePlan[]; // a patient may hold several plans
  /** @deprecated single-plan fields from v0.1 — migrated to `insurances` on read */
  insuranceProvider?: string;
  /** @deprecated */
  insuranceId?: string;
  documents?: IdentityDoc[];
  // provider-only: links the account to a listing in the directory
  providerId?: string;
  licenseNumber?: string;
  organisation?: string;
  specialty?: string; // doctors
}

export interface Education {
  degree: string;
  school: string;
  city: string;
  from: number;
  to: number;
}

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface Clinic {
  name: string;
  address: string;
  location: GeoPoint;
  days: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  gender: 'F' | 'M';
  specialty: string;
  subSpecialties: string[];
  photoHue: number;
  yearsExperience: number;
  practisingSince: number;
  education: Education[];
  certifications: string[];
  awards: string[];
  publications: number;
  languages: string[];
  clinics: Clinic[];
  location: GeoPoint; // primary clinic
  rating: number;
  reviewCount: number;
  reviews: Review[];
  fee: number;
  acceptsInsurance: string[];
  bio: string;
  philosophy: string;
  nextAvailable: string;
  telehealth: boolean;
  patientsTreated: number;
}

export interface Medicine {
  id: string;
  name: string;
  generic: string;
  form: string;
  strength: string;
  category: string;
  rx: boolean;
}

export interface StockItem {
  medicineId: string;
  price: number;
  qty: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  location: GeoPoint;
  open24h: boolean;
  hours: string;
  phone: string;
  rating: number;
  delivery: boolean;
  stock: StockItem[];
}

export interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  location: GeoPoint;
  beds: number;
  bedsAvailable: number;
  erWaitMins: number;
  departments: string[];
  rating: number;
  phone: string;
  accreditation: string;
  emergency: boolean;
  founded: number;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  turnaroundHrs: number;
  fasting: boolean;
}

export interface Lab {
  id: string;
  name: string;
  address: string;
  location: GeoPoint;
  hours: string;
  homeCollection: boolean;
  rating: number;
  accreditation: string;
  tests: LabTest[];
}

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string; // ISO
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
}

export type LabOrderStatus = 'ordered' | 'collected' | 'processing' | 'ready';

export interface LabResultRow {
  marker: string;
  value: number;
  unit: string;
  low: number;
  high: number;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  labId: string;
  labName: string;
  tests: string[];
  status: LabOrderStatus;
  createdAt: string;
  scheduledFor: string;
  homeCollection: boolean;
  total: number;
  results?: LabResultRow[];
}

export interface Reservation {
  id: string;
  patientId: string;
  patientName: string;
  pharmacyId: string;
  pharmacyName: string;
  medicineId: string;
  medicineName: string;
  qty: number;
  total: number;
  status: 'reserved' | 'ready' | 'collected';
  createdAt: string;
}
