import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/*.png",
        "img/symbol_map.png",
        "data/*.json",
        "data/*.csv",
      ],
      manifest: {
        name: "CSB Motif Explorer",
        short_name: "CSB Explorer",
        description:
          "Explore AI-assisted motif clustering for Scotland's Carved Stone Balls",
        theme_color: "#1976d2",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          // SVG source (some platforms will use this directly)
          {
            src: "icons/csb-icon.svg",
            type: "image/svg+xml",
            sizes: "512x512",
            purpose: "any",
          },
          {
            src: "icons/csb-icon-maskable.svg",
            type: "image/svg+xml",
            sizes: "1024x1024",
            purpose: "maskable",
          },
          // Raster fallbacks
          { src: "icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
          { src: "icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
          { src: "icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
          {
            src: "icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-48x48-maskable.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-72x72-maskable.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-96x96-maskable.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-144x144-maskable.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-192x192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-256x256-maskable.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-384x384-maskable.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,csv,jpg}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.plot\.ly\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "plotly-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          plotly: ["plotly.js-dist-min"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
