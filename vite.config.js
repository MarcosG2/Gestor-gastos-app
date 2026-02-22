import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Hace que la app se actualice sola si cambias el código
      manifest: {
        name: 'Gestor de Gastos Personal',
        short_name: 'Gestor',
        description: 'Aplicación para administrar finanzas personales',
        theme_color: '#4f46e5', 
        background_color: '#cbd5e1', 
        display: 'standalone',
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
          }
        ]
      }
    })
  ]
})