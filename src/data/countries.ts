// Worldwide country reference data.
// Country names come from the browser (Intl.DisplayNames), so they are
// automatically translated when the app is localised later.
//
// Each row: ISO-2 | currency | dialling code | emergency (ambulance) number |
//           lat | lng (largest city / capital) | naming region
// Regions drive the style of the generated demo names and languages.

export type Region = 'ar' | 'eu' | 'en' | 'la' | 'af' | 'sa' | 'cn' | 'jp' | 'kr' | 'se' | 'ru' | 'tr';

const RAW = `
AF|AFN|93|102|34.53|69.17|sa
AL|ALL|355|127|41.33|19.82|eu
DZ|DZD|213|14|36.75|3.06|ar
AD|EUR|376|112|42.51|1.52|eu
AO|AOA|244|112|-8.84|13.23|af
AG|XCD|1268|911|17.12|-61.85|en
AR|ARS|54|107|-34.60|-58.38|la
AM|AMD|374|103|40.18|44.51|ru
AU|AUD|61|000|-33.87|151.21|en
AT|EUR|43|144|48.21|16.37|eu
AZ|AZN|994|103|40.41|49.87|tr
BS|BSD|1242|911|25.05|-77.35|en
BH|BHD|973|999|26.23|50.59|ar
BD|BDT|880|999|23.81|90.41|sa
BB|BBD|1246|511|13.10|-59.62|en
BY|BYN|375|103|53.90|27.56|ru
BE|EUR|32|112|50.85|4.35|eu
BZ|BZD|501|911|17.25|-88.77|la
BJ|XOF|229|112|6.37|2.39|af
BT|BTN|975|112|27.47|89.64|sa
BO|BOB|591|165|-16.50|-68.15|la
BA|BAM|387|124|43.86|18.41|eu
BW|BWP|267|997|-24.63|25.92|af
BR|BRL|55|192|-23.55|-46.63|la
BN|BND|673|991|4.90|114.94|se
BG|BGN|359|112|42.70|23.32|eu
BF|XOF|226|112|12.37|-1.52|af
BI|BIF|257|112|-3.38|29.36|af
KH|KHR|855|119|11.56|104.92|se
CM|XAF|237|112|4.05|9.77|af
CA|CAD|1|911|43.65|-79.38|en
CV|CVE|238|130|14.93|-23.51|af
CF|XAF|236|112|4.39|18.56|af
TD|XAF|235|112|12.13|15.06|af
CL|CLP|56|131|-33.45|-70.67|la
CN|CNY|86|120|31.23|121.47|cn
CO|COP|57|123|4.71|-74.07|la
KM|KMF|269|112|-11.70|43.26|af
CG|XAF|242|112|-4.27|15.28|af
CD|CDF|243|112|-4.44|15.27|af
CR|CRC|506|911|9.93|-84.08|la
CI|XOF|225|185|5.36|-4.01|af
HR|EUR|385|112|45.81|15.98|eu
CU|CUP|53|104|23.11|-82.37|la
CW|ANG|599|912|12.12|-68.93|la
CY|EUR|357|112|35.19|33.38|eu
CZ|CZK|420|155|50.08|14.44|eu
DK|DKK|45|112|55.68|12.57|eu
DJ|DJF|253|351|11.59|43.15|ar
DM|XCD|1767|999|15.30|-61.39|en
DO|DOP|1809|911|18.49|-69.93|la
EC|USD|593|911|-0.18|-78.47|la
EG|EGP|20|123|30.04|31.24|ar
SV|USD|503|911|13.69|-89.22|la
GQ|XAF|240|112|3.75|8.78|af
ER|ERN|291|114|15.32|38.93|af
EE|EUR|372|112|59.44|24.75|eu
SZ|SZL|268|977|-26.31|31.14|af
ET|ETB|251|907|9.03|38.74|af
FJ|FJD|679|911|-18.14|178.44|en
FI|EUR|358|112|60.17|24.94|eu
FR|EUR|33|15|48.86|2.35|eu
GA|XAF|241|1300|0.42|9.47|af
GM|GMD|220|116|13.45|-16.58|af
GE|GEL|995|112|41.72|44.79|ru
DE|EUR|49|112|52.52|13.40|eu
GH|GHS|233|112|5.60|-0.19|af
GR|EUR|30|166|37.98|23.73|eu
GL|DKK|299|112|64.18|-51.72|eu
GD|XCD|1473|911|12.06|-61.75|en
GT|GTQ|502|128|14.63|-90.51|la
GN|GNF|224|112|9.64|-13.58|af
GW|XOF|245|112|11.86|-15.60|af
GY|GYD|592|913|6.80|-58.16|en
HT|HTG|509|116|18.54|-72.34|la
HN|HNL|504|911|14.07|-87.19|la
HK|HKD|852|999|22.32|114.17|cn
HU|HUF|36|104|47.50|19.04|eu
IS|ISK|354|112|64.15|-21.94|eu
IN|INR|91|108|19.08|72.88|sa
ID|IDR|62|119|-6.21|106.85|se
IR|IRR|98|115|35.69|51.39|tr
IQ|IQD|964|122|33.32|44.37|ar
IE|EUR|353|112|53.35|-6.26|en
IL|ILS|972|101|32.09|34.78|eu
IT|EUR|39|118|41.90|12.50|eu
JM|JMD|1876|110|18.02|-76.80|en
JP|JPY|81|119|35.68|139.65|jp
JO|JOD|962|911|31.95|35.93|ar
KZ|KZT|7|103|43.24|76.89|ru
KE|KES|254|999|-1.29|36.82|af
KI|AUD|686|994|1.45|172.97|en
XK|EUR|383|112|42.66|21.17|eu
KW|KWD|965|112|29.38|47.98|ar
KG|KGS|996|103|42.87|74.59|ru
LA|LAK|856|1195|17.98|102.63|se
LV|EUR|371|113|56.95|24.11|eu
LB|USD|961|140|33.89|35.50|ar
LS|LSL|266|112|-29.31|27.48|af
LR|LRD|231|911|6.30|-10.80|af
LY|LYD|218|1515|32.89|13.19|ar
LI|CHF|423|144|47.14|9.52|eu
LT|EUR|370|112|54.69|25.28|eu
LU|EUR|352|112|49.61|6.13|eu
MO|MOP|853|999|22.20|113.54|cn
MG|MGA|261|117|-18.88|47.51|af
MW|MWK|265|998|-13.96|33.79|af
MY|MYR|60|999|3.14|101.69|se
MV|MVR|960|102|4.18|73.51|sa
ML|XOF|223|15|12.64|-8.00|af
MT|EUR|356|112|35.90|14.51|eu
MH|USD|692|911|7.12|171.18|en
MR|MRU|222|101|18.08|-15.98|ar
MU|MUR|230|114|-20.16|57.50|af
MX|MXN|52|911|19.43|-99.13|la
FM|USD|691|911|6.92|158.16|en
MD|MDL|373|112|47.01|28.86|ru
MC|EUR|377|112|43.74|7.42|eu
MN|MNT|976|103|47.89|106.91|ru
ME|EUR|382|124|42.44|19.26|eu
MA|MAD|212|150|33.57|-7.59|ar
MZ|MZN|258|117|-25.97|32.57|af
MM|MMK|95|192|16.87|96.20|se
NA|NAD|264|112|-22.56|17.08|af
NR|AUD|674|110|-0.55|166.92|en
NP|NPR|977|102|27.72|85.32|sa
NL|EUR|31|112|52.37|4.90|eu
NZ|NZD|64|111|-36.85|174.76|en
NI|NIO|505|128|12.11|-86.24|la
NE|XOF|227|15|13.51|2.11|af
NG|NGN|234|112|6.52|3.38|af
KP|KPW|850|119|39.04|125.76|kr
MK|MKD|389|194|41.99|21.43|eu
NO|NOK|47|113|59.91|10.75|eu
OM|OMR|968|9999|23.59|58.38|ar
PK|PKR|92|1122|24.86|67.01|sa
PW|USD|680|911|7.34|134.48|en
PS|ILS|970|101|31.90|35.20|ar
PA|USD|507|911|8.98|-79.52|la
PG|PGK|675|111|-9.44|147.18|en
PY|PYG|595|911|-25.26|-57.58|la
PE|PEN|51|106|-12.05|-77.04|la
PH|PHP|63|911|14.60|120.98|se
PL|PLN|48|112|52.23|21.01|eu
PT|EUR|351|112|38.72|-9.14|la
PR|USD|1787|911|18.47|-66.11|la
QA|QAR|974|999|25.29|51.53|ar
RO|RON|40|112|44.43|26.10|eu
RU|RUB|7|103|55.76|37.62|ru
RW|RWF|250|912|-1.94|30.06|af
KN|XCD|1869|911|17.30|-62.72|en
LC|XCD|1758|911|14.01|-60.99|en
VC|XCD|1784|911|13.16|-61.22|en
WS|WST|685|994|-13.83|-171.76|en
SM|EUR|378|113|43.94|12.45|eu
ST|STN|239|112|0.34|6.73|af
SA|SAR|966|997|24.71|46.68|ar
SN|XOF|221|15|14.72|-17.47|af
RS|RSD|381|194|44.79|20.45|eu
SC|SCR|248|999|-4.62|55.45|af
SL|SLE|232|999|8.48|-13.23|af
SG|SGD|65|995|1.35|103.82|se
SK|EUR|421|155|48.15|17.11|eu
SI|EUR|386|112|46.06|14.51|eu
SB|SBD|677|911|-9.43|159.96|en
SO|SOS|252|999|2.05|45.32|ar
ZA|ZAR|27|10177|-26.20|28.05|af
KR|KRW|82|119|37.57|126.98|kr
SS|SSP|211|999|4.86|31.57|af
ES|EUR|34|112|40.42|-3.70|la
LK|LKR|94|1990|6.93|79.86|sa
SD|SDG|249|999|15.50|32.56|ar
SR|SRD|597|115|5.85|-55.20|la
SE|SEK|46|112|59.33|18.07|eu
CH|CHF|41|144|47.38|8.54|eu
SY|SYP|963|110|33.51|36.28|ar
TW|TWD|886|119|25.03|121.57|cn
TJ|TJS|992|103|38.56|68.79|ru
TZ|TZS|255|112|-6.79|39.21|af
TH|THB|66|1669|13.76|100.50|se
TL|USD|670|112|-8.56|125.56|se
TG|XOF|228|8200|6.13|1.22|af
TO|TOP|676|911|-21.14|-175.20|en
TT|TTD|1868|990|10.66|-61.51|en
TN|TND|216|190|36.81|10.18|ar
TR|TRY|90|112|41.01|28.98|tr
TM|TMT|993|103|37.96|58.33|ru
TV|AUD|688|911|-8.52|179.20|en
UG|UGX|256|112|0.35|32.58|af
UA|UAH|380|103|50.45|30.52|ru
AE|AED|971|998|25.20|55.27|ar
GB|GBP|44|999|51.51|-0.13|en
US|USD|1|911|40.71|-74.01|en
UY|UYU|598|911|-34.90|-56.16|la
UZ|UZS|998|103|41.30|69.24|ru
VU|VUV|678|112|-17.73|168.32|en
VA|EUR|379|112|41.90|12.45|eu
VE|VES|58|171|10.48|-66.90|la
VN|VND|84|115|21.03|105.85|se
YE|YER|967|191|15.37|44.19|ar
ZM|ZMW|260|991|-15.39|28.32|af
ZW|USD|263|994|-17.83|31.05|af
`;

export interface CountryInfo {
  code: string; currency: string; dial: string; emergency: string; lat: number; lng: number; region: Region;
}

export const COUNTRY_INFO: Record<string, CountryInfo> = Object.fromEntries(
  RAW.trim().split('\n').map((line) => {
    const [code, currency, dial, emergency, lat, lng, region] = line.split('|');
    return [code, { code, currency, dial, emergency, lat: Number(lat), lng: Number(lng), region: region as Region }];
  }),
);
export const COUNTRY_CODES = Object.keys(COUNTRY_INFO);
export const countryInfo = (code?: string): CountryInfo | undefined => COUNTRY_INFO[code ?? ''];

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
export const countryName = (code: string) => {
  try { return displayNames.of(code) ?? code; } catch { return code; }
};

export const COUNTRIES = COUNTRY_CODES
  .map((code) => ({ code, name: countryName(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const flag = (code: string) =>
  code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

export const regionOf = (code?: string): Region => countryInfo(code)?.region ?? 'en';
export const emergencyNumber = (code?: string) => countryInfo(code)?.emergency ?? '112';
export const dialCode = (code?: string) => countryInfo(code)?.dial ?? '1';

// Approximate units per 1 USD — demo only. Production should use live rates
// and, better, prices entered by each pharmacy/lab in its own currency.
const FX: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.78, CHF: 0.88, AED: 3.67, SAR: 3.75, QAR: 3.64, KWD: 0.31, BHD: 0.376, OMR: 0.385, JOD: 0.71,
  EGP: 49, IQD: 1310, SYP: 13000, YER: 250, LYD: 4.8, TND: 3.1, DZD: 134, MAD: 10, MRU: 40, SDG: 600, DJF: 178, SOS: 571,
  ILS: 3.7, TRY: 34, IRR: 42000, AZN: 1.7, AFN: 70, PKR: 278, INR: 84, BDT: 120, LKR: 295, NPR: 134, BTN: 84, MVR: 15.4,
  CNY: 7.2, HKD: 7.8, MOP: 8, TWD: 32, JPY: 150, KRW: 1380, KPW: 900, MNT: 3400, SGD: 1.34, MYR: 4.5, IDR: 15800, PHP: 57,
  THB: 35, VND: 25000, KHR: 4050, LAK: 21800, MMK: 2100, BND: 1.35, AUD: 1.5, NZD: 1.65, FJD: 2.25, PGK: 3.9, SBD: 8.4,
  VUV: 119, WST: 2.7, TOP: 2.35, CAD: 1.38, MXN: 19, GTQ: 7.7, HNL: 25, NIO: 36.7, CRC: 510, DOP: 60, CUP: 24, HTG: 132,
  JMD: 157, TTD: 6.8, BBD: 2, BSD: 1, BZD: 2, XCD: 2.7, ANG: 1.79, COP: 4100, VES: 45, PEN: 3.75, BOB: 6.9, CLP: 940,
  ARS: 1000, UYU: 41, PYG: 7800, BRL: 5.5, GYD: 209, SRD: 34, RUB: 95, UAH: 41, BYN: 3.3, MDL: 18, GEL: 2.7, AMD: 390,
  KZT: 480, KGS: 86, TJS: 10.7, TMT: 3.5, UZS: 12800, PLN: 4, CZK: 23, HUF: 360, RON: 4.6, BGN: 1.8, RSD: 108, BAM: 1.8,
  MKD: 57, ALL: 92, ISK: 138, SEK: 10.6, NOK: 10.8, DKK: 6.9, ZAR: 18, NAD: 18, LSL: 18, SZL: 18, BWP: 13.5, ZMW: 27,
  MWK: 1730, MZN: 64, AOA: 900, NGN: 1600, GHS: 15, XOF: 600, XAF: 600, GMD: 70, GNF: 8600, SLE: 22.5, LRD: 190, CVE: 101,
  STN: 22.5, CDF: 2850, RWF: 1350, BIF: 2900, UGX: 3700, KES: 129, TZS: 2700, ETB: 120, ERN: 15, SSP: 1500, MGA: 4600,
  MUR: 46, SCR: 13.7, KMF: 450,
};
export const currencyFor = (code?: string): [string, number] => {
  const cur = countryInfo(code)?.currency ?? 'USD';
  return FX[cur] ? [cur, FX[cur]] : ['USD', 1];
};

export const formatMoney = (amountUsd: number, country?: string) => {
  const [cur, mult] = currencyFor(country);
  const value = amountUsd * mult;
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: cur, maximumFractionDigits: value >= 100 ? 0 : 2 }).format(value);
  } catch {
    return `${cur} ${value.toFixed(2)}`;
  }
};

// ----------------------------------------------------------------- insurance
// International insurers available almost everywhere (expats, travel, top-up).
export const INTERNATIONAL_INSURERS = [
  'Allianz Care', 'AXA Global Healthcare', 'Bupa Global', 'Cigna Global', 'GeoBlue', 'Aetna International',
  'APRIL International', 'Henner', 'MSH International', 'IMG Global', 'William Russell', 'Now Health',
];

// National / local insurers for many countries (examples; extend over time —
// in production this list comes from the database and providers can add theirs).
const LOCAL_INSURERS: Record<string, string[]> = {
  LB: ['NSSF (CNSS)', 'COOP (Civil Servants Cooperative)', 'Army Medical', 'AXA Middle East', 'Allianz SNA', 'Bankers Assurance', 'MedNet', 'GlobeMed', 'Fidelity Assurance', 'Arope Insurance'],
  AE: ['Daman', 'Thiqa', 'AXA Gulf (GIG)', 'Sukoon', 'ADNIC', 'Orient Insurance', 'NAS', 'NextCare'],
  SA: ['Bupa Arabia', 'Tawuniya', 'MedGulf', 'Allianz Saudi Fransi', 'Walaa', 'Gulf Union'],
  QA: ['Qatar Insurance (QIC)', 'Al Koot', 'Doha Insurance', 'Seha'],
  KW: ['Gulf Insurance (GIG)', 'Warba Insurance', 'Afya'],
  BH: ['Bahrain National Life', 'Solidarity', 'GIG Bahrain'],
  OM: ['Dhofar Insurance', 'Oman Insurance', 'National Life & General'],
  JO: ['Civil Health Insurance', 'Jordan Insurance Co.', 'Arab Orient', 'MedNet Jordan', 'GlobeMed Jordan'],
  EG: ['Universal Health Insurance', 'Misr Insurance', 'AXA Egypt', 'Allianz Egypt', 'GlobeMed Egypt'],
  IQ: ['Iraqi Health Insurance', 'Al-Hamraa Insurance'],
  MA: ['AMO (CNSS)', 'CNOPS', 'Wafa Assurance', 'Saham Assurance', 'AXA Maroc'],
  TN: ['CNAM', 'STAR', 'GAT Assurances'],
  DZ: ['CNAS', 'CASNOS', 'SAA'],
  TR: ['SGK (Social Security)', 'Allianz Türkiye', 'Axa Sigorta', 'Anadolu Sigorta', 'Acıbadem Sigorta'],
  IL: ['Clalit', 'Maccabi', 'Meuhedet', 'Leumit'],
  IR: ['Iran Health Insurance', 'Social Security Organization', 'Dana Insurance'],
  US: ['Medicare', 'Medicaid', 'UnitedHealthcare', 'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'Kaiser Permanente', 'Humana', 'Anthem', 'Centene (Ambetter)', 'Tricare'],
  CA: ['OHIP (Ontario)', 'RAMQ (Québec)', 'MSP (British Columbia)', 'AHCIP (Alberta)', 'Sun Life', 'Manulife', 'Canada Life', 'Green Shield'],
  MX: ['IMSS', 'ISSSTE', 'IMSS-Bienestar', 'GNP Seguros', 'AXA México', 'MetLife México'],
  BR: ['SUS', 'Bradesco Saúde', 'SulAmérica', 'Amil', 'Unimed', 'Hapvida NotreDame'],
  AR: ['PAMI', 'OSDE', 'Swiss Medical', 'Galeno', 'Medifé'],
  CL: ['FONASA', 'Isapre Colmena', 'Isapre Cruz Blanca', 'Isapre Banmédica', 'Consalud'],
  CO: ['Nueva EPS', 'Sura EPS', 'Sanitas EPS', 'Compensar', 'Salud Total'],
  PE: ['SIS', 'EsSalud', 'Rímac Seguros', 'Pacífico Seguros'],
  GB: ['NHS', 'Bupa UK', 'AXA Health', 'Vitality', 'Aviva', 'WPA', 'Simplyhealth'],
  IE: ['HSE (Medical Card)', 'VHI', 'Laya Healthcare', 'Irish Life Health'],
  FR: ['Assurance Maladie (CPAM)', 'MGEN', 'Harmonie Mutuelle', 'AXA France', 'Malakoff Humanis', 'Swiss Life France'],
  DE: ['TK (Techniker)', 'AOK', 'Barmer', 'DAK-Gesundheit', 'IKK classic', 'Allianz PKV', 'Debeka', 'HUK-Coburg'],
  NL: ['Zilveren Kruis', 'VGZ', 'CZ', 'Menzis', 'DSW'],
  BE: ['Mutualité Chrétienne / CM', 'Solidaris', 'Partenamut', 'DKV Belgium'],
  CH: ['CSS', 'Helsana', 'SWICA', 'Sanitas', 'Groupe Mutuel', 'Visana'],
  AT: ['ÖGK', 'BVAEB', 'SVS', 'UNIQA', 'Wiener Städtische'],
  ES: ['Seguridad Social (SNS)', 'Sanitas', 'Adeslas', 'Asisa', 'DKV Seguros', 'Mapfre'],
  PT: ['SNS', 'Médis', 'Multicare', 'AdvanceCare'],
  IT: ['SSN', 'UniSalute', 'Generali', 'Allianz Italia', 'RBM Salute'],
  GR: ['EOPYY', 'Interamerican', 'NN Hellas', 'Ethniki Asfalistiki'],
  SE: ['Region healthcare (public)', 'Skandia', 'Länsförsäkringar', 'Folksam'],
  NO: ['HELFO (public)', 'Storebrand', 'If', 'Gjensidige'],
  DK: ['Public health insurance (sygesikring)', 'danmark', 'Dansk Sundhedssikring', 'Tryg'],
  FI: ['Kela', 'LähiTapiola', 'If', 'Pohjola'],
  PL: ['NFZ', 'PZU Zdrowie', 'Medicover', 'LUX MED', 'Enel-Med'],
  RO: ['CNAS', 'Regina Maria', 'MedLife', 'Allianz-Țiriac'],
  RU: ['OMS (compulsory)', 'SOGAZ', 'Ingosstrakh', 'RESO-Garantia', 'AlfaStrakhovanie'],
  UA: ['NHSU (public)', 'Uniqa Ukraine', 'ARX', 'INGO'],
  IN: ['Ayushman Bharat (PM-JAY)', 'CGHS', 'ESIC', 'Star Health', 'HDFC ERGO', 'ICICI Lombard', 'Niva Bupa', 'Care Health', 'New India Assurance'],
  PK: ['Sehat Sahulat', 'State Life', 'Jubilee Life', 'Adamjee Insurance', 'EFU Health'],
  BD: ['Green Delta', 'MetLife Bangladesh', 'Pragati Life'],
  LK: ['Ceylinco', 'Sri Lanka Insurance', 'AIA Sri Lanka'],
  CN: ['Basic Medical Insurance (UEBMI/URRBMI)', 'Ping An Health', 'China Life', 'PICC Health', 'Taikang'],
  HK: ['Hospital Authority (public)', 'AXA Hong Kong', 'Bupa Hong Kong', 'AIA Hong Kong', 'Prudential HK'],
  TW: ['National Health Insurance (NHI)', 'Cathay Life', 'Fubon Life'],
  JP: ['National Health Insurance (Kokuho)', 'Employees’ Health Insurance (Shakai Hoken)', 'Kyokai Kenpo', 'Sompo', 'Tokio Marine'],
  KR: ['National Health Insurance Service (NHIS)', 'Samsung Fire', 'Hyundai Marine', 'DB Insurance'],
  SG: ['MediShield Life', 'Integrated Shield (Great Eastern)', 'AIA Singapore', 'Prudential Singapore', 'NTUC Income'],
  MY: ['MySalam', 'AIA Malaysia', 'Great Eastern Malaysia', 'Allianz Malaysia', 'Prudential BSN'],
  ID: ['BPJS Kesehatan', 'Prudential Indonesia', 'AXA Mandiri', 'Allianz Indonesia'],
  PH: ['PhilHealth', 'Maxicare', 'Intellicare', 'Medicard', 'Pacific Cross'],
  TH: ['Universal Coverage (30-baht)', 'Social Security Fund', 'AIA Thailand', 'Muang Thai Life', 'Allianz Ayudhya'],
  VN: ['Vietnam Social Security (BHYT)', 'Bảo Việt', 'PVI', 'Manulife Vietnam'],
  AU: ['Medicare', 'Medibank', 'Bupa Australia', 'HCF', 'nib', 'HBF', 'Australian Unity'],
  NZ: ['Public health (Te Whatu Ora)', 'Southern Cross', 'nib NZ', 'AIA NZ', 'Accuro'],
  ZA: ['Discovery Health', 'Bonitas', 'Momentum Health', 'Medshield', 'GEMS', 'Fedhealth'],
  NG: ['NHIA', 'Hygeia HMO', 'AXA Mansard Health', 'Reliance HMO', 'Avon HMO'],
  KE: ['SHA (Social Health Authority)', 'Jubilee Health', 'AAR Insurance', 'CIC Insurance', 'Britam'],
  GH: ['NHIS', 'Acacia Health', 'Nationwide Medical', 'Premier Health'],
  ET: ['Community-Based Health Insurance', 'Ethiopian Insurance Corporation'],
  TZ: ['NHIF', 'Jubilee Tanzania', 'Strategis'],
  UG: ['AAR Uganda', 'Jubilee Uganda', 'Prudential Uganda'],
  RW: ['Mutuelle de Santé', 'RSSB (RAMA)', 'Radiant'],
};

export const insurersFor = (code?: string) => {
  const local = LOCAL_INSURERS[code ?? ''] ?? ['National / public health insurance', 'Employer health plan'];
  return [...local, ...INTERNATIONAL_INSURERS, 'Other'];
};

export const INSURANCE_TYPES = ['Primary', 'Secondary / top-up', 'Employer plan', 'Government / public', 'Travel', 'Dental', 'Vision'];

export const ID_TYPES = [
  'Passport', 'National ID card', 'Residence permit', "Driver's licence", 'Social security / tax number', 'Refugee / UNHCR ID',
  'Military ID', 'Voter ID', 'Birth certificate (minors)', 'Other',
];

// ----------------------------------------------------------------- country guess
// Used when GPS is denied: (1) device time zone, (2) browser language region.
const TZ_COUNTRY: Record<string, string> = {
  'Asia/Beirut': 'LB', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM', 'Asia/Amman': 'JO', 'Asia/Damascus': 'SY', 'Asia/Baghdad': 'IQ', 'Asia/Aden': 'YE', 'Asia/Gaza': 'PS',
  'Asia/Hebron': 'PS', 'Asia/Jerusalem': 'IL', 'Asia/Tehran': 'IR', 'Asia/Kabul': 'AF', 'Asia/Baku': 'AZ', 'Asia/Tbilisi': 'GE',
  'Asia/Yerevan': 'AM', 'Africa/Cairo': 'EG', 'Africa/Tripoli': 'LY', 'Africa/Tunis': 'TN', 'Africa/Algiers': 'DZ',
  'Africa/Casablanca': 'MA', 'Africa/Khartoum': 'SD', 'Africa/Lagos': 'NG', 'Africa/Accra': 'GH', 'Africa/Abidjan': 'CI',
  'Africa/Dakar': 'SN', 'Africa/Nairobi': 'KE', 'Africa/Addis_Ababa': 'ET', 'Africa/Dar_es_Salaam': 'TZ', 'Africa/Kampala': 'UG',
  'Africa/Kigali': 'RW', 'Africa/Johannesburg': 'ZA', 'Africa/Luanda': 'AO', 'Africa/Kinshasa': 'CD', 'Africa/Maputo': 'MZ',
  'Africa/Harare': 'ZW', 'Africa/Lusaka': 'ZM', 'Africa/Douala': 'CM', 'Indian/Mauritius': 'MU', 'Indian/Antananarivo': 'MG',
  'Europe/Istanbul': 'TR', 'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
  'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Lisbon': 'PT', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE',
  'Europe/Vienna': 'AT', 'Europe/Zurich': 'CH', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU', 'Europe/Athens': 'GR',
  'Asia/Nicosia': 'CY', 'Europe/Bucharest': 'RO', 'Europe/Sofia': 'BG', 'Europe/Belgrade': 'RS', 'Europe/Zagreb': 'HR',
  'Europe/Kyiv': 'UA', 'Europe/Kiev': 'UA', 'Europe/Moscow': 'RU', 'Europe/Minsk': 'BY', 'Europe/Riga': 'LV',
  'Europe/Vilnius': 'LT', 'Europe/Tallinn': 'EE', 'Atlantic/Reykjavik': 'IS', 'Europe/Luxembourg': 'LU', 'Europe/Malta': 'MT',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Colombo': 'LK',
  'Asia/Kathmandu': 'NP', 'Asia/Almaty': 'KZ', 'Asia/Tashkent': 'UZ', 'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY',
  'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH', 'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN',
  'Asia/Phnom_Penh': 'KH', 'Asia/Yangon': 'MM', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW', 'Asia/Ulaanbaatar': 'MN', 'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU', 'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Pacific/Auckland': 'NZ', 'Pacific/Fiji': 'FJ',
  'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX', 'America/Bogota': 'CO', 'America/Lima': 'PE', 'America/Santiago': 'CL',
  'America/Caracas': 'VE', 'America/Argentina/Buenos_Aires': 'AR', 'America/Buenos_Aires': 'AR', 'America/Montevideo': 'UY',
  'America/La_Paz': 'BO', 'America/Asuncion': 'PY', 'America/Guayaquil': 'EC', 'America/Panama': 'PA', 'America/Costa_Rica': 'CR',
  'America/Guatemala': 'GT', 'America/Havana': 'CU', 'America/Santo_Domingo': 'DO', 'America/Puerto_Rico': 'PR',
  'America/Jamaica': 'JM', 'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Montreal': 'CA', 'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US', 'America/Detroit': 'US',
};

export const guessCountry = (): string | undefined => {
  try {
    const tz = TZ_COUNTRY[Intl.DateTimeFormat().resolvedOptions().timeZone];
    if (tz) return tz;
  } catch { /* ignore */ }
  for (const lang of navigator.languages ?? [navigator.language]) {
    const region = lang.split('-')[1]?.toUpperCase();
    if (region && COUNTRY_INFO[region]) return region;
  }
  return undefined;
};
/** @deprecated use guessCountry */
export const countryFromTimezone = guessCountry;

export const COUNTRY_CENTER: Record<string, [number, number]> = Object.fromEntries(
  COUNTRY_CODES.map((c) => [c, [COUNTRY_INFO[c].lat, COUNTRY_INFO[c].lng]]),
);
