/* eslint-disable @next/next/no-img-element */
// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatarMoeda } from '@/lib/currencies';

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
        <p className="text-blue-500 font-medium animate-pulse">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24 font-sans text-white">
      
      {/* BANNER DE SUCESSO */}
      <div className="bg-emerald-900/40 border-b border-emerald-800 text-emerald-300 text-center py-1.5 text-xs font-medium">
        ✅ Número verificado com sucesso!
      </div>
      
      {/* ===== CABEÇALHO SUPERIOR ===== */}
      <header className="bg-[#0f172a] sticky top-0 z-50 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* 🆕 Imagem limpa e transparente */}
            <img src="/icone.png" alt="Konnex" className="h-10 w-10 object-contain" />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">Konnex</span>
                <span className="text-white ml-1">Numbers</span>
              </span>
              <span className="text-slate-400 text-[10px]">números virtuais</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-white relative">
              <span className="text-lg">🔔</span>
            </button>
            <button className="text-white">
              <span className="text-lg">🎁</span>
            </button>
            <Link href="/saldo" className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-1.5 px-3 rounded-md text-[10px] transition-colors">
              DEPOSITAR
            </Link>
            <Link href="/perfil" className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-bold border border-slate-600">
              {nome.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
          <Link href="/menu" className="text-white bg-slate-800 p-1.5 rounded-md hover:bg-slate-700 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
             </svg>
          </Link>
          <div className="text-right">
             <span className="text-slate-400 text-[10px] font-medium block uppercase">Saldo Disponível:</span>
             <span className="text-cyan-400 font-bold text-lg">{formatarMoeda(saldo, currency)}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        
        {/* ===== SERVIÇOS DO FUTURO / RECOMPENSAS ===== */}
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4 mb-2 justify-between">
          {[
            { icon: '🌍', label: 'Chamadas e SIM', link: '/em-breve' },
            { icon: '🪙', label: 'Recompensas', link: '/em-breve' },
            { icon: '💎', label: 'Bónus VIP', link: '/saldo' },
            { icon: '🤝', label: 'Convide Amigos', link: '/em-breve' },
            { icon: '🎥', label: 'Tutoriais', link: '/em-breve' },
          ].map((item, i) => (
            <Link href={item.link} key={i} className="flex flex-col items-center min-w-[60px] gap-1.5">
              <div className="w-11 h-11 bg-slate-800 rounded-full shadow-sm border border-slate-700 flex items-center justify-center text-xl hover:bg-slate-700 transition-colors">
                {item.icon}
              </div>
              <span className="text-[9px] text-slate-300 text-center font-medium leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* ===== ACESSO RÁPIDO ===== */}
        <h3 className="text-xs font-extrabold text-slate-400 mb-2 uppercase tracking-wider mt-3">Acesso Rápido</h3>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <Link href="/servicos" className="bg-slate-800 p-2.5 rounded-xl shadow-sm border border-slate-700 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-all">
            <span className="text-xl mb-1">🛒</span>
            <span className="font-bold text-white text-[11px] leading-tight">Comprar Número</span>
          </Link>
          <Link href="/pedidos" className="bg-slate-800 p-2.5 rounded-xl shadow-sm border border-slate-700 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-all">
            <span className="text-xl mb-1">📋</span>
            <span className="font-bold text-white text-[11px] leading-tight">Meus Pedidos</span>
          </Link>
          <Link href="/historico" className="bg-slate-800 p-2.5 rounded-xl shadow-sm border border-slate-700 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-all">
            <span className="text-xl mb-1">🧾</span>
            <span className="font-bold text-white text-[11px] leading-tight">Histórico</span>
          </Link>
          <Link href="/servicos?custom=true" className="bg-slate-800 p-2.5 rounded-xl shadow-md border-2 border-yellow-500 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-yellow-500 text-slate-900 text-[8px] font-bold px-1.5 py-0.5 rounded-bl-md">VIP</div>
            <span className="text-xl mb-1">✏️</span>
            <span className="font-bold text-white text-[11px] leading-tight">Personalizar</span>
          </Link>
        </div>

        {/* ===== SERVIÇOS POPULARES ===== */}
        <h3 className="text-xs font-extrabold text-slate-400 mb-2 uppercase tracking-wider mt-5">Serviços Populares</h3>
        <div className="grid grid-cols-2 gap-2 mb-8">
          {[
            { nome: 'WhatsApp', preco: 3.85, icone: '💬', cor: 'text-green-500' },
            { nome: 'Insta connect', preco: 0.77, icone: '📷', cor: 'text-pink-500' },
            { nome: 'Telegram', preco: 1.93, icone: '✈️', cor: 'text-blue-400' },
            { nome: 'Facebook', preco: 0.39, icone: '📘', cor: 'text-blue-600' },
          ].map((servico) => (
            <Link href="/servicos" key={servico.nome} className="bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-700 flex items-center justify-between hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-2">
                <span className={`text-xl ${servico.cor}`}>{servico.icone}</span>
                <div>
                  <span className="block font-bold text-white text-[11px]">{servico.nome}</span>
                  <span className="block font-bold text-cyan-400 text-[9px]">{formatarMoeda(servico.preco, currency)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* ===== NAVEGAÇÃO INFERIOR ===== */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-800 flex justify-around py-2 px-2 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-cyan-400 p-1.5">
          <span className="text-lg">🏠</span><span className="text-[10px] font-bold mt-0.5">Início</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-1.5">
          <span className="text-lg">🌐</span><span className="text-[10px] font-medium mt-0.5">Serviços</span>
        </Link>
        <Link href="/saldo" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-1.5">
          <span className="text-lg">💰</span><span className="text-[10px] font-medium mt-0.5">Saldo</span>
        </Link>
        <Link href="/apoio" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-1.5">
          <span className="text-lg">🎧</span><span className="text-[10px] font-medium mt-0.5">Apoio</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors p-1.5">
          <span className="text-lg">👤</span><span className="text-[10px] font-medium mt-0.5">Perfil</span>
        </Link>
      </div>
    </div>
  );
}