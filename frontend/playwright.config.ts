import { defineConfig, devices } from "@playwright/test"

const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  fullyParallel: true,
  reporter: isCI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "node ./tests/e2e/mock-api-server.mjs",
      port: 4010,
      reuseExistingServer: !isCI,
    },
    {
      command: "pnpm dev --port 3000",
      port: 3000,
      reuseExistingServer: !isCI,
      env: {
        NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:4010",
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
