import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "list",
    use: {
        baseURL: "http://localhost:3001",
        trace: "on-first-retry",
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "mobile", use: { ...devices["Pixel 5"] } },
        {
            name: "iphone",
            use: { ...devices["iPhone 13"], browserName: "chromium" },
        },
    ],
    webServer: [
        {
            command: "npm run build && NODE_ENV=production CLIENT_DIR=build/client tsx server/index.ts",
            port: 3001,
            reuseExistingServer: !process.env.CI,
            env: {
                TMDB_BEARER_TOKEN: process.env.TMDB_BEARER_TOKEN ?? "test-token",
                TMDB_API_KEY: process.env.TMDB_API_KEY ?? "test-key",
                PORT: "3001",
            },
        },
    ],
});
