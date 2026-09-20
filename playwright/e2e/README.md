# বাংলা টাইপিং মাস্টার — Playwright E2E

এই suite-এর লক্ষ্য হলো UI শুধু render হয়েছে কিনা নয়, একজন ব্যবহারকারী যে গুরুত্বপূর্ণ flow-গুলো সম্পূর্ণ করে সেগুলো যাচাই করা।

## প্রথমবার

```bash
npx playwright install chromium
```

তারপর:

```bash
npx playwright test
```

UI mode:

```bash
npx playwright test --ui
```

Debug:

```bash
npx playwright test --debug
```

HTML report:

```bash
npx playwright show-report
```

## Live deployment যাচাই

নিজের মেশিনে live site চালাতে:

PowerShell:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://typing.onuron.org"
npx playwright test
```

Linux/macOS:

```bash
PLAYWRIGHT_BASE_URL=https://typing.onuron.org npx playwright test
```

এই mode-এ `webServer` চালু হবে না।

## Opt-in authenticated test

```powershell
$env:E2E_TEST_EMAIL="test@example.com"
$env:E2E_TEST_PASSWORD="your-password"
npx playwright test e2e/40-auth.spec.ts
```

বাস্তব test account ছাড়া credential test চালাবেন না।

## বর্তমান codebase-এর ইচ্ছাকৃত expected failure

`e2e/20-lesson.spec.ts`-এ “future lesson section bypass is blocked” test-টি `test.fail()` দিয়ে চিহ্নিত। বর্তমান `LessonPlayer`-এ ভবিষ্যৎ section pill সরাসরি clickable, তাই test-টি known defect হিসেবে রাখা হয়েছে।

Bug ঠিক হওয়ার পরে ওই test থেকে `test.fail(...)` সরিয়ে দিন। তখন CI-তে এটি স্বাভাবিক passing regression test হবে।

## গুরুত্বপূর্ণ

এই suite physical BanglaWord key presses ব্যবহার করে lesson flow পরীক্ষা করে। সরাসরি Bengali text `fill()`/`keyboard.type()` ব্যবহার করা হয়নি যেখানে physical layout behaviour যাচাই করাই উদ্দেশ্য।
