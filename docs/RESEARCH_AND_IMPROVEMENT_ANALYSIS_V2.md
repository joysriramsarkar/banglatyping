# বাংলা টাইপিং মাস্টার — গভীর গবেষণা ও সমস্যা/উন্নতির রূপরেখা (রিভিজন ২)

**তারিখ:** ৩ অক্টোবর ২০২৬
**সংস্করণ:** ২ — আগের রিপোর্টের (`RESEARCH_AND_IMPROVEMENT_ANALYSIS.md`) হিসাবে ভুল প্রমাণিত বিষয়গুলো সংশোধনসহ
**পদ্ধতি:** স্ট্যাটিক পড়া নয় — `tsc`, `eslint`, `next build`, `jest` চালিয়ে এবং অস্থায়ী পরীক্ষা-স্ক্রিপ্ট লিখে (পরে মুছে ফেলা হয়েছে) প্রতিটি দাবি সংখ্যায় যাচাই করা।

---

## ভাঙ্গা পড়া (Executive Summary) — যাচাইকৃত ফল

| যাচাই | ফলাফল |
|---|---|
| `npm run typecheck` | ✅ **০ এরর** |
| `npm run build` | ✅ **সফল** (Next 15.5.25, ৭২s, ১০৪টি static page) |
| `npm run lint` | ⚠️ **২২টি warning, ০ error** → CI পাস করে (exit 0) |
| `npm test` | ✅ **৩২১টি টেস্ট / ৩০ স্যুট পাস** |
| কভারেজ | ৯৪.৫৬% line, কিন্তু **৬৮.৫৩% branch**; `src/components` ও `src/app` বাইরে |

**এক লাইনে মূল সমস্যা:** কোড ও টেস্ট দুটোই পরিষ্কার, কিন্তু **যে ইঞ্জিন টেস্ট হয় সেটি প্রোডাকশনে চলে না**, আর **যে ডেটা প্রোডাকশনে দেখানো হয় সেটি ভাঙা** (ঋণাত্মক accuracy) বা **বানানো** (ফেক চার্ট, ভুয়া সার্টিফিকেট যাচাই)।

---

## অংশ ১ — 🔴 P0: সংকটপূর্ণ (ব্যবহারকারী ভুল তথ্য দেখছে)

### C1. ডেটাবেজে `accuracy_rate` ঋণাত্মক — অ্যাডাপ্টিভ লার্নিং পুরো ভাঙা

**ফাইল:** `db/migrations/001_initial_schema.sql:112–140`

মূল সমস্যা: ট্রিগার শুধু **ভুল** রেকর্ড করে, সঠিক চেষ্টা কখনোই নয়:

```sql
INSERT INTO character_errors (user_id, character, error_count, total_attempts)
VALUES (p_user_id, v_item->>'char', count, count)          -- দুটোই count
ON CONFLICT DO UPDATE SET
  error_count      = character_errors.error_count + count,
  total_attempts   = character_errors.total_attempts + count,
  accuracy_rate    = ROUND(100.0 * (total_attempts - (error_count + count)) / total_attempts, 2)
```

যুক্তি:
- `total_attempts` সর্বদা `error_count`-এর সমান (দুটো একই সংখ্যা বাড়ে)।
- UPDATE-এ `character_errors.total_attempts` **পুরোনো** মান, তাই `total − (error + new)` = `total − total − new` = `−new`.
- ফলে `accuracy_rate = 100 × (−c) / T` → **সবসময় ঋণাত্মক**।

**হাতে-কলম হিসাব:** 'ক' ৩ বার ভুল → `(E=3, T=3)`, `accuracy_rate` = ডিফল্ট ১০০। পরের সেশনে আরও ২ বার ভুল → `100 × (3 − (3+2)) / 3` = **−৬৬.৬৭%**। এরপর আরও ১ বার → `100 × (5 − 6)/5` = **−২০%**।

**প্রভাব (৪টি ফিচার একসাথে ভাঙা):**

| ফিচার | ফলাফল | রেফারেন্স |
|---|---|---|
| `user_weak_characters` ভিউ | `WHERE accuracy_rate < 95` → **সবসময় প্রতিটি row** ধরা পড়ে; `strength_level` সবসময় `'Very Weak'` | `001:160–175` |
| কীবোর্ড হিটম্যাপ | `accuracy < 70` → **সব key লাল**; tooltip-এ `toBengaliNumber(-66.67)` → **"নির্ভুলতা -৬৬.৬৭%"** | `KeyboardHeatmap.tsx:28,45,68` |
| গ্রাফিম মাস্টারি গ্রিড | একই ঋণাত্মক সংখ্যা | `GraphemeMasteryGrid.tsx:54` |
| কাস্টম ড্রিল জেনারেটর | `.lt('accuracy_rate', threshold)` → ফিল্টার কাজ করে না | `user-progress.ts:100` |
| রিকমেন্ডেশন স্কোর | `100 - accuracy_rate` → সীমাহীন বৃদ্ধি | `recommender.ts` |

> **`toBengaliNumber` যাচাই:** `utils.ts:8–12` শুধু `\d` ডিজিট বদলায় → `-66.67` → `-৬৬.৬৭`। ঋণাত্মক চিহ্ন অক্ষত থাকে।

**এটাই একটি মাইগ্রেশন দিয়ে সমাধানযোগ্য।**

---

### C2. ড্যাশবোর্ডে হাতে-লেখা ফেক ডেটা দেখানো হচ্ছে

**ফাইল:** `src/app/dashboard/page.tsx:304` → `<TypingRhythmChart />`
**ফাইল:** `src/components/analytics/TypingRhythmChart.tsx:21–34`

```tsx
const SAMPLE_RHYTHM_DATA = [
  { interval: "৫ সে.", wpm: 28, accuracy: 100 }, ... { interval: "৫০ সে.", wpm: 50, accuracy: 97 },
];
export default function TypingRhythmChart({ data = SAMPLE_RHYTHM_DATA, ... })
```

- `data` prop **একবারও পাঠানো হয় না** → ডিফল্ট হিসেবে ১০টি বানানো পয়েন্ট (২৮→৫০ WPM, ৯২–১০০% accuracy) রেন্ডার হয়।
- ব্যবহারকারীর প্রকৃত কোনো সেশন ডেটা এই চার্টে আসে না।
- **এটি ব্যবহারকারীর প্রতারণা (misrepresentation)।**

---

### C3. সার্টিফিকেট যাচাই ব্যবস্থা সম্পূর্ণ ভিত্তিহীন

**ফাইল:** `src/app/verify/[id]/page.tsx`

কোনো DB lookup নেই। যেকোনো ID-তে একই পেজ রেন্ডার হয়:

```tsx
const certId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "BTP-2026-000000";
<Badge>যাচাইকৃত অফিসিয়াল সনদপত্র (Verified)</Badge>
<h1>সনদপত্র যাচাইকরণ সফল হয়েছে</h1>
// প্রাপকের নাম: "পরীক্ষার্থী / ব্যবহারকারী"  ← প্লেসহোল্ডার
// গতি: 45+ WPM  ← হার্ডকোড
// নির্ভুলতা: ৯৭.৫%  ← হার্ডকোড
```

**ID কোথা থেকে আসে:** `certificate.tsx:31–35`
```tsx
const rand = Math.floor(100000 + Math.random() * 900000);
return `BTP-2026-${rand}`;      // ব্রাউজারে, ১০⁶ সম্ভাবনা
```

**সার্ভারে কোনো রেকর্ড নেই** — `001_initial_schema.sql`-এ ৭টি টেবিল: `lessons`, `lesson_drills`, `user_progress`, `character_errors`, `custom_drills`, `user_lesson_completion`, `paragraph_content`। **কোনো certificates টেবিল নেই।**

**সরাসরি প্রভাব:** `/verify/xyz`, `/verify/BTP-2026-000001`, `/verify/anything` → সবই একই সবুজ "ভেরিফায়েড" পেজ দেখাবে। কেউ যে কোনো ভুয়া ID তৈরি করে ছড়াতে পারবে।

> `test-results.tsx:327–331` → `verificationId` prop **পাঠায় না**, তাই প্রতিটি সনদ আলাদা random ID পায়।

---

### C4. প্রোডাকশনে যে টাইপিং ইঞ্জিন চলে, সেটি টেস্টেড নয়

**যাচাইকৃত ব্যবহার মানচিত্র:**

| মডিউল | প্রোডাকশন ব্যবহার |
|---|---|
| `src/lib/typing/session.ts` | ❌ **শূন্য** (শুধু টেস্ট) |
| `src/lib/typing/metrics.ts` | ❌ **শূন্য** (শুধু টেস্ট) |
| `src/lib/typing/comparator.ts` | ❌ **শূন্য** (শুধু টেস্ট) |
| `src/lib/typing/engine.ts` | ❌ **শূন্য** (শুধু টেস্ট) |
| `src/hooks/use-typing-session.ts` | ❌ **শূন্য** (শুধু টেস্ট) |
| `src/lib/typing/error-classifier.ts` | ⚠️ শুধু `WhyWasIWrong.tsx:9` |

**আসলে যা চলে:** `use-typing-practice.ts` (৩৯৬ লাইন) + `typing-practice.tsx` + `VisualTypingDrill.tsx` + `WordDrill.tsx` + `LessonPlayer.tsx`

**ফলাফল:** ৩২১টি টেস্ট ও ৯৪.৫৬% কভারেজ **ভাঙা ইঞ্জিনের** উপর। `jest.config.js` এ `src/lib` + `src/hooks` কভার করে, কিন্তু `src/components` বাদ → `LessonPlayer.tsx` (১,২০৮ লাইন) কভারেজে গণনা হয় না।

> ⚠️ **আগের রিপোর্টের সবচেয়ে বড় ভুল:** `metrics.ts`, `session.ts`, `comparator.ts`-কে "সমস্যা" হিসেবে চিহ্নিত করা হয়েছিল, কিন্তু সমস্যা হলো এগুলো **ব্যবহৃতই হয় না**। সমস্যা প্রোডাকশনের `use-typing-practice.ts`-এ।

---

### C5. প্রোডাকশনে ভুল গণনা হয় UTF-16 কোড-ইউনিটে — গ্রাফিমে নয়

**ফাইল:** `use-typing-practice.ts:86–99`

```ts
const expectedLength = expectedWord.length;      // UTF-16 code unit!
const typedLength = typedWord.length;
for (let j = 0; j < Math.max(expectedLength, typedLength); j++) {
  if ((expectedWord[j] || '') !== (typedWord[j] || '')) errors++;
}
```

**যাচাই করা ফলাফল:**

| প্রত্যাশিত | টাইপ করা | গণনা করা ভুল | প্রকৃত গ্রাফিম ভুল | ফোল্টাপ |
|---|---|---|---|---|
| `ক্ষ` | `কষ` | **2** | 1 | ২× |
| `ক্ষমা` | `কমা` | **4** | 1 | **৪×** |
| `স্কুল` | `সকুল` | **4** | 1 | **৪×** |
| `বাংলাদেশ` | `বাংলাদশ` | 2 | 1 | ২× |

**প্রভাব:** নির্ভুলতা কমে যায় → C1-এর ভাঙা ডেটার **আরও বেশি** বিকৃত ইনপুট যায়। ব্যাখ্যা দেওয়ার সময় `WhyWasIWrong.tsx` গ্রাফিম ইঞ্জিন ব্যবহার করে (C4), গণনা কোড-ইউনিটে → **একই সেশনে দুই ভিন্ন সত্য**।

এছাড়া `typedWord = rawInput.normalize('NFC')` — ZWJ/ZWNJ রিমোভ করে না, `normalizeBengaliString`-এর মতো নিউক্তা ফোল্ডও করে না (C20-এর অসঙ্গতি)।

---

### C6. `buildDisplayState`-এ দুই ভিন্ন সংখ্যাব্যবস্থা মিশে গেছে

**ফাইল:** `engine.ts:88` → `const event = events.find(e => e.sequence === i);`

- `event.sequence` = **ইভেন্ট কাউন্টার** (`session.ts:121` → `sequence: state.events.length`)
- `i` = **গ্রাফিম ইনডেক্স**
- ভুল চাপলে `currentGraphemeIndex` এগোয় না (`session.ts:132–134`), কিন্তু `sequence` বাড়ে → **স্থায়ী desync**

**যাচাই করা হয়েছে** (expected `কখগ`, গ্রাফিম#0-এ ভুল তারপর সঠি���):

```
events = [
  { seq: 0, exp: 'ক', act: 'খ', ok: false },
  { seq: 1, exp: 'ক', act: 'ক', ok: true }    ← সঠিকভাবে টাইপ হয়েছে
]
currentGraphemeIndex = 1
find(e => e.sequence === 0) → ভুল ইভেন্ট  ← রেন্ডারে গ্রাফিম#0 "ভুল" দেখাবে
```

পাশাপাশি প্রতি রেন্ডারে `find` চলে → **O(n²)**।

---

### C7. Invalid input আটকানোর যুক্তিটি মৃত (ESLint-ও সত্য বলছে)

**ফাইল:** `use-typing-practice.ts:178`
```ts
const isPrefix = isValidBengaliTypingPrefix(nextInput, targetWord);   // হিসাব হয়
return { ...state, charInputPerWord: {...} };                       // কখনোই ব্যবহার হয় না
```

**`npm run lint` এর আসল আউটপুট:**
```
src/hooks/use-typing-practice.ts
  178:13  warning  'isPrefix' is assigned a value but never used.
✖ 22 problems (0 errors, 22 warnings)
```

**প্রভাব:** যেকোনো অসংগত keystroke buffer-এ ঢুকে যায় (একমাত্র guard `maxLength`, যা UTF-16 length)। আর warning-এর কারণে lint exit 0 → এ ধরনের কোড নীরবে জমতে থাকে।

---

## অংশ ২ — 🟠 P1: উচ্চ (শিক্ষামূলক ও লেআউট সততা)

### C8. Avro ফোনেটিক ইনপুট বাস্তবে কাজ করে না

**ফাইল:** `use-typing-practice.ts:170` → `composeBengaliKeystroke(currentInput, rawChar)`

**যাচাই করা হয়েছে:**
```
composeBengaliKeystroke-এ 'k','t','i' দিলে → ফলাফল "kti"   (প্রত্যাশিত ক্তি)
composeBengaliKeystroke-এ 'b','a','n','g','l','a' → "bangla"  (প্রত্যাশিত বাংলা)
```

**ফলাফল: কোনো ফোনেটিক রূপান্তরই হয় না — লাতিন অক্ষর অপরিবর্তিত buffer-এ জমা হয়।**

মূল কারণ: `keyboard-layouts.ts`-এর `"avro"` কনফিগ আসলে **প্রতি-কী-নির্ভর বাংলা ম্যাপিং** (Latin key label বাদ দিলে BanglaWord-এর মতো)। আসল Avro ফোনেটিকে একই কী প্রসঙ্গভেদে ভিন্ন গ্রাফিম দেয় (`kti` → ক্তি, `kt` → ক্ত) — এই প্রকৃতিই এই কনফিগে নেই।

**প্রভাব:** ব্যবহারকারী Avro নির্বাচন করলে (a) ভুল লেআউটের হিন্ট দেখায় (C9), (b) ইনপুট transform হয় না → টাইপিং কাজ করে না।

---

### C9. কী-হিন্ট লেআউট-উদাসীন ও অসম্পূর্ণ

`lessons.ts:getStepsForChar()` → `keyMap` (BanglaWord) ব্যবহার করে; **কোনো লেআউট প্যারামিটার নেই।**

**যাচাই:**
```
getStepsForChar('ক্ষ') → [k, h, Shift+l]     ← সবসময় এই, লেআউট বাছাই অনুযায়ী নয়
```
`engine.ts:110`-এর ডকস্ট্রিং দাবি করে: *"h + Shift+L for ক্ষ in Avro"* — বাস্তবে এটি BanglaWord-এর সিকোয়েন্স, এবং কোনো লেআউটেই ব্যবহৃত হয় না (C10)।

**হিন্ট অনুপস্থিত (যাচাই করা):**

| লেআউট | হিন্ট নেই এমন |
|---|---|
| avro | ৯/১৩ — `০ ১ ৫ ৯ ক্ষ ড় য় ঃ ।` |
| bijoy | ৭/১৩ — `০ ১ ৫ ৯ ক্ষ ড় য়` |
| banglaword | ৬/১৩ — `০ ১ ৫ ৯ ড় য়` |
| khipro | ২/১৩ — `ড় য়` |
| probhat | ৭/১৩ — `০ ১ ৫ ৯ ক্ষ ড় য়` |
| unijoy | ৭/১৩ — `০ ১ ৫ ৯ ক্ষ ড় য়` |

→ **বাংলা অঙ্ক (`০ ১ ৫ ৯`) ৬ লেআউটের ৫টিতেই হিন্টহীন**, অথচ `/learn/numbers` পেজ আছে।
→ **`ড়` ও `য়` কোনো লেআউটেই হিন্ট নেই** — এগুলো বাংলা টাইপিংয়ের সবচেয়ে সমস্যাজনক চিহ্ন।

**অস্পষ্টতা (যাচাই করা):**

| লেআউট | অক্ষর | সমস্যা |
|---|---|---|
| avro | `ও` | `W` **ও** `O` — দুটোতেই |
| avro | `ফ` | `Shift+P` **ও** `F` |
| khipro | `ল ং ভ ব যফলা` | ৫টি, দুটো key-state-এ |
| probhat | `ঢ়` | দুটো key-state-এ |
| unijoy | `স` | `N` **ও** `;` |
| banglaword | `ং` | `Shift+Z` **ও** `Shift+M` |
| **bijoy** | `র্` vs `্র` | **দুটি ভিন্ন code-point, একই গ্লিফ** — `Shift+a` = `'র্'` (লাইন ৭৪), `z` = `'্র'` (লাইন ৮৮)। Bijoy-তে `a`=র-ফলা, `Shift+a`=ৃ হওয়া উচিত; কনফিগে এগুলো **উল্টো** |

**ফল:** ভার্চুয়াল কীবোর্ডে ~২৫+ অক্ষরের হিন্ট ভুল বা অনুপস্থিত।

**বাস্তব ভার্চুয়াল কীবোর্ডের আন্দোলন:** Avro/Bijoy/Unijoy **কোনোটাই সিঙ্গেল-কী লেআউট নয়** — এগুলো "modifier-key" সিস্টেম যেখানে একটি কম্বো তৈরি করে। `findKeyInfoForChar` একটি অক্ষরকে একটি কীতে ম্যাপ করে ধরে নেয়, তাই ভিজ্যুয়াল হাইলাইটিং কখনোই সঠিক হবে না।

---

### C10. `getTypingHint()` ফাঁকা স্টাব

`engine.ts:114–121` → `void grapheme; void layoutId; return [];`
যাচাই: **প্রোডাকশনে শূন্য ব্যবহার, টেস্টেও শূন্য।** যুক্তাক্ষর শেখার জন্য কী চাপতে হবে তা বলার কোনো কাজ করে না।

---

### C11. Mastery মডেলের `PROFICIENT` অবহেচিত — মৃত অবস্থা

**ফাইল:** `mastery.ts:24–27, 77–99, 147–148`

- `successCount` শুধু বাড়ে যখন `accuracy >= MASTERY_ACCURACY_THRESHOLD (97)` (লাইন 77, 83–87)
- কিন্তু PROFICIENT-এ লাগে `accuracy >= 90 && successCount >= 2` (লাইন 147)

**যাচাই করা হয়েছে** (প্রতিটিতে ১২টি টানা সেশন):

| accuracy | চূড়ান্ত অবস্থা | successCount |
|---|---|---|
| 100% | MASTERED | 12 |
| 97% | MASTERED | 12 |
| **95%** | **PRACTICING** | **0** |
| **92%** | **PRACTICING** | **0** |
| **90%** | **PRACTICING** | **0** |
| 89% | PRACTICING | 0 |

**→ ৯০–৯৬% ব্যান্ডের ব্যবহারকারী আজীবন `PRACTICING`-এ আটকে থাকবে।** এই সংস্করণের ৮৫–৯৫% বেশিরভাগ ক্ষেত্রেই বাস্তব, তাই অধিকাংশ শিক্ষার্থীর জগতে এই দোয়ার কোনো মানে নেই।

**সমান্তরাল সংজ্ঞা অসঙ্গতি:**
- `curriculum/engine.ts` → ৯৭% = **তাৎক্ষণিক MASTERED**
- `mastery.ts` → ৯৭% + ৩টি সেশন + stability ≥ ৪০ = MASTERED

একই ধারণার দুটি বিপরীত সংজ্ঞা।

---

### C12. `skillId` তৈরিতে পুরো ক্লাস্টার → skill namespace বিস্ফোরণ + curated word bank সম্পূর্ণ মৃত

**ফাইল:** `mastery.ts` → `graphemeToSkillId()`

**যাচাই করা হয়েছে:**
```
কি    → kar-কি          (ডকস্ট্রিং বলে 'ি' → 'kar-ি')
কা    → kar-কা
ক্ষ   → conjunct-ক্ষ
ক্ষ্ম  → conjunct-ক্ষ্ম
ড়    → char-ড়
```

**১টি কনসোনেন্টের ৯টি কার ড্রিল = ৯টি ভিন্ন skill** (যাচাই করা)। ৩৯ কনসোনেন্ট × ১১ কার ≈ **৪০০+ "কার দক্ষতা"**, প্রতিটি ১–২ বারের ডেটা পেয়ে → mastery মানহীন।

**ফলাফল:** `recommender.ts`-এর `COMMON_WORD_BANK`-এর key (`kar-া`, `conjunct-ক্ষ`) **কখনোই মিলবে না** (প্রকৃত: `kar-কা`, `conjunct-ক্ষ্ম`) → **সম্পূর্ণ curated word bank নিষ্ক্রিয় কোড।**

---

### C13. Curated drill content অর্থহীন

`recommender.ts:generateDrillContent` Phase 2 → `consonant + char` জোড়া লাগায়:

| ক্ষেত্রে `char` | ফলাফল |
|---|---|
| `ক` | `কক` — অর্থহীন |
| `ক্ষ` (যুক্তাক্ষর) | `কক্ষ` — অর্থহীন |
| `া` (কার) | কারের আগে consonant লাগানো — ব্যাকরণগত ভুল |

`findWordsContaining` → `w.includes(char)` → `া` দিলে প্রায় **প্রতিটি বাংলা শব্দই** মিলে যায় (কার সর্বব্যাপী)।

**`custom-drill-generator.ts:24–35`** → `focusCharacters` (accuracy দিয়ে ওজন) তৈরি করে রাখে কিন্তু `generateDrills(characterList, drillCount)`-এ **সমান সম্ভাবনায়** ড্রিল বানায় → "weakest-first" অ্যাডাপ্টিভিটি **নেই**, কেবল সমান বণ্টন।

---

### C14. Spaced repetition সার্ভারে নেই

- `mastery.ts:weakCharsToMastery` → `lastPracticed: null, nextReviewAt: null` → `isDueForReview()` **সবসময় false**
- ডেটাবেজে **কোনো `skill_mastery` টেবিল নেই** → mastery সম্পূর্ণ in-memory → রিফ্রেশ/ডিভাইস পরিবর্তনে "review due" অবস্থা হারিয়ে যায়
- ফলে SRS পুরোপুরি কাজ করে না

> ⚠️ আগের রিপোর্টে "E5: No spaced repetition (SRS)" ছিল। বাস্তবতা: কোড **আছে**, কিন্তু ওয়্যার করা নয় — সমস্যা ভিন্ন, সমাধান ভিন্ন।

---

## অংশ ৩ — 🟡 P2: মাঝারি (ডেটা ও কনটেন্ট কোয়ালিটি)

### C15. `lessons.ts:811` — ৪টি কনটেন্ট ত্রুটি (যাচাই করা, লাইন-বাই-লাইন)

ফাইলের প্রকৃত লেখা:
```
… চা চি চী চু চূ বৃ চে চৈ চো চৌ চ্য।        ← বৃ এর বদলে চৃ
… লা লি লী লু লূ বৃ লে লৈ লো লৌ ল্য।        ← বৃ এর বদলে লৃ
… ক্ষা ক্ষি ক্ষী ক্ষু ক্ষূ ক্ষৃ ক্ষে ক্ষৈ ক্ষো খৌ ক্ষ্য।  ← খৌ এর বদলে ক্ষৌ
… রা রি রী রু রূ রৃ রে রাই রো রৌ র্য।          ← রাই এর জায়গায় রৌ
```

- প্রতিটি গ্রুপে ১১টি স্লটের প্যাটার্ন (া ি ী ু ূ ৃ ে ৈ ো ৌ যফলা) — **চারটি জায়গায় ভাঙা**
- র-গ্রুপে **ঔ-কার (ৌ) ড্রিল একেবারেই অনুপস্থিত**, বদলে অপ্রাসঙ্গিক `রাই`
- কোনো টেস্ট লেসন টেক্সট বৈধতা যাচাই করে না
- `scripts/find-invalid-kar.js` (২৭ লাইন) আছে কিন্তু **কোনো npm script নেই**, তাই কখনোই চলে না

---

### C16. `createDeterministicDrills` প্রতি অক্ষরের পর স্পেস, আর স্পেসকে নিজে drill বানায়

**যাচাই করা:**
```ts
createDeterministicDrills(['ক','খ','গ','ঘ'], 12)
// → prompts: ["ক", " ", "খ", " ", "গ", " ", "ঘ"]
```
**`' '` একটি স্বতন্ত্র drill prompt** — এটি একটি খালি ড্রিল।

**তদুপরি:** `lessons.ts:277–294` প্রতি অক্ষরের পর স্পেস দেয়, কিন্তু `ensureSpacedDrillItems()` (২–৪ অক্ষর পর) দাবি করে বাস্তবে কাজ করে না — `bengali-grapheme.ts:444`-এর `explicitSpaceCount >= items.length / 4` early-return সবসময় নেয়।

**শিক্ষামূলক ভুল:** প্রতি একটি অক্ষরের পর স্পেস → বাস্তব বাংলা লেখার ছন্দের বদলে ভুল লেখার ছন্দ তৈরি হয় (`ক খ গ ঘ` এর বদলে `কখগঘ`)।

---

### C17. দুটি সমান্তরাল ৬১-পাঠের কারিকুলাম

| ফাইল | আকার | ব্যবহার |
|---|---|---|
| `src/lib/lessons.ts` | ৬১ পাঠ, row-based | `/dashboard/lessons/[rowId]`, `/lesson/[lessonId]` |
| `src/lib/curriculum/curriculum-data.ts` | **৬,০৪৯ লাইন**, ১৭ module, ১৩০ section, ৬১ পাঠ, ১৩ level | `/dashboard/practice/[lessonId]` |

- সংখ্যা হুবহু মেলে (৬১ = ৬১) — তাই যাচাই লুকিয়ে থাকে
- কিন্তু **দুটি আলাদা শেখার পথ**, দুই ধরনের drill ও মাপদণ্ড
- দ্বিতীয়টি **JSON-ধাঁচে** (`"level": 0, "tagline": …`) → `scripts/expand-curriculum.ts` (৬৯২ লাইন) মেশিন-জেনারেটেড

---

### C18. `best_accuracy` / `best_wpm` আসলে "last value"

**ফাইল:** `user-progress.ts:268–282`
```ts
.upsert({ times_completed: 1, best_accuracy: accuracy, best_wpm: wpm, ... },
        { onConflict: 'user_id,lesson_id' })
```
- `times_completed: 1` **কখনোই বাড়ে না** (১, ২, ৩… নয়)
- upsert overwrite করে → আগের ভালো স্কোর মুছে যায়
- কলামের নাম "best" কিন্তু আচরণ "last"
- সঠিক: SQL-এ `GREATEST(existing, new)` অথবা RPC ফাংশন

---

### C19. `Intl.Segmenter` ফিচার-ডিটেকশন ও ফলব্যাক নেই

**ফাইল:** `bengali-grapheme.ts:28`
```ts
this.segmenter = new Intl.Segmenter('bn-IN', { granularity: 'grapheme' });   // কোনো guard নেই
```
- সমর্থন না থাকলে **constructor-ই throw করে** → মডিউল import ব্যর্থ → পুরো অ্যাপ ক্র্যাশ
- `curriculum/engine.ts:157` → প্রতি কলে **নতুন** `Intl.Segmenter` তৈরি (ক্যাশ নেই)
- **`docs/ARCHITECTURE.md` এবং `docs/RESEARCH_AND_IMPROVEMENT_ANALYSIS.md:31` "রিগ্রেসন-প্রুফ ফলব্যাক" দাবি করে — বাস্তবে নেই**

---

### C20. নিউক্তা-ফোল্ডিং দুই পাথে দুই ফলাফল

| ফাইল | আচরণ |
|---|---|
| `bengali-grapheme.ts:185–194 normalizeBengaliString` | ZWJ/ZWNJ রিমোভ + NFC + **য+়→য়, ড+়→ড়, ঢ+়→ঢ়** ফোল্ড |
| `typing/session.ts:216 normalizeForCompare` | ZWJ/ZWNJ রিমোভ + NFC **ব্যতীত** |

**যাচাই করা হয়েছে** — একই ইনপুটে দুই ফাংশনের আউটপুট **কোড-পয়েন্টে ভিন্ন**:
```
'ড়া': normalizeBengaliString ≠ sessionLocal  → equal=false
'য়' : normalizeBengaliString ≠ sessionLocal  → equal=false
'ঢ়া': normalizeBengaliString ≠ sessionLocal  → equal=false
'ড়' : normalizeBengaliString ≠ sessionLocal  → equal=false
```
`comparator.ts:19` → প্রথমটি ব্যবহার করে। ফলে একই টাইপিং ইঞ্জিনে দুই পথে দুই উত্তর।

---

### C21. অবৈধ shuffle: `sort(() => Math.random() - 0.5)`

`lessons.ts`-এর কার-ড্রিল জেনারেশনে। এটি Fisher–Yates নয় → বণ্টন সমান নয়, প্রান্তীয় উপাদান বেশি আসে। (শেষ প্রতারণাটি উপেক্ষা করা উচিত, তবে সারিয়াল/ট্রানজিটিভিটি ভাঙা।)

---

### C22. প্রতি টাইমার টিকে O(n²) পুনর্গণনা

**ফাইল:** `use-typing-practice.ts:76, 100`
```ts
for (let i = 0; i <= currentWordIndex; i++) { … }        // প্রতি CALCALATE_STATS-এ পুরো লুপ
if (!newCache) newCache = { ...wordStatsCache };          // পুরো ক্যাশ কপি
```
৫ মিনিটের টেস্টে শত শত শব্দ → প্রতি টিকে O(n²) + বড় অবজেক্ট কপি। প্রতি-কীস্ট্রোকে নয়, কিন্তু টাইমার-চালিত।

---

## অংশ ৪ — 🟢 P3: নথি, প্রক্রিয়া ও মান

### C23. যাচাই করা মৃত কোড (প্রোডাকশনে অব্যবহৃত)

| ফাংশন | অবস্থান |
|---|---|
| `getTypingHint` | `engine.ts:114` |
| `buildDisplayState` | `engine.ts:75` |
| `compareText`, `isBengaliEqual`, `unicodeLength` | `comparator.ts:130, 38, 214` |
| `classifySpaceError` | `error-classifier.ts:140` |
| `generateWordDrills` | `lessons.ts:331` |
| `splitConjunctByHalant`, `COMPLEX_CONJUNCT_MAP` | `bengali-grapheme.ts:208, 248` |

**গুরুত্বপূর্ণ সংশোধন** (আগের রিপোর্ট ভুল ছিল):
- ✅ `getBengaliGraphemeClip` **সক্রিয়** — `GraphemeDisplay.tsx:75,98` ও `mistakes/page.tsx:438`
- ✅ `ensureSpacedDrillItems` **সক্রিয়** — `LessonPlayer.tsx:43,165`

---

### C24. Lint warning-এ ফাঁকা → CI পাস করে

```
eslint . → ✖ 22 problems (0 errors, 22 warnings)   → exit 0
next build → "Skipping linting"
```
`--max-warnings=0` নেই, তাই C7-সহ মৃত কোড নীরবে জমতে থাকে।

---

### C25. কভারেজ দাবি বনাম বাস্তব্য

| দাবি | বাস্তব্য |
|---|---|
| `docs/TESTING.md`: টাইপিং + কারিকুলাম ইঞ্জিনে **৮৫%+** | `jest.config.js`-এ শুধু `global.lines = 80`, **কোনো per-module ৮৫% নেই** |
| ব্যাপক কভারেজ | `collectCoverageFrom` = `src/lib/**` + `src/hooks/**` → **`src/components` ও `src/app` বাদ**; `LessonPlayer.tsx` (১,২০৮ লাইন) গণনা হয় না |
| — | বাস্তব: **৯৪.৫৬% line / ৬৮.৫৩% branch** |

---

### C26. নথি ও বাস্তব্যের অমিল

| দাবি | বাস্তব্য |
|---|---|
| "৩টি লেআউট" (README, রিপোর্ট §১) | কোডে **৬টি**: avro, bijoy, banglaword, khipro, probhat, unijoy |
| "রিগ্রেসন-প্রুফ ফলব্যাক" | **নেই** (C19) |
| "কাস্টম ড্রিল অ্যাডাপ্টিভ ★★★★☆" | C1 + C13-এর কারণে **ভিত্তিহীন** |
| "কাস্টম ড্রিল আছে কিন্তু recharts ব্যবহার নেই" (E3) | **ভুল** — `TypingRhythmChart`, `DrillProgress`, `test-results` — ৩টিতে ব্যবহৃত; আসল সমস্যা একটি ফেক চার্ট (C2) |
| "SRS নেই" (E5) | কোড আছে, ওয়্যার নয় (C14) |
| README: `npm run build && npm start` | আসল deploy: `npm run deploy` → `@opennextjs/cloudflare` + `wrangler.jsonc` |
| `package.json` নাম `nextn` | ব্র্যান্ডিং অসামঞ্জস্য |
| `patch-package` নির্ভরতা আছে | কোনো `postinstall` স্ক্রিপ্ট নেই → patch কখনোই প্রয়োগ হয় না |

---

### C27. Accessibility দাবি বনাম বাস্তব্য

`aria-live` মাত্র **৩টি** জায়গায়:
- `VirtualizedWordDisplay.tsx:37` (sr-only, polite)
- `typing-practice.tsx:387`
- `profile/page.tsx:58` (লোডিং স্টেটাস)

**`LessonPlayer.tsx` (১,২০৮ লাইন — মূল শেখার পর্দা) এবং `/dashboard/test`-এ কোনো live-region নেই** → স্ক্রিন রিডার ব্যবহারকারী অগ্রগতি ও ভুল শোনে না।

`components-a11y.test.tsx` → `VirtualizedWordDisplay` ও `Certificate` মাত্র দুটি কম্পোনেন্ট; LessonPlayer নেই।

**"WCAG 2.1 AA" দাবি বাস্তবায়নের চেয়ে অনেক এগিয়ে।**

---

### C28. Bundle ও নির্ভরতা

```
/dashboard/test              → 560 kB first-load JS
/dashboard/practice/[id]     → 555 kB
/dashboard                   → 315 kB
```
- `html2canvas` + `jspdf` (সার্টিফিকেটে) + `recharts` + `framer-motion` একই বান্ডলে → `next/dynamic` দিয়ে সার্টিফিকেটের ভারী অংশ আলাদা করা যায়
- বিল্ড সফল, ১০৪টি static page — সমস্যা নেই

---

## অংশ ৫ — যা ভালো (ধরে রাখা উচিত)

1. **টাইপ ও বিল্ড পরিষ্কার** — `tsc --noEmit` ০ এরর, `next build` সফল
2. **RLS সত্যিই চালু** — `migrations/002_rls_policies.sql` অ্যানন key দিয়ে অন্যের ডেটা আপডেট/পড়া বন্ধ করে; মন্তব্য সঠিক ("এটি দ্বিতীয় স্তরের নিরাপত্তা")
3. **`normalizeBengaliString`-এর ধারণা সঠিক** — ZWJ/ZWNJ রিমোভ + নিউক্তা ফোল্ডিং; সমস্যা হলো প্রতিটি পথে একভাবে প্রয়োগ না হওয়া (C20)
4. **গেম অডিও Web Audio দিয়ে সিনথেসাইজ** — কোনো MP3 অ্যাসেট নেই, শূন্য নেটওয়ার্ক খরচ
5. **মেশিন-জেনারেটেড কারিকুলামের স্কেল** (`expand-curriculum.ts`) — ভালো ধারণা, যাচাই স্তর যোগ করলে অত্যন্ত মূল্যবান
6. **আলাদা করা অ্যাডাপ্টিভ মডিউল** — `mastery.ts`, `recommender.ts`, `custom-drill-generator.ts` আলাদা ফাইলে; কাঠামো ভালো, সমস্যা ডেটা ও wiring-এ
7. **৩,২১টি টেস্ট** — কাঠামো ভালো (C4-এর সমস্যা পরীক্ষার পরিবর্তে)

---

## অংশ ৬ — উন্নতির রূপরেখা (Roadmap)

### 🛑 Phase 0 — অখণ্ডতা ঠিক করা (১–২ দিন, সবচেয়ে জরুরি)

ব্যবহারকারী এখন যা দেখছে তার বড় অংশ **বানানো বা ভাঙা**। এটি ঠিক না হলে বাকি সব কাজের প্রভাব মুখোশ থাকবে।

| # | কাজ | কোথায় | কঠিনতা |
|---|---|---|---|
| 0.1 | **`/verify/[id]`-এ সত্য যোগ করা**: `certificates` টেবিল (id, user_id, wpm, accuracy, issued_at), issue-এর সময় insert, `/verify`-এ lookup; না পারলে পেজে "ডেমো মোড — যাচাইকরণ সমর্থিত নয়" দেখান | নতুন `004_certificates.sql`, `verify/[id]/page.tsx`, `certificate.tsx` | সহজ |
| 0.2 | **`TypingRhythmChart`-কে বাস্তব ডেটা ফিড** করা; সম্ভব না হলে কম্পোনেন্ট সরানো — ফেক চার্ট রাখা অগ্রহণীয় | `dashboard/page.tsx`, নতুন `getSessionSeries()` | সহজ |
| 0.3 | **`accuracy_rate` ফিক্স**: `update_character_errors()`-এ সঠিক চেষ্টাও গুনতে হবে → `user_progress`-এ `grapheme_attempts JSONB` যোগ, ট্রিগারে দুটোই ইনক্রিমেন্ট, `GREATEST(0, …)` ক্ল্যাম্প, পুরোনো নেতিবাচক মান ঠিক করতে backfill | `db/migrations/004_fix_accuracy.sql` | মাঝারি |
| 0.4 | **`best_*` ঠিক করা**: `GREATEST()` দিয়ে upsert, `times_completed` বাড়ানো | `user-progress.ts` বা RPC | সহজ |

> ⚠️ 0.1 ও 0.2 **প্রকাশ্য-সততা**; 0.3 **প্রোডাক্ট-মূল**। এই তিনটি ছাড়া বাকি সব উন্নতির ফলদায়কতা যাচাই করা যাবে না।

---

### 🔧 Phase 1 — সপ্তাহ ১: মাপযোগ্যতা ও সততা

| # | কাজ | কারণ | কঠিনতা |
|---|---|---|---|
| 1.1 | `normalizeBengaliString`-কে **একমাত্র** তুলনা-ফাংশন করা; `session.ts:216 normalizeForCompare` বাদ | C20 অসঙ্গতি | সহজ |
| 1.2 | `buildDisplayState`-এ ইভেন্টকে **গ্রাফিম ইনডেক্স দিয়ে** ট্যাগ করা (`graphemeIndex` ফিল্ড) → desync ও O(n²) দুটোই যায় | C6 | সহজ |
| 1.3 | `isPrefix` ব্যবহার শুরু — অগ্রগতি-সম্মত না হলে reducer ফেরত দিন | C7 | সহজ |
| 1.4 | `eslint --max-warnings=0` CI-তে যোগ | C24 | সহজ |
| 1.5 | লেসন টেক্সট ভ্যালিডেটর: প্রতি কার-গ্রুপে ১১-স্লটের প্যাটার্ন মিলিয়ে নেওয়া; `scripts/find-invalid-kar.js`-কে npm script করা | C15 | সহজ |
| 1.6 | README/deploy নথি ঠিক করা (6 লেআউট, Cloudflare deploy, প্যাকেজ নাম) | C26 | সহজ |

---

### ⌨️ Phase 2 — সপ্তাহ ২–৩: লেআউট সততা (সবচেয়ে বড় প্রশ্ন)

**সমস্যা:** সব layout কনফিগ এক-কী-এক-অক্ষর ধরে নেয়, কিন্তু Avro/Bijoy/Unijoy **modifier-key সিস্টেম** — একটি গ্রাফিমের জন্য **কী সিকোয়েন্স** দরকার।

| # | কাজ | বিবরণ | কঠিনতা |
|---|---|---|---|
| 2.1 | **Layout ইন্ডাস্ট্রাকচার বদলানো** — প্রতি লেআউটকে `(modifier, base, cluster) → keySequence[]` হিসেবে সংজ্ঞায়িত করা | এটাই ভিত্তি — বাকি সব এর উপর | বড় |
| 2.2 | ফোনেটিক **ইনপুট ইঞ্জিন** লেখা | `composeBengaliKeystroke`-এর বদলে লেআউট-চালিত transducer: `kti` → ক্তি, `bangla` → বাংলা | বড় |
| 2.3 | `getTypingHint()` বাস্তবায়ন 2.1-এর উপর | `getStepsForChar(layoutId, grapheme)` | সহজ (২.১-এর পর) |
| 2.4 | বাংলা অঙ্ক + `ড়`/`য়`/`ং` সব লেআউটে যোগ | C9 | সহজ |
| 2.5 | Bijoy `a`/`Shift+a` বিনিময় ঠিক করা, `'র্'`↔`'্র'` canonicalize | C9 | সহজ |
| 2.6 | **লেআউট ফিদব্যাক ফর্ম**: `expectedGrapheme → keySequence` একটি সিদ্ধান্ত-ট্রি | BanglaWord সহজ → Bijoy → Avro সবচেয়ে কঠিন | বড় |

> **বাস্তবসম্মত পরিকল্পনা:** 2.1+2.4+2.5 দিয়ে BanglaWord ও Bijoy-র ভিজ্যুয়াল নির্ভুলতা ঠিক করা যায় (কম ঝুঁকি)। Avro ফোনেটিক ইঞ্জিন (2.2) আলাদা মাইলফলক — হ্যান্ডঅফ রেখে "শীঘ্রই" বলা ভালো, নিজের ভুল Avro টিউটরশিয়াল দেওয়ার চেয়ে।

---

### 🔁 Phase 3 — সপ্তাহ ৩–৫: প্রোডাকশন ইঞ্জিন বদল (মাপযোগ্যতার বাস্তবায়ন)

এটি **সবচেয়ে ঝুঁকিপূর্ণ কাজ** — তাই ধাপে ধাপে:

| ধাপ | কাজ | বিবরণ |
|---|---|---|
| 3.1 | ফিচার ফ্ল্যাগ | `useTypingSession` ব্যবহার করে একটি লেসন; পাশাপাশি পুরোনো পথ |
| 3.2 | সমান্তরাল চালু করা | দুই ইঞ্জিনের মেট্রিক্স পাশাপাশি দেখিয়ে পার্থক্য মাপা (শিসন ফ্ল্যাগ) |
| 3.3 | বৈধতা যাচাই | ভিন্ন পথে **একই ইনপুটে অবশ্যই একই ফল** — এটাই রিগ্রেসন টেস্ট |
| 3.4 | ধাপে স্থানান্তর | `VisualTypingDrill` → `LessonPlayer` → বাকিরা |
| 3.5 | পুরোনো `use-typing-practice.ts` সরানো | নয়তো C4-এর ভুয়া-আত্মবিশ্বাস আবারও হবে |

সহায়ক: **গ্রাফিম-ভিত্তিক তুলনা** `comparator.compareGrapheme`-এ কেন্দ্রীভূত করা (C5 সমাধান)।

---

### 🧠 Phase 4 — মাস ২: অ্যাডাপ্টিভ লার্নিং সততা

| # | কাজ | কারণ |
|---|---|---|
| 4.1 | **Phase 0.3 এর কাজ চালু** | C1 — না হলে এই পুরো ধাপ অর্থহীন |
| 4.2 | `skillId`-এ **কার-চিহ্ন বের করা** (`কি` → `kar-ি`, base পৃথক রাখা) | C12 — skill namespace + word bank চালু হবে |
| 4.3 | `REVIEW_INTERVALS_DAYS`-ভিত্তিক **পারসিস্ট্যান্ট** SRS (`skill_mastery` টেবিল) | C14 |
| 4.4 | `PROFICIENT` থ্রেশহোল্ড `MASTERY`-র নিচে নামানো | C11 |
| 4.5 | `curriculum/engine.ts` ও `mastery.ts`-এর মাপদণ্ড **একটি জায়গায়** | C11 অসঙ্গতি |
| 4.6 | `generateDrillContent`-এ শব্দভান্ডার আগে, কৃত্রিং concat শেষে | C13 |
| 4.7 | `focusCharacters`-এর ওজন আসলে ব্যবহার (weighted sampling) | C13 |
| 4.8 | `findWordsContaining` গ্রাফিম-সচেতন | C13 |

---

### 📚 Phase 5 — মাস ৩: পরিচিতি, মান ও ডেটা

| # | কাজ |
|---|---|
| 5.1 | **লেসন টেক্সট স্বয়ংক্রিয় যাচাই CI-তে** — 61+61 পাঠের সব টেক্সট, কার-প্যাটার্ন, যুক্তাক্ষর-সত্যতা যাচাই |
| 5.2 | **দুই কারিকুলাম মিলানো** অথবা একটি বেছে নেওয়া — C17 |
| 5.3 | `src/components` কভারেজে যোগ + per-module থ্রেশহোল্ড — C25 |
| 5.4 | **LessonPlayer-এ `aria-live`** (অগ্রগতি + ত্রুটি ঘোষণা) + a11y টেস্ট — C27 |
| 5.5 | **পরীক্ষার ফলাফলে লেআউট ও গ্রাফিম-ভিত্তিক মেট্রিক্স দেখানো** (GPM প্রধান, WPM সহায়ক) — C4 ঠিক হওয়ার পর |
| 5.6 | সার্টিফিকেটের ভারী অংশ `next/dynamic` — C28 |
| 5.7 | `patch-package`-এর জন্য `postinstall` স্ক্রিপ্ট অথবা নির্ভরতা সরানো |

---

## অংশ ৭ — ৩০ দিনের অ্যাকশন চেকলিস্ট

### সপ্তাহে ১ (এখনই)

- [ ] **`/verify/[id]`-এ DB lookup** যোগ, না পারলে পেজে "ডেমো মোড" লেবেল — ২ ঘণ্টা
- [ ] **`TypingRhythmChart`** বাস্তব ডেটা পায়; না পারলে সরান — ২ ঘণ্টা
- [ ] **`004_fix_accuracy.sql`** লেখা ও টেস্ট করা — ১ দিন *(সবচেয়ে বড় লাভ)*
- [ ] **`updateLessonCompletion`-এ `GREATEST()`** — ১ ঘণ্টা
- [ ] **`isPrefix` কাজে লাগানো** — ৩০ মিনিট
- [ ] **README-তে ৬ লেআউট ও Cloudflare deploy** ঠিক করা — ৩০ মিনিট

### সপ্তাহে ২

- [ ] `normalizeForCompare` → `normalizeBengaliString`-এ ইউনিফাই
- [ ] ইভেন্টে `graphemeIndex` যোগ → `buildDisplayState` ঠিক
- [ ] লেসন টেক্সট ভ্যালিডেটর + npm script + CI
- [ ] লেআউট কনফিজে বাংলা অঙ্ক ও `ড়`/`য়`/`ং` যোগ
- [ ] Bijoy `a`/`Shift+a` ঠিক করা
- [ ] `--max-warnings=0` CI-তে

### সপ্তাহে ৩–৪

- [ ] লেআউট ডেটা মডেল → কী-সিকোয়েন্স ভিত্তিক (2.1)
- [ ] `getTypingHint()` বাস্তবায়ন
- [ ] Phase 3-এর ফিচার ফ্ল্যাগ ও পাশাপাশি তুলনা

---

## অংশ ৮ — উপসংহার

এই প্রজেক্টের **স্থাপত্যগত সিদ্ধান্তগুলো সঠিক** — গ্রাফিম-ফার্স্ট পদ্ধতি, GPM-কে প্রধান মেট্রিক, আলাদা অ্যাডাপ্টিভ মডিউল, RLS, কোনো অ্যাসেট-ছাড়া সিনথেসাইজড অডিও, এবং মেশিন-জেনারেটেড কারিকুলামের স্কেল।

**কিন্তু তিনটি বিচ্ছিন্নতা আছে:**

1. **প্রোডাকশন ≠ টেস্ট** — যে ইঞ্জিনের উপর ৩২১টি টেস্ট ও ৯৪.৫৬% কভারেজ, সেটি প্রোডাকশনে চলে না (C4)।
2. **ডেটা ≠ সত্য** — যে ডেটা দেখানো হয়, তার ভিত্তি ঋণাত্মক (C1), আর যা "কর্তৃপক্ষ" দেখায় তার দুটো অংশ বানানো (C2, C3)।
3. **ডিজাইন ≠ বাস্তব** — নথিতে ★★★★★ দেওয়া `Intl.Segmenter` ফলব্যাক নেই, "রিগ্রেসন-প্রুফ" clip-path ইঞ্জিনের বদলে কোডে যা আছে তা ভিন্ন, এবং SRS "নেই" বলা ভুল (সংশোধিত: ওয়্যার করা নেই)।

**এই তিনটিই সমাধানযোগ্য, এবং Phase 0 ও 1-এর কাজগুলো মোটামুটি ছোট।** তারপর লেআউট সততা (Phase 2) ও প্রোডাকশন ইঞ্জিন বদল (Phase 3) — এই দুটোই একসাথে গেলেই প্রজেক্টটি সত্যিই "শিল্প-মানের" হবে, কারণ তখন প্রতিটি দাবির পেছনে সত্য থাকবে।

---

## পরিশিষ্ট — গবেষণার পদ্ধতি ও সীমাবদ্ধতা

**যা চালিয়ে যাচাই করা হয়েছে:**
- `npx tsc --noEmit` (০ এরর), `npx eslint .` (২২ warning), `npx next build` (সফল), `npx jest --ci` (৩২১ পাস), `npx jest --coverage` (৯৪.৫৬/৬৮.৫৩)
- অস্থায়ী Jest পরীক্ষা-স্ক্রিপ্ট লিখে ১১টি যাচাই (লেআউট কোলিশন, হিন্ট কভারেজ, skillId, কোড-ইউনিট তুলনা, নিউক্তা ফোল্ডিং, session desync, mastery থ্রেশহোল্ড, drill spacing, লেসন টাইপো, ফোনেটিক রূপান্তর, getStepsForChar) — **গবেষণার শেষে মুছে ফেলা হয়েছে** (`src/__tests__/zz-audit-temp.test.ts` বাদ)
- SQL হিসাব হাতে-কলমে যাচাই (Postgres চালানো হয়নি)

**যা যাচাই করা যায়নি:**
- 🔴 **`পরিকল্পনা.md`** — মাস্টার স্পেসিফিকেশন। `.gitignore:52–53` এ লুকানো, ফাইলসিস্টেমে নেই। কোডে **১৭টি রেফারেন্স** এটিকে কর্তৃপক্ষ বলে (যেমন `bengali-grapheme.ts:964`, `learning/mastery.ts:9,15`, `learning/recommender.ts:5`, `guest-storage.ts:5`, `curriculum/engine.ts:181`, `LessonPlayer.tsx:1068`)। **এটি ফাইলটি দিলে কোন স্পেক-মেনশন সম্পূর্ণ/রিগ্রেসড তা যাচাই করা সম্ভব হবে** — রিপোর্টের সবচেয়ে বড় অনিশ্চয়তা এখানে।
- 🔴 **ব্রাউজার ফন্ট মেট্রিক্স** — `getBengaliGraphemeClip`-এর hardcoded polygon বিভিন্ন OS/ফন্টে কতটা সঠিক, তা রেন্ডার করে দেখা দরকার (visual regression test নেই)
- 🟡 **বিজ্ঞাপন-মুক্ত সততা যাচাই** — আচরণ কোড ও মাপ দিয়ে প্রমাণিত; "এটা ক্ষতিকর" বলে দাবি করা যায়নি
- 🟡 **বাস্তব ব্যবহারকারীর ক্ষতির হার** — বাগ কত বেশি ব্যবহারকারীকে প্রভাবিত করে তা মাপা যায়নি

---

*৩ অক্টোবর ২০২৬ · রিভিজন ২ · সব দাবি চালিয়ে যাচাই করা*