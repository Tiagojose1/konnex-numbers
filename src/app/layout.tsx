// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

// 🆕 Metadados do App (PWA)
export const metadata: Metadata = {
  title: "Konnex Numbers | Números Virtuais",
  description: "Números virtuais para verificação de SMS.",
  manifest: "/manifest.webmanifest", // Garante que o navegador encontra o manifesto
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Konnex Numbers",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    // 🆕 Atualizado para o teu ficheiro com fundo azul escuro
    icon: "/incone.jpeg",
    apple: "/incone.jpeg", // Ícone que aparece no ecrã inicial do iPhone
  },
};

// 🆕 Cores para o PWA (Barra de estado e tema)
export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Impede o zoom acidental em apps móveis
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}