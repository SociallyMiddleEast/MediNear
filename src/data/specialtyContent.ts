// Copy used on doctor profile pages, per specialty.
// headline + tagline form the hero title: "Heart health, / handled with care."

export interface SpecialtyCopy {
  headline: string;
  tagline: string;
  intro: string;
  services: { icon: string; title: string; text: string }[];
}

const S = (icon: string, title: string, text: string) => ({ icon, title, text });

export const SPECIALTY_COPY: Record<string, SpecialtyCopy> = {
  'General Practice': {
    headline: 'Everyday health,', tagline: 'all in one place.',
    intro: 'Your first stop for check-ups, new symptoms, chronic conditions and referrals — with time to listen and a clear plan.',
    services: [S('🩺', 'Check-ups', 'Annual physicals, screenings and preventive advice for every age.'), S('🤒', 'New symptoms', 'Fever, infections, pain, fatigue — assessed the same week.'), S('📋', 'Chronic care', 'Blood pressure, diabetes and cholesterol follow-up.'), S('💉', 'Vaccines & travel', 'Routine and travel vaccinations, travel health advice.'), S('🩹', 'Minor procedures', 'Wound care, stitches, ear cleaning and small skin procedures.'), S('↗️', 'Referrals', 'The right specialist, with your history sent ahead.')],
  },
  Cardiology: {
    headline: 'Heart health,', tagline: 'handled with care.',
    intro: 'From palpitations and chest pain to blood pressure and prevention — specialist heart care with modern diagnostics.',
    services: [S('❤️', 'Consultations', 'Chest pain, palpitations, breathlessness and second opinions.'), S('📈', 'ECG & Holter', 'Resting ECG and 24–48h rhythm monitoring.'), S('🫀', 'Echocardiography', 'Ultrasound of the heart’s structure and function.'), S('🏃', 'Stress testing', 'Exercise testing to check how your heart copes with effort.'), S('🩸', 'Blood pressure', 'Diagnosis, home monitoring and treatment plans.'), S('🛡️', 'Prevention', 'Cholesterol, risk scores and lifestyle programmes.')],
  },
  Dermatology: {
    headline: 'Healthy skin,', tagline: 'confident you.',
    intro: 'Medical and cosmetic care for skin, hair and nails — from acne and eczema to mole checks and laser treatments.',
    services: [S('🔍', 'Mole checks', 'Full-body skin cancer screening with dermoscopy.'), S('✨', 'Acne & rosacea', 'Personalised treatment plans that actually work.'), S('🧴', 'Eczema & psoriasis', 'Long-term control of chronic skin conditions.'), S('💇', 'Hair & nails', 'Hair loss, scalp problems and nail disorders.'), S('🔦', 'Laser therapy', 'Pigmentation, scars, vessels and hair removal.'), S('💉', 'Aesthetics', 'Fillers, peels and anti-ageing treatments.')],
  },
  Pediatrics: {
    headline: 'Growing up,', tagline: 'in good hands.',
    intro: 'Gentle, thorough care for babies, children and teenagers — and practical answers for worried parents.',
    services: [S('👶', 'Newborn care', 'First visits, feeding, weight and sleep.'), S('📏', 'Growth & development', 'Milestones, growth charts and early support.'), S('💉', 'Vaccinations', 'Complete national schedule and catch-up plans.'), S('🤧', 'Sick visits', 'Fevers, coughs, ear infections — seen quickly.'), S('🌬️', 'Asthma & allergies', 'Diagnosis, inhaler technique and action plans.'), S('🎒', 'School & sports', 'Certificates, check-ups and teen health.')],
  },
  Orthopedics: {
    headline: 'Move freely,', tagline: 'without the pain.',
    intro: 'Bones, joints, muscles and sports injuries — from diagnosis and physiotherapy plans to surgery when it is really needed.',
    services: [S('🦵', 'Knee & hip', 'Arthritis, ligament injuries and joint replacement.'), S('⚽', 'Sports injuries', 'Sprains, tears and return-to-play plans.'), S('🦴', 'Fractures', 'Casting, follow-up and fracture surgery.'), S('🧍', 'Back & spine', 'Back pain, disc problems and posture.'), S('✋', 'Hand & shoulder', 'Carpal tunnel, frozen shoulder, rotator cuff.'), S('🔬', 'Arthroscopy', 'Keyhole surgery with faster recovery.')],
  },
  Neurology: {
    headline: 'Brain & nerves,', tagline: 'understood clearly.',
    intro: 'Headaches, dizziness, numbness, seizures and memory concerns — careful assessment and long-term follow-up.',
    services: [S('🤕', 'Headache & migraine', 'Diagnosis and modern preventive treatments.'), S('⚡', 'Epilepsy', 'Seizure diagnosis, EEG and medication management.'), S('🧠', 'Stroke care', 'Prevention, rehabilitation and follow-up.'), S('🫨', 'Movement disorders', 'Parkinson’s, tremor and gait problems.'), S('💤', 'Sleep', 'Insomnia, sleep apnoea and narcolepsy.'), S('🧩', 'Memory', 'Early assessment of memory and thinking changes.')],
  },
  Gynecology: {
    headline: 'Women’s health,', tagline: 'at every stage.',
    intro: 'From routine check-ups and contraception to pregnancy, fertility and menopause — care that listens.',
    services: [S('🌸', 'Check-ups', 'Pap smears, HPV testing and breast exams.'), S('🤰', 'Pregnancy', 'Antenatal care, scans and delivery planning.'), S('👶', 'Fertility', 'Investigations, ovulation tracking and IVF referral.'), S('💊', 'Contraception', 'All methods explained, including IUD and implants.'), S('🔄', 'PCOS & periods', 'Irregular, painful or heavy periods.'), S('🌙', 'Menopause', 'Symptom relief and long-term health.')],
  },
  Ophthalmology: {
    headline: 'Clear vision,', tagline: 'for life.',
    intro: 'Complete eye care — from glasses prescriptions and screening to cataract and laser surgery.',
    services: [S('👁️', 'Eye exams', 'Vision tests, pressure checks and retinal imaging.'), S('🔦', 'LASIK', 'Laser vision correction assessment and surgery.'), S('☁️', 'Cataract', 'Modern lens replacement with fast recovery.'), S('🌀', 'Glaucoma', 'Early detection and pressure control.'), S('🩸', 'Retina & diabetes', 'Diabetic eye screening and retinal treatment.'), S('🧒', 'Children’s eyes', 'Lazy eye, squint and school screening.')],
  },
  ENT: {
    headline: 'Ear, nose & throat,', tagline: 'breathe easy.',
    intro: 'Sinus, hearing, voice and sleep problems — diagnosed with in-clinic endoscopy and treated close to home.',
    services: [S('👃', 'Sinus care', 'Chronic sinusitis, polyps and sinus surgery.'), S('👂', 'Hearing & balance', 'Hearing tests, tinnitus and vertigo.'), S('🗣️', 'Voice', 'Hoarseness and vocal cord problems.'), S('😴', 'Snoring & apnoea', 'Sleep studies and treatment options.'), S('🧒', 'Tonsils & adenoids', 'Recurring infections in children and adults.'), S('🤧', 'Allergies', 'Allergic rhinitis testing and treatment.')],
  },
  Psychiatry: {
    headline: 'Mental health,', tagline: 'without judgement.',
    intro: 'A safe space for anxiety, low mood, attention and sleep difficulties — therapy and medication when needed.',
    services: [S('💬', 'Consultations', 'A confidential first assessment and plan.'), S('😰', 'Anxiety', 'Panic, worry, phobias and stress.'), S('🌧️', 'Depression', 'Therapy, medication and follow-up.'), S('🎯', 'ADHD', 'Assessment and treatment for children and adults.'), S('🧘', 'CBT', 'Structured talking therapy with lasting tools.'), S('📹', 'Online sessions', 'Follow-ups by secure video from home.')],
  },
  Endocrinology: {
    headline: 'Hormones in balance,', tagline: 'energy back.',
    intro: 'Diabetes, thyroid, weight and hormone problems — with clear targets and regular follow-up.',
    services: [S('🩸', 'Diabetes', 'Type 1, type 2 and gestational diabetes care.'), S('🦋', 'Thyroid', 'Under- and over-active thyroid, nodules.'), S('⚖️', 'Weight', 'Medical weight-loss programmes.'), S('🦴', 'Bone health', 'Osteoporosis screening and treatment.'), S('🧪', 'Hormones', 'Adrenal, pituitary and reproductive hormones.'), S('📟', 'Technology', 'Insulin pumps and glucose sensors.')],
  },
  Gastroenterology: {
    headline: 'Digestive health,', tagline: 'handled with care.',
    intro: 'Stomach, intestines, liver and pancreas — from first symptoms to endoscopy and long-term follow-up.',
    services: [S('💬', 'Consultations', 'Heartburn, abdominal pain, bloating and bowel changes.'), S('🔭', 'Gastroscopy', 'Upper endoscopy of the oesophagus, stomach and duodenum.'), S('🔬', 'Colonoscopy', 'Screening, symptoms and polyp follow-up.'), S('🫁', 'Liver & pancreas', 'Hepatitis, fatty liver and pancreatic disorders.'), S('🌿', 'IBD & IBS', 'Crohn’s, colitis and irritable bowel.'), S('🎈', 'Weight-loss endoscopy', 'Intragastric balloon with follow-up.')],
  },
  Pulmonology: {
    headline: 'Lung health,', tagline: 'every breath.',
    intro: 'Cough, breathlessness, asthma and sleep apnoea — tested with spirometry and treated with care.',
    services: [S('🌬️', 'Asthma', 'Diagnosis, inhalers and action plans.'), S('🚭', 'COPD & smoking', 'Lung function and quitting support.'), S('😴', 'Sleep apnoea', 'Sleep studies and CPAP.'), S('📊', 'Spirometry', 'Lung function testing in clinic.'), S('🔭', 'Bronchoscopy', 'Camera examination of the airways.'), S('🫁', 'Lung nodules', 'Follow-up of scans and nodules.')],
  },
  Urology: {
    headline: 'Kidney & bladder,', tagline: 'sorted discreetly.',
    intro: 'Stones, prostate, urinary and men’s health problems — with modern, minimally invasive treatment.',
    services: [S('💎', 'Kidney stones', 'Diagnosis, prevention and laser treatment.'), S('🧔', 'Prostate', 'PSA follow-up, enlarged prostate.'), S('🚻', 'Urinary problems', 'Infections, leakage and frequency.'), S('🤖', 'Robotic surgery', 'Precise surgery with faster recovery.'), S('👶', 'Male fertility', 'Investigations and treatment.'), S('🧒', 'Children', 'Paediatric urology problems.')],
  },
  Dentistry: {
    headline: 'Healthy smiles,', tagline: 'gentle hands.',
    intro: 'Check-ups, cleaning, fillings and cosmetic dentistry — comfortable care for the whole family.',
    services: [S('🦷', 'Check-ups & cleaning', 'Scaling, polishing and X-rays.'), S('🪥', 'Fillings & root canal', 'Pain-free restorative treatment.'), S('😁', 'Whitening & veneers', 'Cosmetic smile design.'), S('🔩', 'Implants', 'Permanent replacement for missing teeth.'), S('📐', 'Orthodontics', 'Braces and clear aligners.'), S('🧒', 'Children', 'Gentle first visits and sealants.')],
  },
  Oncology: {
    headline: 'Cancer care,', tagline: 'with you all the way.',
    intro: 'Diagnosis, treatment planning and follow-up — coordinated with surgeons, radiologists and your family.',
    services: [S('🎗️', 'Consultations', 'New diagnoses and second opinions.'), S('💉', 'Chemotherapy', 'Day-unit treatment with close monitoring.'), S('🧬', 'Immunotherapy', 'Targeted and immune-based treatments.'), S('☢️', 'Radiation planning', 'Coordinated with radiation oncology.'), S('🤝', 'Tumour board', 'Your case reviewed by a full team.'), S('🕊️', 'Supportive care', 'Pain, nutrition and palliative support.')],
  },
  Rheumatology: {
    headline: 'Joints & immunity,', tagline: 'back in control.',
    intro: 'Arthritis, lupus, gout and other autoimmune conditions — diagnosed early and managed long-term.',
    services: [S('🤲', 'Arthritis', 'Rheumatoid, psoriatic and osteoarthritis.'), S('🦋', 'Lupus', 'Diagnosis and immune treatment.'), S('🦶', 'Gout', 'Flare treatment and prevention.'), S('💉', 'Joint injections', 'Ultrasound-guided injections.'), S('🧪', 'Biologics', 'Modern targeted therapies.'), S('🦴', 'Osteoporosis', 'Bone density and treatment.')],
  },
  Nutrition: {
    headline: 'Eat well,', tagline: 'feel better.',
    intro: 'Realistic nutrition plans for weight, diabetes, gut health and sport — built around your life and culture.',
    services: [S('🥗', 'Weight management', 'Sustainable plans, no crash diets.'), S('🩸', 'Diabetes diets', 'Blood-sugar friendly meal planning.'), S('🏋️', 'Sports nutrition', 'Fuel for training and recovery.'), S('🌿', 'Gut health', 'IBS, intolerances and low-FODMAP.'), S('🧒', 'Children', 'Picky eating and healthy growth.'), S('📱', 'Online follow-up', 'Weekly check-ins by video.')],
  },
};

export const copyFor = (specialty: string): SpecialtyCopy => SPECIALTY_COPY[specialty] ?? SPECIALTY_COPY['General Practice'];
