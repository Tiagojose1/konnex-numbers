// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatarMoeda } from '@/lib/currencies';

const servicosPopulares = [
  { nome: 'WhatsApp', preco: 3.85, icone: '💬' },
  { nome: 'Telegram', preco: 1.93, icone: '✈️' },
  { nome: 'Facebook', preco: 0.39, icone: '📘' },
  { nome: 'Instagram', preco: 0.77, icone: '📷' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [saldo, setSaldo] = useState(0);
  const [currency, setCurrency] = useState('MZN');

  useEffect(() => {
    const carregarDados = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('nome_completo, saldo, currency')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setNome(profile.nome_completo || 'Utilizador');
        setSaldo(parseFloat(profile.saldo) || 0);
        setCurrency(profile.currency || 'MZN');
      }
      setLoading(false);
    };
    carregarDados();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24 font-sans text-white">
      
      {/* ===== CABEÇALHO SUPERIOR (Modo Escuro) ===== */}
      <header className="bg-[#0f172a] sticky top-0 z-50 px-4 py-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/incon-k.jpeg" alt="Konnex" className="h-10 w-10 rounded-full border border-slate-700 object-cover" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm leading-tight tracking-wide">Konnex Numbers</span>
              <span className="text-slate-400 text-[10px]">números virtuais</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 🆕 Notificação a funcionar */}
            <Link href="/em-breve?feature=Notificações" className="text-slate-300 hover:text-white relative">
              <span className="text-xl">🔔</span>
            </Link>
            <Link href="/saldo" className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-1.5 px-4 rounded-md text-xs transition-colors shadow-md">
              DEPOSITAR
            </Link>
            <Link href="/perfil" className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold border border-slate-600">
              {nome.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
          <Link href="/menu" className="text-white bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
             </svg>
          </Link>
          <div className="text-right">
             <span className="text-slate-400 text-[10px] font-medium block uppercase">Saldo Disponível:</span>
             <span className="text-cyan-400 font-bold text-xl">{formatarMoeda(saldo, currency)}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        
        {/* ===== SERVIÇOS DO FUTURO (Com Links Ativos) ===== */}
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4 mb-2">
          {[
            { icon: '🪙', label: 'Recompensas', link: '/em-breve?feature=Recompensas' },
            { icon: '💎', label: 'Bónus VIP', link: '/em-breve?feature=Bónus VIP' },
            { icon: '🤝', label: 'Convide Amigos', link: '/em-breve?feature=Convide Amigos' },
            { icon: '🎥', label: 'Tutoriais', link: '/em-breve?feature=Tutoriais' },
            { icon: '🌍', label: 'Chamadas e SIM', link: '/em-breve?feature=Chamadas e SIM' },
          ].map((item, i) => (
            <Link href={item.link} key={i} className="flex flex-col items-center min-w-[75px] gap-2">
              <div className="w-14 h-14 bg-slate-800 rounded-full shadow-sm border border-slate-700 flex items-center justify-center text-2xl hover:bg-slate-700 transition-colors">
                {item.icon}
              </div>
              <span className="text-[10px] text-slate-300 text-center font-medium leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* ===== ACESSO RÁPIDO ===== */}
        <h3 className="text-sm font-extrabold text-slate-400 mb-3 uppercase tracking-wider mt-4">Acesso Rápido</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Link href="/servicos" className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-all">
            <span className="text-2xl mb-1">🛒</span>
            <span className="font-bold text-white text-xs leading-tight">Comprar Número</span>
          </Link>
          <Link href="/pedidos" className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-all">
            <span className="text-2xl mb-1">📋</span>
            <span className="font-bold text-white text-xs leading-tight">Meus Pedidos</span>
          </Link>
          <Link href="/historico" className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-all">
            <span className="text-2xl mb-1">🧾</span>
            <span className="font-bold text-white text-xs leading-tight">Histórico</span>
          </Link>
          <Link href="/servicos?custom=true" className="bg-slate-800 p-4 rounded-xl shadow-sm border-2 border-yellow-500 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-yellow-500 text-slate-900 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">VIP</div>
            <span className="text-2xl mb-1">✏️</span>
            <span className="font-bold text-white text-xs leading-tight">Personalizar</span>
          </Link>
        </div>

        {/* ===== SERVIÇOS POPULARES ===== */}
        <h3 className="text-sm font-extrabold text-slate-400 mb-3 uppercase tracking-wider mt-6">Serviços Populares</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {servicosPopulares.map((servico) => (
            <Link href="/servicos" key={servico.nome} className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700 flex items-center justify-between hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{servico.icone}</span>
                <div>
                  <span className="block font-bold text-white text-xs">{servico.nome}</span>
                  <span className="block font-bold text-cyan-400 text-[10px]">{formatarMoeda(servico.preco, currency)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* ===== NAVEGAÇÃO INFERIOR (Modo Escuro) ===== */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 flex justify-around py-2 px-2 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-blue-500 p-2">
          <span className="text-xl">🏠</span><span className="text-[10px] font-bold mt-1">Início</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-2">
          <span className="text-xl">🌐</span><span className="text-[10px] font-medium mt-1">Serviços</span>
        </Link>
        <Link href="/saldo" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-2">
          <span className="text-xl">💰</span><span className="text-[10px] font-medium mt-1">Saldo</span>
        </Link>
        <Link href="/apoio" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-2">
          <span className="text-xl">🎧</span><span className="text-[10px] font-medium mt-1">Apoio</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-2">
          <span className="text-xl">👤</span><span className="text-[10px] font-medium mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
}