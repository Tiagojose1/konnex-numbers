// src/app/comprar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ComprarNumeroPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [servico, setServico] = useState('WhatsApp');
  const [pais, setPais] = useState('Moçambique'); // Usar o nome do país para a API

  // Verificar sessão ao entrar
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkSession();
  }, [router]);

  const handleComprar = async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 1. Verificar saldo antes de comprar
      const { data: profile } = await supabase
        .from('profiles')
        .select('saldo')
        .eq('id', session.user.id)
        .single();

      const saldoEmUSD = parseFloat(profile?.saldo) || 0;
      
      // Preço fictício para este exemplo (podes ajustar conforme a tua tabela de preços)
      const precoEmUSD = servico === 'WhatsApp' ? 3.20 : 2.50;

      if (saldoEmUSD < precoEmUSD) {
        toast.error('Saldo insuficiente. Por favor, deposite primeiro.');
        router.push('/saldo');
        return;
      }

      // 2. Chamar a TUA API de compra real
      const resposta = await fetch('/api/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          servico: servico,
          pais: pais,
          preco: precoEmUSD,
          isCustom: false // Número normal
        }),
      });

      const dados = await resposta.json();

      if (dados.error) {
        throw new Error(dados.error);
      }

      // 3. Sucesso! Redirecionar para a página de detalhes do pedido
      toast.success('Número comprado com sucesso!');
      router.push(`/pedidos/${dados.pedido.id}`);

    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Ocorreu um erro desconhecido.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 flex flex-col items-center font-sans text-white">
      
      <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-lg p-6 mt-10 border border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center">Comprar Número</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Serviço</label>
            <select 
              value={servico} 
              onChange={(e) => setServico(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500"
            >
              <option value="WhatsApp">WhatsApp ($ 3.20)</option>
              <option value="Telegram">Telegram ($ 2.50)</option>
              <option value="Instagram">Instagram ($ 2.50)</option>
              <option value="Facebook">Facebook ($ 2.50)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">País</label>
            <select 
              value={pais} 
              onChange={(e) => setPais(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500"
            >
              <option value="Moçambique">Moçambique 🇲🇿</option>
              <option value="Brasil">Brasil 🇧🇷</option>
              <option value="Portugal">Portugal 🇵🇹</option>
              <option value="África do Sul">África do Sul 🇿🇦</option>
              <option value="Estados Unidos">Estados Unidos 🇺🇸</option>
            </select>
          </div>

          <button
            onClick={handleComprar}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'A comprar...' : 'Comprar Número'}
          </button>

          <Link href="/servicos" className="block text-center text-sm text-slate-400 hover:text-white mt-4">
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </div>
  );
}