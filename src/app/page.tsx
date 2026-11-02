/* eslint-disable @next/next/no-img-element */
// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'logo' | 'icon' | 'fading' | 'app'>('logo');
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState('A iniciar o Konnex Numbers...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };
    checkSession();

    const LOGO_DURATION = 15000;
    const ICON_DURATION = 15000;
    const TOTAL_DURATION = LOGO_DURATION + ICON_DURATION;

    const transitionTimer = setTimeout(() => setPhase('icon'), LOGO_DURATION);
    const t1 = setTimeout(() => setStatusText('A configurar canais de comunicação...'), 8000);
    const t2 = setTimeout(() => setStatusText('A preparar números virtuais...'), 18000);
    const t3 = setTimeout(() => setStatusText('A ativar o canal seguro...'), 28000);
    const t4 = setTimeout(() => setStatusText('Quase pronto para uso...'), 36000);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 2.5;
      });
    }, 1000);

    const finishTimer = setTimeout(() => {
      setPhase('fading');
      setTimeout(() => setPhase('app'), 600);
    }, TOTAL_DURATION);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      clearInterval(progressTimer); clearTimeout(finishTimer);
    };
  }, [router]);

  // ===== SPLASH SCREEN (Azul Escuro Limpo) =====
  if (phase === 'logo' || phase === 'icon' || phase === 'fading') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0f172a] ${phase === 'fading' ? 'fade-out' : ''}`}>
        
        {phase === 'logo' && (
          <div className="flex flex-col items-center">
            {/* 🆕 Logo PNG transparente, sem sombras ou fundos */}
            <img src="/logo.png" alt="Konnex Numbers" className="w-72 h-auto logo-fade-in object-contain" />
          </div>
        )}

        {(phase === 'icon' || phase === 'fading') && (
          <div className="flex flex-col items-center">
            {/* 🆕 Ícone PNG transparente, sem sombras ou fundos */}
            <img src="/icone.png" alt="Konnex Numbers" className="w-40 h-40 logo-fade-in object-contain" />
            <h1 className="text-white text-xl font-bold mt-6 logo-fade-in">Konnex Numbers</h1>
          </div>
        )}

        <div className="absolute bottom-16 w-4/5 max-w-md">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(34,211,238,0.8)]" 
              style={{ width: `${progress}%`, background: '#22d3ee' }}
            ></div>
          </div>
          <p className="text-slate-400 text-sm text-center font-medium">{statusText}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 animate-spin"></div>
      </div>
    );
  }

  // ===== LANDING PAGE =====
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      
      {/* Menu Superior */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 fixed w-full top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* 🆕 Logo PNG transparente */}
          <img src="/logo.png" alt="Konnex Numbers" className="h-10 object-contain" />
          <div className="flex gap-3">
            <Link href="/login" className="text-slate-300 hover:text-white font-medium py-2 px-4 transition-colors">
              Entrar
            </Link>
            <Link href="/registo" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-blue-600/20">
              Criar Conta
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-3xl mx-auto text-center">
        <span className="bg-blue-900/30 text-blue-400 border border-blue-800/50 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Números Virtuais
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-white mt-6 mb-6 leading-tight">
          Receba SMS de Ativação <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            sem Complicações.
          </span>
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Use números virtuais para WhatsApp, Telegram, Google e centenas de outros serviços. 
          Rápido, seguro e sem precisar de chip físico.
        </p>
      </section>

      {/* Como Funciona */}
      <section className="bg-slate-900 py-24 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-white mb-4">Como Funciona</h3>
            <p className="text-slate-400">Três passos simples para obter o seu número.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { passo: "01", titulo: "Adicione Saldo", desc: "Faça uma recarga rápida via M-Pesa, e-Mola ou Cartão.", icone: "💰" },
              { passo: "02", titulo: "Escolha o Serviço", desc: "Selecione o país e o serviço (WhatsApp, Telegram, etc).", icone: "🌍" },
              { passo: "03", titulo: "Receba o SMS", desc: "O código de verificação aparece diretamente no seu painel.", icone: "📩" },
            ].map((item, index) => (
              <div key={index} className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors shadow-lg">
                <div className="text-4xl mb-4">{item.icone}</div>
                <div className="text-sm font-bold text-blue-400 mb-2">PASSO {item.passo}</div>
                <h4 className="font-bold text-white text-lg mb-3">{item.titulo}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-black text-slate-500 py-12 text-center border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          {/* 🆕 Logo PNG transparente no rodapé */}
          <img src="/logo.png" alt="Konnex Numbers" className="h-12 mx-auto mb-4 opacity-50 object-contain" />
          <p className="mb-6">© 2026 Konnex Numbers. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="#" className="hover:text-blue-400 transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}