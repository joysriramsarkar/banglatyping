# ইনস্টলেশন

GitHub integration থেকে সরাসরি আপনার repo-তে write permission পাওয়া যায়নি (403), তাই এই bundle-এ সম্পূর্ণ Playwright E2E suite দেওয়া হয়েছে।

Repo root-এ এই bundle extract করুন। তারপর:

1. `playwright.config.ts` repo root-এ রাখুন।
2. `e2e/` directory repo root-এ রাখুন।
3. `package.json.e2e.patch` apply করুন:
   `git apply package.json.e2e.patch`
4. Browser install:
   `npx playwright install chromium`
5. Test:
   `npm run test:e2e`

Live deployment:
`PLAYWRIGHT_BASE_URL=https://typing.onuron.org npm run test:e2e`

বর্তমান code-এর একটি পরিচিত bug-কে `test.fail()` হিসেবে ধরা হয়েছে—এটি report-এ expected failure হিসেবে দেখা যাবে।
