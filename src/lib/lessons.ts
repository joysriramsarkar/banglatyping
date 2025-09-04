import type { Lesson } from "./types";

const keyMap = [
    // Top Row
    {key: 'q', bn: 'ক্ষ', bnShift: 'ঁ', row: 'top', hand: 'left'}, {key: 'w', bn: 'ঙ', bnShift: 'ঃ', row: 'top', hand: 'left'}, {key: 'e', bn: 'ে', bnShift: 'ৈ', row: 'top', hand: 'left'}, {key: 'r', bn: 'র', bnShift: 'ড়', row: 'top', hand: 'left'}, {key: 't', bn: 'ট', bnShift: 'ঠ', row: 'top', hand: 'left'}, 
    {key: 'y', bn: 'য', bnShift: 'য়', row: 'top', hand: 'right'}, {key: 'u', bn: 'ু', bnShift: 'ূ', row: 'top', hand: 'right'}, {key: 'i', bn: 'ি', bnShift: 'ী', row: 'top', hand: 'right'}, {key: 'o', bn: 'ো', bnShift: 'ৌ', row: 'top', hand: 'right'}, {key: 'p', bn: 'প', bnShift: 'ঢ়', row: 'top', hand: 'right'},
    // Home Row
    {key: 'a', bn: 'া', bnShift: 'অ', row: 'home', hand: 'left'}, {key: 's', bn: 'স', bnShift: 'শ', row: 'home', hand: 'left'}, {key: 'd', bn: 'ড', bnShift: 'ঢ', row: 'home', hand: 'left'}, {key: 'f', bn: 'ফ', bnShift: 'ৎ', row: 'home', hand: 'left'}, {key: 'g', bn: 'গ', bnShift: 'ঘ', row: 'home', hand: 'left'},
    {key: 'h', bn: '্', bnShift: 'হ', row: 'home', hand: 'right'}, {key: 'j', bn: 'জ', bnShift: 'ঝ', row: 'home', hand: 'right'}, {key: 'k', bn: 'ক', bnShift: 'খ', row: 'home', hand: 'right'}, {key: 'l', bn: 'ল', bnShift: 'ষ', row: 'home', hand: 'right'},
    // Bottom Row
    {key: 'z', bn: '্য', bnShift: 'ং', row: 'bottom', hand: 'left'}, {key: 'x', bn: 'ত', bnShift: 'থ', row: 'bottom', hand: 'left'}, {key: 'c', bn: 'চ', bnShift: 'ছ', row: 'bottom', hand: 'left'}, {key: 'v', bn: 'দ', bnShift: 'ধ', row: 'bottom', hand: 'left'}, {key: 'b', bn: 'ব', bnShift: 'ভ', row: 'bottom', hand: 'left'},
    {key: 'n', bn: 'ন', bnShift: 'ণ', row: 'bottom', hand: 'right'}, {key: 'm', bn: 'ম', row: 'bottom', hand: 'right'}, {key: ',', bn: 'ৃ', bnShift: 'ঞ', row: 'bottom', hand: 'right'},
];

const generateDrills = (chars: string[], count: number): {prompt: string, key: string, shift?: boolean}[] => {
    const drills: {prompt: string, key: string, shift?: boolean}[] = [];

    for (let i = 0; i < count; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const mapping = keyMap.find(k => k.bn === char || k.bnShift === char);
        if(mapping) {
            drills.push({
                prompt: char,
                key: mapping.key,
                shift: mapping.bnShift === char
            });
            // Add a space after every 4 characters, but not for the last one
            if ((i + 1) % 4 === 0 && i < count - 1) {
                 drills.push({ prompt: ' ', key: ' ' });
            }
        }
    }
    return drills;
};

export const lessons: Lesson[] = [
  // --- HOME ROW ---
  {
    id: "home-row-1-1-left-hand-chars",
    title: "১.১: হোম রো - বাম হাত (অক্ষর)",
    level: "Beginner",
    row: "home-row",
    drills: generateDrills(['া', 'স', 'ড', 'ফ', 'গ'], 100)
  },
  {
    id: "home-row-1-2-left-hand-words",
    title: "১.২: হোম রো - বাম হাত (শব্দ)",
    level: "Beginner",
    row: "home-row",
    text: "সাদ ডগা ফাগা গাসা ডগ ফাদ ডাস গড কsaga আসাদ"
  },
  {
    id: "home-row-1-3-right-hand-chars",
    title: "১.৩: হোম রো - ডান হাত (অক্ষর)",
    level: "Beginner",
    row: "home-row",
    drills: generateDrills(['্', 'জ', 'ক', 'ল'], 100)
  },
   {
    id: "home-row-1-4-right-hand-words",
    title: "১.৪: হোম রো - ডান হাত (শব্দ)",
    level: "Beginner",
    row: "home-row",
    text: "কাজ কলম লজ কজল কাজল কল জল"
  },
  {
    id: "home-row-1-5-shift-chars",
    title: "১.৫: হোম রো - শিফট কী (অক্ষর)",
    level: "Beginner",
    row: "home-row",
    drills: generateDrills(['অ', 'শ', 'ঢ', 'ৎ', 'ঘ', 'হ', 'ঝ', 'খ', 'ষ'], 100)
  },
   {
    id: "home-row-1-6-shift-words",
    title: "১.৬: হোম রো - শিফট কী (শব্দ)",
    level: "Beginner",
    row: "home-row",
    text: "অশোক ঢাক ঘষাৎ হঠাৎ আশঙ্কা ঘোষণা আশা ভাষা"
  },
  {
    id: "home-row-1-7-paragraph-1",
    title: "১.৭: হোম রো - অনুচ্ছেদ অনুশীলন ১",
    level: "Beginner",
    row: "home-row",
    text: "সকল কাজল কাকা। কাজলা কাকা সকল কাজা। কাকা কাজলা সকল কাকা। সকল কাকা কাজল। কাজলা সকল কাকা কাজা। কাকা কাজলা সকল কাজ। সকল কাজল কাকা। কাজলা কাকা সকল কাজা। কাকা কাজলা সকল কাকা। সকল কাকা কাজল। কাজলা সকল কাকা কাজা। কাকা কাজলা সকল কাজ। সকল কাজল কাকা। কাজলা কাকা সকল কাজা। কাকা কাজলা সকল কাকা। সকল কাকা কাজল। কাজলা সকল কাকা কাজা। কাকা কাজলা সকল কাজ। সকল কাজল কাকা। কাজলা কাকা সকল কাজা। কাকা কাজলা সকল কাকা। সকল কাকা কাজল। কাজলা সকল কাকা কাজা। কাকা কাজলা সকল কাজ। সকল কাজল কাকা। কাজলা কাকা সকল কাজা। কাকা কাজলা সকল কাকা। সকল কাকা কাজল। কাজলা সকল কাকা কাজা। কাকা কাজলা সকল কাজ।"
  },
  {
    id: "home-row-1-8-paragraph-2",
    title: "১.৮: হোম রো - অনুচ্ছেদ অনুশীলন ২",
    level: "Beginner",
    row: "home-row",
    text: "অঘোষ সকাশ। শশাrakash। ঘষাঘষি। শশাঙ্ক। আকাশ। সকল শশাঙ্ক। শশাঙ্ক সকল আকাশ। আকাশ সকল শশাঙ্ক। শশাঙ্ক আকাশ সকল। সকল আকাশ শশাঙ্ক। আকাশ শশাঙ্ক সকল। সকল শশাঙ্ক আকাশ। শশাঙ্ক আকাশ সকল। আকাশ সকল শশাঙ্ক। শশাঙ্ক সকল আকাশ। সকল আকাশ শশাঙ্ক। আকাশ শশাঙ্ক সকল। সকল শশাঙ্ক আকাশ। শশাঙ্ক আকাশ সকল। আকাশ সকল শশাঙ্ক। শশাঙ্ক সকল আকাশ। সকল আকাশ শশাঙ্ক। আকাশ শশাঙ্ক সকল। সকল শশাঙ্ক আকাশ। শশাঙ্ক আকাশ সকল। আকাশ সকল শশাঙ্ক। শশাঙ্ক সকল আকাশ। সকল আকাশ শশাঙ্ক। আকাশ শশাঙ্ক সকল। সকল শশাঙ্ক আকাশ। শশাঙ্ক আকাশ সকল। আকাশ সকল শশাঙ্ক। শশাঙ্ক সকল আকাশ। সকল আকাশ শশাঙ্ক।"
  },
  
  // --- TOP ROW ---
  {
    id: "top-row-2-1-left-hand-chars",
    title: "২.১: টপ রো - বাম হাত (অক্ষর)",
    level: "Beginner",
    row: "top-row",
    drills: generateDrills(['ক্ষ', 'ঙ', 'ে', 'র', 'ট'], 100)
  },
  {
    id: "top-row-2-2-left-hand-words",
    title: "২.২: টপ রো - বাম হাত (শব্দ)",
    level: "Beginner",
    row: "top-row",
    text: "টেক্কা টক্কর টের টাকা টেরা টকটক টগর টেকসই"
  },
  {
    id: "top-row-2-3-right-hand-chars",
    title: "২.৩: টপ রো - ডান হাত (অক্ষর)",
    level: "Beginner",
    row: "top-row",
    drills: generateDrills(['য', 'ু', 'ি', 'ো', 'প'], 100)
  },
  {
    id: "top-row-2-4-right-hand-words",
    title: "২.৪: টপ রো - ডান হাত (শব্দ)",
    level: "Beginner",
    row: "top-row",
    text: "যুপ যূপি পিউপাপা পুপু পিয়া পিপি"
  },
  {
    id: "top-row-2-5-shift-chars",
    title: "২.৫: টপ রো - শিফট কী (অক্ষর)",
    level: "Beginner",
    row: "top-row",
    drills: generateDrills(['ঁ', 'ঃ', 'ৈ', 'ড়', 'ঠ', 'য়', 'ূ', 'ী', 'ৌ', 'ঢ়'], 100)
  },
  {
    id: "top-row-2-6-shift-words",
    title: "২.৬: টপ রো - শিফট কী (শব্দ)",
    level: "Beginner",
    row: "top-row",
    text: "ঐক্য তৌল মৌন দৌড়ୌ হায়য় ঈষৎ ঈহা ঊষা ঊন"
  },
  {
    id: "top-row-2-7-paragraph",
    title: "২.৭: টপ রো - অনুচ্ছেদ অনুশীলন",
    level: "Beginner",
    row: "top-row",
    text: "ঐরাবত রৌদ্র পানে চেয়ে থাকে। টুপটাপ জল পড়ে। টিনের চালে টিনের চালে। ইঁদুর দৌড়ে পালায়। ঐ দেখ পেঁচা। টেকো মাথা। টোপা কূল। টৈ টৈ করে। টইটম্বুর পুকুর। কৈ মাছ। টক দই। টোকা দিলে খুলে যায়। টোল পড়া গাল। টোপর মাথায় বর। টোস্ট বিস্কুট। টাকা পয়সা। টেরা চোখ। টর্চ লাইট। টহল পুলিশ। টমেটো। টমটম গাড়ি। টসটস করে। টলমল পায়ে হাঁটে।"
  },

  // --- BOTTOM ROW ---
  {
    id: "bottom-row-3-1-left-hand-chars",
    title: "৩.১: বটম রো - বাম হাত (অক্ষর)",
    level: "Beginner",
    row: "bottom-row",
    drills: generateDrills(['্য', 'ত', 'চ', 'দ', 'ব'], 100)
  },
  {
    id: "bottom-row-3-2-left-hand-words",
    title: "৩.২: বটম রো - বাম হাত (শব্দ)",
    level: "Beginner",
    row: "bottom-row",
    text: "তথ্য তত্ত্ব ত্যক্ত চ্যুত চচ্চড়ি চাতক চাদর"
  },
  {
    id: "bottom-row-3-3-right-hand-chars",
    title: "৩.৩: বটম রো - ডান হাত (অক্ষর)",
    level: "Beginner",
    row: "bottom-row",
    drills: generateDrills(['ন', 'ম', 'ৃ'], 100)
  },
  {
    id: "bottom-row-3-4-right-hand-words",
    title: "৩.৪: বটম রো - ডান হাত (শব্দ)",
    level: "Beginner",
    row: "bottom-row",
    text: "নম্র नमी नम्रता नमकीन মনন মানব"
  },
  {
    id: "bottom-row-3-5-shift-chars",
    title: "৩.৫: বটম রো - শিফট কী (অক্ষর)",
    level: "Beginner",
    row: "bottom-row",
    drills: generateDrills(['ং', 'থ', 'ছ', 'ধ', 'ভ', 'ণ', 'ঞ'], 100)
  },
  {
    id: "bottom-row-3-6-shift-words",
    title: "৩.৬: বটম রো - শিফট কী (শব্দ)",
    level: "Beginner",
    row: "bottom-row",
    text: "এবং রং ढंग থৈ থৈ ছবি ছায়া ধন্যবাদ ভীষণ"
  },
  {
    id: "bottom-row-3-7-paragraph",
    title: "৩.৭: বটম রো - অনুচ্ছেদ অনুশীলন",
    level: "Beginner",
    row: "bottom-row",
    text: "চঞ্চল বালক। চোখে চশমা। চিবুক চওড়া। চাচা চাচি। চিংড়ি চচ্চড়ি। চমৎকার চাদর। চৈত্র মাস। চৈতির চৈতন্য। চোখে চোখে কথা। চৌকাঠের চৌবাচ্চা। চৌচির মাঠ। চৌদ্দ চৌকো। চৌকিদার চৌকস। চৌরাস্তার মোড়। চৌষট্টি। চ্যাংড়া ছেলে। চ্যালা। চ্যাটচেটে। চ্যাঁ চ্যাঁ। চ্যুতির চ্যবনপ্রাশ। চ্যুত ফল। চ্যুত বৃক্ষ। চ্যুত পুষ্প।"
  },
  
  // Other Beginner Lessons
  {
    id: "char-practice-1",
    title: "বর্ণমালা অনুশীলন",
    level: "Beginner",
    text: "ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ ড় ঢ় য়",
  },
  {
    id: "char-practice-2",
    title: "কার-চিহ্ন অনুশীলন",
    level: "Beginner",
    text: "কা কি কী কু কূ কৃ কে কৈ কো কৌ কং কঃ কঁ",
  },
  // Intermediate Lessons
  {
    id: "word-practice-1",
    title: "ছোট শব্দ অনুশীলন",
    level: "Intermediate",
    text: "আমার সোনার বাংলা আমি তোমায় ভালোবাসি। চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি।",
  },
  {
    id: "word-practice-2",
    title: "মাঝারি শব্দ অনুশীলন",
    level: "Intermediate",
    text: "বাংলাদেশ ঢাকা সুন্দরবন নদী সমুদ্র মেঘ আকাশ বাতাস। স্বাধীনতা মুক্তি সংগ্রাম বিজয় একাত্তর।",
  },
   {
    id: "word-practice-3",
    title: "দৈনন্দিন ব্যবহৃত শব্দ",
    level: "Intermediate",
    text: "কাজ ঘর বাজার বাবা মা ভাই বোন বন্ধু। প্রতিদিন সকাল দুপুর রাত খাওয়া ঘুম।",
  },
  // Advanced Lessons
  {
    id: "sentence-practice-1",
    title: "ছোট বাক্য অনুশীলন",
    level: "Advanced",
    text: "আমার প্রিয় দেশ বাংলাদেশ। এই দেশের প্রকৃতি ও মানুষ আমাকে মুগ্ধ করে। আমরা সবাই মিলে এই দেশকে আরও সুন্দর করে গড়ে তুলব। দেশের উন্নতিতে আমাদের সকলের অবদান রাখা উচিত।",
  },
  {
    id: "sentence-practice-2",
    title: "যতিচিহ্ন সহ বাক্য",
    level: "Advanced",
    text: "আমার দেশের নাম বাংলাদেশ। দেশটির ইতিহাস কত সমৃদ্ধ! তুমি কি জানো? হায়, কত মানুষ প্রাণ দিয়েছেন! সাবাশ, আমরা পেরেছি।",
  },
  {
    id: "paragraph-practice-1",
    title: "অনুচ্ছেদ অনুশীলন - সাধারণ",
    level: "Advanced",
    text: "দ্রুত বাদামী শেয়ালটি অলস কুকুরটিকে লাফিয়ে পার হয়ে গেল। এই বাক্যটি ইংরেজি বর্ণমালার সমস্ত অক্ষর ব্যবহার করে লেখা যায়, তেমনই বাংলাতেও এমন বাক্য তৈরি করা সম্ভব যা প্রায় সমস্ত বর্ণ ব্যবহার করে। টাইপিং অনুশীলন ধৈর্য ও অধ্যবসায়ের বিষয়।",
  },
  {
    id: "paragraph-practice-2",
    title: "অনুচ্ছেদ - ভাষা আন্দোলন",
    level: "Advanced",
    text: "ভাষা আন্দোলন ছিল পূর্ব পাকিস্তানের (বর্তমান বাংলাদেশ) একটি সাংস্কৃতিক ও রাজনৈতিক আন্দোলন। ১৯৪৭ সালে পাকিস্তান গঠনের পর পশ্চিম পাকিস্তানের রাজনীতিবিদরাই পাকিস্তান সরকারের প্রাধান্য পায়। পাকিস্তান সরকার ঠিক করে উর্দু ভাষাকে সমগ্র পাকিস্তানের রাষ্ট্রভাষা করা হবে, কিন্তু পূর্ব পাকিস্তানের বাংলা ভাষাভাষী জনগণ উর্দুকে রাষ্ট্রভাষা হিসেবে মেনে নিতে রাজি ছিল না। তাই তারা বাংলাকে পাকিস্তানের অন্যতম রাষ্ট্রভাষা করার দাবি জানায়।",
  }
];

export const practiceParagraphs: string[] = [
  "ভাষা আন্দোলন ছিল পূর্ব পাকিস্তানের (বর্তমান বাংলাদেশ) একটি সাংস্কৃতিক ও রাজনৈতিক আন্দোলন। ১৯৪৭ সালে পাকিস্তান গঠনের পর পশ্চিম পাকিস্তানের রাজনীতিবিদরাই পাকিস্তান সরকারের প্রাধান্য পায়। পাকিস্তান সরকার ঠিক করে উর্দু ভাষাকে সমগ্র পাকিস্তানের রাষ্ট্রভাষা করা হবে, কিন্তু পূর্ব পাকিস্তানের বাংলা ভাষাভাষী জনগণ উর্দুকে রাষ্ট্রভাষা হিসেবে মেনে নিতে রাজি ছিল না। তাই তারা বাংলাকে পাকিস্তানের অন্যতম রাষ্ট্রভাষা করার দাবি জানায়।",
  "মুক্তিযুদ্ধ ছিল ১৯৭১ সালে অনুষ্ঠিত একটি ঐতিহাসিক যুদ্ধ। এই যুদ্ধের মাধ্যমে বাংলাদেশ পাকিস্তান থেকে স্বাধীনতা লাভ করে। নয় মাস ধরে চলা এই রক্তক্ষয়ী সংগ্রামে প্রায় ৩০ লক্ষ মানুষ শহীদ হন এবং বহু নারী ধর্ষণের শিকার হন। বাংলাদেশের স্বাধীনতা লাভে ভারতের অবদান অনস্বীকার্য।",
  "সুন্দরবন বিশ্বের বৃহত্তম ম্যানগ্রোভ বন। এটি বাংলাদেশ ও ভারতের পশ্চিমবঙ্গ জুড়ে বিস্তৃত। সুন্দরবন রয়েল বেঙ্গল টাইগার, চিত্রা হরিণ, কুমির ও নানা প্রজাতির পাখির আবাসস্থল। ১৯৯৭ সালে ইউনেস্কো সুন্দরবনকে বিশ্ব ঐতিহ্যবাহী স্থান হিসেবে স্বীকৃতি দেয়।",
  "আমাদের জাতীয় সংগীত 'আমার সোনার বাংলা' রবীন্দ্রনাথ ঠাকুর রচনা করেছেন। এর প্রথম দশ চরণ বাংলাদেশের জাতীয় সংগীত হিসেবে গৃহীত হয়েছে। এই গানটি মূলত স্বদেশী আন্দোলনের সময় রচিত হয়েছিল। গানটি শুনলে দেশের প্রতি ভালোবাসা আরও বেড়ে যায়।",
  "ষড়ঋতুর দেশ বাংলাদেশ। গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত ও বসন্ত এই ছয়টি ঋতু চক্রাকারে আসে। প্রতিটি ঋতুরই রয়েছে নিজস্ব রূপ ও বৈশিষ্ট্য। বর্ষার বৃষ্টি যেমন প্রকৃতিকে সজীব করে তোলে, তেমনি বসন্তের আগমনে প্রকৃতি নতুন সাজে সেজে ওঠে। এই ঋতু বৈচিত্র্যই বাংলাদেশকে করেছে অনন্য।",
  "ডিজিটাল বাংলাদেশ বর্তমান সরকারের একটি গুরুত্বপূর্ণ কর্মসূচি। এর মূল লক্ষ্য হলো প্রযুক্তির ব্যবহার করে দেশের মানুষের জীবনযাত্রার মান উন্নয়ন করা। শিক্ষা, স্বাস্থ্য, কৃষি, যোগাযোগসহ সকল ক্ষেত্রে ডিজিটাল প্রযুক্তির ছোঁয়া লেগেছে। এর ফলে দেশ দ্রুত উন্নতির দিকে এগিয়ে যাচ্ছে।",
];


export type RowDrillCategory = {
    id: 'home-row' | 'top-row' | 'bottom-row';
    name: string;
    description: string;
}
