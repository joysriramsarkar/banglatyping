# বাংলা টাইপিং মাস্টার (Bangla Typing Master)

[![Live Website](https://img.shields.io/badge/Live%20Website-typing.onuron.org-2563eb?style=for-the-badge)](https://typing.onuron.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-299%20Passed-success?style=for-the-badge)](docs/TESTING.md)
[![Accessibility](https://img.shields.io/badge/WCAG%202.1-AA%20Compliant-059669?style=for-the-badge)](docs/ACCESSIBILITY.md)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **বাংলা টাইপিং শেখা, অনুশীলন ও স্পিড টেস্ট প্ল্যাটফর্ম**  
> An open-source, full-stack Bengali touch-typing learning, practice, and speed test platform. Featuring 13 curriculum levels (61 structured lessons), real-time virtual keyboard finger guidance, Avro/Bijoy/BanglaWord layouts, adaptive mistake drilling, and government-standard typing exam simulations with downloadable verified certificates.

🌐 **লাইভ ওয়েবসাইট:** [https://typing.onuron.org](https://typing.onuron.org)

---

## ✨ প্রধান সুবিধাসমূহ (Key Features)

- **১৩-স্তরের পূর্ণাঙ্গ পাঠক্রম (13 Curriculum Levels):** কীবোর্ড পরিচিতি, হোম রো, টপ রো, বটম রো, স্বরচিহ্ন (কার), হসন্ত, ফলা (য, র, ব, ম), যুক্তাক্ষর থেকে শুরু করে সরকারি নিয়োগ পরীক্ষা পর্যন্ত ৬১টি সুবিন্যস্ত পাঠ ও ১৩০টি সেকশন।
- **মাল্টি-লেআউট ভার্চুয়াল কীবোর্ড (Virtual Keyboard):**
  - **Avro Phonetic (অভ্র):** স্বজ্ঞাত ধ্বনিভিত্তিক টাইপিং (ami = আমি)।
  - **Bijoy Classic / Bayanno (বিজয়):** সরকারি দপ্তর ও মুদ্রণশিল্পের মানদণ্ড।
  - **BanglaWord (বাংলাওয়ার্ড):** পেশাদার নথি টাইপিং লেআউট।
- **১০০% নির্ভুল বাংলা গ্রাফিম ইঞ্জিন (Grapheme Engine):** যুক্তাক্ষর ও কার-চিহ্নের সঠিক বিভাজন এবং GPM (Graphemes Per Minute) ও WPM নির্ভুল গণনা।
- **সম্পূর্ণ অ্যাক্সেসিবল ও ইনক্লুসিভ (WCAG 2.1 AA Compliant):** স্ক্রিন রিডার লাইভ প্রগ্রেস ঘোষণা, স্কিপ নেভিগেশন লিংক (`#main-content`), কীবোর্ড ফোকাস ট্র্যাপ প্রতিরোধ ও হাই কনট্রাস্ট।
- **সরকারি চাকরির নিয়োগ পরীক্ষা সিমুলেটর (Govt Exam Simulation):** ৫ মিনিটের কঠোর পরীক্ষা মোড (সাঁটমুদ্রাক্ষরিক, ডাটা এন্ট্রি ও অফিস সহকারী পদের জন্য ২৫-৩০ WPM ও ৯৫% নির্ভুলতা মানদণ্ড)।
- **ভেরিফায়েড ডিজিটাল সার্টিফিকেট (Verified Certificates):** প্রতিটি টেস্টের জন্য অনন্য ভেরিফিকেশন আইডি (যেমন `BTP-2026-XXXXXX`) সম্বলিত ডাউনলোডযোগ্য ও শেয়ারযোগ্য অফিসিয়াল PDF সনদ।
- **অ্যাডাপ্টিভ ভুল সংশোধন হাব (Mistake Hub):** ব্যবহারকারীর দুর্বল অক্ষর ও ভুল যুক্তবর্ণ স্বয়ংক্রিয়ভাবে শনাক্ত করে কাস্টম ড্রিল তৈরি।
- **টাইপিং গেম ও আর্কেড (Typing Games):** নতুন শিক্ষার্থীদের জন্য ফলিং ওয়ার্ডস, স্পেস ডিফেন্ডার ও স্পিড রেসার গেম।

---

## 📚 টেকনিক্যাল ডকুমেন্টেশন (Documentation)

প্রজেক্টের আর্কিটেকচার, টেস্টিং এবং অ্যাক্সেসিবিলিটি সংক্রান্ত বিস্তারিত গাইডসমূহ:

| ডকুমেন্ট | বিবরণ |
| :--- | :--- |
| [🧪 টেস্টিং নির্দেশিকা (docs/TESTING.md)](docs/TESTING.md) | টেস্ট সুইট আর্কিটেকচার, গ্রাফিম টেস্টিং, কভারেজ রুলস ও সিআই পলিসি |
| [♿ অ্যাক্সেসিবিলিটি গাইড (docs/ACCESSIBILITY.md)](docs/ACCESSIBILITY.md) | WCAG 2.1 AA স্ট্যান্ডার্ড, কীবোর্ড নেভিগেশন ও স্ক্রিন রিডার নির্দেশিকা |
| [🏛️ সিস্টেম আর্কিটেকচার (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md) | হাই-লেভেল আর্কিটেকচার ডায়াগ্রাম, টাইপিং ইঞ্জিন ও ডাটা ফ্লো |
| [🗄️ ডাটাবেস সেটআপ গাইড (docs/DATABASE_SETUP.md)](docs/DATABASE_SETUP.md) | Supabase স্কিমা, RLS পলিসি ও মাইগ্রেশন নির্দেশিকা |
| [📘 ইমপ্লিমেন্টেশন গাইড (docs/IMPLEMENTATION_GUIDE.md)](docs/IMPLEMENTATION_GUIDE.md) | কম্পোনেন্ট ডাটা ফেচিং, হুক্স ও প্রগ্রেস সেভিং উদাহরণ |

---

## 🗺️ পাবলিক এসইও ও লার্নিং রুটসমূহ (Public SEO Routes)

| রুট (URL) | বিবরণ |
| --- | --- |
| `/` | হোমপেজ ও দ্রুত টাইপিং টেস্ট উইজেট |
| `/bangla-typing-test` | ১, ৩ ও ৫ মিনিটের বাংলা টাইপিং টেস্ট |
| `/bangla-typing-practice` | ধাপে ধাপে বাংলা টাইপিং অনুশীলন |
| `/bangla-typing-speed-test` | WPM, GPM ও নির্ভুলতা পরিমাপক স্পিড টেস্ট |
| `/avro-typing-test` | অভ্র ফোনেটিক টাইপিং টেস্ট ও গাইড |
| `/bijoy-typing-test` | বিজয় ক্লাসিক টাইপিং টেস্ট ও গাইড |
| `/bangla-keyboard` | অভ্র, বিজয় ও বাংলা কীবোর্ড লেআউট পরিচিতি |
| `/bangla-typing-for-jobs` | সরকারি ও বেসরকারি চাকরির টাইপিং প্রস্তুতি |
| `/bangla-typing-course` | ১৩ লেভেলের সম্পূর্ণ ফ্রি টাইপিং কোর্স |
| `/learn` | বাংলা টাইপিং শেখার প্রধান হাব ও রোডম্যাপ |
| `/learn/home-row` | হোম রো (Home Row) কী ও আঙুলের সঠিক নিয়ম |
| `/learn/top-row` | টপ রো (Top Row) উপরের সারির কী ও নিয়ম |
| `/learn/bottom-row` | বটম রো (Bottom Row) নিচের সারির কী ও নিয়ম |
| `/learn/kar` | বাংলা কার-চিহ্ন (া, ি, ী, ু, ূ, ৃ, ে, ৈ, ো, ৌ) টাইপিং |
| `/learn/hasanta` | হসন্ত (্) এর সঠিক ব্যবহার ও নিয়মাবলি |
| `/learn/phola` | বাংলা ফলা (য-ফলা, র-ফলা, ব-ফলা, ম-ফলা) টাইপিং |
| `/learn/juktakkhor` | যুক্তাক্ষর টাইপিং কৌশল ও ১২টি প্রধান যুক্তবর্ণ |
| `/learn/numbers` | বাংলা সংখ্যা (১-১০) ও গাণিতিক চিহ্ন |
| `/learn/words` | সহজ থেকে কঠিন বাংলা শব্দ প্র্যাকটিস তালিকা |
| `/learn/sentences` | বাক্য ও অনুচ্ছেদ টাইপিং এবং রিদম গাইড |
| `/learn/punctuation` | বাংলা বিরামচিহ্ন (দাঁড়ি, কমা, সেমিকোলন) টাইপিং |
| `/lesson/[lessonId]` | প্রতিটি লেসনের জন্য সার্চ-বান্ধব স্ট্যাটিক পেজ (SSG) |

---

## 🛠️ প্রযুক্তি কাঠামো (Tech Stack)

- **Frontend:** Next.js 15 (App Router, Turbopack, SSG/SSR), React 18, Tailwind CSS, Lucide Icons, Radix UI.
- **Language:** TypeScript 5.
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security).
- **Audio & Analytics:** Web Audio API synth, canvas-confetti, html2canvas, jsPDF.
- **Testing:** Jest, React Testing Library, Playwright (E2E), V8 Code Coverage.

---

## 🚀 লোকাল ডেভেলপমেন্ট সেটআপ (Getting Started)

### ১. ডিপেন্ডেন্সি ইনস্টল করুন
```bash
npm install
```

### ২. এনভায়রনমেন্ট কনফিগার করুন
`.env.example` থেকে `.env.local` তৈরি করুন:
```bash
cp .env.example .env.local
```

প্রয়োজনীয় ভেরিয়েবলসমূহ সেট করুন:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_KEY="your-supabase-service-key"
```

### ৩. লোকাল সার্ভার চালু করুন
```bash
npm run dev
```
ব্রাউজারে [http://localhost:3000](http://localhost:3000) ওপেন করুন।

---

## 🗄️ ডাটাবেস মাইগ্রেশন (Database Setup)

আপনার Supabase প্রজেক্টে মাইগ্রেশনগুলো ক্রমানুসারে রান করুন:
1. `db/migrations/001_initial_schema.sql` — টেবিল, ইনডেক্স, ভিউ এবং ট্রিগার।
2. `db/migrations/002_rls_policies.sql` — রো লেভেল সিকিউরিটি (RLS) পলিসি।

লেসন ডাটাবেসে সিড করুন:
```bash
npm run db:seed        # src/lib/lessons.ts থেকে সিড করে
npm run db:check       # ডাটাবেস লেসন সংখ্যা চেক করে
npm run db:check-rls   # RLS পারমিশন যাচাই করে
```

---

## 🧪 কমান্ড ও স্ক্রিপ্টসমূহ (Available Scripts)

| কমান্ড | বিবরণ |
| :--- | :--- |
| `npm run dev` | লোকাল ডেভেলপমেন্ট সার্ভার চালু করে (Port 3000) |
| `npm run build` | প্রোডাকশন বান্ডেল তৈরি ও স্ট্যাটিক পেজ জেনারেট করে |
| `npm run start` | প্রোডাকশন বিল্ড সার্ভ করে |
| `npm run typecheck` | TypeScript টাইপ চেক (`tsc --noEmit`) |
| `npm test` | সমস্ত Jest ইউনিট ও কম্পোনেন্ট টেস্ট রান করে |
| `npm run test:coverage` | বিস্তারিত টেস্ট কভারেজ মেট্রিক্স প্রদর্শন করে |
| `npm run test:ci` | CI পরিবেশের টেস্ট ও কভারেজ গেট রান করে |
| `npm run test:e2e` | Playwright এন্ড-টু-এন্ড ব্রাউজার টেস্ট রান করে |
| `npm run test:e2e:ui` | Playwright ইন্টারঅ্যাক্টিভ UI মোডে টেস্ট রান করে |
| `npm run lint` | ESLint কোড যাচাই করে |

---

## 📄 লাইসেন্স (License)

এই প্রজেক্টটি MIT লাইসেন্সের অধীনে উন্মুক্ত। বিস্তারিত জানতে [LICENSE](LICENSE) ফাইল দেখুন।
