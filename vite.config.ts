import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const isTest = mode === "test" || process.env.VITEST === "true";

    return {
    plugins: [
        tailwindcss(),
        !isTest && reactRouter(),
        !isTest &&
            VitePWA({
            injectRegister: null,
            registerType: "autoUpdate",
            includeAssets: ["icons/favicon.ico"],
            manifest: {
                id: "/",
                scope: "/",
                name: "MovieZone",
                short_name: "MovieZone",
                description: "Browse movies and TV shows",
                theme_color: "#e50914",
                background_color: "#000000",
                display: "standalone",
                start_url: "/",
                icons: [
                    {
                        src: "/icons/icon-192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/icons/icon-512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "/icons/icon-maskable-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
                runtimeCaching: [
                    {
                        urlPattern: /^\/api\/tmdb\/.*/i,
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "tmdb-api-cache",
                            expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 },
                            networkTimeoutSeconds: 5,
                        },
                    },
                    {
                        urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "tmdb-images",
                            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
                        },
                    },
                ],
            },
        }),
        mode === "analyze" &&
            visualizer({
                open: false,
                filename: "dist/stats.html",
                gzipSize: true,
            }),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "app"),
        },
        tsconfigPaths: true,
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3001",
                changeOrigin: true,
            },
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./tests/setup.ts"],
        include: ["tests/**/*.{test,spec}.{ts,tsx}", "app/**/*.{test,spec}.{ts,tsx}"],
        css: true,
    },
    };
});
