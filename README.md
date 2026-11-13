# MediNear

Find doctors, pharmacies, hospitals and labs around you. Patients and healthcare providers (doctors, pharmacies, hospitals, labs) each get their own portal.

**Stage 1 (now):** a web app hosted on GitHub Pages, running on demo data stored in the browser.
**Stage 2:** connect a real database (Supabase).
**Stage 3:** ship the same code to the App Store and Play Store with Capacitor.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints. On the sign-in screen, the **Try a demo account** buttons open each portal (Patient, Doctor, Pharmacy, Hospital, Lab). Every demo account uses the password `demo1234`.

## Publish on GitHub Pages

1. Create a repository on GitHub and push this folder to the `main` branch.
2. In the repo, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds the app and publishes it at `https://<user>.github.io/<repo>/`.

> Location detection needs HTTPS. GitHub Pages and `localhost` both qualify.

## What's inside

| Area | Features |
|---|---|
| Sign up | Account type → account → **location detection** (GPS, then reverse geocoding, with a time-zone fallback; the user can override) → age, gender and blood type → **any number of insurance plans** (public, private, employer, top-up, travel) **and ID documents** (passport, national ID, licence…) → review and consent |
| Patient | Home with nearby summary · doctors by specialty, search, filters (insurance, video, gender, sort) · full doctor profiles (education timeline, years in practice, clinics, certifications, awards, languages, insurers, reviews) · booking · **medicine price comparison across pharmacies** with reservations · hospitals with ER wait and beds · labs with test booking and **result tracking** · profile with insurance card and ID wallet |
| Doctor portal | KPIs, 12-month visit trend, conditions mix, high-risk patients, weekly schedule (app bookings included), patient list with vitals and BP trend, lab results with out-of-range flags |
| Pharmacy portal | Sales trend, best sellers, restock alerts, **editable inventory and prices** (patients see the changes right away), reservation workflow |
| Hospital portal | Occupancy, ER volume, admissions by ward, critical patients, departments |
| Lab portal | Sample pipeline (Booked → Sample taken → Analysing → Results ready). Moving an order to *ready* publishes results to the patient. Test catalogue. |

### International coverage

- **All ~200 countries:** names (from the browser, ready for translation), flag, currency, dialling code, ambulance number and a default map centre.
- **Insurers:** local and national insurers for 60+ countries, plus 12 international insurers everywhere. "Other" lets anyone type their own.
- **Locally styled demo data:** generated doctors get local names, local languages and mostly local medical schools.
- **Location fallback:** GPS first, then the device time zone, then the browser language's region. The user can always pick the country manually.
- **Not yet done:**
  - The interface itself is English-only. Translations and right-to-left layout for Arabic are the next step.
  - Prices are converted with approximate demo exchange rates.

### Look and feel

The light theme is blue and white, and the dark theme is teal. Users can switch with the ☀️/🌙 button, or choose Light, Dark or Auto under Profile → Appearance.

Directory listings are **generated around the user's location**, so the app looks local wherever you open it. Each demo provider owns one "featured" listing (for example, Dr. Layla Haddad). Book with her as the patient, sign in as the doctor, and the booking is there.

## Project structure

```
src/
  services/backend.ts     ← the ONLY place that stores data (swap to Supabase here)
  services/directory.ts   ← nearby doctors/pharmacies/hospitals/labs
  services/location.ts    ← GPS + reverse geocoding + fallbacks
  services/portal.ts      ← provider dashboards' mock analytics
  data/                   ← catalogues (specialties, medicines, lab tests, countries)
  pages/auth|patient|provider/
supabase/schema.sql       ← production database schema + row-level security
capacitor.config.json     ← mobile app config
```

## Database recommendation: Supabase

| Need | Why Supabase fits |
|---|---|
| Sign in / sign up | Built-in email and password auth today. Google, Apple, Microsoft and Facebook are a toggle later, with no code rewrite. |
| "Near me" search | PostgreSQL + **PostGIS**: `nearby_providers()` in `schema.sql` finds listings within X km, using an index. |
| Health data privacy | **Row-level security**: a patient only ever sees their own records, a doctor only sees patients who booked with them, a lab only sees its own orders. The policies are in `schema.sql`. |
| Live updates | Realtime subscriptions push lab-status and appointment changes to the screen. |
| Files | Storage for ID scans, prescriptions and lab PDFs. |
| Mobile | The same JS client works inside Capacitor on iOS and Android. |
| Cost | Free tier to start. You can self-host later if a country requires data to stay in-country. |

Alternatives: **Firebase** is quick to start, but its NoSQL storage makes geo-queries and relational data like appointments and orders awkward. **A custom Node + Postgres API** gives full control, but you build auth and security yourself.

**Compliance:** before storing real patient data, check the health-data rules where you operate (GDPR in the EU, HIPAA in the US, local data-protection laws elsewhere). Use Supabase's paid tier with a signed DPA/BAA, encrypt ID and insurance numbers (Supabase Vault), and pick a region close to your users.

### Going live (stage 2)

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Run `npm i @supabase/supabase-js`.
3. Implement the `Backend` interface from `src/services/backend.ts` with Supabase calls, then change the last line to `export const backend = supabaseBackend`.
4. Replace the generator in `services/directory.ts` with a call to `nearby_providers`.

## Mobile apps (stage 3)

The app is already mobile-ready. It has a phone-first layout, bottom tabs, safe-area insets, hash routing and relative asset paths.

```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/geolocation
npm run build
npx cap add ios && npx cap add android
npx cap open ios        # Xcode → run / archive for App Store
npx cap open android    # Android Studio → build AAB for Play Store
```

Then switch `services/location.ts` to `@capacitor/geolocation`, which has the same API shape and gives native permission prompts. Add the location usage text to `Info.plist` and `AndroidManifest.xml`.

## Security note on the demo

In stage 1 the accounts, passwords (salted SHA-256) and records live in the browser's `localStorage`. That is fine for testing the flow, but **not for real patient data**. Use the Supabase backend before onboarding real users.
