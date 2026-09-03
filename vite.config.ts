import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Auto-déploiement du logo officiel au démarrage
const rootDir = process.cwd();
const srcLogo = path.resolve(rootDir, 'image.png');
const publicDir = path.resolve(rootDir, 'public');
const assetsDir = path.resolve(rootDir, 'src/assets');

if (fs.existsSync(srcLogo)) {
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  try {
    fs.copyFileSync(srcLogo, path.join(publicDir, 'logo.png'));
    fs.copyFileSync(srcLogo, path.join(publicDir, 'pwa-192x192.png'));
    fs.copyFileSync(srcLogo, path.join(publicDir, 'pwa-512x512.png'));
    fs.copyFileSync(srcLogo, path.join(publicDir, 'apple-touch-icon.png'));
    fs.copyFileSync(srcLogo, path.join(publicDir, 'favicon.ico'));
    fs.copyFileSync(srcLogo, path.join(assetsDir, 'logo.png'));
  } catch {
    // Ignorer si déjà verrouillé
  }
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'RapidoFiche — Bibliothèque Pédagogique',
        short_name: 'RapidoFiche',
        description:
          'Plateforme EdTech de consultation de fiches pédagogiques pour les enseignants du préscolaire et du primaire en Côte d’Ivoire',
        theme_color: '#1E3A8A',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/levels') || url.pathname.startsWith('/api/v1/subjects'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'rapidofiche-pedagogy-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 24h
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/lessons'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'rapidofiche-lessons-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 12 * 60 * 60, // 12h
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
