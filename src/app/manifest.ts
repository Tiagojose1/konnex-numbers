// src/app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Konnex Numbers',
    short_name: 'Konnex',
    description: 'Números virtuais para verificação de SMS.',
    start_url: '/dashboard',
    display: 'standalone', // Isto faz com que abra em ecrã inteiro (sem barra do navegador)
    background_color: '#0f172a', // Cor de fundo do Splash (igual ao Dashboard)
    theme_color: '#0f172a',      // Cor da barra de estado do telemóvel
    icons: [
      {
        src: '/incon-k.jpeg', // O ícone que já tens no projeto
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/incon-k.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}