import type { Medicine, LabTest } from '../types';

export const SPECIALTIES: { name: string; icon: string; blurb: string }[] = [
  { name: 'General Practice', icon: '🩺', blurb: 'Check-ups, first visits, referrals' },
  { name: 'Cardiology', icon: '❤️', blurb: 'Heart & blood vessels' },
  { name: 'Dermatology', icon: '🧴', blurb: 'Skin, hair & nails' },
  { name: 'Pediatrics', icon: '🧸', blurb: 'Babies, children & teens' },
  { name: 'Orthopedics', icon: '🦴', blurb: 'Bones, joints & sports injuries' },
  { name: 'Neurology', icon: '🧠', blurb: 'Brain, nerves & migraines' },
  { name: 'Gynecology', icon: '🌸', blurb: "Women's health & pregnancy" },
  { name: 'Ophthalmology', icon: '👁️', blurb: 'Eyes & vision' },
  { name: 'ENT', icon: '👂', blurb: 'Ear, nose & throat' },
  { name: 'Psychiatry', icon: '💬', blurb: 'Mental health' },
  { name: 'Endocrinology', icon: '🧪', blurb: 'Diabetes, thyroid & hormones' },
  { name: 'Gastroenterology', icon: '🫃', blurb: 'Stomach & digestion' },
  { name: 'Pulmonology', icon: '🫁', blurb: 'Lungs & breathing' },
  { name: 'Urology', icon: '💧', blurb: 'Kidneys & urinary tract' },
  { name: 'Dentistry', icon: '🦷', blurb: 'Teeth & gums' },
  { name: 'Oncology', icon: '🎗️', blurb: 'Cancer care' },
  { name: 'Rheumatology', icon: '🤲', blurb: 'Arthritis & autoimmune' },
  { name: 'Nutrition', icon: '🥗', blurb: 'Diet & weight management' },
];

export const SUBSPECIALTIES: Record<string, string[]> = {
  Cardiology: ['Interventional cardiology', 'Echocardiography', 'Heart failure', 'Electrophysiology', 'Preventive cardiology'],
  Dermatology: ['Cosmetic dermatology', 'Pediatric dermatology', 'Skin cancer screening', 'Laser therapy', 'Acne & rosacea'],
  Pediatrics: ['Neonatology', 'Childhood asthma', 'Developmental pediatrics', 'Vaccinations', 'Adolescent medicine'],
  Orthopedics: ['Sports medicine', 'Knee & hip replacement', 'Spine surgery', 'Hand surgery', 'Arthroscopy'],
  Neurology: ['Headache & migraine', 'Epilepsy', 'Stroke care', 'Movement disorders', 'Sleep medicine'],
  Gynecology: ['High-risk pregnancy', 'Fertility & IVF', 'Minimally invasive surgery', 'Menopause care', 'PCOS'],
  Ophthalmology: ['LASIK & refractive', 'Cataract surgery', 'Retina', 'Glaucoma', 'Pediatric ophthalmology'],
  ENT: ['Sinus surgery', 'Hearing & balance', 'Voice disorders', 'Sleep apnea', 'Pediatric ENT'],
  Psychiatry: ['Anxiety & depression', 'ADHD', 'Child psychiatry', 'Addiction medicine', 'CBT'],
  Endocrinology: ['Diabetes management', 'Thyroid disorders', 'Obesity medicine', 'Osteoporosis', 'Adrenal disorders'],
  Gastroenterology: ['Endoscopy', 'IBD (Crohn’s & colitis)', 'Liver disease', 'Colonoscopy screening', 'IBS'],
  Pulmonology: ['Asthma', 'COPD', 'Sleep apnea', 'Interstitial lung disease', 'Bronchoscopy'],
  Urology: ['Kidney stones', 'Prostate health', 'Robotic surgery', 'Male infertility', 'Pediatric urology'],
  Dentistry: ['Orthodontics', 'Implants', 'Cosmetic dentistry', 'Root canal', 'Pediatric dentistry'],
  Oncology: ['Breast cancer', 'Immunotherapy', 'Hematology-oncology', 'Radiation oncology', 'Palliative care'],
  Rheumatology: ['Rheumatoid arthritis', 'Lupus', 'Gout', 'Psoriatic arthritis', 'Osteoarthritis'],
  Nutrition: ['Sports nutrition', 'Diabetic diets', 'Pediatric nutrition', 'Weight loss', 'Gut health'],
  'General Practice': ['Preventive care', 'Chronic disease', 'Travel medicine', 'Minor procedures', 'Family medicine'],
};

export const MED_SCHOOLS: [string, string][] = [
  ['American University of Beirut', 'Beirut'], ['Saint Joseph University', 'Beirut'], ['Lebanese University', 'Beirut'],
  ['Harvard Medical School', 'Boston'], ['Johns Hopkins University', 'Baltimore'], ['University of Oxford', 'Oxford'],
  ['Imperial College London', 'London'], ['Sorbonne Université', 'Paris'], ['Charité – Universitätsmedizin', 'Berlin'],
  ['Karolinska Institutet', 'Stockholm'], ['University of Toronto', 'Toronto'], ['McGill University', 'Montreal'],
  ['Stanford University', 'Stanford'], ['Cairo University', 'Cairo'], ['University of Jordan', 'Amman'],
  ['King Saud University', 'Riyadh'], ['Mayo Clinic Alix School of Medicine', 'Rochester'], ['University of Melbourne', 'Melbourne'],
  ['Universidad de Barcelona', 'Barcelona'], ['Università di Bologna', 'Bologna'],
];

export const RESIDENCY_SITES: [string, string][] = [
  ['Cleveland Clinic', 'Cleveland'], ['Massachusetts General Hospital', 'Boston'], ['AUB Medical Center', 'Beirut'],
  ['Hôtel-Dieu de France', 'Beirut'], ['Guy’s and St Thomas’', 'London'], ['Hôpital Pitié-Salpêtrière', 'Paris'],
  ['Mount Sinai Hospital', 'New York'], ['Toronto General Hospital', 'Toronto'], ['King Faisal Specialist Hospital', 'Riyadh'],
  ['Cleveland Clinic Abu Dhabi', 'Abu Dhabi'], ['Hospital Clínic', 'Barcelona'], ['UCLA Medical Center', 'Los Angeles'],
];

export const FIRST_F = ['Layla', 'Nour', 'Sarah', 'Maya', 'Rania', 'Elena', 'Hana', 'Clara', 'Amira', 'Sofia', 'Yasmine', 'Grace', 'Lina', 'Aisha', 'Mei', 'Julia', 'Dana', 'Priya', 'Zeina', 'Chloé'];
export const FIRST_M = ['Karim', 'Omar', 'Elias', 'Daniel', 'Samir', 'Marco', 'Hadi', 'James', 'Rami', 'Youssef', 'Lucas', 'Antoine', 'Tariq', 'Ken', 'Ravi', 'Georges', 'Fadi', 'Nicolas', 'Ziad', 'Mateo'];
export const LAST = ['Haddad', 'Khoury', 'Nassar', 'Saleh', 'Mansour', 'Aoun', 'Rahme', 'Chami', 'Moreau', 'Rossi', 'Fischer', 'Bennett', 'Kim', 'Tanaka', 'Sharma', 'Garcia', 'Nakamura', 'Hayek', 'Azar', 'Barakat', 'Lindqvist', 'Okafor', 'Costa', 'Dubois'];

export const LANGS = ['English', 'Arabic', 'French', 'Spanish', 'German', 'Italian', 'Armenian', 'Portuguese', 'Turkish', 'Hindi'];

export const STREETS = ['Hamra St', 'Main Ave', 'Cedar Rd', 'Riverside Blvd', 'Park Lane', 'Harbor St', 'Olive Grove', 'Station Rd', 'Liberty Ave', 'Sunset Blvd', 'Garden St', 'Market Sq', 'University Ave', 'Corniche', 'Hillside Dr'];

export const CERTS = [
  'Board Certified', 'Fellow of the Royal College of Physicians (FRCP)', 'ECFMG Certified', 'Advanced Cardiac Life Support (ACLS)',
  'European Board Certification', 'Fellow, American College of Physicians (FACP)', 'Certified in Clinical Research (GCP)',
  'Telemedicine Certified', 'Pediatric Advanced Life Support (PALS)',
];

export const AWARDS = [
  'Top Doctor Award', 'Patient’s Choice Award', 'Excellence in Teaching', 'Compassionate Care Award',
  'Best Young Investigator', 'Clinical Innovation Prize', 'Community Health Champion', 'Distinguished Service Medal',
];

export const REVIEW_TEXTS = [
  'Took the time to really listen and explain everything clearly. I left feeling reassured.',
  'Very professional and punctual. The clinic was spotless and the staff were lovely.',
  'Finally a doctor who looks at the full picture. My treatment plan is working great.',
  'Kind, patient and incredibly knowledgeable. Highly recommend.',
  'Short waiting time and a very thorough examination. Follow-up was quick too.',
  'Explained my lab results in plain language. Answered every question I had.',
  'Great with kids — my son was not scared at all!',
  'A bit of a wait, but worth it. Excellent diagnosis.',
];

export const MEDICINES: Medicine[] = [
  ['Panadol', 'Paracetamol', 'Tablet', '500 mg', 'Pain & fever', false],
  ['Advil', 'Ibuprofen', 'Tablet', '400 mg', 'Pain & fever', false],
  ['Aspirin Protect', 'Acetylsalicylic acid', 'Tablet', '100 mg', 'Heart', false],
  ['Augmentin', 'Amoxicillin/Clavulanate', 'Tablet', '1 g', 'Antibiotics', true],
  ['Zithromax', 'Azithromycin', 'Tablet', '500 mg', 'Antibiotics', true],
  ['Ciproxin', 'Ciprofloxacin', 'Tablet', '500 mg', 'Antibiotics', true],
  ['Glucophage', 'Metformin', 'Tablet', '850 mg', 'Diabetes', true],
  ['Lantus', 'Insulin glargine', 'Pen', '100 U/ml', 'Diabetes', true],
  ['Januvia', 'Sitagliptin', 'Tablet', '100 mg', 'Diabetes', true],
  ['Lipitor', 'Atorvastatin', 'Tablet', '20 mg', 'Heart', true],
  ['Crestor', 'Rosuvastatin', 'Tablet', '10 mg', 'Heart', true],
  ['Concor', 'Bisoprolol', 'Tablet', '5 mg', 'Heart', true],
  ['Norvasc', 'Amlodipine', 'Tablet', '5 mg', 'Blood pressure', true],
  ['Cozaar', 'Losartan', 'Tablet', '50 mg', 'Blood pressure', true],
  ['Eliquis', 'Apixaban', 'Tablet', '5 mg', 'Heart', true],
  ['Nexium', 'Esomeprazole', 'Capsule', '40 mg', 'Stomach', false],
  ['Gaviscon', 'Sodium alginate', 'Suspension', '200 ml', 'Stomach', false],
  ['Ventolin', 'Salbutamol', 'Inhaler', '100 mcg', 'Respiratory', true],
  ['Symbicort', 'Budesonide/Formoterol', 'Inhaler', '160/4.5', 'Respiratory', true],
  ['Claritine', 'Loratadine', 'Tablet', '10 mg', 'Allergy', false],
  ['Zyrtec', 'Cetirizine', 'Tablet', '10 mg', 'Allergy', false],
  ['Euthyrox', 'Levothyroxine', 'Tablet', '50 mcg', 'Thyroid', true],
  ['Zoloft', 'Sertraline', 'Tablet', '50 mg', 'Mental health', true],
  ['Cipralex', 'Escitalopram', 'Tablet', '10 mg', 'Mental health', true],
  ['Vitamin D3', 'Cholecalciferol', 'Capsule', '50,000 IU', 'Vitamins', false],
  ['Ferrous Plus', 'Iron + Folic acid', 'Tablet', '100 mg', 'Vitamins', false],
  ['Omega-3', 'Fish oil', 'Softgel', '1000 mg', 'Vitamins', false],
  ['Fucidin', 'Fusidic acid', 'Cream', '2%', 'Skin', true],
  ['Voltaren Emulgel', 'Diclofenac', 'Gel', '1%', 'Pain & fever', false],
  ['Otrivin', 'Xylometazoline', 'Nasal spray', '0.1%', 'Respiratory', false],
].map(([name, generic, form, strength, category, rx], i) => ({
  id: `med-${i + 1}`, name, generic, form, strength, category, rx,
} as Medicine));

// base USD prices for the catalogue (index aligned)
export const MED_BASE_PRICE = [3, 5, 4, 14, 11, 9, 6, 38, 45, 18, 22, 9, 7, 10, 60, 16, 8, 12, 48, 6, 7, 8, 20, 24, 9, 7, 15, 9, 11, 5];

export const LAB_TESTS: Omit<LabTest, 'price'>[] = [
  { id: 't-cbc', name: 'Complete Blood Count (CBC)', category: 'Blood', turnaroundHrs: 6, fasting: false },
  { id: 't-lipid', name: 'Lipid Profile', category: 'Heart', turnaroundHrs: 12, fasting: true },
  { id: 't-hba1c', name: 'HbA1c', category: 'Diabetes', turnaroundHrs: 12, fasting: false },
  { id: 't-fbs', name: 'Fasting Blood Sugar', category: 'Diabetes', turnaroundHrs: 4, fasting: true },
  { id: 't-tsh', name: 'Thyroid Panel (TSH, FT4)', category: 'Hormones', turnaroundHrs: 24, fasting: false },
  { id: 't-vitd', name: 'Vitamin D (25-OH)', category: 'Vitamins', turnaroundHrs: 24, fasting: false },
  { id: 't-b12', name: 'Vitamin B12', category: 'Vitamins', turnaroundHrs: 24, fasting: false },
  { id: 't-iron', name: 'Iron Studies & Ferritin', category: 'Blood', turnaroundHrs: 24, fasting: true },
  { id: 't-lft', name: 'Liver Function Tests', category: 'Organ function', turnaroundHrs: 12, fasting: false },
  { id: 't-kft', name: 'Kidney Function (Creatinine, Urea)', category: 'Organ function', turnaroundHrs: 12, fasting: false },
  { id: 't-crp', name: 'C-Reactive Protein (CRP)', category: 'Inflammation', turnaroundHrs: 6, fasting: false },
  { id: 't-urine', name: 'Urinalysis', category: 'Urine', turnaroundHrs: 4, fasting: false },
  { id: 't-psa', name: 'PSA', category: 'Cancer screening', turnaroundHrs: 48, fasting: false },
  { id: 't-covid', name: 'COVID-19 / Flu PCR', category: 'Infection', turnaroundHrs: 24, fasting: false },
  { id: 't-preg', name: 'Pregnancy (β-hCG)', category: 'Hormones', turnaroundHrs: 6, fasting: false },
  { id: 't-allergy', name: 'Allergy Panel (IgE)', category: 'Allergy', turnaroundHrs: 72, fasting: false },
  { id: 't-full', name: 'Full Check-up Package', category: 'Packages', turnaroundHrs: 36, fasting: true },
];
export const LAB_BASE_PRICE: Record<string, number> = {
  't-cbc': 12, 't-lipid': 18, 't-hba1c': 15, 't-fbs': 5, 't-tsh': 28, 't-vitd': 30, 't-b12': 22, 't-iron': 26, 't-lft': 20,
  't-kft': 16, 't-crp': 12, 't-urine': 6, 't-psa': 25, 't-covid': 35, 't-preg': 10, 't-allergy': 85, 't-full': 120,
};

// Reference markers used when a lab result is "ready".
export const RESULT_MARKERS: Record<string, [string, string, number, number][]> = {
  't-cbc': [['Hemoglobin', 'g/dL', 12, 17], ['WBC', '×10³/µL', 4, 11], ['Platelets', '×10³/µL', 150, 400]],
  't-lipid': [['Total cholesterol', 'mg/dL', 0, 200], ['LDL', 'mg/dL', 0, 130], ['HDL', 'mg/dL', 40, 90], ['Triglycerides', 'mg/dL', 0, 150]],
  't-hba1c': [['HbA1c', '%', 4, 5.7]],
  't-fbs': [['Glucose (fasting)', 'mg/dL', 70, 100]],
  't-tsh': [['TSH', 'mIU/L', 0.4, 4], ['Free T4', 'ng/dL', 0.8, 1.8]],
  't-vitd': [['25-OH Vitamin D', 'ng/mL', 30, 100]],
  't-b12': [['Vitamin B12', 'pg/mL', 200, 900]],
  't-iron': [['Ferritin', 'ng/mL', 20, 250], ['Serum iron', 'µg/dL', 60, 170]],
  't-lft': [['ALT', 'U/L', 7, 56], ['AST', 'U/L', 10, 40]],
  't-kft': [['Creatinine', 'mg/dL', 0.6, 1.3], ['Urea', 'mg/dL', 7, 20]],
  't-crp': [['CRP', 'mg/L', 0, 5]],
  't-urine': [['pH', '', 4.5, 8], ['Specific gravity', '', 1.005, 1.03]],
  't-psa': [['PSA', 'ng/mL', 0, 4]],
  't-covid': [['Ct value (negative > 40)', '', 40, 45]],
  't-preg': [['β-hCG', 'mIU/mL', 0, 5]],
  't-allergy': [['Total IgE', 'IU/mL', 0, 100]],
  't-full': [['Hemoglobin', 'g/dL', 12, 17], ['Glucose (fasting)', 'mg/dL', 70, 100], ['LDL', 'mg/dL', 0, 130], ['Creatinine', 'mg/dL', 0.6, 1.3]],
};

export const HOSPITAL_DEPTS = ['Emergency', 'Cardiology', 'Oncology', 'Maternity', 'Pediatrics', 'Orthopedics', 'Neurology', 'ICU', 'Radiology', 'Surgery', 'Dialysis', 'Burn unit', 'Psychiatry', 'Rehabilitation'];
