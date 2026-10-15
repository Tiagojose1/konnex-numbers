// src/app/servicos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatarMoeda } from '@/lib/currencies';

const todosServicos = [
  { id: 1, nome: 'WhatsApp', preco: 3.85, icone: '💬', pais: 'Moçambique' },
  { id: 2, nome: 'Telegram', preco: 1.93, icone: '✈️', pais: 'Moçambique' },
  { id: 3, nome: 'Google Chat', preco: 0.77, icone: '🔍', pais: 'Moçambique' },
  { id: 4, nome: 'Amazon', preco: 0.58, icone: '📦', pais: 'Moçambique' },
  { id: 5, nome: 'Glovo', preco: 0.58, icone: '🛵', pais: 'Moçambique' },
  { id: 6, nome: 'BIGO LIVE', preco: 0.39, icone: '📺', pais: 'Moçambique' },
  { id: 7, nome: 'WhatsApp', preco: 4.50, icone: '💬', pais: 'Brasil' },
  { id: 8, nome: 'Telegram', preco: 2.10, icone: '✈️', pais: 'Brasil' },
  { id: 9, nome: 'WhatsApp', preco: 5.00, icone: '💬', pais: 'Portugal' },
];

export default function ServicosPage() {
  const router = useRouter();
  const [paisSelecionado, setPaisSelecionado] = useState('Moçambique');
  const [pesquisa, setPesquisa] = useState('');
  const [aProcessar, setAProcessar] = useState<number | null>(null);
  const [currency, setCurrency] = useState('MZN');

  // Carregar a moeda do utilizador
  useEffect(() => {
    const carregarMoeda = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', session.user.id)
          .single();
        if (profile) setCurrency(profile.currency || 'MZN');
      }
    };
    carregarMoeda();
  }, []);

  const servicosFiltrados = todosServicos.filter(
    (s) => s.pais === paisSelecionado && s.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const handleObterNumero = async (servico: any) => {
    setAProcessar(servico.id);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Precisa de estar logado.");
      setAProcessar(null);
      return;
    }

    const resposta = await fetch('/api/comprar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.user.id,
        servico: servico.nome,
        pais: paisSelecionado,
        preco: servico.preco, // O preço do catálogo está sempre em MZN
      }),
    });

    const dados = await resposta.json();

    if (dados.error) {
      alert(`Erro: ${dados.error}`);
      setAProcessar(null);
    } else {
      alert(dados.mensagem);
      router.push('/pedidos');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Obter Número Virtual</h1>
        <p className="text-gray-500">Escolha o país e o serviço que deseja verificar.</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o País</label>
        <select 
          value={paisSelecionado}
          onChange={(e) => setPaisSelecionado(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-600 outline-none shadow-sm"
        >
          <option value="Moçambique">🇲🇿 Moçambique</option>
          <option value="Brasil">🇧🇷 Brasil</option>
          <option value="Portugal">🇵🇹 Portugal</option>
        </select>
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          placeholder="🔍 Pesquisar serviço..." 
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none shadow-sm"
        />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">Serviços Disponíveis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servicosFiltrados.length > 0 ? (
          servicosFiltrados.map((servico) => (
            <div key={servico.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{servico.icone}</span>
                <div>
                  <h4 className="font-bold text-gray-800">{servico.nome}</h4>
                  <p className="text-sm text-gray-500">{paisSelecionado}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600 mb-2">{formatarMoeda(servico.preco, currency)}</p>
                <button 
                  onClick={() => handleObterNumero(servico)}
                  disabled={aProcessar === servico.id}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {aProcessar === servico.id ? 'A processar...' : 'OBTER'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-2 text-center py-8">Nenhum serviço encontrado para esta pesquisa.</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-4 shadow-lg md:hidden">
        <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors">
          <span className="text-xl">🏠</span><span className="text-xs font-medium mt-1">Início</span>
        </Link>
        <Link href="/servicos" className="flex flex-col items-center text-purple-600">
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