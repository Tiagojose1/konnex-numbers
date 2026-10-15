// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

      // 🆕 ADIÇÃO: Verificar pedidos expirados antes de mostrar o saldo
      try {
        const resposta = await fetch('/api/verificar-expirados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id }),
        });
        if (resposta.ok) {
          const dados = await resposta.json();
          if (dados.reembolsados > 0) {
            // Se houve reembolso, avisa o utilizador
            setTimeout(() => {
              alert(`⏰ ${dados.reembolsados} pedido(s) expiraram. ${dados.totalReembolsado.toFixed(2)} MT foram devolvidos ao seu saldo.`);
            }, 500);
          }
        }
      } catch (err) {
        console.warn('Aviso: Não foi possível verificar pedidos expirados.');
      }

      // Buscar dados do perfil
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-purple-600 font-medium animate-pulse">A carregar o seu painel...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Olá, {nome} 👋</h1>
        <p className="text-gray-500">Bem-vindo de volta ao Konnex Numbers.</p>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg mb-8">
        <p className="text-purple-100 text-sm font-medium mb-1">Saldo Disponível</p>
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-bold">{formatarMoeda(saldo, currency)}</h2>
          <Link href="/saldo" className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm">
            + Adicionar Saldo
          </Link>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">Acesso Rápido</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/servicos" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center hover:border-purple-400 transition-all">
          <span className="text-2xl mb-2">🛒</span>
          <span className="font-semibold text-gray-800">Obter Número</span>
        </Link>
        <Link href="/pedidos" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center hover:border-purple-400 transition-all">
          <span className="text-2xl mb-2">📋</span>
          <span className="font-semibold text-gray-800">Meus Pedidos</span>
        </Link>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">Serviços Populares</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {servicosPopulares.map((servico) => (
          <div key={servico.nome} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{servico.icone}</span>
              <span className="font-semibold text-gray-800">{servico.nome}</span>
            </div>
            <span className="text-sm font-bold text-purple-600">{formatarMoeda(servico.preco, currency)}</span>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-4 shadow-lg md:hidden">
        <Link href="/dashboard" className="flex flex-col items-center text-purple-600">
          <span className="text-xl">🏠</span><span className="text-xs font-medium mt-1">Início</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors">
          <span className="text-xl">🌐</span><span className="text-xs font-medium mt-1">Serviços</span>
        </Link>
        <Link href="/saldo" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors">
          <span className="text-xl">💰</span><span className="text-xs font-medium mt-1">Saldo</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors">
          <span className="text-xl">👤</span><span className="text-xs font-medium mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
}