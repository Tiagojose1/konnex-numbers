/* eslint-disable @next/next/no-img-element */
// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Mostra o splash durante 2.5 segundos
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };
    
    // Corre a verificação após o splash
    const sessionTimer = setTimeout(checkSession, 2800);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(sessionTimer);
    };
  }, [router]);

  // ===== SPLASH SCREEN (Estilo YellowBet - Escuro e Elegante) =====
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6">
        
        {/* Logo com animação suave de fade-in */}
        <div className="mb-12 animate-fade-in-up">
          <img 
            src="/incon-k.jpeg" 
            alt="Konnex Numbers" 
            className="w-32 h-32 rounded-3xl shadow-2xl object-cover border border-slate-700"
          />
        </div>

        {/* Texto */}
        <h1 className="text-white text-2xl font-bold tracking-wide mb-8">
          Konnex Numbers
        </h1>

        {/* Anel de Carregamento (Spinner) */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-cyan-400 animate-spin"></div>
        </div>

        <p className="text-slate-500 text-sm mt-6">A iniciar a plataforma...</p>
      </div>
    );
  }

  // ===== LOADING (Breve) =====
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-t-cyan-400 animate-spin"></div>
      </div>
    );
  }

  // ===== LANDING PAGE (Mantida igual) =====
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <img src="/logo.jpeg" alt="Konnex Numbers" className="h-12 object-contain" />
          <div className="flex gap-3">
            <Link href="/login" className="text-gray-600 hover:text-purple-600 font-medium py-2 px-4 transition-colors">
              Entrar
            </Link>
            <Link href="/registo" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md">
              Criar Conta
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Números Virtuais
        </span>
        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mt-6 mb-6 leading-tight">
          Receba SMS de Ativação <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            sem Complicações.
          </span>
        </h2>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Use números virtuais para WhatsApp, Telegram, Google e centenas de outros serviços. 
          Rápido, seguro e sem precisar de chip físico.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/registo" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            CRIAR CONTA GRÁTIS
          </Link>
          <Link href="/login" className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 px-8 rounded-xl text-lg border border-gray-200 transition-all shadow-sm hover:shadow-md">
            JÁ TENHO CONTA
          </Link>
        </div>
      </section>

      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h3>
            <p className="text-gray-500">Três passos simples para obter o seu número.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { passo: "01", titulo: "Adicione Saldo", desc: "Faça uma recarga rápida via M-Pesa, e-Mola ou Cartão.", icone: "💰" },
              { passo: "02", titulo: "Escolha o Serviço", desc: "Selecione o país e o serviço (WhatsApp, Telegram, etc).", icone: "🌍" },
              { passo: "03", titulo: "Receba o SMS", desc: "O código de verificação aparece diretamente no seu painel.", icone: "📩" },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{item.icone}</div>
                <div className="text-sm font-bold text-purple-600 mb-2">PASSO {item.passo}</div>
                <h4 className="font-bold text-gray-900 text-xl mb-3">{item.titulo}</h4>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <img src="/logo.jpeg" alt="Konnex Numbers" className="h-16 mx-auto mb-4 brightness-0 invert object-contain" />
          <p className="mb-6">© 2026 Konnex Numbers. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="#" className="hover:text-purple-400 transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}