-- MediNear — suggested production schema for Supabase (PostgreSQL + PostGIS)
-- Run in the Supabase SQL editor. Auth users live in auth.users (managed by
-- Supabase Auth: email + password today, Google/Apple/Microsoft/Facebook later
-- with zero schema changes).

create extension if not exists postgis;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- enums
create type user_role as enum ('patient', 'doctor', 'pharmacy', 'hospital', 'lab');
create type appt_status as enum ('upcoming', 'completed', 'cancelled');
create type lab_status as enum ('ordered', 'collected', 'processing', 'ready');
create type reservation_status as enum ('reserved', 'ready', 'collected');

-- ---------------------------------------------------------------- profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'patient',
  full_name text not null,
  phone text,
  country char(2) not null,
  city text,
  location geography(point),
  location_source text check (location_source in ('gps', 'timezone', 'manual')),
  created_at timestamptz default now()
);

-- Sensitive patient data kept in its own table so it can have stricter RLS
-- and column encryption (Supabase Vault / pgsodium) for ID numbers.
create table patient_details (
  user_id uuid primary key references profiles on delete cascade,
  date_of_birth date not null,
  gender text,
  blood_type text,
  insurance_provider text,
  insurance_member_id text            -- encrypt in production
);

create table identity_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  doc_type text not null,             -- Passport, National ID card, ...
  doc_number text not null,           -- encrypt in production
  issuing_country char(2),
  verified_at timestamptz
);

-- ---------------------------------------------------------------- providers
-- One row per public listing (a doctor, pharmacy, hospital or lab).
create table providers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles on delete set null,
  kind user_role not null check (kind <> 'patient'),
  name text not null,
  license_number text,
  verified boolean default false,
  address text,
  country char(2) not null,
  location geography(point) not null,
  phone text,
  hours text,
  rating numeric(2,1) default 0,
  details jsonb default '{}'::jsonb,  -- hospital beds, ER wait, lab accreditation, delivery…
  created_at timestamptz default now()
);
create index providers_geo on providers using gist (location);
create index providers_kind on providers (kind, country);

create table doctor_profiles (
  provider_id uuid primary key references providers on delete cascade,
  specialty text not null,
  sub_specialties text[] default '{}',
  title text,
  practising_since int,
  languages text[] default '{}',
  fee numeric(10,2),
  telehealth boolean default false,
  bio text,
  philosophy text
);
create index doctor_specialty on doctor_profiles (specialty);

create table doctor_education (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers on delete cascade,
  degree text, school text, city text, year_from int, year_to int
);

create table provider_insurers (
  provider_id uuid references providers on delete cascade,
  insurer text,
  primary key (provider_id, insurer)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers on delete cascade,
  author_id uuid references profiles on delete set null,
  rating int check (rating between 1 and 5),
  body text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------- catalog
create table medicines (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null, generic_name text, form text, strength text, category text,
  prescription_only boolean default false
);
create table pharmacy_stock (
  pharmacy_id uuid references providers on delete cascade,
  medicine_id uuid references medicines on delete cascade,
  price numeric(10,2) not null,
  currency char(3) not null,
  quantity int not null default 0,
  updated_at timestamptz default now(),
  primary key (pharmacy_id, medicine_id)
);
create table lab_tests (
  lab_id uuid references providers on delete cascade,
  code text, name text, category text, price numeric(10,2), currency char(3),
  turnaround_hours int, fasting boolean default false,
  primary key (lab_id, code)
);

-- ---------------------------------------------------------------- activity
create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  doctor_id uuid not null references providers on delete cascade,
  starts_at timestamptz not null,
  mode text check (mode in ('clinic', 'video')),
  clinic text, reason text,
  status appt_status default 'upcoming',
  created_at timestamptz default now(),
  unique (doctor_id, starts_at)                 -- prevents double booking
);

create table lab_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles on delete cascade,
  lab_id uuid not null references providers on delete cascade,
  referring_doctor_id uuid references providers,
  tests text[] not null,
  scheduled_for timestamptz,
  home_collection boolean default false,
  total numeric(10,2),
  status lab_status default 'ordered',
  created_at timestamptz default now()
);
create table lab_results (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references lab_orders on delete cascade,
  marker text, value numeric, unit text, ref_low numeric, ref_high numeric
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles on delete cascade,
  pharmacy_id uuid references providers on delete cascade,
  medicine_id uuid references medicines,
  quantity int, total numeric(10,2),
  status reservation_status default 'reserved',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------- nearby search
-- select * from nearby_providers('doctor', 33.89, 35.50, 10000);
create or replace function nearby_providers(p_kind user_role, lat float, lng float, radius_m int default 10000)
returns table (id uuid, name text, distance_m float) language sql stable as $$
  select id, name, st_distance(location, st_makepoint(lng, lat)::geography) as distance_m
  from providers
  where kind = p_kind and st_dwithin(location, st_makepoint(lng, lat)::geography, radius_m)
  order by distance_m;
$$;

-- ---------------------------------------------------------------- row level security
alter table profiles enable row level security;
alter table patient_details enable row level security;
alter table identity_documents enable row level security;
alter table appointments enable row level security;
alter table lab_orders enable row level security;
alter table lab_results enable row level security;
alter table reservations enable row level security;
alter table providers enable row level security;
alter table pharmacy_stock enable row level security;

-- Public directory: anyone signed in can read listings & stock.
create policy "read providers" on providers for select using (auth.role() = 'authenticated');
create policy "owner edits provider" on providers for update using (owner_id = auth.uid());
create policy "read stock" on pharmacy_stock for select using (auth.role() = 'authenticated');
create policy "pharmacy edits stock" on pharmacy_stock for all
  using (exists (select 1 from providers p where p.id = pharmacy_id and p.owner_id = auth.uid()));

-- Personal data: only the user themself.
create policy "own profile" on profiles for all using (id = auth.uid());
create policy "own details" on patient_details for all using (user_id = auth.uid());
create policy "own documents" on identity_documents for all using (user_id = auth.uid());

-- Appointments: the patient, or the doctor who owns the listing.
create policy "appt patient" on appointments for all using (patient_id = auth.uid());
create policy "appt doctor" on appointments for select using (
  exists (select 1 from providers p where p.id = doctor_id and p.owner_id = auth.uid()));
create policy "appt doctor update" on appointments for update using (
  exists (select 1 from providers p where p.id = doctor_id and p.owner_id = auth.uid()));

-- Doctors see insurance details only of patients who booked with them.
create policy "doctor reads booked patient" on patient_details for select using (
  exists (select 1 from appointments a join providers p on p.id = a.doctor_id
          where a.patient_id = patient_details.user_id and p.owner_id = auth.uid()));

-- Lab orders/results: patient, the lab, and the referring doctor.
create policy "lab order access" on lab_orders for select using (
  patient_id = auth.uid()
  or exists (select 1 from providers p where p.id in (lab_id, referring_doctor_id) and p.owner_id = auth.uid()));
create policy "patient creates lab order" on lab_orders for insert with check (patient_id = auth.uid());
create policy "lab updates order" on lab_orders for update using (
  exists (select 1 from providers p where p.id = lab_id and p.owner_id = auth.uid()));
create policy "result access" on lab_results for select using (
  exists (select 1 from lab_orders o where o.id = order_id));  -- inherits lab_orders RLS

create policy "reservation access" on reservations for all using (
  patient_id = auth.uid()
  or exists (select 1 from providers p where p.id = pharmacy_id and p.owner_id = auth.uid()));
