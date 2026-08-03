import { defineConfig, devices } from "@playwright/test";

/**
 * T-025 — Configuração do Playwright (testes E2E).
 *
 * Roda contra o app em http://localhost:3004. Usa o dev server já rodando
 * quando disponível (reuseExistingServer) para acelerar a iteração.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["json", { outputFile: "../../.spec/verification/e2e.json" }]],
  use: {
    baseURL: "http://localhost:3004",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3004",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
