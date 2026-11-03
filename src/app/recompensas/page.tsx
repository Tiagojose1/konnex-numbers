// src/app/recompensas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatarMoeda } from '@/lib/currencies';

export default function RecompensasPage() {
  const [pontos, setPontos] = useState(0);
  const [currency, setCurrency] = useState('MZN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('pontos, currency')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setPontos(profile.pontos || 0);
        setCurrency(profile.currency || 'MZN');
      }
      setLoading(false);
    };
    carregarDados();
  }, []);

  const trocarPontos = async () => {
    if (pontos < 100) return toast.error('Precisa de pelo menos 100 pontos para trocar.');
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Converte 100 pontos em 1 USD (podes ajustar a regra)
    const valorUSD = 1.00; 
    
    const { error } = await supabase.rpc('trocar_pontos_recompensa', {
      p_user_id: session.user.id,
      p_pontos: 100,
      p_valor_usd: valorUSD
    });

    if (error) {
      toast.error('Erro ao trocar pontos. Tente novamente.');
    } else {
      toast.success('Pontos trocados com sucesso!');
      setPontos(pontos - 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 font-sans text-white pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Recompensas</h1>
        <p className="text-slate-400 text-sm mb-8">Acumule pontos ao comprar números e troque por saldo.</p>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 text-center mb-6">
          <div className="text-5xl mb-4">🪙</div>
          <h2 className="text-lg font-bold text-cyan-400 mb-2">Os seus pontos</h2>
          <div className="text-4xl font-extrabold text-white mb-6">{loading ? '...' : pontos}</div>
          
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-4">
            <span className="block text-xs text-slate-400 mb-1">Regra de Troca</span>
            <p className="text-sm font-bold">100 pontos = $ 1.00 USD</p>
            <p className="text-[10px] text-slate-500 mt-1">(≈ {formatarMoeda(1, currency)})</p>
          </div>

          <button onClick={trocarPontos} disabled={pontos < 100} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
            Trocar 100 Pontos por Saldo
          </button>
        </div>

        <Link href="/dashboard" className="block w-full text-center bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors">
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}