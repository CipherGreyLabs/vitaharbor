import { defineConfig } from "playwright/test";

/**
 * Smoke tests over the critical visitor paths. They run against the deployed
 * archive by default; point E2E_BASE_URL at a local server to run them offline.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "https://vitaharbor.vercel.app",
    viewport: { width: 1280, height: 900 },
    trace: "off"
  }
});
