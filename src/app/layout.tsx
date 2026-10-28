// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // 🆕 Importação

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Konnex Numbers | Números Virtuais",
  description: "Números virtuais para verificação de SMS.",
  icons: {
    icon: "/incon-k.jpeg",
    apple: "/incon-k.jpeg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        {children}
        {/* 🆕 O componente que mostra as notificações */}
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}