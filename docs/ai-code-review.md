# Alibaba Open Code Review (AI কোড রিভিউ সিস্টেম)

আলিবাবা গ্রুপের ব্যাটল-টেস্টেড (Battle-tested) এআই কোড রিভিউ সিস্টেম `@alibaba-group/open-code-review` এই প্রজেক্টে সাফল্যের সাথে সংযুক্ত ও কনফিগার করা হয়েছে।

---

## ১. পরিচিতি ও মূল সুবিধাসমূহ (Overview & Core Features)

- **আলিবাবায় প্রমাণিত বাস্তব অভিজ্ঞতা**: ২০,০০০+ ইন্টারনাল সক্রিয় ডেভেলপার এবং ৩০ লাখের বেশি রিয়েল-ওয়ার্ল্ড কোড রিভিউ টাস্কে পরীক্ষিত।
- **হাইব্রিড আর্কিটেকচার (Deterministic + Agent)**: 
  - ইঞ্জিনিয়ারিং মডিউল ফাইল ফিল্টারিং, লাইন নম্বর পজিশনিং ও অ্যাসিনক্রোনাস সিডিউলিং নিশ্চিত করে।
  - এআই এজেন্ট সেম্যান্টিক রিস্ক ডিটেকশন, কনটেক্সট ক্রস-রেফারেন্সিং ও কোড কোয়ালিটি বিশ্লেষণ করে।
- **বহু-মডেল প্রোটোকল সাপোর্ট (Multi-Model Support)**:
  - Anthropic Messages API (`claude-opus-4-6`, ইত্যাদি)
  - OpenAI Chat / Responses API (`gpt-4o`, `gpt-5.5`, ইত্যাদি)
  - DashScope / Qwen (`qwen3.7-max`, `qwen3.8-max`)
  - DeepSeek (`deepseek-v4-pro`, ইত্যাদি)
  - যেকোনো নিজস্ব/প্রাইভেট কাস্টম মডেল এন্ডপয়েন্ট।
- **প্রিসাইজ লাইন কমেন্টিং (Precise Comment Positioning & Reflection)**: হ্যালুসিনেশন ফিল্টারিং এবং ঠিক নির্দিষ্ট লাইনে অ্যাকশনেবল রিভিউ কমেন্ট প্রদান।
- **মেমরি কমপ্রেশন (Smart Memory Compression)**: ৩-স্তরের পার্টিশন কনটেক্সট ম্যানেজমেন্ট দ্বারা বড় আকারের পুল রিকোয়েস্ট (PR) বা ডিফেও টোকেন লিমিট ছাড়া রিভিউ সম্পন্ন করা।

---

## ২. প্রজেক্ট স্ক্রিপ্টসমূহ (Available NPM Scripts)

প্রজেক্টের `package.json`-এ নিচের স্ক্রিপ্টগুলো প্রস্তুত রাখা হয়েছে:

| কমান্ড | বিবরণ |
| :--- | :--- |
| `npm run review:preview` | এলএলএম কল ছাড়াই কোন কোন ফাইল রিভিউ হবে তার একটি প্রিভিউ দেখায় |
| `npm run review:config` | ইন্টারঅ্যাক্টিভভাবে এআই প্রোভাইডার ও এপিআই কি কনফিগার করার উইজার্ড |
| `npm run review:test` | কনফিগার করা এলএলএম কানেকশন ও মডেল রেসপন্স টেস্ট করে |
| `npm run review` | বর্তমান কোডের আনকমিটেড ডিফে স্বয়ংক্রিয় এআই কোড রিভিউ শুরু করে |
| `npm run review:viewer` | ব্রাউজারে রিভিউ সেশন দেখার জন্য ওয়েব ইউআই (WebUI) ভিউয়ার চালু করে |

---

## ৩. কনফিগারেশন নির্দেশিকা (Quick Setup Guide)

### ৩.১ ইন্টারঅ্যাক্টিভ সেটআপ (প্রস্তাবিত)
টার্মিনালে কমান্ডটি রান করুন:
```bash
npm run review:config
```
এরপর প্রম্পট অনুযায়ী আপনার পছন্দের প্রোভাইডার (Anthropic, OpenAI, DashScope ইত্যাদি) এবং এপিআই কী (API Key) প্রবেশ করান।

### ৩.২ ম্যানুয়াল CLI সেটআপ
টার্মিনাল থেকে সরাসরি সেট করতে পারেন:

#### Anthropic (Claude) ব্যবহার করতে:
```bash
npx ocr config set provider anthropic
npx ocr config set model claude-opus-4-6
npx ocr config set providers.anthropic.api_key "আপনার_ANTHROPIC_API_KEY"
```

#### OpenAI (GPT) ব্যবহার করতে:
```bash
npx ocr config set provider openai
npx ocr config set model gpt-4o
npx ocr config set providers.openai.api_key "আপনার_OPENAI_API_KEY"
```

#### DeepSeek ব্যবহার করতে:
```bash
npx ocr config set provider deepseek
npx ocr config set model deepseek-chat
npx ocr config set providers.deepseek.api_key "আপনার_DEEPSEEK_API_KEY"
```

### ৩.৩ কনফিগারেশন পরীক্ষা
সেটআপ সঠিক হয়েছে কি না তা যাচাই করতে:
```bash
npm run review:test
```

---

## ৪. ব্যবহারের নিয়ম (Usage Examples)

### ৪.১ বর্তমান আনকমিটেড কোড রিভিউ করা:
```bash
npm run review
```

### ৪.২ নির্দিষ্ট ব্রাঞ্চের পার্থক্য রিভিউ করা:
```bash
npx ocr review --from main --to feature-branch
```

### ৪.৩ নির্দিষ্ট কমিট রিভিউ করা:
```bash
npx ocr review --commit abc123
```

### ৪.৪ স্পেসিফিক রিকোয়ারমেন্ট ব্যাকগ্রাউন্ড সহ রিভিউ:
```bash
npx ocr review --background "বাংলা আর্কেড গেমের স্ক্রিন সাইজ ও ইউনিকোড য় নর্মালাইজেশন ফিচার"
```

---

## ৫. ওপেন বেঞ্চমার্ক (Open Benchmark Reference)

আলিবাবার ওপেন বেঞ্চমার্ক (৫০টি ওপেন-সোর্স রেপো, ২০০টি রিয়েল পিআর এবং ১০টি প্রোগ্রামিং ল্যাঙ্গুয়েজ):

- **Claude-4.6-Opus (Open Code Review)**: ২৫.১০% SEM.F1 স্কোর (১ম স্থান)
- **Qwen3.8-Max (Open Code Review)**: ২৩.০০% SEM.F1 স্কোর (২য় স্থান)
- **GLM-5.2 (Open Code Review)**: ২১.৩০% SEM.F1 স্কোর (৩য় স্থান)
- **টোকেন খরচ**: সাধারণ অন্যান্য কোডিং এজেন্টের তুলনায় মাত্র **১/৯ গুণ (1/9th token cost)** সাশ্রয়ী।
