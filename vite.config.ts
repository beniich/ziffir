import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
      },
      manifest: {
        name: 'Zaphir Academy',
        short_name: 'Zaphir',
        description: 'Elite Operations Command & AI Analytics',
        theme_color: '#0c1b33',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    host: true,
  },

  // Force Vite/Rollup 4 to pre-bundle transitive deps used by recharts
  optimizeDeps: {
    include: ['react-is'],
  },

  build: {
    // Warn at 800 KB instead of 500 KB (we'll hit it during code-split migration)
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ── Vendor: React core ──────────────────────────────────────────
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }

          // ── Framer Motion (heavy animation library) ─────────────────────
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer';
          }

          // ── i18n stack ──────────────────────────────────────────────────
          if (id.includes('node_modules/i18next') ||
              id.includes('node_modules/react-i18next') ||
              id.includes('node_modules/i18next-browser-languagedetector')) {
            return 'vendor-i18n';
          }

          // ── Heavy vendor libs: html2canvas, dompurify ───────────────────
          if (id.includes('node_modules/html2canvas')) return 'vendor-canvas';
          if (id.includes('node_modules/dompurify'))  return 'vendor-purify';

          // ── Socket.IO ────────────────────────────────────────────────────
          if (id.includes('node_modules/socket.io')) return 'vendor-socket';

          // ── Date libraries ───────────────────────────────────────────────
          if (id.includes('node_modules/date-fns')) return 'vendor-dates';

          // ── Public marketing pages (lazy-loaded) ─────────────────────────
          if (id.includes('/src/pages/public/') ||
              id.includes('/src/pages/docs/') ||
              id.includes('/src/pages/partners/')) {
            return 'pages-public';
          }

          // ── Legal pages ──────────────────────────────────────────────────
          if (id.includes('/src/pages/legal/')) {
            return 'pages-legal';
          }

          // ── i18n locale JSON files ────────────────────────────────────────
          if (id.includes('/src/i18n/locales/')) {
            return 'i18n-locales';
          }
        },
      },
    },
  },
});
