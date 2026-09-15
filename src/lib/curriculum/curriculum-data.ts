/**
 * Complete Curriculum Dataset (Levels 0 to 12)
 *
 * Structured according to পরিকল্পনা.md:
 * Concept → Demonstration → Guided Practice → Isolated Drill → Pattern Drill → Word Drill → Mixed Drill → Mastery Test
 */

import type { CurriculumLevel, CurriculumLesson } from './types';

export const CURRICULUM_LEVELS: CurriculumLevel[] = [
  // ── LEVEL 0: ORIENTATION ─────────────────────────────────────────
  {
    level: 0,
    title: 'পরিচিতি ও কীবোর্ড প্রস্তুতি (Orientation)',
    tagline: 'টাইপিং শেখার সঠিক নিয়ম ও কীবোর্ড লেআউট পরিচিতি',
    description: 'হাতের সঠিক পজিশন, কীবোর্ড লেআউট নির্বাচন এবং বেসিক টাইপিংয়ের নিয়মাবলী জানুন।',
    badge: '🚀',
    modules: [
      {
        id: 'mod-0-1',
        level: 0,
        title: 'কীবোর্ড ও টাইপিং নিয়মাবলী',
        description: 'হাতের সঠিক অবস্থান ও বেসিক কন্ট্রোল কি',
        lessons: [
          {
            id: 'lesson-0-1',
            title: 'টাইপিং প্রস্তুতি ও হাতের অবস্থান',
            subtitle: 'Home Row ও আঙুলের স্থান নির্ধারণ',
            level: 0,
            moduleId: 'mod-0-1',
            moduleTitle: 'কীবোর্ড ও টাইপিং নিয়মাবলী',
            description: 'কীবোর্ডে দুই হাতের ৮টি আঙুল কীভাবে স্থাপন করবেন এবং স্পেসবার চাপবেন তা শিখুন।',
            skills: ['home-position', 'space', 'backspace'],
            prerequisites: [],
            estimatedMinutes: 3,
            difficulty: 1,
            sections: [
              {
                id: 'sec-0-1-1',
                type: 'explanation',
                title: 'হাতের সঠিক পজিশন (Home Row Position)',
                instruction: 'বাম হাতের চার আঙুল A, S, D, F এবং ডান হাতের চার আঙুল J, K, L, ; কি-তে রাখুন। দুই বৃদ্ধাঙ্গুল থাকবে Spacebar-এর ওপর।',
                explanationText: 'টাইপিংয়ের মূল রহস্য হলো—স্ক্রিনের দিকে তাকিয়ে টাইপ করা, কিবোর্ডের দিকে না তাকিয়ে। প্রতিবার টাইপ করার পর আঙুলগুলো আবার Home Row-তে ফিরে আসবে।',
              },
              {
                id: 'sec-0-1-2',
                type: 'guided',
                title: 'বেসিক স্পেস ও অক্ষর অনুশীলন',
                instruction: 'আঙুলগুলো হোম রো-তে রেখে ধীরে ধীরে স্পেস ও ক্যারেক্টার অনুশীলন করুন।',
                items: ['ক', ' ', 'ল', ' ', 'স', ' ', 'া', ' '],
                requiredAccuracy: 90,
              },
              {
                id: 'sec-0-1-3',
                type: 'mastery',
                title: 'হোম রো পজিশন যাচাই পরীক্ষা',
                instruction: '৯৭% নির্ভুলতায় এই টেস্টটি সম্পন্ন করে পরবর্তী লেভেল আনলক করুন।',
                items: ['ক', 'ল', 'স', 'া', 'ড', 'ফ', 'গ', 'হ', 'জ'],
                requiredAccuracy: 95,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 1: BENGALI BASICS (স্বরবর্ণ ও ব্যঞ্জনবর্ণ) ──────────────
  {
    level: 1,
    title: 'মৌলিক বাংলা (Vowels & Consonants)',
    tagline: 'বাংলা স্বরবর্ণ ও প্রাথমিক ব্যঞ্জনবর্ণের সঠিক টাইপিং',
    description: 'অ থেকে ঔ এবং ক থেকে ম পর্যন্ত প্রতিটি মৌলিক বর্ণের সঠিক কি সিকোয়েন্স ও আঙুলের ব্যবহার শিখুন।',
    badge: '🌱',
    modules: [
      {
        id: 'mod-1-1',
        level: 1,
        title: 'স্বরবর্ণের অনুশীলন',
        description: 'অ, আ, ই, ঈ, উ, ঊ, ঋ, এ, ঐ, ও, ঔ টাইপ করার পদ্ধতি',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'প্রাথমিক স্বরবর্ণ: অ, আ, ই, ঈ',
            subtitle: 'Shift ও হসন্ত ব্যবহার করে স্বরবর্ণ গঠন',
            level: 1,
            moduleId: 'mod-1-1',
            moduleTitle: 'স্বরবর্ণের অনুশীলন',
            description: 'স্বরবর্ণগুলো একক কি বা হসন্ত+কারের মাধ্যমে কীভাবে গঠিত হয় তা শিখুন।',
            skills: ['vowel-a', 'vowel-aa', 'vowel-i', 'vowel-ee'],
            prerequisites: ['lesson-0-1'],
            estimatedMinutes: 5,
            difficulty: 2,
            sections: [
              {
                id: 'sec-1-1-1',
                type: 'explanation',
                title: 'স্বরবর্ণ টাইপিংয়ের নিয়ম',
                instruction: 'BanglaWord লেআউটে Shift+A দিয়ে "অ", এবং "আ" টাইপ করতে "্ + া" অথবা সরাসরি "আ" ব্যবহার হয়।',
                explanationText: 'স্বরবর্ণগুলো স্বতন্ত্র অক্ষর হিসেবে শব্দের শুরুতে ব্যবহৃত হয়।',
              },
              {
                id: 'sec-1-1-2',
                type: 'demonstration',
                title: 'উদাহরণ ডেমো',
                demonstration: {
                  target: 'আ',
                  description: 'আ টাইপ করার নিয়ম',
                  steps: [
                    { key: 'h', label: '্ (হসন্ত)', finger: 'ডান হাতের তর্জনী' },
                    { key: 'a', label: 'া (আ-কার)', finger: 'বাম হাতের কনিষ্ঠা' },
                  ],
                },
              },
              {
                id: 'sec-1-1-3',
                type: 'pattern',
                title: 'স্বরবর্ণের প্যাটার্ন ড্রিল',
                instruction: 'নিচের স্বরবর্ণগুলো বারবার টাইপ করে নির্ভুলতা অর্জন করুন।',
                items: ['অ', 'আ', 'ই', 'ঈ', 'অ', 'আ', 'ই', 'ঈ'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-1-1-4',
                type: 'word',
                title: 'সহজ স্বরবর্ণ শব্দ ড্রিল',
                instruction: 'স্বরবর্ণ দিয়ে শুরু হওয়া সহজ বাংলা শব্দ টাইপ করুন।',
                items: ['আম', 'ইট', 'আজ', 'ঈদ', 'আকাশ', 'আলো'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-1-1-5',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা — স্বরবর্ণ',
                instruction: '৯৭% নির্ভুলতায় টেস্টটি সম্পন্ন করুন।',
                items: ['অ', 'আ', 'ই', 'ঈ', 'আম', 'ঈদ', 'আলো', 'আজ'],
                requiredAccuracy: 97,
              },
            ],
          },
          {
            id: 'lesson-1-2',
            title: 'উ, ঊ, ঋ, এ, ঐ, ও, ঔ',
            subtitle: 'উ-কার ও অন্যান্য স্বরবর্ণের পরিপূর্ণ রূপ',
            level: 1,
            moduleId: 'mod-1-1',
            moduleTitle: 'স্বরবর্ণের অনুশীলন',
            description: 'উ থেকে ঔ পর্যন্ত জটিলতর স্বরবর্ণগুলোর সঠিক টাইপিং সিকোয়েন্স।',
            skills: ['vowel-u', 'vowel-oo', 'vowel-ri', 'vowel-e', 'vowel-oi', 'vowel-o', 'vowel-ou'],
            prerequisites: ['lesson-1-1'],
            estimatedMinutes: 5,
            difficulty: 3,
            sections: [
              {
                id: 'sec-1-2-1',
                type: 'explanation',
                title: 'ঋ এবং ঔ টাইপিং',
                instruction: 'ঋ টাইপ করতে "্" + "\\" (হসন্ত + ঋ-কার) এবং ঔ টাইপ করতে "্" + Shift+O চাপুন।',
                explanationText: 'BanglaWord-এ ব্যাকস্ল্যাশ (\\) কি-তে ঋ-কার রয়েছে।',
              },
              {
                id: 'sec-1-2-2',
                type: 'isolated',
                title: 'আইসোলেটেড ড্রিল',
                items: ['উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-1-2-3',
                type: 'word',
                title: 'স্বরবর্ণ মিশ্রিত শব্দ',
                items: ['উট', 'ঋণ', 'এক', 'ঐক্য', 'ওজন', 'ঔষধ', 'উপকার'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-1-2-4',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা — পূর্ণাঙ্গ স্বরবর্ণ',
                items: ['উট', 'ঋণ', 'ঐক্য', 'ঔষধ', 'উ', 'ঋ', 'ঔ', 'এক'],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
      {
        id: 'mod-1-2',
        level: 1,
        title: 'মৌলিক ব্যঞ্জনবর্ণ (Basic Consonants)',
        description: 'ক থেকে ম পর্যন্ত স্পর্শ ব্যঞ্জনবর্ণের সঠিক টাইপিং',
        lessons: [
          {
            id: 'lesson-1-3',
            title: 'ক-বর্গ ও চ-বর্গ (ক, খ, গ, ঘ, ঙ, চ, ছ, জ, ঝ, ঞ)',
            subtitle: 'হোম ও টপ রো ব্যঞ্জনবর্ণ',
            level: 1,
            moduleId: 'mod-1-2',
            moduleTitle: 'মৌলিক ব্যঞ্জনবর্ণ',
            description: 'ক, খ, গ, ঘ এবং চ, ছ, জ, ঝ বর্ণের আঙুলের সঠিক অবস্থান ও শিফট কম্বিনেশন।',
            skills: ['consonant-k-group', 'consonant-ch-group'],
            prerequisites: ['lesson-1-2'],
            estimatedMinutes: 5,
            difficulty: 2,
            sections: [
              {
                id: 'sec-1-3-1',
                type: 'explanation',
                title: 'মহাপ্রাণ বর্ণের জন্য Shift',
                instruction: 'ক (k) এর মহাপ্রাণ খ টাইপ করতে Shift+K চাপুন। গ (g) এর মহাপ্রাণ ঘ টাইপ করতে Shift+G চাপুন।',
              },
              {
                id: 'sec-1-3-2',
                type: 'pattern',
                title: 'অল্পপ্রাণ-মহাপ্রাণ পেয়ার ড্রিল',
                items: ['ক', 'খ', 'গ', 'ঘ', 'চ', 'ছ', 'জ', 'ঝ'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-1-3-3',
                type: 'word',
                title: 'সহজ শব্দ ড্রিল',
                items: ['কলম', 'খাতা', 'গান', 'ঘর', 'জল', 'ঝড়', 'গাছ', 'চক'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-1-3-4',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা',
                items: ['কলম', 'খাতা', 'গান', 'জল', 'ক', 'খ', 'গ', 'ঘ'],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 2: কার (VOWEL SIGNS) ──────────────────────────────────
  {
    level: 2,
    title: 'কার চিহ্ন (Vowel Signs — Kar)',
    tagline: 'া, ি, ী, ু, ূ, ৃ, ে, ৈ, ো, ৌ কারের নির্ভুল ব্যবহার',
    description: 'ব্যঞ্জনবর্ণের সাথে প্রতিটি কার যোগ করে শব্দ তৈরির নিয়ম ও দ্রুত টাইপিং অনুশীলন।',
    badge: '🎯',
    modules: [
      {
        id: 'mod-2-1',
        level: 2,
        title: 'হ্রস্ব ও দীর্ঘ কার (ি, ী, ু, ূ, ৃ)',
        description: 'ই-কার, ঈ-কার, উ-কার, ঊ-কার ও ঋ-কারের টাইপিং প্যাটার্ন',
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'ই-কার ও ঈ-কার (ি ও ী)',
            subtitle: 'কি, কী, চি, চী, দি, দী ইত্যাদি প্যাটার্ন',
            level: 2,
            moduleId: 'mod-2-1',
            moduleTitle: 'হ্রস্ব ও দীর্ঘ কার',
            description: 'ি (i) ও ী (Shift+I) কারের পার্থক্য ও সঠিক টাইপিং সিকোয়েন্স।',
            skills: ['kar-i', 'kar-ee'],
            prerequisites: ['lesson-1-3'],
            estimatedMinutes: 5,
            difficulty: 3,
            sections: [
              {
                id: 'sec-2-1-1',
                type: 'explanation',
                title: 'ি এবং ী কার টাইপ করার ক্রম',
                instruction: 'বাংলা টাইপিংয়ে আগে ব্যঞ্জনবর্ণ চাপতে হয়, তারপর কার। যেমন: ক + ি = কি।',
                explanationText: 'যদিও লেখার সময় ি-কার আগে বসে, টাইপিং সিস্টেমে সব কার বর্ণের পরেই টাইপ করতে হয়।',
              },
              {
                id: 'sec-2-1-2',
                type: 'pattern',
                title: 'প্যাটার্ন ড্রিল',
                items: ['কি', 'কী', 'গি', 'গী', 'চি', 'চী', 'দি', 'দী', 'নি', 'নী'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-2-1-3',
                type: 'word',
                title: 'শব্দ ড্রিল',
                items: ['কীভাবে', 'কিছু', 'কীর্তি', 'দিন', 'দীপ', 'নদী', 'পানি', 'চিনি'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-2-1-4',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা — ি ও ী কার',
                items: ['কীভাবে', 'নদী', 'চিনি', 'দিন', 'কি', 'কী', 'দি', 'দী'],
                requiredAccuracy: 97,
              },
            ],
          },
          {
            id: 'lesson-2-2',
            title: 'উ-কার, ঊ-কার ও ঋ-কার (ু, ূ, ৃ)',
            subtitle: 'কু, কূ, কৃ ইত্যাদি সমন্বিত রূপ',
            level: 2,
            moduleId: 'mod-2-1',
            moduleTitle: 'হ্রস্ব ও দীর্ঘ কার',
            description: 'ু (u), ূ (Shift+U) এবং ৃ (\\) কারের নির্ভুল অনুশীলন।',
            skills: ['kar-u', 'kar-oo', 'kar-ri'],
            prerequisites: ['lesson-2-1'],
            estimatedMinutes: 5,
            difficulty: 3,
            sections: [
              {
                id: 'sec-2-2-1',
                type: 'explanation',
                title: 'ঋ-কার (ৃ) টাইপিংয়ের নিয়ম',
                instruction: 'কৃ টাইপ করতে প্রথমে ক (k), তারপর ব্যাকস্ল্যাশ (\\) চাপুন।',
              },
              {
                id: 'sec-2-2-2',
                type: 'pattern',
                title: 'প্যাটার্ন ড্রিল — ু, ূ, ৃ',
                items: ['কু', 'কূ', 'কৃ', 'গু', 'গূ', 'গৃহ', 'তু', 'তূ', 'তৃ'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-2-2-3',
                type: 'word',
                title: 'শব্দ ড্রিল',
                items: ['ফুল', 'কূল', 'কৃষি', 'গৃহ', 'তৃণ', 'দূর', 'রূপ', 'মূল্য', 'সূর্য'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-2-2-4',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা',
                items: ['কৃষি', 'ফুল', 'গৃহ', 'রূপ', 'কু', 'কৃ', 'তু', 'তৃ'],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
      {
        id: 'mod-2-2',
        level: 2,
        title: 'এ-কার, ঐ-কার, ও-কার ও ঔ-কার (ে, ৈ, ো, ৌ)',
        description: 'যৌগিক স্বরের কার চিহ্ন ও দীর্ঘ প্যাটার্ন',
        lessons: [
          {
            id: 'lesson-2-3',
            title: 'ে, ৈ, ো, ৌ কারের পূর্ণাঙ্গ অনুশীলন',
            subtitle: 'কে, কৈ, কো, কৌ এবং বাস্তব শব্দ',
            level: 2,
            moduleId: 'mod-2-2',
            moduleTitle: 'যৌগিক কার',
            description: 'ে (e), ৈ (Shift+E), ো (o) এবং ৌ (Shift+O) কারের সঠিক ব্যবহার।',
            skills: ['kar-e', 'kar-oi', 'kar-o', 'kar-ou'],
            prerequisites: ['lesson-2-2'],
            estimatedMinutes: 5,
            difficulty: 3,
            sections: [
              {
                id: 'sec-2-3-1',
                type: 'pattern',
                title: 'কার প্যাটার্ন ড্রিল',
                items: ['কে', 'কৈ', 'কো', 'কৌ', 'গে', 'গৈ', 'গো', 'গৌ', 'তে', 'তৈ', 'তো', 'তৌ'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-2-3-2',
                type: 'word',
                title: 'শব্দ ড্রিল',
                items: ['কেমন', 'কৈশোর', 'কোনো', 'কৌতূহল', 'দেশ', 'তৈরি', 'লোক', 'নৌকা'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-2-3-3',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা — সকল কার',
                items: ['কৌতূহল', 'নৌকা', 'তৈরি', 'দেশ', 'কেমন', 'কো', 'কৌ', 'তৈ'],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 3: হসন্ত (HASANTA) ────────────────────────────────────
  {
    level: 3,
    title: 'হসন্ত ও ব্যঞ্জন সন্ধি (Hasanta)',
    tagline: 'হসন্ত (্) ব্যবহার করে ব্যঞ্জনের অর্ধরূপ ও সংযোগ তৈরি',
    description: 'যুক্তাক্ষর তৈরির মূল চাবিকাঠি হসন্তের ব্যবহার, ডেড কি ট্রানজিশন ও দ্রুত টাইপিং।',
    badge: '⚡',
    modules: [
      {
        id: 'mod-3-1',
        level: 3,
        title: 'হসন্ত সংযোগ',
        description: 'ক্, ত্, ন্, স্, র্ এবং ব্যঞ্জন ট্রানজিশন',
        lessons: [
          {
            id: 'lesson-3-1',
            title: 'হসন্ত ট্রানজিশন ও একা হসন্ত',
            subtitle: 'h কি-এর ব্যবহার ও যুক্তাক্ষরের ভিত্তি',
            level: 3,
            moduleId: 'mod-3-1',
            moduleTitle: 'হসন্ত সংযোগ',
            description: 'হসন্ত (h) কীভাবে দুটি ব্যঞ্জনবর্ণকে জুড়ে দিয়ে একটি যুক্তাক্ষর বানায় তা বুঝুন।',
            skills: ['hasanta-basic', 'hasanta-transition'],
            prerequisites: ['lesson-2-3'],
            estimatedMinutes: 5,
            difficulty: 4,
            sections: [
              {
                id: 'sec-3-1-1',
                type: 'explanation',
                title: 'হসন্তের ভূমিকা',
                instruction: 'ক + ্ + ত = ক্ত। হসন্ত হলো দুই ব্যঞ্জনবর্ণের মধ্যকার আঠা।',
                explanationText: 'হসন্ত ছাড়া টাইপ করলে দুটি ব্যঞ্জন আলাদা দেখাবে (কত), কিন্তু হসন্ত দিলে তারা সংযুক্ত রূপ নিবে (ক্ত)।',
              },
              {
                id: 'sec-3-1-2',
                type: 'pattern',
                title: 'হসন্ত পেয়ার ড্রিল',
                items: ['ক্', 'ত্', 'ন্', 'স্', 'ব্', 'র্', 'দ্'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-3-1-3',
                type: 'mastery',
                title: 'হসন্ত মাস্টারি পরীক্ষা',
                items: ['ক্', 'ত্', 'ন্', 'স্', 'ব্', 'র্'],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 4: সহজ যুক্তাক্ষর (SIMPLE CONJUNCTS) ─────────────────
  {
    level: 4,
    title: 'সহজ যুক্তাক্ষর (Simple Conjuncts)',
    tagline: 'ক্ত, ন্ত, ন্দ, স্থ, স্ত, ত্র, ক্র, গ্র, প্র ইত্যাদি সাধারণ যুক্তবর্ণ',
    description: 'বহুল ব্যবহৃত সহজ যুক্তাক্ষরগুলোর সঠিক ক্রম ও দ্রুত আঙুল সঞ্চালন কৌশল।',
    badge: '🔗',
    modules: [
      {
        id: 'mod-4-1',
        level: 4,
        title: 'ত-বর্গ ও ন-বর্গের যুক্তাক্ষর',
        description: 'ক্ত, ন্ত, ন্দ, ন্ধ, স্থ, স্ত',
        lessons: [
          {
            id: 'lesson-4-1',
            title: 'ক্ত, ন্ত, ন্দ, ন্ধ',
            subtitle: 'রক্ত, শান্ত, আনন্দ, বন্ধন ইত্যাদি শব্দ',
            level: 4,
            moduleId: 'mod-4-1',
            moduleTitle: 'ত-বর্গ ও ন-বর্গের যুক্তাক্ষর',
            description: 'ক+্+ত=ক্ত, ন+্+ত=ন্ত, ন+্+দ=ন্দ এর অনুশীলন।',
            skills: ['conjunct-kta', 'conjunct-nta', 'conjunct-nda', 'conjunct-ndha'],
            prerequisites: ['lesson-3-1'],
            estimatedMinutes: 5,
            difficulty: 4,
            sections: [
              {
                id: 'sec-4-1-1',
                type: 'demonstration',
                title: 'ক্ত গঠনের ধাপ',
                demonstration: {
                  target: 'ক্ত',
                  description: 'ক + ্ + ত',
                  steps: [
                    { key: 'k', label: 'ক', finger: 'ডান মধ্যমা' },
                    { key: 'h', label: '্', finger: 'ডান তর্জনী' },
                    { key: 'x', label: 'ত', finger: 'বাম অনামিকা' },
                  ],
                },
              },
              {
                id: 'sec-4-1-2',
                type: 'pattern',
                title: 'যুক্তাক্ষর প্যাটার্ন ড্রিল',
                items: ['ক্ত', 'ন্ত', 'ন্দ', 'ন্ধ', 'ক্ত', 'ন্ত', 'ন্দ', 'ন্ধ'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-4-1-3',
                type: 'word',
                title: 'যুক্তাক্ষর শব্দ ড্রিল',
                items: ['রক্ত', 'শান্ত', 'আনন্দ', 'বন্ধু', 'মুক্তি', 'অনন্ত', 'সুন্দর', 'অন্ধকার'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-4-1-4',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা — সহজ যুক্তাক্ষর',
                items: ['আনন্দ', 'রক্ত', 'বন্ধু', 'মুক্তি', 'ক্ত', 'ন্ত', 'ন্দ', 'ন্ধ'],
                requiredAccuracy: 97,
              },
            ],
          },
          {
            id: 'lesson-4-2',
            title: 'র-ফলা যুক্তাক্ষর: ক্র, গ্র, প্র, ব্র, ত্র',
            subtitle: 'গ্রাম, প্রথম, ব্রত, ছাত্র ইত্যাদি শব্দ',
            level: 4,
            moduleId: 'mod-4-1',
            moduleTitle: 'ত-বর্গ ও ন-বর্গের যুক্তাক্ষর',
            description: 'ব্যঞ্জনবর্ণ + হসন্ত + র = র-ফলা যুক্তাক্ষর।',
            skills: ['conjunct-r-fola'],
            prerequisites: ['lesson-4-1'],
            estimatedMinutes: 5,
            difficulty: 4,
            sections: [
              {
                id: 'sec-4-2-1',
                type: 'pattern',
                title: 'র-ফলা প্যাটার্ন',
                items: ['ক্র', 'গ্র', 'প্র', 'ব্র', 'ত্র', 'দ্র', 'শ্র'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-4-2-2',
                type: 'word',
                title: 'র-ফলা শব্দ ড্রিল',
                items: ['গ্রাম', 'প্রথম', 'ব্রত', 'ছাত্র', 'দ্রুত', 'শ্রম', 'ক্রিকেট', 'প্রকৃতি'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-4-2-3',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা',
                items: ['গ্রাম', 'প্রথম', 'ছাত্র', 'প্রকৃতি', 'ক্র', 'গ্র', 'প্র', 'ত্র'],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 5: কঠিন যুক্তাক্ষর (COMPLEX CONJUNCTS) ────────────────
  {
    level: 5,
    title: 'জটিল ও বিশেষ যুক্তাক্ষর (Complex Conjuncts)',
    tagline: 'ক্ষ, জ্ঞ, হ্ম, চ্ছ, ষ্ক, ষ্ঠ, ন্ত্র, ক্ষ্ম ইত্যাদি জটিল বর্ণ',
    description: 'বাংলা ভাষার সবচেয়ে চ্যালেঞ্জিং যুক্তাক্ষরগুলো ধাপে ধাপে আয়ত্ত করুন।',
    badge: '🔥',
    modules: [
      {
        id: 'mod-5-1',
        level: 5,
        title: 'ক্ষ ও জ্ঞ বিশেষ রূপ',
        description: 'ক্ষ (ক+ষ বা q) এবং জ্ঞ (জ+ঞ) এর পূর্ণাঙ্গ পাঠ',
        lessons: [
          {
            id: 'lesson-5-1',
            title: 'ক্ষ এবং জ্ঞ',
            subtitle: 'শিক্ষা, পরীক্ষা, জ্ঞান, বিজ্ঞান ইত্যাদি শব্দ',
            level: 5,
            moduleId: 'mod-5-1',
            moduleTitle: 'ক্ষ ও জ্ঞ বিশেষ রূপ',
            description: 'ক্ষ ও জ্ঞ টাইপিংয়ের সঠিক কৌশল ও ভুল সংশোধনের নিয়ম।',
            skills: ['conjunct-ksha', 'conjunct-gya'],
            prerequisites: ['lesson-4-2'],
            estimatedMinutes: 6,
            difficulty: 6,
            sections: [
              {
                id: 'sec-5-1-1',
                type: 'explanation',
                title: 'ক্ষ এবং জ্ঞ টাইপ করার নিয়ম',
                instruction: 'BanglaWord-এ "ক্ষ" সরাসরি "q" কি দিয়ে অথবা "ক + ্ + ষ" দিয়ে টাইপ করা যায়। "জ্ঞ" টাইপ করতে "জ + ্ + Shift+\\" (জ + হসন্ত + ঞ) চাপুন।',
              },
              {
                id: 'sec-5-1-2',
                type: 'pattern',
                title: 'ক্ষ ও জ্ঞ ড্রিল',
                items: ['ক্ষ', 'জ্ঞ', 'ক্ষা', 'জ্ঞা', 'ক্ষি', 'জ্ঞি', 'ক্ষু', 'জ্ঞু'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-5-1-3',
                type: 'word',
                title: 'শব্দ ড্রিল',
                items: ['শিক্ষা', 'পরীক্ষা', 'জ্ঞান', 'বিজ্ঞান', 'অজ্ঞাত', 'ক্ষমা', 'রক্ষা', 'বিজ্ঞানী'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-5-1-4',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা — ক্ষ ও জ্ঞ',
                items: ['বিজ্ঞান', 'পরীক্ষা', 'শিক্ষা', 'জ্ঞান', 'ক্ষ', 'জ্ঞ', 'ক্ষমা', 'রক্ষা'],
                requiredAccuracy: 97,
              },
            ],
          },
          {
            id: 'lesson-5-2',
            title: 'হ্ম, ক্ষ্ম, ন্ত্র, ষ্ঠ, ষ্ক',
            subtitle: 'ব্রাহ্মণ, সূক্ষ্ম, যন্ত্র, শ্রেষ্ঠ ইত্যাদি জটিল শব্দ',
            level: 5,
            moduleId: 'mod-5-1',
            moduleTitle: 'ক্ষ ও জ্ঞ বিশেষ রূপ',
            description: 'ত্রি-ব্যঞ্জন যুক্তাক্ষর ও হ-সংক্রান্ত জটিল যুক্তবর্ণ।',
            skills: ['conjunct-hma', 'conjunct-ntra', 'conjunct-shtha'],
            prerequisites: ['lesson-5-1'],
            estimatedMinutes: 6,
            difficulty: 7,
            sections: [
              {
                id: 'sec-5-2-1',
                type: 'pattern',
                title: 'জটিল যুক্তবর্ণ প্যাটার্ন',
                items: ['হ্ম', 'ক্ষ্ম', 'ন্ত্র', 'ষ্ঠ', 'ষ্ক', 'ষ্ট্র', 'চ্ছ'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-5-2-2',
                type: 'word',
                title: 'জটিল শব্দ ড্রিল',
                items: ['ব্রাহ্মণ', 'সূক্ষ্ম', 'যন্ত্র', 'শ্রেষ্ঠ', 'রাষ্ট্র', 'ইচ্ছা', 'স্বাস্থ্য', 'অস্ট্রেলিয়া'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-5-2-3',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা — জটিল যুক্তাক্ষর',
                items: ['স্বাস্থ্য', 'রাষ্ট্র', 'শ্রেষ্ঠ', 'যন্ত্র', 'ব্রাহ্মণ', 'সূক্ষ্ম', 'হ্ম', 'ন্ত্র'],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 6: বিশেষ চিহ্ন (SPECIAL SIGNS) ─────────────────────────
  {
    level: 6,
    title: 'বিশেষ চিহ্ন ও বর্ণ (Special Signs)',
    tagline: 'ঁ, ং, ঃ, ড়, ঢ়, য়, ৎ এর সঠিক প্রয়োগ',
    description: 'চন্দ্রবিন্দু, অনুস্বার, বিসর্গ, খণ্ড-ত এবং ড়-ঢ়-য় এর যথাযথ ব্যবহার।',
    badge: '✨',
    modules: [
      {
        id: 'mod-6-1',
        level: 6,
        title: 'বিশেষ চিহ্নের অনুশীলন',
        description: 'চাঁদ, রং, দুঃখ, উৎসব ইত্যাদি শব্দের সঠিক টাইপিং',
        lessons: [
          {
            id: 'lesson-6-1',
            title: 'চন্দ্রবিন্দু, অনুস্বার, বিসর্গ ও খণ্ড-ত',
            subtitle: 'চাঁদ, সিংহ, দুঃখ, উৎসব ইত্যাদি',
            level: 6,
            moduleId: 'mod-6-1',
            moduleTitle: 'বিশেষ চিহ্নের অনুশীলন',
            description: 'ঁ (Shift+Q), ং (Shift+Z), ঃ (Shift+W), ৎ (Shift+F) এর নিয়ম।',
            skills: ['sign-chandrabindu', 'sign-anusvara', 'sign-visarga', 'sign-khandata'],
            prerequisites: ['lesson-5-2'],
            estimatedMinutes: 4,
            difficulty: 4,
            sections: [
              {
                id: 'sec-6-1-1',
                type: 'pattern',
                title: 'চিহ্ন প্যাটার্ন ড্রিল',
                items: ['কাঁ', 'চাঁ', 'রং', 'সং', 'দুঃ', 'উৎ', 'হঠাৎ'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-6-1-2',
                type: 'word',
                title: 'চিহ্নযুক্ত শব্দ ড্রিল',
                items: ['চাঁদ', 'হাঁস', 'রংধনু', 'সিংহ', 'দুঃখ', 'উৎসব', 'হঠাৎ', 'বিদ্যুৎ', 'বাংলা'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-6-1-3',
                type: 'mastery',
                title: 'মাস্টারি পরীক্ষা',
                items: ['চাঁদ', 'সিংহ', 'দুঃখ', 'উৎসব', 'বিদ্যুৎ', 'বাংলা', 'হঠাৎ', 'রংধনু'],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 7: শব্দ ভাণ্ডার (FREQUENT WORDS) ───────────────────────
  {
    level: 7,
    title: 'শব্দ ভাণ্ডার (Frequent Bengali Words)',
    tagline: 'বাস্তব জীবনে সর্বাধিক ব্যবহৃত ১০০+ বাংলা শব্দ',
    description: 'দৈনন্দিন জীবনে সবচেয়ে বেশি ব্যবহৃত বাংলা শব্দগুলোর ফ্লুয়েন্ট টাইপিং আয়ত্ত করুন।',
    badge: '📚',
    modules: [
      {
        id: 'mod-7-1',
        level: 7,
        title: 'বহুল ব্যবহৃত বাংলা শব্দ',
        description: 'সহজ থেকে মাঝারি ও দীর্ঘ শব্দের স্পিড প্র্যাকটিস',
        lessons: [
          {
            id: 'lesson-7-1',
            title: 'দৈনন্দিন সেরা ৫০ শব্দ',
            subtitle: 'মানুষ, বাংলাদেশ, পরিবার, বিদ্যালয় ইত্যাদি',
            level: 7,
            moduleId: 'mod-7-1',
            moduleTitle: 'বহুল ব্যবহৃত বাংলা শব্দ',
            description: 'সর্বোচ্চ ব্যবহৃত বাংলা শব্দের দ্রুত ও নির্ভুল টাইপিং।',
            skills: ['frequent-words-1'],
            prerequisites: ['lesson-6-1'],
            estimatedMinutes: 5,
            difficulty: 5,
            sections: [
              {
                id: 'sec-7-1-1',
                type: 'word',
                title: 'সাধারণ শব্দ ড্রিল ১',
                items: ['আমি', 'তুমি', 'সে', 'আমরা', 'তারা', 'বাংলা', 'দেশ', 'মানুষ', 'জীবন', 'সময়'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-7-1-2',
                type: 'word',
                title: 'সাধারণ শব্দ ড্রিল ২',
                items: ['বাংলাদেশ', 'পরিবার', 'বিদ্যালয়', 'শিক্ষা', 'প্রযুক্তি', 'স্বাধীনতা', 'ইতিহাস', 'সংস্কৃতি'],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-7-1-3',
                type: 'mastery',
                title: 'মাস্টারি টেস্ট — শব্দ ভাণ্ডার',
                items: ['বাংলাদেশ', 'প্রযুক্তি', 'স্বাধীনতা', 'বিদ্যালয়', 'পরিবার', 'সংস্কৃতি', 'মানুষ', 'জীবন'],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 8: বাক্য গঠন (SENTENCES) ──────────────────────────────
  {
    level: 8,
    title: 'বাক্য গঠন ও বিরামচিহ্ন (Sentences & Punctuation)',
    tagline: 'দাঁড়ি (।), কমা (,), উদ্ধৃতি ও সংখ্যাসহ পূর্ণ বাক্য টাইপিং',
    description: 'ছোট, যৌগিক ও জটিল বাক্য বিরামচিহ্ন ও সংখ্যাসহ দ্রুত টাইপ করার কৌশল।',
    badge: '📝',
    modules: [
      {
        id: 'mod-8-1',
        level: 8,
        title: 'পূর্ণ বাক্য ও বিরামচিহ্ন',
        description: 'দাঁড়ি ও কমাসহ বিভিন্ন ধরনের বাক্য',
        lessons: [
          {
            id: 'lesson-8-1',
            title: 'সরল ও যৌগিক বাক্য',
            subtitle: 'বিরামচিহ্ন ও পূর্ণাঙ্গ বাক্যের গতি',
            level: 8,
            moduleId: 'mod-8-1',
            moduleTitle: 'পূর্ণ বাক্য ও বিরামচিহ্ন',
            description: 'দাঁড়ি (Period / .) এবং কমা সহযোগে স্বাভাবিক বাক্য টাইপিং।',
            skills: ['sentences-basic', 'punctuation-dandari'],
            prerequisites: ['lesson-7-1'],
            estimatedMinutes: 6,
            difficulty: 5,
            sections: [
              {
                id: 'sec-8-1-1',
                type: 'word',
                title: 'ছোট বাক্য ড্রিল',
                items: [
                  'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।',
                  'পরিশ্রম সৌভাগ্যের প্রসূতি।',
                  'শিক্ষা জাতির মেরুদণ্ড।',
                  'সততা সর্বোৎকৃষ্ট পন্থা।',
                ],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-8-1-2',
                type: 'mastery',
                title: 'বাক্য মাস্টারি পরীক্ষা',
                items: [
                  'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।',
                  'শিক্ষা জাতির মেরুদণ্ড এবং জ্ঞানই শক্তি।',
                  'নিয়মিত অনুশীলন টাইপিং গতি বাড়িয়ে দেয়।',
                ],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 9: বিষয়ভিত্তিক অনুচ্ছেদ (PARAGRAPHS) ────────────────────
  {
    level: 9,
    title: 'বিষয়ভিত্তিক অনুচ্ছেদ (Themed Paragraphs)',
    tagline: 'সংবাদ, সাহিত্য, বিজ্ঞান, প্রযুক্তি ও সাধারণ অনুচ্ছেদ',
    description: 'বাস্তব জীবনের বিভিন্ন বিষয়ের ওপর বড় অনুচ্ছেদ একটানা টাইপ করার স্ট্যামিনা অর্জন।',
    badge: '📰',
    modules: [
      {
        id: 'mod-9-1',
        level: 9,
        title: 'সাহিত্য ও প্রযুক্তির অনুচ্ছেদ',
        description: 'বিভিন্ন বিষয়ভিত্তিক অনুচ্ছেদ অনুশীলন',
        lessons: [
          {
            id: 'lesson-9-1',
            title: 'প্রযুক্তি ও সাহিত্য অনুচ্ছেদ',
            subtitle: 'একটানা অনুচ্ছেদ টাইপিং',
            level: 9,
            moduleId: 'mod-9-1',
            moduleTitle: 'সাহিত্য ও প্রযুক্তির অনুচ্ছেদ',
            description: 'বড় অনুচ্ছেদে টাইপিং স্পিড ও নির্ভুলতা ধরে রাখা।',
            skills: ['paragraph-tech', 'paragraph-literature'],
            prerequisites: ['lesson-8-1'],
            estimatedMinutes: 8,
            difficulty: 6,
            sections: [
              {
                id: 'sec-9-1-1',
                type: 'word',
                title: 'প্রযুক্তি অনুচ্ছেদ',
                items: [
                  'আধুনিক তথ্যপ্রযুক্তির যুগে কম্পিউটার ও ইন্টারনেটের ভূমিকা অপরিসীম। বাংলা ভাষায় দ্রুত ও নির্ভুল টাইপিং দক্ষতা ক্যারিয়ারে নতুন দিগন্ত উন্মোচন করে।',
                ],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-9-1-2',
                type: 'mastery',
                title: 'অনুচ্ছেদ মাস্টারি পরীক্ষা',
                items: [
                  'মাতৃভাষায় চিন্তা করা ও তা ডিজিটাল মাধ্যমে প্রকাশ করার আনন্দ অতুলনীয়। নিয়মিত টাইপিং অনুশীলনের মাধ্যমে আমরা প্রত্যেকেই দক্ষ হয়ে উঠতে পারি।',
                ],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 10: বাস্তব জীবনের লেখা (REAL-WORLD TYPING) ─────────────
  {
    level: 10,
    title: 'বাস্তব জীবনের লেখা (Real-World Typing)',
    tagline: 'চ্যাট, ইমেইল, দরখাস্ত, অফিসিয়াল নথি ও আবেদনপত্র',
    description: 'অফিস, আদালত, শিক্ষাপ্রতিষ্ঠান ও পেশাগত ক্ষেত্রে ব্যবহৃত আসল লেখার ফরম্যাট।',
    badge: '💼',
    modules: [
      {
        id: 'mod-10-1',
        level: 10,
        title: 'অফিসিয়াল ও প্রফেশনাল ড্রাফট',
        description: 'দরখাস্ত ও আনুষ্ঠানিক চিঠি টাইপিং',
        lessons: [
          {
            id: 'lesson-10-1',
            title: 'ছুটির আবেদন ও আনুষ্ঠানিক চিঠি',
            subtitle: 'বরাবর, বিষয় ও বিনীত ফরম্যাট',
            level: 10,
            moduleId: 'mod-10-1',
            moduleTitle: 'অফিসিয়াল ও প্রফেশনাল ড্রাফট',
            description: 'পেশাগত জীবনের আসল চিঠি ও ইমেইল ফরম্যাট টাইপ করার অভিজ্ঞতা।',
            skills: ['real-world-application'],
            prerequisites: ['lesson-9-1'],
            estimatedMinutes: 8,
            difficulty: 7,
            sections: [
              {
                id: 'sec-10-1-1',
                type: 'word',
                title: 'আবেদনপত্র ড্রিল',
                items: [
                  'বরাবর, মহাব্যবস্থাপক, বিষয়: ছুটির জন্য আবেদন। বিনীত নিবেদন এই যে, অসুস্থতার কারণে আমি আগামী তিন দিন উপস্থিত থাকতে পারছি না। অতএব প্রার্থনা, আমাকে ছুটি দানে বাধিত করবেন।',
                ],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-10-1-2',
                type: 'mastery',
                title: 'অফিসিয়াল ডকুমেন্ট মাস্টারি',
                items: [
                  'গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের ডিজিটাল রূপান্তরের অংশ হিসেবে সকল দাপ্তরিক কাজে বাংলা টাইপিংয়ের সঠিক প্রয়োগ নিশ্চিত করা অত্যাবশ্যকীয়।',
                ],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 11: গতি প্রশিক্ষণ (SPEED & PRECISION TRAINING) ─────────
  {
    level: 11,
    title: 'গতি ও নির্ভুলতা প্রশিক্ষণ (Speed Training)',
    tagline: 'উচ্চ গতি ও ১০০% নির্ভুলতার চরম লক্ষ্য',
    description: 'মাস্টার করা স্কিলগুলো দিয়ে ৪০+ WPM ও ২০০+ GPM অর্জনের জন্য স্পিড স্প্রিন্ট।',
    badge: '⚡',
    modules: [
      {
        id: 'mod-11-1',
        level: 11,
        title: 'হাই স্পিড স্প্রিন্ট',
        description: 'দ্রুত টাইপিং রিদম ও বার্স্ট স্পিড অনুশীলন',
        lessons: [
          {
            id: 'lesson-11-1',
            title: '৪০+ WPM স্পিড চ্যালেঞ্জ',
            subtitle: 'উচ্চ গতির জন্য ফাস্ট প্যাসেজ',
            level: 11,
            moduleId: 'mod-11-1',
            moduleTitle: 'হাই স্পিড স্প্রিন্ট',
            description: 'কম সময়ের মধ্যে সর্বোচ্চ গতি ও ধারাবাহিকতা বজায় রাখার চ্যালেঞ্জ।',
            skills: ['speed-sprint', 'burst-speed'],
            prerequisites: ['lesson-10-1'],
            estimatedMinutes: 5,
            difficulty: 8,
            sections: [
              {
                id: 'sec-11-1-1',
                type: 'word',
                title: 'স্পিড স্প্রিন্ট',
                items: [
                  'বাংলা আমাদের অহংকার এবং মাতৃভাষা। দ্রুত নির্ভুল টাইপিং দক্ষতা আপনার সময় বাঁচায় ও কর্মক্ষমতা বহুগুণ বাড়িয়ে দেয়।',
                ],
                requiredAccuracy: 95,
              },
              {
                id: 'sec-11-1-2',
                type: 'mastery',
                title: 'স্পিড মাস্টারি টেস্ট',
                items: [
                  'সততা, নিষ্ঠা ও নিয়মিত অনুশীলনের মাধ্যমেই যেকোনো কঠিন দক্ষতায় পারদর্শী হওয়া সম্ভব। টাইপিংয়ে আত্মবিশ্বাসই সাফল্যের মূল চাবিকাঠি।',
                ],
                requiredAccuracy: 97,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── LEVEL 12: পরীক্ষা সিমুলেশন (EXAM SIMULATION) ────────────────
  {
    level: 12,
    title: 'সরকারি ও চাকরির পরীক্ষা সিমুলেশন (Exam Simulation)',
    tagline: 'স্ট্রিক্ট টাইমার, নো পজ, নো হিন্ট ও অফিসিয়াল গ্রেডিং',
    description: 'সরকারি ও বেসরকারি চাকরির নিয়োগ পরীক্ষার হুবহু পরিবেশে পূর্ণাঙ্গ মূল্যায়ন ও সার্টিফিকেট অর্জন।',
    badge: '🎓',
    modules: [
      {
        id: 'mod-12-1',
        level: 12,
        title: 'স্ট্রিক্ট এক্সাম মোড',
        description: 'অফিসিয়াল নিয়োগ পরীক্ষার আদলে ৫ মিনিটের চূড়ান্ত টেস্ট',
        lessons: [
          {
            id: 'lesson-12-1',
            title: 'চূড়ান্ত দক্ষতা পরীক্ষা (Final Certification Exam)',
            subtitle: '৫ মিনিটের পূর্ণাঙ্গ নিয়োগ পরীক্ষা',
            level: 12,
            moduleId: 'mod-12-1',
            moduleTitle: 'স্ট্রিক্ট এক্সাম মোড',
            description: 'কোনো সাহায্য ছাড়া আসল পরীক্ষার প্যাসেজ টাইপ করে অফিসিয়াল ভেরিফায়েড সার্টিফিকেট অর্জন করুন।',
            skills: ['exam-simulation'],
            prerequisites: ['lesson-11-1'],
            estimatedMinutes: 5,
            difficulty: 9,
            sections: [
              {
                id: 'sec-12-1-1',
                type: 'mastery',
                title: 'চূড়ান্ত নিয়োগ পরীক্ষা',
                instruction: 'কোনো বিরতি ছাড়াই পুরো প্যাসেজটি টাইপ করুন। সর্বনিম্ন ৯৫% নির্ভুলতা ও ৩০ WPM গতি প্রয়োজন।',
                items: [
                  'ডিজিটাল বাংলাদেশ বিনির্মাণে বাংলা ভাষার সঠিক ব্যবহার ও ডিজিটাইজেশন একটি তাৎপর্যপূর্ণ পদক্ষেপ। বর্তমান যুগে প্রতিটি সরকারি ও বেসরকারি প্রতিষ্ঠানে দক্ষ বাংলা টাইপিস্টদের চাহিদা উত্তরোত্তর বৃদ্ধি পাচ্ছে। যারা নির্ভুল ও দ্রুত গতিতে টাইপ করতে পারেন, তারা দাপ্তরিক কাজে দ্রুত ফলাফল অর্জন করেন। নিয়মিত অনুশীলন, ধৈর্য এবং সঠিক কীবোর্ড লেআউট অনুসরণের মাধ্যমে প্রত্যেকেই বাংলা টাইপিংয়ে অসাধারণ দক্ষতা অর্জন করতে পারে।',
                ],
                requiredAccuracy: 95,
              },
            ],
          },
        ],
      },
    ],
  },
];

/** Helper: Find lesson by ID across all levels */
export function getCurriculumLessonById(lessonId: string): CurriculumLesson | undefined {
  for (const lvl of CURRICULUM_LEVELS) {
    for (const mod of lvl.modules) {
      for (const les of mod.lessons) {
        if (les.id === lessonId) return les;
      }
    }
  }
  return undefined;
}

/** Helper: Get all lessons in linear order */
export function getAllCurriculumLessons(): CurriculumLesson[] {
  const all: CurriculumLesson[] = [];
  for (const lvl of CURRICULUM_LEVELS) {
    for (const mod of lvl.modules) {
      for (const les of mod.lessons) {
        all.push(les);
      }
    }
  }
  return all;
}
