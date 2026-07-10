import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({ registerType: 'autoUpdate', manifest: {
    name: 'SA1LID VOICES', short_name: 'SA1LID', description: 'Приватное пространство для общения',
    theme_color: '#080b14', background_color: '#080b14', display: 'standalone',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
  }})],
  server: { proxy: { '/api': 'http://localhost:3000', '/socket.io': { target: 'http://localhost:3000', ws: true } } },
  build: { target: 'es2022', sourcemap: true }
});
