import type { CurriculumLevel } from "./types";

/**
 * Stub content for advanced levels 13–15. Same CurriculumLevel shape as
 * CURRICULUM_LEVELS in curriculum-data.ts; concatenated at runtime below.
 */
export const ADVANCED_CURRICULUM_LEVELS: CurriculumLevel[] = [
  {
    level: 13,
    title: "বাস্তব নথি (Real Documents)",
    tagline: "অফিস নথি, চিঠি ও প্রতিবেদন টাইপিং",
    description: "বাস্তব দাপ্তরিক নথি, আবেদনপত্র ও প্রতিবেদনের নির্ভুল টাইপিং অনুশীলন।",
    badge: "📄",
    modules: [
      {
        id: "mod-13-1",
        level: 13,
        title: "দাপ্তরিক নথি",
        description: "অফিস আদেশ, বিজ্ঞপ্তি ও স্মারকের টাইপিং",
        lessons: [
          {
            id: "lesson-13-1",
            title: "অফিস আদেশ টাইপিং",
            subtitle: "প্রজ্ঞাপন ও আদেশের নির্ভুল রূপ",
            level: 13,
            moduleId: "mod-13-1",
            moduleTitle: "দাপ্তরিক নথি",
            description: "সরকারি অফিস আদেশের ভাষা ও কাঠামোতে টাইপিং অনুশীলন।",
            skills: ["official-documents"],
            prerequisites: ["lesson-12-2"],
            estimatedMinutes: 6,
            difficulty: 7,
            sections: [
              {
                id: "sec-13-1-1",
                type: "word",
                title: "অফিস আদেশ অনুচ্ছেদ",
                items: [
                  "গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের সংশ্লিষ্ট মন্ত্রণালয়ের স্মারক নম্বর অনুযায়ী আগামী সোমবার সকাল দশটায় সভা অনুষ্ঠিত হবে।",
                  "উক্ত সভায় সকল শাখা প্রধানকে যথাসময়ে উপস্থিত থাকার জন্য নির্দেশক্রমে অনুরোধ করা হলো।",
                ],
                requiredAccuracy: 95,
              },
              {
                id: "sec-13-1-2",
                type: "mastery",
                title: "নথি মাস্টারি টেস্ট",
                items: [
                  "অফিস আদেশ যথাযথভাবে টাইপ করে নির্ধারিত সময়ের মধ্যে সংশ্লিষ্ট শাখায় প্রেরণ করতে হবে।",
                  "ভুল সংশোধন করে চূড়ান্ত খসড়া অনুমোদনের জন্য উপস্থাপন করুন।",
                ],
                requiredAccuracy: 96,
              },
            ],
          },
          {
            id: "lesson-13-2",
            title: "আবেদনপত্র ও প্রতিবেদন",
            subtitle: "আনুষ্ঠানিক চিঠি ও সংক্ষিপ্ত প্রতিবেদন",
            level: 13,
            moduleId: "mod-13-1",
            moduleTitle: "দাপ্তরিক নথি",
            description: "চাকরির আবেদন, ছুটির দরখাস্ত ও মাসিক প্রতিবেদন টাইপিং।",
            skills: ["letters-reports"],
            prerequisites: ["lesson-13-1"],
            estimatedMinutes: 6,
            difficulty: 7,
            sections: [
              {
                id: "sec-13-2-1",
                type: "word",
                title: "আবেদনপত্র অনুশীলন",
                items: [
                  "বিনীত নিবেদন এই যে, আমি আগামী তিনদিনের নৈমিত্তিক ছুটির জন্য আবেদন করছি।",
                  "মাসিক অগ্রগতি প্রতিবেদনে নির্ধারিত লক্ষ্যমাত্রার তুলনায় অর্জনের চিত্র তুলে ধরা হলো।",
                ],
                requiredAccuracy: 95,
              },
              {
                id: "sec-13-2-2",
                type: "mastery",
                title: "চিঠি মাস্টারি টেস্ট",
                items: [
                  "যথাযথ সম্মান প্রদর্শনপূর্বক আপনার সদয় অবগতি ও প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য প্রেরণ করা হলো।",
                  "প্রতিবেদনের প্রতিটি অনুচ্ছেদে সঠিক সংখ্যা ও তারিখ ব্যবহার নিশ্চিত করুন।",
                ],
                requiredAccuracy: 96,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 14,
    title: "সৃজনশীল (Creative Writing)",
    tagline: "গল্প, প্রবন্ধ ও সাহিত্য টাইপিং",
    description: "সৃজনশীল রচনা, গল্প ও প্রবন্ধ দ্রুত ও প্রাণবন্তভাবে টাইপ করা।",
    badge: "✍️",
    modules: [
      {
        id: "mod-14-1",
        level: 14,
        title: "সাহিত্য ও প্রবন্ধ",
        description: "গল্পাংশ ও প্রবন্ধের দীর্ঘ অনুচ্ছেদ টাইপিং",
        lessons: [
          {
            id: "lesson-14-1",
            title: "ছোটগল্প টাইপিং",
            subtitle: "কথাসাহিত্যের গতিময় অনুশীলন",
            level: 14,
            moduleId: "mod-14-1",
            moduleTitle: "সাহিত্য ও প্রবন্ধ",
            description: "ছোটগল্পের সংলাপ ও বর্ণনায় টাইপিংয়ের ছন্দ ধরে রাখা।",
            skills: ["creative-fiction"],
            prerequisites: ["lesson-13-2"],
            estimatedMinutes: 7,
            difficulty: 8,
            sections: [
              {
                id: "sec-14-1-1",
                type: "word",
                title: "গল্পাংশ",
                items: [
                  "বর্ষার সন্ধ্যায় গ্রামের মেঠোপথে হাঁটতে হাঁটতে রবিনের মনে পড়ল দাদির বলা সেই পুরনো গল্প।",
                  "“ভয় পেয়ো না,” দাদি বলতেন, “অন্ধকার পেরোলেই আলোর দেখা মেলে।”",
                ],
                requiredAccuracy: 94,
              },
              {
                id: "sec-14-1-2",
                type: "mastery",
                title: "গল্প মাস্টারি টেস্ট",
                items: [
                  "ঝমঝম বৃষ্টির শব্দে ঘুম ভাঙল মিতুর; জানালার ওপাশে কদমফুলের গন্ধ ভেসে আসছে।",
                  "সে ডায়েরি খুলে লিখতে বসল আজকের দিনের সব কথা।",
                ],
                requiredAccuracy: 95,
              },
            ],
          },
          {
            id: "lesson-14-2",
            title: "প্রবন্ধ রচনা টাইপিং",
            subtitle: "ভাবগম্ভীর প্রবন্ধের দীর্ঘ অনুচ্ছেদ",
            level: 14,
            moduleId: "mod-14-1",
            moduleTitle: "সাহিত্য ও প্রবন্ধ",
            description: "প্রবন্ধের যুক্তিনির্ভর দীর্ঘ বাক্যে গতি ও মনোযোগের অনুশীলন।",
            skills: ["creative-essay"],
            prerequisites: ["lesson-14-1"],
            estimatedMinutes: 7,
            difficulty: 8,
            sections: [
              {
                id: "sec-14-2-1",
                type: "word",
                title: "প্রবন্ধাংশ",
                items: [
                  "বই মানুষের নীরব বন্ধু; একাকিত্বের মুহূর্তে বইয়ের পাতায় পাঠক খুঁজে পায় নতুন জগৎ।",
                  "নিয়মিত পাঠাভ্যাস চিন্তার গভীরতা বাড়ায় এবং ভাষার ওপর দখল শক্ত করে।",
                ],
                requiredAccuracy: 94,
              },
              {
                id: "sec-14-2-2",
                type: "mastery",
                title: "প্রবন্ধ মাস্টারি টেস্ট",
                items: [
                  "সাহিত্য সমাজের দর্পণ; যুগের আশা-আকাঙ্ক্ষা ও সংকট সাহিত্যের পাতায় প্রতিফলিত হয়।",
                  "তাই তরুণ প্রজন্মের মধ্যে সাহিত্যচর্চা ছড়িয়ে দেওয়া সময়ের দাবি।",
                ],
                requiredAccuracy: 95,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 15,
    title: "টেকনিক্যাল (Technical)",
    tagline: "প্রযুক্তি, সংখ্যা ও মিশ্র ডেটা টাইপিং",
    description: "প্রযুক্তিগত নথি, ইংরেজি-বাংলা মিশ্র পাঠ ও সংখ্যাযুক্ত ডেটার দ্রুত টাইপিং।",
    badge: "💻",
    modules: [
      {
        id: "mod-15-1",
        level: 15,
        title: "প্রযুক্তি ও ডেটা",
        description: "টেকনিক্যাল শব্দ, সংখ্যা ও মিশ্র কনটেন্ট",
        lessons: [
          {
            id: "lesson-15-1",
            title: "প্রযুক্তি সংবাদ টাইপিং",
            subtitle: "ইংরেজি পরিভাষাসহ মিশ্র পাঠ",
            level: 15,
            moduleId: "mod-15-1",
            moduleTitle: "প্রযুক্তি ও ডেটা",
            description: "কম্পিউটার, ইন্টারনেট ও সফটওয়্যার বিষয়ক মিশ্র ভাষার টাইপিং।",
            skills: ["technical-terms"],
            prerequisites: ["lesson-14-2"],
            estimatedMinutes: 6,
            difficulty: 9,
            sections: [
              {
                id: "sec-15-1-1",
                type: "word",
                title: "টেক অনুচ্ছেদ",
                items: [
                  "নতুন সফটওয়্যার আপডেটে কৃত্রিম বুদ্ধিমত্তা বা Artificial Intelligence-এর গতি ৪০ শতাংশ বেড়েছে।",
                  "কম্পিউটারে বাংলা Unicode ফন্ট কনফিগার করতে ৩টি ধাপ অনুসরণ করুন।",
                ],
                requiredAccuracy: 94,
              },
              {
                id: "sec-15-1-2",
                type: "mastery",
                title: "টেক মাস্টারি টেস্ট",
                items: [
                  "ডেটাবেজ ব্যাকআপ প্রতি রাতে ২টায় স্বয়ংক্রিয়ভাবে সার্ভারে সংরক্ষিত হয়।",
                  "পাসওয়ার্ড কমপক্ষে ১২ অক্ষরের হতে হবে এবং তাতে সংখ্যা ও চিহ্ন থাকবে।",
                ],
                requiredAccuracy: 95,
              },
            ],
          },
          {
            id: "lesson-15-2",
            title: "ডেটা এন্ট্রি স্প্রিন্ট",
            subtitle: "সংখ্যা, তারিখ ও টেবিল ডেটা",
            level: 15,
            moduleId: "mod-15-1",
            moduleTitle: "প্রযুক্তি ও ডেটা",
            description: "দ্রুত ও নির্ভুল সংখ্যা-তারিখ-ঠিকানাযুক্ত ডেটা এন্ট্রি।",
            skills: ["data-sprint"],
            prerequisites: ["lesson-15-1"],
            estimatedMinutes: 6,
            difficulty: 9,
            sections: [
              {
                id: "sec-15-2-1",
                type: "word",
                title: "ডেটা সারি",
                items: [
                  "নাম: শারমিন আক্তার, আইডি: ২০২৬-০৪৮১, ফোন: ০১৮১৯-২৩৪৫৬৭।",
                  "তারিখ: ১৫/১০/২০২৬, পরিমাণ: ১,২৫,০০০ টাকা, চালান নং: INV-9921।",
                ],
                requiredAccuracy: 95,
              },
              {
                id: "sec-15-2-2",
                type: "mastery",
                title: "ডেটা মাস্টারি টেস্ট",
                items: [
                  "ঢাকা-১২১২, বাড়ি-৭, রোড-৩; মোট ৩৪৫টি ফর্মের মধ্যে ৩৩৯টি যাচাই সম্পন্ন।",
                  "ইমেইল: info@example.com, ওয়েবসাইট: www.example.com, হটলাইন: ১৬২৪৭।",
                ],
                requiredAccuracy: 96,
              },
            ],
          },
        ],
      },
    ],
  },
];

export default ADVANCED_CURRICULUM_LEVELS;
