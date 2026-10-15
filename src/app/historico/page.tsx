// src/app/historico/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatarMoeda } from '@/lib/currencies';

interface Transacao {
  id: string;
  tipo: string;
  valor: number;
  metodo: string;
  status: string;
  data_criacao: string;
}

export default function HistoricoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [currency, setCurrency] = useState('MZN');

  useEffect(() => {
    const carregarHistorico = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Buscar a moeda do utilizador
      const { data: profile } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', session.user.id)
        .single();
      if (profile) setCurrency(profile.currency || 'MZN');

      // Buscar as transações
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data_criacao', { ascending: false });

      if (!error && data) setTransacoes(data);
      setLoading(false);
    };

    carregarHistorico();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-purple-600 font-medium animate-pulse">A carregar o histórico...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Transações</h1>
        <p className="text-gray-500">Acompanhe todas as entradas e saídas do seu saldo.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {transacoes.length > 0 ? (
          transacoes.map((t) => {
            const valorNum = parseFloat(t.valor as any) || 0;
            const isEntrada = valorNum > 0;
            return (
              <div key={t.id} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isEntrada ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {isEntrada ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{t.tipo}</p>
                    <p className="text-xs text-gray-500">
                      {t.metodo} • {new Date(t.data_criacao).toLocaleDateString('pt-MZ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isEntrada ? 'text-green-600' : 'text-red-600'}`}>
                    {isEntrada ? '+' : ''}{formatarMoeda(Math.abs(valorNum), currency)}
                  </p>
                  <p className="text-xs text-gray-400">{t.status}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p className="text-4xl mb-4">📭</p>
            <p>Ainda não tem transações registadas.</p>
            <Link href="/saldo" className="text-purple-600 font-semibold hover:underline mt-2 block">
              Adicionar Saldo agora
            </Link>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-4 shadow-lg md:hidden">
        <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors">
          <span className="text-xl">🏠</span><span className="text-xs font-medium mt-1">Início</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors">
          <span className="text-xl">🌐</span><span className="text-xs font-medium mt-1">Serviços</span>
        </Link>
        <Link href="/saldo" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors">
          <span className="text-xl">💰</span><span className="text-xs font-medium mt-1">Saldo</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center text-purple-600">
          <span className="text-xl">👤</span><span className="text-xs font-medium mt-1">Perfil</span>
        </Link>
      </div>
    </div>
  );
}