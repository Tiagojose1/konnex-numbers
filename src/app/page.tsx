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

  // ===== SPLASH SCREEN =====
  if (phase === 'logo' || phase === 'icon' || phase === 'fading') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-[#8a00e6] via-[#0044ff] to-[#00ffaa] ${phase === 'fading' ? 'fade-out' : ''}`}>
        
        {phase === 'logo' && (
          <div className="flex flex-col items-center">
            <img src="/logo.jpeg" alt="Konnex Numbers" className="w-80 h-auto logo-fade-in drop-shadow-2xl rounded-3xl mix-blend-screen" />
          </div>
        )}

        {(phase === 'icon' || phase === 'fading') && (
          <div className="flex flex-col items-center">
            <img src="/incon-k.jpeg" alt="Konnex Numbers" className="w-40 h-40 rounded-3xl shadow-2xl logo-fade-in object-contain drop-shadow-2xl mix-blend-screen" />
            <h1 className="text-white text-xl font-bold mt-6 logo-fade-in drop-shadow-md">Konnex Numbers</h1>
          </div>
        )}

        <div className="absolute bottom-16 w-4/5 max-w-md">
          <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden mb-3 backdrop-blur-sm">
            <div className="h-full rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #ffffff 0%, #a855f7 50%, #22d3ee 100%)' }}></div>
          </div>
          <p className="text-white text-sm text-center font-medium drop-shadow-md">{statusText}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-purple-600 font-medium animate-pulse">A carregar...</p>
      </div>
    );
  }

  // ===== LANDING PAGE =====
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Menu Superior (Únicos botões de ação) */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <img src="/logo.jpeg" alt="Konnex Numbers" className="h-12 rounded-lg object-contain" />
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

      {/* Hero Section (Texto reduzido e sem botões grandes) */}
      <section className="pt-40 pb-20 px-6 max-w-3xl mx-auto text-center">
        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Números Virtuais
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6 mb-6 leading-tight">
          Receba SMS de Ativação <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            sem Complicações.
          </span>
        </h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Use números virtuais para WhatsApp, Telegram, Google e centenas de outros serviços. 
          Rápido, seguro e sem precisar de chip físico.
        </p>
      </section>

      {/* Como Funciona */}
      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Como Funciona</h3>
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
                <h4 className="font-bold text-gray-900 text-lg mb-3">{item.titulo}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <img src="/logo.jpeg" alt="Konnex Numbers" className="h-16 mx-auto mb-4 brightness-0 invert rounded-lg object-contain" />
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