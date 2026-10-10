import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const useExternalBaseURL = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  timeout: 45_000,
  expect: {
    // Dev-server compiles routes on demand; 5s was tight enough to make the
    // smoke spec flaky on a cold `/game` route. 10s still fails real breakage.
    timeout: 10_000,
  },
  // One baseline set for every runner: the locked webfont + same Chromium
  // version keep OS raster drift inside the pixel tests' tolerance.
  // If a backend upgrade shifts antialiasing, regenerate with --update-snapshots
  // and review the diffs — never bless them blindly.
  snapshotPathTemplate: "./e2e/__snapshots__/{arg}{ext}",
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: useExternalBaseURL
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
