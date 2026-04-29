import { defineConfig, devices } from "@playwright/test"

const isCI = Boolean(process.env.CI)
const e2eAppPort = 3100

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  fullyParallel: true,
  reporter: isCI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${e2eAppPort}`,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "node ./tests/e2e/mock-api-server.mjs",
      port: 4010,
      reuseExistingServer: false,
    },
    {
      command: `pnpm dev --port ${e2eAppPort}`,
      port: e2eAppPort,
      reuseExistingServer: false,
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
