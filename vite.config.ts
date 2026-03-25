import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'LMS Learning Platform',
        short_name: 'LMS',
        description: 'منصة التعلم الإلكتروني المتكاملة',
        theme_color: '#7c3aed',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      // Suppress the eval() warning from lottie-web internals (unfixable from our side)
      onLog(level, log, defaultHandler) {
        if (level === 'warn' && log.code === 'EVAL' && log.id?.includes('lottie')) {
          return;
        }
        defaultHandler(level, log);
      },
      output: {
        manualChunks(id) {
          if (id.includes('lottie')) return 'lottie';
          if (id.includes('recharts')) return 'charts';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('react-dom') || id.includes('react-router-dom')) return 'react-vendor';
        },
      },
    },
  },
})