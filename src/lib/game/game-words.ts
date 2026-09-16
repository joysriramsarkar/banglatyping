/**
 * Curated Bengali Game Dictionaries & Sentence Pools
 *
 * Categorized by pedagogical difficulty:
 * - Easy: 2-3 letter basic words without complex conjuncts
 * - Medium: 4-6 letter words with vowel signs (কার) and simple hasanta
 * - Hard: Complex conjuncts (যুক্তাক্ষর), phola, and advanced vocabulary
 * - Racing Sentences: Authentic inspirational Bengali sentences and proverbs for speed sprint
 */

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export const GAME_WORDS_EASY: string[] = [
  'জল', 'ফল', 'বল', 'আম', 'জাম', 'গান', 'ধান', 'ফুল', 'নদী', 'আলো',
  'পাখি', 'বই', 'কলম', 'আকাশ', 'সাগর', 'মাটি', 'বাতাস', 'চাঁদ', 'সূর্য', 'তারা',
  'মাছ', 'গাছ', 'পাতা', 'বন', 'ঘর', 'পথ', 'মেঘ', 'বৃষ্টি', 'বেলা', 'খেলা',
  'মেলা', 'হাসি', 'খুশি', 'মন', 'চোখ', 'হাত', 'পা', 'মুখ', 'কান', 'নাক',
  'সাদা', 'কালো', 'লাল', 'নীল', 'সবুজ', 'হলুদ', 'মধু', 'দুধ', 'ভাত', 'ডাল'
];

export const GAME_WORDS_MEDIUM: string[] = [
  'বাংলাদেশ', 'স্বাধীনতা', 'বিদ্যালয়', 'প্রভাত', 'বৈশাখ', 'আনন্দ', 'সুন্দর',
  'প্রকৃতি', 'ভালোবাসা', 'মাতৃভাষা', 'ইতিহাস', 'সংস্কৃতি', 'সাধনা', 'উৎসব', 'নবান্ন',
  'শরৎকাল', 'বসন্তকাল', 'উপহার', 'স্মৃতি', 'কবিতা', 'গল্পকার', 'উপন্যাস', 'সংগীত',
  'চিত্রকলা', 'চিত্রশিল্পী', 'সততা', 'মহানুভব', 'পরিশ্রম', 'সফলতা', 'অভিনন্দন',
  'সাহসী', 'অভিযান', 'পাহাড়', 'ঝর্ণাধারা', 'সৈকত', 'সুন্দরবন', 'পদ্মানদী', 'মেঘনা',
  'যমুনা', 'কর্ণফুলী', 'পায়রা', 'শহীদ', 'স্মৃতিসৌধ', 'জাতীয়', 'পতাকা', 'সংগ্রাম'
];

export const GAME_WORDS_HARD: string[] = [
  'প্রযুক্তি', 'বিশ্ববিদ্যালয়', 'আন্তর্জাতিক', 'বিজ্ঞান', 'শৃঙ্খলা', 'উজ্জ্বল',
  'আত্মবিশ্বাস', 'শ্রদ্ধাঞ্জলি', 'নক্ষত্রমণ্ডলী', 'দৃষ্টিভঙ্গি', 'উদ্ভাবন', 'ব্যক্তিত্ব',
  'অধ্যবসায়', 'দায়িত্বশীল', 'সহমর্মিতা', 'কৌতূহলোদ্দীপক', 'ঐতিহাসিক', 'মনস্তাত্ত্বিক',
  'প্রাকৃতিক', 'আবিষ্কার', 'কম্পিউটার', 'ইন্টারনেট', 'কৃত্রিম', 'বুদ্ধিমত্তা',
  'মহাকাশযান', 'গ্রহাণু', 'অনলাইন', 'টাইপিংমাস্টার', 'দ্রুতগতি', 'দক্ষতা', 'অর্জন',
  'কাব্যগ্রন্থ', 'সাহিত্যিক', 'আন্তর্জাতিকতা', 'প্রজ্ঞাবান', 'স্বনির্ভরতা', 'শ্রেষ্ঠত্ব'
];

export const GAME_WORDS_CONJUNCTS: string[] = [
  'যুক্তাক্ষর', 'বিজ্ঞান', 'প্রজ্ঞা', 'ব্রহ্মপুত্র', 'আকাঙ্ক্ষা', 'উচ্ছ্বাস', 'তত্ত্বাবধান',
  'স্বচ্ছতা', 'দ্বন্দ্ব', 'অস্তিত্ব', 'পরিস্থিতি', 'পুনরুত্থান', 'বিশ্বস্ততা', 'স্পষ্টভাষী',
  'নিষ্ক্রান্ত', 'স্মৃতিচারণ', 'স্বাস্থ্যবান', 'সাক্ষাৎকার', 'নিস্তব্ধতা', 'উদ্দীপনা'
];

export const RACING_SENTENCES: { id: string; text: string; author?: string }[] = [
  {
    id: 'race-1',
    text: 'জ্ঞানহীন মানুষ হালবিহীন নৌকার মতো যে কোনো মুহূর্তে ডুবে যেতে পারে।',
    author: 'প্রবাদ',
  },
  {
    id: 'race-2',
    text: 'বাংলার মুখ আমি দেখিয়াছি, তাই আমি পৃথিবীর রূপ খুঁজিতে যাই না আর।',
    author: 'জীবনানন্দ দাশ',
  },
  {
    id: 'race-3',
    text: 'পরিশ্রম ও সততা মানুষকে অনন্য উচ্চতায় নিয়ে যায় এবং সফলতা এনে দেয়।',
    author: 'বাণী',
  },
  {
    id: 'race-4',
    text: 'আমাদের মাতৃভাষা বাংলা আমাদের গর্ব এবং আত্মমর্যাদার প্রতীক।',
    author: 'জাতীয় ভাবনা',
  },
  {
    id: 'race-5',
    text: 'প্রতিটি নতুন ভোরের সূর্যালোক আমাদের সামনে নতুন সম্ভাবনার দ্বার খুলে দেয়।',
    author: 'অনুপ্রেরণা',
  },
  {
    id: 'race-6',
    text: 'অধ্যবসায় ও একাগ্রতাই সফলতার প্রধান চাবিকাঠি যা সকল বাধাকে দূর করে।',
    author: 'নীতিবাক্য',
  },
  {
    id: 'race-7',
    text: 'দ্রুত এবং নির্ভুল টাইপিং আধুনিক ডিজিটাল যুগে অত্যন্ত মূল্যবান একটি দক্ষতা।',
    author: 'প্রযুক্তি শিক্ষা',
  },
  {
    id: 'race-8',
    text: 'বই পড়ার অভ্যাস মানুষের মনের দিগন্তকে অসীম জ্ঞানের রাজ্যে প্রসারিত করে।',
    author: 'প্রমথ চৌধুরী',
  }
];

/** Get randomized word based on difficulty and optional conjunct boost */
export function getRandomGameWord(difficulty: GameDifficulty, includeConjuncts = false): string {
  let pool: string[];
  if (difficulty === 'easy') {
    pool = GAME_WORDS_EASY;
  } else if (difficulty === 'medium') {
    pool = includeConjuncts && Math.random() > 0.6 ? GAME_WORDS_CONJUNCTS : GAME_WORDS_MEDIUM;
  } else {
    pool = Math.random() > 0.4 ? GAME_WORDS_HARD : GAME_WORDS_CONJUNCTS;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Get multiple unique words */
export function getRandomGameWords(count: number, difficulty: GameDifficulty): string[] {
  const selected = new Set<string>();
  let attempts = 0;
  while (selected.size < count && attempts < count * 5) {
    selected.add(getRandomGameWord(difficulty));
    attempts++;
  }
  return Array.from(selected);
}
