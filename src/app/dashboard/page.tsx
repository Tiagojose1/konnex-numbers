// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatarMoeda } from '@/lib/currencies';

const servicosPopulares = [
  { nome: 'WhatsApp', preco: 3.85, icone: '💬' },
  { nome: 'Telegram', preco: 1.93, icone: '✈️' },
  { nome: 'Instagram', preco: 0.77, icone: '📷' },
  { nome: 'Facebook', preco: 0.39, icone: '📘' },
  { nome: 'TikTok', preco: 0.50, icone: '🎵' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [saldo, setSaldo] = useState(0);
  const [currency, setCurrency] = useState('MZN');

  useEffect(() => {
    const carregarDados = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
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
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-purple-600 font-medium animate-pulse">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* ===== CABEÇALHO SUPERIOR (ESTILO YELLOWBET) ===== */}
      <header className="bg-slate-900 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-md">
        <img src="/logo.jpeg" alt="Konnex" className="h-8 rounded object-contain bg-white p-0.5" />
        
        <div className="flex items-center gap-3">
          <button className="text-white relative">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">1</span>
          </button>
          
          <Link href="/saldo" className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-1.5 px-4 rounded-md text-sm transition-colors shadow-sm">
            Depositar
          </Link>
          
          <Link href="/perfil" className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-bold border border-slate-600">
            {nome.charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        
        {/* ===== SAUDAÇÃO E SALDO ===== */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">Olá, {nome.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm">Bem-vindo de volta.</p>
        </div>

        <div className="bg-gradient-to-r from-purple-700 to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-purple-100 text-xs font-medium mb-1">Saldo Disponível</p>
            <h2 className="text-4xl font-bold">{formatarMoeda(saldo, currency)}</h2>
          </div>
          {/* Elemento decorativo de fundo */}
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-20">💳</div>
        </div>

        {/* ===== ACESSO RÁPIDO (SCROLL HORIZONTAL) ===== */}
        <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Acesso Rápido</h3>
        <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide -mx-4 px-4">
          <Link href="/servicos" className="bg-white min-w-[120px] p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center hover:border-purple-400 transition-all">
            <span className="text-3xl mb-2">🛒</span>
            <span className="font-semibold text-slate-700 text-xs text-center">Comprar Número</span>
          </Link>
          <Link href="/pedidos" className="bg-white min-w-[120px] p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center hover:border-purple-400 transition-all">
            <span className="text-3xl mb-2">📋</span>
            <span className="font-semibold text-slate-700 text-xs text-center">Meus Pedidos</span>
          </Link>
          <Link href="/historico" className="bg-white min-w-[120px] p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center hover:border-purple-400 transition-all">
            <span className="text-3xl mb-2">🧾</span>
            <span className="font-semibold text-slate-700 text-xs text-center">Histórico</span>
          </Link>
          <Link href="/informacoes" className="bg-white min-w-[120px] p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center hover:border-purple-400 transition-all">
            <span className="text-3xl mb-2">🎧</span>
            <span className="font-semibold text-slate-700 text-xs text-center">Suporte</span>
          </Link>
        </div>

        {/* ===== SERVIÇOS POPULARES (SCROLL HORIZONTAL) ===== */}
        <h3 className="text-sm font-bold text-slate-800 mb-3 mt-4 uppercase tracking-wider">Serviços Populares</h3>
        <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide -mx-4 px-4">
          {servicosPopulares.map((servico) => (
            <Link href="/servicos" key={servico.nome} className="bg-white min-w-[100px] p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
              <span className="text-3xl mb-2">{servico.icone}</span>
              <span className="font-semibold text-slate-800 text-xs">{servico.nome}</span>
              <span className="text-[10px] font-bold text-purple-600 mt-1">{formatarMoeda(servico.preco, currency)}</span>
            </Link>
          ))}
        </div>

      </div>

      {/* ===== NAVEGAÇÃO INFERIOR ===== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 px-2 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-purple-600 p-2">
          <span className="text-xl">🏠</span><span className="text-[10px] font-bold mt-1">Início</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-slate-400 hover:text-purple-600 transition-colors p-2">
          <span className="text-xl">🌐</span><span className="text-[10px] font-medium mt-1">Serviços</span>
        </Link>
        <Link href="/saldo" className="flex flex-col items-center text-slate-400 hover:text-purple-600 transition-colors p-2">
          <span className="text-xl">💰</span><span className="text-[10px] font-medium mt-1">Saldo</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center text-slate-400 hover:text-purple-600 transition-colors p-2">
          <span className="text-xl">👤</span><span className="text-[10px] font-medium mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
}