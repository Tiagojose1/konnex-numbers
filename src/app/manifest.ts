// src/app/manifest.ts
import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Konnex Numbers',
    short_name: 'Konnex',
    description: 'Números virtuais para verificação de SMS.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/incone.jpeg', // 🆕 Nome exato do teu ficheiro
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any'
      },
      {
        src: '/incone.jpeg', // 🆕 Nome exato do teu ficheiro
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any'
      },
      {
        src: '/incone.jpeg', // 🆕 Nome exato do teu ficheiro
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable' // Isto faz preencher o quadrado todo no Android
      }
    ],
  }
}