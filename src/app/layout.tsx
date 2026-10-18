// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Konnex Numbers | Números Virtuais",
  description: "Números virtuais para verificação de SMS.",
  icons: {
    icon: "/incon-k.jpg", // Nome atualizado
    apple: "/incon-k.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={inter.className}>{children}</body>
    </html>
  );
}