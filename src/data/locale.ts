// Region-aware demo content: names, languages and local medical schools, so
// the generated directory feels local in every country.
import type { Region } from './countries';
import { regionOf } from './countries';

interface NamePool { f: string[]; m: string[]; l: string[] }

const NAMES: Record<Region, NamePool> = {
  ar: {
    f: ['Layla', 'Nour', 'Rania', 'Yasmine', 'Hana', 'Amira', 'Zeina', 'Lina', 'Maya', 'Dana', 'Reem', 'Farah', 'Salma', 'Mariam'],
    m: ['Karim', 'Omar', 'Elias', 'Samir', 'Hadi', 'Rami', 'Youssef', 'Tariq', 'Fadi', 'Ziad', 'Khaled', 'Ahmad', 'Nabil', 'Ali'],
    l: ['Haddad', 'Khoury', 'Nassar', 'Saleh', 'Mansour', 'Aoun', 'Rahme', 'Chami', 'Hayek', 'Azar', 'Barakat', 'Al-Masri', 'Hamdan', 'Daher', 'Abboud', 'Al-Rashid'],
  },
  eu: {
    f: ['Clara', 'Sofia', 'Elena', 'Julia', 'Anna', 'Chloé', 'Lena', 'Marta', 'Ingrid', 'Eva', 'Camille', 'Giulia', 'Katarzyna', 'Nina'],
    m: ['Lucas', 'Marco', 'Antoine', 'Nicolas', 'Jan', 'Matteo', 'Felix', 'Lars', 'Pieter', 'Tomasz', 'Andreas', 'Luca', 'Hugo', 'Erik'],
    l: ['Moreau', 'Rossi', 'Fischer', 'Dubois', 'Lindqvist', 'Novak', 'Müller', 'Bianchi', 'Jansen', 'Kowalski', 'Papadopoulos', 'Schneider', 'Lefèvre', 'Horvat', 'Nielsen'],
  },
  en: {
    f: ['Grace', 'Emily', 'Olivia', 'Charlotte', 'Hannah', 'Sophie', 'Chloe', 'Megan', 'Amelia', 'Rachel', 'Jessica', 'Lauren'],
    m: ['James', 'Daniel', 'Oliver', 'William', 'Thomas', 'Ethan', 'Michael', 'Ryan', 'Samuel', 'Benjamin', 'Jack', 'Nathan'],
    l: ['Bennett', 'Carter', 'Mitchell', 'Hughes', 'Walsh', 'Thompson', 'Reid', 'Patel', 'Morgan', 'Clarke', 'Murphy', 'Nguyen', 'Johnson', 'Campbell'],
  },
  la: {
    f: ['María', 'Valentina', 'Camila', 'Lucía', 'Isabela', 'Daniela', 'Gabriela', 'Ana', 'Fernanda', 'Mariana', 'Beatriz', 'Paula'],
    m: ['Mateo', 'Santiago', 'Diego', 'Alejandro', 'João', 'Carlos', 'Javier', 'Andrés', 'Rafael', 'Miguel', 'Pedro', 'Felipe'],
    l: ['Garcia', 'Rodríguez', 'Martínez', 'López', 'Costa', 'Silva', 'Fernández', 'Pérez', 'Gómez', 'Santos', 'Ramírez', 'Oliveira', 'Torres', 'Castillo'],
  },
  af: {
    f: ['Amara', 'Ngozi', 'Wanjiru', 'Abena', 'Zanele', 'Fatou', 'Aisha', 'Chiamaka', 'Thandiwe', 'Akosua', 'Imani', 'Nadia'],
    m: ['Kwame', 'Chinedu', 'Tunde', 'Kofi', 'Sipho', 'Moussa', 'Baraka', 'Emeka', 'Jabari', 'Thabo', 'Abdoulaye', 'Kelechi'],
    l: ['Okafor', 'Mensah', 'Adeyemi', 'Mwangi', 'Ndlovu', 'Diallo', 'Okonkwo', 'Boateng', 'Kamau', 'Traoré', 'Dlamini', 'Otieno', 'Banda', 'Nkosi'],
  },
  sa: {
    f: ['Priya', 'Ananya', 'Aisha', 'Kavya', 'Fatima', 'Sana', 'Meera', 'Nisha', 'Ayesha', 'Divya', 'Riya', 'Zara'],
    m: ['Ravi', 'Arjun', 'Imran', 'Rahul', 'Vikram', 'Hassan', 'Aditya', 'Bilal', 'Sanjay', 'Farhan', 'Rohan', 'Kabir'],
    l: ['Sharma', 'Patel', 'Khan', 'Gupta', 'Reddy', 'Iyer', 'Ahmed', 'Singh', 'Chowdhury', 'Rao', 'Malik', 'Perera', 'Nair', 'Hussain'],
  },
  cn: {
    f: ['Mei', 'Xiu Ying', 'Li Na', 'Yan', 'Hui', 'Jing', 'Fang', 'Ling', 'Wen', 'Xin'],
    m: ['Wei', 'Jun', 'Hao', 'Ming', 'Lei', 'Jian', 'Tao', 'Bo', 'Chen', 'Yong'],
    l: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou', 'Lin', 'Chan'],
  },
  jp: {
    f: ['Yuki', 'Aiko', 'Sakura', 'Haruka', 'Emi', 'Naomi', 'Mai', 'Keiko', 'Yui', 'Rina'],
    m: ['Ken', 'Hiroshi', 'Takeshi', 'Daisuke', 'Kenji', 'Haruto', 'Yuto', 'Satoshi', 'Ryo', 'Kazuki'],
    l: ['Tanaka', 'Nakamura', 'Sato', 'Suzuki', 'Takahashi', 'Watanabe', 'Ito', 'Yamamoto', 'Kobayashi', 'Kato'],
  },
  kr: {
    f: ['Ji-woo', 'Seo-yeon', 'Min-ji', 'Ha-eun', 'Soo-ah', 'Yuna', 'Eun-ji', 'Da-eun'],
    m: ['Min-jun', 'Seo-jun', 'Ji-ho', 'Hyun-woo', 'Joon', 'Sung-min', 'Do-yun', 'Tae-yang'],
    l: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang', 'Lim'],
  },
  se: {
    f: ['Siti', 'Nurul', 'Linh', 'Mai', 'Ploy', 'Maria', 'Dewi', 'Thao', 'Kim', 'Angelica'],
    m: ['Budi', 'Ahmad', 'Minh', 'Somchai', 'Jose', 'Rizal', 'Tuan', 'Arif', 'Mark', 'Wei Jie'],
    l: ['Santoso', 'Nguyen', 'Tran', 'Reyes', 'Wongsakul', 'Abdullah', 'Tan', 'Lim', 'Pham', 'Cruz', 'Hidayat', 'Bautista'],
  },
  ru: {
    f: ['Anastasia', 'Olga', 'Elena', 'Natalia', 'Irina', 'Daria', 'Svetlana', 'Ekaterina', 'Nino', 'Aigerim'],
    m: ['Dmitri', 'Alexei', 'Sergei', 'Andrei', 'Ivan', 'Nikolai', 'Pavel', 'Giorgi', 'Arman', 'Timur'],
    l: ['Ivanov', 'Petrov', 'Smirnov', 'Kuznetsov', 'Popov', 'Volkov', 'Shevchenko', 'Kovalenko', 'Beridze', 'Nazarbayev', 'Sokolov', 'Morozov'],
  },
  tr: {
    f: ['Elif', 'Zeynep', 'Ayşe', 'Leyla', 'Maryam', 'Shirin', 'Defne', 'Narges', 'Selin', 'Aylin'],
    m: ['Mehmet', 'Emre', 'Ali', 'Reza', 'Mustafa', 'Arash', 'Kerem', 'Dariush', 'Burak', 'Farid'],
    l: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Hosseini', 'Rezaei', 'Aliyev', 'Öztürk', 'Karimi', 'Mammadov', 'Arslan'],
  },
};

export const namesFor = (country?: string) => NAMES[regionOf(country)];

const REGION_LANG: Record<Region, string[]> = {
  ar: ['Arabic', 'French'], eu: ['French', 'German', 'Italian'], en: ['Spanish', 'French'], la: ['Spanish', 'Portuguese'],
  af: ['French', 'Swahili'], sa: ['Hindi', 'Urdu'], cn: ['Mandarin', 'Cantonese'], jp: ['Japanese'], kr: ['Korean'],
  se: ['Malay', 'Thai'], ru: ['Russian'], tr: ['Turkish', 'Persian'],
};
const COUNTRY_LANG: Record<string, string> = {
  FR: 'French', BE: 'French', DE: 'German', AT: 'German', CH: 'German', IT: 'Italian', ES: 'Spanish', PT: 'Portuguese', BR: 'Portuguese',
  NL: 'Dutch', GR: 'Greek', PL: 'Polish', SE: 'Swedish', NO: 'Norwegian', DK: 'Danish', FI: 'Finnish', CZ: 'Czech', HU: 'Hungarian',
  RO: 'Romanian', IL: 'Hebrew', IR: 'Persian', AF: 'Pashto', PK: 'Urdu', BD: 'Bengali', LK: 'Sinhala', NP: 'Nepali', TH: 'Thai',
  VN: 'Vietnamese', ID: 'Indonesian', MY: 'Malay', PH: 'Filipino', KE: 'Swahili', TZ: 'Swahili', ET: 'Amharic', NG: 'Yoruba',
  ZA: 'Zulu', SN: 'Wolof', UA: 'Ukrainian', GE: 'Georgian', AM: 'Armenian', AZ: 'Azerbaijani', KZ: 'Kazakh', MN: 'Mongolian',
  TW: 'Mandarin', HK: 'Cantonese', CA: 'French', US: 'Spanish', MA: 'Arabic', DZ: 'Arabic', TN: 'Arabic', LB: 'Arabic',
};
/** Most likely local language(s) a doctor speaks besides English. */
export const localLanguages = (country?: string) => {
  const main = COUNTRY_LANG[country ?? ''];
  const reg = REGION_LANG[regionOf(country)];
  return [...new Set([main, ...reg].filter(Boolean))] as string[];
};

const REGION_SCHOOLS: Record<Region, [string, string][]> = {
  ar: [['American University of Beirut', 'Beirut'], ['Saint Joseph University', 'Beirut'], ['Cairo University', 'Cairo'], ['University of Jordan', 'Amman'], ['King Saud University', 'Riyadh'], ['Mohammed Bin Rashid University', 'Dubai'], ['Université Mohammed V', 'Rabat']],
  eu: [['Sorbonne Université', 'Paris'], ['Charité – Universitätsmedizin', 'Berlin'], ['Karolinska Institutet', 'Stockholm'], ['Università di Bologna', 'Bologna'], ['KU Leuven', 'Leuven'], ['University of Amsterdam', 'Amsterdam'], ['Jagiellonian University', 'Kraków']],
  en: [['Harvard Medical School', 'Boston'], ['Johns Hopkins University', 'Baltimore'], ['University of Oxford', 'Oxford'], ['Imperial College London', 'London'], ['University of Toronto', 'Toronto'], ['University of Melbourne', 'Melbourne'], ['Trinity College Dublin', 'Dublin']],
  la: [['Universidade de São Paulo', 'São Paulo'], ['UNAM', 'Mexico City'], ['Universidad de Buenos Aires', 'Buenos Aires'], ['Pontificia Universidad Católica', 'Santiago'], ['Universidad Nacional de Colombia', 'Bogotá'], ['Universidad de Barcelona', 'Barcelona']],
  af: [['University of Cape Town', 'Cape Town'], ['University of Nairobi', 'Nairobi'], ['University of Lagos', 'Lagos'], ['University of Ghana', 'Accra'], ['Makerere University', 'Kampala'], ['Université Cheikh Anta Diop', 'Dakar']],
  sa: [['AIIMS New Delhi', 'New Delhi'], ['Christian Medical College', 'Vellore'], ['Aga Khan University', 'Karachi'], ['King Edward Medical University', 'Lahore'], ['Dhaka Medical College', 'Dhaka'], ['University of Colombo', 'Colombo']],
  cn: [['Peking Union Medical College', 'Beijing'], ['Fudan University', 'Shanghai'], ['University of Hong Kong', 'Hong Kong'], ['National Taiwan University', 'Taipei'], ['Zhejiang University', 'Hangzhou']],
  jp: [['University of Tokyo', 'Tokyo'], ['Kyoto University', 'Kyoto'], ['Osaka University', 'Osaka'], ['Keio University', 'Tokyo']],
  kr: [['Seoul National University', 'Seoul'], ['Yonsei University', 'Seoul'], ['Korea University', 'Seoul'], ['Sungkyunkwan University', 'Suwon']],
  se: [['National University of Singapore', 'Singapore'], ['Mahidol University', 'Bangkok'], ['University of Malaya', 'Kuala Lumpur'], ['Universitas Indonesia', 'Jakarta'], ['University of the Philippines', 'Manila'], ['Hanoi Medical University', 'Hanoi']],
  ru: [['Sechenov University', 'Moscow'], ['Pavlov University', 'Saint Petersburg'], ['Bogomolets National Medical University', 'Kyiv'], ['Tbilisi State Medical University', 'Tbilisi'], ['Asfendiyarov KazNMU', 'Almaty']],
  tr: [['Hacettepe University', 'Ankara'], ['Istanbul University', 'Istanbul'], ['Tehran University of Medical Sciences', 'Tehran'], ['Azerbaijan Medical University', 'Baku']],
};
export const schoolsFor = (country?: string) => REGION_SCHOOLS[regionOf(country)];
