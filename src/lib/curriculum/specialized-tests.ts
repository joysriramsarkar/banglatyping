/**
 * Specialized job-oriented typing tests.
 */

export interface SpecializedTest {
  id: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  targetWpm: number;
  minAccuracy: number;
  durationMinutes: number;
  passages: string[];
}

export const SPECIALIZED_TESTS: SpecializedTest[] = [
  {
    id: 'govt-clerk-2026',
    titleBn: 'সরকারি কেরানি টাইপিং ২০২৬',
    titleEn: 'Government Clerk Typing 2026',
    descriptionBn:
      'সরকারি কেরানি পদের компьютер ও বাংলা টাইপিং পরীক্ষার আদলে গতি ও নির্ভুলতা যাচাই।',
    targetWpm: 25,
    minAccuracy: 95,
    durationMinutes: 10,
    passages: [
      'বাংলাদেশ সরকারের প্রশাসনিক কার্যক্রমে দক্ষ টাইপিস্টের ভূমিকা অপরিসীম। নির্ভুল ও দ্রুত টাইপিং সেবার মান বৃদ্ধি করে।',
      'অফিস আদেশ, প্রজ্ঞাপন ও নথি যথাসময়ে প্রস্তুত করতে বাংলা টাইপিংয়ে পারদর্শিতা আবশ্যক।',
    ],
  },
  {
    id: 'data-entry-specialist',
    titleBn: 'ডেটা এন্ট্রি স্পেশালিস্ট',
    titleEn: 'Data Entry Specialist',
    descriptionBn: 'সংখ্যা, বিরামচিহ্ন ও মিশ্র ডেটা দ্রুত ও নির্ভুলভাবে এন্ট্রির অনুশীলন।',
    targetWpm: 35,
    minAccuracy: 97,
    durationMinutes: 10,
    passages: [
      '২০২৬ সালের জানুয়ারি মাসে মোট ১,২৩৪টি আবেদন গৃহীত হয়; যার মধ্যে ৯৮৭টি সঠিক বলে বিবেচিত হয়।',
      'নাম: করিম উদ্দিন, ঠিকানা: বাড়ি-১২, রোড-৫, ঢাকা-১২০৫, ফোন: ০১৭১২-৩৪৫৬৭৮।',
    ],
  },
  {
    id: 'journalist-typing',
    titleBn: 'সাংবাদিক টাইপিং',
    titleEn: 'Journalist Typing',
    descriptionBn: 'সংবাদ প্রতিবেদন দ্রুত টাইপিং — যুক্তাক্ষর ও দীর্ঘ অনুচ্ছেদে গতি ধরে রাখা।',
    targetWpm: 40,
    minAccuracy: 94,
    durationMinutes: 15,
    passages: [
      'রাজধানীতে আজ সকালে অনুষ্ঠিত সংবাদ সম্মেলনে বক্তারা শিক্ষা ও প্রযুক্তি খাতে বিনিয়োগ বৃদ্ধির আহ্বান জানান।',
      'প্রত্যক্ষদর্শীরা জানান, ঘটনাস্থলে দ্রুত উদ্ধারকারী দল পৌঁছে পরিস্থিতি নিয়ন্ত্রণে আনে।',
    ],
  },
];

export function getSpecializedTest(id: string): SpecializedTest | undefined {
  return SPECIALIZED_TESTS.find((t) => t.id === id);
}

export default SPECIALIZED_TESTS;
