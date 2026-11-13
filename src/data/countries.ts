// Country reference data. Names come from the browser (Intl.DisplayNames) so
// they are automatically localised when the app is translated later.

export const COUNTRY_CODES = [
  'AE','AR','AT','AU','BE','BH','BR','CA','CH','CL','CN','CO','CY','DE','DK','EG','ES','FI','FR','GB',
  'GR','IE','IN','IQ','IT','JO','JP','KR','KW','LB','MA','MX','NG','NL','NO','NZ','OM','PH','PK','PL',
  'PT','QA','RO','SA','SE','SG','SY','TN','TR','UA','US','VE','ZA',
];

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
export const countryName = (code: string) => {
  try { return displayNames.of(code) ?? code; } catch { return code; }
};

export const COUNTRIES = COUNTRY_CODES
  .map((code) => ({ code, name: countryName(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const flag = (code: string) =>
  code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

// Currency + a price multiplier so generated prices look plausible locally.
const CURRENCY: Record<string, [string, number]> = {
  US: ['USD', 1], CA: ['CAD', 1.35], GB: ['GBP', 0.8], IE: ['EUR', 0.92], FR: ['EUR', 0.92], DE: ['EUR', 0.92],
  ES: ['EUR', 0.92], IT: ['EUR', 0.92], PT: ['EUR', 0.92], NL: ['EUR', 0.92], BE: ['EUR', 0.92], AT: ['EUR', 0.92],
  GR: ['EUR', 0.92], FI: ['EUR', 0.92], CY: ['EUR', 0.92], AE: ['AED', 3.67], SA: ['SAR', 3.75], QA: ['QAR', 3.64],
  KW: ['KWD', 0.31], BH: ['BHD', 0.38], OM: ['OMR', 0.38], JO: ['JOD', 0.71], LB: ['USD', 1], EG: ['EGP', 30],
  TR: ['TRY', 20], IN: ['INR', 40], PK: ['PKR', 90], AU: ['AUD', 1.5], NZ: ['NZD', 1.6], JP: ['JPY', 140],
  KR: ['KRW', 1300], CN: ['CNY', 7.1], SG: ['SGD', 1.35], CH: ['CHF', 0.9], SE: ['SEK', 10.5], NO: ['NOK', 10.6],
  DK: ['DKK', 6.9], PL: ['PLN', 4], BR: ['BRL', 5], MX: ['MXN', 17], ZA: ['ZAR', 18], NG: ['NGN', 900],
  MA: ['MAD', 10], TN: ['TND', 3.1], PH: ['PHP', 56], AR: ['ARS', 900], CO: ['COP', 4000], CL: ['CLP', 900],
};
export const currencyFor = (code?: string) => CURRENCY[code ?? ''] ?? ['USD', 1];

export const formatMoney = (amountUsd: number, country?: string) => {
  const [cur, mult] = currencyFor(country);
  const value = amountUsd * mult;
  return new Intl.NumberFormat('en', {
    style: 'currency', currency: cur, maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
};

// Example insurers shown in the sign-up dropdown. "Other" lets the user type one.
const INSURERS: Record<string, string[]> = {
  LB: ['NSSF (CNSS)', 'COOP (Civil Servants Cooperative)', 'Army Medical', 'AXA Middle East', 'Allianz SNA', 'Bankers Assurance', 'MedNet', 'GlobeMed'],
  AE: ['Daman', 'Thiqa', 'AXA Gulf', 'Oman Insurance (Sukoon)', 'Cigna', 'Bupa Global'],
  SA: ['Bupa Arabia', 'Tawuniya', 'MedGulf', 'Allianz Saudi Fransi'],
  US: ['Medicare', 'Medicaid', 'UnitedHealthcare', 'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'Kaiser Permanente', 'Humana'],
  GB: ['NHS', 'Bupa', 'AXA Health', 'Vitality', 'Aviva'],
  FR: ['Assurance Maladie (CPAM)', 'MGEN', 'Harmonie Mutuelle', 'AXA France'],
  DE: ['TK', 'AOK', 'Barmer', 'DAK', 'Allianz PKV'],
  CA: ['OHIP', 'RAMQ', 'MSP (BC)', 'Sun Life', 'Manulife'],
};
export const insurersFor = (code?: string) =>
  [...(INSURERS[code ?? ''] ?? ['National health insurance', 'Allianz Care', 'AXA', 'Cigna Global', 'Bupa Global']), 'Uninsured / self-pay', 'Other'];

export const ID_TYPES = ['Passport', 'National ID card', "Driver's licence", 'Residence permit', 'Social security number', 'Other'];

// Fallback when GPS is denied: guess country from the device timezone.
const TZ_COUNTRY: Record<string, string> = {
  'Asia/Beirut': 'LB', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM', 'Asia/Amman': 'JO', 'Asia/Damascus': 'SY', 'Asia/Baghdad': 'IQ', 'Africa/Cairo': 'EG',
  'Europe/Istanbul': 'TR', 'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
  'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Lisbon': 'PT', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE',
  'Europe/Vienna': 'AT', 'Europe/Zurich': 'CH', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL', 'Europe/Athens': 'GR', 'Asia/Nicosia': 'CY', 'Europe/Bucharest': 'RO',
  'Europe/Kyiv': 'UA', 'Europe/Kiev': 'UA', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Karachi': 'PK',
  'Asia/Singapore': 'SG', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN', 'Asia/Manila': 'PH',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Pacific/Auckland': 'NZ', 'Africa/Johannesburg': 'ZA',
  'Africa/Lagos': 'NG', 'Africa/Casablanca': 'MA', 'Africa/Tunis': 'TN', 'America/Sao_Paulo': 'BR',
  'America/Mexico_City': 'MX', 'America/Bogota': 'CO', 'America/Santiago': 'CL', 'America/Caracas': 'VE',
  'America/Argentina/Buenos_Aires': 'AR', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Phoenix': 'US',
};
export const countryFromTimezone = (): string | undefined => {
  try { return TZ_COUNTRY[Intl.DateTimeFormat().resolvedOptions().timeZone]; } catch { return undefined; }
};

// Approximate capital coordinates used when we only know the country.
export const COUNTRY_CENTER: Record<string, [number, number]> = {
  LB: [33.8938, 35.5018], AE: [25.2048, 55.2708], SA: [24.7136, 46.6753], QA: [25.2854, 51.531], KW: [29.3759, 47.9774],
  BH: [26.2285, 50.586], OM: [23.588, 58.3829], JO: [31.9454, 35.9284], SY: [33.5138, 36.2765], IQ: [33.3152, 44.3661],
  EG: [30.0444, 31.2357], TR: [41.0082, 28.9784], GB: [51.5072, -0.1276], IE: [53.3498, -6.2603], FR: [48.8566, 2.3522],
  DE: [52.52, 13.405], ES: [40.4168, -3.7038], IT: [41.9028, 12.4964], PT: [38.7223, -9.1393], NL: [52.3676, 4.9041],
  BE: [50.8503, 4.3517], AT: [48.2082, 16.3738], CH: [47.3769, 8.5417], SE: [59.3293, 18.0686], NO: [59.9139, 10.7522],
  DK: [55.6761, 12.5683], FI: [60.1699, 24.9384], PL: [52.2297, 21.0122], GR: [37.9838, 23.7275], CY: [35.1856, 33.3823],
  RO: [44.4268, 26.1025], UA: [50.4501, 30.5234], IN: [19.076, 72.8777], PK: [24.8607, 67.0011], SG: [1.3521, 103.8198],
  JP: [35.6762, 139.6503], KR: [37.5665, 126.978], CN: [31.2304, 121.4737], PH: [14.5995, 120.9842], AU: [-33.8688, 151.2093],
  NZ: [-36.8485, 174.7633], ZA: [-26.2041, 28.0473], NG: [6.5244, 3.3792], MA: [33.5731, -7.5898], TN: [36.8065, 10.1815],
  BR: [-23.5505, -46.6333], MX: [19.4326, -99.1332], CO: [4.711, -74.0721], CL: [-33.4489, -70.6693], VE: [10.4806, -66.9036],
  AR: [-34.6037, -58.3816], CA: [43.6532, -79.3832], US: [40.7128, -74.006],
};
