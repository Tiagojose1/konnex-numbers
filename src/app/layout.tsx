// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Konnex Numbers | Números Virtuais para SMS",
  description: "Receba SMS de ativação para WhatsApp, Telegram e centenas de outros serviços. Rápido, seguro e sem chip físico.",
  icons: {
    icon: "/icon-k.jpg",
    apple: "/icon-k.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={inter.className}>{children}</body>
    </html>
  );
}