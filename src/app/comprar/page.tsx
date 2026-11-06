// src/app/comprar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { getPrice } from '@/data/pricesByCountry';
import { getCountry } from '@/data/countries';

export default function ComprarNumeroPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [servico, setServico] = useState('WhatsApp');
  const [paisNome, setPaisNome] = useState('Moçambique'); 
  
  // 🆕 Estados para os preços reais
  const [precoAtual, setPrecoAtual] = useState(3.20);
  
  // Mapeamento de países do formulário para os IDs do sistema
  const mapaPaises: Record<string, string> = {
    'Moçambique': 'mz',
    'Brasil': 'br',
    'Portugal': 'pt',
    'África do Sul': 'za',
    'Estados Unidos': 'us',
    'Holanda': 'nl'
  };

  // 🆕 Atualiza o preço sempre que o serviço ou o país muda
  useEffect(() => {
    const paisId = mapaPaises[paisNome] || 'mz';
    
    // O 'servico' no select tem de corresponder ao ID do ficheiro services.ts
    let servicoId = servico.toLowerCase().replace(' ', '');
    if (servico === 'Instagram') servicoId = 'instagram';
    if (servico === 'WhatsApp') servicoId = 'whatsapp';
    if (servico === 'Telegram') servicoId = 'telegram';
    if (servico === 'Facebook') servicoId = 'facebook';

    const precoInfo = getPrice(servicoId, paisId, 'random');
    if (precoInfo) {
      setPrecoAtual(precoInfo.price || 2.50);
    }
  }, [servico, paisNome]);

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

      // 🆕 1. Verificar se o e-mail está confirmado (segurança extra)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email_confirmed_at) {
        toast.error('Por favor, confirme o seu e-mail antes de comprar.');
        return;
      }

      // 2. Verificar saldo antes de comprar
      const { data: profile } = await supabase
        .from('profiles')
        .select('saldo')
        .eq('id', session.user.id)
        .single();

      const saldoEmUSD = parseFloat(profile?.saldo) || 0;

      if (saldoEmUSD < precoAtual) {
        toast.error(`Saldo insuficiente. Precisa de $${precoAtual.toFixed(2)}.`);
        router.push('/saldo');
        return;
      }

      // 3. Chamar a TUA API de compra real
      const resposta = await fetch('/api/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          servico: servico,
          pais: paisNome,
          preco: precoAtual,
          isCustom: false // Número normal
        }),
      });

      const dados = await resposta.json();

      if (dados.error) {
        throw new Error(dados.error);
      }

      // 4. Sucesso! Redirecionar para a página de detalhes do pedido
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
    <div className="min-h-screen bg-[#0f172a] p-6 flex flex-col items-center font-sans text-white pb-24">
      
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
              <option value="WhatsApp">WhatsApp</option>
              <option value="Telegram">Telegram</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">País</label>
            <select 
              value={paisNome} 
              onChange={(e) => setPaisNome(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-cyan-500"
            >
              <option value="Moçambique">Moçambique 🇲🇿</option>
              <option value="Brasil">Brasil 🇧🇷</option>
              <option value="Portugal">Portugal 🇵🇹</option>
              <option value="África do Sul">África do Sul 🇿🇦</option>
              <option value="Estados Unidos">Estados Unidos 🇺🇸</option>
            </select>
          </div>

          {/* 🆕 Mostra o preço calculado dinamicamente */}
          <div className="bg-slate-900 rounded-lg p-4 flex justify-between items-center border border-slate-700">
            <span className="text-slate-400 text-sm">Custo do número:</span>
            <span className="text-yellow-400 font-bold text-xl">$ {precoAtual.toFixed(2)}</span>
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