// src/app/manifest.ts (ou atualiza o teu public/manifest.json com isto)
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
        src: '/incon.png', 
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/incon.png', 
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/incon.png', 
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable' // Isto ajuda o Android a encaixar a imagem na forma do ícone
      }
    ],
  }
}